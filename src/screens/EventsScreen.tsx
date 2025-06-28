import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Event {
  id: string;
  name: string;
  date: string;
  formUrl: string;
}

const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchasedEvents, setPurchasedEvents] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://10.0.2.2:3000/api/events');
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to filter out past events
  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      // Keep events that are today or in the future
      return (
        eventDate.getFullYear() > now.getFullYear() ||
        (eventDate.getFullYear() === now.getFullYear() && eventDate.getMonth() > now.getMonth()) ||
        (eventDate.getFullYear() === now.getFullYear() && eventDate.getMonth() === now.getMonth() && eventDate.getDate() >= now.getDate())
      );
    });
  };

  const handleBuyTicket = async (event: Event) => {
    try {
      setPurchasing(event.id);
      const storedUser = await AsyncStorage.getItem('mm_user');
      if (!storedUser) {
        Alert.alert('Error', 'User not logged in.');
        setPurchasing(null);
        return;
      }
      const user = JSON.parse(storedUser);
      const userId = user.id;
      if (!userId) {
        Alert.alert('Error', 'User ID not found.');
        setPurchasing(null);
        return;
      }
      const res = await fetch('http://10.0.2.2:3000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, eventId: event.id }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', `You have purchased a ticket for ${event.name}!`);
        setPurchasedEvents(prev => [...prev, event.id]);
      } else if (res.status === 409) {
        Alert.alert('Info', 'You already have a ticket for this event.');
        setPurchasedEvents(prev => [...prev, event.id]);
      } else {
        Alert.alert('Error', data.error || 'Failed to purchase ticket.');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upcoming Events</Text>
      {loading && <ActivityIndicator animating size="large" style={{ marginTop: 40 }} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {getUpcomingEvents().map(event => (
        <Card key={event.id} style={styles.card}>
          <Card.Content>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventDate}>{new Date(event.date).toLocaleString()}</Text>
            <Button
              mode="contained"
              style={styles.buyButton}
              onPress={() => handleBuyTicket(event)}
              disabled={purchasing === event.id || purchasedEvents.includes(event.id)}
            >
              {purchasing === event.id ? 'Processing...' : purchasedEvents.includes(event.id) ? 'Ticket Purchased' : 'Buy Ticket'}
            </Button>
          </Card.Content>
        </Card>
      ))}
      {!loading && getUpcomingEvents().length === 0 && !error && (
        <Text style={styles.noEvents}>No upcoming events found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#181c24',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  buyButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  noEvents: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
  },
});

export default EventsScreen; 