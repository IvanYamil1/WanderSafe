# Configuración de Google Places API

Esta guía te ayudará a configurar Google Places API para obtener datos reales de lugares en WanderSafe.

## Paso 1: Obtener API Key de Google Places

### 1.1 Crear un proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos y luego en **"Nuevo Proyecto"**
3. Dale un nombre a tu proyecto (ej: "WanderSafe")
4. Haz clic en **"Crear"**

### 1.2 Habilitar Google Places API
1. En el menú lateral, ve a **APIs & Services** → **Library**
2. Busca **"Places API"**
3. Haz clic en **"Places API"** (la versión nueva)
4. Haz clic en **"Habilitar"**

### 1.3 Crear API Key
1. Ve a **APIs & Services** → **Credentials**
2. Haz clic en **"Create Credentials"** → **"API Key"**
3. Copia la API Key que se genera
4. (Opcional pero recomendado) Haz clic en **"Restrict Key"**:
   - **Application restrictions**: Ninguna (para desarrollo) o configura restricciones
   - **API restrictions**: Selecciona "Restrict key" y elige "Places API"
   - Guarda los cambios

## Paso 2: Configurar variables de entorno

Este proyecto usa **Expo** con `dotenv` y `expo-constants` para manejar variables de entorno de forma segura.

### 2.1 Agregar API key al archivo .env

El proyecto ya tiene un archivo `.env` configurado. Abre `.env` y agrega tu API key:

```env
# Google Places API
GOOGLE_PLACES_API_KEY=TU_API_KEY_AQUÍ
```

**⚠️ IMPORTANTE**: El archivo `.env` ya está en `.gitignore` para proteger tus API keys.

### 2.2 Verificar configuración

El proyecto ya está configurado para usar tu API key:

1. **app.config.js** expone la variable:
```javascript
extra: {
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
  // ... otras variables
}
```

2. **GooglePlacesService.ts** la usa con expo-constants:
```typescript
import Constants from 'expo-constants';
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey;
```

### 2.3 Reiniciar el servidor de desarrollo

Después de agregar tu API key, **reinicia el servidor de Expo** para que cargue las nuevas variables:

```bash
# Detén el servidor actual (Ctrl+C)
# Luego inicia de nuevo
npm start
```

## Paso 3: Verificar la configuración

Ejecuta la app y verifica los logs. Deberías ver mensajes como:

```
🔍 Fetching from Google Places API
💾 Saved X places to database cache
```

Si ves errores de API, verifica:
1. Que la API key sea correcta
2. Que Places API esté habilitada en Google Cloud
3. Que tengas créditos disponibles en Google Cloud

## Costos y límites

### Gratis
- **$200 USD de crédito mensual** (suficiente para ~28,000 solicitudes)
- Las primeras solicitudes cada mes son gratis

### Después del crédito gratuito
- **Nearby Search**: ~$32 USD por 1,000 solicitudes
- **Place Details**: ~$17 USD por 1,000 solicitudes
- **Text Search**: ~$32 USD por 1,000 solicitudes

### Cómo reducir costos

El sistema ya está optimizado con:

1. **Caché en memoria**: Respuestas instantáneas sin costo
2. **Caché en Supabase**: Almacena resultados por 24 horas
3. **Fallback a mock data**: Si falla, usa datos de ejemplo

### Monitorear uso

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Dashboard**
3. Selecciona **Places API**
4. Verás gráficas de uso y costos

## Configuración opcional de facturación

Para usar más de $200 USD/mes:

1. Ve a **Billing** en Google Cloud Console
2. Configura tu método de pago
3. Establece alertas de presupuesto para evitar sorpresas

**Recomendación**: Configura una alerta a $50, $100, $150 para monitorear

## Solución de problemas

### Error: "This API project is not authorized to use this API"
- Asegúrate de haber habilitado Places API en tu proyecto

### Error: "The provided API key is invalid"
- Verifica que copiaste la API key correctamente
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto

### No se muestran lugares reales
- Verifica los logs de la consola
- Asegúrate de tener permisos de ubicación
- Verifica que tengas conexión a internet

### Aparece "Using mock data"
- Esto es normal si no has configurado la API key aún
- O si se agotó el caché y la API falló

## Producción

Para producción:

1. **Restringe tu API key**:
   - Por IP addresses (para backend)
   - Por bundle ID (para apps móviles)

2. **Configura cuotas**:
   - Establece límites de solicitudes por día
   - Configura alertas de uso

3. **Implementa rate limiting**:
   - El sistema ya tiene caché
   - Considera limitar búsquedas por usuario

## Alternativas sin costo

Si prefieres no usar Google Places API, puedes:

1. **Usar solo mock data** (12 lugares de ejemplo)
2. **Agregar lugares manualmente** a Supabase
3. **Usar OpenStreetMap** (gratuito, pero requiere más configuración)
