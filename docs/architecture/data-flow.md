# Data Flow Diagrams

This document traces how data moves through the system for each major feature.

---

## 1. Creating a Jar (Authenticated User)

```
┌────────────────────────────────────────────────────────────────┐
│ Browser: CreateJar.tsx                                          │
├────────────────────────────────────────────────────────────────┤
│ User fills form:                                                 │
│ - Theme (dropdown)                                              │
│ - Notes (text, image, voice, link via NoteEditor)               │
│ - Charms (via CharmsPalette)                                    │
│ - Settings (password, unlock date, collaborative mode)          │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Upload media to Storage
┌────────────────────────────────────────────────────────────────┐
│ Supabase Storage: jar-media bucket                             │
├────────────────────────────────────────────────────────────────┤
│ - Image: POST /jar-media/{jar_id}/{uuid}.jpg                   │
│ - Voice: POST /jar-media/{jar_id}/{uuid}.m4a                   │
│ Returns: media_url (public URL)                                │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Insert jar + notes
┌────────────────────────────────────────────────────────────────┐
│ Supabase PostgreSQL: jars table                                │
├────────────────────────────────────────────────────────────────┤
│ INSERT INTO jars (user_id, name, theme, share_token, ...) →  │
│ - share_token generated (UUID)                                │
│ - password_hash computed via hash_jar_password() RPC          │
│ - user_id = auth.uid() (from JWT)                            │
│ - is_collaborative = checkbox from form                       │
│ RLS policy checks: auth.uid() matches user_id ✓              │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Insert notes under jar
┌────────────────────────────────────────────────────────────────┐
│ Supabase PostgreSQL: jar_notes table                           │
├────────────────────────────────────────────────────────────────┤
│ INSERT INTO jar_notes (jar_id, content, content_type, media_url) │
│ - One row per note                                             │
│ - content = text (if note is text) or NULL                    │
│ - media_url = Storage URL (if image/voice)                    │
│ - content_type ∈ {text, image, voice, link}                   │
│ RLS: is_jar_owner_or_creator() must be true ✓                │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Insert charms under jar
┌────────────────────────────────────────────────────────────────┐
│ Supabase PostgreSQL: jar_charms table                          │
├────────────────────────────────────────────────────────────────┤
│ INSERT INTO jar_charms (jar_id, charm_type, position_x, ...) │
│ - One row per charm                                           │
│ - Position is percentage-based (0-100)                       │
│ RLS: is_jar_owner_or_creator() must be true ✓               │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Return to React
┌────────────────────────────────────────────────────────────────┐
│ Browser: React state updated                                   │
├────────────────────────────────────────────────────────────────┤
│ - setCreatedJarId(response.id)                                │
│ - Navigate to /dashboard                                     │
│ - Show "Jar created!" toast                                  │
└────────────────────────────────────────────────────────────────┘
```

**Key RLS checks**:
- User can insert to jars only if inserting with their own `user_id`
- User can insert notes only to jars they own or created
- User can insert charms only to jars they own

---

## 2. Sharing a Jar (Sending Email)

```
┌────────────────────────────────────────────────────────────────┐
│ Browser: ViewJar or Dashboard (Share button)                  │
├────────────────────────────────────────────────────────────────┤
│ User clicks "Share" → ShareDialog                             │
│ - Recipient email (optional)                                 │
│ - Personal message (optional)                                │
│ Calls: functions.invoke('send-jar-email', { jarId, ... })    │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Call Edge Function
┌────────────────────────────────────────────────────────────────┐
│ Supabase Edge Function: send-jar-email                        │
├────────────────────────────────────────────────────────────────┤
│ 1. Extract Bearer token from Authorization header             │
│ 2. Call supabase.auth.getUser(token) → user.id              │
│ 3. Query: SELECT * FROM jars WHERE id = jarId               │
│ 4. RLS check: is_jar_owner_or_creator(jarId, user.id)       │
│ 5. If not owner → return 403 Forbidden                       │
│ 6. Call Resend API: Send email with /jar/:share_token URL   │
│ 7. Log: INSERT INTO jar_activity (..., activity_type='email_shared')
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Resend Email Service
┌────────────────────────────────────────────────────────────────┐
│ Resend: Transactional Email                                   │
├────────────────────────────────────────────────────────────────┤
│ - From: noreply@vivlit.com                                    │
│ - To: recipient_email                                        │
│ - Subject: "You have a Vivlit jar waiting"                   │
│ - Body: HTML template with /jar/:share_token button          │
│ - Queues asynchronously                                      │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Recipient Receives Email
┌────────────────────────────────────────────────────────────────┐
│ Recipient's inbox                                              │
├────────────────────────────────────────────────────────────────┤
│ - Clicks link: https://vivlit.com/jar/:share_token           │
│ - Browser navigates to ViewJar.tsx                           │
└────────────────────────────────────────────────────────────────┘
```

