import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Dna } from 'lucide-react';
import { fmt, generateUniqueColors } from '../../utils/colors';
import { motion } from 'framer-motion';

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

  if (labels.length === 0) return null;

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

  const renderCustomLabel = (entry: any) => {
    const { cx, cy, midAngle, outerRadius, percentage, name } = entry;
    const RADIAN = Math.PI / 180;
    
    // Responsive radius - smaller on mobile
    const isMobile = window.innerWidth < 640;
    const labelOffset = isMobile ? 20 : 30;
    const radius = outerRadius + labelOffset;
    
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is significant enough
    if (parseFloat(percentage) < 3) return null;

    const textAnchor = x > cx ? 'start' : 'end';

    return (
      <text
        x={x}
        y={y}
        fill="#99f6e4"
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-[10px] sm:text-xs font-semibold"
        style={{ pointerEvents: 'none' }}
      >
        {name} {percentage}%
      </text>
    );
  };

  return (
    <div className="bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30 flex flex-col h-full">
      <motion.h3
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2"
      >
        <Dna size={20} /> {title}
      </motion.h3>
      
      <div className="flex flex-col items-center gap-6 flex-1">
        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative w-full max-w-[280px] sm:max-w-[350px] aspect-square [&_*]:outline-none [&_*]:focus:outline-none"
        >
          <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={window.innerWidth < 640 ? 80 : 100}
                innerRadius={window.innerWidth < 640 ? 56 : 70}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-in-out"
                stroke="transparent"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colorMap[entry.name]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text showing total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-2xl font-bold text-teal-100"
            >
              {fmt(total)}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm text-teal-400"
            >
              samples
            </motion.div>
          </div>
        </motion.div>
        
        {/* Legend Section */}
        <div className="w-full overflow-hidden">
          <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
            {sortedItems.map(([label, value], index) => {
              const pctStr = formatPercent(value, total);
              
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-700/40 hover:bg-slate-700/60 transition-colors border border-teal-700/20 cursor-pointer"
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};