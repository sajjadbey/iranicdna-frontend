import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X} from 'lucide-react';
import type { DNAFile } from '../../types/dnaFile';

interface DNAFileUploadProps {
  onUploadSuccess: (file: DNAFile) => void;
  onUploadError: (error: string) => void;
}

export const DNAFileUpload: React.FC<DNAFileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleName, setSampleName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Check file extension
    const validExtensions = ['vcf', 'txt', 'csv', 'zip', 'gz', 'bed', 'bim', 'fam'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => 
      fileName.endsWith(`.${ext}`) || fileName.endsWith(`.${ext}.gz`)
    );

    if (!isValid) {
      onUploadError('Invalid file format. Please upload VCF, 23andMe, MyHeritage, or PLINK files.');
      return;
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      onUploadError('File is too large. Maximum size is 500MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);

    try {
      const { dnaFileService } = await import('../../services/dnaFileService');
      const uploadedFile = await dnaFileService.uploadDNAFile({
        file: selectedFile,
        sample_name: sampleName,
        description: description,
      });

      onUploadSuccess(uploadedFile);
      
      // Reset form
      setSelectedFile(null);
      setSampleName('');
      setDescription('');
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* File Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-white/20 hover:border-white/40'
        }`}
      >
        <input
          type="file"
          id="dna-file-input"
          className="hidden"
          accept=".vcf,.txt,.csv,.zip,.gz,.bed,.bim,.fam,.vcf.gz,.txt.gz,.csv.gz"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
          disabled={uploading}
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-between bg-white/5 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <File className="w-8 h-8 text-purple-400" />
                <div className="text-left">
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="no-file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                Drop your DNA file here or{' '}
                <label htmlFor="dna-file-input" className="text-purple-400 hover:text-purple-300 cursor-pointer">
                  browse
                </label>
              </p>
              <p className="text-gray-400 text-sm">
                Supported formats: VCF, 23andMe, MyHeritage, PLINK (max 500MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload Form */}
      {selectedFile && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Sample Name */}
          <div>
            <label htmlFor="sample-name" className="block text-sm font-medium text-gray-300 mb-2">
              Sample Name (optional)
            </label>
            <input
              type="text"
              id="sample-name"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              placeholder="e.g., My 23andMe Results"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this file..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              disabled={uploading}
            />
          </div>

          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading & Analyzing...
              </span>
            ) : (
              'Upload DNA File'
            )}
          </motion.button>
        </motion.form>
      )}
    </div>
  );
};