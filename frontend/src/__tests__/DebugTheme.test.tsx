import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';

// Simple debug component
const DebugComponent: React.FC = () => {
  const { mode, toggleTheme, isTransitioning } = useTheme();
  
  return (
    <div>
      <div data-testid="current-mode">{mode}</div>
      <div data-testid="is-transitioning">{isTransitioning.toString()}</div>
      <button 
        data-testid="debug-toggle" 
        onClick={toggleTheme}
        disabled={isTransitioning}
      >
        Toggle Theme
      </button>
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AccessibilityProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </AccessibilityProvider>
);

describe('Debug Theme Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should debug theme toggle functionality', async () => {
    render(
      <TestWrapper>
        <DebugComponent />
      </TestWrapper>
    );

    const modeDisplay = screen.getByTestId('current-mode');
    const transitionDisplay = screen.getByTestId('is-transitioning');
    const toggleButton = screen.getByTestId('debug-toggle');
    
    console.log('Initial mode:', modeDisplay.textContent);
    console.log('Initial transitioning:', transitionDisplay.textContent);
    console.log('Button disabled:', (toggleButton as HTMLButtonElement).disabled);
    
    const initialMode = modeDisplay.textContent;
    
    // Click the toggle
    fireEvent.click(toggleButton);
    
    console.log('After click mode:', modeDisplay.textContent);
    console.log('After click transitioning:', transitionDisplay.textContent);
    console.log('After click button disabled:', (toggleButton as HTMLButtonElement).disabled);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('After wait mode:', modeDisplay.textContent);
    console.log('After wait transitioning:', transitionDisplay.textContent);
    console.log('After wait button disabled:', (toggleButton as HTMLButtonElement).disabled);
    
    const finalMode = modeDisplay.textContent;
    expect(finalMode).not.toBe(initialMode);
  });
});