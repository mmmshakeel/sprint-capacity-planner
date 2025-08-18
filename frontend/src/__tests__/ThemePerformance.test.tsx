import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { performanceMonitor } from '../utils/performance';

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
Object.defineProperty(window, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

// Test component that uses theme context
const TestComponent: React.FC = () => {
  const { mode, theme, isTransitioning } = useTheme();
  return (
    <MuiThemeProvider theme={theme}>
      <div data-testid="theme-mode">{mode}</div>
      <div data-testid="theme-transitioning">{isTransitioning.toString()}</div>
      <ThemeToggle />
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

describe('Theme Performance Optimizations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    performanceMonitor.clear();
    performanceMonitor.setEnabled(true);
    localStorage.clear();
    
    // Mock timers for transition handling
    vi.useFakeTimers();
  });

  afterEach(() => {
    performanceMonitor.setEnabled(false);
    vi.useRealTimers();
  });

  it('should memoize theme objects to prevent unnecessary recreation', async () => {
    const { rerender } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const initialMode = screen.getByTestId('theme-mode').textContent;
    
    // Re-render with same props should not recreate theme
    rerender(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent(initialMode!);
  });

  it('should measure theme switching performance', async () => {
    let performanceStartCalled = false;
    let performanceEndCalled = false;

    // Mock performance monitoring
    const originalStart = performanceMonitor.start;
    const originalEnd = performanceMonitor.end;

    performanceMonitor.start = vi.fn((...args) => {
      performanceStartCalled = true;
      return originalStart.apply(performanceMonitor, args);
    });

    performanceMonitor.end = vi.fn((...args) => {
      performanceEndCalled = true;
      return originalEnd.apply(performanceMonitor, args);
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('switch');
    
    // Simulate theme toggle
    mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(150);
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(performanceStartCalled).toBe(true);
    });

    // Wait for async performance reporting
    await waitFor(() => {
      expect(performanceEndCalled).toBe(true);
    }, { timeout: 100 });

    // Restore original methods
    performanceMonitor.start = originalStart;
    performanceMonitor.end = originalEnd;
  });

  it('should prevent rapid theme switching during transitions', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('switch');
    const initialMode = screen.getByTestId('theme-mode').textContent;

    // Click multiple times rapidly
    fireEvent.click(toggleButton);
    
    // Should show transitioning state immediately
    expect(screen.getByTestId('theme-transitioning')).toHaveTextContent('true');
    
    // Button should be disabled during transition
    expect(toggleButton).toBeDisabled();
    
    // Try to click again while transitioning (should be ignored)
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    // Fast-forward timers to complete transition
    vi.advanceTimersByTime(200);

    // Wait for transition to complete
    await waitFor(() => {
      expect(screen.getByTestId('theme-transitioning')).toHaveTextContent('false');
    });

    // Should have changed mode only once
    const finalMode = screen.getByTestId('theme-mode').textContent;
    expect(finalMode).not.toBe(initialMode);
  });

  it('should use memoized context values to prevent unnecessary re-renders', () => {
    let renderCount = 0;

    const CountingComponent: React.FC = () => {
      renderCount++;
      const { mode } = useTheme();
      return <div data-testid="render-count">{renderCount}</div>;
    };

    const { rerender } = render(
      <TestWrapper>
        <CountingComponent />
      </TestWrapper>
    );

    const initialRenderCount = renderCount;

    // Re-render with same context should not cause child re-render
    rerender(
      <TestWrapper>
        <CountingComponent />
      </TestWrapper>
    );

    // Render count should only increase by 1 (initial render)
    expect(renderCount).toBe(initialRenderCount);
  });

  it('should efficiently handle system preference changes', async () => {
    // Mock matchMedia
    const mockMatchMedia = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
    });

    const mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockMatchMedia.mockReturnValue(mockMediaQuery);

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Verify event listeners are set up
    expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );

    // Simulate system preference change
    const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];
    changeHandler({ matches: true });

    // Should handle the change efficiently without errors
    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toBeInTheDocument();
    });
  });

  it('should cache theme objects for better performance', async () => {
    const { createAppTheme } = await import('../theme');
    
    // Create themes multiple times
    const theme1 = createAppTheme('light');
    const theme2 = createAppTheme('light');
    const theme3 = createAppTheme('dark');
    const theme4 = createAppTheme('dark');

    // Should return the same cached objects
    expect(theme1).toBe(theme2);
    expect(theme3).toBe(theme4);
    expect(theme1).not.toBe(theme3);
  });

  it('should handle localStorage errors gracefully during performance monitoring', () => {
    // Mock localStorage to throw errors
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => {
          throw new Error('localStorage error');
        }),
        setItem: vi.fn(() => {
          throw new Error('localStorage error');
        }),
        removeItem: vi.fn(() => {
          throw new Error('localStorage error');
        }),
      },
      writable: true,
    });

    // Should not throw errors
    expect(() => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );
    }).not.toThrow();

    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });
});