**Error handling**:
- If Resend fails → Email is logged but not re-queued (recipient can still access jar via link)
- If user is not jar owner → Returns 403 (RLS prevents unauthorized access)
- If jar doesn't exist → Returns 404

---

## 3. Opening a Jar (Recipient View)

```
┌────────────────────────────────────────────────────────────────┐
│ Browser: ViewJar.tsx (/jar/:token)                            │
├────────────────────────────────────────────────────────────────┤
│ 1. Extract token from URL params                              │
│ 2. Call: supabase.from('jars').select().eq('share_token', token)
│ 3. Returns: Jar record (or 404 if not found)                 │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Access Gates (Sequential)
┌────────────────────────────────────────────────────────────────┐
│ Gate 1: Login Requirement Check                               │
├────────────────────────────────────────────────────────────────┤
│ if (jar.is_private && !user) → Show "Sign in to view"        │
│ else → Continue to Gate 2                                    │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ Gate 2: Password Lock (if jar.is_password_protected)          │
├────────────────────────────────────────────────────────────────┤
│ if (jar.password_hash) {                                      │
│   user enters password                                        │
│   call verify_jar_password(password_hash, input)  RPC         │
│   if correct → continue; if wrong → show error               │
│ }                                                             │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ Gate 3: Time Lock (if jar.unlock_date in future)             │
├────────────────────────────────────────────────────────────────┤
│ if (new Date() < jar.unlock_date) {                          │
│   show CountdownTimer                                        │
│   show "Check back on [date]"                               │
│ } else {                                                      │
│   continue to view                                          │
│ }                                                             │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Load Notes & Render
┌────────────────────────────────────────────────────────────────┐
│ Supabase: Query jar_notes for this jar                        │
├────────────────────────────────────────────────────────────────┤
│ SELECT * FROM jar_notes WHERE jar_id = ? ORDER BY note_order │
│ Returns: Array of notes with content, media_url              │
│ RLS: Public access (no policy restricts reads if jar is public)
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ Render Based on open_mode                                      │
├────────────────────────────────────────────────────────────────┤
│ if (open_mode === 'daily') {                                 │
│   - Show only 1 note per day                                │
│   - Check jar_user_state: last_opened_date                 │
│   - If opened today → increment notes_opened_today         │
│   - Hide remaining notes (reveal tomorrow)                 │
│ }                                                             │
│                                                               │
│ if (open_mode === 'unlimited') {                             │
│   - Show all notes immediately                              │
│ }                                                             │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Track User State
┌────────────────────────────────────────────────────────────────┐
│ Supabase: jar_user_state table                               │
├────────────────────────────────────────────────────────────────┤
│ On first open today:                                         │
│   INSERT or UPDATE jar_user_state (                         │
│     jar_id, user_id/session_id, last_opened_date = TODAY   │
│   )                                                           │
│ Prevents double-opening in a 24-hour period                │
└────────────────────────────────────────────────────────────────┘
```

**Rendering notes by type**:
- **Text**: `<blockquote>{content}</blockquote>` (styled italics)
- **Image**: `<img src={media_url} alt="..." />`
- **Voice**: `<audio src={media_url} controls />`
- **Link**: `<a href={validated_url}>{content}</a>` (only http/https allowed)

---

## 4. Ghost Account Conversion

```
┌────────────────────────────────────────────────────────────────┐
│ Browser: Anonymous user creates jar                           │
├────────────────────────────────────────────────────────────────┤
│ useGhostSession() generates sessionId = crypto.randomUUID() │
│ localStorage['vivlit_ghost_session'] = sessionId            │
│ CreateJar inserts jar with:                                 │
│   - user_id = '00000000-0000-0000-0000-000000000000' (nil)  │
│   - ghost_session_id = sessionId                           │
│ Jar is now stored under ghost account                      │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    User Signs Up
┌────────────────────────────────────────────────────────────────┐
│ Auth.tsx: User clicks "Create account"                        │
├────────────────────────────────────────────────────────────────┤
│ 1. Calls signUp(email, password, fullName)                   │
│ 2. Supabase creates auth.users row + profiles row            │
│ 3. Profile.tsx useEffect detects !loading && user           │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Convert Ghost Account
┌────────────────────────────────────────────────────────────────┐
│ Dashboard.tsx or AuthContext: Call conversion RPC             │
├────────────────────────────────────────────────────────────────┤
│ SELECT convert_ghost_account(sessionId, newUserId)           │
│ RPC does:                                                    │
│   1. Find all jars with ghost_session_id = sessionId        │
│   2. UPDATE each jar SET user_id = newUserId               │
│   3. DELETE ghost_accounts row                             │
│ Jars now belong to the authenticated user                  │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Jars Visible in Dashboard
┌────────────────────────────────────────────────────────────────┐
│ Dashboard.tsx: Refetch user's jars                           │
├────────────────────────────────────────────────────────────────┤
│ SELECT * FROM jars WHERE user_id = auth.uid()              │
│ Now includes formerly ghost jars ✓                         │
└────────────────────────────────────────────────────────────────┘
```

