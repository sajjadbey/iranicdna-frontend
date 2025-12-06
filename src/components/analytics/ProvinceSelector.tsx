import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface Props {
  provinces: string[];
  value: string | null;
  onChange: (p: string | null) => void;
}

export const ProvinceSelector: React.FC<Props> = ({ provinces, value, onChange }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
            <option key={p} value={p}>
              {p}
            </option>
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
                className={`text-sm rounded-md px-2 py-2 text-left truncate ${
                  value === p ? 'bg-amber-700 text-white' : 'bg-teal-800/60 text-teal-100'
                }`}
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