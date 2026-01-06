import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Dna } from 'lucide-react';
import { fmt, generateUniqueColors } from '../../utils/colors';
import { shouldReduceAnimations } from '../../utils/deviceDetection';

interface Props {
  title: string;
  dataMap: Record<string, number>;
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

interface ChartDataItem {
  name: string;
  value: number;
  percentage: string;
  [key: string]: string | number;
}

export const DonutCard: React.FC<Props> = ({ title, dataMap, total }) => {
  const reduceAnimations = shouldReduceAnimations();
  
  const sortedItems = useMemo(() => {
    return Object.entries(dataMap)
      .sort((a, b) => b[1] - a[1]);
  }, [dataMap]);

  const labels = useMemo(() => sortedItems.map(([label]) => label), [sortedItems]);
  const colorMap = useMemo(() => generateUniqueColors(labels), [labels]);

  const chartData: ChartDataItem[] = useMemo(() => {
    return sortedItems.map(([name, value]) => ({
      name,
      value,
      percentage: formatPercent(value, total)
    }));
  }, [sortedItems, total]);

  // Early return before any hooks if no data
  if (Object.keys(dataMap).length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 border border-teal-700/50 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-teal-100 font-medium text-sm">{data.name}</p>
          <p className="text-teal-300 text-sm">
            {fmt(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30 flex flex-col h-full">
      <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
        <Dna size={20} /> {title}
      </h3>
      
      <div className="flex flex-col items-center gap-6 flex-1">
        {/* Chart Section */}
        <div className="relative w-full max-w-[280px] sm:max-w-[350px] aspect-square [&_*]:outline-none [&_*]:focus:outline-none" style={{ minHeight: '280px' }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={280} className="outline-none focus:outline-none">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={window.innerWidth < 640 ? 80 : 100}
                innerRadius={window.innerWidth < 640 ? 56 : 70}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                animationBegin={0}
                animationDuration={reduceAnimations ? 0 : 800}
                isAnimationActive={!reduceAnimations}
                stroke="transparent"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colorMap[entry.name]}
                    className="cursor-pointer"
                    style={{ transition: reduceAnimations ? 'none' : 'opacity 0.2s' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text showing total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-2xl font-bold text-teal-100">
              {fmt(total)}
            </div>
            <div className="text-sm text-teal-400">
              samples
            </div>
          </div>
        </div>
        
        {/* Legend Section */}
        <div className="w-full overflow-hidden">
          <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
            {sortedItems.map(([label, value]) => {
              return (
                <div
                  key={label}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-700/40 border border-teal-700/20 cursor-pointer"
                  style={{ transition: reduceAnimations ? 'none' : 'background-color 0.2s' }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span 
                      className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-slate-900" 
                      style={{ backgroundColor: colorMap[label] }} 
                    />
                    <div className="text-sm font-medium text-teal-100 truncate">{label}</div>
                  </div>
                  <div className="text-base font-semibold text-teal-200 ml-3">{fmt(value)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};