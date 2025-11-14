import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';

interface WelcomeOnboardingScreenProps {
  navigation: any;
}

const WelcomeOnboardingScreen: React.FC<WelcomeOnboardingScreenProps> = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#007AFF', '#0051D5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../../WanderSafe_Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Bienvenido a WanderSafe</Text>
          <Text style={styles.subtitle}>
            Tu asistente inteligente de turismo
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Icon name="location" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>
                Descubre lugares increíbles cerca de ti
              </Text>
            </View>

            <View style={styles.feature}>
              <Icon name="shield-checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>
                Información de seguridad en tiempo real
              </Text>
            </View>

            <View style={styles.feature}>
              <Icon name="sparkles" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>
                Recomendaciones personalizadas para ti
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Responde unas preguntas para personalizar tu experiencia
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('InterestsOnboarding')}
          >
            <Text style={styles.buttonText}>Comenzar</Text>
            <Icon name="arrow-forward" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
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
    marginBottom: 48,
  },
  featuresContainer: {
    width: '100%',
    gap: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  footer: {
    padding: 32,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
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
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default WelcomeOnboardingScreen;
