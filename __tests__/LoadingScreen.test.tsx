import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import LoadingScreen from '../src/screens/LoadingScreen';

describe('LoadingScreen', () => {
  it('renders loading text', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined = undefined;
    act(() => {
      tree = ReactTestRenderer.create(<LoadingScreen />);
    });
    expect(tree).toBeDefined();
    const json = tree!.toJSON();
    expect(JSON.stringify(json)).toContain('Loading Moonlight Match');
  });
}); 