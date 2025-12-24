import React, { useEffect, useState } from 'react';
import { Snowflake as SnowflakeIcon, Star, Gift } from 'lucide-react';
import { prefersReducedMotion, isMobileDevice } from '../../utils/deviceDetection';

interface SnowflakeData {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

/**
 * Winter-themed background with snowfall and decorative elements
 * Matches the festive design with frosted orbs and floating icons
 * Optimized for mobile with reduced snowflake count
 */
export const Snowfall: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<SnowflakeData[]>([]);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    // Respect user's motion preferences
    const reducedMotion = prefersReducedMotion();
    setShouldAnimate(!reducedMotion);

    if (reducedMotion) {
      return;
    }

    // Reduce snowflake count on mobile for better performance
    const isMobile = isMobileDevice();
    const snowflakeCount = isMobile ? 30 : 50;

    // Generate snowflakes with random properties
    const flakes = Array.from({ length: snowflakeCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
      size: 12 + Math.random() * 8,
    }));

    setSnowflakes(flakes);
  }, []);

  if (!shouldAnimate) {
    return null;
  }

  return (
    <>
      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-100px) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9);
          }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(175, 219, 245, 0.5),
                         0 0 40px rgba(175, 219, 245, 0.3);
          }
          50% {
            text-shadow: 0 0 30px rgba(175, 219, 245, 0.8),
                         0 0 60px rgba(175, 219, 245, 0.5),
                         0 0 80px rgba(255, 215, 0, 0.3);
          }
        }

        .snowflake-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .snowflake-item {
          position: fixed;
          top: -100px;
          color: rgba(255, 255, 255, 0.3);
          animation: snowfall linear infinite;
          will-change: transform, opacity;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 3s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        /* Reduce animations on lower-end devices */
        @media (prefers-reduced-motion: reduce) {
          .snowflake-item,
          .animate-float,
          .animate-sparkle,
          .animate-glow {
            animation: none !important;
            display: none;
          }
        }
      `}</style>

      {/* Snowfall Animation */}
      <div className="snowflake-container">
        {snowflakes.map((flake) => (
          <SnowflakeIcon
            key={flake.id}
            className="snowflake-item"
            size={flake.size}
            style={{
              left: `${flake.left}%`,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Winter Background Decorations */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Frosted gradient orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#AFDBF5]/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#FFD700]/10 rounded-full blur-[100px] translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#A4DDED]/15 rounded-full blur-[140px]"></div>

        {/* Floating winter elements */}
        <div className="absolute top-20 right-20 opacity-10 animate-float">
          <Star size={40} className="text-[#FFD700]" />
        </div>
        <div 
          className="absolute top-1/2 left-10 opacity-10 animate-float" 
          style={{ animationDelay: '2s' }}
        >
          <SnowflakeIcon size={60} className="text-[#AFDBF5]" />
        </div>
        <div 
          className="absolute bottom-40 right-40 opacity-10 animate-float" 
          style={{ animationDelay: '4s' }}
        >
          <Gift size={50} className="text-[#FFD700]" />
        </div>
      </div>
    </>
  );
};