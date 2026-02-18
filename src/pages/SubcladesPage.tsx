import React, { useEffect, useState, useMemo } from 'react';
import { Dna } from 'lucide-react';
import { Layout } from '../components/Layout';
import { DonutCard } from '../components/analytics/DonutCard';
import { motion } from 'framer-motion';
import { getAnimationConfig, fadeInVariants } from '../utils/deviceDetection';
import { API_ENDPOINTS } from '../config/api';

interface SubcladeData {
  subclade: string;
  total_count: number;
  ethnicities: Record<string, number>;
}

export const SubcladesPage: React.FC = () => {
  const [subcladeData, setSubcladeData] = useState<SubcladeData[]>([]);
  const [allEthnicities, setAllEthnicities] = useState<string[]>([]);
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([]);
  const [selectedHaplogroup, setSelectedHaplogroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const animConfig = getAnimationConfig();

  // Fetch all ethnicities
  useEffect(() => {
    const fetchEthnicities = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ethnicities);
        const data = await response.json();
        setAllEthnicities(data.map((e: { name: string }) => e.name).sort());
      } catch (err) {
        console.error('Failed to fetch ethnicities:', err);
      }
    };
    fetchEthnicities();
  }, []);

  // Fetch subclade distribution
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = API_ENDPOINTS.subcladeDistribution;
        const params = new URLSearchParams();
        
        selectedEthnicities.forEach(eth => params.append('ethnicity', eth));
        if (selectedHaplogroup) params.append('haplogroup', selectedHaplogroup);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        setSubcladeData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedEthnicities, selectedHaplogroup]);

  // Calculate data for donut charts
  const subcladeMap = useMemo(() => {
    return subcladeData.reduce((acc, item) => {
      acc[item.subclade] = item.total_count;
      return acc;
    }, {} as Record<string, number>);
  }, [subcladeData]);

  const ethnicityMap = useMemo(() => {
    const map: Record<string, number> = {};
    subcladeData.forEach(item => {
      Object.entries(item.ethnicities).forEach(([ethnicity, count]) => {
        map[ethnicity] = (map[ethnicity] || 0) + count;
      });
    });
    return map;
  }, [subcladeData]);

  const totalSamples = useMemo(() => {
    return Object.values(subcladeMap).reduce((sum, n) => sum + n, 0);
  }, [subcladeMap]);

  const toggleEthnicity = (ethnicity: string) => {
    setSelectedEthnicities(prev =>
      prev.includes(ethnicity)
        ? prev.filter(e => e !== ethnicity)
        : [...prev, ethnicity]
    );
  };

  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-xl text-center p-6 bg-slate-800/50 rounded-xl">
            <h2 className="text-2xl font-bold mb-2 text-red-400">Data Error</h2>
            <p className="text-sm text-teal-300">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {loading && (
        <motion.div
          {...fadeInVariants}
          transition={{ duration: animConfig.duration }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Dna className="mx-auto mb-4 text-teal-400" size={48} />
            </motion.div>
            <div className="text-lg text-teal-200">Loading subclade data...</div>
          </div>
        </motion.div>
      )}

      <motion.section
        {...fadeInVariants}
        transition={{ duration: animConfig.duration }}
        className="mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
          Haplogroup Subclades Distribution
        </h2>
        <p className="mt-3 text-teal-300/80">
          Explore Y-DNA subclade distributions by ethnicity with interactive filters.
        </p>
        {totalSamples > 0 && (
          <p className="mt-2 text-sm text-teal-400">
            Showing {totalSamples.toLocaleString()} samples across {Object.keys(subcladeMap).length} subclades
          </p>
        )}
      </motion.section>

      {/* Filters */}
      <motion.section
        {...fadeInVariants}
        transition={{ duration: animConfig.duration, delay: 0.1 }}
        className="mb-8 bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30"
      >
        <h3 className="text-xl font-bold text-teal-200 mb-4">Filters</h3>
        
        {/* Haplogroup Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-teal-300 mb-2">
            Root Haplogroup
          </label>
          <input
            type="text"
            value={selectedHaplogroup}
            onChange={(e) => setSelectedHaplogroup(e.target.value)}
            placeholder="e.g., R, J, Q (leave empty for all)"
            className="w-full px-4 py-2 bg-slate-700/50 border border-teal-700/30 rounded-lg text-teal-100 placeholder-teal-400/50 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        {/* Ethnicity Filter */}
        <div>
          <label className="block text-sm font-medium text-teal-300 mb-2">
            Ethnicities ({selectedEthnicities.length} selected)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto custom-scrollbar p-2">
            {allEthnicities.map(ethnicity => (
              <button
                key={ethnicity}
                onClick={() => toggleEthnicity(ethnicity)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedEthnicities.includes(ethnicity)
                    ? 'bg-teal-600/80 text-white border-2 border-teal-400'
                    : 'bg-slate-700/40 text-teal-200 border border-teal-700/30 hover:bg-slate-700/60'
                }`}
              >
                {ethnicity}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Donut Charts */}
      {totalSamples === 0 ? (
        <motion.div
          {...fadeInVariants}
          transition={{ duration: animConfig.duration }}
          className="rounded-2xl p-8 bg-slate-800/60 text-center border border-teal-700/30"
        >
          <Dna className="mx-auto mb-3 text-teal-500" size={48} />
          <p className="text-teal-400">
            No data available for the selected filters.
          </p>
        </motion.div>
      ) : (
        <motion.div
          {...fadeInVariants}
          transition={{ duration: animConfig.duration }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <DonutCard
            title="Y-DNA Subclades"
            dataMap={subcladeMap}
            total={totalSamples}
          />
          <DonutCard
            title="Ethnicity Distribution"
            dataMap={ethnicityMap}
            total={totalSamples}
          />
        </motion.div>
      )}
    </Layout>
  );
};
