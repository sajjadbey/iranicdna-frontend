import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { File, CheckCircle, AlertCircle, Calendar, HardDrive } from 'lucide-react';
import { dnaFileService } from '../../services/dnaFileService';
import type { DNAFile } from '../../types/dnaFile';

interface DNAFileSelectorProps {
  selectedFileId: string | null;
  onFileSelect: (fileId: string | null) => void;
  onError: (error: string) => void;
  filterFormat?: string[];
}

export const DNAFileSelector: React.FC<DNAFileSelectorProps> = ({
  selectedFileId,
  onFileSelect,
  onError,
  filterFormat,
}) => {
  const [files, setFiles] = useState<DNAFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const userFiles = await dnaFileService.getUserDNAFiles();
        let validFiles = userFiles.filter(f => f.is_valid);
        
        if (filterFormat && filterFormat.length > 0) {
          validFiles = validFiles.filter(f => !filterFormat.includes(f.detected_format));
        }
        
        setFiles(validFiles);
      } catch (err) {
        console.error('Failed to fetch DNA files:', err);
        onError('Failed to load your DNA files');
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [onError, filterFormat]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFormatBadgeColor = (format: string): string => {
    switch (format) {
      case 'vcf':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case '23andme':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'myheritage':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'plink':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <File className="w-8 h-8 text-teal-400" />
        </motion.div>
        <p className="mt-2 text-sm text-teal-300">Loading your files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-lg bg-slate-900/40 border border-teal-600/20">
        <File className="w-12 h-12 text-teal-500/50 mx-auto mb-3" />
        <p className="text-teal-200/70 text-sm">No DNA files available</p>
        <p className="text-teal-400/50 text-xs mt-1">Upload files in your Profile to use them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {files.map((file) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
            selectedFileId === file.id
              ? 'bg-teal-900/30 border-teal-500'
              : 'bg-slate-900/40 border-teal-600/20 hover:border-teal-500/50'
          }`}
          onClick={() => onFileSelect(selectedFileId === file.id ? null : file.id)}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              {selectedFileId === file.id ? (
                <CheckCircle className="w-5 h-5 text-teal-400" />
              ) : (
                <File className="w-5 h-5 text-teal-400/60" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-teal-100 truncate">
                {file.sample_name || file.original_filename}
              </h4>
              <p className="text-xs text-teal-400/70 truncate mt-0.5">
                {file.original_filename}
              </p>
              
              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1 text-teal-300/70">
                  <HardDrive className="w-3 h-3" />
                  {formatFileSize(file.file_size)}
                </div>
                <div className="flex items-center gap-1 text-teal-300/70">
                  <Calendar className="w-3 h-3" />
                  {formatDate(file.uploaded_at)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getFormatBadgeColor(file.detected_format)}`}>
                  {file.format_display}
                </span>
                {file.format_confidence >= 0.9 && (
                  <div title="High confidence">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  </div>
                )}
                {file.format_confidence >= 0.5 && file.format_confidence < 0.9 && (
                  <div title="Medium confidence">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};