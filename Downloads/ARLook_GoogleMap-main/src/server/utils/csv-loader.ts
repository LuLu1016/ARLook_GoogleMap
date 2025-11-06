/**
 * ============================================================================
 * 本地数据库 - CSV 数据加载器
 * ============================================================================
 * 
 * 位置: src/server/utils/csv-loader.ts
 * 
 * 职责:
 * - 从 CSV 文件加载房源数据
 * - 解析多种 CSV 格式（旧格式、新格式、v2 格式）
 * - 将 CSV 数据转换为 Property 类型
 * - 合并多个数据源（CSV + 硬编码样本）
 * - 提供统一的房源数据接口
 * 
 * 数据文件:
 * - src/data/apartments_v2.csv: 主要数据文件（新格式）
 * - src/data/apartments.csv: 旧格式数据文件（如果存在）
 * - src/data/apartments_new.csv: 新格式数据文件（如果存在）
 * 
 * 核心函数:
 * - getAllProperties(): 获取所有房源（CSV + 样本）
 * - loadPropertiesFromCSV(): 从 CSV 加载房源
 * 
 * 使用场景:
 * - 服务器启动时加载数据
 * - API 路由需要获取房源数据时
 * - RAG 系统需要检索数据时
 * 
 * 扩展点:
 * - 添加数据库支持（PostgreSQL、SQLite 等）
 * - 添加缓存机制（Redis）
 * - 支持实时数据更新
 * - 添加数据验证和清洗
 * 
 * 相关文件:
 * - src/data/apartments_v2.csv: 数据文件
 * - src/shared/types/index.ts: Property 类型定义
 * - /api/chat/route.ts: 使用此加载器获取数据
 * 
 * ============================================================================
 */

import { Property } from '@/shared/types';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

/**
 * Parse walking distance string to number
 */
function parseWalkingDistance(walkStr: string): number | undefined {
  if (!walkStr || walkStr === '-') return undefined;
  
  const match = walkStr.match(/(\d+)\s*min/);
  if (match) {
    return parseInt(match[1]);
  }
  
  // Handle "25+ min" format
  const plusMatch = walkStr.match(/(\d+)\s*\+\s*min/);
  if (plusMatch) {
    return parseInt(plusMatch[1]) + 5; // Add 5 for "+" indicator
  }
  
  return undefined;
}

/**
 * Parse price range string to average price
 */
function parsePriceRange(priceStr: string): number {
  if (!priceStr || priceStr === '-') return 2000; // Default average
  
  // Remove $ and + signs
  const cleaned = priceStr.replace(/\$/g, '').replace(/\+/g, '');
  
  // Try to match range like "951–2,300" or "1,176+"
  const rangeMatch = cleaned.match(/([\d,]+)\s*[–-]\s*([\d,]+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1].replace(/,/g, ''));
    const max = parseInt(rangeMatch[2].replace(/,/g, ''));
    return Math.round((min + max) / 2);
  }
  
  // Single price like "995" or "1,176+"
  const singleMatch = cleaned.match(/([\d,]+)/);
  if (singleMatch) {
    return parseInt(singleMatch[1].replace(/,/g, ''));
  }
  
  return 2000; // Default
}

/**
 * Parse amenities string to array
 * Enhanced to handle more amenity types
 */
