# Backend Architecture

The Vivlit backend is powered by Supabase: PostgreSQL database, email/password authentication, file storage, and serverless functions (Deno runtime).

---

## Supabase Services

### PostgreSQL Database
**Project ID**: `xkoshoaigdljkeypeslr`

- 11 core tables managing users, jars, notes, cards, sharing, and activity
- Row Level Security (RLS) policies enforce data isolation
- PostgreSQL functions (RPCs) handle sensitive operations (password hashing, account conversion)

**Diagram**:
```
┌──────────────────────────────────────────────────┐
│           PostgreSQL Database                    │
├──────────────────────────────────────────────────┤
│ jars (core) → jar_notes, jar_charms              │
│ cards (standalone)                               │
│ jar_shares, jar_contributors, jar_owners         │
│ jar_user_state (per-user tracking)               │
│ jar_activity (audit log)                         │
│ ghost_accounts (anonymous users)                 │
│ profiles (user metadata)                         │
│ contact_submissions (contact form)               │
└──────────────────────────────────────────────────┘
```

[See `docs/database/schema.md` for full table reference]

### Supabase Auth
**Authentication**: Email / password via Supabase Auth

- User signs up → Supabase creates `auth.users` record
- Supabase sends confirmation email (configured in dashboard)
- On sign-up success, `handle_new_user` trigger creates a `profiles` record
- Session stored in browser as JWT token
- Automatic token refresh handled by Supabase JS client

**Auth flow**:
```
Browser → Supabase Auth → JWT token → localStorage → Auto-refresh
```

[See `docs/deployment/getting-started.md#authentication` for local testing]

### Supabase Storage
**Bucket**: `jar-media` (public read, authenticated write)

- Images uploaded by jar creators: `.jpg`, `.png`
- Voice notes: `.wav`, `.mp3`, `.m4a`, `.ogg`
- File path: `/jar-media/{jar_id}/{uuid}.{ext}`
- Access: public URL for reading, authenticated upload/delete via RLS

```typescript
// Upload
const { data } = await supabase.storage
  .from('jar-media')
  .upload(`${jarId}/${uuid}.jpg`, file);

// Get public URL (no auth needed to view)
const { data } = supabase.storage
  .from('jar-media')
  .getPublicUrl(path);
```

### Edge Functions (Deno)
**Runtime**: Deno (modern JavaScript/TypeScript, no node_modules)

Located at `supabase/functions/`:

| Function | Purpose | Auth | Trigger |
|---|---|---|---|
| `generate-message` | AI message suggestions | No | Client calls via `functions.invoke()` |
| `send-jar-email` | Email jar share link | Yes (Bearer token) | Client calls on share button |
| `send-card-email` | Email card share link | Yes (Bearer token) | Client calls on send card |
| `contact-form` | Store contact submissions | No | Client calls, notifies admin |

[See `docs/api/edge-functions.md` for detailed API specs]

---

## Authentication Patterns

### In React
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, session, loading, signIn, signUp, signOut } = useAuth();

// Sign up
const { error } = await signUp(email, password, fullName);

// Sign in
const { error } = await signIn(email, password);

// Auto-restore session (via AuthContext on mount)
```

### In Edge Functions
```typescript
// Get user from JWT token (passed as Bearer header)
const authHeader = req.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '');

const { data: { user }, error: authError } = await supabase.auth.getUser(token);
if (authError) throw error;

// User ID is now available
const userId = user.id;
```

### In Database (RLS Policies)
```sql
-- Only allow users to see their own jars
CREATE POLICY "Users can view own jars"
  ON jars FOR SELECT
  USING (auth.uid() = user_id OR is_publicly_shared);

-- Only jar owner can insert notes to their jar
CREATE POLICY "Owner can add notes"
  ON jar_notes FOR INSERT
  WITH CHECK (is_jar_owner_or_creator(jar_id, auth.uid()));
```

[See `docs/database/rls-policies.md` for all policies]

---

## Edge Function Architecture

Each function follows this pattern:

```typescript
// 1. Runtime setup
import { Deno } from 'std';
import { createClient } from '@supabase/supabase-js';

// 2. Initialize Supabase client (uses SERVICE_ROLE_KEY for DB access)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

