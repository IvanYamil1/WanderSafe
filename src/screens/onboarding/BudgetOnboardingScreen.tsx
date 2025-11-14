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
import { BudgetLevel } from 'types';

interface BudgetOnboardingScreenProps {
  navigation: any;
  route: any;
}

interface BudgetOption {
  id: BudgetLevel;
  label: string;
  icon: keyof typeof Icon.glyphMap;
  description: string;
  priceRange: string;
  color: string;
}

const BUDGETS: BudgetOption[] = [
  {
    id: 'bajo',
    label: 'Económico',
    icon: 'wallet',
    description: 'Opciones accesibles y económicas',
    priceRange: '$',
    color: '#34C759',
  },
  {
    id: 'medio',
    label: 'Moderado',
    icon: 'card',
    description: 'Equilibrio entre calidad y precio',
    priceRange: '$$',
    color: '#007AFF',
  },
  {
    id: 'alto',
    label: 'Alto',
    icon: 'diamond',
    description: 'Experiencias de alta calidad',
    priceRange: '$$$',
    color: '#FF9500',
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: 'star',
    description: 'Lo mejor sin límites',
    priceRange: '$$$$',
    color: '#FFD700',
  },
];

const BudgetOnboardingScreen: React.FC<BudgetOnboardingScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedBudget, setSelectedBudget] = useState<BudgetLevel | null>(null);
  const { interests } = route.params || { interests: [] };

  const handleContinue = () => {
    if (selectedBudget) {
      navigation.navigate('CompleteOnboarding', {
        interests,
        budget: selectedBudget,
      });
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
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>¿Cuál es tu presupuesto?</Text>
        <Text style={styles.subtitle}>
          Selecciona tu rango de presupuesto preferido para tus actividades
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
                <View style={styles.budgetHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      isSelected && { backgroundColor: budget.color },
                    ]}
                  >
                    <Icon
                      name={budget.icon}
                      size={32}
                      color={isSelected ? '#FFFFFF' : budget.color}
                    />
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Icon name="checkmark-circle" size={28} color="#34C759" />
                    </View>
                  )}
                </View>

                <View style={styles.budgetContent}>
                  <Text
                    style={[
                      styles.budgetLabel,
                      isSelected && styles.budgetLabelSelected,
                    ]}
                  >
                    {budget.label}
                  </Text>
                  <Text style={styles.priceRange}>{budget.priceRange}</Text>
                  <Text style={styles.budgetDescription}>
                    {budget.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.selectionIndicator,
                    isSelected && {
                      backgroundColor: budget.color,
                      borderColor: budget.color,
                    },
                  ]}
                >
                  {isSelected && (
                    <Icon name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Icon name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            No te preocupes, siempre podrás ver opciones de todos los rangos de precio. Esta preferencia solo ayuda a priorizar las recomendaciones.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            !selectedBudget && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedBudget}
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
  budgetsContainer: {
    gap: 16,
    paddingBottom: 120,
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  budgetCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  budgetHeader: {
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  budgetContent: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  budgetLabelSelected: {
    color: '#007AFF',
  },
  priceRange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 4,
  },
  budgetDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  selectionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#007AFF',
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

export default BudgetOnboardingScreen;
