import { create } from 'zustand';
import { Place, Location, RecommendationFilters } from 'types';
import { DatabaseService } from '@services/supabase/database';
import { RecommendationEngine } from '@services/recommendations/RecommendationEngine';
import { useAuthStore } from './useAuthStore';
import { useLocationStore } from './useLocationStore';

interface PlacesState {
  places: Place[];
  recommendations: Place[];
  searchResults: Place[];
  selectedPlace: Place | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPlaces: (filters?: any) => Promise<void>;
  loadRecommendations: (filters?: RecommendationFilters) => Promise<void>;
  searchPlaces: (query: string) => Promise<void>;
  getPlaceById: (placeId: string) => Promise<void>;
  getTrendingPlaces: () => Promise<void>;
  setSelectedPlace: (place: Place | null) => void;
  clearError: () => void;
}

export const usePlacesStore = create<PlacesState>((set, get) => ({
  places: [],
  recommendations: [],
  searchResults: [],
  selectedPlace: null,
  isLoading: false,
  error: null,

  loadPlaces: async (filters?: any) => {
    try {
      set({ isLoading: true, error: null });
      const places = await DatabaseService.getPlaces(filters);
      set({ places, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar lugares',
        isLoading: false,
      });
    }
  },

  loadRecommendations: async (filters?: RecommendationFilters) => {
    try {
      set({ isLoading: true, error: null });

      const { currentLocation } = useLocationStore.getState();
      const { profile } = useAuthStore.getState();

      if (!currentLocation) {
        throw new Error('No se pudo obtener la ubicación actual');
      }

      if (!profile) {
        throw new Error('No hay perfil de usuario');
      }

      const recommendations = await RecommendationEngine.getRecommendations(
        currentLocation,
        profile,
        filters,
      );

      set({ recommendations, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar recomendaciones',
        isLoading: false,
      });
    }
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
        throw new Error('No se pudo obtener la ubicación actual');
      }

      const trending = await RecommendationEngine.getTrendingPlaces(
        currentLocation,
        10,
      );
      set({ places: trending, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar lugares populares',
        isLoading: false,
      });
    }
  },

  setSelectedPlace: (place: Place | null) => set({ selectedPlace: place }),

  clearError: () => set({ error: null }),
}));
