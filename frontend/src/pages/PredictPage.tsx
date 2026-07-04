/// <reference types="vite/client" />
import React, { useState, useRef } from 'react';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import Navbar from '../components/Navbar';
import { predictService } from '../services/predictService';
import { PredictResponse } from '../types';

/* ── Disease theme ── */
interface DTheme { color: string; bg: string; border: string; text: string; label: string; icon: string; desc: string; }
const getTheme = (label: string): DTheme => {
  const l = label.toUpperCase();
  const map: Record<string, DTheme> = {
    HEALTHY:    { color: '#2563EB', bg: 'var(--col-healthy-pale)',  border: '1px solid #BFDBFE', text: 'var(--col-healthy)',  label: 'Sehat',             icon: 'pi-check-circle',        desc: 'Kondisi feses menunjukkan parameter kesehatan optimal. Pertahankan ventilasi & kualitas air minum.' },
    COCCIDIOSIS:{ color: '#DC2626', bg: 'var(--col-disease-pale)',  border: '1px solid #fecaca', text: 'var(--col-disease)',  label: 'Koksidiosis',       icon: 'pi-exclamation-triangle', desc: 'Terdeteksi Koksidiosis. Ganti alas kandang dan konsultasikan koksidiostat dengan dokter hewan.' },
    NEWCASTLE:  { color: '#D97706', bg: 'var(--col-warn-pale)',     border: '1px solid #fde68a', text: 'var(--col-warn)',     label: 'Newcastle Disease', icon: 'pi-exclamation-circle',   desc: 'Bahaya: Newcastle Disease terdeteksi. Lakukan isolasi total dan lapor petugas kesehatan hewan.' },
    SALMONELLA: { color: '#2563EB', bg: 'var(--col-info-pale)',     border: '1px solid #bfdbfe', text: 'var(--col-info)',     label: 'Salmonella',        icon: 'pi-shield',               desc: 'Indikasi Salmonella. Bersihkan tempat pakan/minum dan berikan antibiotik yang sesuai.' },
  };
  return map[l] || { color: '#64748B', bg: '#F8FAFC', border: '1px solid #E2E8F0', text: '#475569', label: label, icon: 'pi-question-circle', desc: 'Data analisis tidak tersedia.' };
};

/* ── Empty & Loading states ── */
const EmptyState = () => (
  <div className="card flex flex-col items-center justify-center p-12 text-center min-h-80" style={{ border: '2px dashed var(--col-border)', background: 'transparent', boxShadow: 'none' }}>
    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--col-surface)', border: '1px solid var(--col-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
      <i className="pi pi-search" style={{ fontSize: 22, color: 'var(--col-ink-4)' }} />
    </div>
    <h3 className="m-0 mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--col-ink-3)' }}>Menunggu Analisis</h3>
    <p className="m-0 text-xs max-w-xs" style={{ color: 'var(--col-ink-4)' }}>
      Unggah foto feses ayam di panel kiri, lalu klik "Mulai Diagnosis".
    </p>
  </div>
);

const LoadingState = () => (
  <div className="card flex flex-col items-center justify-center p-12 text-center min-h-80 animate-scale-in">
    <div className="relative mb-5">
      <div className="spin-ring" />
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="pi pi-bolt animate-pulse" style={{ fontSize: 18, color: 'var(--col-brand)' }} />
      </div>
    </div>
    <h3 className="m-0 mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--col-ink)' }}>Memproses Gambar...</h3>
    <p className="m-0 text-xs max-w-xs mb-5" style={{ color: 'var(--col-ink-4)' }}>Vision Transformer sedang menganalisis citra feses.</p>
    <div className="w-full max-w-xs"><ProgressBar mode="indeterminate" style={{ height: '3px' }} /></div>
  </div>
);

/* ── Confidence Ring (SVG) ── */
const ConfidenceRing: React.FC<{ value: number; color: string; size?: number }> = ({ value, color, size = 90 }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--col-border)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color, lineHeight: 1 }}>{value.toFixed(1)}%</span>
      </div>
    </div>
  );
};

