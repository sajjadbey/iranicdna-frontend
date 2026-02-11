import React, { useEffect, useRef } from 'react';
import { Dna } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

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
      
      const iconSize = 20;
      const spacing = 40;
      
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);
      
      // Create DNA icon SVG
      const iconSvg = renderToStaticMarkup(<Dna size={iconSize} color={accentColor} />);
      const img = new Image();
      const svgBlob = new Blob([iconSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * spacing + (row % 2) * (spacing / 2);
            const y = row * spacing;
            ctx.drawImage(img, x, y, iconSize, iconSize);
          }
        }
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
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