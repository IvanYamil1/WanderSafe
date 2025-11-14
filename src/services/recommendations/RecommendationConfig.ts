/**
 * Configuration for the recommendation system
 * Centralized place to tune recommendation parameters
 */

export const RecommendationConfig = {
  // Scoring weights (must total 100)
  weights: {
    interests: 30,          // User's selected interests
    rating: 20,             // Place rating (1-5 stars)
    popularity: 10,         // Number of reviews
    distance: 10,           // Proximity to user
    budget: 10,             // Price level match
    activityLevel: 5,       // Match with user's activity preference
    travelStyle: 5,         // Match with travel style (solo, family, etc.)
    dietary: 5,             // Dietary preferences match
    timePreference: 5,      // Time of day preference
  },

  // Search parameters
  search: {
    defaultRadius: 5000,           // 5km default search radius
    maxRadius: 20000,              // 20km maximum search radius
    minRadius: 1000,               // 1km minimum search radius
    maxResults: 20,                // Maximum recommendations to return
    minResults: 5,                 // Minimum results to show (use fallbacks if needed)
    cacheExpirationMinutes: 15,    // How long to cache recommendations
  },

  // Diversity settings
  diversity: {
    enabled: true,
    maxSameCategoryPercent: 0.4,   // Max 40% of results from same category
    categorySpreadFactor: 0.3,     // How much to boost variety (0-1)
    minCategoryVariety: 3,         // Minimum number of different categories
  },

  // Time-of-day intelligence
  timeContext: {
    enabled: true,
    morning: {
      hours: [6, 12],
      boostCategories: ['cafe', 'restaurante', 'parque', 'museo'],
      boostFactor: 1.2,
    },
    afternoon: {
      hours: [12, 18],
      boostCategories: ['restaurante', 'museo', 'galeria', 'tienda', 'mercado'],
      boostFactor: 1.2,
    },
    evening: {
      hours: [18, 24],
      boostCategories: ['restaurante', 'bar', 'teatro', 'centro_cultural'],
      boostFactor: 1.2,
    },
    lateNight: {
      hours: [0, 6],
      boostCategories: ['bar'],
      boostFactor: 1.1,
    },
  },

  // Safety considerations
  safety: {
    enabled: true,
    minSafetyRating: 3.0,          // Minimum safety rating (1-5)
    safetyWeight: 0.1,             // How much safety affects score
    warnLowSafety: true,           // Show warning for low safety areas
  },

  // Fallback strategies
  fallback: {
    useCache: true,                 // Use cached results if API fails
    useMockData: true,              // Use mock data as last resort
    expandRadius: true,             // Expand search radius if not enough results
    radiusExpansionStep: 2000,      // Expand by 2km each time
    maxExpansions: 3,               // Maximum number of radius expansions
    relaxFilters: true,             // Relax filters if no results
  },

  // Error handling
  errors: {
    maxRetries: 2,                  // Maximum retry attempts
    retryDelay: 1000,               // Delay between retries (ms)
    timeoutMs: 10000,               // Request timeout
    showUserFriendlyErrors: true,   // Show friendly error messages
  },

  // Features
  features: {
    explainRecommendations: true,   // Show why place was recommended
    trackHistory: true,             // Track viewed/visited places
    avoidRecentlyShown: true,       // Don't repeat recent recommendations
    personalizedOrdering: true,     // Use ML-like scoring
    contextAware: true,             // Consider time, weather, etc.
  },
};

/**
 * Get current time period
 */
export function getCurrentTimePeriod(): 'morning' | 'afternoon' | 'evening' | 'lateNight' {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'lateNight';
}

/**
 * Get boost factor for current time
 */
export function getTimePeriodBoost(category: string): number {
  if (!RecommendationConfig.timeContext.enabled) return 1;

  const period = getCurrentTimePeriod();
  const periodConfig = RecommendationConfig.timeContext[period];

  if (periodConfig.boostCategories.includes(category)) {
    return periodConfig.boostFactor;
  }

  return 1;
}

export type RecommendationExplanation = {
  primaryReason: string;
  secondaryReasons: string[];
  score: number;
  matchPercentage: number;
};
