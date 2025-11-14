import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons as Icon } from '@expo/vector-icons';

// Screens
import HomeScreen from '@screens/home/HomeScreen';
import ExploreScreen from '@screens/home/ExploreScreen';
import FavoritesScreen from '@screens/favorites/FavoritesScreen';
import EventsScreen from '@screens/events/EventsScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';
import PlaceDetailsScreen from '@screens/places/PlaceDetailsScreen';
import SafetyMapScreen from '@screens/safety/SafetyMapScreen';
import RouteOptimizerScreen from '@screens/routes/RouteOptimizerScreen';
import CreateReviewScreen from '@screens/places/CreateReviewScreen';
import EditProfileScreen from '@screens/profile/EditProfileScreen';
import EditPreferencesScreen from '@screens/profile/EditPreferencesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlaceDetails"
        component={PlaceDetailsScreen}
        options={{ title: 'Detalles del Lugar' }}
      />
      <Stack.Screen
        name="SafetyMap"
        component={SafetyMapScreen}
        options={{ title: 'Mapa de Seguridad' }}
      />
      <Stack.Screen
        name="RouteOptimizer"
        component={RouteOptimizerScreen}
        options={{ title: 'Optimizar Ruta' }}
      />
      <Stack.Screen
        name="CreateReview"
        component={CreateReviewScreen}
        options={{ title: 'Escribir Reseña' }}
      />
    </Stack.Navigator>
  );
};

const ExploreStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExploreMain"
        component={ExploreScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlaceDetails"
        component={PlaceDetailsScreen}
        options={{ title: 'Detalles del Lugar' }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Editar Perfil' }}
      />
      <Stack.Screen
        name="EditPreferences"
        component={EditPreferencesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{ tabBarLabel: 'Explorar' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Favoritos' }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{ tabBarLabel: 'Eventos' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
