import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '@mui/material/styles';
import { createAppTheme } from '../theme';

type ThemeMode = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  theme: Theme;
  userPreference: ThemePreference;
  toggleTheme: () => void;
  setThemePreference: (preference: ThemePreference) => void;
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

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const newSystemPreference = e.matches ? 'dark' : 'light';
        setSystemPreference(newSystemPreference);
        
        // Update mode if user preference is 'system'
        if (userPreference === 'system') {
          setMode(newSystemPreference);
        }
      };

      // Add listener for system theme changes
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleSystemThemeChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        } else {
          // Fallback for older browsers
          mediaQuery.removeListener(handleSystemThemeChange);
        }
      };
    }
  }, [userPreference]);

  // Update theme when mode changes
  useEffect(() => {
    setTheme(createAppTheme(mode));
  }, [mode]);

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
    // Toggle between light and dark, ignoring system preference
    const newPreference = mode === 'light' ? 'dark' : 'light';
    setThemePreference(newPreference);
  };

  const contextValue: ThemeContextType = {
    mode,
    theme,
    userPreference,
    toggleTheme,
    setThemePreference,
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
