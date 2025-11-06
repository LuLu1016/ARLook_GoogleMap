import { Property } from '@/shared/types';
import { sampleProperties } from '@/shared/constants/properties';

/**
 * Format properties data for OpenAI prompt
 */
export function formatPropertiesForPrompt(properties: Property[]): string {
  return properties
    .map((p) => {
      const amenities = p.amenities.join(', ');
      const walkingTime = p.walkingDistanceToWharton
        ? `${p.walkingDistanceToWharton}分钟`
        : 'N/A';
      return `- ${p.name}
  地址: ${p.address}
  价格: $${p.price}/人/月
  房型: ${p.bedrooms}卧${p.bathrooms}卫
  步行至沃顿商学院: ${walkingTime}
  设施: ${amenities}
  描述: ${p.description}`;
    })
    .join('\n\n');
}

/**
 * Clean AI response by removing markdown formatting and unwanted characters
 * IMPORTANT: This function should preserve all actual content, only remove formatting
 */
function cleanAIResponse(response: string): string {
  let cleaned = response;

  // Remove format markers with emoji and text (e.g., "💬 自然语言总结：" or "**💬 自然语言总结：**")
  // Only remove these specific markers, not content
  cleaned = cleaned.replace(/\*?\*?\s*💬?\s*自然语言总结\s*[：:]\s*\*?\*?/gi, '');
  cleaned = cleaned.replace(/\*?\*?\s*🏠?\s*推荐房源\s*[：:]\s*\*?\*?/gi, '');
  cleaned = cleaned.replace(/\*?\*?\s*💡?\s*专业建议\s*[：:]\s*\*?\*?/gi, '');
  cleaned = cleaned.replace(/\*?\*?\s*📝?\s*备注\s*[：:]\s*\*?\*?/gi, '');
  
  // Remove standalone emoji patterns (but keep emoji in content if they're part of sentences)
  // Only remove if they're alone on a line or surrounded by spaces
  cleaned = cleaned.replace(/^\s*[💬🏠💡📍🔍✅❌📝]\s*$/gm, '');
  
  // Remove markdown bold markers (**text** -> text) - do this multiple times to catch nested ones
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  
  // Remove markdown italic markers (*text* -> text) - but be careful not to remove multiplication
  // Only remove if it's clearly markdown formatting
  cleaned = cleaned.replace(/\*([^*\n]+)\*/g, '$1');
  
  // Remove markdown headers (### Header -> Header)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // Remove markdown code blocks (`code` -> code)
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove markdown list markers at start of line (- item -> item)
  cleaned = cleaned.replace(/^[-*+]\s+/gm, '');
  
  // Remove numbered list markers with format markers (e.g., "1. **💬" -> "1.")
  cleaned = cleaned.replace(/(\d+\.)\s*\*?\*?\s*💬?\s*/gi, '$1 ');
  cleaned = cleaned.replace(/(\d+\.)\s*\*?\*?\s*🏠?\s*/gi, '$1 ');
  cleaned = cleaned.replace(/(\d+\.)\s*\*?\*?\s*💡?\s*/gi, '$1 ');
  
  // Remove extra whitespace (but preserve intentional line breaks)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');
  
  // Remove lines that only contain format markers (but preserve actual content)
  cleaned = cleaned.replace(/^\s*[\*💬🏠💡📍🔍✅❌📝\s：:]+\s*$/gm, '');
  
  // Final trim, but preserve meaningful content
  return cleaned.trim();
}

/**
 * Parse AI response to extract reply and filters
 * IMPORTANT: Preserves full response content, only removes [DATA] tag at the end
 */
export function parseAIResponse(aiResponse: string): {
  reply: string;
  filters?: {
    maxPrice?: number;
    minPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    amenities?: string[];
    maxWalkingDistance?: number;
  };
} {
  // Extract [DATA] JSON object (must be at the very end)
  // Use multiline match to catch [DATA] tag even if there are newlines before it
  const dataMatch = aiResponse.match(/\[DATA\]([\s\S]*)$/);
  let filters = undefined;

  if (dataMatch && dataMatch.index !== undefined) {
    try {
      const jsonStr = dataMatch[1].trim();
      filters = JSON.parse(jsonStr);
      console.log('✅ Parsed [DATA] filters:', filters);
    } catch (error) {
      console.error('❌ Failed to parse [DATA] JSON:', error);
      console.error('JSON string:', dataMatch[1]);
    }
  }

  // Remove [DATA] section from reply - CRITICAL: only remove from [DATA] onwards
  let reply = aiResponse;
  if (dataMatch && dataMatch.index !== undefined) {
    // Only remove everything from [DATA] onwards, preserve everything before
    const dataIndex = dataMatch.index;
    reply = aiResponse.substring(0, dataIndex).trim();
    
    // Ensure we don't accidentally remove content before [DATA]
    if (reply.length === 0) {
      console.warn('⚠️ Warning: Reply became empty after removing [DATA] tag');
      // Fallback: use original response without [DATA] section
      reply = aiResponse.replace(/\[DATA\][\s\S]*$/, '').trim();
    }
  } else {
    reply = aiResponse.trim();
  }
  
  // Clean the reply to remove format markers (but preserve content)
  reply = cleanAIResponse(reply);
  
  // Ensure reply is not empty
  if (reply.length === 0) {
    console.error('❌ Error: Reply is empty after parsing!');
    reply = aiResponse.replace(/\[DATA\][\s\S]*$/, '').trim();
    // If still empty, use original
    if (reply.length === 0) {
      reply = aiResponse.trim();
    }
  }
  
  // Log parsing result for debugging
  console.log('📝 Parsed AI Response:', {
    originalLength: aiResponse.length,
    replyLength: reply.length,
    hasFilters: !!filters,
    replyPreview: reply.substring(0, 200),
    replyEnd: reply.slice(-100), // Show last 100 chars to check if truncated
    dataIndex: dataMatch?.index,
  });

  return { reply, filters };
}

/**
 * Filter properties based on filters object
 */
export function filterPropertiesByFilters(
  filters: {
    maxPrice?: number;
    minPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    amenities?: string[];
    maxWalkingDistance?: number;
  },
  properties: Property[] = sampleProperties
): Property[] {
  return properties.filter((property) => {
    // Price filter
    if (filters.maxPrice !== undefined && property.price > filters.maxPrice) {
      return false;
    }
    if (filters.minPrice !== undefined && property.price < filters.minPrice) {
      return false;
    }

    // Bedrooms filter
    if (filters.minBedrooms !== undefined && property.bedrooms < filters.minBedrooms) {
      return false;
    }
    if (filters.maxBedrooms !== undefined && property.bedrooms > filters.maxBedrooms) {
      return false;
    }

    // Bathrooms filter
    if (filters.minBathrooms !== undefined && property.bathrooms < filters.minBathrooms) {
      return false;
    }
    if (filters.maxBathrooms !== undefined && property.bathrooms > filters.maxBathrooms) {
      return false;
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every((amenity) =>
        property.amenities.some((propAmenity) =>
          propAmenity.toLowerCase().includes(amenity.toLowerCase())
        )
      );
      if (!hasAllAmenities) {
        return false;
      }
    }

    // Walking distance filter
    if (
      filters.maxWalkingDistance !== undefined &&
      property.walkingDistanceToWharton !== undefined &&
      property.walkingDistanceToWharton > filters.maxWalkingDistance
    ) {
      return false;
    }

    return true;
  });
}

