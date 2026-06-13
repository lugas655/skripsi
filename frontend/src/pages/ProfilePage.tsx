/// <reference types="vite/client" />
import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import { Rating } from 'primereact/rating';
import { InputTextarea } from 'primereact/inputtextarea';
import Navbar from '../components/Navbar';
import { authService } from '../services/authService';
import { createTestimonial } from '../services/testimonialService';
import { IMAGE_BASE_URL } from '../api/api';
import { User } from '../types';

const ProfilePage: React.FC = () => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const toast = useRef<Toast>(null);

  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (user) {
      setNamaLengkap(user.nama_lengkap);
      if (user.avatar) setAvatarPreview(`${IMAGE_BASE_URL}/${user.avatar}`);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fr = new FileReader();
      fr.onload = ev => setAvatarPreview(ev.target?.result as string);
      fr.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append('nama_lengkap', namaLengkap);
    if (selectedFile) fd.append('avatar', selectedFile);
    try {
      const data = await authService.updateProfile(fd);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Profil berhasil diperbarui' });
      if (data.user.avatar) setAvatarPreview(`${IMAGE_BASE_URL}/${data.user.avatar}`);
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal memperbarui profil' });
    } finally { setLoading(false); }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Peringatan', detail: 'Silakan tulis ulasan Anda' });
      return;
    }
    setSubmittingReview(true);
    try {
      await createTestimonial({ name: user?.nama_lengkap || 'User', role: 'Pengguna AyamSehat.AI', text: reviewText, rating: reviewRating, avatar: user?.avatar ? `${IMAGE_BASE_URL}/${user.avatar}` : undefined });
      toast.current?.show({ severity: 'success', summary: 'Terima Kasih!', detail: 'Ulasan berhasil dikirim.' });
      setReviewText(''); setReviewRating(5);
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengirim ulasan' });
    } finally { setSubmittingReview(false); }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const FieldLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="diag-label block mb-1.5" style={{ color: 'var(--col-ink-4)' }}>{children}</label>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--col-surface)' }}>
      <Navbar />
      <Toast ref={toast} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-16">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--col-ink)' }}>Profil Saya</h1>
          <p className="m-0 mt-1 text-sm" style={{ color: 'var(--col-ink-4)' }}>Kelola informasi akun dan bagikan pengalaman Anda</p>
        </div>

        {/* Profile Card */}
        <div className="card overflow-hidden mb-5 animate-fade-up">
          {/* Header strip */}
          <div className="h-20" style={{ background: 'linear-gradient(135deg, var(--col-brand-dark) 0%, var(--col-brand) 100%)' }} />

          <form onSubmit={handleUpdateProfile}>
            <div className="px-6 pb-6">
              {/* Avatar + name */}
              <div className="flex items-end gap-4 -mt-9 mb-6">
                <div className="relative shrink-0">
                  <Avatar
                    image={avatarPreview || undefined}
                    label={!avatarPreview && user ? getInitials(user.nama_lengkap) : undefined}
                    shape="circle"
                    className="overflow-hidden border-4 border-white"
                    style={{ width: 76, height: 76, background: 'var(--col-brand-muted)', color: 'var(--col-brand-dark)', fontSize: '1.375rem', fontWeight: 700, boxShadow: 'var(--sh-md)' }}
                  />
                  <label htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 w-7 h-7 flex items-center justify-center rounded-full cursor-pointer border-2 border-white transition-colors"
                    style={{ background: 'var(--col-brand)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--col-brand-dark)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--col-brand)')}
                  >
                    <i className="pi pi-camera" style={{ fontSize: 10, color: 'white' }} />
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <div className="pb-1">
                  <p className="m-0 font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>{user?.nama_lengkap}</p>
                  <p className="m-0 text-xs font-medium" style={{ color: 'var(--col-ink-4)', fontFamily: 'var(--font-mono)' }}>@{user?.username}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Username (readonly) */}
                <div>
                  <FieldLabel htmlFor="p-username">Username</FieldLabel>
                  <InputText id="p-username" value={user?.username || ''} disabled className="w-full !bg-slate-50 !text-slate-400 !cursor-not-allowed" />
                  <p className="m-0 mt-1 text-xs italic" style={{ color: 'var(--col-ink-4)' }}>Username tidak dapat diubah</p>
                </div>

                {/* Full name */}
                <div>
                  <FieldLabel htmlFor="p-nama">Nama Lengkap</FieldLabel>
                  <InputText id="p-nama" value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)} className="w-full" placeholder="Masukkan nama lengkap" required />
                </div>

                <div className="flex justify-end pt-2" style={{ borderTop: '1px solid var(--col-border)' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    style={{ background: 'var(--col-brand)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(21,128,61,0.25)', fontFamily: 'var(--font-display)' }}
                  >
                    {loading ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Menyimpan...</> : <><i className="pi pi-save" style={{ fontSize: 13 }} /> Simpan Perubahan</>}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Review Card */}
        <div className="card p-6 animate-fade-up delay-100">
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: 34, height: 34, minWidth: 34, borderRadius: 9, background: 'var(--col-warn-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="pi pi-star-fill" style={{ fontSize: 13, color: 'var(--col-warn)' }} />
            </div>
            <div>
              <h2 className="m-0 text-base font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>Beri Ulasan Aplikasi</h2>
              <p className="m-0 mt-0.5 text-xs" style={{ color: 'var(--col-ink-4)' }}>Pengalaman Anda sangat berarti bagi kami</p>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
            <div>
              <label className="diag-label block mb-2" style={{ color: 'var(--col-ink-4)' }}>Rating Anda</label>
              <Rating value={reviewRating} onChange={e => setReviewRating(e.value || 0)} cancel={false} />
            </div>
            <div>
              <label htmlFor="review-text" className="diag-label block mb-1.5" style={{ color: 'var(--col-ink-4)' }}>Ulasan / Pengalaman</label>
              <InputTextarea id="review-text" value={reviewText} onChange={e => setReviewText(e.target.value)}
                rows={4} className="w-full" placeholder="Ceritakan pengalaman menggunakan aplikasi ini..." style={{ resize: 'none' }} />
            </div>
            <div className="flex justify-end pt-2" style={{ borderTop: '1px solid var(--col-border)' }}>
              <button
                type="submit"
                disabled={submittingReview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: 'var(--col-brand)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(21,128,61,0.25)', fontFamily: 'var(--font-display)' }}
              >
                {submittingReview ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Mengirim...</> : <><i className="pi pi-send" style={{ fontSize: 13 }} /> Kirim Ulasan</>}
              </button>
            </div>
          </form>
        </div>

        {/* Back */}
        <div className="mt-5 text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-transparent border-none text-sm font-medium cursor-pointer hover:underline"
            style={{ color: 'var(--col-ink-4)' }}
          >
            <i className="pi pi-arrow-left mr-1.5" style={{ fontSize: 11 }} /> Kembali ke Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
