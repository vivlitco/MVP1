# Vivlit — Light Up Moments That Matter ✨

Vivlit is a modern emotional e-gifting platform that transforms heartfelt words, voice notes, and memories into beautiful interactive digital gifts. Create **Jars of Notes** for collaborative note-sharing and send **Interactive E-Cards** with animated wax-sealed envelopes.

**Website**: https://vivlit.com

---

## 🎯 What is Vivlit?

Vivlit enables meaningful connection through digital gifting:

- **Jars of Notes** — Create shareable collections of handwritten notes, voice messages, photos, and links. Set opening modes (daily reveal or unlimited), add decorative charms, and password-protect for privacy.
- **Interactive E-Cards** — Send personalized, animated e-cards with wax-sealed envelopes, voice notes, and AI-assisted messaging.
- **Collaborative Features** — Invite friends and family to contribute notes via unique invite tokens.
- **Memory Preservation** — Beautiful, permanent digital keepsakes for birthdays, farewells, anniversaries, milestones, and more.

---

## ⚙️ Tech Stack

### Frontend
- **Vite** — Lightning-fast build tool
- **React 18** — UI framework
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Accessible component library
- **Framer Motion** — Smooth animations and scroll-driven interactions
- **Lenis** — Smooth scrolling library
- **React Router** — Client-side routing
- **TanStack Query** — Server state management

### Backend & Database
- **Supabase** — PostgreSQL database, authentication, edge functions, RLS policies
- **Row Level Security (RLS)** — Data isolation and privacy
- **PostgreSQL Functions** — Password verification, jar owner checks, RPC endpoints
- **Edge Functions** — Email delivery via Resend

### Monitoring & Analytics
- **Vercel Analytics** — User behavior tracking
- **Vercel Speed Insights** — Core Web Vitals monitoring

### Deployment
- **Vercel** — Hosting and CI/CD
- **GitHub** — Version control

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Supabase project
- A Vercel account (for deployment)

### Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <PROJECT_NAME>

# Install dependencies
npm i

# Create environment file
cp .env.example .env.local

# Update .env.local with your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start the development server
npm run dev
```

Open http://localhost:8080 in your browser.

### Environment Variables

Create `.env.local` with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**⚠️ Never commit `.env` to Git.** It's in `.gitignore`.

---

## 📁 Project Structure

```
src/
├── pages/              # Route-level components
│   ├── Index.tsx       # Landing page with cinematic hero
│   ├── Auth.tsx        # Authentication
│   ├── Dashboard.tsx    # User dashboard
│   ├── CreateJar.tsx    # Jar creation flow
│   ├── EditJar.tsx      # Jar editing
│   ├── ViewJar.tsx      # Interactive jar viewing
│   ├── CreateCard.tsx   # E-card creation
│   ├── ViewCard.tsx     # E-card viewing
│   └── ...
│
├── components/
│   ├── landing/        # Landing page sections
│   │   ├── CinematicHero.tsx
│   │   ├── HeroJar.tsx
│   │   ├── MemoryAnatomy.tsx
│   │   ├── EmotionalUseCases.tsx
│   │   └── ...
│   ├── ui/             # shadcn components
│   ├── JarVisual.tsx    # 2D SVG jar component
│   ├── Navbar.tsx       # Navigation bar
│   ├── Footer.tsx       # Footer
│   └── ...
│
├── contexts/           # React contexts
│   └── AuthContext.tsx  # Auth state & user management
│
├── hooks/              # Custom React hooks
│   ├── useGhostSession.tsx
│   └── ...
│
├── integrations/
│   └── supabase/        # Supabase client setup
│
├── lib/                # Utility functions
│   ├── themes.ts        # Jar theme colors
│   ├── confetti.ts      # Celebration animations
│   └── ...
│
├── assets/             # Images, fonts, static files
└── styles/             # Global CSS
```

---

## 🎨 Design Language

All pages follow a warm, cohesive design system:

- **Typography**: Playfair Display (headings), Poppins (body), Dancing Script (brand accent)
- **Color Palette**: Warm ivory backgrounds, plum accents, rose highlights, warm tan borders
- **Spacing**: Generous whitespace, max-width containers (1024px) for readability
- **Motion**: Smooth, physics-based animations (Framer Motion springs)

See `DESIGN_SYSTEM.md` for complete guidelines.

---

## 🗄️ Database Setup

### Running Migrations

The production Supabase instance needs these migrations:

```bash
# Option 1: Paste supabase/fix_production_db.sql into Supabase SQL editor
# (includes all tables: contact_submissions, jar_contributors, cards, jar_shares RLS)

