import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: '15,000',
    period: 'RWF / month',
    desc: 'For small offices',
    highlight: false,
    features: [
      '5 staff accounts',
      '200 requests/month',
      '3 service categories',
      '1 office branch',
      'CSV exports',
      'Email support',
    ],
    cta: 'Start free trial',
  },
  {
    name: 'Professional',
    price: '45,000',
    period: 'RWF / month',
    desc: 'For growing offices',
    highlight: true,
    features: [
      'Unlimited staff',
      'Unlimited requests',
      'All service categories',
      'Up to 5 branches',
      'API access',
      'Priority SMS delivery',
      'Analytics dashboard',
      'Daily report generation',
    ],
    cta: 'Get started',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    desc: 'For large institutions',
    highlight: false,
    features: [
      'Unlimited staff',
      'Custom integrations',
      'API access',
      'Custom categories',
      'Dedicated support',
      'SLA guarantees',
      'On-site training',
      'Audit log export',
    ],
    cta: 'Contact sales',
  },
];

interface PricingSectionProps {
  onEnterApp: () => void;
}

export default function PricingSection({ onEnterApp }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-slate-500 text-lg">14-day free trial. No credit card required.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map(({ name, price, period, desc, highlight, features, cta }) => (
            <div
              key={name}
              className={`rounded-2xl border p-8 flex flex-col transition-all duration-200 ${
                highlight
                  ? 'bg-[#002244] border-[#002244] shadow-2xl scale-[1.02] text-white'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {highlight && (
                <div className="inline-flex items-center gap-1.5 bg-sky-500/20 text-sky-300 text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit">
                  Most popular
                </div>
              )}
              <p className={`text-sm font-bold mb-1 ${highlight ? 'text-sky-300' : 'text-slate-500'}`}>{name}</p>
              <p className={`text-xs mb-4 ${highlight ? 'text-white/50' : 'text-slate-400'}`}>{desc}</p>
              <div className="mb-6">
                <span className={`text-4xl font-extrabold ${highlight ? 'text-white' : 'text-slate-900'}`}>{price}</span>
                <span className={`text-sm ml-1.5 ${highlight ? 'text-white/60' : 'text-slate-400'}`}>{period}</span>
              </div>

              <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={14} className={`mt-0.5 shrink-0 ${highlight ? 'text-sky-400' : 'text-emerald-500'}`} />
                    <span className={`text-sm ${highlight ? 'text-white/80' : 'text-slate-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onEnterApp}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                  highlight
                    ? 'bg-white text-[#002244] hover:bg-slate-100'
                    : 'bg-[#002244] text-white hover:bg-[#003366]'
                }`}
              >
                {cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
