import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';

describe('Team Boolean API Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let teamRepository: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    teamRepository = dataSource.getRepository(Team);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data - disable foreign key checks temporarily for SQLite
    if (dataSource.options.type === 'sqlite') {
      await dataSource.query('PRAGMA foreign_keys = OFF');
    }
    
    try {
      await dataSource.getRepository(TeamMember).clear();
      await teamRepository.clear();
    } finally {
      if (dataSource.options.type === 'sqlite') {
        await dataSource.query('PRAGMA foreign_keys = ON');
      }
    }
  });

  describe('POST /teams - Create Team with Boolean Fields', () => {
    it('should create team with active=true', async () => {
      const createTeamDto = {
        name: 'Active Team',
        description: 'Test Description',
        active: true,
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .send(createTeamDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Active Team');
      expect(response.body.active).toBe(true);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const savedTeam = await teamRepository.findOne({ where: { id: response.body.id } });
      expect(savedTeam.active).toBe(true);
      expect(typeof savedTeam.active).toBe('boolean');
    });

    it('should create team with active=false', async () => {
      const createTeamDto = {
        name: 'Inactive Team',
        description: 'Test Description',
        active: false,
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .send(createTeamDto)
        .expect(201);

      expect(response.body.active).toBe(false);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const savedTeam = await teamRepository.findOne({ where: { id: response.body.id } });
      expect(savedTeam.active).toBe(false);
      expect(typeof savedTeam.active).toBe('boolean');
    });

    it('should create team with default active value when not specified', async () => {
      const createTeamDto = {
        name: 'Default Team',
        description: 'Test Description',
        // active field not specified
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .send(createTeamDto)
        .expect(201);

      expect(response.body.active).toBe(true); // Default value
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const savedTeam = await teamRepository.findOne({ where: { id: response.body.id } });
      expect(savedTeam.active).toBe(true);
      expect(typeof savedTeam.active).toBe('boolean');
    });

    it('should handle null active value', async () => {
      const createTeamDto = {
        name: 'Null Team',
        description: 'Test Description',
        active: null,
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .send(createTeamDto)
        .expect(201);

      expect(response.body.active).toBeNull();

      // Verify in database
      const savedTeam = await teamRepository.findOne({ where: { id: response.body.id } });
      expect(savedTeam.active).toBeNull();
    });

    it('should reject invalid boolean values', async () => {
      const createTeamDto = {
        name: 'Invalid Team',
        description: 'Test Description',
        active: 'invalid_boolean',
      };

      await request(app.getHttpServer())
        .post('/teams')
        .send(createTeamDto)
        .expect(400);
    });

    it('should handle string representations of boolean values', async () => {
      // Test string "true"
      const createTeamDto1 = {
        name: 'String True Team',
        description: 'Test Description',
        active: 'true',
      };

      await request(app.getHttpServer())
        .post('/teams')
        .send(createTeamDto1)
        .expect(400); // Should be rejected by validation

      // Test string "false"
      const createTeamDto2 = {
        name: 'String False Team',
        description: 'Test Description',
        active: 'false',
      };

      await request(app.getHttpServer())
        .post('/teams')
        .send(createTeamDto2)
        .expect(400); // Should be rejected by validation
    });

    it('should handle numeric representations of boolean values', async () => {
      // Test numeric 1
      const createTeamDto1 = {
        name: 'Numeric 1 Team',
        description: 'Test Description',
        active: 1,
      };

      await request(app.getHttpServer())
        .post('/teams')
        .send(createTeamDto1)
        .expect(400); // Should be rejected by validation

      // Test numeric 0
      const createTeamDto2 = {
        name: 'Numeric 0 Team',
        description: 'Test Description',
        active: 0,
      };

      await request(app.getHttpServer())
        .post('/teams')
        .send(createTeamDto2)
        .expect(400); // Should be rejected by validation
    });
  });

  describe('GET /teams - Retrieve Teams with Boolean Fields', () => {
    beforeEach(async () => {
      // Create test data
      await teamRepository.save([
        { name: 'Active Team 1', active: true },
        { name: 'Active Team 2', active: true },
        { name: 'Inactive Team', active: false },
        { name: 'Null Team', active: null },
      ]);
    });

    it('should return all teams with correct boolean types', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams')
        .expect(200);

      expect(response.body).toHaveLength(4);
      
      response.body.forEach(team => {
        expect(team).toHaveProperty('active');
        if (team.active !== null) {
          expect(typeof team.active).toBe('boolean');
        }
      });

      // Verify specific values
      const activeTeams = response.body.filter(team => team.active === true);
      const inactiveTeams = response.body.filter(team => team.active === false);
      const nullTeams = response.body.filter(team => team.active === null);

      expect(activeTeams).toHaveLength(2);
      expect(inactiveTeams).toHaveLength(1);
      expect(nullTeams).toHaveLength(1);
    });

    it('should return individual team with correct boolean type', async () => {
      const teams = await teamRepository.find();
      const activeTeam = teams.find(t => t.active === true);

      const response = await request(app.getHttpServer())
        .get(`/teams/${activeTeam.id}`)
        .expect(200);

      expect(response.body.active).toBe(true);
      expect(typeof response.body.active).toBe('boolean');
    });
  });

  describe('PATCH /teams/:id - Update Team Boolean Fields', () => {
    let testTeam: any;

    beforeEach(async () => {
      testTeam = await teamRepository.save({
        name: 'Test Team',
        description: 'Test Description',
        active: true,
      });
    });

    it('should update team active status from true to false', async () => {
      const updateDto = { active: false };

      const response = await request(app.getHttpServer())
        .patch(`/teams/${testTeam.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.active).toBe(false);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const updatedTeam = await teamRepository.findOne({ where: { id: testTeam.id } });
      expect(updatedTeam.active).toBe(false);
      expect(typeof updatedTeam.active).toBe('boolean');
    });

    it('should update team active status from false to true', async () => {
      // First set to false
      await teamRepository.update(testTeam.id, { active: false });

      const updateDto = { active: true };

      const response = await request(app.getHttpServer())
        .patch(`/teams/${testTeam.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.active).toBe(true);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const updatedTeam = await teamRepository.findOne({ where: { id: testTeam.id } });
      expect(updatedTeam.active).toBe(true);
      expect(typeof updatedTeam.active).toBe('boolean');
    });

    it('should update team active status to null', async () => {
      const updateDto = { active: null };

      const response = await request(app.getHttpServer())
        .patch(`/teams/${testTeam.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.active).toBeNull();

      // Verify in database
      const updatedTeam = await teamRepository.findOne({ where: { id: testTeam.id } });
      expect(updatedTeam.active).toBeNull();
    });

    it('should update other fields without affecting boolean field', async () => {
      const updateDto = { name: 'Updated Team Name' };

      const response = await request(app.getHttpServer())
        .patch(`/teams/${testTeam.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe('Updated Team Name');
      expect(response.body.active).toBe(true); // Should remain unchanged
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const updatedTeam = await teamRepository.findOne({ where: { id: testTeam.id } });
      expect(updatedTeam.name).toBe('Updated Team Name');
      expect(updatedTeam.active).toBe(true);
      expect(typeof updatedTeam.active).toBe('boolean');
    });

    it('should reject invalid boolean values in updates', async () => {
      const updateDto = { active: 'invalid_boolean' };

      await request(app.getHttpServer())
        .patch(`/teams/${testTeam.id}`)
        .send(updateDto)
        .expect(400);

      // Verify original value is unchanged
      const unchangedTeam = await teamRepository.findOne({ where: { id: testTeam.id } });
      expect(unchangedTeam.active).toBe(true);
      expect(typeof unchangedTeam.active).toBe('boolean');
    });

    it('should handle partial updates with boolean fields', async () => {
      const updateDto = {
        name: 'Partially Updated Team',
        active: false,
      };

      const response = await request(app.getHttpServer())
        .patch(`/teams/${testTeam.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe('Partially Updated Team');
      expect(response.body.active).toBe(false);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const updatedTeam = await teamRepository.findOne({ where: { id: testTeam.id } });
      expect(updatedTeam.name).toBe('Partially Updated Team');
      expect(updatedTeam.active).toBe(false);
      expect(typeof updatedTeam.active).toBe('boolean');
    });
  });

  describe('DELETE /teams/:id - Delete Team with Boolean Fields', () => {
    it('should delete team regardless of boolean field values', async () => {
      const activeTeam = await teamRepository.save({
        name: 'Active Team to Delete',
        active: true,
      });

      const inactiveTeam = await teamRepository.save({
        name: 'Inactive Team to Delete',
        active: false,
      });

      // Delete active team
      await request(app.getHttpServer())
        .delete(`/teams/${activeTeam.id}`)
        .expect(200);

      // Delete inactive team
      await request(app.getHttpServer())
        .delete(`/teams/${inactiveTeam.id}`)
        .expect(200);

      // Verify teams are deleted
      const deletedActiveTeam = await teamRepository.findOne({ where: { id: activeTeam.id } });
      const deletedInactiveTeam = await teamRepository.findOne({ where: { id: inactiveTeam.id } });

      expect(deletedActiveTeam).toBeNull();
      expect(deletedInactiveTeam).toBeNull();
    });
  });

  describe('Cross-Database Boolean Consistency', () => {
    it('should maintain boolean consistency across different database operations', async () => {
      // Create team via API
      const createResponse = await request(app.getHttpServer())
        .post('/teams')
        .send({
          name: 'Consistency Test Team',
          active: true,
        })
        .expect(201);

      const teamId = createResponse.body.id;
      expect(createResponse.body.active).toBe(true);
      expect(typeof createResponse.body.active).toBe('boolean');

      // Retrieve team via API
      const getResponse = await request(app.getHttpServer())
        .get(`/teams/${teamId}`)
        .expect(200);

      expect(getResponse.body.active).toBe(true);
      expect(typeof getResponse.body.active).toBe('boolean');

      // Update team via API
      const updateResponse = await request(app.getHttpServer())
        .patch(`/teams/${teamId}`)
        .send({ active: false })
        .expect(200);

      expect(updateResponse.body.active).toBe(false);
      expect(typeof updateResponse.body.active).toBe('boolean');

      // Retrieve updated team via API
      const getUpdatedResponse = await request(app.getHttpServer())
        .get(`/teams/${teamId}`)
        .expect(200);

      expect(getUpdatedResponse.body.active).toBe(false);
      expect(typeof getUpdatedResponse.body.active).toBe('boolean');

      // Verify in database directly
      const dbTeam = await teamRepository.findOne({ where: { id: teamId } });
      expect(dbTeam.active).toBe(false);
      expect(typeof dbTeam.active).toBe('boolean');
    });

    it('should handle bulk operations with boolean fields correctly', async () => {
      // Create multiple teams
      const teams = [
        { name: 'Bulk Team 1', active: true },
        { name: 'Bulk Team 2', active: false },
        { name: 'Bulk Team 3', active: true },
      ];

      const createPromises = teams.map(team =>
        request(app.getHttpServer())
          .post('/teams')
          .send(team)
          .expect(201)
      );

      const createResponses = await Promise.all(createPromises);

      // Verify all teams were created with correct boolean types
      createResponses.forEach((response, index) => {
        expect(response.body.active).toBe(teams[index].active);
        expect(typeof response.body.active).toBe('boolean');
      });

      // Retrieve all teams and verify boolean consistency
      const getAllResponse = await request(app.getHttpServer())
        .get('/teams')
        .expect(200);

      expect(getAllResponse.body).toHaveLength(3);
      getAllResponse.body.forEach(team => {
        expect(typeof team.active).toBe('boolean');
      });

      const activeTeams = getAllResponse.body.filter(team => team.active === true);
      const inactiveTeams = getAllResponse.body.filter(team => team.active === false);

      expect(activeTeams).toHaveLength(2);
      expect(inactiveTeams).toHaveLength(1);
    });
  });

  describe('Error Handling with Boolean Fields', () => {
    it('should return proper error messages for invalid boolean values', async () => {
      const invalidTeamDto = {
        name: 'Invalid Team',
        active: 'not_a_boolean',
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .send(invalidTeamDto)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('active'))).toBe(true);
    });

    it('should handle edge cases with boolean field validation', async () => {
      const edgeCases = [
        { active: undefined }, // Should use default
        { active: '' }, // Should be rejected
        { active: [] }, // Should be rejected
        { active: {} }, // Should be rejected
      ];

      for (const edgeCase of edgeCases) {
        const teamDto = {
          name: 'Edge Case Team',
          ...edgeCase,
        };

        if (edgeCase.active === undefined) {
          // Should succeed with default value
          const response = await request(app.getHttpServer())
            .post('/teams')
            .send(teamDto)
            .expect(201);

          expect(response.body.active).toBe(true); // Default value
          expect(typeof response.body.active).toBe('boolean');

          // Clean up
          await teamRepository.delete(response.body.id);
        } else {
          // Should fail validation
          await request(app.getHttpServer())
            .post('/teams')
            .send(teamDto)
            .expect(400);
        }
      }
    });
  });

  describe('Performance with Boolean Fields', () => {
    it('should handle large payloads with boolean fields efficiently', async () => {
      const largeTeamDto = {
        name: 'Large Team',
        description: 'A'.repeat(1000), // Large description
        active: true,
      };

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .post('/teams')
        .send(largeTeamDto)
        .expect(201);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(response.body.active).toBe(true);
      expect(typeof response.body.active).toBe('boolean');
    });

    it('should handle concurrent boolean field operations', async () => {
      const concurrentOperations = Array.from({ length: 10 }, (_, i) => 
        request(app.getHttpServer())
          .post('/teams')
          .send({
            name: `Concurrent Team ${i}`,
            active: i % 2 === 0,
          })
          .expect(201)
      );

      const responses = await Promise.all(concurrentOperations);

      responses.forEach((response, index) => {
        expect(response.body.active).toBe(index % 2 === 0);
        expect(typeof response.body.active).toBe('boolean');
      });
    });
  });
});