# VIVLIT - QUICK REFERENCE GUIDE

**Generated:** December 29, 2025

---

## 📊 PROJECT STATISTICS

| Metric | Value |
|--------|-------|
| **Total Files** | 150+ |
| **TypeScript Files** | 95+ |
| **React Components** | 70+ |
| **Pages** | 8 |
| **Dependencies** | 55+ |
| **Database Tables** | 8 |
| **API Integrations** | 3 (Supabase, Resend, Browser APIs) |
| **Lines of Code (Estimated)** | 15,000+ |

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│                   VIVLIT FRONTEND                    │
│              (React + TypeScript + Vite)             │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────────┐ ┌──▼──────────┐ ┌─▼──────────────┐
│  Supabase      │ │  Resend API │ │  Browser APIs  │
│  - Auth        │ │  - Email    │ │  - Storage     │
│  - Database    │ │    Service  │ │  - Recording   │
│  - Storage     │ │             │ │  - Clipboard   │
│  - Functions   │ └─────────────┘ └────────────────┘
└────────────────┘
```

---

## 🚀 KEY FEATURES

### Core Features (MVP1)
1. **User Authentication** - Email/password signup and login
2. **Jar Creation** - Create personalized jars with custom themes
3. **Multiple Note Types** - Text, Images, Voice, Links
4. **Decorative Charms** - Add visual elements to jars
5. **Email Sharing** - Send jars via email
6. **Account Sharing** - Share with other registered users
7. **Password Protection** - Secure jars with passwords
8. **Daily Open Limit** - Control how often notes can be opened
9. **Guest Sessions** - Create jars without signing up
10. **Activity Tracking** - See jar activity timeline

---

## 📁 FOLDER STRUCTURE QUICK MAP

```
src/
├── pages/              → 8 main pages (Auth, Dashboard, CreateJar, etc.)
├── components/         → UI and feature components
│   ├── landing/       → Landing page 3D components
│   ├── workspace/     → Jar creation interface
│   └── ui/            → shadcn/ui pre-built components
├── contexts/          → Auth context (global state)
├── hooks/             → Custom React hooks (Audio, Auth, Ghost Session)
├── integrations/      → Supabase integration
├── lib/               → Utilities (themes, confetti, utils)
└── pages/             → Page components

supabase/
├── functions/         → Edge functions (email service)
└── migrations/        → Database schema migrations (8 files)
```

---

## 🗄️ DATABASE ENTITIES

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **jars** | Core jar data | id, name, theme, user_id, share_token, open_mode, is_password_protected |
| **jar_notes** | Notes in jars | id, jar_id, content, content_type, media_url, note_order |
| **jar_charms** | Decorative elements | id, jar_id, charm_type, position_x, position_y, rotation, scale |
| **jar_shares** | Sharing info | id, jar_id, shared_by_user_id, shared_to_email, permission |
| **jar_user_state** | Per-user tracking | id, jar_id, user_id, notes_opened_today, last_opened_date |
| **jar_owners** | Multiple owners | id, jar_id, user_id, role |
| **jar_activity** | Activity log | id, jar_id, activity_type, metadata |
| **ghost_accounts** | Guest tracking | id, session_id, converted_to_user_id |

---

## 🔌 API INTEGRATION SUMMARY

### Supabase (Primary Backend)
```
Authentication:
- signUp()           → Create account
- signIn()           → Login
- signOut()          → Logout
- getSession()       → Get current session
- onAuthStateChange()→ Listen to auth changes

Database (Postgrest):
- select()           → Query data
- insert()           → Create records
- update()           → Modify records
- delete()           → Remove records
- rpc()              → Call stored functions

Storage:
- upload()           → Upload files
- download()         → Download files
- remove()           → Delete files
- getPublicUrl()     → Get shareable URL

