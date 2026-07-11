import { useState } from 'react';
import { X, Lock, TrendingUp } from 'lucide-react';
import { ClientLog } from '../types';
import RecordsTable from '../features/records/RecordsTable';
import ClientDetailPanel from '../features/records/ClientDetailPanel';
import AnalyticsPanel from '../features/records/AnalyticsPanel';
import IntakeForm from '../features/intake/IntakeForm';
import { usePlan } from '../hooks/usePlan';

export default function RecordsView() {
  const plan = usePlan();
  const [selectedClient, setSelectedClient] = useState<ClientLog | null>(null);
  const [showIntake, setShowIntake] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-5 p-6 overflow-y-auto h-full">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
          <RecordsTable
            selectedId={selectedClient?.id ?? null}
            onSelect={setSelectedClient}
            onUploadRecord={() => setShowIntake(true)}
          />
          <ClientDetailPanel client={selectedClient} />
        </div>

        {/* Analytics: locked for Basic tier */}
        {plan.hasAnalytics ? (
          <AnalyticsPanel />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Lock size={24} className="text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Analytics Dashboard is a Professional feature</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Upgrade to the Professional plan to unlock live analytics charts, status breakdowns, and daily report generation.
            </p>
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              <TrendingUp size={13} /> Professional: 45,000 RWF / month — Analytics + Reports included
            </div>
          </div>
        )}
      </div>

      {/* Upload / Intake Modal */}
      {showIntake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowIntake(false)} />
          <div className="relative bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white shrink-0">
              <h2 className="text-base font-bold text-slate-800">New Client Record</h2>
              <button
                onClick={() => setShowIntake(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <IntakeForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
