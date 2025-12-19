import React, { useMemo } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { DNABackground } from './DNABackground';
import { dnaBackgroundConfig, mobileDnaBackgroundConfig } from '../config/dnaBackgroundConfig';
import { isMobileDevice } from '../utils/deviceDetection';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Merge mobile config on mobile devices
  const backgroundConfig = useMemo(() => {
    const isMobile = isMobileDevice();
    return isMobile 
      ? { ...dnaBackgroundConfig, ...mobileDnaBackgroundConfig }
      : dnaBackgroundConfig;
  }, []);

  return (
    <div className="min-h-screen text-teal-100 relative overflow-hidden bg-slate-900">
      {/* 3D DNA Background */}
      <DNABackground {...backgroundConfig} />
      
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">{children}</main>
      <Footer />
    </div>
  );
};