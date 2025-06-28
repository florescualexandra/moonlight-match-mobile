import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';

type RootStackParamList = {
  AdminDashboard: undefined;
  CreateEvent: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateEvent'>;

const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // If time is already set, preserve it
      if (date) {
        selectedDate.setHours(date.getHours());
        selectedDate.setMinutes(date.getMinutes());
      }
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && date) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    } else if (selectedTime) {
      setDate(selectedTime);
    }
  };

  const handleCreateEvent = async () => {
    if (!name || !date || !formUrl) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      const isoDate = date.toISOString();
      const res = await fetch('http://10.0.2.2:3000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date: isoDate, formUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Event created successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('AdminDashboard') },
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to create event.');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDate = date ? date.toLocaleDateString() : 'Select date';
  const formattedTime = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select time';

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Create New Event</Text>
          <TextInput
            label="Event Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor="#D4AF37"
            activeOutlineColor="#D4AF37"
          />
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
            labelStyle={{ color: '#181c24' }}
          >
            {formattedDate}
          </Button>
          <Button
            mode="outlined"
            onPress={() => setShowTimePicker(true)}
            style={styles.input}
            labelStyle={{ color: '#181c24' }}
          >
            {formattedTime}
          </Button>
          {showDatePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
          <TextInput
            label="Google Form URL"
            value={formUrl}
            onChangeText={setFormUrl}
            mode="outlined"
            style={styles.input}
            outlineColor="#D4AF37"
            activeOutlineColor="#D4AF37"
          />
          <Button
            mode="contained"
            onPress={handleCreateEvent}
            style={styles.createButton}
            labelStyle={styles.createButtonText}
            loading={isLoading}
            disabled={isLoading}
          >
            Create Event
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181c24',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  createButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    marginTop: 8,
  },
  createButtonText: {
    color: '#181c24',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateEventScreen; 