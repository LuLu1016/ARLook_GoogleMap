import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties } from '@/lib/csv-loader';
import { HybridRetriever } from '@/lib/retrieval';
import { verifyAndFilterProperties, RAGMetrics } from '@/lib/rag-verification';

/**
 * GET /api/test-rag
 * Test RAG system performance and accuracy
 */
export async function GET(request: NextRequest) {
  try {
    const allProperties = getAllProperties();
    const retriever = new HybridRetriever();
    
    // Test queries
    const testQueries = [
      {
        query: 'Wharton附近学生公寓',
        expectedType: 'keyword',
        expectedProperties: ['The Axis', 'evo', 'Cira Green'],
      },
      {
        query: '带室内洗烘房源',
        expectedType: 'keyword',
        expectedProperties: ['The Axis', 'evo', 'Cira Green', 'Penn Park Residences'],
      },
      {
        query: '预算$1500-2000',
        expectedType: 'keyword',
        expectedProperties: ['evo', 'The Axis', 'Penn Park Residences', 'Drexel Campus View'],
      },
      {
        query: '安静的学习环境',
        expectedType: 'semantic',
        expectedProperties: [],
      },
    ];

    const results = [];

    for (const test of testQueries) {
      const retrievalResult = await retriever.retrieve(test.query, allProperties);
      
      // Verify retrieved properties
      const retrievedNames = retrievalResult.properties.map(p => p.name);
      const expectedCount = test.expectedProperties.length;
      const actualCount = retrievalResult.properties.length;
      
      // Check if expected properties are in retrieved list
      const foundExpected = test.expectedProperties.filter(name =>
        retrievedNames.some(n => n.toLowerCase().includes(name.toLowerCase()))
      ).length;

      results.push({
        query: test.query,
        expectedStrategy: test.expectedType,
        actualStrategy: retrievalResult.strategy,
        strategyMatch: retrievalResult.strategy === test.expectedType,
        expectedProperties: test.expectedProperties,
        retrievedProperties: retrievedNames,
        foundExpectedCount: foundExpected,
        expectedCount,
        actualCount,
        recall: test.expectedProperties.length > 0 
          ? foundExpected / test.expectedProperties.length 
          : 1,
        precision: actualCount > 0 
          ? foundExpected / actualCount 
          : 0,
        confidence: retrievalResult.confidence,
      });
    }

    // Calculate overall metrics
    const avgRecall = results.reduce((sum, r) => sum + r.recall, 0) / results.length;
    const avgPrecision = results.reduce((sum, r) => sum + r.precision, 0) / results.length;
    const strategyAccuracy = results.filter(r => r.strategyMatch).length / results.length;

    return NextResponse.json({
      status: 'success',
      summary: {
        totalTests: testQueries.length,
        averageRecall: avgRecall.toFixed(3),
        averagePrecision: avgPrecision.toFixed(3),
        strategyAccuracy: strategyAccuracy.toFixed(3),
        overallScore: ((avgRecall + avgPrecision + strategyAccuracy) / 3).toFixed(3),
      },
      testResults: results,
      totalProperties: allProperties.length,
    });
  } catch (error: any) {
    console.error('Error testing RAG:', error);
    return NextResponse.json(
      { error: 'Failed to test RAG system', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test-rag
 * Test RAG with a specific query
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const allProperties = getAllProperties();
    const retriever = new HybridRetriever();
    
    const retrievalResult = await retriever.retrieve(query, allProperties);

    // Create a mock AI response for testing
    const mockResponse = `根据您的需求，我找到了${retrievalResult.properties.length}个匹配的房源：
${retrievalResult.properties.slice(0, 3).map((p, i) => `${i + 1}. ${p.name} - $${p.price}/月`).join('\n')}`;

    const verificationResult = verifyAndFilterProperties(
      mockResponse,
      retrievalResult.properties
    );

    return NextResponse.json({
      query,
      retrieval: {
        strategy: retrievalResult.strategy,
        confidence: retrievalResult.confidence,
        propertyCount: retrievalResult.properties.length,
        properties: retrievalResult.properties.map(p => ({
          name: p.name,
          price: p.price,
          walkingDistance: p.walkingDistanceToWharton,
        })),
      },
      verification: {
        metrics: verificationResult.metrics,
        verifiedProperties: verificationResult.verifiedProperties.map(p => p.name),
        sanitizedResponse: verificationResult.sanitizedResponse,
      },
    });
  } catch (error: any) {
    console.error('Error testing RAG query:', error);
    return NextResponse.json(
      { error: 'Failed to test RAG query', details: error.message },
      { status: 500 }
    );
  }
}

