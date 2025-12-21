import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dna, Info, Send, BarChart3, Users, BookOpen, Menu, X, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mainLogo from '../assets/logo.png';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isActive = (path: string) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-gradient-to-r from-teal-900/90 to-amber-800/90 text-slate-50 shadow-sm backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 md:gap-3 hover:opacity-90 transition-opacity"
            onClick={closeMobileMenu}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-md bg-white/10 flex items-center justify-center ring-1 ring-white/20">
              <img src={mainLogo} className="h-10 w-10 md:h-12 md:w-12 object-contain" alt="IranicDNA" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight flex items-center gap-1">
                Iranic<span className="text-amber-300">DNA</span>
              </h1>
              <p className="text-[0.6rem] md:text-[0.65rem] text-teal-200/80 mt-0.5 flex items-center gap-1">
                <Dna size={10} /> Y-DNA & mtDNA by Province
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            <Link
              to="/analytics"
              className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/analytics')
                  ? 'bg-white/10 text-white'
                  : 'text-teal-100/90 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 size={14} /> Analytics
            </Link>
            <Link
              to="/communities"
              className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/communities')
                  ? 'bg-white/10 text-white'
                  : 'text-teal-100/90 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users size={14} /> Communities
            </Link>
            <Link
              to="/blog"
              className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/blog') || location.pathname.startsWith('/blog/')
                  ? 'bg-white/10 text-white'
                  : 'text-teal-100/90 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen size={14} /> Blog
            </Link>
            <Link
              to="/vcf-analysis"
              className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/vcf-analysis')
                  ? 'bg-white/10 text-white'
                  : 'text-teal-100/90 hover:text-white hover:bg-white/5'
              }`}
            >
              <FlaskConical size={14} /> Admixture
            </Link>
            <a
              href="#about"
              className="text-sm font-medium text-teal-100/90 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              onClick={scrollToAbout}
            >
              <Info size={14} /> About
            </a>
            <a
              href="https://t.me/Iranic_DNA "
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-teal-100/90 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Send size={14} /> Join
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-teal-100" />
            ) : (
              <Menu size={24} className="text-teal-100" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.25
              }}
              className="md:hidden overflow-hidden"
            >
              <motion.div 
                className="pt-4 pb-2 space-y-2"
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: {
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.1
                    }
                  },
                  closed: {
                    transition: {
                      staggerChildren: 0.06,
                      staggerDirection: -1,
                      delayChildren: 0
                    }
                  }
                }}
              >
                <motion.div
                  variants={{
                    open: { x: 0, opacity: 1 },
                    closed: { x: -100, opacity: 0 }
                  }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Link
                    to="/analytics"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive('/analytics')
                        ? 'bg-white/10 text-white'
                        : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <BarChart3 size={18} />
                    <span className="font-medium">Analytics</span>
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    open: { x: 0, opacity: 1 },
                    closed: { x: -100, opacity: 0 }
                  }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Link
                    to="/communities"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive('/communities')
                        ? 'bg-white/10 text-white'
                        : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Users size={18} />
                    <span className="font-medium">Communities</span>
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    open: { x: 0, opacity: 1 },
                    closed: { x: -100, opacity: 0 }
                  }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Link
                    to="/blog"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive('/blog') || location.pathname.startsWith('/blog/')
                        ? 'bg-white/10 text-white'
                        : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <BookOpen size={18} />
                    <span className="font-medium">Blog</span>
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    open: { x: 0, opacity: 1 },
                    closed: { x: -100, opacity: 0 }
                  }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Link
                    to="/vcf-analysis"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive('/vcf-analysis')
                        ? 'bg-white/10 text-white'
                        : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FlaskConical size={18} />
                    <span className="font-medium">Admixture</span>
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    open: { x: 0, opacity: 1 },
                    closed: { x: -100, opacity: 0 }
                  }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <a
                    href="#about"
                    onClick={scrollToAbout}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-teal-100/90 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Info size={18} />
                    <span className="font-medium">About</span>
                  </a>
                </motion.div>
                <motion.div
                  variants={{
                    open: { x: 0, opacity: 1 },
                    closed: { x: -100, opacity: 0 }
                  }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <a
                    href="https://t.me/Iranic_DNA "
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-teal-100/90 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Send size={18} />
                    <span className="font-medium">Join</span>
                  </a>
                </motion.div>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};