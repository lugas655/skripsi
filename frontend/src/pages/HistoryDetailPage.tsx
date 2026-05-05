/// <reference types="vite/client" />
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Card } from 'primereact/card';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Citra } from '../types';

const HistoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: detail, isLoading } = useQuery<Citra>({
    queryKey: ['history', id],
    queryFn: async () => {
      const response = await api.get(`/history/${id}`);
      return response.data;
    },
  });

  const IMAGE_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '/uploads');

  const getTheme = (label: string) => {
    const l = label?.toUpperCase();
    if (l === 'HEALTHY') return { color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'pi-check-circle' };
    if (l === 'COCCIDIOSIS') return { color: '#EF4444', bg: 'bg-red-50', text: 'text-red-700', icon: 'pi-exclamation-triangle' };
    if (l === 'NEWCASTLE') return { color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'pi-info-circle' };
    if (l === 'SALMONELLA') return { color: '#3B82F6', bg: 'bg-blue-50', text: 'text-blue-700', icon: 'pi-info-circle' };
    return { color: '#64748B', bg: 'bg-slate-50', text: 'text-slate-700', icon: 'pi-question-circle' };
  };

  const getLabelDescription = (label: string) => {
    switch (label?.toUpperCase()) {
      case 'HEALTHY': return 'Kondisi feses ayam menunjukkan parameter kesehatan yang optimal. Pastikan ventilasi dan kualitas air minum tetap terjaga.';
      case 'COCCIDIOSIS': return 'Terdeteksi Koksidiosis. Segera bersihkan kotoran yang basah, ganti alas kandang (litter), dan konsultasikan pemberian koksidiostat.';
      case 'NEWCASTLE': return 'Sinyal Bahaya: Newcastle Disease terdeteksi. Virus ini sangat cepat menyebar. Segera lakukan isolasi total dan lapor petugas kesehatan hewan.';
      case 'SALMONELLA': return 'Indikasi Salmonella. Perhatikan kebersihan tempat pakan dan segera berikan antibiotik yang sesuai untuk unggas.';
      default: return 'Data analisis tidak tersedia.';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Data tidak ditemukan</h2>
          <Button label="Kembali ke Riwayat" className="mt-4" onClick={() => navigate('/history')} />
        </div>
      </div>
    );
  }

  const theme = getTheme(detail.hasilPrediksi?.labelPenyakit || '');

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <div className="w-full px-4 md:px-8 py-8">
        {/* Back Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            icon="pi pi-arrow-left" 
            className="p-button-rounded p-button-text text-slate-900 hover:bg-slate-200" 
            onClick={() => navigate('/history')} 
          />
          <div>
            <h1 className="text-3xl font-black text-slate-900 m-0">Detail Diagnosa</h1>
            <p className="text-slate-500 m-0 text-sm font-bold uppercase tracking-widest mt-1">
              ID RIWAYAT: #{detail.id.toString().padStart(4, '0')}
            </p>
          </div>
        </div>

        {/* 2-Column Balanced Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Image Preview (5/12) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border-1 border-slate-200">
              <div className="rounded-[2rem] overflow-hidden shadow-lg border-4 border-white aspect-square relative">
                <img 
                  src={`${IMAGE_BASE_URL}/${detail.namaFile}`} 
                  alt="Citra Diagnosis" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl font-bold text-slate-900 shadow-lg flex items-center gap-2">
                    <i className="pi pi-calendar text-blue-600"></i>
                    {new Date(detail.tanggalUnggah).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="p-6 mt-2">
                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Informasi Berkas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Nama File</span>
                    <span className="block text-slate-900 font-bold text-xs truncate">{detail.namaFile}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Waktu</span>
                    <span className="block text-slate-900 font-bold text-xs">
                      {new Date(detail.tanggalUnggah).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Analysis Detail (7/12) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Analysis Result Card */}
            <div className="bg-white rounded-[2.5rem] shadow-lg overflow-hidden border-1 border-slate-200">
              <div className={`p-8 flex items-center justify-between ${theme.bg}`}>
                <div>
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-white shadow-sm mb-4 ${theme.text}`}>
                    LAPORAN ANALISIS AI
                  </span>
                  <h2 className={`text-5xl font-black m-0 ${theme.text}`}>
                    {detail.hasilPrediksi?.labelPenyakit}
                  </h2>
                </div>
                <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center">
                  <i className={`pi ${theme.icon} text-4xl`} style={{ color: theme.color }}></i>
                </div>
              </div>
              
              <div className="p-8">
                <div className="bg-slate-50 p-6 rounded-2xl border-1 border-slate-100 mb-8">
                  <p className="text-slate-600 m-0 text-lg leading-relaxed font-medium">
                    {getLabelDescription(detail.hasilPrediksi?.labelPenyakit || '')}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Skor Keyakinan</span>
                    <span className="text-3xl font-black text-blue-600">
                      {(detail.hasilPrediksi?.nilaiAkurasi ? detail.hasilPrediksi.nilaiAkurasi * 100 : 0).toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar 
                    value={(detail.hasilPrediksi?.nilaiAkurasi || 0) * 100} 
                    showValue={false} 
                    style={{ height: '16px' }} 
                    color={theme.color} 
                    className="rounded-full bg-slate-100" 
                  />
                </div>
              </div>
            </div>

            {/* Probability Breakdown */}
            <Card className="shadow-sm border-round-[2.5rem] border-none surface-card p-4">
              <h3 className="m-0 text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <i className="pi pi-chart-bar text-blue-600"></i> Detail Probabilitas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {detail.hasilPrediksi?.allProbs && Object.entries(detail.hasilPrediksi.allProbs).map(([label, prob]) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-600 capitalize text-sm">{label.toLowerCase()}</span>
                      <span className="font-black text-slate-900 text-sm">{(prob as number * 100).toFixed(1)}%</span>
                    </div>
                    <ProgressBar 
                      value={prob as number * 100} 
                      showValue={false} 
                      style={{ height: '8px' }} 
                      color={getTheme(label).color} 
                      className="rounded-full bg-slate-50 shadow-inner" 
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Footer */}
            <div className="flex gap-4">
              <Button 
                label="Cetak Laporan" 
                icon="pi pi-print" 
                outlined 
                className="flex-1 rounded-2xl py-4 font-bold border-slate-300 text-slate-700"
                onClick={() => window.print()}
              />
              <Button 
                label="Diagnosa Baru" 
                icon="pi pi-plus" 
                className="flex-1 p-button-primary rounded-2xl py-4 font-bold shadow-lg"
                onClick={() => navigate('/predict')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailPage;
