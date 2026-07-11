import { useState } from 'react';
import { Building2, Phone, Calendar, Layers, Users, Crown, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../hooks/usePlan';
import StatCard from '../components/StatCard';
import CategoriesManager from '../features/settings/CategoriesManager';
import CategoryEditor from '../features/settings/CategoryEditor';
import TeamManagement from '../features/settings/TeamManagement';
import UpgradeModal, { UpgradeButton } from '../components/UpgradeModal';
import { ServiceCategory } from '../types';

type Tab = 'office' | 'forms' | 'team' | 'billing';

const TIER_COLORS: Record<string, string> = {
  'Free-Trial': 'bg-sky-100 text-sky-700',
  'Basic': 'bg-slate-100 text-slate-700',
  'Professional': 'bg-emerald-100 text-emerald-700',
  'Enterprise': 'bg-purple-100 text-purple-700',
};

const PLANS = [
  {
    name: 'Free-Trial',
    price: '0',
    unit: 'for 14 days',
    desc: 'Full access trial',
    features: ['All features unlocked', '14-day access window', 'No credit card needed'],
  },
  {
    name: 'Basic',
    price: '15,000',
    unit: 'RWF / month',
    desc: 'For small offices',
    features: ['200 requests / month', '3 service categories', '1 office branch', 'CSV / Excel export'],
  },
  {
    name: 'Professional',
    price: '45,000',
    unit: 'RWF / month',
    desc: 'For growing offices',
    features: ['Unlimited requests', 'All service categories', 'Up to 5 branches', 'Team members (unlimited)', 'Live analytics dashboard', 'Daily report generation'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    unit: 'pricing',
    desc: 'For large institutions',
    features: ['Unlimited everything', 'Custom integrations', 'Dedicated support', 'SLA guarantees'],
  },
];

export default function SettingsView() {
  const { office } = useAuth();
  const plan = usePlan();
  const [tab, setTab] = useState<Tab>('office');
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<'general' | 'analytics' | 'reports' | 'team' | 'categories' | 'requests'>('general');

  const expiry = office?.subscription_expires_at;
  const expired = expiry ? new Date(expiry) < new Date() : false;

  const tabs = [
    { id: 'office' as const, label: 'Office Profile', icon: Building2 },
    { id: 'forms' as const, label: 'Form Builder', icon: Layers },
    { id: 'team' as const, label: 'Team', icon: Users },
    { id: 'billing' as const, label: 'Plans & Billing', icon: CreditCard },
  ];

  function openUpgrade(feature: typeof upgradeTarget) {
    setUpgradeTarget(feature);
    setShowUpgrade(true);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 max-w-3xl">
        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6 flex-wrap">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setEditingCategory(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Office Profile */}
        {tab === 'office' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Office Name" value={office?.name ?? '—'} accent="bg-[#003366]" icon={<Building2 size={16} />} />
              <StatCard
                label="Plan Tier"
                value={plan.tier}
                sub={plan.isExpired ? 'Subscription expired' : 'In good standing'}
                accent={plan.isExpired ? 'bg-red-500' : 'bg-emerald-600'}
                icon={<Crown size={16} />}
              />
              <StatCard label="MoMo Code" value={office?.momo_code ?? 'Not set'} accent="bg-sky-600" icon={<Phone size={16} />} />
              <StatCard
                label="Subscription Expires"
                value={expiry ? new Date(expiry).toLocaleDateString('en-GB') : '—'}
                sub={expired ? 'Please renew' : 'In good standing'}
                accent={expired ? 'bg-amber-500' : 'bg-slate-600'}
                icon={<Calendar size={16} />}
              />
            </div>

            {/* Plan usage card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Crown size={14} className="text-[#003366]" /> Plan Usage
                </h3>
                <UpgradeButton onClick={() => openUpgrade('general')} label="Upgrade Plan" size="sm" />
              </div>
              <div className="flex flex-col gap-0">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Current Tier</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${TIER_COLORS[plan.tier] ?? 'bg-slate-100 text-slate-600'}`}>
                    {plan.tier}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Requests This Month</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-800 font-semibold">
                      {plan.requestsUsed}
                      {plan.requestsLimit !== Infinity && ` / ${plan.requestsLimit}`}
                    </span>
                    {plan.requestsLimit !== Infinity && plan.requestsRemaining === 0 && (
                      <button onClick={() => openUpgrade('requests')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700">Upgrade</button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Service Categories</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-800 font-semibold">
                      {plan.maxCategories === Infinity ? 'Unlimited' : `Up to ${plan.maxCategories}`}
                    </span>
                    {plan.maxCategories !== Infinity && (
                      <button onClick={() => openUpgrade('categories')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700">Unlock all</button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Team Members</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-800 font-semibold">
                      {plan.hasTeam ? 'Unlimited' : 'Not included'}
                    </span>
                    {!plan.hasTeam && (
                      <button onClick={() => openUpgrade('team')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700">Unlock</button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Analytics Dashboard</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.hasAnalytics ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {plan.hasAnalytics ? 'Enabled' : 'Locked'}
                    </span>
                    {!plan.hasAnalytics && (
                      <button onClick={() => openUpgrade('analytics')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700">Unlock</button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-slate-500 font-medium">Report Generation</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.hasReports ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {plan.hasReports ? 'Enabled' : 'Locked'}
                    </span>
                    {!plan.hasReports && (
                      <button onClick={() => openUpgrade('reports')} className="text-[10px] font-bold text-sky-600 hover:text-sky-700">Unlock</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Platform info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Platform Information</h3>
              <div className="flex flex-col gap-0">
                {[
                  ['Platform', 'Kaza: Notary Digital Register'],
                  ['Version', '2.0.0'],
                  ['Database', 'Supabase PostgreSQL'],
                  ['Real-time', 'WebSocket subscriptions'],
                  ['Auth', 'Supabase email/password'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-500 font-medium">{k}</span>
                    <span className="text-sm text-slate-800 font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Builder */}
        {tab === 'forms' && (
          editingCategory
            ? <CategoryEditor category={editingCategory} onBack={() => setEditingCategory(null)} />
            : <CategoriesManager onEdit={setEditingCategory} />
        )}

        {/* Team */}
        {tab === 'team' && <TeamManagement />}

        {/* Plans & Billing */}
        {tab === 'billing' && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={16} className="text-[#003366]" /> Plans & Billing
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You are currently on the <span className="font-bold text-slate-700">{plan.tier}</span> plan.
                {plan.tier !== 'Enterprise' && ' Select a plan below to upgrade.'}
              </p>
            </div>

            {/* Current plan banner */}
            <div className="bg-gradient-to-r from-[#002244] to-[#003366] rounded-xl p-5 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-sky-300 uppercase tracking-widest mb-1">Current Plan</p>
                <p className="text-xl font-extrabold">{plan.tier}</p>
                <p className="text-xs text-slate-300 mt-1">
                  {plan.requestsLimit !== Infinity && `${plan.requestsUsed}/${plan.requestsLimit} requests used this month`}
                  {plan.requestsLimit === Infinity && 'Unlimited requests'}
                  {' · '}
                  {plan.hasTeam ? 'Team enabled' : 'No team'}
                  {' · '}
                  {plan.hasAnalytics ? 'Analytics on' : 'Analytics off'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Expires</p>
                <p className="text-sm font-bold">{expiry ? new Date(expiry).toLocaleDateString('en-GB') : '—'}</p>
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PLANS.map(p => {
                const isCurrent = plan.tier === p.name;
                return (
                  <div
                    key={p.name}
                    className={`rounded-xl p-4 flex flex-col border transition-all ${
                      isCurrent
                        ? 'border-2 border-emerald-400 bg-emerald-50'
                        : p.highlight
                          ? 'border-2 border-[#003366] bg-[#003366]/5 shadow-md'
                          : 'border border-slate-200 bg-white'
                    }`}
                  >
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-600 mb-2">YOUR CURRENT PLAN</span>
                    )}
                    {p.highlight && !isCurrent && (
                      <span className="text-[10px] font-bold text-[#003366] mb-2">MOST POPULAR</span>
                    )}
                    <p className="text-sm font-bold text-slate-800 mb-0.5">{p.name}</p>
                    <p className="text-[10px] text-slate-400 mb-3">{p.desc}</p>
                    <p className="text-lg font-extrabold text-slate-900 mb-3">
                      {p.price} <span className="text-[10px] font-normal text-slate-400">{p.unit}</span>
                    </p>
                    <ul className="flex flex-col gap-1.5 flex-1 mb-4">
                      {p.features.map(f => (
                        <li key={f} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <span className={`mt-0.5 shrink-0 ${p.highlight ? 'text-[#003366]' : 'text-emerald-500'}`}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold text-center">
                        Active
                      </div>
                    ) : (
                      <button
                        onClick={() => openUpgrade('general')}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold transition-colors ${
                          p.highlight
                            ? 'bg-[#002244] text-white hover:bg-[#003366]'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Choose {p.name}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Payment info */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
              <h4 className="text-sm font-bold text-slate-700 mb-3">How to Upgrade</h4>
              <ol className="flex flex-col gap-2.5 text-xs text-slate-600">
                <li className="flex gap-2"><span className="font-bold text-[#003366]">1.</span> Select your desired plan above and click the "Choose" button.</li>
                <li className="flex gap-2"><span className="font-bold text-[#003366]">2.</span> Pay via MoMoPay: dial <span className="font-mono font-bold">*182*8*1*XXXXXX#</span></li>
                <li className="flex gap-2"><span className="font-bold text-[#003366]">3.</span> Click the WhatsApp button in the popup to send your payment confirmation screenshot.</li>
                <li className="flex gap-2"><span className="font-bold text-[#003366]">4.</span> Sybella Systems will activate your plan manually after confirming payment.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade modal */}
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        lockedFeature={upgradeTarget}
      />
    </div>
  );
}
