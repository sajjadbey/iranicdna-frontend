import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { qpadmService } from '../services/qpadmService';
import { QpAdmForm } from '../components/qpadm/QpAdmForm';
import { QpAdmCommandInput } from '../components/qpadm/QpAdmCommandInput';
import { QpAdmResults } from '../components/qpadm/QpAdmResults';
import { QpAdmHistory } from '../components/qpadm/QpAdmHistory';
import { QpAdmQueueInfo } from '../components/qpadm/QpAdmQueueInfo';
import type { QpAdmRun, QpAdmStatus } from '../types/qpadm';
import { Info, TrendingUp, Clock } from 'lucide-react';

export const QpAdmPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<QpAdmStatus | null>(null);
  const [currentRun, setCurrentRun] = useState<QpAdmRun | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'command' | 'history'>('form');

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    loadStatus();
  }, [user, navigate]);

  const loadStatus = async () => {
    try {
      const statusData = await qpadmService.getStatus();
      setStatus(statusData);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const handleRunComplete = (run: QpAdmRun) => {
    setCurrentRun(run);
    loadStatus(); // Refresh usage status
    // Results are shown within the current tab (form or command)
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            qpAdm Population Analysis
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Estimate ancestry proportions from different source populations using the powerful qpAdm statistical tool
          </p>
        </div>

        {/* Usage Status */}
        {status && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-slate-800/60 border border-teal-700/30 rounded-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-teal-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Daily Usage</h3>
                    <p className="text-sm text-slate-400">
                      {status.runs_remaining_today} of {status.daily_limit} completed runs remaining today
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Only successful completions count towards your limit
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>Resets at midnight UTC</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-teal-400 h-full transition-all duration-500"
                  style={{ width: `${(status.runs_used_today / status.daily_limit) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-blue-300 mb-1">What is qpAdm?</p>
                <p>
                  qpAdm is a statistical tool that estimates ancestry proportions by modeling a target population as a 
                  mixture of source populations. It's widely used in population genetics research to understand 
                  ancient and modern population histories.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex gap-2 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'form'
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Form Input
            </button>
            <button
              onClick={() => setActiveTab('command')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'command'
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Command Input
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'form' && (
            <div className="space-y-8">
              <QpAdmForm
                onRunComplete={handleRunComplete}
                canRun={status?.can_run ?? false}
                runsRemaining={status?.runs_remaining_today ?? 0}
              />
              
              {currentRun && currentRun.status === 'queued' && (
                <QpAdmQueueInfo run={currentRun} />
              )}
              
              {currentRun && currentRun.status === 'completed' && currentRun.results && (
                <QpAdmResults run={currentRun} />
              )}
            </div>
          )}

          {activeTab === 'command' && (
            <div className="space-y-8">
              <QpAdmCommandInput
                onRunComplete={handleRunComplete}
                canRun={status?.can_run ?? false}
                runsRemaining={status?.runs_remaining_today ?? 0}
              />
              
              {currentRun && currentRun.status === 'queued' && (
                <QpAdmQueueInfo run={currentRun} />
              )}
              
              {currentRun && currentRun.status === 'completed' && currentRun.results && (
                <QpAdmResults run={currentRun} />
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <QpAdmHistory onSelectRun={(run) => {
              setCurrentRun(run);
              setActiveTab('form');
            }} />
          )}
        </div>

        {/* Information Section */}
        <div className="max-w-4xl mx-auto mt-12 space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">How qpAdm Works</h3>
            <div className="space-y-3 text-slate-300">
              <p>
                <strong className="text-teal-400">Target Population:</strong> The population you want to analyze for ancestry composition.
              </p>
              <p>
                <strong className="text-teal-400">Source Populations:</strong> Potential ancestral populations that may have contributed to the target (2-10 required).
              </p>
              <p>
                <strong className="text-teal-400">Right Populations (Outgroups):</strong> Reference populations that help distinguish ancestry contributions (5-20 required, must start with Mbuti.DG).
              </p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Interpreting Results</h3>
            <div className="space-y-3 text-slate-300">
              <p>
                <strong className="text-teal-400">P-value (Tail Probability):</strong> Values above 0.05 indicate a good model fit.
              </p>
              <p>
                <strong className="text-teal-400">Coefficients:</strong> Represent the proportion of ancestry from each source population (should sum to ~100%).
              </p>
              <p>
                <strong className="text-teal-400">Standard Errors:</strong> Lower values indicate more precise estimates.
              </p>
              <p>
                <strong className="text-teal-400">Feasible Models:</strong> All coefficients should be positive for a valid model.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};