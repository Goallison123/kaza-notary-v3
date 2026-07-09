import { ArrowRight, Play, Scale, Building2, TrendingUp, Globe, Users } from 'lucide-react';

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

          {/* Right - Dashboard Mockup */}
          <div className="relative hidden lg:block">
            <div className="bg-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Browser bar */}
              <div className="bg-slate-100 px-4 py-2.5 flex items-center gap-2 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400 ml-2 font-mono">
                  kaza.rw/dashboard
                </div>
              </div>
              {/* Mock Dashboard */}
              <div className="p-5 bg-[#F8FAFC]">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { n: '148', l: 'Total Clients' },
                    { n: '12', l: 'Pending' },
                    { n: '✓', l: 'Form submitted' },
                  ].map(({ n, l }) => (
                    <div key={l} className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                      <p className="text-xl font-extrabold text-slate-800">{n}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
                {/* Mini bar chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
                  <div className="flex items-end gap-1.5 h-16">
                    {[30, 55, 45, 70, 60, 85, 65].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-sky-500 opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                {/* Client rows */}
                {[
                  { initials: 'EN', name: 'Emmanuel Nkurunziza', svc: 'Property Transfer', status: 'Submitted' },
                  { initials: 'MU', name: 'Marie-Claire Uwase', svc: 'Affidavit', status: 'Pending' },
                ].map(({ initials, name, svc, status }) => (
                  <div key={name} className="bg-white rounded-xl border border-slate-200 p-3 mb-2 last:mb-0 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#002244] flex items-center justify-center shrink-0">
                      <span className="text-white text-[10px] font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{name}</p>
                      <p className="text-[10px] text-slate-400">{svc}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      status === 'Submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {status}
                    </span>
                  </div>
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
