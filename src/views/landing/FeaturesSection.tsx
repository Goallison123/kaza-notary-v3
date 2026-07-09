import { FileText, MessageSquare, ShieldCheck, Search, Users, BarChart3, UserPlus, Smartphone, FileCheck, Database } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Dynamic form builder',
    desc: 'Create custom forms with QR-filled pages including first name, national ID, file uploads, and digital signatures.',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
  },
  {
    icon: MessageSquare,
    title: 'SMS delivery',
    desc: 'The system sends a one-time link via SMS. No download, no account creation — the client receives SMS and clicks.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise security',
    desc: 'End-to-end encrypted storage, complete document audit trails, and government-grade compliance built in.',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
  },
  {
    icon: Search,
    title: 'Instant search',
    desc: 'Find any client in milliseconds — search by name, phone, national ID, or service type across all records.',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    icon: Users,
    title: 'Role-based access',
    desc: 'Granular staff roles — receptionists, notaries, managers — each with specific permission levels and review access.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    icon: BarChart3,
    title: 'Analytics dashboard',
    desc: 'Real-time insights on client volume, wait times, service types, and staff activity — all in one live dashboard.',
    color: 'bg-teal-50 text-teal-600 border-teal-100',
  },
];

const steps = [
  {
    icon: UserPlus,
    num: '01',
    title: 'Staff creates request',
    desc: 'Enter the client\'s name and phone number to generate a secure, unique digital form.',
  },
  {
    icon: Smartphone,
    num: '02',
    title: 'Client receives SMS',
    desc: 'A one-time link is delivered instantly. No app download or account required.',
  },
  {
    icon: FileCheck,
    num: '03',
    title: 'Client fills form',
    desc: 'Client completes their form, uploads documents, and signs digitally from any device.',
  },
  {
    icon: Database,
    num: '04',
    title: 'Records secured',
    desc: 'Submission is encrypted, timestamped, and stored permanently in your compliance ledger.',
  },
];

export default function FeaturesSection() {
  return (
    <>
      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
              Everything you need to go paperless
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              A complete platform for collecting, verifying, and organizing client transaction records built for professional offices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white"
              >
                <div className={`inline-flex p-3 rounded-xl border mb-4 ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2 text-base">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
              Four steps to digital records
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              From paper registers to permanent digital records in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ icon: Icon, num, title, desc }, i) => (
              <div key={num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] right-0 h-px bg-slate-200 z-0" />
                )}
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#002244] flex items-center justify-center mb-4 shadow-sm">
                    <Icon size={24} className="text-[#002244]" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 mb-2">{num}</span>
                  <h3 className="font-bold text-slate-800 mb-2 text-base">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
