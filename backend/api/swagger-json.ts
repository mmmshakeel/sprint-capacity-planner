import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const app = await NestFactory.create(AppModule, { logger: false });
    
    const config = new DocumentBuilder()
      .setTitle('Sprint Capacity Planner API')
      .setDescription('API for managing sprint capacity planning with team members and sprints')
      .setVersion('1.0')
      .addTag('sprints', 'Sprint management operations')
      .addTag('team-members', 'Team member management operations')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(document);
    
    await app.close();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate API documentation' });
  }
};