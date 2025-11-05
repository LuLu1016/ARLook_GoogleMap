# Environment Variables

Copy this file to `.env.local` and fill in your API keys.

## Required Variables

```bash
# Google Maps API Key
# Get it from: https://console.cloud.google.com/google/maps-apis
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenAI API Key
# Get it from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
```

## Optional Variables

```bash
# Development port (default: 3000)
PORT=3000

# Node environment
NODE_ENV=development
```

## Setup Instructions

1. Create a `.env.local` file in the root directory
2. Copy the variables above into the file
3. Replace the placeholder values with your actual API keys
4. Never commit `.env.local` to version control (already in .gitignore)

## API Key Setup

### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API (optional, for address lookups)
4. Create credentials (API Key)
5. Restrict the API key to your domain (recommended for production)

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new secret key
5. Copy and store securely (you won't be able to see it again)

## Security Notes

- Never expose API keys in client-side code
- Use environment variables for all sensitive data
- Restrict API keys to specific domains/IPs when possible
- Rotate keys regularly
- Use different keys for development and production

