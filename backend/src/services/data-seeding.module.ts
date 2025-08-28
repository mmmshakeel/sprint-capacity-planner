import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSeedingService } from './data-seeding.service';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { Sprint } from '../entities/sprint.entity';
import { TeamMemberSprintCapacity } from '../entities/team-member-sprint-capacity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Team,
      TeamMember,
      Sprint,
      TeamMemberSprintCapacity,
    ]),
  ],
  providers: [DataSeedingService],
  exports: [DataSeedingService],
})
export class DataSeedingModule {}