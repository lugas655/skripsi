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
    HEALTHY:    { color: '#16A34A', bg: 'var(--col-healthy-pale)',  border: '1px solid #bbf7d0', text: 'var(--col-healthy)',  label: 'Sehat',             icon: 'pi-check-circle',        desc: 'Kondisi feses menunjukkan parameter kesehatan optimal. Pertahankan ventilasi & kualitas air minum.' },
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
      <i className="pi pi-search" style={{ fontSize: 22, color: 'var(--col-border)' }} />
    </div>
    <h3 className="m-0 mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--col-ink-4)' }}>Menunggu Analisis</h3>
    <p className="m-0 text-xs max-w-xs" style={{ color: 'var(--col-ink-4)', opacity: 0.6 }}>
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

/* ── Result Card ── */
const ResultCard: React.FC<{ prediction: PredictResponse['data']; onRemove: () => void; fileInfo?: {name:string; preview:string} }> = ({ prediction, onRemove, fileInfo }) => {
  const isLowConfidence = prediction.prediksi.nilaiAkurasi < 0.70;

  const t = isLowConfidence 
    ? { color: '#D97706', bg: 'var(--col-warn-pale)', border: '1px solid #fde68a', text: 'var(--col-warn)', label: 'Tidak Terdeteksi', icon: 'pi-question-circle', desc: 'Gambar yang Anda unggah bukan merupakan feses.' }
    : getTheme(prediction.prediksi.labelPenyakit);
  
  const labelText = isLowConfidence ? 'UNKNOWN' : prediction.prediksi.labelPenyakit;
  const pct = (prediction.prediksi.nilaiAkurasi * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-4 animate-scale-in relative">
      {fileInfo && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
          <img src={fileInfo.preview} alt="Preview" className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
          <span className="text-sm font-semibold text-slate-700 truncate">{fileInfo.name}</span>
        </div>
      )}

      {/* Hero verdict — signature element */}
      <div className="card overflow-hidden">
        {/* Color banner */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: t.bg, borderBottom: t.border }}>
          <div>
            <p className="diag-label m-0 mb-2" style={{ color: t.text }}>
              <i className="pi pi-sparkles mr-1" style={{ fontSize: 9 }} /> Hasil Diagnosa AI
            </p>
            <h2 className="m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2.25rem', color: t.color, lineHeight: 1 }}>
              {t.label}
            </h2>
            <p className="m-0 mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: t.text, letterSpacing: '0.1em', opacity: 0.7 }}>
              {labelText}
            </p>
          </div>
          <div style={{ width: 60, height: 60, minWidth: 60, borderRadius: 14, background: 'white', border: t.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className={`pi ${t.icon}`} style={{ fontSize: 26, color: t.color }} />
          </div>
        </div>

        <div className="p-6">
          {/* AI Advice */}
          <div className="rounded-xl p-4 mb-5" style={{ background: t.bg, border: t.border }}>
            {isLowConfidence ? (
              <p className="m-0 text-sm leading-relaxed font-medium" style={{ color: t.text }}>Gambar yang Anda unggah bukan merupakan feses.</p>
            ) : prediction.prediksi.saranAI ? (
              <>
                <p className="diag-label m-0 mb-2" style={{ color: t.text }}>
                  <i className="pi pi-sparkles mr-1" style={{ fontSize: 9 }} /> Saran AI Doctor
                </p>
                <p className="m-0 text-sm leading-relaxed font-medium italic" style={{ color: t.text }}>"{prediction.prediksi.saranAI}"</p>
              </>
            ) : (
              <p className="m-0 text-sm leading-relaxed" style={{ color: t.text }}>{t.desc}</p>
            )}
          </div>

          {/* Confidence bar — diagnostic readout */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="diag-label">Tingkat Kepercayaan</span>
              <span className="diag-number" style={{ fontSize: '1.5rem', color: t.color }}>{pct}%</span>
            </div>
            <ProgressBar value={prediction.prediksi.nilaiAkurasi * 100} showValue={false} style={{ height: '6px' }} color={t.color} />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Waktu Proses', val: `${prediction.prediksi.waktuProses.toFixed(2)}s` },
              { label: 'Model AI', val: 'ViT Base' },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3.5" style={{ background: 'var(--col-surface)', border: '1px solid var(--col-border)' }}>
                <p className="diag-label m-0 mb-1">{m.label}</p>
                <p className="diag-number m-0" style={{ fontSize: '1.125rem', color: 'var(--col-ink)' }}>{m.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Probability distribution */}
      {prediction.prediksi.allProbs && (
        <div className="card p-5">
          <h4 className="m-0 mb-4 flex items-center gap-2 text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
            <i className="pi pi-chart-bar" style={{ color: 'var(--col-brand)' }} /> Distribusi Probabilitas
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(prediction.prediksi.allProbs).map(([lbl, prob]) => {
              const th = getTheme(lbl);
              const isTop = lbl === prediction.prediksi.labelPenyakit;
              return (
                <div key={lbl} className="rounded-xl p-3.5" style={{ background: isTop ? th.bg : 'var(--col-surface)', border: isTop ? th.border : '1px solid var(--col-border)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold" style={{ color: isTop ? th.text : 'var(--col-ink-3)' }}>{th.label}</span>
                    <span className="diag-number text-xs font-bold" style={{ color: isTop ? th.text : 'var(--col-ink)' }}>{((prob as number) * 100).toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={(prob as number) * 100} showValue={false} style={{ height: '4px' }} color={th.color} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={onRemove}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
        style={{ background: 'var(--col-card)', border: '1px solid var(--col-border)', color: 'var(--col-ink-2)', cursor: 'pointer' }}
      >
        <i className="pi pi-times" style={{ fontSize: 13 }} /> Hapus Hasil Ini
      </button>
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
              <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center">
                <i className="pi pi-camera text-white text-2xl" />
              </div>
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* Header */}
        <div className="mb-7 animate-fade-up">
          <h1 className="m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--col-ink)' }}>Diagnosis AI</h1>
          <p className="m-0 mt-1 text-sm" style={{ color: 'var(--col-ink-4)' }}>Deteksi penyakit ayam melalui analisis citra feses menggunakan Vision Transformer</p>
        </div>

        {/* How it works */}
        <div className="rounded-2xl p-5 mb-7 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up delay-100"
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
                <p className="m-0 text-[10px]" style={{ color: 'rgba(134,239,172,0.8)' }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Upload Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
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
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-all cursor-pointer disabled:opacity-50"
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
          <div className="lg:col-span-7 flex flex-col gap-5">
            {items.length === 0 && <EmptyState />}
            
            {items.length > 1 && (
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-sm font-semibold text-slate-700">{items.length} Gambar Dianalisis</span>
                <button onClick={handleClearAll} className="text-xs text-red-600 font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                  Hapus Semua
                </button>
              </div>
            )}

            {items.map(item => (
              <div key={item.id} className="relative">
                {item.loading && (
                  <div className="card flex flex-col items-center justify-center p-8 text-center animate-scale-in relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 blur-sm">
                      <img src={item.fileInfo.preview} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="spin-ring mb-4" />
                      <h4 className="m-0 mb-1 text-sm font-bold text-slate-800">Menganalisis {item.fileInfo.name}...</h4>
                      <p className="m-0 text-xs text-slate-500 mb-4">Vision Transformer sedang memproses citra.</p>
                      <div className="w-48"><ProgressBar mode="indeterminate" style={{ height: '3px' }} /></div>
                    </div>
                  </div>
                )}
                {item.error && (
                  <div className="card p-5 border-l-4 border-red-500 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.fileInfo.preview} alt="" className="w-10 h-10 rounded-md object-cover bg-slate-100" />
                      <div>
                        <p className="m-0 text-sm font-bold text-slate-800">{item.fileInfo.name}</p>
                        <p className="m-0 text-xs text-red-500">{item.error}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(item.id)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">
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
      </main>
    </div>
  );
};

export default PredictPage;
