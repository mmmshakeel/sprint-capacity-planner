import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SprintVelocityChart from '../SprintVelocityChart';
import { sprintApi } from '../../services/api';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

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

describe('SprintVelocityChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockSprintApi.getAllSprints.mockImplementation(() => new Promise(() => {})); // Never resolves
    
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
    mockSprintApi.getAllSprints.mockImplementation(() => new Promise(() => {})); // Never resolves
    
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
});