# Christmas/Winter Theme Guide

## Overview

The Christmas theme automatically activates from **December 20th to January 20th** and transforms your app into a winter wonderland with:

- ❄️ Snowfall animation with 50 snowflakes
- 🎨 Frosted glass morphism effects
- ✨ Glowing text and ice blue/gold accents
- 🎄 Floating decorative elements (stars, snowflakes, gifts)
- 🌌 Gradient background orbs for depth

## Visual Style

### Color Palette
```css
Background: #0A1929 → #0D1B2A → #1A2332 (gradient)
Ice Blue: #AFDBF5
Dark Ice: #A4DDED  
Gold: #FFD700
Snow White: #ffffff
```

### Design Elements

1. **Glass Morphism**
   - Semi-transparent cards with blur effect
   - Subtle borders with gradient shimmer
   - Elevated hover states

2. **Glowing Effects**
   - Text shadows on headings
   - Box shadows on interactive elements
   - Animated sparkle effects

3. **Floating Decorations**
   - Stars, snowflakes, and gift icons
   - Subtle floating animation
   - Positioned at various corners

## Using Winter Styles in Your Components

### Glass Effect Cards

```tsx
import React from 'react';

export const WinterCard = () => {
  return (
    <div className="glass-effect glass-hover p-6 rounded-2xl winter-shadow">
      <h3 className="text-xl font-bold winter-gradient-text mb-4">
        Your Title
      </h3>
      <p className="text-slate-300">Your content here</p>
    </div>
  );
};
```

### Glowing Buttons

```tsx
<button className="winter-button px-6 py-3 rounded-xl">
  Click Me
</button>

{/* Or with custom styling */}
<button className="glass-effect ice-glow px-6 py-3 rounded-xl">
  Hover for Ice Glow
</button>
```

### Gradient Text

```tsx
<h1 className="text-4xl font-bold winter-gradient-text">
  Winter Title
</h1>

{/* Or manually */}
<h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#AFDBF5] via-[#A4DDED] to-[#FFD700]">
  Gradient Text
</h1>
```

### Frosted Borders

```tsx
<div className="frosted-border p-6 rounded-xl">
  Content with frosted shimmer border
</div>
```

## Available CSS Classes

### Glass Morphism
- `.glass-effect` - Base frosted glass appearance
- `.glass-hover` - Enhanced glass effect on hover

### Shadows
- `.winter-shadow` - Subtle shadow for depth
- `.winter-shadow-hover` - Enhanced shadow on hover

### Glows
- `.ice-glow` - Ice blue glow on hover
- `.gold-glow` - Gold glow on hover
- `.text-glow` - Ice blue text shadow
- `.text-glow-gold` - Gold text shadow

### Gradients
- `.winter-gradient-text` - Ice blue to gold gradient text

### Borders
- `.frosted-border` - Gradient shimmer border effect

### Buttons
- `.winter-button` - Full styled winter button

## Integrating with Existing Components

### Example: Update a Card Component

**Before (Default Theme):**
```tsx
<div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6">
  <h3 className="text-teal-400">Title</h3>
  <p className="text-white">Content</p>
</div>
```

**After (Winter-Compatible):**
```tsx
import { useTheme } from '../themes/theme';

const MyCard = () => {
  const { themeConfig } = useTheme();
  const isWinter = themeConfig.name === 'christmas';

  return (
    <div className={`
      rounded-lg p-6
      ${isWinter 
        ? 'glass-effect glass-hover winter-shadow' 
        : 'bg-[var(--color-card)] border border-[var(--color-border)]'
      }
    `}>
      <h3 className={isWinter ? 'winter-gradient-text' : 'text-teal-400'}>
        Title
      </h3>
      <p className="text-white">Content</p>
    </div>
  );
};
```

### Example: Update Header Colors

```tsx
import { useTheme } from '../themes/theme';

const Header = () => {
  const { themeConfig } = useTheme();
  const isWinter = themeConfig.name === 'christmas';

  return (
    <header className={`
      sticky top-0 z-50 py-4
      ${isWinter 
        ? 'glass-effect' 
        : 'bg-gradient-to-r from-teal-900/90 to-amber-800/90'
      }
    `}>
      {/* Header content */}
    </header>
  );
};
```

## Manual Theme Testing

To test the Christmas theme outside December 20 - January 20:

```tsx
// In App.tsx
import { ThemeProvider } from './themes/theme';

function App() {
  return (
    <ThemeProvider forcedTheme="christmas">
      {/* Your app */}
    </ThemeProvider>
  );
}
```

Remove `forcedTheme` prop to restore automatic date-based switching.

## Animations

All animations respect `prefers-reduced-motion` for accessibility:

```css
/* Included animations */
@keyframes snowfall { /* Snowflakes falling */ }
@keyframes float { /* Gentle up/down motion */ }
@keyframes sparkle { /* Subtle pulsing */ }
@keyframes glow { /* Text shadow pulsing */ }
```

Use in components:
```tsx
<div className="animate-float">
  <Star className="text-gold" />
</div>

<h1 className="animate-glow">
  Glowing Title
</h1>
```

## Performance

### Optimizations Included
- Only 50 snowflakes (lightweight)
- Pure CSS animations (GPU accelerated)
- Lazy-loaded via React.lazy()
- Disabled on low-end devices
- Respects prefers-reduced-motion
- Frosted orbs use CSS blur (no images)

### Best Practices
1. Use glass effects sparingly (expensive blur operations)
2. Limit nested glass effects
3. Test on mobile devices
4. Monitor FPS with Chrome DevTools

## Browser Support

- ✅ Chrome 88+ (full support)
- ✅ Firefox 94+ (full support)
- ✅ Safari 15.4+ (full support with -webkit- prefixes)
- ✅ Edge 88+ (full support)
- ⚠️ Older browsers: Graceful degradation (no blur, simpler shadows)

## Accessibility

✅ Respects `prefers-reduced-motion`
✅ Sufficient color contrast (WCAG AA compliant)
✅ No reliance on color alone for information
✅ Keyboard navigation unaffected
✅ Screen reader compatible

## Troubleshooting

### Snowfall not showing
- Check if date is within Dec 20 - Jan 20
- Verify `prefers-reduced-motion` is not enabled
- Check browser console for errors
- Try forcing theme with `forcedTheme="christmas"`

### Glass effects not working
- Ensure `.glass-effect` class is applied
- Check if `backdrop-filter` is supported in your browser
- Verify CSS is loaded (check Network tab)

### Colors don't match
- Confirm theme is active: `console.log(themeConfig.name)`
- Check CSS variables in DevTools
- Verify gradient background is applied to body

### Performance issues
- Reduce snowflake count in `Snowfall.tsx`
- Limit glass effects to key components only
- Disable animations on mobile if needed

## Future Enhancements

Ideas for extending the Christmas theme:

- [ ] Animated falling presents
- [ ] Aurora borealis background
- [ ] Twinkling stars
- [ ] Ice crystal borders
- [ ] Frosted window effect
- [ ] Gentle snow accumulation
- [ ] Holiday sound effects (opt-in)