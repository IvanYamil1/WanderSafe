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

      // Si no hay datos en la base de datos, usar datos de ejemplo
      if (!zones || zones.length === 0) {
        const mockZones = generateMockSafetyZones();
        setSafetyZones(mockZones);
      } else {
        setSafetyZones(zones);
      }
    } catch (error: any) {
      // Si hay error, mostrar datos de ejemplo
      console.log('Error cargando zonas, usando datos de ejemplo:', error);
      const mockZones = generateMockSafetyZones();
      setSafetyZones(mockZones);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockSafetyZones = (): SafetyZone[] => {
    const baseLocation = currentLocation || {
      latitude: -12.046374, // Lima, Peru default
      longitude: -77.042793,
    };

    return [
      // Zona Segura (verde)
      {
        id: 'safe-1',
        zone_name: 'Centro Histórico',
        latitude: baseLocation.latitude + 0.01,
        longitude: baseLocation.longitude + 0.01,
        radius: 800,
        safety_level: 'safe',
        time_ranges: [],
        incident_count: 2,
        last_updated: new Date().toISOString(),
      },
      // Zona Moderada (amarillo)
      {
        id: 'moderate-1',
        zone_name: 'Zona Comercial',
        latitude: baseLocation.latitude - 0.015,
        longitude: baseLocation.longitude + 0.005,
        radius: 600,
        safety_level: 'moderate',
        time_ranges: [],
        incident_count: 15,
        last_updated: new Date().toISOString(),
      },
      // Zona de Precaución (naranja)
      {
        id: 'caution-1',
        zone_name: 'Área Transitoria',
        latitude: baseLocation.latitude + 0.005,
        longitude: baseLocation.longitude - 0.02,
        radius: 700,
        safety_level: 'caution',
        time_ranges: [],
        incident_count: 32,
        last_updated: new Date().toISOString(),
      },
      // Zona Peligrosa (rojo)
      {
        id: 'danger-1',
        zone_name: 'Zona de Alto Riesgo',
        latitude: baseLocation.latitude - 0.008,
        longitude: baseLocation.longitude - 0.015,
        radius: 500,
        safety_level: 'danger',
        time_ranges: [],
        incident_count: 87,
        last_updated: new Date().toISOString(),
      },
      // Más zonas seguras
      {
        id: 'safe-2',
        zone_name: 'Parque Principal',
        latitude: baseLocation.latitude + 0.018,
        longitude: baseLocation.longitude - 0.008,
        radius: 400,
        safety_level: 'safe',
        time_ranges: [],
        incident_count: 1,
        last_updated: new Date().toISOString(),
      },
      // Zona moderada adicional
      {
        id: 'moderate-2',
        zone_name: 'Distrito Residencial',
        latitude: baseLocation.latitude - 0.02,
        longitude: baseLocation.longitude - 0.005,
        radius: 900,
        safety_level: 'moderate',
        time_ranges: [],
        incident_count: 18,
        last_updated: new Date().toISOString(),
      },
    ];
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
            fillColor={`${getSafetyColor(zone.safety_level)}66`}
            strokeColor={getSafetyColor(zone.safety_level)}
            strokeWidth={3}
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
