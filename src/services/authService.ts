import { API_ENDPOINTS } from '../config/api';
import type { VerifyEmailData, RequestVerificationData, PasswordResetRequestData, PasswordResetConfirmData } from '../types';
import type { SignupData, SigninData, UpdateProfileData, AuthResponse, User } from '../types/auth';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Token management
export const tokenService = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (access: string, refresh: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// API request helper with auth
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenService.getAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error('API Error Response:', error);
    
    // Handle different error formats
    const errorMessage = 
      error.error || 
      error.detail || 
      error.message ||
      (typeof error === 'string' ? error : null) ||
      JSON.stringify(error);
    
    throw new Error(errorMessage);
  }

  return response.json();
}

// Authentication service
export const authService = {
  // Sign up new user
  signup: async (data: SignupData): Promise<AuthResponse> => {
    // Filter out empty optional fields to avoid validation errors
    const cleanData: Partial<SignupData> = {
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm,
    };

    // Only include optional fields if they have values
    if (data.username?.trim()) {
      cleanData.username = data.username.trim();
    }
    if (data.first_name?.trim()) {
      cleanData.first_name = data.first_name.trim();
    }
    if (data.last_name?.trim()) {
      cleanData.last_name = data.last_name.trim();
    }

    const response = await apiRequest<AuthResponse>(API_ENDPOINTS.signup, {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });

    tokenService.setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  },

  // Sign in existing user
  signin: async (data: SigninData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>(API_ENDPOINTS.signin, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    tokenService.setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiRequest(API_ENDPOINTS.logout, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenService.clearTokens();
    }
  },

  // Verify token validity
  verifyToken: async (): Promise<{ valid: boolean; user: User }> => {
    return apiRequest(API_ENDPOINTS.verify, {
      method: 'GET',
    });
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiRequest<User>(API_ENDPOINTS.profile, {
      method: 'GET',
    });
    return response;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<{ user: User; message: string }> => {
    return apiRequest(API_ENDPOINTS.profile, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Refresh access token
  refreshToken: async (): Promise<string> => {
    const refresh = tokenService.getRefreshToken();
    
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    const response = await apiRequest<{ access: string }>(API_ENDPOINTS.refreshToken, {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });

    tokenService.setTokens(response.access, refresh);
    return response.access;
  },

  // Email Verification
  verifyEmail: async (data: VerifyEmailData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>(API_ENDPOINTS.verifyEmail, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens after successful verification
    if (response.tokens) {
      tokenService.setTokens(response.tokens.access, response.tokens.refresh);
    }
    return response;
  },

  requestVerificationCode: async (data: RequestVerificationData): Promise<{ message: string; email_sent: boolean }> => {
    return apiRequest(API_ENDPOINTS.requestVerification, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Password Reset
  requestPasswordReset: async (data: PasswordResetRequestData): Promise<{ message: string; email_sent: boolean }> => {
    return apiRequest(API_ENDPOINTS.requestPasswordReset, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  confirmPasswordReset: async (data: PasswordResetConfirmData): Promise<{ message: string }> => {
    return apiRequest(API_ENDPOINTS.confirmPasswordReset, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};