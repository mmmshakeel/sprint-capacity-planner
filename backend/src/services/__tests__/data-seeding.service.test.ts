import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSeedingService } from '../data-seeding.service';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { Sprint } from '../../entities/sprint.entity';
import { TeamMemberSprintCapacity } from '../../entities/team-member-sprint-capacity.entity';

describe('DataSeedingService', () => {
  let service: DataSeedingService;
  let teamRepository: jest.Mocked<Repository<Team>>;
  let teamMemberRepository: jest.Mocked<Repository<TeamMember>>;
  let sprintRepository: jest.Mocked<Repository<Sprint>>;
  let capacityRepository: jest.Mocked<Repository<TeamMemberSprintCapacity>>;

  beforeEach(async () => {
    const mockTeamRepository = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockTeamMemberRepository = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockSprintRepository = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockCapacityRepository = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSeedingService,
        {
          provide: getRepositoryToken(Team),
          useValue: mockTeamRepository,
        },
        {
          provide: getRepositoryToken(TeamMember),
          useValue: mockTeamMemberRepository,
        },
        {
          provide: getRepositoryToken(Sprint),
          useValue: mockSprintRepository,
        },
        {
          provide: getRepositoryToken(TeamMemberSprintCapacity),
          useValue: mockCapacityRepository,
        },
      ],
    }).compile();

    service = module.get<DataSeedingService>(DataSeedingService);
    teamRepository = module.get(getRepositoryToken(Team));
    teamMemberRepository = module.get(getRepositoryToken(TeamMember));
    sprintRepository = module.get(getRepositoryToken(Sprint));
    capacityRepository = module.get(getRepositoryToken(TeamMemberSprintCapacity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDatabase', () => {
    it('should skip seeding if data already exists', async () => {
      teamRepository.count.mockResolvedValue(1);
      teamMemberRepository.count.mockResolvedValue(0);
      sprintRepository.count.mockResolvedValue(0);

      await service.seedDatabase();

      expect(teamRepository.create).not.toHaveBeenCalled();
      expect(teamRepository.save).not.toHaveBeenCalled();
    });

    it('should seed all data when database is empty', async () => {
      // Mock empty database
      teamRepository.count.mockResolvedValue(0);
      teamMemberRepository.count.mockResolvedValue(0);
      sprintRepository.count.mockResolvedValue(0);

      // Mock entity creation and saving
      const mockTeam = { id: 1, name: 'Frontend Team' };
      const mockTeamMember = { id: 1, name: 'Alice Johnson' };
      const mockSprint = { id: 1, name: 'Frontend Sprint 1' };
      const mockCapacity = { id: 1, teamMemberId: 1, sprintId: 1, capacity: 10 };

      teamRepository.create.mockReturnValue(mockTeam as any);
      teamRepository.save.mockResolvedValue(mockTeam as any);
      
      teamMemberRepository.create.mockReturnValue(mockTeamMember as any);
      teamMemberRepository.save.mockResolvedValue(mockTeamMember as any);
      
      sprintRepository.create.mockReturnValue(mockSprint as any);
      sprintRepository.save.mockResolvedValue(mockSprint as any);
      
      capacityRepository.create.mockReturnValue(mockCapacity as any);
      capacityRepository.save.mockResolvedValue(mockCapacity as any);

      await service.seedDatabase();

      // Verify teams were seeded (3 teams)
      expect(teamRepository.create).toHaveBeenCalledTimes(3);
      expect(teamRepository.save).toHaveBeenCalledTimes(3);

      // Verify team members were seeded (5 team members)
      expect(teamMemberRepository.create).toHaveBeenCalledTimes(5);
      expect(teamMemberRepository.save).toHaveBeenCalledTimes(5);

      // Verify sprints were seeded (8 sprints)
      expect(sprintRepository.create).toHaveBeenCalledTimes(8);
      expect(sprintRepository.save).toHaveBeenCalledTimes(8);

      // Verify capacities were seeded (14 capacities)
      expect(capacityRepository.create).toHaveBeenCalledTimes(14);
      expect(capacityRepository.save).toHaveBeenCalledTimes(14);
    });

    it('should seed teams with correct data', async () => {
      teamRepository.count.mockResolvedValue(0);
      teamMemberRepository.count.mockResolvedValue(0);
      sprintRepository.count.mockResolvedValue(0);

      const mockTeam = { id: 1, name: 'Frontend Team' };
      teamRepository.create.mockReturnValue(mockTeam as any);
      teamRepository.save.mockResolvedValue(mockTeam as any);

      await service.seedDatabase();

      expect(teamRepository.create).toHaveBeenCalledWith({
        name: 'Frontend Team',
        description: 'Team responsible for frontend development',
      });
      expect(teamRepository.create).toHaveBeenCalledWith({
        name: 'Backend Team',
        description: 'Team responsible for backend development',
      });
      expect(teamRepository.create).toHaveBeenCalledWith({
        name: 'Platform Team',
        description: 'Team responsible for platform and infrastructure',
      });
    });

    it('should handle errors during seeding', async () => {
      teamRepository.count.mockResolvedValue(0);
      teamMemberRepository.count.mockResolvedValue(0);
      sprintRepository.count.mockResolvedValue(0);

      teamRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.seedDatabase()).rejects.toThrow('Database error');
    });
  });
});