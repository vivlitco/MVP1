# Getting Started (Local Development)

---

## Prerequisites

- **Node.js** 18+ (check: `node --version`)
- **npm** 8+ (check: `npm --version`)
- **Git**
- **Supabase account** (free tier: https://supabase.com)

---

## Step 1: Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd MVP1

# Install dependencies
npm install

# Verify Vite works
npm run dev
# Open http://localhost:8080 (should show landing page, no auth yet)
```

---

## Step 2: Create `.env.local`

Copy from `.env.example` (if it exists) or create from scratch:

```bash
# Get these from Supabase Dashboard (Project Settings → API)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# Optional: for local Supabase (if you run supabase start)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Do NOT commit `.env.local`**. It's in `.gitignore`.

---

## Step 3: Test Auth

1. Start dev server: `npm run dev`
2. Navigate to http://localhost:8080
3. Click "Sign Up"
4. Enter email (e.g., `test@example.com`) + password + name
5. You'll see: "Check your inbox ✨" message

**In dev**: Supabase Auo Auth will send a confirmation link. Check your email (or use Supabase dashboard to skip email confirmation).

6. After confirming, you can sign in
7. You should see Dashboard

---

## Step 4: Create a Jar

1. Click "Create a Jar" (or click the CTA on landing)
2. Fill in: name, theme, add some notes
3. Click "Save"
4. See the jar in your Dashboard

**Your data is now in Supabase!**

---

## Step 5: View the Jar

1. Copy the share link (or click "View")
2. Paste in a new browser tab (incognito to test as guest)
3. You should see your jar with the notes you added

---

## Common Issues

### `VITE_SUPABASE_URL is missing`
- Check `.env.local` exists in root directory
- Restart dev server: `npm run dev`

### Email confirmation not arriving
- Check spam folder
- Use Supabase dashboard → Auth → Users → Click user → Check email confirmation status
- You can manually confirm in dashboard

### Can't sign in
- Verify email is confirmed (see above)
- Check email/password is correct
- Try incognito mode (bypass cached session)

### Jar not saving
- Check browser console for errors (F12 → Console)
- Verify Supabase URL and key are correct
- Check Supabase project is active (not paused)

---

## Build & Deploy

### Local Build
```bash
npm run build
# Output: dist/ folder

# Preview production build:
npm run preview
# Opens http://localhost:4173
```

### Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Or push to GitHub and connect repo to Vercel dashboard
```

[See deployment/vercel.md for detailed Vercel setup]

---

## TypeScript Checking

```bash
npm run type-check
# Checks for TypeScript errors (no changes needed)
```

---

## Next Steps

- Read [architecture/frontend-architecture.md](../architecture/frontend-architecture.md) to understand component structure
- Read [design-system/overview.md](../design-system/overview.md) to understand design language
- Read [database/schema.md](../database/schema.md) to understand data model

---

[← Back to README](../README.md)
