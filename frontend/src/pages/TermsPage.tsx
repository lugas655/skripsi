import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const TermsPage: React.FC = () => {
  const sections = [
    { id: 'penerimaan', title: 'Penerimaan Ketentuan', icon: 'pi-check-circle' },
    { id: 'layanan', title: 'Layanan Deteksi AI', icon: 'pi-microchip' },
    { id: 'tanggung-jawab', title: 'Tanggung Jawab Pengguna', icon: 'pi-user' },
    { id: 'batasan', title: 'Batasan Penggunaan', icon: 'pi-ban' },
    { id: 'kontak', title: 'Kontak Legal', icon: 'pi-envelope' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      
      {/* Decorative Header Area */}
      <div className="pt-32 pb-20 bg-white border-b border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-green-600">
             <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
               <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
             </pattern>
             <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-[11px] font-bold uppercase tracking-wider mb-4">
            Legalitas & Kebijakan
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
            Syarat & <span className="text-green-600">Ketentuan</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <i className="pi pi-calendar" style={{ fontSize: 12 }} />
              Pembaruan Terakhir: 13 Juni 2026
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 hidden md:block" />
            <span className="flex items-center gap-1.5">
              <i className="pi pi-clock" style={{ fontSize: 12 }} />
              Waktu Baca: 5 Menit
            </span>
          </div>
        </div>
      </div>

      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-1/4 hidden lg:block">
            <div className="sticky top-28 space-y-1">
              <p className="diag-label px-3 mb-4 text-slate-400">Navigasi Pasal</p>
              {sections.map((s) => (
                <a 
                  key={s.id} 
                  href={`#${s.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:text-green-700 hover:shadow-sm transition-all no-underline group"
                >
                  <i className={`pi ${s.icon} text-slate-400 group-hover:text-green-600`} style={{ fontSize: 14 }} />
                  {s.title}
                </a>
              ))}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <Link to="/register" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-green-700 hover:bg-green-800 transition-all no-underline shadow-md shadow-green-900/10">
                  Mulai Gunakan AI
                  <i className="pi pi-arrow-right" style={{ fontSize: 11 }} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="lg:w-3/4 space-y-12">
            
            <section id="penerimaan" className="scroll-mt-32">
              <div className="flex items-center gap-2 mb-3">
                <i className="pi pi-check-circle text-green-600" style={{ fontSize: 16 }} />
                <h2 className="text-xl font-black m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
                  1. Penerimaan Ketentuan
                </h2>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-600 leading-relaxed space-y-4">
                <p>
                  AyamSehat.AI ("Platform") adalah layanan analisis kesehatan unggas berbasis kecerdasan buatan. Dengan mendaftar, mengakses, atau menggunakan platform ini, Anda menyatakan bahwa Anda telah membaca, memahami, dan setuju untuk terikat oleh Syarat dan Ketentuan ini.
                </p>
                <p>
                  Jika Anda menggunakan platform ini atas nama entitas bisnis atau peternakan, Anda menyatakan bahwa Anda memiliki otoritas legal untuk mengikat entitas tersebut pada ketentuan ini.
                </p>
              </div>
            </section>

            <section id="layanan" className="scroll-mt-32">
              <div className="flex items-center gap-2 mb-3">
                <i className="pi pi-microchip text-blue-600" style={{ fontSize: 16 }} />
                <h2 className="text-xl font-black m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
                  2. Layanan Deteksi AI & Disclaimer
                </h2>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-600 leading-relaxed">
                <p className="mb-4 text-sm md:text-base">
                  AyamSehat.AI menyediakan alat bantu deteksi berbasis Vision Transformer (ViT). Anda memahami sepenuhnya bahwa:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Sifat Analisis</span>
                    <p className="text-sm m-0">Hasil analisis AI bersifat <strong>informatif dan prediktif</strong>, bukan merupakan diagnosis medis Veteriner yang bersifat final.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Rekomendasi Ahli</span>
                    <p className="text-sm m-0">Pengguna sangat disarankan untuk melakukan konsultasi dengan <strong>Dokter Hewan Profesional</strong> sebelum mengambil tindakan medis berat.</p>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
                  <i className="pi pi-exclamation-triangle text-amber-600 mt-0.5" style={{ fontSize: 14 }} />
                  <p className="text-sm m-0 text-amber-800 font-medium leading-relaxed">
                    Platform tidak bertanggung jawab atas kerugian finansial, kematian ternak, atau kerusakan aset yang disebabkan oleh pengambilan keputusan sepihak berdasarkan hasil prediksi sistem.
                  </p>
                </div>
              </div>
            </section>

            <section id="tanggung-jawab" className="scroll-mt-32">
              <div className="flex items-center gap-2 mb-3">
                <i className="pi pi-user text-purple-600" style={{ fontSize: 16 }} />
                <h2 className="text-xl font-black m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
                  3. Tanggung Jawab Pengguna
                </h2>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-600 leading-relaxed space-y-4">
                <ul className="list-none p-0 m-0 space-y-4">
                  {[
                    'Menjamin keakuratan data profil dan legalitas akun yang didaftarkan.',
                    'Menjaga kerahasiaan kredensial akses (username & password) agar tidak disalahgunakan oleh pihak lain.',
                    'Mengunggah citra (gambar) yang asli, jelas, dan diambil dari unit ternak milik sendiri atau yang di bawah manajemen legal pengguna.',
                    'Tidak menggunakan platform untuk tujuan penipuan atau klaim asuransi ternak yang tidak sah.'
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                      <span className="text-sm md:text-base">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section id="batasan" className="scroll-mt-32">
              <div className="flex items-center gap-2 mb-3">
                <i className="pi pi-ban text-red-600" style={{ fontSize: 16 }} />
                <h2 className="text-xl font-black m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
                  4. Batasan Penggunaan
                </h2>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-600 leading-relaxed">
                <p className="text-sm md:text-base">Anda secara tegas dilarang untuk:</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Melakukan scraping atau pengambilan data massal secara otomatis.',
                    'Melakukan reverse engineering pada model AI atau sistem API.',
                    'Mengunggah konten berbahaya, virus, atau malware.',
                    'Menjual kembali akses layanan tanpa izin tertulis dari manajemen AyamSehat.AI.'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-red-100 transition-colors">
                      <i className="pi pi-times-circle text-red-400" style={{ fontSize: 12 }} />
                      <span className="text-xs md:text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="kontak" className="scroll-mt-32">
              <div className="p-10 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                  <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>Butuh Klarifikasi Legal?</h2>
                  <p className="text-slate-400 mb-8 max-w-md">
                    Tim legal kami siap membantu jika Anda memiliki pertanyaan khusus mengenai syarat, ketentuan, atau kerjasama lisensi.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:legal@ayamsehat.ai" className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm no-underline hover:bg-slate-100 transition-all flex items-center gap-2">
                      <i className="pi pi-envelope" />
                      Email Tim Legal
                    </a>
                    <Link to="/" className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm no-underline hover:bg-slate-700 transition-all border border-slate-700">
                      Beranda
                    </Link>
                  </div>
                </div>
                {/* Background glow */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-green-500/20 blur-[80px]" />
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
