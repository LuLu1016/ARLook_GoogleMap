import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties } from '@/server/utils/csv-loader';
import { HybridRetriever } from '@/server/services/rag/retrieval';
import { verifyAndFilterProperties } from '@/server/services/rag/verification';

/**
 * GET /api/rag-status
 * Check RAG system status and verify it's working correctly
 */
export async function GET(request: NextRequest) {
  try {
    const allProperties = getAllProperties();
    const retriever = new HybridRetriever();
    
    // Test queries to verify RAG functionality
    const testQueries = [
      'Apartments near Wharton',
      'Properties with in-unit laundry under $2000',
      'Budget $1500-2000',
    ];
    
    const testResults = [];
    
    for (const query of testQueries) {
      const retrievalResult = await retriever.retrieve(query, allProperties);
      
      // Create mock response for verification
      const mockResponse = `Found ${retrievalResult.properties.length} properties: ${retrievalResult.properties.slice(0, 3).map(p => p.name).join(', ')}`;
      const verification = verifyAndFilterProperties(mockResponse, retrievalResult.properties);
      
      testResults.push({
        query,
        strategy: retrievalResult.strategy,
        confidence: retrievalResult.confidence,
        retrievedCount: retrievalResult.properties.length,
        verifiedCount: verification.verifiedProperties.length,
        hallucinationScore: verification.metrics.hallucinationScore,
        status: verification.metrics.hallucinationScore === 0 ? 'pass' : 'warning',
      });
    }
    
    const allPassed = testResults.every(r => r.status === 'pass');
    const avgConfidence = testResults.reduce((sum, r) => sum + r.confidence, 0) / testResults.length;
    
    return NextResponse.json({
      status: 'success',
      ragWorking: allPassed,
      summary: {
        totalProperties: allProperties.length,
        averageConfidence: avgConfidence.toFixed(3),
        allTestsPassed: allPassed,
      },
      testResults,
      recommendations: allPassed 
        ? ['RAG system is working correctly']
        : ['Consider improving retrieval accuracy', 'Check property data quality'],
    });
  } catch (error: any) {
    console.error('Error checking RAG status:', error);
    return NextResponse.json(
      { 
        status: 'error',
        ragWorking: false,
        error: error.message,
        recommendations: ['Check RAG system configuration', 'Verify property data is loaded correctly'],
      },
      { status: 500 }
    );
  }
}

