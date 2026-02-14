import React from 'react';
import { X, Dna, Calendar, Users, Microscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { YDNATreeNode } from '../../services/graphqlService';

interface HaplogroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: YDNATreeNode | null;
}

export const HaplogroupDetailModal: React.FC<HaplogroupDetailModalProps> = ({
  isOpen,
  onClose,
  node,
}) => {
  if (!node) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-[201]"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border-2 border-teal-600/30 h-full md:h-auto max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-teal-700/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-900/40 border border-teal-600/30">
                    <Dna className="text-teal-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-teal-200">{node.name}</h3>
                    <p className="text-sm text-teal-400/70">Y-DNA Haplogroup Details</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <X className="text-teal-400" size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hidden">
                {/* Nomenclature Section */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-teal-300 flex items-center gap-2">
                    <Dna size={18} />
                    Nomenclature
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-slate-800/60 border border-teal-700/20">
                      <div className="text-xs text-teal-400/70 mb-1">Standard Name</div>
                      <div className="text-teal-200 font-semibold">{node.name}</div>
                    </div>
                    
                    {node.isoggyghg && node.isoggyghg !== node.name && (
                      <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700/30">
                        <div className="text-xs text-blue-400/70 mb-1">ISOGG Y-HG</div>
                        <div className="text-blue-200 font-semibold">{node.isoggyghg}</div>
                      </div>
                    )}
                    
                    {node.yfullHg && node.yfullHg !== node.name && (
                      <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/30">
                        <div className="text-xs text-purple-400/70 mb-1">YFull HG</div>
                        <div className="text-purple-200 font-semibold">{node.yfullHg}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* TMRCA Section */}
                {node.tmrca && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-teal-300 flex items-center gap-2">
                      <Calendar size={18} />
                      Time Depth
                    </h4>
                    <div className="p-4 rounded-lg bg-slate-800/60 border border-teal-700/20">
                      <div className="text-xs text-teal-400/70 mb-1">
                        TMRCA (Time to Most Recent Common Ancestor)
                      </div>
                      <div className="text-2xl font-bold text-teal-200">
                        ~{node.tmrca.toLocaleString()} years
                      </div>
                      <div className="text-xs text-teal-400/70 mt-1">before present</div>
                    </div>
                  </div>
                )}

                {/* Sample Count Section */}
                {node.sampleCount > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-teal-300 flex items-center gap-2">
                      <Users size={18} />
                      Modern Samples
                    </h4>
                    <div className="p-4 rounded-lg bg-slate-800/60 border border-teal-700/20">
                      <div className="text-2xl font-bold text-teal-200">
                        {node.sampleCount}
                      </div>
                      <div className="text-xs text-teal-400/70 mt-1">
                        samples in database
                      </div>
                    </div>
                  </div>
                )}

                {/* Ancient DNA Section */}
                {node.paleoSamples && node.paleoSamples.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-teal-300 flex items-center gap-2">
                      <Microscope size={18} />
                      Ancient DNA Samples
                    </h4>
                    <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-700/30">
                      <div className="text-xs text-amber-400/70 mb-2">
                        {node.paleoSamples.length} ancient sample{node.paleoSamples.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {node.paleoSamples.map((sample, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-amber-900/40 text-amber-200 text-sm border border-amber-700/30"
                          >
                            {sample}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Subclades Section */}
                {node.children && node.children.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-teal-300 flex items-center gap-2">
                      <Dna size={18} />
                      Subclades
                    </h4>
                    <div className="p-4 rounded-lg bg-slate-800/60 border border-teal-700/20">
                      <div className="text-xs text-teal-400/70 mb-2">
                        {node.children.length} direct subclade{node.children.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {node.children.map((child) => (
                          <span
                            key={child.id}
                            className="px-3 py-1 rounded-full bg-teal-900/40 text-teal-200 text-sm border border-teal-700/30"
                          >
                            {child.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* External Links */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-teal-300">External Resources</h4>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`https://isogg.org/tree/ISOGG_YDNATreeTrunk.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-blue-900/40 text-blue-200 border border-blue-700/30 hover:bg-blue-800/50 transition-colors text-sm"
                    >
                      ISOGG Tree
                    </a>
                    <a
                      href={`https://www.yfull.com/tree/${node.name}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-purple-900/40 text-purple-200 border border-purple-700/30 hover:bg-purple-800/50 transition-colors text-sm"
                    >
                      YFull Tree
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-teal-700/30">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 rounded-lg bg-teal-900/40 text-teal-200 border border-teal-600/30 hover:bg-teal-800/50 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
