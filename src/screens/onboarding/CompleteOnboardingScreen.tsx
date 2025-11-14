import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthStore } from '@store/useAuthStore';
import { TouristInterest, BudgetLevel } from 'types';

interface CompleteOnboardingScreenProps {
  navigation: any;
  route: any;
}

const CompleteOnboardingScreen: React.FC<CompleteOnboardingScreenProps> = ({
  navigation,
  route,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateProfile } = useAuthStore();
  const { interests, budget } = route.params as {
    interests: TouristInterest[];
    budget: BudgetLevel;
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      await updateProfile({
        interests,
        preferred_budget: budget,
        language: 'es',
      });

      // Reset navigation to Main screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar tu configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const getInterestLabel = (interest: TouristInterest): string => {
    const labels: Record<TouristInterest, string> = {
      gastronomia: 'Gastronomía',
      cultura: 'Cultura',
      naturaleza: 'Naturaleza',
      aventura: 'Aventura',
      vida_nocturna: 'Vida Nocturna',
      compras: 'Compras',
      historia: 'Historia',
      arte: 'Arte',
      deportes: 'Deportes',
      relax: 'Relax',
    };
    return labels[interest];
  };

  const getBudgetLabel = (budgetLevel: BudgetLevel): string => {
    const labels: Record<BudgetLevel, string> = {
      bajo: 'Económico',
      medio: 'Moderado',
      alto: 'Alto',
      premium: 'Premium',
    };
    return labels[budgetLevel];
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#007AFF', '#0051D5']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="checkmark-circle" size={80} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>¡Todo listo!</Text>
          <Text style={styles.subtitle}>
            Hemos configurado tu perfil con tus preferencias
          </Text>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Icon name="heart" size={24} color="#007AFF" />
                <Text style={styles.summaryTitle}>Tus Intereses</Text>
              </View>
              <View style={styles.tagsContainer}>
                {interests.map((interest) => (
                  <View key={interest} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {getInterestLabel(interest)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Icon name="wallet" size={24} color="#007AFF" />
                <Text style={styles.summaryTitle}>Presupuesto</Text>
              </View>
              <View style={styles.budgetBadge}>
                <Text style={styles.budgetBadgeText}>
                  {getBudgetLabel(budget)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Icon name="information-circle" size={20} color="#FFFFFF" />
            <Text style={styles.infoText}>
              Puedes cambiar estas preferencias en cualquier momento desde tu perfil
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Comenzar a explorar</Text>
                <Icon name="arrow-forward" size={20} color="#007AFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 40,
    lineHeight: 24,
  },
  summaryContainer: {
    gap: 16,
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  budgetBadge: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  budgetBadgeText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  footer: {
    padding: 32,
    paddingBottom: 48,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default CompleteOnboardingScreen;
