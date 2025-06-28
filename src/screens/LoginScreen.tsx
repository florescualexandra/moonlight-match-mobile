import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Add your logo image to the assets folder and import it here if you have one
// import Logo from '../assets/logo.png';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserDashboard: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (!success) {
      setError('Invalid email or password.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#181c24' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.logoContainer}>
              {/* Uncomment and use your logo if available */}
              {/* <Image source={Logo} style={styles.logo} /> */}
              <Text style={styles.logoText}>🌙</Text>
              <Text style={styles.brand}>Moonlight Match</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              outlineColor="#D4AF37"
              activeOutlineColor="#D4AF37"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              outlineColor="#D4AF37"
              activeOutlineColor="#D4AF37"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              labelStyle={styles.loginButtonText}
              loading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
            <View style={styles.divider} />
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.createAccountButton}
              labelStyle={styles.createAccountButtonText}
            >
              Don't have an account? Create one
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 8,
  },
  brand: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    marginTop: 8,
    marginBottom: 8,
  },
  loginButtonText: {
    color: '#181c24',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  createAccountButton: {
    alignSelf: 'center',
  },
  createAccountButtonText: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginScreen; 