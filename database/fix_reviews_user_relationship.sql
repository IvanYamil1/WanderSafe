-- Fix reviews table to have proper relationship with users
-- Execute this in Supabase SQL Editor

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    -- Check if constraint doesn't exist and add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'reviews_user_id_fkey'
        AND table_name = 'reviews'
    ) THEN
        ALTER TABLE reviews
        ADD CONSTRAINT reviews_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Verify the constraint was created
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conname = 'reviews_user_id_fkey';
