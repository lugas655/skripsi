import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
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
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User deleted successfully', life: 3000 });
    },
    onError: (error: any) => {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to delete user', life: 3000 });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: any) => adminService.changePassword(id, password),
    onSuccess: () => {
      setPasswordDialog(false);
      setNewPassword('');
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Password updated successfully', life: 3000 });
    },
    onError: (error: any) => {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to update password', life: 3000 });
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: adminService.deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Testimonial deleted', life: 3000 });
    },
  });

  // Actions
  const confirmDelete = (user: AdminUser) => {
    confirmDialog({
      message: `Are you sure you want to delete user "${user.username}" and all their data? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteUserMutation.mutate(user.id),
    });
  };

  const handlePasswordUpdate = () => {
    if (selectedUser && newPassword.length >= 6) {
      changePasswordMutation.mutate({ id: selectedUser.id, password: newPassword });
    } else {
      toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Password must be at least 6 characters', life: 3000 });
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

  // Chart Data
  const chartData = {
    labels: stats?.diseaseStats.map(s => s.label) || [],
    datasets: [
      {
        data: stats?.diseaseStats.map(s => s.count) || [],
        backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6'],
        hoverBackgroundColor: ['#16a34a', '#dc2626', '#d97706', '#2563eb'],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#e2e8f0' }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <Toast ref={toast} />
      <ConfirmDialog />

      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Biotech Control Center</h1>
            <p className="text-slate-400">System administration and data management</p>
          </div>
          <div className="flex gap-2">
            <Button 
              label="System Health" 
              icon="pi pi-shield" 
              className="p-button-emerald p-button-outlined" 
              onClick={() => setHealthDialog(true)}
            />
            <Button 
              label="Export All Images" 
              icon="pi pi-download" 
              className="p-button-emerald" 
              onClick={() => adminService.downloadAll()}
              loading={uploadsLoading}
            />
          </div>
        </header>

        <TabView className="admin-tabview">
          <TabPanel header="Dashboard" leftIcon="pi pi-home mr-2">
            {statsLoading ? (
              <div className="flex justify-center py-20"><ProgressSpinner /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800 border-none shadow-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 mb-1">Total Users</p>
                      <h3 className="text-4xl font-bold text-white">{stats?.users}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <i className="pi pi-users text-2xl text-emerald-400"></i>
                    </div>
                  </div>
                </Card>
                <Card className="bg-slate-800 border-none shadow-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 mb-1">Total Uploads</p>
                      <h3 className="text-4xl font-bold text-white">{stats?.totalUploads}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="pi pi-image text-2xl text-blue-400"></i>
                    </div>
                  </div>
                </Card>
                <Card className="bg-slate-800 border-none shadow-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 mb-1">Total Predictions</p>
                      <h3 className="text-4xl font-bold text-white">{stats?.totalPredictions}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <i className="pi pi-chart-line text-2xl text-purple-400"></i>
                    </div>
                  </div>
                </Card>

                <Card className="md:col-span-2 bg-slate-800 border-none shadow-xl" title={<span className="text-white">Recent Disease Distribution</span>}>
                  <div className="flex justify-center">
                    <Chart type="pie" data={chartData} options={chartOptions} className="w-full md:w-3/5" />
                  </div>
                </Card>
                
                <Card className="bg-slate-800 border-none shadow-xl" title={<span className="text-white">System Quick Check</span>}>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-sm text-slate-200">ML Inference Service</span>
                      <Tag value={health?.mlService.status.toUpperCase() || 'CHECKING...'} severity={health?.mlService.status === 'online' ? 'success' : 'danger'} />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-sm text-slate-200">Gemini Knowledge Base</span>
                      <Tag value={health?.geminiApi.status.toUpperCase() || 'CHECKING...'} severity={health?.geminiApi.status === 'online' ? 'success' : 'danger'} />
                    </div>
                    <Button label="Refresh Health Status" icon="pi pi-refresh" className="p-button-text p-button-sm text-emerald-400" onClick={() => refetchHealth()} />
                  </div>
                </Card>
              </div>
            )}
          </TabPanel>

          <TabPanel header="User Management" leftIcon="pi pi-users mr-2">
            <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden p-4">
              <div className="mb-4 flex justify-between items-center">
                <span className="p-input-icon-left w-full md:w-auto">
                  <i className="pi pi-search text-slate-400" />
                  <InputText 
                    type="search" 
                    onInput={(e: any) => setGlobalFilter(e.target.value)} 
                    placeholder="Search users..." 
                    className="w-full bg-slate-700 border-none text-white placeholder-slate-400"
                  />
                </span>
              </div>

              <DataTable 
                value={users} 
                loading={usersLoading} 
                globalFilter={globalFilter}
                responsiveLayout="scroll"
                paginator rows={10}
                className="p-datatable-dark-custom"
                rowHover
              >
                <Column field="username" header="Username" sortable className="text-slate-200" />
                <Column field="nama_lengkap" header="Full Name" sortable className="text-slate-200" />
                <Column field="role" header="Role" body={(user: AdminUser) => (
                  <Tag value={user.role} severity={user.role === 'ADMIN' ? 'warning' : 'info'} />
                )} sortable />
                <Column field="_count.citras" header="Uploads" sortable className="text-slate-200" />
                <Column field="createdAt" header="Joined" body={(user: AdminUser) => <span className="text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</span>} sortable />
                <Column header="Actions" body={(user: AdminUser) => (
                  <div className="flex gap-2">
                    <Button 
                      icon="pi pi-key" 
                      className="p-button-rounded p-button-text p-button-secondary text-slate-400" 
                      tooltip="Change Password"
                      onClick={() => { setSelectedUser(user); setPasswordDialog(true); }}
                    />
                    <Button 
                      icon="pi pi-trash" 
                      className="p-button-rounded p-button-text p-button-danger text-red-400" 
                      tooltip="Delete User"
                      onClick={() => confirmDelete(user)}
                    />
                  </div>
                )} />
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Specimen Archive" leftIcon="pi pi-images mr-2">
            <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden p-4">
              <DataTable 
                value={uploads} 
                loading={uploadsLoading} 
                responsiveLayout="scroll"
                paginator rows={12}
                className="p-datatable-dark-custom"
                rowHover
              >
                <Column header="Specimen" body={(upload: AdminUpload) => (
                  <Image 
                    src={`${IMAGE_BASE_URL}/${upload.namaFile}`} 
                    alt="Specimen" 
                    width="60" 
                    preview 
                    className="rounded-md overflow-hidden"
                  />
                )} />
                <Column field="user.nama_lengkap" header="Uploaded By" body={(upload: AdminUpload) => (
                  <div>
                    <p className="font-semibold text-white">{upload.user.nama_lengkap}</p>
                    <p className="text-xs text-slate-400">@{upload.user.username}</p>
                  </div>
                )} sortable />
                <Column field="hasilPrediksi.labelPenyakit" header="Diagnosis" body={(upload: AdminUpload) => (
                  upload.hasilPrediksi ? (
                    <Tag value={upload.hasilPrediksi.labelPenyakit} severity={getSeverity(upload.hasilPrediksi.labelPenyakit)} />
                  ) : <span className="text-slate-500">-</span>
                )} sortable />
                <Column field="tanggalUnggah" header="Date" body={(upload: AdminUpload) => <span className="text-slate-300">{new Date(upload.tanggalUnggah).toLocaleString()}</span>} sortable />
                <Column header="Action" body={(upload: AdminUpload) => (
                  <Button 
                    icon="pi pi-download" 
                    className="p-button-rounded p-button-text p-button-emerald text-emerald-400" 
                    tooltip="Download"
                    onClick={() => adminService.downloadFile(upload.id, upload.namaFile)}
                  />
                )} />
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Testimonials" leftIcon="pi pi-comment mr-2">
            <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden p-4">
              <DataTable 
                value={testimonials} 
                loading={testimonialsLoading} 
                responsiveLayout="scroll"
                paginator rows={10}
                className="p-datatable-dark-custom"
                rowHover
              >
                <Column field="name" header="Name" sortable className="text-slate-200" />
                <Column field="role" header="Role" sortable className="text-slate-200" />
                <Column field="text" header="Review" body={(t: AdminTestimonial) => (
                  <p className="text-sm max-w-xs truncate text-slate-300" title={t.text}>{t.text}</p>
                )} />
                <Column field="rating" header="Rating" body={(t: AdminTestimonial) => (
                  <Rating value={t.rating} readOnly cancel={false} className="text-yellow-400" />
                )} sortable />
                <Column header="Actions" body={(t: AdminTestimonial) => (
                  <Button 
                    icon="pi pi-trash" 
                    className="p-button-rounded p-button-text p-button-danger text-red-400" 
                    onClick={() => {
                      confirmDialog({
                        message: 'Are you sure you want to delete this testimonial?',
                        header: 'Delete Testimonial',
                        icon: 'pi pi-exclamation-triangle',
                        acceptClassName: 'p-button-danger',
                        accept: () => deleteTestimonialMutation.mutate(t.id),
                      });
                    }}
                  />
                )} />
              </DataTable>
            </div>
          </TabPanel>
        </TabView>

        {/* Change Password Dialog */}
        <Dialog 
          header={<span className="text-white">Update User Password</span>}
          visible={passwordDialog} 
          style={{ width: '400px' }} 
          onHide={() => setPasswordDialog(false)}
          className="admin-dialog-dark"
          footer={
            <div className="flex justify-end gap-2">
              <Button label="Cancel" icon="pi pi-times" className="p-button-text text-slate-400" onClick={() => setPasswordDialog(false)} />
              <Button label="Update" icon="pi pi-check" className="p-button-emerald" onClick={handlePasswordUpdate} loading={changePasswordMutation.isPending} />
            </div>
          }
        >
          <div className="py-4">
            <p className="mb-3 text-slate-300">Updating password for <strong>{selectedUser?.username}</strong></p>
            <span className="p-float-label">
              <InputText 
                id="newPassword" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="w-full bg-slate-700 border-none text-white"
              />
              <label htmlFor="newPassword">New Password</label>
            </span>
          </div>
        </Dialog>

        {/* Health Status Dialog */}
        <Dialog 
          header={<span className="text-white">Full System Health Monitor</span>}
          visible={healthDialog} 
          style={{ width: '500px' }} 
          onHide={() => setHealthDialog(false)}
          className="admin-dialog-dark"
        >
          {healthLoading ? (
            <div className="flex justify-center py-10"><ProgressSpinner /></div>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-emerald-400">ML Service (FastAPI)</h4>
                  <Tag value={health?.mlService.status.toUpperCase()} severity={health?.mlService.status === 'online' ? 'success' : 'danger'} />
                </div>
                <p className="text-sm text-slate-400">Status: {health?.mlService.status === 'online' ? 'Connected' : 'Disconnected'}</p>
                <p className="text-sm text-slate-400">Latency: {health?.mlService.latency}ms</p>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-emerald-400">Gemini AI (Google)</h4>
                  <Tag value={health?.geminiApi.status.toUpperCase()} severity={health?.geminiApi.status === 'online' ? 'success' : 'danger'} />
                </div>
                <p className="text-sm text-slate-400">API Key: {health?.geminiApi.status === 'misconfigured' ? 'Missing/Invalid' : 'Configured'}</p>
                <p className="text-sm text-slate-400">Knowledge Base: Active</p>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-emerald-400">Database (Prisma/MySQL)</h4>
                  <Tag value="ONLINE" severity="success" />
                </div>
                <p className="text-sm text-slate-400">Connection: Pooled</p>
                <p className="text-sm text-slate-400">Migration: Up to date</p>
              </div>

              <Button label="Re-scan Services" icon="pi pi-refresh" className="w-full p-button-emerald mt-2" onClick={() => refetchHealth()} />
            </div>
          )}
        </Dialog>
      </main>

      <style>{`
        .admin-tabview .p-tabview-nav {
          background: transparent !important;
          border-bottom: 2px solid #334155 !important;
        }
        .admin-tabview .p-tabview-nav li .p-tabview-nav-link {
          background: transparent !important;
          color: #94a3b8 !important;
          border-color: transparent !important;
        }
        .admin-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
          color: #10b981 !important;
          border-color: #10b981 !important;
        }
        .admin-tabview .p-tabview-panels {
          background: transparent !important;
          padding: 2rem 0 !important;
        }
        .p-datatable-dark-custom .p-datatable-thead > tr > th {
          background: #1e293b !important;
          color: #94a3b8 !important;
          border-color: #334155 !important;
          font-family: inherit !important;
          text-transform: uppercase !important;
          font-size: 0.75rem !important;
          letter-spacing: 0.05em !important;
        }
        .p-datatable-dark-custom .p-datatable-tbody > tr {
          background: #1e293b !important;
          color: #f1f5f9 !important;
        }
        .p-datatable-dark-custom .p-datatable-tbody > tr > td {
          border-color: #334155 !important;
        }
        .p-datatable-dark-custom .p-paginator {
          background: #1e293b !important;
          border-color: #334155 !important;
          color: #94a3b8 !important;
        }
        .p-datatable-dark-custom .p-paginator .p-paginator-pages .p-paginator-page {
          color: #94a3b8 !important;
        }
        .p-button-emerald {
          background: #10b981 !important;
          border-color: #10b981 !important;
          color: white !important;
        }
        .p-button-emerald:hover {
          background: #059669 !important;
          border-color: #059669 !important;
        }
        .p-rating .p-rating-item.p-rating-item-active .pi {
          color: #f59e0b !important;
        }
        .admin-dialog-dark .p-dialog-header, 
        .admin-dialog-dark .p-dialog-content,
        .admin-dialog-dark .p-dialog-footer {
          background: #1e293b !important;
          color: #f1f5f9 !important;
          border-color: #334155 !important;
        }
        .p-dialog .p-dialog-header .p-dialog-header-icon {
          color: #94a3b8 !important;
        }
        .p-float-label label {
          color: #94a3b8 !important;
        }
        .p-float-label input:focus ~ label {
          color: #10b981 !important;
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
