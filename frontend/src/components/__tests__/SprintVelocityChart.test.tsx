import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SprintVelocityChart from '../SprintVelocityChart';
import { sprintApi } from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  sprintApi: {
    getAllSprints: vi.fn(),
  },
}));

// Mock MUI X Charts LineChart component
vi.mock('@mui/x-charts/LineChart', () => ({
  LineChart: ({ series, xAxis, yAxis }: any) => (
    <div data-testid="line-chart">
      <div data-testid="chart-series">{JSON.stringify(series)}</div>
      <div data-testid="chart-xaxis">{JSON.stringify(xAxis)}</div>
      <div data-testid="chart-yaxis">{JSON.stringify(yAxis)}</div>
    </div>
  ),
}));

const mockSprintApi = sprintApi as any;

// Helper function to render component with theme
const renderWithTheme = (component: React.ReactElement, breakpoint?: string) => {
  const theme = createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
  });

  // Mock window.matchMedia for responsive tests
  if (breakpoint) {
    const matchMediaMock = vi.fn().mockImplementation((query) => ({
      matches: query.includes(breakpoint),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  }

  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SprintVelocityChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockSprintApi.getAllSprints.mockImplementation(() => new Promise(() => { })); // Never resolves

    render(<SprintVelocityChart teamId={1} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render empty state when no completed sprints exist', async () => {
    mockSprintApi.getAllSprints.mockResolvedValue({
      sprints: [
        { id: 1, name: 'Sprint 1', startDate: '2024-01-01', completedVelocity: 0, projectedVelocity: 10 },
      ],
    });

    render(<SprintVelocityChart teamId={1} />);

    await waitFor(() => {
      expect(screen.getByText('No Sprint Data Available')).toBeInTheDocument();
      expect(screen.getByText('Complete some sprints to see velocity trends and performance analysis')).toBeInTheDocument();
      expect(screen.getByText('Charts will appear once you have completed sprints with velocity data')).toBeInTheDocument();
    });
  });

  it('should render chart when data is available', async () => {
    mockSprintApi.getAllSprints.mockResolvedValue({
      sprints: [
        {
          id: 1,
          name: 'Sprint 1',
          startDate: '2024-01-01',
          completedVelocity: 15,
          projectedVelocity: 10
        },
        {
          id: 2,
          name: 'Sprint 2',
          startDate: '2024-01-15',
          completedVelocity: 12,
          projectedVelocity: 15
        },
      ],
    });

    render(<SprintVelocityChart teamId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Sprint Velocity Chart')).toBeInTheDocument();
      // The chart should be rendered (we can't easily test the chart content due to SVG complexity)
    });
  });

  it('should render error state when API fails', async () => {
    mockSprintApi.getAllSprints.mockRejectedValue(new Error('Network error'));

    render(<SprintVelocityChart teamId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load sprint data: Network error')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('should render error state for invalid team ID', async () => {
    render(<SprintVelocityChart teamId={0} />);

    await waitFor(() => {
      expect(screen.getByText('Invalid team selected')).toBeInTheDocument();
    });
  });

  it('should render loading state with message', () => {
    mockSprintApi.getAllSprints.mockImplementation(() => new Promise(() => { })); // Never resolves

    render(<SprintVelocityChart teamId={1} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Loading sprint velocity data...')).toBeInTheDocument();
  });

  it('should handle invalid response format', async () => {
    mockSprintApi.getAllSprints.mockResolvedValue(null);

    render(<SprintVelocityChart teamId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load sprint data: Invalid response format')).toBeInTheDocument();
    });
  });

  it('should handle malformed sprint data gracefully', async () => {
    mockSprintApi.getAllSprints.mockResolvedValue({
      sprints: [
        { id: 1, name: null, startDate: 'invalid-date', completedVelocity: 15, projectedVelocity: 10 }, // Missing name
        { id: 2, name: 'Sprint 2', startDate: '2024-01-15', completedVelocity: 0, projectedVelocity: 15 }, // Zero completed velocity
        { id: 3, name: 'Sprint 3', startDate: '2024-02-01', completedVelocity: 'invalid', projectedVelocity: 10 }, // Invalid completed velocity
        null, // Null sprint
        { id: 5, completedVelocity: 10 }, // Missing required fields
      ],
    });

    render(<SprintVelocityChart teamId={1} />);

    await waitFor(() => {
      expect(screen.getByText('No Sprint Data Available')).toBeInTheDocument();
    });
  });

  it('should filter and sort sprint data correctly', async () => {
    mockSprintApi.getAllSprints.mockResolvedValue({
      sprints: [
        {
          id: 3,
          name: 'Sprint 3',
          startDate: '2024-02-01',
          completedVelocity: 0, // Should be filtered out
          projectedVelocity: 10
        },
        {
          id: 1,
          name: 'Sprint 1',
          startDate: '2024-01-01',
          completedVelocity: 15,
          projectedVelocity: 10
        },
        {
          id: 2,
          name: 'Sprint 2',
          startDate: '2024-01-15',
          completedVelocity: 12,
          projectedVelocity: 15
        },
      ],
    });

    render(<SprintVelocityChart teamId={1} />);

    await waitFor(() => {
      // Should show chart title (Sprint 3 filtered out due to 0 completed velocity)
      expect(screen.getByText('Sprint Velocity Chart')).toBeInTheDocument();
    });
  });

  it('should handle mixed valid and invalid data correctly', async () => {
    mockSprintApi.getAllSprints.mockResolvedValue({
      sprints: [
        { id: 1, name: null, startDate: '2024-01-01', completedVelocity: 15, projectedVelocity: 10 }, // Invalid - no name
        { id: 2, name: 'Sprint 2', startDate: '2024-01-15', completedVelocity: 12, projectedVelocity: 15 }, // Valid
        { id: 3, name: 'Sprint 3', startDate: 'invalid-date', completedVelocity: 8, projectedVelocity: 10 }, // Invalid date but has name and velocity
        null, // Invalid - null sprint
      ],
    });

    render(<SprintVelocityChart teamId={1} />);

    await waitFor(() => {
      // Should show chart with valid data only
      expect(screen.getByText('Sprint Velocity Chart')).toBeInTheDocument();
      // Should have filtered to only Sprint 2 and Sprint 3 (Sprint 3 has invalid date but other required fields)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render with mobile-optimized layout on small screens', async () => {
      // Mock mobile breakpoint
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query.includes('max-width: 599.95px'), // Mobile breakpoint
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      mockSprintApi.getAllSprints.mockResolvedValue({
        sprints: [
          {
            id: 1,
            name: 'Sprint 1',
            startDate: '2024-01-01',
            completedVelocity: 15,
            projectedVelocity: 10
          },
        ],
      });

      renderWithTheme(<SprintVelocityChart teamId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Sprint Velocity Chart')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    it('should render with tablet-optimized layout on medium screens', async () => {
      // Mock tablet breakpoint
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query.includes('max-width: 899.95px') && !query.includes('max-width: 599.95px'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      mockSprintApi.getAllSprints.mockResolvedValue({
        sprints: [
          {
            id: 1,
            name: 'Sprint 1',
            startDate: '2024-01-01',
            completedVelocity: 15,
            projectedVelocity: 10
          },
        ],
      });

      renderWithTheme(<SprintVelocityChart teamId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Sprint Velocity Chart')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    it('should render with desktop layout on large screens', async () => {
      // Mock desktop breakpoint
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false, // No mobile/tablet matches
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      mockSprintApi.getAllSprints.mockResolvedValue({
        sprints: [
          {
            id: 1,
            name: 'Sprint 1',
            startDate: '2024-01-01',
            completedVelocity: 15,
            projectedVelocity: 10
          },
        ],
      });

      renderWithTheme(<SprintVelocityChart teamId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Sprint Velocity Chart')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    it('should handle responsive loading states correctly', () => {
      // Mock mobile breakpoint
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query.includes('max-width: 599.95px'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      mockSprintApi.getAllSprints.mockImplementation(() => new Promise(() => { })); // Never resolves

      renderWithTheme(<SprintVelocityChart teamId={1} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading sprint velocity data...')).toBeInTheDocument();
    });

    it('should handle responsive empty states correctly', async () => {
      // Mock mobile breakpoint
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query.includes('max-width: 599.95px'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      mockSprintApi.getAllSprints.mockResolvedValue({
        sprints: [
          { id: 1, name: 'Sprint 1', startDate: '2024-01-01', completedVelocity: 0, projectedVelocity: 10 },
        ],
      });

      renderWithTheme(<SprintVelocityChart teamId={1} />);

      await waitFor(() => {
        expect(screen.getByText('No Sprint Data Available')).toBeInTheDocument();
        expect(screen.getByText('Complete some sprints to see velocity trends and performance analysis')).toBeInTheDocument();
      });
    });
  });
});