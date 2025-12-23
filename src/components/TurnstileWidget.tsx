import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
      }) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onError,
  onExpire,
  theme = 'dark',
  size = 'normal',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isRenderedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs for callbacks to prevent re-renders
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  // Update refs when callbacks change
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  }, [onVerify, onError, onExpire]);

  const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Stable callback for verification
  const handleVerify = useCallback((token: string) => {
    onVerifyRef.current(token);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setError('Verification failed. Please try again.');
    onErrorRef.current?.();
  }, []);

  const handleExpire = useCallback(() => {
    setError('Verification expired. Please verify again.');
    onExpireRef.current?.();
  }, []);

  useEffect(() => {
    // Don't render if already rendered or no sitekey
    if (!sitekey || isRenderedRef.current) {
      return;
    }

    if (!sitekey) {
      setError('Turnstile site key not configured');
      console.error('VITE_TURNSTILE_SITE_KEY is not defined in environment variables');
      return;
    }

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || isRenderedRef.current) {
        return;
      }

      try {
        // Mark as rendered before attempting to prevent race conditions
        isRenderedRef.current = true;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          callback: handleVerify,
          'error-callback': handleError,
          'expired-callback': handleExpire,
          theme,
          size,
        });
      } catch (err) {
        console.error('Failed to render Turnstile widget:', err);
        setError('Failed to load verification widget');
        isRenderedRef.current = false; // Allow retry on error
      }
    };

    // Check if Turnstile is already loaded
    if (window.turnstile) {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(renderWidget, 100);
      return () => clearTimeout(timeout);
    } else {
      // Wait for Turnstile to load
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      
      const interval = setInterval(() => {
        attempts++;
        
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setError('Failed to load Turnstile. Please refresh the page.');
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [sitekey, theme, size, handleVerify, handleError, handleExpire]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (err) {
          console.error('Failed to remove Turnstile widget:', err);
        }
      }
      isRenderedRef.current = false;
    };
  }, []);

  // Don't render if sitekey is not configured
  if (!sitekey) {
    return null;
  }

  return (
    <div className={className}>
      {/* Clean container matching form input style */}
      <div className="rounded-lg border border-white/10 bg-white/5 py-4 px-3 transition-all hover:border-white/20 flex items-center justify-center min-h-[80px]">
        <div ref={containerRef} className="flex items-center justify-center" style={{ margin: '0 auto' }} />
      </div>
      
      {error && (
        <p className="text-red-400 text-sm mt-2 text-center flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};