import type { BlogPost } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Date formatting
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Reading time estimation
export const estimateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// View count formatting
export const formatViewCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

// Fetch all blog posts with optional filters
export const fetchBlogPosts = async (params?: {
  tag?: string;
  search?: string;
}): Promise<BlogPost[]> => {
  const queryParams = new URLSearchParams();
  if (params?.tag) queryParams.append('tag', params.tag);
  if (params?.search) queryParams.append('search', params.search);
  
  const url = `${API_BASE}/blog/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch blog posts: ${response.status}`);
  }
  
  const data = await response.json();
  // API returns paginated response with results array
  return data.results || [];
};

// Fetch single blog post by slug
export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost> => {
  const response = await fetch(`${API_BASE}/blog/${slug}/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch blog post: ${response.status}`);
  }
  
  return response.json();
};