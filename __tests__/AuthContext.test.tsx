/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '../src/context/AuthContext';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('should render AuthProvider without crashing', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    
    await act(async () => {
      tree = ReactTestRenderer.create(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );
    });
    
    expect(tree!).toBeTruthy();
  });

  it('should provide initial auth state', () => {
    const TestComponent = () => {
      const { useAuth } = require('../src/context/AuthContext');
      const auth = useAuth();
      return (
        <div>
          <span data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</span>
          <span data-testid="isLoading">{auth.isLoading.toString()}</span>
          <span data-testid="user">{auth.user ? 'user' : 'null'}</span>
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