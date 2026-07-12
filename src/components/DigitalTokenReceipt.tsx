import { useEffect, useState, useRef } from 'react';
import { CheckCircle, Clock, BookOpen, Hash, User, Tag, Bell, Users, Volume2, VolumeX, AlertCircle, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ClientLog } from '../types';

export interface TokenReceiptData {
  queueNumber: number;
  clientName: string;
  serviceName: string;
  officeName: string;
  submittedAt: string;
  officeId?: string;
  clientLogId?: string;
}

type QueueState = 'waiting' | 'next' | 'ready' | 'skipped' | 'archived' | 'unknown';

export default function DigitalTokenReceipt({ data }: { data: TokenReceiptData }) {
  const [animateIn, setAnimateIn] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [queueState, setQueueState] = useState<QueueState>('waiting');
  const [aheadCount, setAheadCount] = useState(0);
  const [nextClient, setNextClient] = useState<ClientLog | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [hasBeeped, setHasBeeped] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevStateRef = useRef<QueueState>('waiting');

  // Entrance animation
  useEffect(() => {
    const t1 = setTimeout(() => setAnimateIn(true), 100);
    const t2 = setTimeout(() => setPulse(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Realtime queue subscription
  useEffect(() => {
    if (!data.officeId) return;

    async function fetchQueueState() {
      if (!data.officeId || !data.clientLogId) return;

      // Get all active queue entries for this office
      const { data: queue } = await supabase
        .from('client_logs')
        .select('*')
        .eq('office_id', data.officeId)
        .in('status', ['Pending', 'Filing Details', 'Ready'])
        .order('created_at', { ascending: true });

      if (!queue) return;

      // Find our client's position
      const myIndex = queue.findIndex(c => c.id === data.clientLogId);
      const myClient = queue.find(c => c.id === data.clientLogId);

      if (myIndex === -1 || !myClient) {
        // Not in active queue — check if archived/signed/skipped
        const { data: myLog } = await supabase
          .from('client_logs')
          .select('status')
          .eq('id', data.clientLogId)
          .single();

        if (myLog?.status === 'Skipped') {
          setQueueState('skipped');
        } else if (myLog?.status === 'Archived' || myLog?.status === 'Signed & Recorded' || myLog?.status === 'Rejected') {
          setQueueState('archived');
        } else {
          setQueueState('unknown');
        }
        return;
      }

      // Count how many are ahead (earlier in queue, not yet Ready, not Skipped)
      const ahead = queue.slice(0, myIndex).filter(c => c.status !== 'Ready' && c.status !== 'Archived' && c.status !== 'Skipped');
      setAheadCount(ahead.length);

      // The person right before me (next to be called before me)
      const personAhead = ahead.length > 0 ? ahead[ahead.length - 1] : null;
      setNextClient(personAhead);

      // Determine state
      if (myClient.status === 'Skipped') {
        setQueueState('skipped');
      } else if (myClient.status === 'Ready') {
        setQueueState('ready');
      } else if (ahead.length === 0) {
        setQueueState('next');
      } else {
        setQueueState('waiting');
      }
    }

    fetchQueueState();

    const channel = supabase
      .channel(`receipt_queue_${data.officeId}_${data.clientLogId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'client_logs',
        filter: `office_id=eq.${data.officeId}`,
      }, () => { fetchQueueState(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [data.officeId, data.clientLogId]);

  // Beep when it's our turn (state transitions to 'ready' or 'next')
  useEffect(() => {
    if (hasBeeped || !soundOn) return;
    if (queueState === 'ready' || queueState === 'next') {
      if (prevStateRef.current !== queueState) {
        playBeep();
        setHasBeeped(true);
      }
    }
    prevStateRef.current = queueState;
  }, [queueState, hasBeeped, soundOn]);

  function playBeep() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      // Triple ascending beep
      [880, 1100, 1320].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.18);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.18);
      });
    } catch { /* audio not available */ }
  }

  const [rejoining, setRejoining] = useState(false);

  async function handleRejoin() {
    if (!data.clientLogId) return;
    setRejoining(true);
    await supabase.from('client_logs').update({ status: 'Pending' }).eq('id', data.clientLogId);
    // The realtime subscription will pick up the change and update the state
    setRejoining(false);
  }

  const padded = String(data.queueNumber).padStart(3, '0');

  const stateConfig: Record<QueueState, { banner: string; bannerBg: string; bannerText: string; icon: typeof Bell }> = {
    waiting:  { banner: 'Waiting in queue',       bannerBg: 'bg-amber-50 border-amber-200',   bannerText: 'text-amber-700',   icon: Clock },
    next:     { banner: 'You are next!',           bannerBg: 'bg-sky-50 border-sky-200',       bannerText: 'text-sky-700',    icon: Bell },
    ready:    { banner: 'It is your turn now',     bannerBg: 'bg-emerald-50 border-emerald-200', bannerText: 'text-emerald-700', icon: Bell },
    skipped:  { banner: 'You were skipped',        bannerBg: 'bg-red-50 border-red-200',       bannerText: 'text-red-700',    icon: AlertCircle },
    archived: { banner: 'Session completed',       bannerBg: 'bg-slate-100 border-slate-200', bannerText: 'text-slate-600',   icon: CheckCircle },
    unknown:  { banner: 'Checking queue status...', bannerBg: 'bg-slate-100 border-slate-200', bannerText: 'text-slate-500',   icon: Clock },
  };

  const sc = stateConfig[queueState];
  const StateIcon = sc.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-sm transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Success banner */}
        <div className="text-center mb-5">
          <div className={`w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200 transition-transform duration-500 ${pulse ? 'scale-100' : 'scale-50'}`}>
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Kaza Check-in Successful</h1>
          <p className="text-xs text-slate-500 mt-1">Your information has been securely received</p>
        </div>

        {/* Token receipt card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
          {/* Header strip */}
          <div className="bg-gradient-to-r from-[#002244] to-[#003366] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} className="text-sky-300" />
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-widest">Kaza Queue Token</span>
            </div>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className={`p-1 rounded-md transition-colors ${soundOn ? 'text-sky-300 hover:bg-white/10' : 'text-slate-500 hover:bg-white/10'}`}
              title={soundOn ? 'Sound on' : 'Sound off'}
            >
              {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>
          </div>

          {/* Queue number — the hero */}
          <div className="px-5 pt-6 pb-5 text-center bg-gradient-to-b from-slate-50 to-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Your Queue Number</p>
            <div className="relative inline-block">
              <div className={`absolute inset-0 rounded-2xl blur-xl ${
                queueState === 'ready' ? 'bg-emerald-400/30 animate-pulse' :
                queueState === 'next' ? 'bg-sky-400/20 animate-pulse' :
                queueState === 'skipped' ? 'bg-red-400/20' :
                'bg-emerald-400/20'
              }`} />
              <div className={`relative text-7xl font-black tabular-nums leading-none tracking-tight transition-colors ${
                queueState === 'ready' ? 'text-emerald-600' :
                queueState === 'next' ? 'text-sky-600' :
                queueState === 'skipped' ? 'text-red-500' :
                'text-[#002244]'
              }`}>
                {padded}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center justify-center gap-1.5">
              <Hash size={11} className="text-emerald-500" />
              Number {data.queueNumber} · Please remember this number
            </p>
          </div>

          {/* Divider with notch */}
          <div className="relative">
            <div className="absolute left-0 top-0 w-4 h-4 rounded-full -ml-2 -mt-2 border border-slate-200" style={{ backgroundColor: '#f8fafc' }} />
            <div className="absolute right-0 top-0 w-4 h-4 rounded-full -mr-2 -mt-2 border border-slate-200" style={{ backgroundColor: '#f8fafc' }} />
            <div className="border-t-2 border-dashed border-slate-200 mx-4" />
          </div>

          {/* Live queue status banner */}
          <div className={`px-5 py-4 border-b ${sc.bannerBg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                queueState === 'ready' ? 'bg-emerald-500 animate-pulse' :
                queueState === 'next' ? 'bg-sky-500' :
                queueState === 'skipped' ? 'bg-red-500' :
                queueState === 'archived' ? 'bg-slate-400' :
                'bg-amber-400'
              }`}>
                <StateIcon size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${sc.bannerText}`}>{sc.banner}</p>
                {queueState === 'waiting' && aheadCount > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {aheadCount} {aheadCount === 1 ? 'person' : 'people'} ahead of you
                  </p>
                )}
                {queueState === 'next' && (
                  <p className="text-xs text-slate-500 mt-0.5">Please get ready — you will be called next</p>
                )}
                {queueState === 'ready' && (
                  <p className="text-xs text-emerald-600 mt-0.5 font-semibold animate-pulse">Please proceed to the desk now</p>
                )}
                {queueState === 'skipped' && (
                  <p className="text-xs text-red-500 mt-0.5">You were not available when called. Rejoin to get a new position.</p>
                )}
              </div>
            </div>
          </div>

          {/* Next person info */}
          {nextClient && queueState === 'waiting' && (
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users size={12} className="text-slate-400" />
                <span>Now serving:</span>
                <span className="font-bold text-slate-700">
                  #{String(nextClient.client_number).padStart(3, '0')} · {nextClient.full_name}
                </span>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                <User size={13} className="text-sky-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Name</p>
                <p className="text-sm font-bold text-slate-800 truncate">{data.clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Tag size={13} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Service</p>
                <p className="text-sm font-bold text-slate-800 truncate">{data.serviceName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Clock size={13} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Check-in Time</p>
                <p className="text-sm font-bold text-slate-800">{data.submittedAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <BookOpen size={13} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Office</p>
                <p className="text-sm font-bold text-slate-800 truncate">{data.officeName}</p>
              </div>
            </div>
          </div>

          {/* Footer instruction */}
          <div className={`border-t px-5 py-4 text-center transition-colors ${
            queueState === 'ready' ? 'bg-emerald-50 border-emerald-100' :
            queueState === 'next' ? 'bg-sky-50 border-sky-100' :
            queueState === 'skipped' ? 'bg-red-50 border-red-100' :
            'bg-emerald-50 border-emerald-100'
          }`}>
            {queueState === 'ready' ? (
              <>
                <p className="text-sm font-bold text-emerald-800 animate-pulse">It is your turn!</p>
                <p className="text-xs text-emerald-600 mt-0.5">Please proceed to the desk now.</p>
              </>
            ) : queueState === 'next' ? (
              <>
                <p className="text-sm font-bold text-sky-800">You are next in line.</p>
                <p className="text-xs text-sky-600 mt-0.5">Please listen for your number.</p>
              </>
            ) : queueState === 'skipped' ? (
              <>
                <p className="text-sm font-bold text-red-700">You were skipped.</p>
                <p className="text-xs text-red-500 mt-0.5 mb-3">
                  The office called your number but you were not available. Tap below to rejoin the queue.
                </p>
                <button
                  onClick={handleRejoin}
                  disabled={rejoining}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-[#002244] text-white text-sm font-bold rounded-xl hover:bg-[#003366] transition-colors disabled:opacity-50"
                >
                  {rejoining
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><RotateCcw size={15} /> Rejoin Queue</>}
                </button>
              </>
            ) : queueState === 'archived' ? (
              <>
                <p className="text-sm font-bold text-slate-700">Your session is complete.</p>
                <p className="text-xs text-slate-500 mt-0.5">Thank you for visiting.</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-emerald-800">Please take a seat.</p>
                <p className="text-xs text-emerald-600 mt-0.5">The notary will call your number shortly.</p>
              </>
            )}
          </div>
        </div>

        {/* Help text */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-400">
            {queueState === 'waiting'
              ? `This screen updates automatically. ${aheadCount} ${aheadCount === 1 ? 'person' : 'people'} ahead of you.`
              : queueState === 'skipped'
                ? 'If you were away, tap Rejoin Queue to get a new position.'
                : 'Keep this screen visible. You may be called by name or number.'
            }
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-400">
            <BookOpen size={11} /> Secured by <strong className="text-slate-500">Kaza</strong> · Notary Digital Register
          </div>
        </div>
      </div>
    </div>
  );
}
