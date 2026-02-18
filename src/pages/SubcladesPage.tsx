import React, { useEffect, useState, useMemo } from 'react';
import { Dna, Search } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ComparisonDonutChart } from '../components/analytics/ComparisonDonutChart';
import { motion } from 'framer-motion';
import { getAnimationConfig, fadeInVariants } from '../utils/deviceDetection';
import { API_ENDPOINTS } from '../config/api';

interface SubcladeData {
  subclade: string;
  total_count: number;
  ethnicities: Record<string, number>;
  ancient_people: {
    name: string;
    period: string;
    location: string;
    culture: string;
  } | null;
}

interface SubcladeOption {
  name: string;
  sample_count: number;
}

export const SubcladesPage: React.FC = () => {
  const [subcladeData, setSubcladeData] = useState<SubcladeData[]>([]);
  const [allSubclades, setAllSubclades] = useState<SubcladeOption[]>([]);
  const [allEthnicities, setAllEthnicities] = useState<string[]>([]);
  const [selectedSubclades, setSelectedSubclades] = useState<string[]>([]);
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([]);
  const [subcladeSearch, setSubcladeSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const animConfig = getAnimationConfig();

  // Fetch all subclades and ethnicities
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [subcladesRes, ethnicitiesRes] = await Promise.all([
          fetch(API_ENDPOINTS.subclades),
          fetch(API_ENDPOINTS.ethnicities)
        ]);
        const subcladesData = await subcladesRes.json();
        const ethnicitiesData = await ethnicitiesRes.json();
        
        setAllSubclades(subcladesData);
        setAllEthnicities(ethnicitiesData.map((e: { name: string }) => e.name).sort());
      } catch (err) {
        console.error('Failed to fetch options:', err);
      }
    };
    fetchOptions();
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
        selectedSubclades.forEach(sub => params.append('subclade', sub));
        
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
  }, [selectedEthnicities, selectedSubclades]);

  const filteredSubclades = useMemo(() => {
    return allSubclades.filter(s => 
      s.name.toLowerCase().includes(subcladeSearch.toLowerCase())
    );
  }, [allSubclades, subcladeSearch]);

  const toggleSubclade = (subclade: string) => {
    setSelectedSubclades(prev =>
      prev.includes(subclade) ? prev.filter(s => s !== subclade) : [...prev, subclade]
    );
  };

  const toggleEthnicity = (ethnicity: string) => {
    setSelectedEthnicities(prev =>
      prev.includes(ethnicity) ? prev.filter(e => e !== ethnicity) : [...prev, ethnicity]
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
      </motion.section>

      {/* Filters */}
      <motion.section
        {...fadeInVariants}
        transition={{ duration: animConfig.duration, delay: 0.1 }}
        className="mb-8 bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30"
      >
        <h3 className="text-xl font-bold text-teal-200 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subclade Filter */}
          <div>
            <label className="block text-sm font-medium text-teal-300 mb-2">
              Subclades ({selectedSubclades.length} selected)
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" size={18} />
              <input
                type="text"
                value={subcladeSearch}
                onChange={(e) => setSubcladeSearch(e.target.value)}
                placeholder="Search subclades..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-teal-700/30 rounded-lg text-teal-100 placeholder-teal-400/50 focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 bg-slate-700/30 rounded-lg">
              {filteredSubclades.map(subclade => (
                <button
                  key={subclade.name}
                  onClick={() => toggleSubclade(subclade.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1 flex justify-between items-center ${
                    selectedSubclades.includes(subclade.name)
                      ? 'bg-teal-600/80 text-white border-2 border-teal-400'
                      : 'bg-slate-700/40 text-teal-200 border border-teal-700/30 hover:bg-slate-700/60'
                  }`}
                >
                  <span>{subclade.name}</span>
                  <span className="text-xs opacity-70">({subclade.sample_count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ethnicity Filter */}
          <div>
            <label className="block text-sm font-medium text-teal-300 mb-2">
              Ethnicities ({selectedEthnicities.length} selected)
            </label>
            <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-2 bg-slate-700/30 rounded-lg">
              {allEthnicities.map(ethnicity => (
                <button
                  key={ethnicity}
                  onClick={() => toggleEthnicity(ethnicity)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1 ${
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
        </div>
      </motion.section>

      {/* Charts */}
      {subcladeData.length === 0 ? (
        <motion.div
          {...fadeInVariants}
          transition={{ duration: animConfig.duration }}
          className="rounded-2xl p-8 bg-slate-800/60 text-center border border-teal-700/30"
        >
          <Dna className="mx-auto mb-3 text-teal-500" size={48} />
          <p className="text-teal-400">
            {selectedSubclades.length === 0 && selectedEthnicities.length === 0
              ? 'Select subclades or ethnicities to view distribution'
              : 'No data available for the selected filters'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          {...fadeInVariants}
          transition={{ duration: animConfig.duration }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {subcladeData.map(data => (
            <div key={data.subclade}>
              <ComparisonDonutChart
                title={data.subclade}
                dataMap={data.ethnicities}
                total={data.total_count}
              />
              {data.ancient_people && (
                <div className="mt-2 p-3 bg-slate-700/40 rounded-lg border border-teal-700/20">
                  <div className="text-sm text-teal-300">
                    <strong className="text-teal-200">Ancient Sample:</strong> {data.ancient_people.name}
                    {data.ancient_people.period && <> • {data.ancient_people.period}</>}
                    {data.ancient_people.culture && <> • {data.ancient_people.culture}</>}
                    {data.ancient_people.location && <> • {data.ancient_people.location}</>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </Layout>
  );
};
