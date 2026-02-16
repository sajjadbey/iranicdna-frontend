import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

interface ParticlesBackgroundProps {
  className?: string;
  zIndex?: number;
  particleCount?: number;
  particleSpeed?: number;
  colorTheme?: 'blue' | 'purple' | 'green' | 'gold';
  fpsLimit?: number;
  interactivity?: boolean;
  enableLinks?: boolean;
  detectRetina?: boolean;
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({
  className = '',
  zIndex = -1,
  particleCount = 80,
  particleSpeed = 1.5,
  colorTheme = 'gold',
  fpsLimit = 60,
  interactivity = true,
  enableLinks = true,
  detectRetina = true,
}) => {
  const [init, setInit] = useState(false);

  // Initialize particles engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (): Promise<void> => {
    // Particles loaded successfully
  };

  // Color themes matching the site design
  const colorSchemes = {
    blue: {
      particles: '#14b8a6', // teal-500
      links: '#0d9488', // teal-600
    },
    purple: {
      particles: '#a855f7', // purple-500
      links: '#9333ea', // purple-600
    },
    green: {
      particles: '#10b981', // emerald-500
      links: '#059669', // emerald-600
    },
    gold: {
      particles: '#d4af37', // Gold/Saffron
      links: '#f4d03f', // Lighter Gold
    },
  };

  const colors = colorSchemes[colorTheme];

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit,
      interactivity: interactivity ? {
        events: {
          onClick: {
            enable: true,
            mode: 'push',
          },
          onHover: {
            enable: true,
            mode: 'grab',
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          grab: {
            distance: 140,
            links: {
              blink: false,
              consent: false,
              opacity: 0.5,
            },
          },
        },
      } : {
        events: {
          onClick: {
            enable: false,
          },
          onHover: {
            enable: false,
          },
        },
      },
      style: {
        position: 'absolute',
        width: '100%',
        height: '100%',
      },
      particles: {
        color: {
          value: colors.particles,
        },
        links: {
          color: colors.links,
          distance: enableLinks ? 150 : 0,
          enable: enableLinks,
          opacity: enableLinks ? 0.3 : 0,
          width: enableLinks ? 1 : 0,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: false,
          speed: particleSpeed,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: particleCount,
        },
        opacity: {
          value: 0.7,
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 2, max: 5 },
        },
      },
      detectRetina,
    }),
    [colors, particleCount, particleSpeed, fpsLimit, interactivity, enableLinks, detectRetina]
  );

  if (!init) {
    return null;
  }

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      options={options}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    />
  );
};