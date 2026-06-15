import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import AuthLayout from '../components/AuthLayout';

const FieldLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="diag-label block" style={{ color: 'var(--col-ink-3)' }}>
    {children}
  </label>
);

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ nama_lengkap: '', username: '', password: '', confirm_password: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username.length < 3) {
      toast.current?.show({ severity: 'error', summary: 'Validasi gagal', detail: 'Username minimal harus 3 karakter.', life: 3000 });
      return;
    }
    if (formData.password.length < 6) {
      toast.current?.show({ severity: 'error', summary: 'Validasi gagal', detail: 'Password minimal harus 6 karakter.', life: 3000 });
      return;
    }
    if (formData.password !== formData.confirm_password) {
      toast.current?.show({ severity: 'error', summary: 'Validasi gagal', detail: 'Password dan konfirmasi tidak cocok.', life: 3000 });
      return;
    }
    if (!termsAccepted) {
      toast.current?.show({ severity: 'error', summary: 'Validasi gagal', detail: 'Setujui syarat & ketentuan terlebih dahulu.', life: 3000 });
      return;
    }
    setLoading(true);
    try {
      await authService.register({ nama_lengkap: formData.nama_lengkap, username: formData.username, password: formData.password });
      toast.current?.show({ severity: 'success', summary: 'Akun dibuat!', detail: 'Mengalihkan ke halaman login...', life: 2000 });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Pendaftaran gagal', detail: error.response?.data?.message || 'Gagal membuat akun.', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <AuthLayout
      title="Buat Akun Baru"
      subtitle="Mulai lindungi peternakan Anda dengan AI."
      quote="Pencegahan wabah dimulai dari identifikasi dini yang cepat dan akurat."
    >
      <Toast ref={toast} />
      <form onSubmit={handleRegister} className="flex flex-col gap-4">

        {/* Name & Username Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="reg-nama">Nama Lengkap</FieldLabel>
            <div className="relative flex items-center">
              <i className="pi pi-id-card absolute left-3.5 z-10" style={{ fontSize: '0.8rem', color: 'var(--col-ink-4)' }} />
              <InputText 
                id="reg-nama" 
                value={formData.nama_lengkap} 
                onChange={set('nama_lengkap')} 
                className="w-full !pl-10 !py-2.5 !bg-white !text-sm" 
                placeholder="Nama lengkap" 
                required 
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="reg-user">Username</FieldLabel>
            <div className="relative flex items-center">
              <i className="pi pi-user absolute left-3.5 z-10" style={{ fontSize: '0.8rem', color: 'var(--col-ink-4)' }} />
              <InputText 
                id="reg-user" 
                value={formData.username} 
                onChange={set('username')} 
                className="w-full !pl-10 !py-2.5 !bg-white !text-sm" 
                placeholder="Username" 
                required 
              />
            </div>
            <small className="text-[11px] leading-none" style={{ color: 'var(--col-ink-3)' }}>Min. 3 karakter (harus unik)</small>
          </div>
        </div>

        {/* Password pair Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="reg-pass">Password</FieldLabel>
            <div className="relative flex items-center">
              <i className="pi pi-lock absolute left-3.5 z-10" style={{ fontSize: '0.8rem', color: 'var(--col-ink-4)' }} />
              <Password 
                id="reg-pass" 
                value={formData.password} 
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} 
                toggleMask 
                className="w-full" 
                inputClassName="w-full !pl-10 !py-2.5 !bg-white !text-sm" 
                placeholder="Password" 
                required 
              />
            </div>
            <small className="text-[11px] leading-none" style={{ color: 'var(--col-ink-3)' }}>Min. 6 karakter</small>
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="reg-confirm">Konfirmasi</FieldLabel>
            <div className="relative flex items-center">
              <i className="pi pi-lock absolute left-3.5 z-10" style={{ fontSize: '0.8rem', color: 'var(--col-ink-4)' }} />
              <Password 
                id="reg-confirm" 
                value={formData.confirm_password} 
                onChange={e => setFormData(p => ({ ...p, confirm_password: e.target.value }))} 
                toggleMask 
                feedback={false} 
                className="w-full" 
                inputClassName="w-full !pl-10 !py-2.5 !bg-white !text-sm" 
                placeholder="Ulangi" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="px-1">
          <label htmlFor="reg-terms" className="flex items-start gap-2.5 cursor-pointer select-none">
            <input 
              id="reg-terms" 
              type="checkbox" 
              checked={termsAccepted} 
              onChange={e => setTermsAccepted(e.target.checked)} 
              className="w-3.5 h-3.5 rounded mt-1 shrink-0 cursor-pointer" 
              style={{ accentColor: 'var(--col-brand)' }} 
            />
            <span className="text-[12px] font-medium leading-tight" style={{ color: 'var(--col-ink-3)' }}>
              Saya setuju <Link to="/terms" className="inline p-0 bg-transparent border-none font-bold cursor-pointer hover:underline text-[12px] no-underline" style={{ color: 'var(--col-brand)' }}>S&amp;K</Link> dan <Link to="/privacy" className="inline p-0 bg-transparent border-none font-bold cursor-pointer hover:underline text-[12px] no-underline" style={{ color: 'var(--col-brand)' }}>Kebijakan Privasi</Link>.
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            style={{ 
              background: loading ? 'var(--col-brand-mid)' : 'var(--col-brand)', 
              border: 'none', 
              cursor: 'pointer', 
              fontFamily: 'var(--font-display)', 
              fontSize: '0.9rem' 
            }}
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Memproses...</>
            ) : (
              <><i className="pi pi-user-plus" style={{ fontSize: 14 }} /> Buat Akun</>
            )}
          </button>
        </div>

        {/* Login link */}
        <p className="text-center text-xs font-medium mt-1" style={{ color: 'var(--col-ink-3)' }}>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold no-underline hover:underline" style={{ color: 'var(--col-brand)' }}>
            Login
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
