import React from 'react';
import { Card } from 'primereact/card';
import { STATS_CONTENT } from '../../constants/landingContent';

const StatsSection: React.FC = () => {
  return (
    <section className="py-6 px-4 md:px-8 bg-white">
      <div className="flex flex-wrap container mx-auto justify-content-center max-w-7xl">
        {STATS_CONTENT.map((stat, index) => (
          <div key={index} className="col-12 md:col-4">
            <Card className="text-center shadow-2 hover:shadow-5 transition-all duration-300 border-none border-top-3 border-blue-600">
              <h2 className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</h2>
              <p className="text-700 font-medium">{stat.label}</p>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
