/// <reference types="vite/client" />
import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { historyService } from '../services/historyService';
import { IMAGE_BASE_URL } from '../api/api';
import { Citra } from '../types';

// ────────────────────────────────────────
// Helpers
// ────────────────────────────────────────

interface BadgeConfig { bg: string; text: string; dot: string; label: string; }

const getBadge = (label?: string): BadgeConfig => {
  const l = label?.toUpperCase();
  if (l === 'HEALTHY')    return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500',  label: 'Sehat'     };
  if (l === 'COCCIDIOSIS')return { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500',      label: 'Koksidiosis' };
  if (l === 'NEWCASTLE')  return { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500',    label: 'Newcastle'  };
  if (l === 'SALMONELLA') return { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500',     label: 'Salmonella' };
  return                         { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400',    label: label || '—' };
};

const FILTER_OPTIONS = [
  { label: 'Semua Diagnosis', value: '' },
  { label: 'Sehat',           value: 'HEALTHY'     },
  { label: 'Koksidiosis',     value: 'COCCIDIOSIS' },
  { label: 'Newcastle',       value: 'NEWCASTLE'   },
  { label: 'Salmonella',      value: 'SALMONELLA'  },
];

// ────────────────────────────────────────
// Column Templates
// ────────────────────────────────────────

const ImageTemplate = (rowData: Citra) => (
  <img
    src={`${IMAGE_BASE_URL}/${rowData.namaFile}`}
    alt="Sample"
    className="w-12 h-12 rounded-xl object-cover shadow-sm border-2 border-slate-100"
  />
);

const DateTemplate = (rowData: Citra) => {
  const d = new Date(rowData.tanggalUnggah);
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900 m-0">
        {d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
      <p className="text-xs text-slate-400 m-0 mt-0.5">
        {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};

const StatusTemplate = (rowData: Citra) => {
  const badge = getBadge(rowData.hasilPrediksi?.labelPenyakit);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
      {badge.label}
    </span>
  );
};

const AccuracyTemplate = (rowData: Citra) => {
  const val = rowData.hasilPrediksi?.nilaiAkurasi
    ? rowData.hasilPrediksi.nilaiAkurasi * 100
    : 0;
  const isHealthy = rowData.hasilPrediksi?.labelPenyakit === 'HEALTHY';
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[56px] hidden sm:block">
        <div
          className={`h-full rounded-full transition-all ${isHealthy ? 'bg-emerald-500' : 'bg-red-400'}`}
          style={{ width: `${val}%` }}
        />
      </div>
      <span className="text-sm font-bold text-slate-900">{val.toFixed(1)}%</span>
    </div>
  );
};

// ────────────────────────────────────────
// Main Page
// ────────────────────────────────────────

const HistoryPage: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useRef<Toast>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: history, isLoading } = useQuery<Citra[]>({
    queryKey: ['history'],
    queryFn: async () => {
      return await historyService.getAllHistory();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => historyService.deleteHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Riwayat diagnosa telah dihapus',
        life: 3000,
      });
    },
    onError: () => {
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal menghapus riwayat',
        life: 3000,
      });
    },
  });

  const confirmDelete = (id: number) => {
    confirmDialog({
      message: 'Apakah Anda yakin ingin menghapus riwayat diagnosa ini?',
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger !rounded-lg !px-4',
      rejectClassName: 'p-button-text !text-slate-500 !rounded-lg !mr-3 !px-4',
      accept: () => deleteMutation.mutate(id),
    });
  };

  // Client-side filtering
  const filteredHistory = history?.filter(item => {
    const matchStatus = statusFilter
      ? item.hasilPrediksi?.labelPenyakit === statusFilter
      : true;
    const search = globalFilter.toLowerCase();
    const matchSearch = search
      ? item.hasilPrediksi?.labelPenyakit?.toLowerCase().includes(search) ||
        new Date(item.tanggalUnggah).toLocaleDateString('id-ID').includes(search) ||
        item.namaFile.toLowerCase().includes(search)
      : true;
    return matchStatus && matchSearch;
  });

  // Summary counts
  const counts = {
    total:       history?.length || 0,
    healthy:     history?.filter(h => h.hasilPrediksi?.labelPenyakit === 'HEALTHY').length || 0,
    diseased:    history?.filter(h => h.hasilPrediksi?.labelPenyakit && h.hasilPrediksi.labelPenyakit !== 'HEALTHY').length || 0,
  };

  const ActionTemplate = (rowData: Citra) => (
    <div className="flex items-center gap-1">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-text !text-slate-400 hover:!text-blue-600 hover:!bg-blue-50 !w-9 !h-9 transition-all"
        onClick={() => navigate(`/history/${rowData.id}`)}
        tooltip="Lihat Detail"
        tooltipOptions={{ position: 'bottom' }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text !text-slate-400 hover:!text-red-500 hover:!bg-red-50 !w-9 !h-9 transition-all"
        onClick={() => confirmDelete(rowData.id)}
        tooltip="Hapus"
        tooltipOptions={{ position: 'bottom' }}
        loading={deleteMutation.isPending && deleteMutation.variables === rowData.id}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Toast ref={toast} />
      <ConfirmDialog />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
              Riwayat Diagnosa
            </h1>
            <p className="text-sm text-slate-400 mt-1 m-0">
              Semua riwayat analisis citra yang pernah dilakukan
            </p>
          </div>
          <Button
            label="Diagnosa Baru"
            icon="pi pi-plus"
            className="p-button-primary !rounded-xl !px-5 !py-2.5 !text-sm !font-semibold !shadow-md !shadow-blue-200 shrink-0"
            onClick={() => navigate('/predict')}
          />
        </div>

        {/* ── Summary Mini Cards ── */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in delay-100">
          {[
            { label: 'Total Data',     value: counts.total,   icon: 'pi-database',         bg: 'bg-blue-50',    text: 'text-blue-600'    },
            { label: 'Sehat',          value: counts.healthy,  icon: 'pi-check-circle',     bg: 'bg-emerald-50', text: 'text-emerald-600' },
            { label: 'Perlu Perhatian',value: counts.diseased, icon: 'pi-exclamation-circle',bg: 'bg-red-50',    text: 'text-red-600'     },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <span
                className={`${c.bg} ${c.text}`}
                style={{ width: 36, height: 36, minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 12 }}
              >
                <i className={`pi ${c.icon}`} style={{ fontSize: 14 }} />
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide m-0">{c.label}</p>
                <p className={`text-xl font-extrabold m-0 ${c.text}`}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── DataTable Card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in delay-200">

          {/* Table Header / Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">Data Prediksi</h3>
              <p className="text-xs text-slate-400 m-0 mt-0.5">
                Menampilkan {filteredHistory?.length || 0} dari {counts.total} data
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Status Filter Dropdown */}
              <Dropdown
                value={statusFilter}
                options={FILTER_OPTIONS}
                onChange={(e) => setStatusFilter(e.value)}
                placeholder="Filter Status"
                className="!rounded-xl !border-slate-200 !text-sm w-full sm:w-44"
              />
              {/* Search */}
              <span className="p-input-icon-left w-full sm:w-auto">
                <i className="pi pi-search !text-slate-400 !text-xs" />
                <InputText
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Cari diagnosis..."
                  className="!rounded-xl !border-slate-200 !text-sm !pl-9 w-full sm:w-64"
                />
              </span>
            </div>
          </div>

          {/* Table */}
          <DataTable
            value={filteredHistory}
            paginator
            rows={10}
            loading={isLoading}
            dataKey="id"
            emptyMessage={
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <i className="pi pi-inbox text-3xl text-slate-200 mb-3" />
                <p className="text-sm font-semibold text-slate-400 m-0">Tidak ada data ditemukan</p>
                <p className="text-xs text-slate-300 m-0 mt-1">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            }
            responsiveLayout="stack"
            breakpoint="768px"
            rowsPerPageOptions={[5, 10, 25, 50]}
            sortMode="single"
            removableSort
            className="text-sm"
            pt={{
              loadingIcon: { className: 'text-blue-500' },
            }}
          >
            <Column
              header="Sampel"
              body={ImageTemplate}
              style={{ width: '80px' }}
            />
            <Column
              header="Tanggal"
              body={DateTemplate}
              field="tanggalUnggah"
              sortable
              style={{ minWidth: '140px' }}
            />
            <Column
              header="Diagnosis"
              body={StatusTemplate}
              field="hasilPrediksi.labelPenyakit"
              sortable
              style={{ minWidth: '160px' }}
            />
            <Column
              header="Confidence"
              body={AccuracyTemplate}
              field="hasilPrediksi.nilaiAkurasi"
              sortable
              style={{ minWidth: '130px' }}
            />
            <Column
              header=""
              body={ActionTemplate}
              style={{ width: '60px', textAlign: 'center' }}
            />
          </DataTable>
        </div>

      </main>
    </div>
  );
};

export default HistoryPage;
