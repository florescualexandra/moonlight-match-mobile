import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Avatar, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Matches: undefined;
  Chat: { matchId: string };
  UserDashboard: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Matches'>;

interface Match {
  id: string;
  matchedUser: {
    id: string;
    name: string;
    image?: string;
    description?: string;
  };
  score: number;
  isInitiallyRevealed: boolean;
  isPaidReveal: boolean;
  similarities?: string[];
}

const MatchesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

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

  const handleRevealMatch = async (matchId: string) => {
    Alert.alert(
      'Reveal Additional Matches',
      'Would you like to reveal 2 additional matches for $5?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reveal',
          onPress: async () => {
            try {
              // TODO: Implement payment and reveal logic
              const response = await fetch(`http://your-api-url/api/matches/${matchId}/reveal`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Additional matches revealed!');
                fetchMatches(); // Refresh matches
              } else {
                Alert.alert('Error', 'Failed to reveal matches');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while revealing matches');
            }
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
    const isRevealed = match.isInitiallyRevealed || match.isPaidReveal;
    
    return (
      <Card style={styles.matchCard}>
        <Card.Content>
          <View style={styles.matchHeader}>
            <View style={styles.matchInfo}>
              <Avatar.Text
                size={60}
                label={isRevealed ? getInitials(match.matchedUser.name) : '?'}
                style={styles.matchAvatar}
                color="#181c24"
              />
              <View style={styles.matchDetails}>
                <Text style={styles.matchName}>
                  {isRevealed ? match.matchedUser.name : 'Hidden Match'}
                </Text>
                <Text style={styles.matchScore}>
                  Compatibility: {match.score.toFixed(1)}%
                </Text>
                {isRevealed && match.matchedUser.description && (
                  <Text style={styles.matchDescription}>
                    {match.matchedUser.description}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreText, { color: getScoreColor(match.score) }]}>
                {match.score.toFixed(0)}%
              </Text>
            </View>
          </View>

          {isRevealed && match.similarities && match.similarities.length > 0 && (
            <View style={styles.similaritiesContainer}>
              <Text style={styles.similaritiesTitle}>Similarities:</Text>
              <View style={styles.similaritiesList}>
                {match.similarities.map((similarity, index) => (
                  <Chip key={index} style={styles.similarityChip} textStyle={styles.chipText}>
                    {similarity}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          <View style={styles.matchActions}>
            {isRevealed ? (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Chat', { matchId: match.id })}
                style={styles.chatButton}
                labelStyle={styles.chatButtonText}
              >
                Start Chat
              </Button>
            ) : (
              <Button
                mode="outlined"
                onPress={() => handleRevealMatch(match.id)}
                style={styles.revealButton}
                labelStyle={styles.revealButtonText}
              >
                Reveal Match ($5)
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Matches</Text>
        <Text style={styles.subtitle}>
          Discover your top compatibility matches from the event
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your matches...</Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Matches Yet</Text>
          <Text style={styles.emptyText}>
            Your matches will appear here once the event matching begins. 
            Check back after the event starts!
          </Text>
        </View>
      ) : (
        <View style={styles.matchesContainer}>
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  matchesContainer: {
    padding: 16,
  },
  matchCard: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  matchAvatar: {
    backgroundColor: '#D4AF37',
    marginRight: 16,
  },
  matchDetails: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 4,
  },
  matchScore: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  matchDescription: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  similaritiesContainer: {
    marginBottom: 16,
  },
  similaritiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 8,
  },
  similaritiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  similarityChip: {
    backgroundColor: '#D4AF37',
  },
  chipText: {
    color: '#181c24',
    fontWeight: 'bold',
  },
  matchActions: {
    alignItems: 'center',
  },
  chatButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    paddingHorizontal: 30,
  },
  chatButtonText: {
    color: '#181c24',
    fontWeight: 'bold',
    fontSize: 16,
  },
  revealButton: {
    borderColor: '#D4AF37',
    borderRadius: 25,
    paddingHorizontal: 30,
  },
  revealButtonText: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MatchesScreen; 