import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { NAVBAR_CONTENT } from '../../constants/landingContent';

const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-3 flex align-items-center justify-content-between ${isScrolled ? 'bg-white shadow-3' : 'bg-transparent'}`}>
      <div className="flex align-items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="pi pi-shield text-blue-600 text-2xl font-bold"></i>
        <span className="text-xl font-bold text-900">{NAVBAR_CONTENT.logo}</span>
      </div>

      <div className="hidden lg:flex align-items-center gap-6">
        {NAVBAR_CONTENT.menu.map((item) => (
          <button
            key={item.label}
            onClick={() => scrollToSection(item.target)}
            className="text-700 font-medium hover:text-blue-600 border-none bg-transparent cursor-pointer transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex align-items-center gap-3">
        <Button 
          label={isLoggedIn ? "Dashboard" : "Mulai Sekarang"} 
          outlined 
          className="p-button-sm border-blue-600 text-blue-600" 
          onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')} 
        />
      </div>
    </nav>
  );
};

export default LandingNavbar;
