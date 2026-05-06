/// <reference types="vite/client" />
import React, { useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import { Sidebar } from 'primereact/sidebar';
import { IMAGE_BASE_URL } from '../api/api';
import { User } from '../types';

// Navbar updated for redesigned UI

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
    {
      label: 'Profil Saya',
      icon: 'pi pi-user',
      command: () => navigate('/profile')
    },
    {
      separator: true
    },
    {
      label: 'Keluar',
      icon: 'pi pi-sign-out',
      className: 'text-red-500',
      command: handleLogout
    }
  ];

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-th-large' },
    { label: 'Prediksi', path: '/predict', icon: 'pi pi-camera' },
    { label: 'Riwayat', path: '/history', icon: 'pi pi-history' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-[1000] shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
            <Button
              icon="pi pi-bars"
              className="p-button-text p-button-rounded text-slate-700 md:hidden p-0 w-8 h-8"
              onClick={() => setVisible(true)}
            />
            <Link to="/" className="no-underline flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <i className="pi pi-bolt text-xs"></i>
              </div>
              <span className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                AyamSehat<span className="text-blue-600 hidden sm:inline">.AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`no-underline font-semibold text-sm transition-all px-4 py-2 rounded-lg flex items-center gap-2 ${location.pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <i className={`${item.icon} text-xs`}></i>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            {user && (
              <div
                className="flex items-center gap-2.5 cursor-pointer pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                onClick={(e) => menu.current?.toggle(e)}
              >
                <div className="text-right hidden sm:block">
                  <p className="m-0 font-semibold text-slate-900 text-[13px] leading-tight">{user.nama_lengkap}</p>
                  <p className="m-0 text-slate-400 text-[10px] font-medium">Pengguna</p>
                </div>
                <Avatar
                  image={user.avatar ? `${IMAGE_BASE_URL}/${user.avatar}` : undefined}
                  label={(!user.avatar && user.nama_lengkap) ? getInitials(user.nama_lengkap) : undefined}
                  shape="circle"
                  className={!user.avatar ? 'bg-blue-100 text-blue-600 !text-sm font-bold' : 'shadow-sm border-2 border-white overflow-hidden'}
                  style={{ width: '2rem', height: '2rem' }}
                />
                <i className="pi pi-chevron-down text-slate-300 text-[10px]"></i>
                <TieredMenu model={menuItems} popup ref={menu} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Navigation */}
      <Sidebar
        visible={visible}
        onHide={() => setVisible(false)}
        className="w-[280px] p-0"
        header={
          <div className="flex items-center gap-2 pl-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <i className="pi pi-bolt text-xs"></i>
            </div>
            <span className="font-black text-slate-900">Menu Navigasi</span>
          </div>
        }
      >
        <div className="flex flex-col gap-2 p-4">
          <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <Avatar
                image={user?.avatar ? `${IMAGE_BASE_URL}/${user.avatar}` : undefined}
                label={(!user?.avatar && user?.nama_lengkap) ? getInitials(user.nama_lengkap) : undefined}
                shape="circle"
                className="bg-blue-100 text-blue-600 font-bold"
              />
              <div className="overflow-hidden">
                <p className="m-0 font-black text-slate-900 text-sm truncate">{user?.nama_lengkap}</p>
                <p className="m-0 text-slate-400 text-[10px] uppercase">{user?.username}</p>
              </div>
            </div>
          </div>

          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 mb-2">Utama</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setVisible(false)}
              className={`no-underline font-bold text-sm flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <i className={item.icon}></i>
              {item.label}
            </Link>
          ))}

          <div className="mt-8">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 mb-2">Akun</p>
            <Link
              to="/profile"
              onClick={() => setVisible(false)}
              className="no-underline font-bold text-sm flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all"
            >
              <i className="pi pi-user"></i>
              Profil Saya
            </Link>
            <button
              onClick={handleLogout}
              className="w-full border-none bg-transparent font-bold text-sm flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            >
              <i className="pi pi-sign-out"></i>
              Keluar Sesi
            </button>
          </div>
        </div>
      </Sidebar>
    </nav>
  );
};

export default Navbar;
