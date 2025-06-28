import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  QRScanner: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const MoonLogo = () => (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>🌙</Text>
    </View>
  );

  const FeatureCard: React.FC<{ title: string; description: string; icon: string }> = ({ 
    title, 
    description, 
    icon 
  }) => (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MoonLogo />
          <Text style={styles.headerTitle}>Moonlight Match</Text>
        </View>
        <View style={styles.headerButtons}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('QRScanner')}
            style={styles.headerButton}
            labelStyle={styles.headerButtonText}
          >
            Scan QR
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.headerButton}
            labelStyle={styles.headerButtonText}
          >
            Sign In
          </Button>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Experience Luxury Matchmaking</Text>
        <Text style={styles.heroSubtitle}>
          Welcome to Moonlight Match, an exclusive event for those who seek meaningful connections. 
          Discover curated guests, a luxury experience, and discreet matchmaking under the stars.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Register')}
          style={styles.heroButton}
          labelStyle={styles.heroButtonText}
        >
          Get Started
        </Button>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <FeatureCard
          title="Curated Guests"
          description="Every attendee is handpicked to ensure a refined, like-minded crowd."
          icon="👥"
        />
        <FeatureCard
          title="Luxury Experience"
          description="Enjoy a night of elegance, fine music, and gourmet delights in a stunning venue."
          icon="✨"
        />
        <FeatureCard
          title="Discreet Matchmaking"
          description="Our AI ensures your matches are private, personal, and tailored to you."
          icon="💝"
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Moonlight Match
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:contact@moonlightmatch.com')}>
          <Text style={styles.footerLink}>Contact</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181c24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#181c24',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 20,
  },
  headerButtonText: {
    color: '#181c24',
    fontWeight: 'bold',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  heroButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    paddingHorizontal: 30,
  },
  heroButtonText: {
    color: '#181c24',
    fontWeight: 'bold',
    fontSize: 16,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'white',
  },
  featureCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#23283a',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: '#23283a',
    fontSize: 14,
  },
  footerLink: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 