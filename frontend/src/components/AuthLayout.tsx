import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  illustrationImage?: string;
  quote?: string;
  author?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  quote = "Kesehatan unggas Anda adalah prioritas utama. Deteksi dini dengan AI menyelamatkan aset peternakan Anda.",
  author = "AyamSehat.AI Vision"
}) => {
  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left Panel: Deep Forest ── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)' }}
      >
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow circles */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }} />
        <div className="absolute top-24 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #86efac 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <Link to="/" className="no-underline inline-flex items-center">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain shrink-0 -ml-1" />
            <span className="text-2xl text-white -ml-6" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              AyamSehat<span style={{ color: '#86efac' }}>.AI</span>
            </span>
          </Link>
        </div>

        {/* Quote card */}
        <div className="relative z-10">
          {/* Diagnostic readout box — signature element */}
          <div
            className="mb-8 rounded-2xl p-5 border"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-green-300">
                Sistem Aktif — Real-time Monitoring
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Akurasi', val: '98.5%' },
                { label: 'Penyakit', val: '4 Jenis' },
                { label: 'Model', val: 'ViT Base' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="diag-label text-green-400 mb-1">{s.label}</div>
                  <div
                    className="text-white text-xl"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  >
                    {s.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <p className="text-green-100 text-lg font-medium leading-relaxed mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            "{quote}"
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ background: 'rgba(134,239,172,0.2)' }}
            >
              <i className="pi pi-microchip text-green-300" style={{ fontSize: 14 }} />
            </div>
            <span className="text-green-300 text-sm font-semibold">{author}</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div
        className="w-full lg:w-[48%] flex flex-col justify-center items-center p-5 sm:p-12 relative"
        style={{ background: 'var(--col-surface)' }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-5 left-5">
          <Link to="/" className="no-underline inline-flex items-center">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
            <span className="-ml-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--col-ink)' }}>
              AyamSehat<span style={{ color: 'var(--col-brand)' }}>.AI</span>
            </span>
          </Link>
        </div>

        {/* Back link */}
        <Link
          to="/"
          className="absolute top-6 right-6 no-underline flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors"
          style={{ color: 'var(--col-ink-3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--col-ink)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--col-ink-3)')}
        >
          <i className="pi pi-arrow-left" style={{ fontSize: 10 }} />
          <span className="hidden xs:inline">Beranda</span>
        </Link>

        {/* Form container */}
        <div className="w-full max-w-md mt-12 lg:mt-0 animate-fade-up">
          {/* Header */}
          <div className="mb-6 px-1">
            <h1
              className="mb-1 leading-tight text-2xl sm:text-3xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--col-ink)', margin: 0 }}
            >
              {title}
            </h1>
            <p className="text-sm sm:text-base" style={{ color: 'var(--col-ink-3)', margin: '0.375rem 0 0', fontWeight: 500 }}>{subtitle}</p>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-6 sm:p-8"
            style={{ background: 'var(--col-card)', border: '1px solid var(--col-border)', boxShadow: 'var(--sh-md)' }}
          >
            {children}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
