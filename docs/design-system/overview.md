# Design System Overview

The Vivlit design language is **warm, physical, and timeless**. Every pixel should feel intentional—like touching a real object, not clicking a UI component.

---

## Design Philosophy

### Emotional Core
Vivlit preserves moments that matter. The design should evoke:
- **Anticipation** (before opening)
- **Surprise** (at the reveal)
- **Warmth** (emotional connection)
- **Memory** (lasting keepsake)

We are NOT a cute startup. We are a keeper of memories.

### Visual Principles
| Principle | Means | Don't |
|---|---|---|
| **Warm, not bright** | Cream, plum, rose | Neon, pastels |
| **Physical, not digital** | Paper texture, weight | Gradients, glow halos |
| **Timeless, not trendy** | Serif + sans serif | Futura, sans-serif only |
| **Spacious, not dense** | Generous whitespace | Packed layouts |
| **Intentional, not decorative** | Every element earns space | Gratuitous sparkles |

### The Three-Font System
| Font | Google Family | Usage |
|---|---|---|
| **Playfair Display** | `Playfair Display` (400, 600, 700) | Headings (H1, H2, H3) |
| **Poppins** | `Poppins` (300–700) | Body text, labels, nav, UI |
| **Dancing Script** | `Dancing Script` (400, 700) | ONE emotional word per section (never sentences) |

**Rule**: Each section highlights exactly ONE word in Dancing Script—the emotional noun. This is the brand accent.

Example:
```
"Create a jar of **notes**"  ← 'notes' in Dancing Script
"Share moments that **matter**"  ← 'matter' in Dancing Script
```

---

## Color Palette

### Background Colors
| Token | Value | Usage |
|---|---|---|
| `--bg-page` | `hsl(38, 40%, 97%)` | Main page background (warm ivory) |
| `--bg-section` | `hsl(30, 35%, 95%)` | Section backgrounds (dusty cream) |
| `--bg-card` | `hsl(0, 0%, 100%)` | Card/modal backgrounds (pure white) |

### Text Colors
| Token | Value | Usage |
|---|---|---|
| `--ink-primary` | `hsl(270, 45%, 20%)` | Headings (deep plum) |
| `--ink-secondary` | `hsl(270, 20%, 45%)` | Body text (muted lilac) |
| `--ink-muted` | `hsl(30, 15%, 55%)` | Captions, disabled (warm grey) |

### Accent Colors
| Token | Value | Usage |
|---|---|---|
| `--accent-plum` | `hsl(280, 45%, 60%)` | Primary buttons, active states |
| `--accent-rose` | `hsl(345, 55%, 72%)` | Secondary accent (soft pink) |
| `--accent-gold` | `hsl(38, 65%, 68%)` | Tertiary accent (warm gold) |

### Jar Theme Colors (10 presets)
1. **Warm** — `#ffd6a5` (warm peach)
2. **Lavender** — `#c4a5de` (soft purple)
3. **Mint** — `#bde0fe` (pale cyan)
4. **Rose** — `#ffc8dd` (dusty pink)
5. **Ocean** — `#7dd3fc` (sky blue)
6. **Sunset** — `#fdba74` (orange)
7. **Forest** — `#86efac` (light green)
8. **Candy** — `#f0abfc` (orchid)
9. **Midnight** — `#a5b4fc` (periwinkle)
10. **Golden** — `#fcd34d` (bright yellow)

[See `docs/design-system/color-tokens.md` for full token reference]

---

## Typography Hierarchy

### Headings
- **H1**: Playfair 700, 52px–80px (clamp for responsive)
- **H2**: Playfair 700, 36px–56px
- **H3**: Playfair 600, 24px–32px
- **H4**: Playfair 600, 18px–24px

### Body
- **Paragraph**: Poppins 400, 16px–18px, line-height 1.6–1.8
- **Small text**: Poppins 400, 14px
- **Label / Button**: Poppins 500–600, 12px–14px

### Script Accent
- **Dancing Script**: 700, 48px–96px (use sparingly)
- Always ONE word per section, never sentences

---

## Spacing & Layout

### Whitespace
- Vertical rhythm: 16px base unit
- Section padding: 80px–120px vertical, 20px–40px horizontal
- Card padding: 24px–32px
- Element gap: 8px, 12px, 16px, 24px (multiples of 4)

**Rule**: Generous whitespace is design. Silence on the page is intentional.

### Max-width Containers
- Full bleed: no max-width (edge to edge)
- Content: 1024px (most pages)
- Narrow: 600px (forms, text)

### Grid & Flex
- Desktop: CSS Grid where structure is fixed; Flexbox for flow
- Tablet: 2-column → 1-column collapsing
- Mobile: Always 1-column, full-width

---

## Component Styling

