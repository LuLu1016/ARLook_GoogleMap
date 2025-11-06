/**
 * Context-Aware Assistant
 * Provides proactive suggestions and situational awareness
 */

import { Property } from '@/shared/types';

export interface TemporalContext {
  season: 'peak' | 'off-peak' | 'transition';
  month: number;
  isRushSeason: boolean;
}

export interface MarketContext {
  priceTrend: 'rising' | 'stable' | 'declining';
  availability: 'tight' | 'moderate' | 'plentiful';
  recentPriceChange?: number; // Percentage change
}

export interface UserContext {
  stage: 'exploring' | 'shortlisting' | 'comparing' | 'deciding';
  timeline?: string; // e.g., "September 2024"
  urgency: 'low' | 'medium' | 'high';
}

export interface GeographicContext {
  area: string;
  supplyLevel: 'tight' | 'moderate' | 'plentiful';
  competitionLevel: 'high' | 'moderate' | 'low';
}

export interface ContextualInformation {
  temporalContext: TemporalContext;
  marketContext: MarketContext;
  userContext: UserContext;
  geographicContext: GeographicContext;
}

/**
 * Context-Aware Assistant
 */
export class ContextAwareAssistant {
  /**
   * Understand current context
   */
  understandContext(userTimeline?: string): ContextualInformation {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12

    // Determine season
    let season: TemporalContext['season'] = 'transition';
    let isRushSeason = false;
    if (month >= 6 && month <= 8) {
      season = 'peak'; // Summer (June-August) is peak rental season
      isRushSeason = true;
    } else if (month >= 4 && month <= 5) {
      season = 'peak'; // Spring (April-May) is also busy
      isRushSeason = true;
    } else {
      season = 'off-peak';
    }

    // Market context (simulated - in production, use real data)
    const marketContext: MarketContext = {
      priceTrend: 'rising', // University City tends to have rising prices
      availability: 'tight', // University area is typically tight
      recentPriceChange: 5, // Simulated 5% increase
    };

    // User context
    const userContext: UserContext = {
      stage: 'exploring',
      timeline: userTimeline,
      urgency: this.determineUrgency(userTimeline, month),
    };

    // Geographic context
    const geographicContext: GeographicContext = {
      area: 'University City',
      supplyLevel: 'tight',
      competitionLevel: 'high',
    };

    return {
      temporalContext: { season, month, isRushSeason },
      marketContext,
      userContext,
      geographicContext,
    };
  }

  /**
   * Determine urgency based on timeline
   */
  private determineUrgency(
    timeline: string | undefined,
    currentMonth: number
  ): 'low' | 'medium' | 'high' {
    if (!timeline) return 'low';

    // Extract month from timeline (e.g., "September 2024" -> 9)
    const timelineMatch = timeline.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i);
    if (!timelineMatch) return 'medium';

    const monthMap: { [key: string]: number } = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };

    const targetMonth =
      monthMap[timelineMatch[1].toLowerCase()] || currentMonth;
    let monthsUntilMove = targetMonth - currentMonth;
    if (monthsUntilMove < 0) monthsUntilMove += 12;

    if (monthsUntilMove <= 2) return 'high';
    if (monthsUntilMove <= 4) return 'medium';
    return 'low';
  }

  /**
   * Provide proactive suggestions
   */
  provideProactiveSuggestions(
    context: ContextualInformation,
    properties: Property[]
  ): string[] {
    const suggestions: string[] = [];

    // Temporal suggestions
    if (context.temporalContext.isRushSeason) {
      suggestions.push(
        `This is peak rental season (${this.getMonthName(context.temporalContext.month)}). Properties tend to get rented quickly, so I recommend starting your search early.`
      );
    }

    // Market suggestions
    if (context.marketContext.priceTrend === 'rising') {
      suggestions.push(
        `Rental prices in this area have been trending upward (${context.marketContext.recentPriceChange}% increase recently). Consider locking in a property soon if you find a good match.`
      );
    }

    // Urgency suggestions
    if (context.userContext.urgency === 'high') {
      suggestions.push(
        `Based on your timeline, you'll need to move soon. I recommend prioritizing properties that are available immediately and can accommodate a quick move-in.`
      );
    }

    // Availability suggestions
    if (context.geographicContext.supplyLevel === 'tight') {
      suggestions.push(
        `University City has limited availability, especially for properties near Wharton. The ${properties.length} options I found are competitive - I suggest reviewing them promptly.`
      );
    }

    return suggestions;
  }

  /**
   * Generate comparative analysis
   */
  generateComparativeAnalysis(properties: Property[]): string {
    if (properties.length < 2) {
      return '';
    }

    const topThree = properties.slice(0, 3);
    const avgPrice =
      topThree.reduce((sum, p) => sum + p.price, 0) / topThree.length;
    const minPrice = Math.min(...topThree.map((p) => p.price));
    const maxPrice = Math.max(...topThree.map((p) => p.price));

    const avgDistance =
      topThree
        .filter((p) => p.walkingDistanceToWharton !== undefined)
        .reduce(
          (sum, p) => sum + (p.walkingDistanceToWharton || 0),
          0
        ) /
      topThree.filter((p) => p.walkingDistanceToWharton !== undefined)
        .length;

    let analysis = `Comparative Analysis:\n\n`;
    analysis += `Price Range: $${minPrice} - $${maxPrice} per person (average: $${Math.round(avgPrice)})\n`;
    if (!isNaN(avgDistance)) {
      analysis += `Average walking distance: ${Math.round(avgDistance)} minutes\n`;
    }

    // Value comparison
    const valueLeader = topThree.reduce((best, current) => {
      const currentValue = current.walkingDistanceToWharton
        ? current.price / current.walkingDistanceToWharton
        : current.price;
      const bestValue = best.walkingDistanceToWharton
        ? best.price / best.walkingDistanceToWharton
        : best.price;
      return currentValue < bestValue ? current : best;
    });

    analysis += `\nBest value: ${valueLeader.name} offers the best price-to-distance ratio at $${valueLeader.price}/person, ${valueLeader.walkingDistanceToWharton} minutes walk.\n`;

    return analysis;
  }

  private getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1] || 'Unknown';
  }
}

