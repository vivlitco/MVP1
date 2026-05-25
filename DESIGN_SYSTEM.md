# Vivlit Design System

## Philosophy

Vivlit is a **cinematic emotional keepsake**, not a SaaS product. The design language prioritises warmth, intimacy, and physical weight — as if the product were a beautifully crafted object you hold in your hands, not software you use on a screen.

Every page should feel like turning the page of a beautifully printed book — unhurried, warm, and honest.

---

## Brand Voice

- Quiet confidence, not startup enthusiasm
- Intimate, not broad
- Earned emotion, not manufactured sparkle
- One idea per breath — never dump information

---

## Logo / Brand Name

**Rule:** Wherever "Vivlit" appears as a brand reference (headings, logos, taglines, auth pages), it must always be rendered in Dancing Script, not plain text.

```tsx
<span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, color: 'var(--ink-primary)' }}>
  Vivlit
</span>
```

For accent / highlight uses:
```tsx
<span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, color: 'var(--accent-plum)' }}>
  Vivlit
</span>
```

---

## Typography

| Role | Font | Weight | Size | Usage |
|---|---|---|---|---|
| Brand / Logo | Dancing Script | 700 | 28–42px | Navbar, Auth, any brand wordmark |
| Cinematic headline | Playfair Display, serif | 700 | clamp(32px,5vw,56px) | Page H1s |
| Script accent (ONE word) | Dancing Script | 700 | 10–20% larger than surrounding | Emotional accent word per section |
| Section heading | Playfair Display, serif | 600 | 28–36px | H2s |
| Body / sub-heading | Poppins, sans-serif | 400 | 15–18px | Paragraphs, descriptions |
| Labels / eyebrows | Poppins, sans-serif | 600 | 11px, letterSpacing:0.14em, uppercase | Section labels |
| Button text | Poppins, sans-serif | 500 | 13–14px | CTAs |
| Card meta / small | Poppins, sans-serif | 400 | 12–13px | Dates, tags, captions |

**Rule:** Dancing Script is used for exactly ONE accent word per section — the emotional noun. Never for full sentences.

---

## Color Tokens

All tokens are CSS custom properties defined in `src/index.css`.

```css
/* Backgrounds */
--bg-page:    hsl(38, 40%, 97%);   /* warm ivory — main page bg */
--bg-section: hsl(30, 35%, 95%);   /* dusty cream — alternate sections */

/* Type */
--ink-primary:   hsl(270, 45%, 20%); /* deep plum */
--ink-secondary: hsl(270, 20%, 45%); /* muted lilac */
--ink-muted:     hsl(30, 15%, 55%);  /* warm grey */

/* Accents */
--accent-rose:  hsl(345, 55%, 72%);  /* dusty rose */
--accent-plum:  hsl(280, 45%, 60%);  /* muted plum — primary CTA */
--accent-gold:  hsl(38, 65%, 68%);   /* warm gold */

/* Functional */
--jar-glass:  rgba(255, 252, 248, 0.72);
--jar-shadow: hsla(270, 30%, 30%, 0.18);
```

---

## Borders & Shadows

```css
/* Standard border — warm tan */
border: 1px solid rgba(180, 155, 130, 0.16)

/* Subtle section divider */
border-top: 1px solid rgba(180, 155, 130, 0.14)

/* Card shadow */
box-shadow: 0 2px 20px rgba(120, 80, 100, 0.07)

/* Elevated card shadow */
box-shadow: 0 4px 32px rgba(120, 80, 100, 0.10)
```

---

## Motion

### Easing
```css
--ease-cinema: cubic-bezier(0.25, 0.1, 0.08, 1.0);  /* slow start, soft landing */
--ease-lift:   cubic-bezier(0.34, 1.06, 0.64, 1.0);  /* slight overshoot */
--ease-weight: cubic-bezier(0.76, 0, 0.24, 1.0);      /* heavy deceleration */
```

### Spring Presets (Framer Motion)
```ts
SPRING_REVEAL = { stiffness: 70, damping: 20, mass: 1.0 }  // text/card reveals
SPRING_HEAVY  = { stiffness: 50, damping: 24, mass: 1.6 }  // jar rotation
SPRING_FLOAT  = { stiffness: 32, damping: 22, mass: 2.0 }  // note rising
SPRING_LID    = { stiffness: 28, damping: 30, mass: 3.2 }  // lid open
```

### Section reveal pattern
```tsx
<motion.div
  initial={{ opacity: 0, y: 28 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ type: 'spring', stiffness: 70, damping: 20, delay: 0.1 }}
/>
```

### What NOT to animate
- Floating orbs or blobs in the background (causes nausea on scroll)
- Sparkles or glow pulses
- Multiple things moving simultaneously
- Background colour shifts during scroll

---

## Layout

```
Max content width:  1100px (landing) / 1024px (info pages) / 680px (auth/profile)
Section padding:    120px top/bottom (desktop) / 80px (mobile)
Page top padding:   96px (to clear fixed navbar)
Horizontal gutter:  24px (mobile) / 40px (desktop)
```

---

## Buttons

### Primary CTA
```tsx
<button
  style={{
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: 'white',
    background: 'var(--accent-plum)',
    border: 'none',
    borderRadius: 8,
    padding: '11px 26px',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  }}
  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
>
  Create a jar
</button>
```

### Ghost / secondary
```tsx
<button
  style={{
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: 'var(--ink-secondary)',
    background: 'transparent',
    border: '1px solid rgba(180,155,130,0.3)',
    borderRadius: 8,
    padding: '10px 22px',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  }}
/>
```

---

## Card Pattern

```tsx
<div
  style={{
    background: 'white',
    border: '1px solid rgba(180,155,130,0.16)',
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 2px 20px rgba(120,80,100,0.07)',
  }}
/>
```

---

## Page Shell Pattern

```tsx
<div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
  <Navbar />
  <main style={{ maxWidth: 1024, margin: '0 auto', padding: '96px 24px 80px' }}>
    {/* content */}
  </main>
  <Footer />
</div>
```

---

## Section Heading Pattern

```tsx
{/* Eyebrow label */}
<p style={{
  fontFamily: 'Poppins, sans-serif',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ink-muted)',
  marginBottom: 14,
}}>
  The story
</p>

{/* H1 — page title */}
<h1 style={{
  fontFamily: "'Playfair Display', serif",
  fontSize: 'clamp(32px, 5vw, 56px)',
  fontWeight: 700,
  color: 'var(--ink-primary)',
  lineHeight: 1.2,
  margin: '0 0 20px',
}}>
  About{' '}
  <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>
    Vivlit
  </span>
</h1>

{/* Sub-heading / body */}
<p style={{
  fontFamily: 'Poppins, sans-serif',
  fontSize: 17,
  color: 'var(--ink-secondary)',
  lineHeight: 1.75,
  maxWidth: 560,
  margin: 0,
}}>
  Descriptor text here.
</p>
```

---

## Rules to Never Break

1. **"Vivlit" is always Dancing Script** wherever it refers to the brand — not plain text, not another font.
2. **No background orbs / floating blobs** that animate continuously.
3. **No neon / bright purple gradients** on backgrounds or cards (use `var(--accent-plum)` solid for buttons only).
4. **No purple/rose gradient buttons** — use solid `var(--accent-plum)` with opacity hover.
5. **Max one Dancing Script accent word per section** — not full sentences.
6. **Page backgrounds are always** `var(--bg-page)` (warm ivory), never white or gray.
7. **Borders are always warm tan** — `rgba(180,155,130,0.16)`, never cold gray borders.
8. **Jars and envelopes are untouched** — their visual logic is self-contained.
