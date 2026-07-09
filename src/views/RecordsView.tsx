import { useState } from 'react';
import { ClientLog } from '../types';
import RecordsTable from '../features/records/RecordsTable';
import ClientDetailPanel from '../features/records/ClientDetailPanel';
import AnalyticsPanel from '../features/records/AnalyticsPanel';

export default function RecordsView() {
  const [selectedClient, setSelectedClient] = useState<ClientLog | null>(null);

  return (
    <div className="flex flex-col gap-5 p-6 overflow-y-auto h-full">
      {/* Main Table + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        <RecordsTable
          selectedId={selectedClient?.id ?? null}
          onSelect={setSelectedClient}
        />
        <ClientDetailPanel client={selectedClient} />
      </div>

      {/* Analytics Panel */}
      <AnalyticsPanel />
    </div>
  );
}
