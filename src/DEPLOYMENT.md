# 🚀 Deployment Guide

Deploy ARLook to production on Vercel.

## Quick Deploy (Vercel)

### Option 1: GitHub Integration

1. Push code to GitHub
2. Visit [Vercel Dashboard](https://vercel.com/new)
3. Import repository
4. Add environment variables:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `OPENAI_API_KEY`
5. Deploy

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 3: Script

```bash
./deploy-to-vercel.sh
```

## Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `.env.local` in `.gitignore`
- [ ] API keys ready
- [ ] Local build succeeds: `cd src && npm run build`

## Post-Deployment

1. **Update Google Maps API Restrictions**
   - Add HTTP referrers: `https://*.vercel.app/*`
   - Add your domain: `https://your-project.vercel.app/*`

2. **Test Your Site**
   - Map displays correctly
   - Chat functionality works
   - API routes respond

## Environment Variables in Vercel

Set in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `OPENAI_API_KEY`

Select "All Environments" (Production, Preview, Development).

## Troubleshooting

**Build fails?**
- Check build logs in Vercel Dashboard
- Verify Node.js version compatibility
- Ensure all dependencies in `package.json`

**Map not displaying?**
- Verify API key in Vercel environment variables
- Update API key restrictions for your domain
- Check browser console for errors

**Environment variables not working?**
- Variables must be set in Vercel Dashboard (not just `.env.local`)
- Redeploy after adding variables
- Verify variable names match exactly (case-sensitive)

## Alternative Platforms

- **Netlify**: Free tier, good for static sites
- **Railway**: $5/month credit, good for apps with databases
- **Render**: Free tier, goes to sleep after inactivity

## Security

- Never commit `.env.local` to Git
- Use Vercel environment variables
- Restrict API keys with HTTP referrers
- Monitor API usage and set alerts
