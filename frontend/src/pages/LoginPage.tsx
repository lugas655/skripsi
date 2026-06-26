import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
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
      toast.current?.show({ severity: 'error', summary: 'Login gagal', detail: error.response?.data?.message || 'Username atau password tidak sesuai.', life: 3000 });
    } finally { setLoading(false); }
  };

  const inp = (field: string): React.CSSProperties => ({
    width: '100%', padding: '0.75rem 1rem 0.75rem 2.875rem', borderRadius: 12,
    border: `2px solid ${focused === field ? '#2563EB' : '#BFDBFE'}`,
    background: focused === field ? '#F0F6FF' : '#F5F8FF',
    fontSize: '0.9375rem', color: '#0A0F1E', outline: 'none',
    transition: 'all 0.2s', fontFamily: 'Inter,sans-serif',
    boxShadow: focused === field ? '0 0 0 4px rgba(37,99,235,0.12)' : 'none',
    boxSizing: 'border-box' as const,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter,sans-serif' }}>
      <Toast ref={toast} />
      {/* LEFT */}
      <div className="lg-panel" style={{ display:'none', width:'50%', background:'linear-gradient(155deg,#0f172a 0%,#1e3a8a 45%,#1d4ed8 100%)', position:'relative', overflow:'hidden', flexDirection:'column', justifyContent:'space-between', padding:'2.5rem 3rem', minHeight:'100vh' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.07, backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'48px 48px' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-80px', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,#3b82f6 0%,transparent 65%)', opacity:0.20 }} />
        <div style={{ position:'absolute', top:100, right:'-60px', width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,#60a5fa 0%,transparent 65%)', opacity:0.14 }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <Link to="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
            <img src="/logo.png" alt="Logo" style={{ width:40, height:40, objectFit:'contain' }} />
            <span style={{ fontSize:'1.3rem', fontWeight:700, color:'white', fontFamily:'Instrument Sans,Inter,sans-serif' }}>AyamSehat<span style={{ color:'#93C5FD' }}>.AI</span></span>
          </Link>
        </div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:100, padding:'5px 12px', marginBottom:'1.25rem' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#93C5FD', display:'inline-block', boxShadow:'0 0 0 3px rgba(59,130,246,0.3)' }} />
            <span style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#BFDBFE' }}>Sistem Aktif — Real-time AI</span>
          </div>
          <h1 style={{ margin:'0 0 0.875rem', fontSize:'clamp(1.75rem,2.5vw,2.5rem)', fontWeight:800, color:'white', lineHeight:1.2, letterSpacing:'-0.03em', fontFamily:'Instrument Sans,sans-serif' }}>
            Diagnosis Ayam<br /><span style={{ color:'#93C5FD' }}>Lebih Cerdas</span>
          </h1>
          <p style={{ margin:'0 0 1.5rem', color:'rgba(255,255,255,0.6)', fontSize:'0.9375rem', lineHeight:1.65, maxWidth:360 }}>Deteksi penyakit unggas dari citra feses secara otomatis dengan Vision Transformer AI berakurasi tinggi.</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[{label:'Akurasi',val:'98.5%'},{label:'Penyakit',val:'4 Jenis'},{label:'Model',val:'ViT Base'}].map(s=>(
              <div key={s.label} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'0.875rem 0.75rem' }}>
                <p style={{ margin:'0 0 5px', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#93C5FD' }}>{s.label}</p>
                <p style={{ margin:0, fontSize:'1.125rem', fontWeight:700, color:'white', fontFamily:'Space Mono,monospace' }}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ height:1, background:'rgba(255,255,255,0.08)', marginBottom:'1.25rem' }} />
          <p style={{ margin:0, color:'#BFDBFE', fontSize:'0.875rem', fontStyle:'italic', lineHeight:1.65 }}>"Kesehatan unggas Anda adalah prioritas utama. Deteksi dini dengan AI menyelamatkan aset peternakan."</p>
          <p style={{ margin:'6px 0 0', color:'rgba(255,255,255,0.35)', fontSize:'0.7rem', fontWeight:600 }}>— AyamSehat.AI Vision</p>
        </div>
      </div>
      {/* RIGHT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#EEF4FF', padding:'5rem 1.5rem 2rem', position:'relative', minHeight:'100vh' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, padding:'1.125rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#475569', textDecoration:'none', fontSize:'0.8125rem', fontWeight:600, background:'white', border:'1px solid #BFDBFE', borderRadius:10, padding:'6px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
            <i className="pi pi-arrow-left" style={{ fontSize:10 }} /> Beranda
          </Link>
          <div className="mobile-logo" style={{ display:'none' }}>
            <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
              <img src="/logo.png" alt="Logo" style={{ width:32, height:32, objectFit:'contain' }} />
              <span style={{ fontWeight:700, fontSize:'0.9rem', color:'#0A0F1E', fontFamily:'Instrument Sans,sans-serif' }}>AyamSehat<span style={{ color:'#2563EB' }}>.AI</span></span>
            </Link>
          </div>
        </div>
        <div style={{ width:'100%', maxWidth:420 }}>
          <div style={{ marginBottom:'1.5rem', textAlign:'center' }}>
            <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:52, height:52, borderRadius:15, background:'linear-gradient(135deg,#1D4ED8,#2563EB)', marginBottom:12, boxShadow:'0 8px 20px rgba(37,99,235,0.3)' }}>
              <i className="pi pi-sign-in" style={{ fontSize:20, color:'white' }} />
            </div>
            <h1 style={{ margin:0, fontSize:'1.625rem', fontWeight:800, color:'#0A0F1E', letterSpacing:'-0.03em', fontFamily:'Instrument Sans,sans-serif' }}>Selamat Datang</h1>
            <p style={{ margin:'5px 0 0', color:'#64748B', fontSize:'0.9rem' }}>Masuk untuk memantau kesehatan ternak Anda</p>
          </div>
          <div style={{ background:'white', borderRadius:20, padding:'1.625rem', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', border:'1px solid #DBEAFE' }}>
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' as const, color:'#475569', marginBottom:6 }}>Username</label>
                <div style={{ position:'relative' }}>
                  <i className="pi pi-user" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:'0.875rem', color:focused==='username'?'#2563EB':'#94A3B8', transition:'color 0.2s', zIndex:1 }} />
                  <input id="login-user" type="text" value={username} onChange={e=>setUsername(e.target.value)} onFocus={()=>setFocused('username')} onBlur={()=>setFocused(null)} placeholder="Masukkan username Anda" required style={inp('username')} />
                </div>
              </div>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <label style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' as const, color:'#475569' }}>Password</label>
                  <Link to="#" style={{ fontSize:'0.75rem', fontWeight:600, color:'#2563EB', textDecoration:'none' }}>Lupa password?</Link>
                </div>
                <div style={{ position:'relative' }}>
                  <i className="pi pi-lock" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:'0.875rem', color:focused==='password'?'#2563EB':'#94A3B8', transition:'color 0.2s', zIndex:1 }} />
                  <input id="login-pass" type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} onFocus={()=>setFocused('password')} onBlur={()=>setFocused(null)} placeholder="Masukkan password Anda" required style={{...inp('password'),paddingRight:'3rem'}} />
                  <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94A3B8', padding:0, display:'flex' }}>
                    <i className={`pi ${showPass?'pi-eye-slash':'pi-eye'}`} style={{ fontSize:'0.875rem' }} />
                  </button>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <input id="remember-me" type="checkbox" style={{ width:15, height:15, accentColor:'#2563EB', cursor:'pointer' }} />
                <label htmlFor="remember-me" style={{ fontSize:'0.85rem', color:'#475569', cursor:'pointer', userSelect:'none' as const }}>Ingat saya selama 30 hari</label>
              </div>
              <div style={{ height:1, background:'linear-gradient(to right,transparent,#BFDBFE,transparent)' }} />
              <button type="submit" disabled={loading} style={{ width:'100%', padding:'0.875rem', borderRadius:12, border:'none', background:'linear-gradient(135deg,#1D4ED8 0%,#2563EB 100%)', color:'white', fontSize:'0.9375rem', fontWeight:700, cursor:loading?'wait':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:loading?'none':'0 5px 16px rgba(37,99,235,0.35)', transition:'all 0.2s', fontFamily:'Instrument Sans,Inter,sans-serif', opacity:loading?0.85:1 }}>
                {loading?(
                  <><style>{`@keyframes blink{0%,80%,100%{opacity:0}40%{opacity:1}}`}</style>
                    <i className="pi pi-spinner pi-spin" style={{ fontSize:15 }} /><span>Memverifikasi Akses</span>
                    <span style={{ display:'flex', gap:3 }}>{[0,0.2,0.4].map((d,i)=><span key={i} style={{ width:4, height:4, borderRadius:'50%', background:'white', display:'inline-block', animation:`blink 1.4s ${d}s infinite` }} />)}</span>
                  </>
                ):(<><i className="pi pi-sign-in" style={{ fontSize:15 }} /> Masuk Sekarang</>)}
              </button>
            </form>
          </div>
          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'#64748B' }}>
            Belum punya akun?{' '}<Link to="/register" style={{ color:'#2563EB', fontWeight:700, textDecoration:'none' }}>Daftar Gratis →</Link>
          </p>
        </div>
      </div>
      <style>{`
        @media(min-width:1024px){.lg-panel{display:flex!important;}.mobile-logo{display:none!important;}}
        @media(max-width:1023px){.mobile-logo{display:block!important;}}
        input::placeholder{color:#94A3B8;}
        button[type="submit"]:not(:disabled):hover{filter:brightness(1.08);transform:translateY(-1px);}
      `}</style>
    </div>
  );
};
export default LoginPage;
