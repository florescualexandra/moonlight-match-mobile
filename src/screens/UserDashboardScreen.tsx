import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Avatar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  UserDashboard: undefined;
  Matches: undefined;
  Chat: { matchId: string };
  Home: undefined;
  Events: undefined;
  MyEvents: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserDashboard'>;

interface Match {
  id: string;
  matchedUser: {
    id: string;
    name: string;
    image?: string;
  };
  score: number;
  isInitiallyRevealed: boolean;
  isPaidReveal: boolean;
}

const UserDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`http://your-api-url/api/users/${user?.id}/matches`, {
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
    } finally {
      setIsLoading(false);
    }
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={80}
              label={user?.name ? getInitials(user.name) : 'U'}
              style={styles.avatar}
              color="#181c24"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.description && (
                <Text style={styles.userDescription}>{user.description}</Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Event Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Event Information</Text>
          <Text style={styles.eventText}>
            You are registered for an upcoming Moonlight Match event.
          </Text>
          <Text style={styles.eventDate}>
            Check back here for your matches after the event begins!
          </Text>
        </Card.Content>
      </Card>

      {/* Matches Section */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.matchesHeader}>
            <Text style={styles.cardTitle}>Your Matches</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Matches')}
              labelStyle={styles.viewAllButton}
            >
              View All
            </Button>
          </View>
          
          {matches.length === 0 ? (
            <Text style={styles.noMatchesText}>
              Your matches will appear here once the event matching begins.
            </Text>
          ) : (
            matches.slice(0, 3).map((match) => (
              <View key={match.id} style={styles.matchItem}>
                <View style={styles.matchInfo}>
                  <Avatar.Text
                    size={50}
                    label={getInitials(match.matchedUser.name)}
                    style={styles.matchAvatar}
                    color="#181c24"
                  />
                  <View style={styles.matchDetails}>
                    <Text style={styles.matchName}>
                      {match.isInitiallyRevealed || match.isPaidReveal 
                        ? match.matchedUser.name 
                        : 'Hidden Match'
                      }
                    </Text>
                    <Text style={styles.matchScore}>
                      Compatibility: {match.score.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Chat', { matchId: match.id })}
                  style={styles.chatButton}
                  labelStyle={styles.chatButtonText}
                  disabled={!match.isInitiallyRevealed && !match.isPaidReveal}
                >
                  Chat
                </Button>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Matches')}
              style={styles.actionButton}
              labelStyle={styles.actionButtonText}
            >
              View All Matches
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Events')}
              style={styles.actionButton}
              labelStyle={styles.actionButtonText}
            >
              Browse Events
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('MyEvents')}
              style={styles.actionButton}
              labelStyle={styles.actionButtonText}
            >
              My Events
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
  profileCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#D4AF37',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  userDescription: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 12,
  },
  eventText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  matchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  noMatchesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  matchAvatar: {
    backgroundColor: '#D4AF37',
    marginRight: 12,
  },
  matchDetails: {
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 4,
  },
  matchScore: {
    fontSize: 14,
    color: '#666',
  },
  chatButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 20,
  },
  chatButtonText: {
    color: '#181c24',
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
  },
  actionButtonText: {
    color: '#181c24',
    fontWeight: 'bold',
    fontSize: 16,
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

export default UserDashboardScreen; 