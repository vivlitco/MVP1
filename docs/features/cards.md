# E-Cards Feature

Standalone animated greeting cards with wax-sealed envelope interactions.

---

## Card Lifecycle

### Create (Guest or Authenticated)
- 3-step wizard: theme → cover → message
- Optional: voice note attachment, cover image upload
- Generates `share_token` UUID
- Returns `/card/{share_token}`

### Share
- Email link via `send-card-email` function
- Or copy link to share directly

### Open (Recipient)
- Click link → ViewCard page
- Animated envelope interaction: tap to open
- Message revealed (animations on unfold)
- Voice note plays if attached
- Marks `is_opened = true` on first view

---

## Core Fields

| Field | Type | Default |
|---|---|---|
| `theme` | text | "warm" |
| `cover_preset` | text | null |
| `cover_image_url` | text | null |
| `message` | text | "" |
| `sender_name` | text | null |
| `recipient_name` | text | null |
| `audio_url` | text | null |
| `share_token` | uuid | gen_random_uuid() |
| `is_opened` | boolean | false |

---

## Cover Presets

8 preset cover designs (emoji + background):

| Preset | Emoji | Background |
|---|---|---|
| floral | 💐 | Soft green |
| hearts | 💕 | Dusty pink |
| stars | 🌟 | Midnight blue |
| balloons | 🎈 | Light yellow |
| confetti | 🎉 | Warm orange |
| music | 🎵 | Lavender |
| flowers | 🌸 | Pale rose |
| celebration | 🎊 | Gold |

User can also upload custom cover image (stored in Storage).

---

## Voice Notes

Optional audio attachment. User records via voice recorder component.

```typescript
// Record audio (supported formats: .wav, .m4a, .mp3)
const audioUrl = await uploadAudio(audioBlob);

// Store in cards.audio_url
await supabase.from('cards').update({
  audio_url: audioUrl,
}).eq('id', cardId);

// On ViewCard, render:
<audio src={card.audio_url} controls />
```

---

## Envelope Interaction

ViewCard renders an animated envelope:

```typescript
const [isOpen, setIsOpen] = useState(false);

return (
  <div onClick={() => setIsOpen(!isOpen)}>
    <motion.div
      initial={{ rotateX: 0 }}
      animate={{ rotateX: isOpen ? 180 : 0 }}
      transition={{ duration: 0.8, type: 'spring' }}
    >
      {isOpen ? <MessageInside /> : <EnvelopeCover />}
    </motion.div>
  </div>
);
```

CSS perspective creates 3D flip effect.

---

## Wax Seal Detail

Decorative wax seal on envelope. Purely visual (CSS circle + SVG path).

No interaction tied to it; exists for emotional design.

---

[← Back to README](../README.md)
