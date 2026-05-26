# Motion & Animation Language

Vivlit animations feel **physical and weighted**, not bouncy or snappy. Every motion should evoke touching a real object in a warm, slightly resistive atmosphere.

---

## Animation Philosophy

### Principles
| Principle | Means |
|---|---|
| **Physical** | Objects settle with weight, not bounce |
| **Intentional** | Every animation earns its existence |
| **Subtle** | Animations enhance, not distract |
| **Accessible** | All animations respect `prefers-reduced-motion` |

### What TO Animate
- ✓ Physical objects (jar, note, lid, envelope)
- ✓ Content reveals (fade, slide, scale)
- ✓ State changes (active/inactive, open/closed)
- ✓ Scroll-driven narratives (hero sequence)

### What NOT to Animate
- ❌ Sparkles, glow pulses, neon halos
- ❌ Background orb movement (causes nausea)
- ❌ Text blur + scale combos
- ❌ Rubber-band overshoot (> 2% allowed)
- ❌ Simultaneous busy animations (max 2 at once)

---

## Framer Motion: Spring Configs

Use these spring configs to create weighted, natural motion:

| Config | `stiffness` | `damping` | `mass` | Use Case |
|---|---|---|---|---|
| **Heavy** | 55 | 22 | 1.8 | Jar transforms, settling objects |
| **Float** | 28 | 18 | 2.2 | Notes rising, gentle drifts |
| **Lid** | 38 | 28 | 2.5 | Lid opening (very heavy) |
| **Reveal** | 70 | 20 | 1.0 | Text appearing (quick, soft) |

### Usage in Code

```typescript
import { motion, useTransform, useScroll, useSpring } from 'framer-motion';

// For jar rotation: heavy and settling
const { scrollYProgress } = useScroll({ target: ref });
const jarRotateY = useSpring(
  useTransform(scrollYProgress, [0.12, 0.55], [-22, 0]),
  { type: 'spring', stiffness: 55, damping: 22, mass: 1.8 }
);

// For note rising: gentle float
const noteY = useSpring(
  useTransform(scrollYProgress, [0.88, 1.0], [80, -20]),
  { type: 'spring', stiffness: 28, damping: 18, mass: 2.2 }
);

// For text reveal: quick and soft
<motion.div
  initial={{ opacity: 0, y: 32 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 70, damping: 20, mass: 1.0 }}
/>
```

---

## CSS Easing Curves

For non-Framer Motion animations (CSS transitions, @keyframes):

| Curve | `cubic-bezier()` | Feel | Usage |
|---|---|---|---|
| **Cinema** | `(0.25, 0.1, 0.08, 1.0)` | Slow start, soft landing | Page transitions |
| **Lift** | `(0.34, 1.06, 0.64, 1.0)` | Slight overshoot, settle | Interactive elements |
| **Weight** | `(0.76, 0, 0.24, 1.0)` | Heavy deceleration | Gravity, dropping |

### Usage in CSS

```css
.hero-jar {
  transition: transform 400ms cubic-bezier(0.76, 0, 0.24, 1.0);
  /* Heavy, weighted motion */
}

.button {
  transition: opacity 200ms cubic-bezier(0.25, 0.1, 0.08, 1.0);
  /* Smooth, cinema-like fade */
}
```

### Pre-defined in `src/index.css`

```css
:root {
  --ease-cinema: cubic-bezier(0.25, 0.1, 0.08, 1.0);
  --ease-lift: cubic-bezier(0.34, 1.06, 0.64, 1.0);
  --ease-weight: cubic-bezier(0.76, 0, 0.24, 1.0);
}

.my-element {
  transition: all 300ms var(--ease-cinema);
}
```

---

## Common Animation Patterns

### Fade In (Text, Images)

```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4 }}
/>
```

No spring needed; linear fade is appropriate for text.

### Slide Up (Sections)

```typescript
<motion.section
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ 
    type: 'spring',
    stiffness: 70,
    damping: 20,
    delay: 0.1
  }}
/>
```

Use `whileInView` to trigger on scroll (once only with `once: true`).

