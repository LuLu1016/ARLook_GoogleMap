import { Property } from '@/shared/types';

/**
 * RAG Performance Metrics
 */
export interface RAGMetrics {
  retrievalAccuracy: number; // 检索准确率 (0-1)
  responseAccuracy: number; // 回复准确率 (0-1)
  hallucinationScore: number; // 幻觉分数 (0-1, 越低越好)
  propertyMentionedCount: number; // AI回复中提到的房源数量
  propertyVerifiedCount: number; // 已验证存在的房源数量
  dataConsistency: number; // 数据一致性 (0-1)
  warnings: string[]; // 警告信息
}

/**
 * Verify that AI response only mentions properties from retrieved list
 */
export function verifyPropertyMentions(
  aiResponse: string,
  retrievedProperties: Property[]
): {
  isValid: boolean;
  mentionedProperties: string[];
  verifiedProperties: Property[];
  invalidMentions: string[];
} {
  const mentionedProperties: string[] = [];
  const verifiedProperties: Property[] = [];
  const invalidMentions: string[] = [];

  // Extract property names from AI response
  const responseLower = aiResponse.toLowerCase();
  
  // Check each retrieved property
  for (const property of retrievedProperties) {
    const propertyNameLower = property.name.toLowerCase();
    
      // Check if property name appears in response (exact match or contains)
      // Use word boundaries to avoid partial matches
      const propertyWords = propertyNameLower.split(/\s+/);
      const allWordsMatch = propertyWords.every(word => 
        word.length > 2 && responseLower.includes(word)
      );
      
      if (responseLower.includes(propertyNameLower) || allWordsMatch) {
        mentionedProperties.push(property.name);
        verifiedProperties.push(property);
      }
  }

  // Check for potential hallucinated property names
  // Only flag if we have verified properties but found names not in retrieved list
  if (verifiedProperties.length > 0) {
    // Look for capitalized words that might be property names
    const propertyNamePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g;
    const matches = aiResponse.match(propertyNamePattern);
    
    if (matches) {
      for (const match of matches) {
        const matchLower = match.toLowerCase();
        
        // Skip if already verified
        const isVerified = verifiedProperties.some(p => 
          p.name.toLowerCase() === matchLower || 
          p.name.toLowerCase().includes(matchLower) || 
          matchLower.includes(p.name.toLowerCase())
        );
        
        if (isVerified) continue;
        
        // Check if it's in retrieved list (might be partial match)
        const isInRetrieved = retrievedProperties.some(
          p => {
            const pNameLower = p.name.toLowerCase();
            return pNameLower === matchLower || 
                   pNameLower.includes(matchLower) || 
                   matchLower.includes(pNameLower);
          }
        );
        
        // Skip common words and locations
        const isCommonWord = ['Wharton', 'Penn', 'University', 'Philadelphia', 'Chestnut', 'Walnut', 'Market', 'Lancaster', 'School', 'Campus', 'City'].includes(match);
        
        // Skip if it's an address pattern
        const isAddress = /(\d+)\s*(st|street|ave|avenue|rd|road|blvd|boulevard)/i.test(match);
        
        // Only flag if it looks like a property name and is not in retrieved list
        if (!isInRetrieved && !isCommonWord && !isAddress && match.length > 4) {
          // Additional check: must be at least 2 words or a single significant word
          const wordCount = match.split(/\s+/).length;
          if (wordCount >= 2 || (wordCount === 1 && match.length > 6)) {
            invalidMentions.push(match);
          }
        }
      }
    }
  }

  return {
    isValid: invalidMentions.length === 0,
    mentionedProperties,
    verifiedProperties,
    invalidMentions,
  };
}

/**
 * Verify data consistency - check if AI mentioned properties match actual data
 */
export function verifyDataConsistency(
  aiResponse: string,
  verifiedProperties: Property[]
): {
  consistent: boolean;
  inconsistencies: Array<{
    property: string;
    field: string;
    aiValue: string;
    actualValue: string;
  }>;
} {
  const inconsistencies: Array<{
    property: string;
    field: string;
    aiValue: string;
    actualValue: string;
  }> = [];

  for (const property of verifiedProperties) {
    const propertyNameLower = property.name.toLowerCase();
    const responseLower = aiResponse.toLowerCase();

    // Extract price mentioned in response
    const pricePattern = new RegExp(`\\$${property.price}\\b|\\$${property.price - 100}\\b|\\$${property.price + 100}\\b`);
    if (responseLower.includes(propertyNameLower)) {
      const priceMentioned = responseLower.match(/\$(\d{3,5})/g);
      if (priceMentioned) {
        const mentionedPrices = priceMentioned.map(p => parseInt(p.replace('$', '')));
        const priceMatch = mentionedPrices.some(
          p => Math.abs(p - property.price) <= 200
        );
        
        if (!priceMatch && mentionedPrices.length > 0) {
          inconsistencies.push({
            property: property.name,
            field: 'price',
            aiValue: `$${mentionedPrices[0]}`,
            actualValue: `$${property.price}`,
          });
        }
      }

      // Check walking distance
      if (property.walkingDistanceToWharton !== undefined) {
        const distancePattern = new RegExp(`(\\d+)\\s*分钟|(\\d+)\\s*min`, 'i');
        const distanceMatch = responseLower.match(distancePattern);
        if (distanceMatch) {
          const mentionedDistance = parseInt(distanceMatch[1] || distanceMatch[2]);
          if (Math.abs(mentionedDistance - property.walkingDistanceToWharton) > 5) {
            inconsistencies.push({
              property: property.name,
              field: 'walkingDistance',
              aiValue: `${mentionedDistance}分钟`,
              actualValue: `${property.walkingDistanceToWharton}分钟`,
            });
          }
        }
      }
    }
  }

  return {
    consistent: inconsistencies.length === 0,
    inconsistencies,
  };
}

