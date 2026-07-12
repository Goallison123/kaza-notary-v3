import { ClientLog, ClientStatus } from '../types';
import { Clock, ChevronRight } from 'lucide-react';

interface QueueCardProps {
  client: ClientLog;
  position: number;
  onClick?: () => void;
}

const statusConfig: Record<ClientStatus, { label: string; pill: string; card: string; border: string; numberBg: string; numberText: string }> = {
  Ready:                  { label: 'Ready',               pill: 'bg-emerald-500 text-white', card: 'bg-emerald-50',  border: 'border-emerald-300', numberBg: 'bg-emerald-500', numberText: 'text-white' },
  'Filing Details':       { label: 'Filing',              pill: 'bg-sky-500 text-white',     card: 'bg-sky-50',      border: 'border-sky-200',     numberBg: 'bg-sky-100',     numberText: 'text-sky-700' },
  Pending:                { label: 'Pending',             pill: 'bg-amber-500 text-white',   card: 'bg-amber-50',    border: 'border-amber-200',   numberBg: 'bg-amber-100',   numberText: 'text-amber-700' },
  Skipped:                { label: 'Skipped',              pill: 'bg-red-500 text-white',     card: 'bg-red-50',      border: 'border-red-200',     numberBg: 'bg-red-100',     numberText: 'text-red-600' },
  Archived:               { label: 'Archived',            pill: 'bg-slate-400 text-white',   card: 'bg-slate-50',    border: 'border-slate-200',   numberBg: 'bg-slate-200',   numberText: 'text-slate-600' },
  'Signed & Recorded':    { label: 'Signed',              pill: 'bg-teal-500 text-white',    card: 'bg-teal-50',     border: 'border-teal-200',    numberBg: 'bg-teal-100',    numberText: 'text-teal-700' },
  Rejected:               { label: 'Rejected',            pill: 'bg-red-500 text-white',     card: 'bg-red-50',      border: 'border-red-200',     numberBg: 'bg-red-100',      numberText: 'text-red-700' },
  'Pending Verification': { label: 'Verifying',           pill: 'bg-blue-500 text-white',    card: 'bg-blue-50',     border: 'border-blue-200',    numberBg: 'bg-blue-100',    numberText: 'text-blue-700' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function QueueCard({ client, position, onClick }: QueueCardProps) {
  const cfg = statusConfig[client.status] ?? statusConfig.Pending;
  const padded = String(client.client_number).padStart(3, '0');
  const isReady = client.status === 'Ready';

  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border p-3.5 cursor-pointer transition-all duration-150 group
        hover:shadow-md hover:-translate-y-0.5
        ${cfg.card} ${cfg.border}
        ${isReady ? 'shadow-md' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Big queue number badge */}
        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${cfg.numberBg} ${isReady ? 'shadow-lg scale-110' : ''} transition-transform`}>
          <span className={`text-lg font-black tabular-nums ${cfg.numberText}`}>
            {padded}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-400 tabular-nums">POS {position}</span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cfg.pill}`}>
              {cfg.label}
            </span>
          </div>
          <p className="font-bold text-slate-800 text-sm leading-snug truncate">
            {client.full_name}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={11} className="text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500 truncate">
              {client.service_type ?? 'General'} · {timeAgo(client.created_at)}
            </p>
          </div>
        </div>

        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
      </div>
    </div>
  );
}
