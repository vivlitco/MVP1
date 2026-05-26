# Ghost Sessions (Anonymous Users)

Allow users to create jars and cards without signing up first.

---

## Why Ghost Sessions?

- **Lower friction**: Create first, sign up later
- **Preservation**: User's work is kept if they decide to sign up
- **User agency**: Explore the product before committing

---

## How It Works

### 1. First Visit
```typescript
// src/hooks/useGhostSession.ts
const useGhostSession = () => {
  const [ghostSessionId] = useState(() => {
    // Check localStorage for existing session
    let sessionId = localStorage.getItem('vivlit_ghost_session');
    
    if (!sessionId) {
      // Generate new session
      sessionId = crypto.randomUUID();
      localStorage.setItem('vivlit_ghost_session', sessionId);
      
      // Create ghost account record
      supabase.from('ghost_accounts').insert({
        session_id: sessionId,
        jar_ids: [],
        card_ids: [],
      });
    }
    
    return sessionId;
  });
  
  return { ghostSessionId, isGhost: !!ghostSessionId && !user };
};
```

### 2. Create Jar (No Auth)
```typescript
// CreateJar inserts with ghost_session_id, NOT user_id
await supabase.from('jars').insert({
  ghost_session_id: ghostSessionId,
  user_id: null,  // No user yet
  name: 'My Jar of Notes',
  // ... other fields
});
```

### 3. User Signs Up
```typescript
// Auth.tsx
const { error } = await signUp(email, password, fullName);

// After successful signup, convert ghost account
const ghostSessionId = localStorage.getItem('vivlit_ghost_session');
const { data: { jars_converted } } = await supabase.rpc(
  'convert_ghost_account',
  { session_id: ghostSessionId, user_id: newUserId }
);

console.log(`Migrated ${jars_converted} ghost jars`);
```

### 4. RPC Conversion
```sql
FUNCTION convert_ghost_account(p_session_id TEXT, p_user_id UUID)
  -- Find all jars with ghost_session_id = p_session_id
  -- UPDATE them: set user_id = p_user_id, ghost_session_id = NULL
  -- Do same for cards
  -- DELETE ghost_accounts row
  -- RETURN jars_converted, cards_converted
```

---

## Data Model

```typescript
interface GhostAccount {
  id: uuid,
  session_id: text,          // crypto.randomUUID()
  jar_ids: uuid[],           // Array of jar IDs created
  card_ids: uuid[],          // Array of card IDs created
  converted_at?: timestamptz, // When account was claimed
  converted_to_user_id?: uuid, // Real user ID after conversion
  created_at: timestamptz,
}
```

---

## RLS Access for Ghosts

Jars with `ghost_session_id` are accessed via `current_setting('app.ghost_session_id')`:

```sql
CREATE POLICY "Ghost users can view own jars"
  ON jars FOR SELECT
  USING (
    ghost_session_id = current_setting('app.ghost_session_id')
  );
```

Before querying as ghost, app calls:
```typescript
await supabase.rpc('set_ghost_session', { session_id: ghostSessionId });
// Now RLS will allow SELECT based on session_id
```

---

## Limitations (by Design)

Ghost users cannot:
- [ ] Set jar password (requires account for security)
- [ ] Set jar unlock date (requires account for scheduling)
- [ ] Share jars (requires verified identity)
- [ ] See "Shared with me" tab
- [ ] Delete account (no account to delete)

After sign-up, all restrictions lift.

---

## localStorage Key

`vivlit_ghost_session` — unique per browser

Clear it with:
```typescript
localStorage.removeItem('vivlit_ghost_session');
```

---

[← Back to README](../README.md)
