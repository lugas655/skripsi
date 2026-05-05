import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { HERO_CONTENT } from '../../constants/landingContent';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="beranda" className="min-h-screen flex align-items-center pt-6 px-4 md:px-8 bg-blue-50">
      <div className="flex flex-wrap container mx-auto max-w-7xl">
        <div className="col-12 lg:col-6 flex flex-column justify-content-center text-center lg:text-left">
          <h1 className="text-5xl md:text-7xl font-bold text-900 mb-4 line-height-2">
            {HERO_CONTENT.headline}
          </h1>
          <p className="text-xl text-700 mb-6 line-height-3 max-w-30rem">
            {HERO_CONTENT.subHeadline}
          </p>
          <div className="flex flex-column sm:flex-row gap-3 justify-content-center lg:justify-content-start">
            <Button 
              label={localStorage.getItem('token') ? "Ke Dashboard" : "Coba Sekarang"} 
              icon="pi pi-bolt" 
              className="p-button-lg px-6" 
              onClick={() => navigate(localStorage.getItem('token') ? '/dashboard' : '/register')} 
            />
            <Button 
              label="Pelajari Lebih Lanjut" 
              outlined 
              className="p-button-lg px-6" 
              onClick={() => document.querySelector('#fitur')?.scrollIntoView({ behavior: 'smooth' })} 
            />
          </div>
        </div>
        <div className="col-12 lg:col-6 flex align-items-center justify-content-center mt-6 lg:mt-0">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-full bg-blue-200 border-circle opacity-50 filter blur-3xl -z-1"></div>
            <img 
              src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800" 
              alt="Chicken Health Illustration" 
              className="w-full max-w-30rem border-round-3xl shadow-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
