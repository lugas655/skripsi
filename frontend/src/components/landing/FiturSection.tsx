import React from 'react';
import { Card } from 'primereact/card';
import { FITUR_CONTENT } from '../../constants/landingContent';

const FiturSection: React.FC = () => {
  return (
    <section id="fitur" className="py-6 px-4 md:px-8 surface-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-900 mb-3">Mengapa Menggunakan Sistem Ini?</h2>
          <div className="w-4rem h-3px bg-blue-600 mx-auto border-round"></div>
        </div>
        <div className="flex flex-wrap">
          {FITUR_CONTENT.map((fitur, index) => (
            <div key={index} className="col-12 md:col-4">
              <Card className="h-full shadow-2 hover:surface-100 transition-colors duration-300">
                <div className="w-4rem h-4rem bg-blue-100 border-circle flex align-items-center justify-content-center mb-4">
                  <i className={`${fitur.icon} text-2xl text-blue-600`}></i>
                </div>
                <h3 className="text-xl font-bold text-900 mb-3">{fitur.title}</h3>
                <p className="text-700 line-height-3">{fitur.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FiturSection;
