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
import {
  TouristInterest,
  BudgetLevel,
  TravelStyle,
  ActivityLevel,
  DietaryPreference,
  PreferredTime,
  TransportMode,
  AccessibilityNeed,
} from 'types';

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

const TRAVEL_STYLES: { id: TravelStyle; label: string; icon: keyof typeof Icon.glyphMap }[] = [
  { id: 'solo', label: 'Solo', icon: 'person' },
  { id: 'pareja', label: 'En Pareja', icon: 'heart' },
  { id: 'familia', label: 'En Familia', icon: 'home' },
  { id: 'amigos', label: 'Con Amigos', icon: 'people' },
  { id: 'grupo', label: 'Grupos Grandes', icon: 'business' },
];

const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; icon: keyof typeof Icon.glyphMap }[] = [
  { id: 'relajado', label: 'Relajado', icon: 'cafe' },
  { id: 'moderado', label: 'Moderado', icon: 'walk' },
  { id: 'activo', label: 'Activo', icon: 'bicycle' },
  { id: 'intenso', label: 'Intenso', icon: 'fitness' },
];

const DIETARY_PREFERENCES: { id: DietaryPreference; label: string; icon: keyof typeof Icon.glyphMap }[] = [
  { id: 'vegetariano', label: 'Vegetariano', icon: 'leaf' },
  { id: 'vegano', label: 'Vegano', icon: 'nutrition' },
  { id: 'sin_gluten', label: 'Sin Gluten', icon: 'medical' },
  { id: 'halal', label: 'Halal', icon: 'moon' },
  { id: 'kosher', label: 'Kosher', icon: 'star' },
  { id: 'sin_lactosa', label: 'Sin Lactosa', icon: 'water' },
  { id: 'ninguna', label: 'Ninguna', icon: 'close-circle' },
];

const PREFERRED_TIMES: { id: PreferredTime; label: string; icon: keyof typeof Icon.glyphMap }[] = [
  { id: 'mañana', label: 'Mañana', icon: 'sunny' },
  { id: 'tarde', label: 'Tarde', icon: 'partly-sunny' },
  { id: 'noche', label: 'Noche', icon: 'moon' },
  { id: 'madrugada', label: 'Madrugada', icon: 'moon-outline' },
];

const TRANSPORT_MODES: { id: TransportMode; label: string; icon: keyof typeof Icon.glyphMap }[] = [
  { id: 'caminando', label: 'Caminando', icon: 'walk' },
  { id: 'bicicleta', label: 'Bicicleta', icon: 'bicycle' },
  { id: 'transporte_publico', label: 'Transporte Público', icon: 'bus' },
  { id: 'auto', label: 'Auto Propio', icon: 'car' },
  { id: 'taxi', label: 'Taxi/Uber', icon: 'car-sport' },
];

const ACCESSIBILITY_NEEDS: { id: AccessibilityNeed; label: string; icon: keyof typeof Icon.glyphMap }[] = [
  { id: 'silla_ruedas', label: 'Silla de Ruedas', icon: 'accessibility' },
  { id: 'movilidad_reducida', label: 'Movilidad Reducida', icon: 'walk' },
  { id: 'visual', label: 'Visual', icon: 'eye-off' },
  { id: 'auditiva', label: 'Auditiva', icon: 'ear' },
  { id: 'ninguna', label: 'Ninguna', icon: 'checkmark-circle' },
];

