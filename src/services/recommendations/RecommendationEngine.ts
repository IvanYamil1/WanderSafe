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

// Mapping of interests to place categories
const INTEREST_CATEGORY_MAPPING: Record<
  TouristInterest,
  PlaceCategory[]
> = {
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

export class RecommendationEngine {
  /**
   * Get personalized recommendations for user
   */
  static async getRecommendations(
    userLocation: Location,
    userProfile: UserProfile,
    filters?: RecommendationFilters,
  ): Promise<Place[]> {
    // Get nearby places
    const radiusMeters = filters?.maxDistance || 5000;
    const nearbyPlaces = await DatabaseService.getNearbyPlaces(
      userLocation,
      radiusMeters,
      100,
    );

    // Apply filters
    let filteredPlaces = this.applyFilters(nearbyPlaces, filters);

    // Score and rank places based on user profile
    const scoredPlaces = filteredPlaces.map(place => ({
      place,
      score: this.calculateRelevanceScore(place, userProfile, userLocation),
    }));

    // Sort by score (highest first)
    scoredPlaces.sort((a, b) => b.score - a.score);

    // Return top 20 recommendations
    return scoredPlaces.slice(0, 20).map(item => item.place);
  }

  /**
   * Apply filters to places
   */
  private static applyFilters(
    places: Place[],
    filters?: RecommendationFilters,
  ): Place[] {
    let filtered = [...places];

    // Filter by categories
    if (filters?.categories && filters.categories.length > 0) {
      filtered = filtered.filter(place =>
        filters.categories!.includes(place.category),
      );
    }

    // Filter by budget level
    if (filters?.budgetLevel) {
      const budgetOrder = ['bajo', 'medio', 'alto', 'premium'];
      const maxBudgetIndex = budgetOrder.indexOf(filters.budgetLevel);
      filtered = filtered.filter(
        place => budgetOrder.indexOf(place.price_level) <= maxBudgetIndex,
      );
    }

    // Filter by minimum rating
    if (filters?.minRating) {
      filtered = filtered.filter(place => place.rating >= filters.minRating!);
    }

    // Filter by open now
    if (filters?.openNow) {
      const now = new Date();
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = daysOfWeek[now.getDay()] as keyof OpeningHours;
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      filtered = filtered.filter(place => {
        if (!place.opening_hours) return false;
        const todayHours = place.opening_hours[dayOfWeek];
        if (!todayHours) return false;
        return (
          currentTime >= todayHours.open && currentTime <= todayHours.close
        );
      });
    }

    return filtered;
  }

  /**
   * Calculate relevance score for a place
   */
  private static calculateRelevanceScore(
    place: Place,
    userProfile: UserProfile,
    userLocation: Location,
  ): number {
    let score = 0;

    // Interest match score (0-40 points)
    const interestScore = this.calculateInterestScore(place, userProfile);
    score += interestScore * 40;

    // Rating score (0-25 points)
    const ratingScore = place.rating / 5;
    score += ratingScore * 25;

    // Popularity score based on reviews (0-15 points)
    const popularityScore = Math.min(place.review_count / 100, 1);
    score += popularityScore * 15;

    // Distance score (0-10 points) - closer is better
    const distance = LocationService.calculateDistance(
      userLocation,
      { latitude: place.latitude, longitude: place.longitude },
    );
    const distanceScore = Math.max(0, 1 - distance / 5000); // Max distance 5km
    score += distanceScore * 10;

    // Budget match score (0-10 points)
    const budgetOrder = ['bajo', 'medio', 'alto', 'premium'];
    const userBudgetIndex = budgetOrder.indexOf(userProfile.preferred_budget);
    const placeBudgetIndex = budgetOrder.indexOf(place.price_level);
    const budgetDiff = Math.abs(userBudgetIndex - placeBudgetIndex);
    const budgetScore = Math.max(0, 1 - budgetDiff / 3);
    score += budgetScore * 10;

    return score;
  }

  /**
   * Calculate how well place matches user interests
   */
  private static calculateInterestScore(
    place: Place,
    userProfile: UserProfile,
  ): number {
    if (!userProfile.interests || userProfile.interests.length === 0) {
      return 0.5; // Default neutral score
    }

    let matchCount = 0;
    for (const interest of userProfile.interests) {
      const relevantCategories = INTEREST_CATEGORY_MAPPING[interest] || [];
      if (relevantCategories.includes(place.category)) {
        matchCount++;
      }

      // Also check tags
      const interestStr = interest.toLowerCase();
      if (
        place.tags &&
        place.tags.some(tag => tag.toLowerCase().includes(interestStr))
      ) {
        matchCount += 0.5;
      }
    }

    return Math.min(matchCount / userProfile.interests.length, 1);
  }

  /**
   * Get trending places
   */
  static async getTrendingPlaces(
    location: Location,
    limit: number = 10,
  ): Promise<Place[]> {
    const nearbyPlaces = await DatabaseService.getNearbyPlaces(location, 10000);

    // Sort by combination of rating and review count
    const trending = nearbyPlaces.sort((a, b) => {
      const scoreA = a.rating * Math.log(a.review_count + 1);
      const scoreB = b.rating * Math.log(b.review_count + 1);
      return scoreB - scoreA;
    });

    return trending.slice(0, limit);
  }

  /**
   * Get similar places based on a given place
   */
  static async getSimilarPlaces(
    place: Place,
    userLocation: Location,
    limit: number = 5,
  ): Promise<Place[]> {
    const nearbyPlaces = await DatabaseService.getNearbyPlaces(
      { latitude: place.latitude, longitude: place.longitude },
      3000,
    );

    // Filter same category and similar price level
    const similar = nearbyPlaces
      .filter(p => p.id !== place.id)
      .filter(p => p.category === place.category)
      .filter(p => p.price_level === place.price_level)
      .sort((a, b) => b.rating - a.rating);

    return similar.slice(0, limit);
  }

  /**
   * Check if place is currently open
   */
  static isPlaceOpen(place: Place): boolean {
    if (!place.opening_hours) return true; // Assume open if no hours specified

    const now = new Date();
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayOfWeek = days[now.getDay()] as keyof typeof place.opening_hours;
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const todayHours = place.opening_hours[dayOfWeek];
    if (!todayHours) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  }
}
