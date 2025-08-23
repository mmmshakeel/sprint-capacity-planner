import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, useTheme, useMediaQuery } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { sprintApi } from '../services/api';
import { Sprint } from '../types';

interface SprintVelocityChartProps {
  teamId: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    projectedVelocity: number[];
    completedVelocity: number[];
  };
}

const SprintVelocityChart: React.FC<SprintVelocityChartProps> = ({ teamId }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const processSprintData = (sprints: Sprint[]): ChartData => {
    if (!Array.isArray(sprints)) {
      throw new Error('Invalid sprint data format');
    }

    // Filter to completed sprints only (completedVelocity > 0)
    const completedSprints = sprints.filter(sprint => {
      return sprint &&
        typeof sprint.completedVelocity === 'number' &&
        sprint.completedVelocity > 0 &&
        sprint.name &&
        sprint.startDate;
    });

    // Sort by startDate for chronological display
    const sortedSprints = completedSprints.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);

      // Handle invalid dates
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }

      return dateA.getTime() - dateB.getTime();
    });

    // Transform to chart data format
    const labels = sortedSprints.map(sprint => sprint.name);
    const projectedVelocity = sortedSprints.map(sprint => sprint.projectedVelocity || 0);
    const completedVelocity = sortedSprints.map(sprint => sprint.completedVelocity);

    return {
      labels,
      datasets: {
        projectedVelocity,
        completedVelocity,
      },
    };
  };

  const fetchSprintData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await sprintApi.getAllSprints(1, 50, teamId);

      if (!response || !response.sprints) {
        throw new Error('Invalid response format');
      }

      const processedData = processSprintData(response.sprints);
      setChartData(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? `Failed to load sprint data: ${err.message}`
        : 'Failed to load sprint data for chart';
      setError(errorMessage);
      console.error('Sprint velocity chart error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId && teamId > 0) {
      fetchSprintData();
    } else {
      setLoading(false);
      setError('Invalid team selected');
    }
  }, [teamId]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight={isMobile ? "200px" : "300px"}
        sx={{ 
          textAlign: 'center',
          p: isMobile ? 2 : 3
        }}
      >
        <CircularProgress size={isMobile ? 32 : 40} />
        <Typography
          variant={isMobile ? "caption" : "body2"}
          color="text.secondary"
          sx={{ 
            mt: isMobile ? 1.5 : 2,
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }}
        >
          Loading sprint velocity data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: isMobile ? 1.5 : 2 }}>
        <Alert
          severity="error"
          sx={{ 
            mb: isMobile ? 1.5 : 2,
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }}
          action={
            <Typography
              variant={isMobile ? "caption" : "body2"}
              component="button"
              onClick={fetchSprintData}
              sx={{
                cursor: 'pointer',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: isMobile ? '0.7rem' : '0.875rem',
                padding: isMobile ? '4px 8px' : '6px 12px',
                minHeight: isMobile ? '32px' : '36px',
                '&:hover': {
                  opacity: 0.8
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: '2px',
                }
              }}
            >
              Retry
            </Typography>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!chartData || chartData.labels.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight={isMobile ? "200px" : "300px"}
        sx={{
          textAlign: 'center',
          p: isMobile ? 2 : 3,
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 1,
          backgroundColor: theme.palette.action.hover
        }}
      >
        <Typography 
          variant={isMobile ? "subtitle2" : "h6"} 
          color="text.secondary" 
          gutterBottom
          sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}
        >
          No Sprint Data Available
        </Typography>
        <Typography 
          variant={isMobile ? "caption" : "body2"} 
          color="text.secondary" 
          sx={{ 
            mb: isMobile ? 1.5 : 2,
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            maxWidth: isMobile ? '280px' : 'none'
          }}
        >
          Complete some sprints to see velocity trends and performance analysis
        </Typography>
        <Typography 
          variant="caption" 
          color="text.disabled"
          sx={{ 
            fontSize: isMobile ? '0.7rem' : '0.75rem',
            maxWidth: isMobile ? '260px' : 'none'
          }}
        >
          Charts will appear once you have completed sprints with velocity data
        </Typography>
      </Box>
    );
  }

  // Responsive chart configuration
  const getChartHeight = () => {
    if (isMobile) return 280;
    if (isTablet) return 320;
    return 400;
  };

  const getChartMargins = () => {
    if (isMobile) {
      return { left: 30, right: 20, top: 60, bottom: 60 };
    }
    if (isTablet) {
      return { left: 35, right: 30, top: 70, bottom: 70 };
    }
    return { left: 40, right: 40, top: 80, bottom: 80 };
  };

  const getLegendPosition = () => {
    if (isMobile) {
      return { vertical: 'bottom' as const, horizontal: 'center' as const };
    }
    return { vertical: 'top' as const, horizontal: 'center' as const };
  };

  const getAxisLabelRotation = () => {
    if (isMobile && chartData.labels.length > 4) {
      return -45; // Rotate labels on mobile for better readability
    }
    return 0;
  };

  const chartHeight = getChartHeight();
  const chartMargins = getChartMargins();

  return (
    <Box>
      <Typography 
        variant={isMobile ? "subtitle1" : "h6"} 
        gutterBottom
        sx={{ 
          fontSize: isMobile ? '1rem' : '1.25rem',
          fontWeight: 600 
        }}
      >
        Sprint Velocity Chart
      </Typography>
      <Box
        sx={{
          height: chartHeight,
          width: '100%',
          mt: isMobile ? 1 : 2,
          // Ensure chart container is scrollable on very small screens
          overflowX: isMobile && chartData.labels.length > 6 ? 'auto' : 'visible',
          minWidth: isMobile ? '320px' : 'auto',
        }}
      >
        <LineChart
          width={undefined}
          height={chartHeight}
          series={[
            {
              data: chartData.datasets.projectedVelocity,
              label: isMobile ? 'Projected' : 'Projected Velocity',
              color: theme.palette.primary.main,
              curve: 'natural',
              connectNulls: true,
            },
            {
              data: chartData.datasets.completedVelocity,
              label: isMobile ? 'Completed' : 'Completed Velocity',
              color: theme.palette.secondary.main,
              curve: 'natural',
              connectNulls: true,
            },
          ]}
          xAxis={[
            {
              scaleType: 'point',
              data: chartData.labels,
              label: isMobile ? '' : 'Sprint', // Hide x-axis label on mobile to save space
              labelStyle: {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              },
              tickLabelStyle: {
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                angle: getAxisLabelRotation(),
              },
            },
          ]}
          yAxis={[
            {
              label: isSmallScreen ? 'Points' : 'Story Points',
              min: 0,
              labelStyle: {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              },
              tickLabelStyle: {
                fontSize: isMobile ? '0.7rem' : '0.75rem',
              },
            },
          ]}
          grid={{
            vertical: !isMobile, // Hide vertical grid on mobile for cleaner look
            horizontal: true,
          }}
          margin={chartMargins}
          slotProps={{
            legend: {
              position: getLegendPosition(),
            },
          }}
          sx={{
            // Responsive axis styling
            '& .MuiChartsAxis-label': {
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: 500,
              fill: theme.palette.text.primary,
            },
            '& .MuiChartsAxis-tick': {
              fontSize: isMobile ? '0.7rem' : '0.75rem',
              fill: theme.palette.text.secondary,
            },
            '& .MuiChartsAxis-line': {
              stroke: theme.palette.divider,
              strokeWidth: 1,
            },
            '& .MuiChartsAxis-tickLine': {
              stroke: theme.palette.divider,
              strokeWidth: 1,
            },
            // Responsive grid styling
            '& .MuiChartsGrid-line': {
              stroke: theme.palette.divider,
              strokeWidth: isMobile ? 0.3 : 0.5,
              strokeDasharray: isMobile ? '2 2' : '3 3',
            },
            // Responsive legend styling
            '& .MuiChartsLegend-series': {
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: 500,
              fill: theme.palette.text.primary,
            },
            '& .MuiChartsLegend-mark': {
              rx: 1,
              width: isMobile ? 12 : 16,
              height: isMobile ? 12 : 16,
            },
            // Responsive line styling for better visibility and accessibility
            '& .MuiLineElement-root': {
              strokeWidth: isMobile ? 2.5 : 3,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              fill: 'none',
              '&:hover': {
                strokeWidth: isMobile ? 3 : 4,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: '2px',
              },
            },
            // Enhanced touch targets for mobile
            '& .MuiMarkElement-root': {
              r: isMobile ? 4 : 3,
              strokeWidth: isMobile ? 2 : 1.5,
              '&:hover': {
                r: isMobile ? 5 : 4,
              },
            },
            // Remove axis highlight lines
            '& .MuiChartsAxisHighlight-root': {
              display: 'none',
            },
            // Responsive tooltip styling
            '& .MuiChartsTooltip-root': {
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[4],
              color: theme.palette.text.primary,
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              padding: theme.spacing(isMobile ? 0.75 : 1),
              maxWidth: isMobile ? '200px' : '300px',
              wordWrap: 'break-word',
            },
            // Mobile-specific optimizations
            ...(isMobile && {
              '& .MuiChartsAxis-tickLabel': {
                textAnchor: 'end',
              },
              // Ensure touch targets are large enough
              '& .MuiLineElement-root, & .MuiMarkElement-root': {
                cursor: 'pointer',
                touchAction: 'manipulation',
              },
            }),
            // High contrast mode support
            '@media (prefers-contrast: high)': {
              '& .MuiLineElement-root': {
                strokeWidth: isMobile ? 3.5 : 4,
              },
              '& .MuiMarkElement-root': {
                strokeWidth: isMobile ? 3 : 3,
                r: isMobile ? 5 : 4,
              },
              '& .MuiChartsGrid-line': {
                strokeWidth: 1,
                strokeDasharray: 'none',
              },
            },
            // Reduced motion support
            '@media (prefers-reduced-motion: reduce)': {
              '& .MuiLineElement-root': {
                transition: 'none',
              },
              '& .MuiMarkElement-root': {
                transition: 'none',
              },
            },
            // Responsive breakpoint adjustments
            [theme.breakpoints.down('sm')]: {
              '& .MuiChartsLegend-root': {
                marginTop: theme.spacing(1),
                marginBottom: theme.spacing(1),
              },
            },
            [theme.breakpoints.up('md')]: {
              '& .MuiChartsLegend-root': {
                marginBottom: theme.spacing(2),
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default SprintVelocityChart;