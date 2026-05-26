# Row Level Security (RLS) Policies

All tables in Vivlit enforce Row Level Security at the PostgreSQL level. Data isolation is a first-class feature, not an afterthought in the app layer.

---

## Why RLS?

- **Impossible for app bugs to leak data**: Policies are enforced by PostgreSQL, not the app
- **Auditable**: Policies are SQL; easy to review
- **Performance**: Filtering happens at DB level before data leaves the server

---

## Global Policy Rules

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Own profile | User creation only | Own profile | Never |
| `jars` | Own + public + shared | Own user_id | Owner only | Owner only |
| `jar_notes` | Jar is accessible | Jar owner or contributor | Owner | Owner |
| `jar_charms` | Jar is accessible | Jar owner | Owner | Owner |
| `cards` | Own + public | Own user_id | Owner only | Owner only |
| `jar_contributors` | Jar owner only | Jar owner | Jar owner | Jar owner |
| `jar_shares` | Creator only | Creator only | Creator + recipient | Creator only |
| `jar_user_state` | Own row | On first open | Own row | Never |
| `jar_activity` | Jar owner | Automatic (trigger) | Never | Never |
| `ghost_accounts` | Owner only | Automatic | Owner | Owner |

---

## Helper Functions (Used in Policies)

All implemented as PostgreSQL functions. Called from RLS policy WHERE clauses.

```sql
-- Is user the jar owner or creator?
is_jar_owner_or_creator(jar_id UUID, user_id UUID) → BOOLEAN

-- Is user a contributor to this jar?
is_jar_contributor(jar_id UUID, user_id UUID) → BOOLEAN

-- Is jar shared to this user?
is_jar_shared_to_user(jar_id UUID, user_id UUID) → BOOLEAN
```

[See `rpc-functions.md` for full signatures]

---

## Policy Examples

### Jars: SELECT Policy
```sql
CREATE POLICY "Users can view own jars or public jars or shared jars"
  ON jars FOR SELECT
  USING (
    auth.uid() = user_id  -- own jar
    OR share_token IS NOT NULL  -- any jar with a share token is viewable
    OR is_jar_shared_to_user(id, auth.uid())  -- explicit share to user
  );
```

**In English**: You can see jars you own, jars with a share_token (public), or jars explicitly shared to you.

### Jar Notes: INSERT Policy
```sql
CREATE POLICY "Only jar owner or contributor can add notes"
  ON jar_notes FOR INSERT
  WITH CHECK (
    is_jar_owner_or_creator(jar_id, auth.uid())
    OR is_jar_contributor(jar_id, auth.uid())
  );
```

**In English**: You can add notes if you own the jar or are invited as a contributor.

### Jar Shares: SELECT Policy
```sql
CREATE POLICY "Only creator and recipient can view shares"
  ON jar_shares FOR SELECT
  USING (
    auth.uid() = shared_by_user_id  -- creator
    OR auth.uid() = shared_to_user_id  -- recipient
    OR auth.email() = shared_to_email  -- claimed via email
  );
```

**In English**: Only the person who shared and the person it's shared with can see the share record.

---

## Anonymous (Ghost) Access

Ghost jars are inserted with `user_id = NULL` and `ghost_session_id = <uuid>`.

```sql
-- Policy for ghost creators
CREATE POLICY "Ghost users can view own jars via session"
  ON jars FOR SELECT
  USING (
    ghost_session_id = current_setting('app.ghost_session_id')
  );
```

**Setup**: Before query, app calls:
```typescript
await supabase.rpc('set_ghost_session', { session_id: ghostSessionId });
```

---

## Public/Share Token Access

Any jar with a `share_token` is readable by anyone (no auth needed).

```sql
CREATE POLICY "Any jar with a share_token is publicly readable"
  ON jars FOR SELECT
  USING (share_token IS NOT NULL);
```

This allows recipients to view jars without signing in.

---

## Disabling RLS for Testing

**NEVER in production**, but useful for development:

```sql
ALTER TABLE jars DISABLE ROW LEVEL SECURITY;
-- ... test ...
ALTER TABLE jars ENABLE ROW LEVEL SECURITY;
```

Or test a specific policy by making it `USING (true)` temporarily:
```sql
ALTER POLICY "Users can view own jars" ON jars USING (true);
```

---

## Common RLS Debugging

### Symptom: "Policy denied access"
1. Check `auth.uid()` is set (user is authenticated)
2. Check the policy conditions match your row
3. Run the policy SELECT clause separately: `SELECT * FROM jars WHERE auth.uid() = user_id;`

### Symptom: "No rows returned" (when some should exist)
1. Verify the jar exists: `SELECT * FROM jars WHERE id = '...';` (as superuser)
2. Run policy condition: does it evaluate to true?
3. Is the policy enabled? `SELECT polname FROM pg_policies WHERE tablename='jars';`

### Symptom: Ghost user can't see their jar
1. Verify `ghost_session_id` matches what client sent
2. Check `current_setting('app.ghost_session_id')` is set before query
3. If using direct `supabase.from('jars').select()`, ghost session is not automatically set (need RPC)

---

## Best Practices

1. **Always test policies as non-superuser**: Superusers bypass RLS
2. **Include public/guest access explicitly**: Don't assume auth-only
3. **Use helper functions**: Makes policies readable
4. **Log policy denials**: Add monitoring for unexpected 403s
5. **Review before each deploy**: RLS changes are critical

---

[← Back to README](../README.md)
