import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSeedingService } from './services/data-seeding.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
  const databaseType = process.env.DATABASE_TYPE || 'mysql';
  if (databaseType === 'sqlite') {
    const seedingService = app.get(DataSeedingService);
    await seedingService.seedDatabase();
  }

  await app.listen(process.env.PORT || 3300);
}
bootstrap();