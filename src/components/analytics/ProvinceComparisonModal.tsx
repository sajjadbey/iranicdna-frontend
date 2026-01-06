import React, { useState, useMemo, useEffect } from 'react';
import { X, Dna } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComparisonDonutChart } from './ComparisonDonutChart';
import { type Sample } from '../../types';
import { API_ENDPOINTS } from '../../config/api';
import { cachedFetchNormalized } from '../../utils/apiCache';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allProvinces: string[];
}

const countMap = (samples: Sample[], field: 'y_dna' | 'mt_dna'): Record<string, number> => {
  return samples.reduce((acc: Record<string, number>, s) => {
    const v = s[field];
    if (v && v.root_haplogroup) {
      const increment = field === 'y_dna' ? s.count ?? 1 : 1;
      acc[v.root_haplogroup] = (acc[v.root_haplogroup] || 0) + increment;
    }
    return acc;
  }, {});
};

export const ProvinceComparisonModal: React.FC<Props> = ({ isOpen, onClose, allProvinces }) => {
  const [province1, setProvince1] = useState<string>('');
  const [province2, setProvince2] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [samples1, setSamples1] = useState<Sample[]>([]);
  const [samples2, setSamples2] = useState<Sample[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProvince1('');
      setProvince2('');
      setShowResults(false);
      setSamples1([]);
      setSamples2([]);
    }
  }, [isOpen]);

  const handleCompare = async () => {
    if (!province1 || !province2) return;
    
    setLoading(true);
    try {
      // Fetch samples for both provinces using new API with page_size=all and has_y_dna filter
      const [data1, data2] = await Promise.all([
        cachedFetchNormalized<Sample>(
          `${API_ENDPOINTS.samples}?province=${encodeURIComponent(province1)}&page_size=all&has_y_dna=true`
        ),
        cachedFetchNormalized<Sample>(
          `${API_ENDPOINTS.samples}?province=${encodeURIComponent(province2)}&page_size=all&has_y_dna=true`
        )
      ]);

      setSamples1(data1.results);
      setSamples2(data2.results);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const yData1 = useMemo(() => countMap(samples1, 'y_dna'), [samples1]);
  const yTotal1 = useMemo(() => Object.values(yData1).reduce((sum, n) => sum + n, 0), [yData1]);

  const yData2 = useMemo(() => countMap(samples2, 'y_dna'), [samples2]);
  const yTotal2 = useMemo(() => Object.values(yData2).reduce((sum, n) => sum + n, 0), [yData2]);

  const canCompare = province1 && province2 && province1 !== province2;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-800 rounded-2xl shadow-2xl border border-teal-700/30 scrollbar-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-slate-800 border-b border-teal-700/30 p-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
              Province Comparison
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="text-teal-300" size={24} />
            </button>
          </div>

          <div className="p-6">
            {!showResults ? (
              /* Selection View */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Province 1 Selector */}
                  <div>
                    <label className="block text-sm font-medium text-teal-300 mb-2 uppercase tracking-wider">
                      PROVINCE 1
                    </label>
                    <select
                      value={province1}
                      onChange={(e) => setProvince1(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-teal-700/30 rounded-lg text-teal-100 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                    >
                      <option value="">Select first province</option>
                      {allProvinces.map((prov) => (
                        <option key={prov} value={prov} disabled={prov === province2}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Province 2 Selector */}
                  <div>
                    <label className="block text-sm font-medium text-teal-300 mb-2 uppercase tracking-wider">
                      PROVINCE 2
                    </label>
                    <select
                      value={province2}
                      onChange={(e) => setProvince2(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-teal-700/30 rounded-lg text-teal-100 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                    >
                      <option value="">Select second province</option>
                      {allProvinces.map((prov) => (
                        <option key={prov} value={prov} disabled={prov === province1}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Compare Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleCompare}
                    disabled={!canCompare || loading}
                    className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
                      canCompare && !loading
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Dna size={20} />
                        </motion.div>
                        Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Compare
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Results View */
              <div className="space-y-6">
                {/* Back Button */}
                <button
                  onClick={() => setShowResults(false)}
                  className="text-teal-300 hover:text-teal-200 transition-colors flex items-center gap-2"
                >
                  ← Back to selection
                </button>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ComparisonDonutChart 
                    title={province1} 
                    dataMap={yData1} 
                    total={yTotal1} 
                  />
                  <ComparisonDonutChart 
                    title={province2} 
                    dataMap={yData2} 
                    total={yTotal2} 
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};