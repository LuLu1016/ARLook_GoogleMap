import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * POST /api/test-chat
 * Test actual chat API with real OpenAI responses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queries = [], testAll = false } = body;
    
    const testQueries = testAll ? [
      'Apartments near Wharton',
      'Properties with in-unit laundry under $2000',
      'Budget $1500-2000',
      'Furnished studios near school',
      'Compare The Axis and evo',
    ] : queries;
    
    const results = [];
    
    for (const query of testQueries) {
      try {
        // Call actual chat API
        const chatResponse = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: query,
            conversationHistory: [],
          }),
        });
        
        if (!chatResponse.ok) {
          throw new Error(`Chat API returned ${chatResponse.status}`);
        }
        
        const data = await chatResponse.json();
        
        // Verify response structure
        const hasResponse = !!data.response;
        const hasProperties = Array.isArray(data.properties) && data.properties.length > 0;
        const hasFilters = !!data.filters;
        const hasRAGMetrics = !!data.rag_metrics;
        
        // Check if properties would display on map
        const mapUpdateValid = hasProperties && data.properties.every((p: any) => 
          p.latitude && p.longitude && p.name
        );
        
        // Check response quality
        const responseLength = data.response?.length || 0;
        const mentionsProperties = data.response && data.properties.some((p: any) => 
          data.response.toLowerCase().includes(p.name.toLowerCase())
        );
        
        results.push({
          query,
          timestamp: new Date().toISOString(),
          chatApi: {
            status: chatResponse.status,
            hasResponse,
            hasProperties,
            hasFilters,
            hasRAGMetrics,
            responseLength,
            propertyCount: data.properties?.length || 0,
            mentionsProperties,
          },
          rag: {
            strategy: data.search_strategy,
            confidence: data.confidence,
            retrievedCount: data.retrieved_properties?.length || 0,
            verifiedCount: data.verified_properties?.length || 0,
          },
          metrics: data.rag_metrics ? {
            hallucinationScore: data.rag_metrics.hallucinationScore,
            responseAccuracy: data.rag_metrics.responseAccuracy,
            dataConsistency: data.rag_metrics.dataConsistency,
          } : null,
          mapUpdate: {
            wouldUpdate: mapUpdateValid,
            propertyIds: data.properties?.slice(0, 5).map((p: any) => p.id) || [],
            coordinatesValid: data.properties?.every((p: any) => 
              typeof p.latitude === 'number' && typeof p.longitude === 'number'
            ) || false,
          },
          status: hasResponse && hasProperties && mapUpdateValid && 
                  (!data.rag_metrics || data.rag_metrics.hallucinationScore === 0) ? 'pass' :
                  hasResponse && hasProperties ? 'warning' : 'fail',
          issues: [
            ...(!hasResponse ? ['No AI response'] : []),
            ...(!hasProperties ? ['No properties returned'] : []),
            ...(!mapUpdateValid ? ['Invalid map data'] : []),
            ...(data.rag_metrics && data.rag_metrics.hallucinationScore > 0 ? ['Hallucinations detected'] : []),
            ...(!data.properties?.every((p: any) => p.latitude && p.longitude) ? ['Missing coordinates'] : []),
          ],
        });
      } catch (error: any) {
        results.push({
          query,
          status: 'error',
          error: error.message,
        });
      }
    }
    
    const totalTests = results.length;
    const passed = results.filter(r => r.status === 'pass').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const errors = results.filter(r => r.status === 'error').length;
    
    return NextResponse.json({
      status: 'success',
      summary: {
        totalTests,
        passed,
        warnings,
        failed,
        errors,
        passRate: ((passed / totalTests) * 100).toFixed(2) + '%',
      },
      results,
    });
  } catch (error: any) {
    console.error('Error testing chat queries:', error);
    return NextResponse.json(
      { error: 'Failed to test chat queries', details: error.message },
      { status: 500 }
    );
  }
}

