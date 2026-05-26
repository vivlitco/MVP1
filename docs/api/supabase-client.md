# Supabase Client

Patterns for querying the Supabase PostgreSQL database from React.

---

## Client Setup

**File**: `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
);
```

**Config**:
- `storage: localStorage` — persist session across page reloads
- `autoRefreshToken: true` — refresh JWT before expiry
- `flowType: 'pkce'` — secure flow for public clients (SPAs)

---

## SELECT Queries

### Single Row
```typescript
const { data: jar, error } = await supabase
  .from('jars')
  .select()
  .eq('id', jarId)
  .single();  // Expects one row; errors if zero or many

if (error) console.error(error);
else console.log(jar);  // Type: Jar | null
```

### Multiple Rows
```typescript
const { data: jars, error } = await supabase
  .from('jars')
  .select()
  .eq('user_id', userId);

// Returns: Jar[]
```

### With Relations
```typescript
const { data: jars, error } = await supabase
  .from('jars')
  .select('*, jar_notes(*), jar_charms(*)');  // Wildcard expands relations

// Returns: Jar[] with notes and charms nested
```

### Count
```typescript
const { count, error } = await supabase
  .from('jars')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);

// Returns: count (number), no data rows
```

### Ordering & Limiting
```typescript
const { data: recent } = await supabase
  .from('jars')
  .select()
  .order('created_at', { ascending: false })
  .limit(10);

// Returns: 10 most recent jars
```

---

## INSERT Queries

### Single Row
```typescript
const { data: newJar, error } = await supabase
  .from('jars')
  .insert({
    user_id: userId,
    name: 'My Jar',
    theme: 'warm',
    share_token: crypto.randomUUID(),
  })
  .select()
  .single();
```

### Multiple Rows
```typescript
const { data: notes, error } = await supabase
  .from('jar_notes')
  .insert([
    { jar_id: jarId, content: 'Note 1', note_order: 0 },
    { jar_id: jarId, content: 'Note 2', note_order: 1 },
  ])
  .select();
```

---

## UPDATE Queries

### By ID
```typescript
const { data: updated, error } = await supabase
  .from('jars')
  .update({ name: 'New Name' })
  .eq('id', jarId)
  .select()
  .single();
```

### Upsert (Insert or Update)
```typescript
const { data, error } = await supabase
  .from('jar_user_state')
  .upsert({
    jar_id: jarId,
    user_id: userId,
    notes_opened_today: 1,
    last_opened_date: new Date().toDateString(),
  }, {
    onConflict: 'jar_id,user_id',  // Match on these columns
  })
  .select()
  .single();
```

---

## DELETE Queries

```typescript
const { error } = await supabase
  .from('jars')
  .delete()
  .eq('id', jarId);

if (error) console.error('Failed to delete:', error);
```

---

## Authentication

### Check Auth Status
```typescript
const { data: { user }, error } = await supabase.auth.getUser();

if (user) {
  console.log(`Authenticated as ${user.email}`);
  console.log(`User ID: ${user.id}`);
  console.log(`Metadata:`, user.user_metadata);  // full_name from signup
}
```

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName },  // Stored in user_metadata
  },
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (!error) {
  const { access_token, refresh_token } = data.session;
  // Auto-stored in localStorage by client config
}
```

### Sign Out
```typescript
await supabase.auth.signOut();
// Clears localStorage
```

---

## File Upload / Storage

### Upload
```typescript
const file = inputRef.current.files?.[0];

const { data: uploaded, error } = await supabase.storage
  .from('jar-media')
  .upload(`${jarId}/${uuid}.jpg`, file, {
    contentType: 'image/jpeg',
    upsert: false,  // Fail if already exists
  });

if (!error) {
  const publicUrl = supabase.storage
    .from('jar-media')
    .getPublicUrl(uploaded.path).data.publicUrl;
  
  // Store publicUrl in jar_notes.media_url
}
```

### Delete
```typescript
const { error } = await supabase.storage
  .from('jar-media')
  .remove([`${jarId}/${fileName}`]);
```

---

## RPC Calls

### With Parameters
```typescript
const { data: hash, error } = await supabase.rpc(
  'hash_jar_password',
  { password: userPassword }
);

// Returns: password hash (bcrypt)
```

### Returning Rows
```typescript
const { data: newJars, error } = await supabase.rpc(
  'convert_ghost_account',
  { session_id: ghostSessionId, user_id: userId }
);

// Returns: { jars_converted: number, cards_converted: number }
```

---

## Error Handling

```typescript
const { data, error } = await supabase.from('jars').select();

if (error) {
  if (error.code === 'PGRST302') {
    // No rows found
  } else if (error.code === 'PGRST116') {
    // Constraint violation
  } else {
    // Other error
    console.error(error.message);
  }
} else {
  // Success
}
```

---

## Types

Auto-generated from database schema. Import from `types.ts`:

```typescript
import type { Jar, JarNote, Card } from '@/integrations/supabase/types';

const myJar: Jar = {
  id: '...',
  user_id: '...',
  name: 'My Jar',
  // ... all fields typed
};
```

---

[← Back to README](../README.md)
