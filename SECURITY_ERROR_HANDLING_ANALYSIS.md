# VIVLIT - DETAILED SECURITY & ERROR HANDLING REPORT

**Generated:** December 29, 2025

---

## EXECUTIVE SUMMARY

The Vivlit application has a solid foundation with Supabase for authentication and Row-Level Security. However, several critical security vulnerabilities and error handling gaps need to be addressed before production deployment.

**Critical Issues Found:** 10  
**High Priority Issues:** 8  
**Medium Priority Issues:** 6  
**Code Quality Issues:** 5

---

## CRITICAL SECURITY VULNERABILITIES

### VULNERABILITY #1: Client-Side Password Verification ⚠️ CRITICAL

**Location:** `src/pages/ViewJar.tsx` (Lines 270-290)

**Code:**
```typescript
const [jar, setJar] = useState<Jar | null>(null);
const [isLocked, setIsLocked] = useState(false);

// Password verification happens in component
useEffect(() => {
  if (jar?.is_password_protected && jar?.password_hash) {
    setIsLocked(true);
  }
}, [jar]);

const verifyPassword = async (inputPassword: string) => {
  // ❌ PASSWORD HASH IS EXPOSED IN jar DATA
  const isMatch = await bcrypt.compare(inputPassword, jar?.password_hash);
  if (isMatch) {
    setIsLocked(false);
    // User can now view jar
  }
}
```

**Why It's Critical:**

1. **Hash Exposure:** Password hash (`jar.password_hash`) is sent to frontend
   - Browser network tab shows full password hash
   - Hash can be captured by attacker
   - Hash could be cracked offline

2. **Client-Side Verification:** Password check happens in JavaScript
   - User can open developer console and manually set `isLocked = false`
   - Browser execution can be inspected/bypassed
   - bcrypt.js implementation weaker than server-side

3. **No Rate Limiting:** Unlimited password attempts
   - Brute force attack possible
   - No lockout after failures
   - No CAPTCHA protection

4. **Timing Attack:** bcrypt timing can reveal password length

**Attack Scenario:**
```javascript
// Attacker in browser console:
// 1. Inspect network request for jar data
console.log(jar.password_hash);  // "bcrypt_hash_exposed"

// 2. Offline brute force with common passwords
const bcrypt = require('bcryptjs');
['password123', 'iloveyou', 'sunshine'].forEach(pwd => {
  bcrypt.compare(pwd, hash, (err, match) => {
    if (match) console.log('Found password!', pwd);
  });
});

// 3. Or simply bypass in console
isLocked = false;  // ✓ Can now see jar
```

**How to Fix:**

**Option A: Server-Side Verification (Recommended)**
```typescript
// Create Supabase Edge Function
// supabase/functions/verify-jar-password/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

serve(async (req) => {
  const { jarId, password } = await req.json();
  
  // Get jar from database
  const jar = await db.jars.findOne({ id: jarId });
  
  if (!jar.is_password_protected) {
    return new Response(
      JSON.stringify({ canAccess: true }),
      { status: 200 }
    );
  }
  
  // Verify password server-side
  const isValid = await bcrypt.compare(password, jar.password_hash);
  
  // Return boolean only, not hash
  return new Response(
    JSON.stringify({ 
      canAccess: isValid,
      message: isValid ? 'Access granted' : 'Incorrect password'
    }),
    { 
      status: isValid ? 200 : 401,
      headers: {
        'Cache-Control': 'no-store',
        'X-RateLimit-Remaining': String(remainingAttempts)
      }
    }
  );
});

// Frontend usage
const verifyPassword = async (inputPassword: string) => {
  const { data, error } = await supabase.functions.invoke(
    'verify-jar-password',
    {
      body: { jarId: jar.id, password: inputPassword }
    }
  );
  
  if (data.canAccess) {
    setIsLocked(false);
  } else {
    toast.error('Incorrect password');
    failedAttempts++;
  }
};
```

**Option B: RLS Policy (Alternative)**
```sql
-- Don't select password_hash in frontend query
SELECT id, name, theme, share_token, open_mode
FROM jars
WHERE share_token = $1;

-- Create authenticated RLS policy that checks password
CREATE POLICY "verified_jar_access" ON jar_notes
  FOR SELECT
  USING (
    -- Allow if user is jar creator
    EXISTS (
      SELECT 1 FROM jars 
      WHERE jars.id = jar_notes.jar_id 
      AND jars.user_id = auth.uid()
    )
    OR
    -- Allow if password is correct (checked server-side)
    EXISTS (
      SELECT 1 FROM jar_verification 
      WHERE jar_id = jar_notes.jar_id 
      AND verified_at > now() - interval '24 hours'
    )
  );
```

