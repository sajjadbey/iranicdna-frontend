import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Tribe } from '../../types';

interface Props {
  tribe: Tribe;
  clanCount: number;
  onClick: () => void;
}

export const TribeBox: React.FC<Props> = ({ tribe, clanCount, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 border border-teal-700/40 backdrop-blur-sm overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-transparent rounded-bl-full" />
        
        {/* Icon */}
        <div className="relative flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-lg">
            <Users className="text-white" size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-teal-100 group-hover:text-teal-50 transition-colors">
              {tribe.name}
            </h3>
            {tribe.ethnicity && (
              <p className="text-sm text-teal-400/80">{tribe.ethnicity}</p>
            )}
          </div>
          <ChevronRight className="text-teal-400 group-hover:translate-x-1 transition-transform" size={24} />
        </div>

        {/* Clan count badge */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-teal-900/40 border border-teal-700/30">
              <span className="text-sm font-semibold text-teal-200">
                {clanCount} {clanCount === 1 ? 'Clan' : 'Clans'}
              </span>
            </div>
          </div>
          
          {/* Click hint */}
          <div className="text-xs text-teal-400/60 group-hover:text-teal-400 transition-colors">
            Click for details
          </div>
        </div>

        {/* Historical note if available */}
        {tribe.historical_note && (
          <div className="relative mt-4 pt-4 border-t border-teal-700/20">
            <p className="text-sm text-teal-300/70 line-clamp-2">
              {tribe.historical_note}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};