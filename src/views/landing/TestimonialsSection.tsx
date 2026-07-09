import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'We went from 3 paper registers weekly to zero. Kaza has transformed how we collect client information — everything is instant and permanent.',
    name: 'Grace Uwimana',
    role: 'Head Notary, Royal Legal Notary Office',
    initials: 'GU',
    color: 'from-sky-500 to-[#002244]',
  },
  {
    quote: 'Clients love that the link works right from their phones. Jean Pierre from my office says it now takes under 3 minutes from entry to records confirmed.',
    name: 'Jean Pierre Habimana',
    role: 'Administrative Director, Procure Notary Kigali',
    initials: 'JP',
    color: 'from-emerald-500 to-teal-700',
  },
  {
    quote: 'Everything from the analytics dashboard gives us complete visibility — submission rates, client wait times, and staff activity — all in one screen.',
    name: 'Stephanie Ingabire',
    role: 'Administrator, Remera Property Docs',
    initials: 'SI',
    color: 'from-amber-500 to-orange-700',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
            Trusted by offices across Rwanda
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, role, initials, color }) => (
            <div
              key={name}
              className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <Quote size={24} className="text-slate-200 mb-4" />
              <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-6">"{quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{name}</p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
