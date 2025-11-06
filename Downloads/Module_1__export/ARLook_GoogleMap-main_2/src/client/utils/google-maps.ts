import { Loader } from '@googlemaps/js-api-loader';

export interface MapConfig {
  center: { lat: number; lng: number };
  zoom: number;
  mapId?: string;
}

/**
 * Initialize Google Maps API loader
 */
export function createMapLoader(apiKey: string): Loader {
  return new Loader({
    apiKey: apiKey || '',
    version: 'weekly',
  });
}

/**
 * Default map configuration for Philadelphia University City
 * Center is Huntsman Hall (Wharton School main building)
 */
export const defaultMapConfig: MapConfig = {
  center: { lat: 39.9546, lng: -75.1960 }, // Huntsman Hall, Wharton School
  zoom: 14,
  // mapId removed - not required for basic maps
};

/**
 * Get Google Maps API key from environment variables
 * In Next.js, NEXT_PUBLIC_ prefixed vars are available on client-side
 * IMPORTANT: Next.js bundles NEXT_PUBLIC_ vars at build time, so they're available via process.env
 */
export function getGoogleMapsApiKey(): string {
  // In Next.js, NEXT_PUBLIC_ variables are injected at build time
  // They're available in both server and client code via process.env
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // Debug logging (only in development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔑 Google Maps API Key check:', {
      hasKey: !!apiKey,
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 10) + '...',
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('NEXT_PUBLIC')).join(', '),
    });
  }
  
  return apiKey;
}

/**
 * Create a map options object for Google Maps
 */
export function createMapOptions(config: MapConfig = defaultMapConfig): google.maps.MapOptions {
  const options: google.maps.MapOptions = {
    center: config.center,
    zoom: config.zoom,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
  };
  
  // Only add mapId if provided (optional)
  if (config.mapId) {
    options.mapId = config.mapId;
  }
  
  return options;
}

/**
 * Create a marker icon configuration
 */
export function createMarkerIcon(color: string = '#0ea5e9'): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
  };
}

/**
 * Create a marker label configuration
 */
export function createMarkerLabel(text: string): google.maps.MarkerLabel {
  return {
    text,
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
  };
}

/**
 * Create an info window content HTML string
 */
export function createInfoWindowContent(
  name: string,
  address: string,
  price: number,
  bedrooms: number,
  bathrooms: number,
  amenities: string[]
): string {
  return `
    <div style="padding: 8px; min-width: 200px;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${name}</h3>
      <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${address}</p>
      <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>$${price}/person</strong></p>
      <p style="margin: 0 0 4px 0; font-size: 14px;">${bedrooms} bed, ${bathrooms} bath</p>
      <p style="margin: 0; font-size: 12px; color: #666;">${amenities.join(', ')}</p>
    </div>
  `;
}

