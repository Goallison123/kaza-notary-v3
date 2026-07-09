import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CategoryField, FieldOption, FieldType, ServiceCategory } from '../../types';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text',        label: 'Short text' },
  { value: 'long_text',   label: 'Long text' },
  { value: 'phone',       label: 'Phone number' },
  { value: 'email',       label: 'Email' },
  { value: 'date',        label: 'Date' },
  { value: 'number',      label: 'Number' },
  { value: 'national_id', label: 'National ID' },
  { value: 'dropdown',    label: 'Dropdown' },
  { value: 'radio',       label: 'Radio buttons' },
  { value: 'checkbox',    label: 'Checkboxes' },
  { value: 'file_upload', label: 'File upload' },
  { value: 'signature',   label: 'Signature' },
];

const HAS_OPTIONS: FieldType[] = ['dropdown', 'radio', 'checkbox'];

interface CategoryEditorProps {
  category: ServiceCategory;
  onBack: () => void;
}

interface FieldWithOptions extends CategoryField {
  options: FieldOption[];
}

export default function CategoryEditor({ category, onBack }: CategoryEditorProps) {
  const [fields, setFields] = useState<FieldWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<FieldType>('text');
  const [showAddField, setShowAddField] = useState(false);

  async function fetchFields() {
    const { data: fieldData } = await supabase
      .from('category_fields')
      .select('*')
      .eq('category_id', category.id)
      .order('field_order');
    if (!fieldData) { setLoading(false); return; }

    const { data: optData } = await supabase
      .from('field_options')
      .select('*')
      .in('field_id', fieldData.map(f => f.id))
      .order('option_order');

    setFields(fieldData.map(f => ({
      ...f,
      options: (optData ?? []).filter(o => o.field_id === f.id),
    })));
    setLoading(false);
  }

  useEffect(() => { fetchFields(); }, [category.id]);

  async function addField() {
    if (!newLabel.trim()) return;
    setAdding(true);
    const { data } = await supabase
      .from('category_fields')
      .insert({
        category_id: category.id,
        label: newLabel.trim(),
        type: newType,
        field_order: fields.length,
        required: false,
      })
      .select()
      .single();
    if (data) {
      const newField: FieldWithOptions = { ...data, options: [] };
      setFields(prev => [...prev, newField]);
      setExpanded(data.id);
      setNewLabel('');
      setNewType('text');
      setShowAddField(false);
    }
    setAdding(false);
  }

  async function updateField(id: string, changes: Partial<CategoryField>) {
    await supabase.from('category_fields').update(changes).eq('id', id);
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...changes } : f));
  }

  async function deleteField(id: string) {
    if (!confirm('Delete this field?')) return;
    await supabase.from('category_fields').delete().eq('id', id);
    setFields(prev => prev.filter(f => f.id !== id));
  }

  async function addOption(fieldId: string) {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    const order = field.options.length;
    const { data } = await supabase
      .from('field_options')
      .insert({ field_id: fieldId, label: `Option ${order + 1}`, value: `option_${order + 1}`, option_order: order })
      .select()
      .single();
    if (data) {
      setFields(prev => prev.map(f => f.id === fieldId ? { ...f, options: [...f.options, data] } : f));
    }
  }

  async function updateOption(fieldId: string, optId: string, label: string) {
    await supabase.from('field_options').update({ label, value: label.toLowerCase().replace(/\s+/g, '_') }).eq('id', optId);
    setFields(prev => prev.map(f => f.id === fieldId ? {
      ...f,
      options: f.options.map(o => o.id === optId ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, '_') } : o),
    } : f));
  }

  async function deleteOption(fieldId: string, optId: string) {
    await supabase.from('field_options').delete().eq('id', optId);
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, options: f.options.filter(o => o.id !== optId) } : f));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h3 className="text-base font-bold text-slate-800">{category.name} — Fields</h3>
          <p className="text-xs text-slate-400 mt-0.5">Define what clients fill out for this service</p>
        </div>
        <button
          onClick={() => setShowAddField(!showAddField)}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#002244] text-white text-xs font-semibold hover:bg-[#003366] transition-colors"
        >
          <Plus size={14} /> Add field
        </button>
      </div>

      {showAddField && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Field label</label>
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="e.g. Full Name"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Field type</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as FieldType)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-white"
              >
                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addField} disabled={!newLabel.trim() || adding} className="px-4 py-2 rounded-lg bg-[#002244] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#003366] transition-colors">
              {adding ? 'Adding...' : 'Add field'}
            </button>
            <button onClick={() => setShowAddField(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <div className="flex flex-col gap-2">{[1, 2].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>}

      {!loading && fields.length === 0 && (
        <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-medium">No fields yet</p>
          <p className="text-xs mt-1">Add fields so clients know what to fill out</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {fields.map((field, idx) => {
          const isOpen = expanded === field.id;
          return (
            <div key={field.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Field header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <GripVertical size={14} className="text-slate-300 shrink-0 cursor-grab" />
                <span className="text-xs font-bold text-slate-400 tabular-nums w-5">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{field.label}</p>
                  <p className="text-[10px] text-slate-400">{FIELD_TYPES.find(t => t.value === field.type)?.label}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {field.required && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Required</span>
                  )}
                  <button onClick={() => deleteField(field.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                  <button onClick={() => setExpanded(isOpen ? null : field.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Expanded editor */}
              {isOpen && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={e => updateField(field.id, { label: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type</label>
                      <select
                        value={field.type}
                        onChange={e => updateField(field.id, { type: e.target.value as FieldType })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-white"
                      >
                        {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Placeholder</label>
                      <input
                        type="text"
                        value={field.placeholder ?? ''}
                        onChange={e => updateField(field.id, { placeholder: e.target.value || null })}
                        placeholder="Hint shown in empty field"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Help text</label>
                      <input
                        type="text"
                        value={field.help_text ?? ''}
                        onChange={e => updateField(field.id, { help_text: e.target.value || null })}
                        placeholder="Shown below the field"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={e => updateField(field.id, { required: e.target.checked })}
                      className="rounded border-slate-300 text-[#003366]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Required field</span>
                  </label>

                  {HAS_OPTIONS.includes(field.type) && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-600">Options</label>
                        <button onClick={() => addOption(field.id)} className="flex items-center gap-1 text-xs text-[#003366] font-semibold hover:underline">
                          <Plus size={11} /> Add option
                        </button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {field.options.map(opt => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt.label}
                              onChange={e => updateOption(field.id, opt.id, e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                            />
                            <button onClick={() => deleteOption(field.id, opt.id)} className="p-1.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        {field.options.length === 0 && (
                          <p className="text-xs text-slate-400 italic">No options yet — add some above</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
