import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import 'primeicons/primeicons.css';
import { getAllTestimonials, Testimonial } from '../services/testimonialService';

// ==========================================
// 1. NAVBAR SECTION
// ==========================================
const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="pi pi-bolt text-xl"></i>
          </div>
          <span className={`text-2xl font-black tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
            AyamSehat<span className="text-blue-600">.AI</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
          <a href="#home" className="hover:text-blue-600 transition-colors">Home</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">About</a>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button label="Login" className="p-button-text text-slate-700 font-bold hover:bg-slate-100 rounded-xl px-6 py-2" onClick={() => navigate('/login')} />
          <Button label="Get Started" className="bg-blue-600 border-none hover:bg-blue-700 text-white rounded-xl px-6 py-2 font-bold shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5" onClick={() => navigate('/register')} />
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <Button icon={`pi ${mobileMenuOpen ? 'pi-times' : 'pi-bars'}`} className="p-button-text p-button-rounded text-slate-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-100 py-4 px-4 flex flex-col gap-4">
          <a href="#home" className="font-bold text-slate-700 p-2" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#features" className="font-bold text-slate-700 p-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="font-bold text-slate-700 p-2" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button label="Login" outlined className="rounded-xl font-bold justify-center" onClick={() => navigate('/login')} />
            <Button label="Get Started" className="rounded-xl font-bold bg-blue-600 border-none justify-center" onClick={() => navigate('/register')} />
          </div>
        </div>
      )}
    </nav>
  );
};

// ==========================================
// 2. HERO SECTION
// ==========================================
const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-50 to-transparent -z-10 rounded-bl-[100px]"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-48 -left-24 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="flex flex-col items-start gap-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Akurasi Deteksi Mencapai 98%
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Prediksi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Lebih Cerdas</span> Dengan Teknologi AI.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
            Diagnosa kesehatan unggas Anda secara instan dan akurat hanya melalui foto feses. Cegah wabah sebelum terlambat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
            <Button
              label="Mulai Prediksi"
              icon="pi pi-camera"
              className="bg-blue-600 border-none hover:bg-blue-700 text-white rounded-2xl px-8 py-4 text-lg font-bold shadow-lg shadow-blue-200 hover:-translate-y-1 transition-transform"
              onClick={() => navigate('/predict')}
            />
            <Button
              label="Lihat Demo"
              icon="pi pi-play"
              className="bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-2xl px-8 py-4 text-lg font-bold transition-all"
            />
          </div>
        </div>

        {/* Right Mockup */}
        <div className="relative z-10 lg:pl-10">
          <div className="relative rounded-[2rem] bg-white p-2 shadow-2xl border border-slate-100 transform rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="rounded-[1.5rem] overflow-hidden bg-slate-100 relative aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90" />
              {/* Floating Badge Top Right */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2 border border-white/50">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">AI Scanning Active</span>
              </div>

              {/* Attractive Marketing Text at Bottom */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent pt-24 pb-6 px-6 md:px-8">
                <h3 className="text-white font-black text-xl md:text-2xl mb-1 drop-shadow-lg">Analisis Feses Instan</h3>
                <p className="text-blue-100 text-sm md:text-base font-medium drop-shadow-md">Teknologi AI pintar untuk unggas Anda.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 3. FEATURES SECTION
// ==========================================
const FeaturesSection = () => {
  const features = [
    { icon: 'pi-bolt', color: 'bg-yellow-100 text-yellow-600', title: 'Prediksi Super Cepat', desc: 'Dapatkan hasil analisis hanya dalam hitungan detik tanpa perlu menunggu lama.' },
    { icon: 'pi-microchip-ai', color: 'bg-purple-100 text-purple-600', title: 'Analisis Data AI', desc: 'Menggunakan algoritma Deep Learning canggih untuk mengenali pola penyakit sekecil apapun.' },
    { icon: 'pi-history', color: 'bg-blue-100 text-blue-600', title: 'Riwayat Prediksi', desc: 'Simpan seluruh data hasil diagnosa Anda untuk pemantauan jangka panjang.' },
    { icon: 'pi-chart-pie', color: 'bg-green-100 text-green-600', title: 'Dashboard Interaktif', desc: 'Pantau statistik kesehatan peternakan Anda lewat grafik yang informatif.' },
    { icon: 'pi-shield', color: 'bg-red-100 text-red-600', title: 'Akurasi Tinggi', desc: 'Model AI dilatih menggunakan ribuan dataset tervalidasi.' },
    { icon: 'pi-mobile', color: 'bg-teal-100 text-teal-600', title: 'Responsive System', desc: 'Gunakan aplikasi kapan saja dan di mana saja langsung dari smartphone Anda.' }
  ];

  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-3">Fitur Unggulan</h2>
          <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Semuanya yang Anda Butuhkan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-slate-50 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:bg-white border border-slate-100 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110 ${feature.color}`}>
                <i className={`pi ${feature.icon} text-2xl`}></i>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 4. HOW IT WORKS SECTION
