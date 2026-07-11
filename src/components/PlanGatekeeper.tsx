import { Check, Lock, AlertTriangle, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PlanInfo } from '../hooks/usePlan';
import KazaLogo from './KazaLogo';

interface PlanGatekeeperProps {
  plan: PlanInfo;
}

const WHATSAPP_NUMBER = '250723776020';

export default function PlanGatekeeper({ plan }: PlanGatekeeperProps) {
  const { office } = useAuth();

  const message = plan.lockoutReason === 'request_limit'
    ? `Hello Sybella Systems, our office has reached the 200 monthly check-in limit on our Basic Plan. We would like to upgrade. Office ID: ${office?.id}`
    : `Hello Sybella Systems, we have sent our payment screenshot to renew our Kaza plan. Office ID: ${office?.id}`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const plans = [
    {
      name: 'Basic',
      price: '15,000',
      unit: 'RWF / month',
      features: ['200 requests/month', '3 service categories', '1 office branch', 'CSV / Excel export'],
      highlight: false,
    },
    {
      name: 'Professional',
      price: '45,000',
      unit: 'RWF / month',
      features: ['Unlimited requests', 'All service categories', 'Up to 5 branches', 'Team members (unlimited)', 'Live analytics dashboard', 'Daily report generation'],
      highlight: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#001a33] flex flex-col items-center justify-center p-6 overflow-y-auto">
      {/* Logo */}
      <div className="mb-6 opacity-90">
        <KazaLogo variant="animated" size={140} />
      </div>

      {/* Lockout message */}
      <div className="text-center max-w-xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4">
          <AlertTriangle size={13} /> KAZA PLAN INTERRUPTION
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-3">
          {plan.lockoutReason === 'request_limit'
            ? 'Monthly Request Limit Reached'
            : 'Subscription Expired'}
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          {plan.lockoutReason === 'request_limit'
            ? `Your office has securely processed all 200 client allocations included in your Basic Plan this month. To avoid interruptions at your reception lounge, please upgrade your plan.`
            : `Your current Kaza platform active access window has expired. To avoid interruptions at your reception lounge, please renew your subscription.`}
        </p>
      </div>

      {/* Plan cards */}
      <div className="flex flex-wrap gap-4 justify-center mb-8 max-w-3xl">
        {plans.map(p => (
          <div
            key={p.name}
            className={`rounded-2xl p-5 w-[240px] flex flex-col ${
              p.highlight
                ? 'bg-sky-500/10 border-2 border-sky-400 relative'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-2.5 right-3 bg-sky-400 text-[#001a33] text-[10px] font-bold px-2 py-0.5 rounded-full">
                POPULAR
              </span>
            )}
            <h3 className="text-white font-bold text-lg mb-1">{p.name}</h3>
            <p className={`text-xl font-extrabold mb-4 ${p.highlight ? 'text-sky-300' : 'text-slate-300'}`}>
              {p.price} <span className="text-xs font-normal text-slate-500">{p.unit}</span>
            </p>
            <ul className="flex flex-col gap-2 flex-1">
              {p.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                  <Check size={12} className={`mt-0.5 shrink-0 ${p.highlight ? 'text-sky-400' : 'text-emerald-400'}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Payment instructions */}
      <div className="text-center mb-6">
        <p className="text-emerald-300 text-sm font-semibold mb-1">
          Pay via MoMoPay: *182*8*1*XXXXXX#
        </p>
        <p className="text-slate-500 text-xs">
          After payment, share your confirmation screenshot via WhatsApp to activate your plan.
        </p>
      </div>

      {/* WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2.5 px-6 py-3.5 bg-[#25D366] text-white font-bold rounded-xl text-sm hover:bg-[#22c35e] transition-colors shadow-lg shadow-green-500/30"
      >
        <MessageCircle size={18} />
        Share Confirmation Screenshot via WhatsApp
      </a>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-1.5 text-slate-600 text-xs">
        <Lock size={11} />
        <span>Office ID: {office?.id?.slice(0, 8) ?? '—'} · Secured by Kaza</span>
      </div>
    </div>
  );
}
