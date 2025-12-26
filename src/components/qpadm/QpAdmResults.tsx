import React, { useRef } from 'react';
import type { QpAdmRun } from '../../types/qpadm';
import { CheckCircle, XCircle, Download, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface QpAdmResultsProps {
  run: QpAdmRun;
}

// Color palette for ancestry components
const COLORS = [
  '#60A5FA', // blue-400
  '#F97316', // orange-500
  '#10B981', // emerald-500
  '#A78BFA', // violet-400
  '#64748B', // slate-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
  '#F59E0B', // amber-500
  '#6366F1', // indigo-500
  '#EF4444', // red-500
];

export const QpAdmResults: React.FC<QpAdmResultsProps> = ({ run }) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  if (!run.results) {
    return null;
  }

  const { p_value, passed, ancestry_breakdown = [], target } = run.results;

  // Prepare data for donut chart
  const chartData = ancestry_breakdown.map((item, idx) => ({
    name: item.source,
    value: item.percentage,
    color: COLORS[idx % COLORS.length],
  }));

  // Export as PNG using html-to-image (supports modern CSS including oklch)
  const exportAsPNG = async () => {
    if (!resultsRef.current) return;

    try {
      // Dynamically import html-to-image
      const { toPng } = await import('html-to-image');
      
      // Generate PNG with high quality settings
      const dataUrl = await toPng(resultsRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#0f172a',
        cacheBust: true,
      });

      // Download the image
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qpadm_${target}_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export as PNG:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportAsPNG}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export as PNG
        </button>
      </div>

      {/* Results Container */}
      <div 
        ref={resultsRef}
        className="bg-slate-900 border border-slate-700 rounded-xl p-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-mono text-slate-200 mb-4">
            Target: <span className="text-white font-bold">{target || run.target_population}</span>
          </h2>
          
          <div className="flex items-center gap-8 text-lg font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">p-value:</span>
              <span className={`font-bold ${passed ? 'text-white' : 'text-red-400'}`}>
                {p_value?.toFixed(4) || 'N/A'}
              </span>
              {passed ? (
                <span className="text-amber-400 font-bold">(OK)</span>
              ) : (
                <span className="text-red-400 font-bold">(FAIL)</span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ancestry Breakdown List */}
          <div className="space-y-4">
            {ancestry_breakdown.length > 0 ? (
              ancestry_breakdown.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-mono font-bold text-white min-w-[70px] pt-1">
                      {item.percentage.toFixed(1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-mono text-slate-200 text-wrap flex-1">
                          {item.source}
                        </span>
                        {item.std_error !== null && (
                          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                            SE: {item.std_error.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(0, Math.min(100, item.percentage))}%`,
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 font-mono">
                No positive ancestry coefficients found
              </div>
            )}

            {/* Total */}
            {ancestry_breakdown.length > 0 && (
              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Total:</span>
                  <span className="text-xl font-bold text-white">
                    {ancestry_breakdown.reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Donut Chart */}
          {ancestry_breakdown.length > 0 && (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                    }}
                    formatter={(value: number | undefined) => value ? `${value.toFixed(2)}%` : 'N/A'}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                    formatter={(value) => (
                      <span className="text-slate-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {passed ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-mono font-semibold">
                    Model Accepted (p &gt; 0.05)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-mono font-semibold">
                    Model Rejected (p ≤ 0.05)
                  </span>
                </>
              )}
            </div>
            
            {run.execution_time_seconds && (
              <span className="text-sm text-slate-400 font-mono">
                Execution time: {run.execution_time_seconds.toFixed(2)}s
              </span>
            )}
          </div>
        </div>

        {/* Dataset Info */}
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-4 text-sm font-mono text-slate-400">
            <div>
              <span>Dataset: </span>
              <span className="text-teal-400 font-semibold">{run.dataset_type}</span>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Sources: </span>
              <span className="text-slate-300">
                {run.source_populations.join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};