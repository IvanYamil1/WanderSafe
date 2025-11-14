# Sistema de Recomendaciones de WanderSafe

## Descripción General

El sistema de recomendaciones de WanderSafe es un motor inteligente que personaliza las sugerencias de lugares basándose en las preferencias del usuario, su ubicación, el contexto temporal y múltiples factores de relevancia.

## Arquitectura

### Componentes Principales

1. **EnhancedRecommendationEngine** (`src/services/recommendations/EnhancedRecommendationEngine.ts`)
   - Motor principal de recomendaciones
   - Manejo robusto de errores con fallbacks múltiples
   - Sistema de caché inteligente
   - Algoritmos de scoring y diversidad

2. **RecommendationConfig** (`src/services/recommendations/RecommendationConfig.ts`)
   - Configuración centralizada
   - Pesos y parámetros ajustables
   - Configuración de comportamientos

3. **usePlacesStore** (`src/store/usePlacesStore.ts`)
   - State management para recomendaciones
   - Gestión de estados de carga y errores
   - Integración con location y auth stores

## Sistema de Scoring (100 puntos)

El motor evalúa cada lugar con un sistema de puntuación de 100 puntos distribuidos así:

| Factor | Peso | Descripción |
|--------|------|-------------|
| Intereses | 30 pts | Coincidencia con intereses del usuario |
| Rating | 20 pts | Calificación del lugar (1-5⭐) |
| Popularidad | 10 pts | Número de reseñas |
| Distancia | 10 pts | Proximidad al usuario |
| Presupuesto | 10 pts | Coincidencia con presupuesto preferido |
| Nivel de Actividad | 5 pts | Match con nivel de actividad preferido |
| Estilo de Viaje | 5 pts | Match con estilo (solo, familia, etc.) |
| Preferencias Dietarias | 5 pts | Para restaurantes/cafés |
| Horario Preferido | 5 pts | Momento del día preferido |

### Cómo Funciona el Scoring

#### 1. Intereses (30 puntos)
```typescript
// Mapea intereses del usuario a categorías de lugares
gastronomia → [restaurante, cafe, mercado]
cultura → [museo, galeria, centro_cultural, teatro]
naturaleza → [parque, mirador]
// etc.

// Calcula coincidencias:
- Categoría match: +1.0
- Tag match: +0.3 por tag
- Score final: (matches / total_intereses) * 30
```

#### 2. Rating (20 puntos)
```typescript
score = (place.rating / 5.0) * 20
// Ejemplo: 4.5⭐ → 18 puntos
```

#### 3. Popularidad (10 puntos)
```typescript
score = min(place.review_count / 100, 1) * 10
// Más de 100 reseñas = máximo puntaje
```

#### 4. Distancia (10 puntos)
```typescript
maxDistance = user.max_distance * 1000 // km a metros
score = max(0, 1 - actualDistance / maxDistance) * 10
// Más cerca = más puntos
```

#### 5. Presupuesto (10 puntos)
```typescript
// Match perfecto: 10 puntos
// 1 nivel diferencia: 7 puntos
// 2 niveles: 4 puntos
// 3 niveles: 2 puntos
```

## Estrategias de Fallback

El sistema nunca falla completamente gracias a múltiples capas de respaldo:

```
1. Caché en memoria (15 min)
   ↓ (si no hay)
2. Google Places API
   ↓ (si falla)
3. Expandir radio de búsqueda (+2km por intento, máx 3 veces)
   ↓ (si sigue sin resultados)
4. Relajar filtros (ignorar categorías, etc.)
   ↓ (última opción)
5. Datos mock (12 lugares de ejemplo)
```

## Algoritmo de Diversidad

Para evitar mostrar solo un tipo de lugar:

```typescript
// Configuración
maxSameCategoryPercent: 0.4  // Máx 40% de una categoría
minCategoryVariety: 3         // Mínimo 3 categorías diferentes

// Proceso:
1. Ordenar por score
2. Tomar top de cada categoría (hasta 40% del total)
3. Llenar espacios restantes con mejores scores
4. Boost de +10% si hay variedad mínima
```

