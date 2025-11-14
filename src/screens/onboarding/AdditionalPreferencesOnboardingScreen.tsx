import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthStore } from '@store/useAuthStore';
import {
  DietaryPreference,
  PreferredTime,
  TransportMode,
  AccessibilityNeed,
} from 'types';

interface AdditionalPreferencesOnboardingScreenProps {
  navigation: any;
  route: any;
}

interface PreferenceOption<T> {
  id: T;
  label: string;
  icon: keyof typeof Icon.glyphMap;
  color: string;
}

const DIETARY_PREFERENCES: PreferenceOption<DietaryPreference>[] = [
  { id: 'vegetariano', label: 'Vegetariano', icon: 'leaf', color: '#34C759' },
  { id: 'vegano', label: 'Vegano', icon: 'nutrition', color: '#30D158' },
  { id: 'sin_gluten', label: 'Sin Gluten', icon: 'medical', color: '#FF9500' },
  { id: 'halal', label: 'Halal', icon: 'moon', color: '#5856D6' },
  { id: 'kosher', label: 'Kosher', icon: 'star', color: '#007AFF' },
  { id: 'sin_lactosa', label: 'Sin Lactosa', icon: 'water', color: '#5AC8FA' },
  { id: 'ninguna', label: 'Ninguna', icon: 'close-circle', color: '#8E8E93' },
];

const PREFERRED_TIMES: PreferenceOption<PreferredTime>[] = [
  { id: 'mañana', label: 'Mañana (6am-12pm)', icon: 'sunny', color: '#FF9500' },
  { id: 'tarde', label: 'Tarde (12pm-6pm)', icon: 'partly-sunny', color: '#FFCC00' },
  { id: 'noche', label: 'Noche (6pm-12am)', icon: 'moon', color: '#5856D6' },
  { id: 'madrugada', label: 'Madrugada (12am-6am)', icon: 'moon-outline', color: '#1C1C1E' },
];

const TRANSPORT_MODES: PreferenceOption<TransportMode>[] = [
  { id: 'caminando', label: 'Caminando', icon: 'walk', color: '#34C759' },
  { id: 'bicicleta', label: 'Bicicleta', icon: 'bicycle', color: '#FF9500' },
  { id: 'transporte_publico', label: 'Transporte Público', icon: 'bus', color: '#007AFF' },
  { id: 'auto', label: 'Auto Propio', icon: 'car', color: '#5856D6' },
  { id: 'taxi', label: 'Taxi/Uber', icon: 'car-sport', color: '#1C1C1E' },
];

const ACCESSIBILITY_NEEDS: PreferenceOption<AccessibilityNeed>[] = [
  { id: 'silla_ruedas', label: 'Silla de Ruedas', icon: 'accessibility', color: '#007AFF' },
  { id: 'movilidad_reducida', label: 'Movilidad Reducida', icon: 'walk', color: '#FF9500' },
  { id: 'visual', label: 'Visual', icon: 'eye-off', color: '#5856D6' },
  { id: 'auditiva', label: 'Auditiva', icon: 'ear', color: '#FF3B30' },
  { id: 'ninguna', label: 'Ninguna', icon: 'checkmark-circle', color: '#34C759' },
];

const AdditionalPreferencesOnboardingScreen: React.FC<
  AdditionalPreferencesOnboardingScreenProps
> = ({ navigation, route }) => {
  const { interests, budget, travelStyle, activityLevel } = route.params || {};
  const { updateProfile, loadUser } = useAuthStore();

  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<PreferredTime[]>([]);
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<AccessibilityNeed[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelection = <T,>(
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

  const handleFinish = async () => {
    try {
      setIsLoading(true);

      await updateProfile({
        interests: interests || [],
        preferred_budget: budget || 'medio',
        language: 'es' as const,
        travel_style: travelStyle,
        activity_level: activityLevel,
        dietary_preferences: dietaryPreferences,
        preferred_times: preferredTimes,
        transportation_modes: transportModes,
        accessibility_needs: accessibilityNeeds,
        max_distance: 10, // default 10km
      });

      // Reload user to trigger AppNavigator re-evaluation
      // AppNavigator will detect the profile is complete and navigate to Main
      await loadUser();

      setIsLoading(false);
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudieron guardar tus preferencias. Por favor, intenta de nuevo.'
      );
      setIsLoading(false);
    }
  };

  const renderPreferenceSection = <T,>(
    title: string,
    subtitle: string,
    options: PreferenceOption<T>[],
    selectedItems: T[],
    onToggle: (item: T) => void
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => {
          const isSelected = selectedItems.includes(option.id);
          return (
            <TouchableOpacity
              key={String(option.id)}
              style={[
                styles.optionChip,
                isSelected && {
                  borderColor: option.color,
                  backgroundColor: `${option.color}20`,
                },
              ]}
              onPress={() => onToggle(option.id)}
            >
              <Icon
                name={option.icon}
                size={20}
                color={isSelected ? option.color : '#8E8E93'}
              />
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && { color: option.color },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Preferencias Adicionales</Text>
        <Text style={styles.subtitle}>
          Personaliza aún más tu experiencia (puedes seleccionar varias opciones)
        </Text>

        {renderPreferenceSection(
          'Preferencias Dietéticas',
          'Selecciona tus restricciones alimentarias',
          DIETARY_PREFERENCES,
          dietaryPreferences,
          (item) =>
            toggleSelection(
              item,
              dietaryPreferences,
              setDietaryPreferences,
              'ninguna' as DietaryPreference
            )
        )}

        {renderPreferenceSection(
          'Horarios Preferidos',
          '¿Cuándo prefieres realizar actividades?',
          PREFERRED_TIMES,
          preferredTimes,
          (item) =>
            toggleSelection(
              item,
              preferredTimes,
              setPreferredTimes,
              '' as PreferredTime
            )
        )}

        {renderPreferenceSection(
          'Modos de Transporte',
          '¿Cómo te gusta moverte?',
          TRANSPORT_MODES,
          transportModes,
          (item) =>
            toggleSelection(
              item,
              transportModes,
              setTransportModes,
              '' as TransportMode
            )
        )}

        {renderPreferenceSection(
          'Necesidades de Accesibilidad',
          'Ayúdanos a sugerir lugares accesibles',
          ACCESSIBILITY_NEEDS,
          accessibilityNeeds,
          (item) =>
            toggleSelection(
              item,
              accessibilityNeeds,
              setAccessibilityNeeds,
              'ninguna' as AccessibilityNeed
            )
        )}

        <View style={styles.skipInfo}>
          <Icon name="information-circle" size={20} color="#8E8E93" />
          <Text style={styles.skipText}>
            Puedes cambiar estas preferencias en cualquier momento desde tu perfil
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Finalizar</Text>
              <Icon name="checkmark" size={20} color="#FFFFFF" />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: '#34C759',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 32,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 18,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  skipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 16,
  },
  skipText: {
    flex: 1,
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdditionalPreferencesOnboardingScreen;
