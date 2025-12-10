import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 py-6 relative z-0">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-teal-400">
          © {new Date().getFullYear()} <span className="font-bold">Iranic DNA</span> — Preserving genetic identity
        </p>
        <div className="flex items-center gap-2 text-sm text-teal-400">
          <p>
            Designed by{' '}
            <a
              href="https://qizilbash.ir"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline"
            >
              Qızılbaş
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};