import { Place, Location, PlaceCategory } from 'types';
import Constants from 'expo-constants';

const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey || 'YOUR_API_KEY_HERE';
const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

// Mapping Google Place types to our categories
const GOOGLE_TYPE_TO_CATEGORY: Record<string, PlaceCategory> = {
  restaurant: 'restaurante',
  cafe: 'cafe',
  bar: 'bar',
  museum: 'museo',
  art_gallery: 'galeria',
  park: 'parque',
  shopping_mall: 'tienda',
  store: 'tienda',
  market: 'mercado',
  church: 'iglesia',
  tourist_attraction: 'monumento',
  point_of_interest: 'mirador',
  night_club: 'bar',
  aquarium: 'museo',
  zoo: 'parque',
  amusement_park: 'parque',
};

interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
  };
}

interface GooglePlaceDetails {
  result: {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    types: string[];
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
    opening_hours?: {
      open_now?: boolean;
      weekday_text?: string[];
      periods?: Array<{
        open: { day: number; time: string };
        close: { day: number; time: string };
      }>;
    };
    formatted_phone_number?: string;
    website?: string;
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
      time: number;
    }>;
  };
}

export class GooglePlacesService {
  /**
   * Get nearby places using Google Places API
   */
  static async getNearbyPlaces(
    location: Location,
    radiusMeters: number = 5000,
    type?: string,
  ): Promise<Place[]> {
    try {
      const { latitude, longitude } = location;
      const url = `${PLACES_API_BASE}/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}${
        type ? `&type=${type}` : ''
      }&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Google Places API error:', data.status, data.error_message);
        throw new Error(`Google Places API error: ${data.status}`);
      }

      if (data.status === 'ZERO_RESULTS' || !data.results) {
        return [];
      }

      // Convert Google Places to our Place format
      const places = data.results.map((gPlace: GooglePlace) =>
        this.convertGooglePlaceToPlace(gPlace)
      );

      return places;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      throw error;
    }
  }

  /**
   * Search places by text query
   */
  static async searchPlaces(
    query: string,
    location?: Location,
    radiusMeters: number = 5000,
  ): Promise<Place[]> {
    try {
      let url = `${PLACES_API_BASE}/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${GOOGLE_PLACES_API_KEY}`;

      if (location) {
        url += `&location=${location.latitude},${location.longitude}&radius=${radiusMeters}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Google Places API error:', data.status);
        throw new Error(`Google Places API error: ${data.status}`);
      }

      if (data.status === 'ZERO_RESULTS' || !data.results) {
        return [];
      }

      const places = data.results.map((gPlace: GooglePlace) =>
        this.convertGooglePlaceToPlace(gPlace)
      );

      return places;
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a place
   */
  static async getPlaceDetails(placeId: string): Promise<Place | null> {
    try {
      const url = `${PLACES_API_BASE}/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,types,photos,opening_hours,formatted_phone_number,website,reviews&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data: GooglePlaceDetails = await response.json();

      if (data.result) {
        return this.convertGooglePlaceDetailsToPlace(data.result);
      }

      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  /**
   * Get photo URL from photo reference
   */
  static getPhotoUrl(
    photoReference: string,
    maxWidth: number = 400,
  ): string {
    return `${PLACES_API_BASE}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  }

  /**
   * Convert Google Place to our Place format
   */
  private static convertGooglePlaceToPlace(gPlace: GooglePlace): Place {
    const category = this.mapGoogleTypeToCategory(gPlace.types);
    const priceLevel = this.mapPriceLevel(gPlace.price_level);

    return {
      id: gPlace.place_id,
      name: gPlace.name,
      category,
      description: `${category} en ${gPlace.vicinity}`,
      latitude: gPlace.geometry.location.lat,
      longitude: gPlace.geometry.location.lng,
      address: gPlace.vicinity,
      rating: gPlace.rating || 0,
      review_count: gPlace.user_ratings_total || 0,
      price_level: priceLevel,
      tags: gPlace.types,
      photos: gPlace.photos
        ? gPlace.photos.slice(0, 5).map((photo) =>
            this.getPhotoUrl(photo.photo_reference)
          )
        : [],
      safety_rating: 4.0, // Default safety rating
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Convert Google Place Details to our Place format
   */
  private static convertGooglePlaceDetailsToPlace(
    gPlace: GooglePlaceDetails['result']
  ): Place {
    const category = this.mapGoogleTypeToCategory(gPlace.types);
    const priceLevel = this.mapPriceLevel(gPlace.price_level);

    return {
      id: gPlace.place_id,
      name: gPlace.name,
      category,
      description: gPlace.formatted_address,
      latitude: gPlace.geometry.location.lat,
      longitude: gPlace.geometry.location.lng,
      address: gPlace.formatted_address,
      rating: gPlace.rating || 0,
      review_count: gPlace.user_ratings_total || 0,
      price_level: priceLevel,
      tags: gPlace.types,
      photos: gPlace.photos
        ? gPlace.photos.slice(0, 5).map((photo) =>
            this.getPhotoUrl(photo.photo_reference)
          )
        : [],
      opening_hours: this.convertOpeningHours(gPlace.opening_hours),
      phone: gPlace.formatted_phone_number,
      website: gPlace.website,
      safety_rating: 4.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Map Google place types to our category
   */
  private static mapGoogleTypeToCategory(types: string[]): PlaceCategory {
    for (const type of types) {
      if (GOOGLE_TYPE_TO_CATEGORY[type]) {
        return GOOGLE_TYPE_TO_CATEGORY[type];
      }
    }
    return 'mirador'; // Default category
  }

  /**
   * Map Google price level to our format
   */
  private static mapPriceLevel(
    priceLevel?: number
  ): 'bajo' | 'medio' | 'alto' | 'premium' {
    if (!priceLevel) return 'medio';
    if (priceLevel === 1) return 'bajo';
    if (priceLevel === 2) return 'medio';
    if (priceLevel === 3) return 'alto';
    return 'premium';
  }

  /**
   * Convert Google opening hours to our format
   */
  private static convertOpeningHours(openingHours?: GooglePlaceDetails['result']['opening_hours']) {
    if (!openingHours?.periods) return undefined;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const converted: any = {};

    openingHours.periods.forEach((period) => {
      if (period.open && period.close) {
        const dayName = days[period.open.day];
        converted[dayName] = {
          open: this.formatTime(period.open.time),
          close: this.formatTime(period.close.time),
        };
      }
    });

    return converted;
  }

  /**
   * Format time from Google format (e.g., "0900") to our format (e.g., "09:00")
   */
  private static formatTime(time: string): string {
    if (time.length === 4) {
      return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
    }
    return time;
  }
}
