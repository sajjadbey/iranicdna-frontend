import React, { useEffect, useRef } from 'react';

interface DNAMatrixBackgroundProps {
  opacity?: number;
}

export const DNAMatrixBackground: React.FC<DNAMatrixBackgroundProps> = ({ 
  opacity = 0.15
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Get color from CSS variables
    const getAccentColor = () => {
      const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim();
      return accentColor || '#d4af37';
    };

    // Draw static DNA helix pattern
    const drawPattern = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const accentColor = getAccentColor();
      ctx.fillStyle = accentColor;
      ctx.font = '12px monospace';
      
      const lineHeight = 18;
      const charSpacing = 7;
      
      // Calculate how many characters fit per row
      const charsPerRow = Math.ceil(canvas.width / charSpacing);
      const rows = Math.ceil(canvas.height / lineHeight) + 2;
      
      const nucleotides = ['A', 'T', 'G', 'C'];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < charsPerRow; col++) {
          // Randomly pick a nucleotide
          const char = nucleotides[Math.floor(Math.random() * nucleotides.length)];
          
          const x = col * charSpacing;
          const y = row * lineHeight;
          
          ctx.fillText(char, x, y);
        }
      }
    };

    // Draw once
    drawPattern();

    // Handle resize
    const handleResize = () => {
      setCanvasSize();
      drawPattern();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        opacity,
        zIndex: 0,
        mixBlendMode: 'normal'
      }}
    />
  );
};