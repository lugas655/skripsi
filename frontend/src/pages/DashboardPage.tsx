/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import Navbar from '../components/Navbar';
import { historyService, Stats } from '../services/historyService';
import { IMAGE_BASE_URL } from '../api/api';
import { User } from '../types';

/* ── Stat Card ── */
interface StatCardProps { label: string; value: string | number; icon: string; color: string; pale: string; trend?: string; index: number; }
const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, pale, trend, index }) => (
  <div
    className={`card card-hover animate-fade-up delay-${(index + 1) * 100}`}
    style={{ borderRadius: 'var(--r-xl)', padding: '1.125rem 1.25rem' }}
  >
    <div className="flex items-start justify-between mb-3">
      <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: 11, background: pale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`pi ${icon}`} style={{ fontSize: 16, color }} />
      </div>
      {trend && (
        <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: 'var(--col-brand-muted)', color: 'var(--col-brand-dark)' }}>
          {trend}
        </span>
      )}
    </div>
    <p className="diag-label m-0 mb-1">{label}</p>
    <p className="m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--col-ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
  </div>
);

const SkeletonCard: React.FC = () => (
  <div className="card p-5">
    <div className="skeleton h-9 w-9 rounded-xl mb-4" />
    <div className="skeleton h-2.5 w-20 rounded mb-3" />
    <div className="skeleton h-7 w-14 rounded" />
  </div>
);

