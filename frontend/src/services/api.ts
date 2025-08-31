import axios, { AxiosError } from 'axios';
import {
  Sprint,
  TeamMember,
  Team,
  CreateSprintDto,
  UpdateSprintDto,
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
  CreateTeamDto,
  UpdateTeamDto,
  SprintListResponse,
  WorkingDaysResponse,
  ProjectedVelocityResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced error handling for API responses
const handleApiError = (error: AxiosError): never => {
  if (error.response?.status === 400) {
    const errorData = error.response.data as any;
    if (errorData?.message?.includes('velocityCommitment')) {
      throw new Error('Invalid velocity commitment value. Please enter a positive number.');
    }
    if (errorData?.message?.includes('completed sprint')) {
      throw new Error('Cannot modify completed sprints. Velocity commitment and projected velocity are read-only.');
    }
  }
  throw error;
};

export const sprintApi = {
  getAllSprints: async (page: number = 1, limit: number = 10, teamId?: number): Promise<SprintListResponse> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (teamId) params.append('teamId', teamId.toString());
    const response = await api.get(`/sprints?${params.toString()}`);
    return response.data;
  },

  getSprintById: async (id: number): Promise<Sprint> => {
    const response = await api.get(`/sprints/${id}`);
    return response.data;
  },

  createSprint: async (data: CreateSprintDto): Promise<Sprint> => {
    try {
      const response = await api.post('/sprints', data);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  updateSprint: async (id: number, data: UpdateSprintDto): Promise<Sprint> => {
    try {
      const response = await api.patch(`/sprints/${id}`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  deleteSprint: async (id: number): Promise<void> => {
    await api.delete(`/sprints/${id}`);
  },

  getWorkingDays: async (startDate: string, endDate: string): Promise<WorkingDaysResponse> => {
    const response = await api.get(`/sprints/working-days?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  calculateProjectedVelocity: async (id: number): Promise<ProjectedVelocityResponse> => {
    const response = await api.post(`/sprints/${id}/calculate-projected-velocity`);
    return response.data;
  },

  getSprintTeamMembers: async (id: number): Promise<TeamMember[]> => {
    const response = await api.get(`/sprints/${id}/team-members`);
    return response.data;
  },

  updateTeamMemberCapacities: async (id: number, capacities: { teamMemberId: number; capacity: number }[]): Promise<Sprint> => {
    const response = await api.put(`/sprints/${id}/team-member-capacities`, capacities);
    return response.data;
  },

  assignTeamMember: async (id: number, assignment: { teamMemberId: number; capacity: number }): Promise<void> => {
    await api.post(`/sprints/${id}/assign-team-member`, assignment);
  },

  removeTeamMember: async (id: number, memberId: number): Promise<void> => {
    await api.delete(`/sprints/${id}/team-members/${memberId}`);
  },
};

export const teamMemberApi = {
  getAllTeamMembers: async (teamId?: number): Promise<TeamMember[]> => {
    const params = teamId ? `?teamId=${teamId}` : '';
    const response = await api.get(`/team-members${params}`);
    return response.data;
  },

  getTeamMemberById: async (id: number): Promise<TeamMember> => {
    const response = await api.get(`/team-members/${id}`);
    return response.data;
  },

  createTeamMember: async (data: CreateTeamMemberDto): Promise<TeamMember> => {
    const response = await api.post('/team-members', data);
    return response.data;
  },

  updateTeamMember: async (id: number, data: UpdateTeamMemberDto): Promise<TeamMember> => {
    const response = await api.patch(`/team-members/${id}`, data);
    return response.data;
  },

  deleteTeamMember: async (id: number): Promise<void> => {
    await api.delete(`/team-members/${id}`);
  },

  getSkills: async (teamId?: number): Promise<string[]> => {
    const params = teamId ? `?teamId=${teamId}` : '';
    const response = await api.get(`/team-members/skills${params}`);
    return response.data;
  },
};

export const teamApi = {
  getAllTeams: async (): Promise<Team[]> => {
    const response = await api.get('/teams');
    return response.data;
  },

  getTeamById: async (id: number): Promise<Team> => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (data: CreateTeamDto): Promise<Team> => {
    const response = await api.post('/teams', data);
    return response.data;
  },

  updateTeam: async (id: number, data: UpdateTeamDto): Promise<Team> => {
    const response = await api.patch(`/teams/${id}`, data);
    return response.data;
  },

  deleteTeam: async (id: number): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },

  getAnalytics: async (id: number): Promise<any> => {
    const response = await api.get(`/teams/${id}/analytics`);
    return response.data;
  },
};

export default api;