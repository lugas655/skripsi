/// <reference types="vite/client" />
import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Citra } from '../types';

const HistoryPage: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const navigate = useNavigate();

  const { data: history, isLoading } = useQuery<Citra[]>({
    queryKey: ['history'],
    queryFn: async () => {
      const response = await api.get('/history');
      return response.data;
    },
  });

  const getTheme = (label: string) => {
    const l = label?.toUpperCase();
    if (l === 'HEALTHY') return 'bg-emerald-100 text-emerald-700';
    if (l === 'COCCIDIOSIS') return 'bg-red-100 text-red-700';
    if (l === 'NEWCASTLE') return 'bg-amber-100 text-amber-700';
    if (l === 'SALMONELLA') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-700';
  };

  const imageBodyTemplate = (rowData: Citra) => {
    const imageUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${rowData.namaFile}`;
    return (
      <div className="flex items-center gap-3">
        <img src={imageUrl} alt={rowData.namaFile} className="w-12 h-12 md:w-16 md:h-16 rounded-xl shadow-md object-cover border-2 border-white" />
      </div>
    );
  };

  const dateBodyTemplate = (rowData: Citra) => {
    return (
      <div className="flex flex-col">
        <span className="font-bold text-slate-900 text-xs md:text-sm">
          {new Date(rowData.tanggalUnggah).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="text-slate-400 text-[10px] md:text-xs">
          {new Date(rowData.tanggalUnggah).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    );
  };

  const statusBodyTemplate = (rowData: Citra) => {
    const label = rowData.hasilPrediksi?.labelPenyakit || 'PENDING';
    return (
      <span className={`px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm ${getTheme(label)}`}>
        {label}
      </span>
    );
  };

  const accuracyBodyTemplate = (rowData: Citra) => {
    const val = rowData.hasilPrediksi?.nilaiAkurasi ? (rowData.hasilPrediksi.nilaiAkurasi * 100).toFixed(1) : '0';
    return (
      <div className="flex items-center gap-2">
        <div className="hidden md:block w-full bg-slate-100 rounded-full h-1.5 max-w-[60px]">
          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${val}%` }}></div>
        </div>
        <span className="font-black text-slate-900 text-xs md:text-sm">{val}%</span>
      </div>
    );
  };

  const actionBodyTemplate = (rowData: Citra) => {
    return (
      <Button 
        icon="pi pi-chevron-right" 
        className="p-button-rounded p-button-text text-blue-600 hover:bg-blue-50" 
        onClick={() => navigate(`/history/${rowData.id}`)}
      />
    );
  };

  const header = (
    <div className="flex flex-col md:flex-row justify-between items-center gap-5 p-4 md:p-6">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
          <i className="pi pi-history text-lg md:text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 m-0 leading-tight">Riwayat Diagnosa</h2>
          <p className="m-0 text-slate-400 text-[10px] md:text-xs uppercase font-bold tracking-widest mt-1">Data Tersimpan</p>
        </div>
      </div>
      <div className="relative w-full md:w-auto">
        <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <InputText 
          type="search" 
          onInput={(e) => setGlobalFilter(e.currentTarget.value)} 
          placeholder="Cari penyakit/tanggal..." 
          className="w-full md:w-80 rounded-2xl pl-12 pr-4 py-3 border-slate-200 focus:border-blue-500 shadow-sm text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <div className="w-full px-4 md:px-8 py-4 md:py-8">
        <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border-1 border-slate-200 overflow-hidden">
          <DataTable 
            value={history} 
            paginator 
            rows={10} 
            loading={isLoading}
            dataKey="id" 
            header={header} 
            globalFilter={globalFilter}
            emptyMessage="Belum ada riwayat diagnosa yang ditemukan."
            responsiveLayout="stack"
            breakpoint="960px"
            className="modern-datatable"
            rowClassName={() => 'hover:bg-slate-50 transition-all cursor-default'}
            size="large"
            rowsPerPageOptions={[5, 10, 25]}
          >
            <Column body={imageBodyTemplate} header="Sampel" style={{ width: '10%' }} />
            <Column body={dateBodyTemplate} header="Waktu" sortable field="tanggalUnggah" style={{ width: '25%' }} />
            <Column body={statusBodyTemplate} header="Diagnosis" sortable field="hasilPrediksi.labelPenyakit" style={{ width: '25%' }} />
            <Column body={accuracyBodyTemplate} header="Confidence" sortable field="hasilPrediksi.nilaiAkurasi" style={{ width: '25%' }} />
            <Column body={actionBodyTemplate} header="Detail" style={{ width: '15%', textAlign: 'center' }} />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
