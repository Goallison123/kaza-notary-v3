import { useEffect, useState } from 'react';
import { CheckCircle, Clock, BookOpen, Hash, User, Tag } from 'lucide-react';

export interface TokenReceiptData {
  queueNumber: number;
  clientName: string;
  serviceName: string;
  officeName: string;
  submittedAt: string;
}

export default function DigitalTokenReceipt({ data }: { data: TokenReceiptData }) {
  const [animateIn, setAnimateIn] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimateIn(true), 100);
    const t2 = setTimeout(() => setPulse(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const padded = String(data.queueNumber).padStart(3, '0');

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-sm transition-all duration-500 ${
          animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Success banner */}
        <div className="text-center mb-5">
          <div
            className={`w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200 transition-transform duration-500 ${
              pulse ? 'scale-100' : 'scale-50'
            }`}
          >
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
            <span className="text-[10px] text-slate-400 font-mono">{new Date().toLocaleDateString('en-GB')}</span>
          </div>

          {/* Queue number — the hero */}
          <div className="px-5 pt-6 pb-5 text-center bg-gradient-to-b from-slate-50 to-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Your Queue Number</p>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-xl animate-pulse" />
              <div className="relative text-7xl font-black text-[#002244] tabular-nums leading-none tracking-tight">
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
            <div className="absolute left-0 top-0 w-4 h-4 bg-slate-50 rounded-full -ml-2 -mt-2 border border-slate-200" style={{ backgroundColor: '#f8fafc' }} />
            <div className="absolute right-0 top-0 w-4 h-4 bg-slate-50 rounded-full -mr-2 -mt-2 border border-slate-200" style={{ backgroundColor: '#f8fafc' }} />
            <div className="border-t-2 border-dashed border-slate-200 mx-4" />
          </div>

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
          <div className="bg-emerald-50 border-t border-emerald-100 px-5 py-4 text-center">
            <p className="text-sm font-bold text-emerald-800">Please take a seat.</p>
            <p className="text-xs text-emerald-600 mt-0.5">The notary will call your number shortly.</p>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-400">
            Keep this screen visible. You may be called by name or number.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-400">
            <BookOpen size={11} /> Secured by <strong className="text-slate-500">Kaza</strong> · Notary Digital Register
          </div>
        </div>
      </div>
    </div>
  );
}
