import { ClientStatus } from '../../types';

interface StatusBadgeProps {
  status: string;
}

const configs: Record<string, { bg: string; text: string; dot: string }> = {
  Ready:                  { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Filing Details':       { bg: 'bg-sky-100',     text: 'text-sky-700',     dot: 'bg-sky-500'     },
  Pending:                { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  Archived:               { bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400'   },
  'Signed & Recorded':    { bg: 'bg-teal-100',    text: 'text-teal-700',    dot: 'bg-teal-500'    },
  Rejected:               { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-500'     },
  'Pending Verification': { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = configs[status] ?? configs.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}
