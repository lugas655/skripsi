import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const PrivacyPage: React.FC = () => {
  const sections = [
    { id: 'pengumpulan', title: 'Data yang Dikumpulkan', icon: 'pi-database' },
    { id: 'penggunaan', title: 'Tujuan Penggunaan', icon: 'pi-cog' },
    { id: 'keamanan', title: 'Keamanan & Proteksi', icon: 'pi-shield' },
    { id: 'hak-pengguna', title: 'Hak-Hak Pengguna', icon: 'pi-lock' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      
      {/* Header */}
      <div className="pt-32 pb-20 bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-600">
             <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
             <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
             <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-4">
            Privasi Data
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
            Kebijakan <span className="text-blue-600">Privasi</span>
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <i className="pi pi-shield" />
            Komitmen Kami dalam Menjaga Keamanan Data Anda
          </p>
        </div>
      </div>

      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="lg:w-1/4 hidden lg:block">
            <div className="sticky top-28 space-y-1">
              <p className="diag-label px-3 mb-4 text-slate-400">Ringkasan Kebijakan</p>
              {sections.map((s) => (SectionNav(s)))}
            </div>
          </aside>

          {/* Content */}
          <div className="lg:w-3/4 space-y-12">
            
            <section id="pengumpulan" className="scroll-mt-32">
              <SectionHeader title="1. Data yang Kami Kumpulkan" icon="pi-database" color="blue" />
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-600 leading-relaxed">
                <p className="mb-6">Kami mengumpulkan informasi minimal yang diperlukan untuk menjalankan sistem deteksi AI secara optimal:</p>
                <div className="space-y-4">
                  {[
                    { label: 'Informasi Identitas', detail: 'Nama lengkap, username, dan kredensial akses yang dienkripsi.' },
                    { label: 'Data Visual', detail: 'Gambar feses unggas yang Anda unggah untuk keperluan analisis AI.' },
                    { label: 'Metadata Teknis', detail: 'Informasi perangkat, waktu unggah, dan statistik penggunaan fitur.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-1.5 h-auto bg-blue-400 rounded-full" />
                      <div>
                        <span className="block font-bold text-slate-900 text-sm mb-1">{item.label}</span>
                        <p className="text-sm m-0 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="penggunaan" className="scroll-mt-32">
              <SectionHeader title="2. Tujuan Penggunaan Data" icon="pi-cog" color="green" />
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-600 leading-relaxed">
                <p>Data Anda digunakan secara eksklusif untuk kepentingan operasional AyamSehat.AI:</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Melakukan klasifikasi penyakit secara real-time.',
                    'Melatih dan meningkatkan akurasi model Vision Transformer.',
                    'Menyediakan laporan riwayat kesehatan ternak Anda.',
                    'Mendeteksi dan mencegah penyalahgunaan sistem.'
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3 p-3">
                      <i className="pi pi-check text-green-500 mt-1" style={{ fontSize: 12 }} />
                      <span className="text-sm font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="keamanan" className="scroll-mt-32">
              <SectionHeader title="3. Keamanan & Proteksi" icon="pi-shield" color="indigo" />
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-slate-600 leading-relaxed">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-2/3">
                    <p className="mb-4">Keamanan adalah prioritas utama kami. AyamSehat.AI mengimplementasikan:</p>
                    <ul className="list-disc pl-5 space-y-2 text-sm font-medium">
                      <li>Enkripsi data pada saat pengiriman (SSL/TLS).</li>
                      <li>Hashing tingkat lanjut (Argon2/BCrypt) untuk kata sandi.</li>
                      <li>Audit keamanan berkala pada server dan database.</li>
                      <li>Akses terbatas hanya kepada personil teknis yang berwenang.</li>
                    </ul>
                  </div>
                  <div className="md:w-1/3 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 relative">
                      <i className="pi pi-lock" style={{ fontSize: 48 }} />
                      <div className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-full animate-spin-slow" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="kontak" className="scroll-mt-32">
              <div className="p-8 rounded-3xl bg-blue-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/10">
                <div>
                  <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>Kedaulatan Data</h2>
                  <p className="text-blue-100 text-sm m-0 max-w-sm">Anda berhak meminta penghapusan akun dan seluruh data riwayat Anda kapan saja melalui dashboard atau email.</p>
                </div>
                <a href="mailto:privacy@ayamsehat.ai" className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-sm no-underline hover:bg-blue-50 transition-all shrink-0">
                  Hubungi Data Officer
                </a>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const SectionNav = (s: any) => (
  <a key={s.id} href={`#${s.id}`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:text-blue-700 hover:shadow-sm transition-all no-underline group">
    <i className={`pi ${s.icon} text-slate-400 group-hover:text-blue-600`} style={{ fontSize: 14 }} />
    {s.title}
  </a>
);

const SectionHeader = ({ title, icon, color }: any) => {
  const colorMap: any = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    indigo: 'text-indigo-600'
  };
  return (
    <div className="flex items-center gap-2 mb-3">
      <i className={`pi ${icon} ${colorMap[color]}`} style={{ fontSize: 16 }} />
      <h2 className="text-xl font-black m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>{title}</h2>
    </div>
  );
};

export default PrivacyPage;
