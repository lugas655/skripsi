/// <reference types="vite/client" />
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { PredictResponse } from '../types';

// ────────────────────────────────────────
// Helpers
// ────────────────────────────────────────

interface DiseaseTheme {
  color: string;
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  label: string;
  icon: string;
  desc: string;
}

const getDiseaseTheme = (label: string): DiseaseTheme => {
  const l = label.toUpperCase();
  const themes: Record<string, DiseaseTheme> = {
    HEALTHY: {
      color: '#10B981', bg: 'bg-emerald-50', border: 'border-emerald-200',
      text: 'text-emerald-700', badgeBg: 'bg-emerald-100',
      label: 'Sehat', icon: 'pi-check-circle',
      desc: 'Luar biasa! Kondisi feses ayam menunjukkan parameter kesehatan yang optimal. Pastikan ventilasi dan kualitas air minum tetap terjaga dengan baik.',
    },
    COCCIDIOSIS: {
      color: '#EF4444', bg: 'bg-red-50', border: 'border-red-200',
      text: 'text-red-700', badgeBg: 'bg-red-100',
      label: 'Koksidiosis', icon: 'pi-exclamation-triangle',
      desc: 'Terdeteksi Koksidiosis. Segera bersihkan kotoran yang basah, ganti alas kandang (litter), dan konsultasikan pemberian koksidiostat dengan dokter hewan.',
    },
    NEWCASTLE: {
      color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200',
      text: 'text-amber-700', badgeBg: 'bg-amber-100',
      label: 'Newcastle Disease', icon: 'pi-exclamation-circle',
      desc: 'Sinyal Bahaya: Newcastle Disease terdeteksi. Virus ini sangat cepat menyebar. Segera lakukan isolasi total dan lapor petugas kesehatan hewan setempat.',
    },
    SALMONELLA: {
      color: '#3B82F6', bg: 'bg-blue-50', border: 'border-blue-200',
      text: 'text-blue-700', badgeBg: 'bg-blue-100',
      label: 'Salmonella', icon: 'pi-shield',
      desc: 'Indikasi Salmonella terdeteksi. Perhatikan kebersihan tempat pakan dan minum. Segera berikan antibiotik yang sesuai dan isolasi ayam yang terinfeksi.',
    },
  };
  return themes[l] || {
    color: '#64748B', bg: 'bg-slate-50', border: 'border-slate-200',
    text: 'text-slate-700', badgeBg: 'bg-slate-100',
    label: label, icon: 'pi-question-circle',
    desc: 'Data analisis tidak tersedia.',
  };
};

// ────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────

const EmptyState: React.FC = () => (
  <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center min-h-80">
    <span style={{ width: 64, height: 64, minWidth: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 20 }}>
      <i className="pi pi-search" style={{ fontSize: 28, color: '#CBD5E1' }} />
    </span>
    <h3 className="text-base font-bold text-slate-400 m-0 mb-1">Menunggu Analisis</h3>
    <p className="text-sm text-slate-300 m-0 max-w-xs">
      Unggah foto feses ayam di panel kiri, lalu klik "Mulai Diagnosis" untuk memulai analisis AI.
    </p>
  </div>
);

const LoadingState: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center p-12 text-center min-h-80 animate-scale-in">
    <div className="relative mb-6">
      <div className="spin-ring" />
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="pi pi-bolt text-blue-600 text-lg animate-pulse" />
      </div>
    </div>
    <h3 className="text-base font-bold text-slate-800 m-0 mb-1">Memproses Gambar...</h3>
    <p className="text-sm text-slate-400 m-0 max-w-xs mb-6">
      AI Vision Transformer sedang menganalisis pola penyakit dari citra yang diunggah.
    </p>
    <div className="w-full max-w-xs">
      <ProgressBar mode="indeterminate" style={{ height: '4px' }} />
    </div>
  </div>
);

