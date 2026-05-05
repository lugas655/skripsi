import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-6 px-4 md:px-8 bg-blue-600 text-white text-center">
      <div className="container mx-auto max-w-30rem">
        <h2 className="text-4xl font-bold mb-4 text-white">Siap Melindungi Ternak Anda?</h2>
        <p className="text-xl text-blue-100 mb-6 line-height-3">
          Bergabung sekarang dan mulai deteksi penyakit ayam secara otomatis dengan teknologi AI tercanggih.
        </p>
        <Button 
          label="Daftar Gratis Sekarang" 
          className="p-button-lg p-button-secondary px-6 font-bold" 
          onClick={() => navigate('/register')} 
        />
      </div>
    </section>
  );
};

export default CTASection;
