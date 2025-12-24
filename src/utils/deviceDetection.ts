// Utility to detect mobile devices and reduce motion preferences
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detect if device is low-end (low memory or CPU)
 * Returns true for devices that might struggle with animations
 */
export const isLowEndDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) {
    return true; // Less than 4GB RAM
  }
  
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) {
    return true; // Less than 4 CPU cores
  }
  
  // Check if running on older/budget Android devices
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('android')) {
    // Look for budget Android indicators
    if (userAgent.includes('android 4') || 
        userAgent.includes('android 5') ||
        userAgent.includes('android 6')) {
      return true;
    }
  }
  
  return false;
};

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const shouldReduceAnimations = (): boolean => {
  return isMobileDevice() || prefersReducedMotion();
};

// Optimized animation variants for mobile
export const getAnimationConfig = () => {
  const shouldReduce = shouldReduceAnimations();
  
  return {
    duration: shouldReduce ? 0 : 0.3,
    delay: shouldReduce ? 0 : undefined,
  };
};

export const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideInVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};