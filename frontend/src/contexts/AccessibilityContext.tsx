/**
 * Accessibility Context for managing global accessibility features
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';

interface AccessibilityContextType {
  reducedMotion: boolean;
  highContrast: boolean;
  forceFocus: boolean;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  getTransitionDuration: (normalDuration: number) => number;
  getFocusRingStyle: (theme: any) => object;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Provider component for accessibility features
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const accessibility = useAccessibility();

  return (
    <AccessibilityContext.Provider value={accessibility}>
      {children}
    </AccessibilityContext.Provider>
  );
};

/**
 * Hook to use accessibility context
 */
export const useAccessibilityContext = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;