import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Section {
  id: string;
  title: string;
  icon: string;
  shortTitle: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  { id: 'penerimaan', title: '1. Penerimaan ketentuan', icon: 'pi-check-circle', shortTitle: 'Penerimaan' },
  { id: 'layanan', title: '2. Layanan deteksi AI & disclaimer', icon: 'pi-microchip', shortTitle: 'Layanan AI' },
  { id: 'tanggung-jawab', title: '3. Tanggung jawab pengguna', icon: 'pi-user', shortTitle: 'Tanggung jawab' },
  { id: 'batasan', title: '4. Batasan penggunaan', icon: 'pi-ban', shortTitle: 'Batasan' },
  { id: 'kontak', title: '5. Kontak legal', icon: 'pi-envelope', shortTitle: 'Kontak legal' },
];

const RESPONSIBILITIES = [
  'Menjamin keakuratan data profil dan legalitas akun yang didaftarkan.',
  'Menjaga kerahasiaan kredensial akses (username & password) agar tidak disalahgunakan pihak lain.',
  'Mengunggah citra yang asli, jelas, dan diambil dari unit ternak milik sendiri atau di bawah manajemen legal pengguna.',
  'Tidak menggunakan platform untuk tujuan penipuan atau klaim asuransi ternak yang tidak sah.',
];

const RESTRICTIONS = [
  'Melakukan scraping atau pengambilan data massal secara otomatis.',
  'Melakukan reverse engineering pada model AI atau sistem API.',
  'Mengunggah konten berbahaya, virus, atau malware ke platform.',
  'Menjual kembali akses layanan tanpa izin tertulis dari manajemen.',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHead: React.FC<{ icon: string; title: string; color?: string }> = ({
  icon, title, color = 'text-blue-500',
}) => (
  <div className="flex items-center gap-2.5 mb-3">
    <i className={`pi ${icon} ${color}`} style={{ fontSize: 15 }} />
    <h2 className="m-0 text-[15px] font-semibold text-slate-800">{title}</h2>
  </div>
);

const ContentCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    {children}
  </div>
);