const EditPreferencesScreen: React.FC<EditPreferencesScreenProps> = ({ navigation }) => {
  const { profile, updateProfile } = useAuthStore();
  const [selectedInterests, setSelectedInterests] = useState<TouristInterest[]>(
    profile?.interests || []
  );
  const [selectedBudget, setSelectedBudget] = useState<BudgetLevel>(
    profile?.preferred_budget || 'medio'
  );
  const [selectedTravelStyle, setSelectedTravelStyle] = useState<TravelStyle | undefined>(
    profile?.travel_style
  );
  const [selectedActivityLevel, setSelectedActivityLevel] = useState<ActivityLevel | undefined>(
    profile?.activity_level
  );
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState<DietaryPreference[]>(
    profile?.dietary_preferences || []
  );
  const [selectedPreferredTimes, setSelectedPreferredTimes] = useState<PreferredTime[]>(
    profile?.preferred_times || []
  );
  const [selectedTransportModes, setSelectedTransportModes] = useState<TransportMode[]>(
    profile?.transportation_modes || []
  );
  const [selectedAccessibilityNeeds, setSelectedAccessibilityNeeds] = useState<AccessibilityNeed[]>(
    profile?.accessibility_needs || []
  );
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: TouristInterest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleMultiSelect = <T,>(
    item: T,
    currentList: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    noneValue: T
  ) => {
    if (item === noneValue) {
      setList([item]);
    } else {
      const filtered = currentList.filter((i) => i !== noneValue);
      if (currentList.includes(item)) {
        const newList = filtered.filter((i) => i !== item);
        setList(newList.length === 0 ? [noneValue] : newList);
      } else {
        setList([...filtered, item]);
      }
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
        travel_style: selectedTravelStyle,
        activity_level: selectedActivityLevel,
        dietary_preferences: selectedDietaryPreferences,
        preferred_times: selectedPreferredTimes,
        transportation_modes: selectedTransportModes,
        accessibility_needs: selectedAccessibilityNeeds,
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

        {/* Travel Style Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estilo de Viaje</Text>
          <Text style={styles.sectionSubtitle}>
            ¿Cómo prefieres viajar?
          </Text>

          <View style={styles.optionsContainer}>
            {TRAVEL_STYLES.map((style) => {
              const isSelected = selectedTravelStyle === style.id;
              return (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.optionChip,
                    isSelected && styles.optionChipSelected,
                  ]}
                  onPress={() => setSelectedTravelStyle(style.id)}
                >
                  <Icon
                    name={style.icon}
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && styles.optionChipTextSelected,
                    ]}
                  >
                    {style.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Activity Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nivel de Actividad</Text>
          <Text style={styles.sectionSubtitle}>
            ¿Cuál es tu nivel de energía preferido?
          </Text>

          <View style={styles.optionsContainer}>
            {ACTIVITY_LEVELS.map((level) => {
              const isSelected = selectedActivityLevel === level.id;
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.optionChip,
                    isSelected && styles.optionChipSelected,
                  ]}
                  onPress={() => setSelectedActivityLevel(level.id)}
                >
                  <Icon
                    name={level.icon}
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && styles.optionChipTextSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dietary Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias Dietéticas</Text>
          <Text style={styles.sectionSubtitle}>
            Selecciona tus restricciones alimentarias
          </Text>

          <View style={styles.optionsContainer}>
            {DIETARY_PREFERENCES.map((pref) => {
              const isSelected = selectedDietaryPreferences.includes(pref.id);
              return (
                <TouchableOpacity
                  key={pref.id}
                  style={[
                    styles.optionChip,
                    isSelected && styles.optionChipSelected,
                  ]}
                  onPress={() =>
                    toggleMultiSelect(
                      pref.id,
                      selectedDietaryPreferences,
                      setSelectedDietaryPreferences,
                      'ninguna' as DietaryPreference
                    )
                  }
                >
                  <Icon
                    name={pref.icon}
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && styles.optionChipTextSelected,
                    ]}
                  >
                    {pref.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferred Times Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horarios Preferidos</Text>
          <Text style={styles.sectionSubtitle}>
            ¿Cuándo prefieres realizar actividades?
          </Text>

          <View style={styles.optionsContainer}>
            {PREFERRED_TIMES.map((time) => {
              const isSelected = selectedPreferredTimes.includes(time.id);
              return (
                <TouchableOpacity
                  key={time.id}
                  style={[
                    styles.optionChip,
                    isSelected && styles.optionChipSelected,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedPreferredTimes(
                        selectedPreferredTimes.filter((t) => t !== time.id)
                      );
                    } else {
                      setSelectedPreferredTimes([...selectedPreferredTimes, time.id]);
                    }
                  }}
                >
                  <Icon
                    name={time.icon}
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && styles.optionChipTextSelected,
                    ]}
                  >
                    {time.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Transport Modes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modos de Transporte</Text>
          <Text style={styles.sectionSubtitle}>
            ¿Cómo te gusta moverte?
          </Text>

          <View style={styles.optionsContainer}>
            {TRANSPORT_MODES.map((mode) => {
              const isSelected = selectedTransportModes.includes(mode.id);
              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.optionChip,
                    isSelected && styles.optionChipSelected,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedTransportModes(
                        selectedTransportModes.filter((m) => m !== mode.id)
                      );
                    } else {
                      setSelectedTransportModes([...selectedTransportModes, mode.id]);
                    }
                  }}
                >
                  <Icon
                    name={mode.icon}
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && styles.optionChipTextSelected,
                    ]}
                  >
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Accessibility Needs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Necesidades de Accesibilidad</Text>
          <Text style={styles.sectionSubtitle}>
            Ayúdanos a sugerir lugares accesibles
          </Text>

          <View style={styles.optionsContainer}>
            {ACCESSIBILITY_NEEDS.map((need) => {
              const isSelected = selectedAccessibilityNeeds.includes(need.id);
              return (
                <TouchableOpacity
                  key={need.id}
                  style={[
                    styles.optionChip,
                    isSelected && styles.optionChipSelected,
                  ]}
                  onPress={() =>
                    toggleMultiSelect(
                      need.id,
                      selectedAccessibilityNeeds,
                      setSelectedAccessibilityNeeds,
                      'ninguna' as AccessibilityNeed
                    )
                  }
                >
                  <Icon
                    name={need.icon}
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.optionChipText,
                      isSelected && styles.optionChipTextSelected,
                    ]}
                  >
                    {need.label}
                  </Text>
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
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
  optionChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  optionChipTextSelected: {
    color: '#FFFFFF',
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
