import { ExternalLink, FileText, Eye, Printer, Download, CheckCircle, Circle } from 'lucide-react';
import { ClientLog } from '../../types';
import StatusBadge from './StatusBadge';

interface ClientDetailPanelProps {
  client: ClientLog | null;
}

const timelineSteps = [
  'Data Entered',
  'QR Generated',
  'Verification Passed',
  'Signed by Notary',
  'Government Recorded',
];

const documentFiles = [
  { name: 'Sale Agreement', type: 'pdf' },
  { name: 'Identification', type: 'pdf' },
  { name: 'Identification', type: 'pdf' },
];

function getCompletedSteps(status: string): number {
  if (status === 'Pending') return 1;
  if (status === 'Filing Details') return 2;
  if (status === 'Ready') return 3;
  if (status === 'Archived') return 5;
  return 1;
}

export default function ClientDetailPanel({ client }: ClientDetailPanelProps) {
  if (!client) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px] text-slate-400">
        <FileText size={36} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">Select a record to view details</p>
      </div>
    );
  }

  const completedSteps = getCompletedSteps(client.status);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      {/* Client Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-[#003366] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">
            {client.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-slate-800 text-sm truncate">{client.full_name}</p>
            <button className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
              <ExternalLink size={12} />
            </button>
          </div>
          <p className="text-xs text-slate-500">{client.phone_number}</p>
        </div>
        <StatusBadge status={client.status} />
      </div>

      {/* Document Timeline + Verified Fields */}
      <div className="p-4 border-b border-slate-100 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold text-slate-700 mb-2.5">Document Timeline</p>
          <div className="flex flex-col gap-2">
            {timelineSteps.map((step, i) => {
              const done = i < completedSteps;
              return (
                <div key={step} className="flex items-center gap-2">
                  {done
                    ? <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                    : <Circle size={12} className="text-slate-300 shrink-0" />
                  }
                  <span className={`text-xs ${done ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-700 mb-2.5">Verified Data Fields</p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Verified fields', value: 'National ID', done: completedSteps >= 3 },
              { label: 'Document fields', value: client.service_type ?? 'N/A', done: completedSteps >= 2 },
              { label: 'Client', value: client.full_name.split(' ')[0], done: completedSteps >= 1 },
              { label: 'Gov Recorded', value: completedSteps >= 5 ? 'Yes' : 'No', done: completedSteps >= 5 },
            ].map(({ label, value, done }) => (
              <div key={label} className="flex items-start gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${done ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                <div>
                  <p className="text-[10px] text-slate-500 leading-none">{label}</p>
                  <p className="text-xs font-medium text-slate-700">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Digital Signatures */}
      <div className="p-4 border-b border-slate-100">
        <p className="text-xs font-bold text-slate-700 mb-3">Digital Signatures &amp; Metadata</p>
        <div className="grid grid-cols-2 gap-3">
          {['Notary Signature', 'Client Signature'].map((sig) => (
            <div key={sig} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <div className="h-8 flex items-center justify-center mb-2">
                <span className="font-['Georgia',serif] text-slate-600 italic text-sm">
                  {sig === 'Notary Signature' ? 'Digital Signatures' : 'Client Sign'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">{sig}</p>
              <p className="text-[9px] text-slate-400 leading-relaxed mt-0.5">
                Blockchain transaction ID or verification hash
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Document Files */}
      <div className="p-4">
        <p className="text-xs font-bold text-slate-700 mb-3">Document Files</p>
        <div className="flex flex-col gap-2">
          {documentFiles.map(({ name }, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <div className="w-5 h-5 rounded bg-red-100 flex items-center justify-center shrink-0">
                <FileText size={11} className="text-red-500" />
              </div>
              <span className="text-xs text-slate-700 font-medium flex-1">{name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <Eye size={11} />
                </button>
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <Printer size={11} />
                </button>
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <Download size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