/* ── Result Card ── */
const ResultCard: React.FC<{ prediction: PredictResponse['data']; onRemove: () => void; fileInfo?: {name:string; preview:string} }> = ({ prediction, onRemove, fileInfo }) => {
  const [showProbs, setShowProbs] = React.useState(false);
  const isLowConfidence = prediction.prediksi.nilaiAkurasi < 0.70;

  const t = isLowConfidence 
    ? { color: '#D97706', bg: '#FFFBEB', border: '1px solid #fde68a', text: '#92400E', label: 'Tidak Terdeteksi', icon: 'pi-question-circle', desc: 'Gambar yang Anda unggah bukan merupakan feses, atau kualitas gambar terlalu rendah.' }
    : getTheme(prediction.prediksi.labelPenyakit);
  
  const labelText = isLowConfidence ? 'UNKNOWN' : prediction.prediksi.labelPenyakit;
  const pctVal = prediction.prediksi.nilaiAkurasi * 100;

  return (
    <div className="animate-scale-in" style={{ marginBottom: 12 }}>
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--col-card)', border: '1px solid var(--col-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* ─ Accent strip ─ */}
        <div style={{ height: 5, background: `linear-gradient(90deg, ${t.color}, ${t.color}88)` }} />

        {/* ─ Hero section ─ */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* Image preview */}
            {fileInfo && (
              <img
                src={fileInfo.preview} alt="Preview"
                onClick={() => window.open(fileInfo.preview, '_blank')}
                style={{ width: 64, height: 64, minWidth: 64, borderRadius: 14, objectFit: 'cover', border: `2px solid ${t.color}30`, cursor: 'pointer', transition: 'transform .2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                title="Klik untuk memperbesar"
              />
            )}
            {/* Title */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <i className={`pi ${t.icon}`} style={{ fontSize: 14, color: t.color }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.text }}>Hasil Diagnosa</span>
              </div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: t.color, lineHeight: 1.15 }}>
                {t.label}
              </h2>
              {fileInfo && (
                <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--col-ink-4)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fileInfo.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─ Confidence + Time row ─ */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <ConfidenceRing value={pctVal} color={t.color} size={80} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--col-surface)', border: '1px solid var(--col-border)' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--col-ink-4)', display: 'block', marginBottom: 2 }}>Kepercayaan AI</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: t.color }}>{pctVal.toFixed(1)}%</span>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--col-surface)', border: '1px solid var(--col-border)' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--col-ink-4)', display: 'block', marginBottom: 2 }}>Waktu Analisis</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--col-ink)' }}>{prediction.prediksi.waktuProses.toFixed(2)}s</span>
            </div>
          </div>
        </div>

        {/* ─ Divider ─ */}
        <div style={{ height: 1, background: 'var(--col-border)', margin: '0 20px' }} />

        {/* ─ AI Advice ─ */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ borderRadius: 14, padding: '16px 18px', background: t.bg, border: t.border, position: 'relative', overflow: 'hidden' }}>
            {/* Decorative watermark */}
            <i className={`pi ${t.icon}`} style={{ position: 'absolute', right: -8, bottom: -8, fontSize: 64, color: t.color, opacity: 0.06, transform: 'rotate(15deg)' }} />
            
            {isLowConfidence ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="pi pi-exclamation-triangle" style={{ fontSize: 15, color: t.color }} />
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.8rem', color: t.color }}>Peringatan</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.6, color: t.text }}>
                    Gambar yang Anda unggah kemungkinan bukan feses ayam, atau kualitas terlalu rendah untuk dianalisis. Coba unggah foto yang lebih jelas.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="pi pi-verified" style={{ fontSize: 13, color: t.color }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: t.color }}>Rekomendasi AI</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.7, color: t.text, fontWeight: 500 }}>
                  {prediction.prediksi.saranAI || t.desc}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─ Expandable probability section ─ */}
        {prediction.prediksi.allProbs && !isLowConfidence && (
          <div style={{ padding: '0 20px 16px' }}>
            <button
              onClick={() => setShowProbs(p => !p)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 12, border: '1px solid var(--col-border)',
                background: 'var(--col-surface)', cursor: 'pointer', transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--col-border)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--col-surface)')}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--col-ink-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="pi pi-chart-bar" style={{ fontSize: 12 }} /> Detail Probabilitas
              </span>
              <i className={`pi pi-chevron-${showProbs ? 'up' : 'down'}`} style={{ fontSize: 11, color: 'var(--col-ink-4)' }} />
            </button>

            {showProbs && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6, animation: 'fadeIn .25s ease' }}>
                {Object.entries(prediction.prediksi.allProbs)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([lbl, prob]) => {
                    const th = getTheme(lbl);
                    const isTop = lbl === prediction.prediksi.labelPenyakit;
                    const probVal = (prob as number) * 100;
                    return (
                      <div key={lbl} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                        borderRadius: 10, background: isTop ? th.bg : 'var(--col-surface)',
                        border: isTop ? th.border : '1px solid var(--col-border)',
                      }}>
                        <i className={`pi ${th.icon}`} style={{ fontSize: 13, color: th.color, width: 18, textAlign: 'center' as const }} />
                        <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: isTop ? th.color : 'var(--col-ink-2)' }}>{th.label}</span>
                        <div style={{ width: 80 }}>
                          <div style={{ height: 4, borderRadius: 2, background: 'var(--col-border)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${probVal}%`, borderRadius: 2, background: th.color, transition: 'width .6s ease' }} />
                          </div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: isTop ? th.color : 'var(--col-ink-3)', minWidth: 42, textAlign: 'right' as const }}>{probVal.toFixed(1)}%</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ─ CTA ─ */}
        <div style={{ padding: '0 20px 20px' }}>
          <button
            onClick={() => {
              const el = document.querySelector('.p-fileupload');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`,
              color: 'white', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-display)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'transform .15s, box-shadow .15s', boxShadow: `0 4px 14px ${t.color}30`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${t.color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 14px ${t.color}30`; }}
          >
            <i className="pi pi-camera" style={{ fontSize: 15 }} /> Diagnosa Foto Lain
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
interface PredictItem {
  id: string;
  fileInfo: { name: string; size: string; preview: string };
  file: File;
  loading: boolean;
  prediction: PredictResponse['data'] | null;
  error: string | null;
}

