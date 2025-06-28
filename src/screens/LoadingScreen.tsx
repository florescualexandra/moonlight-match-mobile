import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#D4AF37" />
      <Text style={styles.text}>Loading Moonlight Match...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181c24',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
});

export default LoadingScreen; 