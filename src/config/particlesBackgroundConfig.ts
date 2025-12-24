/**
 * Particles Background Configuration
 * 
 * Customize the particles.js background appearance and behavior here.
 * Changes to this file will affect the background across all pages.
 */

export interface ParticlesBackgroundConfig {
  // Z-index for layering (should be negative to stay behind content)
  zIndex: number;
  
  // Number of particles
  particleCount: number;
  
  // Particle movement speed (0.1 - 6.0, higher is faster)
  particleSpeed: number;
  
  // Color theme: 'blue' | 'purple' | 'green' | 'gold'
  colorTheme: 'blue' | 'purple' | 'green' | 'gold';
  
  // Custom CSS classes
  className?: string;
}

export const particlesBackgroundConfig: ParticlesBackgroundConfig = {
  // Z-index for layering (should be above background but below content)
  zIndex: 1,
  
  // Number of particles to display
  // Reduced for better memory usage (was 150)
  particleCount: 60,
  
  // Particle movement speed (1.5 = moderate speed)
  particleSpeed: 1.5,
  
  // Color theme to match site design
  // 'gold' matches the site's accent color
  colorTheme: 'gold',
  
  // Additional CSS classes
  className: '',
};

/**
 * Mobile-specific configuration
 * These settings override the main config on mobile devices
 */
export const mobileParticlesBackgroundConfig: Partial<ParticlesBackgroundConfig> = {
  // Reduce particle count on mobile for better performance and memory
  particleCount: 30,
  
  // Slightly slower speed on mobile for better performance
  particleSpeed: 1.2,
};