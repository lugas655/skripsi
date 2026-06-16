import React from 'react';
import { Citra } from '../types';
import { IMAGE_BASE_URL } from '../api/api';

interface PrintReportProps {
  detail: Citra;
}

const PrintReport: React.FC<PrintReportProps> = ({ detail }) => {


  const getLabelDescription = (label: string) => {
    switch (label?.toUpperCase()) {
      case 'HEALTHY': return 'Kondisi feses ayam menunjukkan parameter kesehatan yang optimal. Pastikan ventilasi dan kualitas air minum tetap terjaga.';
      case 'COCCIDIOSIS': return 'Terdeteksi Koksidiosis. Segera bersihkan kotoran yang basah, ganti alas kandang (litter), dan konsultasikan pemberian koksidiostat.';
      case 'NEWCASTLE': return 'Sinyal Bahaya: Newcastle Disease terdeteksi. Virus ini sangat cepat menyebar. Segera lakukan isolasi total dan lapor petugas kesehatan hewan.';
      case 'SALMONELLA': return 'Indikasi Salmonella. Perhatikan kebersihan tempat pakan dan segera berikan antibiotik yang sesuai untuk unggas.';
      default: return 'Data analisis tidak tersedia.';
    }
  };

  const isLowConfidence = (detail.hasilPrediksi?.nilaiAkurasi || 0) < 0.70;
  const isHealthy = detail.hasilPrediksi?.labelPenyakit === 'HEALTHY' && !isLowConfidence;
  
  return (
    <div className="print-report font-sans max-w-4xl mx-auto p-8 pt-4 bg-white text-black h-screen overflow-hidden">
      
      {/* Official Header */}
      <div className="border-b-4 border-double border-black pb-4 mb-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain shrink-0" />
            <div>
              <h1 className="text-3xl font-black m-0 tracking-tighter" style={{ lineHeight: 1 }}>
                AyamSehat<span className="text-gray-400">.AI</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-400 m-0 uppercase tracking-[0.3em] mt-1">
                Artificial Intelligence Poultry Diagnostics
              </p>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-3 rounded-sm">
              Sertifikat Diagnosis Resmi
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-black m-0 text-gray-800">NO. REFERENSI: <span className="text-base">#{detail.id.toString().padStart(6, '0')}</span></p>
              <p className="text-[10px] font-bold text-gray-400 m-0">TANGGAL: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}</p>
            </div>
          </div>
        </div>
        
        {/* Subtle decorative line */}
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black/10" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-8">
        
        {/* Left Col: Image & Info */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-200 pb-1">Citra Feses</h3>
          <div className="w-2/3 mx-auto aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3 border-2 border-gray-200">
            <img 
              src={`${IMAGE_BASE_URL}/${detail.namaFile}`} 
              alt="Citra Diagnosis" 
              className="w-full h-full object-cover"
            />
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-500 font-medium">Nama File</td>
                <td className="py-2 font-bold text-right truncate pl-2">{detail.namaFile}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-500 font-medium">Tgl Diunggah</td>
                <td className="py-2 font-bold text-right">{new Date(detail.tanggalUnggah).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500 font-medium">Waktu Analisis</td>
                <td className="py-2 font-bold text-right">{new Date(detail.tanggalUnggah).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Col: Result */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-200 pb-1">Hasil Analisis AI</h3>
          
          <div className={`p-3 rounded-2xl border-2 mb-3 ${isLowConfidence ? 'bg-yellow-50 border-yellow-200' : isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 block">Diagnosis Utama</span>
            <h2 className={`text-2xl font-black m-0 mb-2 ${isLowConfidence ? 'text-yellow-700' : isHealthy ? 'text-green-700' : 'text-red-700'}`}>
              {isLowConfidence ? 'Tidak Terdeteksi' : detail.hasilPrediksi?.labelPenyakit}
            </h2>
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              {isLowConfidence ? (
                <p className="text-[11px] text-gray-700 m-0 leading-normal font-medium text-justify">
                  Gambar yang Anda unggah bukan merupakan feses.
                </p>
              ) : detail.hasilPrediksi?.saranAI ? (
                <>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 flex items-center gap-1">
                    ✨ SARAN AI DOCTOR
                  </span>
                  <p className="text-[11px] text-gray-800 m-0 leading-normal font-medium text-justify">
                    {detail.hasilPrediksi.saranAI}
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-gray-700 m-0 leading-normal font-medium text-justify">
                  {getLabelDescription(detail.hasilPrediksi?.labelPenyakit || '')}
                </p>
              )}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-bold text-gray-600">Akurasi Sistem (Confidence)</span>
              <span className="text-2xl font-black text-black">
                {(detail.hasilPrediksi?.nilaiAkurasi ? detail.hasilPrediksi.nilaiAkurasi * 100 : 0).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isLowConfidence ? 'bg-yellow-500' : isHealthy ? 'bg-green-500' : 'bg-red-500'}`} 
                style={{ width: `${(detail.hasilPrediksi?.nilaiAkurasi || 0) * 100}%` }}
              ></div>
            </div>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-200 pb-1">Distribusi Probabilitas</h3>
          <div className="space-y-1.5">
            {detail.hasilPrediksi?.allProbs && Object.entries(detail.hasilPrediksi.allProbs).map(([label, prob]) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-600 capitalize text-sm">{label.toLowerCase()}</span>
                  <span className="font-bold text-black text-sm">{(prob as number * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-400" 
                    style={{ width: `${prob as number * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 border-t border-gray-200 text-center">
        <p className="text-[10px] text-gray-400 font-medium m-0">Dokumen ini dicetak secara otomatis oleh Sistem AyamSehat.AI dan sah tanpa tanda tangan.</p>
        <p className="text-[10px] text-gray-300 m-0 mt-1">Dicetak pada {new Date().toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
};

export default PrintReport;
