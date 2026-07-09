import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Notification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { office } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function fetchNotifications(officeId: string) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('office_id', officeId)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data ?? []);
  }

  useEffect(() => {
    if (!office) { setNotifications([]); return; }

    fetchNotifications(office.id);

    const channel = supabase
      .channel(`notifications_${office.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `office_id=eq.${office.id}`,
      }, () => { fetchNotifications(office.id); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [office?.id]);

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    if (!office) return;
    await supabase.from('notifications').update({ read: true }).eq('office_id', office.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, deleteNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
