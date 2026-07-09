import { LayoutDashboard, FileText, Settings } from 'lucide-react';

type AppView = 'dashboard' | 'records' | 'settings';

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'records',   label: 'Records',   icon: <FileText size={20} /> },
  { id: 'settings',  label: 'Settings',  icon: <Settings size={20} /> },
];

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-[72px] lg:w-[180px] bg-[#002244] flex flex-col pt-4 pb-8 shrink-0 transition-all duration-300">
      <nav className="flex flex-col gap-1 px-2 mt-2">
        {navItems.map(({ id, label, icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left transition-all duration-150
                ${isActive
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-400 hover:bg-white/8 hover:text-slate-200'
                }
              `}
            >
              <span className="shrink-0">{icon}</span>
              <span className="hidden lg:block text-sm tracking-wide">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