## Inteligencia Temporal

El sistema ajusta recomendaciones según la hora:

### Mañana (6:00 - 12:00)
- **Boost:** Cafés, restaurantes, parques, museos
- **Factor:** 1.2x

### Tarde (12:00 - 18:00)
- **Boost:** Restaurantes, museos, galerías, tiendas, mercados
- **Factor:** 1.2x

### Noche (18:00 - 24:00)
- **Boost:** Restaurantes, bares, teatros, centros culturales
- **Factor:** 1.2x

### Madrugada (0:00 - 6:00)
- **Boost:** Bares
- **Factor:** 1.1x

## Manejo de Errores

### Errores Manejados

1. **No hay ubicación**
   - Mensaje: "Activa tu ubicación para ver recomendaciones"
   - Acción: Botón para activar permisos

2. **No hay perfil**
   - Comportamiento: Usa perfil por defecto (presupuesto medio, sin intereses)
   - El usuario aún recibe recomendaciones básicas

3. **API de Google falla**
   - Fallback automático a caché de base de datos
   - Si tampoco hay caché, usa datos mock
   - Error visible solo si todo falla

4. **Pocos resultados**
   - Expande automáticamente el radio de búsqueda
   - Relaja filtros si es necesario
   - Muestra mensaje amigable

### Estados de la UI

```typescript
// Loading
isLoading && recommendations.length === 0
→ Muestra spinner con mensaje

// Error total
error && recommendations.length === 0
→ Muestra error con botón "Intentar de nuevo"

// Éxito con advertencia
recommendations.length > 0 && error
→ Muestra recomendaciones + warning banner

// Éxito
recommendations.length > 0 && !error
→ Muestra lista de lugares
```

## Caché y Performance

### Caché de Recomendaciones
- **Duración:** 15 minutos
- **Key:** Ubicación (lat/lng)
- **Invalidación:**
  - Cambio en intereses del usuario
  - Cambio en presupuesto preferido
  - Refresh manual

### Historial de Lugares Mostrados
- Evita repetir los mismos lugares
- Se mantiene en memoria durante la sesión
- Se puede limpiar con `clearCache()`

## Uso desde la UI

### HomeScreen

```typescript
// Cargar recomendaciones
const { loadRecommendations, refreshRecommendations } = usePlacesStore();

// Primera carga (usa caché si existe)
await loadRecommendations({
  categories: ['restaurante', 'cafe']
});

// Refresh forzado (limpia caché)
await refreshRecommendations({
  minRating: 4.0,
  budgetLevel: 'medio'
});
```

### Filtros Disponibles

```typescript
interface RecommendationFilters {
  categories?: PlaceCategory[];    // Filtrar por categorías
  budgetLevel?: BudgetLevel;       // Filtrar por presupuesto
  minRating?: number;              // Rating mínimo (1-5)
  maxDistance?: number;            // Distancia máxima en metros
  openNow?: boolean;               // Solo lugares abiertos
}
```

## Configuración Avanzada

### Ajustar Pesos del Scoring

Edita `src/services/recommendations/RecommendationConfig.ts`:

```typescript
weights: {
  interests: 30,      // Aumenta para dar más importancia a intereses
  rating: 20,         // Aumenta para favorecer lugares mejor calificados
  popularity: 10,     // Aumenta para favorecer lugares populares
  distance: 10,       // Aumenta para favorecer lugares cercanos
  budget: 10,
  activityLevel: 5,
  travelStyle: 5,
  dietary: 5,
  timePreference: 5,
}
```

### Ajustar Comportamiento de Fallback

```typescript
fallback: {
  useCache: true,              // Usar caché en caso de error
  useMockData: true,           // Usar datos mock como último recurso
  expandRadius: true,          // Expandir radio automáticamente
  radiusExpansionStep: 2000,   // Expandir de 2km en 2km
  maxExpansions: 3,            // Máximo 3 expansiones (6km extra)
  relaxFilters: true,          // Relajar filtros si no hay resultados
}
```

### Ajustar Diversidad

