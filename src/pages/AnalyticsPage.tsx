import React, { useEffect, useMemo, useState } from 'react';
import { Dna } from 'lucide-react';
import { type Sample } from '../types';
import { Layout } from '../components/Layout';
import { ProvinceSelector } from '../components/analytics/ProvinceSelector';
import { DonutCard } from '../components/analytics/DonutCard';
import { SubcladeList } from '../components/analytics/SubcladeList';
import { Globe, Send, ExternalLink, Info } from 'lucide-react';


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
  const [provinces, setProvinces] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch('/genetics/samples/');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Sample[] = await res.json();
        if (mounted) {
          setSamples(data || []);
          const uniq = Array.from(
            new Set((data || []).map((s) => s.province).filter(Boolean))
          ).sort();
          setProvinces(uniq);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(
    () => (selected ? samples.filter((s) => s.province === selected) : samples),
    [samples, selected]
  );

  const yRoot = useMemo(() => countMap(filtered, 'y_dna'), [filtered]);
  const mRoot = useMemo(() => countMap(filtered, 'mt_dna'), [filtered]);
  const yTotal = useMemo(() => Object.values(yRoot).reduce((sum, n) => sum + n, 0), [yRoot]);
  const mTotal = useMemo(() => Object.values(mRoot).reduce((sum, n) => sum + n, 0), [mRoot]);

  const ySubObj = useMemo(() => subMap(filtered, 'y_dna'), [filtered]);
  const mSubObj = useMemo(() => subMap(filtered, 'mt_dna'), [filtered]);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
              Analytics
            </h2>
            <p className="mt-3 text-teal-300/80">
              Explore Y-DNA and mtDNA haplogroup distributions with interactive maps and subclade data.
            </p>
          </div>
          <div className="flex items-center justify-end">
            <ProvinceSelector provinces={provinces} value={selected} onChange={setSelected} />
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
              href="https://t.me/Iranic_DNA"
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