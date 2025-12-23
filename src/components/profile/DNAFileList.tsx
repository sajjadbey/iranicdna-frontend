import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { File, Trash2, Edit2, CheckCircle, XCircle, AlertCircle, Calendar, HardDrive } from 'lucide-react';
import type { DNAFile } from '../../types/dnaFile';

interface DNAFileListProps {
  files: DNAFile[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { sample_name?: string; description?: string }) => void;
}

export const DNAFileList: React.FC<DNAFileListProps> = ({ files, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSampleName, setEditSampleName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Defensive: ensure files is always an array
  const fileList = Array.isArray(files) ? files : [];

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

  const startEdit = (file: DNAFile) => {
    setEditingId(file.id);
    setEditSampleName(file.sample_name);
    setEditDescription(file.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSampleName('');
    setEditDescription('');
  };

  const saveEdit = (id: string) => {
    onUpdate(id, {
      sample_name: editSampleName,
      description: editDescription,
    });
    cancelEdit();
  };

  if (fileList.length === 0) {
    return (
      <div className="text-center py-12">
        <File className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No DNA files uploaded yet</p>
        <p className="text-gray-500 text-sm mt-2">Upload your first file to get started with genetic analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {fileList.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-5 hover:border-white/20 transition-colors"
          >
            {editingId === file.id ? (
              /* Edit Mode */
              <div className="space-y-4">
                <input
                  type="text"
                  value={editSampleName}
                  onChange={(e) => setEditSampleName(e.target.value)}
                  placeholder="Sample name"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                  rows={2}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(file.id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <File className="w-8 h-8 text-purple-400 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">
                        {file.sample_name || file.original_filename}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">{file.original_filename}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => startEdit(file)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(file.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File Details */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{formatFileSize(file.file_size)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{formatDate(file.uploaded_at)}</span>
                  </div>
                </div>

                {/* Format Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getFormatBadgeColor(file.detected_format)}`}>
                    {file.format_display}
                  </span>
                  {file.format_confidence >= 0.9 ? (
                    <div title="High confidence detection">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  ) : file.format_confidence >= 0.5 ? (
                    <div title="Medium confidence detection">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    </div>
                  ) : (
                    <div title="Low confidence detection">
                      <XCircle className="w-4 h-4 text-red-400" />
                    </div>
                  )}
                </div>

                {/* Format Details */}
                {file.format_details && Object.keys(file.format_details).length > 0 && (
                  <div className="text-sm text-gray-400 space-y-1">
                    {file.format_details.estimated_snps && (
                      <p>≈ {file.format_details.estimated_snps.toLocaleString()} SNPs</p>
                    )}
                    {file.format_details.source && <p>Source: {file.format_details.source}</p>}
                  </div>
                )}

                {/* Description */}
                {file.description && (
                  <p className="text-gray-400 text-sm mt-3 pt-3 border-t border-white/10">
                    {file.description}
                  </p>
                )}

                {/* Validation Errors */}
                {!file.is_valid && file.validation_errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm font-medium mb-1">Validation Issues:</p>
                    {file.validation_errors.map((error, index) => (
                      <p key={index} className="text-red-400 text-xs">• {error}</p>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};