'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Property } from '@/shared/types';
import {
  createMapLoader,
  defaultMapConfig,
  getGoogleMapsApiKey,
  createMapOptions,
} from '@/client/utils/google-maps';

interface MapContainerProps {
  markers: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  filters?: {
    maxPrice?: number;
    minPrice?: number;
    highlightedIds?: string[];
    amenities?: string[];
  };
  onFiltersUpdate?: (filters: MapContainerProps['filters'] | undefined) => void;
}

// Marker style definitions
const markerStyles = {
  default: { color: '#4285F4', label: 'P' }, // Blue - default
  inBudget: { color: '#34A853', label: '$' }, // Green - within budget
  highlighted: { color: '#EA4335', label: '!' }, // Red - recommended
  outOfRange: { color: '#9AA0A6', label: '×' }, // Gray - doesn't match
};

/**
 * Check if property matches filters
 */
function isPropertyMatching(property: Property, filters?: MapContainerProps['filters']): boolean {
  if (!filters) return true;
  
  if (filters.maxPrice && property.price > filters.maxPrice) {
    return false;
  }
  if (filters.minPrice && property.price < filters.minPrice) {
    return false;
  }
  
  return true;
}

/**
 * Create smart marker style based on property and filters
 */
function getMarkerStyle(
  property: Property,
  filters?: MapContainerProps['filters']
): typeof markerStyles.default {
  // AI recommended properties
  if (filters?.highlightedIds?.includes(property.id)) {
    return markerStyles.highlighted;
  }
  
  // Budget matching
  if (filters?.maxPrice && property.price <= filters.maxPrice) {
    return markerStyles.inBudget;
  }
  
  // Doesn't match filters
  if (!isPropertyMatching(property, filters)) {
    return markerStyles.outOfRange;
  }
  
  return markerStyles.default;
}

/**
 * Create enhanced info window content
 */
function createInfoWindowContent(property: Property): string {
  const walkingInfo = property.walkingDistanceToWharton
    ? `<div class="flex items-center text-sm text-gray-600 mb-2">
        <span>🚶 ${property.walkingDistanceToWharton}min to Wharton</span>
      </div>`
    : '';

  const amenitiesHtml = property.amenities.slice(0, 4).map(
    (amenity) => `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${amenity}</span>`
  ).join('');

  return `
    <div style="padding: 12px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 4px; color: #1f2937;">${property.name}</h3>
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${property.address}</p>
      <div style="margin-bottom: 8px;">
        <span style="font-size: 20px; font-weight: bold; color: #2563eb;">$${property.price}</span>
        <span style="font-size: 12px; color: #6b7280; margin-left: 4px;">per person</span>
        <span style="font-size: 14px; color: #6b7280; margin-left: 8px;">${property.bedrooms}b${property.bathrooms}b</span>
      </div>
      ${walkingInfo}
      <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
        ${amenitiesHtml}
      </div>
      <p style="font-size: 14px; color: #374151; line-height: 1.4;">${property.description}</p>
    </div>
  `;
}

/**
 * Render walking time circles (isochrones)
 */
function renderWalkingCircles(
  map: google.maps.Map,
  center: { lat: number; lng: number }
): google.maps.Circle[] {
  const circles: google.maps.Circle[] = [];
  
  // Walking speed: ~4.5 km/h = ~75 m/min
  // So 10 min = ~750m, 20 min = ~1500m, 30 min = ~2250m
  const walkingCircles = [
    { radius: 800, color: '#34A853', label: '10 min' }, // ~10 min walk - green
    { radius: 1600, color: '#FBBC05', label: '20 min' }, // ~20 min walk - yellow
    { radius: 2400, color: '#EA4335', label: '30 min' }, // ~30 min walk - red
  ];
  
  walkingCircles.forEach((circle) => {
    const circleObj = new google.maps.Circle({
      map,
      center,
      radius: circle.radius,
      fillColor: circle.color,
      fillOpacity: 0.15,
      strokeWeight: 2,
      strokeColor: circle.color,
      strokeOpacity: 0.4,
      zIndex: 0, // Behind markers
    });
    
    circles.push(circleObj);
  });
  
  return circles;
}