### Scroll-Driven (Hero Sequence)

```typescript
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ['start start', 'end end']
});

const jarRotateY = useSpring(
  useTransform(scrollYProgress, [0.12, 0.55], [-22, 0]),
  { type: 'spring', stiffness: 55, damping: 22 }
);

<motion.div style={{ rotateY: jarRotateY }} />
```

Map scroll progress (0–1) to animation values using `useTransform`, then apply spring damping.

### Stagger (Multiple Elements)

```typescript
<motion.div>
  {items.map((item, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}  // Stagger 100ms apart
    >
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

Delay each child by `index * 0.1` seconds (120ms minimum between reveals).

---

## Hover & Active States

### Button Hover

```typescript
<motion.button
  whileHover={{ opacity: 0.85 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  Click me
</motion.button>
```

Reduce opacity on hover (never brighten). Slight scale down on click.

### Link Hover

```typescript
<motion.a
  whileHover={{ color: 'var(--accent-plum)' }}
  transition={{ duration: 0.2 }}
>
  Learn more
</motion.a>
```

Change color smoothly on hover.

---

## Reducing Motion

**All animations must respect `prefers-reduced-motion` media query.**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

**In Framer Motion**:
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
/>
```

Or use `useReducedMotion()` hook (if using Framer Motion >= 11):
```typescript
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={{ opacity: 1 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
/>
```

---

## Performance Tips

### GPU Acceleration
Only animate these properties (they don't trigger layout recalculation):
- ✓ `transform` (translate, rotate, scale)
- ✓ `opacity`
- ❌ `width`, `height`, `top`, `left` (trigger layout)
- ❌ `background-color`, `border` (trigger paint on some browsers)

```typescript
// ✓ Good: animated via GPU
<motion.div
  style={{ x: 100 }}  // Applies 'transform: translateX(100px)'
/>

// ❌ Bad: triggers layout
<motion.div
  animate={{ left: 100 }}  // Applies 'left: 100px'
/>
```

### Reduce Simultaneous Animations
Max 2–3 animations at once. More = jank on older devices.

```typescript
// ✓ Good: jar rotates AND scales (2 transforms)
<motion.div
  style={{ rotateY: jarRotateY, scale: jarScale }}
/>

// ❌ Avoid: too many simultaneous animations
<motion.div
  animate={{
    x: xValue,
    y: yValue,
    scale: scaleValue,
    rotate: rotateValue,
    opacity: opacityValue,
    borderRadius: radiusValue  // 6 animations = jank
  }}
/>
```

### Use `useSpring` for Smooth Scroll
Decouples animation from scroll events:
```typescript
const jarRotateYRaw = useTransform(scrollYProgress, [0.12, 0.55], [-22, 0]);
const jarRotateY = useSpring(jarRotateYRaw, { damping: 22 });
// scroll events update jarRotateYRaw; useSpring smooths the result
```

---

## CSS @keyframes (Infinite Loops)

For repeating animations (floating, pulsing):

```css
@keyframes animate-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.floating-element {
  animation: animate-float 4s ease-in-out infinite;
}
```

Define in `src/index.css`. Use custom class in HTML.

---

## Transition Tokens

Pre-defined in `src/index.css`:

```css
:root {
  --transition-smooth: all 300ms cubic-bezier(0.25, 0.1, 0.08, 1);
  --transition-bounce: all 400ms cubic-bezier(0.34, 1.06, 0.64, 1);
  --transition-magic: all 600ms cubic-bezier(0.76, 0, 0.24, 1);
}

.my-button {
  transition: var(--transition-smooth);
}
```

---

## Testing Motion

Before shipping:

- [ ] Animations feel weighted, not bouncy
- [ ] No rubber-band overshoot
- [ ] Max 2 things animate simultaneously
- [ ] Page is 60fps on a real device (not just DevTools emulation)
- [ ] `prefers-reduced-motion` is respected
- [ ] Animations don't block user interactions
- [ ] Delays between reveals are ≥ 100ms (gives breathing room)

Check performance: DevTools → Performance → record → scroll → check FPS graph

---

[← Back to README](../README.md)
