import React, { useRef } from 'react';
import type { QpAdmRun } from '../../types/qpadm';
import { CheckCircle, XCircle, Download, TrendingUp, User, Database } from 'lucide-react';
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

  // Sort ancestry breakdown by percentage (descending order)
  const sortedAncestry = [...ancestry_breakdown].sort((a, b) => b.percentage - a.percentage);

  // Prepare data for donut chart (using sorted data)
  const chartData = sortedAncestry.map((item, idx) => ({
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
      const sanitizedTarget = (target || 'result').replace(/[^a-zA-Z0-9_-]/g, '_');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qpadm_${sanitizedTarget}_${new Date().toISOString().split('T')[0]}.png`;
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
          <div className="flex items-center gap-3 mb-4">
            {run.user_dna_file_id ? (
              <User className="w-6 h-6 text-teal-400" />
            ) : (
              <Database className="w-6 h-6 text-blue-400" />
            )}
            <h2 className="text-2xl font-mono text-slate-200">
              Target: <span className="text-white font-bold">
                {run.user_dna_file_id 
                  ? (run.user_dna_filename || 'Your DNA')
                  : (target || run.target_population)
                }
              </span>
            </h2>
          </div>
          {run.user_dna_file_id && (
            <p className="text-sm text-teal-400/70 font-mono mb-2">
              Personal DNA Analysis
            </p>
          )}
          
          <div className="text-base font-mono space-y-2">
            {/* P-Value Display */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400">P-Value:</span>
              <span className={`font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {p_value !== null && p_value !== undefined ? (
                  <>
                    {p_value.toExponential(2)} / {p_value < 0.0001 ? '<0.0001' : p_value.toFixed(4)}
                  </>
                ) : 'N/A'}
              </span>
              <span className="text-slate-500">||</span>
              <span className={`font-semibold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {passed ? (
                  'Pass > 0.05'
                ) : (
                  p_value !== null && p_value <= 0.05 ? 'Fail: p ≤ 0.05 (Poor model fit)' : 'Fail'
                )}
              </span>
            </div>
            
            {/* Show interpretation when rejected */}
            {!passed && p_value !== null && p_value < 0.05 && (
              <div className="text-xs text-slate-400 pl-20">
                The source populations do not adequately explain the target population's ancestry.
                {p_value < 1e-50 && ' (Extremely poor fit - consider different source populations)'}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ancestry Breakdown List */}
          <div className="space-y-4">
            {sortedAncestry.length > 0 ? (
              sortedAncestry.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-mono font-bold text-white min-w-[70px] pt-1">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-mono text-slate-200 text-wrap flex-1">
                          {item.source}
                        </span>
                      </div>
                      
                      {/* Statistics row with more precision */}
                      <div className="flex items-center gap-3 mb-2 text-xs font-mono">
                        {item.std_error !== null && item.std_error !== undefined && (
                          <span className="text-slate-400">SE:{item.std_error.toFixed(4)}</span>
                        )}
                        {item.z_score !== null && item.z_score !== undefined && (
                          <span className="text-slate-400">Z: {item.z_score.toFixed(2)}</span>
                        )}
                        {item.coef_p_value !== null && item.coef_p_value !== undefined && (
                          <span className="text-slate-400">
                            p: {item.coef_p_value < 0.0001 ? item.coef_p_value.toExponential(2) : item.coef_p_value.toFixed(4)}
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
            {sortedAncestry.length > 0 && (
              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Total:</span>
                  <span className="text-xl font-bold text-white">
                    {sortedAncestry.reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Donut Chart */}
          {sortedAncestry.length > 0 && (
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {passed ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-green-400 font-mono font-semibold">
                      Model Accepted (p &gt; 0.05)
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Source populations adequately explain target ancestry
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-red-400 font-mono font-semibold">
                      Model Rejected (p ≤ 0.05)
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {p_value !== null && p_value < 1e-10 ? (
                        <>Extremely poor fit - try different source populations</>
                      ) : (
                        <>Suggested: Add more sources or adjust populations</>
                      )}
                    </div>
                  </div>
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