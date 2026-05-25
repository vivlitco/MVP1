
# Render Static Site Deployment Guide for Vivlit

## 🚀 Quick Checklist: Deploy Vivlit Now

1. **Push your latest code to GitHub**
2. **Go to [Render Dashboard](https://dashboard.render.com)**
3. **Click "New +" → Select "Static Site"**
4. **Connect your GitHub repo and select the Vivlit project**
5. **Set these settings:**
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variables:** (see below)
6. **Add SPA Rewrite Rule:**
   - In "Redirects/Rewrites", add: `/*    /index.html    200`
7. **Click "Create Static Site"**
8. **Wait for build & deploy to finish**
9. **Add your custom domain (vivlit.com) in Render dashboard**
10. **Update your domain registrar to use Render's nameservers**
11. **Test your site at vivlit.com**
12. **Configure Supabase Edge Function secret for email (see below)**

---

## Prerequisites
- GitHub repository with code
- Render account (https://render.com)
- vivlit.com domain purchased
- Supabase project setup
- Resend API key for email service

---


## Step 1: Connect GitHub Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" button → Select "Static Site"
3. Click "Connect a repository"
4. Select your GitHub repository with Vivlit code
5. Click "Connect"

---


## Step 2: Configure Static Site

### Basic Settings

| Setting            | Value                                   |
|--------------------|-----------------------------------------|
| **Name**           | vivlit                                  |
| **Build Command**  | `npm ci && npm run build`                |
| **Publish Dir**    | `dist`                                  |
| **Region**         | Select your preferred region             |

### Environment Variables

Add these environment variables in Render dashboard:

```
# Application Config
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_APP_URL=https://vivlit.com

# Build Settings (Force npm, skip Bun)
NODE_VERSION=20.18.0
BUN_VERSION=
```

**Important notes:**
1. Do NOT set `NODE_ENV` – it prevents devDependencies from installing
2. `BUN_VERSION=` (empty) disables Bun and forces npm
3. Make sure your GitHub repo does NOT have `bun.lockb` file

**To get these values:**
1. Supabase values from your project settings
2. VITE_APP_URL should be https://vivlit.com
3. NODE_VERSION and NPM_VERSION ensure npm is used (not Bun)

**Do NOT add RESEND_API_KEY here!**
   - It should be set as a secret in Supabase Edge Functions only (see below).

### SPA Routing (React Router)

**Add this rewrite rule in Render's "Redirects/Rewrites" section:**

```
/*    /index.html    200
```

This ensures all routes (e.g., `/jar/:token`) work on refresh.

---


## Step 3: Configure Custom Domain

### Option A: Using Render's Nameservers (Recommended for Hostinger)

1. In Render dashboard, click your "vivlit" static site
2. Click "Settings" tab
3. Scroll to "Custom Domains"
4. Click "Add Custom Domain"
5. Enter: `vivlit.com`
6. **Copy the 4 nameservers Render provides**
7. Go to Hostinger dashboard
8. Find your domain (vivlit.com) → Click "Manage Domain"
9. Go to "Nameservers" or "DNS Settings" → Click "Edit"
10. Replace all existing nameservers with Render's 4 nameservers
11. Save changes in Hostinger
12. Wait for DNS propagation (24-48 hours)
13. Render will auto-verify and enable HTTPS

**Check DNS status:** https://whatsmydns.net/

### Option B: Using CNAME Record (Faster, but more complex)

1. In Render dashboard, get your service URL (like `vivlit-xxxxx.onrender.com`)
2. Go to domain registrar
3. Add CNAME record:
   - Name: `vivlit.com` (or `www`)
   - Value: `vivlit-xxxxx.onrender.com`
4. Add another CNAME for www subdomain if needed

### Option C: Using A Records

1. Get Render's IP from your service URL
2. Add A record pointing to that IP
3. Create CNAME for www if needed

---


## Step 4: SSL/TLS Certificate

Render automatically provisions SSL certificates via Let's Encrypt. Once domain is configured:

1. HTTPS will be automatically enabled
2. Certificate renews automatically
3. All traffic is encrypted

---


## Step 5: Verify Deployment

### Check Service Status
1. Go to Render dashboard
2. Click your "vivlit" service
3. Check "Logs" tab for any errors
4. Service should show "Live" status

### Test Website
1. Open https://vivlit.com in browser
2. Check that site loads correctly
3. Verify no mixed content warnings
4. Test features (create jar, share, etc.)

### Test Email Functionality
1. Create a jar and try sharing via email
2. Check that email is received
3. Verify links work correctly

---


## Step 6: Configure Supabase Edge Function for Email


Your Resend email function needs the RESEND_API_KEY configured in Supabase (not in Render):

1. Go to Supabase dashboard
2. Click "Functions" in sidebar
3. Click "send-jar-email" function
4. Click "Configuration"
5. Add secret: `RESEND_API_KEY=your-api-key`
6. Deploy function

---


## Monitoring & Maintenance

### View Logs
- Render dashboard → Service → Logs tab
- Check for errors and performance issues

### Monitor Performance
- Render provides analytics in dashboard
- Check response times and uptime

### Auto-Deploy
- Render automatically deploys on `main` branch pushes
- No manual deployment needed

### Redeploy Manually
1. Render dashboard → Service
2. Click "Manual Deploy" button
3. Select branch (usually `main`)
4. Click "Deploy"

---


## Troubleshooting

### Domain Not Resolving
- Check DNS has propagated (wait 24-48 hours)
- Verify nameservers are correct
- Use `nslookup vivlit.com` to check DNS

### Build Fails
- Check "Logs" tab in Render dashboard
- Verify all environment variables are set
- Ensure package.json has correct dependencies
- Run `npm run build` locally to test

### Service Keeps Crashing
- Check logs for errors
- Verify environment variables
- Ensure Supabase is accessible
- Check CORS settings

### Email Not Sending
- Verify RESEND_API_KEY is correct
- Check Supabase function logs
- Ensure sender email is correct format
- Check spam folder

### SSL Certificate Issues
- Render auto-provisions Let's Encrypt certs
- If issues persist, try re-adding domain
- Clear browser cache

---


## Performance Tips

1. **Enable Caching**
   - Render caches build artifacts
   - Static files cached automatically

2. **Monitor Database**
   - Check Supabase query performance
   - Add indexes for frequently queried columns

3. **Optimize Bundle**
   - Run `npm run build` locally to check size
   - Use dynamic imports for large components

4. **CDN Usage**
   - Consider adding Cloudflare CDN in front
   - Renders HTTPS already (no need for Cloudflare SSL)

---


## Cost Considerations

### Render Pricing
- **Starter Plan**: Free tier available (limited)
- **Standard Plan**: ~$7/month minimum
- Check current pricing at render.com

### Domain Costs
- vivlit.com domain: ~$10-15/year
- Renew automatically or manage manually

### Supabase Costs
- Free tier: Generous limits
- Paid: Pay-as-you-go after free tier

### Resend Costs
- Free tier: 100 emails/day
- Paid: Based on actual sends (~$0.0005/email)

---


## Next Steps After Deployment

1. ✅ Set up analytics (Google Analytics, Vercel Analytics)
2. ✅ Add monitoring (Sentry for error tracking)
3. ✅ Set up backups (Supabase auto-backups)
4. ✅ Configure email service limits
5. ✅ Test all features thoroughly
6. ✅ Set up CI/CD pipeline
7. ✅ Create deployment checklist
8. ✅ Document any custom configurations

---


## Support & Resources

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs
- **Vivlit GitHub**: Your repository URL

---

**Last Updated**: January 2026
**Vivlit Version**: 1.0
**Deployment Platform**: Render.com (Static Site)
**Domain**: vivlit.com
