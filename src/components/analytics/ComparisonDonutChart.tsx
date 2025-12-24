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

export const ComparisonDonutChart: React.FC<Props> = ({ title, dataMap, total }) => {
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

  // Filter out segments with percentage < 3.6%
  const visibleLabels = useMemo(() => {
    return chartData.filter(item => {
      const pct = (item.value / total) * 100;
      return pct >= 3.6;
    });
  }, [chartData, total]);

  if (labels.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-700/95 border border-teal-500/50 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-teal-100 font-bold text-base">{data.name}</p>
          <p className="text-teal-300 text-sm">
            {fmt(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate positions for labels based on pie segment angles
  const labelPositions = useMemo(() => {
    return visibleLabels.map(item => {
      // Find the index in the full chartData
      const index = chartData.findIndex(d => d.name === item.name);
      
      // Calculate cumulative value up to and including half of current segment
      let cumulativeValue = 0;
      for (let i = 0; i < index; i++) {
        cumulativeValue += chartData[i].value;
      }
      
      // Add half of current segment to get midpoint
      const midValue = cumulativeValue + chartData[index].value / 2;
      
      // Convert to angle (0 to 2π), accounting for Recharts starting angle (90° = top)
      // Recharts starts at 90° and goes clockwise (negative direction)
      const angleRadians = (midValue / total) * 2 * Math.PI;
      
      // Adjust angle: start at top (90° = π/2) and go clockwise
      const adjustedAngle = Math.PI / 2 - angleRadians;
      
      // Position labels at a consistent radius around the donut
      // Use percentage-based radius for responsive sizing
      // The radius is the distance from center as a percentage of container dimension
      // For a chart with outerRadius at 40%, labels should be just outside at ~25% from center
      const radiusPercent = 25;
      
      return { item, angle: adjustedAngle, radiusPercent };
    });
  }, [visibleLabels, chartData, total]);

  return (
    <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-6 border border-teal-700/30 flex flex-col select-none">
      <h3 className="text-lg sm:text-xl font-bold text-teal-200 mb-3 sm:mb-4 flex items-center gap-2">
        <Dna className="w-5 h-5 sm:w-6 sm:h-6" /> {title}
      </h3>
      
      <div className="flex flex-col items-center gap-4 sm:gap-6">
        {/* Chart Section with Labels */}
        <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-square [&_*]:outline-none [&_*]:focus:outline-none">
          <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="40%"
                innerRadius="28%"
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                animationBegin={0}
                animationDuration={reduceAnimations ? 0 : 800}
                isAnimationActive={!reduceAnimations}
                stroke="transparent"
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
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
              <Tooltip 
                content={<CustomTooltip />} 
                animationDuration={0}
                isAnimationActive={false}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text showing total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-xl sm:text-2xl font-bold text-teal-100">
              {fmt(total)}
            </div>
            <div className="text-xs sm:text-sm text-teal-400">
              samples
            </div>
          </div>

          {/* Labels around the chart - responsive positioning */}
          <div className="absolute inset-0 pointer-events-none select-none">
            {labelPositions.map(({ item, angle, radiusPercent }) => {
              // Calculate position based on container size
              const x = Math.cos(angle) * radiusPercent;
              const y = -Math.sin(angle) * radiusPercent;
              
              // Convert angle to degrees for easier understanding
              const angleDeg = (angle * 180) / Math.PI;
              
              // Determine horizontal and vertical alignment based on angle
              let transformX = '-50%';
              let transformY = '-50%';
              
              // Right side (between -45° and 45°)
              if (angleDeg > -45 && angleDeg < 45) {
                transformX = '0%'; // Left-align (text extends right)
              }
              // Left side (between 135° and 225°)
              else if (angleDeg > 135 || angleDeg < -135) {
                transformX = '-100%'; // Right-align (text extends left)
              }
              
              // Top half
              if (angleDeg > 0) {
                transformY = '-100%'; // Align below the point
              }
              // Bottom half
              else {
                transformY = '0%'; // Align above the point
              }
              
              return (
                <div
                  key={item.name}
                  className="absolute whitespace-nowrap text-[10px] sm:text-xs font-semibold"
                  style={{
                    left: `calc(50% + ${x}%)`,
                    top: `calc(50% + ${y}%)`,
                    transform: `translate(${transformX}, ${transformY})`,
                  }}
                >
                  <span className="text-teal-100">
                    {item.name} {item.percentage}% ({item.value})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};