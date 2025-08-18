import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo, useCallback } from 'react';
import { Theme } from '@mui/material/styles';
import { createAppTheme } from '../theme';
import { prefersReducedMotion } from '../utils/accessibility';
import { measureThemeSwitch, reportThemeSwitchComplete } from '../utils/performance';

type ThemeMode = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  theme: Theme;
  userPreference: ThemePreference;
  toggleTheme: () => void;
  setThemePreference: (preference: ThemePreference) => void;
  isTransitioning: boolean;
  reducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_PREFERENCE_KEY = 'theme-preference';

// Detect system theme preference
const getSystemThemePreference = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light'; // Default fallback
};

// Get stored theme preference or default to system
const getStoredThemePreference = (): ThemePreference => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(THEME_PREFERENCE_KEY);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as ThemePreference;
      }
    } catch (error) {
      console.warn('Failed to read theme preference from localStorage:', error);
    }
  }
  return 'system'; // Default to system preference
};

// Calculate actual theme mode based on preference
const calculateThemeMode = (preference: ThemePreference, systemPreference: ThemeMode): ThemeMode => {
  if (preference === 'system') {
    return systemPreference;
  }
  return preference;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [systemPreference, setSystemPreference] = useState<ThemeMode>(getSystemThemePreference);
  const [userPreference, setUserPreferenceState] = useState<ThemePreference>(getStoredThemePreference);
  const [mode, setMode] = useState<ThemeMode>(() => 
    calculateThemeMode(getStoredThemePreference(), getSystemThemePreference())
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const transitionTimeoutRef = useRef<number>();

  // Memoize theme creation to prevent unnecessary re-creation
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  // Listen for system theme and motion preference changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const newSystemPreference = e.matches ? 'dark' : 'light';
        setSystemPreference(newSystemPreference);
        
        // Update mode if user preference is 'system'
        if (userPreference === 'system') {
          setMode(newSystemPreference);
        }
      };

      const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
      };

      // Add listeners using modern addEventListener
      themeMediaQuery.addEventListener('change', handleSystemThemeChange);
      motionMediaQuery.addEventListener('change', handleMotionPreferenceChange);

      return () => {
        themeMediaQuery.removeEventListener('change', handleSystemThemeChange);
        motionMediaQuery.removeEventListener('change', handleMotionPreferenceChange);
      };
    }
  }, [userPreference]);

  // Track if this is the initial render
  const isInitialRender = useRef(true);

  // Manage transition state when mode changes
  useEffect(() => {
    // Don't set transitioning state on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    setIsTransitioning(true);
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // End transition after a brief delay (or immediately if reduced motion)
    const transitionDuration = reducedMotion ? 0 : 150;
    transitionTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
    
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [mode, reducedMotion]);

  // Update mode when user preference or system preference changes
  useEffect(() => {
    const newMode = calculateThemeMode(userPreference, systemPreference);
    setMode(newMode);
  }, [userPreference, systemPreference]);

  // Memoize setThemePreference to prevent unnecessary re-renders
  const setThemePreference = useCallback((preference: ThemePreference) => {
    setUserPreferenceState(preference);
    
    // Persist to localStorage
    try {
      localStorage.setItem(THEME_PREFERENCE_KEY, preference);
    } catch (error) {
      console.warn('Failed to save theme preference to localStorage:', error);
    }
  }, []);

  // Memoize toggleTheme to prevent unnecessary re-renders
  const toggleTheme = useCallback(() => {
    // Start performance measurement
    const newPreference = mode === 'light' ? 'dark' : 'light';
    const performanceId = measureThemeSwitch(newPreference);
    
    // Preserve focus during theme transition
    const activeElement = document.activeElement as HTMLElement;
    
    // Toggle between light and dark, ignoring system preference
    setThemePreference(newPreference);
    
    // Restore focus after theme change if element still exists and is focusable
    if (activeElement && typeof activeElement.focus === 'function') {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        try {
          if (document.contains(activeElement)) {
            activeElement.focus();
          }
        } catch (error) {
          // Silently handle focus restoration errors
          console.debug('Could not restore focus after theme change:', error);
        }
        
        // Report performance after DOM updates
        setTimeout(() => {
          reportThemeSwitchComplete(performanceId);
        }, 0);
      });
    } else {
      // Report performance immediately if no focus restoration needed
      setTimeout(() => {
        reportThemeSwitchComplete(performanceId);
      }, 0);
    }
  }, [mode, setThemePreference]);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue: ThemeContextType = useMemo(() => ({
    mode,
    theme,
    userPreference,
    toggleTheme,
    setThemePreference,
    isTransitioning,
    reducedMotion,
  }), [mode, theme, userPreference, toggleTheme, setThemePreference, isTransitioning, reducedMotion]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
