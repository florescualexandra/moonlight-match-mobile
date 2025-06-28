/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import UserDashboardScreen from './src/screens/UserDashboardScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import ChatScreen from './src/screens/ChatScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminMatchingScreen from './src/screens/AdminMatchingScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import EventsScreen from './src/screens/EventsScreen';
import CreateEventScreen from './src/screens/CreateEventScreen';

// Import context
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#181c24',
          },
          headerTintColor: '#D4AF37',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
        initialRouteName={!isAuthenticated ? 'Login' : undefined}
      >
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ title: 'Sign In', headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ title: 'Create Account' }}
            />
            <Stack.Screen 
              name="QRScanner" 
              component={QRScannerScreen} 
              options={{ title: 'Scan QR Code' }}
            />
          </>
        ) : user?.isAdmin ? (
          // Admin screens
          <>
            <Stack.Screen 
              name="AdminDashboard" 
              component={AdminDashboardScreen} 
              options={{ title: 'Admin Dashboard' }}
            />
            <Stack.Screen 
              name="AdminMatching" 
              component={AdminMatchingScreen} 
              options={{ title: 'Matching Control' }}
            />
            <Stack.Screen
              name="CreateEvent"
              component={CreateEventScreen}
              options={{ title: 'Create Event' }}
            />
          </>
        ) : (
          // User screens
          <>
            <Stack.Screen 
              name="UserDashboard" 
              component={UserDashboardScreen} 
              options={{ title: 'My Dashboard' }}
            />
            <Stack.Screen 
              name="Matches" 
              component={MatchesScreen} 
              options={{ title: 'My Matches' }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen} 
              options={{ title: 'Chat' }}
            />
            <Stack.Screen
              name="Events"
              component={EventsScreen}
              options={{ title: 'Upcoming Events' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <StatusBar barStyle="light-content" backgroundColor="#181c24" />
        <AppContent />
      </AuthProvider>
    </PaperProvider>
  );
}
