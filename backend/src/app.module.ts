import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SprintModule } from './sprint/sprint.module';
import { TeamMemberModule } from './team-member/team-member.module';
import { TeamModule } from './team/team.module';
import { DataSeedingModule } from './services/data-seeding.module';
import { createDatabaseConfig } from './config/database.config';
import { DatabaseLoggerService } from './config/database-logger.service';
import { DatabaseErrorHandlerService } from './config/database-error-handler.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const logger = new DatabaseLoggerService();
        const errorHandler = new DatabaseErrorHandlerService();
        const dbType = (process.env.DATABASE_TYPE || 'mysql').toLowerCase() as 'mysql' | 'sqlite';

        try {
          logger.logConnectionAttempt(dbType);
          const startTime = Date.now();

          const config = createDatabaseConfig();

          const duration = Date.now() - startTime;
          logger.logPerformanceMetric('Database configuration creation', duration);

          return config;
        } catch (error) {
          const dbError = errorHandler.handleDatabaseError(error, dbType);
          logger.logConnectionError(dbType, error);

          // Create a more user-friendly error message
          const userFriendlyError = new Error(errorHandler.formatUserErrorMessage(dbError));
          (userFriendlyError as any).originalError = error;
          (userFriendlyError as any).databaseError = dbError;

          throw userFriendlyError;
        }
      },
      // Add connection event handlers for better logging
      dataSourceFactory: async (options) => {
        const { DataSource } = await import('typeorm');
        const logger = new DatabaseLoggerService();
        const dbType = (process.env.DATABASE_TYPE || 'mysql').toLowerCase() as 'mysql' | 'sqlite';

        const dataSource = new DataSource(options);

        try {
          const startTime = Date.now();
          await dataSource.initialize();
          const duration = Date.now() - startTime;

          logger.logConnectionSuccess(dbType);
          logger.logPerformanceMetric('Database connection initialization', duration);

          return dataSource;
        } catch (error) {
          const errorHandler = new DatabaseErrorHandlerService();
          const dbError = errorHandler.handleDatabaseError(error, dbType);
          logger.logConnectionError(dbType, error);

          throw error;
        }
      },
    }),
    DataSeedingModule,
    SprintModule,
    TeamMemberModule,
    TeamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }