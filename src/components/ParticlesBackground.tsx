import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container, ISourceOptions } from '@tsparticles/engine';

interface ParticlesBackgroundProps {
  className?: string;
  zIndex?: number;
  particleCount?: number;
  particleSpeed?: number;
  colorTheme?: 'blue' | 'purple' | 'green' | 'gold';
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({
  className = '',
  zIndex = -1,
  particleCount = 80,
  particleSpeed = 1.5,
  colorTheme = 'gold',
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

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Particles loaded', container);
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
      fpsLimit: 60,
      interactivity: {
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
          distance: 150,
          enable: true,
          opacity: 0.3,
          width: 1,
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
      detectRetina: true,
    }),
    [colors, particleCount]
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
      }}
    />
  );
};