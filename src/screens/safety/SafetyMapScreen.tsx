import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { DatabaseService } from '@services/supabase/database';
import { useLocationStore } from '@store/useLocationStore';
import { SafetyZone } from 'types';
import { Ionicons as Icon } from '@expo/vector-icons';

const SafetyMapScreen: React.FC = () => {
  const [safetyZones, setSafetyZones] = useState<SafetyZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentLocation } = useLocationStore();

  useEffect(() => {
    loadSafetyZones();
  }, []);

  const loadSafetyZones = async () => {
    try {
      const zones = await DatabaseService.getSafetyZones();
      setSafetyZones(zones);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los datos de seguridad');
    } finally {
      setIsLoading(false);
    }
  };

  const getSafetyColor = (level: string): string => {
    const colors: Record<string, string> = {
      safe: '#34C759',
      moderate: '#FFB800',
      caution: '#FF9500',
      danger: '#FF3B30',
    };
    return colors[level] || '#8E8E93';
  };

  const getSafetyLabel = (level: string): string => {
    const labels: Record<string, string> = {
      safe: 'Seguro',
      moderate: 'Moderado',
      caution: 'Precaución',
      danger: 'Peligroso',
    };
    return labels[level] || 'Desconocido';
  };

  const initialRegion = currentLocation ? {
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    latitude: -12.046374, // Lima, Peru default
    longitude: -77.042793,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {safetyZones.map((zone) => (
          <Circle
            key={zone.id}
            center={{
              latitude: zone.latitude,
              longitude: zone.longitude,
            }}
            radius={zone.radius}
            fillColor={`${getSafetyColor(zone.safety_level)}33`}
            strokeColor={getSafetyColor(zone.safety_level)}
            strokeWidth={2}
          />
        ))}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Niveles de Seguridad</Text>
        <View style={styles.legendItems}>
          {['safe', 'moderate', 'caution', 'danger'].map(level => (
            <View key={level} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: getSafetyColor(level) },
                ]}
              />
              <Text style={styles.legendLabel}>{getSafetyLabel(level)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Icon name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            Los datos de seguridad se actualizan trimestralmente con información
            oficial de autoridades locales
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  map: {
    flex: 1,
  },
  legend: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#007AFF',
    lineHeight: 16,
  },
});

export default SafetyMapScreen;
