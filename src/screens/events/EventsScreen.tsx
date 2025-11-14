import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Share,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DatabaseService } from '@services/supabase/database';
import { Event } from 'types';
import { Ionicons as Icon } from '@expo/vector-icons';
import { format, isToday, isThisWeek, isThisMonth, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

type DateFilter = 'all' | 'today' | 'week' | 'month';

const EVENT_TYPES = [
  { id: 'all', label: 'Todos', icon: 'calendar-outline' },
  { id: 'concierto', label: 'Conciertos', icon: 'musical-notes-outline' },
  { id: 'festival', label: 'Festivales', icon: 'musical-note-outline' },
  { id: 'exposicion', label: 'Exposiciones', icon: 'image-outline' },
  { id: 'teatro', label: 'Teatro', icon: 'person-outline' },
  { id: 'deportivo', label: 'Deportes', icon: 'football-outline' },
  { id: 'cultural', label: 'Cultural', icon: 'library-outline' },
  { id: 'gastronomico', label: 'Gastronómico', icon: 'restaurant-outline' },
];

const EventsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const upcomingEvents = await DatabaseService.getUpcomingEvents(100);
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events by date and type
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by date
    if (dateFilter !== 'all') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_date);
        switch (dateFilter) {
          case 'today':
            return isToday(eventDate);
          case 'week':
            return isThisWeek(eventDate, { weekStartsOn: 1 });
          case 'month':
            return isThisMonth(eventDate);
          default:
            return true;
        }
      });
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.event_type === selectedType);
    }

    return filtered;
  }, [events, dateFilter, selectedType]);

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleShareEvent = async (event: Event) => {
    try {
      const startDate = new Date(event.start_date);
      const message = `${event.title}\n\n📅 ${format(startDate, "dd 'de' MMMM 'a las' HH:mm", { locale: es })}\n📍 ${event.address}\n${event.is_free ? '💰 Gratis' : event.price ? `💰 $${event.price}` : ''}`;

      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    const startDate = new Date(selectedEvent.start_date);
    const endDate = selectedEvent.end_date ? new Date(selectedEvent.end_date) : null;

    return (
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Icon name="close" size={28} color="#1C1C1E" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Icon name="calendar-outline" size={20} color="#007AFF" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Fecha y hora</Text>
                  <Text style={styles.detailValue}>
                    {format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </Text>
                  <Text style={styles.detailValue}>
                    {format(startDate, 'HH:mm', { locale: es })}
                    {endDate && ` - ${format(endDate, 'HH:mm', { locale: es })}`}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Icon name="location-outline" size={20} color="#007AFF" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Ubicación</Text>
                  <Text style={styles.detailValue}>{selectedEvent.address}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Icon name="pricetag-outline" size={20} color="#007AFF" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Precio</Text>
                  <Text style={styles.detailValue}>
                    {selectedEvent.is_free ? 'Gratis' : selectedEvent.price ? `$${selectedEvent.price}` : 'Por confirmar'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Icon name="information-circle-outline" size={20} color="#007AFF" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Tipo de evento</Text>
                  <Text style={styles.detailValue}>
                    {EVENT_TYPES.find(t => t.id === selectedEvent.event_type)?.label || selectedEvent.event_type}
                  </Text>
                </View>
              </View>

              {selectedEvent.description && (
                <View style={styles.descriptionSection}>
                  <Text style={styles.descriptionLabel}>Descripción</Text>
                  <Text style={styles.descriptionText}>{selectedEvent.description}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.shareButton2}
                onPress={() => handleShareEvent(selectedEvent)}
              >
                <Icon name="share-outline" size={20} color="#007AFF" />
                <Text style={styles.shareButtonText}>Compartir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const startDate = new Date(item.start_date);

    return (
      <TouchableOpacity style={styles.eventCard} onPress={() => handleEventPress(item)}>
        <View style={styles.dateBox}>
          <Text style={styles.dateMonth}>
            {format(startDate, 'MMM', { locale: es })}
          </Text>
          <Text style={styles.dateDay}>{format(startDate, 'd')}</Text>
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.eventType}>
            {EVENT_TYPES.find(t => t.id === item.event_type)?.label || item.event_type}
          </Text>
          <View style={styles.eventMeta}>
            <Icon name="location-outline" size={14} color="#8E8E93" />
            <Text style={styles.eventLocation} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
          <View style={styles.eventBottom}>
            <View style={styles.eventTime}>
              <Icon name="time-outline" size={14} color="#8E8E93" />
              <Text style={styles.eventTimeText}>
                {format(startDate, 'HH:mm', { locale: es })}
              </Text>
            </View>
            {item.is_free ? (
              <View style={styles.freeTag}>
                <Text style={styles.freeTagText}>Gratis</Text>
              </View>
            ) : item.price ? (
              <Text style={styles.eventPrice}>${item.price}</Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={(e) => {
            e.stopPropagation();
            handleShareEvent(item);
          }}
        >
          <Icon name="share-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Eventos</Text>
        <Text style={styles.subtitle}>
          {filteredEvents.length} {filteredEvents.length === 1 ? 'evento próximo' : 'eventos próximos'}
        </Text>
      </View>

      {/* Date Filters */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.dateFilterChip, dateFilter === 'all' && styles.dateFilterChipActive]}
            onPress={() => setDateFilter('all')}
          >
            <Icon
              name="calendar-outline"
              size={18}
              color={dateFilter === 'all' ? '#FFFFFF' : '#007AFF'}
            />
            <Text
              style={[
                styles.dateFilterText,
                dateFilter === 'all' && styles.dateFilterTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateFilterChip, dateFilter === 'today' && styles.dateFilterChipActive]}
            onPress={() => setDateFilter('today')}
          >
            <Icon
              name="today-outline"
              size={18}
              color={dateFilter === 'today' ? '#FFFFFF' : '#007AFF'}
            />
            <Text
              style={[
                styles.dateFilterText,
                dateFilter === 'today' && styles.dateFilterTextActive,
              ]}
            >
              Hoy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateFilterChip, dateFilter === 'week' && styles.dateFilterChipActive]}
            onPress={() => setDateFilter('week')}
          >
            <Icon
              name="calendar-outline"
              size={18}
              color={dateFilter === 'week' ? '#FFFFFF' : '#007AFF'}
            />
            <Text
              style={[
                styles.dateFilterText,
                dateFilter === 'week' && styles.dateFilterTextActive,
              ]}
            >
              Esta semana
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateFilterChip, dateFilter === 'month' && styles.dateFilterChipActive]}
            onPress={() => setDateFilter('month')}
          >
            <Icon
              name="calendar-outline"
              size={18}
              color={dateFilter === 'month' ? '#FFFFFF' : '#007AFF'}
            />
            <Text
              style={[
                styles.dateFilterText,
                dateFilter === 'month' && styles.dateFilterTextActive,
              ]}
            >
              Este mes
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Type Filters */}
      <View style={styles.typeFilterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {EVENT_TYPES.map(type => {
            const count =
              type.id === 'all'
                ? events.length
                : events.filter(e => e.event_type === type.id).length;

            if (count === 0 && type.id !== 'all') return null;

            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeChip,
                  selectedType === type.id && styles.typeChipActive,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Icon
                  name={type.icon as any}
                  size={16}
                  color={selectedType === type.id ? '#FFFFFF' : '#007AFF'}
                />
                <Text
                  style={[
                    styles.typeText,
                    selectedType === type.id && styles.typeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
                <View
                  style={[
                    styles.typeBadge,
                    selectedType === type.id && styles.typeBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeCount,
                      selectedType === type.id && styles.typeCountActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadEvents} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <>
                <Icon name="hourglass-outline" size={64} color="#007AFF" />
                <Text style={styles.emptyTitle}>Cargando eventos...</Text>
              </>
            ) : dateFilter !== 'all' || selectedType !== 'all' ? (
              <>
                <Icon name="calendar-outline" size={80} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>No hay eventos</Text>
                <Text style={styles.emptyText}>
                  No hay eventos que coincidan con los filtros seleccionados
                </Text>
                <TouchableOpacity
                  style={styles.resetFiltersButton}
                  onPress={() => {
                    setDateFilter('all');
                    setSelectedType('all');
                  }}
                >
                  <Text style={styles.resetFiltersText}>Ver todos los eventos</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Icon name="calendar-outline" size={80} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>Sin eventos próximos</Text>
                <Text style={styles.emptyText}>
                  No hay eventos programados en este momento
                </Text>
              </>
            )}
          </View>
        }
      />

      {/* Event Details Modal */}
      {renderEventDetails()}
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dateFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dateFilterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dateFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  dateFilterTextActive: {
    color: '#FFFFFF',
  },
  typeFilterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  typeChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  typeBadge: {
    backgroundColor: '#E5F1FF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  typeBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  typeCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  typeCountActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  dateBox: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginRight: 16,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
    paddingRight: 32,
  },
  eventType: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventLocation: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
    flex: 1,
  },
  eventBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTimeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  freeTag: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  freeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  shareButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
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
  resetFiltersButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  resetFiltersText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
    paddingRight: 16,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  descriptionSection: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  descriptionLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  shareButton2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventsScreen;
