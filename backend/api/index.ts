import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
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
      const expressApp = express();
      
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        { 
          logger: false,
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

      await app.init();
      cachedApp = app.getHttpAdapter().getInstance();
    }

    return cachedApp(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};