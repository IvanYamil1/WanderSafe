import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '@store/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Button, Input, Text } from '@/components/ui';
import { colors, spacing, radius, typography, shadows } from '@/theme';

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión con Google');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={colors.special.gradient.primary}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Icon name="compass" size={80} color={colors.neutral[0]} />
          </View>
          <Text variant="displaySmall" color="inverse" style={styles.title}>
            WanderSafe
          </Text>
          <Text variant="body" color="inverse" style={styles.subtitle}>
            Tu asistente turístico inteligente
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text variant="h2" style={styles.welcomeText}>
            Bienvenido
          </Text>
          <Text variant="body" color="secondary" style={styles.welcomeSubtext}>
            Inicia sesión para continuar
          </Text>

          <Input
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            editable={!isLoading}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon="lock-closed-outline"
            rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            editable={!isLoading}
          />

          <Button
            variant="primary"
            size="large"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            icon="log-in-outline"
          >
            Iniciar Sesión
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text variant="caption" color="tertiary" style={styles.dividerText}>
              o continuar con
            </Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            variant="outline"
            size="large"
            onPress={handleGoogleLogin}
            disabled={isLoading}
            fullWidth
            icon="logo-google"
          >
            Continuar con Google
          </Button>

          <View style={styles.registerContainer}>
            <Text variant="body" color="secondary">
              ¿No tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text variant="body" color="link" bold>
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: spacing[16],
    paddingBottom: spacing[10],
    alignItems: 'center',
    borderBottomLeftRadius: radius['3xl'],
    borderBottomRightRadius: radius['3xl'],
    ...shadows.lg,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    marginTop: spacing[4],
  },
  subtitle: {
    opacity: 0.95,
    marginTop: spacing[2],
  },
  formContainer: {
    flex: 1,
    padding: spacing[6],
    paddingTop: spacing[8],
  },
  welcomeText: {
    marginBottom: spacing[2],
  },
  welcomeSubtext: {
    marginBottom: spacing[8],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    paddingHorizontal: spacing[4],
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[6],
  },
});

export default LoginScreen;
