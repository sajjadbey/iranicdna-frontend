import React, { useState, useRef } from 'react';
import { CloudUpload } from 'lucide-react';
import { motion } from 'framer-motion';
import type { VCFUploadFormProps } from '../../types/vcf';
import { uploadVCFFile } from '../../utils/vcfHelpers';

export const VCFUploadForm: React.FC<VCFUploadFormProps> = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState<File | null>(null);
  const [sampleId, setSampleId] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['K12b']);
  const [tolerance, setTolerance] = useState(0.001);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
        droppedFile.name.endsWith('.txt') ||
        droppedFile.name.endsWith('.gz') ||
        droppedFile.name.endsWith('.zip')
      ) {
        setFile(droppedFile);
      } else {
        onUploadError('Please select a valid VCF, TXT, GZ, or ZIP file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.name.endsWith('.vcf') ||
        selectedFile.name.endsWith('.txt') ||
        selectedFile.name.endsWith('.gz') ||
        selectedFile.name.endsWith('.zip')
      ) {
        setFile(selectedFile);
      } else {
        onUploadError('Please select a valid VCF, TXT, GZ, or ZIP file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      onUploadError('Please select a VCF, TXT, GZ, or ZIP file');
      return;
    }

    if (!sampleId.trim()) {
      onUploadError('Please enter a sample ID');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadVCFFile(
        file, 
        sampleId.trim(), 
        selectedModels, 
        tolerance,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      // Small delay to show 100% before resetting
      setTimeout(() => {
        onUploadSuccess(result);
        
        // Reset form
        setFile(null);
        setSampleId('');
        setSelectedModels(['K12b']);
        setTolerance(0.001);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
    } catch (error) {
      setUploadProgress(0);
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 500);
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
      <h3 className="text-xl font-semibold text-teal-100 mb-4">Upload File</h3>

      {/* Format Notice */}
      <div className="mb-4 p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
        <p className="text-sm text-amber-200 font-semibold mb-3">Required Format</p>
        <div className="text-xs text-amber-300/90 font-mono bg-slate-900/40 p-3 rounded border border-amber-500/20 space-y-0.5 overflow-x-auto">
          <p className="whitespace-nowrap">##fileformat=VCFv4.2</p>
          <p className="whitespace-nowrap">##source=MySmartGene-v2</p>
          <p className="break-all">##FORMAT=&lt;ID=GT,Number=1,Type=String,Description=Genotype&gt;</p>
        </div>
        <p className="text-xs text-amber-200/90 mt-3">
          Only files exported from MySmartGene with the above header format are accepted.
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
          accept=".vcf,.txt,.gz,.zip"
          onChange={handleFileChange}
          className="hidden"
        />
        <CloudUpload className="mx-auto mb-3 text-teal-400" size={48} />
        {file ? (
          <div>
            <p className="text-teal-100 font-medium">{file.name}</p>
            <p className="text-sm text-teal-400 mt-1">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-teal-200 mb-1">Drag and drop your file here</p>
            <p className="text-sm text-teal-400">or click to browse (.vcf, .txt, .gz, or .zip)</p>
          </div>
        )}
      </div>

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

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-teal-200">Uploading...</span>
            <span className="text-sm font-medium text-teal-100">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-teal-500 to-amber-500"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading || !file || !sampleId.trim()}
        className="w-full px-6 py-3 rounded-lg bg-amber-700 hover:bg-amber-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <CloudUpload size={20} />
            </motion.div>
            Uploading...
          </>
        ) : (
          <>
            <CloudUpload size={20} />
            Upload & Analyze
          </>
        )}
      </button>
    </motion.form>
  );
};