import { Property } from '@/types';
import { sampleProperties } from './properties';

/**
 * Property embedding representation (simulated - can be replaced with real vector DB)
 */
export interface PropertyEmbedding {
  id: string;
  embedding: number[]; // Simulated vector
  metadata: {
    price: number;
    bedrooms: number;
    bathrooms: number;
    walkingDistance?: number;
    amenities: string[];
    description: string;
    name: string;
    address: string;
  };
}

/**
 * Search strategy types
 */
export type SearchStrategy = 'keyword' | 'semantic' | 'hybrid';

/**
 * Retrieval result with metadata
 */
export interface RetrievalResult {
  properties: Property[];
  strategy: SearchStrategy;
  confidence: number;
  keywordMatches?: Property[];
  semanticMatches?: Property[];
}

/**
 * Hybrid Retriever for RAG system
 */
export class HybridRetriever {
  /**
   * Generate simple embedding for a property (simulated)
   * In production, this would use OpenAI embeddings API
   */
  private generateEmbedding(property: Property): number[] {
    // Simulated embedding based on property features
    const features = [
      property.price / 3000, // Normalized price (0-1)
      property.bedrooms / 3, // Normalized bedrooms (0-1)
      property.bathrooms / 3, // Normalized bathrooms (0-1)
      (property.walkingDistanceToWharton || 20) / 20, // Normalized distance (0-1)
      property.amenities.includes('In-unit laundry') ? 1 : 0,
      property.amenities.includes('Gym') ? 1 : 0,
      property.amenities.includes('Parking') ? 1 : 0,
      property.description.toLowerCase().includes('modern') ? 1 : 0,
      property.description.toLowerCase().includes('luxury') ? 1 : 0,
      property.description.toLowerCase().includes('quiet') ? 1 : 0,
    ];
    return features;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Generate query embedding (simulated)
   * In production, this would use OpenAI embeddings API
   */
  private generateQueryEmbedding(query: string, properties: Property[]): number[] {
    const lowerQuery = query.toLowerCase();
    
    // Extract features from query
    const features = [
      this.extractPrice(lowerQuery) / 3000, // Normalized price
      this.extractBedrooms(lowerQuery) / 3, // Normalized bedrooms
      this.extractBathrooms(lowerQuery) / 3, // Normalized bathrooms
      this.extractWalkingDistance(lowerQuery) / 20, // Normalized distance
      lowerQuery.includes('laundry') || lowerQuery.includes('洗烘') ? 1 : 0,
      lowerQuery.includes('gym') || lowerQuery.includes('健身房') ? 1 : 0,
      lowerQuery.includes('parking') || lowerQuery.includes('停车') ? 1 : 0,
      lowerQuery.includes('modern') || lowerQuery.includes('现代') ? 1 : 0,
      lowerQuery.includes('luxury') || lowerQuery.includes('豪华') ? 1 : 0,
      lowerQuery.includes('quiet') || lowerQuery.includes('安静') || lowerQuery.includes('学习') ? 1 : 0,
    ];
    
    return features;
  }

  /**
   * Extract price from query
   */
  private extractPrice(query: string): number {
    // Look for price patterns like "$1500", "1500", "预算2000"
    const priceMatch = query.match(/(\$?)(\d{3,5})/);
    if (priceMatch) {
      const price = parseInt(priceMatch[2]);
      if (query.includes('以下') || query.includes('below') || query.includes('under')) {
        return price * 1.2; // For "below $1500", use slightly higher for matching
      }
      if (query.includes('以上') || query.includes('above') || query.includes('over')) {
        return price * 0.8; // For "above $1500", use slightly lower
      }
      return price;
    }
    return 2000; // Default average price
  }

  /**
   * Extract bedrooms from query
   */
  private extractBedrooms(query: string): number {
    const bedroomMatch = query.match(/(\d+)\s*(b|bed|bedroom|卧|室)/);
    if (bedroomMatch) {
      return parseInt(bedroomMatch[1]);
    }
    // Check for Chinese patterns
    if (query.includes('一卧') || query.includes('1卧')) return 1;
    if (query.includes('二卧') || query.includes('2卧')) return 2;
    if (query.includes('三卧') || query.includes('3卧')) return 3;
    return 1.5; // Default average
  }

  /**
   * Extract bathrooms from query
   */
  private extractBathrooms(query: string): number {
    const bathMatch = query.match(/(\d+)\s*(bath|bathroom|卫)/);
    if (bathMatch) {
      return parseInt(bathMatch[1]);
    }
    if (query.includes('一卫') || query.includes('1卫')) return 1;
    if (query.includes('二卫') || query.includes('2卫')) return 2;
    return 1; // Default
  }

  /**
   * Extract walking distance from query
   */
  private extractWalkingDistance(query: string): number {
    const distanceMatch = query.match(/(\d+)\s*(分钟|min|minute|walk)/);
    if (distanceMatch) {
      return parseInt(distanceMatch[1]);
    }
    if (query.includes('附近') || query.includes('near') || query.includes('close')) {
      return 10; // Default for "nearby"
    }
    return 15; // Default average distance
  }

  /**
   * Keyword search - exact matching based on price, bedrooms, bathrooms, amenities, distance
   */
  keywordSearch(query: string, properties: Property[]): Property[] {
    const lowerQuery = query.toLowerCase();
    const results: Property[] = [];

    for (const property of properties) {
      let score = 0;
      let matches = 0;

      // Price matching
      const priceMatch = query.match(/(\$?)(\d{3,5})/);
      if (priceMatch) {
        const queryPrice = parseInt(priceMatch[2]);
        if (lowerQuery.includes('以下') || lowerQuery.includes('below') || lowerQuery.includes('under')) {
          if (property.price <= queryPrice) {
            score += 3;
            matches++;
          }
        } else if (lowerQuery.includes('以上') || lowerQuery.includes('above') || lowerQuery.includes('over')) {
          if (property.price >= queryPrice) {
            score += 3;
            matches++;
          }
        } else if (lowerQuery.includes('预算')) {
          // Budget range matching
          const rangeMatch = query.match(/(\d+)\s*[-~]\s*(\d+)/);
          if (rangeMatch) {
            const min = parseInt(rangeMatch[1]);
            const max = parseInt(rangeMatch[2]);
            if (property.price >= min && property.price <= max) {
              score += 3;
              matches++;
            }
          } else if (Math.abs(property.price - queryPrice) <= 200) {
            score += 2;
            matches++;
          }
        } else if (Math.abs(property.price - queryPrice) <= 200) {
          score += 3;
          matches++;
        }
      }

      // Bedroom matching
      const bedroomMatch = query.match(/(\d+)\s*(b|bed|bedroom|卧|室)/);
      if (bedroomMatch) {
        const queryBedrooms = parseInt(bedroomMatch[1]);
        if (property.bedrooms === queryBedrooms) {
          score += 2;
          matches++;
        }
      } else if (query.includes('一卧') || query.includes('1卧')) {
        if (property.bedrooms === 1) {
          score += 2;
          matches++;
        }
      } else if (query.includes('二卧') || query.includes('2卧')) {
        if (property.bedrooms === 2) {
          score += 2;
          matches++;
        }
      }

      // Bathroom matching
      const bathMatch = query.match(/(\d+)\s*(bath|bathroom|卫)/);
      if (bathMatch) {
        const queryBathrooms = parseInt(bathMatch[1]);
        if (property.bathrooms === queryBathrooms) {
          score += 2;
          matches++;
        }
      }

      // Amenities matching
      const amenities = property.amenities.map(a => a.toLowerCase());
      if (lowerQuery.includes('laundry') || lowerQuery.includes('洗烘')) {
        if (amenities.some(a => a.includes('laundry'))) {
          score += 2;
          matches++;
        }
      }
      if (lowerQuery.includes('gym') || lowerQuery.includes('健身房')) {
        if (amenities.some(a => a.includes('gym'))) {
          score += 2;
          matches++;
        }
      }
      if (lowerQuery.includes('parking') || lowerQuery.includes('停车')) {
        if (amenities.some(a => a.includes('parking'))) {
          score += 1;
          matches++;
        }
      }

      // Walking distance matching
      if (property.walkingDistanceToWharton !== undefined) {
        if (lowerQuery.includes('wharton') || lowerQuery.includes('附近')) {
          if (property.walkingDistanceToWharton <= 10) {
            score += 3;
            matches++;
          }
        }
        const distanceMatch = query.match(/(\d+)\s*(分钟|min|minute|walk)/);
        if (distanceMatch) {
          const queryDistance = parseInt(distanceMatch[1]);
          if (Math.abs(property.walkingDistanceToWharton - queryDistance) <= 3) {
            score += 2;
            matches++;
          }
        }
      }

      if (score > 0) {
        results.push({ ...property, score } as Property & { score: number });
      }
    }

    // Sort by score and return top matches
    return results
      .sort((a, b) => (b as any).score - (a as any).score)
      .slice(0, 10)
      .map(p => {
        const { score, ...rest } = p as Property & { score: number };
        return rest;
      });
  }

  /**
   * Semantic search - fuzzy matching based on description, amenities, location
   */
  semanticSearch(query: string, properties: Property[]): Property[] {
    const queryEmbedding = this.generateQueryEmbedding(query, properties);
    const results: Array<Property & { similarity: number }> = [];

    for (const property of properties) {
      const propertyEmbedding = this.generateEmbedding(property);
      const similarity = this.cosineSimilarity(queryEmbedding, propertyEmbedding);

      // Also check text similarity
      let textSimilarity = 0;
      const lowerQuery = query.toLowerCase();
      const lowerDesc = property.description.toLowerCase();
      const lowerName = property.name.toLowerCase();

      // Check if query keywords appear in description
      const queryWords = lowerQuery.split(/\s+/);
      let matchingWords = 0;
      for (const word of queryWords) {
        if (word.length > 2 && (lowerDesc.includes(word) || lowerName.includes(word))) {
          matchingWords++;
        }
      }
      textSimilarity = matchingWords / Math.max(queryWords.length, 1);

      // Combine vector similarity and text similarity
      const combinedSimilarity = (similarity * 0.7 + textSimilarity * 0.3);

      if (combinedSimilarity > 0.3) {
        results.push({ ...property, similarity: combinedSimilarity });
      }
    }

    // Sort by similarity and return top matches
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map(p => {
        const { similarity, ...rest } = p;
        return rest;
      });
  }

  /**
   * LLM route - determine search strategy using OpenAI
   */
  async routeQuery(query: string, openai?: any): Promise<SearchStrategy> {
    // If OpenAI is not available, use heuristic routing
    if (!openai) {
      return this.heuristicRoute(query);
    }

    try {
      const routePrompt = `你是一个查询分类器。请分析用户的租房查询，判断最适合的检索方式：

查询类型：
- keyword: 明确的条件（"$1500以下 2b2b 带洗烘"、"预算$1800-2000"、"1卧1卫"）
- semantic: 模糊/语义需求（"安静的学习环境"、"社交氛围好的"、"适合研究生的"、"交通便利的"）
- hybrid: 混合型（"离学校近的舒适公寓"、"Wharton附近带健身房的"）

用户查询：${query}

只返回 keyword、semantic 或 hybrid 中的一个词，不要其他内容。`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个查询分类器，只返回一个词：keyword、semantic 或 hybrid。',
          },
          {
            role: 'user',
            content: routePrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const response = completion.choices[0]?.message?.content?.trim().toLowerCase() || '';
      
      if (response.includes('keyword')) return 'keyword';
      if (response.includes('semantic')) return 'semantic';
      if (response.includes('hybrid')) return 'hybrid';
      
      return 'hybrid'; // Default fallback
    } catch (error) {
      console.error('Error routing query:', error);
      return this.heuristicRoute(query);
    }
  }

  /**
   * Heuristic routing when OpenAI is not available
   */
  private heuristicRoute(query: string): SearchStrategy {
    const lowerQuery = query.toLowerCase();
    
    // Check for explicit keywords
    const hasPrice = /\$?\d{3,5}/.test(query);
    const hasBedrooms = /(\d+)\s*(b|bed|bedroom|卧|室)/.test(query);
    const hasBathrooms = /(\d+)\s*(bath|bathroom|卫)/.test(query);
    const hasAmenities = /(laundry|洗烘|gym|健身房|parking|停车)/.test(lowerQuery);
    
    // Check for semantic keywords
    const hasSemantic = /(安静|quiet|舒适|comfortable|适合|适合|学习|study|社交|social|氛围|atmosphere|交通|便利|convenient)/.test(lowerQuery);
    
    const explicitKeywords = hasPrice || hasBedrooms || hasBathrooms || hasAmenities;
    
    if (explicitKeywords && hasSemantic) {
      return 'hybrid';
    } else if (explicitKeywords) {
      return 'keyword';
    } else if (hasSemantic) {
      return 'semantic';
    }
    
    return 'hybrid'; // Default to hybrid
  }

  /**
   * Hybrid retrieval main entry point
   */
  async retrieve(
    query: string,
    properties: Property[] = sampleProperties,
    openai?: any
  ): Promise<RetrievalResult> {
    const strategy = await this.routeQuery(query, openai);

    let keywordMatches: Property[] = [];
    let semanticMatches: Property[] = [];
    let finalResults: Property[] = [];

    if (strategy === 'keyword') {
      keywordMatches = this.keywordSearch(query, properties);
      finalResults = keywordMatches;
    } else if (strategy === 'semantic') {
      semanticMatches = this.semanticSearch(query, properties);
      finalResults = semanticMatches;
    } else {
      // Hybrid: combine both
      keywordMatches = this.keywordSearch(query, properties);
      semanticMatches = this.semanticSearch(query, properties);
      
      // Merge and deduplicate
      const merged = new Map<string, Property>();
      
      // Add keyword matches with higher priority
      keywordMatches.forEach(p => merged.set(p.id, p));
      
      // Add semantic matches (keyword matches take precedence)
      semanticMatches.forEach(p => {
        if (!merged.has(p.id)) {
          merged.set(p.id, p);
        }
      });
      
      finalResults = Array.from(merged.values());
    }

    // Calculate confidence based on match count
    const confidence = Math.min(finalResults.length / 5, 1.0);

    return {
      properties: finalResults,
      strategy,
      confidence,
      keywordMatches: keywordMatches.length > 0 ? keywordMatches : undefined,
      semanticMatches: semanticMatches.length > 0 ? semanticMatches : undefined,
    };
  }
}

