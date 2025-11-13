import { create } from 'zustand';
import { Favorite, VisitHistory } from 'types';
import { DatabaseService } from '@services/supabase/database';
import { useAuthStore } from './useAuthStore';

interface FavoritesState {
  favorites: Favorite[];
  history: VisitHistory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFavorites: () => Promise<void>;
  addFavorite: (placeId: string) => Promise<void>;
  removeFavorite: (placeId: string) => Promise<void>;
  isFavorite: (placeId: string) => boolean;
  loadHistory: () => Promise<void>;
  addVisit: (placeId: string, durationMinutes?: number) => Promise<void>;
  clearError: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  history: [],
  isLoading: false,
  error: null,

  loadFavorites: async () => {
    try {
      set({ isLoading: true, error: null });
      const { user } = useAuthStore.getState();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const favorites = await DatabaseService.getUserFavorites(user.id);
      set({ favorites, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar favoritos',
        isLoading: false,
      });
    }
  },

  addFavorite: async (placeId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = useAuthStore.getState();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const favorite = await DatabaseService.addFavorite(user.id, placeId);
      set(state => ({
        favorites: [...state.favorites, favorite],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Error al agregar favorito',
        isLoading: false,
      });
      throw error;
    }
  },

  removeFavorite: async (placeId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = useAuthStore.getState();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      await DatabaseService.removeFavorite(user.id, placeId);
      set(state => ({
        favorites: state.favorites.filter(f => f.place_id !== placeId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Error al eliminar favorito',
        isLoading: false,
      });
      throw error;
    }
  },

  isFavorite: (placeId: string) => {
    const { favorites } = get();
    return favorites.some(f => f.place_id === placeId);
  },

  loadHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      const { user } = useAuthStore.getState();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const history = await DatabaseService.getVisitHistory(user.id);
      set({ history, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar historial',
        isLoading: false,
      });
    }
  },

  addVisit: async (placeId: string, durationMinutes?: number) => {
    try {
      const { user } = useAuthStore.getState();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const visit = await DatabaseService.addVisit(
        user.id,
        placeId,
        durationMinutes,
      );
      set(state => ({
        history: [visit, ...state.history],
      }));
    } catch (error: any) {
      console.error('Error adding visit:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
