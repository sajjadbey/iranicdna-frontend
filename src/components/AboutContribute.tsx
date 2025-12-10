import React from 'react';
import { Globe, Send, ExternalLink, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export const AboutContribute: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      id="about"
      className="mt-16 pt-8 border-t border-teal-800/40"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-800/40 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-teal-200 mb-3 flex items-center gap-2">
            <Info size={20} /> About This Project
          </h3>
          <p className="text-teal-300/90">
            Iranic DNA is a community-driven initiative to map the genetic diversity of Iranian peoples.
          </p>
          <ul className="mt-3 text-teal-300/80 list-disc pl-5 space-y-1">
            <li>Visualize root haplogroups and detailed subclades</li>
            <li>Filter by province (e.g., East Azerbaijan, Tehran, etc.)</li>
            <li>Contribute your anonymized haplogroup data</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-amber-900/30 to-teal-900/30 p-6 rounded-2xl border border-amber-600/30">
          <h4 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
            <Globe size={18} /> Contribute
          </h4>
          <p className="text-teal-200 text-sm mb-4">
            Help expand our database by sharing your haplogroup results.
          </p>
          <a
            href="https://t.me/Iranic_DNA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-teal-800 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
          >
            <Send size={14} /> Join Telegram Group
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </motion.section>
  );
};