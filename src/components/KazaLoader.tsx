import KazaLogo from './KazaLogo';

interface KazaLoaderProps {
  /** "full" = initial app load overlay; "inline" = a smaller centered spinner */
  mode?: 'full' | 'inline';
  label?: string;
}

export default function KazaLoader({ mode = 'full', label }: KazaLoaderProps) {
  if (mode === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <KazaLogo variant="animated" size={120} />
        {label && <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase animate-pulse">{label}</p>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col items-center justify-center gap-6">
      {/* Animated logo */}
      <KazaLogo variant="animated" size={220} wordmark />

      {/* Loading bar */}
      <div className="w-48 h-0.5 bg-slate-200 rounded-full overflow-hidden mt-2">
        <div
          className="h-full bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#06B6D4] rounded-full"
          style={{
            animation: 'kazaBar 2s ease-in-out infinite',
          }}
        />
      </div>

      {label && (
        <p className="text-[11px] font-semibold text-slate-400 tracking-[0.2em] uppercase animate-pulse">
          {label}
        </p>
      )}

      <style>{`
        @keyframes kazaBar {
          0%   { width: 0%;   margin-left: 0%; }
          50%  { width: 60%;  margin-left: 20%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
