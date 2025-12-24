import { Suspense, useMemo, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import type { DNABackgroundProps, ColorScheme } from '../../types/dna-background';
import { Scene } from './Scene';
import {
  COLOR_THEMES,
  HELIX_CONFIG,
  PARTICLE_COUNTS,
  PERFORMANCE_PARTICLE_COUNT,
} from './constants';

export function DNABackground({
  animationSpeed = 1,
  colorTheme = 'blue',
  customColors,
  particleDensity = 'medium',
  mouseInteraction = true,
  overlayOpacity = 0,
  zIndex = -1,
  performanceMode = false,
  className = '',
}: DNABackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine color scheme
  const colors: ColorScheme = useMemo(() => {
    if (customColors) {
      const baseColors = COLOR_THEMES[colorTheme] || COLOR_THEMES.blue;
      return {
        strand1: customColors.strand1 || baseColors.strand1,
        strand2: customColors.strand2 || baseColors.strand2,
        basePairs: customColors.basePairs || baseColors.basePairs,
        particles: customColors.particles || baseColors.particles,
      };
    }
    return COLOR_THEMES[colorTheme] || COLOR_THEMES.blue;
  }, [colorTheme, customColors]);
  
  // Determine particle count
  const particleCount = useMemo(() => {
    if (performanceMode) {
      return PERFORMANCE_PARTICLE_COUNT;
    }
    return PARTICLE_COUNTS[particleDensity];
  }, [particleDensity, performanceMode]);
  
  // Particle configuration
  const particleConfig = useMemo(
    () => ({
      count: particleCount,
      size: 0.08,
      spread: 6,
      speed: 0.02,
    }),
    [particleCount]
  );

  // Handle WebGL context loss
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost. Attempting to restore...');
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored.');
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);
  
  return (
    <div
      className={`fixed inset-0 ${className}`}
      style={{ zIndex }}
    >
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{
          alpha: true,
          antialias: !performanceMode,
          powerPreference: performanceMode ? 'low-power' : 'high-performance',
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={performanceMode ? 1 : [1, 2]}
        onCreated={({ gl }) => {
          // Additional WebGL context configuration
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <Scene
            helixConfig={HELIX_CONFIG}
            particleConfig={particleConfig}
            colors={colors}
            animationSpeed={animationSpeed}
            mouseInteraction={mouseInteraction}
          />
        </Suspense>
      </Canvas>
      
      {/* Overlay */}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
}

// Export types
export type { DNABackgroundProps } from '../../types/dna-background';