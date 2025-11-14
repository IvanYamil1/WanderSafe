import { create } from 'zustand';
import { Place, Location, RecommendationFilters, UserProfile } from 'types';
import { DatabaseService } from '@services/supabase/database';
import { EnhancedRecommendationEngine } from '@services/recommendations/EnhancedRecommendationEngine';
import { useAuthStore } from './useAuthStore';
import { useLocationStore } from './useLocationStore';

interface PlacesState {
  places: Place[];
  recommendations: Place[];
  searchResults: Place[];
  selectedPlace: Place | null;
  isLoading: boolean;
  error: string | null;
  lastRecommendationUpdate: number | null;
  hasLoadedOnce: boolean;

  // Actions
  loadPlaces: (filters?: any) => Promise<void>;
  loadRecommendations: (filters?: RecommendationFilters) => Promise<void>;
  refreshRecommendations: (filters?: RecommendationFilters) => Promise<void>;
  searchPlaces: (query: string) => Promise<void>;
  getPlaceById: (placeId: string) => Promise<void>;
  getTrendingPlaces: () => Promise<void>;
  setSelectedPlace: (place: Place | null) => void;
  clearError: () => void;
  clearCache: () => void;
}

export const usePlacesStore = create<PlacesState>((set, get) => ({
  places: [],
  recommendations: [],
  searchResults: [],
  selectedPlace: null,
  isLoading: false,
  error: null,
  lastRecommendationUpdate: null,
  hasLoadedOnce: false,

  loadPlaces: async (filters?: any) => {
    try {
      set({ isLoading: true, error: null });
      const places = await DatabaseService.getPlaces(filters);
      set({ places, isLoading: false });
    } catch (error: any) {
      console.error('Error loading places:', error);
      set({
        error: error.message || 'Error al cargar lugares',
        isLoading: false,
      });
    }
  },

  loadRecommendations: async (filters?: RecommendationFilters) => {
    try {
      const { hasLoadedOnce } = get();

      // Don't show loading spinner if we already have recommendations
      if (!hasLoadedOnce) {
        set({ isLoading: true, error: null });
      }

      const { currentLocation } = useLocationStore.getState();
      const { profile } = useAuthStore.getState();

      // Validate location
      if (!currentLocation) {
        console.warn('No location available, cannot load recommendations');
        set({
          error: 'Activa tu ubicación para ver recomendaciones',
          isLoading: false,
        });
        return;
      }

      // Validate profile - but provide defaults if missing
      if (!profile) {
        console.warn('No user profile, using default recommendations');
        // Continue with default profile instead of failing
      }

      console.log('📍 Loading recommendations for location:', currentLocation);

      const defaultProfile: UserProfile = {
        id: 'default',
        user_id: 'guest',
        preferred_budget: 'medio',
        language: 'es',
        interests: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const recommendations = await EnhancedRecommendationEngine.getRecommendations(
        currentLocation,
        profile || defaultProfile,
        filters,
      );

      console.log(`✅ Loaded ${recommendations.length} recommendations`);

      set({
        recommendations,
        isLoading: false,
        error: null,
        lastRecommendationUpdate: Date.now(),
        hasLoadedOnce: true,
      });
    } catch (error: any) {
      console.error('❌ Error loading recommendations:', error);

      // Don't fail completely - keep existing recommendations if any
      const { recommendations } = get();
      const errorMessage = recommendations.length > 0
        ? 'No se pudieron actualizar las recomendaciones'
        : 'No se pudieron cargar recomendaciones. Intenta de nuevo.';

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  refreshRecommendations: async (filters?: RecommendationFilters) => {
    console.log('🔄 Refreshing recommendations (clearing cache)...');
    EnhancedRecommendationEngine.clearCache();
    set({ hasLoadedOnce: false });
    await get().loadRecommendations(filters);
  },

  searchPlaces: async (query: string) => {
    try {
      set({ isLoading: true, error: null });
      const results = await DatabaseService.searchPlaces(query);
      set({ searchResults: results, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error en la búsqueda',
        isLoading: false,
      });
    }
  },

  getPlaceById: async (placeId: string) => {
    try {
      set({ isLoading: true, error: null });
      const place = await DatabaseService.getPlaceById(placeId);
      set({ selectedPlace: place, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar lugar',
        isLoading: false,
      });
    }
  },

  getTrendingPlaces: async () => {
    try {
      set({ isLoading: true, error: null });

      const { currentLocation } = useLocationStore.getState();
      if (!currentLocation) {
        console.warn('No location for trending places');
        set({
          error: 'Activa tu ubicación para ver lugares populares',
          isLoading: false,
        });
        return;
      }

      const trending = await EnhancedRecommendationEngine.getTrendingPlaces(
        currentLocation,
        10,
      );

      console.log(`✅ Loaded ${trending.length} trending places`);
      set({ places: trending, isLoading: false, error: null });
    } catch (error: any) {
      console.error('Error loading trending places:', error);
      set({
        error: 'Error al cargar lugares populares',
        isLoading: false,
      });
    }
  },

  setSelectedPlace: (place: Place | null) => set({ selectedPlace: place }),

  clearError: () => set({ error: null }),

  clearCache: () => {
    EnhancedRecommendationEngine.clearCache();
    set({ lastRecommendationUpdate: null, hasLoadedOnce: false });
    console.log('🗑️ Places cache cleared');
  },
}));
