import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { PENYAKIT_CONTENT } from '../../constants/landingContent';

const PenyakitSection: React.FC = () => {
  return (
    <section id="penyakit" className="py-6 px-4 md:px-8 surface-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-900 mb-3">Penyakit yang Dapat Dideteksi</h2>
          <div className="w-4rem h-3px bg-blue-600 mx-auto border-round"></div>
        </div>
        
        <div className="flex flex-wrap">
          {PENYAKIT_CONTENT.map((penyakit, index) => (
            <div key={index} className="col-12 md:col-6 lg:col-3">
              <Card className="h-full shadow-2 hover:shadow-5 transition-all duration-300">
                <div className="flex justify-content-between align-items-center mb-3">
                  <h3 className="text-lg font-bold text-900 m-0">{penyakit.name}</h3>
                  <Tag value={penyakit.status} severity={penyakit.severity as any} />
                </div>
                <p className="text-700 line-height-3 text-sm">
                  {penyakit.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PenyakitSection;