interface ResultCardProps {
  prediction: PredictResponse['data'];
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ prediction, onReset }) => {
  const theme = getDiseaseTheme(prediction.prediksi.labelPenyakit);
  const accuracy = (prediction.prediksi.nilaiAkurasi * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-5 animate-scale-in">
      {/* Hero Result */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className={`p-6 ${theme.bg} border-b ${theme.border}`}>
            <div className="flex items-center justify-between">
            <div>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${theme.text} mb-3`}>
                <i className="pi pi-bolt" style={{ fontSize: 10 }} />
                Hasil Diagnosa AI
              </span>
              <h2 className={`text-3xl font-extrabold m-0 tracking-tight ${theme.text}`}>
                {theme.label}
              </h2>
              <p className={`text-xs font-medium ${theme.text} opacity-70 m-0 mt-1 uppercase tracking-widest`}>
                {prediction.prediksi.labelPenyakit}
              </p>
            </div>
            <span style={{ width: 64, height: 64, minWidth: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: `1px solid` }} className={theme.border}>
              <i className={`pi ${theme.icon}`} style={{ fontSize: 24, color: theme.color }} />
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Description */}
          <div className={`${theme.bg} rounded-xl p-4 border ${theme.border} mb-6`}>
            <p className={`text-sm leading-relaxed ${theme.text} m-0`}>
              {theme.desc}
            </p>
          </div>

          {/* Accuracy */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tingkat Kepercayaan</span>
              <span className="text-xl font-extrabold text-slate-900">{accuracy}%</span>
            </div>
            <ProgressBar
              value={prediction.prediksi.nilaiAkurasi * 100}
              showValue={false}
              style={{ height: '8px' }}
              color={theme.color}
            />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide m-0 mb-1">Waktu Proses</p>
              <p className="text-lg font-extrabold text-slate-900 m-0">{prediction.prediksi.waktuProses.toFixed(2)}s</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide m-0 mb-1">Model AI</p>
              <p className="text-lg font-extrabold text-slate-900 m-0">ViT Base</p>
            </div>
          </div>
        </div>
      </div>

      {/* Probability Distribution */}
      {prediction.prediksi.allProbs && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h4 className="text-sm font-bold text-slate-900 m-0 mb-5 flex items-center gap-2">
            <i className="pi pi-chart-bar text-blue-500" />
            Distribusi Probabilitas
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(prediction.prediksi.allProbs).map(([label, prob]) => {
              const t = getDiseaseTheme(label);
              const pct = (prob as number * 100).toFixed(1);
              const isTop = label === prediction.prediksi.labelPenyakit;
              return (
                <div key={label} className={`rounded-xl p-3 border ${isTop ? `${t.bg} ${t.border}` : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold capitalize ${isTop ? t.text : 'text-slate-600'}`}>
                      {t.label}
                    </span>
                    <span className={`text-xs font-extrabold ${isTop ? t.text : 'text-slate-700'}`}>{pct}%</span>
                  </div>
                  <ProgressBar
                    value={prob as number * 100}
                    showValue={false}
                    style={{ height: '5px' }}
                    color={t.color}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <Button
        label="Diagnosa Gambar Lain"
        icon="pi pi-refresh"
        className="p-button-outlined p-button-secondary !rounded-xl !py-3 !font-semibold !border-slate-200 !text-slate-600 w-full"
        onClick={onReset}
      />
    </div>
  );
};

// ────────────────────────────────────────
// Main Page
// ────────────────────────────────────────

const PredictPage: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; preview: string } | null>(null);
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<any>(null);

  const onUpload = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        preview: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);

    setLoading(true);
    setPrediction(null);

    try {
      const response = await api.post<PredictResponse>('/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPrediction(response.data.data);
      toast.current?.show({
        severity: 'success',
        summary: 'Analisis Selesai',
        detail: 'Sistem berhasil mendiagnosis citra.',
        life: 4000,
      });
      event.options.clear();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal Memproses',
        detail: error.response?.data?.message || 'Gagal memproses gambar. Coba lagi.',
        life: 5000,
      });
      setFileInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setFileInfo(null);
    fileUploadRef.current?.clear();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Toast ref={toast} />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* ── Page Header ── */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <span 
              className="bg-blue-600 shadow-md shadow-blue-200 text-white"
              style={{ width: 36, height: 36, minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 12 }}
            >
              <i className="pi pi-camera text-sm" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
                Diagnosis AI
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-400 m-0 ml-12">
            Deteksi penyakit ayam melalui analisis citra feses menggunakan Vision Transformer
          </p>
        </div>

        {/* ── How It Works Banner ── */}
        <div className="bg-blue-600 rounded-2xl p-5 mb-7 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in delay-100">
          {[
            { step: '01', icon: 'pi-upload',       text: 'Unggah foto feses ayam' },
            { step: '02', icon: 'pi-cog',          text: 'AI menganalisis citra' },
            { step: '03', icon: 'pi-check-circle', text: 'Terima hasil diagnosis' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-white">
              <span style={{ width: 32, height: 32, minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.15)', borderRadius: 8 }}>
                <i className={`pi ${s.icon}`} style={{ fontSize: 14, color: 'white' }} />
              </span>
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest m-0">Langkah {s.step}</p>
                <p className="text-sm font-semibold text-white m-0">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: Upload Panel */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fade-in delay-200">
              <div className="flex items-center gap-3 mb-5">
                <span style={{ width: 36, height: 36, minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#EFF6FF', borderRadius: 12 }}>
                  <i className="pi pi-upload" style={{ fontSize: 14, color: '#2563EB' }} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">Unggah Citra</h3>
                  <p className="text-xs text-slate-400 m-0">Format: JPG, PNG, WEBP · Maks. 5 MB</p>
                </div>
              </div>

              <FileUpload
                ref={fileUploadRef}
                mode="advanced"
                name="image"
                customUpload
                uploadHandler={onUpload}
                accept="image/*"
                maxFileSize={5_000_000}
                emptyTemplate={
                  <div className="upload-zone flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-pointer px-4 text-center">
                    <span
                      className="bg-white shadow-sm border border-slate-100"
                      style={{ width: 56, height: 56, minWidth: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 16, marginBottom: 16 }}
                    >
                      <i className="pi pi-image text-blue-500" style={{ fontSize: 24 }} />
                    </span>
                    <p className="font-bold text-slate-700 text-sm m-0">Pilih atau Seret Foto</p>
                    <p className="text-xs text-slate-400 mt-1 m-0">Pastikan foto terlihat jelas & tidak buram</p>
                  </div>
                }
                chooseLabel="Pilih Foto"
                uploadLabel="Mulai Diagnosis"
                cancelLabel="Reset"
                chooseOptions={{ icon: 'pi pi-folder-open', className: '!rounded-xl !bg-slate-100 !border-slate-200 !text-slate-700 !font-semibold !text-sm' }}
                uploadOptions={{ icon: 'pi pi-send', className: '!rounded-xl !bg-blue-600 !border-blue-600 !font-semibold !text-sm !shadow-md !shadow-blue-200' }}
                cancelOptions={{ icon: 'pi pi-times', className: '!rounded-xl !p-button-outlined !border-slate-200 !text-slate-500 !font-semibold !text-sm' }}
                className="w-full"
                disabled={loading}
              />

              {/* File Preview */}
              {fileInfo && (
                <div className="mt-5 flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 animate-fade-in">
                  <img
                    src={fileInfo.preview}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border-2 border-white shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 m-0 truncate">{fileInfo.name}</p>
                    <p className="text-xs text-slate-400 m-0 mt-0.5">{fileInfo.size}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-emerald-600 text-xs font-semibold">
                      <i className="pi pi-check-circle" />
                      <span>Siap dianalisis</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-fade-in delay-300">
              <h4 className="text-sm font-bold text-slate-900 m-0 mb-4 flex items-center gap-2">
                <i className="pi pi-lightbulb text-amber-500" />
                Tips untuk Hasil Terbaik
              </h4>
              <ul className="space-y-2 m-0 p-0 list-none">
                {[
                  { icon: 'pi-sun',       tip: 'Foto dalam kondisi cahaya terang' },
                  { icon: 'pi-camera',    tip: 'Ambil dari jarak 20–30 cm' },
                  { icon: 'pi-image',     tip: 'Fokus pada area feses, bukan kandang' },
                  { icon: 'pi-check',     tip: 'Gunakan resolusi minimal 480px' },
                ].map((t, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span
                      className="bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0"
                      style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px' }}
                    >
                      <i className={`pi ${t.icon}`} style={{ fontSize: '10px' }} />
                    </span>
                    <span className="text-xs text-slate-600">{t.tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Result Panel */}
          <div className="lg:col-span-7">
            {!loading && !prediction && <EmptyState />}
            {loading && <LoadingState />}
            {prediction && !loading && (
              <ResultCard prediction={prediction} onReset={handleReset} />
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default PredictPage;
