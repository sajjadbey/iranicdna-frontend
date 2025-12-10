import React from 'react';
import { Users2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Clan } from '../../types';

interface Props {
  clan: Clan;
  index: number;
  onClick: () => void;
}

export const ClanBox: React.FC<Props> = ({ clan, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03, x: 4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      {/* Connection line to parent */}
      <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-gradient-to-r from-teal-600/40 to-teal-600/20" />
      
      {/* Main card */}
      <div className="relative bg-slate-800/60 rounded-xl p-4 border border-teal-700/30 hover:border-teal-600/50 transition-all duration-200 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-700/50 to-teal-900/50 flex items-center justify-center flex-shrink-0">
            <Users2 className="text-teal-300" size={20} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-teal-100 group-hover:text-teal-50 transition-colors truncate">
              {clan.name}
            </h4>
            {clan.common_ancestor && (
              <p className="text-xs text-teal-400/70 truncate">
                Ancestor: {clan.common_ancestor}
              </p>
            )}
          </div>
          
          {/* Info icon */}
          <Info className="text-teal-400/60 group-hover:text-teal-400 transition-colors flex-shrink-0" size={16} />
        </div>
      </div>
    </motion.div>
  );
};