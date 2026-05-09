/// <reference types="vite/client" />
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Card } from 'primereact/card';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Navbar from '../components/Navbar';
import PrintReport from '../components/PrintReport';
import { historyService } from '../services/historyService';
import { IMAGE_BASE_URL } from '../api/api';
import { Citra } from '../types';

const HistoryDetailPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: detail, isLoading } = useQuery<Citra>({
    queryKey: ['history', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      return await historyService.getHistoryById(id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => historyService.deleteHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      navigate('/history');
    },
  });

  const confirmDelete = () => {
    confirmDialog({
      message: 'Apakah Anda yakin ingin menghapus riwayat diagnosa ini?',
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger !rounded-lg !px-4',
      rejectClassName: 'p-button-text !text-slate-500 !rounded-lg !mr-3 !px-4',
      accept: () => detail && deleteMutation.mutate(detail.id),
    });
  };



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
    <>
      <ConfirmDialog />
      {/* --- PRINT ONLY UI --- */}
      <div className="print-only">
        <PrintReport detail={detail} />
      </div>

      {/* --- WEB UI --- */}
      <div className="web-only min-h-screen bg-slate-50 pb-12">
        <Navbar />
        
        <div className="w-full px-4 md:px-8 py-8">
        {/* Back Header */}
        <div className="flex items-center gap-4 mb-8 print:mb-4">
          <Button 
            icon="pi pi-arrow-left" 
            className="p-button-rounded p-button-text text-slate-900 hover:bg-slate-200 print:hidden" 
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:flex print:flex-row print:gap-6 print:items-start">
          
          {/* Left Side: Image Preview (5/12) */}
          <div className="lg:col-span-5 print:w-[35%] print:mb-0">
            <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border-1 border-slate-200 print:shadow-none print:border-none print:p-0">
              <div className="rounded-[2rem] overflow-hidden shadow-lg border-4 border-white aspect-square relative print:shadow-none print:border-slate-300 print:border-2">
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
              <div className="p-6 mt-2 print:p-2 print:mt-2">
                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 print:mb-2">Informasi Berkas</h4>
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
          <div className="lg:col-span-7 flex flex-col gap-8 print:w-[65%] print:gap-4 print:mt-0">
            {/* Analysis Result Card */}
            <div className="bg-white rounded-[2.5rem] shadow-lg overflow-hidden border-1 border-slate-200 print:shadow-none print:border-slate-300 print:border print:rounded-2xl">
              <div className={`p-8 flex items-center justify-between ${theme.bg} print:bg-white print:border-b print:border-slate-200 print:p-4`}>
                <div>
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-white shadow-sm mb-4 print:mb-2 print:border print:border-slate-200 ${theme.text}`}>
                    LAPORAN ANALISIS AI
                  </span>
                  <h2 className={`text-5xl font-black m-0 print:text-3xl ${theme.text}`}>
                    {detail.hasilPrediksi?.labelPenyakit}
                  </h2>
                </div>
                <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center print:w-12 print:h-12 print:shadow-none print:border print:border-slate-200">
                  <i className={`pi ${theme.icon} text-4xl print:text-2xl`} style={{ color: theme.color }}></i>
                </div>
              </div>
              
              <div className="p-8 print:p-6">
                <div className="bg-slate-50 p-6 rounded-2xl border-1 border-slate-100 mb-8 print:bg-white print:mb-6">
                  {detail.hasilPrediksi?.saranAI ? (
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2 flex items-center gap-2">
                        <i className="pi pi-sparkles"></i> Saran AI Doctor
                      </span>
                      <p className="text-slate-700 m-0 text-lg leading-relaxed font-medium print:text-base">
                        {detail.hasilPrediksi.saranAI}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-600 m-0 text-lg leading-relaxed font-medium print:text-base">
                      {getLabelDescription(detail.hasilPrediksi?.labelPenyakit || '')}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-4 print:gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs print:text-[10px]">Skor Keyakinan</span>
                    <span className="text-3xl font-black text-blue-600 print:text-xl">
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
            <div className="bg-white shadow-sm rounded-[2.5rem] border-none p-4 print:shadow-none print:p-4 print:border print:border-slate-300 print:rounded-2xl">
              <h3 className="m-0 text-xl font-black text-slate-900 mb-8 print:mb-4 print:text-base flex items-center gap-3">
                <i className="pi pi-chart-bar text-blue-600"></i> Detail Probabilitas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 print:gap-y-3 print:gap-x-8">
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
            </div>

            {/* Action Footer */}
            <div className="flex flex-wrap gap-4 print:hidden">
              <Button 
                label="Cetak Laporan" 
                icon="pi pi-print" 
                className="flex-1 min-w-[140px] justify-center gap-3 rounded-2xl py-4 font-bold border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm transition-all [&>.p-button-label]:flex-none [&>.p-button-icon]:mr-0"
                onClick={() => window.print()}
              />
              <Button 
                label="Hapus" 
                icon="pi pi-trash" 
                className="flex-1 min-w-[140px] justify-center gap-3 rounded-2xl py-4 font-bold border-2 border-red-100 bg-red-50 text-red-600 hover:bg-red-100 shadow-sm transition-all [&>.p-button-label]:flex-none [&>.p-button-icon]:mr-0"
                onClick={confirmDelete}
                loading={deleteMutation.isPending}
              />
              <Button 
                label="Diagnosa Baru" 
                icon="pi pi-plus" 
                className="flex-1 min-w-[140px] justify-center gap-3 bg-slate-900 border-none hover:bg-slate-800 text-white rounded-2xl py-4 font-bold shadow-lg [&>.p-button-label]:flex-none [&>.p-button-icon]:mr-0"
                onClick={() => navigate('/predict')}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default HistoryDetailPage;
