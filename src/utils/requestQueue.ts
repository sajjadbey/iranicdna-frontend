/**
 * Request Queue Manager
 * Prevents too many concurrent requests to avoid rate limiting (HTTP 429)
 */

interface QueuedRequest<T> {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

class RequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests = 0;
  private maxConcurrent: number;
  private minDelay: number; // Minimum delay between requests in ms
  private lastRequestTime = 0; // Track last request time

  constructor(maxConcurrent = 2, minDelay = 300) {
    this.maxConcurrent = maxConcurrent;
    this.minDelay = minDelay;
  }

  /**
   * Add a request to the queue
   */
  async enqueue<T>(execute: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ execute, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process queued requests with concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.activeRequests++;

    try {
      // Ensure minimum delay between requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelay) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
      }
      
      this.lastRequestTime = Date.now();
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;
      // Process next request in queue
      this.processQueue();
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

// Create singleton instance with conservative limits to prevent 429 errors
// Reduced maxConcurrent from 3 to 2 and increased minDelay from 150ms to 400ms
export const requestQueue = new RequestQueue(2, 400);

/**
 * Exponential backoff retry logic for failed requests
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 4,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error (429)
      const is429 = error.message?.includes('429') || error.status === 429;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // For 429 errors, use longer backoff delays
      if (is429) {
        // Exponential backoff with longer delays for 429 errors
        const delay = baseDelay * Math.pow(2, attempt) * 1.5; // 1.5x multiplier for 429
        const jitter = Math.random() * 0.3 * delay; // Add 0-30% jitter
        const totalDelay = delay + jitter;

        console.warn(
          `Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(totalDelay)}ms...`,
          error.message
        );

        await new Promise(resolve => setTimeout(resolve, totalDelay));
      } else {
        // For non-429 errors, don't retry after first attempt
        if (attempt > 0) {
          throw error;
        }
        // Short delay for first retry of non-429 errors
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError;
}
