import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from 'primereact/card';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { Image } from 'primereact/image';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Rating } from 'primereact/rating';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { FilterMatchMode } from 'primereact/api';
import Navbar from '../components/Navbar';
import adminService, { AdminUser, AdminUpload, AdminTestimonial } from '../services/adminService';
import { IMAGE_BASE_URL } from '../api/api';

const AdminPage: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [healthDialog, setHealthDialog] = useState(false);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', nama_lengkap: '', role: 'USER' });
  const toast = useRef<Toast>(null);
  const queryClient = useQueryClient();

  // Filter States
  const [userFilters, setUserFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const [sampleFilters, setSampleFilters] = useState<DataTableFilterMeta>({
    'hasilPrediksi.labelPenyakit': { value: null, matchMode: FilterMatchMode.EQUALS },
    'user.nama_lengkap': { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getStats,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminService.getUsers,
  });

  const { data: uploads, isLoading: uploadsLoading } = useQuery({
    queryKey: ['adminUploads'],
    queryFn: adminService.getUploads,
  });

  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['adminHealth'],
    queryFn: adminService.getHealth,
    staleTime: 30_000, // refresh setiap 30 detik
  });

  const { data: testimonials, isLoading: testimonialsLoading } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: adminService.getTestimonials,
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setCreateUserDialog(false);
      setNewUser({ username: '', password: '', nama_lengkap: '', role: 'USER' });
      toast.current?.show({ severity: 'success', summary: 'USER_CREATED', detail: 'New personnel entry added successfully.', life: 3000 });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error creating user';
      toast.current?.show({ severity: 'error', summary: 'CREATION_FAILED', detail: message, life: 3000 });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.current?.show({ severity: 'success', summary: 'RECORD_PURGED', detail: 'Personnel entry removed from ledger.', life: 3000 });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: any) => adminService.changePassword(id, password),
    onSuccess: () => {
      setPasswordDialog(false);
      setNewPassword('');
      toast.current?.show({ severity: 'success', summary: 'AUTH_UPDATED', detail: 'Security keys re-issued.', life: 3000 });
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: adminService.deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      toast.current?.show({ severity: 'success', summary: 'LOG_REMOVED', detail: 'Narrative purged.', life: 3000 });
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: adminService.toggleTestimonialFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      toast.current?.show({ severity: 'success', summary: 'UPDATE_SUCCESS', detail: 'Status ulasan diperbarui.', life: 3000 });
    },
  });

  const handlePasswordUpdate = () => {
    if (selectedUser && newPassword) {
      changePasswordMutation.mutate({ id: selectedUser.id, password: newPassword });
    }
  };

  const getSeverity = (label: string) => {
    switch (label) {
      case 'HEALTHY': return 'success';
      case 'COCCIDIOSIS': return 'danger';
      case 'NEWCASTLE': return 'warning';
      case 'SALMONELLA': return 'info';
      default: return null;
    }
  };

  // Filter Templates
  const roleFilterTemplate = (options: any) => {
    return (
      <Dropdown 
        value={options.value} 
        options={['ADMIN', 'USER']} 
        onChange={(e) => options.filterCallback(e.value)} 
        placeholder="Select Access" 
        className="p-column-filter clinical-dropdown-small" 
        showClear 
      />
    );
  };

  const diagnosisFilterTemplate = (options: any) => {
    return (
      <Dropdown 
        value={options.value} 
        options={['HEALTHY', 'COCCIDIOSIS', 'NEWCASTLE', 'SALMONELLA']} 
        onChange={(e) => options.filterCallback(e.value)} 
        placeholder="Select Diagnosis" 
        className="p-column-filter clinical-dropdown-small" 
        showClear 
      />
    );
  };

  // Chart Data
  const chartData = {
    labels: stats?.diseaseStats.map(s => s.label) || [],
    datasets: [
      {
        data: stats?.diseaseStats.map(s => s.count) || [],
        backgroundColor: ['#059669', '#DC2626', '#D97706', '#2563EB'],
        hoverBackgroundColor: ['#047857', '#B91C1C', '#B45309', '#1D4ED8'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          color: '#334155',
          font: { family: 'Inter', size: 11, weight: '600' },
          padding: 20
        }
      }
    },
    cutout: '65%'
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--col-surface)' }}>
      <Navbar />
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Modern Gradient Sub-Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--col-brand-dark) 0%, var(--col-brand) 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="pi pi-shield" style={{ fontSize: 15, color: 'white' }} />
            </div>
            <div>
              <h1 className="m-0 font-bold text-white" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Panel Admin</h1>
              <p className="m-0 text-xs" style={{ color: 'rgba(167,243,208,0.85)' }}>AyamSehat.AI — Akses Terotorisasi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHealthDialog(true)}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <i className="pi pi-server" style={{ fontSize: 12 }} /> Diagnostik
            </button>
            <button
              onClick={() => adminService.downloadAll()}
              style={{ background: 'white', border: 'none', color: 'var(--col-brand-dark)', borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <i className="pi pi-download" style={{ fontSize: 12 }} /> Export Data
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <TabView className="clinical-tabview">
          
          {/* TAB: OVERVIEW */}
          <TabPanel header="Ringkasan" leftIcon="pi pi-th-large mr-2">
            {statsLoading ? (
              <div className="flex justify-center py-32"><ProgressSpinner strokeWidth="3" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                {/* Modern Stat Cards */}
                <div className="md:col-span-4 flex flex-col gap-4">
                  {[
                    { label: 'Total Pengguna', val: stats?.users, icon: 'pi-users', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
                    { label: 'Total Sampel', val: stats?.totalUploads, icon: 'pi-images', grad: 'linear-gradient(135deg,#0ea5e9,#06b6d4)' },
                    { label: 'AI Diagnosis', val: stats?.totalPredictions, icon: 'pi-check-circle', grad: 'linear-gradient(135deg,#10b981,#059669)' },
                  ].map(s => (
                    <div key={s.label} className="admin-stat-card" style={{ background: 'var(--col-card)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="m-0 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--col-ink-4)' }}>{s.label}</p>
                          <h3 className="m-0 mt-1 text-4xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>{s.val ?? '—'}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: s.grad }}>
                          <i className={`pi ${s.icon} text-white`} style={{ fontSize: 20 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="md:col-span-5 admin-stat-card" style={{ background: 'var(--col-card)' }}>
                  <p className="m-0 mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--col-ink-4)' }}>Distribusi Penyakit</p>
                  <div className="flex justify-center">
                    <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full max-w-[240px]" />
                  </div>
                </div>

                {/* Service Status */}
                <div className="md:col-span-3 admin-stat-card" style={{ background: 'var(--col-card)' }}>
                  <p className="m-0 mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--col-ink-4)' }}>Status Layanan</p>
                  <div className="flex flex-col gap-3">
                    {healthLoading ? (
                      <div className="flex flex-col gap-3">
                        {['ML Core', 'Gemini AI', 'Database'].map(name => (
                          <div key={name} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--col-border)' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#94a3b8' }} />
                              <span className="text-xs font-semibold" style={{ color: 'var(--col-ink-2)' }}>{name}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#f1f5f9', color: '#94a3b8' }}>Memeriksa...</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      [
                        { name: 'ML Core', ok: health?.mlService?.status === 'online' },
                        { name: 'Gemini AI', ok: health?.geminiApi?.status === 'online' },
                        { name: 'Database', ok: true },
                      ].map(svc => (
                        <div key={svc.name} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--col-border)' }}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: svc.ok ? '#10b981' : '#ef4444' }} />
                            <span className="text-xs font-semibold" style={{ color: 'var(--col-ink-2)' }}>{svc.name}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: svc.ok ? '#ecfdf5' : '#fef2f2', color: svc.ok ? '#059669' : '#dc2626' }}>
                            {svc.ok ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      ))
                    )}
                    <button
                      onClick={() => refetchHealth()}
                      className="mt-2 w-full py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80 cursor-pointer border-none"
                      style={{ background: 'var(--col-brand-pale)', color: 'var(--col-brand)' }}
                    >
                      <i className="pi pi-sync mr-1" style={{ fontSize: 11 }} /> Refresh Status
                    </button>
                  </div>
                </div>

              </div>
            )}
          </TabPanel>


          {/* TAB: PERSONNEL */}
          <TabPanel header="Pengguna" leftIcon="pi pi-users mr-2">
            <div className="clinical-card-table overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderBottom: '1px solid var(--col-border)', background: 'var(--col-surface)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--col-ink-2)', fontFamily: 'var(--font-display)' }}>Daftar Pengguna</span>
                <div className="flex gap-3">
                  <Button 
                    label="Add Personnel" 
                    icon="pi pi-plus" 
                    className="clinical-btn-primary" 
                    onClick={() => setCreateUserDialog(true)}
                  />
                  <span className="p-input-icon-left">
                    <i className="pi pi-search text-slate-400" />
                    <InputText 
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)} 
                      placeholder="Search UID or Name..." 
                      className="clinical-search"
                    />
                  </span>
                </div>
              </div>
              <DataTable 
                value={users} 
                loading={usersLoading} 
                filters={userFilters}
                onFilter={(e) => setUserFilters(e.filters)}
                globalFilter={globalFilter}
                responsiveLayout="scroll"
                paginator rows={10}
                className="clinical-datatable"
                rowHover
                filterDisplay="menu"
              >
                <Column field="username" header="UID" className="font-mono text-teal-700 font-bold" sortable />
                <Column field="nama_lengkap" header="NAME" className="font-bold text-slate-700" sortable />
                <Column 
                  field="role" 
                  header="ACCESS" 
                  body={(user: AdminUser) => (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-sm border ${user.role === 'ADMIN' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                      {user.role}
                    </span>
                  )} 
                  sortable 
                  filter 
                  filterElement={roleFilterTemplate}
                  showFilterMatchModes={false}
                />
                <Column field="_count.citras" header="SAMPLES" className="text-slate-500 font-medium text-center" sortable />
                <Column field="createdAt" header="JOINED" body={(user: AdminUser) => <span className="text-slate-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</span>} sortable />
                <Column header="OPS" body={(user: AdminUser) => (
                  <div className="flex gap-2">
                    <Button icon="pi pi-key" className="p-button-text p-button-sm text-slate-400 hover:text-teal-600" onClick={() => { setSelectedUser(user); setPasswordDialog(true); }} tooltip="Reset Keys" />
                    <Button icon="pi pi-trash" className="p-button-text p-button-sm text-slate-300 hover:text-red-500" onClick={() => {
                      confirmDialog({
                        message: `Permanently remove personnel entry [${user.username}]? This action will invalidate all associated biological data.`,
                        header: 'AUTHORIZATION REVOCATION',
                        icon: 'pi pi-exclamation-triangle',
                        acceptClassName: 'p-button-danger',
                        accept: () => deleteUserMutation.mutate(user.id),
                      });
                    }} tooltip="Revoke Access" />
                  </div>
                )} />
              </DataTable>
            </div>
          </TabPanel>

          {/* TAB: SAMPLES */}
          <TabPanel header="Sampel" leftIcon="pi pi-image mr-2">
            <div className="clinical-card-table overflow-hidden">
              <div className="p-5 flex justify-between items-center" style={{ borderBottom: '1px solid var(--col-border)', background: 'var(--col-surface)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--col-ink-2)', fontFamily: 'var(--font-display)' }}>Repositori Sampel</span>
                <button
                  onClick={() => setSampleFilters({
                    'hasilPrediksi.labelPenyakit': { value: null, matchMode: FilterMatchMode.EQUALS },
                    'user.nama_lengkap': { value: null, matchMode: FilterMatchMode.CONTAINS },
                  })}
                  style={{ background: 'var(--col-surface)', border: '1px solid var(--col-border)', color: 'var(--col-ink-4)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <i className="pi pi-filter-slash" style={{ fontSize: 11 }} /> Reset Filter
                </button>
              </div>
              <DataTable 
                value={uploads} 
                loading={uploadsLoading} 
                filters={sampleFilters}
                onFilter={(e) => setSampleFilters(e.filters)}
                responsiveLayout="scroll"
                paginator rows={10}
                className="clinical-datatable"
                rowHover
                filterDisplay="row"
              >
                <Column header="VISUAL" body={(upload: AdminUpload) => (
                  <Image 
                    src={`${IMAGE_BASE_URL}/${upload.namaFile}`} 
                    alt="Sample" 
                    width="60" 
                    preview 
                    className="clinical-img-preview"
                  />
                )} />
                <Column 
                  field="user.nama_lengkap" 
                  header="SOURCE" 
                  body={(upload: AdminUpload) => (
                    <div>
                      <p className="font-bold text-slate-700 text-xs">{upload.user.nama_lengkap}</p>
                      <p className="text-[10px] text-teal-600 font-mono">UID_{upload.user.username}</p>
                    </div>
                  )} 
                  sortable 
                  filter 
                  filterPlaceholder="Search source..." 
                  showFilterMenu={false}
                />
                <Column 
                  field="hasilPrediksi.labelPenyakit" 
                  header="DIAGNOSIS" 
                  body={(upload: AdminUpload) => (
                    upload.hasilPrediksi ? (
                      <Tag value={upload.hasilPrediksi.labelPenyakit} severity={getSeverity(upload.hasilPrediksi.labelPenyakit)} className="rounded-sm font-bold text-[10px]" />
                    ) : <span className="text-[10px] text-slate-300 italic">Processing...</span>
                  )} 
                  sortable 
                  filter 
                  filterElement={diagnosisFilterTemplate}
                  showFilterMenu={false}
                />
                <Column field="tanggalUnggah" header="TIMESTAMP" body={(upload: AdminUpload) => <span className="text-slate-400 text-[10px]">{new Date(upload.tanggalUnggah).toLocaleString()}</span>} sortable />
                <Column header="EXPORT" body={(upload: AdminUpload) => (
                  <Button 
                    icon="pi pi-download" 
                    className="p-button-text p-button-sm text-teal-600" 
                    onClick={() => adminService.downloadFile(upload.id, upload.namaFile)}
                  />
                )} />
              </DataTable>
            </div>
          </TabPanel>

          {/* TAB: FEEDBACK */}
          <TabPanel header="Testimoni" leftIcon="pi pi-comments mr-2">
            <div className="clinical-card-table overflow-hidden">
              <div className="p-5" style={{ borderBottom: '1px solid var(--col-border)', background: 'var(--col-surface)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--col-ink-2)', fontFamily: 'var(--font-display)' }}>Ulasan Pengguna</span>
              </div>
              <DataTable value={testimonials} loading={testimonialsLoading} className="clinical-datatable" paginator rows={10}>
                <Column field="name" header="OBSERVER" className="font-bold text-slate-700 text-xs" sortable />
                <Column field="text" header="NARRATIVE" body={(t: AdminTestimonial) => (
                  <p className="text-xs text-slate-500 leading-relaxed italic">"{t.text}"</p>
                )} />
                <Column field="rating" header="SCORE" body={(t: AdminTestimonial) => (
                  <Rating value={t.rating} readOnly cancel={false} className="clinical-rating" />
                )} sortable filter filterPlaceholder="Min Score" />
                <Column header="TAMPIL" body={(t: AdminTestimonial) => (
                  <div className="flex items-center gap-2">
                    <InputSwitch 
                      checked={t.isFeatured} 
                      onChange={() => toggleFeatureMutation.mutate(t.id)} 
                    />
                    <span className="text-[10px] font-bold text-slate-400">
                      {t.isFeatured ? 'YA' : 'TIDAK'}
                    </span>
                  </div>
                )} />
                <Column header="OPS" body={(t: AdminTestimonial) => (
                  <Button icon="pi pi-trash" className="p-button-text p-button-sm text-slate-300 hover:text-red-500" onClick={() => {
                    confirmDialog({
                      message: 'Hapus testimoni ini secara permanen?',
                      header: 'HAPUS TESTIMONI',
                      icon: 'pi pi-trash',
                      acceptClassName: 'p-button-danger',
                      accept: () => deleteTestimonialMutation.mutate(t.id),
                    });
                  }} />
                )} />
              </DataTable>
            </div>
          </TabPanel>
        </TabView>

        {/* DIALOG: SEC_KEYS */}
        <Dialog 
          header={<span className="text-slate-800 font-black text-sm tracking-widest uppercase">Personnel Key Reset</span>}
          visible={passwordDialog} 
          style={{ width: '400px' }} 
          onHide={() => setPasswordDialog(false)}
          className="clinical-dialog"
          footer={
            <div className="flex justify-end gap-2 p-4 border-t border-slate-100">
              <Button label="Cancel" className="p-button-text text-slate-400 font-bold" onClick={() => setPasswordDialog(false)} />
              <Button label="Confirm Update" className="clinical-btn-primary py-2 px-6" onClick={handlePasswordUpdate} loading={changePasswordMutation.isPending} />
            </div>
          }
        >
          <div className="py-6 px-2">
            <p className="mb-6 text-sm text-slate-500 leading-snug">Resetting authentication keys for: <span className="text-slate-800 font-bold">{selectedUser?.nama_lengkap}</span>. Enter new secure sequence:</p>
            <span className="p-float-label">
              <InputText 
                id="newPassword" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="clinical-input w-full"
              />
              <label htmlFor="newPassword" className="text-slate-400">New_Access_Key</label>
            </span>
          </div>
        </Dialog>

        {/* DIALOG: CREATE_USER */}
        <Dialog 
          header={<span className="text-slate-800 font-black text-sm tracking-widest uppercase">New Personnel Entry</span>}
          visible={createUserDialog} 
          style={{ width: '400px' }} 
          onHide={() => { setCreateUserDialog(false); setNewUser({ username: '', password: '', nama_lengkap: '', role: 'USER' }); }}
          className="clinical-dialog"
          footer={
            <div className="flex justify-end gap-2 p-4 border-t border-slate-100">
              <Button label="Cancel" className="p-button-text text-slate-400 font-bold" onClick={() => { setCreateUserDialog(false); setNewUser({ username: '', password: '', nama_lengkap: '', role: 'USER' }); }} />
              <Button label="Create Personnel" className="clinical-btn-primary py-2 px-6" onClick={() => createUserMutation.mutate(newUser)} loading={createUserMutation.isPending} />
            </div>
          }
        >
          <div className="py-6 px-2 flex flex-col gap-6">
            <span className="p-float-label">
              <InputText 
                id="newUsername" 
                value={newUser.username} 
                onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                className="clinical-input w-full"
              />
              <label htmlFor="newUsername" className="text-slate-400">UID (Username)</label>
            </span>
            <span className="p-float-label">
              <InputText 
                id="newFullName" 
                value={newUser.nama_lengkap} 
                onChange={(e) => setNewUser({...newUser, nama_lengkap: e.target.value})} 
                className="clinical-input w-full"
              />
              <label htmlFor="newFullName" className="text-slate-400">Full Name</label>
            </span>
            <span className="p-float-label">
              <InputText 
                id="newUserPassword" 
                type="password" 
                value={newUser.password} 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                className="clinical-input w-full"
              />
              <label htmlFor="newUserPassword" className="text-slate-400">Access Key (Password)</label>
            </span>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Access Level</label>
              <Dropdown 
                value={newUser.role} 
                options={['ADMIN', 'USER']} 
                onChange={(e) => setNewUser({...newUser, role: e.value})} 
                className="clinical-input w-full" 
              />
            </div>
          </div>
        </Dialog>

        {/* DIALOG: DIAGNOSTICS */}
        <Dialog 
          header={<span className="text-slate-800 font-black text-sm tracking-widest uppercase">System Telemetry Report</span>}
          visible={healthDialog} 
          style={{ width: '500px' }} 
          onHide={() => setHealthDialog(false)}
          className="clinical-dialog"
        >
          {healthLoading ? (
            <div className="flex justify-center py-20"><ProgressSpinner strokeWidth="3" /></div>
          ) : (
            <div className="flex flex-col gap-4 py-6 px-2">
              <div className="p-4 bg-slate-50 rounded border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Inference Engine</h4>
                  <Tag value={health?.mlService.status.toUpperCase()} severity={health?.mlService.status === 'online' ? 'success' : 'danger'} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>RESPONSE_TIME: {health?.mlService.latency}ms</span>
                  <span>NODE: VIT_CORE_PROD</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Analytical Intelligence</h4>
                  <Tag value={health?.geminiApi.status.toUpperCase()} severity={health?.geminiApi.status === 'online' ? 'success' : 'danger'} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>PROVIDER: GOOGLE_GEMINI</span>
                  <span>CONFIG: VERIFIED</span>
                </div>
              </div>

              <Button label="Execute Full Service Scan" icon="pi pi-sync" className="clinical-btn-primary w-full py-4 mt-2 font-black" onClick={() => refetchHealth()} />
            </div>
          )}
        </Dialog>
      </main>

      <style>{`
        /* ── STAT CARDS ── */
        .admin-stat-card {
          border: 1px solid var(--col-border);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .admin-stat-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        /* ── MODERN TABVIEW ── */
        .clinical-tabview .p-tabview-nav {
          background: var(--col-card) !important;
          border: 1px solid var(--col-border) !important;
          border-radius: 14px !important;
          padding: 6px !important;
          margin-bottom: 1.5rem;
          gap: 4px;
        }
        .clinical-tabview .p-tabview-nav li .p-tabview-nav-link {
          background: transparent !important;
          border: none !important;
          color: var(--col-ink-4) !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          padding: 0.6rem 1.25rem !important;
          border-radius: 10px !important;
          transition: all 0.2s !important;
        }
        .clinical-tabview .p-tabview-nav li .p-tabview-nav-link:hover {
          background: var(--col-surface) !important;
          color: var(--col-ink) !important;
        }
        .clinical-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
          background: var(--col-brand) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(16,185,129,0.3) !important;
        }
        .clinical-tabview .p-tabview-panels { background: transparent !important; padding: 0 !important; }
        .clinical-tabview .p-tabview-nav-btn { display: none !important; }

        /* ── TABLE CARD ── */
        .clinical-card-table {
          background: var(--col-card);
          border: 1px solid var(--col-border);
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .clinical-datatable .p-datatable-thead > tr > th {
          background: var(--col-surface) !important;
          color: var(--col-ink-4) !important;
          font-size: 11px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          border-color: var(--col-border) !important;
          padding: 1rem !important;
        }
        .clinical-datatable .p-datatable-tbody > tr {
          background: var(--col-card) !important;
          color: var(--col-ink) !important;
        }
        .clinical-datatable .p-datatable-tbody > tr > td {
          border-color: var(--col-border) !important;
          padding: 1rem !important;
          font-size: 13px !important;
        }
        .clinical-datatable .p-datatable-tbody > tr:hover {
          background: var(--col-brand-pale) !important;
        }
        .clinical-datatable .p-paginator {
          background: var(--col-surface) !important;
          border-top: 1px solid var(--col-border) !important;
          padding: 0.75rem !important;
        }

        /* ── INPUTS & SEARCH ── */
        .clinical-search {
          background: var(--col-card) !important;
          border: 1px solid var(--col-border) !important;
          font-size: 13px !important;
          padding: 0.55rem 1rem 0.55rem 2.5rem !important;
          border-radius: 10px !important;
          color: var(--col-ink) !important;
          width: 260px !important;
        }
        .clinical-input {
          border: 1.5px solid var(--col-border) !important;
          border-radius: 10px !important;
          padding: 0.75rem 1rem !important;
          font-family: inherit !important;
          background: var(--col-surface) !important;
          color: var(--col-ink) !important;
          transition: all 0.2s !important;
        }
        .clinical-input:focus {
          border-color: var(--col-brand) !important;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15) !important;
          outline: none !important;
        }

        /* ── DIALOG ── */
        .clinical-dialog { border-radius: 20px !important; box-shadow: 0 32px 64px -12px rgba(0,0,0,0.15) !important; }
        .clinical-dialog .p-dialog-header {
          background: var(--col-card) !important;
          border-bottom: 1px solid var(--col-border) !important;
          border-radius: 20px 20px 0 0 !important;
          padding: 1.5rem !important;
        }
        .clinical-dialog .p-dialog-content { background: var(--col-card) !important; padding: 1.5rem !important; }
        .clinical-dialog .p-dialog-footer { background: var(--col-card) !important; border-radius: 0 0 20px 20px !important; }

        /* ── MISC ── */
        .clinical-dropdown-small { font-size: 12px !important; border-color: var(--col-border) !important; border-radius: 8px !important; }
        .clinical-img-preview img { border-radius: 8px !important; border: 2px solid var(--col-border) !important; transition: transform 0.2s !important; }
        .clinical-img-preview:hover img { transform: scale(1.08); border-color: var(--col-brand) !important; }
        .clinical-rating .p-rating-item.p-rating-item-active .pi { color: var(--col-brand) !important; }
        .clinical-btn-primary {
          background: var(--col-brand) !important; border: none !important; color: white !important;
          font-weight: 700 !important; font-size: 13px !important;
          padding: 0.6rem 1.25rem !important; border-radius: 10px !important;
          box-shadow: 0 4px 12px rgba(16,185,129,0.25) !important;
        }
        .clinical-btn-primary:hover { background: var(--col-brand-dark) !important; }
      `}</style>
    </div>
  );
};

export default AdminPage;
