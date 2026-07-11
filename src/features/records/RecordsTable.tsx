import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  ChevronUp, ChevronDown, Search, Filter, Upload,
  FileSearch, FileBarChart2, Eye, X, Download,
  ChevronRight, CheckCircle, Lock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { usePlan } from '../../hooks/usePlan';
import { ClientLog, ClientStatus } from '../../types';
import StatusBadge from './StatusBadge';
import Button from '../../components/Button';
import RecordDetailModal from './RecordDetailModal';

interface RecordsTableProps {
  selectedId: string | null;
  onSelect: (client: ClientLog) => void;
  onUploadRecord: () => void;
}

type SortKey = 'client_number' | 'full_name' | 'service_type' | 'created_at' | 'status';

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

/* ─── Generate Report ─────────────────────────────────────────────────────── */
function downloadXLSX(records: ClientLog[], label: string) {
  const rows = records.map(r => ({
    'ID': `#${String(r.client_number).padStart(3, '0')}`,
    'Full Name': r.full_name,
    'Phone Number': r.phone_number,
    'National ID': r.national_id ?? '',
    'Service Type': r.service_type ?? '',
    'Status': r.status,
    'Address': r.residential_address ?? '',
    'Created Date': formatDate(r.created_at),
    'Submitted Date': r.submitted_at ? formatDate(r.submitted_at) : '',
    'Expires': r.expires_at ? formatDate(r.expires_at) : '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 8 }, { wch: 28 }, { wch: 16 }, { wch: 18 },
    { wch: 22 }, { wch: 22 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Client Records');
  XLSX.writeFile(wb, `kaza-${label}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/* ─── Filter Dropdown ─────────────────────────────────────────────────────── */
const ALL_STATUSES: ClientStatus[] = [
  'Pending', 'Filing Details', 'Pending Verification', 'Ready', 'Signed & Recorded', 'Rejected',
];

function FilterDropdown({
  activeStatus,
  onChange,
  onClose,
}: {
  activeStatus: ClientStatus | '';
  onChange: (s: ClientStatus | '') => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 min-w-[180px] py-1 overflow-hidden">
      <button
        onClick={() => { onChange(''); onClose(); }}
        className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${!activeStatus ? 'bg-[#003366] text-white' : 'text-slate-700 hover:bg-slate-50'}`}
      >
        All Statuses
      </button>
      {ALL_STATUSES.map(s => (
        <button
          key={s}
          onClick={() => { onChange(s); onClose(); }}
          className={`w-full text-left px-3 py-2 text-xs transition-colors ${activeStatus === s ? 'bg-[#003366] text-white' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

/* ─── Actions Dropdown ────────────────────────────────────────────────────── */
function ActionsDropdown({
  selected,
  allRecords,
  onClear,
  onClose,
}: {
  selected: Set<string>;
  allRecords: ClientLog[];
  onClear: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const selectedRecords = allRecords.filter(r => selected.has(r.id));

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 min-w-[200px] py-1 overflow-hidden">
      {selected.size === 0 ? (
        <p className="px-3 py-2 text-xs text-slate-400">Select rows first</p>
      ) : (
        <>
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            {selected.size} record{selected.size !== 1 ? 's' : ''} selected
          </p>
          <button
            onClick={() => { downloadXLSX(selectedRecords, 'selected'); onClear(); onClose(); }}
            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Download size={12} /> Export selection as CSV
          </button>
          <button
            onClick={() => { onClear(); onClose(); }}
            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <X size={12} /> Clear selection
          </button>
        </>
      )}
    </div>
  );
}

/* ─── Verified Records Search Modal ──────────────────────────────────────── */
function VerifiedSearchModal({
  records,
  onView,
  onClose,
}: {
  records: ClientLog[];
  onView: (r: ClientLog) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const verified = records.filter(
    r => r.status === 'Ready' || r.status === 'Signed & Recorded'
  );
  const results = q.trim()
    ? verified.filter(r =>
        r.full_name.toLowerCase().includes(q.toLowerCase()) ||
        (r.service_type ?? '').toLowerCase().includes(q.toLowerCase()) ||
        String(r.client_number).includes(q) ||
        (r.phone_number ?? '').includes(q)
      )
    : verified;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <FileSearch size={16} className="text-[#003366]" />
          <h2 className="text-base font-bold text-slate-800 flex-1">Search Verified Records</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-slate-100 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search by name, service, phone, ID..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">{results.length} verified record{results.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {results.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">No verified records match your search.</div>
          )}
          {results.map(r => (
            <button
              key={r.id}
              onClick={() => { onView(r); onClose(); }}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-[#003366] flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-bold">
                  {r.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{r.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{r.service_type ?? 'No service type'} · {r.phone_number}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={r.status} />
                <ChevronRight size={13} className="text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function RecordsTable({ selectedId, onSelect, onUploadRecord }: RecordsTableProps) {
  const { office } = useAuth();
  const plan = usePlan();
  const [records, setRecords] = useState<ClientLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | ''>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [detailRecord, setDetailRecord] = useState<ClientLog | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showVerifiedSearch, setShowVerifiedSearch] = useState(false);

  useEffect(() => { fetchRecords(); }, [office?.id]);

  async function fetchRecords() {
    if (!office) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('client_logs')
      .select('*')
      .eq('office_id', office.id)
      .order('created_at', { ascending: false });
    if (!error && data) setRecords(data);
    setLoading(false);
  }

  function handleStatusChange(id: string, status: ClientStatus) {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (detailRecord?.id === id) setDetailRecord(prev => prev ? { ...prev, status } : prev);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  function toggleRow(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = records
    .filter(r => {
      const matchSearch =
        r.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (r.service_type ?? '').toLowerCase().includes(search.toLowerCase()) ||
        String(r.client_number).includes(search);
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const va = (a as Record<string, unknown>)[sortKey] as string;
      const vb = (b as Record<string, unknown>)[sortKey] as string;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

  function toggleAll() {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(r => r.id)));
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={11} className="text-slate-300" />;
    return sortAsc
      ? <ChevronUp size={11} className="text-[#003366]" />
      : <ChevronDown size={11} className="text-[#003366]" />;
  }

  function ColHeader({ label, k }: { label: string; k: SortKey }) {
    return (
      <th
        onClick={() => toggleSort(k)}
        className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
      >
        <span className="flex items-center gap-1">{label}<SortIcon k={k} /></span>
      </th>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <h2 className="text-base font-bold text-slate-800 mr-auto">Client Records</h2>
          <Button variant="primary" size="sm" icon={<Upload size={13} />} onClick={onUploadRecord}>
            Upload New Record
          </Button>
          <Button variant="secondary" size="sm" icon={<FileSearch size={13} />} onClick={() => setShowVerifiedSearch(true)}>
            Search Verified
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={plan.hasReports ? <FileBarChart2 size={13} /> : <Lock size={13} />}
            onClick={() => plan.hasReports && downloadXLSX(records, 'daily-report')}
            disabled={!plan.hasReports}
            className={!plan.hasReports ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {plan.hasReports ? 'Generate Report' : 'Report (Pro)'}
          </Button>
        </div>

        {/* Search + Filter Row */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, service, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] placeholder-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          {statusFilter && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#003366]/10 border border-[#003366]/20 rounded-lg text-xs font-semibold text-[#003366]">
              <CheckCircle size={11} />
              {statusFilter}
              <button onClick={() => setStatusFilter('')} className="ml-0.5 hover:text-red-500 transition-colors">
                <X size={11} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <button
                onClick={() => { setShowActions(v => !v); setShowFilter(false); }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <span>Actions{selected.size > 0 ? ` (${selected.size})` : ''}</span>
                <ChevronDown size={12} />
              </button>
              {showActions && (
                <ActionsDropdown
                  selected={selected}
                  allRecords={records}
                  onClear={() => setSelected(new Set())}
                  onClose={() => setShowActions(false)}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setShowFilter(v => !v); setShowActions(false); }}
                className={`p-2 rounded-lg border transition-colors ${statusFilter ? 'border-[#003366]/30 bg-[#003366]/10 text-[#003366]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <Filter size={13} />
              </button>
              {showFilter && (
                <FilterDropdown
                  activeStatus={statusFilter}
                  onChange={setStatusFilter}
                  onClose={() => setShowFilter(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-[#003366] focus:ring-[#003366]"
                  />
                </th>
                <ColHeader label="ID" k="client_number" />
                <ColHeader label="Name" k="full_name" />
                <ColHeader label="Service Type" k="service_type" />
                <ColHeader label="Date" k="created_at" />
                <ColHeader label="Status" k="status" />
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#003366] border-t-transparent rounded-full animate-spin" />
                      Loading records...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">
                    No records found
                  </td>
                </tr>
              )}
              {!loading && filtered.map(record => {
                const isActive = selectedId === record.id;
                const isChecked = selected.has(record.id);
                return (
                  <tr
                    key={record.id}
                    onClick={() => onSelect(record)}
                    className={`cursor-pointer transition-colors ${isActive ? 'bg-blue-50 border-l-2 border-l-[#003366]' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleRow(record.id); }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRow(record.id)}
                        className="rounded border-slate-300 text-[#003366] focus:ring-[#003366]"
                      />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-600 font-semibold">
                      #{String(record.client_number).padStart(3, '0')}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-800 max-w-[140px] truncate">
                      {record.full_name}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate">
                      {record.service_type ?? '—'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(record.created_at)}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={e => { e.stopPropagation(); setDetailRecord(record); }}
                        title="View details & take action"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#003366] border border-[#003366]/20 bg-[#003366]/5 hover:bg-[#003366]/15 transition-colors whitespace-nowrap"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing {filtered.length} of {records.length} record{records.length !== 1 ? 's' : ''}
            </p>
            {selected.size > 0 && (
              <p className="text-xs font-semibold text-[#003366]">{selected.size} selected</p>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailRecord && (
        <RecordDetailModal
          client={detailRecord}
          onClose={() => setDetailRecord(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Verified Search Modal */}
      {showVerifiedSearch && (
        <VerifiedSearchModal
          records={records}
          onView={r => { setDetailRecord(r); }}
          onClose={() => setShowVerifiedSearch(false)}
        />
      )}
    </>
  );
}
