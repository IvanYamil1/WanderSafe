import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Place } from 'types';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Image as FastImage } from 'expo-image';
import { Card, Text } from '@/components/ui';
import { colors, spacing, radius, shadows, typography } from '@/theme';

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onPress }) => {
  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      restaurante: 'restaurant',
      museo: 'business',
      parque: 'leaf',
      bar: 'beer',
      cafe: 'cafe',
      monumento: 'image',
      tienda: 'cart',
      galeria: 'images',
    };
    return iconMap[category] || 'location';
  };

  const getBudgetSymbol = (level: string): string => {
    const symbolMap: Record<string, string> = {
      bajo: '$',
      medio: '$$',
      alto: '$$$',
      premium: '$$$$',
    };
    return symbolMap[level] || '$$';
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.9}>
      <Card variant="elevated" padding={0} style={styles.card}>
        {place.photos && place.photos.length > 0 ? (
          <FastImage
            source={{ uri: place.photos[0] }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Icon
              name={getCategoryIcon(place.category) as any}
              size={48}
              color={colors.category[place.category as keyof typeof colors.category] || colors.text.tertiary}
            />
          </View>
        )}

        {place.is_verified && (
          <View style={styles.verifiedBadge}>
            <Icon name="checkmark-circle" size={20} color={colors.special.verified} />
          </View>
        )}

        <View style={styles.content}>
          <Text variant="h6" numberOfLines={1} style={styles.name}>
            {place.name}
          </Text>

          <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, { backgroundColor: `${colors.category[place.category as keyof typeof colors.category] || colors.primary[500]}15` }]}>
              <Icon
                name={getCategoryIcon(place.category) as any}
                size={12}
                color={colors.category[place.category as keyof typeof colors.category] || colors.primary[500]}
              />
              <Text
                variant="caption"
                style={[styles.category, { color: colors.category[place.category as keyof typeof colors.category] || colors.primary[500] }]}
              >
                {place.category}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.rating}>
              <Icon name="star" size={16} color={colors.special.rating} />
              <Text variant="labelLarge" style={styles.ratingText}>
                {place.rating.toFixed(1)}
              </Text>
              <Text variant="caption" color="tertiary" style={styles.reviewCount}>
                ({place.review_count})
              </Text>
            </View>

            <Text variant="labelLarge" style={styles.budget} bold>
              {getBudgetSymbol(place.price_level)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginRight: spacing[3],
  },
  card: {
    width: 280,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  placeholderImage: {
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    backgroundColor: colors.neutral[0],
    borderRadius: radius.full,
    padding: spacing[1],
    ...shadows.md,
  },
  content: {
    padding: spacing[4],
  },
  name: {
    marginBottom: spacing[2],
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    gap: spacing[1],
  },
  category: {
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  ratingText: {
    color: colors.text.primary,
  },
  reviewCount: {
    marginLeft: spacing[1],
  },
  budget: {
    color: colors.success.main,
  },
});

export default PlaceCard;
