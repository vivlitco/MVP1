# Vivlit CI/CD Pipeline Setup Guide

## Overview

This project uses **GitHub Actions** to automate builds, tests, and deployments.

### Workflows Included

1. **CI** (`.github/workflows/ci.yml`)
   - Runs on: Pull requests + pushes to `main` and `develop`
   - Checks: TypeScript type safety, build, linting
   - Status: Required for PRs to merge

2. **Deploy** (`.github/workflows/deploy.yml`)
   - Runs on: Pushes to `main` (after merge)
   - Action: Triggers Render deployment webhook
   - Deploys to: vivlit.com (production)

---

## Setup Instructions

### Step 1: Get Your Render Deploy Hook

A **Deploy Hook** is a secret URL that triggers a build when called via HTTP.

1. Go to **[Render Dashboard](https://dashboard.render.com)**
2. Select your **Static Site** (vivlit)
3. Click **Settings** → **Deploy** tab
4. Scroll down to **Deploy Hook**
5. Copy the URL (looks like: `https://api.render.com/deploy/srv-...`)

### Step 2: Add Deploy Hook to GitHub Secrets

1. Go to **GitHub repo** → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. **Name:** `RENDER_DEPLOY_HOOK`
4. **Value:** Paste the Render Deploy Hook URL
5. Click **Add secret**

✅ Now when you push to `main`, GitHub Actions will automatically trigger a Render deploy!

---

## How It Works

### Pull Requests
```
You open PR → GitHub Actions runs CI → Shows ✅ or ❌ status
```

**What runs:**
- `npm ci` — install locked dependencies
- `npx tsc --noEmit` — TypeScript type check
- `npm run build` — build the app
- `npm run lint` — check code style

**On failure:** PR shows ❌ and blocks merge. Fix the issue and push again.

### Merging to Main
```
You merge PR to main → CI passes → Deploy workflow triggers → Render builds → vivlit.com updates
```

**What happens:**
1. Full CI suite runs again (type check + build)
2. If all pass → Deploy Hook called
3. Render detects the webhook → runs `npm ci && npm run build`
4. Render publishes `dist/` → live on vivlit.com
5. Typically live in 2-5 minutes

---

## Local Development

### Before opening a PR, run locally:

```bash
# Type check
npm tsc --noEmit

# Build (verify it works)
npm run build

# Lint
npm run lint

# Dev server
npm run dev
```

This catches issues before CI, faster feedback loop.

---

## Monitoring Deployments

### Real-time status:

1. **GitHub:** Go to repo → **Actions** tab
   - See all workflow runs
   - Click run to view logs
   - Troubleshoot failures

2. **Render:** Go to dashboard → **vivlit** service
   - View build logs
   - Rollback if needed (previous deploys tab)
   - Manual redeploy button (if CI fails but you want to push)

---

## Troubleshooting

### "Deploy Hook" failed / 404

**Problem:** Secret not set or wrong URL  
**Fix:** Re-check `RENDER_DEPLOY_HOOK` secret in GitHub Settings

### Build fails on CI but works locally

**Common cause:** Missing environment variables  
**Fix:** CI uses dummy Supabase values (for type checking only). Real secrets are in Render env vars, not GitHub.

### Render shows "No changes" after deploy

**Problem:** GitHub pushed the same code  
**Fix:** Render only redeploys if code changed. Make a small commit to trigger.

### Want to deploy without merging to main?

**Option:** Tag-based deploy  
Create a tag: `git tag release-1.0.0` → Push → Workflows can listen to `tags: ['release-*']`

---

## Best Practices

✅ **Do:**
- Write commit messages clearly (helps review)
- Run CI checks locally before pushing
- Review GitHub Actions logs for errors
- Use feature branches for development
- Merge via PR (not direct push to main)

❌ **Don't:**
- Bypass CI checks (don't disable workflows)
- Push secrets to GitHub (use Secrets feature)
- Commit env files (.env, .env.local)
- Force push to main (breaks history)

---

## Future Enhancements

Ideas for expanding CI/CD:

1. **Testing** — Add `npm test` → unit/integration tests on every PR
2. **E2E Tests** — Test live Supabase migrations before deploy
3. **Performance** — Track bundle size changes
4. **Security** — Dependency scanning (Dependabot)
5. **Staging Deploy** — Auto-deploy PRs to a staging Render service
6. **Notifications** — Slack/email alerts on deploy success/failure
7. **Database Migrations** — Auto-apply Supabase migrations on deploy

---

## Questions?

- **GitHub Actions docs:** https://docs.github.com/en/actions
- **Render Deploy Hooks:** https://render.com/docs/deploy-hooks
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
