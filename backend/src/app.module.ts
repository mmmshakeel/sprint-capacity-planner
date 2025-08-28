import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Sprint } from './entities/sprint.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamMemberSprintCapacity } from './entities/team-member-sprint-capacity.entity';
import { Team } from './entities/team.entity';
import { SprintModule } from './sprint/sprint.module';
import { TeamMemberModule } from './team-member/team-member.module';
import { TeamModule } from './team/team.module';
import { createDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        try {
          return createDatabaseConfig();
        } catch (error) {
          console.error('Failed to create database configuration:', error.message);
          throw error;
        }
      },
    }),
    SprintModule,
    TeamMemberModule,
    TeamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}