// AnalyticsPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Dna } from 'lucide-react';
import { type Sample } from '../types';
import { Layout } from '../components/Layout';
import { LocationSelector } from '../components/analytics/LocationSelector';
import { DonutCard } from '../components/analytics/DonutCard';
import { SubcladeList } from '../components/analytics/SubcladeList';
import { MapCard } from '../components/analytics/MapCard';
import { Globe, Send, ExternalLink, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'https://qizilbash.ir/genetics';

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
  const [ethnicities, setEthnicities] = useState<string[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedEthnicity, setSelectedEthnicity] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all samples on mount to build filter lists
  useEffect(() => {
    const fetchAllSamples = async () => {
      try {
        const res = await fetch(`${API_BASE}/samples/`);
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

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_BASE}/countries/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CountryDTO[] = await res.json();
        setAllCountries(data.map((c) => c.name).sort());
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch ethnicities on mount
  useEffect(() => {
    const fetchEthnicities = async () => {
      try {
        const res = await fetch(`${API_BASE}/ethnicities/`);
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
        
        const url = `${API_BASE}/samples/?${params.toString()}`;
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Dna className="mx-auto mb-4 text-teal-400" size={48} />
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-teal-200"
              >
                Loading genetic data...
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-teal-400 mt-2"
              >
                Fetching from <code className="bg-slate-800 px-2 py-1 rounded">/genetics/samples/</code>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
              Analytics
            </h2>
            <p className="mt-3 text-teal-300/80">
              Explore Y-DNA haplogroup distributions with interactive maps and subclade data.
            </p>
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-4">
            <LocationSelector
              label="Ethnicity"
              options={ethnicities}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-8 bg-slate-800/60 text-center border border-teal-700/30"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Dna className="mx-auto mb-3 text-teal-500" size={48} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-teal-400"
            >
              No haplogroup data available for the selected filter.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <DonutCard title="Y‑DNA Root Haplogroups" dataMap={yRoot} total={yTotal} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <MapCard 
                samples={samples} 
                selectedProvince={selectedProvince}
                onProvinceClick={setSelectedProvince}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <SubcladeList title="Y‑DNA Subclades" items={ySub} total={ySubTotal} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        id="about"
        className="mt-16 pt-8 border-t border-teal-800/40"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-800/40 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-teal-200 mb-3 flex items-center gap-2">
              <Info size={20} /> About This Project
            </h3>
            <p className="text-teal-300/90">
              Iranic DNA is a community-driven initiative to map the genetic diversity of Iranian peoples
            </p>
            <ul className="mt-3 text-teal-300/80 list-disc pl-5 space-y-1">
              <li>Visualize root haplogroups and detailed subclades</li>
              <li>Filter by province (e.g., East Azerbaijan, Tehran, etc.)</li>
              <li>Contribute your anonymized haplogroup data</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-amber-900/30 to-teal-900/30 p-6 rounded-2xl border border-amber-600/30">
            <h4 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
              <Globe size={18} /> Contribute
            </h4>
            <p className="text-teal-200 text-sm mb-4">
              Help expand our database by sharing your haplogroup results.
            </p>
            <a
              href="https://t.me/Iranic_DNA  "
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-teal-800 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
            >
              <Send size={14} /> Join Telegram Group
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
};