```typescript
diversity: {
  enabled: true,
  maxSameCategoryPercent: 0.4,   // Máx 40% de una categoría
  categorySpreadFactor: 0.3,     // Boost por variedad
  minCategoryVariety: 3,         // Mínimo 3 categorías
}
```

## Testing y Debugging

### Logs Importantes

El sistema genera logs útiles para debugging:

```bash
✅ Using cached recommendations        # Usó caché
🔍 Searching places within 5000m      # Buscando lugares
✅ Found 45 places                    # Encontró lugares
📏 Expanding search radius to 7000m   # Expandiendo búsqueda
📉 Too few results, relaxing filters  # Relajando filtros
🔄 Using fallback recommendations     # Usando fallback
✅ Generated 20 personalized recommendations  # Éxito
```

### Limpiar Caché Manualmente

```typescript
import { EnhancedRecommendationEngine } from '@services/recommendations/EnhancedRecommendationEngine';

// Limpiar todo el caché
EnhancedRecommendationEngine.clearCache();

// O desde el store
usePlacesStore.getState().clearCache();
```

### Probar con Diferentes Perfiles

```typescript
// Perfil sin intereses (usa popularidad como proxy)
const defaultProfile = {
  user_id: 'test',
  preferred_budget: 'medio',
  language: 'es',
  interests: [],
};

// Perfil completo
const completeProfile = {
  user_id: 'test',
  preferred_budget: 'medio',
  language: 'es',
  interests: ['gastronomia', 'cultura'],
  activity_level: 'moderado',
  travel_style: 'pareja',
  dietary_preferences: ['vegetariano'],
  preferred_times: ['noche'],
  max_distance: 5,
};

await loadRecommendations();
```

## Mejores Prácticas

### 1. Manejo de Ubicación

```typescript
// Siempre verifica ubicación antes de cargar
useEffect(() => {
  if (currentLocation) {
    loadRecommendations();
  }
}, [currentLocation]);
```

### 2. Reaccionar a Cambios de Perfil

```typescript
// Refresh cuando el perfil cambie significativamente
useEffect(() => {
  if (currentLocation && profile) {
    refreshRecommendations();
  }
}, [profile?.interests, profile?.preferred_budget]);
```

### 3. Pull-to-Refresh

```typescript
const onRefresh = async () => {
  setRefreshing(true);
  await getCurrentLocation();  // Actualiza ubicación
  await refreshRecommendations();  // Fuerza refresh
  setRefreshing(false);
};
```

### 4. Mostrar Errores de Forma Amigable

```typescript
{error && recommendations.length === 0 ? (
  <ErrorView error={error} onRetry={onRefresh} />
) : (
  <RecommendationsList places={recommendations} />
)}
```

## Preguntas Frecuentes

### ¿Por qué no veo recomendaciones?

1. Verifica que la ubicación esté activada
2. Verifica que haya internet
3. Revisa los logs para ver errores
4. Intenta hacer refresh manual
5. El sistema debería mostrar datos mock como último recurso

### ¿Cómo se actualizan las recomendaciones?

- Automáticamente cada 15 minutos
- Al hacer pull-to-refresh
- Al cambiar de ubicación significativamente
- Al cambiar preferencias del perfil

### ¿Por qué aparecen lugares que no coinciden exactamente con mis intereses?

El sistema balancea múltiples factores. Un lugar con excelente rating y muy cerca puede aparecer incluso si no coincide perfectamente con tus intereses. Esto es intencional para descubrimiento.

### ¿Cómo evitar lugares repetidos?

El sistema automáticamente trackea lugares mostrados y evita repetirlos en la misma sesión. Para resetear: cierra y abre la app, o llama a `clearCache()`.

## Próximas Mejoras

Ideas para futuras versiones:

1. **Machine Learning**: Aprender de lugares visitados y calificados
2. **Contexto de Clima**: Ajustar por clima actual (museos si llueve)
3. **Social**: Considerar lugares visitados por amigos
4. **Eventos**: Boost para lugares con eventos actuales
5. **Historial Negativo**: Evitar lugares con malas experiencias
6. **A/B Testing**: Experimentar con diferentes pesos de scoring
