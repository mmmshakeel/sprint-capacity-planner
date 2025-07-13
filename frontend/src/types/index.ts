export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  projectedVelocity: number;
  completedVelocity: number;
  teamMemberCapacities?: TeamMemberSprintCapacity[];
}

export interface TeamMember {
  id: number;
  name: string;
  skill: string;
  updatedTime: string;
  active: boolean;
  sprintCapacities?: TeamMemberSprintCapacity[];
}

export interface TeamMemberSprintCapacity {
  id: number;
  teamMemberId: number;
  sprintId: number;
  capacity: number;
  teamMember?: TeamMember;
  sprint?: Sprint;
}

export interface CreateSprintDto {
  name: string;
  startDate: string;
  endDate: string;
  teamMemberCapacities: {
    teamMemberId: number;
    capacity: number;
  }[];
}

export interface UpdateSprintDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  completedVelocity?: number;
}

export interface CreateTeamMemberDto {
  name: string;
  skill: string;
}

export interface UpdateTeamMemberDto {
  name?: string;
  skill?: string;
  active?: boolean;
}

export interface SprintListResponse {
  sprints: Sprint[];
  total: number;
  page: number;
  limit: number;
}

export interface WorkingDaysResponse {
  workingDays: number;
}

export interface ProjectedVelocityResponse {
  projectedVelocity: number;
  averageStoryCompletion: number;
  sprintsAnalyzed: number;
}