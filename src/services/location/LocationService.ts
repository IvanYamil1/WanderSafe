import * as ExpoLocation from 'expo-location';
import { Location } from 'types';

export class LocationService {
  private static watchSubscription: ExpoLocation.LocationSubscription | null = null;

  /**
   * Request location permissions
   */
  static async requestPermissions(): Promise<boolean> {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Check if location permissions are granted
   */
  static async hasPermissions(): Promise<boolean> {
    const { status } = await ExpoLocation.getForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get current position
   */
  static async getCurrentPosition(): Promise<Location> {
    const hasPermission = await this.hasPermissions();

    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) {
        throw new Error('Location permission denied');
      }
    }

    const position = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.High,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy || undefined,
      timestamp: position.timestamp,
    };
  }

  /**
   * Watch position changes
   */
  static async watchPosition(
    onLocationChange: (location: Location) => void,
    onError?: (error: any) => void,
  ) {
    if (this.watchSubscription !== null) {
      this.clearWatch();
    }

    try {
      this.watchSubscription = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Update every 50 meters
        },
        position => {
          onLocationChange({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || undefined,
            timestamp: position.timestamp,
          });
        },
      );
    } catch (error) {
      console.error('Watch position error:', error);
      if (onError) onError(error);
    }
  }

  /**
   * Clear position watch
   */
  static clearWatch() {
    if (this.watchSubscription !== null) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   * Returns distance in meters
   */
  static calculateDistance(from: Location, to: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Check if location is within radius of point
   */
  static isWithinRadius(
    location: Location,
    center: Location,
    radiusMeters: number,
  ): boolean {
    const distance = this.calculateDistance(location, center);
    return distance <= radiusMeters;
  }

  /**
   * Format distance for display
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }
}
