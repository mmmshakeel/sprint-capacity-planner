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
 * Features smooth transitions, proper ARIA labels, and tooltip functionality.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  className,
  lightModeTooltip = 'Switch to dark mode',
  darkModeTooltip = 'Switch to light mode',
}) => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  
  const isDarkMode = mode === 'dark';
  const tooltipText = isDarkMode ? darkModeTooltip : lightModeTooltip;
  const ariaLabel = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <Tooltip 
      title={tooltipText}
      placement="bottom"
      arrow
      enterDelay={500}
      leaveDelay={200}
    >
      <IconButton
        onClick={handleToggle}
        size={size}
        className={className}
        aria-label={ariaLabel}
        aria-pressed={isDarkMode}
        role="switch"
        sx={{
          transition: muiTheme.transitions.create(
            ['transform', 'background-color', 'box-shadow'],
            {
              duration: muiTheme.transitions.duration.short,
              easing: muiTheme.transitions.easing.easeInOut,
            }
          ),
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: muiTheme.palette.action.hover,
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&:focus-visible': {
            outline: `2px solid ${muiTheme.palette.primary.main}`,
            outlineOffset: '2px',
          },
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
          {/* Light mode icon */}
          <Fade
            in={isDarkMode}
            timeout={{
              enter: muiTheme.transitions.duration.enteringScreen,
              exit: muiTheme.transitions.duration.leavingScreen,
            }}
            unmountOnExit
          >
            <LightModeIcon
              sx={{
                position: 'absolute',
                color: muiTheme.palette.warning.main,
                fontSize: 'inherit',
              }}
            />
          </Fade>
          
          {/* Dark mode icon */}
          <Fade
            in={!isDarkMode}
            timeout={{
              enter: muiTheme.transitions.duration.enteringScreen,
              exit: muiTheme.transitions.duration.leavingScreen,
            }}
            unmountOnExit
          >
            <DarkModeIcon
              sx={{
                position: 'absolute',
                color: muiTheme.palette.grey[900],
                fontSize: 'inherit',
              }}
            />
          </Fade>
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;