import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Sprint } from '../entities/sprint.entity';
import { TeamMember } from '../entities/team-member.entity';
import { TeamMemberSprintCapacity } from '../entities/team-member-sprint-capacity.entity';
import { Team } from '../entities/team.entity';
import { DatabaseLoggerService } from './database-logger.service';
import { DatabaseErrorHandlerService } from './database-error-handler.service';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Base database configuration interface
 */
export interface DatabaseConfig {
  type: 'mysql' | 'sqlite' | 'postgresql';
  entities: any[];
  synchronize: boolean;
  logging: any;
}

/**
 * MySQL-specific database configuration interface
 */
export interface MySqlConfig extends DatabaseConfig {
  type: 'mysql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: any;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * SQLite-specific database configuration interface
 */
export interface SqliteConfig extends DatabaseConfig {
  type: 'sqlite';
  database: string; // File path for SQLite
}

/**
 * PostgreSQL-specific database configuration interface
 */
export interface PostgreSqlConfig extends DatabaseConfig {
  type: 'postgresql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: any;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Validates MySQL configuration environment variables
 */
function validateMySqlConfig(): void {
  const errors: string[] = [];
  
  // Check required variables
  const requiredVars = ['DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    errors.push(`Missing required MySQL environment variables: ${missingVars.join(', ')}`);
  }
  
  // Validate DATABASE_PORT if provided
  if (process.env.DATABASE_PORT) {
    const port = parseInt(process.env.DATABASE_PORT);
    if (isNaN(port) || port <= 0 || port > 65535) {
      errors.push(`DATABASE_PORT must be a valid port number (1-65535), got: ${process.env.DATABASE_PORT}`);
    }
  }
  
  // Validate DATABASE_HOST format if provided
  if (process.env.DATABASE_HOST && process.env.DATABASE_HOST.trim() === '') {
    errors.push('DATABASE_HOST cannot be empty');
  }
  
  // Validate database name format
  if (process.env.DATABASE_NAME) {
    const dbName = process.env.DATABASE_NAME.trim();
    if (dbName === '') {
      errors.push('DATABASE_NAME cannot be empty');
    } else if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      errors.push('DATABASE_NAME can only contain letters, numbers, and underscores');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(
      `MySQL configuration validation failed:\n  - ${errors.join('\n  - ')}\n\n` +
      'Please check your environment variables and ensure all required MySQL settings are properly configured.'
    );
  }
}

/**
 * Validates SQLite configuration and creates database directory if needed
 */
function validateSqliteConfig(): void {
  const errors: string[] = [];
  
  // Validate database path format - check the actual env var, not the defaulted value
  if (process.env.DATABASE_PATH !== undefined && process.env.DATABASE_PATH.trim() === '') {
    errors.push('DATABASE_PATH cannot be empty');
    throw new Error(`SQLite configuration validation failed:\n  - ${errors.join('\n  - ')}`);
  }
  
  const databasePath = process.env.DATABASE_PATH || './data/database.sqlite';
  
  // Validate file extension
  if (!databasePath.endsWith('.sqlite') && !databasePath.endsWith('.db')) {
    errors.push(`DATABASE_PATH should end with .sqlite or .db extension, got: ${databasePath}`);
  }
  
  // Validate path doesn't contain dangerous characters
  if (databasePath.includes('..') || databasePath.includes('~')) {
    errors.push('DATABASE_PATH cannot contain relative path traversal (..) or home directory (~) references');
  }
  
  const databaseDir = path.dirname(databasePath);
  
  // Create database directory if it doesn't exist
  if (!fs.existsSync(databaseDir)) {
    try {
      fs.mkdirSync(databaseDir, { recursive: true });
    } catch (error) {
      errors.push(`Failed to create SQLite database directory: ${databaseDir}. Error: ${error.message}`);
    }
  }
  
  // Check if directory is writable (only if directory exists)
  if (fs.existsSync(databaseDir)) {
    try {
      fs.accessSync(databaseDir, fs.constants.W_OK);
    } catch (error) {
      errors.push(`SQLite database directory is not writable: ${databaseDir}. Please check directory permissions.`);
    }
  }
  
  // Check if database file exists and is readable/writable
  if (fs.existsSync(databasePath)) {
    try {
      fs.accessSync(databasePath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (error) {
      errors.push(`SQLite database file is not readable/writable: ${databasePath}. Please check file permissions.`);
    }
  }
  
  if (errors.length > 0) {
    throw new Error(
      `SQLite configuration validation failed:\n  - ${errors.join('\n  - ')}\n\n` +
      'Please check your DATABASE_PATH setting and ensure the directory is writable.'
    );
  }
}

/**
 * Creates MySQL database configuration
 */
export function createMySqlConfig(): MySqlConfig {
  validateMySqlConfig();
  
  return {
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
  };
}

/**
 * Creates SQLite database configuration
 */
export function createSqliteConfig(): SqliteConfig {
  validateSqliteConfig();
  
  const databasePath = process.env.DATABASE_PATH || './data/database.sqlite';
  
  return {
    type: 'sqlite',
    database: databasePath,
    entities: [Sprint, TeamMember, TeamMemberSprintCapacity, Team],
    synchronize: true, // Always true for SQLite in development
    logging: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  };
}

/**
 * Validates database type and returns normalized type
 */
export function validateDatabaseType(type: string | undefined): 'mysql' | 'sqlite' | 'postgresql' {
  // Handle undefined or empty type
  if (!type || type.trim() === '') {
    return 'mysql'; // Default to mysql for backward compatibility
  }
  
  const normalizedType = type.toLowerCase().trim();
  
  if (normalizedType === 'mysql' || normalizedType === 'sqlite' || normalizedType === 'postgresql') {
    return normalizedType as 'mysql' | 'sqlite' | 'postgresql';
  }
  
  throw new Error(
    `Unsupported database type: "${type}". ` +
    'Supported types are: "mysql", "sqlite", "postgresql". ' +
    'Please set DATABASE_TYPE environment variable to one of the supported values.'
  );
}

/**
 * Validates database configuration based on database type
 */
export function validateDatabaseConfig(type: string): void {
  const validatedType = validateDatabaseType(type);
  
  try {
    if (validatedType === 'mysql') {
      validateMySqlConfig();
    } else if (validatedType === 'sqlite') {
      validateSqliteConfig();
    }
  } catch (error) {
    throw new Error(
      `Database configuration validation failed for ${validatedType}: ${error.message}`
    );
  }
}

/**
 * Factory function to create database configuration based on environment variables
 */
export function createDatabaseConfig(): TypeOrmModuleOptions {
  const logger = new DatabaseLoggerService();
  const errorHandler = new DatabaseErrorHandlerService();
  const rawDbType = process.env.DATABASE_TYPE;
  
  // Log environment debug information
  logger.logEnvironmentDebugInfo();
  
  try {
    // Validate and normalize database type
    const dbType = validateDatabaseType(rawDbType);
    logger.logInitializationStep(`Database type validated: ${dbType}`);
    
    // Validate configuration for the specific database type
    validateDatabaseConfig(dbType);
    logger.logInitializationStep(`Configuration validation completed for ${dbType}`);
    
    // Create configuration based on validated type
    let config: TypeOrmModuleOptions;
    if (dbType === 'sqlite') {
      config = createSqliteConfig();
    } else {
      config = createMySqlConfig();
    }
    
    // Log the selected configuration
    logger.logDatabaseSelection(dbType, config);
    
    return config;
  } catch (error) {
    // Handle configuration errors with detailed logging
    const dbType = rawDbType ? validateDatabaseType(rawDbType) : 'mysql';
    const dbError = errorHandler.handleDatabaseError(error, dbType);
    
    logger.logConfigurationError(dbType, dbError.userMessage);
    
    // Provide helpful context in error messages
    const contextInfo = [
      `DATABASE_TYPE: ${rawDbType || 'not set (defaults to mysql)'}`,
      `NODE_ENV: ${process.env.NODE_ENV || 'not set'}`
    ];
    
    if (rawDbType === 'sqlite' || (!rawDbType && process.env.DATABASE_PATH)) {
      contextInfo.push(`DATABASE_PATH: ${process.env.DATABASE_PATH || 'not set (defaults to ./data/database.sqlite)'}`);
    } else {
      contextInfo.push(`DATABASE_HOST: ${process.env.DATABASE_HOST || 'not set (defaults to localhost)'}`);
      contextInfo.push(`DATABASE_NAME: ${process.env.DATABASE_NAME || 'not set'}`);
    }
    
    const enhancedError = new Error(
      `Database configuration failed: ${dbError.userMessage}\n\n` +
      `Technical Details: ${dbError.technicalMessage}\n\n` +
      `Current environment:\n  - ${contextInfo.join('\n  - ')}\n\n` +
      `Troubleshooting Steps:\n${dbError.troubleshootingSteps.map((step, i) => `  ${i + 1}. ${step}`).join('\n')}\n\n` +
      'Please check your environment variables and refer to the documentation for proper configuration.'
    );
    
    // Preserve original error for debugging
    (enhancedError as any).originalError = error;
    (enhancedError as any).databaseError = dbError;
    
    throw enhancedError;
  }
}