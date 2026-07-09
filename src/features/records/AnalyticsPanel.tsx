import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';

const pieData = [
  { name: 'Land Transfer', value: 38 },
  { name: 'Power of Attorney', value: 28 },
  { name: 'Will', value: 18 },
  { name: 'Certification', value: 16 },
];

const pieColors = ['#003366', '#0ea5e9', '#10b981', '#f59e0b'];

const lineData = [
  { day: 'Mon', docs: 12 },
  { day: 'Tue', docs: 28 },
  { day: 'Wed', docs: 45 },
  { day: 'Thu', docs: 38 },
  { day: 'Fri', docs: 72 },
  { day: 'Sat', docs: 55 },
  { day: 'Sun', docs: 40 },
];

const barData = [
  { day: 'Mon', wait: 8 },
  { day: 'Tue', wait: 12 },
  { day: 'Wed', wait: 6 },
  { day: 'Thu', wait: 15 },
  { day: 'Fri', wait: 9 },
  { day: 'Sat', wait: 7 },
  { day: 'Sun', wait: 11 },
];

export default function AnalyticsPanel() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-800">Analytics &amp; Reports Panel</h3>
        <div className="flex gap-2">
          <button className="text-xs px-3 py-1.5 rounded-lg bg-[#003366] text-white font-semibold">Weekly</button>
          <button className="text-xs px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">Monthly</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-3">Document Volume by Type</p>
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
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v}%`, '']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: pieColors[i] }} />
                <span className="text-[10px] text-slate-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-3">Processing Times</p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
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

        {/* Bar Chart */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-3">Queue Performance</p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="wait" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
