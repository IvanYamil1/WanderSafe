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
import { TouristInterest } from 'types';

interface InterestsOnboardingScreenProps {
  navigation: any;
  route: any;
}

interface InterestOption {
  id: TouristInterest;
  label: string;
  icon: keyof typeof Icon.glyphMap;
  description: string;
}

const INTERESTS: InterestOption[] = [
  {
    id: 'gastronomia',
    label: 'Gastronomía',
    icon: 'restaurant',
    description: 'Restaurantes y experiencias culinarias',
  },
  {
    id: 'cultura',
    label: 'Cultura',
    icon: 'color-palette',
    description: 'Museos, teatro y eventos culturales',
  },
  {
    id: 'naturaleza',
    label: 'Naturaleza',
    icon: 'leaf',
    description: 'Parques, jardines y espacios naturales',
  },
  {
    id: 'aventura',
    label: 'Aventura',
    icon: 'bicycle',
    description: 'Deportes extremos y actividades al aire libre',
  },
  {
    id: 'vida_nocturna',
    label: 'Vida Nocturna',
    icon: 'moon',
    description: 'Bares, discotecas y entretenimiento nocturno',
  },
  {
    id: 'compras',
    label: 'Compras',
    icon: 'bag-handle',
    description: 'Centros comerciales y tiendas especializadas',
  },
  {
    id: 'historia',
    label: 'Historia',
    icon: 'book',
    description: 'Sitios históricos y monumentos',
  },
  {
    id: 'arte',
    label: 'Arte',
    icon: 'brush',
    description: 'Galerías, exposiciones y arte urbano',
  },
  {
    id: 'deportes',
    label: 'Deportes',
    icon: 'football',
    description: 'Eventos deportivos y actividades físicas',
  },
  {
    id: 'relax',
    label: 'Relax',
    icon: 'flower',
    description: 'Spas, yoga y experiencias de bienestar',
  },
];

const InterestsOnboardingScreen: React.FC<InterestsOnboardingScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedInterests, setSelectedInterests] = useState<TouristInterest[]>([]);

  const toggleInterest = (interest: TouristInterest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleContinue = () => {
    navigation.navigate('BudgetOnboarding', {
      interests: selectedInterests,
    });
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
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>¿Qué te interesa?</Text>
        <Text style={styles.subtitle}>
          Selecciona tus intereses para recibir recomendaciones personalizadas
        </Text>

        <View style={styles.interestsContainer}>
          {INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.interestCard,
                  isSelected && styles.interestCardSelected,
                ]}
                onPress={() => toggleInterest(interest.id)}
              >
                <View style={styles.interestHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      isSelected && styles.iconContainerSelected,
                    ]}
                  >
                    <Icon
                      name={interest.icon}
                      size={28}
                      color={isSelected ? '#FFFFFF' : '#007AFF'}
                    />
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Icon name="checkmark-circle" size={24} color="#34C759" />
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.interestLabel,
                    isSelected && styles.interestLabelSelected,
                  ]}
                >
                  {interest.label}
                </Text>
                <Text style={styles.interestDescription}>
                  {interest.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {selectedInterests.length} interés{selectedInterests.length !== 1 ? 'es' : ''} seleccionado{selectedInterests.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            selectedInterests.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedInterests.length === 0}
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
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 120,
  },
  interestCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  interestCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  interestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    marginTop: -4,
    marginRight: -4,
  },
  interestLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  interestLabelSelected: {
    color: '#007AFF',
  },
  interestDescription: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
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
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
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

export default InterestsOnboardingScreen;
