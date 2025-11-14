import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocationStore } from '@store/useLocationStore';
import { usePlacesStore } from '@store/usePlacesStore';
import { useAuthStore } from '@store/useAuthStore';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PlaceCard from '@components/places/PlaceCard';
import CategoryFilter from '@components/common/CategoryFilter';
import { Place } from 'types';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { currentLocation, getCurrentLocation, requestPermissions } = useLocationStore();
  const { recommendations, loadRecommendations, isLoading } = usePlacesStore();
  const { user, profile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (currentLocation && profile) {
      loadRecommendations({
        categories: selectedCategories.length > 0 ? selectedCategories as any : undefined,
      });
    }
  }, [currentLocation, profile, selectedCategories]);

  const initializeLocation = async () => {
    const hasPermission = await requestPermissions();
    if (hasPermission) {
      await getCurrentLocation();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    await loadRecommendations({
      categories: selectedCategories.length > 0 ? selectedCategories as any : undefined,
    });
    setRefreshing(false);
  };

  const handlePlacePress = (place: Place) => {
    navigation.navigate('PlaceDetails', { placeId: place.id });
  };

  const handleSafetyMapPress = () => {
    navigation.navigate('SafetyMap');
  };

  const handleRouteOptimizerPress = () => {
    navigation.navigate('RouteOptimizer');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#007AFF', '#0051D5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hola{user?.full_name ? `, ${user.full_name}` : ''}!</Text>
            <Text style={styles.subtitle}>Descubre lugares increíbles cerca de ti</Text>
          </View>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
          >
            <Icon name="location" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleSafetyMapPress}
          >
            <Icon name="shield-checkmark" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Mapa de Seguridad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleRouteOptimizerPress}
          >
            <Icon name="map" size={32} color="#34C759" />
            <Text style={styles.actionText}>Optimizar Ruta</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <CategoryFilter
          selectedCategories={selectedCategories}
          onSelectionChange={setSelectedCategories}
        />

        {/* Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recomendaciones para ti</Text>
            <TouchableOpacity>
              <Icon name="filter" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {isLoading && recommendations.length === 0 ? (
            <Text style={styles.loadingText}>Cargando recomendaciones...</Text>
          ) : recommendations.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay recomendaciones disponibles en este momento
            </Text>
          ) : (
            <FlatList
              horizontal
              data={recommendations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PlaceCard
                  place={item}
                  onPress={() => handlePlacePress(item)}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardList}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingTop: 50, // Extra padding for status bar
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  cardList: {
    paddingRight: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
  },
});

export default HomeScreen;
