import React, { useMemo } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ParticlesBackground } from './ParticlesBackground';
import { particlesBackgroundConfig, mobileParticlesBackgroundConfig } from '../config/particlesBackgroundConfig';
import { isMobileDevice } from '../utils/deviceDetection';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Merge mobile config on mobile devices
  const backgroundConfig = useMemo(() => {
    const isMobile = isMobileDevice();
    return isMobile 
      ? { ...particlesBackgroundConfig, ...mobileParticlesBackgroundConfig }
      : particlesBackgroundConfig;
  }, []);

  return (
    <div className="min-h-screen text-teal-100 relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
      {/* Particles Background */}
      <ParticlesBackground {...backgroundConfig} />
      
      <div className="relative z-10">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">{children}</main>
        <Footer />
      </div>
    </div>
  );
};