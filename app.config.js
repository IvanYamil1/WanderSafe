require('dotenv').config();

module.exports = {
  expo: {
    name: "WanderSafeExpo",
    slug: "WanderSafeExpo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-font",
      "expo-location"
    ],
    extra: {
      eas: {
        projectId: "your-project-id"
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      googleMapsApiKeyAndroid: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
      googleMapsApiKeyIos: process.env.GOOGLE_MAPS_API_KEY_IOS,
      googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      oneSignalAppId: process.env.ONESIGNAL_APP_ID,
      apiBaseUrl: process.env.API_BASE_URL,
      environment: process.env.ENVIRONMENT
    }
  }
};
