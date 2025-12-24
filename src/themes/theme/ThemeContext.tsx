import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ThemeName, ThemeConfig, ThemeContextValue } from './types';
import { defaultTheme } from '../default/DefaultTheme';
import { christmasTheme } from '../christmas/ChristmasTheme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  forcedTheme?: ThemeName; // For testing/manual override
}

/**
 * Check if current date is within Christmas theme period
 * Active from December 20th to January 20th
 */
const isChristmasSeason = (): boolean => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate(); // 1-31

  // December 20-31 (month 11, days 20-31)
  if (month === 11 && day >= 20) {
    return true;
  }

  // January 1-20 (month 0, days 1-20)
  if (month === 0 && day <= 20) {
    return true;
  }

  return false;
};

/**
 * Get the appropriate theme based on date and forced theme
 */
const getActiveTheme = (forcedTheme?: ThemeName): ThemeName => {
  // Manual override takes precedence
  if (forcedTheme) {
    return forcedTheme;
  }

  // Auto-switch based on date
  return isChristmasSeason() ? 'christmas' : 'default';
};

/**
 * Get theme configuration by name
 */
const getThemeConfig = (themeName: ThemeName): ThemeConfig => {
  switch (themeName) {
    case 'christmas':
      return christmasTheme;
    case 'default':
    default:
      return defaultTheme;
  }
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, forcedTheme }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => 
    getActiveTheme(forcedTheme)
  );

  // Update theme when forced theme changes
  useEffect(() => {
    if (forcedTheme) {
      setCurrentTheme(forcedTheme);
    }
  }, [forcedTheme]);

  // Check date daily and auto-switch if not forced
  useEffect(() => {
    if (forcedTheme) return; // Don't auto-switch if manually forced

    // Check immediately
    const activeTheme = getActiveTheme();
    if (activeTheme !== currentTheme) {
      setCurrentTheme(activeTheme);
    }

    // Check every hour for date changes
    const interval = setInterval(() => {
      const newActiveTheme = getActiveTheme();
      if (newActiveTheme !== currentTheme) {
        setCurrentTheme(newActiveTheme);
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [currentTheme, forcedTheme]);

  const themeConfig = useMemo(() => getThemeConfig(currentTheme), [currentTheme]);

  const contextValue: ThemeContextValue = {
    currentTheme,
    themeConfig,
    setTheme: setCurrentTheme,
    availableThemes: ['default', 'christmas'],
  };

  // Apply CSS variables to root element
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [themeConfig.colors]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};