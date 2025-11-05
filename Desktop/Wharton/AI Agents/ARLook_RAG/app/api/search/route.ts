import { NextRequest, NextResponse } from 'next/server';
import { sampleProperties, filterPropertiesByMessage } from '@/lib/properties';

/**
 * POST /api/search
 * Search properties based on query string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Filter properties based on query
    let filteredProperties = filterPropertiesByMessage(query, sampleProperties);

    // Apply additional filters if provided
    if (filters) {
      if (filters.priceMin !== undefined) {
        filteredProperties = filteredProperties.filter(
          (p) => p.price >= filters.priceMin
        );
      }
      if (filters.priceMax !== undefined) {
        filteredProperties = filteredProperties.filter(
          (p) => p.price <= filters.priceMax
        );
      }
      if (filters.bedrooms !== undefined) {
        filteredProperties = filteredProperties.filter(
          (p) => p.bedrooms === filters.bedrooms
        );
      }
    }

    // Generate explanation
    const explanation = `找到 ${filteredProperties.length} 个匹配的房源`;

    return NextResponse.json({
      properties: filteredProperties,
      explanation,
      count: filteredProperties.length,
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

