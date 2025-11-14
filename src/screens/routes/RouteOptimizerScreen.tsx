import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Place } from 'types';
import { RouteOptimizer } from '@services/recommendations/RouteOptimizer';
import { useLocationStore } from '@store/useLocationStore';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LocationService } from '@services/location/LocationService';

const RouteOptimizerScreen: React.FC = () => {
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const { currentLocation } = useLocationStore();

  const handleOptimizeRoute = () => {
    if (selectedPlaces.length < 2) {
      Alert.alert('Error', 'Debes seleccionar al menos 2 lugares');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
      return;
    }

    const route = RouteOptimizer.optimizeRoute(
      selectedPlaces,
      currentLocation,
      new Date()
    );

    const feasibility = RouteOptimizer.isRouteFeasible(route);

    if (!feasibility.feasible) {
      Alert.alert(
        'Advertencia',
        `La ruta tiene algunos conflictos:\n\n${feasibility.conflicts.join('\n')}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver de todos modos', onPress: () => setOptimizedRoute(route) },
        ]
      );
    } else {
      setOptimizedRoute(route);
    }
  };

  const getMapRegion = () => {
    if (selectedPlaces.length === 0 && currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    if (selectedPlaces.length === 0) {
      return {
        latitude: -12.046374, // Lima, Peru default
        longitude: -77.042793,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const latitudes = selectedPlaces.map(p => p.latitude);
    const longitudes = selectedPlaces.map(p => p.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5 || 0.05,
      longitudeDelta: (maxLng - minLng) * 1.5 || 0.05,
    };
  };

  return (
    <View style={styles.container}>
      {selectedPlaces.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="map-outline" size={80} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No hay lugares seleccionados</Text>
          <Text style={styles.emptyText}>
            Agrega lugares desde la pantalla de exploración para optimizar tu ruta
          </Text>
        </View>
      ) : (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={getMapRegion()}
            showsUserLocation
          >
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="Tu ubicación"
                pinColor="#007AFF"
              />
            )}

            {selectedPlaces.map((place, index) => (
              <Marker
                key={place.id}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.name}
                description={place.address}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.markerNumber}>
                    <Text style={styles.markerNumberText}>{index + 1}</Text>
                  </View>
                </View>
              </Marker>
            ))}

            {optimizedRoute && (
              <Polyline
                coordinates={optimizedRoute.places.map((p: any) => ({
                  latitude: p.place.latitude,
                  longitude: p.place.longitude,
                }))}
                strokeColor="#007AFF"
                strokeWidth={3}
              />
            )}
          </MapView>

          <ScrollView style={styles.bottomSheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Lugares Seleccionados</Text>
              <Text style={styles.subtitle}>
                {selectedPlaces.length} lugar{selectedPlaces.length !== 1 ? 'es' : ''}
              </Text>
            </View>

            {selectedPlaces.map((item, index) => (
              <View key={item.id} style={styles.placeCard}>
                <View style={styles.placeNumber}>
                  <Text style={styles.placeNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{item.name}</Text>
                  <Text style={styles.placeAddress}>{item.address}</Text>
                </View>
              </View>
            ))}

            {optimizedRoute && (
              <View style={styles.routeInfo}>
                <View style={styles.routeStats}>
                  <View style={styles.statItem}>
                    <Icon name="location" size={20} color="#007AFF" />
                    <Text style={styles.statValue}>
                      {LocationService.formatDistance(optimizedRoute.totalDistance)}
                    </Text>
                    <Text style={styles.statLabel}>Distancia</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Icon name="time" size={20} color="#34C759" />
                    <Text style={styles.statValue}>
                      {RouteOptimizer.formatDuration(optimizedRoute.totalDuration)}
                    </Text>
                    <Text style={styles.statLabel}>Duración</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.optimizeButton}
                onPress={handleOptimizeRoute}
              >
                <Icon name="navigate" size={20} color="#FFFFFF" />
                <Text style={styles.optimizeButtonText}>Optimizar Ruta</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      )}
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
  markerContainer: {
    alignItems: 'center',
  },
  markerNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  placeCard: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 6,
    alignItems: 'center',
  },
  placeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeAddress: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  routeInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  optimizeButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optimizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default RouteOptimizerScreen;