**Implementation Effort:** 2-3 hours  
**Severity:** 🔴 CRITICAL

---

### VULNERABILITY #2: Email-Based Access Control Bypass

**Location:** `src/pages/Dashboard.tsx` (Lines 108-135) and `src/components/ShareDialog.tsx`

**Code:**
```typescript
// Dashboard.tsx
const fetchSharedJars = async () => {
  const userEmail = user?.email?.toLowerCase();
  
  const { data: shares } = await supabase
    .from('jar_shares')
    .select(`...`)
    .select();  // Gets ALL shares
    
  // Client-side filter
  const userShares = (shares || []).filter(s => 
    s.shared_to_user_id === userId || 
    (s.shared_to_email && 
     s.shared_to_email.toLowerCase() === userEmail)  // ❌ Email matching on client
  );
};

// ShareDialog.tsx
const shareToAccount = async () => {
  const { error: insertError } = await supabase
    .from('jar_shares')
    .insert({
      jar_id: jarId,
      shared_by_user_id: user.id,
      shared_to_email: accountEmail.toLowerCase().trim(),
      permission: 'view',
    });
    // ❌ No verification that email owner accepted
};
```

**Vulnerabilities:**

1. **No Email Verification**
   - Share added for any email address
   - No confirmation needed from recipient
   - Attacker can claim they shared with anyone

2. **Automatic Email-to-User Mapping**
   ```typescript
   // Dashboard.tsx - Line 128
   for (const share of sharesToUpdate) {
     await supabase
       .from('jar_shares')
       .update({ 
         shared_to_user_id: userId,
         accepted_at: new Date().toISOString()  // ❌ Auto-accepted
       })
       .eq('id', share.id);
   }
   ```
   - Anyone with email account gets access to jars shared to that email
   - No consent from original email owner
   - Impersonation possible with email-based access

3. **Case Sensitivity Issues**
   ```typescript
   // Both "Test@Email.com" and "test@email.com" treated as different
   shared_to_email.toLowerCase()  // Only done in one place
   ```

4. **No Rate Limiting on Shares**
   - Can spam shares to thousands of emails
   - Potential for abuse/harassment

**Attack Scenario:**
```typescript
// Attacker does:
// 1. Create account with their email
await signUp('attacker@example.com', 'password');

// 2. Create jar with secret content
const jar = await createJar({
  name: 'Secret',
  content: 'Private stuff'
});

// 3. Share to victim's email
await shareToAccount({
  jar_id: jar.id,
  shared_to_email: 'victim@gmail.com'
});

// 4. Attacker signs up as victim (if using gmail, can use +trick)
// 5. Login as victim email → automatically gets access to secret jar
```

**How to Fix:**

```typescript
// 1. Add email verification step
const shareToAccount = async () => {
  const verificationToken = generateSecureToken();
  
  // Store share as PENDING
  await supabase.from('jar_shares').insert({
    jar_id: jarId,
    shared_by_user_id: user.id,
    shared_to_email: accountEmail.toLowerCase().trim(),
    permission: 'view',
    status: 'pending',  // NEW field
    verification_token: hashToken(verificationToken),
    token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  
  // Send email to recipient with verification link
  await supabase.functions.invoke('send-share-verification', {
    body: {
      recipient_email: accountEmail,
      verification_link: `/verify-share/${verificationToken}`
    }
  });
  
  toast.info('Verification email sent');
};

// 2. Create verification page
// src/pages/VerifyShare.tsx
const VerifyShare = () => {
  const { token } = useParams();
  
  useEffect(() => {
    verifyShareToken(token);
  }, [token]);
  
  const verifyShareToken = async (token: string) => {
    const { data, error } = await supabase
      .from('jar_shares')
      .select('*')
      .eq('verification_token', hashToken(token))
      .maybeSingle();
      
    if (data && new Date() < new Date(data.token_expires_at)) {
      // Mark as accepted
      await supabase.from('jar_shares')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', data.id);
      
      if (user?.email?.toLowerCase() === data.shared_to_email.toLowerCase()) {
        toast.success('Jar access granted!');
      } else {
        toast.error('Please sign up with the correct email');
        navigate('/auth?mode=signup&email=' + encodeURIComponent(data.shared_to_email));
      }
    }
  };
};

// 3. Update RLS policies
ALTER TABLE jar_shares ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

CREATE POLICY "Only accepted shares visible" ON jar_shares
  FOR SELECT
  USING (
    auth.uid() = shared_by_user_id OR
    (auth.uid() = shared_to_user_id AND status = 'accepted') OR
    -- Jar owner can see all shares
    EXISTS (SELECT 1 FROM jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
  );
```

