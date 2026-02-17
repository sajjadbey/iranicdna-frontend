import React, { useLayoutEffect, useRef } from 'react';

interface DNAMatrixBackgroundProps {
  opacity?: number;
}

export const DNAMatrixBackground: React.FC<DNAMatrixBackgroundProps> = ({ 
  opacity = 0.15
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    setCanvasSize();

    // Get color from CSS variables
    const getAccentColor = () => {
      const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim();
      return accentColor || '#d4af37';
    };

    // Draw DNA icon pattern using inline SVG data URL (Firefox compatible)
    const drawPattern = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const accentColor = getAccentColor();
      const iconSize = 20;
      const spacing = 40;
      
      const cols = Math.ceil(window.innerWidth / spacing);
      const rows = Math.ceil(window.innerHeight / spacing);
      
      // DNA icon SVG as data URL (Firefox compatible)
      const sanitizedColor = accentColor.replace(/[^#a-fA-F0-9]/g, '') || '#d4af37';
      const sanitizedIconSize = Math.max(1, Math.min(100, iconSize));
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${sanitizedIconSize}" height="${sanitizedIconSize}" viewBox="0 0 24 24" fill="none" stroke="${sanitizedColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="m17 6-2.5-2.5"/><path d="m14 8-1-1"/><path d="m7 18 2.5 2.5"/><path d="m3.5 14.5.5.5"/><path d="m20 9 .5.5"/><path d="m6.5 12.5 1 1"/><path d="m16.5 10.5 1 1"/><path d="m10 16 1.5 1.5"/></svg>`;
      const dataUrl = `data:image/svg+xml;base64,${btoa(svgStr)}`;
      
      const img = new Image();
      img.onload = () => {
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * spacing + (row % 2) * (spacing / 2);
            const y = row * spacing;
            ctx.drawImage(img, x, y, iconSize, iconSize);
          }
        }
      };
      img.src = dataUrl;
    };

    // Use requestAnimationFrame for smoother rendering in Firefox
    requestAnimationFrame(() => {
      drawPattern();
    });

    // Handle resize with debounce
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        setCanvasSize();
        requestAnimationFrame(() => {
          drawPattern();
        });
      }, 150);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        opacity,
        zIndex: 0,
        mixBlendMode: 'normal',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    />
  );
};