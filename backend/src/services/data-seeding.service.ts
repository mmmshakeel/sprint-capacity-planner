import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { Sprint } from '../entities/sprint.entity';
import { TeamMemberSprintCapacity } from '../entities/team-member-sprint-capacity.entity';

@Injectable()
export class DataSeedingService {
  private readonly logger = new Logger(DataSeedingService.name);

  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(TeamMemberSprintCapacity)
    private teamMemberSprintCapacityRepository: Repository<TeamMemberSprintCapacity>,
  ) {}

  async seedDatabase(): Promise<void> {
    this.logger.log('Starting database seeding...');

    try {
      // Check if data already exists
      const hasExistingData = await this.hasExistingData();
      if (hasExistingData) {
        this.logger.log('Database already contains data, skipping seeding');
        return;
      }

      // Seed data in order of dependencies
      await this.seedTeams();
      await this.seedTeamMembers();
      await this.seedSprints();
      await this.seedTeamMemberSprintCapacities();

      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Error during database seeding:', error);
      throw error;
    }
  }

  private async hasExistingData(): Promise<boolean> {
    const teamCount = await this.teamRepository.count();
    const teamMemberCount = await this.teamMemberRepository.count();
    const sprintCount = await this.sprintRepository.count();
    
    return teamCount > 0 || teamMemberCount > 0 || sprintCount > 0;
  }

  private async seedTeams(): Promise<void> {
    this.logger.log('Seeding teams...');
    
    const teams = [
      {
        name: 'Frontend Team',
        description: 'Team responsible for frontend development',
      },
      {
        name: 'Backend Team',
        description: 'Team responsible for backend development',
      },
      {
        name: 'Platform Team',
        description: 'Team responsible for platform and infrastructure',
      },
    ];

    for (const teamData of teams) {
      const team = this.teamRepository.create(teamData);
      await this.teamRepository.save(team);
    }

    this.logger.log(`Seeded ${teams.length} teams`);
  }

  private async seedTeamMembers(): Promise<void> {
    this.logger.log('Seeding team members...');
    
    const teamMembers = [
      { name: 'Alice Johnson', skill: 'Frontend', teamId: 1 },
      { name: 'Bob Smith', skill: 'Backend', teamId: 2 },
      { name: 'Carol Davis', skill: 'Fullstack', teamId: 3 },
      { name: 'David Wilson', skill: 'Backend', teamId: 2 },
      { name: 'Emma Brown', skill: 'Frontend', teamId: 1 },
    ];

    for (const memberData of teamMembers) {
      const teamMember = this.teamMemberRepository.create(memberData);
      await this.teamMemberRepository.save(teamMember);
    }

    this.logger.log(`Seeded ${teamMembers.length} team members`);
  }

  private async seedSprints(): Promise<void> {
    this.logger.log('Seeding sprints...');
    
    const sprints = [
      {
        name: 'Frontend Sprint 1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-14'),
        capacity: 50,
        projectedVelocity: 40,
        completedVelocity: 35,
        teamId: 1,
      },
      {
        name: 'Frontend Sprint 2',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-28'),
        capacity: 52,
        projectedVelocity: 45,
        completedVelocity: 42,
        teamId: 1,
      },
      {
        name: 'Frontend Sprint 3',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-14'),
        capacity: 48,
        projectedVelocity: 42,
        completedVelocity: 45,
        teamId: 1,
      },
      {
        name: 'Backend Sprint 1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-14'),
        capacity: 48,
        projectedVelocity: 42,
        completedVelocity: 40,
        teamId: 2,
      },
      {
        name: 'Backend Sprint 2',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-28'),
        capacity: 50,
        projectedVelocity: 45,
        completedVelocity: 48,
        teamId: 2,
      },
      {
        name: 'Backend Sprint 3',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-14'),
        capacity: 46,
        projectedVelocity: 40,
        completedVelocity: 44,
        teamId: 2,
      },
      {
        name: 'Platform Sprint 1',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-28'),
        capacity: 52,
        projectedVelocity: 45,
        completedVelocity: 38,
        teamId: 3,
      },
      {
        name: 'Platform Sprint 2',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-14'),
        capacity: 50,
        projectedVelocity: 42,
        completedVelocity: 41,
        teamId: 3,
      },
    ];

    for (const sprintData of sprints) {
      const sprint = this.sprintRepository.create(sprintData);
      await this.sprintRepository.save(sprint);
    }

    this.logger.log(`Seeded ${sprints.length} sprints`);
  }

  private async seedTeamMemberSprintCapacities(): Promise<void> {
    this.logger.log('Seeding team member sprint capacities...');
    
    const capacities = [
      { teamMemberId: 1, sprintId: 1, capacity: 10 },
      { teamMemberId: 5, sprintId: 1, capacity: 6 },
      { teamMemberId: 1, sprintId: 2, capacity: 12 },
      { teamMemberId: 5, sprintId: 2, capacity: 8 },
      { teamMemberId: 1, sprintId: 3, capacity: 9 },
      { teamMemberId: 5, sprintId: 3, capacity: 7 },
      { teamMemberId: 2, sprintId: 4, capacity: 12 },
      { teamMemberId: 4, sprintId: 4, capacity: 8 },
      { teamMemberId: 2, sprintId: 5, capacity: 11 },
      { teamMemberId: 4, sprintId: 5, capacity: 9 },
      { teamMemberId: 2, sprintId: 6, capacity: 10 },
      { teamMemberId: 4, sprintId: 6, capacity: 8 },
      { teamMemberId: 3, sprintId: 7, capacity: 14 },
      { teamMemberId: 3, sprintId: 8, capacity: 12 },
    ];

    for (const capacityData of capacities) {
      const capacity = this.teamMemberSprintCapacityRepository.create(capacityData);
      await this.teamMemberSprintCapacityRepository.save(capacity);
    }

    this.logger.log(`Seeded ${capacities.length} team member sprint capacities`);
  }
}