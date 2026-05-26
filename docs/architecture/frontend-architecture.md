# Frontend Architecture

The Vivlit frontend is a React SPA organized by responsibility: pages handle routing, components handle UI, contexts handle global state, hooks encapsulate logic.

---

## Component Tree

```
App.tsx
├── QueryClientProvider (TanStack Query)
├── BrowserRouter (React Router)
├── AuthProvider (useAuth context)
├── TooltipProvider (shadcn/ui)
├── Lenis (smooth scroll initialization)
├── Routes
│   ├── / → Index
│   ├── /auth → Auth
│   ├── /dashboard → Dashboard
│   ├── /profile → Profile
│   ├── /create-jar → CreateJar
│   ├── /edit-jar/:id → EditJar
│   ├── /jar/:token → ViewJar
│   ├── /create-card → CreateCard
│   ├── /card/:token → ViewCard
│   ├── /contribute/:token → ContributePage
│   ├── /gallery, /features, /about, /contact → Static pages
│   └── * → NotFound
├── Navbar (global, outside routes)
├── ScrollToTop (resets scroll on route change)
├── Analytics & SpeedInsights (Vercel tracking)
└── Toast & Tooltip providers (shadcn/ui)
```

---

## Directory Layout

```
src/
├── pages/                       # Route-level components
│   ├── Index.tsx                # Landing page
│   ├── Auth.tsx                 # Sign in / sign up
│   ├── Dashboard.tsx            # User dashboard (jars, cards, timeline)
│   ├── Profile.tsx              # Account settings
│   ├── CreateJar.tsx            # 3-panel jar creation workspace
│   ├── EditJar.tsx              # Edit jar notes/charms/settings
│   ├── ViewJar.tsx              # Recipient jar viewer (with reveal logic)
│   ├── CreateCard.tsx           # 3-step e-card wizard
│   ├── ViewCard.tsx             # E-card viewer with envelope animation
│   ├── ContributePage.tsx       # Public note contribution
│   ├── GalleryPage.tsx          # Inspiration gallery
│   ├── FeaturesPage.tsx         # Feature overview
│   ├── AboutPage.tsx            # About Vivlit
│   ├── ContactPage.tsx          # Contact form
│   └── NotFound.tsx             # 404 page
│
├── components/
│   ├── ui/                      # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── tooltip.tsx
│   │   ├── tabs.tsx
│   │   ├── label.tsx
│   │   ├── avatar.tsx
│   │   ├── separator.tsx
│   │   └── [other UI primitives]
│   │
│   ├── landing/                 # Landing page sections
│   │   ├── CinematicHero.tsx    # Scroll-driven hero with jar
│   │   ├── HeroJar.tsx          # 3D CSS perspective jar
│   │   ├── HeroNote.tsx         # Rising note animation
│   │   ├── ScrollHint.tsx       # "Scroll to open" indicator
│   │   ├── MemoryAnatomy.tsx    # "What's inside" section
│   │   ├── EmotionalUseCases.tsx # Use case stories
│   │   ├── SharedExperience.tsx # Share journey
│   │   ├── CalmCTA.tsx          # Final CTA
│   │   ├── FloatingNotes.tsx    # Background animation
│   │   ├── AnimatedSparkles.tsx # Sparkle effects
│   │   └── Interactive3DJar.tsx # Three.js 3D jar (legacy)
│   │
│   ├── workspace/               # Jar creation sub-panels
│   │   ├── NoteEditor.tsx       # Text/image/voice/link note editor
│   │   ├── CharmsPalette.tsx    # Charm selection & positioning
│   │   ├── JarSettings.tsx      # Theme, password, unlock date
│   │   ├── JarPreview.tsx       # Live jar preview
│   │   └── ContributorsPanel.tsx # Invite management
│   │
│   ├── ecard/
│   │   └── CardPreview.tsx      # Live card preview
│   │
│   ├── JarVisual.tsx            # SVG jar component (used everywhere)
│   ├── Navbar.tsx               # Top navigation
│   ├── Footer.tsx               # Bottom footer
│   ├── ShareDialog.tsx          # Copy link / email share
│   ├── CountdownTimer.tsx       # Countdown to unlock date
│   └── ScrollToTop.tsx          # Auto-scroll to top on route change
│
├── contexts/
│   └── AuthContext.tsx          # Provides useAuth() hook
│
├── hooks/
│   ├── useAuth.ts               # Auth state + actions
│   ├── useGhostSession.ts       # Anonymous session management
│   ├── useAudioRecorder.ts      # Record voice notes
│   ├── use-mobile.tsx           # Detect mobile breakpoint
│   └── use-toast.ts             # Toast notifications
│
├── integrations/
│   └── supabase/
│       ├── client.ts            # Supabase JS client instance
│       └── types.ts             # Generated TypeScript types from DB
│
├── lib/
│   ├── themes.ts                # JAR_THEMES, NOTE_THEMES, helpers
│   ├── confetti.ts              # fireConfetti(), fireSparkles(), fireHearts()
│   └── utils.ts                 # Utility functions (cn, classNames, etc.)
│
├── assets/                      # Images, fonts (Google Fonts loaded in index.css)
├── styles/                      # (not used; all CSS in index.css + Tailwind)
├── App.tsx                      # Root component + router
├── App.css                      # App-specific styles
├── index.css                    # Design tokens, global classes, animations
├── main.tsx                     # React entry point
└── vite-env.d.ts               # Vite type definitions
```

