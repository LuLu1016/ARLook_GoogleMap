# 🚀 Start Guide

Complete guide to get ARLook running locally.

## Prerequisites

- **Node.js**: 18.18.0+ or 20.0.0+ (`node --version`)
- **npm**: 8.x+ (comes with Node.js)
- **API Keys**: Google Maps & OpenAI

## Installation

### Quick Install (Recommended)

```bash
./install.sh
# or: python3 install.py
```

## Environment Setup

### 1. Get API Keys

**Google Maps API Key:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable "Maps JavaScript API"
3. Create API Key → Add restrictions:
   - HTTP referrers: `http://localhost:3000/*`
   - API restrictions: Maps JavaScript API only

**OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy key immediately (only shown once)

### 2. Configure `.env.local`

Edit `.env.local` (in root and `src/` directories):

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
OPENAI_API_KEY=your_openai_key_here
```

## Running the Application

./dev.sh
```

Open http://localhost:3000
