import { NextRequest, NextResponse } from 'next/server';
import { Property } from '@/shared/types';
import { getAllProperties } from '@/server/utils/csv-loader';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

/**
 * GET /api/admin/properties
 * Get all properties (admin view with metadata)
 */
export async function GET(request: NextRequest) {
  try {
    const properties = getAllProperties();
    return NextResponse.json({
      status: 'success',
      properties,
      count: properties.length,
      dataSource: {
        csvFile: 'data/apartments.csv',
        hardcoded: 5,
        csvLoaded: properties.length - 5,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to load properties', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/properties
 * Add a new property to the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const property: Property = body.property;
    
    if (!property || !property.name || !property.address) {
      return NextResponse.json(
        { error: 'Property name and address are required' },
        { status: 400 }
      );
    }
    
    // TODO: In production, save to database
    // For now, append to CSV file
    const csvPath = path.join(process.cwd(), 'data', 'apartments.csv');
    
    // Read existing CSV
    const fileContent = fs.existsSync(csvPath) 
      ? fs.readFileSync(csvPath, 'utf-8')
      : 'Apartment Name,Address,Walk to Wharton,Studio/1B1B Price Range,Furnished,Amenities/Notes,Safety,Good & Bad Reviews (see sources)\n';
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    
    // Add new property
    const newRecord: any = {
      'Apartment Name': property.name,
      'Address': property.address,
      'Walk to Wharton': property.walkingDistanceToWharton ? `${property.walkingDistanceToWharton} min` : '-',
      'Studio/1B1B Price Range': `$${property.price}`,
      'Furnished': property.amenities.includes('Furnished') ? 'Yes' : 'No',
      'Amenities/Notes': property.amenities.join(', '),
      'Safety': 'Good',
      'Good & Bad Reviews (see sources)': property.description || '-',
    };
    
    records.push(newRecord);
    
    // Write back to CSV
    const csvOutput = stringify(records, {
      header: true,
      columns: Object.keys(newRecord),
    });
    
    fs.writeFileSync(csvPath, csvOutput, 'utf-8');
    
    return NextResponse.json({
      status: 'success',
      message: 'Property added successfully',
      property: {
        ...property,
        id: `csv-${records.length}`,
      },
    });
  } catch (error: any) {
    console.error('Error adding property:', error);
    return NextResponse.json(
      { error: 'Failed to add property', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/properties/:id
 * Update an existing property
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const updates: Partial<Property> = body.updates;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: In production, update in database
    // For now, update CSV file
    const csvPath = path.join(process.cwd(), 'data', 'apartments.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    
    // Find and update property
    const index = parseInt(id.replace('csv-', '')) - 1;
    if (index >= 0 && index < records.length) {
      const record = records[index] as any;
      if (updates.name) record['Apartment Name'] = updates.name;
      if (updates.address) record['Address'] = updates.address;
      if (updates.price) record['Studio/1B1B Price Range'] = `$${updates.price}`;
      if (updates.walkingDistanceToWharton) {
        record['Walk to Wharton'] = `${updates.walkingDistanceToWharton} min`;
      }
      if (updates.amenities) {
        record['Amenities/Notes'] = updates.amenities.join(', ');
        record['Furnished'] = updates.amenities.includes('Furnished') ? 'Yes' : 'No';
      }
      if (updates.description) {
        record['Good & Bad Reviews (see sources)'] = updates.description;
      }
      
      // Write back to CSV
      const csvOutput = stringify(records, {
        header: true,
        columns: Object.keys(record),
      });
      
      fs.writeFileSync(csvPath, csvOutput, 'utf-8');
      
      return NextResponse.json({
        status: 'success',
        message: 'Property updated successfully',
        propertyId: id,
      });
    }
    
    return NextResponse.json(
      { error: 'Property not found' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/properties/:id
 * Delete a property
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: In production, delete from database
    // For now, remove from CSV file
    const csvPath = path.join(process.cwd(), 'data', 'apartments.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    
    const index = parseInt(id.replace('csv-', '')) - 1;
    if (index >= 0 && index < records.length) {
      records.splice(index, 1);
      
      // Write back to CSV
      const csvOutput = stringify(records, {
        header: true,
        columns: Object.keys(records[0] || {}),
      });
      
      fs.writeFileSync(csvPath, csvOutput, 'utf-8');
      
      return NextResponse.json({
        status: 'success',
        message: 'Property deleted successfully',
        propertyId: id,
      });
    }
    
    return NextResponse.json(
      { error: 'Property not found' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property', details: error.message },
      { status: 500 }
    );
  }
}