# Option 2: Run migrations locally
supabase migration new <migration_name>
# Edit migration file
supabase db push
```

### Key Tables
- `jars` — Jar metadata, themes, unlock dates
- `jar_notes` — Notes inside jars (text, voice, image, link)
- `jar_contributors` — Collaborative jar invites
- `cards` — E-card data
- `jar_shares` — Shared jar records
- `jar_user_state` — Per-user opening history

All tables have Row Level Security (RLS) policies.

---

## 📦 Building & Deploying

### Build for Production

```bash
npm run build
# Output: dist/
```

### Deploy to Vercel

```bash
# First-time: authorize Vercel
vercel login

# Deploy
vercel
```

**Environment Variables in Vercel Dashboard:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🔐 Security

- **Supabase RLS** — Data access controlled by PostgreSQL policies
- **JWT Auth** — Secure user authentication via Supabase Auth
- **Password Hashing** — bcrypt via Supabase RPC functions
- **Edge Functions** — Server-side email handling
- **.env never committed** — Sensitive keys excluded from Git
- **CORS Handling** — Proper CORS headers on all edge functions

---

## 🎯 Current Features

### Jars of Notes
- ✅ Create, edit, delete jars
- ✅ Multiple note types: text, voice, photo, link
- ✅ Decorative charms and themes
- ✅ Daily note reveal mode
- ✅ Unlimited opening mode
- ✅ Password protection
- ✅ Time-locked jars
- ✅ Collaborative note contributions
- ✅ Jar sharing via unique links

### E-Cards
- ✅ Create animated e-cards
- ✅ Wax-sealed envelope interaction
- ✅ Voice note attachment
- ✅ Email delivery
- ✅ Share via link

### User Features
- ✅ User authentication (sign up, sign in)
- ✅ Dashboard with jar management
- ✅ User profile with stats
- ✅ Ghost sessions (anonymous jar viewing)
- ✅ Jar activity tracking
- ✅ Responsive design (mobile, tablet, desktop)

---

## 🛠️ Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run type-check   # TypeScript check
```

---

## 📋 Design System Reference

- **Background**: `var(--bg-page)` — warm ivory
- **Primary Text**: `var(--ink-primary)` — deep plum
- **Accent**: `var(--accent-plum)` — solid plum (buttons)
- **Borders**: `rgba(180,155,130,0.18)` — warm tan
- **Playfair Display** — all headings (H1, H2)
- **Dancing Script** — one emotional accent word per section
- **Poppins** — body text, labels, nav

No gradients on buttons. No background orbs. No neon. Solid, warm, timeless.

---

## 🐛 Common Issues

### `.env` file committed to Git
**Problem**: Sensitive credentials visible in history  
**Solution**: Run `git rm --cached .env && git commit` to untrack

### Supabase RLS blocking queries
**Problem**: 403 errors on database reads  
**Solution**: Check RLS policies in Supabase dashboard; verify GRANT statements for anon/authenticated roles

### ViewJar page showing 404 on `cards` table
**Problem**: Migration not run in production  
**Solution**: Paste `supabase/fix_production_db.sql` into Supabase SQL editor

---

## 📝 License

Vivlit is proprietary software. All rights reserved.

---

## 🤝 Contributing

This is a private project. Contact the maintainers for contribution guidelines.

---

**Made with 💜 by Vivlit**
