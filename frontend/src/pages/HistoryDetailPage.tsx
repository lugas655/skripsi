/// <reference types="vite/client" />
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProgressBar } from 'primereact/progressbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Skeleton } from 'primereact/skeleton';
import Navbar from '../components/Navbar';
import PrintReport from '../components/PrintReport';
import { historyService } from '../services/historyService';
import { IMAGE_BASE_URL } from '../api/api';
import { Citra } from '../types';

const getTheme = (label: string) => {
  const l = label?.toUpperCase();
  if (l === 'HEALTHY')     return { color: '#2563EB', bg: 'var(--col-healthy-pale)', border: '1px solid #BFDBFE', text: 'var(--col-healthy)', icon: 'pi-check-circle',        label: 'Sehat'        };
  if (l === 'COCCIDIOSIS') return { color: '#DC2626', bg: 'var(--col-disease-pale)', border: '1px solid #fecaca', text: 'var(--col-disease)', icon: 'pi-exclamation-triangle', label: 'Koksidiosis'  };
  if (l === 'NEWCASTLE')   return { color: '#D97706', bg: 'var(--col-warn-pale)',    border: '1px solid #fde68a', text: 'var(--col-warn)',    icon: 'pi-exclamation-circle',   label: 'Newcastle'    };
  if (l === 'SALMONELLA')  return { color: '#2563EB', bg: 'var(--col-info-pale)',    border: '1px solid #bfdbfe', text: 'var(--col-info)',    icon: 'pi-shield',               label: 'Salmonella'   };
  return { color: '#64748B', bg: '#F8FAFC', border: '1px solid #E2E8F0', text: '#475569', icon: 'pi-question-circle', label: label };
};

const getDesc = (label: string) => {
  switch (label?.toUpperCase()) {
    case 'HEALTHY':     return 'Kondisi feses ayam menunjukkan parameter kesehatan yang optimal.';
    case 'COCCIDIOSIS': return 'Terdeteksi Koksidiosis. Segera ganti alas kandang dan konsultasikan koksidiostat.';
    case 'NEWCASTLE':   return 'Bahaya: Newcastle Disease terdeteksi. Lakukan isolasi total segera.';
    case 'SALMONELLA':  return 'Indikasi Salmonella. Bersihkan tempat pakan dan berikan antibiotik.';
    default:            return 'Data analisis tidak tersedia.';
  }
};

const HistoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: detail, isLoading } = useQuery<Citra>({
    queryKey: ['history', id],
    queryFn: () => { if (!id) throw new Error('ID required'); return historyService.getHistoryById(id); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => historyService.deleteHistory(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['history'] }); navigate('/history'); },
  });

  const confirmDelete = () => {
    confirmDialog({
      message: 'Hapus riwayat diagnosa ini?', header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle', acceptLabel: 'Hapus', rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger !rounded-lg !px-4',
      rejectClassName: 'p-button-text !text-slate-500 !rounded-lg !mr-3 !px-4',
      accept: () => detail && deleteMutation.mutate(detail.id),
    });
  };

  if (isLoading) return (
    <div className="min-h-screen" style={{ background: 'var(--col-surface)' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8">
        <div className="flex items-center gap-4 mb-8"><Skeleton shape="circle" size="2.5rem" /><div><Skeleton width="14rem" height="2rem" className="mb-2" /><Skeleton width="8rem" height="0.875rem" /></div></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5"><Skeleton width="100%" height="28rem" borderRadius="1.25rem" /></div>
          <div className="lg:col-span-7 flex flex-col gap-5"><Skeleton width="100%" height="14rem" borderRadius="1.25rem" /><Skeleton width="100%" height="11rem" borderRadius="1.25rem" /></div>
        </div>
      </div>
    </div>
  );

  if (!detail) return (
    <div className="min-h-screen" style={{ background: 'var(--col-surface)' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-20 text-center">
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>Data tidak ditemukan</h2>
        <button onClick={() => navigate('/history')} className="mt-4 px-5 py-2.5 rounded-xl text-white font-semibold"
          style={{ background: 'var(--col-brand)', border: 'none', cursor: 'pointer' }}>
          Kembali ke Riwayat
        </button>
      </div>
    </div>
  );

  const isLowConfidence = (detail.hasilPrediksi?.nilaiAkurasi || 0) < 0.70;
  const t = isLowConfidence 
    ? { color: '#D97706', bg: 'var(--col-warn-pale)', border: '1px solid #fde68a', text: 'var(--col-warn)', icon: 'pi-question-circle', label: 'Tidak Terdeteksi' }
    : getTheme(detail.hasilPrediksi?.labelPenyakit || '');
  const accuracy = ((detail.hasilPrediksi?.nilaiAkurasi || 0) * 100).toFixed(1);

  return (
    <>
      <ConfirmDialog />
      <div className="print-only"><PrintReport detail={detail} /></div>
      <div className="web-only min-h-screen pb-20" style={{ background: 'var(--col-surface)' }}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-14 animate-fade-up">

          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <h1 className="m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.875rem', color: 'var(--col-ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                Laporan Diagnosa
              </h1>
              <div className="flex flex-col gap-2 mt-4">
                <p className="m-0 text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--col-ink-4)' }}>
                  <i className="pi pi-calendar" style={{ fontSize: 10 }} />
                  Dibuat pada {new Date(detail.tanggalUnggah).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} pukul {new Date(detail.tanggalUnggah).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider w-fit" style={{ background: 'var(--col-surface)', border: '1px solid var(--col-border)', color: 'var(--col-ink-3)' }}>
                  <span className="font-bold" style={{ color: 'var(--col-ink-4)' }}>NO. REFERENSI:</span>
                  <span className="tracking-[0.15em]" style={{ color: 'var(--col-ink-2)' }}>#{detail.id.toString().padStart(5, '0')}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{ background: 'var(--col-card)', border: '1px solid var(--col-border)', color: 'var(--col-ink-2)', fontFamily: 'var(--font-display)', boxShadow: 'var(--sh-sm)' }}
              >
                <i className="pi pi-print" style={{ fontSize: 12 }} />
                Cetak PDF
              </button>
              <button
                onClick={() => navigate('/predict')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 cursor-pointer shadow-md shadow-blue-900/10"
                style={{ background: 'var(--col-brand)', border: 'none', fontFamily: 'var(--font-display)' }}
              >
                <i className="pi pi-plus" style={{ fontSize: 12 }} />
                Diagnosa Baru
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left: Visual Evidence */}
            <div className="lg:col-span-5 space-y-6">
              <div className="card !p-0 overflow-hidden group shadow-xl shadow-slate-200/50">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img src={`${IMAGE_BASE_URL}/${detail.namaFile}`} alt="Evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  
                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-x-4 bottom-4">
                    <div className="backdrop-blur-md bg-white/70 border border-white/50 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-inner" style={{ background: t.color }}>
                          <i className={`pi ${t.icon}`} style={{ fontSize: 18 }} />
                        </div>
                        <div>
                          <p className="m-0 text-[10px] font-black uppercase tracking-widest text-slate-500/80 leading-none mb-1">Hasil Identifikasi</p>
                          <p className="m-0 font-bold text-lg leading-none" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>{t.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="m-0 text-[10px] font-black uppercase tracking-widest text-slate-500/80 leading-none mb-1">Akurasi</p>
                        <p className="m-0 font-bold text-lg leading-none" style={{ fontFamily: 'var(--font-mono)', color: t.color }}>{accuracy}%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Technical Specs */}
                <div className="p-6" style={{ background: 'var(--col-card)' }}>
                  <h3 className="diag-label mb-4 flex items-center gap-2" style={{ color: 'var(--col-ink-4)' }}>
                    <i className="pi pi-info-circle" />
                    Spesifikasi Teknis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl" style={{ background: 'var(--col-surface)', border: '1px solid var(--col-border)' }}>
                      <p className="diag-label m-0 mb-1">Nama Berkas</p>
                      <p className="m-0 text-xs font-bold truncate" style={{ color: 'var(--col-ink-2)' }} title={detail.namaFile}>{detail.namaFile}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl" style={{ background: 'var(--col-surface)', border: '1px solid var(--col-border)' }}>
                      <p className="diag-label m-0 mb-1">Model AI</p>
                      <p className="m-0 text-xs font-bold" style={{ color: 'var(--col-ink-2)' }}>ViT-Base Patch16</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Analytical Insight */}
            <div className="lg:col-span-7 space-y-6">

              {/* Main Analysis Card */}
              <div className="card !p-0 overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="px-8 pt-8 pb-3 border-b border-slate-100 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2" style={{ background: t.bg, color: t.text }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: t.color }} />
                      Analisis Vision Transformer
                    </div>
                    <h2 className="m-0 text-4xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)', letterSpacing: '-0.03em' }}>
                      Diagnosis <span style={{ color: t.color }}>{t.label}</span>
                    </h2>
                    <p className="m-0 text-sm font-medium text-slate-400">Klasifikasi berbasis pola morfologi feses unggas</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 shadow-inner">
                    <i className={`pi ${t.icon}`} style={{ fontSize: 24, color: t.color }} />
                  </div>
                </div>

                <div className="px-8 pt-4 pb-6 space-y-6 bg-white">
                  {/* AI Insight Box */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative p-6 rounded-2xl border-2 border-dashed flex flex-col md:flex-row gap-6 items-center" style={{ borderColor: t.bg, background: 'var(--col-surface)' }}>
                      <div className="flex-1">
                        <h4 className="m-0 mb-3 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: t.text }}>
                          <i className="pi pi-sparkles" />
                          Rekomendasi AI Doctor
                        </h4>
                        <p className="m-0 text-base font-medium italic leading-relaxed text-slate-600">
                          "{isLowConfidence ? 'Gambar yang Anda unggah bukan merupakan feses.' : (detail.hasilPrediksi?.saranAI || getDesc(detail.hasilPrediksi?.labelPenyakit || ''))}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Probability Breakdown */}
                  <div>
                    <h4 className="m-0 mb-5 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'var(--col-ink-4)' }}>
                      <i className="pi pi-chart-bar" />
                      Distribusi Probabilitas Penyakit
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detail.hasilPrediksi?.allProbs && Object.entries(detail.hasilPrediksi.allProbs).map(([lbl, prob]) => {
                        const th = getTheme(lbl);
                        const isMain = lbl === detail.hasilPrediksi?.labelPenyakit;
                        return (
                          <div key={lbl} className={`p-4 rounded-2xl border transition-all ${isMain ? 'shadow-md scale-[1.02]' : ''}`} 
                            style={{ borderColor: isMain ? th.color : 'var(--col-border)', background: isMain ? 'white' : 'var(--col-surface)' }}>
                            <div className="flex justify-between items-center mb-2.5">
                              <span className={`text-[11px] font-black uppercase tracking-wider`} style={{ color: isMain ? th.text : 'var(--col-ink-4)' }}>{th.label}</span>
                              <span className="font-mono text-sm font-bold" style={{ color: isMain ? th.text : 'var(--col-ink-3)' }}>{((prob as number) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--col-border-light)' }}>
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(prob as number) * 100}%`, background: isMain ? th.color : 'var(--col-border)' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Danger zone footer */}
                <div className="p-6 border-t flex justify-center" style={{ background: 'var(--col-surface)', borderColor: 'var(--col-border)' }}>
                   <button
                    onClick={confirmDelete}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
                  >
                    <i className="pi pi-trash" />
                    Hapus Laporan Ini
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default HistoryDetailPage;
