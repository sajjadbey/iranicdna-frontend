import React, { useEffect, useState, useMemo } from 'react';
import { Dna } from 'lucide-react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { getAnimationConfig, fadeInVariants } from '../utils/deviceDetection';
import { API_ENDPOINTS } from '../config/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fmt, generateUniqueColors } from '../utils/colors';
import { shouldReduceAnimations } from '../utils/deviceDetection';

interface SubcladeItem {
  subclade: string;
  count: number;
  ethnicity: string;
}

export const SubcladesPage: React.FC = () => {
  const [subcladeData, setSubcladeData] = useState<SubcladeItem[]>([]);
  const [allHaplogroups, setAllHaplogroups] = useState<string[]>([]);
  const [allEthnicities, setAllEthnicities] = useState<string[]>([]);
  const [selectedHaplogroup, setSelectedHaplogroup] = useState<string>('');
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFiltered, setHasFiltered] = useState(false);

  const animConfig = getAnimationConfig();
  const reduceAnimations = shouldReduceAnimations();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [haplogroupsRes, ethnicitiesRes] = await Promise.all([
          fetch(API_ENDPOINTS.subclades),
          fetch(API_ENDPOINTS.ethnicities)
        ]);
        const haplogroupsData = await haplogroupsRes.json();
        const ethnicitiesData = await ethnicitiesRes.json();
        
        setAllHaplogroups(haplogroupsData);
        setAllEthnicities(ethnicitiesData.map((e: { name: string }) => e.name).sort());
      } catch (err) {
        console.error('Failed to fetch options:', err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (!selectedHaplogroup && selectedEthnicities.length === 0) {
      setSubcladeData([]);
      setHasFiltered(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setHasFiltered(true);
      
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

  const chartData = useMemo(() => {
    return subcladeData.map(item => ({
      name: `${item.subclade} : ${item.count} : ${item.ethnicity}`,
      value: item.count,
      ethnicity: item.ethnicity,
      subclade: item.subclade
    }));
  }, [subcladeData]);

  const colorMap = useMemo(() => {
    const ethnicities = [...new Set(subcladeData.map(d => d.ethnicity))];
    return generateUniqueColors(ethnicities);
  }, [subcladeData]);

  const totalSamples = useMemo(() => {
    return subcladeData.reduce((sum, item) => sum + item.count, 0);
  }, [subcladeData]);

  const toggleEthnicity = (ethnicity: string) => {
    setSelectedEthnicities(prev =>
      prev.includes(ethnicity) ? prev.filter(e => e !== ethnicity) : [...prev, ethnicity]
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-700/95 border border-teal-500/50 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-teal-100 font-bold text-base">{data.subclade}</p>
          <p className="text-teal-300 text-sm">
            {fmt(data.value)} samples - {data.ethnicity}
          </p>
        </div>
      );
    }
    return null;
  };

  const labelPositions = useMemo(() => {
    const visibleLabels = chartData.filter(item => (item.value / totalSamples) * 100 >= 3.6);
    
    return visibleLabels.map(item => {
      const index = chartData.findIndex(d => d.name === item.name);
      let cumulativeValue = 0;
      for (let i = 0; i < index; i++) {
        cumulativeValue += chartData[i].value;
      }
      const midValue = cumulativeValue + chartData[index].value / 2;
      const angleRadians = (midValue / totalSamples) * 2 * Math.PI;
      const adjustedAngle = Math.PI / 2 - angleRadians;
      const radiusPercent = 25;
      
      return { item, angle: adjustedAngle, radiusPercent };
    });
  }, [chartData, totalSamples]);

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
          Explore Y-DNA subclade distributions by ethnicity and root haplogroup.
        </p>
      </motion.section>

      <motion.section
        {...fadeInVariants}
        transition={{ duration: animConfig.duration, delay: 0.1 }}
        className="mb-8 bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30"
      >
        <h3 className="text-xl font-bold text-teal-200 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-teal-300 mb-2">
              Root Haplogroup
            </label>
            <select
              value={selectedHaplogroup}
              onChange={(e) => setSelectedHaplogroup(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-teal-700/30 rounded-lg text-teal-100 focus:outline-none focus:border-teal-500/50"
            >
              <option value="">All Haplogroups</option>
              {allHaplogroups.map(hap => (
                <option key={hap} value={hap}>{hap}</option>
              ))}
            </select>
          </div>

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

      {!hasFiltered ? (
        <motion.div
          {...fadeInVariants}
          transition={{ duration: animConfig.duration }}
          className="rounded-2xl p-8 bg-slate-800/60 text-center border border-teal-700/30"
        >
          <Dna className="mx-auto mb-3 text-teal-500" size={48} />
          <p className="text-teal-400">Select a haplogroup or ethnicities to view distribution.</p>
        </motion.div>
      ) : totalSamples === 0 ? (
        <motion.div
          {...fadeInVariants}
          transition={{ duration: animConfig.duration }}
          className="rounded-2xl p-8 bg-slate-800/60 text-center border border-teal-700/30"
        >
          <Dna className="mx-auto mb-3 text-teal-500" size={48} />
          <p className="text-teal-400">No data available for the selected filters.</p>
        </motion.div>
      ) : (
        <motion.div
          {...fadeInVariants}
          transition={{ duration: animConfig.duration }}
        >
          <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-6 border border-teal-700/30 flex flex-col select-none">
            <h3 className="text-lg sm:text-xl font-bold text-teal-200 mb-3 sm:mb-4 flex items-center gap-2">
              <Dna className="w-5 h-5 sm:w-6 sm:h-6" />
              {selectedHaplogroup ? `${selectedHaplogroup} Subclades` : 'All Subclades'}
            </h3>
            
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-square [&_*]:outline-none [&_*]:focus:outline-none">
                <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius="40%"
                      innerRadius="28%"
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      animationBegin={0}
                      animationDuration={reduceAnimations ? 0 : 800}
                      isAnimationActive={!reduceAnimations}
                      stroke="transparent"
                      strokeWidth={0}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={colorMap[entry.ethnicity]}
                          className="cursor-pointer"
                          style={{ transition: reduceAnimations ? 'none' : 'opacity 0.2s' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={<CustomTooltip />} 
                      animationDuration={0}
                      isAnimationActive={false}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-xl sm:text-2xl font-bold text-teal-100">
                    {fmt(totalSamples)}
                  </div>
                  <div className="text-xs sm:text-sm text-teal-400">
                    samples
                  </div>
                </div>

                <div className="absolute inset-0 pointer-events-none select-none">
                  {labelPositions.map(({ item, angle, radiusPercent }) => {
                    const x = Math.cos(angle) * radiusPercent;
                    const y = -Math.sin(angle) * radiusPercent;
                    const angleDeg = (angle * 180) / Math.PI;
                    
                    let transformX = '-50%';
                    let transformY = '-50%';
                    
                    if (angleDeg > -45 && angleDeg < 45) {
                      transformX = '0%';
                    } else if (angleDeg > 135 || angleDeg < -135) {
                      transformX = '-100%';
                    }
                    
                    if (angleDeg > 0) {
                      transformY = '-100%';
                    } else {
                      transformY = '0%';
                    }
                    
                    return (
                      <div
                        key={item.name}
                        className="absolute whitespace-nowrap text-[10px] sm:text-xs font-semibold"
                        style={{
                          left: `calc(50% + ${x}%)`,
                          top: `calc(50% + ${y}%)`,
                          transform: `translate(${transformX}, ${transformY})`,
                        }}
                      >
                        <span className="text-teal-100">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Layout>
  );
};
