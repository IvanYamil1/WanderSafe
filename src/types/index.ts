// Core types for WanderSafe application

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  interests: TouristInterest[];
  preferred_budget: BudgetLevel;
  language: 'es' | 'en';
  created_at: string;
  updated_at: string;
}

export type TouristInterest =
  | 'gastronomia'
  | 'cultura'
  | 'naturaleza'
  | 'aventura'
  | 'vida_nocturna'
  | 'compras'
  | 'historia'
  | 'arte'
  | 'deportes'
  | 'relax';

export type BudgetLevel = 'bajo' | 'medio' | 'alto' | 'premium';

export type PlaceCategory =
  | 'restaurante'
  | 'museo'
  | 'parque'
  | 'monumento'
  | 'bar'
  | 'cafe'
  | 'tienda'
  | 'galeria'
  | 'teatro'
  | 'plaza'
  | 'mercado'
  | 'mirador'
  | 'iglesia'
  | 'centro_cultural';

export interface Place {
  id: string;
  name: string;
  description: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  address: string;
  opening_hours?: OpeningHours;
  average_visit_duration: number; // in minutes
  price_level: BudgetLevel;
  rating: number;
  review_count: number;
  photos: string[];
  phone?: string;
  website?: string;
  tags: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface OpeningHours {
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
}

export interface TimeRange {
  open: string; // HH:mm format
  close: string; // HH:mm format
}

export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string;
  photos: string[];
  is_verified: boolean; // verified via geolocation
  created_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface Favorite {
  id: string;
  user_id: string;
  place_id: string;
  created_at: string;
  place?: Place;
}

export interface VisitHistory {
  id: string;
  user_id: string;
  place_id: string;
  visited_at: string;
  duration_minutes?: number;
  place?: Place;
}

export interface SafetyZone {
  id: string;
  zone_name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  safety_level: SafetyLevel;
  time_ranges: SafetyTimeRange[];
  incident_count: number;
  last_updated: string;
}

export type SafetyLevel = 'safe' | 'moderate' | 'caution' | 'danger';

export interface SafetyTimeRange {
  start_hour: number; // 0-23
  end_hour: number; // 0-23
  safety_level: SafetyLevel;
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  latitude: number;
  longitude: number;
  address: string;
  start_date: string;
  end_date: string;
  price?: number;
  is_free: boolean;
  website?: string;
  organizer: string;
  photos: string[];
  created_at: string;
}

export type EventType =
  | 'concierto'
  | 'festival'
  | 'exposicion'
  | 'teatro'
  | 'deportivo'
  | 'cultural'
  | 'gastronomico'
  | 'educativo';

export interface Route {
  id: string;
  user_id: string;
  name: string;
  places: RoutePlace[];
  total_distance: number; // in meters
  total_duration: number; // in minutes
  optimized: boolean;
  created_at: string;
}

export interface RoutePlace {
  place_id: string;
  order: number;
  arrival_time?: string;
  departure_time?: string;
  place?: Place;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface RecommendationFilters {
  categories?: PlaceCategory[];
  maxDistance?: number; // in meters
  budgetLevel?: BudgetLevel;
  minRating?: number;
  openNow?: boolean;
  interests?: TouristInterest[];
}

export interface Business {
  id: string;
  place_id: string;
  owner_user_id: string;
  business_name: string;
  business_type: string;
  contact_email: string;
  contact_phone: string;
  is_verified: boolean;
  created_at: string;
  place?: Place;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'safety_alert'
  | 'event_nearby'
  | 'place_recommendation'
  | 'route_reminder'
  | 'general';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Main: undefined;
  PlaceDetails: { placeId: string };
  EditProfile: undefined;
  EditPreferences: undefined;
  CreateReview: { placeId: string };
  EventDetails: { eventId: string };
  RouteOptimizer: undefined;
  SafetyMap: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Favorites: undefined;
  Events: undefined;
  Profile: undefined;
};
