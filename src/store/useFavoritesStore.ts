import { create } from 'zustand';
import { Favorite, VisitHistory, Place } from 'types';
import { DatabaseService } from '@services/supabase/database';
import { useAuthStore } from './useAuthStore';

interface FavoritesState {
  favorites: Favorite[];
  favoritePlaces: Place[];
  favoriteIds: Set<string>;
  history: VisitHistory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFavorites: () => Promise<void>;
  addFavorite: (placeId: string) => Promise<void>;
  removeFavorite: (placeId: string) => Promise<void>;
  isFavorite: (placeId: string) => boolean;
  toggleFavorite: (placeId: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  addVisit: (placeId: string, durationMinutes?: number) => Promise<void>;
  getFavoritesByCategory: (category?: string) => Place[];
  clearError: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  favoritePlaces: [],
  favoriteIds: new Set<string>(),
  history: [],
  isLoading: false,
  error: null,

  loadFavorites: async () => {
    try {
      set({ isLoading: true, error: null });
      const { user } = useAuthStore.getState();

      if (!user) {
        console.log('No user logged in, clearing favorites');
        set({
          favorites: [],
          favoritePlaces: [],
          favoriteIds: new Set(),
          isLoading: false
        });
        return;
      }

      const favorites = await DatabaseService.getUserFavorites(user.id);
      const favoritePlaces = favorites
        .map((fav: any) => fav.place)
        .filter((place: any) => place !== null);
      const favoriteIds = new Set(favoritePlaces.map((place: Place) => place.id));

      console.log(`✅ Loaded ${favoritePlaces.length} favorites`);
      set({ favorites, favoritePlaces, favoriteIds, isLoading: false });
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      set({
        error: error.message || 'Error al cargar favoritos',
        isLoading: false,
      });
    }
  },

  addFavorite: async (placeId: string) => {
    try {
      const { user } = useAuthStore.getState();

      if (!user) {
        set({ error: 'Debes iniciar sesión para agregar favoritos' });
        throw new Error('Usuario no autenticado');
      }

      // Optimistic update
      const { favoriteIds } = get();
      const newFavoriteIds = new Set(favoriteIds);
      newFavoriteIds.add(placeId);
      set({ favoriteIds: newFavoriteIds });

      // Add to database
      const favorite = await DatabaseService.addFavorite(user.id, placeId);

      // Reload to get full data
      await get().loadFavorites();

      console.log(`❤️ Added to favorites`);
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      // Rollback
      await get().loadFavorites();
      set({ error: error.message || 'Error al agregar favorito' });
      throw error;
    }
  },

  removeFavorite: async (placeId: string) => {
    try {
      const { user } = useAuthStore.getState();

      if (!user) {
        set({ error: 'Debes iniciar sesión' });
        throw new Error('Usuario no autenticado');
      }

      // Optimistic update
      const { favoritePlaces, favoriteIds } = get();
      const newFavoritePlaces = favoritePlaces.filter(p => p.id !== placeId);
      const newFavoriteIds = new Set(favoriteIds);
      newFavoriteIds.delete(placeId);

      set({
        favoritePlaces: newFavoritePlaces,
        favoriteIds: newFavoriteIds
      });

      // Remove from database
      await DatabaseService.removeFavorite(user.id, placeId);

      // Also update favorites array
      set(state => ({
        favorites: state.favorites.filter(f => f.place_id !== placeId),
      }));

      console.log(`💔 Removed from favorites`);
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      // Rollback
      await get().loadFavorites();
      set({ error: error.message || 'Error al eliminar favorito' });
      throw error;
    }
  },

  isFavorite: (placeId: string) => {
    return get().favoriteIds.has(placeId);
  },

  toggleFavorite: async (placeId: string) => {
    const { isFavorite, addFavorite, removeFavorite } = get();

    if (isFavorite(placeId)) {
      await removeFavorite(placeId);
    } else {
      await addFavorite(placeId);
    }
  },

  getFavoritesByCategory: (category?: string) => {
    const { favoritePlaces } = get();

    if (!category) {
      return favoritePlaces;
    }

    return favoritePlaces.filter(place => place.category === category);
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
