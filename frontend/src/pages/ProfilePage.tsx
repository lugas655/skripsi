import React, { useState, useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import Navbar from '../components/Navbar';
import { authService } from '../services/authService';
import {
  createTestimonial,
  getMyTestimonial,
  updateTestimonial,
} from '../services/testimonialService';
import { historyService } from '../services/historyService';
import { IMAGE_BASE_URL } from '../api/api';
import { User } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────
type TabId = 'account' | 'review' | 'security' | 'activity';

interface NavItem {
  id: TabId;
  label: string;
  icon: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: 'account', label: 'Informasi akun', icon: 'pi-user' },
  { id: 'review', label: 'Ulasan saya', icon: 'pi-star' },
  { id: 'security', label: 'Keamanan', icon: 'pi-shield' },
  { id: 'activity', label: 'Aktivitas', icon: 'pi-chart-line' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Star rating display / input */
const StarRow: React.FC<{ value: number; onChange?: (v: number) => void; size?: number }> = ({
  value, onChange, size = 18,
}) => (
  <div className="flex gap-1" role={onChange ? 'group' : undefined} aria-label={onChange ? 'Pilih rating' : undefined}>
    {Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`pi ${i < value ? 'pi-star-fill' : 'pi-star'}`}
        style={{
          fontSize: size,
          color: i < value ? '#f59e0b' : 'var(--surface-400)',
          cursor: onChange ? 'pointer' : 'default',
        }}
        onClick={() => onChange?.(i + 1)}
        aria-label={onChange ? `${i + 1} bintang` : undefined}
      />
    ))}
  </div>
);

