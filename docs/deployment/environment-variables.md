# Environment Variables

All configuration is managed via environment variables. No hardcoded secrets.

---

## Development (`.env.local`)

Create `.env.local` in root directory:

```env
# Required: Supabase project credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# Optional: For local Supabase testing
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get from**: Supabase Dashboard → Project Settings → API → Copy URLs and Keys

---

## Production (Vercel Dashboard)

Set these in Vercel → Project Settings → Environment Variables:

| Variable | Value | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbcD...` | Public anon key (safe to expose) |

---

## Edge Function Secrets (Supabase Dashboard)

Set in Supabase → Project Settings → Edge Functions → Secrets:

| Secret | Where to Get | Used by |
|---|---|---|
| `RESEND_API_KEY` | Resend Dashboard → API Keys | `send-jar-email`, `send-card-email` |
| `APP_ORIGIN` | Your domain (e.g., `https://vivlit.com`) | CORS headers in all functions |
| `LOVABLE_API_KEY` | Lovable AI Gateway | `generate-message` function |

---

## Client-Side vs Server-Side

### Client-Side (Embedded in Bundle)
Variables starting with `VITE_` are embedded in the JavaScript bundle (safe for public):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

These are visible in browser source code. Never put secrets here.

### Server-Side (Edge Functions Only)
Set in Supabase dashboard secrets (not in `.env`):
- `RESEND_API_KEY`
- `LOVABLE_API_KEY`
- `APP_ORIGIN`

Edge functions access via: `Deno.env.get('RESEND_API_KEY')`

---

## Security Notes

1. **Never commit `.env.local`** — it's in `.gitignore`
2. **Never put secrets in `VITE_*` variables** — they're embedded in the bundle
3. **Rotate keys regularly** — especially RESEND_API_KEY
4. **Use Vercel's GitHub integration** — no need to manually set env vars for each deploy

---

## Troubleshooting

### Missing `VITE_SUPABASE_URL`
```bash
npm run dev
# Error: VITE_SUPABASE_URL is missing

# Solution: Check .env.local exists and has correct key name
cat .env.local | grep VITE_SUPABASE_URL
```

### Email not sending (production)
- Check RESEND_API_KEY is set in Supabase dashboard
- Check APP_ORIGIN matches your domain
- Check Supabase edge functions are deployed: `supabase functions deploy`

---

[← Back to README](../README.md)
