import { DataSource } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { BooleanTransformer } from '../../utils/boolean.transformer';

describe('MySQL Boolean Field Integration Tests', () => {
  let dataSource: DataSource;
  let teamRepository: any;
  let teamMemberRepository: any;

  beforeAll(async () => {
    // Create MySQL test configuration
    dataSource = new DataSource({
      type: 'mysql',
      host: process.env.TEST_MYSQL_HOST || 'localhost',
      port: parseInt(process.env.TEST_MYSQL_PORT || '3306'),
      username: process.env.TEST_MYSQL_USER || 'root',
      password: process.env.TEST_MYSQL_PASSWORD || 'password',
      database: process.env.TEST_MYSQL_DATABASE || 'test_db',
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
      console.warn('MySQL test database not available, skipping MySQL integration tests');
      console.warn('To run MySQL tests, ensure MySQL is running and set TEST_MYSQL_* environment variables');
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
        console.warn('Skipping test - MySQL not available');
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
        console.warn('Skipping test - MySQL not available');
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
        console.warn('Skipping test - MySQL not available');
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
        console.warn('Skipping test - MySQL not available');
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
        console.warn('Skipping test - MySQL not available');
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
        console.warn('Skipping test - MySQL not available');
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
        console.warn('Skipping test - MySQL not available');
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
        console.warn('Skipping test - MySQL not available');
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
        console.warn('Skipping test - MySQL not available');
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
        console.warn('Skipping test - MySQL not available');
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
        console.warn('Skipping test - MySQL not available');
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
    it('should verify TINYINT(1) column type is used for boolean fields', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - MySQL not available');
        return;
      }

      // Query MySQL information schema to verify column types
      const columnInfo = await dataSource.query(`
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'team' 
        AND COLUMN_NAME = 'active'
      `);

      expect(columnInfo).toHaveLength(1);
      expect(columnInfo[0].DATA_TYPE).toBe('tinyint');
      expect(columnInfo[0].COLUMN_TYPE).toBe('tinyint(1)');
    });

    it('should verify boolean transformer handles MySQL TINYINT(1) values', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - MySQL not available');
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

    it('should handle edge cases with MySQL boolean operations', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - MySQL not available');
        return;
      }

      // Test direct SQL operations to ensure compatibility
      const result = await dataSource.query(`
        SELECT 
          CAST(1 AS UNSIGNED) as true_value,
          CAST(0 AS UNSIGNED) as false_value,
          CAST(TRUE AS UNSIGNED) as mysql_true,
          CAST(FALSE AS UNSIGNED) as mysql_false
      `);

      expect(result[0].true_value).toBe(1);
      expect(result[0].false_value).toBe(0);
      expect(result[0].mysql_true).toBe(1);
      expect(result[0].mysql_false).toBe(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk boolean operations efficiently', async () => {
      if (!dataSource || !dataSource.isInitialized) {
        console.warn('Skipping test - MySQL not available');
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
  });
});