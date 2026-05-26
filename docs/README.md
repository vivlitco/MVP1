# Vivlit Engineering Documentation

> **Platform**: Emotional e-gifting — Jars of Notes and Interactive E-Cards  
> **Stack**: React 18 · TypeScript · Vite · Tailwind CSS · Supabase · Vercel  
> **Repo**: `MVP1`

---

## Quick Navigation

| Area | What's inside |
|---|---|
| [Architecture](./architecture/system-overview.md) | System map, component tree, data flows |
| [Design System](./design-system/overview.md) | Color tokens, typography, motion language |
| [Database](./database/schema.md) | Schema, RLS policies, RPC functions |
| [Features](./features/jars.md) | Jars, E-cards, Collaboration, Ghost sessions |
| [API](./api/edge-functions.md) | Edge functions, Supabase client patterns |
| [Deployment](./deployment/getting-started.md) | Local setup, environment variables, Vercel, Supabase |

---

## Start Here

**New to the codebase?** Read in this order:
1. [System Overview](./architecture/system-overview.md) — understand what the system is
2. [Getting Started](./deployment/getting-started.md) — get it running locally
3. [Frontend Architecture](./architecture/frontend-architecture.md) — understand how the UI is organized
4. [Design System Overview](./design-system/overview.md) — understand the visual language before touching any UI

**Working on a specific feature?**
- Jars → [features/jars.md](./features/jars.md)
- E-cards → [features/cards.md](./features/cards.md)
- Email delivery → [api/edge-functions.md](./api/edge-functions.md)
- Database changes → [database/schema.md](./database/schema.md) then [database/rls-policies.md](./database/rls-policies.md)

**Deploying?**
- [deployment/vercel.md](./deployment/vercel.md) — frontend
- [deployment/supabase.md](./deployment/supabase.md) — backend, migrations, secrets

---

## Tech Stack at a Glance

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 7.3 | Build tool (SWC-based) |
| Tailwind CSS | 3.4 | Utility-first styling |
| shadcn/ui | latest | Accessible UI primitives |
| Framer Motion | 11.18 | Animations, scroll-driven effects |
| Lenis | 1.3 | Smooth scrolling |
| React Router | 6.30 | SPA routing |
| TanStack Query | 5.83 | Server state management |

### Backend
| Tool | Purpose |
|---|---|
| Supabase (PostgreSQL) | Database with row-level security |
| Supabase Auth | Email/password authentication, JWT |
| Supabase Storage | `jar-media` bucket for images and audio |
| Supabase Edge Functions | Deno-based serverless functions |
| Resend | Transactional email delivery |
| Google Gemini 3 Flash | AI message generation (via Lovable AI Gateway) |

### Infrastructure
| Tool | Purpose |
|---|---|
| Vercel | Hosting, CI/CD, SPA rewrite rules |
| GitHub | Version control |
| Vercel Analytics | User behavior tracking |
| Vercel Speed Insights | Core Web Vitals monitoring |

---

## Application Routes

| Path | Page | Auth Required |
|---|---|---|
| `/` | Landing page | No |
| `/auth` | Sign in / Sign up | No (redirects if authenticated) |
| `/dashboard` | User dashboard | Yes |
| `/profile` | Profile & account | Yes |
| `/create-jar` | Create jar workspace | No (ghost session) |
| `/edit-jar/:id` | Edit existing jar | Yes (owner) |
| `/jar/:token` | View jar (recipient) | Depends on jar settings |
| `/create-card` | Create e-card | No (ghost session) |
| `/card/:token` | View e-card (recipient) | No |
| `/contribute/:token` | Add notes via invite | No |
| `/gallery` | Inspiration gallery | No |
| `/features` | Feature overview | No |
| `/about` | About Vivlit | No |
| `/contact` | Contact form | No |

---

## Repository Structure

```
MVP1/
├── src/
│   ├── App.tsx                 # Root: router, providers, Lenis scroll
│   ├── main.tsx                # React entry point
│   ├── index.css               # Design tokens, global classes, animations
│   ├── pages/                  # Route-level components
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── landing/            # Landing page sections
│   │   ├── workspace/          # Jar creation workspace panels
│   │   └── ecard/              # E-card components
│   ├── contexts/               # React contexts (AuthContext)
│   ├── hooks/                  # Custom hooks
│   ├── integrations/supabase/  # Supabase client + generated types
│   └── lib/                    # Utilities (themes, confetti, utils)
├── supabase/
│   ├── functions/              # Edge functions (Deno)
│   ├── migrations/             # SQL migration history
│   ├── config.toml             # Supabase project config
│   └── combined_schema.sql     # Full DB schema snapshot
├── public/                     # Static assets
├── docs/                       # ← You are here
├── vercel.json                 # Vercel deployment config
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

*Vivlit Engineering — All documentation maintained by the Vivlit team.*
