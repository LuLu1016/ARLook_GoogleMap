# 🚀 Deployment Guide

Complete guide for deploying ARLook to production.

## Quick Start (Vercel - Recommended)

### Option 1: GitHub Integration (Easiest)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy via Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Login with GitHub
   - Select your repository → Import

3. **Configure Environment Variables**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = your Google Maps API key
     - `OPENAI_API_KEY` = your OpenAI API key
   - Select "All Environments" (Production, Preview, Development)

4. **Deploy** → Done!

### Option 2: Vercel CLI

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 3: Automated Script

```bash
./deploy-to-vercel.sh
```

## Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `.env.local` in `.gitignore` (never commit API keys)
- [ ] Google Maps API key ready
- [ ] OpenAI API key ready
- [ ] Local build succeeds: `npm run build`

## Post-Deployment Steps

1. **Update Google Maps API Restrictions**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Edit your API Key
   - Add HTTP referrers:
     ```
     https://*.vercel.app/*
     https://your-project.vercel.app/*
     ```

2. **Test Your Site**
   - Map displays correctly
   - Chat functionality works
   - API routes respond properly

## Alternative Platforms

### Netlify
- Free tier available
- Good for static sites
- Next.js support is less optimized than Vercel

### Railway
- $5/month free credit
- Requires credit card
- Good for apps with databases

### Render
- Free tier available
- Goes to sleep after inactivity
- Not ideal for production

## Troubleshooting

**Q: 404 error after deployment?**
- Check Git repository is connected in Vercel
- Verify deployment status is "Ready" (green)
- Check build logs for errors

**Q: Map not displaying?**
- Verify Google Maps API key is set correctly
- Update API key restrictions to include your domain
- Check browser console for errors

**Q: Environment variables not working?**
- Ensure variables are set in Vercel Dashboard (not just `.env.local`)
- Restart/redeploy after adding variables
- Verify variable names match exactly (case-sensitive)

**Q: Build fails?**
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use Vercel environment variables** - Don't hardcode keys
3. **Restrict API keys** - Set HTTP referrer restrictions for Google Maps
4. **Monitor usage** - Set up alerts for API usage
5. **Rotate keys regularly** - Especially if compromised

## Your Deployment URL

After successful deployment, find your URL in:
- Vercel Dashboard → Deployments → Latest deployment → "Visit" button
- Format: `https://your-project.vercel.app`

## Related Documentation

- [Setup Guide](./SETUP.md) - API key setup
- [README.md](./README.md) - Project overview
