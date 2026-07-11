import { useState } from 'react';
import { Settings, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import NotificationsDropdown from './NotificationsDropdown';
import KazaLogo from './KazaLogo';

interface TopbarProps {
  onLogoClick?: () => void;
  onSettings?: () => void;
}

export default function Topbar({ onLogoClick, onSettings }: TopbarProps) {
  const { user, office, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = office?.name
    ? office.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'KN';

  return (
    <header className="h-14 bg-[#002244] border-b border-white/10 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
      <button onClick={onLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <KazaLogo variant="static" size={40} />
        <div className="flex items-baseline gap-1.5">
          <span className="text-white font-bold text-base leading-none">Kaza</span>
          <span className="text-slate-300 font-normal text-sm hidden sm:block">: Notary Digital Register</span>
        </div>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={onSettings}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>

        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-1 ring-[#002244]" />
            )}
          </button>
          {showNotifs && <NotificationsDropdown onClose={() => setShowNotifs(false)} />}
        </div>

        {/* User menu */}
        <div className="relative ml-1">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-white/10 transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-[#003366] border border-white/30 flex items-center justify-center select-none">
              <span className="text-white text-[11px] font-bold">{initials}</span>
            </div>
            <span className="text-white/80 text-xs font-medium hidden sm:block max-w-[100px] truncate">
              {office?.name ?? user?.email ?? ''}
            </span>
            <ChevronDown size={13} className="text-white/50 hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{office?.name ?? 'My Office'}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      office?.account_status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      office?.account_status === 'Trial' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {office?.account_status ?? 'Trial'}
                    </span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      office?.plan_tier === 'Professional' ? 'bg-sky-100 text-sky-700' :
                      office?.plan_tier === 'Basic' ? 'bg-slate-100 text-slate-600' :
                      office?.plan_tier === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {office?.plan_tier ?? 'Free-Trial'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); onSettings?.(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <User size={14} /> Profile &amp; Settings
                </button>
                <div className="border-t border-slate-100">
                  <button
                    onClick={async () => { setShowUserMenu(false); await signOut(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
