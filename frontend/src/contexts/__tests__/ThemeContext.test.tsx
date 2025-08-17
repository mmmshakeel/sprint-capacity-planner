/**
 * Unit tests for ThemeContext
 * Tests theme switching functionality, localStorage persistence, and system preference detection
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock the theme creation function
vi.mock('../../theme', () => ({
  createAppTheme: vi.fn((mode: 'light' | 'dark') => ({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#1976d2' : '#90caf9' },
    },
  })),
}));

// Mock accessibility utils
vi.mock('../../utils/accessibility', () => ({
  prefersReducedMotion: vi.fn(() => false),
}));

// Test component to access theme context
const TestComponent: React.FC = () => {
  const {
    mode,
    theme,
    userPreference,
    toggleTheme,
    setThemePreference,
    isTransitioning,
    reducedMotion,
  } = useTheme();

  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="user-preference">{userPreference}</div>
      <div data-testid="theme-primary">{theme.palette.primary.main}</div>
      <div data-testid="is-transitioning">{isTransitioning.toString()}</div>
      <div data-testid="reduced-motion">{reducedMotion.toString()}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button
        data-testid="set-light"
        onClick={() => setThemePreference('light')}
      >
        Set Light
      </button>
      <button
        data-testid="set-dark"
        onClick={() => setThemePreference('dark')}
      >
        Set Dark
      </button>
      <button
        data-testid="set-system"
        onClick={() => setThemePreference('system')}
      >
        Set System
      </button>
    </div>
  );
};

// Mock matchMedia
const createMockMatchMedia = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('ThemeContext', () => {
  let mockMatchMedia: ReturnType<typeof createMockMatchMedia>;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    // Mock matchMedia with light theme as default
    mockMatchMedia = createMockMatchMedia(false);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        if (query === '(prefers-color-scheme: dark)') {
          return mockMatchMedia;
        }
        if (query === '(prefers-reduced-motion: reduce)') {
          return createMockMatchMedia(false);
        }
        return createMockMatchMedia(false);
      }),
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with system preference when no stored preference exists', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
      expect(screen.getByTestId('user-preference')).toHaveTextContent('system');
    });

    it('should initialize with stored preference when available', () => {
      mockLocalStorage['theme-preference'] = 'dark';

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('user-preference')).toHaveTextContent('dark');
    });

    it('should fallback to system preference when stored preference is invalid', () => {
      mockLocalStorage['theme-preference'] = 'invalid';

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
      expect(screen.getByTestId('user-preference')).toHaveTextContent('system');
    });

    it('should detect dark system preference', () => {
      mockMatchMedia.matches = true;

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });
  });

  describe('Theme Switching', () => {
    it('should toggle between light and dark themes', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Initial state should be light
      expect(screen.getByTestId('mode')).toHaveTextContent('light');

      // Toggle to dark
      act(() => {
        screen.getByTestId('toggle-theme').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
        expect(screen.getByTestId('user-preference')).toHaveTextContent('dark');
      });

      // Toggle back to light
      act(() => {
        screen.getByTestId('toggle-theme').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
        expect(screen.getByTestId('user-preference')).toHaveTextContent('light');
      });
    });

    it('should set specific theme preferences', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Set to dark
      act(() => {
        screen.getByTestId('set-dark').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
        expect(screen.getByTestId('user-preference')).toHaveTextContent('dark');
      });

      // Set to light
      act(() => {
        screen.getByTestId('set-light').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
        expect(screen.getByTestId('user-preference')).toHaveTextContent('light');
      });

      // Set to system
      act(() => {
        screen.getByTestId('set-system').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-preference')).toHaveTextContent('system');
        // Mode should match system preference (light in this case)
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
      });
    });

    it('should update theme object when mode changes', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Initial light theme
      expect(screen.getByTestId('theme-primary')).toHaveTextContent('#1976d2');

      // Switch to dark
      act(() => {
        screen.getByTestId('toggle-theme').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('theme-primary')).toHaveTextContent('#90caf9');
      });
    });
  });

  describe('localStorage Persistence', () => {
    it('should save theme preference to localStorage', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId('set-dark').click();
      });

      await waitFor(() => {
        expect(window.localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
      });
    });

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw an error
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (window.localStorage.setItem as any).mockImplementation(() => {
        throw new Error('localStorage error');
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId('set-dark').click();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to save theme preference to localStorage:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle corrupted localStorage gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (window.localStorage.getItem as any).mockImplementation(() => {
        throw new Error('localStorage read error');
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should fallback to system preference
      expect(screen.getByTestId('user-preference')).toHaveTextContent('system');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to read theme preference from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('System Preference Detection', () => {
    it('should respond to system theme changes when preference is system', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Initial state with system preference (light)
      expect(screen.getByTestId('mode')).toHaveTextContent('light');
      expect(screen.getByTestId('user-preference')).toHaveTextContent('system');

      // Simulate system theme change to dark
      act(() => {
        mockMatchMedia.matches = true;
        // Trigger the change event
        const changeHandler = (window.matchMedia as any).mock.calls
          .find((call: any[]) => call[0] === '(prefers-color-scheme: dark)')
          ?.[0];
        
        if (mockMatchMedia.addEventListener) {
          const addEventListenerCalls = mockMatchMedia.addEventListener.mock.calls;
          const changeListener = addEventListenerCalls.find(
            (call: any[]) => call[0] === 'change'
          )?.[1];
          
          if (changeListener) {
            changeListener({ matches: true });
          }
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      });
    });

    it('should not respond to system theme changes when preference is explicit', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Set explicit light preference
      act(() => {
        screen.getByTestId('set-light').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
        expect(screen.getByTestId('user-preference')).toHaveTextContent('light');
      });

      // Simulate system theme change to dark
      act(() => {
        mockMatchMedia.matches = true;
        if (mockMatchMedia.addEventListener) {
          const addEventListenerCalls = mockMatchMedia.addEventListener.mock.calls;
          const changeListener = addEventListenerCalls.find(
            (call: any[]) => call[0] === 'change'
          )?.[1];
          
          if (changeListener) {
            changeListener({ matches: true });
          }
        }
      });

      // Should remain light because preference is explicit
      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });

    it('should handle missing matchMedia gracefully', () => {
      // Remove matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should default to light theme
      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });
  });

  describe('Transition Management', () => {
    it('should set transitioning state during theme changes', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for initial render to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
      });

      // Toggle theme
      act(() => {
        screen.getByTestId('toggle-theme').click();
      });

      // Should be transitioning immediately after change
      expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true');

      // Should stop transitioning after timeout
      await waitFor(() => {
        expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
      }, { timeout: 200 });
    });

    it('should handle reduced motion preferences', async () => {
      // Mock reduced motion preference
      const { prefersReducedMotion } = await import('../../utils/accessibility');
      vi.mocked(prefersReducedMotion).mockReturnValue(true);

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
    });
  });

  describe('Focus Management', () => {
    it('should preserve focus during theme transitions', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('toggle-theme');
      
      // Focus the button
      act(() => {
        toggleButton.focus();
      });

      expect(document.activeElement).toBe(toggleButton);

      // Toggle theme
      act(() => {
        toggleButton.click();
      });

      // Focus should be preserved after theme change
      await waitFor(() => {
        expect(document.activeElement).toBe(toggleButton);
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useTheme is used outside provider', () => {
      const TestComponentWithoutProvider = () => {
        useTheme();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });
  });
});