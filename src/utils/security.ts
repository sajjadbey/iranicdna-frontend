// Sanitize log messages to prevent log injection
export const sanitizeLog = (input: unknown): string => {
  if (typeof input !== 'string') {
    return String(input);
  }
  return input.replace(/[\r\n]/g, ' ').substring(0, 500);
};

// Validate URL to prevent SSRF
export const isValidUrl = (url: string, allowedDomains?: string[]): boolean => {
  try {
    const parsed = new URL(url);
    
    // Block private IP ranges
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      hostname.startsWith('172.16.') ||
      hostname === '0.0.0.0' ||
      hostname === '::1'
    ) {
      return false;
    }

    // Check allowed domains if provided
    if (allowedDomains && allowedDomains.length > 0) {
      return allowedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
    }

    return true;
  } catch {
    return false;
  }
};

// Validate and parse JSON safely
export const safeJsonParse = <T = unknown>(data: string): T | null => {
  try {
    const parsed = JSON.parse(data);
    // Basic validation - reject if contains suspicious patterns
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as T;
    }
    return null;
  } catch {
    return null;
  }
};
