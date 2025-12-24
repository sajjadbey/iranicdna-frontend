import type { ThemeConfig } from '../theme/types';

/**
 * Christmas/Winter Theme Configuration
 * 
 * Active from December 20th to January 20th
 * - Frosted winter atmosphere with glass morphism
 * - Ice blue and gold accents
 * - Snowfall animation with glowing effects
 * - Floating winter decorative elements
 */
export const christmasTheme: ThemeConfig = {
  name: 'christmas',
  displayName: 'Winter Wonderland',
  colors: {
    bg: '#0A1929',        // Deep winter night blue
    card: '#0D1B2A',      // Slightly lighter card background
    header: '#1A2332',    // Header winter blue
    accent: '#AFDBF5',    // Ice blue accent
    secondary: '#FFD700', // Gold accent
    border: '#1A2332',
    text: '#ffffff',
    // Christmas-specific colors
    'snow': '#ffffff',
    'ice': '#AFDBF5',
    'ice-dark': '#A4DDED',
    'gold': '#FFD700',
    'glow': '#AFDBF5',
  },
  particles: {
    enabled: false, // Disable particles in favor of snowfall
    particleCount: 0,
    particleSpeed: 0,
    colorTheme: 'blue',
    fpsLimit: 60,
    interactivity: false,
    enableLinks: false,
    detectRetina: false,
  },
};