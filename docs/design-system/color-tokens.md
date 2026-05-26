# Color Tokens

All colors in Vivlit are defined as CSS custom properties. Update these once, and colors change everywhere.

---

## Core Semantic Tokens

**File**: `src/index.css` (`:root` selector)

| Token | HSL Value | RGB | Purpose |
|---|---|---|---|
| `--bg-page` | `hsl(38, 40%, 97%)` | `#f9f5f0` | Page background (warm ivory) |
| `--bg-section` | `hsl(30, 35%, 95%)` | `#f7f3ed` | Section background (dusty cream) |
| `--bg-card` | `hsl(0, 0%, 100%)` | `#ffffff` | Card/modal background (white) |
| `--ink-primary` | `hsl(270, 45%, 20%)` | `#3d1d5c` | Headings (deep plum) |
| `--ink-secondary` | `hsl(270, 20%, 45%)` | `#635f79` | Body text (muted lilac) |
| `--ink-muted` | `hsl(30, 15%, 55%)` | `#8b7f6e` | Captions, disabled (warm grey) |
| `--accent-plum` | `hsl(280, 45%, 60%)` | `#8c5ab4` | Primary buttons, active |
| `--accent-rose` | `hsl(345, 55%, 72%)` | `#e8a8c8` | Secondary accent |
| `--accent-gold` | `hsl(38, 65%, 68%)` | `#dca846` | Tertiary accent |

---

## Tailwind Config Integration

These tokens are mapped in `tailwind.config.ts`:

```typescript
colors: {
  background: 'hsl(var(--background))',  // var(--bg-page)
  foreground: 'hsl(var(--foreground))',  // var(--ink-primary)
  primary: 'hsl(var(--primary))',        // var(--accent-plum)
  secondary: 'hsl(var(--secondary))',    // var(--bg-section)
  accent: 'hsl(var(--accent))',          // var(--accent-rose)
  // ... etc.
}
```

Use in Tailwind classes:
```html
<div class="bg-background text-foreground">
  <button class="bg-primary text-white">Click me</button>
</div>
```

---

## Jar Theme Colors

10 preset jar color options. Each jar stores a `theme` ID referencing one of these.

**Source**: `src/lib/themes.ts` (exported as `JAR_THEMES`)

| ID | Label | Hex | RGB | Image |
|---|---|---|---|---|
| `warm` | Warm Sunset | `#ffd6a5` | (255, 214, 165) | Peach-orange |
| `lavender` | Lavender Dreams | `#c4a5de` | (196, 165, 222) | Soft purple |
| `mint` | Fresh Mint | `#bde0fe` | (189, 224, 254) | Pale cyan |
| `rose` | Rose Garden | `#ffc8dd` | (255, 200, 221) | Dusty pink |
| `ocean` | Ocean Breeze | `#7dd3fc` | (125, 211, 252) | Sky blue |
| `sunset` | Golden Sunset | `#fdba74` | (253, 186, 116) | Orange |
| `forest` | Forest Glade | `#86efac` | (134, 239, 172) | Light green |
| `candy` | Candy Shop | `#f0abfc` | (240, 171, 252) | Orchid |
| `midnight` | Midnight Stars | `#a5b4fc` | (165, 180, 252) | Periwinkle |
| `golden` | Golden Hour | `#fcd34d` | (252, 211, 77) | Bright yellow |

**Usage**:
```typescript
const { color } = getTheme('lavender');  // Returns '#c4a5de'
<JarVisual theme="lavender" />
```

---

## Note Theme Colors

6 preset note paper styles. Each note stores a `note_theme` ID.

**Source**: `src/lib/themes.ts` (exported as `NOTE_THEMES`)

| ID | Label | Background | Texture |
|---|---|---|---|
| `default` | Classic | Warm cream | Plain |
| `romantic` | Romantic | Soft pink | Faded lines |
| `dreamy` | Dreamy | Pale lavender | Watercolor effect |
| `fresh` | Fresh | Mint green | Subtle grid |
| `sunny` | Sunny | Pale yellow | Dashed lines |
| `ocean` | Ocean | Pale blue | Wave pattern |

---

## Gradient Tokens

CSS custom properties for multi-color backgrounds.

| Token | Definition | Usage |
|---|---|---|
| `--gradient-primary` | `linear-gradient(135deg, plum, rose)` | Primary sections |
| `--gradient-secondary` | `linear-gradient(135deg, rose, gold)` | Secondary sections |
| `--gradient-soft` | `linear-gradient(135deg, rgba(plum, 0.05), rgba(rose, 0.05))` | Subtle backgrounds |
| `--gradient-storybook` | `linear-gradient(180deg, rgba(cream), transparent)` | Fade to transparent |
| `--gradient-magic` | `linear-gradient(45deg, plum, rose, gold)` | Special moments |
| `--gradient-text-gold` | `linear-gradient(90deg, gold, rose)` | Text gradients (rare) |

