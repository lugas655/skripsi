/// <reference types="vite/client" />
import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Skeleton } from 'primereact/skeleton';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { historyService, PaginatedCitra } from '../services/historyService';
import { IMAGE_BASE_URL } from '../api/api';
import { Citra } from '../types';

const getBadgeClass = (label?: string) => {
  const l = label?.toUpperCase();
  if (l === 'HEALTHY')     return { cls: 'badge-healthy',  lbl: 'Sehat' };
  if (l === 'COCCIDIOSIS') return { cls: 'badge-disease',  lbl: 'Koksidiosis' };
  if (l === 'NEWCASTLE')   return { cls: 'badge-warn',     lbl: 'Newcastle' };
  if (l === 'SALMONELLA')  return { cls: 'badge-info',     lbl: 'Salmonella' };
  return { cls: 'badge-neutral', lbl: label || '—' };
};

const FILTER_OPTIONS = [
  { label: 'Semua Diagnosis', value: '' },
  { label: 'Sehat',           value: 'HEALTHY'     },
  { label: 'Koksidiosis',     value: 'COCCIDIOSIS' },
  { label: 'Newcastle',       value: 'NEWCASTLE'   },
  { label: 'Salmonella',      value: 'SALMONELLA'  },
];

const HistoryPage: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useRef<Toast>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: paginated, isLoading } = useQuery<PaginatedCitra>({
    queryKey: ['history'],
    queryFn: () => historyService.getAllHistory(),
  });
  const history = paginated?.data;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => historyService.deleteHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Riwayat dihapus', life: 3000 });
    },
    onError: () => toast.current?.show({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus riwayat', life: 3000 }),
  });

  const confirmDelete = (id: number) => {
    confirmDialog({
      message: 'Hapus riwayat diagnosa ini?',
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus', rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger !rounded-lg !px-4',
      rejectClassName: 'p-button-text !text-slate-500 !rounded-lg !mr-3 !px-4',
      accept: () => deleteMutation.mutate(id),
    });
  };

  const filtered = history?.filter(item => {
    const matchStatus = statusFilter ? item.hasilPrediksi?.labelPenyakit === statusFilter : true;
    const s = globalFilter.toLowerCase();
    const matchSearch = s
      ? item.hasilPrediksi?.labelPenyakit?.toLowerCase().includes(s) ||
        new Date(item.tanggalUnggah).toLocaleDateString('id-ID').includes(s) ||
        item.namaFile.toLowerCase().includes(s)
      : true;
    return matchStatus && matchSearch;
  });

  const counts = {
    total:    history?.length || 0,
    healthy:  history?.filter(h => h.hasilPrediksi?.labelPenyakit === 'HEALTHY').length || 0,
    diseased: history?.filter(h => h.hasilPrediksi?.labelPenyakit && h.hasilPrediksi.labelPenyakit !== 'HEALTHY').length || 0,
  };

  /* Column templates */
  const ImageTpl = (row: Citra) => (
    <img src={`${IMAGE_BASE_URL}/${row.namaFile}`} alt="Sample"
      className="w-11 h-11 rounded-xl object-cover" style={{ border: '2px solid var(--col-border)' }} />
  );
  const DateTpl = (row: Citra) => {
    const d = new Date(row.tanggalUnggah);
    return (
      <div>
        <p className="m-0 text-sm font-semibold" style={{ color: 'var(--col-ink)' }}>{d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        <p className="m-0 text-xs mt-0.5" style={{ color: 'var(--col-ink-4)' }}>{d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    );
  };
  const StatusTpl = (row: Citra) => {
    const b = getBadgeClass(row.hasilPrediksi?.labelPenyakit);
    return <span className={`badge ${b.cls}`}><span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />{b.lbl}</span>;
  };
  const AccuracyTpl = (row: Citra) => {
    const val = (row.hasilPrediksi?.nilaiAkurasi || 0) * 100;
    const isH = row.hasilPrediksi?.labelPenyakit === 'HEALTHY';
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-full h-1.5 max-w-[48px] hidden sm:block" style={{ background: 'var(--col-border)' }}>
          <div className="h-full rounded-full" style={{ width: `${val}%`, background: isH ? 'var(--col-healthy)' : 'var(--col-disease)' }} />
        </div>
        <span className="diag-number text-sm font-bold" style={{ color: 'var(--col-ink)' }}>{val.toFixed(1)}%</span>
      </div>
    );
  };
  const ActionTpl = (row: Citra) => (
    <div className="flex items-center gap-0.5">
      <button className="w-8 h-8 flex items-center justify-center rounded-lg border-none bg-transparent cursor-pointer transition-all"
        style={{ color: 'var(--col-ink-4)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--col-brand-pale)'; e.currentTarget.style.color = 'var(--col-brand)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--col-ink-4)'; }}
        onClick={() => navigate(`/history/${row.id}`)} title="Lihat Detail">
        <i className="pi pi-eye" style={{ fontSize: 13 }} />
      </button>
      <button className="w-8 h-8 flex items-center justify-center rounded-lg border-none bg-transparent cursor-pointer transition-all"
        style={{ color: 'var(--col-ink-4)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--col-disease-pale)'; e.currentTarget.style.color = 'var(--col-disease)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--col-ink-4)'; }}
        onClick={() => confirmDelete(row.id)} title="Hapus">
        <i className="pi pi-trash" style={{ fontSize: 13 }} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--col-surface)' }}>
      <Navbar /><Toast ref={toast} /><ConfirmDialog />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 animate-fade-up">
          <div>
            <h1 className="m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--col-ink)' }}>Riwayat Diagnosa</h1>
            <p className="m-0 mt-1 text-sm" style={{ color: 'var(--col-ink-4)' }}>Semua riwayat analisis citra yang pernah dilakukan</p>
          </div>
          <button
            onClick={() => navigate('/predict')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--col-brand)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(21,128,61,0.3)', fontFamily: 'var(--font-display)' }}
          >
            <i className="pi pi-plus" style={{ fontSize: 13 }} /> Diagnosa Baru
          </button>
        </div>

        {/* Summary mini cards */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-up delay-100">
          {[
            { label: 'Total Data',      val: counts.total,    icon: 'pi-database',          color: 'var(--col-info)',    pale: 'var(--col-info-pale)'    },
            { label: 'Sehat',           val: counts.healthy,  icon: 'pi-check-circle',      color: 'var(--col-healthy)', pale: 'var(--col-healthy-pale)' },
            { label: 'Perlu Perhatian', val: counts.diseased, icon: 'pi-exclamation-circle', color: 'var(--col-disease)', pale: 'var(--col-disease-pale)' },
          ].map((c, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div style={{ width: 34, height: 34, minWidth: 34, borderRadius: 9, background: c.pale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`pi ${c.icon}`} style={{ fontSize: 13, color: c.color }} />
              </div>
              <div>
                <p className="diag-label m-0">{c.label}</p>
                <p className="diag-number m-0" style={{ fontSize: '1.25rem', color: c.color }}>{c.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="card overflow-hidden animate-fade-up delay-200">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--col-border)' }}>
            <div>
              <h3 className="m-0 text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>Data Prediksi</h3>
              <p className="m-0 mt-0.5 text-xs" style={{ color: 'var(--col-ink-4)' }}>
                {filtered?.length || 0} dari {counts.total} data ditampilkan
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <Dropdown value={statusFilter} options={FILTER_OPTIONS} onChange={e => setStatusFilter(e.value)}
                placeholder="Filter Status" className="!rounded-xl !border-slate-200 !text-sm w-full sm:w-44" />
              <span className="p-input-icon-left w-full sm:w-auto">
                <i className="pi pi-search !text-slate-400" style={{ fontSize: 12 }} />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)}
                  placeholder="Cari diagnosis..." className="!rounded-xl !text-sm !pl-9 w-full sm:w-52" />
              </span>
            </div>
          </div>

          <DataTable
            value={filtered} paginator rows={10} loading={isLoading} dataKey="id"
            emptyMessage={
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <i className="pi pi-inbox text-3xl mb-3" style={{ color: 'var(--col-border)' }} />
                <p className="text-sm font-semibold m-0" style={{ color: 'var(--col-ink-4)' }}>Tidak ada data ditemukan</p>
                <p className="text-xs m-0 mt-1" style={{ color: 'var(--col-ink-4)', opacity: 0.6 }}>Coba ubah filter atau kata kunci pencarian</p>
              </div>
            }
            responsiveLayout="stack" breakpoint="768px"
            rowsPerPageOptions={[5, 10, 25, 50]} sortMode="single" removableSort className="text-sm"
          >
            <Column header="Sampel"     body={ImageTpl}    style={{ width: '68px' }} />
            <Column header="Tanggal"    body={DateTpl}     field="tanggalUnggah"               sortable style={{ minWidth: '140px' }} />
            <Column header="Diagnosis"  body={StatusTpl}   field="hasilPrediksi.labelPenyakit" sortable style={{ minWidth: '150px' }} />
            <Column header="Confidence" body={AccuracyTpl} field="hasilPrediksi.nilaiAkurasi"  sortable style={{ minWidth: '130px' }} />
            <Column header=""           body={ActionTpl}   style={{ width: '76px' }} />
          </DataTable>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
