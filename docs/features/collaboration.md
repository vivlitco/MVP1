# Collaboration Feature

Allow friends and family to contribute notes to a jar without needing a Vivlit account.

---

## Invite Flow

1. Jar creator enables: `is_collaborative = true`
2. Creator invites contributors (by email)
3. System generates `invite_token` (UUID) for each
4. Creator sends `/contribute/{token}` link to recipient

---

## Contributor Access

| Capability | Allowed |
|---|---|
| Add text notes | ✓ |
| Add image notes | ✓ |
| Add voice notes | ✗ (future) |
| Add links | ✗ (future) |
| See existing notes | ✓ |
| Edit/delete notes | ✗ |
| See contributor list | ✗ |

---

## Data Model

```typescript
interface JarContributor {
  id: uuid,
  jar_id: uuid,
  invite_token: uuid,  // Unique, permanent
  contributor_name?: string,
  contributor_email?: string,
  user_id?: uuid,      // If contributor has signed up
  status: 'pending' | 'accepted',  // Status of invitation
  created_at: timestamptz,
  accepted_at?: timestamptz,
}
```

---

## ContributePage Implementation

```typescript
// /contribute/:token
// 1. Extract token from URL
// 2. Call get_jar_id_by_contributor_token(token)  RPC
// 3. If found, load jar details (preview, theme)
// 4. Show NoteEditor (text + image only)
// 5. On submit, insert to jar_notes with contributor context
```

---

## RLS for Contributors

Contributor token validates access via helper:

```sql
CREATE POLICY "Contributors can add notes"
  ON jar_notes FOR INSERT
  WITH CHECK (
    is_jar_contributor(jar_id, auth.uid())
    OR get_jar_id_by_contributor_token() matches token
  );
```

---

## Future: Multiple Owners

Currently, only the creator owns a jar. Future: `jar_owners` table enables co-ownership.

```typescript
// Not yet used, but schema supports:
interface JarOwner {
  jar_id: uuid,
  user_id: uuid,
  role: 'owner' | 'editor' | 'viewer',
  added_at: timestamptz,
}
```

---

[← Back to README](../README.md)
