/**
 * Custom hook for accessibility features and preferences
 */

import { useState, useEffect } from 'react';

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  forceFocus: boolean;
}

interface UseAccessibilityReturn extends AccessibilityPreferences {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  getTransitionDuration: (normalDuration: number) => number;
  getFocusRingStyle: (theme: any) => object;
}

/**
 * Hook for managing accessibility preferences and utilities
 */
export const useAccessibility = (): UseAccessibilityReturn => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [forceFocus, setForceFocus] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for reduced motion preference
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionMediaQuery.matches);

    // Check for high contrast preference
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(contrastMediaQuery.matches);

    // Check for forced colors (Windows high contrast mode)
    const forcedColorsMediaQuery = window.matchMedia('(forced-colors: active)');
    setForceFocus(forcedColorsMediaQuery.matches);

    // Listen for changes
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    const handleForcedColorsChange = (e: MediaQueryListEvent) => setForceFocus(e.matches);

    motionMediaQuery.addEventListener('change', handleMotionChange);
    contrastMediaQuery.addEventListener('change', handleContrastChange);
    forcedColorsMediaQuery.addEventListener('change', handleForcedColorsChange);

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
      forcedColorsMediaQuery.removeEventListener('change', handleForcedColorsChange);
    };
  }, []);

  /**
   * Announce a message to screen readers
   */
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    
    document.body.appendChild(announcer);
    
    // Brief delay to ensure the element is in the DOM
    setTimeout(() => {
      announcer.textContent = message;
      
      // Remove after announcement
      setTimeout(() => {
        if (document.body.contains(announcer)) {
          document.body.removeChild(announcer);
        }
      }, 1000);
    }, 100);
  };

  /**
   * Get transition duration based on user preferences
   */
  const getTransitionDuration = (normalDuration: number): number => {
    return reducedMotion ? 0 : normalDuration;
  };

  /**
   * Get focus ring styles based on accessibility preferences
   */
  const getFocusRingStyle = (theme: any) => {
    const baseStyle = {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
      borderRadius: theme.shape.borderRadius,
    };

    if (highContrast) {
      return {
        ...baseStyle,
        outline: `3px solid ${theme.palette.primary.main}`,
        outlineOffset: '3px',
        boxShadow: `0 0 0 1px ${theme.palette.background.paper}`,
      };
    }

    if (forceFocus) {
      return {
        ...baseStyle,
        outline: `2px solid ButtonText`,
        outlineOffset: '2px',
      };
    }

    return baseStyle;
  };

  return {
    reducedMotion,
    highContrast,
    forceFocus,
    announceToScreenReader,
    getTransitionDuration,
    getFocusRingStyle,
  };
};