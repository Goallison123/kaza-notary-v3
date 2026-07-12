import { ArrowLeft, BookOpen, Shield, Lock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type LegalType = 'privacy' | 'terms' | 'security';

const META: Record<LegalType, {
  title: string;
  subtitle: string;
  icon: typeof Shield;
  accent: string;
}> = {
  privacy:  { title: 'Privacy Policy',         subtitle: 'How Kaza collects, uses, and protects your personal data', icon: Shield, accent: 'text-emerald-600 bg-emerald-100' },
  terms:     { title: 'Terms of Service',       subtitle: 'The rules and expectations for using the Kaza platform',  icon: FileText, accent: 'text-sky-600 bg-sky-100' },
  security:  { title: 'Security Practices',     subtitle: 'How Kaza secures your data and infrastructure',           icon: Lock, accent: 'text-amber-600 bg-amber-100' },
};

export default function LegalPage({ type, children }: { type: LegalType; children: React.ReactNode }) {
  const navigate = useNavigate();
  const meta = META[type];
  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-[#002244] to-[#003366] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Kaza
          </button>
          <div className="flex items-center gap-1.5 text-slate-400">
            <BookOpen size={14} />
            <span className="text-xs font-semibold">Kaza: Notary Digital Register</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${meta.accent}`}>
          <Icon size={28} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{meta.title}</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">{meta.subtitle}</p>
        <p className="text-xs text-slate-400 mt-3">Last updated: July 12, 2026</p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10">
          <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Questions about this policy? Contact <a href="mailto:support@sybella.systems" className="text-[#003366] font-semibold hover:underline">support@sybella.systems</a>
          </p>
          <p className="text-xs text-slate-400 mt-2">© 2026 Kaza · Built by Sybella Systems · Kigali, Rwanda</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable section component ─────────────────────────────────────────── */
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">{title}</h2>
      <div className="space-y-3 text-slate-600">{children}</div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 space-y-1.5">{children}</ul>;
}
