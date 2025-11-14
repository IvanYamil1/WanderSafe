import {
  Place,
  Location,
  UserProfile,
  RecommendationFilters,
  TouristInterest,
  PlaceCategory,
  OpeningHours,
} from 'types';
import { LocationService } from '../location/LocationService';
import { DatabaseService } from '../supabase/database';
import { MOCK_PLACES } from '../mock/mockPlaces';
import {
  RecommendationConfig,
  getCurrentTimePeriod,
  getTimePeriodBoost,
  RecommendationExplanation,
} from './RecommendationConfig';

// Mapping of interests to place categories
const INTEREST_CATEGORY_MAPPING: Record<TouristInterest, PlaceCategory[]> = {
  gastronomia: ['restaurante', 'cafe', 'mercado'],
  cultura: ['museo', 'galeria', 'centro_cultural', 'teatro'],
  naturaleza: ['parque', 'mirador'],
  aventura: ['parque', 'mirador'],
  vida_nocturna: ['bar'],
  compras: ['tienda', 'mercado'],
  historia: ['museo', 'monumento', 'iglesia'],
  arte: ['galeria', 'museo', 'teatro'],
  deportes: ['parque'],
  relax: ['parque', 'cafe', 'mirador'],
};

interface ScoredPlace {
  place: Place;
  score: number;
  explanation: RecommendationExplanation;
}

export class EnhancedRecommendationEngine {
  // Cache for recommendations
  private static recommendationCache: Map<string, {
    places: Place[];
    timestamp: number;
    userProfile: UserProfile;
  }> = new Map();

  // History of shown recommendations (to avoid repetition)
  private static shownPlacesHistory: Set<string> = new Set();

