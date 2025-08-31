import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SprintPlanningView from '../SprintPlanningView';
import { BrowserRouter } from 'react-router-dom';
import { TeamProvider } from '../../contexts/TeamContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Mock the API
vi.mock('../../services/api', () => ({
  sprintApi: {
    getSprintById: vi.fn(),
    getSprintTeamMembers: vi.fn(),
    getWorkingDays: vi.fn(),
  },
  teamMemberApi: {},
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TeamProvider>
        {children}
      </TeamProvider>
    </LocalizationProvider>
  </BrowserRouter>
);

describe('SprintPlanningView Sprint Completion Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should consider sprint completed when end date passed AND completed velocity > 0', async () => {
    const mockSprint = {
      id: 1,
      name: 'Test Sprint',
      startDate: '2024-01-01',
      endDate: '2024-01-14', // Past date
      completedVelocity: 10, // > 0
      velocityCommitment: 15,
      teamId: 1,
    };

    const { sprintApi } = await import('../../services/api');
    vi.mocked(sprintApi.getSprintById).mockResolvedValue(mockSprint);
    vi.mocked(sprintApi.getSprintTeamMembers).mockResolvedValue([]);
    vi.mocked(sprintApi.getWorkingDays).mockResolvedValue({ workingDays: 10 });

    render(
      <TestWrapper>
        <SprintPlanningView />
      </TestWrapper>
    );

    // Wait for component to load
    await screen.findByText('Sprint Planning - Test Sprint');

    // Should show completion alert
    expect(screen.getByText(/This sprint has ended/)).toBeInTheDocument();
  });

  it('should show warning alert when end date passed but completed velocity = 0', async () => {
    const mockSprint = {
      id: 1,
      name: 'Test Sprint',
      startDate: '2024-01-01',
      endDate: '2024-01-14', // Past date
      completedVelocity: 0, // = 0
      velocityCommitment: 15,
      teamId: 1,
    };

    const { sprintApi } = await import('../../services/api');
    vi.mocked(sprintApi.getSprintById).mockResolvedValue(mockSprint);
    vi.mocked(sprintApi.getSprintTeamMembers).mockResolvedValue([]);
    vi.mocked(sprintApi.getWorkingDays).mockResolvedValue({ workingDays: 10 });

    render(
      <TestWrapper>
        <SprintPlanningView />
      </TestWrapper>
    );

    // Wait for component to load
    await screen.findByText('Sprint Planning - Test Sprint');

    // Should show warning alert for sprint past end date but no story points
    expect(screen.getByText(/This sprint has ended but has no completed story points/)).toBeInTheDocument();
    
    // Should NOT show the completion alert (which says velocity commitment cannot be modified)
    expect(screen.queryByText(/Velocity commitment and projected velocity cannot be modified/)).not.toBeInTheDocument();
  });

  it('should NOT consider sprint completed when completed velocity > 0 but end date not passed', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // Future date

    const mockSprint = {
      id: 1,
      name: 'Test Sprint',
      startDate: '2024-01-01',
      endDate: futureDate.toISOString().split('T')[0], // Future date
      completedVelocity: 10, // > 0
      velocityCommitment: 15,
      teamId: 1,
    };

    const { sprintApi } = await import('../../services/api');
    vi.mocked(sprintApi.getSprintById).mockResolvedValue(mockSprint);
    vi.mocked(sprintApi.getSprintTeamMembers).mockResolvedValue([]);
    vi.mocked(sprintApi.getWorkingDays).mockResolvedValue({ workingDays: 10 });

    render(
      <TestWrapper>
        <SprintPlanningView />
      </TestWrapper>
    );

    // Wait for component to load
    await screen.findByText('Sprint Planning - Test Sprint');

    // Should NOT show completion alert
    expect(screen.queryByText(/This sprint has ended/)).not.toBeInTheDocument();
  });

  it('should allow editing velocity commitment when sprint is past end date but has no story points', async () => {
    const mockSprint = {
      id: 1,
      name: 'Test Sprint',
      startDate: '2024-01-01',
      endDate: '2024-01-14', // Past date
      completedVelocity: 0, // = 0
      velocityCommitment: 15,
      teamId: 1,
    };

    const { sprintApi } = await import('../../services/api');
    vi.mocked(sprintApi.getSprintById).mockResolvedValue(mockSprint);
    vi.mocked(sprintApi.getSprintTeamMembers).mockResolvedValue([]);
    vi.mocked(sprintApi.getWorkingDays).mockResolvedValue({ workingDays: 10 });

    render(
      <TestWrapper>
        <SprintPlanningView />
      </TestWrapper>
    );

    // Wait for component to load
    await screen.findByText('Sprint Planning - Test Sprint');

    // Velocity commitment field should be enabled (not disabled)
    const velocityCommitmentField = screen.getByLabelText(/Team Velocity Commitment/);
    expect(velocityCommitmentField).not.toBeDisabled();
    
    // Should show helper text indicating it can still be modified
    expect(screen.getByText(/Sprint has ended but can still be modified until story points are added/)).toBeInTheDocument();
  });

  it('should disable editing velocity commitment when sprint is truly completed', async () => {
    const mockSprint = {
      id: 1,
      name: 'Test Sprint',
      startDate: '2024-01-01',
      endDate: '2024-01-14', // Past date
      completedVelocity: 10, // > 0
      velocityCommitment: 15,
      teamId: 1,
    };

    const { sprintApi } = await import('../../services/api');
    vi.mocked(sprintApi.getSprintById).mockResolvedValue(mockSprint);
    vi.mocked(sprintApi.getSprintTeamMembers).mockResolvedValue([]);
    vi.mocked(sprintApi.getWorkingDays).mockResolvedValue({ workingDays: 10 });

    render(
      <TestWrapper>
        <SprintPlanningView />
      </TestWrapper>
    );

    // Wait for component to load
    await screen.findByText('Sprint Planning - Test Sprint');

    // Velocity commitment field should be disabled
    const velocityCommitmentField = screen.getByLabelText(/Team Velocity Commitment/);
    expect(velocityCommitmentField).toBeDisabled();
    
    // Should show helper text indicating it cannot be modified
    expect(screen.getByText(/Cannot edit velocity commitment for completed sprints/)).toBeInTheDocument();
  });
});