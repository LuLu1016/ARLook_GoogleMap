# 🏠 ARLook - AI-Powered Rental Assistant

<div align="center">

**An intelligent rental platform that combines Google Maps visualization with RAG-powered conversational search**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5--turbo-green)](https://openai.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

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
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

📖 **For detailed setup instructions, see [SETUP_API_KEYS.md](./SETUP_API_KEYS.md)**

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

See [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) for complete API documentation.

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

详细结构说明请查看 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

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

See [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) for:
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

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ARLook_RAG/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ARLook_RAG/discussions)

---

<div align="center">

**Made with ❤️ for international students**

⭐ Star this repo if you find it helpful!

</div>
