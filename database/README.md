# WanderSafe Database Setup

Este directorio contiene el esquema de base de datos completo para WanderSafe en Supabase.

## 📋 Contenido del Schema

El archivo `schema.sql` incluye:

### Tablas Principales

1. **user_profiles** - Perfiles de usuario con intereses y preferencias
2. **places** - Lugares turísticos con ubicación geoespacial
3. **reviews** - Reseñas de lugares por usuarios
4. **favorites** - Lugares favoritos de usuarios
5. **visit_history** - Historial de visitas a lugares
6. **events** - Eventos turísticos y culturales
7. **safety_zones** - Zonas de seguridad con niveles
8. **routes** - Rutas turísticas personalizadas
9. **businesses** - Negocios registrados en la plataforma
10. **notifications** - Notificaciones para usuarios

### Características Técnicas

- **PostGIS** habilitado para consultas geoespaciales
- **Índices optimizados** para búsquedas rápidas
- **Row Level Security (RLS)** configurado en todas las tablas
- **Funciones RPC** para búsquedas por proximidad:
  - `get_nearby_places()` - Encuentra lugares cercanos
  - `get_nearby_events()` - Encuentra eventos cercanos
  - `get_safety_level()` - Obtiene nivel de seguridad de una ubicación
- **Triggers** para actualizar timestamps automáticamente

## 🚀 Cómo Ejecutar el Schema

### Paso 1: Acceder a Supabase

1. Ve a tu proyecto en [https://supabase.com](https://supabase.com)
2. Abre el **SQL Editor** desde el menú lateral

### Paso 2: Ejecutar el Schema

**Opción A: Copiar y Pegar**
1. Abre el archivo `schema.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona Ctrl+Enter)

**Opción B: Subir Archivo**
1. En el SQL Editor, busca la opción de "New Query"
2. Pega el contenido del archivo `schema.sql`
3. Ejecuta la consulta

### Paso 3: Verificar la Instalación

Ejecuta este query para verificar que todas las tablas se crearon:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver las 10 tablas listadas.

### Paso 4: Verificar PostGIS

Ejecuta este query para verificar que PostGIS está habilitado:

```sql
SELECT PostGIS_version();
```

## 📊 Datos de Prueba

El schema incluye algunos datos de ejemplo para lugares en Guadalajara. Puedes:

1. **Mantenerlos** para hacer pruebas iniciales
2. **Eliminarlos** ejecutando:
   ```sql
   DELETE FROM places WHERE is_verified = true;
   ```
3. **Agregar más datos** siguiendo el mismo formato

## 🔒 Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado con estas políticas:

- **user_profiles**: Los usuarios solo pueden ver/editar su propio perfil
- **places**: Todos pueden ver lugares verificados
- **reviews**: Todos pueden leer, solo autores pueden editar
- **favorites**: Los usuarios solo ven sus propios favoritos
- **visit_history**: Los usuarios solo ven su propio historial
- **events**: Públicos para todos
- **safety_zones**: Públicas para todos
- **routes**: Los usuarios solo ven sus propias rutas
- **notifications**: Los usuarios solo ven sus propias notificaciones

## 🗺️ Funciones Geoespaciales

### get_nearby_places()

Encuentra lugares cercanos a una ubicación:

```sql
SELECT * FROM get_nearby_places(
  20.676534,  -- latitud
  -103.347142, -- longitud
  5000,       -- radio en metros
  20          -- límite de resultados
);
```

### get_nearby_events()

Encuentra eventos cercanos:

```sql
SELECT * FROM get_nearby_events(
  20.676534,  -- latitud
  -103.347142, -- longitud
  10000       -- radio en metros
);
```

### get_safety_level()

Obtiene el nivel de seguridad de una ubicación:

```sql
SELECT * FROM get_safety_level(
  20.676534,  -- latitud
  -103.347142, -- longitud
  14          -- hora del día (0-23)
);
```

## 📝 Notas Importantes

1. **Backup**: Antes de ejecutar, asegúrate de tener un backup si ya tienes datos
2. **PostGIS**: La extensión PostGIS debe estar disponible (viene por defecto en Supabase)
3. **Auth Users**: Las tablas referencian `auth.users` de Supabase Auth
4. **UUIDs**: Todas las tablas usan UUIDs como IDs primarios
5. **Timestamps**: Los campos `created_at` y `updated_at` se manejan automáticamente

## 🔧 Mantenimiento

### Agregar un Lugar

```sql
INSERT INTO places (
  name,
  description,
  category,
  latitude,
  longitude,
  address,
  price_level,
  is_verified
) VALUES (
  'Nombre del Lugar',
  'Descripción detallada',
  'restaurante',
  20.6767,
  -103.3475,
  'Dirección completa',
  'medio',
  true
);
```

### Agregar una Zona de Seguridad

```sql
INSERT INTO safety_zones (
  zone_name,
  latitude,
  longitude,
  radius,
  safety_level,
  time_ranges
) VALUES (
  'Centro Histórico',
  20.6767,
  -103.3475,
  1000,
  'safe',
  '[{"start_hour": 6, "end_hour": 22, "safety_level": "safe"}]'::jsonb
);
```

## 🆘 Problemas Comunes

### Error: "extension postgis does not exist"
- **Solución**: Supabase debería tener PostGIS habilitado por defecto. Contacta al soporte si persiste.

### Error: "permission denied for schema auth"
- **Solución**: Estás usando el usuario correcto. Las referencias a `auth.users` son válidas.

### Error: "duplicate key value violates unique constraint"
- **Solución**: Ya ejecutaste el schema. Para limpiar:
  ```sql
  DROP TABLE IF EXISTS notifications, businesses, routes,
    safety_zones, events, visit_history, favorites,
    reviews, places, user_profiles CASCADE;
  ```

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)

## ✅ Checklist de Instalación

- [ ] PostGIS habilitado
- [ ] Todas las tablas creadas
- [ ] Índices creados
- [ ] Funciones RPC funcionando
- [ ] RLS policies activas
- [ ] Datos de prueba insertados (opcional)
- [ ] Credenciales de Supabase en `.env`
