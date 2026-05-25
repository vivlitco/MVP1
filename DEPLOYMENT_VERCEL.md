# Vivlit Deployment Guide: Vercel + Fresh Supabase

## Overview

This guide covers deploying Vivlit to **Vercel** (frontend) with a **fresh Supabase** account (backend).

**Tech Stack:**
- Frontend: Vite + React → **Vercel**
- Backend: Supabase (database, auth, edge functions) → **Fresh account**
- Domain: vivlit.com (custom)
- CI/CD: GitHub Actions (auto-deploy on main merge)

---

## Part 1: Set Up Fresh Supabase Account

### Step 1: Create New Supabase Project

1. Go to **[Supabase Dashboard](https://supabase.com/dashboard)**
2. Sign up or log in with a **new account** (or existing, but fresh project)
3. Click **"New Project"**
4. **Project Details:**
   - **Name:** `vivlit` (or `vivlit-prod`)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., `us-east-1` if US-based)
   - **Pricing Plan:** Free tier is fine to start
5. Click **"Create new project"**
6. Wait for project to initialize (~2 min)

### Step 2: Get Supabase Credentials

Once project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → use for `VITE_SUPABASE_URL`
   - **Anon public key** → use for `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Go to **Settings** → **General**
4. Copy **Project ID** → use for `VITE_SUPABASE_PROJECT_ID`

**Example:**
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_SUPABASE_PROJECT_ID=xxxxxxxxxxxxxx
```

### Step 3: Apply Database Migrations

The app includes migrations for tables (jars, jar_notes, cards, jar_contributors, etc).

**Local environment:**
```bash
# Install Supabase CLI if you don't have it
npm install -g supabase

# Log in
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Apply migrations
supabase db push
```

**Or via Supabase Dashboard:**
1. Go to **SQL Editor** in your Supabase project
2. Copy each migration file from `supabase/migrations/` 
3. Paste and run in the editor (in chronological order)

### Step 4: Enable Edge Functions (Optional, for Email)

If you want email notifications (e.g., jar invitations):

1. Go to **Edge Functions** in Supabase Dashboard
2. Create functions:
   - `send-jar-email`
   - `send-card-email`
   - `generate-message`
   - `contact-form`
3. Copy function code from `supabase/functions/*/index.ts` in this repo
4. Set `RESEND_API_KEY` secret in Edge Functions settings

---

## Part 2: Deploy to Vercel

### Step 1: Create Vercel Account & Project

1. Go to **[Vercel Dashboard](https://vercel.com/dashboard)**
2. Sign up with GitHub (recommended, easier integration)
3. Click **"Add New..."** → **"Project"**
4. **Import Git Repository**
   - Select your GitHub repo: `vivlitco/MVP1`
   - Click **"Import"**
5. **Configure Project**
   - **Project Name:** `vivlit`
   - **Framework Preset:** Other (Vite will auto-detect)
   - **Build Command:** `npm run build` ✓
   - **Output Directory:** `dist` ✓
   - Leave root directory as `/`

### Step 2: Add Environment Variables

Before deploying, add the Supabase credentials:

1. In Vercel project settings → **Environment Variables**
2. Add each variable:
   ```
   VITE_SUPABASE_URL=https://...supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
   VITE_APP_URL=https://vivlit.com
   ```
3. Make sure they're available in **Production**, **Preview**, and **Development** environments
4. Save

### Step 3: Deploy

1. Click **"Deploy"** in Vercel dashboard
2. Wait for build to complete (~2-3 min)
3. You'll get a temporary Vercel URL: `https://vivlit.vercel.app`

### Step 4: Set Custom Domain (vivlit.com)

1. In Vercel project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `vivlit.com`
4. Choose **"Add as root domain"**
5. Vercel shows DNS records to add:
   - **Type A:** Point to Vercel
   - **CNAME:** For `www.vivlit.com`
6. Update your domain registrar (GoDaddy, Namecheap, etc):
   - Go to **DNS Settings**
   - Add the Vercel DNS records
   - Save (may take 5-10 min to propagate)
7. Once DNS propagates, Vercel will auto-detect and activate the domain

✅ Your app is now live at **https://vivlit.com**

---

## Part 3: Set Up CI/CD (GitHub Actions → Vercel)

### Step 1: Get Vercel Tokens

1. Go to **Vercel Settings** → **Tokens** (top-right profile menu)
2. Click **"Create Token"**
3. **Name:** `github-actions`
4. **Expiration:** 365 days
5. Copy the token

### Step 2: Get Vercel Project IDs

In Vercel project settings:
- **ORG ID** (under project name, starts with `team_` or `ORG_`)
- **PROJECT ID** (project settings → "Project ID" field)

### Step 3: Add GitHub Secrets

1. Go to **GitHub repo** → **Settings** → **Secrets and variables** → **Actions**
2. Add three secrets:
   - **VERCEL_TOKEN** = (paste token from Step 1)
   - **VERCEL_ORG_ID** = (from Step 2)
   - **VERCEL_PROJECT_ID** = (from Step 2)
3. Save

✅ Now every `git push main` will auto-deploy to vivlit.com

---

## Deployment Flow

```
You push to main
    ↓
GitHub Actions: Run CI (type check, build, lint)
    ↓
CI passes ✓
    ↓
GitHub Actions: Deploy to Vercel
    ↓
Vercel builds & serves → https://vivlit.com
    ↓
✅ Live!
```

---

## Monitoring & Rollback

### View Deployment Status

- **GitHub:** Repo → **Actions** tab (see workflow runs)
- **Vercel:** Dashboard → **Deployments** tab (see history)

### Rollback (if needed)

1. **Vercel Dashboard** → **Deployments**
2. Find the previous good deployment
3. Click **"..."** → **"Promote to Production"**

Or revert the git commit:
```bash
git revert <bad-commit-hash>
git push origin main
# Auto-redeploys the previous version
```

---

## Troubleshooting

### "Failed to resolve VITE_SUPABASE_URL"
- Check environment variables are added to Vercel
- Make sure variable names start with `VITE_` (required for Vite)
- Redeploy after adding variables

### "Supabase connection failed"
- Verify Supabase project is running (Vercel dashboard)
- Check ANON key is correct (not secret key)
- Verify migrations were applied
- Check RLS policies allow reads

### "Domain not working"
- DNS changes take 5-10 min (sometimes up to 24h)
- Use `dig vivlit.com` in terminal to verify DNS propagation
- In Vercel, wait for domain to show "Valid" status

### "Build fails on Vercel but works locally"
- Commit `.env.local` is not needed (env vars in Vercel)
- Check Node version mismatch (Vercel defaults to 18, you might be on 20)
- Clear Vercel cache: **Settings** → **Git** → **Clear Build Cache** → redeploy

---

## Next Steps

1. ✅ Create fresh Supabase account
2. ✅ Run migrations on Supabase
3. ✅ Deploy to Vercel
4. ✅ Set custom domain (vivlit.com)
5. ✅ Configure GitHub Actions secrets
6. Test the app: https://vivlit.com
7. Try creating a jar, signing up, all flows
8. Monitor deployments in GitHub Actions & Vercel dashboard

---

## Useful Links

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://docs.github.com/en/actions
- **Vivlit Repo:** https://github.com/vivlitco/MVP1

---

## Support

If you hit issues:
1. Check Vercel deployment logs (Deployments → build log)
2. Check GitHub Actions logs (Actions tab)
3. Check Supabase project health (Dashboard → project overview)
4. Clear cache and redeploy
