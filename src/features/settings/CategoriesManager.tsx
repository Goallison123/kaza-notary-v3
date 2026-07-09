import { useState, useEffect } from 'react';
import { Plus, ChevronRight, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ServiceCategory } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface CategoriesManagerProps {
  onEdit: (cat: ServiceCategory) => void;
}

export default function CategoriesManager({ onEdit }: CategoriesManagerProps) {
  const { office } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function fetch() {
    if (!office) return;
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .eq('office_id', office.id)
      .order('created_at');
    setCategories(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, [office?.id]);

  async function addCategory() {
    if (!newName.trim() || !office) return;
    setAdding(true);
    const { data } = await supabase
      .from('service_categories')
      .insert({ office_id: office.id, name: newName.trim(), description: newDesc.trim() || null })
      .select()
      .single();
    if (data) {
      setCategories(prev => [...prev, data]);
      setNewName('');
      setNewDesc('');
      setShowForm(false);
    }
    setAdding(false);
  }

  async function toggleActive(cat: ServiceCategory) {
    await supabase.from('service_categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category and all its fields? This cannot be undone.')) return;
    await supabase.from('service_categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Service Categories</h3>
          <p className="text-xs text-slate-500 mt-0.5">Create categories and define the fields clients fill out per service.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#002244] text-white text-xs font-semibold hover:bg-[#003366] transition-colors"
        >
          <Plus size={14} /> New category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Category name (e.g. Land Transfer)"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] placeholder-slate-400"
          />
          <textarea
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Optional description shown to clients"
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] placeholder-slate-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={addCategory}
              disabled={!newName.trim() || adding}
              className="px-4 py-2 rounded-lg bg-[#002244] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#003366] transition-colors"
            >
              {adding ? 'Creating...' : 'Create category'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-medium">No categories yet</p>
          <p className="text-xs mt-1">Create your first service category above</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {categories.map(cat => (
          <div key={cat.id} className={`bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3 group ${cat.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-800 truncate">{cat.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {cat.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {cat.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{cat.description}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleActive(cat)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title={cat.is_active ? 'Deactivate' : 'Activate'}>
                {cat.is_active ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
              </button>
              <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => onEdit(cat)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#002244] hover:text-white text-xs font-semibold text-slate-600 transition-all"
              >
                <Pencil size={12} /> Fields <ChevronRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
