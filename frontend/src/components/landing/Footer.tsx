import React from 'react';
import { Divider } from 'primereact/divider';
import { NAVBAR_CONTENT, FOOTER_CONTENT } from '../../constants/landingContent';

const Footer: React.FC = () => {
  return (
    <footer id="tentang" className="py-6 px-4 md:px-8 bg-gray-900 text-white">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-wrap -mx-4">
          <div className="col-12 md:col-4 px-4 mb-4 md:mb-0 text-left">
            <div className="flex align-items-center gap-2 mb-3">
              <i className="pi pi-shield text-blue-400 text-xl font-bold"></i>
              <span className="text-xl font-bold text-white">{NAVBAR_CONTENT.logo}</span>
            </div>
            <p className="text-gray-400 line-height-3 pr-4 text-sm">
              {FOOTER_CONTENT.description}
            </p>
          </div>
          
          <div className="col-12 md:col-4 px-4 mb-4 md:mb-0 text-left">
            <h4 className="text-lg font-bold mb-3 text-white">Tautan Cepat</h4>
            <ul className="list-none p-0 m-0">
              {NAVBAR_CONTENT.menu.map((item) => (
                <li key={item.label} className="mb-1">
                  <a 
                    href={item.target} 
                    className="text-gray-400 hover:text-white no-underline transition-colors block py-1 text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(item.target)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 md:col-4 px-4 text-left">
            <h4 className="text-lg font-bold mb-3 text-white">Kontak & Informasi</h4>
            <p className="text-gray-400 line-height-3 text-sm">
              {FOOTER_CONTENT.university}
            </p>
            <div className="flex gap-4 mt-3">
              <i className="pi pi-facebook text-xl text-gray-400 hover:text-white cursor-pointer transition-colors"></i>
              <i className="pi pi-instagram text-xl text-gray-400 hover:text-white cursor-pointer transition-colors"></i>
              <i className="pi pi-github text-xl text-gray-400 hover:text-white cursor-pointer transition-colors"></i>
            </div>
          </div>
        </div>
        
        <Divider className="bg-gray-700 my-4" />
        
        <div className="text-center text-gray-500 text-xs">
          {FOOTER_CONTENT.copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
