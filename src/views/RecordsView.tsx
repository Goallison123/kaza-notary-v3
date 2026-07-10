import { useState } from 'react';
import { X } from 'lucide-react';
import { ClientLog } from '../types';
import RecordsTable from '../features/records/RecordsTable';
import ClientDetailPanel from '../features/records/ClientDetailPanel';
import AnalyticsPanel from '../features/records/AnalyticsPanel';
import IntakeForm from '../features/intake/IntakeForm';

export default function RecordsView() {
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
        <AnalyticsPanel />
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