export default function MapContainer({
  markers,
  center = defaultMapConfig.center,
  zoom = defaultMapConfig.zoom,
  filters,
  onFiltersUpdate,
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapMarkersRef = useRef<google.maps.Marker[]>([]);
  const walkingCirclesRef = useRef<google.maps.Circle[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = getGoogleMapsApiKey();
      
      // Check if API key is valid
      if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'your_google_maps_api_key_here') {
        setMapError('Google Maps API Key not configured');
        return;
      }

      const loader = createMapLoader(apiKey);

      try {
        const { Map } = await loader.importLibrary('maps');
        await loader.importLibrary('marker');

          if (mapRef.current && !map) {
            const mapInstance = new Map(mapRef.current, createMapOptions({ center, zoom }));

            setMap(mapInstance);
            setMapError(null);
            console.log('✅ Google Maps loaded successfully!');
            
            // Render walking circles centered on Huntsman Hall immediately after map loads
            const huntsmanHall = { lat: 39.9546, lng: -75.1960 };
            const initialCircles = renderWalkingCircles(mapInstance, huntsmanHall);
            walkingCirclesRef.current = initialCircles;
          }
      } catch (error: any) {
        console.error('❌ Error loading Google Maps:', error);
        
        let errorMessage = 'Failed to load Google Maps. ';
        
        if (error?.message?.includes('RefererNotAllowedMapError')) {
          errorMessage += 'API Key限制设置不正确。请在Google Cloud Console中配置HTTP引荐来源网址限制，添加: http://localhost:3000/*';
        } else if (error?.message?.includes('InvalidKeyMapError')) {
          errorMessage += 'API Key无效。请检查API Key是否正确，并确认已启用Maps JavaScript API。';
        } else if (error?.message?.includes('ApiNotActivatedMapError')) {
          errorMessage += 'Maps JavaScript API未启用。请在Google Cloud Console中启用该API。';
        } else {
          errorMessage += `错误详情: ${error?.message || '未知错误'}`;
        }
        
        setMapError(errorMessage);
      }
    };

    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add map controls (price slider, amenities filter)
  useEffect(() => {
    if (!map || !onFiltersUpdate) return;

    // Price control
    const priceControlDiv = document.createElement('div');
    priceControlDiv.style.cssText = 'margin: 10px; padding: 0;';
    priceControlDiv.innerHTML = `
      <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">
          Max Price: $<span id="priceValue">${filters?.maxPrice || 3000}</span> per person
        </label>
        <input 
          type="range" 
          min="1000" 
          max="5000" 
          step="100" 
          value="${filters?.maxPrice || 3000}" 
          id="priceSlider"
          style="width: 200px; cursor: pointer;"
        />
      </div>
    `;
    
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(priceControlDiv);

    // Amenities control
    const amenitiesControlDiv = document.createElement('div');
    amenitiesControlDiv.style.cssText = 'margin: 10px; padding: 0;';
    amenitiesControlDiv.innerHTML = `
      <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 200px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">Filter by Amenities</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${['Gym', 'In-unit laundry', 'Parking', 'Pool'].map(amenity => {
            const isChecked = filters?.amenities?.some(a => a.toLowerCase().includes(amenity.toLowerCase())) || false;
            return `
            <label style="display: flex; align-items: center; font-size: 13px; cursor: pointer;">
              <input type="checkbox" class="amenity-checkbox" value="${amenity}" ${isChecked ? 'checked' : ''} style="margin-right: 6px; cursor: pointer;">
              <span>${amenity}</span>
            </label>
          `;
          }).join('')}
        </div>
      </div>
    `;
    
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(amenitiesControlDiv);

    // Add walking time legend
    const legendDiv = document.createElement('div');
    legendDiv.style.cssText = 'margin: 10px; padding: 0;';
    legendDiv.innerHTML = `
      <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 200px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">Walking Time</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background: #34A853; border: 2px solid #34A853;"></div>
            <span style="font-size: 12px; color: #374151;">10 min walk</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background: #FBBC05; border: 2px solid #FBBC05;"></div>
            <span style="font-size: 12px; color: #374151;">20 min walk</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background: #EA4335; border: 2px solid #EA4335;"></div>
            <span style="font-size: 12px; color: #374151;">30 min walk</span>
          </div>
        </div>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
          <div style="font-size: 11px; color: #6b7280; line-height: 1.4;">
            Circles show walking distance from Wharton School
          </div>
        </div>
      </div>
    `;
    
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(legendDiv);

    // Setup event listeners
    const priceSlider = document.getElementById('priceSlider') as HTMLInputElement;
    const priceValue = document.getElementById('priceValue');
    
    if (priceSlider && priceValue) {
      priceSlider.addEventListener('input', (e) => {
        const price = parseInt((e.target as HTMLInputElement).value);
        priceValue.textContent = price.toString();
        onFiltersUpdate({
          ...filters,
          maxPrice: price,
        });
      });
    }

    // Amenities checkboxes - use event delegation to handle dynamically created checkboxes
    amenitiesControlDiv.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.classList.contains('amenity-checkbox')) {
        const amenityCheckboxes = amenitiesControlDiv.querySelectorAll('.amenity-checkbox');
        const checkedAmenities = Array.from(amenityCheckboxes)
          .filter((cb: any) => cb.checked)
          .map((cb: any) => cb.value);
        
        onFiltersUpdate({
          ...filters,
          amenities: checkedAmenities.length > 0 ? checkedAmenities : undefined,
        });
      }
    });

      // Cleanup function
      return () => {
        map.controls[google.maps.ControlPosition.TOP_LEFT].clear();
        map.controls[google.maps.ControlPosition.TOP_RIGHT].clear();
        map.controls[google.maps.ControlPosition.BOTTOM_LEFT].clear();
      };
  }, [map, filters, onFiltersUpdate]);

  // Render walking circles centered on Huntsman Hall (always, regardless of map center)
  useEffect(() => {
    if (!map) return;
    
    // Clear existing circles
    walkingCirclesRef.current.forEach((circle) => {
      circle.setMap(null);
    });
    walkingCirclesRef.current = [];
    
    // Always use Huntsman Hall coordinates for walking circles
    const huntsmanHall = { lat: 39.9546, lng: -75.1960 };
    const circles = renderWalkingCircles(map, huntsmanHall);
    walkingCirclesRef.current = circles;
    
    console.log('📍 Walking circles rendered centered on Huntsman Hall:', huntsmanHall);
  }, [map]);

  // Update map center when center prop changes (but keep circles on Huntsman Hall)
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [map, center]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!map) return;

    console.log('📍 Updating markers:', {
      markerCount: markers.length,
      filters,
      properties: markers.map(p => ({ 
        name: p.name, 
        price: p.price, 
        lat: p.latitude, 
        lng: p.longitude,
        matchesMaxPrice: filters?.maxPrice ? p.price <= filters.maxPrice : 'N/A',
        matchesFilters: isPropertyMatching(p, filters)
      }))
    });

    // Clear existing markers
    mapMarkersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    mapMarkersRef.current = [];

    // Filter markers based on filters BEFORE displaying
    // This ensures we only show markers that match ALL filters
    const filteredMarkers = markers.filter((property) => {
      return isPropertyMatching(property, filters);
    });

    console.log(`📊 Filtered markers: ${filteredMarkers.length} out of ${markers.length}`, {
      filtered: filteredMarkers.map(p => ({ name: p.name, price: p.price })),
      excluded: markers.filter(p => !isPropertyMatching(p, filters)).map(p => ({ 
        name: p.name, 
        price: p.price, 
        reason: filters?.maxPrice && p.price > filters.maxPrice ? `Price $${p.price} > maxPrice $${filters.maxPrice}` : 'Other filter'
      }))
    });

    // Add new markers with smart styling
    filteredMarkers.forEach((property) => {
      const style = getMarkerStyle(property, filters);
      
      const marker = new google.maps.Marker({
        position: { lat: property.latitude, lng: property.longitude },
        map,
        title: `${property.name} - $${property.price}/person`,
        label: {
          text: style.label,
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14, // Larger for better visibility
          fillColor: style.color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
        },
        animation: google.maps.Animation.DROP,
        zIndex: property.id && filters?.highlightedIds?.includes(property.id) ? 1000 : 100, // Highlighted markers on top
      });

      // Add enhanced info window
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(property),
      });

      marker.addListener('click', () => {
        // Close all other info windows
        mapMarkersRef.current.forEach((m) => {
          const infoWindow = (m as any).infoWindow;
          if (infoWindow) {
            infoWindow.close();
          }
        });
        
        infoWindow.open(map, marker);
        (marker as any).infoWindow = infoWindow;
      });

      mapMarkersRef.current.push(marker);
    });

    console.log(`✅ Added ${mapMarkersRef.current.length} markers to map`);

    // Fit bounds to show all markers if there are any
    if (filteredMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredMarkers.forEach((property) => {
        bounds.extend({
          lat: property.latitude,
          lng: property.longitude,
        });
      });
      
      // Add padding to bounds for better visibility
      map.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      });
      
      console.log('🗺️ Map bounds updated to fit filtered markers');
    } else {
      // If no markers, reset to default center
      map.setCenter(center);
      map.setZoom(zoom);
      console.log('🗺️ No markers match filters, resetting to default center');
    }
  }, [map, markers, filters, center, zoom]);

  // Show error message if map failed to load
  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 max-w-md">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Google Maps 未配置
          </h3>
          <p className="text-gray-600 mb-4">
            {mapError === 'Google Maps API Key not configured'
              ? '请在 .env.local 文件中配置 Google Maps API Key'
              : mapError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ minHeight: '100vh' }}
    />
  );
}