### Cards
```css
/* All cards follow this pattern */
background: white;
border: 1px solid rgba(180, 155, 130, 0.18); /* warm tan border */
border-radius: 16px;
padding: 24px;
box-shadow: 0 2px 16px rgba(120, 80, 100, 0.06); /* soft shadow */
```

No gradients. No glow. Solid, warm, physical.

### Buttons
```css
/* Primary button */
background: var(--accent-plum);
color: white;
border: none;
border-radius: 8px;
padding: 12px 24px;
font-family: Poppins, sans-serif;
font-weight: 500;

/* Hover: reduce opacity, don't brighten */
opacity: 0.85;

/* No gradient. No shadow. Solid color. */
```

### Inputs
```css
border: 1px solid rgba(180, 155, 130, 0.2);
background: white;
border-radius: 8px;
padding: 10px 12px;
font-family: Poppins, sans-serif;
font-size: 14px;

/* Focus: outline, not glow */
outline: 2px solid var(--accent-plum);
```

---

## Motion Language

Animations should feel **physical and weighted**, not bouncy or snappy.

### Spring Configs (Framer Motion)
| Config | Stiffness | Damping | Use |
|---|---|---|---|
| **Heavy** | 55 | 22 | Jar transforms, settling objects |
| **Float** | 28 | 18 | Notes rising, gentle drifts |
| **Lid** | 38 | 28 | Lid opening (weighted) |
| **Reveal** | 70 | 20 | Text appearing (quick, soft) |

### Easing Curves
- **Cinema**: `cubic-bezier(0.25, 0.1, 0.08, 1.0)` — slow start, soft landing
- **Lift**: `cubic-bezier(0.34, 1.06, 0.64, 1.0)` — slight overshoot then settle
- **Weight**: `cubic-bezier(0.76, 0, 0.24, 1.0)` — heavy deceleration

### What NOT to animate
- ❌ Sparkles, glow pulses, neon halos
- ❌ Background orb movement (causes nausea on scroll)
- ❌ Text blur + scale combos (overused, cheap)
- ❌ Rubber-band overshoot (> 2%)
- ❌ Simultaneous busy animations (max 2 things at once)

### What TO animate
- ✓ Physical objects (jars, notes, lids)
- ✓ Content reveals (fade, slide)
- ✓ State transitions (open/close, active/inactive)
- ✓ Scroll-driven narrative (hero sequence)

[See `docs/design-system/motion.md` for detailed spring configs and examples]

---

## Accessibility

### Contrast Ratios
- **Body text on background**: Minimum 4.5:1
- **Headings on background**: Minimum 3:1
- **Current**: All text is 12:1+ (well above minimum)

### Keyboard Navigation
- All interactive elements are keyboard-accessible
- Focus state: clear outline (minimum 3px)
- Tab order follows visual flow
- No keyboard traps

### Screen Readers
- Images have alt text (describing what they show)
- Animations have `aria-hidden="true"`
- Semantic HTML: `<button>`, `<a>`, `<form>`, `<label>`
- Skip link to main content (if needed)

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```
All animations collapse to instant opacity changes or static states.

---

## Dark Mode

**Status**: Not implemented. Vivlit is light-mode only for now.

If dark mode is added, use:
- `--bg-page`: `hsl(38, 40%, 12%)` (very dark cream)
- `--ink-primary`: `hsl(38, 30%, 95%)` (warm white)
- Keep color saturation stable (don't over-brighten)

---

## Responsive Design

### Breakpoints
| Breakpoint | Width | Device |
|---|---|---|
| Mobile | < 768px | Phone |
| Tablet | 768px–1023px | iPad |
| Desktop | ≥ 1024px | Laptop |

### Mobile-First Approach
- Start with mobile styles (single column, no nav sidebars)
- Use `@media (min-width: 768px)` to add tablet/desktop enhancements
- Never hide content on mobile (only reorganize layout)

### Font Scaling
Use `clamp()` for responsive typography:
```css
h1 { font-size: clamp(32px, 5vw, 80px); }
```
- Min: 32px (ensures readability on mobile)
- Ideal: 5vw (scales with viewport)
- Max: 80px (doesn't get ridiculous on ultra-wide)

---

## Testing the Design

Before shipping:

- [ ] All text is readable: zoom to 200%, still readable?
- [ ] All buttons are clickable: 44px minimum height/width on mobile
- [ ] All images have alt text
- [ ] All interactive elements are keyboard-accessible (no mouse-only)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Colors have 4.5:1 contrast ratio
- [ ] No text is right-aligned (harder to read)

---

## Reference Files

- [Color Tokens](./color-tokens.md) — Full CSS custom properties list
- [Typography](./typography.md) — Font classes, sizing, usage
- [Motion](./motion.md) — Animation configs, spring settings, easing curves
- [Components](./components.md) — UI component API and patterns

---

[← Back to README](../README.md)
