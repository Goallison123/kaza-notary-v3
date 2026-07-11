import { useState } from 'react';
import { Building2, Phone, Calendar, ShieldCheck, Layers, Users, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../hooks/usePlan';
import StatCard from '../components/StatCard';
import CategoriesManager from '../features/settings/CategoriesManager';
import CategoryEditor from '../features/settings/CategoryEditor';
import TeamManagement from '../features/settings/TeamManagement';
import { ServiceCategory } from '../types';

type Tab = 'office' | 'forms' | 'team';

const TIER_COLORS: Record<string, string> = {
  'Free-Trial': 'bg-sky-100 text-sky-700',
  'Basic': 'bg-slate-100 text-slate-700',
  'Professional': 'bg-emerald-100 text-emerald-700',
  'Enterprise': 'bg-purple-100 text-purple-700',
};

export default function SettingsView() {
  const { office } = useAuth();
  const plan = usePlan();
  const [tab, setTab] = useState<Tab>('office');
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  const expiry = office?.subscription_expires_at;
  const expired = expiry ? new Date(expiry) < new Date() : false;

  const tabs = [
    { id: 'office' as const, label: 'Office Profile', icon: Building2 },
    { id: 'forms' as const, label: 'Form Builder', icon: Layers },
    { id: 'team' as const, label: 'Team', icon: Users },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 max-w-3xl">
        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
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
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Crown size={14} className="text-[#003366]" /> Plan Usage
              </h3>
              <div className="flex flex-col gap-0">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Current Tier</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${TIER_COLORS[plan.tier] ?? 'bg-slate-100 text-slate-600'}`}>
                    {plan.tier}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Requests This Month</span>
                  <span className="text-sm text-slate-800 font-semibold">
                    {plan.requestsUsed}
                    {plan.requestsLimit !== Infinity && ` / ${plan.requestsLimit}`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Service Categories</span>
                  <span className="text-sm text-slate-800 font-semibold">
                    {plan.maxCategories === Infinity ? 'Unlimited' : `Up to ${plan.maxCategories}`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Team Members</span>
                  <span className="text-sm text-slate-800 font-semibold">
                    {plan.hasTeam ? 'Unlimited' : 'Not included'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Analytics Dashboard</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.hasAnalytics ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {plan.hasAnalytics ? 'Enabled' : 'Locked'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-slate-500 font-medium">Report Generation</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.hasReports ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {plan.hasReports ? 'Enabled' : 'Locked'}
                  </span>
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
      </div>
    </div>
  );
}