// 3. Export handler
export default async (req: Request) => {
  // Parse body
  const body = await req.json();
  
  // Validate auth (if needed)
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError) return errorResponse(authError.message, 401);
  
  // Do work
  const result = await someFunction(user.id, body);
  
  // Return response with CORS headers
  return Response.json(result, {
    headers: {
      'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN'),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
};
```

### Key Differences from Node.js
- No `process.env` — use `Deno.env.get()`
- No `npm install` — imports from `esm.sh` or `deno.land`
- No CommonJS — all ES modules
- Simpler to test locally: just run with `deno run --env .env index.ts`

---

## External Services

### Resend (Email Delivery)
Used by `send-jar-email` and `send-card-email` functions.

```typescript
import { Resend } from 'https://esm.sh/resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

await resend.emails.send({
  from: 'noreply@vivlit.com',
  to: recipientEmail,
  subject: 'Your Vivlit jar is ready',
  html: renderEmailTemplate({ jarUrl, senderName, personalMessage }),
});
```

- Webhook support: Can receive bounce/complaint events (not currently implemented)
- Rate limits: Resend handles queuing; failures are logged but don't block the request

### Lovable AI Gateway (Google Gemini)
Used by `generate-message` function for AI-powered message suggestions.

```typescript
const response = await fetch('https://api.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}` },
  body: JSON.stringify({
    model: 'google/gemini-3-flash-preview',
    messages: [{ role: 'user', content: prompt }],
    tools: [/* tool definitions */],
  }),
});
```

- Tool-use: Function enforces returning exactly 3 labeled messages
- Rate limits: Returns 429 if quota exceeded; app shows fallback suggestion
- Cost: Metered by Lovable; includes token cost

---

## Database Functions (RPC)

All stored procedures are in PostgreSQL; called from React via `supabase.rpc()`.

| Function | Purpose | Called by |
|---|---|---|
| `claim_shared_jars()` | Claim all jars shared to your email address on login | `Dashboard.tsx` on mount |
| `convert_ghost_account(p_session_id, p_user_id)` | Migrate ghost jars to real account | Auth.tsx after sign-up |
| `hash_jar_password(p_password)` | Bcrypt hash a jar password (pgcrypto) | CreateJar.tsx on submit |
| `verify_jar_password(p_hash, p_password)` | Verify jar password (pgcrypto) | ViewJar.tsx password check |
| `is_jar_owner_or_creator(p_jar_id, p_user_id)` | RLS helper (check jar ownership) | RLS policies |
| `is_jar_contributor(p_jar_id, p_user_id)` | RLS helper (check if user is contributor) | RLS policies |
| `is_jar_shared_to_user(p_jar_id, p_user_id)` | RLS helper (check if jar is shared to user) | RLS policies |
| `get_jar_id_by_contributor_token(p_token)` | Look up jar by invite token | ContributePage.tsx |

[See `docs/database/rpc-functions.md` for signatures and examples]

---

## Configuration

**File**: `supabase/config.toml`

```toml
project_id = "xkoshoaigdljkeypeslr"
region = "[your region]"

[edge_functions]
# All 4 functions have verify_jwt = false
# JWT verification is handled in-function for flexibility
```

**Environment Variables** (set in Supabase dashboard or `.env` file):

| Variable | Where Set | Used by |
|---|---|---|
| `SUPABASE_URL` | `.env.local` (dev), Vercel dashboard (prod) | React client initialization |
| `SUPABASE_PUBLISHABLE_KEY` | `.env.local` (dev), Vercel dashboard (prod) | React client (anon key, safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.test` (local dev) | Edge functions, migrations (secret) |
| `RESEND_API_KEY` | Supabase dashboard (edge function secret) | `send-jar-email`, `send-card-email` functions |
| `APP_ORIGIN` | Supabase dashboard (edge function secret) | CORS headers in edge functions |
| `LOVABLE_API_KEY` | Supabase dashboard (edge function secret) | `generate-message` function |

---

## Deployment Checklist

When deploying to production Supabase:

- [ ] Run all migrations: `supabase db push`
- [ ] Deploy all edge functions: `supabase functions deploy`
- [ ] Set edge function secrets: `supabase secrets set RESEND_API_KEY=...`
- [ ] Verify RLS policies are enabled (not in "testing" mode)
- [ ] Test email delivery with a test account
- [ ] Verify Storage bucket policies allow public reads

[See `docs/deployment/supabase.md` for detailed steps]

---

## Debugging Tips

### Database Queries
- Use Supabase dashboard → SQL Editor to test queries directly
- Check RLS is not blocking: `ALTER POLICY ... USING (true);` to disable temporarily
- Check indexes on frequently queried columns

### Edge Functions
- Local testing: `supabase functions serve` then call with `curl -H "Authorization: Bearer $TOKEN"`
- Check logs: Supabase dashboard → Edge Functions → Logs
- Common issues: Missing env vars, CORS headers missing, JWT verification failing

### Authentication
- Check JWT in Supabase dashboard → Auth → Users
- Verify email confirmation is enabled or disabled as intended
- Check `auth.users` row exists when debugging signup issues

---

[← Back to README](../README.md)
