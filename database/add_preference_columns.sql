-- ============================================================================
-- ADD NEW PREFERENCE COLUMNS TO USER_PROFILES TABLE
-- Execute this SQL in Supabase SQL Editor to add new user preference fields
-- ============================================================================

-- Add travel_style column
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS travel_style TEXT;

-- Add activity_level column
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS activity_level TEXT;

-- Add dietary_preferences column (array of text)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[] DEFAULT '{}';

-- Add preferred_times column (array of text)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS preferred_times TEXT[] DEFAULT '{}';

-- Add max_distance column (in kilometers)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 10;

-- Add transportation_modes column (array of text)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS transportation_modes TEXT[] DEFAULT '{}';

-- Add accessibility_needs column (array of text)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS accessibility_needs TEXT[] DEFAULT '{}';

-- ============================================================================
-- Add comments to document the columns
-- ============================================================================

COMMENT ON COLUMN public.user_profiles.travel_style IS 'User travel style: solo, pareja, familia, amigos, grupo';
COMMENT ON COLUMN public.user_profiles.activity_level IS 'User activity level: relajado, moderado, activo, intenso';
COMMENT ON COLUMN public.user_profiles.dietary_preferences IS 'User dietary preferences: vegetariano, vegano, sin_gluten, halal, kosher, sin_lactosa, ninguna';
COMMENT ON COLUMN public.user_profiles.preferred_times IS 'Preferred times for activities: mañana, tarde, noche, madrugada';
COMMENT ON COLUMN public.user_profiles.max_distance IS 'Maximum distance in kilometers for recommendations';
COMMENT ON COLUMN public.user_profiles.transportation_modes IS 'Preferred transportation modes: caminando, bicicleta, transporte_publico, auto, taxi';
COMMENT ON COLUMN public.user_profiles.accessibility_needs IS 'Accessibility needs: silla_ruedas, movilidad_reducida, visual, auditiva, ninguna';

-- ============================================================================
-- Verify the changes
-- ============================================================================

-- Show the updated table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'user_profiles'
ORDER BY
    ordinal_position;
