-- ========================================
-- SCRIPT PARA CORREGIR TIPO DE ID EN PLACES
-- Ejecuta PASO POR PASO
-- ========================================

-- PASO 1: Eliminar constraints de foreign keys
-- Copia y ejecuta TODO este bloque junto:

DO $$
BEGIN
    ALTER TABLE IF EXISTS reviews DROP CONSTRAINT IF EXISTS reviews_place_id_fkey;
    ALTER TABLE IF EXISTS favorites DROP CONSTRAINT IF EXISTS favorites_place_id_fkey;
    ALTER TABLE IF EXISTS visit_history DROP CONSTRAINT IF EXISTS visit_history_place_id_fkey;
    RAISE NOTICE 'Constraints eliminados';
END $$;

-- Deberías ver: "Constraints eliminados"
-- Si ves error, copia el error y avísame

-- ========================================
-- PASO 2: Cambiar tipo de columnas
-- Copia y ejecuta TODO este bloque:

DO $$
BEGIN
    ALTER TABLE places ALTER COLUMN id TYPE TEXT;
    ALTER TABLE reviews ALTER COLUMN place_id TYPE TEXT;
    ALTER TABLE favorites ALTER COLUMN place_id TYPE TEXT;
    ALTER TABLE visit_history ALTER COLUMN place_id TYPE TEXT;
    RAISE NOTICE 'Tipos de columna cambiados a TEXT';
END $$;

-- Deberías ver: "Tipos de columna cambiados a TEXT"
-- Si ves error, copia el error y avísame

-- ========================================
-- PASO 3: Recrear foreign key constraints
-- Copia y ejecuta TODO este bloque:

DO $$
BEGIN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_place_id_fkey
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;

    ALTER TABLE favorites
      ADD CONSTRAINT favorites_place_id_fkey
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;

    ALTER TABLE visit_history
      ADD CONSTRAINT visit_history_place_id_fkey
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;

    RAISE NOTICE 'Foreign keys recreados';
END $$;

-- Deberías ver: "Foreign keys recreados"
-- Si ves error, copia el error y avísame

-- ========================================
-- PASO 4: VERIFICAR que funcionó
-- Copia y ejecuta esto:

SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE (table_name = 'places' AND column_name = 'id')
   OR (table_name = 'reviews' AND column_name = 'place_id')
   OR (table_name = 'favorites' AND column_name = 'place_id')
   OR (table_name = 'visit_history' AND column_name = 'place_id')
ORDER BY table_name, column_name;

-- Deberías ver TODAS las columnas como "text" o "character varying"
-- Si ves "uuid", algo falló
