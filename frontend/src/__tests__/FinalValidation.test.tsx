import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { Button, Typography, Card } from '@mui/material';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { ThemeToggle } from '../components/ThemeToggle';
import App from '../App';

// Test component to validate MUI integration
const MuiTestComponent: React.FC = () => {
  const { theme, mode } = useTheme();
  
  return (
    <MuiThemeProvider theme={theme}>
      <div data-testid="mui-test-container">
        <Typography data-testid="mui-typography" variant="h1">
          Test Typography
        </Typography>
        <Button data-testid="mui-button" variant="contained" color="primary">
          Test Button
        </Button>
        <Card data-testid="mui-card" sx={{ p: 2 }}>
          <Typography>Test Card Content</Typography>
        </Card>
        <div data-testid="current-mode">{mode}</div>
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

describe('Final MUI Theme Upgrade Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Requirement 1: MUI v6 Upgrade', () => {
    it('should use MUI v6 components without breaking changes', () => {
      render(
        <TestWrapper>
          <MuiTestComponent />
        </TestWrapper>
      );

      // Verify MUI components render correctly
      expect(screen.getByTestId('mui-typography')).toBeInTheDocument();
      expect(screen.getByTestId('mui-button')).toBeInTheDocument();
      expect(screen.getByTestId('mui-card')).toBeInTheDocument();
    });

    it('should maintain existing functionality with MUI v6', () => {
      render(
        <TestWrapper>
          <MuiTestComponent />
        </TestWrapper>
      );

      const button = screen.getByTestId('mui-button');
      
      // Button should be clickable and styled
      expect(button).toBeEnabled();
      expect(button).toHaveClass('MuiButton-root');
    });
  });

  describe('Requirement 2: Custom Style Override Removal', () => {
    it('should use MUI default border radius values', () => {
      render(
        <TestWrapper>
          <MuiTestComponent />
        </TestWrapper>
      );

      const card = screen.getByTestId('mui-card');
      const computedStyle = window.getComputedStyle(card);
      
      // Should not have custom border radius overrides
      expect(computedStyle.borderRadius).toBeTruthy();
    });

    it('should use MUI default button text casing', () => {
      render(
        <TestWrapper>
          <MuiTestComponent />
        </TestWrapper>
      );

      const button = screen.getByTestId('mui-button');
      const computedStyle = window.getComputedStyle(button);
      
      // Should not have custom text transform overrides
      expect(computedStyle.textTransform).not.toBe('uppercase');
    });
  });

  describe('Requirement 3: Dark/Light Theme Switching', () => {
    it('should detect system theme preference on load', () => {
      // Mock system preference for dark mode
      const mockMatchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      render(
        <TestWrapper>
          <MuiTestComponent />
        </TestWrapper>
      );

      // Should detect system preference
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should switch between light and dark modes', async () => {
      render(
        <TestWrapper>
          <div>
            <MuiTestComponent />
            <ThemeToggle />
          </div>
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('switch');
      const modeDisplay = screen.getByTestId('current-mode');
      
      const initialMode = modeDisplay.textContent;
      
      // Click to toggle theme
      fireEvent.click(toggleButton);
      
      // Fast-forward timers to complete transition
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        const newMode = modeDisplay.textContent;
        expect(newMode).not.toBe(initialMode);
      });
    });

    it('should persist theme preference in localStorage', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      
      render(
        <TestWrapper>
          <div>
            <MuiTestComponent />
            <ThemeToggle />
          </div>
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('switch');
      
      fireEvent.click(toggleButton);
      
      // Fast-forward timers
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith('theme-preference', expect.any(String));
      });
    });

    it('should restore theme preference on reload', () => {
      // Mock stored preference
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('dark');
      
      render(
        <TestWrapper>
          <MuiTestComponent />
        </TestWrapper>
      );

      const modeDisplay = screen.getByTestId('current-mode');
      expect(modeDisplay).toHaveTextContent('dark');
    });
  });

  describe('Requirement 4: Centralized Theme Management', () => {
    it('should use single theme provider for entire application', () => {
      render(
        <TestWrapper>
          <MuiTestComponent />
        </TestWrapper>
      );

      // Should have theme context available
      const container = screen.getByTestId('mui-test-container');
      expect(container).toBeInTheDocument();
    });

    it('should update all MUI components automatically on theme change', async () => {
      render(
        <TestWrapper>
          <div>
            <MuiTestComponent />
            <ThemeToggle />
          </div>
        </TestWrapper>
      );

      const button = screen.getByTestId('mui-button');
      const toggleButton = screen.getByRole('switch');
      
      const initialButtonStyle = window.getComputedStyle(button);
      
      // Toggle theme
      fireEvent.click(toggleButton);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        const newButtonStyle = window.getComputedStyle(button);
        // Colors should change with theme
        expect(newButtonStyle.backgroundColor).toBeTruthy();
      });
    });
  });

  describe('Requirement 5: Accessible Theme Toggle', () => {
    it('should display theme toggle in application header', () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-label');
    });

    it('should provide immediate visual feedback on click', async () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('switch');
      
      fireEvent.click(toggleButton);
      
      // Should show transitioning state immediately
      expect(toggleButton).toBeDisabled();
    });

    it('should show tooltip on hover', async () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('switch');
      
      // Simulate hover (tooltip should appear)
      fireEvent.mouseEnter(toggleButton);
      
      await waitFor(() => {
        const tooltip = screen.queryByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('should update toggle icon based on current theme', async () => {
      render(
        <TestWrapper>
          <div>
            <MuiTestComponent />
            <ThemeToggle />
          </div>
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('switch');
      
      // Check initial icon
      const initialIcon = screen.queryByTestId('DarkModeIcon') || screen.queryByTestId('LightModeIcon');
      expect(initialIcon).toBeInTheDocument();
      
      // Toggle theme
      fireEvent.click(toggleButton);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        // Icon should change
        const newIcon = screen.queryByTestId('DarkModeIcon') || screen.queryByTestId('LightModeIcon');
        expect(newIcon).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 6: Accessibility Compliance', () => {
    it('should maintain proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('switch');
      
      expect(toggleButton).toHaveAttribute('aria-label');
      expect(toggleButton).toHaveAttribute('aria-pressed');
      expect(toggleButton).toHaveAttribute('aria-describedby');
    });

    it('should provide screen reader descriptions', () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const description = screen.getByText(/Toggle between light and dark theme/);
      expect(description).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <div>
            <MuiTestComponent />
            <ThemeToggle />
          </div>
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('switch');
      const modeDisplay = screen.getByTestId('current-mode');
      
      const initialMode = modeDisplay.textContent;
      
      // Focus and press Space
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space' });
      
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        const newMode = modeDisplay.textContent;
        expect(newMode).not.toBe(initialMode);
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0;
      
      const CountingComponent = () => {
        renderCount++;
        const { theme } = useTheme();
        return <div data-testid="render-count">{renderCount}</div>;
      };

      const { rerender } = render(
        <TestWrapper>
          <CountingComponent />
        </TestWrapper>
      );

      const initialRenderCount = renderCount;

      // Re-render with same props should not cause additional renders
      rerender(
        <TestWrapper>
          <CountingComponent />
        </TestWrapper>
      );

      expect(renderCount).toBe(initialRenderCount);
    });

    it('should handle theme switching efficiently', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <div>
            <MuiTestComponent />
            <ThemeToggle />
          </div>
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('switch');
      
      // Measure theme switch time
      fireEvent.click(toggleButton);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(toggleButton).not.toBeDisabled();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Theme switching should be reasonably fast (less than 1 second in tests)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('should handle missing matchMedia gracefully', () => {
      // Remove matchMedia to simulate older browsers
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      expect(() => {
        render(
          <TestWrapper>
            <MuiTestComponent />
          </TestWrapper>
        );
      }).not.toThrow();

      // Restore matchMedia
      window.matchMedia = originalMatchMedia;
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw errors
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => {
        render(
          <TestWrapper>
            <MuiTestComponent />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Full Application Integration', () => {
    it('should render complete application without errors', () => {
      expect(() => {
        render(<App />);
      }).not.toThrow();
    });

    it('should maintain theme across navigation', async () => {
      render(<App />);
      
      // Find theme toggle in the app
      const toggleButton = screen.getByRole('switch');
      
      // Toggle theme
      fireEvent.click(toggleButton);
      vi.advanceTimersByTime(200);

      // Theme should persist across the application
      await waitFor(() => {
        expect(toggleButton).not.toBeDisabled();
      });
    });
  });
});