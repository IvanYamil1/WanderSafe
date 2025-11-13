import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { usePlacesStore } from '@store/usePlacesStore';
import { useFavoritesStore } from '@store/useFavoritesStore';
import { DatabaseService } from '@services/supabase/database';
import { Review } from 'types';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Image as FastImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const PlaceDetailsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { placeId } = route.params;
  const { selectedPlace, getPlaceById } = usePlacesStore();
  const { isFavorite, addFavorite, removeFavorite, addVisit } = useFavoritesStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    loadPlace();
    loadReviews();
  }, [placeId]);

  const loadPlace = async () => {
    await getPlaceById(placeId);
  };

  const loadReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const placeReviews = await DatabaseService.getPlaceReviews(placeId);
      setReviews(placeReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite(placeId)) {
        await removeFavorite(placeId);
      } else {
        await addFavorite(placeId);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCallPlace = () => {
    if (selectedPlace?.phone) {
      Linking.openURL(`tel:${selectedPlace.phone}`);
    }
  };

  const handleOpenWebsite = () => {
    if (selectedPlace?.website) {
      Linking.openURL(selectedPlace.website);
    }
  };

  const handleGetDirections = () => {
    if (selectedPlace) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.latitude},${selectedPlace.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleOrderUber = () => {
    if (selectedPlace) {
      const url = `uber://?action=setPickup&dropoff[latitude]=${selectedPlace.latitude}&dropoff[longitude]=${selectedPlace.longitude}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir Uber. Asegúrate de tenerla instalada.');
      });
    }
  };

  const handleWriteReview = () => {
    addVisit(placeId);
    navigation.navigate('CreateReview', { placeId });
  };

  if (!selectedPlace) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        {selectedPlace.photos && selectedPlace.photos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageGallery}
          >
            {selectedPlace.photos.map((photo, index) => (
              <FastImage
                key={index}
                source={{ uri: photo }}
                style={styles.headerImage}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.headerImage, styles.placeholderImage]}>
            <Icon name="image" size={80} color="#8E8E93" />
          </View>
        )}

        {/* Place Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.name}>{selectedPlace.name}</Text>
              <View style={styles.ratingRow}>
                <Icon name="star" size={18} color="#FFB800" />
                <Text style={styles.rating}>{selectedPlace.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>
                  ({selectedPlace.review_count} reseñas)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleToggleFavorite}
            >
              <Icon
                name={isFavorite(placeId) ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorite(placeId) ? '#FF3B30' : '#8E8E93'}
              />
            </TouchableOpacity>
          </View>

          {/* Category and Price */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="pricetag" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{selectedPlace.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="cash" size={16} color="#34C759" />
              <Text style={styles.metaText}>{selectedPlace.price_level}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{selectedPlace.description}</Text>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dirección</Text>
            <View style={styles.addressRow}>
              <Icon name="location" size={20} color="#007AFF" />
              <Text style={styles.address}>{selectedPlace.address}</Text>
            </View>
          </View>

          {/* Contact Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleGetDirections}
            >
              <Icon name="navigate" size={24} color="#007AFF" />
              <Text style={styles.actionButtonText}>Cómo llegar</Text>
            </TouchableOpacity>

            {selectedPlace.phone && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCallPlace}
              >
                <Icon name="call" size={24} color="#34C759" />
                <Text style={styles.actionButtonText}>Llamar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleOrderUber}
            >
              <Icon name="car" size={24} color="#000000" />
              <Text style={styles.actionButtonText}>Uber</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reseñas</Text>
              <TouchableOpacity onPress={handleWriteReview}>
                <Text style={styles.writeReviewLink}>Escribir reseña</Text>
              </TouchableOpacity>
            </View>

            {reviews.map((review, index) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.avatar}>
                      <Icon name="person" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.reviewerName}>
                      {review.user?.full_name || 'Usuario'}
                    </Text>
                  </View>
                  <View style={styles.reviewRating}>
                    <Icon name="star" size={14} color="#FFB800" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGallery: {
    height: 300,
  },
  headerImage: {
    width: 400,
    height: 300,
  },
  placeholderImage: {
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  favoriteButton: {
    padding: 8,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#1C1C1E',
    textTransform: 'capitalize',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#3A3A3C',
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  address: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#3A3A3C',
  },
  actionsSection: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  actionButtonText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  writeReviewLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  reviewCard: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  reviewComment: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
  },
});

export default PlaceDetailsScreen;
