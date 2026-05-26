# Jars Feature

The core product: shareable collections of handwritten notes, voice messages, photos, and links.

---

## Jar Lifecycle

### Create (Guest or Authenticated)
- User fills CreateJar form: name, theme, notes
- Media uploaded to `jar-media` bucket
- Inserts: `jars` + `jar_notes` + `jar_charms` rows
- Generates `share_token` UUID
- Returns `/dashboard` (or `/jar/:token` for guests)

### Edit (Owner Only)
- Edit jar name, theme, password, unlock date
- Can add/remove notes (text only currently; images require deletion + re-add)
- Cannot change share_token (permanent)

### Share (Email or Link)
- Copy link: `https://vivlit.com/jar/{share_token}`
- Email via `send-jar-email` edge function
- Logged as `email_shared` activity

### Open (Recipient)
- Click link → ViewJar page
- Access gates: login → password → time-lock → reveal
- Notes appear per `open_mode` (daily or unlimited)
- User state tracked in `jar_user_state`

---

## Core Fields

| Field | Type | Required | Default |
|---|---|---|---|
| `name` | text | Yes | "My Jar of Notes" |
| `theme` | text | Yes | "warm" |
| `recipient_name` | text | No | null |
| `recipient_email` | text | No | null |
| `share_token` | uuid | Yes | gen_random_uuid() |
| `open_mode` | text | Yes | "unlimited" |
| `unlock_date` | timestamptz | No | null |
| `is_collaborative` | boolean | No | false |
| `is_password_protected` | boolean | No | false |
| `password_hash` | text | No | null |

---

## Open Modes

### Unlimited
All notes visible immediately on first open.

```typescript
// Render all notes
<div>
  {notes.map(note => <NoteCard key={note.id} note={note} />)}
</div>
```

### Daily
One note per day (24-hour window).

```typescript
const today = new Date().toDateString();
const lastOpened = jarUserState?.last_opened_date;
const notesOpenedToday = jarUserState?.notes_opened_today || 0;

if (lastOpened === today && notesOpenedToday >= 1) {
  // User already opened today, show next note tomorrow
  return <CountdownTimer until={tomorrow} />;
}

// Show next note (index = notesOpenedToday)
const nextNote = notes[notesOpenedToday];

// Update jar_user_state
await supabase.from('jar_user_state').upsert({
  jar_id: jarId,
  user_id: userId,
  last_opened_date: today,
  notes_opened_today: notesOpenedToday + 1,
});
```

---

## Password Protection

### Setting Password
```typescript
const { data: hash } = await supabase.rpc('hash_jar_password', {
  password: userPassword,
});

await supabase.from('jars').update({
  is_password_protected: true,
  password_hash: hash,
}).eq('id', jarId);
```

### Verifying Password
```typescript
const { data: isCorrect } = await supabase.rpc('verify_jar_password', {
  hash: jar.password_hash,
  password: inputPassword,
});

if (isCorrect) {
  setPasswordVerified(true);  // Show jar content
}
```

---

## Time-Lock (Unlock Date)

### Setting
```typescript
await supabase.from('jars').update({
  unlock_date: new Date('2025-12-25'),  // Christmas
}).eq('id', jarId);
```

### Checking
```typescript
const isLocked = new Date() < new Date(jar.unlock_date);

if (isLocked) {
  return <CountdownTimer until={jar.unlock_date} />;  // "Opens in 5 days..."
}
```

---

## Themes (10 Presets)

Colors define the jar appearance. User selects on creation; cannot change after.

| Theme | Hex | Name |
|---|---|---|
| warm | #ffd6a5 | Warm Sunset |
| lavender | #c4a5de | Lavender Dreams |
| mint | #bde0fe | Fresh Mint |
| rose | #ffc8dd | Rose Garden |
| ocean | #7dd3fc | Ocean Breeze |
| sunset | #fdba74 | Golden Sunset |
| forest | #86efac | Forest Glade |
| candy | #f0abfc | Candy Shop |
| midnight | #a5b4fc | Midnight Stars |
| golden | #fcd34d | Golden Hour |

[See design-system/color-tokens.md for full reference]

---

## Notes (Content Types)

Each note is one of four types:

### Text
- `content`: text (required)
- `content_type`: "text"
- `media_url`: null
- Renders as quoted paragraph

### Image
- `content`: caption (optional)
- `content_type`: "image"
- `media_url`: Storage URL
- Renders as `<img>` + caption

### Voice
- `content`: label (optional, e.g., "Mom's message")
- `content_type`: "voice"
- `media_url`: Storage URL (.m4a, .wav, .mp3)
- Renders as `<audio controls>`

### Link
- `content`: link text or URL
- `content_type`: "link"
- `media_url`: null
- Validates: http:// or https:// only

---

## Charms (Decoration)

Optional stickers placed on jar body.

```typescript
interface Charm {
  id: uuid,
  charm_type: string,       // emoji code, e.g. "heart", "star"
  color?: string,           // optional color override
  position_x: number,       // 0-100 (percentage)
  position_y: number,       // 0-100
  rotation: number,         // degrees
  scale: number,            // multiplier
}
```

User places charms via CharmsPalette component in CreateJar.

---

## Collaborative Mode

```typescript
// Enable collaboration on creation
is_collaborative = true;

// Generate invite links for each contributor
for (const email of contributorEmails) {
  const { data: token } = await supabase.from('jar_contributors')
    .insert({ jar_id: jarId, contributor_email: email })
    .select('invite_token');
  
  console.log(`Share link: /contribute/${token}`);
}
```

Contributors can add text and image notes via `/contribute/{invite_token}` without signing in.

---

## Note Ordering

Notes have a `note_order` integer. ViewJar displays in ascending order:

```typescript
const sortedNotes = notes.sort((a, b) => a.note_order - b.note_order);
```

On creation, app assigns `note_order` automatically (0, 1, 2, ...).

---

## Privacy

**Public vs Private** (not yet implemented; all jars are currently public if they have a share_token):

```typescript
// Future: jar could have is_public flag
// is_public = false → only accessible via email share or direct user share
// is_public = true → anybody with link can view
```

---

[← Back to README](../README.md)
