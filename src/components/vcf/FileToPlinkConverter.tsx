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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'done' | 'processing'>('uploading');
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
        droppedFile.name.endsWith('.txt') ||
        droppedFile.name.endsWith('.txt.gz') ||
        droppedFile.name.endsWith('.csv') ||
        droppedFile.name.endsWith('.zip')
      ) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please select a valid file (.vcf, .vcf.gz, .txt, .txt.gz, .csv, or .zip)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.name.endsWith('.vcf') ||
        selectedFile.name.endsWith('.vcf.gz') ||
        selectedFile.name.endsWith('.txt') ||
        selectedFile.name.endsWith('.txt.gz') ||
        selectedFile.name.endsWith('.csv') ||
        selectedFile.name.endsWith('.zip')
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a valid file (.vcf, .vcf.gz, .txt, .txt.gz, .csv, or .zip)');
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!sampleId.trim()) {
      setError('Please enter a sample ID');
      return;
    }

    setConverting(true);
    setError(null);
    setUploadProgress(0);
    setUploadStatus('uploading');

    const formData = new FormData();
    formData.append('vcf_file', file);
    formData.append('sample_id', sampleId.trim());

    try {
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
          if (progress === 100) {
            setUploadStatus('done');
          }
        }
      });

      // Handle response
      const response = await new Promise<Response>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.response, {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers(xhr.getAllResponseHeaders().split('\r\n').reduce((acc, line) => {
                const [key, value] = line.split(': ');
                if (key && value) acc[key] = value;
                return acc;
              }, {} as Record<string, string>))
            }));
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('POST', `${API_BASE}/tools/vcf-to-plink/`);
        xhr.responseType = 'blob';
        xhr.send(formData);
      });

      // Show processing status
      setUploadStatus('processing');

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

      // Download the file
      const blob = await response.blob();
      
      // Small delay to show processing status
      await new Promise(resolve => setTimeout(resolve, 800));
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
      setUploadProgress(0);
      setUploadStatus('uploading');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setUploadProgress(0);
      setUploadStatus('uploading');
    } finally {
      setTimeout(() => {
        setConverting(false);
      }, 1000);
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

      {/* Info Notice */}
      <div className="mb-4 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
        <p className="text-sm text-blue-200 font-semibold mb-2">About This Tool</p>
        <p className="text-xs text-blue-200/90 mb-3">
          Convert VCF or MyHeritage CSV files to 23andMe format using plink.
        </p>
        <div className="mt-3 pt-3 border-t border-blue-500/20">
          <p className="text-xs text-blue-200 font-semibold mb-2">Supported Formats</p>
          <ul className="text-xs text-blue-200/80 space-y-1 list-disc list-inside">
            <li>VCF files (.vcf, .vcf.gz) - MySmartGene, 23andMe compatible</li>
            <li>MyHeritage CSV files (.csv)</li>
            <li>Text files (.txt, .txt.gz)</li>
            <li>ZIP archives (.zip)</li>
          </ul>
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
          accept=".vcf,.vcf.gz,.txt,.txt.gz,.csv,.zip"
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
            <p className="text-teal-200 mb-1">Drag and drop your file here</p>
            <p className="text-sm text-teal-400">or click to browse (.vcf, .vcf.gz, .txt, .txt.gz, .csv, or .zip)</p>
          </div>
        )}
      </div>

      {/* Upload Progress Bar */}
      {converting && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-teal-200">
              {uploadStatus === 'uploading' && 'Uploading...'}
              {uploadStatus === 'done' && '✓ Upload Complete'}
              {uploadStatus === 'processing' && 'Processing...'}
            </span>
            <span className="text-sm font-medium text-teal-100">
              {uploadStatus === 'uploading' && `${uploadProgress}%`}
              {uploadStatus === 'done' && '100%'}
              {uploadStatus === 'processing' && ''}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: uploadStatus === 'processing' ? '100%' : `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full ${
                uploadStatus === 'done' 
                  ? 'bg-green-500' 
                  : uploadStatus === 'processing'
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-teal-500 to-amber-500'
              }`}
            />
          </div>
        </div>
      )}

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