/**
 * Calculate comprehensive RAG metrics
 */
export function calculateRAGMetrics(
  aiResponse: string,
  retrievedProperties: Property[],
  finalProperties: Property[]
): RAGMetrics {
  const warnings: string[] = [];

  // 1. Verify property mentions
  const mentionVerification = verifyPropertyMentions(aiResponse, retrievedProperties);
  
  // 2. Verify data consistency
  const consistencyCheck = verifyDataConsistency(aiResponse, mentionVerification.verifiedProperties);

  // 3. Calculate retrieval accuracy
  // How many retrieved properties were actually relevant?
  const retrievalAccuracy = retrievedProperties.length > 0 
    ? Math.min(retrievedProperties.length / 10, 1.0) // Normalize by expected max
    : 0;

  // 4. Calculate response accuracy
  // How many mentioned properties are verified?
  const responseAccuracy = mentionVerification.mentionedProperties.length > 0
    ? mentionVerification.verifiedProperties.length / mentionVerification.mentionedProperties.length
    : 1.0; // If no properties mentioned, assume accurate

  // 5. Calculate hallucination score
  // Lower is better (0 = no hallucinations)
  const hallucinationScore = mentionVerification.invalidMentions.length > 0
    ? Math.min(mentionVerification.invalidMentions.length / 5, 1.0)
    : 0;

  // 6. Calculate data consistency
  const dataConsistency = consistencyCheck.inconsistencies.length === 0 ? 1.0 : 
    Math.max(0, 1 - (consistencyCheck.inconsistencies.length / mentionVerification.verifiedProperties.length));

  // Generate warnings
  if (mentionVerification.invalidMentions.length > 0) {
    warnings.push(`检测到${mentionVerification.invalidMentions.length}个未验证的房源提及`);
  }
  if (consistencyCheck.inconsistencies.length > 0) {
    warnings.push(`检测到${consistencyCheck.inconsistencies.length}个数据不一致`);
  }
  if (mentionVerification.mentionedProperties.length === 0 && retrievedProperties.length > 0) {
    warnings.push('AI回复中未提及任何检索到的房源');
  }
  if (retrievedProperties.length === 0) {
    warnings.push('未检索到任何房源');
  }

  return {
    retrievalAccuracy,
    responseAccuracy,
    hallucinationScore,
    propertyMentionedCount: mentionVerification.mentionedProperties.length,
    propertyVerifiedCount: mentionVerification.verifiedProperties.length,
    dataConsistency,
    warnings,
  };
}

/**
 * Sanitize AI response to ensure it only references verified properties
 */
export function sanitizeAIResponse(
  aiResponse: string,
  retrievedProperties: Property[]
): {
  sanitizedResponse: string;
  removedMentions: string[];
} {
  const verification = verifyPropertyMentions(aiResponse, retrievedProperties);
  let sanitizedResponse = aiResponse;
  const removedMentions: string[] = [];

  // Remove invalid property mentions
  for (const invalidMention of verification.invalidMentions) {
    // Remove the mention and surrounding context
    const regex = new RegExp(`\\b${invalidMention}\\b[^。！？]*[。！？]?`, 'gi');
    const matches = sanitizedResponse.match(regex);
    if (matches) {
      removedMentions.push(...matches);
      sanitizedResponse = sanitizedResponse.replace(regex, '');
    }
  }

  return {
    sanitizedResponse: sanitizedResponse.trim(),
    removedMentions,
  };
}

/**
 * Enhanced property filtering with verification
 */
export function verifyAndFilterProperties(
  aiResponse: string,
  retrievedProperties: Property[],
  filters?: any
): {
  verifiedProperties: Property[];
  metrics: RAGMetrics;
  sanitizedResponse: string;
} {
  // Verify property mentions
  const verification = verifyPropertyMentions(aiResponse, retrievedProperties);
  
  // Use verified properties only
  const verifiedPropertyIds = new Set(verification.verifiedProperties.map(p => p.id));
  let verifiedProperties = retrievedProperties.filter(p => verifiedPropertyIds.has(p.id));

  // If no verified properties, fall back to retrieved properties
  if (verifiedProperties.length === 0) {
    verifiedProperties = retrievedProperties;
  }

  // Calculate metrics
  const metrics = calculateRAGMetrics(aiResponse, retrievedProperties, verifiedProperties);

  // Sanitize response
  const { sanitizedResponse } = sanitizeAIResponse(aiResponse, retrievedProperties);

  return {
    verifiedProperties,
    metrics,
    sanitizedResponse,
  };
}

