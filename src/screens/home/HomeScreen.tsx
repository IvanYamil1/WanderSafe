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
  const { recommendations, loadRecommendations, refreshRecommendations, isLoading, error, clearCache } = usePlacesStore();
  const { user, profile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    // Clear cache on app start to get fresh data
    clearCache();
    initializeLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      // Load recommendations even without profile (will use defaults)
      loadRecommendations({
        categories: selectedCategories.length > 0 ? selectedCategories as any : undefined,
      });
    }
  }, [currentLocation, selectedCategories]);

  // Reload when profile changes (user completes onboarding)
  useEffect(() => {
    if (currentLocation && profile) {
      console.log('Profile updated, refreshing recommendations');
      refreshRecommendations({
        categories: selectedCategories.length > 0 ? selectedCategories as any : undefined,
      });
    }
  }, [profile?.interests, profile?.preferred_budget, profile?.activity_level]);

  const initializeLocation = async () => {
    const hasPermission = await requestPermissions();
    if (hasPermission) {
      await getCurrentLocation();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getCurrentLocation();
      await refreshRecommendations({
        categories: selectedCategories.length > 0 ? selectedCategories as any : undefined,
      });
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
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
        colors={['#007AFF', '#0066FF', '#0051D5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              Hola{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
            </Text>
            <Text style={styles.subtitle}>¿Qué quieres explorar hoy?</Text>
          </View>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
          >
            <Icon name="location" size={22} color="#007AFF" />
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
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Acciones rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardPrimary]}
              onPress={handleSafetyMapPress}
            >
              <View style={styles.actionIconContainer}>
                <Icon name="shield-checkmark" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.actionTitle}>Mapa de</Text>
              <Text style={styles.actionTitle}>Seguridad</Text>
              <Text style={styles.actionDescription}>Zonas seguras cerca de ti</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardSecondary]}
              onPress={handleRouteOptimizerPress}
            >
              <View style={styles.actionIconContainer}>
                <Icon name="map" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.actionTitle}>Optimizar</Text>
              <Text style={styles.actionTitle}>Ruta</Text>
              <Text style={styles.actionDescription}>Planifica tu día perfecto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filters */}
        <CategoryFilter
          selectedCategories={selectedCategories}
          onSelectionChange={setSelectedCategories}
        />

        {/* Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Para ti</Text>
              <Text style={styles.sectionSubtitle}>Lugares recomendados</Text>
            </View>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <Icon name="refresh" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {profile && (
            <View style={styles.preferencesInfo}>
              <Icon name="sparkles" size={16} color="#007AFF" />
              <Text style={styles.preferencesText}>
                Basado en tus intereses:{' '}
                {profile.interests?.slice(0, 3).join(', ') || 'ninguno'}
                {profile.travel_style && ` • ${profile.travel_style}`}
                {profile.activity_level && ` • ${profile.activity_level}`}
              </Text>
            </View>
          )}

          {error && recommendations.length === 0 ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={48} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={onRefresh}
              >
                <Icon name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
              </TouchableOpacity>
            </View>
          ) : isLoading && recommendations.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Icon name="location" size={40} color="#007AFF" />
              <Text style={styles.loadingText}>
                Buscando los mejores lugares para ti...
              </Text>
              <Text style={styles.loadingSubtext}>
                Esto puede tomar unos segundos
              </Text>
            </View>
          ) : recommendations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="compass-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyText}>
                No hay lugares cerca de ti ahora
              </Text>
              <Text style={styles.emptySubtext}>
                Intenta expandir tu radio de búsqueda o cambiar de ubicación
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={onRefresh}
              >
                <Icon name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Buscar de nuevo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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
              <Text style={styles.resultsCount}>
                {recommendations.length} lugares personalizados para ti
              </Text>
              {error && (
                <Text style={styles.warningText}>
                  ⚠️ {error}
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  actionCardPrimary: {
    backgroundColor: '#007AFF',
  },
  actionCardSecondary: {
    backgroundColor: '#34C759',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  actionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardList: {
    paddingRight: 16,
  },
  preferencesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  preferencesText: {
    flex: 1,
    fontSize: 13,
    color: '#1C1C1E',
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    textAlign: 'center',
    color: '#007AFF',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingSubtext: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 8,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#1C1C1E',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 8,
    fontSize: 14,
    paddingHorizontal: 32,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  resultsCount: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 12,
  },
  warningText: {
    textAlign: 'center',
    color: '#FF9500',
    fontSize: 12,
    marginTop: 8,
    paddingHorizontal: 16,
  },
});

export default HomeScreen;
