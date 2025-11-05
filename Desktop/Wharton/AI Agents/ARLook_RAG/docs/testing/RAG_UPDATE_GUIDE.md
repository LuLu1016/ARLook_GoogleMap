# RAG System Verification & Database Update Guide

## RAG System Status Check

### Quick Verification

Check if RAG is working correctly:

```bash
curl http://localhost:3000/api/rag-status
```

This will:
- Test RAG retrieval with sample queries
- Verify hallucination prevention
- Check retrieval accuracy
- Provide recommendations

### Expected Response

```json
{
  "status": "success",
  "ragWorking": true,
  "summary": {
    "totalProperties": 25,
    "averageConfidence": 0.85,
    "allTestsPassed": true
  },
  "testResults": [...],
  "recommendations": ["RAG system is working correctly"]
}
```

---

## Current RAG Implementation Status

### ✅ Working Components

1. **HybridRetriever** (`lib/retrieval.ts`)
   - ✅ Keyword search (exact matching)
   - ✅ Semantic search (simulated embeddings)
   - ✅ Hybrid search (combines both)
   - ✅ LLM-based query routing

2. **Hallucination Prevention** (`lib/rag-verification.ts`)
   - ✅ Property mention verification
   - ✅ Data consistency checks
   - ✅ Response sanitization
   - ✅ Performance metrics

3. **Data Loading** (`lib/csv-loader.ts`)
   - ✅ CSV file parsing
   - ✅ Coordinate estimation
   - ✅ Amenity extraction

### ⚠️ Limitations

1. **Simulated Embeddings**: Currently using simple feature-based embeddings. Should use OpenAI embeddings API for production.
2. **No Real Vector DB**: Properties are stored in-memory. Should use Pinecone/Weaviate for scalability.
3. **Basic Geocoding**: Coordinates are estimated from addresses. Should use Google Geocoding API.

---

## Updating the Local Database

### Method 1: Update CSV File Directly

Edit `data/apartments.csv` and restart the server:

```bash
# Edit the CSV file
nano data/apartments.csv

# Restart server
npm run dev
```

**CSV Format:**
```csv
Apartment Name,Address,Walk to Wharton,Studio/1B1B Price Range,Furnished,Amenities/Notes,Safety,Good & Bad Reviews (see sources)
```

### Method 2: Use Admin API Endpoints

#### Add a Property

```bash
curl -X POST http://localhost:3000/api/admin/properties \
  -H "Content-Type: application/json" \
  -d '{
    "property": {
      "name": "New Apartment",
      "address": "123 Main St, Philadelphia, PA",
      "price": 1800,
      "bedrooms": 1,
      "bathrooms": 1,
      "amenities": ["In-unit laundry", "Gym"],
      "description": "Modern apartment",
      "walkingDistanceToWharton": 8
    }
  }'
```

#### Update a Property

```bash
curl -X PUT "http://localhost:3000/api/admin/properties?id=csv-1" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": {
      "price": 1900,
      "amenities": ["In-unit laundry", "Gym", "Parking"]
    }
  }'
```

#### Delete a Property

```bash
curl -X DELETE "http://localhost:3000/api/admin/properties?id=csv-1"
```

#### Get All Properties

```bash
curl http://localhost:3000/api/admin/properties
```

---

## Database Schema

### CSV Columns

| Column | Description | Example |
|--------|-------------|---------|
| Apartment Name | Property name | "The Axis" |
| Address | Full address | "3800 Chestnut St, Philadelphia, PA" |
| Walk to Wharton | Walking time in minutes | "10 min" or "25+ min" |
| Studio/1B1B Price Range | Price range | "$951–2,300+" or "$1,176+" |
| Furnished | Furnished status | "Yes" or "No" |
| Amenities/Notes | Amenities list | "In-unit WD, gym, student amenities" |
| Safety | Safety rating | "Very safe" |
| Good & Bad Reviews | Reviews/description | "Modern, luxury, costly for some" |

### Property TypeScript Interface

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
  walkingDistanceToWharton?: number; // minutes
}
```

---

## Data Update Workflow

### Recommended Workflow

1. **Bulk Import**: Update CSV file with new properties
2. **Verify**: Use `/api/admin/properties` to check data loaded correctly
3. **Test RAG**: Use `/api/rag-status` to verify RAG still works
4. **Manual Edits**: Use API endpoints for individual property updates

### Adding Properties from External Sources

#### From Reddit

1. Scrape Reddit posts (future feature)
2. Extract property info
3. Add to CSV or use API

#### From Google Maps

1. Scrape reviews (future feature)
2. Extract ratings and reviews
3. Update property descriptions

#### From 小红书

1. Scrape posts (future feature)
2. Extract Chinese-language reviews
3. Translate and add to database

---

## Data Validation

### Required Fields

- ✅ `name`: Property name (required)
- ✅ `address`: Full address (required)
- ✅ `price`: Monthly rent (required)
- ⚠️ `latitude`, `longitude`: Auto-estimated (should use geocoding API)
- ⚠️ `walkingDistanceToWharton`: Parsed from CSV (format: "10 min")

### Data Quality Checks

Run validation:

```bash
curl http://localhost:3000/api/admin/properties | jq '.properties | length'
```

Check for:
- Missing coordinates
- Invalid price ranges
- Missing amenities
- Duplicate properties

---

## Troubleshooting RAG Issues

### Issue: RAG Returns No Results

**Check:**
1. Are properties loaded? `GET /api/admin/properties`
2. Is query matching strategy? `POST /api/test-rag`
3. Check console logs for retrieval results

**Fix:**
- Verify CSV file exists and is readable
- Check property data format
- Test with simpler queries

### Issue: Hallucinations Detected

**Check:**
- `GET /api/rag-status` for hallucination scores
- Console logs for warnings

**Fix:**
- Verify property names in database match AI responses
- Check data consistency (price, distance)
- Review prompt instructions

### Issue: Low Retrieval Accuracy

**Check:**
- Test with `POST /api/test-rag`
- Review retrieval strategy selection
- Check keyword matching logic

**Fix:**
- Improve keyword extraction
- Enhance semantic search embeddings
- Add more training data

---

## Future Enhancements

### Planned Features

1. **Real Vector Database**
   - Use Pinecone or Weaviate
   - Store property embeddings
   - Improve semantic search

2. **Real Geocoding**
   - Google Geocoding API integration
   - Accurate coordinates for all properties
   - Address validation

3. **Data Scrapers**
   - Reddit scraper
   - Google Maps reviews scraper
   - 小红书 scraper

4. **Admin Interface**
   - Web UI for property management
   - Bulk import/export
   - Data validation dashboard

---

## Testing RAG Performance

### Run Full Test Suite

```bash
# Test RAG system
curl http://localhost:3000/api/test-rag

# Test specific query
curl -X POST http://localhost:3000/api/test-rag \
  -H "Content-Type: application/json" \
  -d '{"query": "Apartments near Wharton with gym"}'

# Check RAG status
curl http://localhost:3000/api/rag-status
```

### Monitor in Browser Console

When using the chat interface, check console for:
- `🔍 RAG Retrieval` - Retrieval statistics
- `📊 RAG Performance Metrics` - Detailed metrics
- `⚠️ Hallucination detected` - Warnings

---

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/rag-status` | GET | Check RAG health |
| `/api/test-rag` | GET/POST | Test RAG queries |
| `/api/admin/properties` | GET | List all properties |
| `/api/admin/properties` | POST | Add property |
| `/api/admin/properties?id=X` | PUT | Update property |
| `/api/admin/properties?id=X` | DELETE | Delete property |

---

## Notes

- **Data Persistence**: Currently CSV-based. In production, use PostgreSQL/SQLite.
- **Coordinates**: Estimated from addresses. Use Google Geocoding API for accuracy.
- **Embeddings**: Simulated. Use OpenAI embeddings API for better semantic search.
- **Scalability**: In-memory storage limits scalability. Add database for production.

