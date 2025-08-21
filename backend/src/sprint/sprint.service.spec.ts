import { Repository, MoreThan } from 'typeorm';
import { SprintService } from './sprint.service';
import { Sprint } from '../entities/sprint.entity';
import { TeamMemberSprintCapacity } from '../entities/team-member-sprint-capacity.entity';
import { TeamMember } from '../entities/team-member.entity';

// Test data factories
const createTestSprint = (overrides: Partial<Sprint> = {}): Sprint => ({
  id: 1,
  name: 'Test Sprint',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-14'),
  capacity: 40,
  projectedVelocity: 0,
  completedVelocity: 32,
  teamId: 1,
  team: null,
  teamMemberCapacities: [],
  ...overrides
});

const createTestTeamMemberCapacity = (overrides: Partial<TeamMemberSprintCapacity> = {}): TeamMemberSprintCapacity => ({
  id: 1,
  teamMemberId: 1,
  sprintId: 1,
  capacity: 40,
  teamMember: null,
  sprint: null,
  ...overrides
});

const createTestTeamMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  id: 1,
  name: 'Test Developer',
  skill: 'Frontend',
  updatedTime: new Date(),
  active: true,
  teamId: 1,
  team: null,
  sprintCapacities: [],
  ...overrides
});

describe('SprintService', () => {
  let service: SprintService;
  let sprintRepository: jest.Mocked<Repository<Sprint>>;
  let teamMemberSprintCapacityRepository: jest.Mocked<Repository<TeamMemberSprintCapacity>>;
  let teamMemberRepository: jest.Mocked<Repository<TeamMember>>;

  beforeEach(() => {
    // Create mock repositories
    sprintRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      delete: jest.fn(),
    } as any;

    teamMemberSprintCapacityRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    } as any;

    teamMemberRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    } as any;

    // Create service instance with mocked repositories
    service = new SprintService(
      sprintRepository,
      teamMemberSprintCapacityRepository,
      teamMemberRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateProjectedVelocity', () => {
    it('should be defined', () => {
      expect(service.calculateProjectedVelocity).toBeDefined();
    });

    it('should calculate projected velocity with team member capacities', async () => {
      // Arrange
      const sprintId = 1;
      const teamMemberCapacities = [
        createTestTeamMemberCapacity({ capacity: 20 }),
        createTestTeamMemberCapacity({ id: 2, teamMemberId: 2, capacity: 20 })
      ];
      const currentSprint = createTestSprint({
        id: sprintId,
        teamId: 1,
        teamMemberCapacities
      });

      const historicalSprints = [
        createTestSprint({ id: 2, completedVelocity: 32, capacity: 40, startDate: new Date('2024-01-15') }),
        createTestSprint({ id: 3, completedVelocity: 36, capacity: 40, startDate: new Date('2024-01-29') }),
        createTestSprint({ id: 4, completedVelocity: 28, capacity: 40, startDate: new Date('2024-02-12') })
      ];

      sprintRepository.findOne.mockResolvedValue(currentSprint);
      sprintRepository.find.mockResolvedValue(historicalSprints);
      sprintRepository.save.mockResolvedValue(currentSprint);

      // Act
      const result = await service.calculateProjectedVelocity(sprintId);

      // Assert
      expect(sprintRepository.findOne).toHaveBeenCalledWith({
        where: { id: sprintId },
        relations: ['teamMemberCapacities', 'teamMemberCapacities.teamMember', 'team']
      });

      expect(sprintRepository.find).toHaveBeenCalledWith({
        where: { completedVelocity: MoreThan(0), teamId: 1 },
        order: { startDate: 'DESC' },
        take: 6
      });

      // Expected calculation: (32/40 + 36/40 + 28/40) / 3 = (0.8 + 0.9 + 0.7) / 3 = 0.8
      // Projected velocity: 40 * 0.8 = 32
      expect(result.projectedVelocity).toBe(32);
      expect(result.averageStoryCompletion).toBeCloseTo(0.8, 2);
      expect(result.sprintsAnalyzed).toBe(3);
    });

    it('should use fallback completion rate when no historical sprints exist', async () => {
      // Arrange
      const sprintId = 1;
      const teamMemberCapacities = [
        createTestTeamMemberCapacity({ capacity: 40 })
      ];
      const currentSprint = createTestSprint({
        id: sprintId,
        teamId: 1,
        teamMemberCapacities
      });

      sprintRepository.findOne.mockResolvedValue(currentSprint);
      sprintRepository.find.mockResolvedValue([]); // No historical sprints
      sprintRepository.save.mockResolvedValue(currentSprint);

      // Act
      const result = await service.calculateProjectedVelocity(sprintId);

      // Assert
      expect(result.projectedVelocity).toBe(32); // 40 * 0.8 = 32
      expect(result.averageStoryCompletion).toBe(0.8);
      expect(result.sprintsAnalyzed).toBe(0);
    });

    it('should filter by team when teamId is provided', async () => {
      // Arrange
      const sprintId = 1;
      const teamId = 2;
      const currentSprint = createTestSprint({
        id: sprintId,
        teamId,
        teamMemberCapacities: [createTestTeamMemberCapacity({ capacity: 40 })]
      });

      sprintRepository.findOne.mockResolvedValue(currentSprint);
      sprintRepository.find.mockResolvedValue([]);
      sprintRepository.save.mockResolvedValue(currentSprint);

      // Act
      await service.calculateProjectedVelocity(sprintId);

      // Assert
      expect(sprintRepository.find).toHaveBeenCalledWith({
        where: { completedVelocity: MoreThan(0), teamId },
        order: { startDate: 'DESC' },
        take: 6
      });
    });

    it('should not filter by team when teamId is null', async () => {
      // Arrange
      const sprintId = 1;
      const currentSprint = createTestSprint({
        id: sprintId,
        teamId: null,
        teamMemberCapacities: [createTestTeamMemberCapacity({ capacity: 40 })]
      });

      sprintRepository.findOne.mockResolvedValue(currentSprint);
      sprintRepository.find.mockResolvedValue([]);
      sprintRepository.save.mockResolvedValue(currentSprint);

      // Act
      await service.calculateProjectedVelocity(sprintId);

      // Assert
      expect(sprintRepository.find).toHaveBeenCalledWith({
        where: { completedVelocity: MoreThan(0) },
        order: { startDate: 'DESC' },
        take: 6
      });
    });

    it('should handle sprints with zero capacity correctly', async () => {
      // Arrange
      const sprintId = 1;
      const currentSprint = createTestSprint({
        id: sprintId,
        teamId: 1,
        teamMemberCapacities: [createTestTeamMemberCapacity({ capacity: 40 })]
      });

      const historicalSprints = [
        createTestSprint({ id: 2, completedVelocity: 32, capacity: 40 }),
        createTestSprint({ id: 3, completedVelocity: 10, capacity: 0 }), // Zero capacity sprint
        createTestSprint({ id: 4, completedVelocity: 36, capacity: 40 })
      ];

      sprintRepository.findOne.mockResolvedValue(currentSprint);
      sprintRepository.find.mockResolvedValue(historicalSprints);
      sprintRepository.save.mockResolvedValue(currentSprint);

      // Act
      const result = await service.calculateProjectedVelocity(sprintId);

      // Assert
      // Expected calculation: (32/40 + 0 + 36/40) / 3 = (0.8 + 0 + 0.9) / 3 = 0.567
      expect(result.averageStoryCompletion).toBeCloseTo(0.567, 2);
      expect(result.sprintsAnalyzed).toBe(3);
    });

    it('should limit to 6 most recent sprints', async () => {
      // Arrange
      const sprintId = 1;
      const currentSprint = createTestSprint({
        id: sprintId,
        teamId: 1,
        teamMemberCapacities: [createTestTeamMemberCapacity({ capacity: 40 })]
      });

      // Create 8 historical sprints to test the limit
      const historicalSprints = Array.from({ length: 8 }, (_, i) =>
        createTestSprint({
          id: i + 2,
          completedVelocity: 32,
          capacity: 40,
          startDate: new Date(`2024-0${i + 1}-01`)
        })
      );

      sprintRepository.findOne.mockResolvedValue(currentSprint);
      sprintRepository.find.mockResolvedValue(historicalSprints.slice(0, 6)); // Repository should return only 6
      sprintRepository.save.mockResolvedValue(currentSprint);

      // Act
      const result = await service.calculateProjectedVelocity(sprintId);

      // Assert
      expect(sprintRepository.find).toHaveBeenCalledWith({
        where: { completedVelocity: MoreThan(0), teamId: 1 },
        order: { startDate: 'DESC' },
        take: 6
      });
      expect(result.sprintsAnalyzed).toBe(6);
    });

    it('should round projected velocity to nearest integer', async () => {
      // Arrange
      const sprintId = 1;
      const currentSprint = createTestSprint({
        id: sprintId,
        teamId: 1,
        teamMemberCapacities: [createTestTeamMemberCapacity({ capacity: 37 })] // Odd capacity for rounding test
      });

      const historicalSprints = [
        createTestSprint({ id: 2, completedVelocity: 25, capacity: 40 }) // 0.625 completion rate
      ];

      sprintRepository.findOne.mockResolvedValue(currentSprint);
      sprintRepository.find.mockResolvedValue(historicalSprints);
      sprintRepository.save.mockResolvedValue(currentSprint);

      // Act
      const result = await service.calculateProjectedVelocity(sprintId);

      // Assert
      // Expected calculation: 37 * 0.625 = 23.125, rounded to 23
      expect(result.projectedVelocity).toBe(23);
    });

    it('should save updated sprint with projected velocity', async () => {
      // Arrange
      const sprintId = 1;
      const currentSprint = createTestSprint({
        id: sprintId,
        teamId: 1,
        teamMemberCapacities: [createTestTeamMemberCapacity({ capacity: 40 })]
      });

      sprintRepository.findOne.mockResolvedValue(currentSprint);
      sprintRepository.find.mockResolvedValue([]);
      sprintRepository.save.mockResolvedValue(currentSprint);

      // Act
      await service.calculateProjectedVelocity(sprintId);

      // Assert
      expect(sprintRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          projectedVelocity: 32,
          capacity: 40
        })
      );
    });

    describe('chronological ordering', () => {
      it('should select sprints by startDate rather than ID when sprints are created out of chronological order', async () => {
        // Arrange
        const sprintId = 1;
        const currentSprint = createTestSprint({
          id: sprintId,
          teamId: 1,
          teamMemberCapacities: [createTestTeamMemberCapacity({ capacity: 40 })]
        });

        // Create sprints with IDs in one order but startDates in different chronological order
        // This simulates sprints being created out of chronological sequence
        const historicalSprints = [
          // Sprint created first (ID 2) but started last chronologically
          createTestSprint({
            id: 2,
            completedVelocity: 20,
            capacity: 40,
            startDate: new Date('2024-01-01') // Oldest start date
          }),
          // Sprint created second (ID 3) but started in middle chronologically  
          createTestSprint({
            id: 3,
            completedVelocity: 30,
            capacity: 40,
            startDate: new Date('2024-02-01') // Middle start date
          }),
          // Sprint created third (ID 4) but started first chronologically
          createTestSprint({
            id: 4,
            completedVelocity: 40,
            capacity: 40,
            startDate: new Date('2024-03-01') // Most recent start date
          })
        ];

        sprintRepository.findOne.mockResolvedValue(currentSprint);
        // Mock repository to return sprints ordered by startDate DESC (most recent first)
        sprintRepository.find.mockResolvedValue([
          historicalSprints[2], // ID 4, startDate 2024-03-01 (most recent)
          historicalSprints[1], // ID 3, startDate 2024-02-01 (middle)
          historicalSprints[0]  // ID 2, startDate 2024-01-01 (oldest)
        ]);
        sprintRepository.save.mockResolvedValue(currentSprint);

        // Act
        const result = await service.calculateProjectedVelocity(sprintId);

        // Assert
        expect(sprintRepository.find).toHaveBeenCalledWith({
          where: { completedVelocity: MoreThan(0), teamId: 1 },
          order: { startDate: 'DESC' },
          take: 6
        });

        // Verify calculation uses chronological order (most recent sprints first)
        // Expected: (40/40 + 30/40 + 20/40) / 3 = (1.0 + 0.75 + 0.5) / 3 = 0.75
        expect(result.averageStoryCompletion).toBeCloseTo(0.75, 2);
        expect(result.projectedVelocity).toBe(30); // 40 * 0.75 = 30
        expect(result.sprintsAnalyzed).toBe(3);
      });

      it('should select the 6 most recently started sprints when more than 6 completed sprints exist', async () => {
        // Arrange
        const sprintId = 1;
        const currentSprint = createTestSprint({
          id: sprintId,
          teamId: 1,
          teamMemberCapacities: [createTestTeamMemberCapacity({ capacity: 40 })]
        });

        // Create 8 historical sprints with different start dates
        // The 6 most recent should be selected based on startDate, not ID
        const allHistoricalSprints = [
          createTestSprint({ id: 2, completedVelocity: 10, capacity: 40, startDate: new Date('2024-01-01') }), // Oldest
          createTestSprint({ id: 3, completedVelocity: 15, capacity: 40, startDate: new Date('2024-01-15') }),
          createTestSprint({ id: 4, completedVelocity: 20, capacity: 40, startDate: new Date('2024-02-01') }),
          createTestSprint({ id: 5, completedVelocity: 25, capacity: 40, startDate: new Date('2024-02-15') }),
          createTestSprint({ id: 6, completedVelocity: 30, capacity: 40, startDate: new Date('2024-03-01') }),
          createTestSprint({ id: 7, completedVelocity: 35, capacity: 40, startDate: new Date('2024-03-15') }),
          createTestSprint({ id: 8, completedVelocity: 32, capacity: 40, startDate: new Date('2024-04-01') }),
          createTestSprint({ id: 9, completedVelocity: 38, capacity: 40, startDate: new Date('2024-04-15') }) // Most recent
        ];

        // Repository should return only the 6 most recent sprints (by startDate DESC)
        const sixMostRecentSprints = allHistoricalSprints.slice(-6).reverse(); // Last 6, in DESC order

        sprintRepository.findOne.mockResolvedValue(currentSprint);
        sprintRepository.find.mockResolvedValue(sixMostRecentSprints);
        sprintRepository.save.mockResolvedValue(currentSprint);

        // Act
        const result = await service.calculateProjectedVelocity(sprintId);

        // Assert
        expect(sprintRepository.find).toHaveBeenCalledWith({
          where: { completedVelocity: MoreThan(0), teamId: 1 },
          order: { startDate: 'DESC' },
          take: 6
        });

        // Verify only 6 sprints were analyzed (the most recent ones)
        expect(result.sprintsAnalyzed).toBe(6);

        // Expected calculation using the 6 most recent sprints:
        // (38/40 + 32/40 + 35/40 + 30/40 + 25/40 + 20/40) / 6 = (0.95 + 0.8 + 0.875 + 0.75 + 0.625 + 0.5) / 6 = 0.75
        expect(result.averageStoryCompletion).toBeCloseTo(0.75, 2);
        expect(result.projectedVelocity).toBe(30); // 40 * 0.75 = 30
      });

      it('should verify startDate ordering takes precedence over ID ordering', async () => {
        // Arrange
        const sprintId = 1;
        const currentSprint = createTestSprint({
          id: sprintId,
          teamId: 1,
          teamMemberCapacities: [createTestTeamMemberCapacity({ capacity: 40 })]
        });

        // Create sprints where ID order is opposite to startDate order
        const historicalSprints = [
          createTestSprint({
            id: 10, // Highest ID
            completedVelocity: 16,
            capacity: 40,
            startDate: new Date('2024-01-01') // Oldest startDate
          }),
          createTestSprint({
            id: 5, // Middle ID
            completedVelocity: 24,
            capacity: 40,
            startDate: new Date('2024-02-01') // Middle startDate
          }),
          createTestSprint({
            id: 2, // Lowest ID
            completedVelocity: 32,
            capacity: 40,
            startDate: new Date('2024-03-01') // Most recent startDate
          })
        ];

        sprintRepository.findOne.mockResolvedValue(currentSprint);
        // Repository should return sprints ordered by startDate DESC, not ID DESC
        sprintRepository.find.mockResolvedValue([
          historicalSprints[2], // ID 2, most recent startDate (2024-03-01)
          historicalSprints[1], // ID 5, middle startDate (2024-02-01)  
          historicalSprints[0]  // ID 10, oldest startDate (2024-01-01)
        ]);
        sprintRepository.save.mockResolvedValue(currentSprint);

        // Act
        const result = await service.calculateProjectedVelocity(sprintId);

        // Assert
        expect(sprintRepository.find).toHaveBeenCalledWith({
          where: { completedVelocity: MoreThan(0), teamId: 1 },
          order: { startDate: 'DESC' }, // Verify startDate ordering is used
          take: 6
        });

        // Verify calculation reflects startDate-based ordering (most recent sprint has highest velocity)
        // Expected: (32/40 + 24/40 + 16/40) / 3 = (0.8 + 0.6 + 0.4) / 3 = 0.6
        expect(result.averageStoryCompletion).toBeCloseTo(0.6, 2);
        expect(result.projectedVelocity).toBe(24); // 40 * 0.6 = 24
        expect(result.sprintsAnalyzed).toBe(3);
      });
    });
  });

  describe('calculateWorkingDays', () => {
    it('should be defined', () => {
      expect(service.calculateWorkingDays).toBeDefined();
    });

    it('should calculate working days correctly for a single week (Mon-Fri)', () => {
      // Monday January 1, 2024 to Friday January 5, 2024
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-05');   // Friday

      const result = service.calculateWorkingDays(startDate, endDate);

      expect(result).toBe(5);
    });

    it('should exclude weekends (Saturday and Sunday)', () => {
      // Monday January 1, 2024 to Sunday January 7, 2024
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-07');   // Sunday

      const result = service.calculateWorkingDays(startDate, endDate);

      expect(result).toBe(5); // Only Monday-Friday should count
    });

    it('should return 1 for same day when it is a weekday', () => {
      // Wednesday January 3, 2024
      const date = new Date('2024-01-03'); // Wednesday

      const result = service.calculateWorkingDays(date, date);

      expect(result).toBe(1);
    });

    it('should return 0 for same day when it is a weekend', () => {
      // Saturday January 6, 2024
      const date = new Date('2024-01-06'); // Saturday

      const result = service.calculateWorkingDays(date, date);

      expect(result).toBe(0);
    });

    it('should return 0 for weekend-only period', () => {
      // Saturday January 6, 2024 to Sunday January 7, 2024
      const startDate = new Date('2024-01-06'); // Saturday
      const endDate = new Date('2024-01-07');   // Sunday

      const result = service.calculateWorkingDays(startDate, endDate);

      expect(result).toBe(0);
    });

    it('should calculate working days for a two-week sprint', () => {
      // Monday January 1, 2024 to Friday January 12, 2024 (excluding weekends)
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-12');   // Friday (2 weeks later)

      const result = service.calculateWorkingDays(startDate, endDate);

      expect(result).toBe(10); // 2 weeks * 5 working days
    });

    it('should handle month boundaries correctly', () => {
      // Monday January 29, 2024 to Friday February 2, 2024
      const startDate = new Date('2024-01-29'); // Monday
      const endDate = new Date('2024-02-02');   // Friday

      const result = service.calculateWorkingDays(startDate, endDate);

      expect(result).toBe(5);
    });

    it('should handle when end date is before start date', () => {
      // This is an edge case - what should happen when dates are reversed?
      const startDate = new Date('2024-01-05'); // Friday
      const endDate = new Date('2024-01-01');   // Monday

      const result = service.calculateWorkingDays(startDate, endDate);

      // Current implementation will return 0 because the while loop condition fails
      expect(result).toBe(0);
    });

    it('should handle date strings properly', () => {
      // Test with string dates that get converted to Date objects
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-05');   // Friday

      const result = service.calculateWorkingDays(startDate, endDate);

      expect(result).toBe(5);
    });

    it('should handle a sprint that starts on Friday and ends on Monday', () => {
      // Friday January 5, 2024 to Monday January 8, 2024
      const startDate = new Date('2024-01-05'); // Friday
      const endDate = new Date('2024-01-08');   // Monday

      const result = service.calculateWorkingDays(startDate, endDate);

      expect(result).toBe(2); // Friday + Monday (skip weekend)
    });
  });
});