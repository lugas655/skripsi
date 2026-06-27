import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode } from 'primereact/api';
import adminService, { AdminUser } from '../../services/adminService';

interface UsersTabProps {
  stats: any;
  showToast: (severity: "success" | "info" | "warn" | "error", summary: string, detail: string) => void;
}

const INITIALS = (name: string) => name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
const AVATAR_GRADS = [
  'linear-gradient(135deg,#6366f1,#a78bfa)',
  'linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#db2777,#f472b6)',
  'linear-gradient(135deg,#d97706,#fbbf24)',
  'linear-gradient(135deg,#0ea5e9,#38bdf8)',
];
const avatarGrad = (username: string) => AVATAR_GRADS[username.charCodeAt(0) % AVATAR_GRADS.length];

const UsersTab: React.FC<UsersTabProps> = ({ stats, showToast }) => {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState('');
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', nama_lengkap: '', role: 'USER' });
  const [userFilters, setUserFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminService.getUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setCreateUserDialog(false);
      setNewUser({ username: '', password: '', nama_lengkap: '', role: 'USER' });
      showToast('success', 'Pengguna ditambahkan', 'Akun baru berhasil dibuat.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal membuat pengguna';
      showToast('error', 'Gagal', message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast('success', 'Pengguna dihapus', 'Akun berhasil dihapus dari sistem.');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => adminService.changePassword(id, password),
    onSuccess: () => {
      setPasswordDialog(false);
      setNewPassword('');
      showToast('success', 'Password diperbarui', 'Kata sandi berhasil diubah.');
    },
  });

  const roleFilterTemplate = (options: any) => (
    <Dropdown
      value={options.value}
      options={['ADMIN', 'USER']}
      onChange={(e) => options.filterCallback(e.value)}
      placeholder="Semua akses"
      className="p-column-filter admin2-dropdown-sm"
      showClear
    />
  );

  return (
    <>
      <div className="admin2-card">
        <div className="admin2-card-head">
          <div>
            <p className="admin2-card-title">Daftar pengguna</p>
            <p className="admin2-card-sub">{stats?.users ?? 0} pengguna terdaftar</p>
          </div>
          <div className="admin2-card-head-actions">
            <span className="admin2-search-wrap">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Cari nama atau username..." className="admin2-search-input" />
            </span>
            <button className="admin2-btn-primary" onClick={() => setCreateUserDialog(true)}>
              <i className="pi pi-user-plus" /> Tambah pengguna
            </button>
          </div>
        </div>
        <DataTable
          value={users}
          loading={usersLoading}
          filters={userFilters}
          onFilter={(e) => setUserFilters(e.filters)}
          globalFilter={globalFilter}
          responsiveLayout="scroll"
          paginator
          rows={10}
          className="admin2-datatable"
          rowHover
          filterDisplay="menu"
          emptyMessage="Tidak ada pengguna ditemukan."
        >
          <Column
            header="Pengguna"
            body={(u: AdminUser) => (
              <div className="admin2-user-cell">
                <div className="admin2-avatar admin2-avatar-sm" style={{ background: avatarGrad(u.username) }}>
                  {INITIALS(u.nama_lengkap)}
                </div>
                <div>
                  <p className="admin2-cell-name">{u.nama_lengkap}</p>
                  <p className="admin2-cell-mono">{u.username}</p>
                </div>
              </div>
            )}
            sortable
            sortField="nama_lengkap"
          />
          <Column
            field="role"
            header="Akses"
            body={(u: AdminUser) => (
              <span className={`admin2-role-pill ${u.role === 'ADMIN' ? 'admin' : 'user'}`}>{u.role === 'ADMIN' ? 'Admin' : 'User'}</span>
            )}
            sortable
            filter
            filterElement={roleFilterTemplate}
            showFilterMatchModes={false}
            style={{ width: 120 }}
          />
          <Column
            field="_count.citras"
            header="Sampel"
            body={(u: AdminUser) => <span className="admin2-cell-num">{(u as any)._count?.citras ?? 0}</span>}
            sortable
            style={{ width: 100 }}
          />
          <Column
            field="createdAt"
            header="Bergabung"
            body={(u: AdminUser) => (
              <span className="admin2-cell-muted">
                {new Date(u.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
            sortable
            style={{ width: 140 }}
          />
          <Column
            header=""
            body={(u: AdminUser) => (
              <div className="admin2-row-actions">
                <button className="admin2-icon-btn" title="Reset password" onClick={() => { setSelectedUser(u); setPasswordDialog(true); }}>
                  <i className="pi pi-key" />
                </button>
                <button
                  className="admin2-icon-btn admin2-icon-btn--danger"
                  title="Hapus pengguna"
                  onClick={() =>
                    confirmDialog({
                      message: `Hapus pengguna "${u.nama_lengkap}" secara permanen? Semua data terkait akan ikut terhapus.`,
                      header: 'Hapus pengguna',
                      icon: 'pi pi-exclamation-triangle',
                      acceptClassName: 'p-button-danger',
                      accept: () => deleteUserMutation.mutate(u.id),
                    })
                  }
                >
                  <i className="pi pi-trash" />
                </button>
              </div>
            )}
            style={{ width: 80 }}
          />
        </DataTable>
      </div>

      <Dialog
        header={
          <div className="admin2-dialog-header">
            <div className="admin2-dialog-icon"><i className="pi pi-key" /></div>
            <div>
              <p className="admin2-dialog-title">Reset password</p>
              <p className="admin2-dialog-sub">Untuk: {selectedUser?.nama_lengkap}</p>
            </div>
          </div>
        }
        visible={passwordDialog}
        style={{ width: '420px' }}
        onHide={() => { setPasswordDialog(false); setNewPassword(''); }}
        className="admin2-dialog"
        footer={
          <div className="admin2-dialog-footer">
            <button className="admin2-btn-ghost" onClick={() => { setPasswordDialog(false); setNewPassword(''); }}>Batal</button>
            <button className="admin2-btn-primary" onClick={() => {
              if (selectedUser && newPassword) {
                changePasswordMutation.mutate({ id: selectedUser.id, password: newPassword });
              }
            }}>
              Simpan password baru
            </button>
          </div>
        }
      >
        <div className="admin2-dialog-body">
          <p className="admin2-dialog-desc">Masukkan kata sandi baru untuk pengguna ini. Pastikan kata sandi cukup kuat.</p>
          <div className="admin2-field">
            <label className="admin2-field-label">Password baru</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="admin2-input" placeholder="Min. 8 karakter" />
          </div>
        </div>
      </Dialog>

      <Dialog
        header={
          <div className="admin2-dialog-header">
            <div className="admin2-dialog-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}><i className="pi pi-user-plus" /></div>
            <div>
              <p className="admin2-dialog-title">Tambah pengguna</p>
              <p className="admin2-dialog-sub">Buat akun baru untuk sistem</p>
            </div>
          </div>
        }
        visible={createUserDialog}
        style={{ width: '440px' }}
        onHide={() => { setCreateUserDialog(false); setNewUser({ username: '', password: '', nama_lengkap: '', role: 'USER' }); }}
        className="admin2-dialog"
        footer={
          <div className="admin2-dialog-footer">
            <button className="admin2-btn-ghost" onClick={() => setCreateUserDialog(false)}>Batal</button>
            <button className="admin2-btn-primary" onClick={() => createUserMutation.mutate(newUser)}>Buat akun</button>
          </div>
        }
      >
        <div className="admin2-dialog-body">
          <div className="admin2-field">
            <label className="admin2-field-label">Username</label>
            <input type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="admin2-input" />
          </div>
          <div className="admin2-field">
            <label className="admin2-field-label">Nama lengkap</label>
            <input type="text" value={newUser.nama_lengkap} onChange={(e) => setNewUser({ ...newUser, nama_lengkap: e.target.value })} className="admin2-input" />
          </div>
          <div className="admin2-field">
            <label className="admin2-field-label">Password</label>
            <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="admin2-input" />
          </div>
          <div className="admin2-field">
            <label className="admin2-field-label">Akses</label>
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="admin2-input">
              <option value="USER">User (Peternak)</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default UsersTab;
