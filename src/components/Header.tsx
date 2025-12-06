import React from 'react';
import { Link } from 'react-router-dom';
import { Dna, Info, Send } from 'lucide-react';
import mainLogo from '../assets/logo.png';

export const Header: React.FC = () => {
  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="bg-gradient-to-r from-teal-900/90 to-amber-800/90 text-slate-50 shadow-sm backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <img src={mainLogo} className="h-12 w-12 object-contain" alt="IranicDNA" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-1">
              Iranic<span className="text-amber-300">DNA</span>
            </h1>
            <p className="text-[0.65rem] text-teal-200/80 mt-0.5 flex items-center gap-1">
              <Dna size={10} /> Y-DNA & mtDNA by Province
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
          <a
            href="#about"
            className="text-sm font-medium text-teal-100/90 hover:text-white flex items-center gap-1"
            onClick={scrollToAbout}
          >
            <Info size={14} /> About
          </a>
          <a
            href="https://t.me/Iranic_DNA "
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-teal-100/90 hover:text-white flex items-center gap-1"
          >
            <Send size={14} /> Join
          </a>
        </nav>
      </div>
    </header>
  );
};