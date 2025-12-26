import React, { useEffect, useState, useRef } from 'react';
import { Snowflake as SnowflakeIcon, Star, Gift } from 'lucide-react';
import { prefersReducedMotion } from '../../utils/deviceDetection';

interface SnowflakeData {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

// Generate snowflakes once and reuse them across navigation
let cachedSnowflakes: SnowflakeData[] | null = null;

const generateSnowflakes = (): SnowflakeData[] => {
  if (cachedSnowflakes) {
    return cachedSnowflakes;
  }

  const snowflakeCount = 50;
  cachedSnowflakes = Array.from({ length: snowflakeCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 20,
    size: 12 + Math.random() * 8,
  }));

  return cachedSnowflakes;
};

/**
 * Winter-themed background with snowfall and decorative elements
 * Matches the festive design with frosted orbs and floating icons
 * Snowflakes persist across navigation for smooth experience
 */
export const Snowfall: React.FC = () => {
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const snowflakesRef = useRef<SnowflakeData[]>(generateSnowflakes());

  useEffect(() => {
    // Respect user's motion preferences
    const reducedMotion = prefersReducedMotion();
    setShouldAnimate(!reducedMotion);
  }, []);

  if (!shouldAnimate) {
    return null;
  }

  const snowflakes = snowflakesRef.current;

  return (
    <>
      {/* Snowfall Animation - Fixed positioning with high z-index */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {snowflakes.map((flake) => (
          <SnowflakeIcon
            key={flake.id}
            className="absolute text-white/30 animate-snowfall"
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
      <div className="fixed inset-0 z-[998] pointer-events-none">
        {/* Frosted gradient orbs */}
        <div className="absolute top-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#AFDBF5]/20 rounded-full blur-[80px] md:blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-[#FFD700]/10 rounded-full blur-[60px] md:blur-[100px] translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#A4DDED]/15 rounded-full blur-[80px] md:blur-[140px]"></div>

        {/* Floating winter elements - hide on small mobile */}
        <div className="hidden sm:block absolute top-20 right-20 opacity-10 animate-float">
          <Star size={40} className="text-[#FFD700]" />
        </div>
        <div 
          className="hidden sm:block absolute top-1/2 left-10 opacity-10 animate-float" 
          style={{ animationDelay: '2s' }}
        >
          <SnowflakeIcon size={60} className="text-[#AFDBF5]" />
        </div>
        <div 
          className="hidden sm:block absolute bottom-40 right-40 opacity-10 animate-float" 
          style={{ animationDelay: '4s' }}
        >
          <Gift size={50} className="text-[#FFD700]" />
        </div>
      </div>
    </>
  );
};