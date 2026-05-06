/// <reference types="vite/client" />
import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import Navbar from '../components/Navbar';
import { authService } from '../services/authService';
import { IMAGE_BASE_URL } from '../api/api';
import { User } from '../types';

const ProfilePage: React.FC = () => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const toast = useRef<Toast>(null);
  
  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;


  useEffect(() => {
    if (user) {
      setNamaLengkap(user.nama_lengkap);
      if (user.avatar) {
        setAvatarPreview(`${IMAGE_BASE_URL}/${user.avatar}`);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('nama_lengkap', namaLengkap);
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    try {
      const data = await authService.updateProfile(formData);
      
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Profil berhasil diperbarui' });
      
      // Update preview with new server URL
      if (data.user.avatar) {
        setAvatarPreview(`${IMAGE_BASE_URL}/${data.user.avatar}`);
      }
    } catch (error: any) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Gagal', 
        detail: error.response?.data?.message || 'Gagal memperbarui profil' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toast ref={toast} />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold text-900 mb-6">Pengaturan Profil</h1>
        
        <Card className="shadow-4 border-round-2xl border-none">
          <form onSubmit={handleUpdateProfile} className="flex flex-column gap-6">
            
            {/* Avatar Upload Section */}
            <div className="flex flex-column align-items-center gap-4">
              <div className="relative group">
                <Avatar 
                  image={avatarPreview || undefined}
                  label={(!avatarPreview && user) ? getInitials(user.nama_lengkap) : undefined}
                  shape="circle"
                  size="xlarge"
                  className="w-10rem h-10rem shadow-4 border-2 border-white overflow-hidden"
                  style={{ backgroundColor: !avatarPreview ? '#DBEAFE' : 'transparent', color: '#2563EB' }}
                />
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 bg-blue-600 text-white w-3rem h-3rem border-circle flex align-items-center justify-content-center shadow-4 cursor-pointer hover:bg-blue-700 transition-colors border-2 border-white"
                >
                  <i className="pi pi-camera text-xl"></i>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <div className="text-center">
                <p className="m-0 font-bold text-900">Foto Profil</p>
                <p className="m-0 text-600 text-sm mt-1">Klik ikon kamera untuk mengubah foto</p>
              </div>
            </div>

            <div className="flex flex-column gap-4">
              <div className="flex flex-column gap-2">
                <label htmlFor="username" className="font-semibold text-800">Username</label>
                <InputText 
                  id="username" 
                  value={user?.username || ''} 
                  disabled 
                  className="w-full bg-gray-100 border-round-xl"
                />
                <small className="text-500 italic">Username tidak dapat diubah</small>
              </div>

              <div className="flex flex-column gap-2">
                <label htmlFor="nama_lengkap" className="font-semibold text-800">Nama Lengkap</label>
                <InputText 
                  id="nama_lengkap" 
                  value={namaLengkap} 
                  onChange={(e) => setNamaLengkap(e.target.value)} 
                  className="w-full border-round-xl p-3"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <Button 
                label="Simpan Perubahan" 
                icon="pi pi-save" 
                loading={loading}
                className="w-full p-3 font-bold border-round-xl mt-4 shadow-3"
              />
            </div>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <Button 
            label="Kembali ke Dashboard" 
            icon="pi pi-arrow-left" 
            className="p-button-text p-button-sm text-700 font-bold"
            onClick={() => window.history.back()}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
