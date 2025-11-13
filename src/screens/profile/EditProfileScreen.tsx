import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '@store/useAuthStore';
import { TouristInterest, BudgetLevel } from 'types';
import { Ionicons as Icon } from '@expo/vector-icons';

const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { profile, updateProfile } = useAuthStore();
  const [selectedInterests, setSelectedInterests] = useState<TouristInterest[]>(
    profile?.interests || []
  );
  const [selectedBudget, setSelectedBudget] = useState<BudgetLevel>(
    profile?.preferred_budget || 'medio'
  );

  const interests: { id: TouristInterest; label: string; icon: string }[] = [
    { id: 'gastronomia', label: 'Gastronomía', icon: 'restaurant' },
    { id: 'cultura', label: 'Cultura', icon: 'business' },
    { id: 'naturaleza', label: 'Naturaleza', icon: 'leaf' },
    { id: 'aventura', label: 'Aventura', icon: 'bicycle' },
    { id: 'vida_nocturna', label: 'Vida Nocturna', icon: 'beer' },
    { id: 'compras', label: 'Compras', icon: 'cart' },
    { id: 'historia', label: 'Historia', icon: 'book' },
    { id: 'arte', label: 'Arte', icon: 'color-palette' },
    { id: 'deportes', label: 'Deportes', icon: 'football' },
    { id: 'relax', label: 'Relax', icon: 'cafe' },
  ];

  const budgetLevels: { id: BudgetLevel; label: string; description: string }[] = [
    { id: 'bajo', label: 'Económico', description: 'Opciones económicas' },
    { id: 'medio', label: 'Moderado', description: 'Buen equilibrio calidad-precio' },
    { id: 'alto', label: 'Premium', description: 'Experiencias de alta calidad' },
    { id: 'premium', label: 'Lujo', description: 'Lo mejor sin límites' },
  ];

  const toggleInterest = (interest: TouristInterest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        interests: selectedInterests,
        preferred_budget: selectedBudget,
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intereses</Text>
          <Text style={styles.sectionSubtitle}>
            Selecciona tus intereses para recibir mejores recomendaciones
          </Text>

          <View style={styles.interestsGrid}>
            {interests.map(interest => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <TouchableOpacity
                  key={interest.id}
                  style={[styles.interestCard, isSelected && styles.interestCardSelected]}
                  onPress={() => toggleInterest(interest.id)}
                >
                  <Icon
                    name={interest.icon as any}
                    size={28}
                    color={isSelected ? '#FFFFFF' : '#007AFF'}
                  />
                  <Text style={[styles.interestLabel, isSelected && styles.interestLabelSelected]}>
                    {interest.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presupuesto Preferido</Text>
          <Text style={styles.sectionSubtitle}>
            Define tu rango de presupuesto habitual
          </Text>

          {budgetLevels.map(budget => {
            const isSelected = selectedBudget === budget.id;
            return (
              <TouchableOpacity
                key={budget.id}
                style={[styles.budgetOption, isSelected && styles.budgetOptionSelected]}
                onPress={() => setSelectedBudget(budget.id)}
              >
                <View style={styles.budgetInfo}>
                  <Text style={[styles.budgetLabel, isSelected && styles.budgetLabelSelected]}>
                    {budget.label}
                  </Text>
                  <Text style={[styles.budgetDescription, isSelected && styles.budgetDescriptionSelected]}>
                    {budget.description}
                  </Text>
                </View>
                {isSelected && <Icon name="checkmark-circle" size={24} color="#007AFF" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    marginBottom: 16,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  interestCardSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  interestLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  interestLabelSelected: {
    color: '#FFFFFF',
  },
  budgetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  budgetOptionSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  budgetInfo: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  budgetLabelSelected: {
    color: '#007AFF',
  },
  budgetDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  budgetDescriptionSelected: {
    color: '#007AFF',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EditProfileScreen;
