# 🏗️ Architecture Documentation

Complete technical documentation for ARLook developers and contributors.

## Overview

ARLook is a Next.js 15 application that combines **Google Maps visualization** with an **AI-powered RAG (Retrieval-Augmented Generation) system** for property search and recommendations.

## System Architecture

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

## Data Structures

### Core Types (`types/index.ts`)

```typescript
export interface Property {
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

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

## API Routes

### POST `/api/chat` - Main RAG Endpoint

Handles user chat messages with RAG-based property retrieval and AI response generation.

**Request:**
```json
{
  "message": "Apartments near Wharton with in-unit laundry",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "response": "AI-generated response",
  "properties": [...],
  "count": 3,
  "filters": {
    "maxPrice": 2000,
    "amenities": ["In-unit laundry"]
  },
  "rag_metrics": {
    "retrievalAccuracy": 0.8,
    "responseAccuracy": 1.0,
    "hallucinationScore": 0.0
  }
}
```

### GET `/api/properties`

Get all available properties.

### GET/POST `/api/test-rag`

Test RAG system performance with preset queries or custom queries.

## RAG System

### HybridRetriever

Intelligent query routing with three strategies:

1. **Keyword Search** - Exact matching on price, bedrooms, amenities
2. **Semantic Search** - Vector similarity (simulated embeddings)
3. **Hybrid Search** - Combines keyword + semantic results

### Hallucination Prevention

Multi-step verification ensures:
- Only real properties are mentioned
- Data consistency (price, distance accuracy)
- Response sanitization if hallucinations detected

## Project Structure

```
ARLook_GoogleMap/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   └── page.tsx          # Main page
├── lib/
│   ├── retrieval.ts      # RAG retrieval
│   ├── rag-verification.ts
│   ├── openai.ts
│   └── csv-loader.ts
├── types/
│   └── index.ts          # TypeScript types
└── data/                  # CSV data files
```

## Extension Points

### Add New Data Sources
- Create new loader in `lib/`
- Update `csv-loader.ts` to integrate

### Enhance Retrieval
- Modify `lib/retrieval.ts`
- Add real vector embeddings
- Implement reranking

### Improve Verification
- Enhance `lib/rag-verification.ts`
- Add more checks
- Implement confidence thresholds

## Testing

```bash
# Test RAG system
curl http://localhost:3000/api/test-rag

# Test specific query
curl -X POST http://localhost:3000/api/test-rag \
  -H "Content-Type: application/json" \
  -d '{"query": "Apartments near Wharton"}'
```

## Performance Considerations

### Current Limitations
- In-memory property storage
- Simulated embeddings
- CSV parsing on every request

### Optimization Opportunities
- Add database (PostgreSQL)
- Implement caching (Redis)
- Use real vector database (Pinecone/Weaviate)
- Batch CSV loading

## Related Documentation

- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Setup instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
