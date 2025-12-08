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
      tooltip: { enabled: true },
    },
    cutout: '65%',
    maintainAspectRatio: true,
    responsive: true,
  };

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-b from-teal-900/60 to-slate-900/70 ring-1 ring-teal-600/40 shadow-lg">
      <h3 className="text-lg font-semibold text-teal-100 mb-3 flex items-center gap-2">
        <Dna size={18} /> {title} <span className="text-teal-300 ml-2">(n = {fmt(total)})</span>
      </h3>
      <div className="flex items-center gap-6 flex-col md:flex-row">
        <div className="w-48 h-48">
          <Doughnut data={chartData} options={options} />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
            {sortedItems.map(([label, value]) => {
              const pctStr = formatPercent(value, total);
              
              return (
                <div key={label} className="flex items-center justify-between bg-teal-900/40 px-3 py-2 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorMap[label] }} />
                    <div className="truncate">
                      <div className="text-sm text-teal-200 truncate">{label}</div>
                      <div className="text-xs text-teal-400">
                        {value} sample{value > 1 ? 's' : ''} ({pctStr}%)
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-teal-100">{fmt(value)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};