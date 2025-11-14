import { Place, Location } from 'types';
import { DatabaseService } from '../supabase/database';
import { GooglePlacesService } from '../google/GooglePlacesService';
import { LocationService } from '../location/LocationService';

interface CacheEntry {
  location: Location;
  radius: number;
  places: Place[];
  timestamp: number;
}

// Cache expiration time: 24 hours
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

// Maximum distance to consider cache valid (in meters)
const MAX_CACHE_DISTANCE = 1000; // 1km

export class PlacesCacheService {
  private static memoryCache: Map<string, CacheEntry> = new Map();

  /**
   * Get places with caching strategy:
   * 1. Check memory cache
   * 2. Check database cache
   * 3. Fetch from Google Places API
   * 4. Save to database and memory cache
   */
  static async getNearbyPlaces(
    location: Location,
    radiusMeters: number = 5000,
    forceRefresh: boolean = false,
  ): Promise<Place[]> {
    // 1. Check memory cache first (fastest)
    if (!forceRefresh) {
      const memoryCached = this.getFromMemoryCache(location, radiusMeters);
      // Only use memory cache if we have enough places
      if (memoryCached && memoryCached.length >= 10) {
        console.log(`✅ Using memory cache (${memoryCached.length} places)`);
        return memoryCached;
      } else if (memoryCached && memoryCached.length > 0) {
        console.log(`⚠️ Memory cache has only ${memoryCached.length} places, fetching fresh data...`);
      }

      // 2. Check database cache (faster than API call)
      const dbCached = await this.getFromDatabaseCache(location, radiusMeters);
      // Only use DB cache if we have enough places (at least 10)
      if (dbCached && dbCached.length >= 10) {
        console.log(`✅ Using database cache (${dbCached.length} places)`);
        // Save to memory cache for next time
        this.saveToMemoryCache(location, radiusMeters, dbCached);
        return dbCached;
      } else if (dbCached && dbCached.length > 0) {
        console.log(`⚠️ DB cache has only ${dbCached.length} places, fetching from Google Places for more...`);
      }
    }

    // 3. Fetch from Google Places API (slowest, costs money)
    console.log('🔍 Fetching from Google Places API');
    try {
      const places = await GooglePlacesService.getNearbyPlaces(
        location,
        radiusMeters
      );

      // 4. Save to both caches
      await this.saveToDatabaseCache(places);
      this.saveToMemoryCache(location, radiusMeters, places);

      return places;
    } catch (error) {
      console.error('Error fetching from Google Places:', error);
      // Fallback to database cache even if expired
      const fallback = await this.getFromDatabaseCache(location, radiusMeters, true);
      return fallback || [];
    }
  }

  /**
   * Search places with caching
   */
  static async searchPlaces(
    query: string,
    location: Location,
    radiusMeters: number = 5000,
  ): Promise<Place[]> {
    const cacheKey = `search_${query}_${location.latitude}_${location.longitude}_${radiusMeters}`;

    // Check memory cache
    const cached = this.memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
      console.log('✅ Using memory cache for search');
      return cached.places;
    }

    // Fetch from Google Places
    console.log('🔍 Searching Google Places API');
    try {
      const places = await GooglePlacesService.searchPlaces(
        query,
        location,
        radiusMeters
      );

      // Save to cache
      this.memoryCache.set(cacheKey, {
        location,
        radius: radiusMeters,
        places,
        timestamp: Date.now(),
      });

      await this.saveToDatabaseCache(places);

      return places;
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Get place details with caching
   */
  static async getPlaceDetails(placeId: string): Promise<Place | null> {
    // Check if already in database
    try {
      const dbPlace = await DatabaseService.getPlaceById(placeId);
      if (dbPlace) {
        console.log('✅ Using database cache for place details');
        return dbPlace;
      }
    } catch (error) {
      console.log('Place not in database, fetching from API');
    }

    // Fetch from Google Places
    console.log('🔍 Fetching place details from Google Places API');
    const place = await GooglePlacesService.getPlaceDetails(placeId);

    if (place) {
      // Save to database
      await this.saveToDatabase(place);
    }

    return place;
  }

  /**
   * Get from memory cache
   */
  private static getFromMemoryCache(
    location: Location,
    radius: number
  ): Place[] | null {
    for (const [key, entry] of this.memoryCache.entries()) {
      // Check if cache is still valid
      if (Date.now() - entry.timestamp > CACHE_EXPIRATION_MS) {
        this.memoryCache.delete(key);
        continue;
      }

      // Check if location is close enough
      const distance = LocationService.calculateDistance(
        location,
        entry.location
      );

      if (distance <= MAX_CACHE_DISTANCE && entry.radius >= radius) {
        return entry.places;
      }
    }

    return null;
  }

  /**
   * Get from database cache
   */
  private static async getFromDatabaseCache(
    location: Location,
    radius: number,
    ignoreExpiration: boolean = false
  ): Promise<Place[] | null> {
    try {
      // Use direct database method to avoid circular dependency
      const places = await DatabaseService.getNearbyPlacesFromDatabase(
        location,
        radius,
        100
      );

      if (!places || places.length === 0) {
        return null;
      }

      // Check if data is fresh enough
      if (!ignoreExpiration && places[0]?.updated_at) {
        const oldestPlace = places[0];
        const updatedAt = oldestPlace.updated_at;
        if (updatedAt) {
          const placeAge = Date.now() - new Date(updatedAt).getTime();

          if (placeAge > CACHE_EXPIRATION_MS) {
            console.log('⚠️ Database cache expired');
            return null;
          }
        }
      }

      return places;
    } catch (error) {
      console.error('Error reading from database cache:', error);
      return null;
    }
  }

  /**
   * Save to memory cache
   */
  private static saveToMemoryCache(
    location: Location,
    radius: number,
    places: Place[]
  ): void {
    const key = `${location.latitude}_${location.longitude}_${radius}`;
    this.memoryCache.set(key, {
      location,
      radius,
      places,
      timestamp: Date.now(),
    });

    // Limit memory cache size to prevent memory leaks
    if (this.memoryCache.size > 10) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }
  }

  /**
   * Save places to database cache
   */
  private static async saveToDatabaseCache(places: Place[]): Promise<void> {
    try {
      for (const place of places) {
        await this.saveToDatabase(place);
      }
      console.log(`💾 Saved ${places.length} places to database cache`);
    } catch (error) {
      console.error('Error saving to database cache:', error);
    }
  }

  /**
   * Save single place to database
   */
  private static async saveToDatabase(place: Place): Promise<void> {
    try {
      // Check if place already exists
      const existing = await DatabaseService.getPlaceById(place.id);

      if (existing) {
        // Update existing place
        await DatabaseService.updatePlace(place.id, {
          ...place,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Create new place
        await DatabaseService.createPlace({
          ...place,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      // Silently fail - cache is not critical
      console.error('Error saving place to database:', error);
    }
  }

  /**
   * Clear all caches
   */
  static clearCache(): void {
    this.memoryCache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      memoryCacheSize: this.memoryCache.size,
      memoryCacheKeys: Array.from(this.memoryCache.keys()),
    };
  }
}
