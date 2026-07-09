import { useState, useEffect } from 'react';
import { QrCode, ExternalLink, ScanLine, AlertTriangle } from 'lucide-react';
import QRCode from 'qrcode';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceCategory } from '../../types';
import InputField from '../../components/InputField';
import Button from '../../components/Button';

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => chars[b % chars.length]).join('');
  return `tok_${rand}`;
}

export default function IntakeForm() {
  const { office } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+250 ');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [scanUrl, setScanUrl] = useState('');

  useEffect(() => {
    if (!office) return;
    supabase
      .from('service_categories')
      .select('*')
      .eq('office_id', office.id)
      .eq('is_active', true)
      .order('created_at')
      .then(({ data }) => {
        setCategories(data ?? []);
        setLoadingCats(false);
      });
  }, [office?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) { setError('Client name is required.'); return; }
    if (!phone.trim() || phone === '+250 ') { setError('Phone number is required.'); return; }
    if (!office) { setError('Office not found. Please sign in again.'); return; }
    setError('');
    setLoading(true);

    const tok = generateToken();
    const selectedCat = categories.find(c => c.id === categoryId);

    const { error: dbError } = await supabase.from('client_logs').insert({
      office_id: office.id,
      token: tok,
      full_name: fullName.trim(),
      phone_number: phone.trim(),
      service_type: selectedCat?.name ?? null,
      category_id: categoryId || null,
      status: 'Pending',
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    const url = `${window.location.origin}/scan/${tok}`;
    setScanUrl(url);
    setToken(tok);
    const dataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: { dark: '#002244', light: '#ffffff' },
    });
    setQrDataUrl(dataUrl);
    setLoading(false);
  }

  function handleReset() {
    setFullName('');
    setPhone('+250 ');
    setCategoryId('');
    setToken(null);
    setQrDataUrl(null);
    setScanUrl('');
    setError('');
  }

  const noCategories = !loadingCats && categories.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <QrCode size={18} className="text-[#003366]" />
          <h2 className="text-base font-bold text-slate-800">Quick Client Intake</h2>
        </div>

        {noCategories && (
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-4">
            <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-700">
              <strong className="block">No service categories yet.</strong>
              Go to Settings → Form Builder to create your first category.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Client Names"
            placeholder="Jean Pierre Habimana"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
          <InputField
            label="Phone Number"
            placeholder="+250 78 000 0000"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Service Type
            </label>
            {loadingCats ? (
              <div className="h-11 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-colors"
                disabled={noCategories}
              >
                <option value="">{noCategories ? 'No categories yet' : 'Select service...'}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-1 justify-center font-semibold"
            disabled={noCategories}
          >
            Generate Secure QR Code &amp; Link
          </Button>

          {token && (
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="w-full justify-center text-slate-500">
              Clear &amp; New Client
            </Button>
          )}
        </form>
      </div>

      {token && qrDataUrl && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-700">
              Scan to Sign — Token: <span className="font-mono text-[#003366]">{token}</span>
            </p>
            <button
              className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => window.open(scanUrl, '_blank')}
              title="Open link"
            >
              <ExternalLink size={14} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
              <ScanLine size={28} className="text-slate-400" />
            </div>
            <img src={qrDataUrl} alt={`QR code for token ${token}`} className="w-[140px] h-[140px] rounded-lg border border-slate-200 shadow-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
