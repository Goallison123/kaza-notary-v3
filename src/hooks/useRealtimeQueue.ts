import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClientLog } from '../types';

export function useRealtimeQueue(officeId: string | null) {
  const [queue, setQueue] = useState<ClientLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchQueue() {
    if (!officeId) { setQueue([]); setLoading(false); return; }

    const { data, error: fetchError } = await supabase
      .from('client_logs')
      .select('*')
      .eq('office_id', officeId)
      .in('status', ['Pending', 'Filing Details', 'Ready', 'Skipped'])
      .order('created_at', { ascending: true });

    if (fetchError) setError(fetchError.message);
    else setQueue(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchQueue();
    if (!officeId) return;

    const channel = supabase
      .channel(`client_logs_queue_${officeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'client_logs',
        filter: `office_id=eq.${officeId}`,
      }, () => { fetchQueue(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [officeId]);

  return { queue, loading, error, refetch: fetchQueue };
}
