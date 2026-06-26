/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from 'primereact/skeleton';
import 'primeicons/primeicons.css';
import { getAllTestimonials, Testimonial } from '../services/testimonialService';

// Import external components
import LandingNavbar from '../components/landing/Navbar';
import LandingFooter from '../components/landing/Footer';

// ==========================================
// 1. HERO SECTION
// ==========================================
const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section id="beranda" className="relative pt-24 pb-16 lg:pt-48 lg:pb-32 overflow-hidden" style={{ background: 'var(--col-surface)' }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full rounded-bl-[100px]" style={{ background: 'linear-gradient(to bottom left, var(--col-brand-pale), transparent)', zIndex: 0 }} />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob" style={{ background: 'var(--col-brand-muted)' }} />
      <div className="absolute top-48 -left-24 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" style={{ background: '#BFDBFE' }} />

      <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
        {/* Left Content */}
        <div className="flex flex-col items-start gap-5 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--col-healthy-pale)', color: 'var(--col-brand-dark)', border: '1px solid var(--col-border)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Akurasi Diagnosis 98.5%
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl m-0 leading-[1.15] sm:leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--col-ink)' }}>
            Diagnosis <span style={{ color: 'var(--col-brand)' }}>Lebih Cerdas</span> Dengan AI.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-lg m-0" style={{ color: 'var(--col-ink-3)' }}>
            Analisis kesehatan unggas Anda secara presisi hanya melalui citra feses. Deteksi dini untuk mencegah wabah sebelum terlambat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mt-2">
            <button
              onClick={() => navigate('/predict')}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{ background: 'var(--col-brand)', border: 'none', boxShadow: '0 4px 14px rgba(21,128,61,0.3)', fontFamily: 'var(--font-display)' }}
            >
              <i className="pi pi-camera" style={{ fontSize: 14 }} /> Mulai Prediksi
            </button>
            <button
              onClick={() => { document.querySelector('#cara-kerja')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{ background: 'var(--col-card)', border: '1px solid var(--col-border)', color: 'var(--col-ink-2)', fontFamily: 'var(--font-display)', boxShadow: 'var(--sh-sm)' }}
            >
              <i className="pi pi-play" style={{ fontSize: 14 }} /> Pelajari Sistem
            </button>
          </div>
        </div>

        {/* Right Mockup */}
        <div className="relative z-10 lg:pl-8 animate-fade-up delay-200 mt-8 lg:mt-0">
          <div className="relative rounded-[1.5rem] sm:rounded-[2rem] p-1.5 sm:p-2 transform lg:rotate-1 lg:hover:rotate-0 transition-transform duration-500" style={{ background: 'var(--col-card)', border: '1px solid var(--col-border)', boxShadow: 'var(--sh-xl)' }}>
            <div className="rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden relative aspect-[4/3] bg-slate-100">
              <img src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800" alt="Dashboard" className="w-full h-full object-cover" />
              {/* Floating Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-2 border border-white/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-[10px] font-bold text-slate-800 tracking-wider uppercase">Sistem Aktif</span>
              </div>
              {/* Diagnostic overlay */}
              <div className="absolute inset-x-0 bottom-0 pt-20 pb-5 px-6" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.9), transparent)' }}>
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1 m-0" style={{ fontFamily: 'var(--font-display)' }}>Vision Transformer</h3>
                    <p className="text-sm font-medium m-0" style={{ color: 'var(--col-brand-light)' }}>Analisis Citra Real-time</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold m-0 mb-1" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>Confidence</p>
                    <p className="diag-number text-2xl text-white m-0">98.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 2. FEATURES SECTION
