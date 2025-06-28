import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, DataTable, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  AdminDashboard: undefined;
  AdminMatching: { eventId: string };
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;

interface Event {
  id: string;
  name: string;
  date: string;
  isMatching: boolean;
  isMatchingComplete: boolean;
  matchesSent: boolean;
  userCount: number;
}

const API_BASE_URL = 'http://10.0.2.2:3000';

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMatching = async (eventId: string) => {
    Alert.alert(
      'Start Matching',
      'Are you sure you want to start the matching process? This will close registration and begin calculating matches.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Matching',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/start-matching`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Matching process started!');
                fetchEvents(); // Refresh events
              } else {
                Alert.alert('Error', 'Failed to start matching process');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while starting matching');
            }
          },
        },
      ]
    );
  };

  const handleSendMatches = async (eventId: string) => {
    Alert.alert(
      'Send Matches',
      'Are you sure you want to send matches to all users? This will reveal their top 3 matches.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Matches',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/send-matches`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Matches sent to all users!');
                fetchEvents(); // Refresh events
              } else {
                Alert.alert('Error', 'Failed to send matches');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while sending matches');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventStatus = (event: Event) => {
    if (event.matchesSent) return { text: 'Matches Sent', color: '#4CAF50' };
    if (event.isMatchingComplete) return { text: 'Matching Complete', color: '#FF9800' };
    if (event.isMatching) return { text: 'Matching in Progress', color: '#2196F3' };
    return { text: 'Registration Open', color: '#9E9E9E' };
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>
          Welcome back, {user?.name}. Manage your events and matching process.
        </Text>
      </View>

      {/* Quick Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Event Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{events.length}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {events.filter(e => e.isMatching).length}
              </Text>
              <Text style={styles.statLabel}>Active Matching</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {events.reduce((sum, e) => sum + e.userCount, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Events List */}
      <Card style={styles.eventsCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Events</Text>
          
          {isLoading ? (
            <Text style={styles.loadingText}>Loading events...</Text>
          ) : events.length === 0 ? (
            <Text style={styles.emptyText}>No events found.</Text>
          ) : (
            events.map((event) => {
              const status = getEventStatus(event);
              return (
                <View key={event.id} style={styles.eventItem}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Chip 
                      textStyle={{ color: 'white', fontWeight: 'bold' }}
                      style={[styles.statusChip, { backgroundColor: status.color }]}
                    >
                      {status.text}
                    </Chip>
                  </View>
                  
                  <Text style={styles.eventDate}>
                    {formatDate(event.date)}
                  </Text>
                  
                  <Text style={styles.eventUsers}>
                    {event.userCount} registered users
                  </Text>
                  
                  <View style={styles.eventActions}>
                    {!event.isMatching && !event.isMatchingComplete && (
                      <Button
                        mode="contained"
                        onPress={() => handleStartMatching(event.id)}
                        style={styles.actionButton}
                        labelStyle={styles.actionButtonText}
                      >
                        Start Matching
                      </Button>
                    )}
                    
                    {event.isMatchingComplete && !event.matchesSent && (
                      <Button
                        mode="contained"
                        onPress={() => handleSendMatches(event.id)}
                        style={styles.actionButton}
                        labelStyle={styles.actionButtonText}
                      >
                        Send Matches
                      </Button>
                    )}
                    
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('AdminMatching', { eventId: event.id })}
                      style={styles.viewButton}
                      labelStyle={styles.viewButtonText}
                    >
                      View Details
                    </Button>
                  </View>
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>

      {/* Admin Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Admin Actions</Text>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => {
                if (events.length > 0) {
                  navigation.navigate('AdminMatching', { eventId: events[0].id });
                }
              }}
              style={styles.actionButton}
              labelStyle={styles.actionButtonText}
              disabled={events.length === 0}
            >
              Matching Control
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CreateEvent')}
              style={[styles.actionButton, { backgroundColor: '#D4AF37', marginBottom: 12 }]}
              labelStyle={[styles.actionButtonText, { color: '#181c24' }]}
            >
              Create New Event
            </Button>
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.logoutButton}
              labelStyle={styles.logoutButtonText}
            >
              Logout
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  statsCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  eventsCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  eventItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181c24',
    flex: 1,
  },
  statusChip: {
    marginLeft: 12,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventUsers: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 20,
    flex: 1,
  },
  actionButtonText: {
    color: '#181c24',
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewButton: {
    borderColor: '#D4AF37',
    borderRadius: 20,
    flex: 1,
  },
  viewButtonText: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
  },
  actionButtons: {
    gap: 12,
  },
  logoutButton: {
    borderColor: '#ff6b6b',
    borderRadius: 25,
  },
  logoutButtonText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdminDashboardScreen; 