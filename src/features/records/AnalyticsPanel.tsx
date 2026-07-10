import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { FileBarChart2, RefreshCw, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ClientLog } from '../../types';

const PIE_COLORS = ['#003366', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLast7Days(): { iso: string; label: string }[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      label: DAY_LABELS[d.getDay()],
    });
  }
  return days;
}

function getLast30Days(): { iso: string; label: string }[] {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      label: `${d.getDate()}/${d.getMonth() + 1}`,
    });
  }
  return days;
}

function exportToXLSX(records: ClientLog[]) {
  const rows = records.map(r => ({
    'ID': `#${String(r.client_number).padStart(3, '0')}`,
    'Full Name': r.full_name,
    'Phone Number': r.phone_number,
    'National ID': r.national_id ?? '',
    'Service Type': r.service_type ?? '',
    'Status': r.status,
    'Address': r.residential_address ?? '',
    'Created Date': new Date(r.created_at).toLocaleDateString('en-GB'),
    'Submitted Date': r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-GB') : '',
    'Expires': r.expires_at ? new Date(r.expires_at).toLocaleDateString('en-GB') : '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 8 }, { wch: 28 }, { wch: 16 }, { wch: 18 },
    { wch: 22 }, { wch: 22 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Client Records');

  // Summary sheet
  const byStatus: Record<string, number> = {};
  records.forEach(r => { byStatus[r.status] = (byStatus[r.status] ?? 0) + 1; });
  const summaryRows = [
    { 'Metric': 'Total Records', 'Value': records.length },
    ...Object.entries(byStatus).map(([k, v]) => ({ 'Metric': k, 'Value': v })),
    { 'Metric': 'Report Generated', 'Value': new Date().toLocaleString('en-GB') },
  ];
  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  ws2['!cols'] = [{ wch: 24 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  XLSX.writeFile(wb, `kaza-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}
function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${color}`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPanel() {
  const { office } = useAuth();
  const [records, setRecords] = useState<ClientLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

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

  const days = period === 'weekly' ? getLast7Days() : getLast30Days();

  // Records per day
  const volumeData = days.map(({ iso, label }) => ({
    day: label,
    docs: records.filter(r => r.created_at.slice(0, 10) === iso).length,
  }));

  // Submissions per day (form submitted)
  const submittedData = days.map(({ iso, label }) => ({
    day: label,
    submitted: records.filter(r => r.submitted_at?.slice(0, 10) === iso).length,
  }));

  // Volume by service type (pie)
  const typeCounts: Record<string, number> = {};
  records.forEach(r => {
    const key = r.service_type ?? 'Unknown';
    typeCounts[key] = (typeCounts[key] ?? 0) + 1;
  });
  const pieData = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Summary stats
  const total = records.length;
  const validated = records.filter(r => r.status === 'Ready' || r.status === 'Signed & Recorded').length;
  const pending = records.filter(r => r.status === 'Pending' || r.status === 'Pending Verification').length;
  const submitted = records.filter(r => !!r.submitted_at).length;

  // Status breakdown for bar chart
  const statusOrder = ['Pending', 'Filing Details', 'Pending Verification', 'Ready', 'Signed & Recorded', 'Rejected'];
  const statusData = statusOrder.map(s => ({
    status: s.length > 12 ? s.split(' ').slice(0, 2).join(' ') : s,
    count: records.filter(r => r.status === s).length,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[#003366]" />
          <h3 className="text-base font-bold text-slate-800">Analytics &amp; Reports</h3>
          {loading && <RefreshCw size={12} className="text-slate-400 animate-spin" />}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 transition-colors ${period === 'weekly' ? 'bg-[#003366] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 transition-colors ${period === 'monthly' ? 'bg-[#003366] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Monthly
            </button>
          </div>
          <button
            onClick={() => exportToXLSX(records)}
            disabled={loading || records.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileBarChart2 size={12} /> Export .xlsx
          </button>
          <button
            onClick={fetchRecords}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Records"
          value={total}
          icon={<Users size={18} className="text-[#003366]" />}
          color="bg-blue-50 border-blue-100"
        />
        <StatCard
          label="Form Submitted"
          value={submitted}
          icon={<CheckCircle size={18} className="text-emerald-600" />}
          color="bg-emerald-50 border-emerald-100"
        />
        <StatCard
          label="Validated"
          value={validated}
          icon={<CheckCircle size={18} className="text-teal-600" />}
          color="bg-teal-50 border-teal-100"
        />
        <StatCard
          label="Awaiting Review"
          value={pending}
          icon={<Clock size={18} className="text-amber-600" />}
          color="bg-amber-50 border-amber-100"
        />
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-slate-400 text-sm gap-2">
          <span className="w-5 h-5 border-2 border-[#003366] border-t-transparent rounded-full animate-spin" />
          Loading analytics...
        </div>
      ) : records.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
          No records yet — analytics will appear here once you add clients.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Volume by service type */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-3">Volume by Service Type</p>
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No service types assigned</p>
            ) : (
              <>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="45%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number, name: string) => [`${v} records`, name]}
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[10px] text-slate-600 truncate">{d.name}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Records created per day */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-3">
              Records Created ({period === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'})
            </p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: period === 'monthly' ? 7 : 9, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    interval={period === 'monthly' ? 4 : 0}
                  />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: number) => [`${v} records`, 'Created']}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="docs"
                    stroke="#003366"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#003366' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status breakdown */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-3">Records by Status</p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="status" tick={{ fontSize: 7, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: number) => [`${v} records`, 'Count']}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Submissions trend — secondary row */}
      {!loading && records.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-600 mb-3">
            Form Submissions per Day ({period === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'})
          </p>
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submittedData} margin={{ top: 2, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: period === 'monthly' ? 7 : 9, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  interval={period === 'monthly' ? 4 : 0}
                />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(v: number) => [`${v} submissions`, 'Submitted']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="submitted" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && (
        <p className="text-[10px] text-slate-400 mt-3 text-right">
          Last updated: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}
    </div>
  );
}
