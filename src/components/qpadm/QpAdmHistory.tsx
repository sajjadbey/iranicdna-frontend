import React, { useState, useEffect, useCallback } from 'react';
import { qpadmService } from '../../services/qpadmService';
import type { QpAdmRun } from '../../types/qpadm';
import { Clock, CheckCircle, XCircle, Loader2, Eye, RefreshCw, AlertCircle } from 'lucide-react';

interface QpAdmHistoryProps {
  onSelectRun: (run: QpAdmRun) => void;
}

export const QpAdmHistory: React.FC<QpAdmHistoryProps> = ({ onSelectRun }) => {
  const [runs, setRuns] = useState<QpAdmRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRuns = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const data = await qpadmService.getRuns();
      console.log('Loaded runs:', data); // Debug log
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setRuns(data);
      } else {
        console.error('API returned non-array data:', data);
        setRuns([]);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Failed to load runs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load history');
      setRuns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRuns();
    
    // Auto-refresh every 10 seconds if there are processing/queued tasks
    const interval = setInterval(() => {
      // Check current runs state without adding it to dependencies
      setRuns(currentRuns => {
        const hasActiveRuns = currentRuns.some(run => 
          run.status === 'processing' || run.status === 'queued'
        );
        
        if (hasActiveRuns) {
          loadRuns(true);
        }
        
        // Return unchanged to avoid re-render
        return currentRuns;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [loadRuns]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string, queueInfo?: any) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Done
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Failed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            Ongoing
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Ongoing {queueInfo?.position_in_queue ? `(#${queueInfo.position_in_queue})` : ''}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-500/20 text-slate-300 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Ongoing
          </span>
        );
    }
  };

  const handleRefresh = () => {
    loadRuns(true);
  };

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-teal-700/30 rounded-xl p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto mb-4" />
        <p className="text-slate-400">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/60 border border-red-700/30 rounded-xl p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Failed to Load History</h3>
        <p className="text-slate-400 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!Array.isArray(runs) || runs.length === 0) {
    return (
      <div className="bg-slate-800/60 border border-teal-700/30 rounded-xl p-12 text-center">
        <Clock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Analysis History</h3>
        <p className="text-slate-400 mb-4">Your qpAdm analysis history will appear here.</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          Analysis History ({runs.length})
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      {Array.isArray(runs) && runs.map(run => (
        <div
          key={run.id}
          className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 hover:border-teal-500/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white">
                  Target: {run.target_population}
                </h3>
                <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded">
                  {run.dataset_type}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {formatDate(run.created_at)}
              </p>
            </div>
            {getStatusBadge(run.status, run.queue_info)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Sources ({run.source_populations.length})</p>
              <div className="flex flex-wrap gap-1">
                {run.source_populations.slice(0, 3).map(pop => (
                  <span key={pop} className="text-xs px-2 py-1 bg-teal-500/20 text-teal-300 rounded">
                    {pop}
                  </span>
                ))}
                {run.source_populations.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded">
                    +{run.source_populations.length - 3} more
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Rights ({run.right_populations.length})</p>
              <div className="flex flex-wrap gap-1">
                {run.right_populations.slice(0, 3).map(pop => (
                  <span key={pop} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                    {pop}
                  </span>
                ))}
                {run.right_populations.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded">
                    +{run.right_populations.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {run.status === 'completed' && run.results && (
            <div className={`flex items-center justify-between p-3 rounded-lg mb-4 ${
              run.results.passed 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <div className="text-sm">
                <span className="text-slate-400">P-value: </span>
                <span className={`font-semibold ${
                  run.results.passed ? 'text-green-300' : 'text-red-300'
                }`}>
                  {run.results.p_value?.toFixed(6) || 'N/A'}
                </span>
                <span className={`ml-2 text-xs ${
                  run.results.passed ? 'text-green-400' : 'text-red-400'
                }`}>
                  {run.results.passed ? '(Passed)' : '(Failed)'}
                </span>
              </div>
              {run.execution_time_seconds && (
                <div className="text-sm text-slate-400">
                  {run.execution_time_seconds.toFixed(2)}s
                </div>
              )}
            </div>
          )}

          {/* Queued Info */}
          {run.status === 'queued' && run.queue_info && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
              <div className="text-sm text-yellow-300">
                <p className="font-semibold mb-1">In Queue</p>
                <div className="flex items-center justify-between text-xs">
                  <span>Position: #{run.queue_info.position_in_queue}</span>
                  <span>{run.queue_info.tasks_ahead} task(s) ahead</span>
                  <span>~{run.queue_info.estimated_wait_minutes} min wait</span>
                </div>
              </div>
            </div>
          )}

          {/* Processing Info */}
          {run.status === 'processing' && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
              <div className="text-sm text-blue-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analysis is currently running...</span>
              </div>
            </div>
          )}

          {/* Failed Info */}
          {run.status === 'failed' && run.error_message && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
              <p className="text-sm text-red-300 font-semibold mb-1">Error:</p>
              <p className="text-sm text-red-300">{run.error_message}</p>
              <p className="text-xs text-red-400 mt-2">This task did not count against your daily limit.</p>
            </div>
          )}

          {/* View Results Button */}
          {run.status === 'completed' && (
            <button
              onClick={() => onSelectRun(run)}
              className="w-full py-2 px-4 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Results
            </button>
          )}
        </div>
      ))}
    </div>
  );
};