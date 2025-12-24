import React from 'react';
import { Snowflake, Sun } from 'lucide-react';
import { useTheme } from '../themes/theme';

/**
 * Theme Toggle Component (Optional)
 * 
 * Allows manual theme switching for testing/demonstration.
 * This is useful during development or if you want to give users control.
 * 
 * By default, the theme auto-switches based on dates (Dec 20 - Jan 20).
 * This component provides a manual override.
 */
export const ThemeToggle: React.FC = () => {
  const { currentTheme, setTheme, themeConfig } = useTheme();

  const toggleTheme = () => {
    const newTheme = currentTheme === 'default' ? 'christmas' : 'default';
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all
        ${currentTheme === 'christmas' 
          ? 'glass-effect ice-glow' 
          : 'bg-gradient-to-r from-teal-600 to-amber-600'
        }
        hover:scale-110 group
      `}
      aria-label={`Switch to ${currentTheme === 'default' ? 'Winter' : 'Default'} theme`}
      title={`Current: ${themeConfig.displayName}`}
    >
      {currentTheme === 'christmas' ? (
        <Sun className="text-[#FFD700] w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
      ) : (
        <Snowflake className="text-white w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
      )}
    </button>
  );
};

/**
 * Usage Example:
 * 
 * Add this component anywhere in your app to enable manual theme switching:
 * 
 * import { ThemeToggle } from './components/ThemeToggle';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <YourContent />
 *       <ThemeToggle />
 *     </div>
 *   );
 * }
 * 
 * The floating button will appear in the bottom-right corner.
 * Remove this component in production if you want purely date-based switching.
 */