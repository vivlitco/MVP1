# System Overview

Vivlit is a full-stack emotional e-gifting platform for creating and sharing digital memory jars and animated e-cards. This document explains how the system components fit together.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser / Mobile                        │
│                    (React 18 + TypeScript)                       │
├─────────────────────────────────────────────────────────────────┤
│                          Vercel CDN                              │
│                    (SPA + static assets)                         │
├─────────────────────────────────────────────────────────────────┤
│                      Supabase Services                           │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  PostgreSQL    │  │  Auth (JWT)  │  │ Edge Functions      │ │
│  │  Database      │  │  Email auth  │  │ (Deno runtime)      │ │
│  └────────────────┘  └──────────────┘  └─────────────────────┘ │
│  ┌────────────────┐                                              │
│  │ Storage Bucket │  (jar-media uploads)                        │
│  │ (jar-media)    │                                              │
│  └────────────────┘                                              │
├─────────────────────────────────────────────────────────────────┤
│              External Services (via Edge Functions)              │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │   Resend    │  │ Lovable AI       │  │   GitHub         │   │
│  │   Email     │  │ Gateway (Gemini) │  │ Repo / CI-CD     │   │
│  └─────────────┘  └──────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Three-Layer Architecture

### 1. Presentation Layer (React)
**What it does:** Renders the UI, handles user interactions, coordinates with backend

- **Framework**: React 18 with TypeScript
- **Build tool**: Vite 7 (SWC transpiler for fast rebuilds)
- **Styling**: Tailwind CSS + shadcn/ui components + custom CSS classes
- **State management**:
  - `AuthContext` — user identity, session, login/logout
  - Component state (useState) — local UI state (form inputs, modal open/close)
  - Raw `supabase` calls in `useEffect` — data queries and mutations
  - TanStack Query declared but not actively used yet
- **Animations**: Framer Motion (scroll-driven, spring-based, whileInView)
- **Routing**: React Router v6 (SPA, all routes → `index.html`)

### 2. Business Logic & Integration Layer
**What it does:** Validates input, calls Supabase APIs, transforms responses for the UI

- **Components that do this**: Every page component has `useEffect` hooks that call `supabase.from(table).select/insert/update/delete()`
- **Edge Functions** (Deno): `generate-message`, `send-jar-email`, `send-card-email`, `contact-form`
- **Pattern**: Direct Supabase JS client calls from React components (no separate API layer)

### 3. Data Layer (Supabase + PostgreSQL)
**What it does:** Enforces data integrity, security (RLS), persistence

- **Database**: PostgreSQL (11 tables)
  - Core tables: `jars`, `jar_notes`, `jar_charms`, `cards`
  - User & auth: `profiles`, `auth.users` (Supabase-managed)
  - Sharing: `jar_shares`, `jar_contributors`, `jar_owners`
  - Audit: `jar_activity`, `jar_user_state`, `ghost_accounts`, `contact_submissions`
- **Access control**: Row Level Security (RLS) policies enforce data isolation at the DB layer
- **Functions**: PostgreSQL stored functions for RPC calls (password hashing, ghost account conversion, etc.)
- **Storage**: `jar-media` bucket for image/audio uploads

---

## Service Ownership

| External Service | Owns | Used by | Why |
|---|---|---|---|
| **Vercel** | Hosting, CDN, SPA rewrite, CI/CD | Browser, `npm run build` | Fast global CDN, automatic deployments from GitHub |
| **Supabase** | PostgreSQL DB, Auth, Storage, Edge Functions | React app, Edge Functions | Backend-as-a-service, manages infrastructure |
| **Resend** | Transactional email delivery | `send-jar-email`, `send-card-email`, `contact-form` | Reliable email delivery (SMTP alternative) |
| **Google Gemini 3 Flash** | AI text generation | `generate-message` edge function | AI-powered message suggestions for users |
| **GitHub** | Source control, CI trigger | Vercel, local development | Version control, automatic deploys on push |

---

## Data Flow Example: Creating a Jar

1. **User fills form** (React `CreateJar` page)
   - Selects theme, writes notes (text/image/voice), adds charms
   - Data kept in component state (loading bar shows upload progress)
2. **User clicks "Save"**
   - React validates form (client-side)
   - Uploads media files to Supabase Storage `jar-media` bucket
   - Inserts `jars` record with authenticated `user_id` (or `ghost_session_id` if not logged in)
   - Inserts `jar_notes` records (one per note) with media URLs
   - Inserts `jar_charms` records (one per charm)
   - Generates unique `share_token` UUID
3. **Backend enforces** (Supabase):
   - RLS policy allows authenticated user to insert to `jars` (checks `auth.uid()` matches `user_id`)
   - RLS policy allows user to insert notes to their own jar
   - Triggers (if any) run on insert
4. **Response returns to React**
   - `share_token` sent back to frontend
   - React navigates to dashboard showing newly created jar
   - Share link `/jar/:share_token` is now live

---

## Authentication Flow

1. **Sign up**: User enters email, password, name
   - React → Supabase `auth.signUp()` with `full_name` in metadata
   - Supabase sends confirmation email
2. **User clicks email link**
   - Email link redirects to `/auth?mode=signup` (user completes setup)
3. **Sign in**: User enters email, password
   - React → Supabase `auth.signInWithPassword(email, password)`
   - Supabase returns JWT session
   - `AuthContext` stores session in localStorage (`persist_session: true` in client config)
4. **Every request authenticates**
   - React → Supabase: JWT sent automatically in Authorization header
   - Supabase verifies JWT, extracts `auth.uid()`
   - RLS policies check `auth.uid()` against table rows
5. **Sign out**
   - React → Supabase `auth.signOut()`
   - localStorage cleared
   - Navigate to `/`

---

## Ghost Sessions (Anonymous Users)

For users who want to create a jar **without signing up**:

1. **First visit**: `useGhostSession` hook generates `crypto.randomUUID()` and stores as `vivlit_ghost_session` in localStorage
2. **Create jar**: App inserts jar with `ghost_session_id` instead of `user_id`
3. **User signs up later**: App calls `convert_ghost_account()` RPC to migrate ghost jars to the new user account
4. **Permissions**: Ghost users can create/edit their own jars but cannot set password protection or time-lock (requires an account)

---

## Key Design Decisions

| Decision | Why |
|---|---|
| **Supabase** (not custom backend) | Reduces infrastructure complexity; Auth + DB + Storage + Functions managed by Supabase; faster to market |
| **React + Vite** (not Next.js) | Client-side SPA is simpler here; no server-side rendering needed; Vite is faster than Next.js for this scale |
| **RLS at DB layer** (not app layer) | Data isolation enforced by PostgreSQL itself; impossible for app bugs to leak data; auditable |
| **Edge Functions** (not Lambda) | Deno is lightweight; easier to test locally; shared DB client; no cold starts for low traffic |
| **Vercel** (not self-hosted) | CDN + SPA rewrite rules + GitHub integration; no ops overhead |
| **Raw Supabase calls** (not ORM) | Direct SQL is simpler for this scale; Supabase types are excellent; TanStack Query can be added later if caching is needed |

---

## Performance & Scalability

- **Frontend**: Vite build is <500KB gzipped; Vercel CDN distributes globally
- **Backend**: Supabase PostgreSQL scales vertically; can be upgraded if needed
- **Images/audio**: Stored in `jar-media` bucket; served via Supabase CDN
- **Email delivery**: Resend queues jobs asynchronously (no blocking)
- **AI generation**: Lovable AI Gateway has rate limits; error handling returns client-side fallback

---

[← Back to README](../README.md)
