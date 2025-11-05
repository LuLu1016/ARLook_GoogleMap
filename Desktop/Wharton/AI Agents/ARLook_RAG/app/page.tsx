'use client';

import { useState, useCallback, useEffect } from 'react';
import MapContainer from '@/app/components/MapContainer';
import ChatSidebar from '@/app/components/ChatSidebar';
import { Property, Message } from '@/types';
import { sampleProperties, presetPrompts, filterPropertiesByMessage } from '@/lib/properties';
import { defaultMapConfig } from '@/lib/google-maps';

export default function HomePage() {
  const [allProperties, setAllProperties] = useState<Property[]>(sampleProperties); // All properties (source of truth)
  const [properties, setProperties] = useState<Property[]>(sampleProperties); // Filtered properties for display
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    defaultMapConfig.center
  );
  const [mapFilters, setMapFilters] = useState<{
    maxPrice?: number;
    minPrice?: number;
    highlightedIds?: string[];
    amenities?: string[];
  }>({});

  // Load all properties (including CSV data) on initial mount
  useEffect(() => {
    const loadAllProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (response.ok) {
          const data = await response.json();
          if (data.properties && data.properties.length > 0) {
            setAllProperties(data.properties);
            setProperties(data.properties);
            console.log('✅ Loaded all properties:', data.properties.length);
            
            // Update map center to fit all properties
            if (data.properties.length > 0) {
              const avgLat = data.properties.reduce((sum: number, p: Property) => sum + p.latitude, 0) / data.properties.length;
              const avgLng = data.properties.reduce((sum: number, p: Property) => sum + p.longitude, 0) / data.properties.length;
              setMapCenter({ lat: avgLat, lng: avgLng });
            }
          }
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        // Fallback to sample properties if API fails
      }
    };
    
    loadAllProperties();
  }, []);

  // Handle property filtering and update
  const handlePropertiesUpdate = useCallback((filteredProperties: Property[]) => {
    console.log('🏠 Updating properties:', {
      count: filteredProperties.length,
      properties: filteredProperties.map(p => p.name)
    });
    
    setProperties(filteredProperties);

    // Update map center to show filtered properties
    if (filteredProperties.length > 0) {
      const avgLat =
        filteredProperties.reduce((sum, p) => sum + p.latitude, 0) /
        filteredProperties.length;
      const avgLng =
        filteredProperties.reduce((sum, p) => sum + p.longitude, 0) /
        filteredProperties.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
      console.log('📍 Map center updated:', { lat: avgLat, lng: avgLng });
    }
  }, []);

  // Handle map filter updates from map controls
  const handleMapFiltersUpdate = useCallback((newFilters: typeof mapFilters | undefined) => {
    if (!newFilters) return;
    
    console.log('🗺️ Map filters updated:', newFilters);
    setMapFilters(newFilters);
    
    // Apply filters to ALL properties (source of truth), not filtered ones
    let filtered = [...allProperties]; // Use allProperties as source
    
    console.log(`📊 Filtering ${allProperties.length} total properties`, {
      allProperties: allProperties.map(p => ({ name: p.name, price: p.price }))
    });
    
    if (newFilters.maxPrice) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(p => {
        const matches = p.price <= newFilters.maxPrice!;
        if (!matches) {
          console.log(`❌ Excluded: ${p.name} - Price $${p.price} > maxPrice $${newFilters.maxPrice}`);
        }
        return matches;
      });
      console.log(`💰 Filtered by maxPrice $${newFilters.maxPrice}: ${filtered.length} properties (from ${beforeCount})`);
      console.log(`   Included: ${filtered.map(p => `${p.name} ($${p.price})`).join(', ')}`);
    }
    if (newFilters.minPrice) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(p => {
        const matches = p.price >= newFilters.minPrice!;
        if (!matches) {
          console.log(`❌ Excluded: ${p.name} - Price $${p.price} < minPrice $${newFilters.minPrice}`);
        }
        return matches;
      });
      console.log(`💰 Filtered by minPrice $${newFilters.minPrice}: ${filtered.length} properties (from ${beforeCount})`);
    }
    if (newFilters.amenities && newFilters.amenities.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(p =>
        // Properties must contain ALL selected amenities (AND logic)
        newFilters.amenities!.every(amenity =>
          p.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
      console.log(`🏠 Filtered by amenities ${newFilters.amenities.join(', ')}: ${filtered.length} properties (from ${beforeCount})`);
    }
    
    console.log(`✅ Final filtered result: ${filtered.length} properties`, {
      properties: filtered.map(p => ({ name: p.name, price: p.price }))
    });
    
    setProperties(filtered);
    
    // Update map center and zoom to fit filtered properties
    if (filtered.length > 0) {
      const avgLat = filtered.reduce((sum, p) => sum + p.latitude, 0) / filtered.length;
      const avgLng = filtered.reduce((sum, p) => sum + p.longitude, 0) / filtered.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
      console.log('📍 Map center updated to fit filtered properties:', { lat: avgLat, lng: avgLng, count: filtered.length });
    } else {
      // If no properties match, reset to default center
      setMapCenter(defaultMapConfig.center);
      console.log('📍 No properties match filters, resetting to default center');
    }
  }, [allProperties]);

  const handlePromptClick = useCallback(async (promptId: string) => {
    const prompt = presetPrompts.find((p) => p.id === promptId);
    if (!prompt) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt.text,
      timestamp: new Date(),
    };

    // Update messages state and get the updated list
    let updatedMessages: Message[] = [];
    setMessages((prev) => {
      updatedMessages = [...prev, userMessage];
      return updatedMessages;
    });
    
    setIsLoading(true);

    try {
      // Call API with updated messages
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt.text,
          conversationHistory: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process message');
      }

      const data = await response.json();

      // Log RAG retrieval metadata (if available)
      if (data.search_strategy) {
        console.log('🔍 RAG Retrieval:', {
          strategy: data.search_strategy,
          confidence: data.confidence,
          retrievedCount: data.retrieved_properties?.length || 0,
          finalCount: data.properties?.length || 0,
        });
      }

      // Update properties to show on map
      handlePropertiesUpdate(data.properties);

      // Update map filters from API response
      if (data.filters) {
        const highlightedIds = data.properties?.slice(0, 3).map((p: Property) => p.id) || [];
        setMapFilters({
          maxPrice: data.filters.maxPrice,
          minPrice: data.filters.minPrice,
          highlightedIds,
          amenities: data.filters.amenities,
        });
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing prompt:', error);
      
      // Fallback to local filtering if API fails
      const filteredProperties = allProperties.filter(prompt.filter);
      handlePropertiesUpdate(filteredProperties);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Found ${filteredProperties.length} matching properties, highlighted on the map`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [handlePropertiesUpdate, allProperties]);

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Update messages state and get the updated list
    let updatedMessages: Message[] = [];
    setMessages((prev) => {
      updatedMessages = [...prev, userMessage];
      return updatedMessages;
    });
    
    setIsLoading(true);

    try {
      // Call API with updated messages
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process message');
      }

      const data = await response.json();

      // Log RAG retrieval metadata (if available)
      if (data.search_strategy) {
        console.log('🔍 RAG Retrieval:', {
          strategy: data.search_strategy,
          confidence: data.confidence,
          retrievedCount: data.retrieved_properties?.length || 0,
          finalCount: data.properties?.length || 0,
        });
      }

      // Update properties to show on map
      handlePropertiesUpdate(data.properties);

      // Update map filters from API response
      if (data.filters) {
        const highlightedIds = data.properties?.slice(0, 3).map((p: Property) => p.id) || [];
        setMapFilters({
          maxPrice: data.filters.maxPrice,
          minPrice: data.filters.minPrice,
          highlightedIds,
          amenities: data.filters.amenities,
        });
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to local filtering if API fails
      const filteredProperties = filterPropertiesByMessage(content, allProperties);
      handlePropertiesUpdate(filteredProperties);

      // Generate AI response based on filter type
      let responseMessage = '';
      const lowerContent = content.toLowerCase();

      if (lowerContent.includes('wharton') || lowerContent.includes('附近')) {
        responseMessage = `Found ${filteredProperties.length} properties near Wharton, highlighted on the map`;
      } else if (lowerContent.includes('洗烘') || lowerContent.includes('laundry')) {
        responseMessage = `Found ${filteredProperties.length} properties with in-unit laundry, highlighted on the map`;
      } else if (
        lowerContent.includes('1500') ||
        lowerContent.includes('2000') ||
        lowerContent.includes('预算')
      ) {
        responseMessage = `Found ${filteredProperties.length} properties in your price range, highlighted on the map`;
      } else {
        responseMessage = `Found ${filteredProperties.length} matching properties, highlighted on the map`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [handlePropertiesUpdate, allProperties]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50">
      {/* Left: Full-screen Map */}
      <div className="flex-1 h-full relative">
        <MapContainer 
          markers={properties} 
          center={mapCenter} 
          zoom={defaultMapConfig.zoom}
          filters={mapFilters}
          onFiltersUpdate={handleMapFiltersUpdate}
        />
      </div>

      {/* Right: Fixed-width Chat Sidebar */}
      <div className="w-[420px] h-full flex-shrink-0">
        <ChatSidebar
          onPromptClick={handlePromptClick}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
