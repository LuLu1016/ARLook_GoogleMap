/**
 * Intelligent Reasoning Engine
 * Multi-stage reasoning pipeline for rental property queries
 */

import OpenAI from 'openai';
import { Property } from '@/shared/types';

export interface SearchContext {
  userQuery: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userProfile?: UserCognitiveModel;
}

export interface UserCognitiveModel {
  explicitPreferences: {
    budget?: { min: number; max: number };
    locationPriorities?: string[];
    mustHaveAmenities?: string[];
    dealBreakers?: string[];
  };
  implicitPreferences: {
    valueSensitivity: number; // 0-1, higher = more price sensitive
    commuteTolerance: number; // 0-1, higher = more willing to walk
    amenityImportance: { [amenity: string]: number };
    neighborhoodPreferences?: string[];
  };
  decisionStyle?: 'analytical' | 'intuitive' | 'risk-averse' | 'value-seeker';
}

export interface ClarificationResult {
  needsClarification: boolean;
  clarifiedQuery: string;
  missingInfo: string[];
  clarificationQuestions?: string[];
}

/**
 * Rental Reasoning Engine - Multi-stage intelligent processing
 */
export class RentalReasoningEngine {
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  /**
   * Stage 1: Clarify user needs
   */
  async clarifyNeeds(
    userQuery: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<ClarificationResult> {
    const clarificationPrompt = `You are an experienced rental consultant. Analyze the user query and identify if critical information is MISSING.

User Query: "${userQuery}"

Previous conversation context:
${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n') || 'None'}

IMPORTANT: Only request clarification if information is TRULY MISSING and CRITICAL for the search. For example:
- "Apartments near Wharton" - has location, NO clarification needed
- "Apartments" - missing location, clarification needed
- "Budget $1500-2000 near Wharton" - has location and budget, NO clarification needed
- "Apartments" - very vague, clarification needed

Aspects to check:
1. Budget range (ONLY if completely missing AND user seems budget-conscious)
2. Room type preference (ONLY if critical for filtering)
3. Commute preference (ONLY if location is vague)
4. Must-have amenities (ONLY if user has specific needs mentioned)
5. Timeline (ONLY if urgent timing matters)

Return JSON format:
{
  "needsClarification": boolean (true ONLY if information is truly missing),
  "clarifiedQuery": "the refined query (use original if clarification not needed)",
  "missingInfo": ["list of missing information types"],
  "clarificationQuestions": ["specific questions to ask ONLY if clarification needed"]
}

If the query contains location (Wharton, University City, etc.) and some basic criteria, set needsClarification to false.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: clarificationPrompt,
          },
          {
            role: 'user',
            content: userQuery,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      return result as ClarificationResult;
    } catch (error) {
      console.error('Error in clarifyNeeds:', error);
      // Fallback: assume no clarification needed
      return {
        needsClarification: false,
        clarifiedQuery: userQuery,
        missingInfo: [],
      };
    }
  }

  /**
   * Stage 2: Select search strategy
   */
  async selectSearchStrategy(
    clarifiedQuery: string,
    userModel?: UserCognitiveModel
  ): Promise<'keyword' | 'semantic' | 'hybrid'> {
    // Analyze query characteristics
    const lowerQuery = clarifiedQuery.toLowerCase();

    // Keyword-heavy queries (specific names, numbers, explicit requirements)
    const hasKeywords =
      /\$[\d,]+|\d+\s*(bed|bedroom|bath|bathroom|min|minute|walk)/i.test(
        clarifiedQuery
      ) || lowerQuery.includes('budget') || lowerQuery.includes('price');

    // Semantic queries (vague, descriptive, needs understanding)
    const isSemantic =
      lowerQuery.includes('near') ||
      lowerQuery.includes('close to') ||
      lowerQuery.includes('convenient') ||
      lowerQuery.includes('nice') ||
      lowerQuery.includes('good');

    if (hasKeywords && isSemantic) {
      return 'hybrid';
    } else if (hasKeywords) {
      return 'keyword';
    } else {
      return 'semantic';
    }
  }

  /**
   * Stage 3: Rank and explain results
   */
  rankAndExplain(
    properties: Property[],
    userModel?: UserCognitiveModel
  ): Array<Property & { matchScore: number; explanation: string }> {
    return properties
      .map((property) => {
        const matchScore = this.calculateMatchScore(property, userModel);
        const explanation = this.generateExplanation(property, userModel);
        return {
          ...property,
          matchScore,
          explanation,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Calculate personalized match score
   */
  private calculateMatchScore(
    property: Property,
    userModel?: UserCognitiveModel
  ): number {
    if (!userModel) {
      // Default scoring if no user model
      return 50;
    }

    let score = 0;

    // Price matching (within budget gets higher score)
    if (userModel.explicitPreferences.budget) {
      const { min, max } = userModel.explicitPreferences.budget;
      if (property.price >= min && property.price <= max) {
        // Closer to lower end = better (for value seekers)
        const pricePosition = (property.price - min) / (max - min);
        score += 30 * (1 - pricePosition * userModel.implicitPreferences.valueSensitivity);
      } else if (property.price < min) {
        score += 10; // Below budget is okay
      } else {
        score -= 20; // Over budget is bad
      }
    }

    // Commute convenience
    if (property.walkingDistanceToWharton !== undefined) {
      const distanceScore =
        (30 - property.walkingDistanceToWharton) /
        30 *
        userModel.implicitPreferences.commuteTolerance *
        30;
      score += distanceScore;
    }

    // Amenity matching
    if (userModel.explicitPreferences.mustHaveAmenities) {
      userModel.explicitPreferences.mustHaveAmenities.forEach((amenity) => {
        if (
          property.amenities.some((a) =>
            a.toLowerCase().includes(amenity.toLowerCase())
          )
        ) {
          score += 20;
        }
      });
    }

    // Deal breakers
    if (userModel.explicitPreferences.dealBreakers) {
      userModel.explicitPreferences.dealBreakers.forEach((breaker) => {
        if (
          property.amenities.some((a) =>
            a.toLowerCase().includes(breaker.toLowerCase())
          ) ||
          property.description.toLowerCase().includes(breaker.toLowerCase())
        ) {
          score -= 50; // Heavy penalty
        }
      });
    }

    return Math.max(0, Math.min(100, score)); // Clamp to 0-100
  }

  /**
   * Generate personalized explanation
   */
  private generateExplanation(
    property: Property,
    userModel?: UserCognitiveModel
  ): string {
    if (!userModel) {
      return `Modern apartment with ${property.bedrooms} bedroom(s)`;
    }

    const reasons: string[] = [];

    // Price-based reason
    if (userModel.explicitPreferences.budget) {
      const { max } = userModel.explicitPreferences.budget;
      if (property.price <= max) {
        reasons.push(
          `within your budget at $${property.price}/person`
        );
      }
    }

    // Distance-based reason
    if (property.walkingDistanceToWharton !== undefined) {
      reasons.push(
        `${property.walkingDistanceToWharton} minutes walk to Wharton`
      );
    }

    // Amenity-based reason
    if (userModel.explicitPreferences.mustHaveAmenities) {
      const matchingAmenities = userModel.explicitPreferences.mustHaveAmenities.filter(
        (amenity) =>
          property.amenities.some((a) =>
            a.toLowerCase().includes(amenity.toLowerCase())
          )
      );
      if (matchingAmenities.length > 0) {
        reasons.push(`includes ${matchingAmenities.join(' and ')}`);
      }
    }

    return reasons.length > 0
      ? reasons.join(', ')
      : `Modern apartment with ${property.bedrooms} bedroom(s)`;
  }

  /**
   * Stage 4: Generate personalized advice
   */
  async generatePersonalizedAdvice(
    rankedResults: Array<Property & { matchScore: number; explanation: string }>,
    context: SearchContext
  ): Promise<string> {
    const topResults = rankedResults.slice(0, 3);

    if (topResults.length === 0) {
      return "I couldn't find properties matching your criteria. Would you like to adjust your search parameters?";
    }

    let advice = `Based on your search, I found ${rankedResults.length} matching properties. Here are the top ${topResults.length} recommendations:\n\n`;

    topResults.forEach((property, index) => {
      advice += `${index + 1}. ${property.name}\n`;
      advice += `   Address: ${property.address}\n`;
      advice += `   Price: $${property.price} per person, ${property.bedrooms}b${property.bathrooms}b\n`;
      if (property.walkingDistanceToWharton) {
        advice += `   Walking distance: ${property.walkingDistanceToWharton} minutes to Wharton\n`;
      }
      advice += `   Amenities: ${property.amenities.slice(0, 3).join(', ')}\n`;
      advice += `   Why it matches: ${property.explanation}\n\n`;
    });

    // Add next-step suggestions
    advice += `Next steps:\n`;
    advice += `- Would you like to see more options in a different price range?\n`;
    advice += `- I can help you compare these properties side by side.\n`;
    advice += `- If you're interested, I can provide more details about the neighborhood or nearby amenities.`;

    return advice;
  }
}

