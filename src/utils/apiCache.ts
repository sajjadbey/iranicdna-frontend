interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  useSessionStorage?: boolean; // Use sessionStorage instead of memory
}

class ApiCache {
  private memoryCache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 2 * 60 * 1000; // 2 minutes in milliseconds

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string, options?: CacheOptions): T | null {
    const ttl = options?.ttl ?? this.defaultTTL;
    const useSessionStorage = options?.useSessionStorage ?? true;

    // Try session storage first if enabled
    if (useSessionStorage && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const cached = sessionStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry<T> = JSON.parse(cached);
          if (Date.now() - entry.timestamp < ttl) {
            return entry.data;
          } else {
            // Remove expired cache
            sessionStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn('Session storage error:', error);
      }
    }

    // Fallback to memory cache
    const memoryEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memoryEntry && Date.now() - memoryEntry.timestamp < ttl) {
      return memoryEntry.data;
    }

    // Remove expired memory cache
    if (memoryEntry) {
      this.memoryCache.delete(key);
    }

    return null;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, options?: CacheOptions): void {
    const useSessionStorage = options?.useSessionStorage ?? true;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    // Store in session storage if enabled
    if (useSessionStorage && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem(key, JSON.stringify(entry));
      } catch (error) {
        console.warn('Session storage error:', error);
      }
    }

    // Also store in memory cache as fallback
    this.memoryCache.set(key, entry);
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.memoryCache.delete(key);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('Session storage error:', error);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        // Clear only API cache entries (ones starting with 'api:')
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.startsWith('api:')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Session storage error:', error);
      }
    }
  }
}

// Create singleton instance
export const apiCache = new ApiCache();

/**
 * Cached fetch wrapper
 * Automatically caches GET requests
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & { cacheOptions?: CacheOptions }
): Promise<T> {
  const method = options?.method?.toUpperCase() || 'GET';
  
  // Only cache GET requests
  if (method !== 'GET') {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Create cache key from URL
  const cacheKey = `api:${url}`;

  // Try to get from cache
  const cached = apiCache.get<T>(cacheKey, options?.cacheOptions);
  if (cached !== null) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data: T = await response.json();

  // Store in cache
  apiCache.set(cacheKey, data, options?.cacheOptions);

  return data;
}