  /**
   * Get personalized recommendations with robust error handling
   */
  static async getRecommendations(
    userLocation: Location,
    userProfile: UserProfile,
    filters?: RecommendationFilters,
  ): Promise<Place[]> {
    try {
      console.log('🎯 STARTING RECOMMENDATIONS');
      console.log('📍 Location:', userLocation);
      console.log('👤 User Profile:', {
        interests: userProfile.interests,
        budget: userProfile.preferred_budget,
        travelStyle: userProfile.travel_style,
        activityLevel: userProfile.activity_level,
        dietary: userProfile.dietary_preferences,
      });
      console.log('🔍 Filters:', filters);

      // 1. Check cache first
      const cached = this.getCachedRecommendations(userLocation, userProfile, filters);
      if (cached) {
        return cached;
      }

      // 2. Get places with fallback strategies
      const places = await this.getPlacesWithFallback(userLocation, filters);

      if (places.length === 0) {
        console.warn('⚠️ No places found, using fallback data');
        return this.getFallbackRecommendations(userLocation, userProfile);
      }

      // 3. Apply filters
      let filteredPlaces = this.applyFilters(places, filters, userProfile);

      // 4. If too few results, relax filters
      if (filteredPlaces.length < RecommendationConfig.search.minResults &&
          RecommendationConfig.fallback.relaxFilters) {
        console.log('📉 Too few results, relaxing filters...');
        filteredPlaces = this.applyFilters(places, undefined, userProfile);
      }

      // 5. Score and rank places
      console.log(`📊 Scoring ${filteredPlaces.length} places...`);
      const scoredPlaces = filteredPlaces.map(place => {
        const score = this.calculateRelevanceScore(place, userProfile, userLocation);
        return {
          place,
          score,
          explanation: this.generateExplanation(place, userProfile, userLocation),
        };
      });

      // Log top 5 scores for debugging
      const top5 = [...scoredPlaces].sort((a, b) => b.score - a.score).slice(0, 5);
      console.log('🏆 Top 5 scored places:');
      top5.forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.place.name} (${item.place.category}): ${item.score.toFixed(1)} pts`);
        console.log(`     ${item.explanation.primaryReason}`);
      });

      // 6. Apply diversity algorithm
      const diversePlaces = this.applyDiversity(scoredPlaces);
      console.log(`🎨 After diversity: ${diversePlaces.length} places`);

      // 7. Apply time-of-day boost
      const timeBoostedPlaces = this.applyTimeBoost(diversePlaces);
      const period = getCurrentTimePeriod();
      console.log(`⏰ Time boost applied for ${period}`);

      // 8. Sort by final score
      timeBoostedPlaces.sort((a, b) => b.score - a.score);

      // 9. Filter out recently shown places (if enabled)
      const freshPlaces = this.filterRecentlyShown(timeBoostedPlaces);

      // 10. Take top results
      const topPlaces = freshPlaces
        .slice(0, RecommendationConfig.search.maxResults)
        .map(item => item.place);

      // 11. Cache results
      this.cacheRecommendations(userLocation, userProfile, topPlaces, filters);

      // 12. Track shown places
      topPlaces.forEach(place => this.shownPlacesHistory.add(place.id));

      console.log(`✅ Generated ${topPlaces.length} personalized recommendations`);
      return topPlaces;

    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      return this.getFallbackRecommendations(userLocation, userProfile);
    }
  }

  /**
   * Get places with multiple fallback strategies
   */
  private static async getPlacesWithFallback(
    location: Location,
    filters?: RecommendationFilters,
  ): Promise<Place[]> {
    let radius = filters?.maxDistance || RecommendationConfig.search.defaultRadius;
    let attempts = 0;
    const maxAttempts = RecommendationConfig.fallback.maxExpansions + 1;

    while (attempts < maxAttempts) {
      try {
        console.log(`🔍 Searching places within ${radius}m (attempt ${attempts + 1}/${maxAttempts})`);

        const places = await DatabaseService.getNearbyPlaces(location, radius, 100);

        if (places.length >= RecommendationConfig.search.minResults) {
          console.log(`✅ Found ${places.length} places`);
          return places;
        }

        // Not enough results, expand radius if allowed
        if (RecommendationConfig.fallback.expandRadius && attempts < maxAttempts - 1) {
          radius += RecommendationConfig.fallback.radiusExpansionStep;
          radius = Math.min(radius, RecommendationConfig.search.maxRadius);
          console.log(`📏 Expanding search radius to ${radius}m`);
        } else {
          return places; // Return what we have
        }

      } catch (error) {
        console.error(`Error fetching places (attempt ${attempts + 1}):`, error);

        // Retry logic
        if (attempts < RecommendationConfig.errors.maxRetries) {
          await new Promise(resolve =>
            setTimeout(resolve, RecommendationConfig.errors.retryDelay)
          );
        } else {
          throw error;
        }
      }

      attempts++;
    }

    return [];
  }

  /**
   * Get fallback recommendations (mock data + basic filtering)
   */
  private static getFallbackRecommendations(
    location: Location,
    userProfile: UserProfile,
  ): Place[] {
    console.log('🔄 Using fallback recommendations (mock data)');

    // Filter mock places by distance
    const placesWithDistance = MOCK_PLACES.map(place => ({
      place,
      distance: LocationService.calculateDistance(
        location,
        { latitude: place.latitude, longitude: place.longitude }
      ),
    }));

    // Sort by distance and relevance
    const nearby = placesWithDistance
      .filter(item => item.distance <= RecommendationConfig.search.defaultRadius * 2)
      .sort((a, b) => {
        const scoreA = this.calculateRelevanceScore(a.place, userProfile, location);
        const scoreB = this.calculateRelevanceScore(b.place, userProfile, location);
        return scoreB - scoreA;
      })
      .slice(0, RecommendationConfig.search.maxResults)
      .map(item => item.place);

    return nearby.length > 0 ? nearby : MOCK_PLACES.slice(0, 10);
  }

  /**
   * Apply filters to places with smart defaults
   */
  private static applyFilters(
    places: Place[],
    filters?: RecommendationFilters,
    userProfile?: UserProfile,
  ): Place[] {
    console.log(`🔧 Applying filters to ${places.length} places`);
    let filtered = [...places];
    const initialCount = filtered.length;

    // Filter by safety rating
    if (RecommendationConfig.safety.enabled && RecommendationConfig.safety.minSafetyRating) {
      const beforeSafety = filtered.length;
      filtered = filtered.filter(
        place => (place.safety_rating || 4.0) >= RecommendationConfig.safety.minSafetyRating
      );
      console.log(`  🛡️ Safety filter: ${beforeSafety} → ${filtered.length}`);
    }

    // Filter by categories
    if (filters?.categories && filters.categories.length > 0) {
      const beforeCategory = filtered.length;
      filtered = filtered.filter(place =>
        filters.categories!.includes(place.category),
      );
      console.log(`  📁 Category filter (${filters.categories.join(', ')}): ${beforeCategory} → ${filtered.length}`);
    } else if (userProfile?.interests && userProfile.interests.length > 0) {
      console.log(`  ℹ️ No category filter, using interests for scoring only`);
    }

    // Filter by budget level
    if (filters?.budgetLevel) {
      const budgetOrder = ['bajo', 'medio', 'alto', 'premium'];
      const maxBudgetIndex = budgetOrder.indexOf(filters.budgetLevel);
      const beforeBudget = filtered.length;
      filtered = filtered.filter(
        place => budgetOrder.indexOf(place.price_level) <= maxBudgetIndex,
      );
      console.log(`  💰 Budget filter (≤${filters.budgetLevel}): ${beforeBudget} → ${filtered.length}`);
    } else if (userProfile?.preferred_budget) {
      // Allow one level above user's budget
      const budgetOrder = ['bajo', 'medio', 'alto', 'premium'];
      const maxBudgetIndex = budgetOrder.indexOf(userProfile.preferred_budget) + 1;
      const beforeBudget = filtered.length;
      filtered = filtered.filter(
        place => budgetOrder.indexOf(place.price_level) <= maxBudgetIndex,
      );
      console.log(`  💰 User budget (≤${userProfile.preferred_budget} +1): ${beforeBudget} → ${filtered.length}`);
    }

    // Filter by minimum rating
    const minRating = filters?.minRating || 3.0;
    const beforeRating = filtered.length;
    filtered = filtered.filter(place => place.rating >= minRating);
    console.log(`  ⭐ Rating filter (≥${minRating}): ${beforeRating} → ${filtered.length}`);

    // Filter by open now
    if (filters?.openNow) {
      const beforeOpen = filtered.length;
      filtered = filtered.filter(place => this.isPlaceOpen(place));
      console.log(`  🕐 Open now filter: ${beforeOpen} → ${filtered.length}`);
    }

    console.log(`  ✅ Total filtered: ${initialCount} → ${filtered.length}`);
    return filtered;
  }

  /**
   * Calculate comprehensive relevance score
   */
  private static calculateRelevanceScore(
    place: Place,
    userProfile: UserProfile,
    userLocation: Location,
  ): number {
    const weights = RecommendationConfig.weights;
    let score = 0;

    // Interest match score
    const interestScore = this.calculateInterestScore(place, userProfile);
    score += interestScore * weights.interests;

    // Rating score
    const ratingScore = place.rating / 5;
    score += ratingScore * weights.rating;

    // Popularity score
    const popularityScore = Math.min(place.review_count / 100, 1);
    score += popularityScore * weights.popularity;

    // Distance score
    const maxDistance = (userProfile.max_distance || 10) * 1000;
    const distance = LocationService.calculateDistance(
      userLocation,
      { latitude: place.latitude, longitude: place.longitude },
    );
    const distanceScore = Math.max(0, 1 - distance / maxDistance);
    score += distanceScore * weights.distance;

    // Budget match score
    const budgetScore = this.calculateBudgetScore(place, userProfile);
    score += budgetScore * weights.budget;

    // Activity level match score
    const activityScore = this.calculateActivityLevelScore(place, userProfile);
    score += activityScore * weights.activityLevel;

    // Travel style match score
    const travelStyleScore = this.calculateTravelStyleScore(place, userProfile);
    score += travelStyleScore * weights.travelStyle;

    // Dietary preferences match score
    const dietaryScore = this.calculateDietaryScore(place, userProfile);
    score += dietaryScore * weights.dietary;

    // Time preference match score
    const timeScore = this.calculateTimePreferenceScore(place, userProfile);
    score += timeScore * weights.timePreference;

    // Safety bonus/penalty
    if (RecommendationConfig.safety.enabled && place.safety_rating) {
      const safetyBonus = (place.safety_rating - 3) * RecommendationConfig.safety.safetyWeight * 10;
      score += safetyBonus;
    }

    return Math.max(0, Math.min(100, score)); // Clamp between 0-100
  }

  /**
   * Calculate interest match score with better defaults
   */
  private static calculateInterestScore(
    place: Place,
    userProfile: UserProfile,
  ): number {
    if (!userProfile.interests || userProfile.interests.length === 0) {
      // No interests set - use popularity as proxy
      return Math.min(place.review_count / 50, 1) * 0.7;
    }

    let matchCount = 0;
    for (const interest of userProfile.interests) {
      const relevantCategories = INTEREST_CATEGORY_MAPPING[interest] || [];

      // Category match
      if (relevantCategories.includes(place.category)) {
        matchCount += 1.0;
      }

      // Tag match
      if (place.tags) {
        const interestStr = interest.toLowerCase();
        const tagMatches = place.tags.filter(tag =>
          tag.toLowerCase().includes(interestStr)
        ).length;
        matchCount += tagMatches * 0.3;
      }
    }

    return Math.min(matchCount / Math.max(userProfile.interests.length, 1), 1);
  }

  /**
   * Calculate budget score with tolerance
   */
  private static calculateBudgetScore(
    place: Place,
    userProfile: UserProfile,
  ): number {
    const budgetOrder = ['bajo', 'medio', 'alto', 'premium'];
    const userBudgetIndex = budgetOrder.indexOf(userProfile.preferred_budget || 'medio');
    const placeBudgetIndex = budgetOrder.indexOf(place.price_level);

    // Perfect match
    if (userBudgetIndex === placeBudgetIndex) return 1.0;

    // One level difference
    const diff = Math.abs(userBudgetIndex - placeBudgetIndex);
    if (diff === 1) return 0.7;

    // Two levels difference
    if (diff === 2) return 0.4;

    // Three levels difference
    return 0.2;
  }

  /**
   * Calculate activity level match score
   */
  private static calculateActivityLevelScore(
    place: Place,
    userProfile: UserProfile,
  ): number {
    if (!userProfile.activity_level) return 0.7;

    const activityCategories = {
      relajado: ['cafe', 'restaurante', 'museo', 'galeria'],
      moderado: ['parque', 'mercado', 'centro_cultural', 'tienda', 'mirador'],
      activo: ['parque', 'mirador'],
      intenso: ['parque', 'mirador'],
    };

    const relevantCategories = activityCategories[userProfile.activity_level] || [];
    return relevantCategories.includes(place.category) ? 1.0 : 0.5;
  }

  /**
   * Calculate travel style match score
   */
  private static calculateTravelStyleScore(
    place: Place,
    userProfile: UserProfile,
  ): number {
    if (!userProfile.travel_style) return 0.7;

    const styleTags = {
      solo: ['tranquilo', 'individual', 'trabajo', 'wifi'],
      pareja: ['romantico', 'pareja', 'cena', 'intimo'],
      familia: ['familia', 'ninos', 'kids', 'playground'],
      amigos: ['grupo', 'social', 'diversion', 'bar'],
      grupo: ['grupos', 'eventos', 'capacidad', 'reservas'],
    };

    const relevantTags = styleTags[userProfile.travel_style] || [];
    if (!place.tags) return 0.6;

    const matchCount = relevantTags.filter(tag =>
      place.tags!.some(placeTag => placeTag.toLowerCase().includes(tag.toLowerCase()))
    ).length;

    return matchCount > 0 ? 1.0 : 0.6;
  }

  /**
   * Calculate dietary preferences match score
   */
  private static calculateDietaryScore(
    place: Place,
    userProfile: UserProfile,
  ): number {
    // Only relevant for food places
    if (!['restaurante', 'cafe', 'bar', 'mercado'].includes(place.category)) {
      return 1.0; // Not applicable, full score
    }

    if (
      !userProfile.dietary_preferences ||
      userProfile.dietary_preferences.length === 0 ||
      userProfile.dietary_preferences.includes('ninguna')
    ) {
      return 1.0;
    }

    if (!place.tags) return 0.5;

    const dietaryTags = {
      vegetariano: ['vegetariano', 'veggie', 'vegetarian'],
      vegano: ['vegano', 'vegan', 'plant-based'],
      sin_gluten: ['sin gluten', 'gluten-free', 'celiac'],
      halal: ['halal'],
      kosher: ['kosher'],
      sin_lactosa: ['sin lactosa', 'lactose-free', 'dairy-free'],
    };

    let matchCount = 0;
    const preferences = userProfile.dietary_preferences.filter(p => p !== 'ninguna');

    for (const pref of preferences) {
      const relevantTags = dietaryTags[pref] || [];
      const hasMatch = relevantTags.some(tag =>
        place.tags!.some(placeTag => placeTag.toLowerCase().includes(tag.toLowerCase()))
      );
      if (hasMatch) matchCount++;
    }

    return preferences.length > 0 ? matchCount / preferences.length : 1.0;
  }

  /**
   * Calculate time preference match score
   */
  private static calculateTimePreferenceScore(
    place: Place,
    userProfile: UserProfile,
  ): number {
    if (!userProfile.preferred_times || userProfile.preferred_times.length === 0) {
      return 1.0;
    }

    const currentPeriod = getCurrentTimePeriod();

    // Check if current time matches user's preferred times
    const isPreferredTime = userProfile.preferred_times.includes(currentPeriod as any);

    // Also check if place is open during preferred times
    if (place.opening_hours) {
      return isPreferredTime ? 1.0 : 0.7;
    }

    return isPreferredTime ? 1.0 : 0.8;
  }

  /**
   * Apply diversity algorithm to avoid too many similar places
   */
  private static applyDiversity(scoredPlaces: ScoredPlace[]): ScoredPlace[] {
    if (!RecommendationConfig.diversity.enabled) {
      return scoredPlaces;
    }

    const config = RecommendationConfig.diversity;
    const categoryCounts = new Map<PlaceCategory, number>();
    const maxPerCategory = Math.ceil(
      scoredPlaces.length * config.maxSameCategoryPercent
    );

    const diverse: ScoredPlace[] = [];
    const remaining: ScoredPlace[] = [];

    // First pass: take top from each category up to max
    for (const item of scoredPlaces) {
      const category = item.place.category;
      const count = categoryCounts.get(category) || 0;

      if (count < maxPerCategory) {
        diverse.push(item);
        categoryCounts.set(category, count + 1);
      } else {
        remaining.push(item);
      }
    }

    // Second pass: fill remaining slots with highest scores
    const slotsRemaining = RecommendationConfig.search.maxResults - diverse.length;
    diverse.push(...remaining.slice(0, slotsRemaining));

    // Boost scores for variety
    const uniqueCategories = new Set(diverse.map(item => item.place.category));
    if (uniqueCategories.size >= config.minCategoryVariety) {
      diverse.forEach(item => {
        item.score *= (1 + config.categorySpreadFactor * 0.1);
      });
    }

    return diverse;
  }

  /**
   * Apply time-of-day boost to scores
   */
  private static applyTimeBoost(scoredPlaces: ScoredPlace[]): ScoredPlace[] {
    if (!RecommendationConfig.timeContext.enabled) {
      return scoredPlaces;
    }

    return scoredPlaces.map(item => ({
      ...item,
      score: item.score * getTimePeriodBoost(item.place.category),
    }));
  }

  /**
   * Filter out recently shown places
   */
  private static filterRecentlyShown(scoredPlaces: ScoredPlace[]): ScoredPlace[] {
    if (!RecommendationConfig.features.avoidRecentlyShown) {
      return scoredPlaces;
    }

    // Keep at least half, even if recently shown
    const minToKeep = Math.ceil(scoredPlaces.length / 2);
    const filtered = scoredPlaces.filter(
      item => !this.shownPlacesHistory.has(item.place.id)
    );

    return filtered.length >= minToKeep ? filtered : scoredPlaces;
  }

  /**
   * Generate explanation for why place was recommended
   */
  private static generateExplanation(
    place: Place,
    userProfile: UserProfile,
    userLocation: Location,
  ): RecommendationExplanation {
    const score = this.calculateRelevanceScore(place, userProfile, userLocation);
    const reasons: string[] = [];

    // Interest match
    if (userProfile.interests) {
      for (const interest of userProfile.interests) {
        const categories = INTEREST_CATEGORY_MAPPING[interest];
        if (categories?.includes(place.category)) {
          reasons.push(`Coincide con tu interés en ${interest}`);
          break;
        }
      }
    }

    // High rating
    if (place.rating >= 4.5) {
      reasons.push(`Excelente calificación (${place.rating.toFixed(1)}⭐)`);
    }

    // Popular
    if (place.review_count > 50) {
      reasons.push(`Popular (${place.review_count} reseñas)`);
    }

    // Close by
    const distance = LocationService.calculateDistance(
      userLocation,
      { latitude: place.latitude, longitude: place.longitude }
    );
    if (distance < 1000) {
      reasons.push(`Muy cerca (${Math.round(distance)}m)`);
    }

    // Budget match
    if (place.price_level === userProfile.preferred_budget) {
      reasons.push(`Precio ${place.price_level}`);
    }

    const primaryReason = reasons[0] || 'Recomendado para ti';
    const secondaryReasons = reasons.slice(1, 3);

    return {
      primaryReason,
      secondaryReasons,
      score,
      matchPercentage: Math.round(score),
    };
  }

  /**
   * Cache recommendations
   */
  private static cacheRecommendations(
    location: Location,
    userProfile: UserProfile,
    places: Place[],
    filters?: RecommendationFilters,
  ): void {
    // Include filters in cache key
    const filterKey = filters?.categories ? filters.categories.sort().join(',') : 'all';
    const key = `${location.latitude}_${location.longitude}_${filterKey}`;
    this.recommendationCache.set(key, {
      places,
      timestamp: Date.now(),
      userProfile,
    });
    console.log(`💾 Cached ${places.length} recommendations with key: ${key}`);
  }

  /**
   * Get cached recommendations if valid
   */
  private static getCachedRecommendations(
    location: Location,
    userProfile: UserProfile,
    filters?: RecommendationFilters,
  ): Place[] | null {
    // Include filters in cache key
    const filterKey = filters?.categories ? filters.categories.sort().join(',') : 'all';
    const key = `${location.latitude}_${location.longitude}_${filterKey}`;
    const cached = this.recommendationCache.get(key);

    if (!cached) {
      console.log(`❌ No cache found for key: ${key}`);
      return null;
    }

    const expirationMs = RecommendationConfig.search.cacheExpirationMinutes * 60 * 1000;
    const isExpired = Date.now() - cached.timestamp > expirationMs;

    if (isExpired) {
      console.log(`⏰ Cache expired for key: ${key}`);
      this.recommendationCache.delete(key);
      return null;
    }

    // Check if user profile changed significantly
    const profileChanged =
      JSON.stringify(cached.userProfile.interests) !== JSON.stringify(userProfile.interests) ||
      cached.userProfile.preferred_budget !== userProfile.preferred_budget;

    if (profileChanged) {
      console.log(`👤 Profile changed, invalidating cache`);
      this.recommendationCache.delete(key);
      return null;
    }

    console.log(`✅ Cache HIT for key: ${key}`);
    return cached.places;
  }

  /**
   * Clear caches (useful for testing or manual refresh)
   */
  static clearCache(): void {
    this.recommendationCache.clear();
    this.shownPlacesHistory.clear();
    console.log('🗑️ Recommendation cache cleared');
  }

  /**
   * Check if place is currently open
   */
  private static isPlaceOpen(place: Place): boolean {
    if (!place.opening_hours) return true;

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[now.getDay()] as keyof typeof place.opening_hours;
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const todayHours = place.opening_hours[dayOfWeek];
    if (!todayHours) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  }

  /**
   * Get trending places
   */
  static async getTrendingPlaces(
    location: Location,
    limit: number = 10,
  ): Promise<Place[]> {
    try {
      const nearbyPlaces = await DatabaseService.getNearbyPlaces(location, 10000, 100);

      if (nearbyPlaces.length === 0) {
        return MOCK_PLACES.slice(0, limit);
      }

      const trending = nearbyPlaces
        .filter(place => place.rating >= 4.0)
        .sort((a, b) => {
          const scoreA = a.rating * Math.log(a.review_count + 1);
          const scoreB = b.rating * Math.log(b.review_count + 1);
          return scoreB - scoreA;
        });

      return trending.slice(0, limit);
    } catch (error) {
      console.error('Error getting trending places:', error);
      return MOCK_PLACES.slice(0, limit);
    }
  }
}
