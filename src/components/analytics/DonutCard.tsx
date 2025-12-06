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

export const DonutCard: React.FC<Props> = ({ title, dataMap, total }) => {
  const labels = Object.keys(dataMap);
  const values = Object.values(dataMap);
  
  // Generate unique colors for each label (no duplicates within this dataset)
  // NOTE: useMemo must be called BEFORE any early return!
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
            {labels.map((label, idx) => {
              const value = values[idx];
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={label} className="flex items-center justify-between bg-teal-900/40 px-3 py-2 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorMap[label] }} />
                    <div className="truncate">
                      <div className="text-sm text-teal-200 truncate">{label}</div>
                      <div className="text-xs text-teal-400">
                        {value} sample{value > 1 ? 's' : ''} ({pct}%)
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