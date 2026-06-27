import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';
import { Dropdown } from 'primereact/dropdown';
import { FilterMatchMode } from 'primereact/api';
import adminService, { AdminUpload } from '../../services/adminService';
import { IMAGE_BASE_URL } from '../../api/api';

interface SamplesTabProps {
  stats: any;
  getSeverity: (label: string) => any;
}

const diagnosisFilterTemplate = (options: any) => (
  <Dropdown
    value={options.value}
    options={['HEALTHY', 'COCCIDIOSIS', 'NEWCASTLE', 'SALMONELLA']}
    onChange={(e) => options.filterCallback(e.value)}
    placeholder="Semua diagnosis"
    className="p-column-filter admin2-dropdown-sm"
    showClear
  />
);

const SamplesTab: React.FC<SamplesTabProps> = ({ stats, getSeverity }) => {
  const [sampleFilters, setSampleFilters] = useState<DataTableFilterMeta>({
    'hasilPrediksi.labelPenyakit': { value: null, matchMode: FilterMatchMode.EQUALS },
    'user.nama_lengkap': { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const { data: uploads, isLoading: uploadsLoading } = useQuery({
    queryKey: ['adminUploads'],
    queryFn: adminService.getUploads,
  });

  return (
    <div className="admin2-card">
      <div className="admin2-card-head">
        <div>
          <p className="admin2-card-title">Repositori sampel</p>
          <p className="admin2-card-sub">{stats?.totalUploads?.toLocaleString() ?? 0} gambar tersimpan</p>
        </div>
        <button
          className="admin2-btn-ghost"
          onClick={() =>
            setSampleFilters({
              'hasilPrediksi.labelPenyakit': { value: null, matchMode: FilterMatchMode.EQUALS },
              'user.nama_lengkap': { value: null, matchMode: FilterMatchMode.CONTAINS },
            })
          }
        >
          <i className="pi pi-filter-slash" /> Reset filter
        </button>
      </div>
      <DataTable
        value={uploads}
        loading={uploadsLoading}
        filters={sampleFilters}
        onFilter={(e) => setSampleFilters(e.filters)}
        responsiveLayout="scroll"
        paginator
        rows={10}
        className="admin2-datatable"
        rowHover
        filterDisplay="row"
        emptyMessage="Tidak ada sampel ditemukan."
      >
        <Column
          header="Gambar"
          body={(u: AdminUpload) => (
            <Image
              src={`${IMAGE_BASE_URL}/${u.namaFile}`}
              alt="Sampel"
              width="52"
              preview
              className="admin2-img-thumb"
            />
          )}
          style={{ width: 72 }}
        />
        <Column
          field="user.nama_lengkap"
          header="Pengguna"
          body={(u: AdminUpload) => (
            <div>
              <p className="admin2-cell-name">{u.user.nama_lengkap}</p>
              <p className="admin2-cell-mono">{u.user.username}</p>
            </div>
          )}
          sortable
          filter
          filterPlaceholder="Cari pengguna..."
          showFilterMenu={false}
        />
        <Column
          field="hasilPrediksi.labelPenyakit"
          header="Diagnosis"
          body={(u: AdminUpload) =>
            u.hasilPrediksi ? (
              <Tag
                value={u.hasilPrediksi.labelPenyakit}
                severity={getSeverity(u.hasilPrediksi.labelPenyakit)}
                className="admin2-tag"
              />
            ) : (
              <span className="admin2-cell-muted italic">Memproses...</span>
            )
          }
          sortable
          filter
          filterElement={diagnosisFilterTemplate}
          showFilterMenu={false}
          style={{ width: 160 }}
        />
        <Column
          field="tanggalUnggah"
          header="Waktu unggah"
          body={(u: AdminUpload) => (
            <span className="admin2-cell-muted">
              {new Date(u.tanggalUnggah).toLocaleString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          )}
          sortable
          style={{ width: 180 }}
        />
        <Column
          header=""
          body={(u: AdminUpload) => (
            <button
              className="admin2-icon-btn"
              title="Unduh gambar"
              onClick={() => adminService.downloadFile(u.id, u.namaFile)}
            >
              <i className="pi pi-download" />
            </button>
          )}
          style={{ width: 56 }}
        />
      </DataTable>
    </div>
  );
};

export default SamplesTab;
