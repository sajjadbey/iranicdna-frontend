// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.qizilbash.ir';

// Analytics API
export const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'https://api.qizilbash.ir';

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
  dnaFiles: `${API_BASE_URL}/genetics/dna-files/`,
  dnaFileUpload: `${API_BASE_URL}/genetics/dna-files/upload/`,
  
  // VCF Tools
  vcfToPlink: `${API_BASE_URL}/tools/vcf-to-plink/`,
  vcfAnalysis: `${API_BASE_URL}/tools/vcf-analysis/`,
  vcfAnalyses: `${API_BASE_URL}/tools/vcf-analyses/`,
  
  // Blog
  blog: `${API_BASE_URL}/genetics/blog/`,
  blogPost: (slug: string) => `${API_BASE_URL}/genetics/blog/${slug}/`,
  blogComments: (slug: string) => `${API_BASE_URL}/genetics/blog/${slug}/comments/`,
  blogCommentCreate: (slug: string) => `${API_BASE_URL}/genetics/blog/${slug}/comments/create/`,
  blogCommentDelete: (id: number) => `${API_BASE_URL}/genetics/blog/comments/${id}/`,
  blogCommentUpdate: (id: number) => `${API_BASE_URL}/genetics/blog/comments/${id}/update/`,
  blogCommentReport: (commentId: number) => `${API_BASE_URL}/genetics/blog/comments/${commentId}/report/`,
  
  // Analytics API endpoints (with comprehensive filtering support)
  samples: `${ANALYTICS_API_URL}/genetics/samples/`,
  countries: `${ANALYTICS_API_URL}/genetics/countries/`,
  provinces: `${ANALYTICS_API_URL}/genetics/provinces/`,
  cities: `${ANALYTICS_API_URL}/genetics/cities/`,
  ethnicities: `${ANALYTICS_API_URL}/genetics/ethnicities/`,
  tribes: `${ANALYTICS_API_URL}/genetics/tribes/`,
  clans: `${ANALYTICS_API_URL}/genetics/clans/`,
  
  // Haplogroup endpoints
  haplogroupAll: `${ANALYTICS_API_URL}/genetics/haplogroup/all/`,
  haplogroup: `${ANALYTICS_API_URL}/genetics/haplogroup/`,
  haplogroupHeatmap: `${ANALYTICS_API_URL}/genetics/haplogroup/heatmap/`,
  
  // qpAdm endpoints
  qpadmRun: `${API_BASE_URL}/tools/qpadm/run/`,
  qpadmRunDetail: (id: string) => `${API_BASE_URL}/tools/qpadm/run/${id}/`,
  qpadmRuns: `${API_BASE_URL}/tools/qpadm/runs/`,
  qpadmStatus: `${API_BASE_URL}/tools/qpadm/status/`,
  qpadmQueueStatus: `${API_BASE_URL}/tools/qpadm/queue/status/`,
  qpadmPopulations: `${API_BASE_URL}/tools/qpadm/populations/`,
} as const;