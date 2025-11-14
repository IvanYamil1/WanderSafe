import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthStore } from '@store/useAuthStore';
import { TouristInterest, BudgetLevel } from 'types';

interface EditPreferencesScreenProps {
  navigation: any;
}

interface InterestOption {
  id: TouristInterest;
  label: string;
  icon: keyof typeof Icon.glyphMap;
}

interface BudgetOption {
  id: BudgetLevel;
  label: string;
  icon: keyof typeof Icon.glyphMap;
  color: string;
}

const INTERESTS: InterestOption[] = [
  { id: 'gastronomia', label: 'Gastronomía', icon: 'restaurant' },
  { id: 'cultura', label: 'Cultura', icon: 'color-palette' },
  { id: 'naturaleza', label: 'Naturaleza', icon: 'leaf' },
  { id: 'aventura', label: 'Aventura', icon: 'bicycle' },
  { id: 'vida_nocturna', label: 'Vida Nocturna', icon: 'moon' },
  { id: 'compras', label: 'Compras', icon: 'bag-handle' },
  { id: 'historia', label: 'Historia', icon: 'book' },
  { id: 'arte', label: 'Arte', icon: 'brush' },
  { id: 'deportes', label: 'Deportes', icon: 'football' },
  { id: 'relax', label: 'Relax', icon: 'flower' },
];

const BUDGETS: BudgetOption[] = [
  { id: 'bajo', label: 'Económico', icon: 'wallet', color: '#34C759' },
  { id: 'medio', label: 'Moderado', icon: 'card', color: '#007AFF' },
  { id: 'alto', label: 'Alto', icon: 'diamond', color: '#FF9500' },
  { id: 'premium', label: 'Premium', icon: 'star', color: '#FFD700' },
];

const EditPreferencesScreen: React.FC<EditPreferencesScreenProps> = ({ navigation }) => {
  const { profile, updateProfile } = useAuthStore();
  const [selectedInterests, setSelectedInterests] = useState<TouristInterest[]>(
    profile?.interests || []
  );
  const [selectedBudget, setSelectedBudget] = useState<BudgetLevel>(
    profile?.preferred_budget || 'medio'
  );
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: TouristInterest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos un interés');
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile({
        interests: selectedInterests,
        preferred_budget: selectedBudget,
      });
      Alert.alert(
        'Éxito',
        'Tus preferencias han sido actualizadas',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron guardar las preferencias');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Preferencias</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Intereses</Text>
          <Text style={styles.sectionSubtitle}>
            Selecciona los temas que más te interesan
          </Text>

          <View style={styles.interestsContainer}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestChip,
                    isSelected && styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(interest.id)}
                >
                  <Icon
                    name={interest.icon}
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.interestChipText,
                      isSelected && styles.interestChipTextSelected,
                    ]}
                  >
                    {interest.label}
                  </Text>
                  {isSelected && (
                    <Icon name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Budget Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presupuesto Preferido</Text>
          <Text style={styles.sectionSubtitle}>
            Elige tu rango de presupuesto habitual
          </Text>

          <View style={styles.budgetsContainer}>
            {BUDGETS.map((budget) => {
              const isSelected = selectedBudget === budget.id;
              return (
                <TouchableOpacity
                  key={budget.id}
                  style={[
                    styles.budgetCard,
                    isSelected && styles.budgetCardSelected,
                  ]}
                  onPress={() => setSelectedBudget(budget.id)}
                >
                  <View
                    style={[
                      styles.budgetIconContainer,
                      isSelected && { backgroundColor: budget.color },
                    ]}
                  >
                    <Icon
                      name={budget.icon}
                      size={24}
                      color={isSelected ? '#FFFFFF' : budget.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.budgetLabel,
                      isSelected && styles.budgetLabelSelected,
                    ]}
                  >
                    {budget.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.budgetCheck}>
                      <Icon name="checkmark-circle" size={20} color={budget.color} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (isLoading || selectedInterests.length === 0) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isLoading || selectedInterests.length === 0}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  interestChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  interestChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  interestChipTextSelected: {
    color: '#FFFFFF',
  },
  budgetsContainer: {
    gap: 12,
  },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  budgetCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  budgetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  budgetLabelSelected: {
    color: '#007AFF',
  },
  budgetCheck: {
    marginLeft: 'auto',
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EditPreferencesScreen;
