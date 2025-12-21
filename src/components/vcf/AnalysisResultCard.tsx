import React from 'react';
import { motion } from 'framer-motion';
import { CircleCheck, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import type { AnalysisResultCardProps } from '../../types/vcf';
import { formatTimestamp } from '../../utils/vcfHelpers';
import { AdmixtureChart } from './AdmixtureChart';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CircleCheck className="text-green-500" size={20} />;
    case 'failed':
      return <AlertCircle className="text-red-500" size={20} />;
    case 'processing':
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="text-blue-500" size={20} />
        </motion.div>
      );
    default:
      return <Clock className="text-amber-500" size={20} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-400 ring-green-500/30';
    case 'failed':
      return 'bg-red-500/20 text-red-400 ring-red-500/30';
    case 'processing':
      return 'bg-blue-500/20 text-blue-400 ring-blue-500/30';
    default:
      return 'bg-amber-500/20 text-amber-400 ring-amber-500/30';
  }
};

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  analysis,
}) => {
  const hasResults = analysis.results && Object.keys(analysis.results).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5 bg-slate-800/60 ring-1 ring-teal-600/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-teal-100">{analysis.sample_id}</h4>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ring-1 ${getStatusColor(analysis.status)}`}>
              {getStatusIcon(analysis.status)}
              <span className="capitalize">{analysis.status}</span>
            </div>
          </div>
          <div className="text-sm text-teal-400">
            <p>ID: {analysis.id}</p>
            <p>Uploaded: {formatTimestamp(analysis.created_at)}</p>
            {analysis.models_requested.length > 0 && (
              <p>Models: {analysis.models_requested.join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {analysis.status === 'failed' && analysis.error_message && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-red-300">{analysis.error_message}</p>
          </div>
        </div>
      )}

      {/* All Results with Charts */}
      {hasResults && (
        <div className="pt-4 border-t border-teal-600/20 space-y-6">
          {Object.entries(analysis.results!).map(([model, populations]) => (
            <div key={model}>
              <h5 className="text-md font-semibold text-teal-200 mb-3">{model} Results</h5>
              <AdmixtureChart results={analysis.results!} model={model} />
              
              {/* Detailed percentages */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(populations)
                  .sort((a, b) => b[1] - a[1])
                  .map(([pop, val]) => (
                    <div
                      key={pop}
                      className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-900/40"
                    >
                      <span className="text-sm text-teal-200">{pop}</span>
                      <span className="text-sm font-medium text-teal-100">{val.toFixed(2)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};