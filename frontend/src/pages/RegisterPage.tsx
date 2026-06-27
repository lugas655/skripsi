import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ nama_lengkap:'', username:'', password:'', confirm_password:'' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string|null>(null);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } else if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username.length<3) { toast.current?.show({severity:'error',summary:'Validasi',detail:'Username minimal 3 karakter.',life:3000}); return; }
    if (formData.password.length<6) { toast.current?.show({severity:'error',summary:'Validasi',detail:'Password minimal 6 karakter.',life:3000}); return; }
    if (formData.password!==formData.confirm_password) { toast.current?.show({severity:'error',summary:'Validasi',detail:'Password tidak cocok.',life:3000}); return; }
    if (!termsAccepted) { toast.current?.show({severity:'error',summary:'Validasi',detail:'Setujui syarat & ketentuan.',life:3000}); return; }
    setLoading(true);
    try {
      await authService.register({nama_lengkap:formData.nama_lengkap, username:formData.username, password:formData.password});
      toast.current?.show({severity:'success',summary:'Akun dibuat!',detail:'Mengalihkan ke halaman login...',life:2000});
      setTimeout(()=>navigate('/login'), 1500);
    } catch (error:any) {
      toast.current?.show({severity:'error',summary:'Gagal',detail:error.response?.data?.message||'Gagal membuat akun.',life:3000});
    } finally { setLoading(false); }
  };

  const set = (key:string)=>(e:React.ChangeEvent<HTMLInputElement>)=>setFormData(prev=>({...prev,[key]:e.target.value}));

  const inp = (field:string, extra?:React.CSSProperties): React.CSSProperties => ({
    width:'100%', padding:'0.6875rem 1rem 0.6875rem 2.75rem', borderRadius:11,
    border:`2px solid ${focused===field?'#2563EB':'#BFDBFE'}`,
    background:focused===field?'#F0F6FF':'#F5F8FF',
    fontSize:'0.875rem', color:'#0A0F1E', outline:'none',
    transition:'all 0.2s', fontFamily:'Inter,sans-serif',
    boxShadow:focused===field?'0 0 0 4px rgba(37,99,235,0.12)':'none',
    boxSizing:'border-box' as const, ...extra,
  });

  const strength = (()=>{ const p=formData.password; let s=0; if(p.length>=6)s++; if(p.length>=10)s++; if(/[A-Z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++; return s; })();
  const sLabel=['','Lemah','Cukup','Sedang','Kuat','Sangat Kuat'][strength]||'';
  const sColor=['','#DC2626','#D97706','#EAB308','#2563EB','#1D4ED8'][strength]||'#BFDBFE';

  const features=[
    {icon:'pi-bolt',text:'Diagnosis instan dalam hitungan detik'},
    {icon:'pi-shield',text:'Akurasi AI mencapai 98.5%'},
    {icon:'pi-chart-pie',text:'Dashboard analitik kesehatan ternak'},
    {icon:'pi-lock',text:'Data Anda aman & terenkripsi'},
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:'Inter,sans-serif' }}>
      <Toast ref={toast} />
      {/* LEFT */}
      <div className="lg-panel" style={{ display:'none', width:'44%', background:'linear-gradient(155deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%)', position:'relative', overflow:'hidden', flexDirection:'column', justifyContent:'space-between', padding:'2.25rem 2.75rem', minHeight:'100vh' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.07, backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'48px 48px' }} />
        <div style={{ position:'absolute', bottom:'-80px', right:'-80px', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,#3b82f6 0%,transparent 65%)', opacity:0.18 }} />
        <div style={{ position:'absolute', top:80, left:'-60px', width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,#60a5fa 0%,transparent 65%)', opacity:0.12 }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <Link to="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
            <img src="/logo.png" alt="Logo" style={{ width:38, height:38, objectFit:'contain' }} />
            <span style={{ fontSize:'1.25rem', fontWeight:700, color:'white', fontFamily:'Instrument Sans,Inter,sans-serif' }}>AyamSehat<span style={{ color:'#93C5FD' }}>.AI</span></span>
          </Link>
        </div>
        <div style={{ position:'relative', zIndex:1 }}>
          <span style={{ display:'inline-block', background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.3)', borderRadius:100, padding:'3px 12px', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#93C5FD', marginBottom:'1rem' }}>✦ Gratis Selamanya</span>
          <h1 style={{ margin:'0 0 0.75rem', fontSize:'clamp(1.5rem,2.2vw,2.125rem)', fontWeight:800, color:'white', lineHeight:1.25, letterSpacing:'-0.03em', fontFamily:'Instrument Sans,sans-serif' }}>
            Bergabung &<br /><span style={{ color:'#93C5FD' }}>Mulai Pantau</span><br />Ternak Anda
          </h1>
          <p style={{ margin:'0 0 1.5rem', color:'rgba(255,255,255,0.55)', fontSize:'0.875rem', lineHeight:1.65, maxWidth:320 }}>Ribuan peternak sudah mempercayakan kesehatan ternaknya kepada AyamSehat.AI.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {features.map((f,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 12px' }}>
                <div style={{ width:28, height:28, minWidth:28, borderRadius:8, background:'rgba(59,130,246,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className={`pi ${f.icon}`} style={{ fontSize:11, color:'#93C5FD' }} />
                </div>
                <span style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.8)', fontWeight:500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ height:1, background:'rgba(255,255,255,0.08)', marginBottom:'1.125rem' }} />
          <div style={{ display:'flex', gap:10 }}>
            {[{n:'5.200+',l:'Peternak Aktif'},{n:'18.500+',l:'Total Prediksi'}].map(s=>(
              <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'0.75rem' }}>
                <p style={{ margin:'0 0 3px', fontSize:'1.125rem', fontWeight:800, color:'white', fontFamily:'Space Mono,monospace' }}>{s.n}</p>
                <p style={{ margin:0, fontSize:'0.65rem', fontWeight:600, color:'#BFDBFE', textTransform:'uppercase' as const, letterSpacing:'0.08em' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#EEF4FF', padding:'4.5rem 1.5rem 1.5rem', position:'relative', minHeight:'100vh', overflowY:'auto' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, padding:'1rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#475569', textDecoration:'none', fontSize:'0.8rem', fontWeight:600, background:'white', border:'1px solid #BFDBFE', borderRadius:10, padding:'5px 12px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
            <i className="pi pi-arrow-left" style={{ fontSize:10 }} /> Beranda
          </Link>
          <div className="mobile-logo" style={{ display:'none' }}>
            <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
              <img src="/logo.png" alt="Logo" style={{ width:30, height:30, objectFit:'contain' }} />
              <span style={{ fontWeight:700, fontSize:'0.875rem', color:'#0A0F1E', fontFamily:'Instrument Sans,sans-serif' }}>AyamSehat<span style={{ color:'#2563EB' }}>.AI</span></span>
            </Link>
          </div>
        </div>
        <div style={{ width:'100%', maxWidth:440 }}>
          <div style={{ marginBottom:'1.25rem', textAlign:'center' }}>
            <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:46, height:46, borderRadius:13, background:'linear-gradient(135deg,#1D4ED8,#2563EB)', marginBottom:10, boxShadow:'0 6px 16px rgba(37,99,235,0.3)' }}>
              <i className="pi pi-user-plus" style={{ fontSize:18, color:'white' }} />
            </div>
            <h1 style={{ margin:0, fontSize:'1.5rem', fontWeight:800, color:'#0A0F1E', letterSpacing:'-0.03em', fontFamily:'Instrument Sans,sans-serif' }}>Buat Akun Baru</h1>
            <p style={{ margin:'4px 0 0', color:'#64748B', fontSize:'0.875rem' }}>Mulai lindungi peternakan Anda dengan AI</p>
          </div>
          <div style={{ background:'white', borderRadius:20, padding:'1.5rem', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', border:'1px solid #DBEAFE' }}>
            <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
              {/* Nama */}
              <div>
                <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' as const, color:'#475569', marginBottom:5 }}>Nama Lengkap</label>
                <div style={{ position:'relative' }}>
                  <i className="pi pi-id-card" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'0.8rem', color:focused==='nama'?'#2563EB':'#94A3B8', transition:'color 0.2s' }} />
                  <input id="reg-nama" type="text" value={formData.nama_lengkap} onChange={set('nama_lengkap')} onFocus={()=>setFocused('nama')} onBlur={()=>setFocused(null)} placeholder="Nama lengkap Anda" required style={inp('nama')} />
                </div>
              </div>
              {/* Username */}
              <div>
                <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' as const, color:'#475569', marginBottom:5 }}>Username</label>
                <div style={{ position:'relative' }}>
                  <i className="pi pi-at" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'0.8rem', color:focused==='user'?'#2563EB':'#94A3B8', transition:'color 0.2s' }} />
                  <input id="reg-user" type="text" value={formData.username} onChange={set('username')} onFocus={()=>setFocused('user')} onBlur={()=>setFocused(null)} placeholder="Pilih username (min. 3 karakter)" required style={inp('user')} />
                </div>
              </div>
              {/* Pass row */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' as const, color:'#475569', marginBottom:5 }}>Password</label>
                  <div style={{ position:'relative' }}>
                    <i className="pi pi-lock" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'0.8rem', color:focused==='pass'?'#2563EB':'#94A3B8', transition:'color 0.2s' }} />
                    <input id="reg-pass" type={showPass?'text':'password'} value={formData.password} onChange={set('password')} onFocus={()=>setFocused('pass')} onBlur={()=>setFocused(null)} placeholder="Min. 6 karakter" required style={inp('pass',{paddingRight:'2.5rem'})} />
                    <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94A3B8', padding:0 }}><i className={`pi ${showPass?'pi-eye-slash':'pi-eye'}`} style={{ fontSize:'0.8rem' }} /></button>
                  </div>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' as const, color:'#475569', marginBottom:5 }}>Konfirmasi</label>
                  <div style={{ position:'relative' }}>
                    <i className="pi pi-lock" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'0.8rem', color:focused==='confirm'?'#2563EB':'#94A3B8', transition:'color 0.2s' }} />
                    <input id="reg-confirm" type={showConfirm?'text':'password'} value={formData.confirm_password} onChange={set('confirm_password')} onFocus={()=>setFocused('confirm')} onBlur={()=>setFocused(null)} placeholder="Ulangi password" required
                      style={inp('confirm',{paddingRight:'2.5rem', borderColor:formData.confirm_password&&formData.confirm_password!==formData.password?'#DC2626':formData.confirm_password&&formData.confirm_password===formData.password?'#2563EB':focused==='confirm'?'#2563EB':'#BFDBFE'})} />
                    <button type="button" onClick={()=>setShowConfirm(!showConfirm)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94A3B8', padding:0 }}><i className={`pi ${showConfirm?'pi-eye-slash':'pi-eye'}`} style={{ fontSize:'0.8rem' }} /></button>
                  </div>
                </div>
              </div>
              {/* Strength bar */}
              {formData.password.length>0&&(
                <div>
                  <div style={{ display:'flex', gap:4, marginBottom:3 }}>
                    {[1,2,3,4,5].map(i=><div key={i} style={{ flex:1, height:3, borderRadius:100, background:i<=strength?sColor:'#E2E8F0', transition:'background 0.3s' }} />)}
                  </div>
                  <p style={{ margin:0, fontSize:'0.65rem', fontWeight:700, color:sColor }}>Keamanan: {sLabel}</p>
                </div>
              )}
              {/* Terms */}
              <div style={{ padding:'0.75rem', background:'#EFF6FF', borderRadius:10, border:'1px solid #BFDBFE' }}>
                <label htmlFor="reg-terms" style={{ display:'flex', alignItems:'flex-start', gap:9, cursor:'pointer' }}>
                  <input id="reg-terms" type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} style={{ width:15, height:15, marginTop:2, accentColor:'#2563EB', cursor:'pointer', flexShrink:0 }} />
                  <span style={{ fontSize:'0.78rem', color:'#475569', lineHeight:1.55 }}>
                    Saya menyetujui{' '}<Link to="/terms" style={{ color:'#2563EB', fontWeight:700, textDecoration:'none' }}>Syarat & Ketentuan</Link>{' '}dan{' '}<Link to="/privacy" style={{ color:'#2563EB', fontWeight:700, textDecoration:'none' }}>Kebijakan Privasi</Link>
                  </span>
                </label>
              </div>
              {/* Submit */}
              <button type="submit" disabled={loading} style={{ width:'100%', padding:'0.8125rem', borderRadius:12, border:'none', background:'linear-gradient(135deg,#1D4ED8 0%,#2563EB 100%)', color:'white', fontSize:'0.9375rem', fontWeight:700, cursor:loading?'wait':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:9, boxShadow:loading?'none':'0 5px 16px rgba(37,99,235,0.35)', transition:'all 0.2s', fontFamily:'Instrument Sans,Inter,sans-serif', opacity:loading?0.85:1 }}>
                {loading?(
                  <><style>{`@keyframes blink{0%,80%,100%{opacity:0}40%{opacity:1}}`}</style>
                    <i className="pi pi-spinner pi-spin" style={{ fontSize:14 }} /><span>Membuat Akun</span>
                    <span style={{ display:'flex', gap:3 }}>{[0,0.2,0.4].map((d,i)=><span key={i} style={{ width:4, height:4, borderRadius:'50%', background:'white', display:'inline-block', animation:`blink 1.4s ${d}s infinite` }} />)}</span>
                  </>
                ):(<><i className="pi pi-user-plus" style={{ fontSize:14 }} /> Buat Akun Gratis</>)}
              </button>
            </form>
          </div>
          <p style={{ textAlign:'center', marginTop:'1rem', fontSize:'0.875rem', color:'#64748B' }}>
            Sudah punya akun?{' '}<Link to="/login" style={{ color:'#2563EB', fontWeight:700, textDecoration:'none' }}>Masuk Sekarang →</Link>
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
export default RegisterPage;
