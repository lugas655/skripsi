import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import adminService from '../../services/adminService';

interface HealthTabProps {
  stats: any;
}

const HealthTab: React.FC<HealthTabProps> = ({ stats }) => {
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['adminHealth'],
    queryFn: adminService.getHealth,
    staleTime: 30_000,
  });

  if (healthLoading) {
    return <div className="admin2-loading"><ProgressSpinner strokeWidth="3" /></div>;
  }

  return (
    <div className="admin2-health">
      <div className="admin2-health-grid">
        <div className="admin2-card">
          <div className="admin2-card-head">
            <div>
              <p className="admin2-card-title">ML Core — ViT Engine</p>
              <p className="admin2-card-sub">Model inferensi aktif</p>
            </div>
            <Tag
              value={health?.mlService?.status === 'online' ? 'Online' : 'Offline'}
              severity={health?.mlService?.status === 'online' ? 'success' : 'danger'}
            />
          </div>
          <div className="admin2-health-details">
            <div className="admin2-health-row">
              <span className="admin2-health-key">Latency</span>
              <span className="admin2-health-val">{health?.mlService?.latency ?? '—'} ms</span>
            </div>
            <div className="admin2-health-row">
              <span className="admin2-health-key">Node</span>
              <span className="admin2-health-mono">VIT_CORE_PROD</span>
            </div>
          </div>
        </div>

        <div className="admin2-card">
          <div className="admin2-card-head">
            <div>
              <p className="admin2-card-title">Gemini AI</p>
              <p className="admin2-card-sub">Analitik berbasis LLM</p>
            </div>
            <Tag
              value={health?.geminiApi?.status === 'online' ? 'Online' : 'Offline'}
              severity={health?.geminiApi?.status === 'online' ? 'success' : 'danger'}
            />
          </div>
          <div className="admin2-health-details">
            <div className="admin2-health-row">
              <span className="admin2-health-key">Provider</span>
              <span className="admin2-health-mono">Google Gemini</span>
            </div>
            <div className="admin2-health-row">
              <span className="admin2-health-key">Konfigurasi</span>
              <Tag value="Terverifikasi" severity="success" style={{ fontSize: 11 }} />
            </div>
          </div>
        </div>

        <div className="admin2-card admin2-card--wide">
          <div className="admin2-card-head">
            <div>
              <p className="admin2-card-title">Database</p>
              <p className="admin2-card-sub">PostgreSQL · Selalu aktif</p>
            </div>
            <Tag value="Online" severity="success" />
          </div>
          <div className="admin2-db-stats">
            {[
              { label: 'Pengguna', val: stats?.users },
              { label: 'Sampel', val: stats?.totalUploads },
              { label: 'Prediksi', val: stats?.totalPredictions },
            ].map((s) => (
              <div key={s.label} className="admin2-db-stat">
                <p className="admin2-db-stat-val">{s.val?.toLocaleString() ?? '—'}</p>
                <p className="admin2-db-stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        className="admin2-btn-primary admin2-scan-btn"
        onClick={() => refetchHealth()}
      >
        <i className="pi pi-sync" /> Jalankan pengecekan penuh
      </button>
    </div>
  );
};

export default HealthTab;
