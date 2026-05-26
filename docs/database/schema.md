# Database Schema

Complete reference for all 11 PostgreSQL tables in the Vivlit database.

---

## Entity Relationship Diagram

```
auth.users (Supabase managed)
    ↓
profiles (user metadata)
    ↓
jars ← → jar_notes
  ↓       ↓
jar_charms  jar_activity
  ↓       ↓
jar_contributors  jar_shares
  ↓           ↓
jar_owners  jar_user_state

cards (standalone, user_id optional)

ghost_accounts (session-based)

contact_submissions (external form data)
```

---

## Core Tables

### `profiles`
User metadata (one per auth user).

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | | FK to `auth.users`, unique |
| `full_name` | text | YES | | From signup |
| `avatar_url` | text | YES | | Future: user profile picture |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

### `jars` (Core Product)
The memory jar entity.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | YES | | FK to profiles (null for ghost) |
| `ghost_session_id` | text | YES | | Session ID for anonymous creators |
| `name` | text | NO | 'My Jar of Notes' | Display name |
| `theme` | text | NO | 'warm' | Jar color theme |
| `recipient_name` | text | YES | | Who the jar is for |
| `recipient_email` | text | YES | | Notification email |
| `share_token` | uuid | NO | gen_random_uuid() | Public access token (must be unique) |
| `open_mode` | text | NO | 'unlimited' | 'daily' or 'unlimited' |
| `unlock_date` | timestamptz | YES | | Time-lock (if set) |
| `delivery_scheduled_for` | timestamptz | YES | | Auto-send scheduling |
| `is_collaborative` | boolean | NO | false | Allow contributors |
| `is_password_protected` | boolean | NO | false | |
| `password_hash` | text | YES | | bcrypt via pgcrypto |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

### `jar_notes`
Individual notes inside a jar.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | | PK |
| `jar_id` | uuid | NO | | FK to jars |
| `content` | text | YES | | Text content (null for media-only) |
| `content_type` | text | NO | 'text' | 'text' \| 'image' \| 'voice' \| 'link' |
| `media_url` | text | YES | | Storage URL (if image/voice) |
| `note_order` | integer | NO | 0 | Display ordering |
| `note_theme` | text | NO | 'default' | Note paper style |
| `opened_at` | timestamptz | YES | | When note was first revealed |
| `created_at` | timestamptz | NO | now() | |

### `jar_charms`
Decorative stickers on jar.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | | PK |
| `jar_id` | uuid | NO | | FK to jars |
| `charm_type` | text | NO | | Emoji/symbol identifier |
| `color` | text | YES | | Optional override color |
| `position_x` | float | NO | 50 | Percentage 0–100 |
| `position_y` | float | NO | 50 | Percentage 0–100 |
| `rotation` | float | NO | 0 | Degrees (0–360) |
| `scale` | float | NO | 1 | Multiplier (0.5–2.0) |
| `created_at` | timestamptz | NO | now() | |

### `cards`
Standalone e-cards (separate from jars).

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | | PK |
| `user_id` | uuid | YES | | FK to profiles (null for ghost) |
| `ghost_session_id` | text | YES | | Session ID for anonymous creators |
| `theme` | text | NO | 'warm' | Card color theme |
| `cover_preset` | text | YES | | 'floral', 'hearts', 'stars', etc. |
| `cover_image_url` | text | YES | | Custom cover image |
| `message` | text | YES | | Card message |
| `sender_name` | text | YES | | From: name |
| `recipient_name` | text | YES | | To: name |
| `audio_url` | text | YES | | Voice note URL |
| `share_token` | uuid | NO | gen_random_uuid() | Public access token |
| `is_opened` | boolean | NO | false | Tracks first open |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

---

## Sharing & Collaboration

### `jar_contributors`
Invite-based collaborators.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | | PK |
| `jar_id` | uuid | NO | | FK to jars |
| `invite_token` | uuid | NO | gen_random_uuid() | Unique invite link token |
| `contributor_name` | text | YES | | Name (if not signed up) |
| `contributor_email` | text | YES | | Email (optional) |
| `user_id` | uuid | YES | | FK to auth.users (if joined) |
| `status` | text | NO | 'pending' | 'pending' \| 'accepted' |
| `created_at` | timestamptz | NO | now() | |
| `accepted_at` | timestamptz | YES | | When contributor joined |

