import React, { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { isLowEndDevice, prefersReducedMotion } from '../../utils/deviceDetection';
import { Snowfall } from '../christmas/Snowfall';
import '../christmas/christmas.css';

// Lazy load particles to avoid blocking initial page load
const ParticlesBackground = lazy(() =>
  import('../../components/ParticlesBackground').then((module) => ({
    default: module.ParticlesBackground,
  }))
);

/**
 * ThemeBackground Component
 * 
 * Renders the appropriate background animation based on the current theme:
 * - Default theme: Particles.js background (disabled on low-end)
 * - Christmas theme: Snowfall animation (lighter, works on mobile)
 */
export const ThemeBackground: React.FC = () => {
  const { themeConfig } = useTheme();
  const [showAnimation, setShowAnimation] = useState(true);

  // Determine if animations should be shown
  const shouldShow = useMemo(() => {
    const isLowEnd = isLowEndDevice();
    const reducedMotion = prefersReducedMotion();

    // For Christmas theme, allow even on low-end devices (snowfall is lightweight)
    if (themeConfig.name === 'christmas') {
      return !reducedMotion;
    }

    // For particles (default theme), disable on low-end devices
    return !isLowEnd && !reducedMotion;
  }, [themeConfig.name]);

  // Update state after mount to avoid hydration issues
  useEffect(() => {
    setShowAnimation(shouldShow);
  }, [shouldShow]);

  // Update body background for Christmas theme
  useEffect(() => {
    if (themeConfig.name === 'christmas') {
      document.body.style.background = 'linear-gradient(to bottom, #0A1929 0%, #0D1B2A 50%, #1A2332 100%)';
    } else {
      document.body.style.background = '';
    }
    
    return () => {
      document.body.style.background = '';
    };
  }, [themeConfig.name]);

  // Don't render any animation if device doesn't support it
  if (!showAnimation) {
    return null;
  }

  // Render particles for themes that have particles enabled
  if (themeConfig.particles.enabled) {
    return (
      <Suspense fallback={null}>
        <ParticlesBackground {...themeConfig.particles} />
      </Suspense>
    );
  }

  // Render Christmas snowfall for Christmas theme
  if (themeConfig.name === 'christmas') {
    return <Snowfall />;
  }

  // No background animation
  return null;
};