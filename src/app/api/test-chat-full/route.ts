import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties } from '@/server/utils/csv-loader';
import { HybridRetriever } from '@/server/services/rag/retrieval';

/**
 * POST /api/test-chat-full
 * Test chat API with full response to verify message completeness
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queries = [] } = body;
    
    const testQueries = queries.length > 0 ? queries : [
      'Apartments near Wharton',
      'Properties with in-unit laundry under $2000',
      'Tell me about The Accolade',
      'Compare properties near Wharton',
      'What are the best options for international students?',
    ];
    
    const results = [];
    
    for (const query of testQueries) {
      try {
        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: query,
            conversationHistory: [],
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        const responseText = data.response || '';
        
        // Check for truncation indicators
        const hasTruncation = responseText.length > 0 && (
          responseText.endsWith('...') ||
          responseText.split('.').length < 2 || // Very short response
          (responseText.length > 500 && !responseText.includes('.')) // Long but no sentences
        );
        
        // Check for incomplete sentences
        const lastChar = responseText.trim().slice(-1);
        const endsProperly = ['.', '!', '?', ':', ';'].includes(lastChar);
        
        // Check for [DATA] tag that might cause issues
        const hasDataTag = responseText.includes('[DATA]');
        
        results.push({
          query,
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 150) + '...',
          fullResponse: responseText,
          issues: [
            ...(hasTruncation ? ['Response appears truncated'] : []),
            ...(!endsProperly && responseText.length > 50 ? ['Response ends abruptly'] : []),
            ...(hasDataTag ? ['Response contains [DATA] tag (should be removed)'] : []),
            ...(responseText.length === 0 ? ['Empty response'] : []),
            ...(responseText.length < 50 ? ['Response too short'] : []),
          ],
          status: hasTruncation || !endsProperly || hasDataTag ? 'issue' : 'ok',
        });
      } catch (error: any) {
        results.push({
          query,
          status: 'error',
          error: error.message,
        });
      }
    }
    
    return NextResponse.json({
      status: 'success',
      results,
      summary: {
        totalTests: results.length,
        ok: results.filter(r => r.status === 'ok').length,
        issues: results.filter(r => r.status === 'issue').length,
        errors: results.filter(r => r.status === 'error').length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to test chat', details: error.message },
      { status: 500 }
    );
  }
}

