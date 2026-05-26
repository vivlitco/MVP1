# Vercel Deployment

Deploy the Vivlit frontend to Vercel's global CDN.

---

## Setup

### 1. GitHub Connection
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import Git repository
4. Select branch (usually `main`)
5. Click "Deploy"

### 2. Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

### 3. CI/CD Triggers
- Every push to `main` automatically triggers deployment
- Every PR gets a preview deployment (accessible via PR comment)

---

## Build Configuration

**File**: `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/",
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ]
}
```

**Explanation**:
- Build: Run Vite production build
- Output: Vercel serves files from `dist/`
- Rewrites: All routes → `index.html` (SPA rewrite)

---

## Caching Headers

```json
{
  "headers": [
    {
      "source": "/assets/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, no-cache, must-revalidate"
        }
      ]
    }
  ]
}
```

- **Assets** (images, fonts): 1 year immutable cache
- **Everything else**: No cache (app JS might change)

---

## Domain Setup

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add custom domain
3. Update DNS records (Vercel shows instructions)
4. Wait for verification (usually < 5 minutes)

### DNS Records
Vercel will ask you to point:
- `vivlit.com` → CNAME to `cname.vercel-dns.com`
- `www.vivlit.com` → CNAME to `cname.vercel-dns.com`

---

## Deployments

### Manual Deployment
```bash
vercel deploy --prod
```

### Automatic Deploys
Every commit to `main` auto-deploys (via GitHub webhook).

### Preview Deployments
Every PR gets a unique preview URL (shown in PR comment).

---

## Analytics

Enable in Vercel Dashboard → Project Settings → Analytics:
- **Web Analytics**: User page views, performance data
- **Speed Insights**: Core Web Vitals (LCP, FID, CLS)

Both are already imported in `src/App.tsx`:
```typescript
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
```

---

## Troubleshooting

### Build fails: `VITE_SUPABASE_URL is missing`
- Add env vars in Vercel Dashboard
- Redeploy: click "Redeploy" on deployment page

### Site shows 404
- Check `vercel.json` has SPA rewrite rule
- Redeploy

### Slow first load
- Check Speed Insights dashboard
- Consider code splitting (future optimization)

---

[← Back to README](../README.md)
