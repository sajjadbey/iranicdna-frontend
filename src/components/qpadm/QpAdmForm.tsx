import React, { useState, useEffect } from 'react';
import { qpadmService } from '../../services/qpadmService';
import type { QpAdmRun, QpAdmPopulations } from '../../types/qpadm';
import { PlayCircle, Loader2, AlertCircle, ChevronDown, X, User, Database } from 'lucide-react';
import { DNAFileSelector } from '../vcf/DNAFileSelector';

interface QpAdmFormProps {
  onRunComplete: (run: QpAdmRun) => void;
  canRun: boolean;
  runsRemaining: number;
}

export const QpAdmForm: React.FC<QpAdmFormProps> = ({ onRunComplete, canRun, runsRemaining }) => {
  const [populations, setPopulations] = useState<QpAdmPopulations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dataset, setDataset] = useState<'1240k' | 'HO'>('1240k');
  const [targetMode, setTargetMode] = useState<'population' | 'dna'>('population');
  const [target, setTarget] = useState('');
  const [selectedDNAFileId, setSelectedDNAFileId] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [rights, setRights] = useState<string[]>(['Mbuti.DG']);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeField, setActiveField] = useState<'target' | 'source' | 'right' | null>(null);
  const [sourceTextInput, setSourceTextInput] = useState('');
  const [rightTextInput, setRightTextInput] = useState('');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showRightDropdown, setShowRightDropdown] = useState(false);

  useEffect(() => {
    loadPopulations();
  }, [dataset]);

  const loadPopulations = async () => {
    try {
      const data = await qpadmService.getPopulations(dataset);
      setPopulations(data);
    } catch (err) {
      setError('Failed to load populations');
    }
  };

  const handleDatasetChange = (newDataset: '1240k' | 'HO') => {
    setDataset(newDataset);
    // Reset selections when dataset changes
    setTarget('');
    setSelectedDNAFileId(null);
    setSources([]);
    setRights(['Mbuti.DG']);
  };

  const handleTargetModeChange = (mode: 'population' | 'dna') => {
    setTargetMode(mode);
    // Clear selections when mode changes
    setTarget('');
    setSelectedDNAFileId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canRun) {
      setError('Daily limit reached. Please try again tomorrow.');
      return;
    }

    if (targetMode === 'population' && !target) {
      setError('Please select a target population');
      return;
    }

    if (targetMode === 'dna' && !selectedDNAFileId) {
      setError('Please select your DNA file');
      return;
    }

    if (sources.length < 2) {
      setError('Please select at least 2 source populations');
      return;
    }

    if (rights.length < 5) {
      setError('Please select at least 5 right populations');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData: any = {
        source_populations: sources,
        right_populations: rights,
        dataset_type: dataset,
      };

      if (targetMode === 'population') {
        requestData.target_population = target;
      } else {
        requestData.dna_file_id = selectedDNAFileId;
      }

      const run = await qpadmService.createRun(requestData);
      
      // Show success message if queued
      if (run.status === 'queued' && run.queue_info) {
        setError(null); // Clear any errors
        // You could show a success toast here
      }
      
      onRunComplete(run);
    } catch (err: any) {
      setError(err.message || 'Failed to run qpAdm analysis');
    } finally {
      setLoading(false);
    }
  };

  const addPopulation = (field: 'target' | 'source' | 'right', pop: string) => {
    if (field === 'target') {
      setTarget(pop);
    } else if (field === 'source') {
      if (!sources.includes(pop)) {
        setSources([...sources, pop]);
      }
    } else {
      if (!rights.includes(pop)) {
        setRights([...rights, pop]);
      }
    }
    setActiveField(null);
    setSearchTerm('');
  };

  const removeSource = (pop: string) => {
    setSources(sources.filter(s => s !== pop));
  };

  const removeRight = (pop: string) => {
    if (pop !== 'Mbuti.DG') { // Don't allow removing Mbuti.DG
      setRights(rights.filter(r => r !== pop));
    }
  };

  const handleSourceTextAdd = () => {
    if (!sourceTextInput.trim()) return;
    
    const newPops = sourceTextInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p && !sources.includes(p) && p !== target && !rights.includes(p));
    
    if (newPops.length > 0) {
      setSources([...sources, ...newPops]);
      setSourceTextInput('');
    }
  };

  const handleRightTextAdd = () => {
    if (!rightTextInput.trim()) return;
    
    const newPops = rightTextInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p && !rights.includes(p) && p !== target && !sources.includes(p));
    
    if (newPops.length > 0) {
      setRights([...rights, ...newPops]);
      setRightTextInput('');
    }
  };

  const handleSourceTextKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSourceTextAdd();
    }
  };

  const handleRightTextKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRightTextAdd();
    }
  };

  const filteredPopulations = populations?.populations.filter(pop =>
    pop.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-teal-700/30 rounded-xl p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-4">Configure qpAdm Analysis</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Dataset Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Dataset Type *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleDatasetChange('1240k')}
            className={`px-4 py-3 rounded-lg font-medium transition-all ${
              dataset === '1240k'
                ? 'bg-teal-500/20 border-2 border-teal-500 text-teal-300'
                : 'bg-slate-700 border-2 border-slate-600 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className="text-center">
              <div className="font-bold">1240k</div>
              <div className="text-xs mt-1">Allen Ancient DNA Resource</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleDatasetChange('HO')}
            className={`px-4 py-3 rounded-lg font-medium transition-all ${
              dataset === 'HO'
                ? 'bg-teal-500/20 border-2 border-teal-500 text-teal-300'
                : 'bg-slate-700 border-2 border-slate-600 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className="text-center">
              <div className="font-bold">HO</div>
              <div className="text-xs mt-1">Human Origins</div>
            </div>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {dataset === '1240k' 
            ? '1240k panel: ~1.2 million SNPs, includes ancient and modern samples'
            : 'HO panel: ~600k SNPs, focuses on modern and some ancient populations'
          }
        </p>
      </div>

      {/* Target Selection Mode */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Target Type *
        </label>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => handleTargetModeChange('population')}
            className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              targetMode === 'population'
                ? 'bg-teal-500/20 border-2 border-teal-500 text-teal-300'
                : 'bg-slate-700 border-2 border-slate-600 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Dataset Population</span>
          </button>
          <button
            type="button"
            onClick={() => handleTargetModeChange('dna')}
            className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              targetMode === 'dna'
                ? 'bg-teal-500/20 border-2 border-teal-500 text-teal-300'
                : 'bg-slate-700 border-2 border-slate-600 text-slate-400 hover:border-slate-500'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Your DNA</span>
          </button>
        </div>

        {/* Target Population Selection */}
        {targetMode === 'population' && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveField(activeField === 'target' ? null : 'target')}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-left text-white hover:border-teal-500 focus:border-teal-500 focus:outline-none transition-colors flex items-center justify-between"
            >
              <span className={target ? 'text-white' : 'text-slate-400'}>
                {target || 'Select target population'}
              </span>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </button>

            {activeField === 'target' && (
              <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-auto">
                <input
                  type="text"
                  placeholder="Search populations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 text-white border-b border-slate-600 focus:outline-none"
                />
                <div className="max-h-48 overflow-auto">
                  {filteredPopulations.map(pop => (
                    <button
                      key={pop}
                      type="button"
                      onClick={() => addPopulation('target', pop)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 transition-colors"
                    >
                      {pop}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DNA File Selection */}
        {targetMode === 'dna' && (
          <div>
            <p className="text-sm text-slate-400 mb-3">
              Select your uploaded DNA file to analyze your ancestry composition
            </p>
            <DNAFileSelector
              selectedFileId={selectedDNAFileId}
              onFileSelect={setSelectedDNAFileId}
              onError={setError}
            />
          </div>
        )}
      </div>

      {/* Source Populations */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Source Populations * (2-10)
        </label>
        
        {sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {sources.map(pop => (
              <span key={pop} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-sm">
                {pop}
                <button
                  type="button"
                  onClick={() => removeSource(pop)}
                  className="hover:text-teal-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Text Input for comma-separated values */}
        <div className="mb-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type population names separated by commas (e.g., Yamnaya_Samara, WHG, Anatolia_N)"
              value={sourceTextInput}
              onChange={(e) => setSourceTextInput(e.target.value)}
              onKeyPress={handleSourceTextKeyPress}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleSourceTextAdd}
              disabled={!sourceTextInput.trim()}
              className="px-6 py-3 bg-teal-500/20 text-teal-300 rounded-lg hover:bg-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tip: Press Enter to add populations
          </p>
        </div>

        {/* Dropdown selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowSourceDropdown(!showSourceDropdown);
              setActiveField(showSourceDropdown ? null : 'source');
            }}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-left text-slate-400 hover:border-teal-500 focus:border-teal-500 focus:outline-none transition-colors flex items-center justify-between"
          >
            <span>Or select from list</span>
            <ChevronDown className="w-5 h-5" />
          </button>

          {activeField === 'source' && showSourceDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-auto">
              <input
                type="text"
                placeholder="Search populations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 text-white border-b border-slate-600 focus:outline-none"
              />
              <div className="max-h-48 overflow-auto">
                {filteredPopulations.filter(pop => pop !== target && !sources.includes(pop) && !rights.includes(pop)).map(pop => (
                  <button
                    key={pop}
                    type="button"
                    onClick={() => {
                      addPopulation('source', pop);
                      setShowSourceDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 transition-colors"
                  >
                    {pop}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Populations */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Right Populations (Outgroups) * (5-20)
        </label>
        
        {rights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {rights.map(pop => (
              <span key={pop} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                {pop}
                {pop !== 'Mbuti.DG' && (
                  <button
                    type="button"
                    onClick={() => removeRight(pop)}
                    className="hover:text-blue-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Text Input for comma-separated values */}
        <div className="mb-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type population names separated by commas (e.g., Mbuti.DG, Ust_Ishim.DG, MA1)"
              value={rightTextInput}
              onChange={(e) => setRightTextInput(e.target.value)}
              onKeyPress={handleRightTextKeyPress}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleRightTextAdd}
              disabled={!rightTextInput.trim()}
              className="px-6 py-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tip: Press Enter to add populations
          </p>
        </div>

        {/* Dropdown selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowRightDropdown(!showRightDropdown);
              setActiveField(showRightDropdown ? null : 'right');
            }}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-left text-slate-400 hover:border-teal-500 focus:border-teal-500 focus:outline-none transition-colors flex items-center justify-between"
          >
            <span>Or select from list</span>
            <ChevronDown className="w-5 h-5" />
          </button>

          {activeField === 'right' && showRightDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-auto">
              <input
                type="text"
                placeholder="Search populations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 text-white border-b border-slate-600 focus:outline-none"
              />
              <div className="max-h-48 overflow-auto">
                {filteredPopulations.filter(pop => pop !== target && !sources.includes(pop) && !rights.includes(pop)).map(pop => (
                  <button
                    key={pop}
                    type="button"
                    onClick={() => {
                      addPopulation('right', pop);
                      setShowRightDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 transition-colors"
                  >
                    {pop}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          * Mbuti.DG (basal African population) is required and cannot be removed
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