function parseAmenities(amenitiesStr: string, notes?: string): string[] {
  const amenities: string[] = [];
  const combined = `${amenitiesStr} ${notes || ''}`.toLowerCase();
  
  // Check for common amenities
  if (combined.includes('in-unit') && (combined.includes('wd') || combined.includes('washer/dryer') || combined.includes('washer') || combined.includes('dryer'))) {
    amenities.push('In-unit laundry');
  } else if (combined.includes('laundry')) {
    amenities.push('Laundry room');
  }
  
  if (combined.includes('gym') || combined.includes('fitness') || combined.includes('fitness center')) {
    amenities.push('Gym');
  }
  
  if (combined.includes('parking') || combined.includes('garage')) {
    amenities.push('Parking');
  }
  
  if (combined.includes('pool') || combined.includes('rooftop pool')) {
    amenities.push('Pool');
  }
  
  if (combined.includes('pet-friendly') || combined.includes('pet area') || combined.includes('pet friendly')) {
    amenities.push('Pet friendly');
  }
  
  if (combined.includes('furnished')) {
    amenities.push('Furnished');
  }
  
  if (combined.includes('doorman') || combined.includes('concierge')) {
    amenities.push('Doorman');
  }
  
  if (combined.includes('rooftop') || combined.includes('rooftop terrace')) {
    amenities.push('Rooftop');
  }
  
  if (combined.includes('business') || combined.includes('study') || combined.includes('study room') || combined.includes('study rooms')) {
    amenities.push('Study room');
  }
  
  if (combined.includes('balcony') || combined.includes('balconies')) {
    amenities.push('Balcony');
  }
  
  if (combined.includes('utilities included') || combined.includes('all utilities included')) {
    amenities.push('Utilities included');
  }
  
  if (combined.includes('media room')) {
    amenities.push('Media room');
  }
  
  if (combined.includes('yoga studio')) {
    amenities.push('Yoga studio');
  }
  
  if (combined.includes('fire pit')) {
    amenities.push('Fire pit');
  }
  
  if (combined.includes('lounge') || combined.includes('lounges')) {
    amenities.push('Lounge');
  }
  
  if (combined.includes('zipcar')) {
    amenities.push('ZipCar');
  }
  
  if (combined.includes('hw floors') || combined.includes('hardwood floors')) {
    amenities.push('Hardwood floors');
  }
  
  if (combined.includes('modern appliances')) {
    amenities.push('Modern appliances');
  }
  
  return amenities;
}

/**
 * Known accurate coordinates for specific properties (from Google Maps)
 */
const accurateCoordinates: Record<string, { lat: number; lng: number }> = {
  // Chestnut St properties
  'The Accolade': { lat: 39.9526, lng: -75.1925 }, // 3600 Chestnut St
  'The Chestnut': { lat: 39.9528, lng: -75.1905 }, // 3720 Chestnut St
  '3737 Chestnut': { lat: 39.9530, lng: -75.1980 }, // 3737 Chestnut St
  'Domus': { lat: 39.9515, lng: -75.1920 }, // 3411 Chestnut St
  'Chestnut Hall': { lat: 39.9535, lng: -75.1930 }, // 3900 Chestnut St
  'The Hub On Chestnut': { lat: 39.9537, lng: -75.1935 }, // 3939 Chestnut St
  'The Hub on Chestnut': { lat: 39.9537, lng: -75.1935 }, // 3939 Chestnut St
  
  // Market St properties
  'Arrive University City': { lat: 39.9530, lng: -75.1928 }, // 3601 Market St
  
  // Walnut St properties
  'The Left Bank': { lat: 39.9505, lng: -75.1900 }, // 3131 Walnut St
  
  // Other known addresses
  'The Standard at Phila': { lat: 39.9500, lng: -75.1895 }, // 119 S 31st St
  'The Standard at Philadelphia': { lat: 39.9500, lng: -75.1895 }, // 119 S 31st St
};

/**
 * Get coordinates for Philadelphia addresses
 * Uses accurate coordinates for known properties, otherwise estimates based on address patterns
 */
