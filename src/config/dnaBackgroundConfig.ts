import type { DNABackgroundProps } from '../types/dna-background';

/**
 * DNA Background Configuration
 * 
 * Customize the 3D DNA background appearance and behavior here.
 * Changes to this file will affect the background across all pages.
 */

export const dnaBackgroundConfig: DNABackgroundProps = {
  // Animation speed multiplier (0 = paused, 1 = normal, 2 = double speed, etc.)
  animationSpeed: 0.8,
  
  // Color theme: 'blue' | 'purple' | 'green' | 'gold' | 'custom'
  // Use 'gold' to match the site's accent color
  colorTheme: 'gold',
  
  // Custom colors (only used when colorTheme is 'custom')
  // Uncomment and modify to use custom colors:
  // customColors: {
  //   strand1: '#d4af37',
  //   strand2: '#f4d03f',
  //   basePairs: '#ffd700',
  //   particles: '#fff8dc',
  // },
  
  // Particle density: 'low' | 'medium' | 'high'
  // Lower density improves performance on mobile devices
  particleDensity: 'medium',
  
  // Enable mouse interaction (parallax camera movement)
  // Disable on mobile for better performance
  mouseInteraction: true,
  
  // Dark overlay opacity (0 = transparent, 1 = fully dark)
  // Higher values make foreground content more readable
  overlayOpacity: 0.4,
  
  // Z-index for layering (should be negative to stay behind content)
  zIndex: -1,
  
  // Performance mode (reduces effects for better performance)
  // Automatically enabled on mobile devices
  performanceMode: false,
};

/**
 * Mobile-specific configuration
 * These settings override the main config on mobile devices
 */
export const mobileDnaBackgroundConfig: Partial<DNABackgroundProps> = {
  animationSpeed: 0.5,
  particleDensity: 'low',
  mouseInteraction: false,
  performanceMode: true,
  overlayOpacity: 0.5,
};