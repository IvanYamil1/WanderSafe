import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

interface CategoryFilterProps {
  selectedCategories: string[];
  onSelectionChange: (categories: string[]) => void;
}

interface Category {
  id: string;
  label: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  { id: 'restaurante', label: 'Restaurantes', icon: 'restaurant' },
  { id: 'museo', label: 'Museos', icon: 'business' },
  { id: 'parque', label: 'Parques', icon: 'leaf' },
  { id: 'bar', label: 'Bares', icon: 'beer' },
  { id: 'cafe', label: 'Cafés', icon: 'cafe' },
  { id: 'monumento', label: 'Monumentos', icon: 'image' },
  { id: 'tienda', label: 'Tiendas', icon: 'cart' },
  { id: 'galeria', label: 'Galerías', icon: 'images' },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  onSelectionChange,
}) => {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onSelectionChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onSelectionChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(category => {
        const isSelected = selectedCategories.includes(category.id);
        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => toggleCategory(category.id)}
          >
            <Icon
              name={category.icon as any}
              size={16}
              color={isSelected ? '#FFFFFF' : '#8E8E93'}
            />
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#007AFF',
  },
  label: {
    marginLeft: 6,
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});

export default CategoryFilter;
