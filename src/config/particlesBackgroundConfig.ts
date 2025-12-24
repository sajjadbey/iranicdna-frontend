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
  
  // FPS limit for performance control
  fpsLimit?: number;
  
  // Enable/disable interactivity (hover, click)
  interactivity?: boolean;
  
  // Enable/disable particle links
  enableLinks?: boolean;
  
  // Enable/disable retina detection (2x rendering on high-DPI screens)
  detectRetina?: boolean;
  
  // Custom CSS classes
  className?: string;
}

export const particlesBackgroundConfig: ParticlesBackgroundConfig = {
  // Z-index for layering (should be above background but below content)
  zIndex: 1,
  
  // Number of particles to display
  particleCount: 250,
  
  // Particle movement speed (1.5 = moderate speed)
  particleSpeed: 1.2,
  
  // Color theme to match site design
  // 'gold' matches the site's accent color
  colorTheme: 'gold',
  
  // FPS limit (60 is smooth on desktop)
  fpsLimit: 60,
  
  // Enable interactivity on desktop
  interactivity: true,
  
  // Enable particle links on desktop
  enableLinks: true,
  
  // Enable retina detection on desktop
  detectRetina: true,
  
  // Additional CSS classes
  className: '',
};

/**
 * Mobile-specific configuration
 * These settings override the main config on mobile devices for better performance
 */
export const mobileParticlesBackgroundConfig: Partial<ParticlesBackgroundConfig> = {
  // Drastically reduce particle count on mobile for better performance
  particleCount: 15,
  
  // Slower speed on mobile saves CPU
  particleSpeed: 0.8,
  
  // Lower FPS on mobile (30 FPS is sufficient and saves battery)
  fpsLimit: 30,
  
  // Disable interactivity on mobile (saves significant resources)
  interactivity: false,
  
  // Disable links on mobile (expensive to render)
  enableLinks: false,
  
  // Disable retina detection on mobile (avoids 2x rendering overhead)
  detectRetina: false,
};