import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { AdmixtureChartProps } from '../../types/vcf';
import { generateUniqueColors } from '../../utils/colors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AdmixtureChart: React.FC<AdmixtureChartProps> = ({ results, model }) => {
  const modelResults = results[model];

  const chartData = useMemo(() => {
    if (!modelResults) return null;

    const populations = Object.keys(modelResults).sort((a, b) => modelResults[b] - modelResults[a]);
    const values = populations.map(pop => modelResults[pop]);
    const colorMap = generateUniqueColors(populations);
    const colors = populations.map(pop => colorMap[pop]);

    return {
      labels: populations,
      datasets: [
        {
          label: 'Admixture %',
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(c => c),
          borderWidth: 1,
        },
      ],
    };
  }, [modelResults]);

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.parsed.x.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#99f6e4',
          callback: (value: any) => `${value}%`,
        },
        grid: {
          color: 'rgba(20, 184, 166, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#99f6e4',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  if (!chartData) {
    return (
      <div className="text-center text-teal-400 py-4">
        No results available for {model}
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};