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
import { FilterMatchMode } from 'primereact/api';
import Navbar from '../components/Navbar';
import adminService, { AdminUser, AdminUpload, AdminTestimonial } from '../services/adminService';
import { IMAGE_BASE_URL } from '../api/api';

const AdminPage: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [healthDialog, setHealthDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
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
    enabled: healthDialog,
  });

  const { data: testimonials, isLoading: testimonialsLoading } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: adminService.getTestimonials,
  });

  // Mutations
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <Navbar />
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Clinical Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-6 bg-teal-600 rounded-full"></div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">System <span className="text-teal-700">Ledger</span></h1>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-4">Authorized Administrative Access — Station 01</p>
          </div>
          <div className="flex items-center gap-3 ml-4 md:ml-0">
            <Button 
              label="Diagnostics" 
              icon="pi pi-activity" 
              className="p-button-text p-button-sm text-teal-700 font-bold hover:bg-teal-50" 
              onClick={() => setHealthDialog(true)}
            />
            <Button 
              label="Export Repository" 
              icon="pi pi-download" 
              className="clinical-btn-primary" 
              onClick={() => adminService.downloadAll()}
              loading={uploadsLoading}
            />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <TabView className="clinical-tabview">
          
          {/* TAB: OVERVIEW */}
          <TabPanel header="OVERVIEW" leftIcon="pi pi-th-large mr-2">
            {statsLoading ? (
              <div className="flex justify-center py-32"><ProgressSpinner strokeWidth="3" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Metric Cards */}
                <div className="md:col-span-4 flex flex-col gap-4">
                  <div className="clinical-metric-card">
                    <span className="clinical-label">Total Personnel</span>
                    <div className="flex justify-between items-end">
                      <h3 className="text-4xl font-bold text-slate-800">{stats?.users}</h3>
                      <i className="pi pi-users text-slate-200 text-3xl"></i>
                    </div>
                  </div>
                  <div className="clinical-metric-card">
                    <span className="clinical-label">Biological Samples</span>
                    <div className="flex justify-between items-end">
                      <h3 className="text-4xl font-bold text-slate-800">{stats?.totalUploads}</h3>
                      <i className="pi pi-box text-slate-200 text-3xl"></i>
                    </div>
                  </div>
                  <div className="clinical-metric-card">
                    <span className="clinical-label">AI Verifications</span>
                    <div className="flex justify-between items-end">
                      <h3 className="text-4xl font-bold text-slate-800">{stats?.totalPredictions}</h3>
                      <i className="pi pi-check-circle text-slate-200 text-3xl"></i>
                    </div>
                  </div>
                </div>

                {/* Distribution Module */}
                <Card className="md:col-span-5 clinical-card" title={<span className="text-sm font-bold uppercase tracking-wider text-slate-400">Pathogen Spread</span>}>
                  <div className="flex justify-center py-6">
                    <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full max-w-[260px]" />
                  </div>
                </Card>

                {/* Quick Diagnostics */}
                <Card className="md:col-span-3 clinical-card" title={<span className="text-sm font-bold uppercase tracking-wider text-slate-400">Service Nodes</span>}>
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-600">ML_CORE</span>
                      <Tag value={health?.mlService.status === 'online' ? 'STABLE' : 'OFFLINE'} severity={health?.mlService.status === 'online' ? 'success' : 'danger'} className="text-[10px]" />
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-600">GEMINI_AI</span>
                      <Tag value={health?.geminiApi.status === 'online' ? 'STABLE' : 'OFFLINE'} severity={health?.geminiApi.status === 'online' ? 'success' : 'danger'} className="text-[10px]" />
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-xs font-bold text-slate-600">DB_PERSIST</span>
                      <Tag value="STABLE" severity="success" className="text-[10px]" />
                    </div>
                    <Button label="Refresh Status" icon="pi pi-sync" className="p-button-text p-button-sm text-teal-700 mt-2 font-bold" onClick={() => refetchHealth()} />
                  </div>
                </Card>

              </div>
            )}
          </TabPanel>

          {/* TAB: PERSONNEL */}
          <TabPanel header="PERSONNEL" leftIcon="pi pi-users mr-2">
            <div className="clinical-card-table overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Personnel Registry</span>
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
          <TabPanel header="SAMPLES" leftIcon="pi pi-image mr-2">
            <div className="clinical-card-table overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Biological Repository</span>
                <Button 
                  label="Clear Repository Filters" 
                  icon="pi pi-filter-slash" 
                  className="p-button-text p-button-sm text-slate-400 text-[10px] font-bold" 
                  onClick={() => setSampleFilters({
                    'hasilPrediksi.labelPenyakit': { value: null, matchMode: FilterMatchMode.EQUALS },
                    'user.nama_lengkap': { value: null, matchMode: FilterMatchMode.CONTAINS },
                  })}
                />
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
          <TabPanel header="FEEDBACK" leftIcon="pi pi-comments mr-2">
            <div className="clinical-card-table overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">User Narratives</span>
              </div>
              <DataTable value={testimonials} loading={testimonialsLoading} className="clinical-datatable" paginator rows={10}>
                <Column field="name" header="OBSERVER" className="font-bold text-slate-700 text-xs" sortable />
                <Column field="text" header="NARRATIVE" body={(t: AdminTestimonial) => (
                  <p className="text-xs text-slate-500 leading-relaxed italic">"{t.text}"</p>
                )} />
                <Column field="rating" header="SCORE" body={(t: AdminTestimonial) => (
                  <Rating value={t.rating} readOnly cancel={false} className="clinical-rating" />
                )} sortable filter filterPlaceholder="Min Score" />
                <Column header="OPS" body={(t: AdminTestimonial) => (
                  <Button icon="pi pi-trash" className="p-button-text p-button-sm text-slate-300 hover:text-red-500" onClick={() => {
                    confirmDialog({
                      message: 'Permanently purge this narrative from ledger?',
                      header: 'RECORD DELETION',
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
        /* CLINICAL PRIMARY BUTTON */
        .clinical-btn-primary {
          background: #0D9488 !important;
          border: none !important;
          color: white !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          letter-spacing: 0.05em !important;
          padding: 0.75rem 1.5rem !important;
          border-radius: 4px !important;
          text-transform: uppercase !important;
          box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2) !important;
        }
        .clinical-btn-primary:hover {
          background: #0F766E !important;
          box-shadow: 0 10px 15px -3px rgba(13, 148, 136, 0.3) !important;
        }

        /* TABVIEW CLEANROOM STYLE */
        .clinical-tabview .p-tabview-nav {
          background: transparent !important;
          border-bottom: 2px solid #E2E8F0 !important;
          margin-bottom: 1.5rem;
        }
        .clinical-tabview .p-tabview-nav li .p-tabview-nav-link {
          background: transparent !important;
          border: none !important;
          color: #94A3B8 !important;
          font-weight: 800 !important;
          font-size: 11px !important;
          letter-spacing: 0.15em !important;
          padding: 1.25rem 2rem !important;
          transition: all 0.2s ease !important;
        }
        .clinical-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
          color: #0D9488 !important;
          box-shadow: inset 0 -2px 0 #0D9488 !important;
        }
        .clinical-tabview .p-tabview-panels { background: transparent !important; padding: 0 !important; }

        /* CARDS & METRICS */
        .clinical-card {
          background: white !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 8px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02) !important;
        }
        .clinical-metric-card {
          background: white;
          border: 1px solid #E2E8F0;
          padding: 1.5rem;
          border-radius: 8px;
        }
        .clinical-label {
          font-size: 10px;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 0.5rem;
        }

        /* DATATABLE CLEANROOM */
        .clinical-card-table {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .clinical-datatable .p-datatable-thead > tr > th {
          background: #F8FAFC !important;
          color: #64748B !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          border-color: #F1F5F9 !important;
          padding: 1.25rem 1rem !important;
        }
        .clinical-datatable .p-datatable-tbody > tr {
          background: white !important;
          color: #334155 !important;
        }
        .clinical-datatable .p-datatable-tbody > tr > td {
          border-color: #F8FAFC !important;
          padding: 1.25rem 1rem !important;
          font-size: 13px !important;
        }
        .clinical-datatable .p-datatable-tbody > tr:hover {
          background: #F0FDFA !important;
        }
        .clinical-datatable .p-paginator {
          background: #F8FAFC !important;
          border-top: 1px solid #F1F5F9 !important;
          padding: 1rem !important;
        }

        /* INPUTS & DIALOGS */
        .clinical-search {
          background: white !important;
          border: 1px solid #E2E8F0 !important;
          font-size: 12px !important;
          padding: 0.5rem 1rem 0.5rem 2.5rem !important;
          border-radius: 6px !important;
          width: 280px !important;
        }
        .clinical-dialog {
          border-radius: 8px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important;
        }
        .clinical-dialog .p-dialog-header {
          background: white !important;
          border-bottom: 1px solid #F1F5F9 !important;
          padding: 1.5rem !important;
        }
        .clinical-dialog .p-dialog-content { padding: 1.5rem !important; }
        .clinical-input {
          border: 2px solid #F1F5F9 !important;
          border-radius: 6px !important;
          padding: 0.75rem !important;
          font-family: inherit !important;
          transition: all 0.2s !important;
        }
        .clinical-input:focus {
          border-color: #0D9488 !important;
          box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1) !important;
        }
        .clinical-dropdown-small {
          font-size: 11px !important;
          border-color: #F1F5F9 !important;
        }

        /* IMAGE PREVIEW */
        .clinical-img-preview img {
          border-radius: 4px !important;
          border: 2px solid #F1F5F9 !important;
          transition: transform 0.2s !important;
        }
        .clinical-img-preview:hover img {
          transform: scale(1.05);
          border-color: #0D9488 !important;
        }

        /* RATING */
        .clinical-rating .p-rating-item.p-rating-item-active .pi {
          color: #0D9488 !important;
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
