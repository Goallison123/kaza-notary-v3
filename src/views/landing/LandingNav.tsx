import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import KazaLogo from '../../components/KazaLogo';

interface LandingNavProps {
  onEnterApp: () => void;
}

const links = ['Features', 'How it works', 'Pricing', 'FAQ'];

export default function LandingNav({ onEnterApp }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id.toLowerCase().replace(/\s+/g, '-'))?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <KazaLogo variant="static" size={44} />
          <span className={`font-extrabold text-lg tracking-tight transition-colors ${scrolled ? 'text-[#002244]' : 'text-white'}`}>
            Kaza
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className={`text-sm font-medium transition-colors hover:opacity-70 ${
                scrolled ? 'text-slate-600' : 'text-white/80'
              }`}
            >
              {link}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onEnterApp}
            className={`text-sm font-semibold transition-colors ${scrolled ? 'text-slate-700' : 'text-white/90'}`}
          >
            Sign in
          </button>
          <button
            onClick={onEnterApp}
            className="px-4 py-2 rounded-lg bg-[#002244] text-white text-sm font-semibold hover:bg-[#003366] transition-colors shadow-sm"
          >
            Start free trial
          </button>
        </div>

        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-slate-700' : 'text-white'}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 pb-4 flex flex-col gap-3">
          {links.map(link => (
            <button key={link} onClick={() => scrollTo(link)} className="text-sm font-medium text-slate-600 text-left py-1.5">
              {link}
            </button>
          ))}
          <button onClick={onEnterApp} className="w-full px-4 py-2.5 rounded-lg bg-[#002244] text-white text-sm font-semibold mt-2">
            Start free trial
          </button>
        </div>
      )}
    </header>
  );
}
