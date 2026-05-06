import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthLayout from '../components/AuthLayout';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    password: '',
    confirm_password: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      toast.current?.show({ severity: 'error', summary: 'Validasi Gagal', detail: 'Password dan Konfirmasi Password tidak cocok!', life: 3000 });
      return;
    }

    if (!termsAccepted) {
      toast.current?.show({ severity: 'error', summary: 'Validasi Gagal', detail: 'Anda harus menyetujui Syarat dan Ketentuan.', life: 3000 });
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        nama_lengkap: formData.nama_lengkap,
        username: formData.username,
        password: formData.password
      });
      toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Pendaftaran sukses! Mengalihkan ke halaman login...', life: 2000 });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Gagal', 
        detail: error.response?.data?.message || 'Pendaftaran gagal', 
        life: 3000 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Buat Akun Baru" 
      subtitle="Mulai lindungi peternakan Anda dengan bantuan AI."
      quote="Pencegahan wabah dimulai dari identifikasi dini yang cepat dan akurat. Jangan tunggu sampai terlambat."
    >
      <Toast ref={toast} />
      
      <form onSubmit={handleRegister} className="flex flex-col gap-5">
        
        {/* Full Name Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="nama_lengkap" className="text-sm font-bold text-slate-700">Nama Lengkap</label>
          <div className="relative">
            <i className="pi pi-id-card text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-lg"></i>
            <InputText 
              id="nama_lengkap" 
              value={formData.nama_lengkap} 
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })} 
              className="w-full bg-slate-50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pr-4 pl-11 transition-all font-medium"
              placeholder="Masukkan nama lengkap"
              required 
            />
          </div>
        </div>

        {/* Username Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm font-bold text-slate-700">Username</label>
          <div className="relative">
            <i className="pi pi-user text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-lg"></i>
            <InputText 
              id="username" 
              value={formData.username} 
              onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
              className="w-full bg-slate-50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pr-4 pl-11 transition-all font-medium"
              placeholder="Pilih username unik"
              required 
            />
          </div>
        </div>

        {/* Password Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label>
            <div className="relative">
              <i className="pi pi-lock text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-lg"></i>
              <Password 
                id="password" 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                toggleMask 
                className="w-full"
                inputClassName="w-full bg-slate-50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pr-4 pl-11 transition-all font-medium"
                placeholder="Buat password"
                required 
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirm_password" className="text-sm font-bold text-slate-700">Konfirmasi Password</label>
            <div className="relative">
              <i className="pi pi-lock text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-lg"></i>
              <Password 
                id="confirm_password" 
                value={formData.confirm_password} 
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} 
                toggleMask 
                feedback={false}
                className="w-full"
                inputClassName="w-full bg-slate-50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pr-4 pl-11 transition-all font-medium"
                placeholder="Ulangi password"
                required 
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-3 mt-2">
          <input 
            type="checkbox" 
            id="terms" 
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5 transition-all" 
          />
          <label htmlFor="terms" className="text-sm text-slate-600 font-medium cursor-pointer select-none leading-relaxed">
            Saya menyetujui <span className="text-blue-600 hover:underline">Syarat & Ketentuan</span> dan <span className="text-blue-600 hover:underline">Kebijakan Privasi</span> yang berlaku.
          </label>
        </div>

        {/* Submit Button */}
        <Button 
          loading={loading} 
          className="w-full bg-blue-600 border-none hover:bg-blue-700 text-white rounded-xl py-3.5 shadow-lg shadow-blue-200 mt-2 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-3" 
        >
          <i className="pi pi-user-plus text-lg"></i>
          <span className="font-bold">Daftar Akun Sekarang</span>
        </Button>
        
        {/* Login Link */}
        <p className="text-center text-slate-600 font-medium mt-4 mb-0 text-sm">
          Sudah punya akun? <Link to="/login" className="text-blue-600 no-underline font-bold hover:text-blue-700 transition-colors">Login Sekarang</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
