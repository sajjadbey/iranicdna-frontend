import type { ColorScheme, HelixConfig } from '../../types/dna-background';

// Color themes
export const COLOR_THEMES: Record<string, ColorScheme> = {
  blue: {
    strand1: '#3b82f6',
    strand2: '#60a5fa',
    basePairs: '#93c5fd',
    particles: '#dbeafe',
  },
  purple: {
    strand1: '#a855f7',
    strand2: '#c084fc',
    basePairs: '#d8b4fe',
    particles: '#f3e8ff',
  },
  green: {
    strand1: '#10b981',
    strand2: '#34d399',
    basePairs: '#6ee7b7',
    particles: '#d1fae5',
  },
  gold: {
    strand1: '#d4af37',
    strand2: '#f4d03f',
    basePairs: '#ffd700',
    particles: '#fff8dc',
  },
};

// Helix configuration
export const HELIX_CONFIG: HelixConfig = {
  radius: 1.5,
  height: 12,
  turns: 3,
  pointsPerTurn: 32,
  strandRadius: 0.15,
  basePairLength: 2.5,
};

// Particle density configurations
export const PARTICLE_COUNTS = {
  low: 50,
  medium: 100,
  high: 200,
};

// Performance thresholds
export const PERFORMANCE_PARTICLE_COUNT = 30;