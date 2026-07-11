import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Mail, Shield, User, Loader2, Users, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { usePlan } from '../../hooks/usePlan';
import { TeamMember } from '../../types';

export default function TeamManagement() {
  const { office } = useAuth();
  const plan = usePlan();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchMembers(); }, [office?.id]);

  async function fetchMembers() {
    if (!office) return;
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('office_id', office.id)
      .neq('status', 'removed')
      .order('created_at');
    setMembers(data ?? []);
    setLoading(false);
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!office) return;
    if (!email.trim() || !fullName.trim()) { setError('Name and email are required.'); return; }

    setAdding(true);
    setError('');

    const { data, error: insertError } = await supabase
      .from('team_members')
      .insert({
        office_id: office.id,
        email: email.trim(),
        full_name: fullName.trim(),
        role: 'staff',
        status: 'invited',
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.code === '23505'
        ? 'This email has already been invited.'
        : insertError.message);
    } else if (data) {
      setMembers(prev => [...prev, data]);
      setEmail('');
      setFullName('');
    }
    setAdding(false);
  }

  async function removeMember(id: string) {
    if (!confirm('Remove this team member? They will lose access to the office.')) return;
    await supabase
      .from('team_members')
      .update({ status: 'removed' })
      .eq('id', id);
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  async function toggleRole(member: TeamMember) {
    const newRole = member.role === 'admin' ? 'staff' : 'admin';
    await supabase.from('team_members').update({ role: newRole }).eq('id', member.id);
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: newRole } : m));
  }

  // ── Free Trial and Basic: no team ──────────────────────────────────────
  if (!plan.hasTeam) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Lock size={24} className="text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-2">Team management is a Professional feature</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Upgrade to the Professional plan to add unlimited team members and collaborate across your office.
        </p>
        <div className="mt-4 px-4 py-2 rounded-lg bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-700">
          Professional: 45,000 RWF / month — Unlimited team members
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users size={16} className="text-[#003366]" /> Team Members
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {members.length} member{members.length !== 1 ? 's' : ''} · Unlimited seats on Professional plan
          </p>
        </div>
      </div>

      {/* Invite form */}
      <form onSubmit={inviteMember} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Invite New Member</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Full name"
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] placeholder-slate-400"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] placeholder-slate-400"
          />
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <button
          type="submit"
          disabled={!email.trim() || !fullName.trim() || adding}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#002244] text-white text-xs font-bold hover:bg-[#003366] transition-colors disabled:opacity-50 w-fit"
        >
          {adding ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
          {adding ? 'Sending invite...' : 'Send Invite'}
        </button>
      </form>

      {/* Member list */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
          <Users size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No team members yet</p>
          <p className="text-xs mt-1">Invite your first team member above</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map(member => (
            <div key={member.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-[#003366] flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">
                  {member.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800 truncate">{member.full_name}</p>
                  <button
                    onClick={() => toggleRole(member)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                      member.role === 'admin'
                        ? 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {member.role === 'admin' ? (
                      <span className="flex items-center gap-1"><Shield size={9} /> Admin</span>
                    ) : (
                      <span className="flex items-center gap-1"><User size={9} /> Staff</span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <Mail size={10} /> {member.email}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  member.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {member.status === 'active' ? 'Active' : 'Invited'}
                </span>
                <button
                  onClick={() => removeMember(member.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove member"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
