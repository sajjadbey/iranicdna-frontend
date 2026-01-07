import React, { useEffect, useState, useMemo } from 'react';
import { X, Users, Dna, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tribe, Clan, Sample } from '../../types';
import { DonutCard } from '../analytics/DonutCard';
import { SubcladeList } from '../analytics/SubcladeList';
import { cachedFetch } from '../../utils/apiCache';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tribe: Tribe | null;
  clan: Clan | null;
  apiBase: string;
}

const countMap = (samples: Sample[], field: 'y_dna' | 'mt_dna'): Record<string, number> => {
  if (!Array.isArray(samples)) return {};
  return samples.reduce((acc: Record<string, number>, s) => {
    const v = s[field];
    if (v && v.root_haplogroup) {
      const increment = field === 'y_dna' ? s.count ?? 1 : 1;
      acc[v.root_haplogroup] = (acc[v.root_haplogroup] || 0) + increment;
    }
    return acc;
  }, {});
};

const subMap = (samples: Sample[], field: 'y_dna' | 'mt_dna'): Record<string, number> => {
  if (!Array.isArray(samples)) return {};
  return samples.reduce((acc: Record<string, number>, s) => {
    const v = s[field];
    if (v && v.name) {
      const increment = field === 'y_dna' ? s.count ?? 1 : 1;
      acc[v.name] = (acc[v.name] || 0) + increment;
    }
    return acc;
  }, {});
};

export const TribeDetailModal: React.FC<Props> = ({ isOpen, onClose, tribe, clan, apiBase }) => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || (!tribe && !clan)) {
      setSamples([]);
      setError(null);
      return;
    }

    const fetchSamples = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (clan) {
          params.append('clan', clan.name);
        } else if (tribe) {
          params.append('tribe', tribe.name);
        }
        
        const url = `${apiBase}/genetics/samples/?${params.toString()}`;
        const data = await cachedFetch<Sample[] | { results: Sample[] }>(url);
        
        // Handle both direct array and paginated response
        if (Array.isArray(data)) {
          setSamples(data);
        } else if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
          setSamples(data.results);
        } else {
          setSamples([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, [isOpen, tribe, clan, apiBase]);

  const yRoot = useMemo(() => countMap(samples, 'y_dna'), [samples]);
  const yTotal = useMemo(() => Object.values(yRoot).reduce((sum, n) => sum + n, 0), [yRoot]);

  const ySubObj = useMemo(() => subMap(samples, 'y_dna'), [samples]);
  const ySub = useMemo(
    () => Object.entries(ySubObj).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    [ySubObj]
  );

  const ySubTotal = useMemo(
    () => Object.values(ySubObj).reduce((sum, n) => sum + n, 0),
    [ySubObj]
  );

  const hasData = useMemo(() => Object.keys(yRoot).length > 0, [yRoot]);

  const title = clan ? clan.name : tribe?.name || '';
  const subtitle = clan ? `Clan of ${clan.tribe}` : 'Tribe';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-teal-700/40"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-sm border-b border-teal-700/30 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
                    <Users className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-teal-100">{title}</h2>
                    <p className="text-sm text-teal-400">{subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <X className="text-teal-300" size={24} />
                </button>
              </div>
              
              {clan?.common_ancestor && (
                <div className="mt-4 px-4 py-2 rounded-lg bg-teal-900/30 border border-teal-700/30">
                  <p className="text-sm text-teal-300">
                    <span className="font-semibold">Common Ancestor:</span> {clan.common_ancestor}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 custom-scrollbar">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-teal-400 mb-4" size={48} />
                  <p className="text-teal-300">Loading genetic data...</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl p-6 bg-red-900/20 border border-red-700/30 text-center">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {!loading && !error && !hasData && (
                <div className="rounded-xl p-8 bg-slate-800/60 text-center border border-teal-700/30">
                  <Dna className="mx-auto mb-3 text-teal-500" size={48} />
                  <p className="text-teal-400">No genetic data available for this {clan ? 'clan' : 'tribe'}.</p>
                </div>
              )}

              {!loading && !error && hasData && (
                <div className="space-y-6">
                  {/* Y-DNA Root Haplogroups */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <DonutCard title="Y-DNA Root Haplogroups" dataMap={yRoot} total={yTotal} />
                  </motion.div>

                  {/* Y-DNA Subclades */}
                  {ySub.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <SubcladeList title="Y-DNA Subclades" items={ySub} total={ySubTotal} />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};