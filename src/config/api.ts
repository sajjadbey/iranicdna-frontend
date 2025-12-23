// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.qizilbash.ir';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  signup: `${API_BASE_URL}/auth/signup/`,
  signin: `${API_BASE_URL}/auth/signin/`,
  logout: `${API_BASE_URL}/auth/logout/`,
  verify: `${API_BASE_URL}/auth/verify/`,
  profile: `${API_BASE_URL}/auth/profile/`,
  refreshToken: `${API_BASE_URL}/auth/token/refresh/`,
} as const;