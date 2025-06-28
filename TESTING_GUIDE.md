# Moonlight Match Mobile App - Testing Guide

This guide covers all the different ways to test the Moonlight Match mobile application, from unit tests to manual testing on devices.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [Manual Testing](#manual-testing)
5. [Device Testing](#device-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Test Coverage](#test-coverage)
9. [Continuous Integration](#continuous-integration)

## Prerequisites

Before running tests, ensure you have:

```bash
# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

## Unit Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- AuthContext.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="login"
```

### Test Structure

Tests are located in the `__tests__` directory and follow this structure:

```
__tests__/
├── App.test.tsx              # Main app component tests
├── AuthContext.test.tsx      # Authentication context tests
├── components/               # Component-specific tests
├── screens/                  # Screen-specific tests
└── utils/                    # Utility function tests
```

### Writing Tests

#### Basic Component Test

```typescript
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider as PaperProvider } from 'react-native-paper';
import YourComponent from '../src/components/YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    const tree = ReactTestRenderer.create(
      <PaperProvider>
        <YourComponent />
      </PaperProvider>
    );
    
    expect(tree).toBeTruthy();
  });

  it('handles user interaction', () => {
    const tree = ReactTestRenderer.create(
      <PaperProvider>
        <YourComponent />
      </PaperProvider>
    );
    
    const instance = tree.root;
    const button = instance.findByProps({ testID: 'submit-button' });
    
    // Simulate button press
    button.props.onPress();
    
    expect(tree).toBeTruthy();
  });
});
```

#### Context Testing

```typescript
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AuthProvider } from '../src/context/AuthContext';

describe('AuthContext', () => {
  it('provides authentication state', () => {
    const TestComponent = () => {
      const { useAuth } = require('../src/context/AuthContext');
      const auth = useAuth();
      return (
        <div>
          <span>{auth.isAuthenticated.toString()}</span>
        </div>
      );
    };

    const tree = ReactTestRenderer.create(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(tree).toBeTruthy();
  });
});
```

## Integration Testing

### API Integration Tests

```typescript
// Mock API responses
global.fetch = jest.fn();

describe('API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles successful API calls', async () => {
    const mockResponse = { user: { id: 1, email: 'test@example.com' } };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Test your API call
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
    });

    expect(response.ok).toBe(true);
  });
});
```

## Manual Testing

### Development Testing

```bash
# Start Metro bundler
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator/device (macOS only)
npm run ios
```

### Testing Checklist

#### Authentication Flow
- [ ] App launches to home screen
- [ ] Login screen displays correctly
- [ ] Registration screen works
- [ ] QR scanner opens and functions
- [ ] Authentication state persists after app restart

#### User Features
- [ ] Dashboard displays user information
- [ ] Matches screen shows available matches
- [ ] Chat functionality works
- [ ] Profile management works
- [ ] Payment flow for additional reveals

#### Admin Features
- [ ] Admin dashboard loads correctly
- [ ] Matching control panel functions
- [ ] User management works
- [ ] Event monitoring displays data

#### Navigation
- [ ] Stack navigation works correctly
- [ ] Back button functions properly
- [ ] Screen transitions are smooth
- [ ] Role-based access control works

## Device Testing

### Android Testing

#### Physical Device
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Run `npm run android`

#### Emulator
1. Open Android Studio
2. Create/start an Android Virtual Device (AVD)
3. Run `npm run android`

### iOS Testing

#### Physical Device (macOS only)
1. Connect iPhone via USB
2. Trust the computer on your iPhone
3. Run `npm run ios`

#### Simulator (macOS only)
1. Open Xcode
2. Start iOS Simulator
3. Run `npm run ios`

### Testing on Different Screen Sizes

Test on various device sizes:
- iPhone SE (small)
- iPhone 12/13/14 (medium)
- iPhone 12/13/14 Pro Max (large)
- iPad (tablet)

## Performance Testing

### React Native Performance Monitor

```bash
# Enable performance monitoring
npx react-native run-android --variant=release
npx react-native run-ios --configuration=Release
```

### Memory Usage Testing

1. Use React Native Debugger
2. Monitor memory usage in Xcode/Android Studio
3. Check for memory leaks during navigation

### Network Performance

```typescript
// Test API response times
const startTime = Date.now();
const response = await fetch('/api/endpoint');
const endTime = Date.now();

console.log(`API call took ${endTime - startTime}ms`);
```

## Security Testing

### Authentication Security
- [ ] JWT tokens are properly stored
- [ ] Tokens expire correctly
- [ ] Logout clears all sensitive data
- [ ] API calls include proper headers

### Data Security
- [ ] Sensitive data is not logged
- [ ] AsyncStorage is properly secured
- [ ] Network calls use HTTPS
- [ ] Input validation prevents injection

### Permission Testing
- [ ] Camera permissions are requested properly
- [ ] Storage permissions work correctly
- [ ] Network permissions are handled

## Test Coverage

### Running Coverage

```bash
# Generate coverage report
npm test -- --coverage --coverageReporters=text --coverageReporters=html

# View coverage in browser
open coverage/lcov-report/index.html
```

### Coverage Targets

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

### Improving Coverage

1. Add tests for untested components
2. Test error handling paths
3. Test edge cases
4. Mock external dependencies

## Continuous Integration

### GitHub Actions Example

```yaml
name: Mobile App Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run tests
      run: npm test -- --coverage
      
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

## Debugging Tests

### Common Issues

1. **AsyncStorage not mocked**
   ```typescript
   jest.mock('@react-native-async-storage/async-storage', () =>
     require('@react-native-async-storage/async-storage/jest/async-storage-mock')
   );
   ```

2. **Navigation not working in tests**
   ```typescript
   jest.mock('@react-navigation/native', () => ({
     NavigationContainer: ({ children }) => children,
   }));
   ```

3. **Native modules not mocked**
   ```typescript
   jest.mock('react-native-camera', () => ({
     RNCamera: 'RNCamera',
   }));
   ```

### Debug Mode

```bash
# Run tests in debug mode
npm test -- --verbose --detectOpenHandles
```

## Best Practices

1. **Test Structure**
   - Use descriptive test names
   - Group related tests in describe blocks
   - Keep tests independent

2. **Mocking**
   - Mock external dependencies
   - Use realistic mock data
   - Reset mocks between tests

3. **Assertions**
   - Test one thing per test
   - Use specific assertions
   - Test both success and failure cases

4. **Performance**
   - Keep tests fast
   - Avoid unnecessary setup
   - Use appropriate timeouts

## Troubleshooting

### Common Problems

1. **Tests failing on CI but passing locally**
   - Check for platform-specific code
   - Ensure all dependencies are mocked
   - Verify environment variables

2. **Slow test execution**
   - Reduce test data size
   - Mock heavy operations
   - Use appropriate timeouts

3. **Memory leaks in tests**
   - Clean up after each test
   - Unmount components properly
   - Clear timers and intervals

### Getting Help

- Check the [React Native Testing documentation](https://reactnative.dev/docs/testing)
- Review Jest configuration in `jest.config.js`
- Check mock setup in `jest.setup.js`
- Consult the React Native community forums

## Next Steps

1. **Add more comprehensive tests**
   - Screen navigation tests
   - API integration tests
   - Error handling tests

2. **Implement E2E testing**
   - Consider Detox for E2E tests
   - Test complete user workflows
   - Test on multiple devices

3. **Performance monitoring**
   - Add performance benchmarks
   - Monitor app startup time
   - Track memory usage

4. **Automated testing**
   - Set up CI/CD pipeline
   - Automated device testing
   - Performance regression testing 