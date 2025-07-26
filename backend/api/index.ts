import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

let cachedApp: any;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!cachedApp) {
    const expressApp = express();
    
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: false }
    );
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
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

    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }

  return cachedApp(req, res);
};