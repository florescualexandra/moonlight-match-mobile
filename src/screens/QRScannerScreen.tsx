import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Linking, PermissionsAndroid } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

type RootStackParamList = {
  QRScanner: undefined;
  Home: undefined;
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'QRScanner'>;

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      setTimeout(() => setIsScanning(true), 300); // Add delay before enabling scanner
    }
  }, [hasPermission]);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'Moonlight Match needs access to your camera to scan QR codes.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    } catch (err) {
      console.warn(err);
      setHasPermission(false);
    }
  };

  const onSuccess = (e: any) => {
    setIsScanning(false);
    const qrData = e.data;
    
    // Check if the QR code contains a Google Form URL
    if (qrData.includes('forms.google.com') || qrData.includes('docs.google.com/forms')) {
      Alert.alert(
        'QR Code Detected',
        'This QR code contains a Google Form. Would you like to open it?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsScanning(true),
          },
          {
            text: 'Open Form',
            onPress: () => {
              Linking.openURL(qrData);
              // After opening the form, suggest creating an account
              setTimeout(() => {
                Alert.alert(
                  'Complete the Form',
                  'Please complete the Google Form and then create an account to link your responses.',
                  [
                    {
                      text: 'Create Account',
                      onPress: () => navigation.navigate('Register'),
                    },
                    {
                      text: 'Sign In',
                      onPress: () => navigation.navigate('Login'),
                    },
                  ]
                );
              }, 1000);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Invalid QR Code',
        'This QR code does not contain a valid Google Form URL.',
        [
          {
            text: 'Try Again',
            onPress: () => setIsScanning(true),
          },
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Requesting Camera Permission...</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Camera Permission Required</Text>
            <Text style={styles.subtitle}>
              Moonlight Match needs camera access to scan QR codes for event registration.
            </Text>
            <Button
              mode="contained"
              onPress={requestCameraPermission}
              style={styles.button}
              labelStyle={styles.buttonText}
            >
              Grant Permission
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              labelStyle={styles.backButtonText}
            >
              Go Back
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isScanning ? (
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.auto}
          topContent={
            <View style={styles.topContent}>
              <Text style={styles.topText}>Scan the QR Code</Text>
              <Text style={styles.subText}>
                Point your camera at the QR code provided at the event
              </Text>
            </View>
          }
          bottomContent={
            <View style={styles.bottomContent}>
              <Text style={styles.bottomText}>
                This will open a Google Form to complete your registration
              </Text>
            </View>
          }
          containerStyle={styles.scannerContainer}
          cameraStyle={styles.camera}
        />
      ) : (
        <View style={styles.pausedContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>QR Code Scanned</Text>
              <Text style={styles.subtitle}>
                The Google Form should have opened in your browser. 
                Complete the form and then create an account to link your responses.
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Register')}
                style={styles.button}
                labelStyle={styles.buttonText}
              >
                Create Account
              </Button>
              <Button
                mode="outlined"
                onPress={() => setIsScanning(true)}
                style={styles.backButton}
                labelStyle={styles.backButtonText}
              >
                Scan Another Code
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181c24',
  },
  scannerContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  topContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  topText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  bottomContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  pausedContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181c24',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonText: {
    color: '#181c24',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    borderColor: '#D4AF37',
    borderRadius: 25,
  },
  backButtonText: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default QRScannerScreen; 