const PredictPage: React.FC = () => {
  const [items, setItems] = useState<PredictItem[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  React.useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const onUpload = async (event: FileUploadHandlerEvent) => {
    const files = event.files;
    
    const newItems: PredictItem[] = await Promise.all(files.map(async (file) => {
      const preview = await new Promise<string>((resolve) => {
        const fr = new FileReader();
        fr.onload = e => resolve(e.target?.result as string);
        fr.readAsDataURL(file);
      });
      return {
        id: Math.random().toString(36).substr(2, 9),
        fileInfo: { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, preview },
        file,
        loading: true,
        prediction: null,
        error: null,
      };
    }));

    setItems(prev => [...newItems, ...prev]);
    event.options.clear();

    // Process sequentially to avoid overloading the VPS
    for (const item of newItems) {
      const formData = new FormData();
      formData.append('image', item.file);
      
      try {
        const data = await predictService.predict(formData);
        setItems(prev => prev.map(p => p.id === item.id ? { ...p, loading: false, prediction: data.data } : p));
        toast.current?.show({ severity: 'success', summary: 'Analisis Selesai', detail: `${item.fileInfo.name} berhasil didiagnosis.`, life: 3000 });
      } catch (error: any) {
        setItems(prev => prev.map(p => p.id === item.id ? { ...p, loading: false, error: error.response?.data?.message || 'Gagal memproses gambar.' } : p));
        toast.current?.show({ severity: 'error', summary: 'Gagal', detail: `Gagal memproses ${item.fileInfo.name}`, life: 4000 });
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Kamera Gagal', detail: 'Tidak dapat mengakses kamera. Pastikan izin diberikan.', life: 3000 });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          // Create dummy event to reuse onUpload
          onUpload({ files: [file], options: { clear: () => {} } } as any);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleRemove = (id: string) => setItems(prev => prev.filter(p => p.id !== id));
  const handleClearAll = () => setItems([]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--col-surface)' }}>
      <Navbar />
      <Toast ref={toast} />

      {/* Camera Overlay */}
      {cameraActive && (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-fade-in">
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <h3 className="text-white m-0 font-bold" style={{ fontFamily: 'var(--font-display)' }}>Ambil Foto Feses</h3>
            <button 
              onClick={stopCamera}
              className="w-10 h-10 rounded-full bg-white/10 text-white border-none cursor-pointer flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <i className="pi pi-times" />
            </button>
          </div>
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-contain bg-slate-950"
          />

          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-6">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <p className="text-white text-xs m-0 font-medium">Posisikan feses di tengah kamera</p>
            </div>
            <button 
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white border-[6px] border-white/30 cursor-pointer flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
                <i className="pi pi-camera text-white text-2xl" />
              </div>
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-14">

        {/* Header */}
        <div className="mb-4 animate-fade-up">
          <h1 className="m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--col-ink)' }}>Diagnosis AI</h1>
          <p className="m-0 mt-1 text-sm" style={{ color: 'var(--col-ink-4)' }}>Deteksi penyakit ayam melalui analisis citra feses menggunakan Vision Transformer</p>
        </div>

        {/* How it works */}
        <div className="rounded-2xl p-5 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up delay-100"
          style={{ background: 'linear-gradient(135deg, var(--col-brand-dark) 0%, var(--col-brand) 100%)' }}>
          {[
            { icon: 'pi-upload',       title: 'Unggah Foto',       sub: 'JPG, PNG, WEBP · maks. 5 MB' },
            { icon: 'pi-cog',          title: 'AI Menganalisis',    sub: 'Vision Transformer model' },
            { icon: 'pi-check-circle', title: 'Terima Hasil',       sub: 'Akurasi hingga 98.5%' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`pi ${s.icon}`} style={{ fontSize: 14, color: 'white' }} />
              </div>
              <div>
                <p className="m-0 text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{s.title}</p>
                <p className="m-0 text-[10px]" style={{ color: 'rgba(147,197,253,0.8)' }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Upload Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4" style={{ position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
            <div className="card p-5 animate-fade-up delay-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div style={{ width: 34, height: 34, minWidth: 34, borderRadius: 9, background: 'var(--col-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="pi pi-upload" style={{ fontSize: 13, color: 'var(--col-brand)' }} />
                  </div>
                  <div>
                    <h3 className="m-0 text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>Unggah Citra</h3>
                    <p className="m-0 text-xs" style={{ color: 'var(--col-ink-4)' }}>Format: JPG, PNG, WEBP</p>
                  </div>
                </div>
                
                <button 
                  onClick={startCamera}
                  disabled={items.some(i => i.loading)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <i className="pi pi-camera" style={{ fontSize: 12 }} />
                  Ambil Foto Langsung
                </button>
              </div>

              <FileUpload
                ref={fileUploadRef}
                mode="advanced" name="images" customUpload uploadHandler={onUpload}
                accept="image/*" maxFileSize={5_000_000} multiple
                emptyTemplate={
                  <div className="upload-zone flex flex-col items-center justify-center py-9 rounded-xl text-center cursor-pointer"
                    style={{ border: '2px dashed var(--col-border)', background: 'var(--col-surface)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--col-card)', border: '1px solid var(--col-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <i className="pi pi-images" style={{ fontSize: 20, color: 'var(--col-brand)' }} />
                    </div>
                    <p className="font-semibold text-sm m-0" style={{ color: 'var(--col-ink-2)', fontFamily: 'var(--font-display)' }}>Pilih Beberapa Foto Sekaligus</p>
                    <p className="text-xs m-0 mt-1" style={{ color: 'var(--col-ink-4)' }}>Bisa pilih lebih dari satu foto sekaligus</p>
                  </div>
                }
                chooseLabel="Pilih Foto" uploadLabel="Mulai Diagnosis" cancelLabel="Reset"
                chooseOptions={{ icon: 'pi pi-folder-open', className: '!rounded-xl !text-sm !font-semibold' }}
                uploadOptions={{ icon: 'pi pi-send', className: '!rounded-xl !text-sm !font-semibold' }}
                cancelOptions={{ icon: 'pi pi-times', className: '!rounded-xl !text-sm !font-semibold' }}
                className="w-full" disabled={items.some(i => i.loading)}
              />
            </div>

            {/* Tips */}
            <div className="card p-5 animate-fade-up delay-300">
              <h4 className="m-0 mb-4 text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
                <i className="pi pi-lightbulb" style={{ color: 'var(--col-warn)' }} /> Tips Foto Terbaik
              </h4>
              <ul className="m-0 p-0 list-none space-y-2.5">
                {[
                  { icon: 'pi-sun',    tip: 'Foto dalam kondisi cahaya terang' },
                  { icon: 'pi-camera', tip: 'Jarak 20–30 cm dari objek' },
                  { icon: 'pi-image',  tip: 'Fokus pada area feses, bukan kandang' },
                  { icon: 'pi-check',  tip: 'Resolusi minimal 480px' },
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex items-center justify-center shrink-0 rounded-lg" style={{ width: 24, height: 24, background: 'var(--col-warn-pale)', color: 'var(--col-warn)' }}>
                      <i className={`pi ${tip.icon}`} style={{ fontSize: 10 }} />
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--col-ink-2)' }}>{tip.tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-7 flex flex-col" style={{ minHeight: 0 }}>
            {/* Sticky header when multiple items */}
            {items.length > 1 && (
              <div className="flex justify-between items-center p-3 rounded-xl border mb-3 flex-shrink-0" style={{ background: 'var(--col-card)', border: '1px solid var(--col-border)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--col-ink-2)' }}>{items.length} Gambar Dianalisis</span>
                <button onClick={handleClearAll} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ color: 'var(--col-disease)', background: 'var(--col-disease-pale)', border: 'none', cursor: 'pointer' }}>
                  Hapus Semua
                </button>
              </div>
            )}

            {/* Scrollable results area */}
            <div
              className="flex flex-col gap-5"
              style={{
                overflowY: items.length > 1 ? 'auto' : 'visible',
                maxHeight: items.length > 1 ? 'calc(100vh - 260px)' : undefined,
                paddingRight: items.length > 1 ? 6 : 0,
                scrollbarWidth: 'thin',
              }}
            >
              {items.length === 0 && <EmptyState />}

              {items.map(item => (
                <div key={item.id} className="relative">
                  {item.loading && (
                    <div className="card flex flex-col items-center justify-center p-8 text-center animate-scale-in relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 blur-sm">
                        <img src={item.fileInfo.preview} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="spin-ring mb-4" />
                        <h4 className="m-0 mb-1 text-sm font-bold" style={{ color: 'var(--col-ink)' }}>Menganalisis {item.fileInfo.name}...</h4>
                        <p className="m-0 text-xs mb-4" style={{ color: 'var(--col-ink-4)' }}>Vision Transformer sedang memproses citra.</p>
                        <div className="w-48"><ProgressBar mode="indeterminate" style={{ height: '3px' }} /></div>
                      </div>
                    </div>
                  )}
                  {item.error && (
                    <div className="card p-5 flex items-center justify-between" style={{ borderLeft: '4px solid var(--col-disease)' }}>
                      <div className="flex items-center gap-3">
                        <img src={item.fileInfo.preview} alt="" className="w-10 h-10 rounded-md object-cover" style={{ background: 'var(--col-surface)', border: '1px solid var(--col-border)' }} />
                        <div>
                          <p className="m-0 text-sm font-bold" style={{ color: 'var(--col-ink)' }}>{item.fileInfo.name}</p>
                          <p className="m-0 text-xs" style={{ color: 'var(--col-disease)' }}>{item.error}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemove(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'var(--col-surface)', color: 'var(--col-ink-4)', border: '1px solid var(--col-border)' }}>
                        <i className="pi pi-times text-xs" />
                      </button>
                    </div>
                  )}
                  {item.prediction && !item.loading && (
                    <ResultCard prediction={item.prediction} onRemove={() => handleRemove(item.id)} fileInfo={item.fileInfo} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PredictPage;
