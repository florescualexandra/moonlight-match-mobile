// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock react-native-camera
jest.mock('react-native-camera', () => ({
  RNCamera: 'RNCamera',
}));

// Mock react-native-qrcode-scanner
jest.mock('react-native-qrcode-scanner', () => 'QRCodeScanner');

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    CAMERA: 'android.permission.CAMERA',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  request: jest.fn(),
  check: jest.fn(),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const SafeAreaContext = React.createContext({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // Attach Provider and Consumer to the context itself
  SafeAreaContext.Provider = ({ children }) => children;
  SafeAreaContext.Consumer = ({ children }) =>
    children({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
    });

  return {
    __esModule: true,
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: SafeAreaContext.Consumer,
    SafeAreaContext,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    default: SafeAreaContext,
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Path: 'Path',
  Circle: 'Circle',
  Rect: 'Rect',
}));

// Mock @react-navigation/elements
jest.mock('@react-navigation/elements', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/elements'),
    SafeAreaProviderCompat: ({ children }) => children,
  };
});

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => {
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: ({ children }) => children,
    }),
  };
});

// Mock all screen components
jest.mock('./src/screens/HomeScreen', () => 'HomeScreen');
jest.mock('./src/screens/LoginScreen', () => 'LoginScreen');
jest.mock('./src/screens/RegisterScreen', () => 'RegisterScreen');
jest.mock('./src/screens/QRScannerScreen', () => 'QRScannerScreen');
jest.mock('./src/screens/UserDashboardScreen', () => 'UserDashboardScreen');
jest.mock('./src/screens/MatchesScreen', () => 'MatchesScreen');
jest.mock('./src/screens/ChatScreen', () => 'ChatScreen');
jest.mock('./src/screens/AdminDashboardScreen', () => 'AdminDashboardScreen');
jest.mock('./src/screens/AdminMatchingScreen', () => 'AdminMatchingScreen');
// jest.mock('./src/screens/LoadingScreen', () => 'LoadingScreen');

// Mock react-native-paper's Text component for testing
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  return {
    ...RealModule,
    Text: ({ children }) => <text>{children}</text>,
    Provider: ({ children }) => children,
  };
});

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}; 