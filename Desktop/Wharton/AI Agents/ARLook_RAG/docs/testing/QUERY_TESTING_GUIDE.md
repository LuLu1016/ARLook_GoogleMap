# Query Testing Guide

## Quick Test Commands

### Test RAG Retrieval (50 queries)

```bash
# Test all 50 queries
curl http://localhost:3000/api/test-queries > test-results.json

# View summary
curl http://localhost:3000/api/test-queries | jq '.summary'

# View failed tests
curl http://localhost:3000/api/test-queries | jq '.results[] | select(.status == "fail")'
```

### Test Full Chat API (with OpenAI)

```bash
# Test 10 queries with actual OpenAI responses
curl -X POST http://localhost:3000/api/test-chat-full \
  -H "Content-Type: application/json" \
  -d '{"testAll": true}' > chat-test-results.json

# View summary
curl -X POST http://localhost:3000/api/test-chat-full \
  -H "Content-Type: application/json" \
  -d '{"testAll": true}' | jq '.summary'
```

### Test Custom Queries

```bash
# Test specific queries
curl -X POST http://localhost:3000/api/test-queries \
  -H "Content-Type: application/json" \
  -d '{
    "testAll": false,
    "queries": [
      "Apartments near Wharton",
      "Properties with gym under $2000",
      "Show me luxury apartments"
    ]
  }'
```

## Test Categories

The 50 test cases cover:

1. **Location-based (10 queries)**: Near Wharton, walking distance, campus proximity
2. **Price-based (10 queries)**: Budget ranges, affordable, luxury
3. **Amenity-based (10 queries)**: Laundry, gym, parking, furnished
4. **Combined (10 queries)**: Multiple criteria together
5. **Room type (5 queries)**: 1b1b, 2b2b, studios
6. **Lifestyle (5 queries)**: Quiet, safe, modern, student-friendly

## Expected Output Structure

Each test result includes:

```json
{
  "query": "Apartments near Wharton",
  "category": "location",
  "status": "pass",
  "retrieval": {
    "propertyCount": 3,
    "confidence": 0.85,
    "strategy": "keyword"
  },
  "verification": {
    "hallucinationScore": 0,
    "responseAccuracy": 1.0,
    "dataConsistency": 1.0
  },
  "mapUpdate": {
    "wouldUpdate": true,
    "hasValidCoordinates": true,
    "propertyIds": ["1", "2", "3"]
  },
  "chatResponse": {
    "wouldHaveResponse": true,
    "mentionsProperties": true,
    "mentionsMap": true
  }
}
```

## Verification Checklist

For each query, verify:

- ✅ **Retrieval**: Returns relevant properties
- ✅ **Strategy**: Correct retrieval strategy selected
- ✅ **Hallucination**: No fake properties mentioned
- ✅ **Map Update**: Valid coordinates for all properties
- ✅ **Chat Response**: Natural language response generated
- ✅ **Map Mention**: Response mentions map update
- ✅ **Data Consistency**: Prices/distances match database

## Test Results Interpretation

### Status Codes

- **pass**: All checks passed
- **warning**: Some issues but functional
- **fail**: Critical issues
- **error**: API error

### Key Metrics

- **Pass Rate**: Percentage of passing tests
- **Average Confidence**: RAG retrieval confidence
- **Strategy Accuracy**: Correct strategy selection rate
- **Hallucination Score**: Lower is better (0 = perfect)

## Running Tests

### Option 1: Browser Console

```javascript
// Run all 50 tests
fetch('/api/test-queries')
  .then(r => r.json())
  .then(data => {
    console.log('Summary:', data.summary);
    console.log('Results:', data.results);
    console.log('Recommendations:', data.recommendations);
  });
```

### Option 2: Terminal

```bash
# Save full results to file
curl http://localhost:3000/api/test-queries > test-results-$(date +%Y%m%d).json

# View pass rate
curl http://localhost:3000/api/test-queries | jq '.summary.passRate'

# Find failed tests
curl http://localhost:3000/api/test-queries | jq '.results[] | select(.status == "fail") | .query'
```

### Option 3: Node.js Script

Create `scripts/run-tests.js`:

```javascript
const fetch = require('node-fetch');

async function runTests() {
  const response = await fetch('http://localhost:3000/api/test-queries');
  const data = await response.json();
  
  console.log('\n📊 Test Results Summary');
  console.log('====================');
  console.log(`Total Tests: ${data.summary.totalTests}`);
  console.log(`Passed: ${data.summary.passed}`);
  console.log(`Failed: ${data.summary.failed}`);
  console.log(`Pass Rate: ${data.summary.passRate}`);
  console.log('\nRecommendations:');
  data.recommendations.forEach(r => console.log(`  - ${r}`));
}

runTests();
```

## Continuous Testing

Add to `package.json`:

```json
{
  "scripts": {
    "test:rag": "curl http://localhost:3000/api/test-queries | jq '.summary'",
    "test:chat": "curl -X POST http://localhost:3000/api/test-chat-full -H 'Content-Type: application/json' -d '{\"testAll\":true}' | jq '.summary'"
  }
}
```

Then run:
```bash
npm run test:rag
npm run test:chat
```

