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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 3306,
      username: process.env.DATABASE_USER || 'dbuser',
      password: process.env.DATABASE_PASSWORD || 'dbpassword',
      database: process.env.DATABASE_NAME || 'mydb',
      entities: [Sprint, TeamMember, TeamMemberSprintCapacity, Team],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: ['error', 'warn'],
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      retryAttempts: 3,
      retryDelay: 1000,
    }),
    SprintModule,
    TeamMemberModule,
    TeamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}