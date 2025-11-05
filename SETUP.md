# 🔧 Setup Guide

Complete setup instructions for ARLook.

## Prerequisites

- Node.js 18+
- npm or yarn
- Google Maps API key
- OpenAI API key

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ARLook_GoogleMap.git
cd ARLook_GoogleMap

# Install dependencies
npm install
```

## Environment Variables

### Create `.env.local`

Create a `.env.local` file in the project root:

```bash
# Google Maps API Key (NEXT_PUBLIC_ prefix required for client-side)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenAI API Key (server-side only)
OPENAI_API_KEY=your_openai_api_key_here
```

**⚠️ IMPORTANT**: Never commit `.env.local` to Git! It's already in `.gitignore`.

## Getting API Keys

### Google Maps API Key

1. **Visit Google Cloud Console**
   - https://console.cloud.google.com/

2. **Create/Select Project**
   - Create new project or select existing one

3. **Enable Maps JavaScript API**
   - Go to "API & Services" > "Library"
   - Search "Maps JavaScript API"
   - Click "Enable"

4. **Create API Key**
   - Go to "API & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated key

5. **Configure Restrictions** (Recommended)
   - **Application restrictions**: HTTP referrers
     - Add: `http://localhost:3000/*`
     - Add: `https://your-domain.vercel.app/*` (for production)
   - **API restrictions**: Limit to "Maps JavaScript API"
   - Click "Save"

### OpenAI API Key

1. **Visit OpenAI Platform**
   - https://platform.openai.com/api-keys

2. **Create API Key**
   - Login to your account
   - Click "Create new secret key"
   - Copy the key (format: `sk-...`)
   - ⚠️ **Note**: Key only shown once, save it securely

3. **Account Setup**
   - Add payment method if needed
   - Set up usage limits (recommended)

## Verification

### Start Development Server

```bash
npm run dev
```

You should see:
```
- Environments: .env.local
```

### Test the Application

1. Open http://localhost:3000
2. **Map should display** - If not, check Google Maps API key
3. **Chat should work** - Test with: "Show me apartments near Wharton"

## Common Issues & Troubleshooting

### Issue: "This page didn't load Google Maps correctly"

**Solutions**:
1. **Check API Key Configuration**
   - Verify API key is correct in `.env.local`
   - Ensure format is correct (starts with `AIza`)
   - No extra spaces or quotes around the key

2. **Check Google Cloud Console**
   - Maps JavaScript API must be enabled
   - Go to: https://console.cloud.google.com/apis/library
   - Search "Maps JavaScript API" and ensure it's enabled

3. **Check API Key Restrictions**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Edit your API Key
   - **Application restrictions**: Select "HTTP referrers"
     - Add: `http://localhost:3000/*`
     - Add: `http://127.0.0.1:3000/*`
   - **API restrictions**: Select "Restrict key"
     - Check only "Maps JavaScript API"
   - Save changes

4. **Browser Console Errors**
   - Press F12 to open developer tools
   - Check Console tab for specific error messages
   - Common errors:
     - `RefererNotAllowedMapError` → Add localhost to HTTP referrers
     - `InvalidKeyMapError` → Check API key is correct
     - `MissingKeyMapError` → Ensure `.env.local` is configured

5. **Restart Dev Server**
   - Stop server (Ctrl+C)
   - Run `npm run dev` again

### Issue: OpenAI API calls fail

**Solutions**:
- Verify API key is correct (format: `sk-...`)
- Check account has sufficient credits
- Ensure API key has proper permissions
- Check network connectivity
- Verify API key is not expired

### Issue: Environment variables not loading

**Solutions**:
- File must be named `.env.local` (not `.env.local.txt`)
- File must be in project root directory (same level as `package.json`)
- No spaces around `=` in `KEY=VALUE`
- No quotes needed: `KEY=value` ✅ (not `KEY="value"` ❌)
- Restart dev server after changes
- Check terminal shows: `- Environments: .env.local`

### Issue: Map displays but markers don't show

**Solutions**:
- Check browser console for JavaScript errors
- Verify properties are loading: `GET /api/properties`
- Check network tab in developer tools
- Ensure data files exist in `data/` directory

### Issue: Chat doesn't respond

**Solutions**:
- Check OpenAI API key is set correctly
- Verify account has API access enabled
- Check browser console for errors
- Test API endpoint: `POST /api/chat` with a simple message

## Security Checklist

- [ ] `.env.local` created and configured
- [ ] `.env.local` in `.gitignore` (already done)
- [ ] Google Maps API key has restrictions set
- [ ] OpenAI API key kept secure
- [ ] Never share API keys in issues/pull requests

## Next Steps

After setup:
1. ✅ Test local development
2. ✅ Read [README.md](./README.md) for project overview
3. ✅ Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
4. ✅ Explore the codebase and start building!

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Deploy to production
- [README.md](./README.md) - Project documentation
