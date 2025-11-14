-- PASO 1: Verificar el tipo actual de la columna id
-- Ejecuta esto primero para ver qué tipo de dato tiene ahora

SELECT
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'places'
  AND column_name = 'id';

-- Si ves "uuid" en data_type, necesitas ejecutar el script de corrección
-- Si ves "text", ya está corregido
