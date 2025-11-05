# ARLook Backend Architecture & Data Structure Documentation

## Overview

ARLook is a Next.js 15 application that combines **Google Maps visualization** with an **AI-powered RAG (Retrieval-Augmented Generation) system** for property search and recommendations. This document provides comprehensive information for LLM/RAG builders to understand and extend the system.

---

## Data Structures

### Core Types (`types/index.ts`)

```typescript
export interface Property {
  id: string;                    // Unique identifier
  name: string;                   // Property name
  address: string;                // Full address
  latitude: number;               // GPS latitude
  longitude: number;               // GPS longitude
  price: number;                  // Monthly rent in USD
  bedrooms: number;               // Number of bedrooms
  bathrooms: number;              // Number of bathrooms (can be decimal, e.g., 1.5)
  amenities: string[];            // Array of amenity strings
  description: string;             // Property description
  walkingDistanceToWharton?: number; // Walking time to Wharton in minutes
}

export interface Message {
  id: string;                     // Unique message ID
  role: 'user' | 'assistant';     // Message sender
  content: string;                // Message content
  timestamp: Date;                 // Message timestamp
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  property?: Property;
}
```

### Extended Property Schema (Proposed)

For future enhancements, consider adding:

```typescript
export interface ExtendedProperty extends Property {
  // Media
  images?: string[];               // Property image URLs
  virtualTourUrl?: string;         // 3D tour link
  
  // Availability
  availableDate?: string;          // ISO date string
  leaseTerm?: string;              // e.g., "12 months"
  availableUnits?: number;         // Number of available units
  
  // Dimensions
  squareFeet?: number;             // Unit size
  
  // Financial
  utilitiesIncluded?: boolean;     // Are utilities included?
  securityDeposit?: number;         // Security deposit amount
  applicationFee?: number;         // Application fee
  
  // Metadata
  source?: string;                 // Data source (e.g., "reddit", "google_maps", "csv")
  sourceUrl?: string;               // Original source URL
  verified?: boolean;              // Has this been manually verified?
  verifiedBy?: string;             // Verifier username/ID
  verifiedAt?: Date;               // Verification timestamp
  
  // Reviews & Ratings
  averageRating?: number;          // 1-5 scale
  reviewCount?: number;            // Number of reviews
  reviews?: Review[];              // Individual reviews
  
  // Neighborhood
  neighborhood?: string;            // Neighborhood name
  walkScore?: number;               // Walkability score
  transitScore?: number;            // Public transit score
}

export interface Review {
  id: string;
  source: 'reddit' | 'google_maps' | 'xiaohongshu' | 'manual';
  author: string;
  rating: number;                  // 1-5 scale
  content: string;
  date: Date;
  verified: boolean;
}
```

---

## Backend API Architecture

### API Routes Overview

```
/app/api/
├── chat/route.ts          # Main chat endpoint (RAG + OpenAI)
├── properties/route.ts    # Get all properties
├── search/route.ts       # Property search endpoint
├── test-openai/route.ts  # OpenAI API testing
└── test-rag/route.ts     # RAG system testing
```

---

### 1. POST `/api/chat` - Main RAG Endpoint

**Purpose**: Handle user chat messages with RAG-based property retrieval and AI response generation.

**Request Body**:
```typescript
{
  message: string;                    // User's query
  conversationHistory?: Message[];    // Previous messages (optional)
}
```

**Response**:
```typescript
{
  response: string;                   // AI-generated response
  properties: Property[];              // Filtered properties to display
  count: number;                       // Number of properties
  filters?: {                          // Extracted filters from AI response
    maxPrice?: number;
    minPrice?: number;
    amenities?: string[];
    maxWalkingDistance?: number;
  };
  // RAG Metadata
  retrieved_properties: Property[];    // Properties retrieved by RAG
  verified_properties: Property[];     // Properties verified to prevent hallucinations
  search_strategy: 'keyword' | 'semantic' | 'hybrid';
  confidence: number;                 // 0-1 confidence score
  rag_metrics: {                       // RAG performance metrics
    retrievalAccuracy: number;
    responseAccuracy: number;
    hallucinationScore: number;        // Lower is better (0 = no hallucinations)
    propertyMentionedCount: number;
    propertyVerifiedCount: number;
    dataConsistency: number;
    warnings: string[];
  };
}
```

**Processing Flow**:
```
1. User sends message
   ↓
2. HybridRetriever.retrieve() → RAG retrieval
   ├─ Route query (keyword/semantic/hybrid)
   ├─ Execute retrieval strategy
   └─ Return candidate properties
   ↓
3. OpenAI GPT-3.5-turbo generation
   ├─ System prompt with retrieved properties
   ├─ Generate natural language response
   └─ Extract filters from [DATA] JSON
   ↓
4. Verification & Hallucination Prevention
   ├─ Verify property mentions exist in DB
   ├─ Check data consistency (price, distance, etc.)
   ├─ Sanitize response if hallucinations detected
   └─ Return verified properties only
   ↓
5. Return response + properties + metrics
```

