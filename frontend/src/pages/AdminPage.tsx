import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useNavigate } from 'react-router-dom';

import adminService from '../services/adminService';
import OverviewTab from '../components/adminpage/OverviewTab';
import UsersTab from '../components/adminpage/UsersTab';
import SamplesTab from '../components/adminpage/SamplesTab';
import ReviewsTab from '../components/adminpage/ReviewsTab';
import HealthTab from '../components/adminpage/HealthTab';
import '../components/adminpage/AdminPage.css';

type TabId = 'overview' | 'users' | 'samples' | 'reviews' | 'health';

const INITIALS = (name: string) =>
  name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

const AVATAR_GRADS = [
  'linear-gradient(135deg,#6366f1,#a78bfa)',
  'linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#db2777,#f472b6)',
  'linear-gradient(135deg,#d97706,#fbbf24)',
  'linear-gradient(135deg,#0ea5e9,#38bdf8)',
];
const avatarGrad = (username: string) =>
  AVATAR_GRADS[username.charCodeAt(0) % AVATAR_GRADS.length];

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const toast = useRef<Toast>(null);

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getStats,
  });

  const getSeverity = (label: string) => {
    const map: Record<string, any> = {
      HEALTHY: 'success',
      COCCIDIOSIS: 'danger',
      NEWCASTLE: 'warning',
      SALMONELLA: 'info',
    };
    return map[label] ?? null;
  };

  const showToast = (severity: "success" | "info" | "warn" | "error", summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const NAV_ITEMS: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: 'overview', label: 'Ringkasan', icon: 'pi-th-large', count: undefined },
    { id: 'users', label: 'Pengguna', icon: 'pi-users', count: stats?.users },
    { id: 'samples', label: 'Sampel', icon: 'pi-images', count: stats?.totalUploads },
    { id: 'reviews', label: 'Ulasan', icon: 'pi-comments', count: undefined },
    { id: 'health', label: 'Diagnostik', icon: 'pi-server', count: undefined },
  ];

  const PAGE_META: Record<TabId, { title: string; sub: string }> = {
    overview: { title: 'Ringkasan', sub: 'Pantau performa platform secara keseluruhan' },
    users: { title: 'Pengguna', sub: 'Kelola akun dan hak akses pengguna' },
    samples: { title: 'Sampel', sub: 'Repositori gambar dan hasil diagnosis' },
    reviews: { title: 'Ulasan', sub: 'Kelola testimoni yang ditampilkan di publik' },
    health: { title: 'Diagnostik', sub: 'Status layanan dan kesehatan sistem' },
  };

  const meta = PAGE_META[activeTab];

  return (
    <div className="admin2-root">
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog />

      <div className="admin2-shell">
        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="admin2-sidebar">
          <div className="admin2-sb-head">
            <div className="admin2-logo">
              <div className="admin2-logo-icon"><i className="pi pi-shield" /></div>
              <div>
                <p className="admin2-logo-name">AyamSehat.AI</p>
                <p className="admin2-logo-sub">Admin Workspace</p>
              </div>
            </div>
          </div>

          <nav className="admin2-nav">
            <p className="admin2-nav-section">Menu Utama</p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`admin2-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <i className={`pi ${item.icon}`} />
                <span>{item.label}</span>
                {item.count !== undefined && <span className="admin2-nav-badge">{item.count}</span>}
              </button>
            ))}
          </nav>

          <div className="admin2-sb-footer">
            <div className="admin2-sb-user">
              <div className="admin2-avatar" style={{ background: avatarGrad(currentUser?.username || 'A') }}>
                {INITIALS(currentUser?.nama_lengkap || 'Admin')}
              </div>
              <div className="admin2-sb-user-info">
                <p className="admin2-sb-user-name" title={currentUser?.nama_lengkap}>{currentUser?.nama_lengkap || 'Administrator'}</p>
                <p className="admin2-sb-user-role">{currentUser?.role === 'ADMIN' ? 'Super Admin' : 'Admin'}</p>
              </div>
              <button 
                className="admin2-icon-btn admin2-icon-btn--danger" 
                title="Logout" 
                onClick={handleLogout}
                style={{ marginLeft: 'auto' }}
              >
                <i className="pi pi-sign-out" />
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ───────────────────────────────────────────────── */}
        <div className="admin2-main">
          {/* Topbar */}
          <header className="admin2-topbar">
            <div>
              <p className="admin2-page-title">{meta.title}</p>
              <p className="admin2-page-sub">{meta.sub}</p>
            </div>
            <div className="admin2-topbar-actions">
              <button className="admin2-btn-ghost" onClick={() => adminService.downloadAll()}>
                <i className="pi pi-download" /> Export semua data
              </button>
            </div>
          </header>

          {/* Content Scroll Area */}
          <main className="admin2-content">
            {activeTab === 'overview' && <OverviewTab stats={stats} setActiveTab={setActiveTab} getSeverity={getSeverity} />}
            {activeTab === 'users' && <UsersTab stats={stats} showToast={showToast} />}
            {activeTab === 'samples' && <SamplesTab stats={stats} getSeverity={getSeverity} />}
            {activeTab === 'reviews' && <ReviewsTab showToast={showToast} />}
            {activeTab === 'health' && <HealthTab stats={stats} />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;