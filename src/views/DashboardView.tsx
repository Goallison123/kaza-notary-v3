import { useEffect, useState } from 'react';
import { Users, FileCheck, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import IntakeForm from '../features/intake/IntakeForm';
import QueueMonitor from '../features/queue/QueueMonitor';
import StatCard from '../components/StatCard';

interface DashboardStats {
  todayTotal: number;
  inQueue: number;
  avgWait: number;
  weekTotal: number;
}

export default function DashboardView() {
  const { office } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ todayTotal: 0, inQueue: 0, avgWait: 0, weekTotal: 0 });

  useEffect(() => {
    if (!office) return;

    async function fetchStats() {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();

      const [todayRes, queueRes, weekRes] = await Promise.all([
        supabase
          .from('client_logs')
          .select('id', { count: 'exact', head: true })
          .eq('office_id', office!.id)
          .gte('created_at', todayStart),
        supabase
          .from('client_logs')
          .select('id', { count: 'exact', head: true })
          .eq('office_id', office!.id)
          .in('status', ['Pending', 'Filing Details', 'Ready']),
        supabase
          .from('client_logs')
          .select('id', { count: 'exact', head: true })
          .eq('office_id', office!.id)
          .gte('created_at', weekStart),
      ]);

      setStats({
        todayTotal: todayRes.count ?? 0,
        inQueue: queueRes.count ?? 0,
        avgWait: 8,
        weekTotal: weekRes.count ?? 0,
      });
    }

    fetchStats();
  }, [office?.id]);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Today" value={stats.todayTotal} sub="Documents created" accent="bg-[#003366]" icon={<FileCheck size={16} />} />
        <StatCard label="In Queue" value={stats.inQueue} sub="Active clients" accent="bg-emerald-600" icon={<Users size={16} />} />
        <StatCard label="Avg. Wait" value={`${stats.avgWait} min`} sub="This morning" accent="bg-sky-600" icon={<Clock size={16} />} />
        <StatCard label="This Week" value={stats.weekTotal} sub="Total requests" accent="bg-amber-600" icon={<TrendingUp size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="flex flex-col gap-0">
          <div className="mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Intake Engine</span>
          </div>
          <IntakeForm />
        </div>
        <div className="flex flex-col gap-0">
          <div className="mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Queue Monitor</span>
          </div>
          <QueueMonitor />
        </div>
      </div>
    </div>
  );
}
