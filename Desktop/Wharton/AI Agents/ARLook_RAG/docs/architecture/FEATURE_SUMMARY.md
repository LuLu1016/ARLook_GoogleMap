# ARLook Feature Summary

## Overview

ARLook is an AI-powered rental assistant platform that combines **Google Maps visualization** with a **Retrieval-Augmented Generation (RAG) system** to help users find properties near Wharton School in Philadelphia.

---

## Core Features

### 1. Interactive Map Visualization
- **Google Maps Integration**: Full-screen map with property markers
- **Smart Marker System**: Color-coded markers based on:
  - Budget match (green)
  - AI recommendations (red/highlighted)
  - Default (blue)
  - Out of range (gray)
- **Walking Time Circles**: Isochrone visualization showing 10/20/30 min walk zones
- **Enhanced Info Windows**: Detailed property information on marker click
- **Map Controls**: Price slider and amenities filter checkboxes

### 2. AI-Powered Chat Interface
- **Natural Language Search**: Users can ask questions in plain English/Chinese
- **Preset Prompts**: Quick search buttons for common queries
- **Conversation History**: Maintains context across messages
- **Real-time Updates**: Map updates automatically when properties are found

### 3. RAG System
- **Hybrid Retrieval**: Combines keyword, semantic, and hybrid search strategies
- **Intelligent Routing**: LLM decides best retrieval strategy based on query
- **Hallucination Prevention**: Verifies all property mentions are real
- **Performance Metrics**: Tracks retrieval accuracy, response accuracy, and hallucination score

### 4. Property Filtering
- **Price Range**: Filter by maximum price
- **Amenities**: Filter by facilities (Gym, In-unit laundry, Parking, Pool)
- **Walking Distance**: Filter by distance to Wharton School
- **Bedrooms/Bathrooms**: Filter by unit size

### 5. Data Sources
- **CSV Import**: Loads properties from `data/apartments.csv`
- **Hardcoded Samples**: 5 sample properties for testing
- **Future**: Reddit, Google Maps, 小红书 scrapers (planned)

---

## Backend Architecture

### API Endpoints

#### POST `/api/chat`
Main endpoint for chat interactions.
- **Input**: User message + conversation history
- **Output**: AI response + filtered properties + RAG metrics
- **Process**: RAG retrieval → OpenAI generation → Verification → Response

#### GET `/api/properties`
Get all available properties.
- **Output**: List of all properties (CSV + samples)

#### POST `/api/search`
Search properties with filters.
- **Input**: Query string + filters
- **Output**: Matching properties

#### GET `/api/test-rag`
Test RAG system performance.
- **Output**: Performance metrics and test results

#### POST `/api/test-rag`
Test specific query.
- **Input**: Query string
- **Output**: Detailed RAG metrics for that query

### RAG Components

1. **HybridRetriever** (`lib/retrieval.ts`)
   - Keyword search: Exact matching on price, bedrooms, bathrooms, amenities
   - Semantic search: Vector similarity + text matching
   - Hybrid search: Combines both strategies
   - Query routing: LLM determines best strategy

2. **Hallucination Prevention** (`lib/rag-verification.ts`)
   - Property mention verification
   - Data consistency checks
   - Response sanitization
   - Performance metrics calculation

3. **OpenAI Integration** (`lib/openai.ts`)
   - Prompt formatting
   - Response parsing
   - Filter extraction from [DATA] JSON
   - Response cleaning

### Data Flow

```
User Query
  ↓
RAG Retrieval (HybridRetriever)
  ├─ Route query (keyword/semantic/hybrid)
  ├─ Execute retrieval
  └─ Return candidate properties
  ↓
OpenAI Generation
  ├─ Format properties into prompt
  ├─ Generate natural language response
  └─ Extract filters from [DATA] JSON
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

---

## Frontend Components

### MapContainer (`app/components/MapContainer.tsx`)
- Google Maps rendering
- Marker management
- Info window display
- Map controls (price slider, amenities filter)
- Walking time circles

### ChatSidebar (`app/components/ChatSidebar.tsx`)
- Chat message display
- Preset prompt buttons
- Input field with send button
- Loading states
- Empty state

### HomePage (`app/page.tsx`)
- Main layout coordination
- State management (properties, messages, filters)
- API calls to `/api/chat`
- Map-Chat synchronization

---

## Data Model

### Property Interface
```typescript
{
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
  walkingDistanceToWharton?: number; // minutes
}
```

---

## Key Files

### Backend
- `app/api/chat/route.ts` - Main chat endpoint
- `lib/retrieval.ts` - RAG retrieval logic
- `lib/rag-verification.ts` - Hallucination prevention
- `lib/openai.ts` - OpenAI utilities
- `lib/csv-loader.ts` - CSV data loading

### Frontend
- `app/page.tsx` - Main page
- `app/components/MapContainer.tsx` - Map component
- `app/components/ChatSidebar.tsx` - Chat component
- `types/index.ts` - TypeScript types

### Configuration
- `.env.local` - Environment variables (API keys)
- `tailwind.config.js` - Tailwind CSS config
- `package.json` - Dependencies

---

## Environment Variables

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
OPENAI_API_KEY=your_key
```

---

## Testing

### Test RAG System
```bash
curl http://localhost:3000/api/test-rag
```

### Monitor Metrics
Check browser console for:
- RAG Performance Metrics
- RAG Retrieval statistics
- Hallucination warnings

---

## Future Enhancements

1. **Data Collection System**
   - Reddit scraper
   - Google Maps reviews scraper
   - 小红书 (Xiaohongshu) scraper
   - Manual verification interface

2. **Enhanced RAG**
   - Real vector database (Pinecone/Weaviate)
   - Better embeddings (OpenAI embeddings API)
   - Reranking algorithm

3. **Data Verification**
   - Admin interface for manual verification
   - User feedback collection
   - Quality scoring system

4. **Performance**
   - Database integration (PostgreSQL)
   - Caching (Redis)
   - Pagination

---

## For LLM/RAG Collaborators

See `BACKEND_ARCHITECTURE.md` for detailed technical documentation including:
- Complete API specifications
- RAG system internals
- Extension points
- Data structure details
- Testing procedures

