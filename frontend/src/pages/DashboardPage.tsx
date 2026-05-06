/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { User } from '../types';

interface Stats {
  totalDiagnoses: number;
  labelCounts: Record<string, number>;
  recentChecks: any[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const IMAGE_BASE_URL = API_URL.replace('/api', '/uploads');

// ────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
    <div className="skeleton h-10 w-10 rounded-xl mb-4" />
    <div className="skeleton h-3 w-24 rounded mb-3" />
    <div className="skeleton h-8 w-16 rounded" />
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  trend?: string;
  index: number;
}

const colorMap = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',   val: 'text-blue-600',   dot: 'bg-blue-500'   },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600',val: 'text-emerald-600',dot: 'bg-emerald-500' },
  red:     { bg: 'bg-red-50',     icon: 'text-red-600',    val: 'text-red-600',    dot: 'bg-red-500'    },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',  val: 'text-amber-600',  dot: 'bg-amber-500'  },
  purple:  { bg: 'bg-purple-50',  icon: 'text-purple-600', val: 'text-purple-600', dot: 'bg-purple-500' },
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, trend, index }) => {
  const c = colorMap[color];
  return (
    <div
      className={`stat-card bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in delay-${(index + 1) * 100}`}
    >
      <div className="flex items-start justify-between mb-4">
        <span style={{ width: 44, height: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 12 }} className={c.bg}>
          <i className={`pi ${icon}`} style={{ fontSize: 18 }} />
        </span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-extrabold tracking-tight ${typeof value === 'number' || !isNaN(Number(value)) ? 'text-slate-900' : c.val}`}>
        {value}
      </p>
    </div>
  );
};

// ────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<Stats>('/history/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getHealthStatus = () => {
    if (!stats || stats.totalDiagnoses === 0) return { label: 'Siap', color: 'blue' as const, icon: 'pi-info-circle' };
    const sehatCount = stats.labelCounts['HEALTHY'] || 0;
    const ratio = (sehatCount / stats.totalDiagnoses) * 100;
    if (ratio > 80) return { label: 'Optimal', color: 'emerald' as const, icon: 'pi-check-circle' };
    if (ratio > 50) return { label: 'Waspada', color: 'amber' as const, icon: 'pi-exclamation-triangle' };
    return { label: 'Kritis', color: 'red' as const, icon: 'pi-times-circle' };
  };

  const health = getHealthStatus();
  const healthyCount = stats?.labelCounts['HEALTHY'] || 0;
  const sickCount = stats ? stats.totalDiagnoses - healthyCount : 0;

  // Doughnut chart
  const doughnutData = {
    labels: ['Sehat', 'Sakit'],
    datasets: [{
      data: stats ? [healthyCount, sickCount] : [1, 0],
      backgroundColor: ['#10B981', '#F87171'],
      hoverBackgroundColor: ['#059669', '#EF4444'],
      borderWidth: 0,
    }],
  };
  const doughnutOptions = {
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1E293B', padding: 12, titleFont: { size: 13, weight: 'bold' } },
    },
    maintainAspectRatio: false,
  };

  // Disease bar chart
  const diseaseLabels = stats ? Object.keys(stats.labelCounts).filter(l => l !== 'HEALTHY') : [];
  const barData = {
    labels: diseaseLabels.map(l => l.charAt(0) + l.slice(1).toLowerCase().replace(/_/g, ' ')),
    datasets: [{
      label: 'Kasus',
      data: diseaseLabels.map(l => stats?.labelCounts[l] || 0),
      backgroundColor: ['#F87171', '#FBBF24', '#A78BFA', '#60A5FA', '#34D399'],
      borderRadius: 6,
      barThickness: 14,
    }],
  };
  const barOptions: any = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
      y: { grid: { display: false }, ticks: { color: '#64748B', font: { weight: '600', size: 11 } }, border: { display: false } },
    },
    maintainAspectRatio: false,
  };

  const statCards = [
    { label: 'Total Analisis',  value: stats?.totalDiagnoses || 0,  icon: 'pi-database',          color: 'blue'    as const },
    { label: 'Kondisi Sehat',   value: healthyCount,                  icon: 'pi-check-circle',      color: 'emerald' as const, trend: '+Today' },
    { label: 'Kondisi Sakit',   value: sickCount,                     icon: 'pi-exclamation-circle', color: 'red'     as const },
    { label: 'Status Sistem',   value: health.label,                  icon: health.icon,            color: health.color },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <p className="text-sm font-semibold text-slate-400 mb-1">
              {greeting()}, <span className="text-blue-600">{user?.nama_lengkap?.split(' ')[0] || 'Pengguna'}</span> 👋
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-400 mt-1 m-0">
              Pantau kondisi kesehatan ternak Anda secara real-time
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              label="Panduan"
              icon="pi pi-question-circle"
              className="p-button-outlined p-button-secondary !text-slate-600 !border-slate-200 !rounded-xl !px-4 !py-2.5 !text-sm"
            />
            <Button
              label="Diagnosa Baru"
              icon="pi pi-plus"
              className="p-button-primary !rounded-xl !px-5 !py-2.5 !text-sm !font-semibold !shadow-md !shadow-blue-200"
              onClick={() => navigate('/predict')}
            />
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : statCards.map((s, i) => <StatCard key={i} {...s} index={i} />)
          }
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left Column: Charts */}
          <div className="flex flex-col gap-6">

            {/* Doughnut Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fade-in delay-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Sebaran Kondisi</h3>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">Proporsi sehat vs sakit</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Live
                </span>
              </div>

              {loading ? (
                <div className="h-52 flex items-center justify-center">
                  <div className="skeleton w-40 h-40 rounded-full" />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative h-48 w-48">
                    <Chart type="doughnut" data={doughnutData} options={doughnutOptions} style={{ width: '100%', height: '100%' }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-extrabold text-slate-900 leading-none">{stats?.totalDiagnoses || 0}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total</span>
                    </div>
                  </div>

                  <div className="w-full mt-5 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 bg-emerald-50 rounded-xl p-3">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide m-0">Sehat</p>
                        <p className="text-lg font-extrabold text-emerald-700 m-0">{healthyCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 bg-red-50 rounded-xl p-3">
                      <div className="w-2.5 h-2.5 bg-red-400 rounded-full shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-red-700 uppercase tracking-wide m-0">Sakit</p>
                        <p className="text-lg font-extrabold text-red-600 m-0">{sickCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bar Chart — Disease Frequency */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fade-in delay-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Frekuensi Penyakit</h3>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">Distribusi per jenis penyakit</p>
                </div>
                <i className="pi pi-chart-bar text-slate-300 text-lg" />
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[80, 55, 40, 30].map((w, i) => (
                    <div key={i} className={`skeleton h-4 rounded`} style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : diseaseLabels.length > 0 ? (
                <div className="h-44 chart-container">
                  <Chart type="bar" data={barData} options={barOptions} style={{ height: '100%' }} />
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
                  <i className="pi pi-chart-bar text-2xl text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Belum ada data penyakit</p>
                </div>
              )}
            </div>

            {/* AI Advisory Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 animate-fade-in delay-300">
              <div className="flex items-center gap-3 mb-5">
                <span style={{ width: 36, height: 36, minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#2563EB', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(191, 219, 254, 0.5)' }}>
                  <i className="pi pi-camera" style={{ fontSize: 14, color: 'white' }} />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Saran AI</span>
              </div>
              <h4 className="text-base font-bold text-white mb-2 m-0">
                Pemantauan Aktif
              </h4>
              <p className="text-sm text-blue-100 leading-relaxed mb-4">
                {stats && sickCount > 0
                  ? `Ditemukan ${sickCount} kasus perlu perhatian. Segera lakukan isolasi dan konsultasi dengan dokter hewan.`
                  : 'Kondisi ternak dalam keadaan baik. Pertahankan kebersihan kandang dan kualitas pakan.'}
              </p>
              <Button
                label="Lihat Riwayat"
                icon="pi pi-arrow-right"
                iconPos="right"
                className="!p-0 !bg-transparent !border-none !text-white !font-semibold !text-sm !shadow-none hover:!underline"
                onClick={() => navigate('/history')}
              />
            </div>
          </div>

          {/* Right Column: Activity Feed */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full animate-fade-in delay-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Aktivitas Terbaru</h3>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">Log diagnosa terkini</p>
                </div>
                <Button
                  label="Lihat Semua"
                  icon="pi pi-external-link"
                  iconPos="right"
                  className="!p-0 !bg-transparent !border-none !text-blue-600 !font-semibold !text-sm !shadow-none"
                  onClick={() => navigate('/history')}
                />
              </div>

              {/* Feed */}
              <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: '600px' }}>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4">
                        <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="skeleton h-4 w-32 rounded" />
                          <div className="skeleton h-3 w-48 rounded" />
                        </div>
                        <div className="skeleton h-8 w-16 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : !stats || stats.recentChecks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-slate-200">
                      <i className="pi pi-folder-open text-2xl text-slate-300" />
                    </div>
                    <p className="font-semibold text-slate-400 text-sm m-0">Belum ada riwayat diagnosa</p>
                    <p className="text-xs text-slate-300 mt-1 m-0">Mulai diagnosa pertama Anda sekarang</p>
                    <Button
                      label="Mulai Diagnosa"
                      icon="pi pi-camera"
                      className="!mt-5 p-button-primary !rounded-xl !px-5 !py-2.5 !text-sm !shadow-md !shadow-blue-200"
                      onClick={() => navigate('/predict')}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.recentChecks.map((item, index) => {
                      const isHealthy = item.hasilPrediksi?.labelPenyakit === 'HEALTHY';
                      const accuracy = ((item.hasilPrediksi?.nilaiAkurasi || 0) * 100).toFixed(1);
                      const date = new Date(item.tanggalUnggah);
                      return (
                        <div
                          key={index}
                          className="activity-row group flex items-center gap-4 p-4 rounded-xl cursor-pointer border border-transparent hover:border-slate-100"
                          onClick={() => navigate(`/history/${item.id}`)}
                        >
                          {/* Thumbnail */}
                          <div className="relative shrink-0">
                            <img
                              src={`${IMAGE_BASE_URL}/${item.namaFile}`}
                              alt="Sample"
                              className="w-14 h-14 rounded-xl object-cover shadow-sm border-2 border-slate-100"
                            />
                            <span
                              className={`absolute -bottom-1.5 -right-1.5 border-2 border-white shadow-sm ${isHealthy ? 'bg-emerald-500' : 'bg-red-400'}`}
                              style={{ width: 20, height: 20, minWidth: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%' }}
                            >
                              <i className={`pi ${isHealthy ? 'pi-check' : 'pi-times'}`} style={{ fontSize: 8, color: 'white' }} />
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`status-badge text-[10px] ${isHealthy ? 'healthy' : item.hasilPrediksi?.labelPenyakit === 'NEWCASTLE' ? 'newcastle' : item.hasilPrediksi?.labelPenyakit === 'SALMONELLA' ? 'salmonella' : 'disease'}`}>
                                {item.hasilPrediksi?.labelPenyakit || 'Pending'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 m-0">
                              <i className="pi pi-calendar text-[10px] mr-1" />
                              {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' · '}
                              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {/* Accuracy */}
                          <div className="text-right shrink-0">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5 m-0">Confidence</p>
                            <p className={`text-xl font-extrabold tracking-tight m-0 ${isHealthy ? 'text-emerald-600' : 'text-red-500'}`}>
                              {accuracy}%
                            </p>
                          </div>

                          {/* Arrow */}
                          <i className="pi pi-chevron-right text-slate-300 text-xs group-hover:text-slate-500 transition-colors" />
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
