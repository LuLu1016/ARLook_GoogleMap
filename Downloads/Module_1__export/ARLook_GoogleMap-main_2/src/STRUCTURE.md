# Codebase Structure

## Overview

The codebase is now organized with clear separation between backend and frontend code.

## Directory Structure

```
src/
├── app/                    # Next.js App Router (required)
│   ├── api/                # Backend API Routes
│   │   ├── chat/           # Main chat endpoint
│   │   ├── properties/      # Property queries
│   │   ├── search/          # Search endpoint
│   │   └── test-*/          # Test endpoints
│   ├── page.tsx            # Main frontend page
│   ├── layout.tsx          # Root layout
│   └── globals.css          # Global styles
│
├── server/                 # Backend code (server-side only)
│   ├── services/           # Business logic services
│   │   ├── rag/            # RAG system
│   │   │   ├── retrieval.ts        # HybridRetriever
│   │   │   ├── verification.ts    # Hallucination prevention
│   │   │   └── reasoning.ts        # Reasoning engine
│   │   ├── openai.ts       # OpenAI integration
│   │   └── properties.ts   # Property service (if needed)
│   └── utils/              # Backend utilities
│       ├── csv-loader.ts   # CSV data loading
│       └── context-aware.ts # Context awareness
│
├── client/                 # Frontend code (client-side)
│   ├── components/         # React components
│   │   ├── MapContainer.tsx
│   │   └── ChatSidebar.tsx
│   ├── hooks/              # Custom React hooks (future)
│   └── utils/              # Frontend utilities
│       └── google-maps.ts  # Google Maps helpers
│
└── shared/                 # Shared code (both client & server)
    ├── types/              # TypeScript types
    │   └── index.ts        # Property, Message, etc.
    └── constants/          # Shared constants
        └── properties.ts   # Sample properties, preset prompts
```

## Import Paths

### TypeScript Path Aliases (configured in tsconfig.json)

- `@/*` → Root of src directory
- `@/server/*` → Server-side code
- `@/client/*` → Client-side code
- `@/shared/*` → Shared code

### Examples

**In API routes (backend):**
```typescript
import { Property } from '@/shared/types';
import { HybridRetriever } from '@/server/services/rag/retrieval';
import { getAllProperties } from '@/server/utils/csv-loader';
```

**In React components (frontend):**
```typescript
import { Property } from '@/shared/types';
import { defaultMapConfig } from '@/client/utils/google-maps';
import { sampleProperties } from '@/shared/constants/properties';
```

## Separation Rules

### Backend (`server/`)
- ✅ Can import from `shared/`
- ✅ Can import from `server/`
- ❌ Should NOT import from `client/`
- ❌ Should NOT use React or browser APIs

### Frontend (`client/`)
- ✅ Can import from `shared/`
- ✅ Can import from `client/`
- ❌ Should NOT import from `server/` (except via API calls)
- ✅ Can use React, browser APIs

### Shared (`shared/`)
- ✅ Can only import from `shared/` or external packages
- ❌ Should NOT import from `server/` or `client/`
- ✅ Contains only types, constants, and pure utilities

## Benefits

1. **Clear Separation**: Easy to identify what's frontend vs backend
2. **Better Organization**: Related code grouped together
3. **Easier Maintenance**: Changes to one layer don't affect others
4. **Type Safety**: TypeScript path aliases ensure correct imports
5. **Scalability**: Easy to add new features in appropriate directories

## Migration Notes

- All old `@/lib/*` imports have been updated
- All old `@/types` imports now use `@/shared/types`
- Components moved from `app/components/` to `client/components/`
- Backend services organized in `server/services/`

