/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import App from '../App';

// Mock the AuthContext
jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
  })),
}));

// Mock react-native-paper to avoid SafeArea issues
jest.mock('react-native-paper', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('App Component', () => {
  it('renders correctly', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    
    await act(async () => {
      tree = ReactTestRenderer.create(<App />);
    });
    
    expect(tree!).toBeTruthy();
  });

  it('renders without crashing', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    
    await act(async () => {
      tree = ReactTestRenderer.create(<App />);
    });
    
    // Just check that the tree exists, don't call toJSON()
    expect(tree!).toBeTruthy();
    
    // Optional: Check if the tree has any children
    const instance = tree!.root;
    expect(instance).toBeTruthy();
  });
});
