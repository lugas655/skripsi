import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  illustrationImage?: string;
  quote?: string;
  author?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  illustrationImage = "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800",
  quote = "Kesehatan unggas Anda adalah prioritas utama. Deteksi dini dengan AI menyelamatkan aset peternakan Anda.",
  author = "AyamSehat.AI Vision"
}) => {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-blue-200">
      {/* Left Side: Branding & Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-12">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={illustrationImage} 
            alt="Auth Background" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/10"></div>
          
          {/* Decorative blur circles */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
        </div>

        {/* Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="pi pi-bolt text-xl"></i>
          </div>
          <Link to="/" className="text-2xl font-black tracking-tight text-white no-underline">
            AyamSehat<span className="text-blue-500">.AI</span>
          </Link>
        </div>

        {/* Motivational Text / Quote */}
        <div className="relative z-10 max-w-lg mb-8">
          <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl">
            <i className="pi pi-quote-left text-blue-400 text-3xl mb-4 opacity-50"></i>
            <p className="text-2xl text-slate-100 font-medium leading-relaxed mb-6">
              "{quote}"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                <i className="pi pi-microchip-ai"></i>
              </div>
              <span className="font-bold text-slate-300">{author}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <i className="pi pi-bolt text-sm"></i>
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">
            AyamSehat<span className="text-blue-600">.AI</span>
          </span>
        </div>

        {/* Back button */}
        <Link to="/" className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-2 text-sm font-medium no-underline">
          <i className="pi pi-arrow-left"></i>
          <span className="hidden sm:inline">Kembali</span>
        </Link>

        {/* Form Container */}
        <div className="w-full max-w-md mt-12 lg:mt-0 animate-fade-in-up">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              {title}
            </h1>
            <p className="text-slate-500 font-medium">
              {subtitle}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
