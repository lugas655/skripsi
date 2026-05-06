import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthResponse } from '../types';
import AuthLayout from '../components/AuthLayout';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.login({ username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Login sukses, mengalihkan...', life: 2000 });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error: any) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Gagal', 
        detail: error.response?.data?.message || 'Kredensial tidak valid', 
        life: 3000 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Selamat Datang Kembali" 
      subtitle="Silakan masuk ke akun Anda untuk melanjutkan."
    >
      <Toast ref={toast} />
      
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        
        {/* Username Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm font-bold text-slate-700">Username</label>
          <div className="relative">
            <i className="pi pi-user text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-lg"></i>
            <InputText 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full bg-slate-50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pr-4 pl-11 transition-all font-medium"
              placeholder="Masukkan username"
              required 
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label>
          <div className="relative">
            <i className="pi pi-lock text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-lg"></i>
            <Password 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              toggleMask 
              feedback={false}
              className="w-full"
              inputClassName="w-full bg-slate-50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pr-4 pl-11 transition-all font-medium"
              placeholder="Masukkan password"
              required 
            />
          </div>
        </div>

        {/* Extra Options */}
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all flex-shrink-0" />
            <label htmlFor="remember" className="text-sm text-slate-600 font-medium cursor-pointer select-none whitespace-nowrap">Ingat saya</label>
          </div>
          <Link to="#" className="text-sm text-blue-600 font-bold no-underline hover:text-blue-700 transition-colors whitespace-nowrap">Lupa password?</Link>
        </div>

        {/* Submit Button */}
        <Button 
          loading={loading} 
          className="w-full bg-slate-900 border-none hover:bg-slate-800 text-white rounded-xl py-3.5 shadow-lg shadow-slate-200 mt-4 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-3" 
        >
          <i className="pi pi-sign-in text-lg"></i>
          <span className="font-bold">Masuk Sekarang</span>
        </Button>
        
        {/* Register Link */}
        <p className="text-center text-slate-600 font-medium mt-4 mb-0 text-sm">
          Belum punya akun? <Link to="/register" className="text-blue-600 no-underline font-bold hover:text-blue-700 transition-colors">Daftar Gratis</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
