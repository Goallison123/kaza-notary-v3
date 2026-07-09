import { useState } from 'react';
import { ChevronDown, ArrowRight, BookOpen } from 'lucide-react';

const faqs = [
  {
    q: 'Do clients need to create an account?',
    a: 'No. Clients receive a one-time secure link via SMS. They fill out their form, upload documents, and sign — all from their phone browser. No app download or account registration required.',
  },
  {
    q: 'How secure are the submissions?',
    a: 'All data is encrypted in transit and at rest using AES-256. Each submission includes a cryptographic token, timestamp, and digital signature chain. Your records are stored on enterprise-grade infrastructure with full audit trails.',
  },
  {
    q: 'Can I customize the forms?',
    a: 'Yes. The dynamic form builder lets you configure fields, required documents, service categories, and signature requirements specific to each notary service type your office handles.',
  },
  {
    q: 'Is this built for Rwanda?',
    a: 'Yes. Kaza is purpose-built for Rwandan notary and legal offices. It supports Rwanda national ID format validation, MTN MoMo payments, Kinyarwanda-compatible naming, and RRA compliance requirements.',
  },
  {
    q: 'Can I export my data?',
    a: 'Absolutely. Export your client records as CSV or PDF at any time from the Records view. Daily reports can also be scheduled to generate automatically.',
  },
];

interface FAQSectionProps {
  onEnterApp: () => void;
}

export default function FAQSection({ onEnterApp }: FAQSectionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map(({ q, a }, i) => (
              <div
                key={q}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  open === i ? 'border-[#002244] bg-slate-50' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                >
                  <span className={`font-semibold text-sm ${open === i ? 'text-[#002244]' : 'text-slate-700'}`}>{q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${open === i ? 'rotate-180 text-[#002244]' : ''}`}
                  />
                </button>
                {open === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-[#002244] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
              <BookOpen size={22} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            Ready to go paperless?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Join notary offices across Rwanda using Kaza to manage client records securely, efficiently, and compliantly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#002244] font-bold hover:bg-slate-100 transition-colors shadow-lg"
            >
              Start your free trial <ArrowRight size={16} />
            </button>
            <button
              onClick={onEnterApp}
              className="px-8 py-3.5 rounded-xl border border-white/25 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              View demo
            </button>
          </div>
          <p className="text-slate-400 text-xs mt-6">14-day free trial · No credit card required · Cancel any time</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001222] py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-slate-500" />
            <span className="text-slate-400 text-sm font-semibold">Kaza: Notary Digital Register</span>
          </div>
          <p className="text-slate-600 text-xs">© 2026 Kaza. Built for professional offices across East Africa.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Security'].map(l => (
              <button key={l} className="text-slate-600 text-xs hover:text-slate-400 transition-colors">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