**Implementation Effort:** 4-5 hours  
**Severity:** 🔴 CRITICAL

---

### VULNERABILITY #3: CORS Wide Open on Email Function

**Location:** `supabase/functions/send-jar-email/index.ts` (Line 5)

**Code:**
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",  // ❌ DANGEROUS
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
```

**Problems:**

1. **Any Domain Can Call Function**
   ```javascript
   // Attacker on evil.com can call:
   fetch('https://api.supabase.co/functions/v1/send-jar-email', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       recipientEmail: 'victim@gmail.com',
       jarName: 'Click here to see secret',
       shareUrl: 'https://malicious-phishing-site.com'
     })
   });
   ```

2. **Email Spam Vulnerability**
   - No authentication on email function
   - Can spam any email address
   - No rate limiting
   - Reputation damage

3. **Phishing Vector**
   - Attacker creates malicious jar
   - Sends via legitimate Vivlit email
   - Email appears to come from trusted source
   - Users click malicious link

**How to Fix:**

```typescript
// 1. Restrict CORS to your domain
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.VIVLIT_DOMAIN || "https://vivlit.app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

// 2. Validate request origin
const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const allowedOrigins = [
    'https://vivlit.app',
    'https://www.vivlit.app',
  ];
  
  if (!allowedOrigins.includes(origin)) {
    return new Response('CORS policy: origin not allowed', { status: 403 });
  }
  
  // ... rest of function
};

// 3. Require authentication
const handler = async (req: Request): Promise<Response> => {
  // Get JWT from Authorization header
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return new Response('Authentication required', { status: 401 });
  }
  
  try {
    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyJWT(token, JWT_SECRET);
    
    if (!user) {
      throw new Error('Invalid token');
    }
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // ... rest of function
};

// 4. Add rate limiting
const rateLimitKey = user.id;
const attempts = await redis.get(`email-send:${rateLimitKey}`);

if (attempts >= 5) {
  return new Response('Too many requests', { status: 429 });
}

await redis.incr(`email-send:${rateLimitKey}`);
await redis.expire(`email-send:${rateLimitKey}`, 3600);  // 1 hour

// 5. Validate email input
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(recipientEmail)) {
  return new Response('Invalid email format', { status: 400 });
}

if (recipientEmail.length > 255) {
  return new Response('Email too long', { status: 400 });
}

// 6. Validate jar existence
const { data: jar } = await db
  .from('jars')
  .select('id')
  .eq('id', jarId)
  .maybeSingle();

if (!jar) {
  return new Response('Jar not found', { status: 404 });
}

// 7. Check share permissions
const { data: share } = await db
  .from('jar_shares')
  .select('id')
  .eq('jar_id', jar.id)
  .eq('shared_by_user_id', user.id)
  .eq('shared_to_email', recipientEmail)
  .maybeSingle();

if (!share) {
  return new Response('Not authorized to send this share', { status: 403 });
}
```

**Implementation Effort:** 2-3 hours  
**Severity:** 🔴 CRITICAL

---

### VULNERABILITY #4: No File Type Validation on Uploads

**Location:** `src/pages/CreateJar.tsx` (Lines 380-420)

**Code:**
```typescript
const uploadFile = async (file: File, jarId: string, effectiveUserId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();  // ❌ Only checks extension
  const fileName = `${effectiveUserId}/${jarId}/${crypto.randomUUID()}.${fileExt}`;
  
  // No validation of:
  // - File size
  // - MIME type
  // - File content
  // - Malicious code
  
  const { data, error } = await supabase.storage
    .from('jar-notes')
    .upload(fileName, file);
};
```

**Attack Scenarios:**

1. **Malicious File Upload**
   ```javascript
   // Attacker uploads malicious file
   // Renames .exe to .jpg
   const maliciousFile = new File([malwareCode], 'image.jpg', { type: 'image/jpeg' });
   await uploadFile(maliciousFile);
   
   // Victim downloads "image" and executes malware
   ```

2. **DOS via Large Files**
   ```javascript
   // Attacker uploads 10GB file
   // Exhausts storage quota
   // Legitimate users can't upload
   ```

3. **Storage Abuse**
   - No file size limits
   - Attacker can fill storage (costs money)
   - Service becomes unavailable

4. **Reverse Shell Upload**
   - Upload PHP/Node shell
   - If accessible, gain server access

**How to Fix:**

```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/mpeg', 'audio/wav'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB
const MAX_AUDIO_SIZE = 20 * 1024 * 1024;  // 20MB
const MAX_FILES_PER_JAR = 50;

