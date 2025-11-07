#!/bin/bash
set -e

# ARLook RAG - Vercel Deployment Script
# Usage: ./deploy.sh
# 
# This script handles:
# - Vercel CLI installation and login
# - Project linking
# - Environment variable setup (optional)
# - Production deployment

echo "🚀 ARLook RAG - Deploy to Vercel"
echo "=================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check login status
echo "🔐 Checking Vercel login status..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in, please login..."
    vercel login
fi

# Show current user
echo ""
echo "✅ Logged in as: $(vercel whoami)"
echo ""

# Check if project is linked
if [ ! -f .vercel/project.json ]; then
    echo "📎 Linking project to Vercel..."
    vercel link --yes
fi

# Check environment variables
echo ""
echo "📋 Checking environment variables..."
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local file not found"
    echo "   You can still deploy, but make sure to set environment variables in Vercel Dashboard"
    echo ""
else
    # Check if required env vars exist
    if grep -q "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" .env.local && grep -q "OPENAI_API_KEY" .env.local; then
        echo "✅ Environment variables found in .env.local"
        echo "   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ✓"
        echo "   - OPENAI_API_KEY: ✓"
        echo ""
        
        # Ask if user wants to upload env vars
        read -p "Upload environment variables to Vercel? (y/n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "📝 Setting environment variables in Vercel..."
            
            # Read and set Google Maps API Key
            GOOGLE_KEY=$(grep "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" .env.local | cut -d '=' -f2 | tr -d ' ' | tr -d '"' | head -1)
            if [ ! -z "$GOOGLE_KEY" ]; then
                echo "   Setting NEXT_PUBLIC_GOOGLE_MAPS_API_KEY..."
                echo "$GOOGLE_KEY" | vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production 2>/dev/null || true
                echo "$GOOGLE_KEY" | vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY preview 2>/dev/null || true
                echo "$GOOGLE_KEY" | vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY development 2>/dev/null || true
            fi
            
            # Read and set OpenAI API Key
            OPENAI_KEY=$(grep "OPENAI_API_KEY" .env.local | cut -d '=' -f2 | tr -d ' ' | tr -d '"' | head -1)
            if [ ! -z "$OPENAI_KEY" ]; then
                echo "   Setting OPENAI_API_KEY..."
                echo "$OPENAI_KEY" | vercel env add OPENAI_API_KEY production 2>/dev/null || true
                echo "$OPENAI_KEY" | vercel env add OPENAI_API_KEY preview 2>/dev/null || true
                echo "$OPENAI_KEY" | vercel env add OPENAI_API_KEY development 2>/dev/null || true
            fi
            
            echo ""
        fi
    else
        echo "⚠️  Warning: Required environment variables not found in .env.local"
        echo "   Make sure to set them in Vercel Dashboard after deployment"
        echo ""
    fi
fi

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Visit Vercel Dashboard to view deployment status"
echo "2. Click 'Visit' in Deployments page to get your site URL"
echo "3. Update Google Maps API restrictions (add *.vercel.app)"
echo "4. Test your site functionality"
echo ""
