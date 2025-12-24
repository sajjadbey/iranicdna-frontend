// AnalyticsPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Dna, BarChart3 } from 'lucide-react';
import { type Sample } from '../types';
import { Layout } from '../components/Layout';
import { LocationSelector } from '../components/analytics/LocationSelector';
import { DonutCard } from '../components/analytics/DonutCard';
import { SubcladeList } from '../components/analytics/SubcladeList';
import { MapCard } from '../components/analytics/MapCard';
import { HeatmapCard } from '../components/analytics/HeatmapCard';
import { ProvinceComparisonModal } from '../components/analytics/ProvinceComparisonModal';
import { AboutContribute } from '../components/AboutContribute';
import { DNABackground } from '../components/DNABackground';
import { dnaBackgroundConfig, mobileDnaBackgroundConfig } from '../config/dnaBackgroundConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimationConfig, fadeInVariants, slideInVariants, scaleVariants, isMobileDevice } from '../utils/deviceDetection';
import { API_ENDPOINTS } from '../config/api';

// API DTOs
interface CountryDTO { name: string }
interface EthnicityDTO { name: string }

// Helper functions remain unchanged
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

const subMap = (samples: Sample[], field: 'y_dna' | 'mt_dna'): Record<string, number> => {
  return samples.reduce((acc: Record<string, number>, s) => {
    const v = s[field];
    if (v && v.name) {
      const increment = field === 'y_dna' ? s.count ?? 1 : 1;
      acc[v.name] = (acc[v.name] || 0) + increment;
    }
    return acc;
  }, {});
};