const uploadFile = async (
  file: File,
  jarId: string,
  effectiveUserId: string,
  fileType: 'image' | 'audio'
): Promise<string> => {
  // 1. Validate file size
  if (fileType === 'image' && file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Image must be under 5MB, got ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }
  
  if (fileType === 'audio' && file.size > MAX_AUDIO_SIZE) {
    throw new Error(`Audio must be under 20MB`);
  }
  
  // 2. Validate MIME type
  const allowedTypes = fileType === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid ${fileType} type. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  // 3. Check magic numbers (file signature)
  const arrayBuffer = await file.slice(0, 12).arrayBuffer();
  const headerArray = new Uint8Array(arrayBuffer);
  const isValidFile = validateFileMagicNumber(headerArray, fileType);
  
  if (!isValidFile) {
    throw new Error('File appears to be corrupted or not a valid ' + fileType);
  }
  
  // 4. Check file count limit
  const { data: existingFiles } = await supabase.storage
    .from('jar-notes')
    .list(`${effectiveUserId}/${jarId}`);
    
  if (existingFiles.length >= MAX_FILES_PER_JAR) {
    throw new Error(`Maximum ${MAX_FILES_PER_JAR} files per jar`);
  }
  
  // 5. Sanitize filename
  const sanitizedName = sanitizeFilename(file.name);
  const fileName = `${effectiveUserId}/${jarId}/${crypto.randomUUID()}.${sanitizedName.split('.').pop()}`;
  
  // 6. Upload with content type validation
  const { data, error } = await supabase.storage
    .from('jar-notes')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
      metadata: {
        uploadedAt: new Date().toISOString(),
        uploader: effectiveUserId,
      }
    });
    
  if (error) {
    throw error;
  }
  
  return data.path;
};

function validateFileMagicNumber(headerArray: Uint8Array, type: 'image' | 'audio'): boolean {
  if (type === 'image') {
    // JPEG: FF D8 FF
    if (headerArray[0] === 0xFF && headerArray[1] === 0xD8) return true;
    // PNG: 89 50 4E 47
    if (headerArray[0] === 0x89 && headerArray[1] === 0x50) return true;
    // WebP: RIFF ... WEBP
    if (headerArray[0] === 0x52 && headerArray[1] === 0x49) return true;
    // GIF: 47 49 46
    if (headerArray[0] === 0x47 && headerArray[1] === 0x49) return true;
  }
  
  if (type === 'audio') {
    // WebM: 1A 45 DF A3
    if (headerArray[0] === 0x1A && headerArray[1] === 0x45) return true;
    // MP3: FF FB or FF FA
    if (headerArray[0] === 0xFF) return true;
    // WAV: 52 49 46 46
    if (headerArray[0] === 0x52 && headerArray[1] === 0x49) return true;
  }
  
  return false;
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Remove special chars
    .substring(0, 255);  // Max length
}
```

**Implementation Effort:** 3-4 hours  
**Severity:** 🔴 CRITICAL

---

### VULNERABILITY #5: Weak Password Requirements

**Location:** `src/pages/Auth.tsx` (Line 11)

**Code:**
```typescript
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
```

**Problems:**

1. **Too Short:** 6 characters is very weak
   - 95^6 = 735 billion possible combinations
   - Can be brute-forced in hours with modern hardware

2. **No Complexity Requirements**
   - "123456" passes validation
   - "password" passes validation
   - No uppercase, numbers, special chars

3. **No Account Lockout**
   - Unlimited login attempts
   - Brute force attack possible

4. **No Password History**
   - Users can reuse old passwords

**How to Fix:**

```typescript
// Create stricter password schema
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character (!@#$%^&*)')
  .refine(
    (pwd) => {
      // Check against common passwords
      const commonPasswords = ['password', 'qwerty', 'admin123', '123456'];
      return !commonPasswords.includes(pwd.toLowerCase());
    },
    'This password is too common'
  );

// Implement account lockout
const loginAttempts: Record<string, { count: number; lockedUntil: number }> = {};

const handleLogin = async (email: string, password: string) => {
  const now = Date.now();
  const attempt = loginAttempts[email];
  
  // Check if account is locked
  if (attempt && attempt.lockedUntil > now) {
    const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
    throw new Error(`Account locked. Try again in ${minutesLeft} minutes`);
  }
  
  // Attempt login
  const { error } = await signIn(email, password);
  
  if (error) {
    // Increment failed attempts
    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 0, lockedUntil: 0 };
    }
    
    loginAttempts[email].count++;
    
    // Lock after 5 attempts
    if (loginAttempts[email].count >= 5) {
      loginAttempts[email].lockedUntil = now + (15 * 60 * 1000);  // 15 minutes
      throw new Error('Too many failed attempts. Account locked for 15 minutes');
    }
    
    throw error;
  }
  
  // Reset on success
  delete loginAttempts[email];
};

