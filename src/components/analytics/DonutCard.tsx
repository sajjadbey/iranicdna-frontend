import React, { useMemo } from 'react';
import { Chart as ChartJS, Tooltip, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Dna } from 'lucide-react';
import { fmt, generateUniqueColors } from '../../utils/colors';

ChartJS.register(Tooltip, ArcElement);

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


export const DonutCard: React.FC<Props> = ({ title, dataMap, total }) => {
  
  const sortedItems = useMemo(() => {
    return Object.entries(dataMap)
      .sort((a, b) => b[1] - a[1]);
  }, [dataMap]);

  const labels = useMemo(() => sortedItems.map(([label]) => label), [sortedItems]);
  const values = useMemo(() => sortedItems.map(([, value]) => value), [sortedItems]);
  
  const colorMap = useMemo(() => generateUniqueColors(labels), [labels]);

  if (labels.length === 0) return null;

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(label => colorMap[label]),
        borderWidth: 2,
        borderColor: '#004d40',
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const pct = formatPercent(value, total);
            return `${label}: ${fmt(value)} (${pct}%)`;
          }
        }
      },
    },
    cutout: '70%',
    maintainAspectRatio: true,
    responsive: true,
  };

  return (
    <div className="bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30 flex flex-col h-full">
      <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
        <Dna size={20} /> {title}
      </h3>
      
      <div className="flex flex-col items-center gap-6 flex-1">
        {/* Chart Section */}
        <div className="relative w-full max-w-[280px] aspect-square">
          <Doughnut data={chartData} options={options} />
          {/* Center text showing total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-3xl font-bold text-teal-100">{fmt(total)}</div>
            <div className="text-sm text-teal-400">samples</div>
          </div>
        </div>
        
        {/* Legend Section */}
        <div className="w-full">
          <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedItems.map(([label, value]) => {
              const pctStr = formatPercent(value, total);
              
              return (
                <div 
                  key={label} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-700/40 hover:bg-slate-700/60 transition-colors border border-teal-700/20"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span 
                      className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-slate-900" 
                      style={{ backgroundColor: colorMap[label] }} 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-teal-100 truncate">{label}</div>
                      <div className="text-xs text-teal-400/80">
                        {pctStr}%
                      </div>
                    </div>
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