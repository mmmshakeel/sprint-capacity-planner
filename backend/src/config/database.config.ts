import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Sprint } from '../entities/sprint.entity';
import { TeamMember } from '../entities/team-member.entity';
import { TeamMemberSprintCapacity } from '../entities/team-member-sprint-capacity.entity';
import { Team } from '../entities/team.entity';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Base database configuration interface
 */
export interface DatabaseConfig {
  type: 'mysql' | 'sqlite';
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
 * Validates MySQL configuration environment variables
 */
function validateMySqlConfig(): void {
  // Only validate truly required variables that don't have defaults
  const requiredVars = ['DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required MySQL environment variables: ${missingVars.join(', ')}. ` +
      'Please ensure all MySQL configuration variables are set.'
    );
  }
}

/**
 * Validates SQLite configuration and creates database directory if needed
 */
function validateSqliteConfig(): void {
  const databasePath = process.env.DATABASE_PATH || './data/database.sqlite';
  const databaseDir = path.dirname(databasePath);
  
  // Create database directory if it doesn't exist
  if (!fs.existsSync(databaseDir)) {
    try {
      fs.mkdirSync(databaseDir, { recursive: true });
    } catch (error) {
      throw new Error(
        `Failed to create SQLite database directory: ${databaseDir}. ` +
        `Error: ${error.message}`
      );
    }
  }
  
  // Check if directory is writable
  try {
    fs.accessSync(databaseDir, fs.constants.W_OK);
  } catch (error) {
    throw new Error(
      `SQLite database directory is not writable: ${databaseDir}. ` +
      'Please check directory permissions.'
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
 * Validates database configuration based on database type
 */
export function validateDatabaseConfig(type: string): void {
  if (type === 'mysql') {
    validateMySqlConfig();
  } else if (type === 'sqlite') {
    validateSqliteConfig();
  } else {
    throw new Error(
      `Unsupported database type: ${type}. ` +
      'Supported types are: mysql, sqlite'
    );
  }
}

/**
 * Factory function to create database configuration based on environment variables
 */
export function createDatabaseConfig(): TypeOrmModuleOptions {
  const dbType = process.env.DATABASE_TYPE || 'mysql';
  
  try {
    validateDatabaseConfig(dbType);
    
    if (dbType === 'sqlite') {
      return createSqliteConfig();
    }
    
    return createMySqlConfig();
  } catch (error) {
    throw new Error(
      `Database configuration failed: ${error.message}. ` +
      `Database type: ${dbType}`
    );
  }
}