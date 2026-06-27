import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';
import adminService, { AdminUpload } from '../../services/adminService';
import { IMAGE_BASE_URL } from '../../api/api';

interface OverviewTabProps {
  stats: any;
  setActiveTab: (tab: 'overview' | 'users' | 'samples' | 'reviews' | 'health') => void;
  getSeverity: (label: string) => any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats, setActiveTab, getSeverity }) => {
  const { data: uploads } = useQuery({
    queryKey: ['adminUploads'],
    queryFn: adminService.getUploads,
  });

  const { data: health } = useQuery({
    queryKey: ['adminHealth'],
    queryFn: adminService.getHealth,
    staleTime: 30_000,
  });

  const DISEASE_COLORS: Record<string, string> = {
    HEALTHY: '#059669',
    COCCIDIOSIS: '#dc2626',
    NEWCASTLE: '#d97706',
    SALMONELLA: '#2563eb',
  };

  const totalCount = stats?.diseaseStats?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 1;

  return (
    <div className="admin2-overview">
      <div className="admin2-stats-row">
        {[
          { label: 'Total Pengguna', val: stats?.users, icon: 'pi-users', bg: '#f0f9ff', color: '#0ea5e9' },
          { label: 'Total Sampel', val: stats?.totalUploads, icon: 'pi-images', bg: '#f5f3ff', color: '#8b5cf6' },
          { label: 'Prediksi AI', val: stats?.totalPredictions, icon: 'pi-bolt', bg: '#fffbeb', color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="admin2-stat-card">
            <div className="admin2-stat-top">
              <span className="admin2-stat-label">{s.label}</span>
              <div className="admin2-stat-icon" style={{ background: s.bg }}>
                <i className={`pi ${s.icon}`} style={{ color: s.color, fontSize: 18 }} />
              </div>
            </div>
            <p className="admin2-stat-val">{s.val?.toLocaleString() ?? '—'}</p>
            <p className="admin2-stat-foot">Data keseluruhan</p>
          </div>
        ))}
      </div>

      <div className="admin2-mid-row">
        <div className="admin2-card">
          <div className="admin2-card-head">
            <div>
              <p className="admin2-card-title">Sampel terbaru</p>
              <p className="admin2-card-sub">10 unggahan paling baru</p>
            </div>
            <button className="admin2-card-action" onClick={() => setActiveTab('samples')}>
              Lihat semua <i className="pi pi-arrow-right" style={{ fontSize: 11 }} />
            </button>
          </div>
          <DataTable value={uploads?.slice(0, 10)} className="admin2-datatable admin2-datatable-compact" rowHover emptyMessage="Belum ada sampel.">
            <Column
              header="Gambar"
              body={(u: AdminUpload) => (
                <Image src={`${IMAGE_BASE_URL}/${u.namaFile}`} alt="Sample" width="44" preview className="admin2-img-thumb" />
              )}
              style={{ width: 60 }}
            />
            <Column
              header="Pengguna"
              body={(u: AdminUpload) => (
                <div>
                  <p className="admin2-cell-name">{u.user.nama_lengkap}</p>
                  <p className="admin2-cell-mono">{u.user.username}</p>
                </div>
              )}
            />
            <Column
              header="Diagnosis"
              body={(u: AdminUpload) =>
                u.hasilPrediksi ? (
                  <Tag value={u.hasilPrediksi.labelPenyakit} severity={getSeverity(u.hasilPrediksi.labelPenyakit)} className="admin2-tag" />
                ) : (
                  <span className="admin2-cell-muted">Memproses...</span>
                )
              }
            />
            <Column
              header="Waktu"
              body={(u: AdminUpload) => (
                <span className="admin2-cell-muted">
                  {new Date(u.tanggalUnggah).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </span>
              )}
            />
          </DataTable>
        </div>

        <div className="admin2-right-col">
          <div className="admin2-card">
            <div className="admin2-card-head">
              <p className="admin2-card-title">Distribusi penyakit</p>
            </div>
            <div className="admin2-disease-list">
              {(stats?.diseaseStats ?? []).map((d: any) => (
                <div key={d.label} className="admin2-disease-row">
                  <div className="admin2-disease-meta">
                    <span className="admin2-disease-name">{d.label}</span>
                    <span className="admin2-disease-pct">{Math.round((d.count / totalCount) * 100)}%</span>
                  </div>
                  <div className="admin2-bar-track">
                    <div className="admin2-bar-fill" style={{ width: `${(d.count / totalCount) * 100}%`, background: DISEASE_COLORS[d.label] || '#94a3b8' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin2-card">
            <div className="admin2-card-head">
              <p className="admin2-card-title">Status layanan</p>
            </div>
            <div className="admin2-svc-list">
              {[
                { name: 'ML Prediction', ok: health?.mlService?.status === 'online', detail: 'Flask API Backend' },
                { name: 'Gemini AI', ok: health?.geminiApi?.status === 'online', detail: 'Google Generative AI' },
                { name: 'Database', ok: true, detail: 'PostgreSQL Server' },
              ].map((s) => (
                <div key={s.name} className="admin2-svc-item">
                  <div className={`admin2-svc-dot ${s.ok ? 'ok' : 'err'}`} style={{ background: s.ok ? '#10b981' : '#ef4444' }} />
                  <div className="admin2-svc-info">
                    <span className="admin2-svc-name">{s.name}</span>
                    <span className="admin2-svc-detail">{s.detail}</span>
                  </div>
                  <span className={`admin2-svc-badge ${s.ok ? 'ok' : 'err'}`}>{s.ok ? 'Online' : 'Offline'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
