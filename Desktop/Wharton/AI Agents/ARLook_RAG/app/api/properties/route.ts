import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties } from '@/lib/csv-loader';

/**
 * GET /api/properties
 * Get all properties (CSV + sample)
 */
export async function GET(request: NextRequest) {
  try {
    const properties = getAllProperties();
    return NextResponse.json({
      properties,
      count: properties.length,
    });
  } catch (error: any) {
    console.error('Error loading properties:', error);
    return NextResponse.json(
      { error: 'Failed to load properties', details: error.message },
      { status: 500 }
    );
  }
}