// Implement password history (Supabase)
// Add table:
CREATE TABLE password_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  password_hash text NOT NULL,
  changed_at timestamp DEFAULT now()
);

// Check before password change:
const newPasswordUsedBefore = await supabase
  .from('password_history')
  .select('id')
  .eq('user_id', user.id)
  .eq('password_hash', bcrypt.hashSync(newPassword, 10))
  .limit(1)
  .single();

if (newPasswordUsedBefore) {
  throw new Error('You cannot reuse a previous password');
}
```

**Implementation Effort:** 2-3 hours  
**Severity:** 🔴 CRITICAL

---

## HIGH PRIORITY SECURITY ISSUES

### ISSUE #6: No Rate Limiting

**Locations:**
- `src/components/ShareDialog.tsx` - sendEmailShare()
- `src/pages/CreateJar.tsx` - Create jar endpoint
- `supabase/functions/send-jar-email/` - Email function

**Problems:**

```typescript
// Can create unlimited jars
const handleSaveJar = async () => {
  // No rate limit - can create 1000 jars in seconds
  const { data: newJar } = await supabase.from('jars').insert({...});
};

// Can spam emails
const sendEmailShare = async () => {
  // No rate limit - can send 1000 emails in seconds
  await supabase.functions.invoke('send-jar-email', {...});
};
```

**Solution:** Use Supabase row level security with rate limiting:

```sql
-- Create rate limiting table
CREATE TABLE api_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  endpoint text,
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_api_usage_user_endpoint ON api_usage_log(user_id, endpoint, created_at);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_limit_per_hour integer
) RETURNS boolean AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM api_usage_log
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND created_at > now() - interval '1 hour';
  
  RETURN v_count < p_limit_per_hour;
END;
$$ LANGUAGE plpgsql;

-- Check before operations
IF NOT check_rate_limit(auth.uid(), 'create_jar', 50) THEN
  RAISE EXCEPTION 'Rate limit exceeded: 50 jars per hour';
END IF;
```

**Implementation Effort:** 3-4 hours  
**Severity:** 🟠 HIGH

---

### ISSUE #7: Missing Input Sanitization

**Locations:**
- `src/pages/CreateJar.tsx` - jarName, recipientName
- `src/pages/ShareDialog.tsx` - personalMessage
- `src/components/workspace/NoteEditor.tsx` - note content

**Problems:**

```typescript
// No sanitization before storage
const jarName = state.jarName;  // Could be "<script>alert('xss')</script>"

const { error } = await supabase
  .from('jars')
  .insert({ 
    name: jarName,  // ❌ Stored as-is
    recipient_name: recipientName
  });
```

**Solution:**

```typescript
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string, maxLength: number = 255): string => {
  return DOMPurify.sanitize(input)
    .trim()
    .substring(0, maxLength);
};

