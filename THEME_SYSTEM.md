# Theme System Documentation

## Overview

This project implements a modular theme system that allows for easy theme switching without touching page components. The system automatically switches between themes based on date ranges and supports manual overrides for testing.

## Architecture

```
/src/themes/
  /theme/                    # Core theme system
    types.ts                 # TypeScript type definitions
    ThemeContext.tsx         # Theme provider and context
    ThemeBackground.tsx      # Theme-aware background component
    index.ts                 # Central exports
  
  /default/                  # Default theme
    DefaultTheme.ts          # Default theme configuration
  
  /christmas/                # Christmas/Winter theme
    ChristmasTheme.ts        # Christmas theme configuration
    Snowfall.tsx             # Snowfall animation component
```

## Features

### 1. **Modular Theme Structure**
- Each theme is self-contained with its own configuration
- Themes define colors, particle settings, and custom animations
- No global CSS leaks or hardcoded values in components

### 2. **Automatic Theme Switching**
- Christmas theme is active from **December 20th to January 20th**
- Automatically handles year rollover (Dec 31 → Jan 1)
- Checks every hour for date changes

### 3. **Manual Override**
- Can force a specific theme for testing purposes
- Override persists until removed

### 4. **Performance Optimizations**
- Respects `prefers-reduced-motion` for accessibility
- Detects low-end devices and disables animations
- Lazy loads heavy components (particles.js)
- Lightweight snowfall (only 50 snowflakes)

### 5. **Animation Control**
- Default theme: Particle.js background
- Christmas theme: Snowfall animation (particles disabled)
- Seamless switching without visual glitches

## Current Themes

### Default Theme
The original Iranic/Persian color palette:
- Deep background blue (Lapis Lazuli)
- Gold/Saffron accent colors
- Particle.js background with 250 particles
- Gold color scheme matching site identity

### Christmas/Winter Theme
Active from December 20th to January 20th:
- Cooler winter blue colors
- Ice blue accent colors
- Snowfall animation instead of particles
- Subtle winter atmosphere

## Usage

### Basic Setup

The theme system is already integrated into the app in `App.tsx`:

```tsx
import { ThemeProvider } from './themes/theme';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Theme Colors in Components

Access theme colors via CSS variables:

```tsx
<div style={{ backgroundColor: 'var(--color-bg)' }}>
  <h1 style={{ color: 'var(--color-accent)' }}>Title</h1>
</div>
```

Or with Tailwind (using arbitrary values):

```tsx
<div className="bg-[var(--color-card)] border-[var(--color-border)]">
  Content
</div>
```

### Accessing Theme Context

Use the `useTheme` hook to access theme information:

```tsx
import { useTheme } from '../themes/theme';

function MyComponent() {
  const { currentTheme, themeConfig, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {themeConfig.displayName}</p>
      <button onClick={() => setTheme('christmas')}>
        Switch to Christmas Theme
      </button>
    </div>
  );
}
```

### Manual Theme Override (for Testing)

Force a specific theme:

```tsx
import { ThemeProvider } from './themes/theme';

function App() {
  return (
    <ThemeProvider forcedTheme="christmas">
      {/* App will always use Christmas theme */}
    </ThemeProvider>
  );
}
```

Remove the `forcedTheme` prop to restore automatic date-based switching.

## Creating a New Theme

### Step 1: Create Theme Configuration

Create a new file `src/themes/mytheme/MyTheme.ts`:

```typescript
import type { ThemeConfig } from '../theme/types';

export const myTheme: ThemeConfig = {
  name: 'mytheme',
  displayName: 'My Custom Theme',
  colors: {
    bg: '#1a1a2e',
    card: '#16213e',
    header: '#0f3460',
    accent: '#e94560',
    secondary: '#f39c12',
    border: '#0f3460',
    text: '#ffffff',
  },
  particles: {
    enabled: true,
    particleCount: 150,
    particleSpeed: 2,
    colorTheme: 'purple',
    fpsLimit: 60,
    interactivity: true,
    enableLinks: true,
    detectRetina: true,
  },
};
```

### Step 2: Add Custom Animation (Optional)

If your theme needs a custom animation instead of particles:

```typescript
import { MyCustomAnimation } from './MyCustomAnimation';

