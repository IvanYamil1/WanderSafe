-- Fix places table to use TEXT id instead of UUID
-- This allows storing Google Place IDs which are not UUIDs

-- 1. Drop foreign key constraints that reference places.id
ALTER TABLE IF EXISTS reviews DROP CONSTRAINT IF EXISTS reviews_place_id_fkey;
ALTER TABLE IF EXISTS favorites DROP CONSTRAINT IF EXISTS favorites_place_id_fkey;
ALTER TABLE IF EXISTS visit_history DROP CONSTRAINT IF EXISTS visit_history_place_id_fkey;

-- 2. Change id column type from UUID to TEXT
ALTER TABLE places ALTER COLUMN id TYPE TEXT;

-- 3. Change foreign key columns to TEXT in related tables
ALTER TABLE reviews ALTER COLUMN place_id TYPE TEXT;
ALTER TABLE favorites ALTER COLUMN place_id TYPE TEXT;
ALTER TABLE visit_history ALTER COLUMN place_id TYPE TEXT;

-- 4. Re-add foreign key constraints
ALTER TABLE reviews
  ADD CONSTRAINT reviews_place_id_fkey
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;

ALTER TABLE favorites
  ADD CONSTRAINT favorites_place_id_fkey
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;

ALTER TABLE visit_history
  ADD CONSTRAINT visit_history_place_id_fkey
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;

-- 5. Verify the changes
SELECT
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'places' AND column_name = 'id';
