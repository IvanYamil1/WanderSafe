# 🗺️ Configuración de Mapbox (Alternativa GRATIS a Google Maps)

## 🎉 ¿Por qué Mapbox?

✅ **50,000 cargas de mapa GRATIS al mes** (para siempre)
✅ **NO requiere tarjeta de crédito**
✅ Excelente calidad de mapas
✅ Funciona perfecto con React Native/Expo
✅ APIs de geocodificación, direcciones y lugares GRATIS incluidas

---

## 🚀 Paso 1: Crear Cuenta en Mapbox

### 1. Ve a Mapbox
👉 [https://account.mapbox.com/auth/signup/](https://account.mapbox.com/auth/signup/)

### 2. Regístrate
- Puedes usar tu email o GitHub
- **NO necesitas tarjeta de crédito**

### 3. Confirma tu Email
Revisa tu correo y confirma la cuenta.

---

## 🔑 Paso 2: Obtener tu Access Token

### 1. Accede a tu Dashboard
Después de iniciar sesión, llegarás al dashboard automáticamente.

### 2. Copia tu Access Token
En la página principal verás:
```
Default public token
pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsxxxxxxxxxxxxx...
```

**Copia este token completo** (empieza con `pk.`)

### 3. (Opcional) Crear un Token Específico
Para mayor seguridad:
1. Ve a **Tokens** en el menú lateral
2. Click en **Create a token**
3. Nombre: "WanderSafe App"
4. Scopes necesarios (selecciona):
   - ✅ `styles:read`
   - ✅ `fonts:read`
   - ✅ `datasets:read`
   - ✅ `vision:read`
5. Click en **Create token**
6. **Copia el token**

---

## 📝 Paso 3: Configurar el .env

Actualiza tu archivo `.env`:

```env
# Mapbox Configuration (en lugar de Google Maps)
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsxxxxxxxxxxxxx

# Ya NO necesitas estas:
# GOOGLE_MAPS_API_KEY_ANDROID=
# GOOGLE_MAPS_API_KEY_IOS=
```

---

## 📦 Paso 4: Instalar las Dependencias

### Para Expo (tu caso)

```bash
# Instalar el paquete de Mapbox para Expo
npx expo install @rnmapbox/maps

# También necesitarás dotenv si no lo tienes
npm install dotenv
```

---

## ⚙️ Paso 5: Configurar app.config.js

Actualiza tu `app.config.js` para incluir la configuración de Mapbox:

```javascript
require('dotenv').config();

module.exports = {
  expo: {
    // ... resto de tu config
    plugins: [
      "expo-font",
      "expo-location",
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsDownloadToken: process.env.MAPBOX_ACCESS_TOKEN,
        }
      ]
    ],
    extra: {
      // ... tus otras variables
      mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
    }
  }
};
```

---

## 💻 Paso 6: Crear un Componente de Mapa

Crea un componente de ejemplo para probar Mapbox:

### Archivo: `src/components/MapboxMap.tsx`

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Constants from 'expo-constants';

// Configurar el access token
Mapbox.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken || '');

interface MapboxMapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  latitude = 20.676534,  // Guadalajara por defecto
  longitude = -103.347142,
  zoom = 14,
}) => {
  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street} // Estilo de mapa
      >
        <Mapbox.Camera
          zoomLevel={zoom}
          centerCoordinate={[longitude, latitude]}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* Marcador en la ubicación */}
        <Mapbox.PointAnnotation
          id="userLocation"
          coordinate={[longitude, latitude]}
        >
          <View style={styles.marker}>
            <View style={styles.markerInner} />
          </View>
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
```

---

## 🎨 Estilos de Mapa Disponibles

Mapbox ofrece varios estilos gratuitos:

```typescript
// En tu componente MapView
styleURL={Mapbox.StyleURL.Street}      // Calles (estilo clásico)
styleURL={Mapbox.StyleURL.Outdoors}    // Exterior (para hiking)
styleURL={Mapbox.StyleURL.Light}       // Claro
styleURL={Mapbox.StyleURL.Dark}        // Oscuro
styleURL={Mapbox.StyleURL.Satellite}   // Satélite
styleURL={Mapbox.StyleURL.SatelliteStreet} // Satélite + calles
```

---

## 🔍 APIs Adicionales de Mapbox (GRATIS)

### 1. Geocodificación (Dirección → Coordenadas)

```typescript
const geocodeAddress = async (address: string) => {
  const token = Constants.expoConfig?.extra?.mapboxAccessToken;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.features && data.features.length > 0) {
    const [longitude, latitude] = data.features[0].center;
    return { latitude, longitude };
  }
  return null;
};

