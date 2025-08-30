import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSeedingService } from '../data-seeding.service';
import { DataSeedingModule } from '../data-seeding.module';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { Sprint } from '../../entities/sprint.entity';
import { TeamMemberSprintCapacity } from '../../entities/team-member-sprint-capacity.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

describe('DataSeedingService Integration', () => {
  let service: DataSeedingService;
  let teamRepository: Repository<Team>;
  let teamMemberRepository: Repository<TeamMember>;
  let sprintRepository: Repository<Sprint>;
  let capacityRepository: Repository<TeamMemberSprintCapacity>;
  let module: TestingModule;
  
  const testDbPath = path.join(__dirname, 'test-seeding.sqlite');

  beforeAll(async () => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: testDbPath,
          entities: [Team, TeamMember, Sprint, TeamMemberSprintCapacity],
          synchronize: true,
          logging: false,
        }),
        DataSeedingModule,
      ],
    }).compile();

    service = module.get<DataSeedingService>(DataSeedingService);
    teamRepository = module.get<Repository<Team>>(getRepositoryToken(Team));
    teamMemberRepository = module.get<Repository<TeamMember>>(getRepositoryToken(TeamMember));
    sprintRepository = module.get<Repository<Sprint>>(getRepositoryToken(Sprint));
    capacityRepository = module.get<Repository<TeamMemberSprintCapacity>>(getRepositoryToken(TeamMemberSprintCapacity));
  });

  afterAll(async () => {
    await module.close();
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('should seed empty database with sample data', async () => {
    // Verify database is empty
    expect(await teamRepository.count()).toBe(0);
    expect(await teamMemberRepository.count()).toBe(0);
    expect(await sprintRepository.count()).toBe(0);
    expect(await capacityRepository.count()).toBe(0);

    // Run seeding
    await service.seedDatabase();

    // Verify data was seeded
    expect(await teamRepository.count()).toBe(3);
    expect(await teamMemberRepository.count()).toBe(5);
    expect(await sprintRepository.count()).toBe(8);
    expect(await capacityRepository.count()).toBe(14);

    // Verify specific team data
    const frontendTeam = await teamRepository.findOne({ where: { name: 'Frontend Team' } });
    expect(frontendTeam).toBeDefined();
    expect(frontendTeam.description).toBe('Team responsible for frontend development');

    // Verify team member data with relationships
    const alice = await teamMemberRepository.findOne({ 
      where: { name: 'Alice Johnson' },
      relations: ['team']
    });
    expect(alice).toBeDefined();
    expect(alice.skill).toBe('Frontend');
    expect(alice.team.name).toBe('Frontend Team');

    // Verify sprint data with relationships
    const frontendSprint1 = await sprintRepository.findOne({ 
      where: { name: 'Frontend Sprint 1' },
      relations: ['team']
    });
    expect(frontendSprint1).toBeDefined();
    expect(frontendSprint1.capacity).toBe(50);
    expect(frontendSprint1.team.name).toBe('Frontend Team');

    // Verify capacity assignments
    const aliceCapacity = await capacityRepository.findOne({
      where: { teamMemberId: alice.id, sprintId: frontendSprint1.id }
    });
    expect(aliceCapacity).toBeDefined();
    expect(aliceCapacity.capacity).toBe(10);
  });

  it('should not duplicate data on subsequent runs', async () => {
    // Run seeding again
    await service.seedDatabase();

    // Verify counts remain the same
    expect(await teamRepository.count()).toBe(3);
    expect(await teamMemberRepository.count()).toBe(5);
    expect(await sprintRepository.count()).toBe(8);
    expect(await capacityRepository.count()).toBe(14);
  });
});