import { Team } from '../team.entity';
import { TeamMember } from '../team-member.entity';

describe('Entity Boolean Defaults', () => {
  describe('Team Entity', () => {
    it('should have correct boolean field configuration', () => {
      const team = new Team();
      
      // The active field should be undefined initially (will be set by database default)
      expect(team.active).toBeUndefined();
    });

    it('should allow setting boolean values', () => {
      const team = new Team();
      
      team.active = true;
      expect(team.active).toBe(true);
      
      team.active = false;
      expect(team.active).toBe(false);
    });
  });

  describe('TeamMember Entity', () => {
    it('should have correct boolean field configuration', () => {
      const teamMember = new TeamMember();
      
      // The active field should be undefined initially (will be set by database default)
      expect(teamMember.active).toBeUndefined();
    });

    it('should allow setting boolean values', () => {
      const teamMember = new TeamMember();
      
      teamMember.active = true;
      expect(teamMember.active).toBe(true);
      
      teamMember.active = false;
      expect(teamMember.active).toBe(false);
    });
  });

  describe('Database Type Awareness', () => {
    const originalDatabaseType = process.env.DATABASE_TYPE;

    afterEach(() => {
      if (originalDatabaseType) {
        process.env.DATABASE_TYPE = originalDatabaseType;
      } else {
        delete process.env.DATABASE_TYPE;
      }
    });

    it('should work with PostgreSQL database type', () => {
      process.env.DATABASE_TYPE = 'postgresql';
      
      const team = new Team();
      team.name = 'Test Team';
      team.description = 'Test Description';
      
      expect(team.name).toBe('Test Team');
      expect(team.description).toBe('Test Description');
    });

    it('should work with MySQL database type', () => {
      process.env.DATABASE_TYPE = 'mysql';
      
      const team = new Team();
      team.name = 'Test Team';
      team.description = 'Test Description';
      
      expect(team.name).toBe('Test Team');
      expect(team.description).toBe('Test Description');
    });

    it('should work with SQLite database type', () => {
      process.env.DATABASE_TYPE = 'sqlite';
      
      const team = new Team();
      team.name = 'Test Team';
      team.description = 'Test Description';
      
      expect(team.name).toBe('Test Team');
      expect(team.description).toBe('Test Description');
    });
  });
});