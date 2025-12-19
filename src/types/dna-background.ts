// Type definitions for DNA Background component

export type ColorTheme = 'blue' | 'purple' | 'green' | 'gold' | 'custom';
export type ParticleDensity = 'low' | 'medium' | 'high';

export interface CustomColors {
  strand1?: string;
  strand2?: string;
  basePairs?: string;
  particles?: string;
}

export interface DNABackgroundProps {
  // Animation speed multiplier (default: 1)
  animationSpeed?: number;
  
  // Color theme preset or custom colors
  colorTheme?: ColorTheme;
  
  // Custom colors (overrides theme)
  customColors?: CustomColors;
  
  // Particle density level
  particleDensity?: ParticleDensity;
  
  // Enable/disable mouse interaction
  mouseInteraction?: boolean;
  
  // Opacity of the background overlay (0-1)
  overlayOpacity?: number;
  
  // Z-index for layering
  zIndex?: number;
  
  // Enable performance mode (reduces particle count and effects)
  performanceMode?: boolean;
  
  // Additional className for styling
  className?: string;
}

export interface HelixConfig {
  radius: number;
  height: number;
  turns: number;
  pointsPerTurn: number;
  strandRadius: number;
  basePairLength: number;
}

export interface ParticleConfig {
  count: number;
  size: number;
  spread: number;
  speed: number;
}

export interface ColorScheme {
  strand1: string;
  strand2: string;
  basePairs: string;
  particles: string;
}