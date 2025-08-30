import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSeedingService } from './services/data-seeding.service';
import { DatabaseLoggerService } from './config/database-logger.service';
import { DatabaseErrorHandlerService } from './config/database-error-handler.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const dbLogger = new DatabaseLoggerService();
  const errorHandler = new DatabaseErrorHandlerService();
  
  try {
    logger.log('🚀 Starting Sprint Capacity Planner API...');
    
    // Create the NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });

    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Sprint Capacity Planner API')
      .setDescription('API for managing sprint capacity planning with team members and sprints')
      .setVersion('1.0')
      .addTag('sprints', 'Sprint management operations')
      .addTag('team-members', 'Team member management operations')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Run database seeding for SQLite databases
    const databaseType = (process.env.DATABASE_TYPE || 'mysql').toLowerCase();
    if (databaseType === 'sqlite') {
      try {
        dbLogger.logSeedingInfo('Starting database seeding for SQLite...');
        const seedingService = app.get(DataSeedingService);
        await seedingService.seedDatabase();
        dbLogger.logSeedingInfo('Database seeding completed successfully');
      } catch (seedingError) {
        const dbError = errorHandler.handleDatabaseError(seedingError, 'sqlite');
        dbLogger.logConfigurationError('sqlite', `Seeding failed: ${dbError.userMessage}`);
        
        // Don't fail the application startup for seeding errors, just log them
        logger.warn('Database seeding failed, but application will continue to start');
        logger.warn(`Seeding error: ${dbError.userMessage}`);
      }
    }

    const port = process.env.PORT || 3300;
    await app.listen(port);
    
    logger.log(`✅ Application is running on: http://localhost:${port}`);
    logger.log(`📚 API documentation available at: http://localhost:${port}/api`);
    logger.log(`🗄️  Database type: ${databaseType.toUpperCase()}`);
    
  } catch (error) {
    logger.error('❌ Failed to start application');
    
    // Check if this is a database-related error
    if (error.databaseError || error.originalError) {
      const dbType = (process.env.DATABASE_TYPE || 'mysql').toLowerCase() as 'mysql' | 'sqlite';
      const dbError = error.databaseError || errorHandler.handleDatabaseError(error.originalError || error, dbType);
      
      logger.error('Database Error Details:');
      logger.error(`  Type: ${dbError.type}`);
      logger.error(`  Message: ${dbError.userMessage}`);
      logger.error(`  Technical: ${dbError.technicalMessage}`);
      logger.error('  Troubleshooting Steps:');
      dbError.troubleshootingSteps.forEach((step, index) => {
        logger.error(`    ${index + 1}. ${step}`);
      });
    } else {
      logger.error(`Application startup error: ${error.message}`);
      if (error.stack) {
        logger.error(error.stack);
      }
    }
    
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Promise Rejection:', reason);
  
  // If it's a database error, provide better context
  if (reason && typeof reason === 'object' && (reason as any).databaseError) {
    const dbError = (reason as any).databaseError;
    logger.error(`Database Error Type: ${dbError.type}`);
    logger.error(`User Message: ${dbError.userMessage}`);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error.message);
  logger.error(error.stack);
  process.exit(1);
});

bootstrap();