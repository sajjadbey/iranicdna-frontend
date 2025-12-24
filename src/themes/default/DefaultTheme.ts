import type { ThemeConfig } from '../theme/types';

/**
 * Default Theme Configuration
 * 
 * This is the original theme with Iranic/Persian color palette
 * - Deep background blue (Lapis Lazuli)
 * - Gold/Saffron accent
 * - Warmer header/card color
 */
export const defaultTheme: ThemeConfig = {
  name: 'default',
  displayName: 'Default Theme',
  colors: {
    bg: '#0b1424',      // Very Dark Blue/Lapis Lazuli base
    card: '#152238',    // Slightly lighter for cards (Midnight Blue)
    header: '#1e3355',  // Deeper blue for header/borders
    accent: '#d4af37',  // Gold/Saffron for primary accent
    secondary: '#f4d03f', // Lighter Gold for subtle highlights
    border: '#1e3355',
    text: '#ffffff',
  },
  particles: {
    enabled: true,
    particleCount: 250,
    particleSpeed: 1.2,
    colorTheme: 'gold',
    fpsLimit: 60,
    interactivity: true,
    enableLinks: true,
    detectRetina: true,
  },
};