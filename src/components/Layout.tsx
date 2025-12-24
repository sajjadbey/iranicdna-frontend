import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ThemeBackground } from '../themes/theme';
import { useTheme } from '../themes/theme';

/**
 * Layout Component
 * 
 * Main layout wrapper that provides:
 * - Theme-aware background animation
 * - Header and Footer
 * - Consistent page structure
 */
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeConfig } = useTheme();

  return (
    <div className="min-h-screen text-teal-100 relative">
      {/* Theme indicator for debugging */}
      <div className="fixed top-2 left-2 z-[9999] bg-black/80 text-white px-3 py-1 rounded text-xs">
        Theme: {themeConfig.name}
      </div>

      {/* Theme-aware background - automatically switches between particles and snowfall */}
      <ThemeBackground />
      
      <div className="relative" style={{ zIndex: 10 }}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">{children}</main>
        <Footer />
      </div>
    </div>
  );
};