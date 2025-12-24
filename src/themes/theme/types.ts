/**
 * Theme System Types
 * 
 * Defines the structure of themes in the application
 */

export type ThemeName = 'default' | 'christmas';

export interface ThemeColors {
  bg: string;
  card: string;
  header: string;
  accent: string;
  secondary: string;
  border: string;
  text: string;
  // Additional theme-specific colors
  [key: string]: string;
}

export interface ParticleConfig {
  enabled: boolean;
  particleCount: number;
  particleSpeed: number;
  colorTheme: 'blue' | 'purple' | 'green' | 'gold';
  fpsLimit: number;
  interactivity: boolean;
  enableLinks: boolean;
  detectRetina: boolean;
}

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  colors: ThemeColors;
  particles: ParticleConfig;
  customAnimation?: React.ComponentType;
}

export interface ThemeContextValue {
  currentTheme: ThemeName;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
}