-- WanderSafe Database Schema for Supabase (PostgreSQL + PostGIS)
--
-- This schema defines all tables, indexes, and functions needed for the WanderSafe app
-- Execute this SQL in your Supabase SQL Editor

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    interests TEXT[] DEFAULT '{}',
    preferred_budget TEXT CHECK (preferred_budget IN ('bajo', 'medio', 'alto', 'premium')) DEFAULT 'medio',
    language TEXT CHECK (language IN ('es', 'en')) DEFAULT 'es',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================================
-- PLACES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN (
        'restaurante', 'museo', 'parque', 'monumento', 'bar', 'cafe',
        'tienda', 'galeria', 'teatro', 'plaza', 'mercado', 'mirador',
        'iglesia', 'centro_cultural'
    )) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    address TEXT NOT NULL,
    opening_hours JSONB,
    average_visit_duration INTEGER DEFAULT 60, -- in minutes
    price_level TEXT CHECK (price_level IN ('bajo', 'medio', 'alto', 'premium')) DEFAULT 'medio',
    rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    photos TEXT[] DEFAULT '{}',
    phone TEXT,
    website TEXT,
    tags TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_places_location ON places USING GIST(location);
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_rating ON places(rating DESC);
CREATE INDEX idx_places_is_verified ON places(is_verified);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    photos TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(place_id, user_id)
);

CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, place_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_place_id ON favorites(place_id);

-- ============================================================================
-- VISIT HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS visit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
    visited_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visit_history_user_id ON visit_history(user_id);
CREATE INDEX idx_visit_history_visited_at ON visit_history(visited_at DESC);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK (event_type IN (
        'concierto', 'festival', 'exposicion', 'teatro', 'deportivo',
        'cultural', 'gastronomico', 'educativo'
    )) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    address TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    price NUMERIC(10, 2),
    is_free BOOLEAN DEFAULT FALSE,
    website TEXT,
    organizer TEXT,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_location ON events USING GIST(location);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_event_type ON events(event_type);

-- ============================================================================
-- SAFETY ZONES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS safety_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    radius INTEGER DEFAULT 500, -- in meters
    safety_level TEXT CHECK (safety_level IN ('safe', 'moderate', 'caution', 'danger')) NOT NULL,
    time_ranges JSONB NOT NULL DEFAULT '[]',
    incident_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_safety_zones_location ON safety_zones USING GIST(location);
CREATE INDEX idx_safety_zones_safety_level ON safety_zones(safety_level);

-- ============================================================================
-- ROUTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    places JSONB NOT NULL DEFAULT '[]',
    total_distance NUMERIC(10, 2) DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    optimized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_routes_user_id ON routes(user_id);

-- ============================================================================
-- BUSINESSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL UNIQUE,
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_owner_user_id ON businesses(owner_user_id);
CREATE INDEX idx_businesses_place_id ON businesses(place_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK (type IN (
        'safety_alert', 'event_nearby', 'place_recommendation',
        'route_reminder', 'general'
    )) NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get nearby places
CREATE OR REPLACE FUNCTION get_nearby_places(
    lat DOUBLE PRECISION,
    long DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 5000,
    max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    opening_hours JSONB,
    average_visit_duration INTEGER,
    price_level TEXT,
    rating NUMERIC,
    review_count INTEGER,
    photos TEXT[],
    phone TEXT,
    website TEXT,
    tags TEXT[],
    is_verified BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.*,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
            p.location
        ) as distance_meters
    FROM places p
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
        p.location,
        radius_meters
    )
    AND p.is_verified = true
    ORDER BY distance_meters
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby events
CREATE OR REPLACE FUNCTION get_nearby_events(
    lat DOUBLE PRECISION,
    long DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 10000
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    event_type TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    price NUMERIC,
    is_free BOOLEAN,
    website TEXT,
    organizer TEXT,
    photos TEXT[],
    created_at TIMESTAMPTZ,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.*,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
            e.location
        ) as distance_meters
    FROM events e
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
        e.location,
        radius_meters
    )
    AND e.end_date >= NOW()
    ORDER BY e.start_date
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to get safety level for location
CREATE OR REPLACE FUNCTION get_safety_level(
    lat DOUBLE PRECISION,
    long DOUBLE PRECISION,
    hour INTEGER
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    safety_zones_data JSON;
    overall_level TEXT := 'safe';
BEGIN
    SELECT json_agg(sz) INTO safety_zones_data
    FROM safety_zones sz
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
        sz.location,
        sz.radius
    );

    IF safety_zones_data IS NOT NULL THEN
        SELECT CASE
            WHEN EXISTS (
                SELECT 1 FROM json_array_elements(safety_zones_data) AS zone
                WHERE zone->>'safety_level' = 'danger'
            ) THEN 'danger'
            WHEN EXISTS (
                SELECT 1 FROM json_array_elements(safety_zones_data) AS zone
                WHERE zone->>'safety_level' = 'caution'
            ) THEN 'caution'
            WHEN EXISTS (
                SELECT 1 FROM json_array_elements(safety_zones_data) AS zone
                WHERE zone->>'safety_level' = 'moderate'
            ) THEN 'moderate'
            ELSE 'safe'
        END INTO overall_level;
    END IF;

    result := json_build_object(
        'level', overall_level,
        'zones', COALESCE(safety_zones_data, '[]'::json)
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Places Policies (public read, admin write)
CREATE POLICY "Anyone can view verified places"
    ON places FOR SELECT
    USING (is_verified = true OR auth.role() = 'authenticated');

-- Reviews Policies
CREATE POLICY "Anyone can view reviews"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- Favorites Policies
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites"
    ON favorites FOR ALL
    USING (auth.uid() = user_id);

-- Visit History Policies
CREATE POLICY "Users can view their own history"
    ON visit_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own history"
    ON visit_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Events Policies (public read)
CREATE POLICY "Anyone can view events"
    ON events FOR SELECT
    USING (true);

-- Safety Zones Policies (public read)
CREATE POLICY "Anyone can view safety zones"
    ON safety_zones FOR SELECT
    USING (true);

-- Routes Policies
CREATE POLICY "Users can view their own routes"
    ON routes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own routes"
    ON routes FOR ALL
    USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at
    BEFORE UPDATE ON places
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample places for Guadalajara
INSERT INTO places (name, description, category, latitude, longitude, address, price_level, rating, review_count, is_verified)
VALUES
    ('Catedral de Guadalajara', 'Catedral histórica en el centro de la ciudad', 'iglesia', 20.676534, -103.347142, 'Av Fray Antonio Alcalde 10, Zona Centro, Guadalajara', 'bajo', 4.7, 1250, true),
    ('Teatro Degollado', 'Teatro neoclásico emblemático de Guadalajara', 'teatro', 20.675686, -103.343843, 'Av Degollado S/N, Zona Centro, Guadalajara', 'medio', 4.6, 980, true),
    ('Hospicio Cabañas', 'Patrimonio de la Humanidad con murales de Orozco', 'museo', 20.674356, -103.336835, 'Cabañas 8, Las Fresas, Guadalajara', 'bajo', 4.8, 2100, true)
ON CONFLICT DO NOTHING;

-- End of schema
