import { API_ENDPOINTS } from '../config/api';
import { tokenService } from './authService';
import type { QpAdmRun, QpAdmStatus, QpAdmPopulations, QpAdmRunRequest } from '../types/qpadm';

/**
 * Service for qpAdm API interactions
 */

class QpAdmService {
  private async getAuthHeaders() {
    const token = tokenService.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get qpAdm usage status for current user
   */
  async getStatus(): Promise<QpAdmStatus> {
    const response = await fetch(API_ENDPOINTS.qpadmStatus, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch qpAdm status');
    }

    return response.json();
  }

  /**
   * Get available populations for a specific dataset
   */
  async getPopulations(dataset: '1240k' | 'HO' = '1240k'): Promise<QpAdmPopulations> {
    const url = `${API_ENDPOINTS.qpadmPopulations}?dataset=${dataset}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch populations');
    }

    return response.json();
  }

  /**
   * Create and run a new qpAdm analysis
   */
  async createRun(data: QpAdmRunRequest): Promise<QpAdmRun> {
    const response = await fetch(API_ENDPOINTS.qpadmRun, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || 'Failed to create qpAdm run');
    }

    return response.json();
  }

  /**
   * Get a specific qpAdm run by ID
   */
  async getRun(id: string): Promise<QpAdmRun> {
    const response = await fetch(API_ENDPOINTS.qpadmRunDetail(id), {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch qpAdm run');
    }

    return response.json();
  }

  /**
   * Get all qpAdm runs for current user
   */
  async getRuns(): Promise<QpAdmRun[]> {
    const response = await fetch(API_ENDPOINTS.qpadmRuns, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch qpAdm runs');
    }

    const data = await response.json();
    
    // Handle both paginated and non-paginated responses
    if (data && typeof data === 'object' && 'results' in data) {
      // Paginated response
      return data.results || [];
    }
    
    // Direct array response
    return Array.isArray(data) ? data : [];
  }

  /**
   * Get queue status
   */
  async getQueueStatus(): Promise<any> {
    const response = await fetch(API_ENDPOINTS.qpadmQueueStatus, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch queue status');
    }

    return response.json();
  }
}

export const qpadmService = new QpAdmService();