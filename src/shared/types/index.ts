export interface Property {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  description: string;
  walkingDistanceToWharton?: number; // Walking distance in minutes
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  property?: Property;
}

