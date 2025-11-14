import { supabase } from './client';
import {
  Place,
  Review,
  Favorite,
  VisitHistory,
  UserProfile,
  Event,
  SafetyZone,
  Route,
  Location,
} from 'types';
import { MOCK_PLACES } from '../mock/mockPlaces';
import { LocationService } from '../location/LocationService';
import { PlacesCacheService } from '../cache/PlacesCacheService';

export class DatabaseService {
  // ========== USER PROFILE ==========

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }

  static async createUserProfile(profile: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>,
  ) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ========== PLACES ==========

  static async getPlaces(filters?: {
    category?: string;
    limit?: number;
  }): Promise<Place[]> {
    let query = supabase.from('places').select('*').eq('is_verified', true);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getPlaceById(placeId: string): Promise<Place | null> {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', placeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getNearbyPlaces(
    location: Location,
    radiusMeters: number = 5000,
    limit: number = 50,
  ): Promise<Place[]> {
    try {
      // Use PlacesCacheService which handles:
      // 1. Memory cache
      // 2. Database cache
      // 3. Google Places API
      // 4. Mock data fallback
      const places = await PlacesCacheService.getNearbyPlaces(
        location,
        radiusMeters
      );

      return places.slice(0, limit);
    } catch (error) {
      // Final fallback to mock data
      console.log('Using mock data for nearby places');
      return this.getMockNearbyPlaces(location, radiusMeters, limit);
    }
  }

  /**
   * Get nearby places directly from database (no cache service)
   * Used by PlacesCacheService to avoid circular dependency
   */
  static async getNearbyPlacesFromDatabase(
    location: Location,
    radiusMeters: number = 5000,
    limit: number = 100,
  ): Promise<Place[]> {
    try {
      // Use PostGIS function to find nearby places
      const { data, error } = await supabase.rpc('get_nearby_places', {
        lat: location.latitude,
        long: location.longitude,
        radius_meters: radiusMeters,
      });

      if (error) {
        console.log('Database query error, trying alternative method:', error.message);
        // Fallback: get all places and filter in-memory
        const { data: allPlaces, error: allError } = await supabase
          .from('places')
          .select('*')
          .eq('is_verified', true)
          .limit(1000);

        if (allError) throw allError;

        // Filter by distance manually
        const nearby = (allPlaces || [])
          .map(place => ({
            place,
            distance: LocationService.calculateDistance(
              location,
              { latitude: place.latitude, longitude: place.longitude }
            ),
          }))
          .filter(item => item.distance <= radiusMeters)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, limit)
          .map(item => item.place);

        return nearby;
      }

      return (data || []).slice(0, limit);
    } catch (error) {
      console.error('Error in getNearbyPlacesFromDatabase:', error);
      return [];
    }
  }

  private static getMockNearbyPlaces(
    location: Location,
    radiusMeters: number,
    limit: number,
  ): Place[] {
    // Filter mock places by distance
    const placesWithDistance = MOCK_PLACES.map(place => ({
      place,
      distance: LocationService.calculateDistance(
        location,
        { latitude: place.latitude, longitude: place.longitude }
      ),
    }));

    // Filter by radius and sort by distance
    const nearby = placesWithDistance
      .filter(item => item.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(item => item.place);

    return nearby;
  }

  static async searchPlaces(searchTerm: string, location?: Location): Promise<Place[]> {
    if (location) {
      // Use PlacesCacheService for search with location
      return await PlacesCacheService.searchPlaces(searchTerm, location);
    }

    // Fallback to database search
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .eq('is_verified', true)
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  static async createPlace(place: Partial<Place>): Promise<Place> {
    const { data, error } = await supabase
      .from('places')
      .insert(place)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePlace(
    placeId: string,
    updates: Partial<Place>
  ): Promise<Place> {
    const { data, error } = await supabase
      .from('places')
      .update(updates)
      .eq('id', placeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ========== REVIEWS ==========

  static async getPlaceReviews(placeId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        user:user_id (
          full_name,
          avatar_url
        )
      `,
      )
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createReview(review: Partial<Review>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;

    // Update place average rating
    await this.updatePlaceRating(review.place_id!);

    return data;
  }

  static async updatePlaceRating(placeId: string) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('place_id', placeId);

    if (!reviews || reviews.length === 0) return;

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await supabase
      .from('places')
      .update({
        rating: avgRating,
        review_count: reviews.length,
      })
      .eq('id', placeId);
  }

  // ========== FAVORITES ==========

  static async getUserFavorites(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(
        `
        *,
        place:place_id (*)
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addFavorite(userId: string, placeId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, place_id: placeId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removeFavorite(userId: string, placeId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('place_id', placeId);

    if (error) throw error;
  }

  static async isFavorite(
    userId: string,
    placeId: string,
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('place_id', placeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // ========== VISIT HISTORY ==========

  static async getVisitHistory(userId: string): Promise<VisitHistory[]> {
    const { data, error } = await supabase
      .from('visit_history')
      .select(
        `
        *,
        place:place_id (*)
      `,
      )
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  static async addVisit(
    userId: string,
    placeId: string,
    durationMinutes?: number,
  ) {
    const { data, error } = await supabase
      .from('visit_history')
      .insert({
        user_id: userId,
        place_id: placeId,
        visited_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ========== EVENTS ==========

  static async getUpcomingEvents(limit: number = 20): Promise<Event[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('end_date', now)
      .order('start_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getNearbyEvents(
    location: Location,
    radiusMeters: number = 10000,
  ): Promise<Event[]> {
    const { data, error } = await supabase.rpc('get_nearby_events', {
      lat: location.latitude,
      long: location.longitude,
      radius_meters: radiusMeters,
    });

    if (error) throw error;
    return data || [];
  }

  static async getEventById(eventId: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // ========== SAFETY ZONES ==========

  static async getSafetyZones(): Promise<SafetyZone[]> {
    const { data, error } = await supabase
      .from('safety_zones')
      .select('*')
      .order('zone_name');

    if (error) throw error;
    return data || [];
  }

  static async getSafetyLevelForLocation(
    location: Location,
    currentHour: number,
  ): Promise<{ level: string; zones: SafetyZone[] }> {
    const { data, error } = await supabase.rpc('get_safety_level', {
      lat: location.latitude,
      long: location.longitude,
      hour: currentHour,
    });

    if (error) throw error;
    return data || { level: 'safe', zones: [] };
  }

  // ========== ROUTES ==========

  static async getUserRoutes(userId: string): Promise<Route[]> {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createRoute(route: Partial<Route>) {
    const { data, error } = await supabase
      .from('routes')
      .insert(route)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteRoute(routeId: string) {
    const { error } = await supabase.from('routes').delete().eq('id', routeId);

    if (error) throw error;
  }
}
