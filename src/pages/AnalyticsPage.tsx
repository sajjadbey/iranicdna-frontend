// AnalyticsPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Dna } from 'lucide-react';
import { type Sample } from '../types';
import { Layout } from '../components/Layout';
import { LocationSelector } from '../components/analytics/LocationSelector';
import { DonutCard } from '../components/analytics/DonutCard';
import { SubcladeList } from '../components/analytics/SubcladeList';
import { Globe, Send, ExternalLink, Info } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

// API DTOs
interface CountryDTO { name: string }
interface ProvinceDTO { name: string }
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
  const [samples, setSamples] = useState<Sample[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [ethnicities, setEthnicities] = useState<string[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedEthnicity, setSelectedEthnicity] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_BASE}/countries/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CountryDTO[] = await res.json();
        setCountries(data.map((c) => c.name).sort());
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch provinces when country changes
  useEffect(() => {
    const fetchProvinces = async () => {
      if (!selectedCountry) {
        setProvinces([]);
        setSelectedProvince(null);
        setEthnicities([]);
        setSelectedEthnicity(null);
        return;
      }
      
      try {
        const res = await fetch(
          `${API_BASE}/provinces/?country=${encodeURIComponent(selectedCountry)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ProvinceDTO[] = await res.json();
        setProvinces(data.map((p) => p.name).sort());
      } catch (err) {
        console.error('Failed to fetch provinces:', err);
        setProvinces([]);
      }
    };
    
    fetchProvinces();
  }, [selectedCountry]);

  // Fetch Ethnicities when province changes
  useEffect(() => {
    const fetchEthnicities = async () => {
      if (!selectedProvince) {
        setEthnicities([]);
        setSelectedEthnicity(null);
        return;
      }
      
      try {
        const res = await fetch(
          `${API_BASE}/ethnicities/?province=${encodeURIComponent(selectedProvince)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: EthnicityDTO[] = await res.json();
        setEthnicities(data.map((c) => c.name).sort());
      } catch (err) {
        console.error('Failed to fetch ethnicities:', err);
        setEthnicities([]);
      }
    };
    
    fetchEthnicities();
  }, [selectedProvince]);

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

  // All memoized calculations remain the same
  const yRoot = useMemo(() => countMap(samples, 'y_dna'), [samples]);
  const mRoot = useMemo(() => countMap(samples, 'mt_dna'), [samples]);
  const yTotal = useMemo(() => Object.values(yRoot).reduce((sum, n) => sum + n, 0), [yRoot]);
  const mTotal = useMemo(() => Object.values(mRoot).reduce((sum, n) => sum + n, 0), [mRoot]);

  const ySubObj = useMemo(() => subMap(samples, 'y_dna'), [samples]);
  const mSubObj = useMemo(() => subMap(samples, 'mt_dna'), [samples]);
  const ySub = useMemo(
    () =>
      Object.entries(ySubObj).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
      ),
    [ySubObj]
  );
  const mSub = useMemo(
    () =>
      Object.entries(mSubObj).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
      ),
    [mSubObj]
  );

  const ySubTotal = useMemo(
    () => Object.values(ySubObj).reduce((sum, n) => sum + n, 0),
    [ySubObj]
  );
  const mSubTotal = useMemo(
    () => Object.values(mSubObj).reduce((sum, n) => sum + n, 0),
    [mSubObj]
  );

  const hasAny = useMemo(
    () => Object.keys(yRoot).length > 0 || Object.keys(mRoot).length > 0,
    [yRoot, mRoot]
  );

  if (loading)
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center animate-pulse">
            <Dna className="mx-auto mb-4 text-teal-400" size={48} />
            <div className="text-lg">Loading genetic data...</div>
            <div className="text-sm text-teal-400 mt-2">
              Fetching from <code className="bg-slate-800 px-2 py-1 rounded">/genetics/samples/</code>
            </div>
          </div>
        </div>
      </Layout>
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
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
              Analytics
            </h2>
            <p className="mt-3 text-teal-300/80">
              Explore Y-DNA and mtDNA haplogroup distributions with interactive maps and subclade data.
            </p>
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-4">
            <LocationSelector
              label="Country"
              options={countries}
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="All Countries"
            />
            <LocationSelector
              label="Province"
              options={provinces}
              value={selectedProvince}
              onChange={setSelectedProvince}
              placeholder="All Provinces"
            />
            <LocationSelector
              label="Ethnicity"
              options={ethnicities}
              value={selectedEthnicity}
              onChange={setSelectedEthnicity}
              placeholder="All Ethnicities"
            />
          </div>
        </div>
      </section>

      {!hasAny ? (
        <div className="rounded-2xl p-8 bg-slate-800/60 text-center border border-teal-700/30">
          <Dna className="mx-auto mb-3 text-teal-500" size={48} />
          <p className="text-teal-400">No haplogroup data available for the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DonutCard title="Y‑DNA Root Haplogroups" dataMap={yRoot} total={yTotal} />
          <DonutCard title="mtDNA Root Haplogroups" dataMap={mRoot} total={mTotal} />
          <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubcladeList title="Y‑DNA Subclades" items={ySub} total={ySubTotal} />
            <SubcladeList title="mtDNA Subclades" items={mSub} total={mSubTotal} />
          </div>
        </div>
      )}

      <section id="about" className="mt-16 pt-8 border-t border-teal-800/40">
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
      </section>
    </Layout>
  );
};