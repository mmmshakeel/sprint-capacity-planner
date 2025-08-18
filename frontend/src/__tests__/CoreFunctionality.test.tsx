import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { Button, Typography } from '@mui/material';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { ThemeToggle } from '../components/ThemeToggle';

// Simple test component
const TestComponent: React.FC = () => {
  const { theme, mode } = useTheme();
  
  return (
    <MuiThemeProvider theme={theme}>
      <div data-testid="test-container">
        <Typography data-testid="typography">Test Text</Typography>
        <Button data-testid="button" variant="contained">Test Button</Button>
        <div data-testid="current-mode">{mode}</div>
        <ThemeToggle />
      </div>
    </MuiThemeProvider>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AccessibilityProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </AccessibilityProvider>
);

describe('Core Theme Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render MUI components correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('typography')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('should use MUI default text transform (none)', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const button = screen.getByTestId('button');
    const computedStyle = window.getComputedStyle(button);
    
    // Should use 'none' instead of 'uppercase'
    expect(computedStyle.textTransform).toBe('none');
  });

  it('should have proper theme context', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const modeDisplay = screen.getByTestId('current-mode');
    expect(modeDisplay).toHaveTextContent(/^(light|dark)$/);
  });

  it('should have accessible theme toggle', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('switch');
    
    expect(toggleButton).toHaveAttribute('aria-label');
    expect(toggleButton).toHaveAttribute('aria-pressed');
    expect(toggleButton).toHaveAttribute('aria-describedby');
  });

  it('should handle theme toggle click', async () => {
    // Use real timers for this test
    vi.useRealTimers();
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('switch');
    const modeDisplay = screen.getByTestId('current-mode');
    
    const initialMode = modeDisplay.textContent;
    
    // Click the toggle
    fireEvent.click(toggleButton);
    
    // Wait for the transition to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mode should have changed
    const newMode = modeDisplay.textContent;
    expect(newMode).not.toBe(initialMode);
    expect(newMode).toMatch(/^(light|dark)$/);
    
    // Restore fake timers
    vi.useFakeTimers();
  });

  it('should persist theme preference', async () => {
    vi.useRealTimers();
    
    // Set up spy before rendering
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('switch');
    
    fireEvent.click(toggleButton);
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(setItemSpy).toHaveBeenCalledWith('theme-preference', expect.any(String));
    
    setItemSpy.mockRestore();
    vi.useFakeTimers();
  });

  it('should restore theme from localStorage', () => {
    // Mock localStorage before rendering
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'theme-preference') return 'dark';
      return null;
    });
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const modeDisplay = screen.getByTestId('current-mode');
    expect(modeDisplay).toHaveTextContent('dark');
    
    getItemSpy.mockRestore();
  });

  it('should handle missing localStorage gracefully', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage error');
    });

    expect(() => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should provide screen reader descriptions', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const description = screen.getByText(/Toggle between light and dark theme/);
    expect(description).toBeInTheDocument();
  });

  it('should update button styles with theme', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const button = screen.getByTestId('button');
    const computedStyle = window.getComputedStyle(button);
    
    // Should have theme-based styling
    expect(computedStyle.backgroundColor).toBeTruthy();
    expect(computedStyle.color).toBeTruthy();
  });
});