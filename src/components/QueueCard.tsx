import { ClientLog, ClientStatus } from '../types';
import { Clock, ChevronRight } from 'lucide-react';

interface QueueCardProps {
  client: ClientLog;
  position: number;
  onClick?: () => void;
}

const statusConfig: Record<ClientStatus, { label: string; pill: string; card: string; border: string }> = {
  Ready:                  { label: 'Ready',               pill: 'bg-emerald-500 text-white', card: 'bg-emerald-50',  border: 'border-emerald-200' },
  'Filing Details':       { label: 'Filing Details',      pill: 'bg-sky-500 text-white',     card: 'bg-sky-50',      border: 'border-sky-200'     },
  Pending:                { label: 'Pending',             pill: 'bg-amber-500 text-white',   card: 'bg-amber-50',    border: 'border-amber-200'   },
  Archived:               { label: 'Archived',            pill: 'bg-slate-400 text-white',   card: 'bg-slate-50',    border: 'border-slate-200'   },
  'Signed & Recorded':    { label: 'Signed & Recorded',   pill: 'bg-teal-500 text-white',    card: 'bg-teal-50',     border: 'border-teal-200'    },
  Rejected:               { label: 'Rejected',            pill: 'bg-red-500 text-white',     card: 'bg-red-50',      border: 'border-red-200'     },
  'Pending Verification': { label: 'Pending Verification',pill: 'bg-blue-500 text-white',    card: 'bg-blue-50',     border: 'border-blue-200'    },
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

  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border p-3.5 cursor-pointer transition-all duration-150 group
        hover:shadow-md hover:-translate-y-0.5
        ${cfg.card} ${cfg.border}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-xs font-bold text-slate-500 tabular-nums">{position}</span>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cfg.pill}`}>
          {cfg.label}
        </span>
      </div>
      <p className="font-bold text-slate-800 text-sm leading-snug">
        #{String(client.client_number).padStart(3, '0')} | {client.full_name}
      </p>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-slate-400 shrink-0" />
          <p className="text-xs text-slate-500">
            {client.service_type ?? 'General'} | {timeAgo(client.created_at)}
          </p>
        </div>
        <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
      </div>
    </div>
  );
}