**Why this works**:
- Ghost jars start with a nil `user_id`
- RLS allows authenticated users to see/edit jars with their own `user_id`
- On conversion, all ghost jars get the user's real `user_id`
- No data is lost; just a simple UPDATE

---

## 5. Collaborative Contribution

```
┌────────────────────────────────────────────────────────────────┐
│ Jar Creator: Enable Collaboration                             │
├────────────────────────────────────────────────────────────────┤
│ CreateJar.tsx: Toggle "Allow others to add notes"             │
│ - Sets is_collaborative = true                               │
│ - Generates invite_token (UUID)                              │
│ - Copy link: /contribute/:invite_token                       │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ Supabase: jar_contributors table                             │
├────────────────────────────────────────────────────────────────┤
│ INSERT: (jar_id, invite_token, status='pending')            │
│ Repeat for each contributor invited                         │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Contributor Clicks Link
┌────────────────────────────────────────────────────────────────┐
│ Browser: ContributePage.tsx (/contribute/:token)            │
├────────────────────────────────────────────────────────────────┤
│ 1. Extract token from URL                                    │
│ 2. Call: get_jar_id_by_contributor_token(token)  RPC        │
│ 3. Returns: jar_id (or error if token invalid)              │
│ 4. Load jar details (theme, preview)                        │
│ 5. Show NoteEditor (text + image only)                      │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Contributor Adds Note
┌────────────────────────────────────────────────────────────────┐
│ ContributePage: Contributor writes note                      │
├────────────────────────────────────────────────────────────────┤
│ - Content type: text or image                               │
│ - No voice, no links (simpler for public contributors)      │
│ - Clicks "Add to jar"                                       │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Insert Note (No Auth)
┌────────────────────────────────────────────────────────────────┐
│ Supabase: jar_notes table                                    │
├────────────────────────────────────────────────────────────────┤
│ INSERT INTO jar_notes (jar_id, content, content_type)       │
│ RLS allows insert if:                                        │
│   - get_jar_id_by_contributor_token validates the token    │
│   - OR is_jar_contributor returns true                      │
│ Note appears in jar ✓                                       │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Claiming Shared Jars

```
┌────────────────────────────────────────────────────────────────┐
│ Creator shares jar to recipient@email.com                     │
├────────────────────────────────────────────────────────────────┤
│ send-jar-email edge function:                                │
│ INSERT INTO jar_shares (jar_id, shared_to_email)             │
│ (No user_id yet; email doesn't match any account)            │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Recipient Signs Up
┌────────────────────────────────────────────────────────────────┐
│ Recipient clicks email link → registers with same email      │
├────────────────────────────────────────────────────────────────┤
│ Auth: auth.users created for recipient@email.com             │
│ Dashboard: useEffect calls claim_shared_jars()  RPC          │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    RPC Claims Shares
┌────────────────────────────────────────────────────────────────┐
│ claim_shared_jars() (SECURITY DEFINER function)              │
├────────────────────────────────────────────────────────────────┤
│ SELECT * FROM jar_shares WHERE shared_to_email = user.email │
│ For each matching row:                                       │
│   UPDATE jar_shares SET                                     │
│     shared_to_user_id = auth.uid(),                        │
│     accepted_at = NOW()                                     │
│ Runs as function owner (not user) → can write to jar_shares │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Jars Visible in Dashboard
┌────────────────────────────────────────────────────────────────┐
│ Dashboard.tsx: "Shared with me" tab                          │
├────────────────────────────────────────────────────────────────┤
│ SELECT * FROM jars WHERE id IN (                            │
│   SELECT jar_id FROM jar_shares WHERE shared_to_user_id = ? │
│ )                                                             │
│ Shows all claimed jars ✓                                     │
└────────────────────────────────────────────────────────────────┘
```

---

[← Back to README](../README.md)
