# 🗺️ Configuración de Google Maps API

Esta guía te ayudará a obtener y configurar las API Keys de Google Maps para WanderSafe.

---

## 📋 ¿Qué Necesitas?

Para que la app funcione correctamente necesitas:

1. ✅ **Google Maps API Key** (para Android)
2. ✅ **Google Maps API Key** (para iOS)
3. ✅ **Google Web Client ID** (para Google Sign In)

> 💡 **Nota**: Puedes usar la **misma API Key** para Android e iOS si la configuras correctamente.

---

## 🚀 Paso 1: Crear un Proyecto en Google Cloud

### 1. Ve a Google Cloud Console
👉 [https://console.cloud.google.com](https://console.cloud.google.com)

### 2. Crea un Nuevo Proyecto
1. Haz clic en el selector de proyectos (arriba a la izquierda)
2. Clic en **"Nuevo Proyecto"**
3. Nombre del proyecto: **"WanderSafe"** (o el que prefieras)
4. Haz clic en **"Crear"**

### 3. Espera a que se Cree
La creación toma unos segundos. Verás una notificación cuando esté listo.

---

## 🔑 Paso 2: Habilitar las APIs Necesarias

### 1. Ve a APIs y Servicios

En el menú de navegación (☰), ve a:
```
APIs y servicios > Biblioteca
```

### 2. Habilita Estas APIs

Busca y habilita **cada una** de estas APIs:

#### ✅ Maps SDK for Android
1. Busca: **"Maps SDK for Android"**
2. Clic en el resultado
3. Clic en **"Habilitar"**

#### ✅ Maps SDK for iOS
1. Busca: **"Maps SDK for iOS"**
2. Clic en el resultado
3. Clic en **"Habilitar"**

#### ✅ Places API
1. Busca: **"Places API"**
2. Clic en el resultado
3. Clic en **"Habilitar"**

#### ✅ Directions API (para rutas)
1. Busca: **"Directions API"**
2. Clic en el resultado
3. Clic en **"Habilitar"**

#### ✅ Geocoding API (para direcciones)
1. Busca: **"Geocoding API"**
2. Clic en el resultado
3. Clic en **"Habilitar"**

---

## 🔐 Paso 3: Crear las API Keys

### 1. Ve a Credenciales

```
APIs y servicios > Credenciales
```

### 2. Crear API Key

1. Haz clic en **"+ CREAR CREDENCIALES"**
2. Selecciona **"Clave de API"**
3. Se creará una API Key → **Copia esta key** (la necesitarás)

### 3. Restringir la API Key (IMPORTANTE para seguridad)

Después de crear la key:

1. Haz clic en el nombre de la key para editarla
2. En **"Restricciones de aplicación"**:
   - Para desarrollo: Selecciona **"Ninguna"** (temporalmente)
   - Para producción: Configura restricciones específicas (ver abajo)

3. En **"Restricciones de API"**:
   - Selecciona **"Restringir clave"**
   - Marca estas APIs:
     - ✅ Maps SDK for Android
     - ✅ Maps SDK for iOS
     - ✅ Places API
     - ✅ Directions API
     - ✅ Geocoding API

4. Haz clic en **"Guardar"**

---

## 📝 Paso 4: Configurar el Archivo .env

Ahora que tienes tu API Key, configura tu archivo `.env`:

```env
# Google Maps API
GOOGLE_MAPS_API_KEY_ANDROID=TU_API_KEY_AQUI
GOOGLE_MAPS_API_KEY_IOS=TU_API_KEY_AQUI

# Puedes usar la MISMA KEY para ambos si está bien configurada
```

### Ejemplo Real:
```env
# Google Maps API
GOOGLE_MAPS_API_KEY_ANDROID=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_MAPS_API_KEY_IOS=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔐 Paso 5: Google Sign In (Opcional)

Si quieres habilitar inicio de sesión con Google:

### 1. Crear OAuth Client ID

1. En **APIs y servicios > Credenciales**
2. Clic en **"+ CREAR CREDENCIALES"**
3. Selecciona **"ID de cliente de OAuth"**

### 2. Configurar Pantalla de Consentimiento

Si es tu primera vez:
1. Te pedirá configurar la **pantalla de consentimiento**
2. Selecciona **"Externo"**
3. Completa la información básica:
   - Nombre de la app: **WanderSafe**
   - Email de soporte: tu email
   - Dominio: puedes dejarlo en blanco por ahora

### 3. Crear ID de Cliente Web

1. Tipo de aplicación: **"Aplicación web"**
2. Nombre: **"WanderSafe Web Client"**
3. Clic en **"Crear"**
4. **Copia el Client ID** que se genera

### 4. Agregar al .env

```env
# Google Sign In
GOOGLE_WEB_CLIENT_ID=123456789-xxxxxxxxx.apps.googleusercontent.com
```

---

## 🧪 Paso 6: Verificar que Funciona

### 1. Reinicia el Servidor de Desarrollo

```bash
# Detén el servidor actual (Ctrl+C)
# Inicia de nuevo
npm start
```

### 2. Prueba en la App

Las funciones de mapas deberían funcionar ahora:
- Ver mapa en `HomeScreen`
- Buscar lugares cercanos
- Ver rutas optimizadas

---

## 💰 Costo y Facturación

### ¿Es Gratis?

Google Maps ofrece **$200 USD de crédito mensual GRATIS**. Esto es suficiente para:
- ~28,500 cargas de mapa
- ~40,000 solicitudes de geocodificación
- ~40,000 solicitudes de direcciones

### Para Desarrollo

✅ Es **completamente gratis** durante el desarrollo

### Para Producción

Para apps en producción, necesitarás:
1. Configurar una cuenta de facturación en Google Cloud
2. Agregar método de pago (solo se cobra si excedes los $200 USD mensuales)

---

## 🔒 Seguridad de las API Keys

### Para Desarrollo (Ahora)

Usa las keys sin restricciones para facilitar el desarrollo.

### Para Producción (Importante)

#### Restricciones para Android:

1. En Google Cloud Console → Credenciales
2. Edita la API Key de Android
3. Restricciones de aplicación:
   - Selecciona **"Aplicaciones de Android"**
   - Agrega tu Package Name: `com.tuempresa.wandersafe`
   - Agrega tu SHA-1 fingerprint (obtenerlo con `keytool`)

#### Restricciones para iOS:

1. Edita la API Key de iOS
2. Restricciones de aplicación:
   - Selecciona **"Aplicaciones de iOS"**
   - Agrega tu Bundle ID: `com.tuempresa.wandersafe`

---

## 🐛 Problemas Comunes

### Error: "This API project is not authorized to use this API"

**Solución**: Asegúrate de habilitar todas las APIs mencionadas en el Paso 2.

### Error: "API key not valid"

**Soluciones**:
1. Verifica que copiaste la key completa (sin espacios)
2. Espera 1-2 minutos (las keys nuevas tardan en activarse)
3. Verifica que la API está habilitada

### El mapa no se carga

**Soluciones**:
1. Verifica que la key está en el archivo `.env`
2. Reinicia el servidor de Expo (`npm start`)
3. Verifica en la consola si hay errores de API key
4. Asegúrate de que Maps SDK está habilitado

### Error de facturación

**Solución**: Necesitas habilitar facturación en Google Cloud (aunque uses el crédito gratis):
1. Ve a **Facturación** en Google Cloud Console
2. Vincula una cuenta de facturación
3. Agrega método de pago (no se cobrará si no excedes $200 mensuales)

---

## 📚 Recursos Útiles

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Pricing Calculator](https://developers.google.com/maps/documentation/javascript/usage-and-billing)
- [API Key Best Practices](https://developers.google.com/maps/api-key-best-practices)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

---

## ✅ Checklist de Configuración

### En Google Cloud Console:
- [ ] Proyecto creado en Google Cloud
- [ ] Maps SDK for Android habilitado
- [ ] Maps SDK for iOS habilitado
- [ ] Places API habilitado
- [ ] Directions API habilitado
- [ ] Geocoding API habilitado
- [ ] API Key creada
- [ ] API Key restringida a las APIs necesarias
- [ ] (Opcional) OAuth Client ID creado para Google Sign In

### En tu Proyecto:
- [ ] API Keys agregadas al archivo `.env`
- [ ] Servidor de desarrollo reiniciado
- [ ] App probada y mapas funcionando

---

## 🎯 Tu Configuración Final en .env

Después de completar todos los pasos, tu `.env` debería verse así:

```env
# Supabase Configuration
SUPABASE_URL=https://nypnbainjkenlkihwjfq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Maps API
GOOGLE_MAPS_API_KEY_ANDROID=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_MAPS_API_KEY_IOS=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Sign In (opcional)
GOOGLE_WEB_CLIENT_ID=123456789-xxxxxxxxx.apps.googleusercontent.com

# OneSignal (configurar después)
ONESIGNAL_APP_ID=your-onesignal-app-id

# API URLs
API_BASE_URL=https://your-api.com/api

# Environment
ENVIRONMENT=development
```

---

¡Listo! Ahora tu app WanderSafe debería poder usar Google Maps sin problemas. 🎉
