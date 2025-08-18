import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';

// WCAG AA compliant color tokens for light theme
const lightPalette = {
  primary: {
    main: '#1565c0', // Darker blue for better contrast (was #1976d2)
    light: '#42a5f5',
    dark: '#0d47a1', // Even darker for high contrast scenarios
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#c2185b', // Adjusted for better contrast (was #dc004e)
    light: '#ff5983',
    dark: '#8e0038', // Darker variant
    contrastText: '#ffffff',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)', // High contrast
    secondary: 'rgba(0, 0, 0, 0.65)', // Improved from 0.6 for better readability
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#bf360c', // Even darker orange for WCAG AA compliance
    light: '#ff9800',
    dark: '#8f2900',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32', // Dark green for good contrast
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  info: {
    main: '#01579b', // Darker blue for better contrast (was #0288d1)
    light: '#03a9f4',
    dark: '#002f6c',
    contrastText: '#ffffff',
  },
};

// WCAG AA compliant color tokens for dark theme
const darkPalette = {
  primary: {
    main: '#90caf9', // Light blue with good contrast on dark backgrounds
    light: '#e3f2fd',
    dark: '#42a5f5',
    contrastText: '#000000', // Black text on light blue
  },
  secondary: {
    main: '#f48fb1', // Light pink
    light: '#ffc1e3',
    dark: '#bf5f82',
    contrastText: '#000000', // Black text on light pink
  },
  background: {
    default: '#121212', // True dark background
    paper: '#1e1e1e', // Slightly lighter for cards/papers
  },
  text: {
    primary: '#ffffff', // Pure white for maximum contrast
    secondary: 'rgba(255, 255, 255, 0.75)', // Improved from 0.7
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  error: {
    main: '#f44336',
    light: '#ef5350',
    dark: '#d32f2f',
    contrastText: '#000000',
  },
  warning: {
    main: '#ff9800', // Bright orange for dark theme
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000',
  },
  success: {
    main: '#4caf50', // Bright green
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#000000',
  },
  info: {
    main: '#29b6f6', // Bright blue
    light: '#4fc3f7',
    dark: '#0288d1',
    contrastText: '#000000',
  },
};

// Base theme options shared between light and dark themes with accessibility enhancements
const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.125rem',
      fontWeight: 300,
      lineHeight: 1.167,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.167,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    // Enhanced focus indicators for better accessibility
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Remove custom text transform - use MUI default (none)
          textTransform: 'none',
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: theme.shape.borderRadius,
            boxShadow: `0 0 0 3px ${theme.palette.primary.main}25`, // 25% opacity
          },
          // High contrast mode support
          '@media (prefers-contrast: high)': {
            '&:focus-visible': {
              outline: `3px solid ${theme.palette.primary.main}`,
              outlineOffset: '3px',
            },
          },
          // Forced colors mode support (Windows high contrast)
          '@media (forced-colors: active)': {
            '&:focus-visible': {
              outline: '2px solid ButtonText',
            },
          },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: theme.shape.borderRadius,
            boxShadow: `0 0 0 3px ${theme.palette.primary.main}25`,
          },
          '@media (prefers-contrast: high)': {
            '&:focus-visible': {
              outline: `3px solid ${theme.palette.primary.main}`,
              outlineOffset: '3px',
            },
          },
          '@media (forced-colors: active)': {
            '&:focus-visible': {
              outline: '2px solid ButtonText',
            },
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            '&:focus-within': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
            },
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: theme.shape.borderRadius,
          },
        }),
      },
    },
    // Ensure proper contrast for disabled states
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-disabled': {
            opacity: 0.6, // Ensure disabled elements are still visible but clearly disabled
          },
        }),
      },
    },
  },
};

// Create light theme with accessibility enhancements
export const lightTheme: Theme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'light',
    ...lightPalette,
  },
});

// Create dark theme with accessibility enhancements
export const darkTheme: Theme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'dark',
    ...darkPalette,
  },
});

// Memoized theme cache to prevent unnecessary theme object creation
const themeCache = new Map<string, Theme>();

// Theme factory function with memoization
export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  // Check cache first
  const cached = themeCache.get(mode);
  if (cached) {
    return cached;
  }

  // Create and cache the theme
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  themeCache.set(mode, theme);
  return theme;
};

// Validate theme contrast ratios in development
if (import.meta.env?.DEV) {
  import('../utils/validateThemeContrast').then(({ logContrastValidation }) => {
    logContrastValidation(lightTheme, 'Light Theme');
    logContrastValidation(darkTheme, 'Dark Theme');
  });
}

// Export individual themes for direct use
export { lightTheme as default };