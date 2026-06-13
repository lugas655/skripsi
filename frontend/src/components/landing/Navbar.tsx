import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NAVBAR_CONTENT } from '../../constants/landingContent';

const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (target: string) => {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--col-border)' : '1px solid transparent',
        boxShadow: scrolled ? 'var(--sh-sm)' : 'none',
        padding: scrolled ? '0.75rem 0' : '1.25rem 0',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
        {/* Left side: Mobile Toggle + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile toggle */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border-none cursor-pointer transition-all"
            style={{ background: menuOpen ? 'var(--col-brand-pale)' : 'transparent', color: 'var(--col-ink)' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className={`pi ${menuOpen ? 'pi-times' : 'pi-bars'}`} style={{ fontSize: 16 }} />
          </button>

          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
            <span className="-ml-3 md:-ml-5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--col-ink)' }}>
              AyamSehat<span style={{ color: 'var(--col-brand)' }}>.AI</span>
            </span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {NAVBAR_CONTENT.menu.map(item => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.target)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border-none bg-transparent cursor-pointer transition-all"
              style={{ color: 'var(--col-ink-3)', fontFamily: 'var(--font-sans)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--col-brand)'; e.currentTarget.style.background = 'var(--col-brand-pale)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--col-ink-3)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl text-sm font-semibold border-none bg-transparent cursor-pointer transition-all"
            style={{ color: 'var(--col-ink-2)', fontFamily: 'var(--font-display)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--col-surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Masuk
          </button>
          <button
            onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--col-brand)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(21,128,61,0.35)', fontFamily: 'var(--font-display)' }}
          >
            {isLoggedIn ? 'Dashboard' : 'Mulai Gratis'}
            <i className="pi pi-arrow-right" style={{ fontSize: 11 }} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 flex flex-col py-4 px-5 gap-1"
          style={{ background: 'white', borderTop: '1px solid var(--col-border)', boxShadow: 'var(--sh-lg)' }}
        >
          {NAVBAR_CONTENT.menu.map(item => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.target)}
              className="text-left px-4 py-3 rounded-xl text-sm font-semibold border-none bg-transparent cursor-pointer"
              style={{ color: 'var(--col-ink-2)', fontFamily: 'var(--font-sans)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--col-brand-pale)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {item.label}
            </button>
          ))}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3" style={{ borderTop: '1px solid var(--col-border)' }}>
            <button onClick={() => navigate('/login')}
              className="py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
              style={{ background: 'var(--col-surface)', border: '1px solid var(--col-border)', color: 'var(--col-ink-2)', fontFamily: 'var(--font-display)' }}>
              Masuk
            </button>
            <button onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')}
              className="py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
              style={{ background: 'var(--col-brand)', border: 'none', fontFamily: 'var(--font-display)' }}>
              {isLoggedIn ? 'Dashboard' : 'Daftar'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