function getCoordinates(address: string, propertyName?: string, walkingDistance?: number): { lat: number; lng: number } {
  // First check if we have accurate coordinates for this property
  if (propertyName && accurateCoordinates[propertyName]) {
    return accurateCoordinates[propertyName];
  }
  
  // Base coordinates for University City / Wharton area (Huntsman Hall)
  const baseLat = 39.9546;
  const baseLng = -75.1960;
  
  // Improved estimates based on street number and street name
  let offsetLat = 0;
  let offsetLng = 0;
  
  // Extract street number from address (e.g., "3600 Chestnut St" -> 3600)
  const streetNumberMatch = address.match(/(\d+)/);
  const streetNumber = streetNumberMatch ? parseInt(streetNumberMatch[1]) : null;
  
  // Adjust longitude based on street number (higher numbers = more west)
  if (streetNumber) {
    // University City street grid: ~30th to ~45th St
    // Roughly: 30th St ≈ -75.185, 36th St ≈ -75.193, 40th St ≈ -75.202
    const baseStreet = 36; // 36th St as reference
    const streetDiff = streetNumber - baseStreet * 100; // Convert to street number
    offsetLng = (streetDiff / 100) * -0.008; // Roughly 0.008 degrees per street
  }
  
  // Adjust latitude based on street name
  if (address.includes('Chestnut')) {
    offsetLat = 0.002; // Chestnut St is slightly north
  } else if (address.includes('Walnut')) {
    offsetLat = -0.0015; // Walnut St is slightly south
  } else if (address.includes('Market')) {
    offsetLat = -0.003; // Market St is further south
  } else if (address.includes('Lancaster')) {
    offsetLat = 0.001; // Lancaster Ave is north
  } else if (address.includes('Spruce')) {
    offsetLat = -0.004; // Spruce St is south
  } else if (address.includes('Locust')) {
    offsetLat = -0.005; // Locust St is further south
  }
  
  // Fine-tune based on street number ranges
  if (streetNumber) {
    // Chestnut St addresses
    if (address.includes('Chestnut')) {
      if (streetNumber >= 3600 && streetNumber < 3700) {
        // Around 36th St area
        offsetLng = -0.1925 - baseLng; // More accurate for 3600-3700 range
      } else if (streetNumber >= 3700 && streetNumber < 3800) {
        // Around 37th St area
        offsetLng = -0.1905 - baseLng;
      } else if (streetNumber >= 3800 && streetNumber < 4000) {
        // Around 38th-39th St area
        offsetLng = -0.1880 - baseLng;
      }
    }
    
    // Market St addresses
    if (address.includes('Market')) {
      if (streetNumber >= 3600 && streetNumber < 3700) {
        offsetLng = -0.1928 - baseLng;
      }
    }
    
    // Walnut St addresses
    if (address.includes('Walnut')) {
      if (streetNumber >= 3100 && streetNumber < 3200) {
        offsetLng = -0.1900 - baseLng;
      }
    }
  }
  
  // Adjust based on walking distance (further = more offset from center)
  if (walkingDistance) {
    const distanceFactor = (walkingDistance - 10) * 0.0003;
    offsetLat += distanceFactor;
    offsetLng += distanceFactor;
  }
  
  return {
    lat: baseLat + offsetLat,
    lng: baseLng + offsetLng,
  };
}

/**
 * Load properties from CSV file (server-side only)
 * Supports both old and new CSV formats
 */
