import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, useTheme } from '@mui/material';
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
        minHeight="300px"
        sx={{ textAlign: 'center' }}
      >
        <CircularProgress size={40} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          Loading sprint velocity data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Typography
              variant="body2"
              component="button"
              onClick={fetchSprintData}
              sx={{
                cursor: 'pointer',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                color: 'inherit',
                '&:hover': {
                  opacity: 0.8
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
        minHeight="300px"
        sx={{
          textAlign: 'center',
          p: 3,
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 1,
          backgroundColor: theme.palette.action.hover
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Sprint Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Complete some sprints to see velocity trends and performance analysis
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Charts will appear once you have completed sprints with velocity data
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Sprint Velocity Chart
      </Typography>
      <Box
        sx={{
          height: 400,
          width: '100%',
          mt: 2,
        }}
      >
        <LineChart
          width={undefined}
          height={400}
          series={[
            {
              data: chartData.datasets.projectedVelocity,
              label: 'Projected Velocity',
              color: theme.palette.primary.main,
              curve: 'natural',
              connectNulls: true,
            },
            {
              data: chartData.datasets.completedVelocity,
              label: 'Completed Velocity',
              color: theme.palette.secondary.main,
              curve: 'natural',
              connectNulls: true,
            },
          ]}
          xAxis={[
            {
              scaleType: 'point',
              data: chartData.labels,
              label: 'Sprint',
            },
          ]}
          yAxis={[
            {
              label: 'Story Points',
              min: 0,
            },
          ]}
          grid={{
            vertical: true,
            horizontal: true,
          }}
          margin={{ left: 40, right: 40, top: 80, bottom: 80 }}
          slotProps={{
            legend: {
              position: { vertical: 'top', horizontal: 'center' },
            },
          }}
          sx={{
            // Axis styling
            '& .MuiChartsAxis-label': {
              fontSize: '0.875rem',
              fontWeight: 500,
              fill: theme.palette.text.primary,
            },
            '& .MuiChartsAxis-tick': {
              fontSize: '0.75rem',
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
            // Grid styling
            '& .MuiChartsGrid-line': {
              stroke: theme.palette.divider,
              strokeWidth: 0.5,
              strokeDasharray: '3 3',
            },
            // Legend styling
            '& .MuiChartsLegend-series': {
              fontSize: '0.875rem',
              fontWeight: 500,
              fill: theme.palette.text.primary,
            },
            '& .MuiChartsLegend-mark': {
              rx: 1,
            },
            // Line styling for better visibility and accessibility
            '& .MuiLineElement-root': {
              strokeWidth: 3,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              fill: 'none',
              '&:hover': {
                strokeWidth: 4,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: '2px',
              },
            },
            // Remove axis highlight lines
            '& .MuiChartsAxisHighlight-root': {
              display: 'none',
            },
            // Tooltip styling
            '& .MuiChartsTooltip-root': {
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[4],
              color: theme.palette.text.primary,
              fontSize: '0.875rem',
              padding: theme.spacing(1),
            },
            // High contrast mode support
            '@media (prefers-contrast: high)': {
              '& .MuiLineElement-root': {
                strokeWidth: 4,
              },
              '& .MuiMarkElement-root': {
                strokeWidth: 3,
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
          }}
        />
      </Box>
    </Box>
  );
};

export default SprintVelocityChart;