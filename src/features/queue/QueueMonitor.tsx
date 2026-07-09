import { useState } from 'react';
import { Activity, RefreshCw, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeQueue } from '../../hooks/useRealtimeQueue';
import { supabase } from '../../lib/supabase';
import { ClientLog, ClientStatus } from '../../types';
import QueueCard from '../../components/QueueCard';

const STATUS_FLOW: ClientStatus[] = ['Pending', 'Filing Details', 'Ready', 'Archived'];

function StatusMenu({ client, onUpdated }: { client: ClientLog; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function changeStatus(newStatus: ClientStatus) {
    setOpen(false);
    setUpdating(true);
    await supabase.from('client_logs').update({ status: newStatus }).eq('id', client.id);
    setUpdating(false);
    onUpdated();
  }

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        disabled={updating}
        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-white/70 border border-slate-200 text-slate-600 hover:bg-white transition-colors disabled:opacity-50"
      >
        {updating ? <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" /> : <>Move <ChevronDown size={10} /></>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-slate-200 shadow-lg py-1 min-w-[140px]">
            {STATUS_FLOW.filter(s => s !== client.status).map(s => (
              <button key={s} onClick={e => { e.stopPropagation(); changeStatus(s); }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function QueueMonitor() {
  const { office } = useAuth();
  const { queue, loading, error, refetch } = useRealtimeQueue(office?.id ?? null);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 min-h-[400px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-emerald-500" />
          <h2 className="text-base font-bold text-slate-800">Live Queue Monitor</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
          <button onClick={refetch} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto flex-1">
        {loading && [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
        {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">Failed to load queue: {error}</div>}
        {!loading && !error && queue.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Activity size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Queue is empty</p>
            <p className="text-xs mt-1">New clients appear here in real time</p>
          </div>
        )}
        {!loading && queue.map((client, idx) => (
          <div key={client.id} className="group relative">
            <QueueCard client={client} position={idx + 1} />
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <StatusMenu client={client} onUpdated={refetch} />
            </div>
          </div>
        ))}
      </div>

      {!loading && queue.length > 0 && (
        <p className="text-xs text-slate-400 text-center border-t border-slate-100 pt-3">
          {queue.length} client{queue.length !== 1 ? 's' : ''} in active queue
        </p>
      )}
    </div>
  );
}
