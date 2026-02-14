import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Shield, Lock, AlertCircle } from 'lucide-react';
import type { DNAFile } from '../../types/dnaFile';

interface DNAFileUploadProps {
  onUploadSuccess: (file: DNAFile) => void;
  onUploadError: (error: string) => void;
}

export const DNAFileUpload: React.FC<DNAFileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleName, setSampleName] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
    if (!selectedFile || !agreedToTerms) return;

    if (!password) {
      onUploadError('Password is required for file encryption');
      return;
    }

    setUploading(true);

    try {
      const { dnaFileService } = await import('../../services/dnaFileService');
      const uploadedFile = await dnaFileService.uploadDNAFile({
        file: selectedFile,
        sample_name: sampleName,
        description: description,
        password: password,
      });

      onUploadSuccess(uploadedFile);
      
      // Reset form
      setSelectedFile(null);
      setSampleName('');
      setDescription('');
      setPassword('');
      setAgreedToTerms(false);
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
          {/* Security Notice */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Military-Grade Encryption
                </h4>
                <p className="text-gray-300 text-sm">
                  Your DNA file will be encrypted using <strong>PBKDF2-SHA256</strong> with 480,000 iterations and <strong>AES-128</strong> encryption. 
                  Only you can decrypt it with your account password. We cannot access your raw genetic data.
                </p>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Your Account Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password to encrypt the file"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={uploading}
            />
            <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Required for encrypting your DNA file
            </p>
          </div>

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

          {/* Terms Agreement */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                disabled={uploading}
              />
              <span className="text-sm text-gray-300">
                I understand that my DNA file will be encrypted with my password and stored securely. 
                I agree to use this service responsibly and acknowledge that the uploaded data is for personal analysis only.
              </span>
            </label>
          </div>

          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: agreedToTerms && !uploading ? 1.02 : 1 }}
            whileTap={{ scale: agreedToTerms && !uploading ? 0.98 : 1 }}
            type="submit"
            disabled={uploading || !agreedToTerms}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Encrypting & Uploading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Upload & Encrypt DNA File
              </span>
            )}
          </motion.button>
        </motion.form>
      )}
    </div>
  );
};