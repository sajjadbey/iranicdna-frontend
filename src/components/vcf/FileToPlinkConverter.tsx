import React, { useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DNAFileSelector } from './DNAFileSelector';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

export const FileToPlinkConverter: React.FC = () => {
  const { user } = useAuth();
  const [selectedDNAFileId, setSelectedDNAFileId] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState('sample');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!user) {
      setError('Please sign in to use this tool');
      return;
    }

    if (!selectedDNAFileId) {
      setError('Please select a DNA file');
      return;
    }

    if (!sampleId.trim()) {
      setError('Please enter a sample ID');
      return;
    }

    setConverting(true);
    setError(null);

    const formData = new FormData();
    formData.append('dna_file_id', selectedDNAFileId);
    formData.append('sample_id', sampleId.trim());

    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.vcfToPlink, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = {};
        }
        throw new Error(errorData.detail || errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${sampleId.trim()}_format.txt.gz`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSelectedDNAFileId(null);
      setSampleId('sample');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-6 bg-slate-800/60 ring-1 ring-teal-600/30"
    >
      <h3 className="text-xl font-semibold text-teal-100 mb-4">DNA File to 23andMe Converter</h3>

      {!user ? (
        <div className="mb-6 p-4 rounded-lg bg-amber-900/20 border border-amber-500/30 text-center">
          <p className="text-amber-200 text-sm">Please sign in to use this tool</p>
        </div>
      ) : (
        <>
          {/* Info Notice */}
          <div className="mb-4 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
            <p className="text-sm text-blue-200 font-semibold mb-2">About This Tool</p>
            <p className="text-xs text-blue-200/90 mb-3">
              Convert VCF or MyHeritage CSV files to 23andMe format using plink.
            </p>
            <div className="mt-3 pt-3 border-t border-blue-500/20">
              <p className="text-xs text-blue-200 font-semibold mb-2">Supported Formats</p>
              <ul className="text-xs text-blue-200/80 space-y-1 list-disc list-inside">
                <li>VCF files (.vcf, .vcf.gz)</li>
                <li>MyHeritage CSV files (.csv)</li>
                <li>PLINK files (.bed, .bim, .fam)</li>
              </ul>
              <p className="text-xs text-blue-200/60 mt-2">
                Note: 23andMe files are already in the correct format
              </p>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-lg bg-red-900/20 border border-red-500/30 flex items-start gap-3"
              >
                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sample ID Input */}
          <div className="mb-6">
            <label htmlFor="sampleId" className="block text-sm font-medium text-teal-200 mb-2">
              Sample ID
            </label>
            <input
              id="sampleId"
              type="text"
              value={sampleId}
              onChange={(e) => setSampleId(e.target.value)}
              placeholder="Enter sample identifier"
              className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-teal-600/30 text-teal-100 placeholder-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-teal-400 mt-1">Used in output filename</p>
          </div>

          {/* DNA File Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-teal-200 mb-2">
              Select DNA File to Convert
            </label>
            <DNAFileSelector
              selectedFileId={selectedDNAFileId}
              onFileSelect={setSelectedDNAFileId}
              onError={setError}
              filterFormat={['23andme']}
            />
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={converting || !selectedDNAFileId || !sampleId.trim()}
            className="w-full px-6 py-3 rounded-lg bg-amber-700 hover:bg-amber-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            {converting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Converting...
              </>
            ) : (
              <>
                <Download size={20} />
                Convert & Download
              </>
            )}
          </button>
        </>
      )}
    </motion.div>
  );
};