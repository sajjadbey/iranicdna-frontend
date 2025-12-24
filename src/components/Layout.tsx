import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { particlesBackgroundConfig, mobileParticlesBackgroundConfig } from '../config/particlesBackgroundConfig';
import { isMobileDevice, isLowEndDevice, prefersReducedMotion } from '../utils/deviceDetection';

// Lazy load particles to avoid blocking initial page load
const ParticlesBackground = lazy(() => 
  import('./ParticlesBackground').then(module => ({ default: module.ParticlesBackground }))
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showParticles, setShowParticles] = useState(true);
  
  // Determine if particles should be shown and with what config
  const { backgroundConfig, shouldShow } = useMemo(() => {
    const isMobile = isMobileDevice();
    const isLowEnd = isLowEndDevice();
    const reducedMotion = prefersReducedMotion();
    
    // Disable particles on low-end devices or if user prefers reduced motion
    const shouldShow = !isLowEnd && !reducedMotion;
    
    const config = isMobile 
      ? { ...particlesBackgroundConfig, ...mobileParticlesBackgroundConfig }
      : particlesBackgroundConfig;
    
    return { backgroundConfig: config, shouldShow };
  }, []);
  
  // Update state after mount to avoid hydration issues
  useEffect(() => {
    setShowParticles(shouldShow);
  }, [shouldShow]);

  return (
    <div className="min-h-screen text-teal-100 relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
      {/* Particles Background - Only render on capable devices, lazy loaded */}
      {showParticles && (
        <Suspense fallback={null}>
          <ParticlesBackground {...backgroundConfig} />
        </Suspense>
      )}
      
      <div className="relative z-10">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">{children}</main>
        <Footer />
      </div>
    </div>
  );
};