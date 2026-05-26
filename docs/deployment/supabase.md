# Supabase Deployment

Manage the Vivlit backend: PostgreSQL database, edge functions, storage.

---

## Project Setup

**Project ID**: `xkoshoaigdljkeypeslr`

Go to https://app.supabase.com → Select your project.

---

## Running Migrations

Migrations are SQL files that set up the database schema.

### Production Database
If deploying to a new Supabase project:

1. Backup existing migrations: `supabase db pull`
2. Run migrations:
   ```bash
   supabase db push
   ```
3. Verify tables exist: Supabase Dashboard → SQL Editor

### Alternative: Manual SQL
1. Go to Supabase Dashboard → SQL Editor
2. Paste `supabase/combined_schema.sql` or individual migration files
3. Execute

---

## Edge Functions

### Deploy All Functions
```bash
supabase functions deploy
# or individual:
supabase functions deploy send-jar-email
supabase functions deploy generate-message
supabase functions deploy contact-form
```

### Check Deployment
Supabase Dashboard → Edge Functions → Select function → Logs tab

### Local Testing
```bash
supabase functions serve
# In another terminal:
curl -X POST http://localhost:54321/functions/v1/contact-form \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Test"}'
```

---

## Edge Function Secrets

Set in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```bash
# Via CLI (if authenticated):
supabase secrets set RESEND_API_KEY=re_xyz...
supabase secrets set APP_ORIGIN=https://vivlit.com
supabase secrets set LOVABLE_API_KEY=sk_...
```

Or manually in dashboard. Restart functions after setting:
```bash
supabase functions deploy
```

---

## Row Level Security

All tables have RLS enabled. To check:

Supabase Dashboard → SQL Editor:
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

**All should show `t` (true) for rowsecurity**.

If RLS is OFF (for testing only):
```sql
ALTER TABLE jars ENABLE ROW LEVEL SECURITY;
```

---

## Storage Bucket

Bucket name: `jar-media`

### Policies

**Public Read**:
```sql
CREATE POLICY "Public Read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'jar-media');
```

**Authenticated Write**:
```sql
CREATE POLICY "Authenticated Write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'jar-media'
    AND auth.role() = 'authenticated'
  );
```

### Verify
Supabase Dashboard → Storage → jar-media → Policies tab

---

## Backups

Supabase automatically backs up daily. To export manually:

```bash
# Dump database
pg_dump postgresql://user:password@host/database > backup.sql
```

Or via Supabase dashboard: Project Settings → Backups → Download.

---

## Monitoring

### Logs
- **Database**: Supabase Dashboard → Logs (pg_stat_statements)
- **Edge Functions**: Supabase Dashboard → Edge Functions → Logs tab

### Disk Usage
Supabase Dashboard → Project Settings → Storage → View usage

### Auth Issues
Supabase Dashboard → Auth → Users → Click user → Check status

---

## Troubleshooting

### RLS blocking queries (403 Forbidden)
1. Check RLS is enabled
2. Check policy conditions in SQL Editor
3. Verify `auth.uid()` is set (user is authenticated)
4. Test policy: `SELECT * FROM jars WHERE auth.uid() = user_id;`

### Edge function logs show errors
1. Check function secret env vars are set
2. Check Bearer token is valid (if auth required)
3. Re-deploy: `supabase functions deploy function-name`

### Email not sending (but function succeeds)
1. Check RESEND_API_KEY in secrets
2. Check Resend dashboard for bounces
3. Verify recipient email is valid

---

## Database Maintenance

### Analyze Query Performance
```sql
EXPLAIN ANALYZE
SELECT * FROM jars WHERE user_id = '...';
```

### Create Index (if slow queries)
```sql
CREATE INDEX idx_jars_user_id ON jars(user_id);
```

### Check Index Usage
```sql
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';
```

---

[← Back to README](../README.md)
