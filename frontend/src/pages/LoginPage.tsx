import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthResponse } from '../types';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  // Redirect if already logged in
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
      const response = await api.post<AuthResponse>('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Login successful', life: 3000 });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error: any) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.response?.data?.message || 'Login failed', 
        life: 3000 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Toast ref={toast} />
      
      {/* Left Side: Branding/Image */}
      <div className="hidden lg:flex lg:col-6 bg-blue-600 align-items-center justify-content-center relative overflow-hidden">
        <div className="z-1 text-center p-6">
          <div className="flex align-items-center justify-content-center gap-3 mb-4">
            <i className="pi pi-shield text-5xl text-white"></i>
            <h1 className="text-5xl font-bold text-white m-0">AyamSehat.AI</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-25rem mx-auto line-height-3">
            Sistem deteksi penyakit ayam tercanggih berbasis Vision Transformer (ViT).
          </p>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-20rem h-20rem bg-blue-500 border-circle opacity-20 -ml-10rem -mt-10rem"></div>
        <div className="absolute bottom-0 right-0 w-30rem h-30rem bg-blue-700 border-circle opacity-20 -mr-15rem -mb-15rem"></div>
      </div>

      {/* Right Side: Form */}
      <div className="col-12 lg:col-6 flex align-items-center justify-content-center bg-gray-50 px-4">
        <div className="w-full max-w-25rem">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-900 mb-2">Selamat Datang</h2>
            <p className="text-700">Silakan masuk ke akun Anda</p>
          </div>

          <Card className="shadow-4 border-round-xl border-none">
            <form onSubmit={handleLogin} className="flex flex-column gap-4">
              <div className="flex flex-column gap-2">
                <label htmlFor="username" className="font-semibold text-800">Username</label>
                <div className="relative">
                  <i className="pi pi-user absolute left-0 text-600 z-2" style={{ top: '50%', transform: 'translateY(-50%)', marginLeft: '1rem', fontSize: '1.1rem' }}></i>
                  <InputText 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full border-round-lg"
                    style={{ paddingLeft: '3rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                    placeholder="Masukkan username"
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-column gap-2">
                <label htmlFor="password" className="font-semibold text-800">Password</label>
                <div className="relative">
                  <i className="pi pi-lock absolute left-0 text-600 z-2" style={{ top: '50%', transform: 'translateY(-50%)', marginLeft: '1rem', fontSize: '1.1rem' }}></i>
                  <Password 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    toggleMask 
                    feedback={false}
                    className="w-full"
                    inputClassName="w-full border-round-lg"
                    inputStyle={{ paddingLeft: '3rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                    placeholder="Masukkan password"
                    required 
                  />
                </div>
              </div>

              <div className="flex align-items-center justify-content-between mt-1">
                <div className="flex align-items-center gap-2">
                  <input type="checkbox" id="remember" className="w-1rem h-1rem border-round" />
                  <label htmlFor="remember" className="text-sm text-700 cursor-pointer">Ingat saya</label>
                </div>
                <Link to="#" className="text-sm text-blue-600 font-medium no-underline hover:underline">Lupa password?</Link>
              </div>

              <Button 
                label="Masuk Sekarang" 
                icon="pi pi-sign-in" 
                loading={loading} 
                className="w-full p-3 font-bold border-round-lg shadow-2 mt-2" 
              />
              
              <div className="text-center mt-3">
                <p className="text-700">
                  Belum punya akun? <Link to="/register" className="text-blue-600 no-underline font-bold hover:underline">Daftar Gratis</Link>
                </p>
              </div>
            </form>
          </Card>
          
          <div className="mt-6 text-center text-500 text-sm">
            <Link to="/" className="text-500 no-underline hover:text-blue-600 transition-colors">
              <i className="pi pi-arrow-left mr-2"></i>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
