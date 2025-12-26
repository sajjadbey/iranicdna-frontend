import React, { useState } from 'react';
import { Terminal, PlayCircle, Loader2, AlertCircle, Info } from 'lucide-react';
import { qpadmService } from '../../services/qpadmService';
import type { QpAdmRun } from '../../types/qpadm';

interface QpAdmCommandInputProps {
  onRunComplete: (run: QpAdmRun) => void;
  canRun: boolean;
  runsRemaining: number;
}

export const QpAdmCommandInput: React.FC<QpAdmCommandInputProps> = ({ 
  onRunComplete, 
  canRun, 
  runsRemaining 
}) => {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCommand = (cmd: string) => {
    const lines = cmd.trim().split('\n').map(line => line.trim()).filter(line => line);
    const params: Record<string, string> = {};

    for (const line of lines) {
      const [key, value] = line.split('=').map(s => s.trim());
      if (key && value) {
        params[key.toLowerCase()] = value;
      }
    }

    // Validate required fields
    if (!params.target) {
      throw new Error('Missing required field: target');
    }
    if (!params.left) {
      throw new Error('Missing required field: left');
    }
    if (!params.right) {
      throw new Error('Missing required field: right');
    }

    // Parse dataset (geno)
    let dataset: '1240k' | 'HO' = '1240k';
    if (params.geno) {
      const genoLower = params.geno.toLowerCase();
      if (genoLower.includes('ho')) {
        dataset = 'HO';
      } else if (genoLower.includes('1240k')) {
        dataset = '1240k';
      }
    }

    // Parse populations
    const target = params.target;
    const sources = params.left.split(',').map(s => s.trim()).filter(s => s);
    const rights = params.right.split(',').map(s => s.trim()).filter(s => s);

    return {
      target_population: target,
      source_populations: sources,
      right_populations: rights,
      dataset_type: dataset,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canRun) {
      setError('Daily limit reached. Please try again tomorrow.');
      return;
    }

    if (!command.trim()) {
      setError('Please enter a command');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = parseCommand(command);
      
      // Validate
      if (params.source_populations.length < 2) {
        throw new Error('At least 2 source populations required');
      }
      if (params.right_populations.length < 5) {
        throw new Error('At least 5 right populations required');
      }

      const run = await qpadmService.createRun(params);
      onRunComplete(run);
      setCommand(''); // Clear on success
    } catch (err: any) {
      setError(err.message || 'Failed to run qpAdm analysis');
    } finally {
      setLoading(false);
    }
  };

  const exampleCommand = `geno=1240K
target=Hungary_Conqueror_Elite.SG
left=Estonia_BA.SG,Russia_Andronovo.SG,Russia_Krasnoyarsk_BA.SG
right=Mbuti.DG,Russia_DevilsCave_N.SG,Latvia_BA.AG,Scotland_N.AG,Uzbekistan_Bustan_BA.AG`;

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-teal-700/30 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Terminal className="w-6 h-6 text-teal-400" />
        <h2 className="text-2xl font-semibold text-white">Command Line Input</h2>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-blue-300 mb-2">Format:</p>
            <pre className="text-xs bg-slate-900/50 p-3 rounded overflow-x-auto">
              {exampleCommand}
            </pre>
            <p className="mt-2 text-xs text-slate-400">
              • <strong>geno</strong>: Dataset (1240K or HO)<br />
              • <strong>target</strong>: Target population<br />
              • <strong>left</strong>: Source populations (comma-separated, min 2)<br />
              • <strong>right</strong>: Right/outgroup populations (comma-separated, min 5)
            </p>
          </div>
        </div>
      </div>

      {/* Command Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          qpAdm Command *
        </label>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={exampleCommand}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white font-mono text-sm focus:border-teal-500 focus:outline-none resize-y"
        />
        <p className="text-xs text-slate-400 mt-2">
          Paste your qpAdm parameters in the format shown above
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !canRun}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          loading || !canRun
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting to Queue...
          </>
        ) : (
          <>
            <PlayCircle className="w-5 h-5" />
            Run Analysis ({runsRemaining} completed runs remaining)
          </>
        )}
      </button>
    </form>
  );
};