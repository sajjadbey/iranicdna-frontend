import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen text-teal-100 relative overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          background: `radial-gradient(circle at 20% 30%, #004d40 0%, #001f1f 100%)`,
        }}
      />
      
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">{children}</main>
      <Footer />
    </div>
  );
};