import React from 'react';
import { NAVBAR_CONTENT, FOOTER_CONTENT } from '../../constants/landingContent';

const LandingFooter: React.FC = () => {
  const scrollTo = (target: string) => {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer style={{ background: 'var(--col-brand-deep)', color: 'white' }}>
      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-4">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'white' }}>
                AyamSehat<span style={{ color: 'var(--col-brand-light)' }}>.AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed m-0 mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {FOOTER_CONTENT.description}
            </p>
            {/* Status badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(134,239,172,0.12)', border: '1px solid rgba(134,239,172,0.2)', color: 'var(--col-brand-light)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
              Sistem Aktif — Siap Digunakan
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 m-0" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}>
              Tautan Cepat
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {NAVBAR_CONTENT.menu.map(item => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollTo(item.target)}
                    className="text-sm border-none bg-transparent cursor-pointer text-left p-0 transition-all"
                    style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-sans)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--col-brand-light)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold mb-4 m-0" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}>
              Kontak &amp; Informasi
            </h4>
            <p className="text-sm leading-relaxed m-0 mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {FOOTER_CONTENT.university}
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: 'pi-facebook',  label: 'Facebook' },
                { icon: 'pi-instagram', label: 'Instagram' },
                { icon: 'pi-github',    label: 'GitHub' },
              ].map(s => (
                <button
                  key={s.icon}
                  title={s.label}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border-none cursor-pointer transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(134,239,172,0.15)'; e.currentTarget.style.color = 'var(--col-brand-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  <i className={`pi ${s.icon}`} style={{ fontSize: 15 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-6xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="m-0 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{FOOTER_CONTENT.copyright}</p>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
          <i className="pi pi-microchip" style={{ fontSize: 10, color: 'var(--col-brand-light)' }} />
          Vision Transformer · ViT-Base-Patch16
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
