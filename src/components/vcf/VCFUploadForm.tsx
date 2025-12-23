import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { VCFUploadFormProps } from '../../types/vcf';
import { uploadVCFFileWithDNAFile } from '../../utils/vcfHelpers';
import { DNAFileSelector } from './DNAFileSelector';
import { useAuth } from '../../contexts/AuthContext';

export const VCFUploadForm: React.FC<VCFUploadFormProps> = ({ onUploadSuccess, onUploadError }) => {
  const { user } = useAuth();
  const [selectedDNAFileId, setSelectedDNAFileId] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['K12b']);
  const [tolerance, setTolerance] = useState(0.001);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onUploadError('Please sign in to use this tool');
      return;
    }

    if (!selectedDNAFileId) {
      onUploadError('Please select a DNA file from your profile');
      return;
    }

    if (!sampleId.trim()) {
      onUploadError('Please enter a sample ID');
      return;
    }

    setUploading(true);

    try {
      const result = await uploadVCFFileWithDNAFile(
        selectedDNAFileId,
        sampleId.trim(),
        selectedModels,
        tolerance
      );

      onUploadSuccess(result);
      
      // Reset form
      setSelectedDNAFileId(null);
      setSampleId('');
      setSelectedModels(['K12b']);
      setTolerance(0.001);
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="rounded-xl p-6 bg-slate-800/60 ring-1 ring-teal-600/30"
    >
      <h3 className="text-xl font-semibold text-teal-100 mb-4">Select DNA File</h3>

      {!user ? (
        <div className="mb-6 p-4 rounded-lg bg-amber-900/20 border border-amber-500/30 text-center">
          <p className="text-amber-200 text-sm">Please sign in to use this tool</p>
        </div>
      ) : (
        <>
          {/* Format Notice */}
          <div className="mb-4 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
            <p className="text-sm text-blue-200 font-semibold">Select Your File</p>
            <p className="text-xs text-blue-200/90 mt-2">
              Choose from your uploaded DNA files. Upload files in your Profile page first if you haven't already.
            </p>
          </div>

          {/* DNA File Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-teal-200 mb-2">
              Your DNA Files
            </label>
            <DNAFileSelector
              selectedFileId={selectedDNAFileId}
              onFileSelect={setSelectedDNAFileId}
              onError={onUploadError}
            />
          </div>
        </>
      )}

      {/* Sample ID Input */}
      <div className="mb-6">
        <label htmlFor="sampleId" className="block text-sm font-medium text-teal-200 mb-2">
          Sample ID *
        </label>
        <input
          id="sampleId"
          type="text"
          value={sampleId}
          onChange={(e) => setSampleId(e.target.value)}
          placeholder="Enter sample identifier"
          className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-teal-600/30 text-teal-100 placeholder-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>

      {/* Model Selection - K12b only, always selected */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-teal-200 mb-2">
          Analysis Model
        </label>
        <div className="p-3 rounded-lg bg-slate-900/40 border border-teal-600/30">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="w-4 h-4 text-teal-500 bg-slate-800 border-teal-600/30 rounded"
            />
            <span className="text-sm text-teal-200">K12b - 12 ancestral populations</span>
          </div>
        </div>
      </div>

      {/* Tolerance Input */}
      <div className="mb-6">
        <label htmlFor="tolerance" className="block text-sm font-medium text-teal-200 mb-2">
          Tolerance
        </label>
        <input
          id="tolerance"
          type="number"
          step="0.0001"
          min="0.0001"
          max="0.01"
          value={tolerance}
          onChange={(e) => setTolerance(parseFloat(e.target.value))}
          className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-teal-600/30 text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <p className="text-xs text-teal-400 mt-1">Default: 0.001</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!user || uploading || !selectedDNAFileId || !sampleId.trim()}
        className="w-full px-6 py-3 rounded-lg bg-amber-700 hover:bg-amber-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Starting Analysis...
          </>
        ) : (
          'Start Analysis'
        )}
      </button>
    </motion.form>
  );
};