export const AnalyticsPage: React.FC = () => {
  const [allSamples, setAllSamples] = useState<Sample[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [ethnicities, setEthnicities] = useState<string[]>([]); // All unique ethnicities
  
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedEthnicity, setSelectedEthnicity] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Get animation config based on device
  const animConfig = getAnimationConfig();

  // Fetch all samples on mount to build filter lists and determine country/province relationships
  useEffect(() => {
    const fetchAllSamples = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.samples);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Sample[] = await res.json();
        setAllSamples(data || []);
        
        // Extract unique countries
        const countriesSet = new Set<string>();
        data.forEach(sample => {
          if (sample.country) countriesSet.add(sample.country);
        });
        
        setAllCountries(Array.from(countriesSet).sort());
      } catch (err) {
        console.error('Failed to fetch all samples:', err);
      }
    };
    fetchAllSamples();
  }, []);

  // Fetch countries on mount (Kept for consistency/safety)
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.countries);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CountryDTO[] = await res.json();
        if (allCountries.length === 0) {
            setAllCountries(data.map((c) => c.name).sort());
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };
    fetchCountries();
  }, [allCountries.length]);

  // Fetch ethnicities on mount
  useEffect(() => {
    const fetchEthnicities = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ethnicities);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: EthnicityDTO[] = await res.json();
        setEthnicities(data.map((e) => e.name).sort());
      } catch (err) {
        console.error('Failed to fetch ethnicities:', err);
        setEthnicities([]);
      }
    };
    
    fetchEthnicities();
  }, []);

  // Filter countries based on selected ethnicity
  const filteredCountries = useMemo(() => {
    if (!selectedEthnicity) return allCountries;
    
    const countriesWithEthnicity = new Set<string>();
    allSamples.forEach(sample => {
      if (sample.ethnicity === selectedEthnicity && sample.country) {
        countriesWithEthnicity.add(sample.country);
      }
    });
    
    return Array.from(countriesWithEthnicity).sort();
  }, [selectedEthnicity, allSamples, allCountries]);

  // Filter provinces based on selected country and ethnicity
  const filteredProvinces = useMemo(() => {
    if (!selectedCountry) return [];
    
    const provincesSet = new Set<string>();
    allSamples.forEach(sample => {
      if (sample.country === selectedCountry && sample.province) {
        // If ethnicity is selected, only include provinces with that ethnicity
        if (!selectedEthnicity || sample.ethnicity === selectedEthnicity) {
          provincesSet.add(sample.province);
        }
      }
    });
    
    return Array.from(provincesSet).sort();
  }, [selectedCountry, selectedEthnicity, allSamples]);

  // Get all provinces for comparison modal
  const allProvinces = useMemo(() => {
    const provincesSet = new Set<string>();
    allSamples.forEach(sample => {
      if (sample.province) {
        provincesSet.add(sample.province);
      }
    });
    return Array.from(provincesSet).sort();
  }, [allSamples]);

  // Filter ethnicities based on selected country/province
  const filteredEthnicities = useMemo(() => {
    // If no country and no province are selected, return all fetched ethnicities
    if (!selectedCountry && !selectedProvince) {
      return ethnicities;
    }

    const relevantEthnicities = new Set<string>();

    allSamples.forEach(sample => {
      const countryMatch = !selectedCountry || (sample.country === selectedCountry);
      const provinceMatch = !selectedProvince || (sample.province === selectedProvince);
      
      if (countryMatch && provinceMatch && sample.ethnicity) {
        relevantEthnicities.add(sample.ethnicity);
      }
    });

    return Array.from(relevantEthnicities).sort();
  }, [selectedCountry, selectedProvince, allSamples, ethnicities]);


  // Reset country if it's not in filtered list
  useEffect(() => {
    if (selectedCountry && !filteredCountries.includes(selectedCountry)) {
      setSelectedCountry(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCountries]);

  // Reset province if it's not in filtered list
  useEffect(() => {
    if (selectedProvince && !filteredProvinces.includes(selectedProvince)) {
      setSelectedProvince(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProvinces]);

  // Reset ethnicity if it's not in the newly filtered list
  useEffect(() => {
    if (selectedEthnicity && !filteredEthnicities.includes(selectedEthnicity)) {
      setSelectedEthnicity(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEthnicities]);


  // Handler function to sync map click with filters
  const handleProvinceClick = (provinceName: string) => {
    // If clicking the currently selected province, unselect it.
    if (selectedProvince === provinceName) {
        setSelectedProvince(null);
        setSelectedCountry(null); 
        setSelectedEthnicity(null);
        return;
    }
    
    setSelectedProvince(provinceName);

    // Find the country for this province in the full sample set
    const sampleInProvince = allSamples.find(
      (sample) => sample.province === provinceName
    );

    if (sampleInProvince && sampleInProvince.country) {
      // Update the country state to synchronize the country filter
      setSelectedCountry(sampleInProvince.country);
    } else {
        setSelectedCountry(null);
    }
    
    // Reset ethnicity to default ('All') when a new region is selected via map for a clean state
    setSelectedEthnicity(null);
  };


  // Fetch samples with filters
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (selectedCountry) params.append('country', selectedCountry);
        if (selectedProvince) params.append('province', selectedProvince);
        if (selectedEthnicity) params.append('ethnicity', selectedEthnicity);
        
        const url = `${API_ENDPOINTS.samples}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Sample[] = await res.json();
        
        if (mounted) {
          setSamples(data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    return () => {
      mounted = false;
    };
  }, [selectedCountry, selectedProvince, selectedEthnicity]);

  // Y-DNA calculations
  const yRoot = useMemo(() => countMap(samples, 'y_dna'), [samples]);
  const yTotal = useMemo(() => Object.values(yRoot).reduce((sum, n) => sum + n, 0), [yRoot]);

  const ySubObj = useMemo(() => subMap(samples, 'y_dna'), [samples]);
  const ySub = useMemo(
    () =>
      Object.entries(ySubObj).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
      ),
    [ySubObj]
  );

  const ySubTotal = useMemo(
    () => Object.values(ySubObj).reduce((sum, n) => sum + n, 0),
    [ySubObj]
  );

  const hasAny = useMemo(
    () => Object.keys(yRoot).length > 0,
    [yRoot]
  );


  const backgroundConfig = useMemo(() => {
    const isMobile = isMobileDevice();
    return isMobile 
      ? { ...dnaBackgroundConfig, ...mobileDnaBackgroundConfig }
      : dnaBackgroundConfig;
  }, []);

  if (error)
    return (
      <Layout>
        <DNABackground {...backgroundConfig} />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-xl text-center p-6 bg-slate-800/50 rounded-xl">
            <h2 className="text-2xl font-bold mb-2 text-red-400">Data Error</h2>
            <p className="text-sm text-teal-300">{error}</p>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <DNABackground {...backgroundConfig} />
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
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
              <div className="text-lg text-teal-200">
                Loading genetic data...
              </div>
              <div className="text-sm text-teal-400 mt-2">
                Fetching from <code className="bg-slate-800 px-2 py-1 rounded">/genetics/samples/</code>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        {...slideInVariants}
        transition={{ duration: animConfig.duration }}
        className="mb-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="md:col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
              Analytics
            </h2>
            <p className="mt-3 text-teal-300/80">
              Explore Y-DNA haplogroup distributions with interactive maps and subclade data.
            </p>
            
            {/* Compare Provinces Button */}
            <button
              onClick={() => setIsComparisonModalOpen(true)}
              className="mt-4 px-6 py-3 bg-slate-800/80 hover:bg-slate-700/80 border border-teal-700/30 hover:border-teal-500/50 rounded-xl transition-all flex items-center gap-2 text-teal-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <BarChart3 size={20} />
              Compare Provinces
            </button>
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-4">
            <LocationSelector
              label="Ethnicity"
              options={filteredEthnicities}
              value={selectedEthnicity}
              onChange={setSelectedEthnicity}
              placeholder="All Ethnicities"
            />
            <LocationSelector
              label="Country"
              options={filteredCountries}
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="All Countries"
            />
            <LocationSelector
              label="Province"
              options={filteredProvinces}
              value={selectedProvince}
              onChange={setSelectedProvince}
              placeholder="All Provinces"
            />
          </div>
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {!hasAny ? (
          <motion.div
            key="no-data"
            {...scaleVariants}
            transition={{ duration: animConfig.duration }}
            className="rounded-2xl p-8 bg-slate-800/60 text-center border border-teal-700/30"
          >
            <Dna className="mx-auto mb-3 text-teal-500" size={48} />
            <p className="text-teal-400">
              No haplogroup data available for the selected filter.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="data"
            {...fadeInVariants}
            transition={{ duration: animConfig.duration }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div>
              <DonutCard title="Y‑DNA Root Haplogroups" dataMap={yRoot} total={yTotal} />
            </div>
            <div>
              <MapCard 
                samples={samples} 
                selectedProvince={selectedProvince}
                onProvinceClick={handleProvinceClick}
              />
            </div>
            <div className="lg:col-span-2">
              <SubcladeList title="Y‑DNA Subclades" items={ySub} total={ySubTotal} />
            </div>
            <div className="lg:col-span-2">
              <HeatmapCard
                selectedCountry={selectedCountry}
                selectedEthnicity={selectedEthnicity}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AboutContribute />
      
      {/* Province Comparison Modal */}
      <ProvinceComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        allProvinces={allProvinces}
      />
    </Layout>
  );
};