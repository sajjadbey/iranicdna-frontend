// VCF Analysis Helper Functions
import type { VCFAnalysisResponse } from '../types/vcf';

const API_BASE = 'https://api.qizilbash.ir';

// Format timestamp to readable date
export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return value.toFixed(2) + '%';
};

// API Functions
export const uploadVCFFile = async (
  file: File,
  sampleId: string,
  models: string[],
  tolerance: number
): Promise<VCFAnalysisResponse> => {
  const formData = new FormData();
  formData.append('vcf_file', file);
  formData.append('sample_id', sampleId);
  formData.append('tolerance', tolerance.toString());
  
  if (models.length > 0) {
    formData.append('models_requested', models.join(','));
  }
  
  const response = await fetch(`${API_BASE}/tools/vcf-analysis/`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
  }
  
  return response.json();
};

export const getAnalysisById = async (id: string): Promise<VCFAnalysisResponse> => {
  const response = await fetch(`${API_BASE}/tools/vcf-analysis/${id}/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch analysis: ${response.statusText}`);
  }
  
  return response.json();
};

export const getAllAnalyses = async (): Promise<VCFAnalysisResponse[]> => {
  const response = await fetch(`${API_BASE}/tools/vcf-analyses/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch analyses: ${response.statusText}`);
  }
  
  return response.json();
};