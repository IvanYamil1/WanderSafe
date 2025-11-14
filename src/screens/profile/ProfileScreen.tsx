import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@store/useAuthStore';
import { useFavoritesStore } from '@store/useFavoritesStore';
import { DatabaseService } from '@services/supabase/database';
import { Ionicons as Icon } from '@expo/vector-icons';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, profile, signOut } = useAuthStore();
  const { favoritePlaces } = useFavoritesStore();
  const [stats, setStats] = useState({
    totalFavorites: 0,
    totalVisits: 0,
    categoriesExplored: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user, favoritePlaces]);

  const loadStats = async () => {
    if (!user) return;

    setIsLoadingStats(true);
    try {
      // Get visit history
      const visits = await DatabaseService.getVisitHistory(user.id);

      // Calculate unique categories explored
      const categories = new Set(favoritePlaces.map(p => p.category));

      setStats({
        totalFavorites: favoritePlaces.length,
        totalVisits: visits.length,
        categoriesExplored: categories.size,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleEditPreferences = () => {
    navigation.navigate('EditPreferences');
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notificaciones',
      'Administra tus preferencias de notificaciones',
      [
        { text: 'Activar todas', onPress: () => console.log('Activar notificaciones') },
        { text: 'Desactivar todas', onPress: () => console.log('Desactivar notificaciones') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert(
      'Idioma',
      'Selecciona tu idioma preferido',
      [
        { text: 'Español', onPress: () => console.log('Español seleccionado') },
        { text: 'English', onPress: () => console.log('English selected') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleLocation = () => {
    Alert.alert(
      'Permisos de Ubicación',
      'La app necesita acceso a tu ubicación para ofrecerte recomendaciones personalizadas basadas en tu ubicación actual.',
      [
        { text: 'Abrir Configuración', onPress: () => console.log('Abrir configuración') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacidad',
      'Configuración de privacidad y datos personales',
      [
        {
          text: 'Política de Privacidad',
          onPress: () => console.log('Ver política de privacidad'),
        },
        {
          text: 'Términos de Uso',
          onPress: () => console.log('Ver términos de uso'),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Ayuda',
      '¿Necesitas ayuda?',
      [
        { text: 'Preguntas Frecuentes', onPress: () => console.log('Ver FAQ') },
        { text: 'Contactar Soporte', onPress: () => console.log('Contactar soporte') },
        { text: 'Tutorial', onPress: () => console.log('Ver tutorial') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Acerca de WanderSafe',
      'WanderSafe - Tu compañero de viaje inteligente\n\nVersión: 1.0.0\n\nDesarrollado para ayudarte a descubrir los mejores lugares según tus preferencias y mantenerte seguro durante tus aventuras.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.name}>{profile?.full_name || user?.email || 'Usuario'}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Icon name="create-outline" size={18} color="#007AFF" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics Section */}
      <View style={styles.statsSection}>
        {isLoadingStats ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate('Favorites')}
            >
              <Icon name="heart" size={24} color="#FF3B30" />
              <Text style={styles.statValue}>{stats.totalFavorites}</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </TouchableOpacity>

            <View style={styles.statCard}>
              <Icon name="location" size={24} color="#34C759" />
              <Text style={styles.statValue}>{stats.totalVisits}</Text>
              <Text style={styles.statLabel}>Visitados</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="grid" size={24} color="#007AFF" />
              <Text style={styles.statValue}>{stats.categoriesExplored}</Text>
              <Text style={styles.statLabel}>Categorías</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
            <Icon name="person-outline" size={24} color="#007AFF" />
            <Text style={styles.menuText}>Editar Perfil</Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
            <Icon name="notifications-outline" size={24} color="#FF9500" />
            <Text style={styles.menuText}>Notificaciones</Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLanguage}>
            <Icon name="globe-outline" size={24} color="#007AFF" />
            <Text style={styles.menuText}>Idioma</Text>
            <Text style={styles.menuValue}>Español</Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLocation}>
            <Icon name="location-outline" size={24} color="#34C759" />
            <Text style={styles.menuText}>Ubicación</Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
            <Icon name="shield-checkmark-outline" size={24} color="#5856D6" />
            <Text style={styles.menuText}>Privacidad</Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleEditPreferences}>
            <Icon name="heart-outline" size={24} color="#FF3B30" />
            <Text style={styles.menuText}>
              Intereses ({profile?.interests?.length || 0})
            </Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleEditPreferences}>
            <Icon name="cash-outline" size={24} color="#34C759" />
            <Text style={styles.menuText}>
              Presupuesto: {profile?.preferred_budget || 'medio'}
            </Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="globe-outline" size={24} color="#007AFF" />
            <Text style={styles.menuText}>
              Idioma: {profile?.language === 'es' ? 'Español' : 'English'}
            </Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          {profile?.travel_style && (
            <TouchableOpacity style={styles.menuItem} onPress={handleEditPreferences}>
              <Icon name="people-outline" size={24} color="#FF9500" />
              <Text style={styles.menuText}>
                Estilo: {profile.travel_style}
              </Text>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}

          {profile?.activity_level && (
            <TouchableOpacity style={styles.menuItem} onPress={handleEditPreferences}>
              <Icon name="bicycle-outline" size={24} color="#5856D6" />
              <Text style={styles.menuText}>
                Actividad: {profile.activity_level}
              </Text>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}

          {profile?.dietary_preferences && profile.dietary_preferences.length > 0 && (
            <TouchableOpacity style={styles.menuItem} onPress={handleEditPreferences}>
              <Icon name="restaurant-outline" size={24} color="#34C759" />
              <Text style={styles.menuText}>
                Dieta: {profile.dietary_preferences.join(', ')}
              </Text>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}

          {profile?.preferred_times && profile.preferred_times.length > 0 && (
            <TouchableOpacity style={styles.menuItem} onPress={handleEditPreferences}>
              <Icon name="time-outline" size={24} color="#FF9500" />
              <Text style={styles.menuText}>
                Horarios: {profile.preferred_times.join(', ')}
              </Text>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}

          {profile?.transportation_modes && profile.transportation_modes.length > 0 && (
            <TouchableOpacity style={styles.menuItem} onPress={handleEditPreferences}>
              <Icon name="car-outline" size={24} color="#007AFF" />
              <Text style={styles.menuText}>
                Transporte: {profile.transportation_modes.join(', ')}
              </Text>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}

          {profile?.accessibility_needs && profile.accessibility_needs.length > 0 && (
            <TouchableOpacity style={styles.menuItem} onPress={handleEditPreferences}>
              <Icon name="accessibility-outline" size={24} color="#5AC8FA" />
              <Text style={styles.menuText}>
                Accesibilidad: {profile.accessibility_needs.join(', ')}
              </Text>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
            <Icon name="help-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.menuText}>Ayuda</Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
            <Icon name="information-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.menuText}>Acerca de</Text>
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versión 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F2F2F7',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  menuValue: {
    fontSize: 15,
    color: '#8E8E93',
    marginRight: 8,
  },
  signOutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 32,
  },
});

export default ProfileScreen;
