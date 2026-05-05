/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
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
    if (!stats || stats.totalDiagnoses === 0) return { label: 'Siap Analisis', color: 'blue', icon: 'pi-info-circle' };
    const sehatCount = stats.labelCounts['HEALTHY'] || 0;
    const ratio = (sehatCount / stats.totalDiagnoses) * 100;

    if (ratio > 80) return { label: 'Optimal', color: 'emerald', icon: 'pi-check-circle' };
    if (ratio > 50) return { label: 'Waspada', color: 'amber', icon: 'pi-exclamation-triangle' };
    return { label: 'Kritis', color: 'red', icon: 'pi-times-circle' };
  };

  const health = getHealthStatus();

  const chartData = {
    labels: ['Sehat', 'Sakit'],
    datasets: [{
      data: stats ? [
        stats.labelCounts['HEALTHY'] || 0,
        stats.totalDiagnoses - (stats.labelCounts['HEALTHY'] || 0)
      ] : [1, 0],
      backgroundColor: ['#10B981', '#EF4444'],
      hoverBackgroundColor: ['#059669', '#DC2626'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    cutout: '70%',
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    maintainAspectRatio: false
  };

  // New Disease Distribution Chart Data
  const diseaseLabels = stats ? Object.keys(stats.labelCounts).filter(l => l !== 'HEALTHY') : [];
  const diseaseChartData = {
    labels: diseaseLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1).toLowerCase().replace(/_/g, ' ')),
    datasets: [{
      label: 'Temuan',
      data: diseaseLabels.map(l => stats?.labelCounts[l] || 0),
      backgroundColor: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6'],
      borderRadius: 6,
      barThickness: 12
    }]
  };

  const diseaseChartOptions = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { 
        grid: { display: false, drawBorder: false },
        ticks: { display: false }
      },
      y: { 
        grid: { display: false, drawBorder: false },
        ticks: { 
          color: '#64748B',
          font: { weight: '600', size: 11 }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />

      <div className="w-full px-4 md:px-8 py-4 md:py-8">

        {/* Header Section: Context & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-200 shrink-0">
              <i className="pi pi-grid-alt text-3xl"></i>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 m-0 tracking-tight">Dashboard</h1>
              <p className="text-slate-500 m-0 mt-1 text-sm md:text-lg font-medium">
                Selamat datang kembali, <span className="text-blue-600 font-bold">{user?.nama_lengkap}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button label="Panduan Sistem" icon="pi pi-question-circle" className="p-button-outlined p-button-secondary rounded-2xl px-6 font-bold border-2" />
            <Button label="Diagnosa Baru" icon="pi pi-plus-circle" className="p-button-primary shadow-xl shadow-blue-200 rounded-2xl px-8 font-bold" onClick={() => navigate('/predict')} />
          </div>
        </div>

        {/* Zone 1: Summary Cards (Quick Recognition) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Analisis', value: stats?.totalDiagnoses || 0, icon: 'pi-database', color: 'blue' },
            { label: 'Kondisi Sehat', value: stats?.labelCounts['HEALTHY'] || 0, icon: 'pi-check-circle', color: 'emerald' },
            { label: 'Kondisi Sakit', value: stats ? stats.totalDiagnoses - (stats.labelCounts['HEALTHY'] || 0) : 0, icon: 'pi-exclamation-circle', color: 'red' },
            { label: 'Status Sistem', value: health.label, icon: health.icon, color: health.color }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border-1 border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center`}>
                <i className={`pi ${item.icon} text-xl`}></i>
              </div>
              <div>
                <span className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{item.label}</span>
                <span className={`text-3xl font-black tracking-tighter ${item.label === 'Status Sistem' ? `text-${item.color}-600` : 'text-slate-900'}`}>
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Zone 2 & 3: Intelligence & Activity (Balanced Grid) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* Intelligence Section: Visual Data (1/3) */}
          <div className="flex flex-col gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-1 border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="m-0 text-xl font-black text-slate-900 tracking-tight">Penyebaran Kondisi</h3>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">Doughnut</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center h-52 w-52">
                  {stats && <Chart type="doughnut" data={chartData} options={chartOptions} style={{ width: '100%', height: '100%' }} />}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.totalDiagnoses || 0}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Data</span>
                  </div>
                </div>
                <div className="w-full space-y-3 mt-8">
                  <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-2xl border-1 border-emerald-100/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs font-bold text-slate-600">Sehat</span>
                    </div>
                    <span className="text-sm font-black text-emerald-700">{stats?.labelCounts['HEALTHY'] || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-2xl border-1 border-red-100/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs font-bold text-slate-600">Sakit</span>
                    </div>
                    <span className="text-sm font-black text-red-700">{stats ? stats.totalDiagnoses - (stats.labelCounts['HEALTHY'] || 0) : 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-1 border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="m-0 text-xl font-black text-slate-900 tracking-tight">Frekuensi Penyakit</h3>
                <i className="pi pi-chart-bar text-slate-300"></i>
              </div>
              <div className="h-48">
                {stats && diseaseLabels.length > 0 ? (
                  <Chart type="bar" data={diseaseChartData} options={diseaseChartOptions} style={{ height: '100%' }} />
                ) : (
                  <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-xs font-medium italic">
                    Data belum tersedia
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="m-0 text-xl font-bold mb-4">Saran Ahli</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Berdasarkan pemantauan AI, kandang area B membutuhkan perhatian lebih pada kebersihan sanitasi.
                </p>
                <Button label="Baca Selengkapnya" icon="pi pi-arrow-right" iconPos="right" className="p-button-text p-button-sm font-bold text-blue-400 p-0" />
              </div>
              <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Activity Section: Real-time Updates (2/3) */}
          <div className="xl:col-span-2">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-1 border-slate-100 h-full">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="m-0 text-2xl font-black text-slate-900 tracking-tight">Riwayat Aktivitas</h3>
                  <p className="text-slate-500 text-sm m-0 mt-1 font-medium">Log diagnosa terakhir yang dilakukan</p>
                </div>
                <Button label="Semua Data" className="p-button-link text-blue-600 font-bold p-0" icon="pi pi-external-link" onClick={() => navigate('/history')} />
              </div>

              <div className="flex flex-col gap-5 overflow-y-auto pr-4 custom-scrollbar" style={{ maxHeight: '720px' }}>
                {!stats || stats.recentChecks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                      <i className="pi pi-folder-open text-3xl text-slate-300"></i>
                    </div>
                    <p className="m-0 text-slate-400 font-bold text-lg">Belum ada riwayat diagnosa</p>
                  </div>
                ) : (
                  stats.recentChecks.map((item, index) => (
                    <div 
                      key={index} 
                      className="group flex items-center gap-6 p-5 rounded-[2rem] bg-white hover:bg-blue-50/30 transition-all cursor-pointer border-1 border-slate-100 hover:border-blue-100" 
                      onClick={() => navigate(`/history/${item.id}`)}
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={`${IMAGE_BASE_URL}/${item.namaFile}`} 
                          alt="Thumbnail" 
                          className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] object-cover shadow-sm group-hover:shadow-md transition-all border-4 border-white" 
                        />
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${item.hasilPrediksi?.labelPenyakit === 'HEALTHY' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                          <i className={`pi ${item.hasilPrediksi?.labelPenyakit === 'HEALTHY' ? 'pi-check' : 'pi-times'} text-[10px] md:text-xs text-white`}></i>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h4 className="m-0 font-black text-slate-900 text-lg md:text-xl truncate uppercase tracking-tighter">
                              {item.hasilPrediksi?.labelPenyakit || 'Sedang Diproses'}
                            </h4>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] md:text-xs font-bold text-slate-500">
                                <i className="pi pi-calendar text-blue-500"></i> 
                                {new Date(item.tanggalUnggah).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] md:text-xs font-bold text-slate-500">
                                <i className="pi pi-clock text-blue-500"></i> 
                                {new Date(item.tanggalUnggah).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akurasi AI</span>
                            <span className="font-black text-blue-600 text-2xl md:text-4xl tracking-tighter leading-none">
                              {(item.hasilPrediksi?.nilaiAkurasi * 100 || 0).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
