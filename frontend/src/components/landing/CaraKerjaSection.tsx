import React from 'react';
import { CARA_KERJA_CONTENT } from '../../constants/landingContent';

const CaraKerjaSection: React.FC = () => {
  return (
    <section id="cara-kerja" className="py-6 px-4 md:px-8 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-900 mb-3">Cara Penggunaan</h2>
          <div className="w-4rem h-3px bg-blue-600 mx-auto border-round"></div>
        </div>
        
        <div className="flex flex-wrap mt-6">
          {CARA_KERJA_CONTENT.map((step, index) => (
            <div key={index} className="col-12 md:col-3 relative">
              <div className="flex flex-column align-items-center text-center px-3">
                <div className="w-4rem h-4rem bg-blue-600 text-white border-circle flex align-items-center justify-content-center text-2xl font-bold mb-4 z-1">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-900 mb-3">{step.title}</h3>
                <p className="text-700 line-height-3">{step.description}</p>
              </div>
              {index < CARA_KERJA_CONTENT.length - 1 && (
                <div className="hidden md:block absolute top-2rem left-full w-full h-2px bg-blue-100 -ml-2rem -z-1"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaraKerjaSection;
