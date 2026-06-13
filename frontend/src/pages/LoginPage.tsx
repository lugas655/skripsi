import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthResponse } from '../types';
import AuthLayout from '../components/AuthLayout';

const FieldLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="diag-label block" style={{ color: 'var(--col-ink-3)' }}>
    {children}
  </label>
);

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login({ username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.current?.show({ severity: 'success', summary: 'Berhasil masuk', detail: 'Mengalihkan ke dashboard...', life: 2000 });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Login gagal',
        detail: error.response?.data?.message || 'Username atau password tidak sesuai.',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Selamat Datang Kembali" subtitle="Masuk untuk memantau kesehatan ternak Anda.">
      <Toast ref={toast} />
      <form onSubmit={handleLogin} className="flex flex-col gap-5">

        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="login-user">Username</FieldLabel>
          <div className="relative flex items-center">
            <i className="pi pi-user absolute left-4 z-10" style={{ fontSize: '0.9rem', color: 'var(--col-ink-4)' }} />
            <InputText
              id="login-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full !pl-11 !py-3 !bg-white"
              placeholder="Masukkan username"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="login-pass">Password</FieldLabel>
          <div className="relative flex items-center">
            <i className="pi pi-lock absolute left-4 z-10" style={{ fontSize: '0.9rem', color: 'var(--col-ink-4)' }} />
            <Password
              id="login-pass"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask feedback={false}
              className="w-full"
              inputClassName="w-full !pl-11 !py-3 !bg-white"
              placeholder="Masukkan password"
              required
            />
          </div>
        </div>

        {/* Remember / Forgot */}
        <div className="flex items-center justify-between px-1">
          <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none">
            <input id="remember-me" type="checkbox" className="w-4 h-4 rounded cursor-pointer shrink-0" style={{ accentColor: 'var(--col-brand)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--col-ink-3)' }}>Ingat saya</span>
          </label>
          <Link to="#" className="text-sm font-semibold no-underline hover:underline" style={{ color: 'var(--col-brand)' }}>
            Lupa password?
          </Link>
        </div>

        {/* Divider */}
        <div className="my-1" style={{ height: 1, background: 'var(--col-border)' }} />

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            style={{ 
              background: loading ? 'var(--col-brand-mid)' : 'var(--col-brand-dark)', 
              border: 'none', 
              cursor: 'pointer', 
              fontFamily: 'var(--font-display)', 
              fontSize: '1rem' 
            }}
          >
            {loading ? (
              <><span className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Memverifikasi...</>
            ) : (
              <><i className="pi pi-sign-in" style={{ fontSize: 16 }} /> Masuk Sekarang</>
            )}
          </button>
        </div>

        {/* Register link */}
        <p className="text-center text-sm font-medium mt-2" style={{ color: 'var(--col-ink-3)' }}>
          Belum punya akun?{' '}
          <Link to="/register" className="font-bold no-underline hover:underline" style={{ color: 'var(--col-brand)' }}>
            Daftar Gratis
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
};

export default LoginPage;
