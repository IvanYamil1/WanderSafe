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
import { TravelStyle } from 'types';

interface TravelStyleOnboardingScreenProps {
  navigation: any;
  route: any;
}

interface TravelStyleOption {
  id: TravelStyle;
  label: string;
  icon: keyof typeof Icon.glyphMap;
  description: string;
  color: string;
}

const TRAVEL_STYLES: TravelStyleOption[] = [
  {
    id: 'solo',
    label: 'Solo',
    icon: 'person',
    description: 'Exploro el mundo por mi cuenta',
    color: '#007AFF',
  },
  {
    id: 'pareja',
    label: 'En Pareja',
    icon: 'heart',
    description: 'Viajo con mi pareja',
    color: '#FF3B30',
  },
  {
    id: 'familia',
    label: 'En Familia',
    icon: 'home',
    description: 'Con niños y/o familia',
    color: '#34C759',
  },
  {
    id: 'amigos',
    label: 'Con Amigos',
    icon: 'people',
    description: 'En grupo de amigos',
    color: '#FF9500',
  },
  {
    id: 'grupo',
    label: 'Grupos Grandes',
    icon: 'business',
    description: 'Tours o grupos organizados',
    color: '#5856D6',
  },
];

const TravelStyleOnboardingScreen: React.FC<TravelStyleOnboardingScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<TravelStyle | null>(null);
  const { interests, budget } = route.params || { interests: [], budget: 'medio' };

  const handleContinue = () => {
    if (selectedStyle) {
      navigation.navigate('ActivityLevelOnboarding', {
        interests,
        budget,
        travelStyle: selectedStyle,
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
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>¿Cómo prefieres viajar?</Text>
        <Text style={styles.subtitle}>
          Esto nos ayuda a personalizar las recomendaciones según tu estilo
        </Text>

        <View style={styles.stylesContainer}>
          {TRAVEL_STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  isSelected && {
                    borderColor: style.color,
                    backgroundColor: `${style.color}10`,
                  },
                ]}
                onPress={() => setSelectedStyle(style.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isSelected && { backgroundColor: style.color },
                  ]}
                >
                  <Icon
                    name={style.icon}
                    size={32}
                    color={isSelected ? '#FFFFFF' : style.color}
                  />
                </View>
                <View style={styles.styleContent}>
                  <Text
                    style={[
                      styles.styleLabel,
                      isSelected && { color: style.color },
                    ]}
                  >
                    {style.label}
                  </Text>
                  <Text style={styles.styleDescription}>{style.description}</Text>
                </View>
                {isSelected && (
                  <Icon name="checkmark-circle" size={28} color={style.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            !selectedStyle && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedStyle}
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
  stylesContainer: {
    gap: 16,
    paddingBottom: 120,
  },
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleContent: {
    flex: 1,
  },
  styleLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  styleDescription: {
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

export default TravelStyleOnboardingScreen;
