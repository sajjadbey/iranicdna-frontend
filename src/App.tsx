import React, { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, Tooltip, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import mainLogo from './assets/logo.png';

// Lucide Icons
import {
  Dna,
  Filter,
  ChevronDown,
  ExternalLink,
  Info,
  Send,
  Globe,
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(Tooltip, ArcElement);

// Types
interface Sample {
  province: string;
  y_dna: { root_haplogroup: string; name: string } | null;
  mt_dna: { root_haplogroup: string; name: string } | null;
}

// Color Palette (turquoise + warm amber, not too saturated)
const PALETTE = [
  '#26A69A', // Teal-400 (your preferred turquoise)
  '#1E887D', // Teal-600
  '#00897B', // Teal-700
  '#00796B', // Deep teal
  '#FFA000', // Amber-700 (warm accent)
  '#F57C00', // Amber-800
  '#D97706', // Amber-600
  '#8D6E63', // Brown-500 (neutral)
  '#4E342E', // Brown-800
  '#26A69A',
];

const colorFor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const fmt = (n: number) => n.toLocaleString();

// —————— Components ——————

const Header: React.FC = () => (
  <header className="bg-gradient-to-r from-teal-900/90 to-amber-800/90 text-slate-50 shadow-sm backdrop-blur-md sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center ring-1 ring-white/20">
          <img src={mainLogo} className="h-12 w-12 object-contain" alt="IranicDNA" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-1">
            Iranic<span className="text-amber-300">DNA</span>
          </h1>
          <p className="text-[0.65rem] text-teal-200/80 mt-0.5 flex items-center gap-1">
            <Dna size={10} /> Y-DNA & mtDNA by Province
          </p>
        </div>
      </div>
      <nav className="flex items-center gap-4">
        <a
          href="#about"
          className="text-sm font-medium text-teal-100/90 hover:text-white flex items-center gap-1"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          <Info size={14} /> About
        </a>
        <a
          href="https://t.me/Iranic_DNA"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-teal-100/90 hover:text-white flex items-center gap-1"
        >
          <Send size={14} /> Join
        </a>
      </nav>
    </div>
  </header>
);

const ProvinceSelector: React.FC<{
  provinces: string[];
  value: string | null;
  onChange: (p: string | null) => void;
}> = ({ provinces, value, onChange }) => {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;

  return (
    <div className="max-w-md mx-auto w-full">
      <label className="block text-sm font-medium text-teal-200 mb-2 flex items-center gap-1">
        <Filter size={14} /> Filter by Province
      </label>
      {isMobile ? (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full rounded-lg bg-teal-900/70 text-teal-100 px-4 py-2 border border-teal-600 focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Provinces</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <button
            onClick={() => onChange(null)}
            className="w-full text-left rounded-lg px-4 py-3 bg-teal-900/70 text-teal-100 flex justify-between items-center ring-1 ring-teal-600 hover:ring-teal-500"
          >
            <span>{value ?? 'All Provinces'}</span>
            <ChevronDown size={16} className="text-teal-300" />
          </button>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 max-h-60 overflow-y-auto bg-teal-950/80 rounded-lg border border-teal-700">
            <button
              onClick={() => onChange(null)}
              className="col-span-full text-sm rounded-md px-3 py-2 bg-amber-800/80 text-white font-medium"
            >
              All Provinces
            </button>
            {provinces.map((p) => (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`text-sm rounded-md px-2 py-2 text-left truncate ${value === p ? 'bg-amber-700 text-white' : 'bg-teal-800/60 text-teal-100'}`}
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
        borderColor: '#004d40',
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
    <div className="rounded-2xl p-5 bg-gradient-to-b from-teal-900/60 to-slate-900/70 ring-1 ring-teal-600/40 shadow-lg">
      <h3 className="text-lg font-semibold text-teal-100 mb-3 flex items-center gap-2">
        <Dna size={18} /> {title}
      </h3>
      <div className="flex items-center gap-6 flex-col md:flex-row">
        <div className="w-48 h-48">
          <Doughnut data={chartData} options={options} />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
            {labels.map((label, idx) => (
              <div key={label} className="flex items-center justify-between bg-teal-900/40 px-3 py-2 rounded-md">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx] }} />
                  <div className="truncate">
                    <div className="text-sm text-teal-200 truncate">{label}</div>
                    <div className="text-xs text-teal-400">{values[idx]} sample{values[idx] > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-teal-100">{fmt(values[idx])}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SubcladeList: React.FC<{ title: string; items: [string, number][] }> = ({ title, items }) => {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl p-5 bg-teal-900/60 ring-1 ring-teal-600/40 shadow-sm">
      <h3 className="text-lg font-semibold text-teal-100 mb-3">{title}</h3>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
        {items.map(([name, count]) => (
          <div key={name} className="flex items-center justify-between p-2 rounded-md bg-teal-900/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${colorFor(name)}22` }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorFor(name) }} />
              </div>
              <div className="truncate">
                <div className="text-sm text-teal-100 font-mono truncate">{name}</div>
                <div className="text-xs text-teal-300">{count} sample{count > 1 ? 's' : ''}</div>
              </div>
            </div>
            <div className="text-sm font-semibold text-teal-100">{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// —————— Main App ——————

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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Sample[] = await res.json();
        if (mounted) {
          setSamples(data || []);
          const uniq = Array.from(new Set((data || []).map((s) => s.province).filter(Boolean))).sort();
          setProvinces(uniq);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => (selected ? samples.filter(s => s.province === selected) : samples), [samples, selected]);

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
    <div className="min-h-screen bg-slate-900 text-teal-100 flex flex-col items-center justify-center">
      <div className="text-center animate-pulse">
        <Dna className="mx-auto mb-4 text-teal-400" size={48} />
        <div className="text-lg">Loading genetic data...</div>
        <div className="text-sm text-teal-400 mt-2">Fetching from <code className="bg-slate-800 px-2 py-1 rounded">/genetics/samples/</code></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-900 text-teal-100 flex items-center justify-center">
      <div className="max-w-xl text-center p-6 bg-slate-800/50 rounded-xl">
        <h2 className="text-2xl font-bold mb-2 text-red-400">Data Error</h2>
        <p className="text-sm text-teal-300">{error}</p>
      </div>
    </div>
  );

  const hasAny = Object.keys(yRoot).length > 0 || Object.keys(mRoot).length > 0;

  return (
    <div className="min-h-screen text-teal-100 relative overflow-hidden bg-slate-900">
      {/* Animated Background with subtle gradient */}
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          background: `radial-gradient(circle at 20% 30%, #004d40 0%, #001f1f 100%)`,
        }}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
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
            <DonutCard title="Y‑DNA Root Haplogroups" dataMap={yRoot} />
            <DonutCard title="mtDNA Root Haplogroups" dataMap={mRoot} />
            <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SubcladeList title="Y‑DNA Subclades" items={ySub} />
              <SubcladeList title="mtDNA Subclades" items={mSub} />
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
                Iranic DNA is a community-driven initiative to map the genetic diversity of Iranian peoples—especially Turkic groups like Azerbaijanis—through Y-DNA and mtDNA data by province.
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
      </main>

      <footer className="border-t border-slate-800 py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-teal-400">
            © {new Date().getFullYear()} <span className="font-bold">Iranic DNA</span> — Preserving genetic identity
          </p>
          <div className="flex items-center gap-2 text-sm text-teal-400">
            <p>Designed by <a href="https://qizilbash.ir" target="_blank" rel="noreferrer" className="font-bold underline">Qızılbaş</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;