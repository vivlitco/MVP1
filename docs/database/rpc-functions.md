# PostgreSQL RPC Functions

All stored procedures callable from the React app via `supabase.rpc()`.

---

## RLS Helper Functions

### `is_jar_owner_or_creator(jar_id, user_id)`
Check if user is jar owner.

```sql
FUNCTION is_jar_owner_or_creator(jar_id UUID, user_id UUID) RETURNS BOOLEAN
  -- Returns true if user_id created the jar or is listed in jar_owners
```

**Usage in policy**:
```sql
WITH CHECK (is_jar_owner_or_creator(jar_id, auth.uid()))
```

**From React**: Not called directly (used in RLS policies).

---

### `is_jar_contributor(jar_id, user_id)`
Check if user is invited contributor.

```sql
FUNCTION is_jar_contributor(jar_id UUID, user_id UUID) RETURNS BOOLEAN
  -- Returns true if user_id is in jar_contributors with accepted status
```

**Usage in policy**:
```sql
USING (is_jar_contributor(jar_id, auth.uid()))
```

---

### `is_jar_shared_to_user(jar_id, user_id)`
Check if jar is explicitly shared to user.

```sql
FUNCTION is_jar_shared_to_user(jar_id UUID, user_id UUID) RETURNS BOOLEAN
  -- Returns true if user_id is in jar_shares (accepted or email-matched)
```

---

## Password Handling (bcrypt via pgcrypto)

### `hash_jar_password(password)`
Hash a password (one-way).

```sql
FUNCTION hash_jar_password(password TEXT) RETURNS TEXT
```

**Called from**: CreateJar when user sets password

```typescript
const { data: { hash }, error } = await supabase.rpc(
  'hash_jar_password',
  { password: userPassword }
);
// hash is bcrypt hash, store in jars.password_hash
```

### `verify_jar_password(hash, password)`
Verify a password against bcrypt hash.

```sql
FUNCTION verify_jar_password(hash TEXT, password TEXT) RETURNS BOOLEAN
```

**Called from**: ViewJar when jar is password-protected

```typescript
const { data: isCorrect, error } = await supabase.rpc(
  'verify_jar_password',
  { hash: jar.password_hash, password: userInput }
);

if (isCorrect) {
  // Show jar content
}
```

---

## Guest Conversion

### `convert_ghost_account(session_id, user_id)`
Migrate all ghost jars/cards to a real account.

```sql
FUNCTION convert_ghost_account(
  p_session_id TEXT,
  p_user_id UUID
) RETURNS TABLE(jars_converted INT, cards_converted INT)
```

**Atomically**:
1. Find all jars with `ghost_session_id = p_session_id`
2. Set their `user_id = p_user_id`
3. Find all cards with same ghost session
4. Set their `user_id = p_user_id`
5. Delete the ghost_accounts row
6. Return count of migrated records

**Called from**: AuthContext after signup

```typescript
const { data: { jars_converted, cards_converted }, error } = await supabase.rpc(
  'convert_ghost_account',
  { session_id: ghostSessionId, user_id: newUserId }
);

console.log(`Converted ${jars_converted} jars and ${cards_converted} cards`);
```

---

## Contributor Token Lookup

### `get_jar_id_by_contributor_token(token)`
Find a jar by invite token.

```sql
FUNCTION get_jar_id_by_contributor_token(p_token UUID) RETURNS UUID
```

**Called from**: ContributePage when loading `/contribute/:token`

```typescript
const { data: jarId, error } = await supabase.rpc(
  'get_jar_id_by_contributor_token',
  { p_token: tokenFromURL }
);

// If found, jarId is the ID; if not found, error or null
```

---

## Sharing & Claim

### `claim_shared_jars()`
Claim all jars shared to your email address (SECURITY DEFINER).

```sql
FUNCTION claim_shared_jars()
  RETURNS TABLE(claimed_count INT)
  SECURITY DEFINER
  SET search_path = public
```

**Important**: Runs as function owner, not the calling user. Allows email-based claiming without user needing to own the share record.

**Called from**: Dashboard on mount

```typescript
const { data: { claimed_count }, error } = await supabase.rpc('claim_shared_jars');

// claimed_count = number of shares claimed
```

**What it does**:
1. Find all jar_shares where `shared_to_email = auth.email()` and `shared_to_user_id IS NULL`
2. Set `shared_to_user_id = auth.uid()` and `accepted_at = NOW()`
3. Return count of claimed shares

---

## Usage Pattern

All RPC calls follow this pattern:

```typescript
const { data, error } = await supabase.rpc('function_name', {
  param1: value1,
  param2: value2,
});

if (error) {
  console.error('RPC error:', error);
  // Handle error
} else {
  console.log('Result:', data);
}
```

---

## Permissions

All RPCs are callable by:
- **Authenticated users** with proper permissions
- **Anonymous users** (if policy allows) - only guest conversion functions

Example: `claim_shared_jars()` can only be called by authenticated users (checks `auth.uid()` internally).

---

[← Back to README](../README.md)
