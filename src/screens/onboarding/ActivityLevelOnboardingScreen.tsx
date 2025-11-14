import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { ActivityLevel } from 'types';

interface ActivityLevelOnboardingScreenProps {
  navigation: any;
  route: any;
}

interface ActivityOption {
  id: ActivityLevel;
  label: string;
  icon: keyof typeof Icon.glyphMap;
  description: string;
  examples: string;
  color: string;
}

const ACTIVITY_LEVELS: ActivityOption[] = [
  {
    id: 'relajado',
    label: 'Relajado',
    icon: 'cafe',
    description: 'Prefiero actividades tranquilas y sin prisa',
    examples: 'Museos, cafés, parques, spas',
    color: '#5AC8FA',
  },
  {
    id: 'moderado',
    label: 'Moderado',
    icon: 'walk',
    description: 'Mezclo descanso con actividades ligeras',
    examples: 'Caminatas urbanas, compras, tours guiados',
    color: '#34C759',
  },
  {
    id: 'activo',
    label: 'Activo',
    icon: 'bicycle',
    description: 'Me gusta estar en movimiento la mayor parte del día',
    examples: 'Ciclismo, caminatas largas, deportes',
    color: '#FF9500',
  },
  {
    id: 'intenso',
    label: 'Intenso',
    icon: 'fitness',
    description: 'Busco experiencias físicamente demandantes',
    examples: 'Trekking, deportes extremos, aventuras',
    color: '#FF3B30',
  },
];

const ActivityLevelOnboardingScreen: React.FC<ActivityLevelOnboardingScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | null>(null);
  const { interests, budget, travelStyle } = route.params || {};

  const handleContinue = () => {
    if (selectedLevel) {
      navigation.navigate('AdditionalPreferencesOnboarding', {
        interests,
        budget,
        travelStyle,
        activityLevel: selectedLevel,
      });
    }
  };

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
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>¿Cuál es tu nivel de actividad?</Text>
        <Text style={styles.subtitle}>
          Esto nos ayuda a sugerir actividades acorde a tu energía
        </Text>

        <View style={styles.levelsContainer}>
          {ACTIVITY_LEVELS.map((level) => {
            const isSelected = selectedLevel === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  isSelected && {
                    borderColor: level.color,
                    backgroundColor: `${level.color}15`,
                  },
                ]}
                onPress={() => setSelectedLevel(level.id)}
              >
                <View style={styles.levelHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      isSelected && { backgroundColor: level.color },
                    ]}
                  >
                    <Icon
                      name={level.icon}
                      size={28}
                      color={isSelected ? '#FFFFFF' : level.color}
                    />
                  </View>
                  {isSelected && (
                    <Icon name="checkmark-circle" size={24} color={level.color} />
                  )}
                </View>

                <Text
                  style={[
                    styles.levelLabel,
                    isSelected && { color: level.color },
                  ]}
                >
                  {level.label}
                </Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
                <View style={styles.examplesBox}>
                  <Text style={styles.examplesLabel}>Ejemplos:</Text>
                  <Text style={styles.examplesText}>{level.examples}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            !selectedLevel && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedLevel}
        >
          <Text style={styles.buttonText}>Continuar</Text>
          <Icon name="arrow-forward" size={20} color="#FFFFFF" />
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
  levelsContainer: {
    gap: 16,
    paddingBottom: 120,
  },
  levelCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 12,
  },
  examplesBox: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  examplesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  examplesText: {
    fontSize: 13,
    color: '#1C1C1E',
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
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ActivityLevelOnboardingScreen;
