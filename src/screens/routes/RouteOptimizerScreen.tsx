import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Optimizador de Rutas</Text>
        <Text style={styles.subtitle}>
          Selecciona lugares y optimiza tu recorrido
        </Text>
      </View>

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
          <FlatList
            data={selectedPlaces}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.placeCard}>
                <View style={styles.placeNumber}>
                  <Text style={styles.placeNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{item.name}</Text>
                  <Text style={styles.placeAddress}>{item.address}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />

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
  header: {
    backgroundColor: '#FFFFFF',
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
  listContent: {
    padding: 16,
  },
  placeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
