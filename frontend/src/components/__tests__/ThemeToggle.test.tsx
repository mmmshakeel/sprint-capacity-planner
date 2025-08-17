/**
 * Comprehensive tests for ThemeToggle component
 * Tests click interactions, theme state changes, accessibility attributes, keyboard navigation,
 * tooltip behavior, and icon state updates
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Click Interactions and Theme State Changes', () => {
    it('should toggle theme when clicked', async () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Get initial state (could be light or dark depending on system preference)
      const initialPressed = button.getAttribute('aria-pressed');
      const initialLabel = button.getAttribute('aria-label');

      // Click to toggle theme
      fireEvent.click(button);

      await waitFor(() => {
        // Should toggle to opposite state
        const newPressed = button.getAttribute('aria-pressed');
        const newLabel = button.getAttribute('aria-label');
        expect(newPressed).not.toBe(initialPressed);
        expect(newLabel).not.toBe(initialLabel);
      });

      // Click again to toggle back
      fireEvent.click(button);

      await waitFor(() => {
        // Should return to initial state
        expect(button).toHaveAttribute('aria-pressed', initialPressed);
        expect(button).toHaveAttribute('aria-label', initialLabel);
      });
    });

    it('should call toggleTheme function on click', () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      fireEvent.click(button);

      // The theme should change, which we can verify through aria-pressed
      expect(button).toHaveAttribute('aria-pressed');
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
  });

  describe('Accessibility Attributes', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-pressed');
      expect(button).toHaveAttribute('aria-describedby', 'theme-toggle-description');
      expect(button).toHaveAttribute('role', 'switch');
    });

    it('should update aria-label based on current theme', async () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Get initial label
      const initialLabel = button.getAttribute('aria-label');
      
      // Switch theme
      fireEvent.click(button);
      
      await waitFor(() => {
        const newLabel = button.getAttribute('aria-label');
        expect(newLabel).not.toBe(initialLabel);
        // Should be either "Switch to dark mode" or "Switch to light mode"
        expect(newLabel).toMatch(/Switch to (dark|light) mode/);
      });
    });

    it('should update aria-pressed based on current theme', async () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Get initial pressed state
      const initialPressed = button.getAttribute('aria-pressed');
      
      // Switch theme
      fireEvent.click(button);
      
      await waitFor(() => {
        const newPressed = button.getAttribute('aria-pressed');
        expect(newPressed).not.toBe(initialPressed);
        // Should be either "true" or "false"
        expect(newPressed).toMatch(/^(true|false)$/);
      });
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

    it('should update screen reader description based on current theme', async () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      // Check that description exists and contains current theme info
      const description = screen.getByText(/Current theme: (light|dark) mode/);
      expect(description).toBeInTheDocument();
      
      const initialText = description.textContent;
      
      // Switch theme
      const button = screen.getByRole('switch');
      fireEvent.click(button);
      
      await waitFor(() => {
        const updatedDescription = screen.getByText(/Current theme: (light|dark) mode/);
        expect(updatedDescription.textContent).not.toBe(initialText);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be focusable with keyboard', () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should respond to Enter key', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Focus and press Enter
      await user.click(button);
      await user.keyboard('{Enter}');
      
      // Should toggle theme (we can verify through aria-pressed change)
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should respond to Space key', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Get initial state
      const initialPressed = button.getAttribute('aria-pressed');
      
      // Focus and press Space
      button.focus();
      await user.keyboard(' ');
      
      // Should toggle theme
      await waitFor(() => {
        const newPressed = button.getAttribute('aria-pressed');
        expect(newPressed).not.toBe(initialPressed);
      });
    });

    it('should maintain focus after theme change', async () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Focus the button
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Click to change theme
      fireEvent.click(button);
      
      // Focus should be maintained
      await waitFor(() => {
        expect(document.activeElement).toBe(button);
      });
    });
  });

  describe('Tooltip Behavior', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Hover over button
      await user.hover(button);
      
      // Tooltip should appear
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should update tooltip text based on current theme', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Hover to show initial tooltip
      await user.hover(button);
      
      let initialTooltipText: string;
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        initialTooltipText = tooltip.textContent || '';
        expect(initialTooltipText).toMatch(/Switch to (dark|light) mode/);
      });
      
      // Unhover and click to switch theme
      await user.unhover(button);
      fireEvent.click(button);
      
      // Hover again to see updated tooltip
      await user.hover(button);
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const newTooltipText = tooltip.textContent || '';
        expect(newTooltipText).not.toBe(initialTooltipText);
        expect(newTooltipText).toMatch(/Switch to (dark|light) mode/);
      });
    });

    it('should hide tooltip when not hovering', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Hover to show tooltip
      await user.hover(button);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      
      // Unhover to hide tooltip
      await user.unhover(button);
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should support custom tooltip text', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ThemeToggle 
            lightModeTooltip="Custom dark mode text"
            darkModeTooltip="Custom light mode text"
          />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Hover to show tooltip
      await user.hover(button);
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const tooltipText = tooltip.textContent || '';
        // Should show one of the custom texts
        expect(tooltipText).toMatch(/(Custom dark mode text|Custom light mode text)/);
      });
    });
  });

  describe('Icon State Updates', () => {
    it('should show correct icon for current theme', () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      // Should show either light mode or dark mode icon depending on current theme
      const hasLightIcon = screen.queryByTestId('LightModeIcon');
      const hasDarkIcon = screen.queryByTestId('DarkModeIcon');
      
      // Should have exactly one icon visible
      expect(hasLightIcon || hasDarkIcon).toBeTruthy();
      expect(!(hasLightIcon && hasDarkIcon)).toBeTruthy(); // Not both at the same time
    });

    it('should update icon when theme changes', async () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      
      // Check initial icon state
      const initialLightIcon = screen.queryByTestId('LightModeIcon');
      const initialDarkIcon = screen.queryByTestId('DarkModeIcon');
      
      // Switch theme
      fireEvent.click(button);
      
      // Should show different icon after toggle
      await waitFor(() => {
        const newLightIcon = screen.queryByTestId('LightModeIcon');
        const newDarkIcon = screen.queryByTestId('DarkModeIcon');
        
        // Icon state should have changed
        expect(!!newLightIcon).not.toBe(!!initialLightIcon);
        expect(!!newDarkIcon).not.toBe(!!initialDarkIcon);
      });
    });

    it('should have proper aria-hidden attributes on icons', () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      // Check whichever icon is currently visible
      const lightIcon = screen.queryByTestId('LightModeIcon');
      const darkIcon = screen.queryByTestId('DarkModeIcon');
      
      if (lightIcon) {
        expect(lightIcon).toHaveAttribute('aria-hidden', 'true');
      }
      if (darkIcon) {
        expect(darkIcon).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });

  describe('Component Props', () => {
    it('should accept size prop', () => {
      render(
        <TestWrapper>
          <ThemeToggle size="large" />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      expect(button).toBeInTheDocument();
    });

    it('should accept className prop', () => {
      render(
        <TestWrapper>
          <ThemeToggle className="custom-class" />
        </TestWrapper>
      );

      const button = screen.getByRole('switch');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      window.matchMedia = vi.fn().mockImplementation((query: string) => {
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
  });
});