import React, { useState, useRef } from 'react';
import { CloudUpload, Download, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'https://api.qizilbash.ir';

export const VCFToPlinkConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sampleId, setSampleId] = useState('sample');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.name.endsWith('.vcf') ||
        droppedFile.name.endsWith('.vcf.gz') ||
        droppedFile.name.endsWith('.zip')
      ) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please select a valid VCF file (.vcf, .vcf.gz, or .zip)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.name.endsWith('.vcf') ||
        selectedFile.name.endsWith('.vcf.gz') ||
        selectedFile.name.endsWith('.zip')
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a valid VCF file (.vcf, .vcf.gz, or .zip)');
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a VCF file');
      return;
    }

    if (!sampleId.trim()) {
      setError('Please enter a sample ID');
      return;
    }

    setConverting(true);
    setError(null);

    const formData = new FormData();
    formData.append('vcf_file', file);
    formData.append('sample_id', sampleId.trim());

    try {
      const response = await fetch(`${API_BASE}/tools/vcf-to-plink/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || 'Conversion failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${sampleId.trim()}_23andme.txt.gz`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Reset form after successful conversion
      setFile(null);
      setSampleId('sample');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      <h3 className="text-xl font-semibold text-teal-100 mb-4">VCF to 23andMe Converter</h3>

      {/* Info Notice */}
      <div className="mb-4 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
        <p className="text-sm text-blue-200 font-semibold mb-2">About This Tool</p>
        <p className="text-xs text-blue-200/90">
          Convert your VCF file to 23andMe format using plink. Supports .vcf, .vcf.gz, and .zip formats.
        </p>
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

      {/* File Upload Area */}
      <div
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-teal-400 bg-teal-900/20'
            : 'border-teal-600/30 bg-slate-900/40'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".vcf,.vcf.gz,.zip"
          onChange={handleFileChange}
          className="hidden"
        />
        <CloudUpload className="mx-auto mb-3 text-teal-400" size={48} />
        {file ? (
          <div>
            <p className="text-teal-100 font-medium">{file.name}</p>
            <p className="text-sm text-teal-400 mt-1">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-teal-200 mb-1">Drag and drop your VCF file here</p>
            <p className="text-sm text-teal-400">or click to browse (.vcf, .vcf.gz, or .zip)</p>
          </div>
        )}
      </div>

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={converting || !file || !sampleId.trim()}
        className="w-full px-6 py-3 rounded-lg bg-amber-700 hover:bg-amber-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
      >
        {converting ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Download size={20} />
            </motion.div>
            Converting...
          </>
        ) : (
          <>
            <Download size={20} />
            Convert & Download
          </>
        )}
      </button>
    </motion.div>
  );
};