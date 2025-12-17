import React, { useMemo } from 'react';
import { Dna } from 'lucide-react';
import { fmt, generateUniqueColors } from '../../utils/colors';
import { shouldReduceAnimations } from '../../utils/deviceDetection';

interface Props {
  title: string;
  items: [string, number][];
  total: number;
}

const formatPercent = (count: number, total: number): string => {
  if (total === 0) return '0.0';
  const rawPct = (count / total) * 100;
  
  if (rawPct > 0 && rawPct < 0.1) {
    return '<0.1';
  }
  
  return rawPct.toFixed(1);
};


export const SubcladeList: React.FC<Props> = ({ title, items, total }) => {
  const itemNames = useMemo(() => items.map(([name]) => name), [items]);
  const colorMap = useMemo(() => generateUniqueColors(itemNames), [itemNames]);
  const reduceAnimations = shouldReduceAnimations();

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl p-5 bg-teal-900/60 ring-1 ring-teal-600/40 shadow-sm">
      <h3 className="text-lg font-semibold text-teal-100 mb-3">
        {title} <span className="text-teal-300 ml-2">(n = {fmt(total)})</span>
      </h3>
      <div className="space-y-2 max-h-72 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
        {items.map(([name, count]) => {
          const pctStr = formatPercent(count, total);
          const color = colorMap[name];
          
          return (
            <div
              key={name}
              className="flex items-center justify-between p-2 rounded-md bg-teal-900/40 cursor-pointer"
              style={{ transition: reduceAnimations ? 'none' : 'background-color 0.2s' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${color}22` }}
                >
                  <Dna size={15} style={{ color }} />
                </div>
                <div className="truncate">
                  <div className="text-sm text-teal-100 font-mono truncate">{name}</div>
                  <div className="text-xs text-teal-300">
                    {count} sample{count > 1 ? 's' : ''} ({pctStr}%)
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-teal-100">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};