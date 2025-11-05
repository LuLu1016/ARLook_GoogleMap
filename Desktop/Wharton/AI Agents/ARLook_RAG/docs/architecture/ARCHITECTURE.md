# Architecture Documentation

## System Architecture

ARLook follows a modern full-stack architecture using Next.js 15 with the App Router pattern.

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌────────────────────┐  ┌──────────────────────────┐   │
│  │   Google Maps      │  │   Chat Sidebar           │   │
│  │   Component        │  │   Component              │   │
│  └────────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTP/WebSocket
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Application Server                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │            API Routes Layer                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐  │   │
│  │  │ /api/chat  │  │/api/props  │  │/api/search│  │   │
│  │  └────────────┘  └────────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │            RAG Processing Layer                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐  │   │
│  │  │Embeddings  │  │ Retrieval  │  │Generation│  │   │
│  │  └────────────┘  └────────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   OpenAI     │  │   Google     │  │   Property   │
│   API        │  │   Maps API   │  │   Database   │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Component Hierarchy

```
App (Root)
├── Layout
│   ├── Header (optional)
│   └── Main Container
│       ├── MapContainer
│       │   ├── GoogleMapWrapper
│       │   │   ├── Map Component
│       │   │   ├── PropertyMarkers
│       │   │   │   └── PropertyMarker (multiple)
│       │   │   └── MapControls
│       │   └── PropertyDetailsModal (optional)
│       └── ChatSidebar
│           ├── ChatHeader
│           ├── MessageList
│           │   └── Message (multiple)
│           ├── PromptSuggestions
│           │   └── PromptButton (multiple)
│           └── MessageInput
│               ├── Input Field
│               └── Send Button
```

## Data Flow

### Property Search Flow

```
User Input Query
    │
    ▼
Chat Component
    │
    ▼
API Route (/api/chat)
    │
    ▼
Query Processing
    ├── Parse Intent
    ├── Extract Filters
    └── Generate Embedding
    │
    ▼
RAG Retrieval
    ├── Vector Search
    ├── Filter Application
    └── Ranking
    │
    ▼
OpenAI Generation
    ├── Context Assembly
    ├── Response Generation
    └── Property Formatting
    │
    ▼
Response to Client
    │
    ▼
State Update
    ├── Update Chat Messages
    └── Update Map Markers
```

### Map Interaction Flow

```
User Clicks Marker
    │
    ▼
Marker Event Handler
    │
    ▼
Property Details Fetch
    │
    ▼
Display Property Info
    └── Modal or Sidebar
```

## State Management Strategy

### Global State (Context/Store)
- Current filtered properties
- Selected property
- Map viewport state
- Conversation history
- Loading states

### Local State (Component State)
- Input field value
- Modal open/close
- Map instance reference
- UI interaction states

## API Design

### POST /api/chat
Request:
```typescript
{
  message: string;
  conversationHistory?: Message[];
  filters?: PropertyFilters;
}
```

Response:
```typescript
{
  response: string;
  properties: Property[];
  filters: PropertyFilters;
}
```

### GET /api/properties
Query Parameters:
- `bounds`: Map bounds (north, south, east, west)
- `filters`: Filter criteria (price, bedrooms, etc.)

Response:
```typescript
{
  properties: Property[];
  total: number;
}
```

### POST /api/search
Request:
```typescript
{
  query: string;
  filters?: PropertyFilters;
}
```

Response:
```typescript
{
  properties: Property[];
  explanation: string;
}
```

## Database Schema (Future)

```sql
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  price INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms REAL NOT NULL,
  square_feet INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE amenities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id TEXT NOT NULL,
  amenity TEXT NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE property_embeddings (
  property_id TEXT PRIMARY KEY,
  embedding BLOB NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);
```

## Performance Considerations

### Optimization Strategies
1. **Map Rendering**: Use marker clustering for many properties
2. **API Caching**: Cache property data and embeddings
3. **Lazy Loading**: Load map and chat components on demand
4. **Debouncing**: Debounce search queries
5. **Virtualization**: Virtualize long message lists

### Monitoring
- API response times
- Map rendering performance
- User interaction latency
- Error rates

## Security Considerations

1. **API Keys**: Never expose in client-side code
2. **Input Validation**: Sanitize all user inputs
3. **Rate Limiting**: Implement rate limits on API routes
4. **CORS**: Configure proper CORS policies
5. **XSS Prevention**: Use React's built-in XSS protection

## Deployment Architecture

### Development
- Local Next.js dev server
- Local state management
- Direct API calls

### Production
- Vercel/Next.js deployment
- Edge functions for API routes
- CDN for static assets
- Database (SQLite initially, migrate to PostgreSQL)

