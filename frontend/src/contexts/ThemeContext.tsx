import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Theme } from '@mui/material/styles';
import { createAppTheme } from '../theme';
import { prefersReducedMotion } from '../utils/accessibility';

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
  const [theme, setTheme] = useState<Theme>(() => createAppTheme(mode));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Update theme when mode changes with transition management
  useEffect(() => {
    setIsTransitioning(true);
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // Update theme immediately
    setTheme(createAppTheme(mode));
    
    // End transition after a brief delay (or immediately if reduced motion)
    const transitionDuration = reducedMotion ? 0 : 150;
    transitionTimeoutRef.current = setTimeout(() => {
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

  const setThemePreference = (preference: ThemePreference) => {
    setUserPreferenceState(preference);
    
    // Persist to localStorage
    try {
      localStorage.setItem(THEME_PREFERENCE_KEY, preference);
    } catch (error) {
      console.warn('Failed to save theme preference to localStorage:', error);
    }
  };

  const toggleTheme = () => {
    // Preserve focus during theme transition
    const activeElement = document.activeElement as HTMLElement;
    
    // Toggle between light and dark, ignoring system preference
    const newPreference = mode === 'light' ? 'dark' : 'light';
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
      });
    }
  };

  const contextValue: ThemeContextType = {
    mode,
    theme,
    userPreference,
    toggleTheme,
    setThemePreference,
    isTransitioning,
    reducedMotion,
  };

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