// ==========================================
const HowItWorksSection = () => {
  const steps = [
    { num: '01', title: 'Input Foto', desc: 'Ambil foto kotoran ayam yang dicurigai sakit menggunakan kamera HP.' },
    { num: '02', title: 'Proses AI', desc: 'Sistem akan mengekstrak ciri-ciri visual menggunakan Convolutional Neural Network.' },
    { num: '03', title: 'Hasil Analisis', desc: 'Dapatkan diagnosis penyakit beserta probabilitas kemiripannya.' },
    { num: '04', title: 'Saran Penanganan', desc: 'Baca saran penanganan berbasis medis yang disesuaikan dengan jenis penyakit.' }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-3">Cara Kerja</h2>
          <h3 className="text-3xl md:text-5xl font-black tracking-tight">Sangat Mudah Digunakan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-slate-800"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center mb-6 shadow-xl">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{step.num}</span>
              </div>
              <h4 className="text-xl font-bold mb-3">{step.title}</h4>
              <p className="text-slate-400 font-medium leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. STATISTIC SECTION
// ==========================================
const StatisticSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
          {/* Abstract circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 border-[30px] border-white/10 rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 border-[40px] border-white/10 rounded-full"></div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
            {[
              { value: '5,200+', label: 'Peternak Aktif' },
              { value: '18,500+', label: 'Total Prediksi' },
              { value: '98.5%', label: 'Tingkat Akurasi' },
              { value: '4', label: 'Penyakit Dikenali' }
            ].map((stat, idx) => (
              <div key={idx} className="px-4">
                <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-blue-100 font-medium uppercase tracking-widest text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 6. TESTIMONIAL SECTION
// ==========================================
const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackTestimonials: Testimonial[] = [
    { id: 1, name: 'Budi Santoso', role: 'Pemilik Peternakan Jaya', text: 'Sangat membantu mendeteksi Coccidiosis lebih awal. Aplikasi ini menyelamatkan ribuan ayam saya dari kematian massal.', rating: 5, createdAt: new Date().toISOString() },
    { id: 2, name: 'Drh. Ratna', role: 'Dokter Hewan Spesialis', text: 'Akurasi model AI-nya cukup mengejutkan. Sangat cocok digunakan sebagai opini kedua yang praktis di lapangan.', rating: 5, createdAt: new Date().toISOString() },
    { id: 3, name: 'Agus Pratama', role: 'Peternak Ayam Broiler', text: 'Desainnya sangat modern dan mudah digunakan bahkan lewat HP jadul. Hasilnya cepat dan sarannya sangat berguna.', rating: 5, createdAt: new Date().toISOString() }
  ];

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await getAllTestimonials();
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-3">Testimonial</h2>
          <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Apa Kata Mereka?</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            // Skeleton Loaders
            [...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} shape="circle" size="1.2rem" />)}
                </div>
                <Skeleton height="1.5rem" className="mb-2" />
                <Skeleton height="1.5rem" className="mb-2" />
                <Skeleton height="1.5rem" width="70%" className="mb-8" />
                <div className="flex items-center gap-4">
                  <Skeleton shape="circle" size="3rem" />
                  <div className="flex-1">
                    <Skeleton width="60%" className="mb-2" />
                    <Skeleton width="40%" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            testimonials.map((testi) => (
              <div key={testi.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex text-yellow-400 mb-6 gap-1">
                  {[...Array(testi.rating || 5)].map((_, i) => <i key={i} className="pi pi-star-fill"></i>)}
                </div>
                <p className="text-slate-700 text-lg font-medium italic mb-8">"{testi.text}"</p>
                <div className="flex items-center gap-4">
                  {testi.avatar ? (
                    <img src={testi.avatar} alt={testi.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                      {testi.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900">{testi.name}</h4>
                    <p className="text-sm text-slate-500">{testi.role}</p>
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
// 7. CTA SECTION
// ==========================================
const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
          Siap Mengamankan Peternakan Anda?
        </h2>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Bergabunglah dengan ribuan peternak modern lainnya yang telah memanfaatkan kekuatan AI untuk mendiagnosis unggas dengan cepat.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            label="Mulai Gratis Sekarang"
            className="bg-slate-900 border-none hover:bg-slate-800 text-white rounded-2xl px-10 py-5 text-xl font-bold shadow-xl shadow-slate-200 transition-transform hover:-translate-y-1"
            onClick={() => navigate('/register')}
          />
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 8. FOOTER SECTION
// ==========================================
const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <i className="pi pi-bolt text-sm"></i>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              AyamSehat<span className="text-blue-500">.AI</span>
            </span>
          </div>
          <p className="text-slate-500 leading-relaxed max-w-md">
            Platform AI inovatif untuk klasifikasi penyakit pada kotoran ayam. Dibangun untuk membantu peternak meningkatkan produktivitas dan meminimalisir risiko kerugian.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Navigasi</h4>
          <div className="flex flex-col gap-3 font-medium">
            <a href="#home" className="hover:text-blue-400 transition-colors">Beranda</a>
            <a href="#features" className="hover:text-blue-400 transition-colors">Fitur</a>
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">Cara Kerja</a>
            <a href="/login" className="hover:text-blue-400 transition-colors">Masuk</a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Sosial Media</h4>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
              <i className="pi pi-twitter"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
              <i className="pi pi-facebook"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
              <i className="pi pi-github"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-slate-900 text-center text-slate-600 font-medium text-sm">
        <p>&copy; {new Date().getFullYear()} AyamSehat.AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

// ==========================================
// MAIN PAGE EXPORT
// ==========================================
const LandingPage: React.FC = () => {
  return (
    <div className="landing-page font-sans selection:bg-blue-200 selection:text-blue-900">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatisticSection />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
