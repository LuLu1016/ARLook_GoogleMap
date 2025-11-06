# 🏠 ARLook - AI-Powered Rental Assistant

<div align="center">

**An intelligent rental platform that combines Google Maps visualization with RAG-powered conversational search**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5--turbo-green)](https://openai.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Docs](#-api-documentation) • [Setup](../SETUP.md) • [Deployment](../DEPLOYMENT.md) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

ARLook is a cutting-edge rental assistant platform designed specifically for international students searching for properties near Wharton School in Philadelphia. It combines **interactive map visualization** with a **Retrieval-Augmented Generation (RAG) system** to deliver intelligent, context-aware property recommendations through natural language conversations.

### Key Highlights

- 🗺️ **Interactive Map Visualization** - Full-screen Google Maps with smart markers, walking time circles, and real-time filtering
- 🤖 **AI-Powered Search** - Natural language queries powered by OpenAI GPT-3.5-turbo with RAG
- 🔍 **Hybrid Retrieval** - Intelligent keyword, semantic, and hybrid search strategies
- ✅ **Hallucination Prevention** - Built-in verification system ensures all property mentions are real
- 🎯 **Intent Detection** - AI anticipates user needs and suggests next steps proactively
- 📊 **Performance Metrics** - Comprehensive RAG metrics tracking and monitoring

---

## ✨ Features

### 🗺️ Interactive Map Experience

- **Smart Marker System**: Color-coded markers based on budget match, AI recommendations, and filtering status
- **Walking Time Visualization**: Isochrone circles showing 10/20/30-minute walk zones from Wharton
- **Enhanced Info Windows**: Detailed property cards with amenities, pricing, and highlights
- **Real-time Filtering**: Price slider and amenities checkboxes that update map instantly

### 💬 Conversational AI Interface

- **Natural Language Search**: Ask questions in plain English or Chinese
- **Preset Quick Searches**: One-click prompts for common queries
- **Conversation Context**: Maintains context across multiple messages
- **Proactive Suggestions**: AI predicts user intent and suggests next steps

### 🔬 Advanced RAG System

- **Hybrid Retrieval**: Combines keyword matching, semantic search, and hybrid strategies
- **Intelligent Routing**: LLM automatically selects the best retrieval strategy
- **Verification Layer**: Multi-step verification prevents hallucinations
- **Performance Tracking**: Real-time metrics for retrieval accuracy and response quality

### 📊 Data Management

- **CSV Import**: Load properties from structured CSV files
- **Multiple Data Sources**: Support for hardcoded samples and CSV data
- **Future Support**: Planned integrations for Reddit, Google Maps, and 小红书 scrapers

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Maps API key ([Get one here](https://developers.google.com/maps/documentation/javascript/get-api-key))
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ARLook_RAG.git
cd ARLook_RAG

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup

**⚠️ IMPORTANT: Never commit API keys to Git!**

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your API keys** to `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

📖 **For detailed setup instructions, see [SETUP.md](../../SETUP.md)**

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌────────────────────┐  ┌──────────────────────────┐   │
│  │   Google Maps      │  │   Chat Sidebar           │   │
│  │   Component        │  │   Component              │   │
│  └────────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTP/API
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Application Server                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │            API Routes Layer                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐  │   │
│  │  │ /api/chat  │  │/api/props  │  │/api/test │  │   │
│  │  └────────────┘  └────────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         RAG Pipeline                             │   │
│  │  HybridRetriever → OpenAI → Verification         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Query
  ↓
RAG Retrieval (HybridRetriever)
  ├─ Route query (keyword/semantic/hybrid)
  ├─ Execute retrieval strategy
  └─ Return candidate properties
  ↓
OpenAI Generation
  ├─ Format properties into prompt
  ├─ Generate natural language response
  ├─ Extract filters from [DATA] JSON
  └─ Detect user intent & suggest next steps
  ↓
Verification & Sanitization
  ├─ Verify property mentions exist
  ├─ Check data consistency
  └─ Sanitize if hallucinations detected
  ↓
Response to Frontend
  ├─ Natural language response
  ├─ Verified properties
  ├─ Filters for map
  └─ RAG performance metrics
```

### Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Google Maps JavaScript API
- React Hooks

**Backend:**
- Next.js API Routes
- OpenAI GPT-3.5-turbo
- Custom RAG implementation
- CSV parsing

**Data:**
- CSV file import
- In-memory property storage
- Future: PostgreSQL/SQLite integration

---

## 📚 API Documentation

### POST `/api/chat`

Main endpoint for chat interactions with RAG-powered property search.

**Request:**
```json
{
  "message": "Apartments near Wharton with in-unit laundry",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "response": "AI-generated natural language response",
  "properties": [...],
  "count": 3,
  "filters": {
    "maxPrice": 2000,
    "amenities": ["In-unit laundry"],
    "maxWalkingDistance": 10
  },
  "retrieved_properties": [...],
  "verified_properties": [...],
  "search_strategy": "hybrid",
  "confidence": 0.85,
  "rag_metrics": {
    "retrievalAccuracy": 0.8,
    "responseAccuracy": 1.0,
    "hallucinationScore": 0.0,
    "propertyMentionedCount": 3,
    "propertyVerifiedCount": 3,
    "dataConsistency": 1.0,
    "warnings": []
  }
}
```

### GET `/api/properties`

Get all available properties.

**Response:**
```json
{
  "properties": [...],
  "count": 25
}
```

### GET `/api/test-rag`

Test RAG system performance with preset queries.

**Response:**
```json
{
  "status": "success",
  "summary": {
    "totalTests": 4,
    "averageRecall": 0.85,
    "averagePrecision": 0.90,
    "strategyAccuracy": 0.95,
    "overallScore": 0.90
  },
  "testResults": [...]
}
```

### POST `/api/test-rag`

Test a specific query and return detailed RAG metrics.

**Request:**
```json
{
  "query": "Apartments near Wharton"
}
```

See [ARCHITECTURE.md](../../ARCHITECTURE.md) for complete technical documentation.

---

## 📁 Project Structure

```
ARLook_RAG/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── chat/                 # Chat endpoint
│   │   ├── properties/            # Properties endpoint
│   │   └── ...
│   ├── components/               # React components
│   │   ├── MapContainer.tsx      # Google Maps component
│   │   └── ChatSidebar.tsx       # Chat interface
│   └── page.tsx                  # Main page
├── lib/                          # Business logic
│   ├── retrieval.ts              # RAG retrieval
│   ├── rag-verification.ts       # Hallucination prevention
│   ├── openai.ts                # OpenAI utilities
│   ├── csv-loader.ts            # CSV data loading
│   └── ...
├── types/                        # TypeScript types
├── data/                         # CSV data files
├── docs/                         # Documentation
│   ├── setup/                    # Setup guides
│   ├── testing/                  # Testing docs
│   ├── architecture/             # Architecture docs
│   └── deployment/               # Deployment guides
├── scripts/                      # Utility scripts
└── ...
```

For detailed architecture, see [ARCHITECTURE.md](../../ARCHITECTURE.md)

---

## 🧪 Testing

### Test RAG System

```bash
# Test all preset queries
curl http://localhost:3000/api/test-rag

# Test specific query
curl -X POST http://localhost:3000/api/test-rag \
  -H "Content-Type: application/json" \
  -d '{"query": "Apartments near Wharton"}'
```

### Monitor Metrics

Check browser console (F12) for:
- `📊 RAG Performance Metrics` - Detailed performance data
- `🔍 RAG Retrieval` - Retrieval statistics
- `⚠️ Hallucination detected` - Warnings if hallucinations found

---

## 🔒 Security & Best Practices

- **API Keys**: Never expose in client-side code (use environment variables)
- **Input Validation**: All user inputs are validated and sanitized
- **Hallucination Prevention**: Built-in verification prevents AI from making up properties
- **Rate Limiting**: Consider implementing for production use
- **Error Handling**: Comprehensive error handling with fallback mechanisms

---

## 🐛 Troubleshooting & Common Errors

### Google Maps Not Loading

**Symptom**: Map doesn't display, shows error message, or blank screen.

**Common Causes & Solutions**:

#### 1. **Environment Variable Not Loaded**
   - **Error**: `Google Maps API Key not configured`
   - **Solution**:
     ```bash
     # Ensure .env.local exists in src/ directory
     cd src
     cat .env.local | grep GOOGLE
     
     # Restart dev server after changing .env.local
     # Stop server (Ctrl+C) and run:
     npm run dev
     ```
   - **Important**: Next.js requires server restart to load new environment variables

#### 2. **API Key Restrictions (RefererNotAllowedMapError)**
   - **Error**: `RefererNotAllowedMapError` in browser console
   - **Solution**:
     1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
     2. Click on your API Key
     3. Under "Application restrictions", select "HTTP referrers (web sites)"
     4. Add these referrers:
        - `http://localhost:3000/*`
        - `http://127.0.0.1:3000/*`
        - `http://localhost:3000`
     5. Save and wait 1-2 minutes for changes to propagate

#### 3. **Maps JavaScript API Not Enabled (ApiNotActivatedMapError)**
   - **Error**: `ApiNotActivatedMapError` in browser console
   - **Solution**:
     1. Go to [Google Cloud Console API Library](https://console.cloud.google.com/apis/library)
     2. Search for "Maps JavaScript API"
     3. Click "Enable"
     4. Wait a few seconds, then refresh your browser

#### 4. **Invalid API Key (InvalidKeyMapError)**
   - **Error**: `InvalidKeyMapError` in browser console
   - **Solution**:
     1. Verify API key format (should start with `AIza`)
     2. Check `.env.local` file:
        ```bash
        # Correct format:
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBwyYq-3nFHRva9PFOZcRVhsUR4eIX5Vvc
        # NO spaces, NO quotes around the key
        ```
     3. Ensure API key restrictions allow "Maps JavaScript API":
        - Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
        - Edit your API Key
        - Under "API restrictions", ensure "Maps JavaScript API" is checked
        - Or select "Don't restrict key" (for testing only)

#### 5. **Environment Variable Not Accessible in Client**
   - **Error**: API key shows as empty in browser console
   - **Solution**:
     - Ensure variable name starts with `NEXT_PUBLIC_` prefix
     - Check file is named `.env.local` (not `.env.local.txt`)
     - File must be in `src/` directory (same level as `package.json`)
     - Restart dev server after changes
     - Check terminal output shows: `- Environments: .env.local`

#### 6. **Map Container Not Ready**
   - **Error**: Map ref not ready, retrying...
   - **Solution**:
     - This is usually a timing issue - the code automatically retries
     - If persists, check browser console for React errors
     - Ensure `MapContainer` component is properly mounted

### Debugging Steps

1. **Check Browser Console** (F12):
   - Look for error messages starting with `🗺️`, `❌`, or `⚠️`
   - Check for Google Maps API errors

2. **Verify Environment Variables**:
   ```bash
   cd src
   cat .env.local
   # Should show:
   # NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
   # OPENAI_API_KEY=sk-...
   ```

3. **Check Server Logs**:
   - Look for `- Environments: .env.local` in terminal
   - Check for any error messages during startup

4. **Test API Key Directly**:
   ```bash
   # Test if API key works (replace YOUR_KEY with actual key)
   curl "https://maps.googleapis.com/maps/api/js?key=YOUR_KEY"
   ```

5. **Verify Google Cloud Console Settings**:
   - API enabled: [Maps JavaScript API](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com)
   - API Key restrictions: [Credentials](https://console.cloud.google.com/apis/credentials)
   - Billing enabled (required for Google Maps API)

### OpenAI API Issues

**Symptom**: Chat not working, API errors.

**Solutions**:
- Verify API key format: `sk-proj-...` or `sk-...`
- Check account has sufficient credits
- Ensure API key has proper permissions
- Verify `.env.local` has `OPENAI_API_KEY` (no `NEXT_PUBLIC_` prefix needed)
- Restart dev server after changes

### Properties Not Showing on Map

**Symptom**: Map loads but no markers appear.

**Solutions**:
- Check browser console for coordinate validation warnings
- Verify properties have valid coordinates (lat: 39.94-39.96, lng: -75.22 to -75.15)
- Check `/api/properties` endpoint returns data:
  ```bash
  curl http://localhost:3000/api/properties
  ```
- Ensure filters aren't hiding all properties (check filter state in React DevTools)

### Common Mistakes to Avoid

1. ❌ **Wrong file location**: `.env.local` must be in `src/` directory
2. ❌ **Wrong variable name**: Must be `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (not `GOOGLE_MAPS_API_KEY`)
3. ❌ **Quotes around values**: Use `KEY=value` not `KEY="value"`
4. ❌ **Spaces around equals**: Use `KEY=value` not `KEY = value`
5. ❌ **Forgetting to restart**: Always restart dev server after changing `.env.local`
6. ❌ **API restrictions too strict**: Ensure localhost is allowed in HTTP referrers
7. ❌ **API not enabled**: Must enable "Maps JavaScript API" in Google Cloud Console

---

## 🛣️ Roadmap

### Phase 1: Data Collection ✅
- [x] CSV data import
- [x] Hardcoded sample properties
- [ ] Reddit scraper
- [ ] Google Maps reviews scraper
- [ ] 小红书 (Xiaohongshu) scraper

### Phase 2: Enhanced RAG 🔄
- [x] Hybrid retrieval system
- [x] Hallucination prevention
- [ ] Real vector database (Pinecone/Weaviate)
- [ ] OpenAI embeddings API integration
- [ ] Reranking algorithm

### Phase 3: Data Verification 🔜
- [ ] Admin interface for manual verification
- [ ] User feedback collection
- [ ] Quality scoring system

### Phase 4: Performance & Scale 🔜
- [ ] Database integration (PostgreSQL)
- [ ] Caching layer (Redis)
- [ ] Pagination for large datasets
- [ ] Marker clustering for map performance

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### For LLM/RAG Collaborators

See [ARCHITECTURE.md](../../ARCHITECTURE.md) for:
- Complete API specifications
- RAG system internals
- Extension points
- Data structure details
- Testing procedures

### Development Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by [Wanderboat.ai](https://wanderboat.ai) interaction patterns
- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- Maps by [Google Maps Platform](https://mapsplatform.google.com/)

---

## 📚 Documentation

- **[Setup Guide](../../SETUP.md)** - Complete setup instructions
- **[Deployment Guide](../../DEPLOYMENT.md)** - Deploy to production
- **[Architecture](../../ARCHITECTURE.md)** - Technical documentation

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ARLook_RAG/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ARLook_RAG/discussions)

---

<div align="center">

**Made with ❤️ for international students**

⭐ Star this repo if you find it helpful!

</div>
