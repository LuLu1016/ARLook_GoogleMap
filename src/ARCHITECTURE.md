# 🏗️ Architecture

Technical documentation for ARLook developers.

## Overview

ARLook is a Next.js 15 application combining **Google Maps visualization** with an **AI-powered RAG system** for property search.

## System Architecture

```
Client Browser
  ├── Google Maps Component
  └── Chat Sidebar Component
         │
         │ HTTP/API
         ▼
Next.js Server
  ├── API Routes (/api/chat, /api/properties)
  └── RAG Pipeline
       ├── HybridRetriever
       ├── OpenAI
       └── Verification
```

## Core Components

### API Routes

**POST `/api/chat`** - Main RAG endpoint
- Handles user chat messages
- Retrieves properties via RAG
- Generates AI responses
- Returns properties, filters, and metrics

**GET `/api/properties`** - Get all properties

**GET/POST `/api/test-rag`** - Test RAG system

### RAG System

**HybridRetriever** - Three retrieval strategies:
1. Keyword Search - Exact matching
2. Semantic Search - Vector similarity
3. Hybrid Search - Combined approach

**Verification** - Prevents hallucinations:
- Validates property existence
- Checks data consistency
- Sanitizes responses

## Data Structures

```typescript
interface Property {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  description: string;
  walkingDistanceToWharton?: number;
}
```

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   └── page.tsx     # Main page
├── client/          # Client components
│   └── components/  # React components
├── server/          # Server services
│   ├── services/    # RAG, OpenAI
│   └── utils/       # Utilities
├── shared/          # Shared types/constants
└── data/            # CSV data files
```

## Extension Points

**Add Data Sources:**
- Create loader in `server/utils/`
- Update CSV loader to integrate

**Enhance Retrieval:**
- Modify `server/services/rag/retrieval.ts`
- Add real vector embeddings
- Implement reranking

**Improve Verification:**
- Enhance `server/services/rag/verification.ts`
- Add confidence thresholds

## Testing

```bash
# Test RAG system
curl http://localhost:3000/api/test-rag

# Test specific query
curl -X POST http://localhost:3000/api/test-rag \
  -H "Content-Type: application/json" \
  -d '{"query": "Apartments near Wharton"}'
```

## Performance

**Current:**
- In-memory property storage
- Simulated embeddings
- CSV parsing on request

**Optimization Opportunities:**
- Add database (PostgreSQL)
- Implement caching (Redis)
- Use vector database (Pinecone/Weaviate)
- Batch CSV loading

## Related Documentation

- [README.md](./README.md) - Project overview
- [START_GUIDE.md](./START_GUIDE.md) - Setup instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