// Uso
const coords = await geocodeAddress('Catedral de Guadalajara');
```

### 2. Geocodificación Inversa (Coordenadas → Dirección)

```typescript
const reverseGeocode = async (latitude: number, longitude: number) => {
  const token = Constants.expoConfig?.extra?.mapboxAccessToken;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.features && data.features.length > 0) {
    return data.features[0].place_name; // Dirección completa
  }
  return null;
};
```

### 3. Direcciones (Rutas entre puntos)

```typescript
const getDirections = async (
  origin: [number, number],  // [longitude, latitude]
  destination: [number, number]
) => {
  const token = Constants.expoConfig?.extra?.mapboxAccessToken;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${token}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.routes && data.routes.length > 0) {
    return {
      distance: data.routes[0].distance, // en metros
      duration: data.routes[0].duration, // en segundos
      geometry: data.routes[0].geometry, // GeoJSON
    };
  }
  return null;
};
```

### 4. Búsqueda de Lugares

```typescript
const searchPlaces = async (query: string, proximity: [number, number]) => {
  const token = Constants.expoConfig?.extra?.mapboxAccessToken;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?proximity=${proximity[0]},${proximity[1]}&access_token=${token}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.features.map((feature: any) => ({
    name: feature.text,
    address: feature.place_name,
    coordinates: feature.center, // [longitude, latitude]
  }));
};
```

---

## 🔄 Migrar desde Google Maps

Si ya tenías código con Google Maps, aquí está la comparación:

### Google Maps → Mapbox

| Google Maps | Mapbox |
|-------------|--------|
| `<MapView>` | `<Mapbox.MapView>` |
| `<Marker>` | `<Mapbox.PointAnnotation>` |
| `initialRegion` | `<Mapbox.Camera centerCoordinate>` |
| `region` | `<Mapbox.Camera>` |
| Geocoding API | Mapbox Geocoding API |
| Directions API | Mapbox Directions API |
| Places API | Mapbox Geocoding API |

---

## 💰 Límites del Plan Gratuito

### ✅ Plan Gratuito de Mapbox (para siempre)

- **50,000 cargas de mapa/mes** (suficiente para ~1,600 usuarios activos)
- **100,000 geocodificaciones/mes**
- **100,000 direcciones/mes**
- **Estilos de mapa ilimitados**
- **No caduca, es gratis para siempre**

### 🚀 Si Creces

Solo pagas si excedes estos límites. Precios:
- Cargas de mapa adicionales: $5 por cada 10,000
- Muy económico comparado con Google Maps

---

## 🎯 Ejemplo Completo de Uso en HomeScreen

```typescript
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapboxMap } from '@/components/MapboxMap';
import { useLocationStore } from '@/store/useLocationStore';

export const HomeScreen = () => {
  const { currentLocation, requestLocationPermission } = useLocationStore();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapboxMap
          latitude={currentLocation.latitude}
          longitude={currentLocation.longitude}
          zoom={14}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

---

## 🐛 Problemas Comunes

### El mapa no se muestra

**Soluciones**:
1. Verifica que el token está en `.env`
2. Reinicia el servidor: `npx expo start -c`
3. Verifica que instalaste `@rnmapbox/maps`
4. Asegúrate de que el token empieza con `pk.`

### Error: "Invalid access token"

**Solución**:
1. Copia de nuevo el token desde Mapbox Dashboard
2. Asegúrate de que no tiene espacios al inicio/final
3. Verifica que está bien en el `.env`

### El mapa está en blanco

**Solución**:
1. Verifica que tienes conexión a internet
2. Comprueba que el `styleURL` es válido
3. Revisa la consola para errores

---

## 📚 Recursos

- [Mapbox Docs](https://docs.mapbox.com/)
- [React Native Mapbox](https://github.com/rnmapbox/maps)
- [Mapbox API Playground](https://docs.mapbox.com/playground/)
- [Mapbox Studio](https://studio.mapbox.com/) - Personalizar estilos

---

## ✅ Checklist

- [ ] Cuenta creada en Mapbox
- [ ] Access token copiado
- [ ] `.env` actualizado con `MAPBOX_ACCESS_TOKEN`
- [ ] `@rnmapbox/maps` instalado
- [ ] `app.config.js` configurado
- [ ] Componente `MapboxMap` creado
- [ ] Servidor reiniciado
- [ ] Mapa probado y funcionando

---

## 🎉 Ventajas de Mapbox sobre Google Maps

✅ **50,000 cargas gratis vs 28,500** de Google
✅ **No requiere tarjeta de crédito**
✅ **Más personalizable** (estilos propios)
✅ **Mejor rendimiento** en móviles
✅ **Open source friendly**
✅ **APIs más generosas**

---

¡Listo! Con Mapbox tienes una solución **completamente gratis** y mejor que Google Maps para tu app WanderSafe. 🎉
