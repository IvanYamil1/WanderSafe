import { create } from 'zustand';
import { Location } from 'types';
import { LocationService } from '@services/location/LocationService';

interface LocationState {
  currentLocation: Location | null;
  isTracking: boolean;
  hasPermission: boolean;
  error: string | null;

  // Actions
  requestPermissions: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
  setLocation: (location: Location) => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  isTracking: false,
  hasPermission: false,
  error: null,

  requestPermissions: async () => {
    try {
      const granted = await LocationService.requestPermissions();
      set({ hasPermission: granted });
      return granted;
    } catch (error: any) {
      set({ error: error.message, hasPermission: false });
      return false;
    }
  },

  getCurrentLocation: async () => {
    try {
      set({ error: null });
      const location = await LocationService.getCurrentPosition();
      set({ currentLocation: location, hasPermission: true });
    } catch (error: any) {
      set({ error: error.message || 'Error al obtener ubicación' });
      throw error;
    }
  },

  startTracking: () => {
    const { isTracking } = get();
    if (isTracking) return;

    LocationService.watchPosition(
      location => {
        set({ currentLocation: location });
      },
      error => {
        set({ error: error.message });
      },
    );

    set({ isTracking: true });
  },

  stopTracking: () => {
    LocationService.clearWatch();
    set({ isTracking: false });
  },

  setLocation: (location: Location) => set({ currentLocation: location }),

  clearError: () => set({ error: null }),
}));
