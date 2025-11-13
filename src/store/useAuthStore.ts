import { create } from 'zustand';
import { User, UserProfile } from 'types';
import { AuthService } from '@services/supabase/auth';
import { DatabaseService } from '@services/supabase/database';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await AuthService.signIn(email, password);

      if (data.user) {
        const profile = await DatabaseService.getUserProfile(data.user.id);
        set({
          user: data.user as User,
          profile,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Error al iniciar sesión',
        isLoading: false,
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await AuthService.signUp(email, password, fullName);

      if (data.user) {
        // Profile is automatically created by database trigger
        // Wait a moment for the trigger to complete, then fetch the profile
        await new Promise(resolve => setTimeout(resolve, 500));

        const profile = await DatabaseService.getUserProfile(data.user.id);

        set({
          user: data.user as User,
          profile,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Error al registrarse',
        isLoading: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await AuthService.signOut();
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cerrar sesión',
        isLoading: false,
      });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      await AuthService.signInWithGoogle();
      // Auth state change will be handled by listener
    } catch (error: any) {
      set({
        error: error.message || 'Error al iniciar sesión con Google',
        isLoading: false,
      });
      throw error;
    }
  },

  signInWithApple: async () => {
    try {
      set({ isLoading: true, error: null });
      await AuthService.signInWithApple();
      // Auth state change will be handled by listener
    } catch (error: any) {
      set({
        error: error.message || 'Error al iniciar sesión con Apple',
        isLoading: false,
      });
      throw error;
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const user = await AuthService.getCurrentUser();

      if (user) {
        const profile = await DatabaseService.getUserProfile(user.id);
        set({
          user: user as User,
          profile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    try {
      const { user, profile } = get();
      if (!user || !profile) throw new Error('No hay usuario autenticado');

      set({ isLoading: true });
      const updatedProfile = await DatabaseService.updateUserProfile(
        user.id,
        updates,
      );
      set({ profile: updatedProfile, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al actualizar perfil',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