### `jar_shares`
Email-based or user-based sharing.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | | PK |
| `jar_id` | uuid | NO | | FK to jars |
| `shared_by_user_id` | uuid | NO | | Who shared it |
| `shared_to_user_id` | uuid | YES | | Recipient user (if known) |
| `shared_to_email` | text | YES | | Recipient email |
| `permission` | text | NO | 'view' | 'view' (future: 'edit') |
| `shared_at` | timestamptz | NO | now() | |
| `accepted_at` | timestamptz | YES | | When claimed |

### `jar_owners`
Multi-owner support (future feature).

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | | PK |
| `jar_id` | uuid | NO | | FK to jars |
| `user_id` | uuid | NO | | FK to auth.users |
| `role` | text | NO | 'owner' | 'owner' \| 'editor' \| 'viewer' |
| `added_at` | timestamptz | NO | now() | |

---

## Tracking & Audit

### `jar_user_state`
Per-user note reveal state (daily limits, etc.).

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | | PK |
| `jar_id` | uuid | NO | | FK to jars |
| `user_id` | uuid | YES | | FK to auth.users (null for guests) |
| `session_id` | text | YES | | Session ID (for anonymous opens) |
| `last_opened_date` | date | YES | | Last day jar was opened |
| `last_opened_at` | timestamptz | YES | | Last exact timestamp |
| `notes_opened_today` | integer | NO | 0 | Count for daily mode |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

### `jar_activity`
Audit log.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | | PK |
| `jar_id` | uuid | NO | | FK to jars |
| `user_id` | uuid | YES | | Who did it (null for ghost) |
| `activity_type` | text | NO | | 'created', 'edited', 'shared', 'email_shared', 'opened' |
| `metadata` | jsonb | YES | | Activity details |
| `created_at` | timestamptz | NO | now() | |

### `ghost_accounts`
Tracks anonymous user sessions.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | | PK |
| `session_id` | text | NO | | Unique session ID (must be unique) |
| `jar_ids` | uuid[] | NO | '{}' | Array of jar IDs created |
| `card_ids` | uuid[] | NO | '{}' | Array of card IDs created |
| `converted_at` | timestamptz | YES | | When converted to real account |
| `converted_to_user_id` | uuid | YES | | User ID after conversion |
| `created_at` | timestamptz | NO | now() | |

### `contact_submissions`
Contact form data.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | | PK |
| `name` | text | NO | | Submitter name |
| `email` | text | NO | | Contact email |
| `subject` | text | NO | | Message subject |
| `message` | text | NO | | Message body |
| `created_at` | timestamptz | NO | now() | |

---

## Indexes

For fast queries:

```sql
CREATE INDEX idx_jars_user_id ON jars(user_id);
CREATE INDEX idx_jars_ghost_session_id ON jars(ghost_session_id);
CREATE INDEX idx_jars_share_token ON jars(share_token);
CREATE INDEX idx_jar_notes_jar_id ON jar_notes(jar_id);
CREATE INDEX idx_jar_contributors_invite_token ON jar_contributors(invite_token);
CREATE INDEX idx_jar_shares_shared_to_email_lower ON jar_shares(LOWER(shared_to_email));
CREATE INDEX idx_jar_user_state_jar_id_user_id ON jar_user_state(jar_id, user_id);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_ghost_session_id ON cards(ghost_session_id);
CREATE INDEX idx_ghost_accounts_session_id ON ghost_accounts(session_id);
```

---

## Foreign Key Relationships

| FK Column | References | ON DELETE |
|---|---|---|
| `profiles.user_id` | `auth.users.id` | CASCADE |
| `jars.user_id` | `profiles.user_id` | SET NULL |
| `jar_notes.jar_id` | `jars.id` | CASCADE |
| `jar_charms.jar_id` | `jars.id` | CASCADE |
| `jar_contributors.jar_id` | `jars.id` | CASCADE |
| `jar_shares.jar_id` | `jars.id` | CASCADE |
| `jar_owners.jar_id` | `jars.id` | CASCADE |
| `cards.user_id` | `profiles.user_id` | SET NULL |

---

## Storage Bucket

**Name**: `jar-media` (public read, authenticated write)

| Type | Path | Extensions |
|---|---|---|
| Images | `/{jar_id}/{uuid}.{ext}` | jpg, png, webp |
| Voice | `/{jar_id}/{uuid}.{ext}` | wav, mp3, m4a, ogg |

---

[← Back to README](../README.md)
