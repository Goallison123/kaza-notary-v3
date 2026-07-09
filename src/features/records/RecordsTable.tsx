import { useState, useEffect } from 'react';
import { Pencil, MoreHorizontal, ChevronUp, ChevronDown, Search, Filter, Upload, FileSearch, FileBarChart2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ClientLog } from '../../types';
import StatusBadge from './StatusBadge';
import Button from '../../components/Button';

interface RecordsTableProps {
  selectedId: string | null;
  onSelect: (client: ClientLog) => void;
}

type SortKey = 'client_number' | 'full_name' | 'service_type' | 'created_at' | 'status';

function formatDate(str: string) {
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
}

export default function RecordsTable({ selectedId, onSelect }: RecordsTableProps) {
  const { office } = useAuth();
  const [records, setRecords] = useState<ClientLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

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

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(r => r.id)));
    }
  }

  const filtered = records
    .filter(r =>
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.service_type ?? '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.client_number).includes(search)
    )
    .sort((a, b) => {
      const va = (a as Record<string, unknown>)[sortKey] as string;
      const vb = (b as Record<string, unknown>)[sortKey] as string;
      return sortAsc
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });

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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <h2 className="text-base font-bold text-slate-800 mr-auto">Client Records</h2>
        <Button variant="primary" size="sm" icon={<Upload size={13} />}>
          Upload New Record
        </Button>
        <Button variant="secondary" size="sm" icon={<FileSearch size={13} />}>
          Search Verified Records
        </Button>
        <Button variant="secondary" size="sm" icon={<FileBarChart2 size={13} />}>
          Generate Daily Report
        </Button>
      </div>

      {/* Search + Filter Row */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <span>All actions</span>
            <ChevronDown size={12} />
          </button>
          <button className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <Filter size={13} />
          </button>
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
                  className={`
                    cursor-pointer transition-colors
                    ${isActive ? 'bg-blue-50 border-l-2 border-l-[#003366]' : 'hover:bg-slate-50'}
                  `}
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); }}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); }}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
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
            Showing {filtered.length} of {records.length} records
          </p>
          {selected.size > 0 && (
            <p className="text-xs font-semibold text-[#003366]">{selected.size} selected</p>
          )}
        </div>
      )}
    </div>
  );
}
