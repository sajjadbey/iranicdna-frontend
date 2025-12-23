// VCF Analysis Helper Functions
import type { VCFAnalysisResponse } from '../types/vcf';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
  tolerance: number,
  onProgress?: (progress: number) => void
): Promise<VCFAnalysisResponse> => {
  const formData = new FormData();
  formData.append('vcf_file', file);
  formData.append('sample_id', sampleId);
  formData.append('tolerance', tolerance.toString());
  
  if (models.length > 0) {
    formData.append('models_requested', models.join(','));
  }
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(Math.round(percentComplete));
      }
    });
    
    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.detail || errorData.error || `Upload failed: ${xhr.statusText}`));
        } catch {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      }
    });
    
    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred'));
    });
    
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });
    
    // Send request
    xhr.open('POST', `${API_BASE}/tools/vcf-analysis/`);
    
    // Add authentication header if token exists (must be after open())
    const token = localStorage.getItem('access_token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.send(formData);
  });
};

export const getAnalysisById = async (id: string): Promise<VCFAnalysisResponse> => {
  const token = localStorage.getItem('access_token');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}/tools/vcf-analysis/${id}/`, {
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch analysis: ${response.statusText}`);
  }
  
  return response.json();
};

export const getAllAnalyses = async (): Promise<VCFAnalysisResponse[]> => {
  const token = localStorage.getItem('access_token');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}/tools/vcf-analyses/`, {
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch analyses: ${response.statusText}`);
  }
  
  return response.json();
};

export const uploadVCFFileWithDNAFile = async (
  dnaFileId: string,
  sampleId: string,
  models: string[],
  tolerance: number
): Promise<VCFAnalysisResponse> => {
  const formData = new FormData();
  formData.append('dna_file_id', dnaFileId);
  formData.append('sample_id', sampleId);
  formData.append('tolerance', tolerance.toString());
  
  if (models.length > 0) {
    formData.append('models_requested', models.join(','));
  }
  
  const token = localStorage.getItem('access_token');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}/tools/vcf-analysis/`, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || 'Analysis failed');
  }
  
  return response.json();
};