import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFavoritesStore } from '@store/useFavoritesStore';
import { Ionicons as Icon } from '@expo/vector-icons';
import PlaceCard from '@components/places/PlaceCard';
import { Place } from 'types';

// Category definitions with icons
const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: 'grid-outline' },
  { id: 'restaurante', label: 'Restaurantes', icon: 'restaurant-outline' },
  { id: 'museo', label: 'Museos', icon: 'business-outline' },
  { id: 'parque', label: 'Parques', icon: 'leaf-outline' },
  { id: 'mirador', label: 'Miradores', icon: 'eye-outline' },
  { id: 'cafe', label: 'Cafés', icon: 'cafe-outline' },
  { id: 'bar', label: 'Bares', icon: 'beer-outline' },
  { id: 'tienda', label: 'Tiendas', icon: 'cart-outline' },
  { id: 'hotel', label: 'Hoteles', icon: 'bed-outline' },
  { id: 'actividad', label: 'Actividades', icon: 'bicycle-outline' },
];

const FavoritesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { favoritePlaces, loadFavorites, isLoading, removeFavorite } = useFavoritesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRefresh = () => {
    loadFavorites();
  };

  const handlePlacePress = (place: Place) => {
    navigation.navigate('PlaceDetails', { placeId: place.id });
  };

  const handleRemoveFavorite = async (placeId: string) => {
    try {
      await removeFavorite(placeId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleShareFavorites = async () => {
    if (filteredPlaces.length === 0) return;

    const message = `Mis lugares favoritos en WanderSafe:\n\n${filteredPlaces
      .slice(0, 10)
      .map((place, index) => `${index + 1}. ${place.name}`)
      .join('\n')}`;

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Filter and search logic
  const filteredPlaces = useMemo(() => {
    let filtered = favoritePlaces;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place => place.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        place =>
          place.name.toLowerCase().includes(query) ||
          place.address?.toLowerCase().includes(query) ||
          place.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [favoritePlaces, selectedCategory, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    favoritePlaces.forEach(place => {
      const cat = place.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const mostVisitedCategory = Object.entries(categoryCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    const avgRating =
      favoritePlaces.reduce((sum, place) => sum + (place.rating || 0), 0) /
      (favoritePlaces.length || 1);

    return {
      total: favoritePlaces.length,
      categories: Object.keys(categoryCounts).length,
      mostVisitedCategory: mostVisitedCategory
        ? CATEGORIES.find(c => c.id === mostVisitedCategory[0])?.label || mostVisitedCategory[0]
        : 'N/A',
      avgRating: avgRating.toFixed(1),
    };
  }, [favoritePlaces]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Favoritos</Text>
          {favoritePlaces.length > 0 && (
            <TouchableOpacity onPress={handleShareFavorites} style={styles.shareButton}>
              <Icon name="share-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          {stats.total} {stats.total === 1 ? 'lugar guardado' : 'lugares guardados'}
        </Text>

        {/* Search Bar */}
        {favoritePlaces.length > 0 && (
          <View style={styles.searchContainer}>
            <Icon name="search-outline" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar en favoritos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E93"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Statistics Section */}
      {favoritePlaces.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="heart" size={20} color="#FF3B30" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="folder-open" size={20} color="#007AFF" />
            <Text style={styles.statValue}>{stats.categories}</Text>
            <Text style={styles.statLabel}>Categorías</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="star" size={20} color="#FF9500" />
            <Text style={styles.statValue}>{stats.avgRating}</Text>
            <Text style={styles.statLabel}>Rating Prom.</Text>
          </View>
        </View>
      )}

      {/* Category Filters */}
      {favoritePlaces.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map(category => {
            const count =
              category.id === 'all'
                ? favoritePlaces.length
                : favoritePlaces.filter(p => p.category === category.id).length;

            if (count === 0 && category.id !== 'all') return null;

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Icon
                  name={category.icon as any}
                  size={18}
                  color={selectedCategory === category.id ? '#FFFFFF' : '#007AFF'}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === category.id && styles.categoryLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
                <View
                  style={[
                    styles.categoryBadge,
                    selectedCategory === category.id && styles.categoryBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryCount,
                      selectedCategory === category.id && styles.categoryCountActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Places List */}
      <FlatList
        data={filteredPlaces}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PlaceCard place={item} onPress={() => handlePlacePress(item)} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFavorite(item.id)}
            >
              <Icon name="heart" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {searchQuery || selectedCategory !== 'all' ? (
              <>
                <Icon name="search-outline" size={80} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
                <Text style={styles.emptyText}>
                  Intenta con otros filtros o búsqueda
                </Text>
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  <Icon name="refresh-outline" size={20} color="#007AFF" />
                  <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Icon name="heart-outline" size={80} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
                <Text style={styles.emptyText}>
                  Los lugares que marques como favoritos aparecerán aquí
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => navigation.navigate('Explore')}
                >
                  <Icon name="compass-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.exploreButtonText}>Explorar lugares</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  shareButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  categoriesScroll: {
    maxHeight: 50,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  categoryBadge: {
    backgroundColor: '#E5F1FF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoryCountActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  clearFiltersText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 24,
    gap: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoritesScreen;
