import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Office } from '../types';

export function useSubscription(officeId: string | null) {
  const [office, setOffice] = useState<Office | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!officeId) return;
    supabase
      .from('offices')
      .select('*')
      .eq('id', officeId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOffice(data);
          setIsExpired(new Date(data.subscription_expires_at) < new Date());
        }
      });
  }, [officeId]);

  return { office, isExpired };
}
