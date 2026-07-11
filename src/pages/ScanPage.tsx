import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckSquare, Upload, X, CheckCircle, AlertCircle, Pen,
  Shield, Lock, Clock, ChevronRight, BookOpen,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ScanFormData, ScanField } from '../types';
import DigitalTokenReceipt, { type TokenReceiptData } from '../components/DigitalTokenReceipt';

/* ─── Signature Canvas ─────────────────────────────────────────────────── */
function SignatureCanvas({ onSave }: { onSave: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasStrokes(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stop = useCallback(() => {
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasStrokes) onSave(canvas.toDataURL());
  }, [hasStrokes, onSave]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
    onSave('');
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden bg-white relative" style={{ height: 160 }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ height: 160 }}
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
        />
        {!hasStrokes && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Pen size={20} />
              <span className="text-xs">Draw your signature here</span>
            </div>
          </div>
        )}
      </div>
      {hasStrokes && (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle size={12} /> Signature captured
          </span>
          <button onClick={clear} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <X size={11} /> Clear &amp; redo
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── File Upload ─────────────────────────────────────────────────────────── */
function FileUploadField({ field, onFiles }: { field: ScanField; onFiles: (files: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const max = field.max_files || 5;

  const handleAdd = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles).slice(0, max - files.length);
    const updated = [...files, ...arr];
    setFiles(updated);
    onFiles(updated);
  };

  const remove = (i: number) => {
    const updated = files.filter((_, idx) => idx !== i);
    setFiles(updated);
    onFiles(updated);
  };

  const fmt = (bytes: number) => bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleAdd(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragging ? 'border-sky-400 bg-sky-50' : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
        }`}
      >
        <Upload size={22} className={`mx-auto mb-2 ${dragging ? 'text-sky-500' : 'text-slate-400'}`} />
        <p className="text-sm font-medium text-slate-600">Click to upload or drag &amp; drop</p>
        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG · Max {max} file{max !== 1 ? 's' : ''} · 10 MB each</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={field.accepted_types?.join(',') || 'image/*,application/pdf'}
        className="hidden"
        onChange={e => handleAdd(e.target.files)}
      />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase shrink-0">
                {f.name.split('.').pop()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{f.name}</p>
                <p className="text-xs text-slate-400">{fmt(f.size)}</p>
              </div>
              <button onClick={() => remove(i)} className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Dynamic Field Renderer ─────────────────────────────────────────────── */
function DynamicField({ field, value, onChange }: {
  field: ScanField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const base = 'w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/15 transition-all';

  switch (field.type) {
    case 'long_text':
      return <textarea value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder ?? ''} className={`${base} h-28 pt-3 pb-2 resize-none`} />;
    case 'date':
      return <input type="date" value={value as string || ''} onChange={e => onChange(e.target.value)} className={base} />;
    case 'number':
      return <input type="number" value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder ?? ''} className={base} />;
    case 'phone':
      return <input type="tel" value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || '+250 7XX XXX XXX'} className={base} />;
    case 'email':
      return <input type="email" value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder ?? ''} className={base} />;
    case 'national_id':
      return <input type="text" value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || '1 YYYY MM XXXXXXX X XX'} className={`${base} font-mono tracking-widest`} />;
    case 'dropdown':
      return (
        <select value={value as string || ''} onChange={e => onChange(e.target.value)} className={`${base} appearance-none`}>
          <option value="">Select an option...</option>
          {field.options?.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'radio':
      return (
        <div className="space-y-2.5 pt-1">
          {field.options?.map(o => (
            <label key={o.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${value === o.value ? 'border-[#003366] bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
              <input type="radio" name={field.id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="text-[#003366]" />
              <span className="text-sm text-slate-700 font-medium">{o.label}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-2.5 pt-1">
          {field.options?.map(o => {
            const checked = (value as string[] || []).includes(o.value);
            return (
              <label key={o.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'border-[#003366] bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                <input type="checkbox" value={o.value} checked={checked} onChange={e => {
                  const arr = (value as string[] || []);
                  onChange(e.target.checked ? [...arr, o.value] : arr.filter(v => v !== o.value));
                }} className="rounded text-[#003366]" />
                <span className="text-sm text-slate-700 font-medium">{o.label}</span>
              </label>
            );
          })}
        </div>
      );
    default:
      return <input type="text" value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder ?? ''} className={base} />;
  }
}

/* ─── Guard screens ───────────────────────────────────────────────────────── */
function GuardScreen({ icon, color, title, body }: { icon: React.ReactNode; color: string; title: string; body: string }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
          {icon}
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-slate-400">
          <BookOpen size={12} /> Kaza: Notary Digital Register
        </div>
      </div>
    </div>
  );
}

/* ─── Main Scan Page ─────────────────────────────────────────────────────── */
export default function ScanPage() {
  const { token } = useParams<{ token: string }>();
  const [formConfig, setFormConfig] = useState<ScanFormData | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [loadLoading, setLoadLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [receiptData, setReceiptData] = useState<TokenReceiptData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) { setLoadError('not_found'); setLoadLoading(false); return; }
    supabase.rpc('get_form_by_token', { p_token: token }).then(({ data, error }) => {
      if (error || !data) { setLoadError('not_found'); }
      else if (data.error) { setLoadError(data.error); setFormConfig(data as ScanFormData); }
      else { setFormConfig(data as ScanFormData); }
      setLoadLoading(false);
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConfig || !token) return;
    const newErrors: Record<string, string> = {};
    formConfig.fields.forEach(f => {
      if (f.required && f.type !== 'file_upload' && f.type !== 'signature' && !formData[f.id]) {
        newErrors[f.id] = `${f.label} is required`;
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstId = Object.keys(newErrors)[0];
      document.getElementById(`field-${firstId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    setSubmitting(true);

    const { data, error } = await supabase.rpc('submit_form_by_token', {
      p_token: token,
      p_form_data: formData,
      p_signature: signature || null,
    });

    if (error || !data?.success) {
      setErrors({ _form: data?.error === 'expired' ? 'This link has expired.' : 'Submission failed. Please try again.' });
      setSubmitting(false);
      return;
    }

    setReceiptData({
      queueNumber: data.queue_number ?? 0,
      clientName: data.client_name ?? formData.client_name ?? 'Client',
      serviceName: data.category_name ?? data.service_type ?? formData.category_name ?? 'General',
      officeName: data.office_name ?? formData.office_name ?? 'Kaza Office',
      submittedAt: data.submitted_at ?? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  /* Loading */
  if (loadLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#003366] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError === 'not_found') {
    return <GuardScreen icon={<AlertCircle size={30} className="text-red-500" />} color="bg-red-100" title="Link not found" body="This link is invalid or no longer exists. Please contact the office for assistance." />;
  }

  if (loadError === 'already_submitted') {
    return <GuardScreen icon={<CheckCircle size={30} className="text-emerald-600" />} color="bg-emerald-100" title="Already submitted" body="Your form was already received. The office will contact you if they need anything further." />;
  }

  if (loadError === 'expired') {
    const expDate = formConfig?.expires_at ? new Date(formConfig.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    return <GuardScreen icon={<Clock size={30} className="text-amber-600" />} color="bg-amber-100" title="Link expired" body={`This link expired on ${expDate}. Please contact the office for a new link.`} />;
  }

  if (!formConfig) return null;

  /* Success — Digital Token Receipt */
  if (submitted && receiptData) {
    return <DigitalTokenReceipt data={receiptData} />;
  }
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Submitted!</h1>
          <p className="text-slate-600">Your information has been securely received.</p>
        </div>
      </div>
    );
  }

  const daysLeft = formConfig.expires_at
    ? Math.max(0, Math.ceil((new Date(formConfig.expires_at).getTime() - Date.now()) / 86400000))
    : null;

  const completedFields = formConfig.fields.filter(f =>
    f.type === 'file_upload' || f.type === 'signature' ? true : !!formData[f.id]
  ).length;
  const progress = formConfig.fields.length > 0 ? Math.round((completedFields / formConfig.fields.length) * 100) : 0;

  /* Form */
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-[#002244] rounded-lg flex items-center justify-center">
              <CheckSquare size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 hidden sm:block">{formConfig.office_name}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="truncate">{formConfig.category_name}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#003366] to-sky-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {daysLeft !== null && (
            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <Clock size={11} /> {daysLeft}d left
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{formConfig.category_name}</h1>
          {formConfig.category_description && (
            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-3">{formConfig.category_description}</p>
          )}
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Please complete all required fields. Your information is encrypted and only accessible by{' '}
            <strong className="text-slate-700">{formConfig.office_name}</strong>.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              <Lock size={10} /> End-to-end encrypted
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Shield size={10} /> For {formConfig.office_name} only
            </span>
          </div>
        </div>

        {/* Dynamic fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {formConfig.fields.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              This form has no fields configured yet.
            </div>
          )}

          {formConfig.fields.map(field => (
            <div key={field.id} id={`field-${field.id}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.help_text && <p className="text-xs text-slate-400 mb-3 leading-relaxed">{field.help_text}</p>}

              {field.type === 'file_upload' ? (
                <FileUploadField field={field} onFiles={files => setFormData(p => ({ ...p, [field.id]: files.map(f => f.name) }))} />
              ) : field.type === 'signature' ? (
                <SignatureCanvas onSave={sig => { setSignature(sig); setFormData(p => ({ ...p, [field.id]: sig ? 'captured' : '' })); }} />
              ) : (
                <DynamicField field={field} value={formData[field.id]} onChange={v => {
                  setFormData(p => ({ ...p, [field.id]: v }));
                  if (errors[field.id]) setErrors(p => { const n = { ...p }; delete n[field.id]; return n; });
                }} />
              )}

              {errors[field.id] && (
                <div className="flex items-center gap-1.5 mt-2">
                  <AlertCircle size={12} className="text-red-500" />
                  <p className="text-xs text-red-500">{errors[field.id]}</p>
                </div>
              )}
            </div>
          ))}

          {/* Submit */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              By submitting, you confirm that all information is accurate and complete. This submission forms part of your official records at{' '}
              <strong>{formConfig.office_name}</strong>.
            </p>

            {errors._form && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{errors._form}</p>
              </div>
            )}

            {Object.keys(errors).filter(k => k !== '_form').length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">Please complete all required fields above.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 bg-[#002244] text-white font-bold py-3.5 rounded-xl hover:bg-[#003366] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting securely...</>
              ) : (
                <><CheckCircle size={16} /> Submit Form <ChevronRight size={14} /></>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-400 pb-6 flex items-center justify-center gap-1.5">
          <Shield size={10} /> Secured by <strong className="text-slate-500">Kaza</strong>
        </div>
      </div>
    </div>
  );
}
