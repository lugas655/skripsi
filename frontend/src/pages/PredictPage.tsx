/// <reference types="vite/client" />
import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { PredictResponse, LabelPenyakit, User } from '../types';

const PredictPage: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; preview: string } | null>(null);
  const toast = useRef<Toast>(null);

  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;

  const onUpload = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        preview: e.target?.result as string
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
      toast.current?.show({ severity: 'success', summary: 'Analisis Selesai', detail: 'Sistem berhasil mendiagnosis citra.' });
      event.options.clear();
    } catch (error: any) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Gagal', 
        detail: error.response?.data?.message || 'Gagal memproses gambar' 
      });
      setFileInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const getTheme = (label: string) => {
    const l = label.toUpperCase();
    if (l === 'HEALTHY') return { color: '#10B981', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' };
    if (l === 'COCCIDIOSIS') return { color: '#EF4444', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    if (l === 'NEWCASTLE') return { color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
    if (l === 'SALMONELLA') return { color: '#3B82F6', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
    return { color: '#64748B', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' };
  };

  const getLabelDescription = (label: string) => {
    switch (label.toUpperCase()) {
      case 'HEALTHY': return 'Luar biasa! Kondisi feses ayam menunjukkan parameter kesehatan yang optimal. Pastikan ventilasi dan kualitas air minum tetap terjaga.';
      case 'COCCIDIOSIS': return 'Terdeteksi Koksidiosis. Segera bersihkan kotoran yang basah, ganti alas kandang (litter), dan konsultasikan pemberian koksidiostat.';
      case 'NEWCASTLE': return 'Sinyal Bahaya: Newcastle Disease terdeteksi. Virus ini sangat cepat menyebar. Segera lakukan isolasi total dan lapor petugas kesehatan hewan.';
      case 'SALMONELLA': return 'Indikasi Salmonella. Perhatikan kebersihan tempat pakan dan segera berikan antibiotik yang sesuai untuk unggas.';
      default: return 'Data analisis tidak tersedia.';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <Toast ref={toast} />
      
      <div className="w-full px-4 md:px-8 py-4 md:py-8">
        {/* Header Greeting - Responsive */}
        <div className="w-full bg-white p-5 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border-1 border-slate-200 mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
              <i className="pi pi-camera text-2xl md:text-3xl"></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 m-0">Diagnosis AI</h1>
              <p className="text-slate-500 m-0 mt-1 text-sm md:text-lg italic md:not-italic">Deteksi penyakit ternak dengan Vision Transformer.</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Akurasi Sistem: 98.2%</span>
          </div>
        </div>

        {/* Main Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Left Side: Input (5/12) */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-1">
            <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border-1 border-slate-200 h-full">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <i className="pi pi-upload text-lg md:text-xl"></i>
                </div>
                <div>
                  <h3 className="m-0 text-lg md:text-xl font-bold text-slate-900">Unggah Citra</h3>
                  <p className="text-slate-400 text-xs md:text-sm m-0">Kotoran/feses ayam</p>
                </div>
              </div>

              <FileUpload 
                mode="advanced" 
                name="image" 
                customUpload 
                uploadHandler={onUpload} 
                accept="image/*" 
                maxFileSize={5000000}
                emptyTemplate={
                  <div className="flex flex-col items-center justify-center py-8 md:py-10 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer px-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-4 md:mb-6">
                      <i className="pi pi-image text-xl md:text-2xl text-blue-600"></i>
                    </div>
                    <p className="m-0 text-slate-900 font-black text-base md:text-lg">Ambil atau Pilih Foto</p>
                    <p className="m-0 text-slate-400 text-xs md:text-sm mt-1 text-center">Pastikan citra terlihat jelas</p>
                  </div>
                }
                chooseLabel="Cari Foto"
                uploadLabel="Mulai Diagnosis"
                cancelLabel="Reset"
                className="predict-upload-modern w-full"
                disabled={loading}
              />

              {fileInfo && (
                <div className="mt-6 md:mt-8 p-3 md:p-4 bg-slate-50 rounded-2xl border-1 border-slate-200 flex items-center gap-3 md:gap-4 animate-fadein">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shadow-md flex-shrink-0 border-2 border-white">
                    <img src={fileInfo.preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="m-0 font-bold text-slate-900 text-xs md:text-sm truncate">{fileInfo.name}</p>
                    <p className="m-0 text-slate-400 text-[10px] md:text-xs mt-1">{fileInfo.size}</p>
                    <div className="flex items-center gap-2 mt-2 md:mt-3 text-emerald-600 font-bold text-[10px] md:text-xs uppercase tracking-tighter">
                      <i className="pi pi-check-circle"></i>
                      <span>Siap dianalisis</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Result (7/12) */}
          <div className="lg:col-span-7 order-2">
            {!loading && !prediction && (
              <div className="h-full bg-white rounded-2xl md:rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 md:p-12 text-center opacity-60 min-h-[300px]">
                <i className="pi pi-search text-5xl md:text-6xl text-slate-200 mb-6"></i>
                <h3 className="text-xl md:text-2xl font-black text-slate-400 m-0">Menunggu Analisis</h3>
                <p className="text-slate-400 max-w-sm mt-3 text-xs md:text-base">Detail hasil diagnosa penyakit akan tampil di sini setelah Anda mengunggah citra.</p>
              </div>
            )}

            {loading && (
              <div className="h-full bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border-1 border-slate-200 p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative mb-6 md:mb-8">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="pi pi-bolt text-2xl md:text-3xl text-blue-600 animate-pulse"></i>
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Memproses...</h2>
                <p className="text-slate-500 text-center max-w-sm text-xs md:text-base px-4">AI sedang menganalisis citra untuk menemukan pola penyakit.</p>
                <div className="w-full max-w-xs mt-6 md:mt-8">
                  <ProgressBar mode="indeterminate" style={{ height: '6px' }} className="rounded-full overflow-hidden" />
                </div>
              </div>
            )}

            {prediction && (
              <div className="flex flex-col gap-6 animate-fadein">
                {/* Main Diagnosis Hero - Responsive */}
                <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-lg overflow-hidden border-1 border-slate-200">
                  <div className={`p-6 md:p-8 flex items-center justify-between gap-4 ${getTheme(prediction.prediksi.labelPenyakit).bg}`}>
                    <div className="overflow-hidden">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white shadow-sm mb-3 md:mb-4 ${getTheme(prediction.prediksi.labelPenyakit).text}`}>
                        Hasil Diagnosa
                      </span>
                      <h2 className={`text-2xl md:text-5xl font-black m-0 truncate ${getTheme(prediction.prediksi.labelPenyakit).text}`}>
                        {prediction.prediksi.labelPenyakit}
                      </h2>
                    </div>
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white shadow-xl flex items-center justify-center shrink-0">
                      <i className={`pi ${prediction.prediksi.labelPenyakit === 'HEALTHY' ? 'pi-check-circle' : 'pi-exclamation-triangle'} text-2xl md:text-4xl`} style={{ color: getTheme(prediction.prediksi.labelPenyakit).color }}></i>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8">
                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border-1 border-slate-100 mb-6 md:mb-8">
                      <p className="text-slate-600 m-0 text-sm md:text-lg leading-relaxed font-medium italic md:not-italic">
                        {getLabelDescription(prediction.prediksi.labelPenyakit)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 md:gap-4">
                      <div className="flex justify-between items-end">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Akurasi</span>
                        <span className="text-2xl md:text-3xl font-black text-blue-600">{(prediction.prediksi.nilaiAkurasi * 100).toFixed(1)}%</span>
                      </div>
                      <ProgressBar 
                        value={prediction.prediksi.nilaiAkurasi * 100} 
                        showValue={false} 
                        style={{ height: '12px md:16px' }} 
                        color={getTheme(prediction.prediksi.labelPenyakit).color} 
                        className="rounded-full bg-slate-100" 
                      />
                    </div>
                  </div>
                </div>

                {/* Probabilities Breakdown */}
                <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border-1 border-slate-200">
                  <h3 className="m-0 text-lg md:text-xl font-black text-slate-900 mb-6 md:mb-8 flex items-center gap-3">
                    <i className="pi pi-chart-bar text-blue-600"></i> Distribusi Probabilitas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                    {prediction.prediksi.allProbs && Object.entries(prediction.prediksi.allProbs).map(([label, prob]) => (
                      <div key={label} className="group">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-700 text-sm capitalize">{label.toLowerCase()}</span>
                          <span className="font-black text-slate-900 text-xs md:text-sm">{(prob as number * 100).toFixed(1)}%</span>
                        </div>
                        <ProgressBar 
                          value={prob as number * 100} 
                          showValue={false} 
                          style={{ height: '8px md:10px' }} 
                          color={getTheme(label).color} 
                          className="rounded-full bg-slate-50 shadow-inner" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process Metrics - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-1 border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <i className="pi pi-clock text-lg md:text-xl"></i>
                    </div>
                    <div>
                      <p className="m-0 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Waktu</p>
                      <p className="m-0 text-xl md:text-2xl font-black text-slate-900">{prediction.prediksi.waktuProses.toFixed(3)}s</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-1 border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <i className="pi pi-shield text-lg md:text-xl"></i>
                    </div>
                    <div>
                      <p className="m-0 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Model</p>
                      <p className="m-0 text-xl md:text-2xl font-black text-slate-900">ViT Base</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictPage;
