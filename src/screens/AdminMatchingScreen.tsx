import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, TextInput } from 'react-native';
import { Text, Button, Card, ProgressBar, DataTable, Chip } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  AdminMatching: { eventId: string };
  AdminDashboard: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminMatching'>;

interface MatchingStatus {
  eventId: string;
  eventName: string;
  totalUsers: number;
  processedUsers: number;
  totalMatches: number;
  isMatching: boolean;
  isComplete: boolean;
  matchesSent: boolean;
  startTime?: string;
  endTime?: string;
  progress: number;
  formUrl?: string;
}

interface Match {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  matchedUser: {
    id: string;
    name: string;
    email: string;
  };
  score: number;
  createdAt: string;
}

const API_BASE_URL = 'http://10.0.2.2:3000';

const AdminMatchingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { eventId } = (route.params as { eventId?: string }) || {};
  const { user } = useAuth();
  const [matchingStatus, setMatchingStatus] = useState<MatchingStatus | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isEditingFormUrl, setIsEditingFormUrl] = useState(false);
  const [formUrl, setFormUrl] = useState<string>("");

  if (!eventId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No event selected. Please go back and select an event.</Text>
      </View>
    );
  }

  useEffect(() => {
    fetchMatchingStatus();
    fetchMatches();
    
    // Start polling if matching is in progress
    if (matchingStatus?.isMatching && !matchingStatus.isComplete) {
      setIsPolling(true);
      const interval = setInterval(() => {
        fetchMatchingStatus();
        fetchMatches();
      }, 5000); // Poll every 5 seconds
      
      return () => {
        clearInterval(interval);
        setIsPolling(false);
      };
    }
  }, [matchingStatus?.isMatching, matchingStatus?.isComplete]);

  // Update formUrl state when matchingStatus changes
  useEffect(() => {
    if (matchingStatus && matchingStatus.formUrl) {
      setFormUrl(matchingStatus.formUrl);
    }
  }, [matchingStatus]);

  const fetchMatchingStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatchingStatus({
          eventId: data.event.id,
          eventName: data.event.name,
          totalUsers: data.event.userCount || 0,
          processedUsers: 0,
          totalMatches: 0,
          isMatching: data.event.isMatching,
          isComplete: data.event.isMatchingComplete,
          matchesSent: data.event.matchesSent,
          progress: 0,
          formUrl: data.event.formUrl,
        });
      }
    } catch (error) {
      console.error('Error fetching matching status:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/matches`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleStartMatching = async () => {
    Alert.alert(
      'Start Matching Process',
      'This will begin the AI matching algorithm for all registered users. This process cannot be stopped once started.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Matching',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/start-matching`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Matching process started!');
                fetchMatchingStatus();
              } else {
                Alert.alert('Error', 'Failed to start matching process');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while starting matching');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSendMatches = async () => {
    Alert.alert(
      'Send Matches to Users',
      'This will reveal the top 3 matches to all users. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Matches',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/send-matches`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Matches sent to all users!');
                fetchMatchingStatus();
              } else {
                Alert.alert('Error', 'Failed to send matches');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while sending matches');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveFormUrl = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formUrl }),
      });
      if (response.ok) {
        Alert.alert('Success', 'Form URL updated!');
        setIsEditingFormUrl(false);
        fetchMatchingStatus();
      } else {
        Alert.alert('Error', 'Failed to update form URL');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating form URL');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FF9800';
    return '#2196F3';
  };

  // Sort matches by score descending and take top 10
  const topMatches = matches
    .slice()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 10);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Matching Control</Text>
        <Text style={styles.subtitle}>
          Monitor and control the AI matching process
        </Text>
      </View>

      {/* Status Card */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Matching Status</Text>
          
          {matchingStatus ? (
            <View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Event:</Text>
                <Text style={styles.statusValue}>{matchingStatus.eventName}</Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={styles.statusValue}>
                  {matchingStatus.isMatching
                    ? 'Matching in progress'
                    : matchingStatus.isComplete
                      ? 'Matching completed'
                      : 'Matching not started'}
                </Text>
              </View>

              {matchingStatus.isMatching && (
                <>
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                      Progress: {matchingStatus.processedUsers} / {matchingStatus.totalUsers} users
                    </Text>
                    <ProgressBar 
                      progress={matchingStatus.progress / 100} 
                      color={getProgressColor(matchingStatus.progress)}
                      style={styles.progressBar}
                    />
                    <Text style={styles.progressPercent}>
                      {matchingStatus.progress.toFixed(1)}%
                    </Text>
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{matchingStatus.totalUsers}</Text>
                      <Text style={styles.statLabel}>Total Users</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{matchingStatus.processedUsers}</Text>
                      <Text style={styles.statLabel}>Processed</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{matchingStatus.totalMatches}</Text>
                      <Text style={styles.statLabel}>Matches Created</Text>
                    </View>
                  </View>
                </>
              )}

              {matchingStatus.startTime && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Started:</Text>
                  <Text style={styles.statusValue}>{formatTime(matchingStatus.startTime)}</Text>
                </View>
              )}

              {matchingStatus.endTime && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Completed:</Text>
                  <Text style={styles.statusValue}>{formatTime(matchingStatus.endTime)}</Text>
                </View>
              )}

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Form URL:</Text>
                {isEditingFormUrl ? (
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      value={formUrl}
                      onChangeText={setFormUrl}
                      style={{ flex: 1, borderBottomWidth: 1, borderColor: '#ccc', marginRight: 8 }}
                      placeholder="Enter form URL"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Button mode="contained" onPress={handleSaveFormUrl} style={{ marginRight: 4 }}>Save</Button>
                    <Button mode="text" onPress={() => { setIsEditingFormUrl(false); setFormUrl(matchingStatus.formUrl || ""); }}>Cancel</Button>
                  </View>
                ) : (
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    {matchingStatus.formUrl ? (
                      <Text
                        style={{ color: '#1a73e8', textDecorationLine: 'underline', flex: 1 }}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        onPress={() => matchingStatus.formUrl && Linking.openURL(matchingStatus.formUrl)}
                      >
                        {matchingStatus.formUrl}
                      </Text>
                    ) : (
                      <Text style={{ color: '#888', flex: 1 }}>No form URL set</Text>
                    )}
                    <Button mode="text" onPress={() => setIsEditingFormUrl(true)} style={{ marginLeft: 8 }}>Edit</Button>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <Text style={styles.noStatusText}>No matching status available</Text>
          )}
        </Card.Content>
      </Card>

      {/* Control Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Control Actions</Text>
          
          <View style={styles.actionButtons}>
            {!matchingStatus?.isMatching && !matchingStatus?.isComplete && (
              <Button
                mode="contained"
                onPress={handleStartMatching}
                style={styles.startButton}
                labelStyle={styles.buttonText}
                loading={isLoading}
                disabled={isLoading}
              >
                Start Matching Process
              </Button>
            )}
            
            {matchingStatus?.isComplete && !matchingStatus?.matchesSent && (
              <Button
                mode="contained"
                onPress={handleSendMatches}
                style={styles.sendButton}
                labelStyle={styles.buttonText}
                loading={isLoading}
                disabled={isLoading}
              >
                Send Matches to Users
              </Button>
            )}
            
            {matchingStatus?.isMatching && (
              <View style={styles.matchingInfo}>
                <Text style={styles.matchingText}>
                  Matching is in progress... Please wait.
                </Text>
                {isPolling && (
                  <Text style={styles.pollingText}>
                    Auto-refreshing every 5 seconds
                  </Text>
                )}
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Matches Preview */}
      <Card style={styles.matchesCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Recent Matches</Text>
          
          {topMatches.length === 0 ? (
            <Text style={styles.noMatchesText}>No matches created yet</Text>
          ) : (
            <View>
              {topMatches.map((match) => (
                <View key={match.id} style={styles.matchItem}>
                  <View style={styles.matchUsers}>
                    <Text style={styles.matchUser}>{match.user?.name || "Unknown"}</Text>
                    <Text style={styles.matchArrow}>→</Text>
                    <Text style={styles.matchUser}>{match.matchedUser?.name || "Unknown"}</Text>
                  </View>
                  <View style={styles.matchDetails}>
                    <Text style={styles.matchScore}>
                      Score: {match.score ? match.score.toFixed(1) + "%" : "N/A"}
                    </Text>
                    <Text style={styles.matchTime}>
                      {match.createdAt ? formatTime(match.createdAt) : ""}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  statusCard: {
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    color: '#181c24',
    fontWeight: 'bold',
  },
  statusChip: {
    alignSelf: 'flex-end',
  },
  noStatusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
  startButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  matchingInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  matchingText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pollingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  matchesCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
  },
  noMatchesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  matchItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181c24',
  },
  matchArrow: {
    fontSize: 16,
    color: '#D4AF37',
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  matchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchScore: {
    fontSize: 14,
    color: '#666',
  },
  matchTime: {
    fontSize: 12,
    color: '#888',
  },
  moreMatchesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  },
});

export default AdminMatchingScreen; 