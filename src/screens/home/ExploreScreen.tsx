import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { usePlacesStore } from '@store/usePlacesStore';
import { useLocationStore } from '@store/useLocationStore';
import { Place } from 'types';
import { Ionicons as Icon } from '@expo/vector-icons';
import PlaceCard from '@components/places/PlaceCard';
import CategoryFilter from '@components/common/CategoryFilter';

type SortOption = 'distance' | 'rating' | 'popularity' | 'price_low' | 'price_high';

interface Filters {
  categories: string[];
  minRating: number;
  maxDistance: number; // in km
  priceRange: string[]; // ['bajo', 'medio', 'alto']
}

const ExploreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    minRating: 0,
    maxDistance: 10,
    priceRange: [],
  });

  const { searchResults, searchPlaces, places, loadPlaces, isLoading, error } =
    usePlacesStore();
  const { currentLocation } = useLocationStore();

  useEffect(() => {
    loadPlaces();
  }, []);

  const handleRefresh = async () => {
    await loadPlaces();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      searchPlaces(query);
    }
  };

  const handlePlacePress = (place: Place) => {
    navigation.navigate('PlaceDetails', { placeId: place.id });
  };

  const handleCategoryChange = (categories: string[]) => {
    setFilters(prev => ({ ...prev, categories }));
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      minRating: 0,
      maxDistance: 10,
      priceRange: [],
    });
    setSearchQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.categories.length > 0 ||
      filters.minRating > 0 ||
      filters.maxDistance < 10 ||
      filters.priceRange.length > 0 ||
      searchQuery.length > 0
    );
  }, [filters, searchQuery]);

  // Apply filters and sorting
  const displayPlaces = useMemo(() => {
    let filtered = searchQuery.length > 2 ? searchResults : places;

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(place =>
        filters.categories.includes(place.category || '')
      );
    }

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(place => (place.rating || 0) >= filters.minRating);
    }

    // Filter by distance
    if (currentLocation && filters.maxDistance < 10) {
      filtered = filtered.filter(place => {
        const distance = place.distance || 0;
        return distance <= filters.maxDistance * 1000; // convert km to m
      });
    }

    // Filter by price range
    if (filters.priceRange.length > 0) {
      filtered = filtered.filter(place =>
        filters.priceRange.includes(place.price_level || 'medio')
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popularity':
          return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
        case 'price_low':
          return getPriceValue(a.price_level) - getPriceValue(b.price_level);
        case 'price_high':
          return getPriceValue(b.price_level) - getPriceValue(a.price_level);
        default:
          return 0;
      }
    });

    return sorted;
  }, [places, searchResults, searchQuery, filters, sortBy, currentLocation]);

  const getPriceValue = (priceLevel?: string): number => {
    const values: Record<string, number> = { bajo: 1, medio: 2, alto: 3 };
    return values[priceLevel || 'medio'] || 2;
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={28} color="#1C1C1E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Calificación mínima</Text>
              <View style={styles.ratingOptions}>
                {[0, 3, 4, 4.5].map(rating => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingChip,
                      filters.minRating === rating && styles.ratingChipActive,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                  >
                    <Icon name="star" size={16} color="#FF9500" />
                    <Text
                      style={[
                        styles.ratingText,
                        filters.minRating === rating && styles.ratingTextActive,
                      ]}
                    >
                      {rating === 0 ? 'Todas' : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Distancia máxima: {filters.maxDistance} km</Text>
              <View style={styles.distanceOptions}>
                {[1, 3, 5, 10].map(distance => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceChip,
                      filters.maxDistance === distance && styles.distanceChipActive,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, maxDistance: distance }))}
                  >
                    <Text
                      style={[
                        styles.distanceText,
                        filters.maxDistance === distance && styles.distanceTextActive,
                      ]}
                    >
                      {distance} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Rango de precio</Text>
              <View style={styles.priceOptions}>
                {['bajo', 'medio', 'alto'].map(price => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.priceChip,
                      filters.priceRange.includes(price) && styles.priceChipActive,
                    ]}
                    onPress={() => {
                      setFilters(prev => ({
                        ...prev,
                        priceRange: prev.priceRange.includes(price)
                          ? prev.priceRange.filter(p => p !== price)
                          : [...prev.priceRange, price],
                      }));
                    }}
                  >
                    <Text
                      style={[
                        styles.priceText,
                        filters.priceRange.includes(price) && styles.priceTextActive,
                      ]}
                    >
                      {price.charAt(0).toUpperCase() + price.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={resetFilters}>
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lugares..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.toolbarButton, hasActiveFilters && styles.toolbarButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Icon
              name="filter"
              size={20}
              color={hasActiveFilters ? '#FFFFFF' : '#007AFF'}
            />
            <Text
              style={[
                styles.toolbarButtonText,
                hasActiveFilters && styles.toolbarButtonTextActive,
              ]}
            >
              Filtros
            </Text>
            {hasActiveFilters && <View style={styles.activeDot} />}
          </TouchableOpacity>

          {/* Sort Options */}
          <TouchableOpacity
            style={[styles.toolbarButton, sortBy === 'distance' && styles.toolbarButtonActive]}
            onPress={() => setSortBy('distance')}
          >
            <Icon
              name="navigate"
              size={20}
              color={sortBy === 'distance' ? '#FFFFFF' : '#007AFF'}
            />
            <Text
              style={[
                styles.toolbarButtonText,
                sortBy === 'distance' && styles.toolbarButtonTextActive,
              ]}
            >
              Distancia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolbarButton, sortBy === 'rating' && styles.toolbarButtonActive]}
            onPress={() => setSortBy('rating')}
          >
            <Icon name="star" size={20} color={sortBy === 'rating' ? '#FFFFFF' : '#007AFF'} />
            <Text
              style={[
                styles.toolbarButtonText,
                sortBy === 'rating' && styles.toolbarButtonTextActive,
              ]}
            >
              Rating
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolbarButton, sortBy === 'popularity' && styles.toolbarButtonActive]}
            onPress={() => setSortBy('popularity')}
          >
            <Icon
              name="flame"
              size={20}
              color={sortBy === 'popularity' ? '#FFFFFF' : '#007AFF'}
            />
            <Text
              style={[
                styles.toolbarButtonText,
                sortBy === 'popularity' && styles.toolbarButtonTextActive,
              ]}
            >
              Popularidad
            </Text>
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Icon name="close-circle-outline" size={20} color="#FF3B30" />
              <Text style={styles.resetButtonText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Category Filter */}
      <CategoryFilter
        selectedCategories={filters.categories}
        onSelectionChange={handleCategoryChange}
      />

      {/* Results Count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          {displayPlaces.length} {displayPlaces.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
        </Text>
      </View>

      {/* Places List */}
      <FlatList
        data={displayPlaces}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PlaceCard place={item} onPress={() => handlePlacePress(item)} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <>
                <Icon name="hourglass-outline" size={64} color="#007AFF" />
                <Text style={styles.emptyText}>Buscando lugares...</Text>
              </>
            ) : error ? (
              <>
                <Icon name="alert-circle-outline" size={64} color="#FF3B30" />
                <Text style={styles.emptyText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                  <Icon name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </>
            ) : hasActiveFilters ? (
              <>
                <Icon name="search-outline" size={64} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
                <Text style={styles.emptyText}>
                  Intenta ajustar los filtros o la búsqueda
                </Text>
                <TouchableOpacity style={styles.clearButton2} onPress={resetFilters}>
                  <Text style={styles.clearButtonText2}>Limpiar filtros</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Icon name="compass-outline" size={64} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>Comienza a explorar</Text>
                <Text style={styles.emptyText}>
                  Busca lugares o usa los filtros para encontrar lo que necesitas
                </Text>
              </>
            )}
          </View>
        }
      />

      {/* Filters Modal */}
      {renderFiltersModal()}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  toolbar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  toolbarButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  toolbarButtonTextActive: {
    color: '#FFFFFF',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  resultsBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  resultsText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
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
  clearButton2: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  clearButtonText2: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  ratingChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  ratingTextActive: {
    color: '#FFFFFF',
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  distanceChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  distanceTextActive: {
    color: '#FFFFFF',
  },
  priceOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priceChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  priceChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  priceTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExploreScreen;
