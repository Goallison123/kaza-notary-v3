import { useState } from 'react';
import { Building2, Phone, Calendar, ShieldCheck, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import CategoriesManager from '../features/settings/CategoriesManager';
import CategoryEditor from '../features/settings/CategoryEditor';
import { ServiceCategory } from '../types';

type Tab = 'office' | 'forms';

export default function SettingsView() {
  const { office, isExpired } = { ...useAuth(), isExpired: false };
  const [tab, setTab] = useState<Tab>('office');
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  const expiry = office?.subscription_expires_at;
  const expired = expiry ? new Date(expiry) < new Date() : false;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 max-w-3xl">
        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
          {([
            { id: 'office', label: 'Office Profile', icon: Building2 },
            { id: 'forms', label: 'Form Builder', icon: Layers },
          ] as const).map(({ id, label, icon: Icon }) => (
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
                label="Account Status"
                value={office?.account_status ?? '—'}
                sub={expired ? 'Subscription expired' : 'Active subscription'}
                accent={expired ? 'bg-red-500' : 'bg-emerald-600'}
                icon={<ShieldCheck size={16} />}
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
      </div>
    </div>
  );
}
