import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Avatar } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Chat: { matchId: string };
  Matches: undefined;
  UserDashboard: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface Match {
  id: string;
  matchedUser: {
    id: string;
    name: string;
    image?: string;
  };
}

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatRouteProp>();
  const { user } = useAuth();
  const { matchId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchMatchDetails();
    fetchMessages();
    // Set up real-time updates (WebSocket or polling)
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`http://your-api-url/api/matches/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatch(data.match);
      }
    } catch (error) {
      console.error('Error fetching match details:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`http://your-api-url/api/matches/${matchId}/messages`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsLoading(true);
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`http://your-api-url/api/matches/${matchId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('mm_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isOwnMessage = message.senderId === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(message.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <Card style={styles.header}>
        <Card.Content>
          <View style={styles.headerContent}>
            <Avatar.Text
              size={40}
              label={match?.matchedUser.name ? getInitials(match.matchedUser.name) : 'M'}
              style={styles.headerAvatar}
              color="#181c24"
            />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>
                {match?.matchedUser.name || 'Match'}
              </Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Start the conversation! Send your first message to {match?.matchedUser.name}.
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </ScrollView>

      {/* Message Input */}
      <Card style={styles.inputContainer}>
        <Card.Content>
          <View style={styles.inputRow}>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              mode="outlined"
              style={styles.textInput}
              multiline
              outlineColor="#D4AF37"
              activeOutlineColor="#D4AF37"
            />
            <Button
              mode="contained"
              onPress={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              style={styles.sendButton}
              labelStyle={styles.sendButtonText}
              loading={isLoading}
            >
              Send
            </Button>
          </View>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 0,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    backgroundColor: '#D4AF37',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181c24',
  },
  headerStatus: {
    fontSize: 14,
    color: '#4CAF50',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#181c24',
  },
  otherMessageText: {
    color: '#181c24',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(24, 28, 36, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#666',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 0,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#181c24',
    fontWeight: 'bold',
  },
});

export default ChatScreen; 