---

## State Management Strategy

### 1. AuthContext (Global)
Manages user identity and authentication:
```typescript
const { user, session, loading, signUp, signIn, signOut } = useAuth();
```
- `user` — Supabase User object (id, email, user_metadata.full_name)
- `session` — JWT session object
- `loading` — true while initializing auth state
- Actions: `signUp(email, password, fullName)`, `signIn(email, password)`, `signOut()`

**Key detail**: Has an `initialized` gate to prevent a race condition where `onAuthStateChange` fires before `getSession()` resolves.

### 2. Ghost Session (localStorage)
Allows anonymous users to create jars:
```typescript
const { ghostSessionId, isGhost } = useGhostSession();
```
- Stores UUID in localStorage under key `vivlit_ghost_session`
- `isGhost` = `!user && !!ghostSessionId`
- On sign-up, calls `convert_ghost_account(ghostSessionId, userId)` RPC to migrate jars

### 3. Component State (useState)
Used for all UI state:
- Form inputs (e.g., `const [jarName, setJarName] = useState('')`)
- Modal open/close (e.g., `const [shareDialogOpen, setShareDialogOpen] = useState(false)`)
- Loading indicators (e.g., `const [isLoading, setIsLoading] = useState(false)`)
- Temporary data during creation (e.g., `const [pendingNotes, setPendingNotes] = useState([])`)

### 4. Raw Supabase Calls (useEffect)
Every page that needs data does this:
```typescript
useEffect(() => {
  const fetchJars = async () => {
    const { data, error } = await supabase.from('jars').select('*');
    setJars(data || []);
  };
  fetchJars();
}, []);
```

**Not using TanStack Query yet**: Dependency is installed but no `useQuery` or `useMutation` hooks. This is a future improvement for caching and optimistic updates.

---

## Key Components Explained

### Pages

**`Index.tsx`** — Landing page
- Imports all landing components: `CinematicHero`, `MemoryAnatomy`, `EmotionalUseCases`, `SharedExperience`, `CalmCTA`
- Orchestrates the cinematic scroll narrative

**`CreateJar.tsx`** — 3-panel workspace
- Left: tabs for Notes/Charms/Settings
- Center: live JarPreview
- Right: summary sidebar
- Supports ghost creation with sessionStorage recovery
- File upload to `jar-media` storage bucket on submit

**`ViewJar.tsx`** — Recipient jar opener
- Access gates: login check → password lock → time lock → normal view
- Per-user state in `jar_user_state` table (tracks daily opens, notes opened)
- Renders notes based on `open_mode` (daily reveal vs unlimited)
- Note types: text (quoted), image (img tag), voice (audio element), link (validated href)

**`Dashboard.tsx`** — User hub
- Tabs: My Jars, Shared with Me, Sent Cards, Timeline
- Calls `convert_ghost_account()` on load if user was previously ghost

### Components

**`JarVisual.tsx`** — The jar SVG
- Renders in CreateJar (preview), ViewJar, and landing page
- SVG paths for jar glass, lid, and notes
- Props: `theme` (color), `openMode` label, `notes` count
- Used everywhere because the jar is the brand

