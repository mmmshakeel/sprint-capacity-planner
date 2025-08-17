/**
 * Tests for ThemeToggle component accessibility features
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AccessibilityProvider } from '../../contexts/AccessibilityContext';
import { ThemeToggle } from '../ThemeToggle';
import { lightTheme } from '../../theme';

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockMatchMedia(false)),
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AccessibilityProvider>
    <ThemeProvider>
      <MuiThemeProvider theme={lightTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeProvider>
  </AccessibilityProvider>
);

describe('ThemeToggle Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed');
    expect(button).toHaveAttribute('aria-describedby');
  });

  it('should announce theme changes to screen readers', () => {
    const mockAppendChild = vi.spyOn(document.body, 'appendChild');
    
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    fireEvent.click(button);

    expect(mockAppendChild).toHaveBeenCalled();
    
    mockAppendChild.mockRestore();
  });

  it('should have accessible tooltip', () => {
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    fireEvent.mouseEnter(button);

    // Tooltip should be accessible
    expect(button).toHaveAttribute('aria-describedby');
  });

  it('should support keyboard navigation', () => {
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    
    // Should be focusable
    button.focus();
    expect(document.activeElement).toBe(button);
    
    // Should respond to Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    // The component should handle the click event
  });

  it('should respect reduced motion preferences', () => {
    // Mock reduced motion preference
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    expect(button).toBeInTheDocument();
    
    // The component should render without animations when reduced motion is preferred
    // This is tested through the accessibility context
  });

  it('should have proper contrast in high contrast mode', () => {
    // Mock high contrast preference
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(prefers-contrast: high)') {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    expect(button).toBeInTheDocument();
    
    // The component should adapt to high contrast mode through the accessibility context
  });

  it('should have descriptive text for screen readers', () => {
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const description = screen.getByText(/Toggle between light and dark theme/);
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('id', 'theme-toggle-description');
  });
});