**Key Files**:
- `app/api/chat/route.ts` - Main handler
- `lib/retrieval.ts` - HybridRetriever class
- `lib/rag-verification.ts` - Hallucination prevention
- `lib/openai.ts` - OpenAI utilities

---

### 2. GET `/api/properties` - Get All Properties

**Purpose**: Retrieve all available properties (CSV + hardcoded samples).

**Response**:
```typescript
{
  properties: Property[];
  count: number;
}
```

**Data Sources**:
- Hardcoded samples in `lib/csv-loader.ts`
- CSV file: `data/apartments.csv`
- Combined and deduplicated by name

---

### 3. POST `/api/search` - Property Search

**Purpose**: Search properties with filters (currently basic implementation).

**Request Body**:
```typescript
{
  query?: string;
  filters?: {
    maxPrice?: number;
    minPrice?: number;
    amenities?: string[];
    maxWalkingDistance?: number;
  };
}
```

---

### 4. GET `/api/test-rag` - RAG Performance Testing

**Purpose**: Test RAG system with preset queries and calculate metrics.

**Response**:
```typescript
{
  status: 'success';
  summary: {
    totalTests: number;
    averageRecall: number;
    averagePrecision: number;
    strategyAccuracy: number;
    overallScore: number;
  };
  testResults: Array<{
    query: string;
    expectedStrategy: string;
    actualStrategy: string;
    recall: number;
    precision: number;
    confidence: number;
  }>;
}
```

---

### 5. POST `/api/test-rag` - Test Specific Query

**Purpose**: Test a specific query and return detailed RAG metrics.

**Request Body**:
```typescript
{
  query: string;
}
```

**Response**:
```typescript
{
  query: string;
  retrieval: {
    strategy: 'keyword' | 'semantic' | 'hybrid';
    confidence: number;
    propertyCount: number;
    properties: Property[];
  };
  verification: {
    metrics: RAGMetrics;
    verifiedProperties: string[];
    sanitizedResponse: string;
  };
}
```

---

## RAG System Architecture

### HybridRetriever (`lib/retrieval.ts`)

**Purpose**: Intelligent query routing and property retrieval.

**Strategies**:

1. **Keyword Search** (`keyword`)
   - Exact matching on: price, bedrooms, bathrooms, amenities, walking distance
   - Scoring system: higher score = better match
   - Returns top 10 matches sorted by score

2. **Semantic Search** (`semantic`)
   - Vector similarity (simulated embeddings)
   - Text similarity based on description/amenities
   - Combined similarity score
   - Returns top 10 matches sorted by similarity

3. **Hybrid Search** (`hybrid`)
   - Combines keyword + semantic results
   - Deduplicates by property ID
   - Prioritizes keyword matches
   - Returns merged results

**Query Routing**:
- Uses OpenAI GPT-3.5-turbo to determine strategy
- Falls back to heuristic routing if OpenAI unavailable
- Heuristic: checks for explicit keywords (price, bedrooms, amenities) vs semantic keywords (quiet, comfortable, atmosphere)

**Key Methods**:
```typescript
class HybridRetriever {
  async retrieve(
    query: string,
    properties: Property[],
    openai?: OpenAI
  ): Promise<RetrievalResult>;
  
  keywordSearch(query: string, properties: Property[]): Property[];
  semanticSearch(query: string, properties: Property[]): Promise<Property[]>;
  async routeQuery(query: string, openai?: OpenAI): Promise<SearchStrategy>;
}
```

---

### Hallucination Prevention (`lib/rag-verification.ts`)

**Purpose**: Ensure AI responses only reference real properties and accurate data.

**Verification Steps**:

1. **Property Mention Verification**
   - Extract property names from AI response
   - Verify each mentioned property exists in retrieved list
   - Flag invalid mentions as hallucinations

2. **Data Consistency Check**
   - Verify prices match database (±$200 tolerance)
   - Verify walking distances match (±5 min tolerance)
   - Flag inconsistencies

3. **Response Sanitization**
   - Remove invalid property mentions
   - Clean up hallucinated data

**Metrics Calculated**:
- `retrievalAccuracy`: How relevant are retrieved properties?
- `responseAccuracy`: How many mentioned properties are verified?
- `hallucinationScore`: Lower is better (0 = no hallucinations)
- `dataConsistency`: How accurate is the data mentioned?

**Key Functions**:
```typescript
verifyPropertyMentions(aiResponse, retrievedProperties): VerificationResult
verifyDataConsistency(aiResponse, verifiedProperties): ConsistencyResult
calculateRAGMetrics(aiResponse, retrievedProperties, finalProperties): RAGMetrics
sanitizeAIResponse(aiResponse, retrievedProperties): SanitizedResponse
verifyAndFilterProperties(aiResponse, retrievedProperties, filters): VerificationResult
```

---

## Data Loading (`lib/csv-loader.ts`)

**Purpose**: Load and parse property data from CSV files.

