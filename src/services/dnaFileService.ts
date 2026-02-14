import { API_ENDPOINTS } from '../config/api';
import type { DNAFile, DNAFileUploadData, DNAFileUpdateData } from '../types/dnaFile';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const dnaFileService = {
  /**
   * Get all DNA files for the authenticated user
   */
  async getUserDNAFiles(): Promise<DNAFile[]> {
    const response = await fetch(API_ENDPOINTS.dnaFiles, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || 'Failed to fetch DNA files');
    }

    const data = await response.json();
    
    // Handle paginated response from Django REST Framework
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
      return data.results;
    }
    
    // Handle direct array response
    if (Array.isArray(data)) {
      return data;
    }
    
    // Fallback to empty array if unexpected format
    console.warn('Unexpected API response format:', data);
    return [];
  },

  /**
   * Upload a new DNA file
   */
  async uploadDNAFile(data: DNAFileUploadData): Promise<DNAFile> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('password', data.password);
    if (data.sample_name) {
      formData.append('sample_name', data.sample_name);
    }
    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await fetch(API_ENDPOINTS.dnaFileUpload, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || 'Failed to upload DNA file');
    }

    return response.json();
  },

  /**
   * Get a specific DNA file by ID
   */
  async getDNAFile(id: string): Promise<DNAFile> {
    const response = await fetch(`${API_ENDPOINTS.dnaFiles}${id}/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || 'Failed to fetch DNA file');
    }

    return response.json();
  },

  /**
   * Update DNA file metadata
   */
  async updateDNAFile(id: string, data: DNAFileUpdateData): Promise<DNAFile> {
    const response = await fetch(`${API_ENDPOINTS.dnaFiles}${id}/update/`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || 'Failed to update DNA file');
    }

    return response.json();
  },

  /**
   * Delete a DNA file
   */
  async deleteDNAFile(id: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.dnaFiles}${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || 'Failed to delete DNA file');
    }
  },
};