import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import FiturSection from '../components/landing/FiturSection';
import CaraKerjaSection from '../components/landing/CaraKerjaSection';
import PenyakitSection from '../components/landing/PenyakitSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';
import { Divider } from 'primereact/divider';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <Divider className="m-0" />
      <FiturSection />
      <Divider className="m-0" />
      <CaraKerjaSection />
      <Divider className="m-0" />
      <PenyakitSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
