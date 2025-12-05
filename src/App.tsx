// IranicDNA_Redesign.tsx
// Single-file React + TypeScript redesign using TailwindCSS
// - Modern responsive UI/UX tailored for a DNA haplogroup project
// - Replaces CSS variables with Tailwind utility classes
// - Includes components: Header, ProvinceSelector, DonutChart, Subclade lists, Footer
// - Keep your existing API endpoint; drop-in replacement for src/App.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, Tooltip, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import mainLogo from './assets/logo.png';

ChartJS.register(Tooltip, ArcElement);

// -------------------- Types --------------------
interface Sample {
  province: string;
  y_dna: { root_haplogroup: string; name: string } | null;
  mt_dna: { root_haplogroup: string; name: string } | null;
}

// -------------------- Utilities --------------------
// Deterministic pastel-ish color palette (tailwind-friendly hexes)
// This palette is now inspired by the logo's warm, earthy tones.
const PALETTE = [
  '#D97706', // amber-500 (main gold)
  '#F59E0B', // amber-400 (brighter gold)
  '#C2410C', // orange-600 (deep amber)
  '#78350F', // amber-900 (dark brown)
  '#92400E', // amber-700 (rich brown)
  '#FFD700', // Gold (for accents)
  '#A55E2E', // Deep terracotta
  '#8B4513', // SaddleBrown (for depth)
  '#B45309', // orange-700 (warm accent)
  '#D97706',
];

const colorFor = (key: string) => {
  // deterministic mapping
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

// Format number (simple)
const fmt = (n: number) => n.toLocaleString();

// -------------------- Header --------------------
const Header: React.FC = () => (
  <header className="bg-gradient-to-r from-amber-900 to-orange-900 text-slate-50 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center ring-1 ring-white/10">
          <img src={mainLogo} className="h-12 w-12 object-contain" alt="IranicDNA" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Iranic DNA</h1>
          <p className="text-[0.65rem] text-white/70 mt-0.5">Y-DNA & mtDNA across Iranian provinces</p>
        </div>
      </div>

      <nav className="flex items-center gap-3">
        <a
          href="#about"
          className="text-[0.8125rem] font-medium text-white/90 hover:text-white transition-colors"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector('#about') as HTMLElement | null;
            if (target) {
              window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth',
              });
            }
          }}
        >
          About
        </a>
        <a
          href="#contact"
          className="text-[0.8125rem] font-medium text-white/90 hover:text-white transition-colors"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector('#contact') as HTMLElement | null;
            if (target) {
              window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth',
              });
            }
          }}
        >
          Contact
        </a>
      </nav>
    </div>
  </header>
);

