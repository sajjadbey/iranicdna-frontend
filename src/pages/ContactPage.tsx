import React from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Send, Users } from 'lucide-react';
import { Layout } from '../components/Layout';

export const ContactPage: React.FC = () => {

  return (
    <Layout>
      <div className="min-h-screen py-16 px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto mb-16"
        >

          {/* Title Section */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            >
              Contact <span className="text-amber-400">Us</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
            >
              Have questions or feedback? We'd love to hear from you.
            </motion.p>
          </div>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Admin Contacts Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--color-card)]/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6"
          >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Send className="w-6 h-6 text-teal-400" />
                Contact Team on Telegram
              </h3>
              
              <div className="space-y-4">
                {/* Admins */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Admins</h4>
                  <div className="space-y-2">
                    <a
                      href="https://t.me/Nalwd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-800 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Ermia</p>
                        <p className="text-sm text-gray-400">@Nalwd</p>
                      </div>
                      <Send className="w-4 h-4 text-gray-400 group-hover:text-teal-400 transition-colors" />
                    </a>
                    
                    <a
                      href="https://t.me/Arta_imani"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-800 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Arta</p>
                        <p className="text-sm text-gray-400">@Arta_imani</p>
                      </div>
                      <Send className="w-4 h-4 text-gray-400 group-hover:text-teal-400 transition-colors" />
                    </a>
                  </div>
                </div>
                
                {/* Developer */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Developer</h4>
                  <a
                    href="https://t.me/eternal_qizilbash"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Sajjad</p>
                      <p className="text-sm text-gray-400">@eternal_qizilbash</p>
                    </div>
                    <Send className="w-4 h-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
                  </a>
                </div>
              </div>
          </motion.div>

          {/* Community Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--color-card)]/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6"
          >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-400" />
                Join Our Community
              </h3>
              <p className="text-gray-300 mb-4">
                Connect with other members of the IranicDNA community on Telegram for discussions, updates, and support.
              </p>
              <a
                href="https://t.me/Iranic_DNA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium transition-all hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
                Join Telegram Group
              </a>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--color-card)]/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6"
          >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-amber-400" />
                Get in Touch
              </h3>
              <div className="space-y-3 text-gray-300">
                <p>
                  Whether you have questions about your genetic analysis, need technical support, or want to contribute to our research, we're here to help.
                </p>
                <p>
                  Our team typically responds within 24-48 hours during business days.
                </p>
              </div>
          </motion.div>

          {/* FAQ Link Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-md rounded-2xl shadow-xl border border-purple-500/20 p-6"
          >
              <h3 className="text-xl font-bold text-white mb-2">
                Looking for Answers?
              </h3>
              <p className="text-gray-300 mb-4">
                Check out our blog for articles, guides, and frequently asked questions.
              </p>
              <a
                href="/blog"
                className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 font-medium transition-colors"
              >
                Visit Blog
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};