export function loadPropertiesFromCSV(): Property[] {
  const allProperties: Property[] = [];
  
  // Determine the correct data directory path
  // Next.js runs from project root, so we need to check both locations
  const getDataPath = (filename: string): string => {
    // Try src/data first (for Next.js structure)
    const srcDataPath = path.join(process.cwd(), 'src', 'data', filename);
    if (fs.existsSync(srcDataPath)) {
      return srcDataPath;
    }
    // Fallback to root data directory
    return path.join(process.cwd(), 'data', filename);
  };
  
  // Load old format CSV
  try {
    const csvPath = getDataPath('apartments.csv');
    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      
      records.forEach((record: any, index: number) => {
        const name = record['Apartment Name']?.trim() || `Apartment ${index + 1}`;
        const address = record['Address']?.trim() || '';
        const walkingDistance = parseWalkingDistance(record['Walk to Wharton'] || '');
        const price = parsePriceRange(record['Studio/1B1B Price Range'] || '');
        const furnished = record['Furnished']?.trim() || '';
        const amenitiesStr = record['Amenities/Notes']?.trim() || '';
        const reviews = record['Good & Bad Reviews (see sources)']?.trim() || '';
        const safety = record['Safety']?.trim() || '';
        
        const amenities = parseAmenities(amenitiesStr, reviews);
        if (furnished === 'Yes') {
          amenities.push('Furnished');
        }
        
        const coordinates = getCoordinates(address, name, walkingDistance);
        const description = reviews || amenitiesStr || `Modern apartment ${walkingDistance ? `within ${walkingDistance} minutes walk to Wharton` : 'near University City'}`;
        
        allProperties.push({
          id: `csv-old-${index + 1}`,
          name,
          address: address.endsWith(', Philadelphia') ? address : `${address}, Philadelphia, PA`,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          price,
          bedrooms: 1,
          bathrooms: 1,
          amenities,
          description: `${description}${safety ? `. Safety: ${safety}` : ''}`,
          walkingDistanceToWharton: walkingDistance,
        });
      });
    }
  } catch (error) {
    console.error('Error loading old CSV:', error);
  }
  
  // Load new format CSV (v2 - latest format)
  try {
    const v2CsvPath = getDataPath('apartments_v2.csv');
    if (fs.existsSync(v2CsvPath)) {
      const fileContent = fs.readFileSync(v2CsvPath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      
      records.forEach((record: any, index: number) => {
        const name = record['Apartment Name']?.trim() || `Apartment ${index + 1}`;
        const address = record['Address']?.trim() || '';
        const walkingDistance = parseWalkingDistance(record['Walk Time to Wharton'] || '');
        const price = parsePriceRange(record['Studio/1B1B Price'] || '');
        const furnished = record['Furnished']?.trim() || '';
        const amenitiesStr = record['Amenities']?.trim() || '';
        const goodReviews = record['Good Reviews']?.trim() || '';
        const badReviews = record['Bad Reviews']?.trim() || '';
        const safety = record['Safety']?.trim() || '';
        
        // Combine reviews
        const reviews = [goodReviews, badReviews].filter(Boolean).join('. ');
        
        const amenities = parseAmenities(amenitiesStr, reviews);
        if (furnished === 'Yes') {
          amenities.push('Furnished');
        }
        
        const coordinates = getCoordinates(address, name, walkingDistance);
        const description = reviews || amenitiesStr || `Modern apartment ${walkingDistance ? `within ${walkingDistance} minutes walk to Wharton` : 'near University City'}`;
        
        allProperties.push({
          id: `csv-v2-${index + 1}`,
          name,
          address: address.endsWith(', Philadelphia') ? address : `${address}, Philadelphia, PA`,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          price,
          bedrooms: 1,
          bathrooms: 1,
          amenities,
          description: `${description}${safety ? `. Safety: ${safety}` : ''}`,
          walkingDistanceToWharton: walkingDistance,
        });
      });
    }
  } catch (error) {
    console.error('Error loading v2 CSV:', error);
  }
  
  // Load new format CSV
  try {
    const newCsvPath = getDataPath('apartments_new.csv');
    if (fs.existsSync(newCsvPath)) {
      const fileContent = fs.readFileSync(newCsvPath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      
      records.forEach((record: any, index: number) => {
        const name = record['Apartment Name']?.trim() || `Apartment ${index + 1}`;
        const address = record['Address']?.trim() || '';
        const walkingDistance = parseWalkingDistance(record['Walk Time to Wharton'] || '');
        const price = parsePriceRange(record['Studio/1B1B Price'] || '');
        const furnished = record['Furnished']?.trim() || '';
        const amenitiesStr = record['Amenities']?.trim() || '';
        const goodReviews = record['Good Reviews']?.trim() || '';
        const badReviews = record['Bad Reviews']?.trim() || '';
        const safety = record['Safety']?.trim() || '';
        
        // Combine reviews
        const reviews = [goodReviews, badReviews].filter(Boolean).join('. ');
        
        const amenities = parseAmenities(amenitiesStr, reviews);
        if (furnished === 'Yes') {
          amenities.push('Furnished');
        }
        
        const coordinates = getCoordinates(address, name, walkingDistance);
        const description = reviews || amenitiesStr || `Modern apartment ${walkingDistance ? `within ${walkingDistance} minutes walk to Wharton` : 'near University City'}`;
        
        allProperties.push({
          id: `csv-new-${index + 1}`,
          name,
          address: address.endsWith(', Philadelphia') ? address : `${address}, Philadelphia, PA`,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          price,
          bedrooms: 1,
          bathrooms: 1,
          amenities,
          description: `${description}${safety ? `. Safety: ${safety}` : ''}`,
          walkingDistanceToWharton: walkingDistance,
        });
      });
    }
  } catch (error) {
    console.error('Error loading new CSV:', error);
  }
  
  return allProperties;
}

/**
 * Sample properties (hardcoded)
 */
const _sampleProperties: Property[] = [
  {
    id: '1',
    name: 'The Axis',
    address: '3800 Chestnut St, Philadelphia, PA 19104',
    latitude: 39.9526,
    longitude: -75.1652,
    price: 1800,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['In-unit laundry', 'Gym', 'Parking'],
    description: 'Modern apartment near University of Pennsylvania',
    walkingDistanceToWharton: 8,
  },
  {
    id: '2',
    name: 'evo',
    address: '3401 Walnut St, Philadelphia, PA 19104',
    latitude: 39.9550,
    longitude: -75.1920,
    price: 1650,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['In-unit laundry', 'Furnished', 'Utilities included'],
    description: 'Furnished studio perfect for Wharton students',
    walkingDistanceToWharton: 5,
  },
  {
    id: '3',
    name: 'Cira Green',
    address: '3737 Chestnut St, Philadelphia, PA 19104',
    latitude: 39.9530,
    longitude: -75.1980,
    price: 2200,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['In-unit laundry', 'Dishwasher', 'Central AC', 'Parking'],
    description: 'Spacious loft with modern amenities',
    walkingDistanceToWharton: 7,
  },
  {
    id: '4',
    name: 'Drexel Campus View',
    address: '3200 Market St, Philadelphia, PA 19104',
    latitude: 39.9540,
    longitude: -75.1880,
    price: 1500,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Laundry room', 'Pet friendly', 'Balcony'],
    description: 'Affordable option near Drexel University',
    walkingDistanceToWharton: 15,
  },
  {
    id: '5',
    name: 'Penn Park Residences',
    address: '3131 Walnut St, Philadelphia, PA 19104',
    latitude: 39.9500,
    longitude: -75.1750,
    price: 1950,
    bedrooms: 2,
    bathrooms: 1.5,
    amenities: ['In-unit laundry', 'Gym', 'Rooftop', 'Parking'],
    description: 'Luxury living with great views of Penn Park',
    walkingDistanceToWharton: 12,
  },
];

/**
 * Get all properties (CSV + sample) - server-side only
 */
export function getAllProperties(): Property[] {
  const csvProperties = loadPropertiesFromCSV();
  
  console.log('📊 数据库加载统计:');
  console.log(`  - CSV文件房源: ${csvProperties.length} 个`);
  console.log(`  - 硬编码样本: ${_sampleProperties.length} 个`);
  
  // Combine and deduplicate by name
  const allProperties = [..._sampleProperties];
  const existingNames = new Set(_sampleProperties.map((p: Property) => p.name.toLowerCase()));
  
  let addedFromCSV = 0;
  csvProperties.forEach((property) => {
    if (!existingNames.has(property.name.toLowerCase())) {
      allProperties.push(property);
      existingNames.add(property.name.toLowerCase());
      addedFromCSV++;
    } else {
      console.log(`  ⚠️ 跳过重复房源: ${property.name}`);
    }
  });
  
  console.log(`  - 从CSV添加: ${addedFromCSV} 个（去重后）`);
  console.log(`  - 总计房源: ${allProperties.length} 个`);
  console.log(`  - 房源列表:`, allProperties.map(p => p.name).join(', '));
  
  return allProperties;
}
