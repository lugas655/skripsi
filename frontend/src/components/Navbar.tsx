/// <reference types="vite/client" />
import React, { useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { TieredMenu } from 'primereact/tieredmenu';
import { Sidebar } from 'primereact/sidebar';
import { IMAGE_BASE_URL } from '../api/api';
import { User } from '../types';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = useRef<TieredMenu>(null);
  const [visible, setVisible] = useState(false);

  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Profil Saya', icon: 'pi pi-user', command: () => navigate('/profile') },
    { separator: true },
    { label: 'Keluar', icon: 'pi pi-sign-out', className: 'text-red-500', command: handleLogout },
  ];

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-th-large' },
    { label: 'Prediksi', path: '/predict', icon: 'pi pi-camera' },
    { label: 'Riwayat', path: '/history', icon: 'pi pi-history' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Admin', path: '/admin', icon: 'pi pi-shield' });
  }

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <nav
      className="sticky top-0 z-[1000]"
      style={{ background: 'var(--col-card)', borderBottom: '1px solid var(--col-border)', boxShadow: 'var(--sh-xs)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15" style={{ height: '3.75rem' }}>

          {/* Logo + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-colors"
              style={{ background: 'transparent', color: 'var(--col-ink-3)' }}
              onClick={() => setVisible(true)}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--col-brand-pale)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <i className="pi pi-bars" style={{ fontSize: 16 }} />
            </button>
            <Link to="/dashboard" className="no-underline flex items-center group shrink-0">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shrink-0 group-hover:scale-105 transition-transform" />
              <span className="-ml-4 md:-ml-5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--col-ink)' }}>
                AyamSehat<span style={{ color: 'var(--col-brand)' }} className="hidden sm:inline">.AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="no-underline flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    color: active ? 'var(--col-brand-dark)' : 'var(--col-ink-3)',
                    background: active ? 'var(--col-brand-pale)' : 'transparent',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--col-surface)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <i className={item.icon} style={{ fontSize: 12, color: active ? 'var(--col-brand)' : 'inherit' }} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User menu */}
          {user && (
            <div
              className="flex items-center gap-2.5 cursor-pointer px-2.5 py-1.5 rounded-xl transition-all"
              style={{ border: '1px solid transparent' }}
              onClick={e => menu.current?.toggle(e)}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--col-surface)';
                e.currentTarget.style.borderColor = 'var(--col-border)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div className="text-right hidden sm:block">
                <p className="m-0 font-semibold text-[13px] leading-tight" style={{ color: 'var(--col-ink)' }}>{user.nama_lengkap}</p>
                <p className="m-0 text-[10px] font-medium" style={{ color: 'var(--col-ink-4)' }}>{user.role === 'ADMIN' ? 'Administrator' : 'Peternak'}</p>
              </div>
              <Avatar
                image={user.avatar ? `${IMAGE_BASE_URL}/${user.avatar}` : undefined}
                label={!user.avatar ? getInitials(user.nama_lengkap) : undefined}
                shape="circle"
                style={{
                  width: '2rem', height: '2rem',
                  background: 'var(--col-brand-muted)',
                  color: 'var(--col-brand-dark)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              />
              <i className="pi pi-chevron-down" style={{ fontSize: 9, color: 'var(--col-ink-4)' }} />
              <TieredMenu model={menuItems} popup ref={menu} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sidebar
        visible={visible}
        onHide={() => setVisible(false)}
        className="w-[280px] p-0"
        header={
          <div className="flex items-center pl-0">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
            <span className="-ml-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--col-ink)' }}>
              AyamSehat<span style={{ color: 'var(--col-brand)' }}>.AI</span>
            </span>
          </div>
        }
        >
        <div className="flex flex-col gap-1.5 p-3 sm:p-4">
          {/* User card */}
          <div
            className="flex items-center gap-3 p-3.5 rounded-xl mb-4"
            style={{ background: 'var(--col-brand-pale)', border: '1px solid var(--col-brand-muted)' }}
          >
            <Avatar
              image={user?.avatar ? `${IMAGE_BASE_URL}/${user.avatar}` : undefined}
              label={!user?.avatar ? getInitials(user?.nama_lengkap || '') : undefined}
              shape="circle"
              style={{ width: '2.25rem', height: '2.25rem', background: 'var(--col-brand-muted)', color: 'var(--col-brand-dark)', fontWeight: 700, fontSize: '0.75rem' }}
            />
            <div className="overflow-hidden">
              <p className="m-0 text-sm font-bold truncate" style={{ color: 'var(--col-ink)' }}>{user?.nama_lengkap}</p>
              <p className="m-0 text-[10px] uppercase tracking-wider" style={{ color: 'var(--col-ink-4)' }}>@{user?.username}</p>
            </div>
          </div>

          <p className="diag-label px-2 mb-1" style={{ color: 'var(--col-ink-4)' }}>Navigasi</p>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setVisible(false)}
                className="no-underline font-semibold text-sm flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all"
                style={{
                  color: active ? 'white' : 'var(--col-ink-2)',
                  background: active ? 'var(--col-brand)' : 'transparent',
                }}
              >
                <i className={item.icon} style={{ fontSize: 14 }} />
                {item.label}
              </Link>
            );
          })}

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--col-border)' }}>
            <p className="diag-label px-2 mb-1" style={{ color: 'var(--col-ink-4)' }}>Akun</p>
            <Link
              to="/profile"
              onClick={() => setVisible(false)}
              className="no-underline font-semibold text-sm flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all"
              style={{ color: 'var(--col-ink-2)' }}
            >
              <i className="pi pi-user" style={{ fontSize: 14 }} />
              Profil Saya
            </Link>
            <button
              onClick={handleLogout}
              className="w-full border-none bg-transparent font-semibold text-sm flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer transition-all"
              style={{ color: '#DC2626' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <i className="pi pi-sign-out" style={{ fontSize: 14 }} />
              Keluar Sesi
            </button>
          </div>
        </div>
      </Sidebar>
    </nav>
  );
};

export default Navbar;
