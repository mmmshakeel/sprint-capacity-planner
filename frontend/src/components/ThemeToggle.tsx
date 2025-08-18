import React, { memo, useCallback, useMemo } from 'react';
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
const ThemeToggleComponent: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  className,
  lightModeTooltip = 'Switch to dark mode',
  darkModeTooltip = 'Switch to light mode',
}) => {
  const { mode, toggleTheme, isTransitioning } = useTheme();
  const muiTheme = useMuiTheme();
  const { 
    reducedMotion, 
    announceToScreenReader, 
    getTransitionDuration, 
    getFocusRingStyle 
  } = useAccessibilityContext();
  
  // Memoize computed values to prevent unnecessary recalculations
  const isDarkMode = useMemo(() => mode === 'dark', [mode]);
  const tooltipText = useMemo(() => 
    isDarkMode ? darkModeTooltip : lightModeTooltip, 
    [isDarkMode, darkModeTooltip, lightModeTooltip]
  );
  const ariaLabel = useMemo(() => 
    isDarkMode ? 'Switch to light mode' : 'Switch to dark mode', 
    [isDarkMode]
  );

  // Memoize the toggle handler to prevent unnecessary re-renders
  const handleToggle = useCallback(() => {
    // Prevent rapid clicking during transitions
    if (isTransitioning) {
      return;
    }

    const announcement = isDarkMode ? 'Switched to light mode' : 'Switched to dark mode';
    
    toggleTheme();
    
    // Announce theme change to screen readers
    announceToScreenReader(announcement, 'polite');
  }, [isDarkMode, toggleTheme, announceToScreenReader, isTransitioning]);

  // Memoize transition durations to prevent recalculation
  const transitionDurations = useMemo(() => ({
    enter: getTransitionDuration(muiTheme.transitions.duration.enteringScreen),
    exit: getTransitionDuration(muiTheme.transitions.duration.leavingScreen),
  }), [getTransitionDuration, muiTheme.transitions.duration]);

  // Memoize button styles to prevent recalculation
  const buttonStyles = useMemo(() => ({
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
    // Add loading state styles
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  }), [muiTheme, getTransitionDuration, reducedMotion, getFocusRingStyle]);

  return (
    <Tooltip 
      title={isTransitioning ? 'Switching theme...' : tooltipText}
      placement="bottom"
      arrow
      enterDelay={reducedMotion ? 0 : 500}
      leaveDelay={reducedMotion ? 0 : 200}
    >
      <span>
        <IconButton
          onClick={handleToggle}
          size={size}
          className={className}
          aria-label={ariaLabel}
          aria-pressed={isDarkMode}
          aria-describedby="theme-toggle-description"
          role="switch"
          disabled={isTransitioning}
          sx={buttonStyles}
        >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isTransitioning ? 0.7 : 1,
            transition: muiTheme.transitions.create('opacity', {
              duration: getTransitionDuration(muiTheme.transitions.duration.shortest),
            }),
          }}
        >
          {/* Light mode icon - shown when in dark mode */}
          <Fade
            in={isDarkMode && !isTransitioning}
            timeout={transitionDurations}
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
            in={!isDarkMode && !isTransitioning}
            timeout={transitionDurations}
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
          {isTransitioning && ' Theme is currently switching.'}
        </Box>
        </IconButton>
      </span>
    </Tooltip>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ThemeToggle = memo(ThemeToggleComponent);

export default ThemeToggle;