Functions (Edge):
- invoke()           → Call serverless functions
```

### Resend (Email Service)
```
API Endpoint: https://api.resend.com/emails
Method: POST
Headers: Authorization: Bearer {RESEND_API_KEY}
Body: { from, to, subject, html }
```

### Browser APIs
```
- MediaRecorder     → Record audio
- Fetch API         → HTTP requests
- localStorage      → Persistent storage
- sessionStorage    → Session storage
- navigator.clipboard → Copy to clipboard
- URL.createObjectURL() → Create preview URLs
```

---

## 🔐 SECURITY POSTURE

### ✅ Strengths
- Row Level Security on all tables
- Supabase Auth handles passwords securely
- TypeScript for type safety
- Environment variables for secrets
- React auto-escapes XSS by default

### ❌ Critical Issues (Must Fix)
1. **Password verification on frontend** - Move to server
2. **Email access control bypass** - Add verification step
3. **CORS wide open** - Restrict to domain
4. **No file type validation** - Add MIME type checks
5. **Weak password requirements** - Increase minimum length

### ⚠️ High Priority Issues
6. No rate limiting on sensitive operations
7. No input sanitization
8. Missing error boundaries
9. No account lockout after failed attempts
10. File upload vulnerability

---

## 🎯 PERFORMANCE METRICS

| Issue | Impact | Fix Effort |
|-------|--------|-----------|
| Large components (800+ lines) | Slower render | 4-5 hours |
| No pagination | Memory usage | 3-4 hours |
| Unoptimized queries | Slow loading | 4-6 hours |
| No query caching | Repeated fetches | 2-3 hours |
| Large bundle size | Slow initial load | 3-4 hours |

---

## 📋 DEPLOYMENT CHECKLIST

### Before Going Live
- [ ] Security fixes implemented (critical issues)
- [ ] Error handling completed
- [ ] Performance optimizations done
- [ ] Testing coverage > 80%
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database backups tested
- [ ] Monitoring set up
- [ ] SSL certificate configured
- [ ] Privacy policy drafted
- [ ] Terms of service ready
- [ ] GDPR compliance reviewed
- [ ] Load testing completed
- [ ] Accessibility audit passed
- [ ] Security audit completed

### Post-Launch Monitoring
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Uptime monitoring
- [ ] Database backups automated
- [ ] Security patches applied
- [ ] User feedback collected

---

## 📚 FILE REFERENCE QUICK INDEX

### By Feature

**Authentication**
- `src/contexts/AuthContext.tsx` - Auth logic
- `src/pages/Auth.tsx` - Login/signup UI
- `src/hooks/useAuth.tsx` - Auth context hook

**Jar Creation**
- `src/pages/CreateJar.tsx` - Main creation page
- `src/components/workspace/JarSettings.tsx` - Jar config
- `src/components/workspace/NoteEditor.tsx` - Add notes
- `src/components/workspace/CharmsPalette.tsx` - Add charms
- `src/components/workspace/JarPreview.tsx` - Preview

**Jar Viewing**
- `src/pages/ViewJar.tsx` - View/open jars
- `src/components/JarVisual.tsx` - 3D jar visual
- `src/components/Charms.tsx` - Charm rendering

**Sharing**
- `src/components/ShareDialog.tsx` - Share UI
- `supabase/functions/send-jar-email/index.ts` - Email function

**Dashboard**
- `src/pages/Dashboard.tsx` - User dashboard
- Shows my jars, shared jars, activity

**Landing Page**
- `src/pages/Index.tsx` - Landing page
- `src/components/HeroSection.tsx`
- `src/components/FeaturesSection.tsx`
- `src/components/HowItWorksSection.tsx`
- `src/components/GallerySection.tsx`

---

## 🔧 TECH STACK VERSIONS

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI library |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool |
| Tailwind CSS | 3.4.17 | Styling |
| Shadcn/ui | Latest | UI components |
| React Router | 6.30.1 | Routing |
| Supabase JS | 2.89.0 | Backend |
| React Query | 5.83.0 | Data fetching |
| Three.js | 0.160.1 | 3D graphics |
| Framer Motion | 11.18.2 | Animations |
| Zod | 3.25.76 | Validation |
| React Hook Form | 7.61.1 | Form state |

---

## 🚨 TOP 5 ISSUES TO SOLVE FIRST

### 1. Server-Side Password Verification (2-3 hours)
**Impact:** CRITICAL - Current implementation vulnerable to client-side bypass
**Location:** `src/pages/ViewJar.tsx`
**Solution:** Create RPC function for password verification

### 2. Email Verification for Shares (4-5 hours)
**Impact:** CRITICAL - Anyone can claim they shared to any email
**Location:** `src/components/ShareDialog.tsx`
**Solution:** Add verification email step before granting access

### 3. CORS & Email Function Auth (2-3 hours)
**Impact:** CRITICAL - Function allows anyone to spam emails
**Location:** `supabase/functions/send-jar-email/index.ts`
**Solution:** Add origin validation and authentication

### 4. File Upload Validation (3-4 hours)
**Impact:** CRITICAL - Malicious files can be uploaded
**Location:** `src/pages/CreateJar.tsx`
**Solution:** Validate MIME types, sizes, and file signatures

### 5. Rate Limiting (3-4 hours)
**Impact:** HIGH - Can spam jars/emails/shares
**Location:** Multiple (Jar creation, email sending)
**Solution:** Implement request limits per user per hour

---

## 💡 QUICK WINS (Easy Improvements)

| Issue | Fix Time | Impact |
|-------|----------|--------|
| Improve error messages | 1 hour | Better UX |
| Add error boundaries | 1-2 hours | Stability |
| Add input length limits | 1 hour | Security |
| Increase password requirements | 30 min | Security |
| Add request timeouts | 1 hour | Reliability |
| Fix silent failures | 2 hours | UX |

---

## 🔗 DEPENDENCIES TO REVIEW

### Heavy Dependencies
- **Three.js (160KB)** - Only used on landing page, consider lazy loading
- **Framer Motion (67KB+)** - Used everywhere, hard to remove

### Review for Removal
- Check if all Radix UI components actually used
- Consider lighter animation library alternative

### Security Updates
- Regularly update `@supabase/supabase-js`
- Check for vulnerabilities in npm packages
- Use `npm audit` before each release

---

## 📞 SUPPORT & MAINTENANCE

### Common Issues & Solutions

**Issue: Jar not saving**
- Check network tab for 413 (payload too large)
- Verify file sizes under limits
- Check user_id in auth context

**Issue: Share email not received**
- Verify RESEND_API_KEY configured
- Check spam folder
- Review function logs in Supabase

**Issue: Notes not appearing**
- Check network request for jar_notes
- Verify note_order field
- Check RLS policies for jars table

**Issue: Password verification failing**
- Clear localStorage
- Try again after page refresh
- Check browser console for errors

---

## 📖 DOCUMENTATION FILES INCLUDED

1. **CODEBASE_ANALYSIS.md** - Complete code structure and features
2. **SECURITY_ERROR_HANDLING_ANALYSIS.md** - Detailed security audit
3. **QUICK_REFERENCE.md** - This file

---

## 🎓 LEARNING RESOURCES

### Supabase
- Docs: https://supabase.com/docs
- RLS: https://supabase.com/docs/guides/auth/row-level-security
- Auth: https://supabase.com/docs/guides/auth

### React
- Docs: https://react.dev
- Best Practices: https://kentcdodds.com/blog/application-state-management-with-react

### Security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CWE: https://cwe.mitre.org

---

**For detailed information, refer to:**
- `CODEBASE_ANALYSIS.md` - Complete technical analysis
- `SECURITY_ERROR_HANDLING_ANALYSIS.md` - Security deep-dive

---

**Document Version:** 1.0  
**Last Updated:** December 29, 2025