**`NoteEditor.tsx`** — Note creation
- Radio buttons for content type (text, image, voice, link)
- Text: textarea with char count
- Image: file picker, preview with `URL.createObjectURL`
- Voice: `useAudioRecorder` hook
- Link: URL validation
- Returns `{ content, contentType, mediaUrl }`

**`CinematicHero.tsx`** — Scroll-driven hero
- Height: 220vh (scroll real estate for narrative)
- Inner sticky panel: 100vh
- Scroll progress tracked 0→1
- Framer Motion transforms: jar rotateY, scale, lid rotateX, note y/opacity
- Spring physics for weighted motion

---

## Routing & Navigation

| Route | Requires Auth | Protected by |
|---|---|---|
| `/` | No | None |
| `/auth` | No | Redirects to dashboard if authenticated |
| `/dashboard` | Yes | useEffect checks user in AuthContext |
| `/profile` | Yes | useEffect checks user |
| `/create-jar` | No | Ghost session allowed |
| `/edit-jar/:id` | Yes | Jar ownership check in Supabase RLS |
| `/jar/:token` | No (depends on jar settings) | Jar access check on fetch |
| `/create-card` | No | Ghost session allowed |
| `/card/:token` | No | Card access is public by default |
| `/contribute/:token` | No | Contributor token validation |
| `/gallery`, etc. | No | Static content |

**Pattern**: Pages that need auth call `useNavigate()` in `useEffect`:
```typescript
useEffect(() => {
  if (!loading && !user) navigate('/auth');
}, [user, loading, navigate]);
```

---

## Styling Strategy

### CSS Custom Properties (in `src/index.css`)
```css
:root {
  --bg-page: hsl(38, 40%, 97%);      /* warm ivory page background */
  --bg-section: hsl(30, 35%, 95%);   /* dusty cream for sections */
  --bg-card: hsl(0, 0%, 100%);       /* white cards */
  --ink-primary: hsl(270, 45%, 20%); /* deep plum headings */
  --ink-secondary: hsl(270, 20%, 45%); /* muted lilac body */
  --ink-muted: hsl(30, 15%, 55%);    /* warm grey for muted text */
  --accent-plum: hsl(280, 45%, 60%); /* muted plum buttons */
  --accent-rose: hsl(345, 55%, 72%); /* dusty rose accents */
  --accent-gold: hsl(38, 65%, 68%);  /* warm gold highlights */
  /* ... plus 10 jar theme colors, shadows, transitions, etc. */
}
```

### Tailwind Classes
Applied via `className` prop:
- Utilities: `bg-primary`, `text-foreground`, `p-4`, `rounded-lg`
- Responsive: `md:grid-cols-2`, `lg:p-8`
- Custom: `font-heading` (Playfair), `font-script` (Dancing Script)

### Inline Styles
When Tailwind doesn't cover it or styles are dynamic:
```tsx
<div style={{ background: 'var(--bg-page)', color: 'var(--ink-primary)' }}>
```

---

## Animation Approach

### Framer Motion
Used for:
- **Scroll-driven**: `useScroll` + `useTransform` in hero
- **Viewport reveals**: `whileInView` for sections as user scrolls
- **Spring physics**: `type: "spring"` for natural motion
- **Stagger**: `delayChildren`, `staggerChildren` for sequential reveals

### CSS Animations
Used for:
- Infinite loops: `@keyframes animate-float` for floating elements
- Transitions: `transition: opacity 200ms ease` for simple fades

### `prefers-reduced-motion`
All animations check this media query and collapse to opacity-only fades.

---

## TypeScript & Type Safety

- **Generated types**: `src/integrations/supabase/types.ts` exports table types (generated from Supabase schema)
- **Explicit return types**: All functions annotated (e.g., `async function fetchJars(): Promise<Jar[]>`)
- **Strict mode**: `tsconfig.json` has `strict: true`
- **No `any` types**: Use `unknown` and type narrowing instead

---

## Performance Optimization

- **Lazy loading**: Pages not immediately visible are dynamic imports
- **Image optimization**: SVGs used for jar; Vercel automatic image optimization
- **CSS minification**: Tailwind + Vite handle this
- **Tree-shaking**: Unused code removed at build time
- **Code splitting**: Vite automatically chunks by route

---

[← Back to README](../README.md)
