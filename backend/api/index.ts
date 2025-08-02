import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

let cachedApp: any;

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (!cachedApp) {
      // Log environment variables for debugging
      console.log('=== Environment Variables Debug ===');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
      console.log('DATABASE_PORT:', process.env.DATABASE_PORT);
      console.log('DATABASE_USER:', process.env.DATABASE_USER);
      console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? '[REDACTED]' : 'undefined');
      console.log('DATABASE_NAME:', process.env.DATABASE_NAME);
      console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
      console.log('=== End Environment Variables Debug ===');
      
      const expressApp = express();
      
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        { 
          logger: ['error', 'warn', 'log'],
          abortOnError: false
        }
      );
      
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }));

      app.enableCors({
        origin: '*',
        credentials: true,
      });

      // Setup Swagger documentation with CDN assets for Vercel compatibility
      const config = new DocumentBuilder()
        .setTitle('Sprint Capacity Planner API')
        .setDescription('API for managing sprint capacity planning with team members and sprints')
        .setVersion('1.0')
        .addTag('sprints', 'Sprint management operations')
        .addTag('team-members', 'Team member management operations')
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
        },
        customSiteTitle: 'Sprint Capacity Planner API',
        customfavIcon: '/favicon.ico',
        customJs: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
        ],
        customCssUrl: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        ],
      });

      console.log('Initializing NestJS app...');
      
      await app.init();
      console.log('NestJS app initialized successfully');
      cachedApp = app.getHttpAdapter().getInstance();
    }

    return cachedApp(req, res);
  } catch (error) {
    console.error('=== API Error Details ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    console.error('=== End API Error Details ===');
    
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      code: error.code,
      name: error.name,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};