import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SprintService } from './sprint.service';
import { SprintController } from './sprint.controller';
import { Sprint } from '../entities/sprint.entity';
import { TeamMemberSprintCapacity } from '../entities/team-member-sprint-capacity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sprint, TeamMemberSprintCapacity])],
  controllers: [SprintController],
  providers: [SprintService],
  exports: [SprintService],
})
export class SprintModule {}