/* ── Main Page ── */
const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    historyService.getStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const healthyCount = stats?.labelCounts['HEALTHY'] || 0;
  const sickCount = stats ? stats.totalDiagnoses - healthyCount : 0;

  const healthStatus = () => {
    if (!stats || stats.totalDiagnoses === 0) return { label: 'Siap', color: 'var(--col-info)', pale: 'var(--col-info-pale)', icon: 'pi-info-circle' };
    const ratio = (healthyCount / stats.totalDiagnoses) * 100;
    if (ratio > 80) return { label: 'Optimal', color: 'var(--col-healthy)', pale: 'var(--col-healthy-pale)', icon: 'pi-check-circle' };
    if (ratio > 50) return { label: 'Waspada', color: 'var(--col-warn)', pale: 'var(--col-warn-pale)', icon: 'pi-exclamation-triangle' };
    return { label: 'Kritis', color: 'var(--col-disease)', pale: 'var(--col-disease-pale)', icon: 'pi-times-circle' };
  };
  const hs = healthStatus();

  const doughnutData = {
    labels: ['Sehat', 'Sakit'],
    datasets: [{ data: [healthyCount || 1, sickCount], backgroundColor: ['#2563EB', '#DC2626'], borderWidth: 0 }],
  };
  const doughnutOptions = {
    cutout: '72%',
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1E293B', padding: 10, bodyFont: { size: 13 }, titleFont: { size: 11 } } },
    maintainAspectRatio: false,
  };

  const diseaseLabels = stats ? Object.keys(stats.labelCounts).filter(l => l !== 'HEALTHY') : [];
  const barData = {
    labels: diseaseLabels.map(l => l.charAt(0) + l.slice(1).toLowerCase().replace(/_/g, ' ')),
    datasets: [{ label: 'Kasus', data: diseaseLabels.map(l => stats?.labelCounts[l] || 0), backgroundColor: ['#DC2626', '#D97706', '#A78BFA', '#60A5FA'], borderRadius: 5, barThickness: 12 }],
  };
  const barOptions: any = {
    indexAxis: 'y',
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1E293B', padding: 10 } },
    scales: {
      x: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
      y: { grid: { display: false }, ticks: { color: 'var(--col-ink-2)', font: { size: 11, weight: '600' }, padding: 4 }, border: { display: false } },
    },
    maintainAspectRatio: false,
  };

  const statCards = [
    { label: 'Total Analisis', value: stats?.totalDiagnoses || 0, icon: 'pi-database',           color: 'var(--col-info)',    pale: 'var(--col-info-pale)' },
    { label: 'Kondisi Sehat',  value: healthyCount,               icon: 'pi-check-circle',       color: 'var(--col-healthy)', pale: 'var(--col-healthy-pale)', trend: '+Today' },
    { label: 'Kondisi Sakit',  value: sickCount,                  icon: 'pi-exclamation-circle', color: 'var(--col-disease)', pale: 'var(--col-disease-pale)' },
    { label: 'Status Sistem',  value: hs.label,                   icon: hs.icon,                 color: hs.color,             pale: hs.pale },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Selamat Pagi' : h < 17 ? 'Selamat Siang' : 'Selamat Malam';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--col-surface)' }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-14">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 animate-fade-up">
          <div>
            <p className="m-0 text-sm font-semibold mb-0.5" style={{ color: 'var(--col-brand)', fontFamily: 'var(--font-mono)' }}>
              {greeting()}, {user?.nama_lengkap?.split(' ')[0] || 'Peternak'} 👋
            </p>
            <h1 className="m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--col-ink)' }}>
              Dashboard Overview
            </h1>
            <p className="m-0 mt-1 text-sm" style={{ color: 'var(--col-ink-4)' }}>
              Pantau kondisi kesehatan ternak Anda secara real-time
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--col-card)', border: '1px solid var(--col-border)', color: 'var(--col-ink-2)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              <i className="pi pi-question-circle" style={{ fontSize: 13 }} /> Panduan
            </button>
            <button
              onClick={() => navigate('/predict')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--col-brand)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', fontFamily: 'var(--font-display)' }}
            >
              <i className="pi pi-plus" style={{ fontSize: 13 }} /> Diagnosa Baru
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) :
            statCards.map((s, i) => <StatCard key={i} {...s} index={i} />)}
        </div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left: Charts */}
          <div className="flex flex-col gap-5">

            {/* Doughnut */}
            <div className="card p-5 animate-fade-up delay-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="m-0 text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>Sebaran Kondisi</h3>
                  <p className="m-0 mt-0.5" style={{ fontSize: '0.7rem', color: 'var(--col-ink-4)' }}>Proporsi sehat vs sakit</p>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2.5 py-1 animate-pulse-ring" style={{ background: 'var(--col-brand-pale)', color: 'var(--col-brand)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Live
                </span>
              </div>

              {loading ? (
                <div className="h-48 flex items-center justify-center"><div className="skeleton w-36 h-36 rounded-full" /></div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative" style={{ height: 160, width: 160 }}>
                    <Chart type="doughnut" data={doughnutData} options={doughnutOptions} style={{ width: '100%', height: '100%' }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="diag-number" style={{ fontSize: '1.875rem', color: 'var(--col-ink)' }}>{stats?.totalDiagnoses || 0}</span>
                      <span className="diag-label">Total</span>
                    </div>
                  </div>
                  <div className="w-full mt-4 grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl p-3 flex items-center gap-2.5" style={{ background: 'var(--col-healthy-pale)' }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--col-healthy)' }} />
                      <div>
                        <p className="diag-label m-0" style={{ color: 'var(--col-healthy)' }}>Sehat</p>
                        <p className="diag-number m-0" style={{ fontSize: '1.125rem', color: 'var(--col-healthy)' }}>{healthyCount}</p>
                      </div>
                    </div>
                    <div className="rounded-xl p-3 flex items-center gap-2.5" style={{ background: 'var(--col-disease-pale)' }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--col-disease)' }} />
                      <div>
                        <p className="diag-label m-0" style={{ color: 'var(--col-disease)' }}>Sakit</p>
                        <p className="diag-number m-0" style={{ fontSize: '1.125rem', color: 'var(--col-disease)' }}>{sickCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bar Chart */}
            <div className="card p-5 animate-fade-up delay-300">
              <h3 className="m-0 text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>Frekuensi Penyakit</h3>
              <p className="m-0 mb-4" style={{ fontSize: '0.7rem', color: 'var(--col-ink-4)' }}>Distribusi per jenis penyakit</p>
              {loading ? (
                <div className="space-y-3">{[80, 55, 40].map((w, i) => <div key={i} className="skeleton h-3 rounded" style={{ width: `${w}%` }} />)}</div>
              ) : diseaseLabels.length > 0 ? (
                <div style={{ height: 140 }}><Chart type="bar" data={barData} options={barOptions} style={{ height: '100%' }} /></div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center rounded-xl" style={{ border: '2px dashed var(--col-border)' }}>
                  <i className="pi pi-chart-bar text-2xl mb-2" style={{ color: 'var(--col-border)' }} />
                  <p className="text-xs font-medium m-0" style={{ color: 'var(--col-ink-4)' }}>Belum ada data penyakit</p>
                </div>
              )}
            </div>

            {/* Advisory */}
            <div
              className="rounded-2xl p-5 animate-fade-up delay-300"
              style={{ background: 'linear-gradient(135deg, var(--col-brand-deep) 0%, var(--col-brand-dark) 60%, var(--col-brand) 100%)', color: 'white' }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div style={{ width: 34, height: 34, minWidth: 34, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <i className="pi pi-lightbulb" style={{ fontSize: 15, color: '#BFDBFE' }} />
                </div>
                <div>
                  <span className="diag-label" style={{ color: 'rgba(147,197,253,0.9)' }}>Saran AI</span>
                  <p className="m-0 text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Rekomendasi berbasis data</p>
                </div>
              </div>
              <h4 className="m-0 mb-2 text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'white' }}>Pemantauan Aktif</h4>
              <p className="m-0 mb-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {stats && sickCount > 0
                  ? `Ditemukan ${sickCount} kasus perlu perhatian. Segera lakukan isolasi dan konsultasi dokter hewan.`
                  : 'Kondisi ternak dalam keadaan baik. Pertahankan kebersihan kandang dan kualitas pakan.'}
              </p>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity p-0"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, padding: '7px 14px', color: 'white' }}
              >
                Lihat Riwayat <i className="pi pi-arrow-right" style={{ fontSize: 11 }} />
              </button>
            </div>
          </div>

            {/* Right: Activity Feed */}
          <div className="xl:col-span-2">
            <div className="card animate-fade-up delay-200" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--col-border)' }}>
                <div>
                  <h3 className="m-0 text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>Aktivitas Terbaru</h3>
                  <p className="m-0 mt-0.5" style={{ fontSize: '0.7rem', color: 'var(--col-ink-4)' }}>Log diagnosa terkini</p>
                </div>
                <button
                  onClick={() => navigate('/history')}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-transparent border-none cursor-pointer p-0 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--col-brand)' }}
                >
                  Lihat Semua <i className="pi pi-external-link" style={{ fontSize: 11 }} />
                </button>
              </div>

              <div className="p-3">
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2"><div className="skeleton h-3.5 w-32 rounded" /><div className="skeleton h-2.5 w-48 rounded" /></div>
                        <div className="skeleton h-7 w-14 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : !stats || stats.recentChecks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--col-surface)', border: '2px dashed var(--col-border)' }}>
                      <i className="pi pi-folder-open text-2xl" style={{ color: 'var(--col-border)' }} />
                    </div>
                    <p className="font-semibold text-sm m-0" style={{ color: 'var(--col-ink-4)' }}>Belum ada riwayat diagnosa</p>
                    <p className="text-xs m-0 mt-1" style={{ color: 'var(--col-ink-4)', opacity: 0.6 }}>Mulai diagnosa pertama Anda sekarang</p>
                    <button
                      onClick={() => navigate('/predict')}
                      className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'var(--col-brand)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(21,128,61,0.3)' }}
                    >
                      <i className="pi pi-camera" style={{ fontSize: 13 }} /> Mulai Diagnosa
                    </button>
                  </div>
                ) : (
                  <div>
                    {stats.recentChecks.map((item, idx) => {
                      const isHealthy = item.hasilPrediksi?.labelPenyakit === 'HEALTHY';
                      const accuracy = ((item.hasilPrediksi?.nilaiAkurasi || 0) * 100).toFixed(1);
                      const date = new Date(item.tanggalUnggah);
                      const label = item.hasilPrediksi?.labelPenyakit;
                      const badgeColor = isHealthy ? 'badge-healthy' : label === 'NEWCASTLE' ? 'badge-warn' : label === 'SALMONELLA' ? 'badge-info' : 'badge-disease';
                      return (
                        <div key={idx}>
                          <div
                            className="activity-row group flex items-center gap-3.5 p-3 rounded-xl cursor-pointer"
                            onClick={() => navigate(`/history/${item.id}`)}
                          >
                            <div className="relative shrink-0">
                              <img src={`${IMAGE_BASE_URL}/${item.namaFile}`} alt="Sample" className="w-11 h-11 rounded-xl object-cover" style={{ border: '2px solid var(--col-border)' }} />
                              <span
                                className="absolute -bottom-1 -right-1 border-2 border-white flex items-center justify-center rounded-full"
                                style={{ width: 17, height: 17, background: isHealthy ? 'var(--col-healthy)' : 'var(--col-disease)' }}
                              >
                                <i className={`pi ${isHealthy ? 'pi-check' : 'pi-times'}`} style={{ fontSize: 6, color: 'white' }} />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`badge ${badgeColor} mb-0.5 inline-flex`}>{label || 'Pending'}</span>
                              <p className="m-0 text-xs" style={{ color: 'var(--col-ink-4)' }}>
                                {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' · '}{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="m-0 font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: isHealthy ? 'var(--col-healthy)' : 'var(--col-disease)', letterSpacing: '-0.02em' }}>
                                {accuracy}%
                              </p>
                              <p className="m-0 text-[10px]" style={{ color: 'var(--col-ink-4)' }}>akurasi</p>
                            </div>
                            <i className="pi pi-chevron-right text-xs group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--col-border)' }} />
                          </div>
                          {idx < stats.recentChecks.length - 1 && (
                            <div style={{ height: 1, background: 'var(--col-border-light)', margin: '0 12px' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
