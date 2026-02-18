import React, { useEffect, useMemo, useState } from 'react';
import { Dna, BarChart3, Download } from 'lucide-react';
import { type Sample } from '../types';
import { Layout } from '../components/Layout';
import { LocationSelector } from '../components/analytics/LocationSelector';
import { DonutCard } from '../components/analytics/DonutCard';
import { SubcladeList } from '../components/analytics/SubcladeList';
import { MapCard } from '../components/analytics/MapCard';
import { HeatmapCard } from '../components/analytics/HeatmapCard';
import { ProvinceComparisonModal } from '../components/analytics/ProvinceComparisonModal';
import { AboutContribute } from '../components/AboutContribute';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimationConfig, fadeInVariants, slideInVariants, scaleVariants } from '../utils/deviceDetection';
import { API_ENDPOINTS } from '../config/api';
import { cachedFetchNormalized } from '../utils/apiCache';
import { buildSamplesUrl, FILTER_PRESETS } from '../utils/apiFilters';

interface ProvinceDTO { name: string; country: string }
interface EthnicityDTO { name: string }

// Helper functions
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
  const [samples, setSamples] = useState<Sample[]>([]);
  const [allCountriesBase, setAllCountriesBase] = useState<string[]>([]);
  const [allProvincesBase, setAllProvincesBase] = useState<ProvinceDTO[]>([]);
  const [allEthnicities, setAllEthnicities] = useState<string[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedEthnicity, setSelectedEthnicity] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Get animation config based on device
  const animConfig = getAnimationConfig();

  // Fetch all countries and provinces on mount (base data)
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [countriesRes, provincesRes] = await Promise.all([
          fetch(API_ENDPOINTS.countries),
          fetch(API_ENDPOINTS.provinces)
        ]);
        const countriesData = await countriesRes.json();
        const provincesData = await provincesRes.json();
        
        setAllCountriesBase(countriesData.map((c: { name: string }) => c.name).sort());
        setAllProvincesBase(provincesData.map((p: { name: string; country: { name: string } }) => ({ 
          name: p.name, 
          country: p.country.name 
        })));
      } catch (err) {
        console.error('Failed to fetch base data:', err);
      }
    };
    fetchBaseData();
  }, []);

  // Fetch ethnicities based on selected location (hierarchical filtering)
  useEffect(() => {
    const fetchEthnicities = async () => {
      try {
        let url = API_ENDPOINTS.ethnicities;
        
        // Apply hierarchical filtering
        if (selectedProvince) {
          url += `?province=${encodeURIComponent(selectedProvince)}`;
        } else if (selectedCountry) {
          url += `?country=${encodeURIComponent(selectedCountry)}`;
        }
        
        const response = await fetch(url);
        const ethnicitiesData: EthnicityDTO[] = await response.json();
        setAllEthnicities(ethnicitiesData.map((e: EthnicityDTO) => e.name).sort());
      } catch (err) {
        console.error('Failed to fetch ethnicities:', err);
        setAllEthnicities([]);
      }
    };
    
    fetchEthnicities();
  }, [selectedCountry, selectedProvince]);

  // Filter countries based on selected ethnicity from samples
  const filteredCountries = useMemo(() => {
    if (!selectedEthnicity) return allCountriesBase;
    
    // Get unique countries from samples with the selected ethnicity
    const countriesWithEthnicity = new Set(
      samples
        .filter(s => s.ethnicity === selectedEthnicity && s.country)
        .map(s => s.country as string)
    );
    
    return allCountriesBase.filter(c => countriesWithEthnicity.has(c));
  }, [allCountriesBase, selectedEthnicity, samples]);

  // Filter provinces based on selected country and ethnicity
  const filteredProvinces = useMemo(() => {
    if (!selectedCountry) return [];
    
    console.log('DEBUG: allProvincesBase sample:', allProvincesBase.slice(0, 5));
    console.log('DEBUG: selectedCountry:', selectedCountry);
    console.log('DEBUG: selectedEthnicity:', selectedEthnicity);
    
    // Start with provinces in the selected country
    let provinces = allProvincesBase.filter(p => p.country === selectedCountry);
    
    console.log('DEBUG: provinces in country:', provinces.map(p => p.name));
    console.log('DEBUG: samples count:', samples.length);
    
    // If ethnicity is selected, filter provinces that have samples with that ethnicity
    if (selectedEthnicity) {
      const provincesWithEthnicity = new Set(
        samples
          .filter(s => s.ethnicity === selectedEthnicity && s.province)
          .map(s => s.province as string)
      );
      console.log('DEBUG: provincesWithEthnicity:', Array.from(provincesWithEthnicity));
      provinces = provinces.filter(p => provincesWithEthnicity.has(p.name));
    }
    
    console.log('DEBUG: final filtered provinces:', provinces.map(p => p.name));
    return provinces.map(p => p.name).sort();
  }, [selectedCountry, allProvincesBase, selectedEthnicity, samples]);

  // Ethnicities are already filtered by the server based on location
  const filteredEthnicities = useMemo(() => {
    return allEthnicities;
  }, [allEthnicities]);

  // Get unique province names for comparison modal
  const provinceNames = useMemo(() => {
    return Array.from(new Set(allProvincesBase.map(p => p.name))).sort();
  }, [allProvincesBase]);

  // Reset country if it's not in filtered list
  useEffect(() => {
    if (selectedCountry && !filteredCountries.includes(selectedCountry)) {
      setSelectedCountry(null);
    }
  }, [filteredCountries, selectedCountry]);

  // Reset province if it's not in filtered list
  useEffect(() => {
    if (selectedProvince && !filteredProvinces.includes(selectedProvince)) {
      setSelectedProvince(null);
    }
  }, [filteredProvinces, selectedProvince]);


  // Reset ethnicity if it's not in the newly filtered list
  useEffect(() => {
    if (selectedEthnicity && !filteredEthnicities.includes(selectedEthnicity)) {
      setSelectedEthnicity(null);
    }
  }, [filteredEthnicities, selectedEthnicity]);

  // Handler function to sync map click with filters
  const handleProvinceClick = (provinceName: string) => {
    // If clicking the currently selected province, unselect it
    if (selectedProvince === provinceName) {
      setSelectedProvince(null);
      setSelectedCountry(null);
      // Don't reset ethnicity - let it persist
      return;
    }
    
    setSelectedProvince(provinceName);

    // Find the country for this province
    const province = allProvincesBase.find(p => p.name === provinceName);
    if (province) {
      setSelectedCountry(province.country);
    } else {
      setSelectedCountry(null);
    }
  };

  // Fetch samples with server-side filters using page_size=all for complete data
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build filters using the utility
        const filters = {
          ...FILTER_PRESETS.allWithYDna(),
          ...(selectedCountry && { country: selectedCountry }),
          ...(selectedProvince && { province: selectedProvince }),
          ...(selectedEthnicity && { ethnicity: selectedEthnicity }),
        };
        
        const url = buildSamplesUrl(API_ENDPOINTS.samples, filters);
        const data = await cachedFetchNormalized<Sample>(url, {
          cacheOptions: { ttl: 30 * 60 * 1000, maxRetries: 4 } // Cache for 30 minutes to reduce 429 errors
        });
        
        if (mounted) {
          setSamples(data.results);
          setTotalCount(data.count);
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

  // Handle Excel export
  const handleExportExcel = () => {
    const link = document.createElement('a');
    link.href = API_ENDPOINTS.exportExcel;
    link.download = 'genetic_samples.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error)
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

  return (
    <Layout>
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
                Using optimized server-side filtering
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
            {totalCount > 0 && (
              <p className="mt-2 text-sm text-teal-400">
                Showing {samples.length.toLocaleString()} samples
                {(selectedCountry || selectedProvince || selectedEthnicity) && 
                  ` (filtered from ${totalCount.toLocaleString()} total)`}
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setIsComparisonModalOpen(true)}
                className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700/80 border border-teal-700/30 hover:border-teal-500/50 rounded-xl transition-all flex items-center gap-2 text-teal-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <BarChart3 size={20} />
                Compare Provinces
              </button>
              
              <button
                onClick={handleExportExcel}
                className="px-6 py-3 bg-emerald-800/80 hover:bg-emerald-700/80 border border-emerald-700/30 hover:border-emerald-500/50 rounded-xl transition-all flex items-center gap-2 text-emerald-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <Download size={20} />
                Export to Excel
              </button>
            </div>
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
              label="Province/Region"
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
                selectedCity={null}
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
        allProvinces={provinceNames}
      />
    </Layout>
  );
};