import { Property } from '@/types';

// Sample properties (hardcoded for client-side use)
// Note: CSV data is loaded server-side via API route
export const sampleProperties: Property[] = [
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
 * Filter properties based on message content
 */
export function filterPropertiesByMessage(
  message: string,
  properties: Property[]
): Property[] {
  const lowerMessage = message.toLowerCase();

  // Filter by Wharton proximity
  if (lowerMessage.includes('wharton') || lowerMessage.includes('附近')) {
    return properties.filter(
      (p) => p.walkingDistanceToWharton !== undefined && p.walkingDistanceToWharton <= 10
    );
  }

  // Filter by laundry amenity
  if (lowerMessage.includes('洗烘') || lowerMessage.includes('laundry')) {
    return properties.filter((p) =>
      p.amenities.some((amenity) =>
        amenity.toLowerCase().includes('in-unit laundry')
      )
    );
  }

  // Filter by budget/price range
  if (lowerMessage.includes('1500') || lowerMessage.includes('2000') || lowerMessage.includes('预算')) {
    const has1500 = lowerMessage.includes('1500');
    const has2000 = lowerMessage.includes('2000');
    
    if (has1500 && has2000) {
      // Budget range $1500-2000
      return properties.filter((p) => p.price >= 1500 && p.price <= 2000);
    } else if (has1500) {
      // Around $1500
      return properties.filter((p) => p.price >= 1400 && p.price <= 1600);
    } else if (has2000) {
      // Around $2000
      return properties.filter((p) => p.price >= 1900 && p.price <= 2100);
    }
  }

  // Default: return all properties
  return properties;
}

// Preset prompts for quick search
export const presetPrompts = [
  {
    id: 'wharton',
    text: 'Apartments near Wharton',
    filter: (property: Property) => {
      return (
        property.walkingDistanceToWharton !== undefined &&
        property.walkingDistanceToWharton <= 10
      );
    },
  },
  {
    id: 'laundry',
    text: 'With in-unit laundry',
    filter: (property: Property) => {
      return property.amenities.some((amenity) =>
        amenity.toLowerCase().includes('in-unit laundry')
      );
    },
  },
  {
    id: 'budget',
    text: 'Budget $1500-2000',
    filter: (property: Property) => {
      return property.price >= 1500 && property.price <= 2000;
    },
  },
];