/** Reusable section card */
const Card: React.FC<{
  icon: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, title, action, children }) => (
  <div
    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
    style={{ transition: 'box-shadow 0.2s' }}
  >
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100">
      <h3 className="m-0 flex items-center gap-2 text-[14px] font-semibold text-slate-700">
        <i className={`pi ${icon} text-blue-500`} style={{ fontSize: 15 }} />
        {title}
      </h3>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/** Labelled input field wrapper */
const Field: React.FC<{
  label: string;
  icon?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, icon, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {label}
    </label>
    {icon ? (
      <span className="p-input-icon-left w-full block">
        <i className={`pi ${icon}`} style={{ color: 'var(--primary-color)', marginTop: '-0.5rem' }} />
        {children}
      </span>
    ) : children}
    {hint && <div className="text-[11px] text-slate-400 flex items-center gap-1">{hint}</div>}
  </div>
);

/** Toggle switch */
const Toggle: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({
  checked, onChange, label,
}) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className="relative w-9 h-5 rounded-full border-none cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
    style={{ background: checked ? '#3b82f6' : '#cbd5e1', flexShrink: 0 }}
  >
    <span
      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
      style={{ left: checked ? 'calc(100% - 18px)' : '2px' }}
    />
  </button>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const toast = useRef<Toast>(null);

  // User data
  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Account form
  const [namaLengkap, setNamaLengkap] = useState(user?.nama_lengkap ?? '');
  const [loading, setLoading] = useState(false);

  // Review
  const [myTestimonial, setMyTestimonial] = useState<any | null>(null);
  const [isEditingTestimonial, setIsEditingTestimonial] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Security
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [twoFA, setTwoFA] = useState(false);
  const [loginNotif, setLoginNotif] = useState(true);

  // Dynamic stats & activity
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([
    { label: 'Login dari sistem', time: 'Baru saja', status: 'Aktif', active: true }
  ]);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (user.avatar) setAvatarPreview(`${IMAGE_BASE_URL}/${user.avatar}`);

    // Fetch user review
    getMyTestimonial()
      .then(data => { if (data) setMyTestimonial(data); })
      .catch(err => console.error('Failed to fetch testimonial', err));

    // Fetch dynamic stats & history
    historyService.getStats()
      .then(s => setHistoryCount(s.totalDiagnoses))
      .catch(console.error);

    historyService.getAllHistory()
      .then(h => {
        if (h && h.data && h.data.length > 0) {
          const acts = h.data.slice(0, 4).map((item: any) => ({
            label: `Konsultasi #${item.id.toString().substring(0, 5).toUpperCase()} — ${item.hasilPrediksi?.labelPenyakit === 'HEALTHY' ? 'Sehat' : 'Sakit'}`,
            time: new Date(item.tanggalUnggah).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            status: 'Selesai',
            active: false
          }));
          setRecentActivities(prev => [...prev, ...acts]);
        }
      })
      .catch(console.error);

  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const fr = new FileReader();
    fr.onload = ev => setAvatarPreview(ev.target?.result as string);
    fr.readAsDataURL(file);
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
      if (data.user.avatar) setAvatarPreview(`${IMAGE_BASE_URL}/${data.user.avatar}`);
      toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Profil berhasil diperbarui' });
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal memperbarui profil' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (!myTestimonial) return;
    setReviewText(myTestimonial.text);
    setReviewRating(myTestimonial.rating);
    setIsEditingTestimonial(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Peringatan', detail: 'Silakan tulis ulasan Anda' });
      return;
    }
    setSubmittingReview(true);
    try {
      if (isEditingTestimonial) {
        const result = await updateTestimonial({ text: reviewText, rating: reviewRating });
        setMyTestimonial({ ...myTestimonial, text: result.text, rating: result.rating });
        toast.current?.show({ severity: 'success', summary: 'Diperbarui', detail: 'Ulasan berhasil diperbarui.' });
        setIsEditingTestimonial(false);
      } else {
        const result = await createTestimonial({
          name: user?.nama_lengkap || 'User',
          role: 'Pengguna AyamSehat.AI',
          text: reviewText,
          rating: reviewRating,
          avatar: user?.avatar ? `${IMAGE_BASE_URL}/${user.avatar}` : undefined,
        });
        setMyTestimonial(result);
        toast.current?.show({ severity: 'success', summary: 'Terima Kasih!', detail: 'Ulasan berhasil dikirim.' });
      }
      setReviewText('');
      setReviewRating(5);
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal mengirim ulasan' });
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const initials = (name: string) =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'var(--col-surface)' }}>
      <Navbar />
      <Toast ref={toast} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="lg:w-64 flex flex-col gap-4 flex-shrink-0">

            {/* Identity card */}
            <div
              className="bg-white rounded-2xl border border-slate-200 shadow-sm py-7 px-5 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Decorative halo */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, #dbeafe 0%, transparent 70%)', opacity: 0.6 }}
                aria-hidden="true"
              />

              {/* Avatar */}
              <div className="relative z-10 mb-4 group">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden text-white font-bold text-2xl select-none"
                  style={{
                    background: avatarPreview ? undefined : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    boxShadow: '0 0 0 3px #bfdbfe',
                  }}
                >
                  {avatarPreview
                    ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    : initials(user?.nama_lengkap ?? 'U')
                  }
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 shadow rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-blue-50 transition-all duration-200 z-10"
                  title="Ganti foto"
                >
                  <i className="pi pi-camera text-slate-500" style={{ fontSize: 11 }} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <h2 className="m-0 text-[16px] font-semibold text-slate-800 z-10">
                {user?.nama_lengkap}
              </h2>
              <p className="m-0 mt-1 text-[12px] text-slate-400 z-10">@{user?.username}</p>

              <span
                className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-[11px] font-semibold z-10"
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                }}
              >
                <i className="pi pi-check-circle" style={{ fontSize: 11 }} />
                Pengguna Aktif
              </span>
            </div>

            {/* Stat mini-cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 text-center">
                <div className="text-[20px] font-bold text-slate-800">{historyCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">KONSULTASI</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 text-center">
                <div className="text-[20px] font-bold text-slate-800">{myTestimonial?.rating ? myTestimonial.rating.toFixed(1) : '-'}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">RATING ANDA</div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1" aria-label="Navigasi profil">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={[
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium border-none cursor-pointer text-left transition-all duration-150 w-full',
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                  ].join(' ')}
                >
                  <i className={`pi ${item.icon}`} style={{ fontSize: 15, width: 16 }} />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">

            {/* ── Tab: Informasi Akun ─────────────────────────────────── */}
            {activeTab === 'account' && (
              <>
                <Card icon="pi-user-circle" title="Informasi akun">
                  <form onSubmit={handleUpdateProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Field
                        label="Username"
                        icon="pi-at"
                        hint={<><i className="pi pi-lock" style={{ fontSize: 10 }} /> Tidak dapat diubah</>}
                      >
                        <InputText
                          value={user?.username ?? ''}
                          disabled
                          className="w-full text-sm rounded-lg"
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </Field>
                      <Field label="Nama lengkap" icon="pi-id-card">
                        <InputText
                          value={namaLengkap}
                          onChange={e => setNamaLengkap(e.target.value)}
                          className="w-full text-sm rounded-lg"
                          style={{ paddingLeft: '2.5rem' }}
                          placeholder="Masukkan nama lengkap"
                          required
                        />
                      </Field>
                      <Field label="Email" icon="pi-envelope" hint="Opsional">
                        <InputText disabled placeholder="Belum ditambahkan" className="w-full bg-slate-50 border-slate-200 text-sm rounded-lg text-slate-400" style={{ paddingLeft: '2.5rem' }} />
                      </Field>
                      <Field label="Nomor Telepon" icon="pi-phone" hint="Opsional">
                        <InputText disabled placeholder="Belum ditambahkan" className="w-full bg-slate-50 border-slate-200 text-sm rounded-lg text-slate-400" style={{ paddingLeft: '2.5rem' }} />
                      </Field>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loading
                          ? <i className="pi pi-spin pi-spinner" style={{ fontSize: 12 }} />
                          : <i className="pi pi-check" style={{ fontSize: 12 }} />
                        }
                        {loading ? 'Menyimpan...' : 'Simpan perubahan'}
                      </button>
                    </div>
                  </form>
                </Card>

                <Card icon="pi-image" title="Foto profil">
                  <div className="flex items-center gap-5">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden text-white font-bold text-xl flex-shrink-0"
                      style={{
                        background: avatarPreview ? undefined : 'linear-gradient(135deg,#1e40af,#3b82f6)',
                        boxShadow: '0 0 0 3px #bfdbfe',
                      }}
                    >
                      {avatarPreview
                        ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        : initials(user?.nama_lengkap ?? 'U')
                      }
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-slate-700 mb-1">Unggah foto baru</p>
                      <p className="text-[12px] text-slate-400 mb-3">JPG, PNG, atau WebP. Maks 2 MB.</p>
                      <div className="flex gap-2">
                        <label
                          htmlFor="avatar-upload-2"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <i className="pi pi-upload" style={{ fontSize: 11 }} /> Pilih file
                          <input id="avatar-upload-2" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                        <button
                          type="button"
                          onClick={() => { setAvatarPreview(null); setSelectedFile(null); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-red-500 bg-white border border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition-colors"
                        >
                          <i className="pi pi-trash" style={{ fontSize: 11 }} /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* ── Tab: Ulasan ─────────────────────────────────────────── */}
            {activeTab === 'review' && (
              <Card
                icon="pi-star"
                title="Ulasan saya"
                action={
                  myTestimonial && !isEditingTestimonial ? (
                    <button
                      onClick={handleEditClick}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <i className="pi pi-pencil" style={{ fontSize: 10 }} /> Edit ulasan
                    </button>
                  ) : null
                }
              >
                {(!myTestimonial || isEditingTestimonial) ? (
                  <form onSubmit={handleSubmitReview} className="flex flex-col gap-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Rating anda</p>
                      <StarRow value={reviewRating} onChange={setReviewRating} size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Ulasan / pengalaman anda</p>
                      <InputTextarea
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        rows={4}
                        className="w-full text-sm rounded-lg border-slate-200"
                        placeholder="Ceritakan pengalaman menggunakan aplikasi ini..."
                        style={{ resize: 'none' }}
                      />
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                      {isEditingTestimonial && (
                        <button
                          type="button"
                          onClick={() => setIsEditingTestimonial(false)}
                          className="px-4 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {submittingReview
                          ? <i className="pi pi-spin pi-spinner" style={{ fontSize: 12 }} />
                          : <i className="pi pi-send" style={{ fontSize: 12 }} />
                        }
                        {submittingReview ? 'Mengirim...' : isEditingTestimonial ? 'Perbarui ulasan' : 'Kirim ulasan'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <StarRow value={myTestimonial.rating} size={16} />
                    <p className="mt-3 text-[13px] italic text-slate-600 leading-relaxed">
                      "{myTestimonial.text}"
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Dikirim pada{' '}
                        {new Date(myTestimonial.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                      <span
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}
                      >
                        Ditampilkan publik
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* ── Tab: Keamanan ───────────────────────────────────────── */}
            {activeTab === 'security' && (
              <>
                <Card icon="pi-key" title="Ganti kata sandi">
                  <div className="flex flex-col gap-4">
                    <Field label="Kata sandi saat ini" icon="pi-lock">
                      <InputText
                        type="password"
                        value={currentPwd}
                        onChange={e => setCurrentPwd(e.target.value)}
                        className="w-full text-sm rounded-lg"
                        style={{ paddingLeft: '2.5rem' }}
                        placeholder="••••••••"
                      />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Kata sandi baru" icon="pi-lock">
                        <InputText
                          type="password"
                          value={newPwd}
                          onChange={e => setNewPwd(e.target.value)}
                          className="w-full text-sm rounded-lg"
                          style={{ paddingLeft: '2.5rem' }}
                          placeholder="Min. 8 karakter"
                        />
                      </Field>
                      <Field label="Konfirmasi kata sandi" icon="pi-lock">
                        <InputText
                          type="password"
                          value={confirmPwd}
                          onChange={e => setConfirmPwd(e.target.value)}
                          className="w-full text-sm rounded-lg"
                          style={{ paddingLeft: '2.5rem' }}
                          placeholder="Ulangi kata sandi"
                        />
                      </Field>
                    </div>
                    <div className="border-t border-slate-100 pt-4 flex justify-end">
                      <button
                        type="button"
                        className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:-translate-y-0.5 transition-all cursor-pointer"
                        onClick={() => {
                          toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Kata sandi diperbarui' });
                          setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
                        }}
                      >
                        <i className="pi pi-shield" style={{ fontSize: 12 }} />
                        Perbarui kata sandi
                      </button>
                    </div>
                  </div>
                </Card>

                <Card icon="pi-shield" title="Pengaturan keamanan">
                  <div className="divide-y divide-slate-100">
                    {[
                      {
                        label: 'Autentikasi dua faktor',
                        desc: 'Tambah lapisan keamanan ekstra saat masuk',
                        checked: twoFA,
                        toggle: () => setTwoFA(v => !v),
                      },
                      {
                        label: 'Notifikasi login',
                        desc: 'Terima email saat ada login dari perangkat baru',
                        checked: loginNotif,
                        toggle: () => setLoginNotif(v => !v),
                      },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between py-3.5">
                        <div>
                          <p className="text-[13px] font-medium text-slate-700">{row.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{row.desc}</p>
                        </div>
                        <Toggle checked={row.checked} onChange={row.toggle} label={row.label} />
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-3.5">
                      <div>
                        <p className="text-[13px] font-medium text-slate-700">Session aktif</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Kelola perangkat yang masuk ke akun anda</p>
                      </div>
                      <button className="px-3 py-1.5 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                        Lihat semua
                      </button>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* ── Tab: Aktivitas ──────────────────────────────────────── */}
            {activeTab === 'activity' && (
              <Card icon="pi-history" title="Riwayat aktivitas">
                <div className="divide-y divide-slate-100">
                  {recentActivities.map((row, i) => (
                    <div key={i} className="flex items-center gap-3 py-3.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
                        style={{ background: row.active ? '#22c55e' : '#cbd5e1' }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-slate-700 truncate font-medium">{row.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{row.time}</p>
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0"
                        style={row.active
                          ? { background: '#dcfce7', color: '#15803d' }
                          : { background: '#f1f5f9', color: '#64748b' }
                        }
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                  {recentActivities.length === 1 && (
                    <div className="text-center py-6">
                      <i className="pi pi-inbox text-slate-300 text-4xl mb-3"></i>
                      <p className="text-sm text-slate-500 m-0">Belum ada riwayat aktivitas lain.</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;