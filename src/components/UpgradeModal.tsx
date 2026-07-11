import { useState } from 'react';
import { X, Check, MessageCircle, Crown, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PlanTier } from '../types';

const WHATSAPP_NUMBER = '250723776020';

const PLANS: {
  name: PlanTier;
  price: string;
  unit: string;
  desc: string;
  features: string[];
  highlight: boolean;
}[] = [
  {
    name: 'Basic',
    price: '15,000',
    unit: 'RWF / month',
    desc: 'For small offices',
    features: [
      '200 requests / month',
      '3 service categories',
      '1 office branch',
      'CSV / Excel export',
    ],
    highlight: false,
  },
  {
    name: 'Professional',
    price: '45,000',
    unit: 'RWF / month',
    desc: 'For growing offices',
    features: [
      'Unlimited requests',
      'All service categories',
      'Up to 5 branches',
      'Team members (unlimited)',
      'Live analytics dashboard',
      'Daily report generation',
    ],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    unit: 'pricing',
    desc: 'For large institutions',
    features: [
      'Unlimited everything',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
    ],
    highlight: false,
  },
];

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  /** Which feature is locked — used to pre-select a recommended plan */
  lockedFeature?: 'analytics' | 'reports' | 'team' | 'categories' | 'requests' | 'general';
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
}

const FEATURE_RECOMMENDATIONS: Record<string, PlanTier> = {
  analytics: 'Professional',
  reports: 'Professional',
  team: 'Professional',
  categories: 'Professional',
  requests: 'Professional',
  general: 'Professional',
};

export default function UpgradeModal({ open, onClose, lockedFeature = 'general', title, description }: UpgradeModalProps) {
  const { office } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(
    FEATURE_RECOMMENDATIONS[lockedFeature] ?? 'Professional'
  );

  if (!open) return null;

  const currentTier = office?.plan_tier ?? 'Free-Trial';

  const message = `Hello Sybella Systems, we would like to upgrade to the ${selectedPlan} plan for our office "${office?.name ?? ''}" (Office ID: ${office?.id ?? '—'}). Please share payment instructions.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const defaultTitle = lockedFeature === 'requests'
    ? 'Monthly Request Limit Reached'
    : 'Upgrade Your Plan';

  const defaultDesc = lockedFeature === 'requests'
    ? 'You have reached the 200 monthly request limit on your Basic plan. Upgrade to Professional for unlimited requests.'
    : 'Choose a plan that fits your office. Pay via MoMoPay and share your confirmation screenshot via WhatsApp to activate instantly.';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-gradient-to-r from-[#002244] to-[#003366]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Crown size={16} className="text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{title ?? defaultTitle}</h2>
              <p className="text-[11px] text-slate-300">{currentTier} plan active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          <p className="text-sm text-slate-500 mb-5 text-center max-w-md mx-auto">
            {description ?? defaultDesc}
          </p>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {PLANS.map(p => {
              const isSelected = selectedPlan === p.name;
              const isCurrent = currentTier === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => !isCurrent && setSelectedPlan(p.name)}
                  disabled={isCurrent}
                  className={`relative rounded-xl p-4 text-left transition-all ${
                    isSelected
                      ? 'border-2 border-[#003366] bg-[#003366]/5 shadow-md'
                      : isCurrent
                        ? 'border-2 border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        : 'border border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-2 right-3 bg-[#003366] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute -top-2 left-3 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      CURRENT
                    </span>
                  )}
                  <p className="text-sm font-bold text-slate-800 mb-0.5">{p.name}</p>
                  <p className="text-[10px] text-slate-400 mb-2">{p.desc}</p>
                  <p className="text-lg font-extrabold text-slate-900 mb-3">
                    {p.price} <span className="text-[10px] font-normal text-slate-400">{p.unit}</span>
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                        <Check size={11} className={`mt-0.5 shrink-0 ${p.highlight ? 'text-[#003366]' : 'text-emerald-500'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Payment instructions */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-700">MTN</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Pay via MoMoPay</p>
                <p className="text-[11px] text-slate-500">Dial *182*8*1*XXXXXX# to send payment</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              After payment, click the WhatsApp button below to share your confirmation screenshot. Your plan will be activated manually by Sybella Systems once payment is confirmed.
            </p>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 bg-[#25D366] text-white font-bold rounded-xl text-sm hover:bg-[#22c35e] transition-colors shadow-lg shadow-green-500/20"
          >
            <MessageCircle size={18} />
            Send Upgrade Request via WhatsApp
          </a>

          <p className="text-center text-[11px] text-slate-400 mt-3">
            Selected plan: <span className="font-semibold text-slate-600">{selectedPlan}</span> · Office ID: {office?.id?.slice(0, 8) ?? '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Compact upgrade button for inline use next to locked features */
export function UpgradeButton({
  onClick,
  label = 'Upgrade',
  size = 'sm',
}: {
  onClick: () => void;
  label?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-[#002244] text-white hover:bg-[#003366] transition-colors ${
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
      }`}
    >
      <Crown size={size === 'sm' ? 12 : 14} />
      {label}
    </button>
  );
}