**Functions**:
- `loadPropertiesFromCSV()`: Parse CSV file into Property objects
- `getAllProperties()`: Combine CSV + hardcoded samples (deduplicated)

**CSV Schema**:
```csv
Apartment Name,Address,Walk to Wharton,Studio/1B1B Price Range,Furnished,Amenities/Notes,Safety,Good & Bad Reviews (see sources)
```

**Parsing Logic**:
- `parseWalkingDistance()`: Extract minutes from "10 min" or "25+ min"
- `parsePriceRange()`: Average of range or single price
- `parseAmenities()`: Extract amenities from text
- `getCoordinates()`: Estimate lat/lng from address patterns

---

## OpenAI Integration (`lib/openai.ts`)

**Purpose**: Format data for OpenAI prompts and parse responses.

**Functions**:
- `formatPropertiesForPrompt()`: Convert Property[] to prompt text
- `parseAIResponse()`: Extract reply and filters from AI response
- `cleanAIResponse()`: Remove markdown/emoji from AI response
- `filterPropertiesByFilters()`: Apply filters to property list

**System Prompt Structure**:
1. Role: Professional rental consultant
2. Property database: List of properties
3. Response format: Natural language + [DATA] JSON
4. Anti-hallucination rules: Only reference properties in database

---

## Environment Variables

```bash
# Required
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional (for future features)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

---

## Extension Points for LLM/RAG Builders

### 1. Add New Data Sources

**Location**: `lib/csv-loader.ts` or create new loader

**Example**: Add Reddit scraper
```typescript
// lib/reddit-scraper.ts
export async function scrapeRedditProperties(subreddit: string): Promise<Property[]> {
  // Scrape Reddit posts
  // Parse property data
  // Return Property[]
}
```

### 2. Enhance Retrieval Strategy

**Location**: `lib/retrieval.ts`

**Options**:
- Add real vector embeddings (OpenAI embeddings API)
- Implement reranking algorithm
- Add more sophisticated keyword matching
- Improve semantic search with better embeddings

### 3. Improve Hallucination Prevention

**Location**: `lib/rag-verification.ts`

**Enhancements**:
- Add more verification checks (amenities, address format)
- Implement confidence thresholds
- Add logging/alerting for hallucinations

### 4. Add New API Endpoints

**Location**: `app/api/`

**Examples**:
- `/api/properties/:id` - Get single property
- `/api/verify` - Manual property verification endpoint
- `/api/feedback` - User feedback collection

### 5. Extend Data Model

**Location**: `types/index.ts`

**Steps**:
1. Add fields to `Property` interface
2. Update `csv-loader.ts` to parse new fields
3. Update RAG prompts to use new fields
4. Update frontend components

---

## Testing & Debugging

### Test RAG System
```bash
curl http://localhost:3000/api/test-rag
```

### Test Specific Query
```bash
curl -X POST http://localhost:3000/api/test-rag \
  -H "Content-Type: application/json" \
  -d '{"query": "Wharton附近学生公寓"}'
```

### Monitor Metrics
Check browser console for:
- `📊 RAG Performance Metrics`
- `🔍 RAG Retrieval`
- `⚠️ 检测到潜在幻觉` (if hallucinations detected)

---

## Performance Considerations

### Current Limitations
- In-memory property storage (no database)
- Simulated embeddings (not real vector DB)
- CSV parsing on every request

### Optimization Opportunities
- Add database (PostgreSQL/SQLite)
- Implement caching (Redis)
- Use real vector database (Pinecone/Weaviate)
- Batch CSV loading
- Add pagination for large property lists

---

## Security Notes

1. **API Keys**: Never expose in client-side code
2. **Input Validation**: All user inputs are validated
3. **Hallucination Prevention**: Critical for data accuracy
4. **Rate Limiting**: Consider adding for production

---

## Next Steps for LLM/RAG Builders

1. **Add Real Vector Database**: Replace simulated embeddings
2. **Enhance Retrieval**: Improve keyword/semantic search
3. **Add Data Sources**: Reddit, Google Maps, 小红书 scrapers
4. **Improve Verification**: More robust hallucination checks
5. **Add Analytics**: Track RAG performance over time

---

## File Structure Reference

```
/lib
├── retrieval.ts              # HybridRetriever class
├── rag-verification.ts      # Hallucination prevention
├── openai.ts                # OpenAI utilities
├── csv-loader.ts            # CSV data loading
├── properties.ts            # Hardcoded samples + filters
└── google-maps.ts           # Google Maps utilities

/app/api
├── chat/route.ts           # Main RAG endpoint
├── properties/route.ts     # Get all properties
├── search/route.ts          # Search endpoint
├── test-openai/route.ts    # OpenAI testing
└── test-rag/route.ts       # RAG testing

/types
└── index.ts                 # TypeScript type definitions
```

---

## Contact & Collaboration

For questions or collaboration:
- Review this document first
- Check existing code in `/lib` and `/app/api`
- Test endpoints using `/api/test-rag`
- Monitor console logs for RAG metrics

