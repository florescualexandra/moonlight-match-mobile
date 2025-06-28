# Moonlight Match Mobile App

A React Native mobile application that mirrors the functionality of the Moonlight Match website, providing a complete event matching and chat experience for users and administrators.

## Features

### User Features
- **QR Code Scanner**: Scan QR codes at events to access Google Forms
- **User Registration & Authentication**: Create accounts and sign in
- **Match Discovery**: View your top compatibility matches
- **Match Revealing**: Pay to reveal additional matches with photos and details
- **Real-time Chat**: Message your matches directly in the app
- **Profile Management**: View and manage your profile information

### Admin Features
- **Event Management**: Monitor and control event registration
- **Matching Control**: Start and monitor the AI matching process
- **Match Distribution**: Send matches to users when ready
- **Real-time Monitoring**: Track matching progress and statistics

## Workflow

1. **Event Registration**: Users buy tickets and receive QR codes
2. **QR Code Scanning**: Users scan QR codes to access Google Forms
3. **Form Completion**: Users complete forms and create accounts
4. **Admin Control**: Admin starts matching process when ready
5. **Match Distribution**: Admin sends top 3 matches to all users
6. **Additional Reveals**: Users can pay to reveal 2 more matches
7. **Chat & Connection**: Users can chat with their revealed matches
8. **Data Cleanup**: User data is deleted after 24 hours (unless retention is opted in)

## Tech Stack

- **React Native**: 0.80.0
- **TypeScript**: For type safety
- **React Navigation**: For screen navigation
- **React Native Paper**: For UI components
- **AsyncStorage**: For local data persistence
- **QR Code Scanner**: For scanning event QR codes
- **React Native Camera**: For camera permissions

## Installation

1. **Prerequisites**
   - Node.js (>=18)
   - React Native CLI
   - Android Studio (for Android development)
   - Xcode (for iOS development, macOS only)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Android Setup**
   - Open Android Studio
   - Open the `android` folder
   - Sync Gradle files
   - Build the project

## Configuration

### API Endpoints
Update the API endpoints in the following files:
- `src/context/AuthContext.tsx`
- `src/screens/UserDashboardScreen.tsx`
- `src/screens/MatchesScreen.tsx`
- `src/screens/ChatScreen.tsx`
- `src/screens/AdminDashboardScreen.tsx`
- `src/screens/AdminMatchingScreen.tsx`

Replace `http://your-api-url` with your actual API endpoint.

### Environment Variables
Create a `.env` file in the root directory:
```
API_BASE_URL=http://your-api-url
```

## Running the App

### Development
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Production Build
```bash
# Android
cd android
./gradlew assembleRelease

# iOS (macOS only)
cd ios
xcodebuild -workspace MoonlightMatchMobile.xcworkspace -scheme MoonlightMatchMobile -configuration Release
```

## Project Structure

```
src/
├── context/
│   └── AuthContext.tsx          # Authentication state management
├── screens/
│   ├── HomeScreen.tsx           # Landing page
│   ├── LoginScreen.tsx          # User login
│   ├── RegisterScreen.tsx       # User registration
│   ├── QRScannerScreen.tsx      # QR code scanning
│   ├── UserDashboardScreen.tsx  # User dashboard
│   ├── MatchesScreen.tsx        # Match discovery
│   ├── ChatScreen.tsx           # Chat interface
│   ├── AdminDashboardScreen.tsx # Admin dashboard
│   ├── AdminMatchingScreen.tsx  # Matching control
│   └── LoadingScreen.tsx        # Loading screen
├── components/                  # Reusable components
├── services/                   # API services
├── types/                      # TypeScript type definitions
└── utils/                      # Utility functions
```

## Key Components

### Authentication Flow
- Uses AsyncStorage for token persistence
- Automatic login state restoration
- Secure token management

### Navigation
- Stack-based navigation
- Role-based screen access (User vs Admin)
- Protected routes

### QR Code Integration
- Camera permission handling
- Google Form URL validation
- Seamless form-to-account linking

### Real-time Features
- Polling-based message updates
- Live matching progress monitoring
- Real-time chat functionality

## Styling

The app uses a consistent design system with:
- **Primary Color**: #D4AF37 (Gold)
- **Background**: #181c24 (Dark)
- **Text Colors**: Various shades of gray
- **Card-based Layout**: Clean, modern interface
- **Responsive Design**: Adapts to different screen sizes

## Permissions

The app requires the following permissions:
- **Camera**: For QR code scanning
- **Storage**: For local data persistence
- **Network**: For API communication

## Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

## Deployment

### Android
1. Generate a signed APK or AAB
2. Upload to Google Play Console
3. Configure release settings

### iOS
1. Archive the project in Xcode
2. Upload to App Store Connect
3. Configure release settings

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build issues**
   ```bash
   cd android
   ./gradlew clean
   ```

3. **iOS build issues**
   ```bash
   cd ios
   pod deintegrate
   pod install
   ```

### Debug Mode
Enable debug mode by shaking the device or pressing Cmd+D (iOS) / Cmd+M (Android) in the simulator.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, contact the development team or refer to the project documentation.