const InfoBox: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
      {label}
    </span>
    <p className="m-0 text-[13px] leading-relaxed text-slate-600">{children}</p>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const TermsPage: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('penerimaan');

  useEffect(() => {
    const handleScroll = () => {
      const offsets = SECTIONS.map(s => {
        const el = document.getElementById(s.id);
        return { id: s.id, top: el ? el.getBoundingClientRect().top : Infinity };
      });
      const visible = offsets.filter(o => o.top <= 160);
      if (visible.length > 0) setActiveId(visible[visible.length - 1].id);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      <Navbar />

      {/* ── Header ── */}
      <div className="border-b border-slate-200 bg-white" style={{ paddingTop: '7rem', paddingBottom: '1.75rem' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-3"
            style={{ background: '#eff6ff', color: '#1d4ed8', border: '0.5px solid #bfdbfe' }}
          >
            <i className="pi pi-shield" style={{ fontSize: 10 }} />
            Legalitas &amp; kebijakan
          </div>

          <h1
            className="text-4xl md:text-5xl font-black mb-3"
            style={{ color: '#0f172a', letterSpacing: '-0.03em' }}
          >
            Syarat &amp; <span className="text-blue-600">ketentuan</span>
          </h1>

          <div className="flex flex-wrap items-center gap-4">
            {[
              { icon: 'pi-calendar', text: 'Diperbarui 13 Juni 2026' },
              { icon: 'pi-clock', text: 'Waktu baca 5 menit' },
              { icon: 'pi-file', text: 'Versi 2.1' },
            ].map((m, i) => (
              <React.Fragment key={m.text}>
                {i > 0 && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#cbd5e1", display: "inline-block", flexShrink: 0 }} className="hidden md:block" />}
                <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
                  <i className={`pi ${m.icon}`} style={{ fontSize: 12 }} />
                  {m.text}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-6 py-7 flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-52 flex-shrink-0 hidden lg:block">
            <div className="sticky top-28">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">
                Navigasi pasal
              </p>
              <nav className="flex flex-col gap-0.5" aria-label="Navigasi pasal">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={[
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium border-none cursor-pointer text-left w-full transition-all duration-150',
                      activeId === s.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                    ].join(' ')}
                  >
                    <i className={`pi ${s.icon}`} style={{ fontSize: 13, width: 14 }} />
                    {s.shortTitle}
                  </button>
                ))}
              </nav>
              <div className="mt-5 pt-5 border-t border-slate-200">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-semibold no-underline hover:bg-blue-700 transition-colors"
                >
                  Mulai gunakan AI
                  <i className="pi pi-arrow-right" style={{ fontSize: 11 }} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* 1. Penerimaan */}
            <section id="penerimaan" className="scroll-mt-32">
              <SectionHead icon="pi-check-circle" title="1. Penerimaan ketentuan" />
              <ContentCard>
                <p className="m-0 text-[13px] leading-relaxed text-slate-600">
                  AyamSehat.AI adalah layanan analisis kesehatan unggas berbasis kecerdasan buatan. Dengan mendaftar, mengakses, atau menggunakan platform ini, Anda menyatakan telah membaca, memahami, dan setuju terikat oleh syarat dan ketentuan ini.
                </p>
                <p className="m-0 mt-3 text-[13px] leading-relaxed text-slate-600">
                  Jika Anda menggunakan platform atas nama entitas bisnis atau peternakan, Anda menyatakan memiliki otoritas legal untuk mengikat entitas tersebut pada ketentuan ini.
                </p>
              </ContentCard>
            </section>

            <div className="h-px bg-slate-100" />

            {/* 2. Layanan AI */}
            <section id="layanan" className="scroll-mt-32">
              <SectionHead icon="pi-microchip" title="2. Layanan deteksi AI & disclaimer" />
              <ContentCard>
                <p className="m-0 text-[13px] leading-relaxed text-slate-600">
                  AyamSehat.AI menyediakan alat bantu deteksi berbasis Vision Transformer (ViT). Anda memahami sepenuhnya bahwa:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <InfoBox label="Sifat analisis">
                    Hasil analisis AI bersifat <strong>informatif dan prediktif</strong>, bukan diagnosis medis veteriner yang final.
                  </InfoBox>
                  <InfoBox label="Rekomendasi ahli">
                    Sangat disarankan konsultasi dengan <strong>dokter hewan profesional</strong> sebelum tindakan medis berat.
                  </InfoBox>
                </div>
                <div
                  className="flex items-start gap-3 rounded-lg p-3.5 mt-3"
                  style={{ background: '#fffbeb', border: '0.5px solid #fde68a' }}
                >
                  <i className="pi pi-exclamation-triangle flex-shrink-0 mt-0.5" style={{ fontSize: 13, color: '#b45309' }} />
                  <p className="m-0 text-[13px] leading-relaxed" style={{ color: '#92400e' }}>
                    Platform tidak bertanggung jawab atas kerugian finansial, kematian ternak, atau kerusakan aset akibat pengambilan keputusan sepihak berdasarkan prediksi sistem.
                  </p>
                </div>
              </ContentCard>
            </section>

            <div className="h-px bg-slate-100" />

            {/* 3. Tanggung jawab */}
            <section id="tanggung-jawab" className="scroll-mt-32">
              <SectionHead icon="pi-user" title="3. Tanggung jawab pengguna" color="text-purple-500" />
              <ContentCard>
                <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
                  {RESPONSIBILITIES.map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 mt-0.5"
                        style={{
                          width: 22,
                          height: 22,
                          minWidth: 22,
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          border: '0.5px solid #e2e8f0',
                          color: '#64748b',
                          fontSize: 11,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="m-0 text-[13px] leading-relaxed text-slate-600">{text}</p>
                    </li>
                  ))}
                </ul>
              </ContentCard>
            </section>

            <div className="h-px bg-slate-100" />

            {/* 4. Batasan */}
            <section id="batasan" className="scroll-mt-32">
              <SectionHead icon="pi-ban" title="4. Batasan penggunaan" color="text-red-500" />
              <ContentCard>
                <p className="m-0 mb-3 text-[13px] text-slate-600">Anda secara tegas dilarang untuk:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {RESTRICTIONS.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-red-100 transition-colors"
                    >
                      <i className="pi pi-times-circle text-red-400 flex-shrink-0 mt-0.5" style={{ fontSize: 13 }} />
                      <p className="m-0 text-[13px] leading-relaxed text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </ContentCard>
            </section>

            <div className="h-px bg-slate-100" />

            {/* 5. Kontak */}
            <section id="kontak" className="scroll-mt-32">
              <SectionHead icon="pi-envelope" title="5. Kontak legal" />
              <div
                className="rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                style={{ background: '#f8fafc', border: '0.5px solid #e2e8f0' }}
              >
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-800 mb-1.5">
                    Butuh klarifikasi legal?
                  </h3>
                  <p className="m-0 text-[13px] text-slate-500 leading-relaxed max-w-sm">
                    Tim legal kami siap membantu jika ada pertanyaan khusus mengenai syarat, ketentuan, atau kerjasama lisensi.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href="mailto:legal@ayamsehat.ai"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-[13px] font-semibold no-underline hover:bg-blue-700 transition-colors"
                  >
                    <i className="pi pi-envelope" style={{ fontSize: 12 }} />
                    Email tim legal
                  </a>
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-[13px] font-semibold no-underline hover:bg-slate-50 transition-colors"
                  >
                    Beranda
                  </Link>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;