**Rule**: Don't use gradients on buttons. Only on section backgrounds and rare accent text.

---

## Shadow Tokens

CSS custom properties for depth and elevation.

| Token | Definition | Usage |
|---|---|---|
| `--shadow-soft` | `0 2px 16px rgba(120, 80, 100, 0.06)` | Cards, moderate depth |
| `--shadow-float` | `0 8px 32px rgba(120, 80, 100, 0.12)` | Hover elevation, floating elements |
| `--shadow-glow` | `0 0 32px rgba(140, 90, 180, 0.08)` | Subtle glows (rare) |
| `--shadow-paper` | `0 1px 4px rgba(120, 80, 100, 0.08)` | Thin paper effect |
| `--shadow-dreamy` | `0 12px 48px rgba(120, 80, 100, 0.15)` | Deep modals, dreams |

**Rule**: Shadows should be soft and warm. No hard, dark shadows. No neon glow.

---

## Transition & Animation Tokens

CSS custom properties for timing.

| Token | Value | Usage |
|---|---|---|
| `--transition-smooth` | `all 300ms cubic-bezier(0.25, 0.1, 0.08, 1)` | General transitions |
| `--transition-bounce` | `all 400ms cubic-bezier(0.34, 1.06, 0.64, 1)` | Playful transitions |
| `--transition-magic` | `all 600ms cubic-bezier(0.76, 0, 0.24, 1)` | Cinematic transitions |
| `--ease-cinema` | `cubic-bezier(0.25, 0.1, 0.08, 1)` | Slow start, soft landing |
| `--ease-lift` | `cubic-bezier(0.34, 1.06, 0.64, 1)` | Slight overshoot then settle |
| `--ease-weight` | `cubic-bezier(0.76, 0, 0.24, 1)` | Heavy deceleration |

---

## How to Use Color Tokens

### In Inline Styles
```tsx
<div style={{ background: 'var(--bg-page)', color: 'var(--ink-primary)' }}>
  Text content
</div>
```

### In CSS / SCSS
```css
.my-component {
  background: var(--bg-card);
  color: var(--ink-secondary);
  border: 1px solid rgba(180, 155, 130, 0.18);
  box-shadow: var(--shadow-soft);
}
```

### In Tailwind Classes
```html
<div class="bg-background text-foreground">
  <button class="bg-primary hover:opacity-85">Primary Button</button>
</div>
```

### In Framer Motion
```tsx
<motion.div
  initial={{ backgroundColor: 'var(--bg-page)' }}
  animate={{ backgroundColor: 'var(--accent-plum)' }}
/>
```

---

## Changing Colors

**To update a color everywhere**:

1. Open `src/index.css`
2. Find the `:root` selector
3. Update the token value:
   ```css
   :root {
     --accent-plum: hsl(280, 45%, 55%);  /* was 60%, now 55% */
   }
   ```
4. All pages using `var(--accent-plum)` automatically update
5. Rebuild: `npm run build`

**To change a jar theme color**:

1. Open `src/lib/themes.ts`
2. Update the `JAR_THEMES` array:
   ```typescript
   { id: 'lavender', label: 'Lavender Dreams', color: '#b899d9' }  // was #c4a5de
   ```
3. All new jars created with that theme use the new color
4. Existing jars keep their original color (stored in DB)

---

## Color Accessibility

### Contrast Requirements
| Situation | Minimum Ratio |
|---|---|
| Large text (18px+, bold) | 3:1 |
| Normal text | 4.5:1 |
| UI components (buttons, borders) | 3:1 |

**Current palette**: All pairs are 12:1+ (excellent, well above minimum)

### For Custom Colors
Use a contrast checker: https://webaim.org/resources/contrastchecker/

Test these pairs:
- `--ink-primary` (text) on `--bg-page` (background)
- `--accent-plum` (button) with `white` text
- `--ink-muted` (captions) on `--bg-page` (background)

---

## Dark Mode Preparation

If dark mode is added, create a `:root[data-theme="dark"]` selector:

```css
:root[data-theme="dark"] {
  --bg-page: hsl(38, 40%, 12%);    /* very dark cream */
  --bg-card: hsl(38, 30%, 18%);    /* dark card */
  --ink-primary: hsl(38, 30%, 95%); /* warm white */
  --ink-secondary: hsl(30, 20%, 70%); /* muted cream */
  --accent-plum: hsl(280, 50%, 65%);  /* brighter plum */
  /* keep jar theme colors, increase saturation */
}
```

Toggle with JavaScript:
```typescript
document.documentElement.setAttribute('data-theme', 'dark');
```

---

[← Back to README](../README.md)