// ==========================================
const FeaturesSection = () => {
  const features = [
    { icon: 'pi-bolt',         color: 'var(--col-warn)',    bg: 'var(--col-warn-pale)',    title: 'Prediksi Super Cepat', desc: 'Dapatkan hasil analisis diagnostik hanya dalam hitungan detik.' },
    { icon: 'pi-microchip', color: 'var(--col-info)',    bg: 'var(--col-info-pale)',    title: 'Vision Transformer',   desc: 'Model AI mutakhir untuk mengekstraksi pola penyakit dari citra.' },
    { icon: 'pi-history',      color: 'var(--col-ink-3)',   bg: 'var(--col-border-light)', title: 'Riwayat Terpusat',     desc: 'Simpan semua data historis untuk pemantauan kesehatan jangka panjang.' },
    { icon: 'pi-chart-pie',    color: 'var(--col-healthy)', bg: 'var(--col-healthy-pale)', title: 'Dashboard Analitik',   desc: 'Pantau tren kesehatan peternakan lewat statistik interaktif.' },
    { icon: 'pi-shield',       color: 'var(--col-disease)', bg: 'var(--col-disease-pale)', title: 'Akurasi Klinis',       desc: 'Tingkat akurasi tinggi berkat dataset yang telah divalidasi ahli.' },
    { icon: 'pi-mobile',       color: 'var(--col-brand)',   bg: 'var(--col-brand-pale)',   title: 'Akses Fleksibel',      desc: 'Pantau dari mana saja lewat antarmuka yang responsif di smartphone.' }
  ];

  return (
    <section id="fitur" className="py-20 sm:py-24" style={{ background: 'var(--col-card)' }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="diag-label mb-3" style={{ color: 'var(--col-brand)' }}>Keunggulan Sistem</h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--col-ink)' }}>Infrastruktur AI untuk Peternakan</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f, i) => (
            <div key={i} className="card card-hover p-6 sm:p-8 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ background: f.bg, color: f.color }}>
                <i className={`pi ${f.icon}`} style={{ fontSize: '1.25rem' }} />
              </div>
              <h4 className="text-lg font-bold mb-2.5 m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>{f.title}</h4>
              <p className="m-0 text-sm leading-relaxed" style={{ color: 'var(--col-ink-3)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 3. HOW IT WORKS SECTION
// ==========================================
const HowItWorksSection = () => {
  const steps = [
    { num: '01', title: 'Unggah Citra', desc: 'Ambil foto feses ayam yang dicurigai dengan pencahayaan baik.' },
    { num: '02', title: 'Pemrosesan AI', desc: 'Vision Transformer mengekstraksi fitur visual dalam hitungan detik.' },
    { num: '03', title: 'Hasil Analisis', desc: 'Sistem menampilkan probabilitas dan klasifikasi penyakit.' },
    { num: '04', title: 'Tindakan', desc: 'Dapatkan rekomendasi medis untuk penanganan segera.' }
  ];

  return (
    <section id="cara-kerja" className="py-20 sm:py-24" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)', color: 'white' }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="diag-label mb-3" style={{ color: 'var(--col-brand-light)' }}>Alur Sistem</h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white' }}>Proses Diagnosis Otomatis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px" style={{ background: 'rgba(59,130,246,0.25)' }} />

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-5 sm:mb-6 shadow-xl" style={{ background: 'rgba(255,255,255,0.10)', border: '2px solid rgba(59,130,246,0.35)' }}>
                <span className="diag-number text-xl sm:text-2xl" style={{ color: 'var(--col-brand-light)' }}>{step.num}</span>
              </div>
              <h4 className="text-lg font-bold mb-2.5 m-0" style={{ fontFamily: 'var(--font-display)', color: 'white' }}>{step.title}</h4>
              <p className="text-sm leading-relaxed m-0" style={{ color: '#BFDBFE' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 4. STATISTIC SECTION
// ==========================================
const StatisticSection = () => {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--col-surface)' }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 shadow-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--col-brand-dark) 0%, var(--col-brand) 100%)' }}>
          {/* Abstract circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 border-[30px] rounded-full" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 border-[40px] rounded-full" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 text-center sm:divide-x" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            {[
              { value: '5,200', label: 'Peternak Aktif' },
              { value: '18,500', label: 'Total Prediksi' },
              { value: '98.5%', label: 'Tingkat Akurasi' },
              { value: '4', label: 'Penyakit Terlatih' }
            ].map((stat, idx) => (
              <div key={idx} className="px-2">
                <div className="diag-number text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 text-white">{stat.value}</div>
                <div className="diag-label text-[10px] sm:text-xs" style={{ color: 'var(--col-brand-pale)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. TESTIMONIAL SECTION
// ==========================================
const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackTestimonials: Testimonial[] = [
    { id: 1, name: 'Budi Santoso', role: 'Pemilik Peternakan Jaya', text: 'Sangat membantu mendeteksi Coccidiosis lebih awal. Aplikasi ini menyelamatkan ribuan ayam saya dari kematian massal.', rating: 5, createdAt: new Date().toISOString() },
    { id: 2, name: 'Drh. Ratna', role: 'Dokter Hewan Spesialis', text: 'Akurasi model AI-nya cukup mengejutkan. Sangat cocok digunakan sebagai opini kedua yang praktis di lapangan.', rating: 5, createdAt: new Date().toISOString() },
    { id: 3, name: 'Agus Pratama', role: 'Peternak Ayam Broiler', text: 'Desainnya sangat bersih dan mudah digunakan bahkan lewat HP. Hasilnya instan dan sarannya sangat berguna.', rating: 5, createdAt: new Date().toISOString() }
  ];

  useEffect(() => {
    getAllTestimonials()
      .then(data => setTestimonials(data?.length ? data : fallbackTestimonials))
      .catch(() => setTestimonials(fallbackTestimonials))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="tentang" className="py-20 sm:py-24" style={{ background: 'var(--col-card)' }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="diag-label mb-3" style={{ color: 'var(--col-brand)' }}>Ulasan Pengguna</h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--col-ink)' }}>Testimoni Peternak</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="card p-6 sm:p-8 flex flex-col justify-between" style={{ border: '1px solid var(--col-border-light)' }}>
                <div>
                  <div className="flex gap-1.5 mb-5">
                    {[...Array(5)].map((_, j) => <Skeleton key={j} shape="circle" width="14px" height="14px" />)}
                  </div>
                  <Skeleton height="1rem" className="mb-3" borderRadius="8px" />
                  <Skeleton height="1rem" className="mb-3" borderRadius="8px" />
                  <Skeleton height="1rem" width="70%" className="mb-8" borderRadius="8px" />
                </div>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--col-border-light)' }}>
                  <Skeleton shape="circle" width="40px" height="40px" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton width="50%" height="0.9rem" borderRadius="6px" />
                    <Skeleton width="30%" height="0.7rem" borderRadius="4px" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            testimonials.map((t) => (
              <div key={t.id} className="card p-6 sm:p-8 card-hover flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4 sm:mb-5" style={{ color: 'var(--col-warn)' }}>
                    {[...Array(t.rating || 5)].map((_, i) => <i key={i} className="pi pi-star-fill" style={{ fontSize: 13 }} />)}
                  </div>
                  <p className="text-sm leading-relaxed italic mb-6 sm:mb-8 m-0" style={{ color: 'var(--col-ink-2)' }}>"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--col-border-light)' }}>
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'var(--col-brand-pale)', color: 'var(--col-brand-dark)', fontFamily: 'var(--font-display)' }}>
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="m-0 text-sm font-bold" style={{ color: 'var(--col-ink)', fontFamily: 'var(--font-display)' }}>{t.name}</h4>
                    <p className="m-0 text-[11px] sm:text-xs" style={{ color: 'var(--col-ink-4)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 6. CTA SECTION
// ==========================================
const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 sm:py-24" style={{ background: 'var(--col-surface)' }}>
      <div className="max-w-4xl mx-auto px-5 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5 m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
          Siap Mengamankan Peternakan Anda?
        </h2>
        <p className="text-sm sm:text-base mb-8 sm:mb-10 max-w-2xl mx-auto m-0 leading-relaxed" style={{ color: 'var(--col-ink-3)' }}>
          Bergabunglah dengan peternak modern lainnya yang telah memanfaatkan presisi AI untuk mendiagnosis penyakit unggas dengan instan.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 rounded-2xl text-base sm:text-lg font-semibold text-white transition-all hover:-translate-y-1 cursor-pointer w-full sm:w-auto justify-center"
            style={{ background: 'var(--col-ink)', border: 'none', boxShadow: 'var(--sh-xl)', fontFamily: 'var(--font-display)' }}
          >
            Mulai Penggunaan Gratis <i className="pi pi-arrow-right ml-1" style={{ fontSize: 14 }} />
          </button>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// MAIN PAGE EXPORT
// ==========================================
const LandingPage: React.FC = () => {
  return (
    <div className="landing-page selection:bg-green-200 selection:text-green-900" style={{ background: 'var(--col-surface)' }}>
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatisticSection />
      <TestimonialSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
