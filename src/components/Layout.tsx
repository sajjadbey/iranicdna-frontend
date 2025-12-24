import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ThemeBackground } from '../themes/theme';

/**
 * Layout Component
 * 
 * Main layout wrapper that provides:
 * - Theme-aware background animation
 * - Header and Footer
 * - Consistent page structure
 */
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen text-teal-100 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Theme-aware background - automatically switches between particles and snowfall */}
      <ThemeBackground />
      
      <div className="relative z-10">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">{children}</main>
        <Footer />
      </div>
    </div>
  );
};