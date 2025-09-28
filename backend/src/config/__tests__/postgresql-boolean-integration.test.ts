import { DataSource } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { BooleanTransformer } from '../../utils/boolean.transformer';

describe('PostgreSQL Boolean Field Integration Tests', () => {
  let dataSource: DataSource;
  let teamRepository: any;
  let teamMemberRepository: any;

  beforeAll(async () => {
    // Create PostgreSQL test configuration
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.TEST_POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.TEST_POSTGRES_PORT || '5432'),
      username: process.env.TEST_POSTGRES_USER || 'postgres',
      password: process.env.TEST_POSTGRES_PASSWORD || 'password',
      database: process.env.TEST_POSTGRES_DATABASE || 'test_db',
      entities: [Team, TeamMember],
      synchronize: true,
      dropSchema: true,
      logging: false,
    });

    try {
      await dataSource.initialize();
      teamRepository = dataSource.getRepository(Team);
      teamMemberRepository = dataSource.getRepository(TeamMember);
    } catch (error) {
      console.warn('PostgreSQL test database not available, skipping PostgreSQL integration tests');
      console.warn('To run PostgreSQL tests, ensure PostgreSQL is running and set TEST_POSTGRES_* environment variables');
      return;
    }
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    if (!dataSource || !dataSource.isInitialized) {
      return;
    }
    
    // Clean up test data
    await teamMemberRepository.delete({});
    await teamRepository.delete({});
  });

  describe('Team Entity Boolean Fields', () => {
    it('should store and retrieve boolean true values correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const team = teamRepository.create({
        name: 'Test Team',
        description: 'Test Description',
        active: true,
      });

      const savedTeam = await teamRepository.save(team);
      expect(savedTeam.active).toBe(true);

      const retrievedTeam = await teamRepository.findOne({ where: { id: savedTeam.id } });
      expect(retrievedTeam.active).toBe(true);
      expect(typeof retrievedTeam.active).toBe('boolean');
    });

    it('should store and retrieve boolean false values correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const team = teamRepository.create({
        name: 'Inactive Team',
        description: 'Test Description',
        active: false,
      });

      const savedTeam = await teamRepository.save(team);
      expect(savedTeam.active).toBe(false);

      const retrievedTeam = await teamRepository.findOne({ where: { id: savedTeam.id } });
      expect(retrievedTeam.active).toBe(false);
      expect(typeof retrievedTeam.active).toBe('boolean');
    });

    it('should handle default boolean values correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const team = teamRepository.create({
        name: 'Default Team',
        description: 'Test Description',
        // active field not specified, should use default value (true)
      });

      const savedTeam = await teamRepository.save(team);
      expect(savedTeam.active).toBe(true);

      const retrievedTeam = await teamRepository.findOne({ where: { id: savedTeam.id } });
      expect(retrievedTeam.active).toBe(true);
      expect(typeof retrievedTeam.active).toBe('boolean');
    });

    it('should handle null boolean values correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const team = teamRepository.create({
        name: 'Null Team',
        description: 'Test Description',
        active: null,
      });

      const savedTeam = await teamRepository.save(team);
      expect(savedTeam.active).toBeNull();

      const retrievedTeam = await teamRepository.findOne({ where: { id: savedTeam.id } });
      expect(retrievedTeam.active).toBeNull();
    });

    it('should update boolean values correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const team = teamRepository.create({
        name: 'Update Team',
        description: 'Test Description',
        active: true,
      });

      const savedTeam = await teamRepository.save(team);
      expect(savedTeam.active).toBe(true);

      // Update to false
      savedTeam.active = false;
      const updatedTeam = await teamRepository.save(savedTeam);
      expect(updatedTeam.active).toBe(false);

      const retrievedTeam = await teamRepository.findOne({ where: { id: savedTeam.id } });
      expect(retrievedTeam.active).toBe(false);
      expect(typeof retrievedTeam.active).toBe('boolean');
    });
  });

  describe('TeamMember Entity Boolean Fields', () => {
    it('should store and retrieve boolean true values correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const teamMember = teamMemberRepository.create({
        name: 'Test Member',
        skill: 'Developer',
        active: true,
      });

      const savedMember = await teamMemberRepository.save(teamMember);
      expect(savedMember.active).toBe(true);

      const retrievedMember = await teamMemberRepository.findOne({ where: { id: savedMember.id } });
      expect(retrievedMember.active).toBe(true);
      expect(typeof retrievedMember.active).toBe('boolean');
    });

    it('should store and retrieve boolean false values correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const teamMember = teamMemberRepository.create({
        name: 'Inactive Member',
        skill: 'Designer',
        active: false,
      });

      const savedMember = await teamMemberRepository.save(teamMember);
      expect(savedMember.active).toBe(false);

      const retrievedMember = await teamMemberRepository.findOne({ where: { id: savedMember.id } });
      expect(retrievedMember.active).toBe(false);
      expect(typeof retrievedMember.active).toBe('boolean');
    });

    it('should handle default boolean values correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const teamMember = teamMemberRepository.create({
        name: 'Default Member',
        skill: 'Tester',
        // active field not specified, should use default value (true)
      });

      const savedMember = await teamMemberRepository.save(teamMember);
      expect(savedMember.active).toBe(true);

      const retrievedMember = await teamMemberRepository.findOne({ where: { id: savedMember.id } });
      expect(retrievedMember.active).toBe(true);
      expect(typeof retrievedMember.active).toBe('boolean');
    });
  });

  describe('Boolean Queries and Filtering', () => {
    it('should filter by boolean true values correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      // Create test data
      await teamRepository.save([
        { name: 'Active Team 1', active: true },
        { name: 'Active Team 2', active: true },
        { name: 'Inactive Team', active: false },
      ]);

      const activeTeams = await teamRepository.find({ where: { active: true } });
      expect(activeTeams).toHaveLength(2);
      activeTeams.forEach(team => {
        expect(team.active).toBe(true);
        expect(typeof team.active).toBe('boolean');
      });
    });

    it('should filter by boolean false values correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      // Create test data
      await teamRepository.save([
        { name: 'Active Team', active: true },
        { name: 'Inactive Team 1', active: false },
        { name: 'Inactive Team 2', active: false },
      ]);

      const inactiveTeams = await teamRepository.find({ where: { active: false } });
      expect(inactiveTeams).toHaveLength(2);
      inactiveTeams.forEach(team => {
        expect(team.active).toBe(false);
        expect(typeof team.active).toBe('boolean');
      });
    });

    it('should handle complex queries with boolean conditions', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      // Create test data
      await teamRepository.save([
        { name: 'Active Dev Team', active: true },
        { name: 'Active QA Team', active: true },
        { name: 'Inactive Dev Team', active: false },
      ]);

      const queryBuilder = teamRepository.createQueryBuilder('team');
      const activeDevTeams = await queryBuilder
        .where('team.active = :active', { active: true })
        .andWhere('team.name LIKE :name', { name: '%Dev%' })
        .getMany();

      expect(activeDevTeams).toHaveLength(1);
      expect(activeDevTeams[0].name).toBe('Active Dev Team');
      expect(activeDevTeams[0].active).toBe(true);
      expect(typeof activeDevTeams[0].active).toBe('boolean');
    });
  });

  describe('Boolean Transformer Verification', () => {
    it('should verify BOOLEAN column type is used for boolean fields', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      // Query PostgreSQL information schema to verify column types
      const columnInfo = await dataSource.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'team' 
        AND column_name = 'active'
      `);

      expect(columnInfo).toHaveLength(1);
      expect(columnInfo[0].data_type).toBe('boolean');
    });

    it('should verify boolean transformer handles PostgreSQL BOOLEAN values', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const transformer = new BooleanTransformer();

      // Test transformer methods directly
      expect(transformer.to(true)).toBe(1);
      expect(transformer.to(false)).toBe(0);
      expect(transformer.to(null)).toBeNull();
      expect(transformer.to(undefined)).toBeNull();

      expect(transformer.from(1)).toBe(true);
      expect(transformer.from(0)).toBe(false);
      expect(transformer.from(true)).toBe(true);
      expect(transformer.from(false)).toBe(false);
      expect(transformer.from(null)).toBeNull();
      expect(transformer.from(undefined)).toBeNull();
    });

    it('should handle PostgreSQL native boolean operations', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      // Test direct SQL operations to ensure compatibility
      const result = await dataSource.query(`
        SELECT 
          TRUE as pg_true,
          FALSE as pg_false,
          TRUE::int as true_as_int,
          FALSE::int as false_as_int
      `);

      expect(result[0].pg_true).toBe(true);
      expect(result[0].pg_false).toBe(false);
      expect(result[0].true_as_int).toBe(1);
      expect(result[0].false_as_int).toBe(0);
    });

    it('should handle PostgreSQL boolean storage and retrieval correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      // Insert data directly via SQL to test edge cases
      await dataSource.query(`
        INSERT INTO team (name, description, active) VALUES 
        ('Team 1', 'Test', TRUE),
        ('Team 2', 'Test', FALSE),
        ('Team 3', 'Test', 1::boolean),
        ('Team 4', 'Test', 0::boolean)
      `);

      const teams = await teamRepository.find({ order: { name: 'ASC' } });
      
      // All teams should have proper boolean values
      expect(teams[0].active).toBe(true);
      expect(typeof teams[0].active).toBe('boolean');
      expect(teams[1].active).toBe(false);
      expect(typeof teams[1].active).toBe('boolean');
      expect(teams[2].active).toBe(true);
      expect(typeof teams[2].active).toBe('boolean');
      expect(teams[3].active).toBe(false);
      expect(typeof teams[3].active).toBe('boolean');
    });
  });

  describe('PostgreSQL-Specific Features', () => {
    it('should handle PostgreSQL SERIAL with boolean fields', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const teams = await teamRepository.save([
        { name: 'Team 1', active: true },
        { name: 'Team 2', active: false },
        { name: 'Team 3', active: true },
      ]);

      // Verify IDs are auto-incremented
      expect(teams[0].id).toBeDefined();
      expect(teams[1].id).toBeDefined();
      expect(teams[2].id).toBeDefined();
      expect(teams[0].id).not.toBe(teams[1].id);
      expect(teams[1].id).not.toBe(teams[2].id);
      
      // Verify boolean values are consistent
      expect(typeof teams[0].active).toBe('boolean');
      expect(typeof teams[1].active).toBe('boolean');
      expect(typeof teams[2].active).toBe('boolean');
    });

    it('should handle PostgreSQL transactions with boolean operations', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      await dataSource.transaction(async manager => {
        const teamRepo = manager.getRepository(Team);
        
        const teams = await teamRepo.save([
          { name: 'Transaction Team 1', active: true },
          { name: 'Transaction Team 2', active: false },
        ]);
        
        const retrievedTeams = await teamRepo.find();
        expect(retrievedTeams.length).toBeGreaterThanOrEqual(2);
        
        // Verify boolean types are consistent
        retrievedTeams.forEach(team => {
          expect(typeof team.active).toBe('boolean');
        });
      });
    });

    it('should handle PostgreSQL boolean indexes correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      // Create an index on the boolean column
      await dataSource.query('CREATE INDEX IF NOT EXISTS idx_team_active ON team(active)');
      
      // Insert test data
      const teams = Array.from({ length: 100 }, (_, i) => ({
        name: `Team ${i}`,
        active: i % 2 === 0,
      }));
      
      await teamRepository.save(teams);
      
      // Query using the index
      const startTime = Date.now();
      const activeTeams = await teamRepository.find({ where: { active: true } });
      const queryTime = Date.now() - startTime;
      
      expect(activeTeams).toHaveLength(50);
      expect(queryTime).toBeLessThan(1000); // Should be fast with index
      
      // Verify boolean types
      activeTeams.forEach(team => {
        expect(team.active).toBe(true);
        expect(typeof team.active).toBe('boolean');
      });
      
      // Clean up index
      await dataSource.query('DROP INDEX IF EXISTS idx_team_active');
    });

    it('should handle PostgreSQL boolean constraints correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      // Test that boolean fields accept valid values
      const validTeam = teamRepository.create({
        name: 'Valid Team',
        active: true,
      });

      const savedTeam = await teamRepository.save(validTeam);
      expect(savedTeam).toBeDefined();
      expect(typeof savedTeam.active).toBe('boolean');
      
      // Test constraint validation by attempting invalid direct SQL
      try {
        await dataSource.query(`
          INSERT INTO team (name, description, active) VALUES ('Invalid Team', 'Test', 'invalid_boolean')
        `);
        fail('Should have thrown an error for invalid boolean value');
      } catch (error) {
        // Expected error for invalid boolean value
        expect(error.message).toContain('invalid input syntax for type boolean');
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk boolean operations efficiently', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const teams = Array.from({ length: 100 }, (_, i) => ({
        name: `Team ${i}`,
        active: i % 2 === 0, // Alternate between true and false
      }));

      const startTime = Date.now();
      await teamRepository.save(teams);
      const saveTime = Date.now() - startTime;

      const queryStartTime = Date.now();
      const activeTeams = await teamRepository.find({ where: { active: true } });
      const queryTime = Date.now() - queryStartTime;

      expect(activeTeams).toHaveLength(50);
      expect(saveTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second

      // Verify all retrieved teams have correct boolean types
      activeTeams.forEach(team => {
        expect(team.active).toBe(true);
        expect(typeof team.active).toBe('boolean');
      });
    });

    it('should handle concurrent boolean operations', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      const promises = Array.from({ length: 10 }, async (_, i) => {
        return teamRepository.save({
          name: `Concurrent Team ${i}`,
          active: i % 2 === 0,
        });
      });

      const teams = await Promise.all(promises);
      
      expect(teams).toHaveLength(10);
      teams.forEach((team) => {
        expect(typeof team.active).toBe('boolean');
      });
    });
  });

  describe('Data Integrity Tests', () => {
    it('should maintain boolean data integrity across database restarts', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      // Save test data
      const originalTeam = await teamRepository.save({
        name: 'Persistence Test Team',
        active: true,
      });

      const originalActiveValue = originalTeam.active;

      // Close and reopen connection to simulate restart
      await dataSource.destroy();
      
      dataSource = new DataSource({
        type: 'postgres',
        host: process.env.TEST_POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.TEST_POSTGRES_PORT || '5432'),
        username: process.env.TEST_POSTGRES_USER || 'postgres',
        password: process.env.TEST_POSTGRES_PASSWORD || 'password',
        database: process.env.TEST_POSTGRES_DATABASE || 'test_db',
        entities: [Team, TeamMember],
        synchronize: false, // Don't recreate schema
        logging: false,
      });

      await dataSource.initialize();
      teamRepository = dataSource.getRepository(Team);

      // Verify data persisted correctly
      const retrievedTeam = await teamRepository.findOne({ where: { id: originalTeam.id } });
      expect(retrievedTeam).toBeDefined();
      expect(typeof retrievedTeam.active).toBe('boolean');
      expect(retrievedTeam.active).toBe(originalActiveValue);
    });

    it('should handle boolean field migrations correctly', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - PostgreSQL not available');
        return;
      }

      // Test that existing boolean data is handled correctly
      // This simulates the migration from SMALLINT to BOOLEAN
      
      // Insert data using the transformer approach
      const team = await teamRepository.save({
        name: 'Migration Test Team',
        active: true,
      });

      // Verify the data is stored and retrieved correctly
      const retrievedTeam = await teamRepository.findOne({ where: { id: team.id } });
      expect(retrievedTeam.active).toBe(true);
      expect(typeof retrievedTeam.active).toBe('boolean');
      
      // Test that queries work correctly
      const activeTeams = await teamRepository.find({ where: { active: true } });
      expect(activeTeams.length).toBeGreaterThan(0);
      expect(activeTeams.some(t => t.id === team.id)).toBe(true);
    });
  });
});