// -------------------- Province Selector (responsive) --------------------
const ProvinceSelector: React.FC<{
  provinces: string[];
  value: string | null;
  onChange: (p: string | null) => void;
}> = ({ provinces, value, onChange }) => {
  // Use native select on small screens, custom dropdown for larger screens
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;

  return (
    <div className="max-w-md mx-auto w-full">
      <label className="block text-sm font-medium text-amber-200 mb-2">Filter by Province</label>
      {isMobile ? (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full rounded-lg bg-amber-950 text-amber-100 px-4 py-2 border border-amber-700"
        >
          <option value="">All Provinces</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <button
            onClick={() => onChange(value === null ? '' : null)}
            className="w-full text-left rounded-lg px-4 py-3 bg-amber-950 text-amber-100 flex justify-between items-center ring-1 ring-amber-700 hover:ring-amber-500"
            aria-expanded="false"
          >
            <span>{value ?? 'All Provinces'}</span>
            <span className="text-xs text-amber-300">Change</span>
          </button>
          <div className="mt-2 grid grid-cols-3 gap-2 p-2">
            <button
              onClick={() => onChange(null)}
              className="col-span-3 text-sm rounded-md px-3 py-2 bg-amber-900 text-amber-100"
            >All Provinces</button>
            {provinces.map((p) => (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`text-sm rounded-md px-3 py-2 text-left truncate ${value === p ? 'bg-amber-600 text-white' : 'bg-amber-900 text-amber-100'}`}
                title={p}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------- Donut Chart --------------------
const DonutCard: React.FC<{ title: string; dataMap: Record<string, number> }> = ({ title, dataMap }) => {
  const labels = Object.keys(dataMap);
  const values = Object.values(dataMap);
  if (labels.length === 0) return null;

  const colors = labels.map((l) => colorFor(l));

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#1c1917',
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    cutout: '65%',
    maintainAspectRatio: true,
    responsive: true,
  };

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-b from-amber-950/60 to-stone-950/60 ring-1 ring-amber-700/30 shadow-md">
      <h3 className="text-lg font-semibold text-amber-100 mb-3">{title}</h3>
      <div className="flex items-center gap-6 flex-col md:flex-row">
        <div className="w-48 h-48">
          <Doughnut data={chartData} options={options} />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-2">
            {labels.map((label, idx) => (
              <div key={label} className="flex items-center justify-between bg-amber-950/40 px-3 py-2 rounded-md">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx] }} />
                  <div className="truncate">
                    <div className="text-sm text-amber-200 truncate">{label}</div>
                    <div className="text-xs text-amber-400">{values[idx]} sample{values[idx] > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-amber-100">{fmt(values[idx])}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- Subclade List --------------------
const SubcladeList: React.FC<{ title: string; items: [string, number][] }> = ({ title, items }) => {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl p-5 bg-amber-950/60 ring-1 ring-amber-700/30 shadow-sm">
      <h3 className="text-lg font-semibold text-amber-100 mb-3">{title}</h3>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
        {items.map(([name, count]) => (
          <div key={name} className="flex items-center justify-between p-2 rounded-md bg-amber-950/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${colorFor(name)}22` }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorFor(name) }} />
              </div>
              <div className="truncate">
                <div className="text-sm text-amber-100 font-mono truncate">{name}</div>
                <div className="text-xs text-amber-400">{count} sample{count > 1 ? 's' : ''}</div>
              </div>
            </div>
            <div className="text-sm font-semibold text-amber-100">{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// -------------------- Main App --------------------
const App: React.FC = () => {
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
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data: Sample[] = await res.json();
        if (!mounted) return;
        setSamples(data || []);
        const uniq = Array.from(new Set((data || []).map((s) => s.province).filter(Boolean))).sort();
        setProvinces(uniq);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => (selected ? samples.filter(s => s.province === selected) : samples), [samples, selected]);

  // Root haplogroup counts
  const countMap = (field: 'y_dna' | 'mt_dna') => {
    return filtered.reduce((acc: Record<string, number>, s) => {
      const v = s[field];
      if (v && v.root_haplogroup) {
        acc[v.root_haplogroup] = (acc[v.root_haplogroup] || 0) + 1;
      }
      return acc;
    }, {});
  };

  const yRoot = countMap('y_dna');
  const mRoot = countMap('mt_dna');

  // Subclade maps
  const subMap = (field: 'y_dna' | 'mt_dna') => {
    return filtered.reduce((acc: Record<string, number>, s) => {
      const v = s[field];
      if (v && v.name) {
        acc[v.name] = (acc[v.name] || 0) + 1;
      }
      return acc;
    }, {});
  };

  const ySub = Object.entries(subMap('y_dna')).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const mSub = Object.entries(subMap('mt_dna')).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  if (loading) return (
    <div className="min-h-screen bg-stone-950 text-amber-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse mb-4 text-lg">Loading genetic data...</div>
        <div className="text-sm text-amber-400">This will fetch from <code className="bg-stone-900 px-2 py-1 rounded">/api/samples/</code></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-stone-950 text-amber-100 flex items-center justify-center">
      <div className="max-w-xl text-center">
        <h2 className="text-2xl font-semibold mb-2">Error loading data</h2>
        <p className="text-sm text-amber-400">{error}</p>
      </div>
    </div>
  );

  const hasAny = Object.keys(yRoot).length > 0 || Object.keys(mRoot).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-900 to-stone-950 text-amber-100">
      {/* Animated Gradient Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, #1c1917 0%, #1c1917 25%, transparent 25%),
            radial-gradient(circle at 80% 80%, #FFD700 0%, #FFD700 25%, transparent 25%),
            radial-gradient(circle at 50% 50%, #D97706 0%, #D97706 25%, transparent 25%),
            linear-gradient(to bottom right, #1c1917, #D97706, #FFD700)
          `,
          animation: 'gradientShift 15s ease infinite',
        }}
      ></div>

      <style>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold">Explore Haplogroup Distribution</h2>
              <p className="mt-2 text-amber-400">Interactive visualisations of Y‑DNA and mtDNA root haplogroups and subclades, filterable by province.</p>
            </div>
            <div className="flex items-center justify-end">
              <ProvinceSelector provinces={provinces} value={selected} onChange={(p) => setSelected(p)} />
            </div>
          </div>
        </section>

        {!hasAny ? (
          <div className="rounded-2xl p-8 bg-stone-900/40 text-center">
            <p className="text-amber-400">No haplogroup data available for the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DonutCard title="Y‑DNA Root Haplogroups" dataMap={yRoot} />
            <DonutCard title="mtDNA Root Haplogroups" dataMap={mRoot} />
            <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SubcladeList title="Y‑DNA Subclades" items={ySub} />
              <SubcladeList title="mtDNA Subclades" items={mSub} />
            </div>
          </div>
        )}

        {/* About & CTA */}
        <section id="about" className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl p-6 bg-stone-900/40">
            <h3 className="text-xl font-semibold">About the Project</h3>
            <p className="mt-2 text-amber-400">Iranic DNA is a community‑driven project to document and visualise the genetic diversity across Iranian provinces. Contributors can upload haplogroup assignments and metadata which help researchers visualize regional patterns.</p>
            <ul className="mt-3 text-amber-400 list-disc pl-5 space-y-1">
              <li>Y‑DNA and mtDNA root haplogroups</li>
              <li>Subclade frequency tables</li>
              <li>Province-level filtering and downloadable CSV</li>
            </ul>
          </div>
          <div id="contact" className="rounded-2xl p-6 bg-gradient-to-t from-amber-900/40 to-stone-900/20">
            <h4 className="text-lg font-semibold">Want to contribute?</h4>
            <p className="text-amber-200 text-sm mt-2">Get in touch or upload your anonymized data to improve coverage.</p>
            <a href="https://t.me/Iranic_DNA" className="inline-block mt-4 px-4 py-2 rounded-md bg-amber-950/30 hover:bg-amber-950/50">Contact Us</a>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-800/60 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-amber-400">© {new Date().getFullYear()} Iranic DNA Project — Preserving genetic heritage</p>
          <p className="text-sm text-amber-400">Designed by <a href="https://qizilbash.ir" target="_blank" rel="noreferrer" className="underline">Qızılbaş</a></p>
        </div>
      </footer>
    </div>
  );
};

export default App;