import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dna, Info, Mail, BarChart3, Users, BookOpen, Menu, X, Wrench, User, LogOut, Activity, Coffee, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mainLogo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isActive = (path: string) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-gradient-to-r from-teal-900/90 to-amber-800/90 text-slate-50 shadow-sm backdrop-blur-md sticky top-0 z-[100]">
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
                <Dna size={10} /> Y-DNA by Province
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
              to="/#"
              className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/ydna-tree')
                  ? 'bg-white/10 text-white'
                  : 'text-teal-100/90 hover:text-white hover:bg-white/5'
              }`}
            >
              <GitBranch size={14} /> Y-DNA Tree
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
              to="/tools"
              className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/tools') || location.pathname.startsWith('/tools/')
                  ? 'bg-white/10 text-white'
                  : 'text-teal-100/90 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wrench size={14} /> Tools
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/contact')
                  ? 'bg-white/10 text-white'
                  : 'text-teal-100/90 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail size={14} /> Contact Us
            </Link>
            
            {/* Ko-fi Donate Link */}
            <a
              href="https://ko-fi.com/iranicdna"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Support us on Ko-fi"
            >
              <Coffee size={14} /> Donate
            </a>
            
            {/* Auth Links */}
            {isAuthenticated ? (
              <>
                {/* Admin Insights Link - Only for staff/superuser */}
                {(user?.is_staff || user?.is_superuser) && (
                  <Link
                    to="/admin/insights"
                    className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/admin/insights')
                        ? 'bg-white/10 text-white'
                        : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Activity size={14} /> Insights
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive('/profile')
                      ? 'bg-white/10 text-white'
                      : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User size={14} /> {user?.username || 'Profile'}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-teal-100/90 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className="text-sm font-medium bg-[var(--color-accent)] hover:bg-amber-600 text-white flex items-center gap-1 px-4 py-1.5 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
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
                    to="/ydna-tree"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive('/ydna-tree')
                        ? 'bg-white/10 text-white'
                        : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <GitBranch size={18} />
                    <span className="font-medium">Y-DNA Tree</span>
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
                    to="/tools"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive('/tools') || location.pathname.startsWith('/tools/')
                        ? 'bg-white/10 text-white'
                        : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Wrench size={18} />
                    <span className="font-medium">Tools</span>
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
                  <Link
                    to="/contact"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive('/contact')
                        ? 'bg-white/10 text-white'
                        : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Mail size={18} />
                    <span className="font-medium">Contact Us</span>
                  </Link>
                </motion.div>
                
                {/* Ko-fi Donate Link - Mobile */}
                <motion.div
                  variants={{
                    open: { x: 0, opacity: 1 },
                    closed: { x: -100, opacity: 0 }
                  }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <a
                    href="https://ko-fi.com/dummy"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-white/5 transition-colors"
                  >
                    <Coffee size={18} />
                    <span className="font-medium">Donate</span>
                  </a>
                </motion.div>
                
                {/* Mobile Auth Links */}
                {isAuthenticated ? (
                  <>
                    {/* Admin Insights Link - Mobile */}
                    {(user?.is_staff || user?.is_superuser) && (
                      <motion.div
                        variants={{
                          open: { x: 0, opacity: 1 },
                          closed: { x: -100, opacity: 0 }
                        }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <Link
                          to="/admin/insights"
                          onClick={closeMobileMenu}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                            isActive('/admin/insights')
                              ? 'bg-white/10 text-white'
                              : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Activity size={18} />
                          <span className="font-medium">Insights</span>
                        </Link>
                      </motion.div>
                    )}
                    <motion.div
                      variants={{
                        open: { x: 0, opacity: 1 },
                        closed: { x: -100, opacity: 0 }
                      }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <Link
                        to="/profile"
                        onClick={closeMobileMenu}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                          isActive('/profile')
                            ? 'bg-white/10 text-white'
                            : 'text-teal-100/90 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <User size={18} />
                        <span className="font-medium">{user?.username || 'Profile'}</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      variants={{
                        open: { x: 0, opacity: 1 },
                        closed: { x: -100, opacity: 0 }
                      }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <button
                        onClick={() => {
                          logout();
                          closeMobileMenu();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-teal-100/90 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    variants={{
                      open: { x: 0, opacity: 1 },
                      closed: { x: -100, opacity: 0 }
                    }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <Link
                      to="/signin"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-amber-600 text-white transition-colors"
                    >
                      <User size={18} />
                      <span className="font-medium">Sign In</span>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};