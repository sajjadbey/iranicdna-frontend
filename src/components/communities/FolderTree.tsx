import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Users2, Crown, Dna } from 'lucide-react';
import type { Tribe, Clan } from '../../types';

interface FolderTreeProps {
  tribes: Tribe[];
  clansByTribe: Record<string, Clan[]>;
  onTribeClick: (tribe: Tribe) => void;
  onClanClick: (clan: Clan) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  tribes,
  clansByTribe,
  onTribeClick,
  onClanClick,
}) => {
  const [expandedTribes, setExpandedTribes] = useState<Set<string>>(new Set());

  const toggleTribe = (tribeName: string) => {
    const newExpanded = new Set(expandedTribes);
    if (newExpanded.has(tribeName)) {
      newExpanded.delete(tribeName);
    } else {
      newExpanded.add(tribeName);
    }
    setExpandedTribes(newExpanded);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-slate-900/40 rounded-2xl border-2 border-teal-600/30 backdrop-blur-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900/60 to-cyan-900/60 px-6 py-4 border-b-2 border-teal-600/30">
          <div className="flex items-center gap-3">
            <Crown className="text-teal-300" size={24} />
            <h2 className="text-xl font-bold text-teal-100">
              Tribes & Clans from Iran
            </h2>
            <div className="ml-auto text-sm text-teal-300/80">
              {tribes.length} tribes, {Object.values(clansByTribe).flat().length} clans
            </div>
          </div>
        </div>

        {/* Tree Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {tribes.length === 0 ? (
            <div className="text-center py-12 text-teal-400/60">
              No tribes available
            </div>
          ) : (
            <div className="space-y-2">
              {tribes.map((tribe, index) => {
                const tribeClans = clansByTribe[tribe.name] || [];
                const isExpanded = expandedTribes.has(tribe.name);
                const hasClan = tribeClans.length > 0;

                return (
                  <motion.div
                    key={tribe.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="relative"
                  >
                    {/* Tribe Row */}
                    <div className="group">
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-teal-900/30 transition-all border border-transparent hover:border-teal-600/40">
                        {/* Tribe Icon */}
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-700/50 to-teal-900/50 flex items-center justify-center flex-shrink-0">
                          <Crown className="text-teal-300" size={18} />
                        </div>

                        {/* Expand/Collapse Icon */}
                        {hasClan && (
                          <div
                            className="w-5 h-5 flex items-center justify-center cursor-pointer flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTribe(tribe.name);
                            }}
                          >
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="text-teal-400 hover:text-teal-300" size={18} />
                            </motion.div>
                          </div>
                        )}


                        {/* Tribe Name - ONLY opens modal */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => onTribeClick(tribe)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-teal-100 group-hover:text-teal-50 transition-colors hover:underline">
                              {tribe.name}
                            </span>
                            {tribe.ethnicity && (
                              <span className="text-xs text-teal-400/70 italic">
                                ({tribe.ethnicity})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sample Count Badge */}
                        {tribe.sample_count !== undefined && tribe.sample_count > 0 && (
                          <div className="px-3 py-1 rounded-lg bg-amber-900/40 border border-amber-600/30 flex items-center gap-1.5">
                            <Dna className="text-amber-300" size={14} />
                            <span className="text-xs font-semibold text-amber-300">
                              {tribe.sample_count}
                            </span>
                          </div>
                        )}

                        {/* Clan Count Badge */}
                        {hasClan && (
                          <div className="px-3 py-1 rounded-lg bg-teal-900/40 border border-teal-600/30">
                            <span className="text-xs font-semibold text-teal-300">
                              {tribeClans.length} {tribeClans.length === 1 ? 'clan' : 'clans'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Clans List */}
                      <AnimatePresence mode="wait">
                        {isExpanded && hasClan && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ 
                              height: 'auto', 
                              opacity: 1,
                              transition: {
                                height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                                opacity: { duration: 0.3, delay: 0.1 }
                              }
                            }}
                            exit={{ 
                              height: 0, 
                              opacity: 0,
                              transition: {
                                height: { duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: 0.1 },
                                opacity: { duration: 0.2 }
                              }
                            }}
                            className="overflow-hidden"
                          >
                            <div className="ml-7 mt-1 space-y-1 border-l-2 border-teal-700/30 pl-4">
                              {tribeClans.map((clan, clanIndex) => (
                                <motion.div
                                  key={clan.name}
                                  initial={{ opacity: 0, x: 30 }}
                                  animate={{ 
                                    opacity: 1, 
                                    x: 0,
                                    transition: {
                                      delay: clanIndex * 0.08,
                                      duration: 0.4,
                                      ease: [0.4, 0, 0.2, 1]
                                    }
                                  }}
                                  exit={{ 
                                    opacity: 0, 
                                    x: 30,
                                    transition: {
                                      delay: (tribeClans.length - clanIndex - 1) * 0.05,
                                      duration: 0.3,
                                      ease: [0.4, 0, 1, 1]
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClanClick(clan);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-cyan-900/20 transition-all cursor-pointer group/clan border border-transparent hover:border-cyan-600/30"
                                >
                                  {/* Clan Icon */}
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-800/40 to-teal-800/40 flex items-center justify-center border border-cyan-600/20">
                                    <Users2 className="text-cyan-400" size={14} />
                                  </div>

                                  {/* Clan Name */}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-cyan-100 group-hover/clan:text-cyan-50 transition-colors">
                                      {clan.name}
                                    </div>
                                    {clan.common_ancestor && (
                                      <div className="text-xs text-cyan-400/60 truncate">
                                        Ancestor: {clan.common_ancestor}
                                      </div>
                                    )}
                                  </div>

                                  {/* Sample Count Badge */}
                                  {clan.sample_count !== undefined && clan.sample_count > 0 && (
                                    <div className="px-2.5 py-1 rounded-lg bg-amber-900/40 border border-amber-600/30 flex items-center gap-1.5">
                                      <Dna className="text-amber-300" size={12} />
                                      <span className="text-xs font-semibold text-amber-300">
                                        {clan.sample_count}
                                      </span>
                                    </div>
                                  )}

                                  {/* Info indicator */}
                                  <div className="text-xs text-cyan-400/40 group-hover/clan:text-cyan-400/70 transition-colors">
                                    →
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-teal-900/40 to-cyan-900/40 px-6 py-3 border-t-2 border-teal-600/30">
          <div className="flex items-center justify-between text-xs text-teal-300/70">
            <span>Click on tribes to expand/collapse clans</span>
            <span>Click on items for details</span>
          </div>
        </div>
      </div>
    </div>
  );
};