export const myTheme: ThemeConfig = {
  // ... other config
  particles: {
    enabled: false, // Disable particles
    // ... rest of config
  },
  customAnimation: MyCustomAnimation, // Optional custom component
};
```

### Step 3: Register Theme

Update `src/themes/theme/ThemeContext.tsx`:

```typescript
import { myTheme } from '../mytheme/MyTheme';

// Add to theme name type
export type ThemeName = 'default' | 'christmas' | 'mytheme';

// Update getThemeConfig function
const getThemeConfig = (themeName: ThemeName): ThemeConfig => {
  switch (themeName) {
    case 'christmas':
      return christmasTheme;
    case 'mytheme':
      return myTheme;
    case 'default':
    default:
      return defaultTheme;
  }
};

// Update availableThemes
availableThemes: ['default', 'christmas', 'mytheme'],
```

### Step 4: Add Activation Logic (Optional)

If your theme should auto-activate based on specific dates:

```typescript
const getActiveTheme = (forcedTheme?: ThemeName): ThemeName => {
  if (forcedTheme) return forcedTheme;
  
  if (isChristmasSeason()) return 'christmas';
  if (isMyThemeSeason()) return 'mytheme';
  
  return 'default';
};
```

## CSS Variables Reference

All themes must define these CSS variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `--color-bg` | Main background color | `#0b1424` |
| `--color-card` | Card/container background | `#152238` |
| `--color-header` | Header background | `#1e3355` |
| `--color-accent` | Primary accent color | `#d4af37` |
| `--color-secondary` | Secondary accent | `#f4d03f` |
| `--color-border` | Border color | `#1e3355` |
| `--color-text` | Text color | `#ffffff` |

Additional custom variables can be added per theme (e.g., `--color-snow`, `--color-glow`).

## Testing

### Test Date-Based Switching

To test the Christmas theme outside of December 20 - January 20:

```tsx
<ThemeProvider forcedTheme="christmas">
  <App />
</ThemeProvider>
```

### Test on Different Devices

The theme system automatically:
- Reduces animation on mobile devices
- Disables animations on low-end devices
- Respects `prefers-reduced-motion` setting

To test these scenarios:
1. Resize browser window to mobile width
2. Use Chrome DevTools > Rendering > Emulate CSS media feature `prefers-reduced-motion: reduce`
3. Test on actual low-end devices

## Migration from Old System

The refactor maintains **100% visual compatibility** with the old system:

### What Changed
✅ Particles background extracted to theme system  
✅ Colors moved to theme configuration  
✅ Layout component simplified  
✅ Added theme switching capability  

### What Stayed the Same
✅ All colors remain identical  
✅ Particle.js configuration unchanged  
✅ Performance optimizations preserved  
✅ Device detection logic intact  
✅ CSS custom properties still used  

### Breaking Changes
None! The app looks and behaves exactly the same by default.

## Troubleshooting

### Theme not switching on date change
- The system checks every hour, not immediately at midnight
- Try forcing the theme with `forcedTheme` prop to verify it works
- Check browser console for any errors

### Animations not showing
- Check if `prefers-reduced-motion` is enabled in OS settings
- Verify device is not detected as low-end
- Open browser console and check for errors

### Colors not updating
- CSS variables are applied to `:root` element
- Check that components use `var(--color-*)` syntax
- Verify theme is actually changing in React DevTools

## Performance Considerations

### Particles.js
- Lazy loaded to avoid blocking initial render
- Disabled on low-end devices
- FPS limited to 60 (30 on mobile)
- Particle count reduced on mobile (250 → 200)

### Snowfall
- Lightweight: only 50 snowflakes
- Pure CSS animations (GPU accelerated)
- Automatically disabled on `prefers-reduced-motion`
- No external dependencies

### Theme Switching
- Date checks run every hour (not on every render)
- CSS variable updates are batched
- No layout thrashing or reflows

## Future Enhancements

Potential additions to the theme system:
- [ ] User preference storage (localStorage)
- [ ] More seasonal themes (Halloween, Spring, etc.)
- [ ] Theme preview mode
- [ ] Gradual theme transition animations
- [ ] Theme customizer UI
- [ ] Dark/light mode toggle per theme