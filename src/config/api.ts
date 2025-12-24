// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  signup: `${API_BASE_URL}/auth/signup/`,
  signin: `${API_BASE_URL}/auth/signin/`,
  logout: `${API_BASE_URL}/auth/logout/`,
  verify: `${API_BASE_URL}/auth/verify/`,
  profile: `${API_BASE_URL}/auth/profile/`,
  refreshToken: `${API_BASE_URL}/auth/token/refresh/`,
  
  // Email Verification
  verifyEmail: `${API_BASE_URL}/auth/verification/verify/`,
  requestVerification: `${API_BASE_URL}/auth/verification/request/`,
  
  // Password Reset
  requestPasswordReset: `${API_BASE_URL}/auth/password-reset/request/`,
  confirmPasswordReset: `${API_BASE_URL}/auth/password-reset/confirm/`,
  
  // Username Availability
  checkUsername: `${API_BASE_URL}/auth/username/check/`,
  
  // Email Availability
  checkEmail: `${API_BASE_URL}/auth/email/check/`,
  
  // DNA File Management
  dnaFiles: `${API_BASE_URL}/dna-files/`,
  dnaFileUpload: `${API_BASE_URL}/dna-files/upload/`,
} as const;