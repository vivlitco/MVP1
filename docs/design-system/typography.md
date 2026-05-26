# Typography

Vivlit uses three Google Fonts to create warmth and hierarchy: Playfair Display (headings), Poppins (body), Dancing Script (one accent word per section).

---

## Font Families

### Playfair Display
- **Family**: Serif (traditional, elegant)
- **Weights**: 400, 600, 700
- **Usage**: All headings (H1–H4)
- **Google**: `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700">`

### Poppins
- **Family**: Sans-serif (modern, readable)
- **Weights**: 300, 400, 500, 600, 700
- **Usage**: Body text, labels, buttons, nav
- **Google**: `<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700">`

### Dancing Script
- **Family**: Script (handwritten, emotional)
- **Weights**: 400, 700
- **Usage**: EXACTLY ONE WORD per section (the emotional noun), never sentences
- **Google**: `<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700">`

**All fonts are loaded in `src/index.css`** via `@import` from Google Fonts.

---

## Typography Classes

**File**: `src/index.css` (custom classes)

All class names follow pattern: `.vv-{role}`

| Class | Font | Weight | Size | Line Height | Usage |
|---|---|---|---|---|---|
| `.vv-h1` | Playfair | 700 | 52–80px (clamp) | 1.2 | Page title |
| `.vv-h1-script` | Playfair + Dancing Script | 700 | 56–72px | 1.2 | H1 with script accent |
| `.vv-h2` | Playfair | 700 | 36–48px (clamp) | 1.3 | Section heading |
| `.vv-h3` | Playfair | 600 | 24–32px (clamp) | 1.4 | Subsection |
| `.vv-h4` | Playfair | 600 | 20px | 1.4 | Small heading |
| `.vv-eyebrow` | Poppins | 600 | 12px | 1.4 | Label above heading |
| `.vv-p` | Poppins | 400 | 16px | 1.7 | Body paragraph |
| `.vv-p-lg` | Poppins | 400 | 18px | 1.8 | Large paragraph |
| `.vv-small` | Poppins | 400 | 14px | 1.6 | Small text |
| `.vv-script` | Dancing Script | 700 | 48–96px | 1.2 | One-word accent |
| `.vv-letter-body` | Georgia | 400 | 14px | 1.8 | Letter/note text |
| `.gradient-text` | Poppins | 700 | inherit | inherit | Gradient text (rare) |
| `.gradient-text-gold` | Poppins | 700 | inherit | inherit | Gold gradient text |

---

## Responsive Font Sizing

Use `clamp()` to scale fonts smoothly across breakpoints:

```css
.vv-h1 {
  font-size: clamp(52px, 5vw, 80px);
  /* min: 52px (mobile), ideal: 5% of viewport, max: 80px (desktop) */
}

.vv-h2 {
  font-size: clamp(36px, 4vw, 48px);
}

.vv-h3 {
  font-size: clamp(24px, 3vw, 32px);
}

.vv-p {
  font-size: 16px;  /* static, no clamp needed */
}
```

**Rule**: Never let font sizes go below 12px (unreadable) or above 96px (ridiculous on ultra-wide).

---

## Font Weights

| Weight | Usage | Example |
|---|---|---|
| 300 | Very light emphasis (rarely used) | Disabled text |
| 400 | Body text, default | Paragraphs, labels |
| 500 | Medium emphasis | Button text, emphasis |
| 600 | Strong emphasis | Labels, figure captions |
| 700 | Strongest emphasis | Headings, script accents |

---

## The Dancing Script Rule

**One word. One section. One emotion.**

```
// ✓ Correct usage
"Create a jar of **notes**"  
← 'notes' is the emotional noun, in Dancing Script

// ✓ Correct usage
"Share moments that **matter**"
← 'matter' is the emotional noun

// ❌ Incorrect usage
"Create a **jar of notes**"
← Too many words in script

// ❌ Incorrect usage
"Create a jar of **wonderful, beautiful, amazing notes**"
← Script should never be multiple words
```

**Per page limit**: No more than 3–4 script words per page. Otherwise it loses emotional weight and becomes decorative.

---

## Usage in Code

### Using Typography Classes

```tsx
<h1 className="vv-h1">Welcome</h1>
<h2 className="vv-h2">Get started</h2>
<p className="vv-p">Here's how to use Vivlit...</p>
<span className="vv-script">notes</span>  {/* in h2 above */}
```

### Using Inline Styles

When a class isn't available or you need dynamic styling:

```tsx
<h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700 }}>
  Title
</h1>

<span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 72, fontWeight: 700 }}>
  emotion
</span>
```

### Using Tailwind

Tailwind doesn't have the above classes, so use Playfair/Poppins utility classes:

```html
<h1 class="font-heading text-4xl font-bold">Title</h1>
<p class="font-body text-base font-normal">Body text</p>
```

---

## Letter/Note Text

Notes inside jars use a special serif font for authenticity:

```css
.vv-letter-body {
  font-family: Georgia, serif;
  font-size: 14px;
  line-height: 1.8;
  color: var(--ink-primary);
}
```

Georgia evokes handwritten letters. Not too modern, not too decorative.

---

## Accessibility

### Readability
- Minimum 14px for body text (non-decorative)
- Line height ≥ 1.5 for readability
- Line length ≤ 75 characters for comfortable reading
- All text color contrasts ≥ 4.5:1 against background

### Screen Readers
- Semantic HTML: `<h1>`, `<h2>`, `<p>`, `<strong>`, `<em>`
- Don't fake headings with `<div class="vv-h2">` (use `<h2>`)
- Script accents don't need special handling (just text)

### Font Loading
- Google Fonts loading is synchronous (blocks render)
- **Improvement opportunity**: Add `font-display: swap` to reduce CLS (Cumulative Layout Shift)

---

## Text Alignment

| Alignment | Usage | Avoid |
|---|---|---|
| Left (start) | All body text, nav | Right-align for readability |
| Center | Headings, CTAs | Center body text (hard to read) |
| Right (end) | Design element only | Never for main content |
| Justified | Never | Creates uneven gaps |

**Rule**: Left-aligned text is most readable. Center only for short headings or calls to action.

---

## Emphasis & Styling

| Element | Style |
|---|---|
| Bold text | `<strong>` or Poppins weight-600 |
| Italic text | `<em>` or `font-style: italic` |
| Underline | Use only for links |
| Strikethrough | Use sparingly (only for cancelled content) |
| ALL CAPS | Avoid (reduces readability) |
| ALL lowercase | Avoid in headings |

---

[← Back to README](../README.md)
