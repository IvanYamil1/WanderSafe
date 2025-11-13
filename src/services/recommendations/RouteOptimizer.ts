import { Place, Location, RoutePlace } from 'types';
import { LocationService } from '../location/LocationService';

interface OptimizedRoute {
  places: RoutePlace[];
  totalDistance: number;
  totalDuration: number;
  estimatedTimes: {
    placeId: string;
    arrivalTime: Date;
    departureTime: Date;
  }[];
}

export class RouteOptimizer {
  /**
   * Optimize route using Nearest Neighbor heuristic with 2-opt improvements
   */
  static optimizeRoute(
    places: Place[],
    startLocation: Location,
    startTime: Date = new Date(),
  ): OptimizedRoute {
    if (places.length === 0) {
      return {
        places: [],
        totalDistance: 0,
        totalDuration: 0,
        estimatedTimes: [],
      };
    }

    if (places.length === 1) {
      return this.createSinglePlaceRoute(places[0], startTime);
    }

    // Step 1: Nearest Neighbor algorithm for initial route
    const initialRoute = this.nearestNeighbor(places, startLocation);

    // Step 2: Apply 2-opt improvements
    const optimizedOrder = this.twoOptImprovement(initialRoute);

    // Step 3: Calculate times and distances
    return this.calculateRouteTimes(
      optimizedOrder,
      startLocation,
      startTime,
    );
  }

  /**
   * Nearest Neighbor algorithm
   */
  private static nearestNeighbor(
    places: Place[],
    startLocation: Location,
  ): Place[] {
    const unvisited = [...places];
    const route: Place[] = [];
    let currentLocation = startLocation;

    while (unvisited.length > 0) {
      // Find nearest unvisited place
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const distance = LocationService.calculateDistance(currentLocation, {
          latitude: unvisited[i].latitude,
          longitude: unvisited[i].longitude,
        });

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      // Add nearest place to route
      const nearest = unvisited.splice(nearestIndex, 1)[0];
      route.push(nearest);
      currentLocation = {
        latitude: nearest.latitude,
        longitude: nearest.longitude,
      };
    }

    return route;
  }

  /**
   * 2-opt improvement algorithm
   */
  private static twoOptImprovement(route: Place[]): Place[] {
    if (route.length < 4) return route;

    let improved = true;
    let currentRoute = [...route];

    while (improved) {
      improved = false;

      for (let i = 0; i < currentRoute.length - 2; i++) {
        for (let j = i + 2; j < currentRoute.length; j++) {
          // Skip adjacent edges
          if (j === i + 1) continue;

          const newRoute = this.twoOptSwap(currentRoute, i, j);
          const currentDistance = this.calculateTotalDistance(currentRoute);
          const newDistance = this.calculateTotalDistance(newRoute);

          if (newDistance < currentDistance) {
            currentRoute = newRoute;
            improved = true;
          }
        }
      }
    }

    return currentRoute;
  }

  /**
   * Perform 2-opt swap
   */
  private static twoOptSwap(route: Place[], i: number, j: number): Place[] {
    const newRoute = [...route];

    // Reverse the segment between i+1 and j
    const segment = newRoute.slice(i + 1, j + 1).reverse();
    newRoute.splice(i + 1, j - i, ...segment);

    return newRoute;
  }

  /**
   * Calculate total distance of route
   */
  private static calculateTotalDistance(route: Place[]): number {
    let total = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const from = {
        latitude: route[i].latitude,
        longitude: route[i].longitude,
      };
      const to = {
        latitude: route[i + 1].latitude,
        longitude: route[i + 1].longitude,
      };
      total += LocationService.calculateDistance(from, to);
    }

    return total;
  }

  /**
   * Calculate route with times
   */
  private static calculateRouteTimes(
    places: Place[],
    startLocation: Location,
    startTime: Date,
  ): OptimizedRoute {
    const routePlaces: RoutePlace[] = [];
    const estimatedTimes: OptimizedRoute['estimatedTimes'] = [];
    let currentTime = new Date(startTime);
    let currentLocation = startLocation;
    let totalDistance = 0;
    let totalDuration = 0;

    places.forEach((place, index) => {
      const placeLocation = {
        latitude: place.latitude,
        longitude: place.longitude,
      };

      // Calculate travel time to this place (assume 30 km/h average speed)
      const distance = LocationService.calculateDistance(
        currentLocation,
        placeLocation,
      );
      const travelTimeMinutes = Math.ceil((distance / 1000 / 30) * 60);

      // Add travel time
      currentTime = new Date(currentTime.getTime() + travelTimeMinutes * 60000);
      const arrivalTime = new Date(currentTime);

      // Add visit duration
      const visitDuration = place.average_visit_duration || 60;
      currentTime = new Date(currentTime.getTime() + visitDuration * 60000);
      const departureTime = new Date(currentTime);

      routePlaces.push({
        place_id: place.id,
        order: index,
        arrival_time: arrivalTime.toISOString(),
        departure_time: departureTime.toISOString(),
        place,
      });

      estimatedTimes.push({
        placeId: place.id,
        arrivalTime,
        departureTime,
      });

      totalDistance += distance;
      totalDuration += travelTimeMinutes + visitDuration;
      currentLocation = placeLocation;
    });

    return {
      places: routePlaces,
      totalDistance,
      totalDuration,
      estimatedTimes,
    };
  }

  /**
   * Create route for single place
   */
  private static createSinglePlaceRoute(
    place: Place,
    startTime: Date,
  ): OptimizedRoute {
    const arrivalTime = startTime;
    const duration = place.average_visit_duration || 60;
    const departureTime = new Date(startTime.getTime() + duration * 60000);

    return {
      places: [
        {
          place_id: place.id,
          order: 0,
          arrival_time: arrivalTime.toISOString(),
          departure_time: departureTime.toISOString(),
          place,
        },
      ],
      totalDistance: 0,
      totalDuration: duration,
      estimatedTimes: [
        {
          placeId: place.id,
          arrivalTime,
          departureTime,
        },
      ],
    };
  }

  /**
   * Check if route is feasible (all places will be open when visited)
   */
  static isRouteFeasible(
    optimizedRoute: OptimizedRoute,
  ): { feasible: boolean; conflicts: string[] } {
    const conflicts: string[] = [];

    for (const timeInfo of optimizedRoute.estimatedTimes) {
      const routePlace = optimizedRoute.places.find(
        rp => rp.place_id === timeInfo.placeId,
      );
      if (!routePlace?.place) continue;

      const place = routePlace.place;
      if (!place.opening_hours) continue;

      const arrivalTime = timeInfo.arrivalTime;
      const days = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      const dayOfWeek = days[
        arrivalTime.getDay()
      ] as keyof typeof place.opening_hours;
      const timeString = `${arrivalTime.getHours().toString().padStart(2, '0')}:${arrivalTime.getMinutes().toString().padStart(2, '0')}`;

      const hours = place.opening_hours[dayOfWeek];
      if (!hours) {
        conflicts.push(`${place.name} está cerrado ese día`);
        continue;
      }

      if (timeString < hours.open || timeString > hours.close) {
        conflicts.push(
          `${place.name} estará cerrado a la hora estimada de llegada (${timeString})`,
        );
      }
    }

    return {
      feasible: conflicts.length === 0,
      conflicts,
    };
  }

  /**
   * Format duration for display
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours === 0) {
      return `${mins} min`;
    }

    if (mins === 0) {
      return `${hours} h`;
    }

    return `${hours} h ${mins} min`;
  }
}
