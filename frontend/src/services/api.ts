import axios from 'axios';
import {
  Sprint,
  TeamMember,
  CreateSprintDto,
  UpdateSprintDto,
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
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

export const sprintApi = {
  getAllSprints: async (page: number = 1, limit: number = 10): Promise<SprintListResponse> => {
    const response = await api.get(`/sprints?page=${page}&limit=${limit}`);
    return response.data;
  },

  getSprintById: async (id: number): Promise<Sprint> => {
    const response = await api.get(`/sprints/${id}`);
    return response.data;
  },

  createSprint: async (data: CreateSprintDto): Promise<Sprint> => {
    const response = await api.post('/sprints', data);
    return response.data;
  },

  updateSprint: async (id: number, data: UpdateSprintDto): Promise<Sprint> => {
    const response = await api.patch(`/sprints/${id}`, data);
    return response.data;
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
  getAllTeamMembers: async (): Promise<TeamMember[]> => {
    const response = await api.get('/team-members');
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

  getSkills: async (): Promise<string[]> => {
    const response = await api.get('/team-members/skills');
    return response.data;
  },
};

export default api;