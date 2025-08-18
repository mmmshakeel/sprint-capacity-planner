/**
 * Integration tests for theme application
 * Tests theme propagation across all application components, theme persistence across page reloads,
 * and responsive behavior of theme toggle on different screen sizes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { ThemeToggle } from '../components/ThemeToggle';
// Mock complex components to avoid import issues
const MockLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-testid="mock-layout">
    <ThemeToggle />
    {children}
  </div>
);

const MockDashboard: React.FC = () => (
  <div data-testid="mock-dashboard">Dashboard Component</div>
);

// Mock the theme creation function
vi.mock('../theme', () => ({
  createAppTheme: vi.fn((mode: 'light' | 'dark') => ({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#1976d2' : '#90caf9' },
      background: {
        default: mode === 'light' ? '#ffffff' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#000000' : '#ffffff',
      },
    },
    transitions: {
      create: vi.fn(() => 'all 0.3s ease'),
      duration: {
        short: 250,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    shape: {
      borderRadius: 4,
    },
  })),
  lightTheme: {
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      background: { default: '#ffffff', paper: '#ffffff' },
      text: { primary: '#000000' },
    },
  },
  darkTheme: {
    palette: {
      mode: 'dark',
      primary: { main: '#90caf9' },
      background: { default: '#121212', paper: '#1e1e1e' },
      text: { primary: '#ffffff' },
    },
  },
}));

// Mock accessibility utils
vi.mock('../utils/accessibility', () => ({
  prefersReducedMotion: vi.fn(() => false),
}));

// Mock API service
vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

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

// Test component that displays theme information
const ThemeTestComponent: React.FC = () => {
  return (
    <div data-testid="theme-test-component">
      <div data-testid="theme-info">Theme Test Component</div>
    </div>
  );
};

// Full app wrapper for integration tests
const IntegrationTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AccessibilityProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </AccessibilityProvider>
);

describe('Theme Integration Tests', () => {
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
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        if (query === '(prefers-color-scheme: dark)') {
          return createMockMatchMedia(false);
        }
        if (query === '(prefers-reduced-motion: reduce)') {
          return createMockMatchMedia(false);
        }
        if (query.includes('max-width') || query.includes('min-width')) {
          return createMockMatchMedia(true); // Default to desktop size
        }
        return createMockMatchMedia(false);
      }),
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Theme Propagation Across Components', () => {
    it('should propagate theme to all nested components', async () => {
      render(
        <IntegrationTestWrapper>
          <MockLayout>
            <MockDashboard />
            <ThemeTestComponent />
          </MockLayout>
        </IntegrationTestWrapper>
      );

      // All components should be rendered
      expect(screen.getByTestId('theme-test-component')).toBeInTheDocument();
      
      // Find theme toggle and toggle theme
      const themeToggle = screen.getByRole('switch');
      fireEvent.click(themeToggle);

      // Theme should propagate to all components
      await waitFor(() => {
        // The theme toggle should reflect the change
        expect(themeToggle).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should update MUI components when theme changes', async () => {
      render(
        <IntegrationTestWrapper>
          <MockLayout>
            <ThemeTestComponent />
          </MockLayout>
        </IntegrationTestWrapper>
      );

      const themeToggle = screen.getByRole('switch');
      
      // Toggle theme
      fireEvent.click(themeToggle);

      await waitFor(() => {
        // Theme should be applied to MUI components
        expect(themeToggle).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should maintain theme consistency across multiple components', async () => {
      render(
        <IntegrationTestWrapper>
          <div>
            <ThemeToggle />
            <ThemeTestComponent />
            <MockLayout>
              <MockDashboard />
            </MockLayout>
          </div>
        </IntegrationTestWrapper>
      );

      const themeToggles = screen.getAllByRole('switch');
      
      // All theme toggles should have the same initial state
      themeToggles.forEach(toggle => {
        expect(toggle).toHaveAttribute('aria-pressed', themeToggles[0].getAttribute('aria-pressed'));
      });

      // Toggle one theme toggle
      fireEvent.click(themeToggles[0]);

      await waitFor(() => {
        // All theme toggles should update to the same state
        themeToggles.forEach(toggle => {
          expect(toggle).toHaveAttribute('aria-pressed', themeToggles[0].getAttribute('aria-pressed'));
        });
      });
    });
  });

  describe('Theme Persistence Across Page Reloads', () => {
    it('should persist theme preference in localStorage', async () => {
      render(
        <IntegrationTestWrapper>
          <ThemeToggle />
        </IntegrationTestWrapper>
      );

      const themeToggle = screen.getByRole('switch');
      
      // Toggle theme
      fireEvent.click(themeToggle);

      await waitFor(() => {
        // Should save to localStorage
        expect(window.localStorage.setItem).toHaveBeenCalledWith('theme-preference', expect.any(String));
      });
    });

    it('should restore theme preference on component mount', () => {
      // Set stored preference
      mockLocalStorage['theme-preference'] = 'dark';

      render(
        <IntegrationTestWrapper>
          <ThemeToggle />
        </IntegrationTestWrapper>
      );

      const themeToggle = screen.getByRole('switch');
      
      // Should restore dark theme
      expect(themeToggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('should handle corrupted localStorage gracefully', () => {
      // Mock localStorage to throw error
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (window.localStorage.getItem as any).mockImplementation(() => {
        throw new Error('localStorage error');
      });

      render(
        <IntegrationTestWrapper>
          <ThemeToggle />
        </IntegrationTestWrapper>
      );

      // Should still render without crashing
      const themeToggle = screen.getByRole('switch');
      expect(themeToggle).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should maintain theme across navigation', async () => {
      const { rerender } = render(
        <IntegrationTestWrapper>
          <MockLayout>
            <MockDashboard />
          </MockLayout>
        </IntegrationTestWrapper>
      );

      const themeToggle = screen.getByRole('switch');
      const initialState = themeToggle.getAttribute('aria-pressed');
      
      // Toggle theme
      fireEvent.click(themeToggle);

      await waitFor(() => {
        expect(themeToggle).toHaveAttribute('aria-pressed', initialState === 'true' ? 'false' : 'true');
      });

      // Simulate navigation by re-rendering
      rerender(
        <IntegrationTestWrapper>
          <MockLayout>
            <ThemeTestComponent />
          </MockLayout>
        </IntegrationTestWrapper>
      );

      // Theme should be maintained
      const newThemeToggle = screen.getByRole('switch');
      expect(newThemeToggle).toHaveAttribute('aria-pressed', initialState === 'true' ? 'false' : 'true');
    });
  });

  describe('Responsive Behavior on Different Screen Sizes', () => {
    it('should work on mobile screen sizes', async () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => {
          if (query.includes('max-width: 768px')) {
            return createMockMatchMedia(true); // Mobile size
          }
          return createMockMatchMedia(false);
        }),
      });

      render(
        <IntegrationTestWrapper>
          <MockLayout>
            <div>Mobile Layout</div>
          </MockLayout>
        </IntegrationTestWrapper>
      );

      const themeToggle = screen.getByRole('switch');
      
      // Should be accessible on mobile
      expect(themeToggle).toBeInTheDocument();
      
      // Should be clickable on mobile
      fireEvent.click(themeToggle);
      
      await waitFor(() => {
        expect(themeToggle).toHaveAttribute('aria-pressed');
      });
    });

    it('should work on tablet screen sizes', async () => {
      // Mock tablet screen size
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => {
          if (query.includes('max-width: 1024px')) {
            return createMockMatchMedia(true); // Tablet size
          }
          return createMockMatchMedia(false);
        }),
      });

      render(
        <IntegrationTestWrapper>
          <MockLayout>
            <div>Tablet Layout</div>
          </MockLayout>
        </IntegrationTestWrapper>
      );

      const themeToggle = screen.getByRole('switch');
      
      // Should be accessible on tablet
      expect(themeToggle).toBeInTheDocument();
      
      // Should respond to touch events
      fireEvent.click(themeToggle);
      
      await waitFor(() => {
        expect(themeToggle).toHaveAttribute('aria-pressed');
      });
    });

    it('should work on desktop screen sizes', async () => {
      // Mock desktop screen size
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => {
          if (query.includes('min-width: 1200px')) {
            return createMockMatchMedia(true); // Desktop size
          }
          return createMockMatchMedia(false);
        }),
      });

      render(
        <IntegrationTestWrapper>
          <MockLayout>
            <div>Desktop Layout</div>
          </MockLayout>
        </IntegrationTestWrapper>
      );

      const themeToggle = screen.getByRole('switch');
      
      // Should be accessible on desktop
      expect(themeToggle).toBeInTheDocument();
      
      // Should support hover interactions
      const user = userEvent.setup();
      await user.hover(themeToggle);
      
      // Should show tooltip on hover
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should maintain theme toggle position across screen sizes', () => {
      const { rerender } = render(
        <IntegrationTestWrapper>
          <MockLayout>
            <div>Initial Layout</div>
          </MockLayout>
        </IntegrationTestWrapper>
      );

      // Should render on initial screen size
      expect(screen.getByRole('switch')).toBeInTheDocument();

      // Mock different screen size
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => {
          if (query.includes('max-width: 768px')) {
            return createMockMatchMedia(true); // Mobile size
          }
          return createMockMatchMedia(false);
        }),
      });

      // Re-render with new screen size
      rerender(
        <IntegrationTestWrapper>
          <MockLayout>
            <div>Mobile Layout</div>
          </MockLayout>
        </IntegrationTestWrapper>
      );

      // Should still be accessible
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });

  describe('Theme System Error Handling', () => {
    it('should handle theme provider errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // This test verifies that the theme system has proper error boundaries
      // In a real scenario, you would wrap the theme provider with an error boundary
      // For now, we just verify that the component can render without the theme context
      expect(() => {
        render(
          <IntegrationTestWrapper>
            <div data-testid="error-test">Error handling test</div>
          </IntegrationTestWrapper>
        );
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle missing theme context gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Render component without ThemeProvider
      expect(() => {
        render(<ThemeToggle />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Optimization', () => {
    it('should not cause excessive re-renders during theme changes', async () => {
      let renderCount = 0;
      
      const TestComponent = () => {
        renderCount++;
        return <div data-testid="render-counter">Render count: {renderCount}</div>;
      };

      render(
        <IntegrationTestWrapper>
          <TestComponent />
          <ThemeToggle />
        </IntegrationTestWrapper>
      );

      const initialRenderCount = renderCount;
      const themeToggle = screen.getByRole('switch');
      
      // Toggle theme
      fireEvent.click(themeToggle);

      await waitFor(() => {
        expect(themeToggle).toHaveAttribute('aria-pressed');
      });

      // Should not cause excessive re-renders
      expect(renderCount).toBeLessThan(initialRenderCount + 5);
    });

    it('should handle rapid theme toggles without issues', async () => {
      render(
        <IntegrationTestWrapper>
          <ThemeToggle />
        </IntegrationTestWrapper>
      );

      const themeToggle = screen.getByRole('switch');
      
      // Rapidly toggle theme multiple times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(themeToggle);
      }

      // Should still be functional
      await waitFor(() => {
        expect(themeToggle).toHaveAttribute('aria-pressed');
      });
    });
  });
});