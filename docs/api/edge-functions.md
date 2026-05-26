# Edge Functions

Serverless functions (Deno runtime) for email, AI, and external integrations.

---

## Overview

| Function | Auth | Public | Purpose |
|---|---|---|---|
| `generate-message` | No | Yes | AI-powered message suggestions |
| `send-jar-email` | Yes | No | Email jar share link |
| `send-card-email` | Yes | No | Email card share link |
| `contact-form` | No | Yes | Store contact form submissions |

All located at `supabase/functions/`.

---

## generate-message

**Purpose**: Generate 3 suggested messages using AI (Google Gemini).

**Request**:
```json
{
  "relationship": "friend",
  "occasion": "birthday",
  "tone": "warm",
  "details": "She loves hiking and photography"
}
```

**Response**:
```json
{
  "messages": [
    { "label": "Heartfelt", "text": "..." },
    { "label": "Playful", "text": "..." },
    { "label": "Sincere", "text": "..." }
  ]
}
```

**Error**:
```json
{ "error": "Rate limited or credits exhausted" }
```

**Endpoint**: `supabase.functions.invoke('generate-message', { body: {...} })`

---

## send-jar-email

**Purpose**: Email a jar share link.

**Auth**: Bearer token (JWT from Supabase Auth)

**Request**:
```json
{
  "jarId": "uuid",
  "recipientEmail": "someone@example.com",
  "senderName": "Alice",
  "personalMessage": "Check this out!"
}
```

**Response**:
```json
{ "success": true, "messageId": "..." }
```

**Errors**:
- `401`: Unauthorized (invalid token)
- `403`: Forbidden (not jar owner)
- `400`: Bad request (invalid email)
- `500`: Email service error

**Endpoint**:
```typescript
const { data, error } = await supabase.functions.invoke('send-jar-email', {
  body: { jarId, recipientEmail, senderName, personalMessage },
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});
```

**Side effects**:
- Inserts `jar_activity` row with `activity_type='email_shared'`

---

## send-card-email

**Purpose**: Email a card share link.

**Auth**: Bearer token

**Request**:
```json
{
  "cardId": "uuid",
  "recipientEmail": "someone@example.com",
  "recipientName": "Bob",
  "senderName": "Alice"
}
```

**Response**:
```json
{ "success": true }
```

**Endpoint**:
```typescript
const { data, error } = await supabase.functions.invoke('send-card-email', {
  body: { cardId, recipientEmail, recipientName, senderName },
  headers: { 'Authorization': `Bearer ${session.access_token}` }
});
```

---

## contact-form

**Purpose**: Store contact form data + notify admin.

**Auth**: None (public)

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Feature request",
  "message": "Can we have dark mode?"
}
```

**Response**:
```json
{ "success": true, "submissionId": "uuid" }
```

**Validation**:
- name: max 100 chars
- email: valid email format
- subject: max 200 chars
- message: max 2000 chars

**Endpoint**:
```typescript
const { data, error } = await supabase.functions.invoke('contact-form', {
  body: { name, email, subject, message }
});
```

**Side effects**:
- Inserts `contact_submissions` row
- Optionally emails `hello@vivlit.com` with submission details

---

## CORS & Security

All functions return CORS headers:
```typescript
return Response.json(result, {
  headers: {
    'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN'),  // e.g., https://vivlit.com
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  },
});
```

`verify_jwt = false` in `supabase/config.toml` → JWT verified in-function for flexibility.

---

## Testing Locally

```bash
# Start Supabase local
supabase start

# Serve functions locally
supabase functions serve

# Call in another terminal
curl -X POST http://localhost:54321/functions/v1/contact-form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "subject": "Test",
    "message": "Test message"
  }'
```

---

[← Back to README](../README.md)
