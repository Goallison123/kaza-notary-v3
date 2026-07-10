import { useState } from 'react';
import {
  X, CheckCircle, Circle, AlertTriangle, XCircle,
  RefreshCw, FileText, Phone, Hash, Calendar,
  Shield, Pen, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ClientLog, ClientStatus } from '../../types';
import StatusBadge from './StatusBadge';

interface Props {
  client: ClientLog;
  onClose: () => void;
  onStatusChange: (id: string, status: ClientStatus) => void;
}

const timelineSteps: { label: string; status: ClientStatus }[] = [
  { label: 'Record Created',       status: 'Pending'              },
  { label: 'Filling Details',      status: 'Filing Details'       },
  { label: 'Pending Verification', status: 'Pending Verification' },
  { label: 'Validated & Ready',    status: 'Ready'                },
  { label: 'Signed & Recorded',    status: 'Signed & Recorded'    },
];

const statusOrder: ClientStatus[] = [
  'Pending', 'Filing Details', 'Pending Verification', 'Ready', 'Signed & Recorded',
];

function getStepIndex(status: ClientStatus): number {
  if (status === 'Rejected') return -1;
  return statusOrder.indexOf(status);
}

function formatDate(str: string | null) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-800 font-medium break-words">{value || '—'}</span>
    </div>
  );
}

export default function RecordDetailModal({ client, onClose, onStatusChange }: Props) {
  const [actioning, setActioning] = useState(false);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [pendingAction, setPendingAction] = useState<'validate' | 'request' | 'reject' | null>(null);
  const [expandFormData, setExpandFormData] = useState(true);

  async function applyAction(action: 'validate' | 'request' | 'reject') {
    setActioning(true);
    let newStatus: ClientStatus;
    if (action === 'validate') newStatus = 'Ready';
    else if (action === 'request') newStatus = 'Pending';
    else newStatus = 'Rejected';

    const { error } = await supabase
      .from('client_logs')
      .update({ status: newStatus })
      .eq('id', client.id);

    if (!error) {
      onStatusChange(client.id, newStatus);
    }
    setActioning(false);
    setPendingAction(null);
    setNote('');
    setShowNote(false);
  }

  const stepIndex = getStepIndex(client.status);
  const formEntries = client.form_data ? Object.entries(client.form_data) : [];
  const isRejected = client.status === 'Rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-[#003366] flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">
              {client.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">{client.full_name}</h2>
              <span className="font-mono text-xs text-slate-400">#{String(client.client_number).padStart(3, '0')}</span>
              <StatusBadge status={client.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{client.service_type ?? 'No service type'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Status timeline */}
          {!isRejected && (
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Progress</p>
              <div className="flex items-center gap-0">
                {timelineSteps.map((step, i) => {
                  const done = stepIndex >= i;
                  const current = stepIndex === i;
                  return (
                    <div key={step.label} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center gap-1 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                          done ? 'bg-[#003366] border-[#003366]' : 'bg-white border-slate-200'
                        } ${current ? 'ring-2 ring-[#003366]/30' : ''}`}>
                          {done
                            ? <CheckCircle size={14} className="text-white" />
                            : <Circle size={14} className="text-slate-300" />
                          }
                        </div>
                        <span className={`text-[9px] text-center leading-tight px-0.5 truncate w-full ${done ? 'text-[#003366] font-semibold' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div className={`flex-1 h-0.5 mb-5 mx-0.5 transition-all ${stepIndex > i ? 'bg-[#003366]' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isRejected && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <XCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 font-medium">This record has been rejected.</p>
            </div>
          )}

          {/* Core info */}
          <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-2 gap-x-6 gap-y-3">
            <FieldRow label="Phone" value={
              <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" />{client.phone_number}</span>
            } />
            <FieldRow label="National ID" value={
              <span className="flex items-center gap-1"><Hash size={11} className="text-slate-400" />{client.national_id ?? '—'}</span>
            } />
            <FieldRow label="Created" value={
              <span className="flex items-center gap-1"><Calendar size={11} className="text-slate-400" />{formatDate(client.created_at)}</span>
            } />
            <FieldRow label="Submitted" value={
              <span className="flex items-center gap-1"><Calendar size={11} className="text-slate-400" />{formatDate(client.submitted_at)}</span>
            } />
            {client.residential_address && (
              <div className="col-span-2">
                <FieldRow label="Address" value={client.residential_address} />
              </div>
            )}
          </div>

          {/* Form data submitted by client */}
          {formEntries.length > 0 && (
            <div className="px-6 py-4 border-b border-slate-100">
              <button
                onClick={() => setExpandFormData(v => !v)}
                className="flex items-center gap-2 w-full text-left mb-3 group"
              >
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex-1">
                  Client-Submitted Form Data
                  <span className="ml-2 text-[#003366] font-semibold normal-case">({formEntries.length} field{formEntries.length !== 1 ? 's' : ''})</span>
                </p>
                {expandFormData ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {expandFormData && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {formEntries.map(([key, val]) => {
                    const display = Array.isArray(val)
                      ? (val as string[]).join(', ')
                      : String(val ?? '—');
                    return (
                      <div key={key} className={display.length > 60 ? 'col-span-2' : ''}>
                        <FieldRow label={key.replace(/_/g, ' ')} value={display} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {formEntries.length === 0 && (
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Client-Submitted Form Data</p>
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">No form data submitted yet. The client hasn't filled in the form.</p>
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Pen size={11} /> Client Signature
            </p>
            {client.signature_base64 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-2 inline-block">
                <img
                  src={client.signature_base64}
                  alt="Client signature"
                  className="h-16 object-contain"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No signature captured</p>
            )}
          </div>

          {/* Confirmation note (shown when action is pending) */}
          {showNote && pendingAction && (
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                {pendingAction === 'validate' && 'Confirm validation — this marks the record as Ready.'}
                {pendingAction === 'request' && 'Request fresh input — status returns to Pending so the client can re-submit.'}
                {pendingAction === 'reject' && 'Confirm rejection — this record will be marked as Rejected.'}
              </p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional note (visible to team only)..."
                rows={2}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] resize-none placeholder-slate-400"
              />
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => applyAction(pendingAction)}
                  disabled={actioning}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 ${
                    pendingAction === 'validate' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    pendingAction === 'request'  ? 'bg-amber-500 hover:bg-amber-600' :
                                                   'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actioning && <Loader2 size={13} className="animate-spin" />}
                  Confirm
                </button>
                <button
                  onClick={() => { setShowNote(false); setPendingAction(null); setNote(''); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-auto">
            <Shield size={11} /> Record secured by Kaza
          </div>

          {!isRejected && (
            <>
              <button
                onClick={() => { setPendingAction('reject'); setShowNote(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <XCircle size={13} /> Reject
              </button>

              <button
                onClick={() => { setPendingAction('request'); setShowNote(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <RefreshCw size={13} /> Request Fresh Input
              </button>

              <button
                onClick={() => { setPendingAction('validate'); setShowNote(true); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <CheckCircle size={13} /> Validate
              </button>
            </>
          )}

          {isRejected && (
            <button
              onClick={() => { setPendingAction('request'); setShowNote(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <RefreshCw size={13} /> Re-open Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
