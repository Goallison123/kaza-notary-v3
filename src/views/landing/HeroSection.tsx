import { ArrowRight, Play, Scale, Building2, TrendingUp, Globe, Users } from 'lucide-react';
import KazaLogo from '../../components/KazaLogo';

interface HeroSectionProps {
  onEnterApp: () => void;
}

const stats = [
  { value: '500+', label: 'Documents processed' },
  { value: '99.9%', label: 'Uptime', sub: 'guaranteed' },
  { value: '<3s', label: 'From scan to record' },
  { value: '24/7', label: 'Support available' },
];

const categories = [
  { icon: Scale, label: 'Notary Offices' },
  { icon: Building2, label: 'Law Firms' },
  { icon: TrendingUp, label: 'Accounting' },
  { icon: Globe, label: 'NGOs' },
  { icon: Users, label: 'Government' },
];

export default function HeroSection({ onEnterApp }: HeroSectionProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#001833] overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002244] via-[#001833] to-[#000d1a]" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 40%, #0ea5e9 0%, transparent 60%)' }} />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Now live across 12 notary offices in Rwanda
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
              Digital records for<br />
              <span className="text-sky-400">professional offices</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-md">
              Replace paper client registers with secure, searchable digital records. Staff create requests, clients fill forms via SMS—no app required.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#002244] font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg"
              >
                Start free trial <ArrowRight size={16} />
              </button>
              <button
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                <Play size={14} className="fill-white" /> View demo
              </button>
            </div>
          </div>

          {/* Right — Animated logo mark */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Glow backdrop */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full bg-sky-500/10 blur-3xl" />
            </div>

            <div className="relative flex flex-col items-center gap-6">
              {/* The animated SVG logo */}
              <KazaLogo variant="animated" size={340} wordmark />

              {/* Country labels that appear with the network */}
              <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 tracking-wide uppercase">
                {['Angola', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia'].map(c => (
                  <span key={c} className="px-2 py-1 rounded-md bg-white/5 border border-white/10">{c}</span>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-sky-400/20 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      {/* Category trust bar */}
      <section className="bg-[#001222] border-b border-white/5 py-5">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5">
            Built for professional offices across East Africa
          </p>
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            {categories.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-[#002244] py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label, sub }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
              <p className="text-sm font-semibold text-sky-300">{label}</p>
              {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
