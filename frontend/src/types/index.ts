export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  projectedVelocity: number;
  completedVelocity: number;
  teamId?: number;
  team?: Team;
  teamMemberCapacities?: TeamMemberSprintCapacity[];
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  active: boolean;
  teamMembers?: TeamMember[];
  sprints?: Sprint[];
}

export interface TeamMember {
  id: number;
  name: string;
  skill: string;
  updatedTime: string;
  active: boolean;
  teamId?: number;
  team?: Team;
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
  teamId?: number;
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
  teamId?: number;
}

export interface CreateTeamMemberDto {
  name: string;
  skill: string;
  teamId?: number;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface UpdateTeamMemberDto {
  name?: string;
  skill?: string;
  active?: boolean;
  teamId?: number;
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