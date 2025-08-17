import React from 'react';
import {
  IconButton,
  Tooltip,
  useTheme as useMuiTheme,
  Fade,
  Box,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibilityContext } from '../contexts/AccessibilityContext';

interface ThemeToggleProps {
  /**
   * Size of the toggle button
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Additional CSS class name
   */
  className?: string;
  
  /**
   * Custom tooltip text for light mode
   * @default 'Switch to dark mode'
   */
  lightModeTooltip?: string;
  
  /**
   * Custom tooltip text for dark mode
   * @default 'Switch to light mode'
   */
  darkModeTooltip?: string;
}

/**
 * ThemeToggle component provides an accessible button to switch between light and dark themes.
 * Features smooth transitions, proper ARIA labels, tooltip functionality, and reduced motion support.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  className,
  lightModeTooltip = 'Switch to dark mode',
  darkModeTooltip = 'Switch to light mode',
}) => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const { 
    reducedMotion, 
    announceToScreenReader, 
    getTransitionDuration, 
    getFocusRingStyle 
  } = useAccessibilityContext();
  
  const isDarkMode = mode === 'dark';
  const tooltipText = isDarkMode ? darkModeTooltip : lightModeTooltip;
  const ariaLabel = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';

  const handleToggle = () => {
    const announcement = isDarkMode ? 'Switched to light mode' : 'Switched to dark mode';
    
    toggleTheme();
    
    // Announce theme change to screen readers
    announceToScreenReader(announcement, 'polite');
  };

  return (
    <Tooltip 
      title={tooltipText}
      placement="bottom"
      arrow
      enterDelay={reducedMotion ? 0 : 500}
      leaveDelay={reducedMotion ? 0 : 200}
    >
      <IconButton
        onClick={handleToggle}
        size={size}
        className={className}
        aria-label={ariaLabel}
        aria-pressed={isDarkMode}
        aria-describedby="theme-toggle-description"
        role="switch"
        sx={{
          transition: muiTheme.transitions.create(
            ['transform', 'background-color', 'box-shadow'],
            {
              duration: getTransitionDuration(muiTheme.transitions.duration.short),
              easing: muiTheme.transitions.easing.easeInOut,
            }
          ),
          '&:hover': {
            transform: reducedMotion ? 'none' : 'scale(1.1)',
            backgroundColor: muiTheme.palette.action.hover,
          },
          '&:active': {
            transform: reducedMotion ? 'none' : 'scale(0.95)',
          },
          '&:focus-visible': getFocusRingStyle(muiTheme),
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Light mode icon - shown when in dark mode */}
          <Fade
            in={isDarkMode}
            timeout={{
              enter: getTransitionDuration(muiTheme.transitions.duration.enteringScreen),
              exit: getTransitionDuration(muiTheme.transitions.duration.leavingScreen),
            }}
            unmountOnExit
          >
            <LightModeIcon
              sx={{
                position: 'absolute',
                color: muiTheme.palette.warning.main,
                fontSize: 'inherit',
              }}
              aria-hidden="true"
            />
          </Fade>
          
          {/* Dark mode icon - shown when in light mode */}
          <Fade
            in={!isDarkMode}
            timeout={{
              enter: getTransitionDuration(muiTheme.transitions.duration.enteringScreen),
              exit: getTransitionDuration(muiTheme.transitions.duration.leavingScreen),
            }}
            unmountOnExit
          >
            <DarkModeIcon
              sx={{
                position: 'absolute',
                color: muiTheme.palette.text.primary,
                fontSize: 'inherit',
              }}
              aria-hidden="true"
            />
          </Fade>
        </Box>
        
        {/* Hidden description for screen readers */}
        <Box
          id="theme-toggle-description"
          sx={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          Toggle between light and dark theme. Current theme: {isDarkMode ? 'dark' : 'light'} mode.
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;