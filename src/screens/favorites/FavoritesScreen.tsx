import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFavoritesStore } from '@store/useFavoritesStore';
import { Ionicons as Icon } from '@expo/vector-icons';
import PlaceCard from '@components/places/PlaceCard';

const FavoritesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { favorites, loadFavorites, isLoading } = useFavoritesStore();

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRefresh = () => {
    loadFavorites();
  };

  const handlePlacePress = (placeId: string) => {
    navigation.navigate('PlaceDetails', { placeId });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        <Text style={styles.subtitle}>
          {favorites.length} {favorites.length === 1 ? 'lugar guardado' : 'lugares guardados'}
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={({ item }) =>
          item.place ? (
            <View style={styles.cardWrapper}>
              <PlaceCard
                place={item.place}
                onPress={() => handlePlacePress(item.place_id)}
              />
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="heart-outline" size={80} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
            <Text style={styles.emptyText}>
              Los lugares que marques como favoritos aparecerán aquí
            </Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
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
});

export default FavoritesScreen;
