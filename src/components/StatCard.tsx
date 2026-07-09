interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, sub, accent = 'bg-[#003366]', icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
      {icon && (
        <div className={`${accent} p-2 rounded-lg text-white shrink-0`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-none mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
