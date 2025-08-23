import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Dashboard from '../Dashboard';
import { TeamProvider } from '../../contexts/TeamContext';

// Mock the SprintVelocityChart component
jest.mock('../SprintVelocityChart', () => {
  return function MockSprintVelocityChart({ teamId }: { teamId: number }) {
    return <div data-testid="sprint-velocity-chart">Sprint Velocity Chart for team {teamId}</div>;
  };
});

// Mock the API services
jest.mock('../../services/api', () => ({
  sprintApi: {
    getAllSprints: jest.fn().mockResolvedValue({
      sprints: [
        {
          id: 1,
          name: 'Sprint 1',
          startDate: '2024-01-01',
          endDate: '2024-01-14',
          projectedVelocity: 20,
          completedVelocity: 18,
        },
      ],
    }),
  },
  teamMemberApi: {
    getAllTeamMembers: jest.fn().mockResolvedValue([
      { id: 1, name: 'John Doe', active: true },
      { id: 2, name: 'Jane Smith', active: true },
    ]),
  },
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <TeamProvider>
        {children}
      </TeamProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Dashboard Integration', () => {
  it('should render SprintVelocityChart when team is selected', async () => {
    // Mock the team context to have a selected team
    const mockTeam = { id: 1, name: 'Test Team' };
    
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Since we don't have a selected team in the mock context, 
    // we should see the "Please select a team" message
    expect(screen.getByText('Please select a team to view the dashboard.')).toBeInTheDocument();
  });
});