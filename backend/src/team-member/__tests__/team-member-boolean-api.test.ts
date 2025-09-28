import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';

describe('TeamMember Boolean API Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let teamRepository: any;
  let teamMemberRepository: any;
  let testTeam: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    teamRepository = dataSource.getRepository(Team);
    teamMemberRepository = dataSource.getRepository(TeamMember);
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
      await teamMemberRepository.clear();
      await teamRepository.clear();
    } finally {
      if (dataSource.options.type === 'sqlite') {
        await dataSource.query('PRAGMA foreign_keys = ON');
      }
    }

    // Create a test team for team member operations
    testTeam = await teamRepository.save({
      name: 'Test Team',
      description: 'Test Team for Member Operations',
      active: true,
    });
  });

  describe('POST /team-members - Create TeamMember with Boolean Fields', () => {
    it('should create team member with active=true', async () => {
      const createTeamMemberDto = {
        name: 'Active Member',
        skill: 'Developer',
        active: true,
        teamId: testTeam.id,
      };

      const response = await request(app.getHttpServer())
        .post('/team-members')
        .send(createTeamMemberDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Active Member');
      expect(response.body.active).toBe(true);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const savedMember = await teamMemberRepository.findOne({ where: { id: response.body.id } });
      expect(savedMember.active).toBe(true);
      expect(typeof savedMember.active).toBe('boolean');
    });

    it('should create team member with active=false', async () => {
      const createTeamMemberDto = {
        name: 'Inactive Member',
        skill: 'Designer',
        active: false,
        teamId: testTeam.id,
      };

      const response = await request(app.getHttpServer())
        .post('/team-members')
        .send(createTeamMemberDto)
        .expect(201);

      expect(response.body.active).toBe(false);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const savedMember = await teamMemberRepository.findOne({ where: { id: response.body.id } });
      expect(savedMember.active).toBe(false);
      expect(typeof savedMember.active).toBe('boolean');
    });

    it('should create team member with default active value when not specified', async () => {
      const createTeamMemberDto = {
        name: 'Default Member',
        skill: 'Tester',
        teamId: testTeam.id,
        // active field not specified
      };

      const response = await request(app.getHttpServer())
        .post('/team-members')
        .send(createTeamMemberDto)
        .expect(201);

      expect(response.body.active).toBe(true); // Default value
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const savedMember = await teamMemberRepository.findOne({ where: { id: response.body.id } });
      expect(savedMember.active).toBe(true);
      expect(typeof savedMember.active).toBe('boolean');
    });

    it('should handle null active value', async () => {
      const createTeamMemberDto = {
        name: 'Null Member',
        skill: 'Manager',
        active: null,
        teamId: testTeam.id,
      };

      const response = await request(app.getHttpServer())
        .post('/team-members')
        .send(createTeamMemberDto)
        .expect(201);

      expect(response.body.active).toBeNull();

      // Verify in database
      const savedMember = await teamMemberRepository.findOne({ where: { id: response.body.id } });
      expect(savedMember.active).toBeNull();
    });

    it('should create team member without teamId and boolean field', async () => {
      const createTeamMemberDto = {
        name: 'Independent Member',
        skill: 'Consultant',
        active: true,
        // teamId not specified
      };

      const response = await request(app.getHttpServer())
        .post('/team-members')
        .send(createTeamMemberDto)
        .expect(201);

      expect(response.body.active).toBe(true);
      expect(typeof response.body.active).toBe('boolean');
      expect(response.body.teamId).toBeNull();
    });

    it('should reject invalid boolean values', async () => {
      const createTeamMemberDto = {
        name: 'Invalid Member',
        skill: 'Developer',
        active: 'invalid_boolean',
        teamId: testTeam.id,
      };

      await request(app.getHttpServer())
        .post('/team-members')
        .send(createTeamMemberDto)
        .expect(400);
    });
  });

  describe('GET /team-members - Retrieve TeamMembers with Boolean Fields', () => {
    beforeEach(async () => {
      // Create test data
      await teamMemberRepository.save([
        { name: 'Active Member 1', skill: 'Developer', active: true, team: testTeam },
        { name: 'Active Member 2', skill: 'Designer', active: true, team: testTeam },
        { name: 'Inactive Member', skill: 'Tester', active: false, team: testTeam },
        { name: 'Null Member', skill: 'Manager', active: null, team: testTeam },
        { name: 'Independent Member', skill: 'Consultant', active: true }, // No team
      ]);
    });

    it('should return all team members with correct boolean types', async () => {
      const response = await request(app.getHttpServer())
        .get('/team-members')
        .expect(200);

      expect(response.body).toHaveLength(5);
      
      response.body.forEach(member => {
        expect(member).toHaveProperty('active');
        if (member.active !== null) {
          expect(typeof member.active).toBe('boolean');
        }
      });

      // Verify specific values
      const activeMembers = response.body.filter(member => member.active === true);
      const inactiveMembers = response.body.filter(member => member.active === false);
      const nullMembers = response.body.filter(member => member.active === null);

      expect(activeMembers).toHaveLength(3);
      expect(inactiveMembers).toHaveLength(1);
      expect(nullMembers).toHaveLength(1);
    });

    it('should filter team members by teamId with correct boolean types', async () => {
      const response = await request(app.getHttpServer())
        .get(`/team-members?teamId=${testTeam.id}`)
        .expect(200);

      expect(response.body).toHaveLength(4); // Excludes independent member
      
      response.body.forEach(member => {
        expect(member).toHaveProperty('active');
        if (member.active !== null) {
          expect(typeof member.active).toBe('boolean');
        }
      });
    });

    it('should return individual team member with correct boolean type', async () => {
      const members = await teamMemberRepository.find();
      const activeMember = members.find(m => m.active === true);

      const response = await request(app.getHttpServer())
        .get(`/team-members/${activeMember.id}`)
        .expect(200);

      expect(response.body.active).toBe(true);
      expect(typeof response.body.active).toBe('boolean');
    });
  });

  describe('PATCH /team-members/:id - Update TeamMember Boolean Fields', () => {
    let testMember: any;

    beforeEach(async () => {
      testMember = await teamMemberRepository.save({
        name: 'Test Member',
        skill: 'Developer',
        active: true,
        team: testTeam,
      });
    });

    it('should update team member active status from true to false', async () => {
      const updateDto = { active: false };

      const response = await request(app.getHttpServer())
        .patch(`/team-members/${testMember.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.active).toBe(false);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const updatedMember = await teamMemberRepository.findOne({ where: { id: testMember.id } });
      expect(updatedMember.active).toBe(false);
      expect(typeof updatedMember.active).toBe('boolean');
    });

    it('should update team member active status from false to true', async () => {
      // First set to false
      await teamMemberRepository.update(testMember.id, { active: false });

      const updateDto = { active: true };

      const response = await request(app.getHttpServer())
        .patch(`/team-members/${testMember.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.active).toBe(true);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const updatedMember = await teamMemberRepository.findOne({ where: { id: testMember.id } });
      expect(updatedMember.active).toBe(true);
      expect(typeof updatedMember.active).toBe('boolean');
    });

    it('should update team member active status to null', async () => {
      const updateDto = { active: null };

      const response = await request(app.getHttpServer())
        .patch(`/team-members/${testMember.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.active).toBeNull();

      // Verify in database
      const updatedMember = await teamMemberRepository.findOne({ where: { id: testMember.id } });
      expect(updatedMember.active).toBeNull();
    });

    it('should update other fields without affecting boolean field', async () => {
      const updateDto = { name: 'Updated Member Name' };

      const response = await request(app.getHttpServer())
        .patch(`/team-members/${testMember.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe('Updated Member Name');
      expect(response.body.active).toBe(true); // Should remain unchanged
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const updatedMember = await teamMemberRepository.findOne({ where: { id: testMember.id } });
      expect(updatedMember.name).toBe('Updated Member Name');
      expect(updatedMember.active).toBe(true);
      expect(typeof updatedMember.active).toBe('boolean');
    });

    it('should handle partial updates with boolean fields', async () => {
      const updateDto = {
        skill: 'Senior Developer',
        active: false,
      };

      const response = await request(app.getHttpServer())
        .patch(`/team-members/${testMember.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.skill).toBe('Senior Developer');
      expect(response.body.active).toBe(false);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const updatedMember = await teamMemberRepository.findOne({ where: { id: testMember.id } });
      expect(updatedMember.skill).toBe('Senior Developer');
      expect(updatedMember.active).toBe(false);
      expect(typeof updatedMember.active).toBe('boolean');
    });

    it('should update team assignment and boolean field together', async () => {
      // Create another team
      const anotherTeam = await teamRepository.save({
        name: 'Another Team',
        active: true,
      });

      const updateDto = {
        teamId: anotherTeam.id,
        active: false,
      };

      const response = await request(app.getHttpServer())
        .patch(`/team-members/${testMember.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.teamId).toBe(anotherTeam.id);
      expect(response.body.active).toBe(false);
      expect(typeof response.body.active).toBe('boolean');

      // Verify in database
      const updatedMember = await teamMemberRepository.findOne({ 
        where: { id: testMember.id },
        relations: ['team']
      });
      expect(updatedMember.team.id).toBe(anotherTeam.id);
      expect(updatedMember.active).toBe(false);
      expect(typeof updatedMember.active).toBe('boolean');
    });
  });

  describe('DELETE /team-members/:id - Delete TeamMember with Boolean Fields', () => {
    it('should delete team member regardless of boolean field values', async () => {
      const activeMember = await teamMemberRepository.save({
        name: 'Active Member to Delete',
        skill: 'Developer',
        active: true,
        team: testTeam,
      });

      const inactiveMember = await teamMemberRepository.save({
        name: 'Inactive Member to Delete',
        skill: 'Designer',
        active: false,
        team: testTeam,
      });

      // Delete active member
      await request(app.getHttpServer())
        .delete(`/team-members/${activeMember.id}`)
        .expect(200);

      // Delete inactive member
      await request(app.getHttpServer())
        .delete(`/team-members/${inactiveMember.id}`)
        .expect(200);

      // Verify members are deleted
      const deletedActiveMember = await teamMemberRepository.findOne({ where: { id: activeMember.id } });
      const deletedInactiveMember = await teamMemberRepository.findOne({ where: { id: inactiveMember.id } });

      expect(deletedActiveMember).toBeNull();
      expect(deletedInactiveMember).toBeNull();
    });
  });

  describe('GET /team-members/skills - Skills Endpoint with Boolean Context', () => {
    beforeEach(async () => {
      // Create team members with different skills and active states
      await teamMemberRepository.save([
        { name: 'Active Dev 1', skill: 'Developer', active: true, team: testTeam },
        { name: 'Active Dev 2', skill: 'Developer', active: true, team: testTeam },
        { name: 'Inactive Dev', skill: 'Developer', active: false, team: testTeam },
        { name: 'Active Designer', skill: 'Designer', active: true, team: testTeam },
        { name: 'Inactive Designer', skill: 'Designer', active: false, team: testTeam },
      ]);
    });

    it('should return skills from all team members regardless of active status', async () => {
      const response = await request(app.getHttpServer())
        .get('/team-members/skills')
        .expect(200);

      expect(response.body).toContain('Developer');
      expect(response.body).toContain('Designer');
    });

    it('should return skills filtered by team with boolean context', async () => {
      const response = await request(app.getHttpServer())
        .get(`/team-members/skills?teamId=${testTeam.id}`)
        .expect(200);

      expect(response.body).toContain('Developer');
      expect(response.body).toContain('Designer');
    });
  });

  describe('Cross-Database Boolean Consistency for TeamMembers', () => {
    it('should maintain boolean consistency across different team member operations', async () => {
      // Create team member via API
      const createResponse = await request(app.getHttpServer())
        .post('/team-members')
        .send({
          name: 'Consistency Test Member',
          skill: 'Developer',
          active: true,
          teamId: testTeam.id,
        })
        .expect(201);

      const memberId = createResponse.body.id;
      expect(createResponse.body.active).toBe(true);
      expect(typeof createResponse.body.active).toBe('boolean');

      // Retrieve team member via API
      const getResponse = await request(app.getHttpServer())
        .get(`/team-members/${memberId}`)
        .expect(200);

      expect(getResponse.body.active).toBe(true);
      expect(typeof getResponse.body.active).toBe('boolean');

      // Update team member via API
      const updateResponse = await request(app.getHttpServer())
        .patch(`/team-members/${memberId}`)
        .send({ active: false })
        .expect(200);

      expect(updateResponse.body.active).toBe(false);
      expect(typeof updateResponse.body.active).toBe('boolean');

      // Retrieve updated team member via API
      const getUpdatedResponse = await request(app.getHttpServer())
        .get(`/team-members/${memberId}`)
        .expect(200);

      expect(getUpdatedResponse.body.active).toBe(false);
      expect(typeof getUpdatedResponse.body.active).toBe('boolean');

      // Verify in database directly
      const dbMember = await teamMemberRepository.findOne({ where: { id: memberId } });
      expect(dbMember.active).toBe(false);
      expect(typeof dbMember.active).toBe('boolean');
    });

    it('should handle team member filtering with boolean fields correctly', async () => {
      // Create team members with different active states
      await teamMemberRepository.save([
        { name: 'Active Member 1', skill: 'Developer', active: true, team: testTeam },
        { name: 'Active Member 2', skill: 'Designer', active: true, team: testTeam },
        { name: 'Inactive Member 1', skill: 'Tester', active: false, team: testTeam },
      ]);

      // Get all team members for the team
      const allMembersResponse = await request(app.getHttpServer())
        .get(`/team-members?teamId=${testTeam.id}`)
        .expect(200);

      expect(allMembersResponse.body).toHaveLength(3);

      // Verify boolean types and values
      const activeMembers = allMembersResponse.body.filter(member => member.active === true);
      const inactiveMembers = allMembersResponse.body.filter(member => member.active === false);

      expect(activeMembers).toHaveLength(2);
      expect(inactiveMembers).toHaveLength(1);

      activeMembers.forEach(member => {
        expect(typeof member.active).toBe('boolean');
        expect(member.active).toBe(true);
      });

      inactiveMembers.forEach(member => {
        expect(typeof member.active).toBe('boolean');
        expect(member.active).toBe(false);
      });
    });
  });

  describe('Error Handling with TeamMember Boolean Fields', () => {
    it('should return proper error messages for invalid boolean values', async () => {
      const invalidMemberDto = {
        name: 'Invalid Member',
        skill: 'Developer',
        active: 'not_a_boolean',
        teamId: testTeam.id,
      };

      const response = await request(app.getHttpServer())
        .post('/team-members')
        .send(invalidMemberDto)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('active'))).toBe(true);
    });

    it('should handle validation errors with multiple invalid fields including boolean', async () => {
      const invalidMemberDto = {
        // name missing (required)
        skill: '', // empty skill (should be string)
        active: 123, // invalid boolean
        teamId: 'not_a_number', // invalid team ID
      };

      const response = await request(app.getHttpServer())
        .post('/team-members')
        .send(invalidMemberDto)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
      
      // Should contain validation errors for multiple fields
      const messages = response.body.message;
      expect(messages.some(msg => msg.includes('name'))).toBe(true);
      expect(messages.some(msg => msg.includes('active'))).toBe(true);
    });
  });

  describe('Performance with TeamMember Boolean Fields', () => {
    it('should handle bulk team member operations with boolean fields efficiently', async () => {
      const members = Array.from({ length: 20 }, (_, i) => ({
        name: `Bulk Member ${i}`,
        skill: i % 2 === 0 ? 'Developer' : 'Designer',
        active: i % 3 !== 0, // Mix of true/false values
        teamId: testTeam.id,
      }));

      const startTime = Date.now();
      const createPromises = members.map(member =>
        request(app.getHttpServer())
          .post('/team-members')
          .send(member)
          .expect(201)
      );

      const responses = await Promise.all(createPromises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds

      // Verify all members were created with correct boolean types
      responses.forEach((response, index) => {
        expect(response.body.active).toBe(members[index].active);
        expect(typeof response.body.active).toBe('boolean');
      });

      // Verify retrieval performance
      const retrievalStartTime = Date.now();
      const getAllResponse = await request(app.getHttpServer())
        .get(`/team-members?teamId=${testTeam.id}`)
        .expect(200);
      const retrievalEndTime = Date.now();

      expect(retrievalEndTime - retrievalStartTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(getAllResponse.body).toHaveLength(20);

      getAllResponse.body.forEach(member => {
        expect(typeof member.active).toBe('boolean');
      });
    });
  });
});