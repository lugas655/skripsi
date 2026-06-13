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

  return (
    <div className="min-h-screen" style={{ background: 'var(--col-surface)' }}>
      <Navbar />
      <Toast ref={toast} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">

        {/* Page Header */}
        <div className="mb-10 animate-fade-up">
          <h1 className="m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.875rem', color: 'var(--col-ink)', letterSpacing: '-0.03em' }}>
            Pengaturan Profil
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column — Identity Card */}
          <div className="lg:col-span-4 animate-fade-up">
            <div className="card !p-0 overflow-hidden" style={{ boxShadow: 'var(--sh-lg)' }}>
              {/* Gradient banner */}
              <div className="relative h-28" style={{ background: 'linear-gradient(135deg, var(--col-brand-dark) 0%, var(--col-brand) 50%, var(--col-brand-mid) 100%)' }}>
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(134,239,172,0.25) 0%, transparent 60%)' }} />
                {/* Subtle pattern */}
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              </div>

              {/* Avatar & Identity */}
              <div className="flex flex-col items-center -mt-12 px-6 pb-6">
                <div className="relative mb-4">
                  <Avatar
                    image={avatarPreview || undefined}
                    label={!avatarPreview && user ? getInitials(user.nama_lengkap) : undefined}
                    shape="circle"
                    className="overflow-hidden"
                    style={{
                      width: 88, height: 88,
                      background: avatarPreview ? 'transparent' : 'var(--col-brand-muted)',
                      color: 'var(--col-brand-dark)',
                      fontSize: '1.5rem', fontWeight: 800,
                      border: '4px solid white',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                  />
                  <label htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer border-2 border-white transition-all hover:scale-110"
                    style={{ background: 'var(--col-brand)', boxShadow: '0 2px 8px rgba(21,128,61,0.4)' }}
                  >
                    <i className="pi pi-camera" style={{ fontSize: 11, color: 'white' }} />
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                <h2 className="m-0 text-center" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--col-ink)' }}>
                  {user?.nama_lengkap}
                </h2>
                <span className="mt-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--col-brand-pale)', color: 'var(--col-brand)', fontFamily: 'var(--font-mono)' }}>
                  @{user?.username}
                </span>

                {/* Mini stats */}
                <div className="w-full mt-6 pt-5" style={{ borderTop: '1px solid var(--col-border)' }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-xl" style={{ background: 'var(--col-surface)' }}>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <i className="pi pi-shield" style={{ fontSize: 11, color: 'var(--col-brand)' }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--col-ink-4)' }}>Status</span>
                      </div>
                      <p className="m-0 text-xs font-bold" style={{ color: 'var(--col-brand)' }}>Aktif</p>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: 'var(--col-surface)' }}>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <i className="pi pi-user" style={{ fontSize: 11, color: 'var(--col-info)' }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--col-ink-4)' }}>Peran</span>
                      </div>
                      <p className="m-0 text-xs font-bold" style={{ color: 'var(--col-ink-2)' }}>Pengguna</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Forms */}
          <div className="lg:col-span-8 space-y-8 animate-fade-up delay-100">

            {/* Edit Profile Card */}
            <div className="card !p-0 overflow-hidden" style={{ boxShadow: 'var(--sh-lg)' }}>
              {/* Section header */}
              <div className="px-6 sm:px-8 py-5" style={{ borderBottom: '1px solid var(--col-border)' }}>
                <h3 className="m-0 text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
                  Informasi Akun
                </h3>
                <p className="m-0 mt-0.5 text-xs" style={{ color: 'var(--col-ink-4)' }}>Perbarui nama tampilan Anda</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="px-6 sm:px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Username (readonly) */}
                  <div>
                    <label htmlFor="p-username" className="diag-label block mb-2" style={{ color: 'var(--col-ink-4)' }}>Username</label>
                    <div className="relative">
                      <i className="pi pi-at absolute left-3.5 top-1/2 -translate-y-1/2 z-10" style={{ fontSize: 12, color: 'var(--col-ink-4)' }} />
                      <InputText id="p-username" value={user?.username || ''} disabled className="w-full !pl-10 !bg-slate-50 !text-slate-400 !cursor-not-allowed" />
                    </div>
                    <p className="m-0 mt-1.5 text-[11px] flex items-center gap-1" style={{ color: 'var(--col-ink-4)' }}>
                      <i className="pi pi-lock" style={{ fontSize: 9 }} /> Tidak dapat diubah
                    </p>
                  </div>

                  {/* Full name */}
                  <div>
                    <label htmlFor="p-nama" className="diag-label block mb-2" style={{ color: 'var(--col-ink-4)' }}>Nama Lengkap</label>
                    <div className="relative">
                      <i className="pi pi-id-card absolute left-3.5 top-1/2 -translate-y-1/2 z-10" style={{ fontSize: 12, color: 'var(--col-ink-4)' }} />
                      <InputText id="p-nama" value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)} className="w-full !pl-10" placeholder="Masukkan nama lengkap" required />
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end mt-6 pt-5" style={{ borderTop: '1px solid var(--col-border-light)' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'var(--col-brand)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(21,128,61,0.25)', fontFamily: 'var(--font-display)' }}
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Menyimpan...</>
                    ) : (
                      <><i className="pi pi-check" style={{ fontSize: 12 }} /> Simpan Perubahan</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Review Card */}
            <div className="card !p-0 overflow-hidden" style={{ boxShadow: 'var(--sh-lg)' }}>
              {/* Section header */}
              <div className="px-6 sm:px-8 py-5" style={{ borderBottom: '1px solid var(--col-border)' }}>
                <h3 className="m-0 text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--col-ink)' }}>
                  Beri Ulasan
                </h3>
                <p className="m-0 mt-0.5 text-xs" style={{ color: 'var(--col-ink-4)' }}>Pengalaman Anda sangat berarti bagi kami</p>
              </div>

              <form onSubmit={handleSubmitReview} className="px-6 sm:px-8 py-6">
                <div className="flex flex-col gap-5">
                  {/* Rating */}
                  <div>
                    <label className="diag-label block mb-2.5" style={{ color: 'var(--col-ink-4)' }}>Rating Anda</label>
                    <div className="flex items-center gap-4">
                      <Rating value={reviewRating} onChange={e => setReviewRating(e.value || 0)} cancel={false} />
                      <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg" style={{ background: 'var(--col-warn-pale)', color: 'var(--col-warn)', fontFamily: 'var(--font-mono)' }}>
                        {reviewRating}/5
                      </span>
                    </div>
                  </div>

                  {/* Review text */}
                  <div>
                    <label htmlFor="review-text" className="diag-label block mb-2" style={{ color: 'var(--col-ink-4)' }}>Ulasan / Pengalaman</label>
                    <InputTextarea
                      id="review-text"
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      rows={4}
                      className="w-full"
                      placeholder="Ceritakan pengalaman menggunakan aplikasi ini..."
                      style={{ resize: 'none' }}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end mt-6 pt-5" style={{ borderTop: '1px solid var(--col-border-light)' }}>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'var(--col-brand)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(21,128,61,0.25)', fontFamily: 'var(--font-display)' }}
                  >
                    {submittingReview ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Mengirim...</>
                    ) : (
                      <><i className="pi pi-send" style={{ fontSize: 12 }} /> Kirim Ulasan</>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
