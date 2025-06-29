import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text as RNText, Linking } from 'react-native';
import { Text, Card, Button, ActivityIndicator as PaperActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

interface Event {
  id: string;
  name: string;
  date: string;
  formUrl: string;
  ticketId: string;
}

const MyEventsScreen: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [formCompletionStatus, setFormCompletionStatus] = useState<{[key: string]: boolean}>({});
  const [checkingFormStatus, setCheckingFormStatus] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    console.log('user', user);
    console.log('isLoading', isLoading);
    if (!isLoading && user && user.id) {
      fetchMyEvents();
    }
  }, [isLoading, user]);

  const fetchMyEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('mm_token');
      const userId = user?.id;
      if (!userId) {
        if (!isLoading) {
          setError('Missing userId');
        }
        setLoading(false);
        return;
      }
      const response = await fetch(`https://moonlight-match-website.vercel.app/api/user/events?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        // Check form completion status for all events
        checkFormCompletionStatus(data.events || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch your events');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const checkFormCompletionStatus = async (eventsList: Event[]) => {
    if (!user?.email) return;

    try {
      const token = await AsyncStorage.getItem('mm_token');
      const response = await fetch('https://moonlight-match-website.vercel.app/api/google-forms/check-completion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();
      setFormCompletionStatus({ [user.email]: data.hasCompletedForm });
    } catch (error) {
      console.error('Error checking form completion status:', error);
    }
  };

  const handleFillForm = async (event: Event) => {
    if (!event.formUrl) {
      Alert.alert('No Form Available', 'This event does not have a form to fill out.');
      return;
    }

    try {
      // Check if user has already completed the form
      const token = await AsyncStorage.getItem('mm_token');
      const response = await fetch('https://moonlight-match-website.vercel.app/api/google-forms/check-completion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email }),
      });

      const data = await response.json();

      if (data.hasCompletedForm) {
        Alert.alert(
          'Form Already Completed',
          'You have already completed this form. You cannot submit it again.',
          [{ text: 'OK' }]
        );
        return;
      }

      // If form not completed, allow user to open it
      Alert.alert(
        'Open Form',
        'This will open the event form in your browser. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open',
            onPress: () => Linking.openURL(event.formUrl),
          },
        ]
      );
    } catch (error) {
      console.error('Error checking form completion:', error);
      // If check fails, still allow form access but show warning
      Alert.alert(
        'Open Form',
        'Unable to verify form completion status. This will open the event form in your browser. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open',
            onPress: () => Linking.openURL(event.formUrl),
          },
        ]
      );
    }
  };

  const isEventUpcoming = (eventDate: string) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    return eventDateObj >= now;
  };

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    
    if (eventDateObj < now) {
      return { status: 'Past', color: '#666' };
    } else if (eventDateObj.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { status: 'Today', color: '#D4AF37' };
    } else {
      return { status: 'Upcoming', color: '#4CAF50' };
    }
  };

  const showDebug = async () => {
    const storedUser = await AsyncStorage.getItem('mm_user');
    const storedToken = await AsyncStorage.getItem('mm_token');
    setDebugInfo(`user: ${storedUser}\ntoken: ${storedToken}\ncontext user: ${JSON.stringify(user)}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Events</Text>
      
      {(isLoading || loading) && (
        <PaperActivityIndicator animating size="large" style={{ marginTop: 40 }} />
      )}
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <Button
            mode="contained"
            onPress={fetchMyEvents}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Events Found</Text>
          <Text style={styles.emptyText}>
            You haven't purchased tickets for any events yet. 
            Browse events to get started!
          </Text>
        </View>
      ) : (
        events.map(event => {
          const eventStatus = getEventStatus(event.date);
          const isUpcoming = isEventUpcoming(event.date);
          
          return (
            <Card key={event.id} style={styles.card}>
              <Card.Content>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={[styles.eventStatus, { color: eventStatus.color }]}>
                    {eventStatus.status}
                  </Text>
                </View>
                
                <Text style={styles.eventDate}>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                
                <View style={styles.eventActions}>
                  {isUpcoming && event.formUrl && (
                    <>
                      {formCompletionStatus[user?.email || ''] ? (
                        <Button
                          mode="outlined"
                          disabled={true}
                          style={[styles.formButton, styles.completedButton]}
                          labelStyle={[styles.formButtonText, styles.completedButtonText]}
                        >
                          ✓ Form Completed
                        </Button>
                      ) : (
                        <Button
                          mode="contained"
                          onPress={() => handleFillForm(event)}
                          style={styles.formButton}
                          labelStyle={styles.formButtonText}
                        >
                          Fill Event Form
                        </Button>
                      )}
                    </>
                  )}
                  
                  {!isUpcoming && (
                    <Text style={styles.pastEventText}>
                      This event has already taken place
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          );
        })
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181c24',
    flex: 1,
  },
  eventStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  eventDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  eventActions: {
    alignItems: 'center',
  },
  formButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    paddingHorizontal: 30,
  },
  formButtonText: {
    color: '#181c24',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pastEventText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  error: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  emptyText: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  completedButton: {
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
  },
  completedButtonText: {
    color: '#4CAF50',
  },
});

export default MyEventsScreen; 