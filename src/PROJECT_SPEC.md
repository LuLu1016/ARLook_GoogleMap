# ARLook Project Specification

## Vision Statement

ARLook is an AI-powered rental assistant platform designed to help international students navigate the challenging process of finding housing in a new country. By combining interactive Google Maps with intelligent conversational AI, ARLook eliminates the "blind rental" problem where students must make housing decisions without seeing properties in person.

## Core Value Proposition

- **Visual Exploration**: Interactive map interface for geographic understanding
- **Intelligent Filtering**: Natural language queries to find properties matching specific criteria
- **Contextual Recommendations**: AI-driven suggestions based on user preferences and constraints
- **Real-time Synchronization**: Seamless integration between map view and conversation state

## Feature Requirements

### 1. Map Interface

#### 1.1 Display Features
- Full-screen Google Maps integration
- Property markers with click interactions
- Price heatmap overlay (optional)
- Commute time circles (isochrones) from key locations
- Zoom and pan controls
- Map type toggle (satellite, terrain, default)

#### 1.2 Interaction Features
- Click marker to view property details
- Filter properties based on conversation queries
- Highlight matching properties
- Focus map on specific neighborhoods or areas

### 2. Conversational Interface

#### 2.1 Chat Features
- Message history display
- Input field for natural language queries
- Preset prompt suggestions
- Loading states during AI processing
- Error handling and retry mechanisms

#### 2.2 AI Capabilities
- Natural language understanding for property queries
- Property filtering and search
- Recommendation explanations
- Context-aware responses
- Multi-turn conversation support

### 3. Property Data

#### 3.1 Data Model
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
  squareFeet?: number;
  amenities: string[];
  description: string;
  images?: string[];
  availableDate?: string;
  leaseTerm?: string;
}
```

#### 3.2 Sample Data
- Hardcoded properties in Philadelphia area
- Focus on University City and Wharton School vicinity
- Include diverse price ranges and property types
- Realistic amenities and descriptions

### 4. RAG System

#### 4.1 Retrieval Strategy
- Vector embeddings for property descriptions
- Semantic search for natural language queries
- Filtering by explicit criteria (price, bedrooms, amenities)
- Ranking by relevance and user preferences

#### 4.2 Generation Strategy
- Context-aware responses using retrieved properties
- Personalized recommendations
- Explanations for why properties match queries
- Suggestions for refining searches

## Technical Architecture

### Frontend Components

```
App
├── MapContainer
│   ├── GoogleMap
│   ├── PropertyMarkers
│   └── MapControls
├── ChatSidebar
│   ├── MessageList
│   ├── MessageInput
│   └── PromptSuggestions
└── PropertyModal (optional)
```

### Backend API Routes

```
/api
├── /chat           # Handle chat messages
├── /properties      # Get property data
└── /search          # Search properties
```

### State Management

- Use React Context or Zustand for global state
- Synchronize map markers with filtered properties
- Maintain conversation history
- Track current map viewport

## User Experience Flow

### Initial State
1. User lands on page
2. Map displays Philadelphia area (default view)
3. Sidebar shows welcome message and preset prompts
4. No properties displayed initially

### Search Flow
1. User clicks preset prompt or types query
2. System processes query through RAG pipeline
3. Relevant properties retrieved and filtered
4. Map updates to show matching properties
5. Markers appear on map
6. Chat responds with property recommendations
7. User can click markers for details or refine search

### Refinement Flow
1. User adds additional criteria ("with parking", "under $1500")
2. System filters existing results
3. Map updates to show fewer/more properties
4. Chat explains filtering results

## Success Metrics

- Response time < 2 seconds for property queries
- Map updates smoothly without lag
- Accurate property retrieval (>80% relevance)
- User satisfaction with recommendation quality
- Successful property matching based on criteria

## Future Enhancements

- User authentication and saved searches
- SQLite database migration
- Advanced filtering UI
- Property comparison feature
- Integration with real estate APIs
- Multi-language support
- Mobile responsiveness optimization
- Saved properties and favorites
- Share property links

## Development Milestones

### Phase 1: Foundation
- [ ] Next.js project setup
- [ ] Google Maps integration
- [ ] Basic UI layout
- [ ] Sample property data

### Phase 2: Core Features
- [ ] Map markers display
- [ ] Chat interface
- [ ] Basic property filtering
- [ ] OpenAI API integration

### Phase 3: RAG Implementation
- [ ] Vector embeddings setup
- [ ] Semantic search
- [ ] Context-aware responses
- [ ] Property recommendations

### Phase 4: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] UI/UX improvements
- [ ] Performance optimization

### Phase 5: Enhancement
- [ ] Database migration
- [ ] Advanced features
- [ ] Testing
- [ ] Documentation

