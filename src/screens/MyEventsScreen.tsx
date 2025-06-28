import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Event {
  id: string;
  name: string;
  date: string;
  formUrl?: string;
}

const API_BASE_URL = 'http://10.0.2.2:3000';

const MyEventsScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('mm_user');
      if (!storedUser) {
        setError('User not logged in');
        setLoading(false);
        return;
      }
      const user = JSON.parse(storedUser);
      const userId = user.id;
      if (!userId) {
        setError('User ID not found');
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/user/events?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setEvents(data.events);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Events</Text>
      {loading ? (
        <Text style={styles.loading}>Loading events...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : events.length === 0 ? (
        <Text style={styles.empty}>You have not bought tickets for any events yet.</Text>
      ) : (
        events.map(event => (
          <Card key={event.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventDate}>Date: {new Date(event.date).toLocaleString()}</Text>
              {event.formUrl && (
                <Button
                  mode="text"
                  onPress={() => Linking.openURL(event.formUrl!)}
                  style={styles.linkButton}
                >
                  Open Event Form
                </Button>
              )}
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 16,
    textAlign: 'center',
  },
  loading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 32,
  },
  empty: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  linkButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});

export default MyEventsScreen; 