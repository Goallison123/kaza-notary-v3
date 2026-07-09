import { useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationsContext';
import { Notification, NotificationType } from '../types';

interface NotificationsDropdownProps {
  onClose: () => void;
}

const typeStyles: Record<NotificationType, { dot: string; bg: string }> = {
  success: { dot: 'bg-emerald-500', bg: 'bg-emerald-50' },
  info:    { dot: 'bg-sky-500',     bg: 'bg-sky-50'     },
  warning: { dot: 'bg-amber-500',   bg: 'bg-amber-50'   },
  error:   { dot: 'bg-red-500',     bg: 'bg-red-50'     },
};

function timeAgo(str: string) {
  const diff = Date.now() - new Date(str).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function NotifRow({ n, onRead, onDelete }: { n: Notification; onRead: () => void; onDelete: () => void }) {
  const s = typeStyles[n.type] ?? typeStyles.info;
  return (
    <div
      className={`group flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? s.bg : ''}`}
      onClick={onRead}
    >
      <div className="mt-1.5 shrink-0">
        <span className={`block w-2 h-2 rounded-full ${n.read ? 'bg-slate-300' : s.dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${n.read ? 'text-slate-500' : 'text-slate-800'} leading-snug`}>{n.title}</p>
        {n.body && <p className="text-xs text-slate-400 mt-0.5 leading-snug truncate">{n.body}</p>}
        <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="shrink-0 p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all self-start mt-0.5"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-slate-600" />
          <span className="text-sm font-bold text-slate-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#003366] hover:underline font-medium">
            <CheckCheck size={12} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400">
            <Bell size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <NotifRow
              key={n.id}
              n={n}
              onRead={() => markRead(n.id)}
              onDelete={() => deleteNotification(n.id)}
            />
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100">
          <button
            onClick={() => { notifications.forEach(n => deleteNotification(n.id)); }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={11} /> Clear all
          </button>
        </div>
      )}
    </div>
  );
}
