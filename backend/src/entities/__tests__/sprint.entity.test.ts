import { Sprint } from '../sprint.entity';
import { Team } from '../team.entity';
import { TeamMemberSprintCapacity } from '../team-member-sprint-capacity.entity';

describe('Sprint Entity', () => {
  let sprint: Sprint;

  beforeEach(() => {
    sprint = new Sprint();
  });

  describe('velocityCommitment property', () => {
    it('should allow setting velocityCommitment to a positive number', () => {
      const commitment = 40;
      sprint.velocityCommitment = commitment;
      
      expect(sprint.velocityCommitment).toBe(commitment);
    });

    it('should allow velocityCommitment to be undefined', () => {
      sprint.velocityCommitment = undefined;
      
      expect(sprint.velocityCommitment).toBeUndefined();
    });

    it('should allow velocityCommitment to be null', () => {
      sprint.velocityCommitment = null as any;
      
      expect(sprint.velocityCommitment).toBeNull();
    });

    it('should accept zero as a valid velocityCommitment value', () => {
      sprint.velocityCommitment = 0;
      
      expect(sprint.velocityCommitment).toBe(0);
    });

    it('should accept large numbers as velocityCommitment', () => {
      const largeCommitment = 999999;
      sprint.velocityCommitment = largeCommitment;
      
      expect(sprint.velocityCommitment).toBe(largeCommitment);
    });
  });

  describe('entity structure', () => {
    it('should have all required properties', () => {
      sprint.id = 1;
      sprint.name = 'Test Sprint';
      sprint.startDate = new Date('2024-01-01');
      sprint.endDate = new Date('2024-01-14');
      sprint.capacity = 50;
      sprint.projectedVelocity = 35;
      sprint.completedVelocity = 32;
      sprint.velocityCommitment = 40;
      sprint.teamId = 1;

      expect(sprint.id).toBe(1);
      expect(sprint.name).toBe('Test Sprint');
      expect(sprint.startDate).toEqual(new Date('2024-01-01'));
      expect(sprint.endDate).toEqual(new Date('2024-01-14'));
      expect(sprint.capacity).toBe(50);
      expect(sprint.projectedVelocity).toBe(35);
      expect(sprint.completedVelocity).toBe(32);
      expect(sprint.velocityCommitment).toBe(40);
      expect(sprint.teamId).toBe(1);
    });

    it('should support relationships', () => {
      const team = new Team();
      const teamMemberCapacity = new TeamMemberSprintCapacity();

      sprint.team = team;
      sprint.teamMemberCapacities = [teamMemberCapacity];

      expect(sprint.team).toBe(team);
      expect(sprint.teamMemberCapacities).toContain(teamMemberCapacity);
    });

    it('should work without velocityCommitment for backward compatibility', () => {
      sprint.id = 1;
      sprint.name = 'Legacy Sprint';
      sprint.startDate = new Date('2024-01-01');
      sprint.endDate = new Date('2024-01-14');
      sprint.capacity = 50;
      sprint.projectedVelocity = 35;
      sprint.completedVelocity = 32;
      sprint.teamId = 1;
      // velocityCommitment is not set

      expect(sprint.velocityCommitment).toBeUndefined();
      expect(sprint.name).toBe('Legacy Sprint');
      expect(sprint.capacity).toBe(50);
    });
  });

  describe('TypeORM decorators', () => {
    it('should have velocityCommitment property available', () => {
      // This test verifies that the velocityCommitment property can be set and retrieved
      // The property exists as part of the class definition even if not initially set
      sprint.velocityCommitment = 25;
      expect(sprint.velocityCommitment).toBe(25);
      
      // Test that the property can be unset
      delete sprint.velocityCommitment;
      expect(sprint.velocityCommitment).toBeUndefined();
    });
  });
});