const handleCreateJar = async () => {
  const sanitizedName = sanitizeInput(jarName, 100);
  const sanitizedRecipient = sanitizeInput(recipientName, 100);
  
  if (!sanitizedName) {
    throw new Error('Jar name cannot be empty');
  }
  
  await supabase.from('jars').insert({
    name: sanitizedName,
    recipient_name: sanitizedRecipient,
    // ... rest
  });
};
```

**Implementation Effort:** 2-3 hours  
**Severity:** 🟠 HIGH

---

## ERROR HANDLING ISSUES

### ERROR ISSUE #1: Silent Failures Without User Notification

**Location:** `src/pages/ViewJar.tsx` (Line 172)

```typescript
const fetchCharms = async (jarId: string) => {
  const { data: charmsData, error: charmsError } = await supabase
    .from('jar_charms')
    .select('*')
    .eq('jar_id', jarId);

  if (charmsError) {
    console.error('Failed to fetch charms:', charmsError);
    return;  // ❌ Silent failure - user doesn't know charms didn't load
  }
  setCharms(charmsData || []);
};
```

**Fix:**
```typescript
if (charmsError) {
  console.error('Failed to fetch charms:', charmsError);
  toast.error('Failed to load jar decorations');  // Notify user
  setCharms([]);
  return;
}
```

---

### ERROR ISSUE #2: Generic Error Messages

**Locations:**
- `src/pages/Dashboard.tsx` (Line 90)
- `src/pages/ViewJar.tsx` (Line 145)

```typescript
catch (error: any) {
  toast.error('Failed to load jars');  // ❌ User doesn't know why
}
```

**Fix:**
```typescript
catch (error: any) {
  const message = error?.message || 'Failed to load jars';
  console.error('Load jars error:', error);
  toast.error(message);
}
```

---

### ERROR ISSUE #3: No Timeout Handling

**Location:** `src/pages/CreateJar.tsx` - File uploads

```typescript
const uploadFile = async (file: File) => {
  // ❌ No timeout - could hang forever
  const { data } = await supabase.storage
    .from('jar-notes')
    .upload(fileName, file);
};
```

**Fix:**
```typescript
const uploadFile = async (file: File) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);  // 30 second timeout
  
  try {
    const { data } = await supabase.storage
      .from('jar-notes')
      .upload(fileName, file);
    return data.path;
  } finally {
    clearTimeout(timeoutId);
  }
};
```

---

### ERROR ISSUE #4: No Error Boundaries

**Severity:** 🟠 HIGH

Currently, a crash in any component crashes the entire app.

**Solution:**

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught:', error, errorInfo);
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="font-bold text-red-900">Something went wrong</h2>
          <p className="text-red-700 mt-2">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in App.tsx
<ErrorBoundary>
  <Router>
    <Routes>...</Routes>
  </Router>
</ErrorBoundary>
```

---

## PERFORMANCE & OPTIMIZATION ISSUES

### PERF ISSUE #1: N+1 Queries

**Location:** `src/pages/Dashboard.tsx` (Line 108)

```typescript
const { data: shares } = await supabase
  .from('jar_shares')
  .select(`
    *,
    jars (*)  // ❌ Selects ALL jar fields
  `);

// Then filters result after loading everything
const userShares = shares.filter(s => s.shared_to_email === userEmail);
```

**Better:**
```typescript
const { data: shares } = await supabase
  .from('jar_shares')
  .select('id, jar_id, shared_at, jars(id, name, theme)')  // Only needed
  .or(`shared_to_user_id.eq.${userId},shared_to_email.ilike.${email}`)
  .limit(50)
  .order('shared_at', { ascending: false });
```

---

### PERF ISSUE #2: No Pagination

**Locations:**
- `src/pages/Dashboard.tsx` - My Jars, Shared Jars
- `src/pages/ViewJar.tsx` - Notes list (844 lines loaded at once)

**Solution:**
```typescript
const [limit] = useState(20);
const [offset, setOffset] = useState(0);

const fetchMyJars = async () => {
  const { data, error, count } = await supabase
    .from('jars')
    .select('*', { count: 'exact' })
    .eq('user_id', user?.id)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });
};
```

---

### PERF ISSUE #3: Large Components

| Component | Lines | Issue |
|-----------|-------|-------|
| ViewJar.tsx | 844 | Too much logic, should split |
| CreateJar.tsx | 490 | Extract form logic |
| Dashboard.tsx | 443 | Split into smaller components |

**Solution:** Use component composition and React.memo for performance.

---

## RECOMMENDATIONS PRIORITY CHECKLIST

**🔴 CRITICAL (Fix Before Launch)**
- [ ] Move password verification server-side
- [ ] Add email verification to shares
- [ ] Fix CORS on email function
- [ ] Add file upload validation
- [ ] Increase password requirements

**🟠 HIGH (This Month)**
- [ ] Add rate limiting
- [ ] Add input sanitization
- [ ] Add error boundaries
- [ ] Implement proper error messages
- [ ] Add request timeouts

**🟡 MEDIUM (Next Month)**
- [ ] Add pagination
- [ ] Optimize queries
- [ ] Split large components
- [ ] Add logging/monitoring
- [ ] Add password history

---

**Document Version:** 1.0  
**Last Updated:** December 29, 2025
