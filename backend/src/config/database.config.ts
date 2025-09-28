import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Sprint } from '../entities/sprint.entity';
import { TeamMember } from '../entities/team-member.entity';
import { TeamMemberSprintCapacity } from '../entities/team-member-sprint-capacity.entity';
import { Team } from '../entities/team.entity';
import { DatabaseLoggerService } from './database-logger.service';
import { DatabaseErrorHandlerService } from './database-error-handler.service';
import { booleanTransformer } from '../utils/boolean.transformer';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Database-specific boolean column type mappings
 */
export const BOOLEAN_COLUMN_TYPES = {
  mysql: 'tinyint',
  sqlite: 'integer', 
  postgres: 'boolean'
} as const;

/**
 * Boolean field validation configuration for each database type
 */
export interface BooleanFieldConfig {
  columnType: string;
  supportsNativeBoolean: boolean;
  requiresTransformer: boolean;
  validationRules: {
    acceptsStringBoolean: boolean;
    acceptsNumericBoolean: boolean;
    acceptsNativeBoolean: boolean;
  };
}

/**
 * Database-specific boolean field configurations
 */
export const BOOLEAN_FIELD_CONFIGS: Record<'mysql' | 'sqlite' | 'postgres', BooleanFieldConfig> = {
  mysql: {
    columnType: 'tinyint',
    supportsNativeBoolean: false,
    requiresTransformer: true,
    validationRules: {
      acceptsStringBoolean: false,
      acceptsNumericBoolean: true,
      acceptsNativeBoolean: false
    }
  },
  sqlite: {
    columnType: 'integer',
    supportsNativeBoolean: false,
    requiresTransformer: true,
    validationRules: {
      acceptsStringBoolean: true, // SQLite is flexible
      acceptsNumericBoolean: true,
      acceptsNativeBoolean: true
    }
  },
  postgres: {
    columnType: 'boolean',
    supportsNativeBoolean: true,
    requiresTransformer: false, // PostgreSQL handles boolean natively when using proper column type
    validationRules: {
      acceptsStringBoolean: false,
      acceptsNumericBoolean: false,
      acceptsNativeBoolean: true
    }
  }
};

/**
 * Base database configuration interface
 */
export interface DatabaseConfig {
  type: 'mysql' | 'sqlite' | 'postgres';
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
  type: 'postgres';
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
 * Validates boolean field configuration for a specific database type
 */
export function validateBooleanFieldConfig(dbType: 'mysql' | 'sqlite' | 'postgres'): void {
  const config = BOOLEAN_FIELD_CONFIGS[dbType];
  const errors: string[] = [];

  // Validate that boolean transformer is available when required
  if (config.requiresTransformer) {
    try {
      const transformer = booleanTransformer;
      if (!transformer || typeof transformer.to !== 'function' || typeof transformer.from !== 'function') {
        errors.push(`Boolean transformer is required for ${dbType} but is not properly configured`);
      }
    } catch (error) {
      errors.push(`Failed to load boolean transformer for ${dbType}: ${error.message}`);
    }
  }

  // Validate column type mapping
  if (!config.columnType || config.columnType.trim() === '') {
    errors.push(`Boolean column type is not defined for ${dbType}`);
  }

  // Validate that the column type matches expected database-specific types
  const expectedType = BOOLEAN_COLUMN_TYPES[dbType];
  if (config.columnType !== expectedType) {
    errors.push(`Boolean column type mismatch for ${dbType}: expected '${expectedType}', got '${config.columnType}'`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Boolean field configuration validation failed for ${dbType}:\n  - ${errors.join('\n  - ')}\n\n` +
      'This indicates a configuration issue that could cause boolean field operations to fail. ' +
      'Please check the boolean field configuration and transformer setup.'
    );
  }
}

/**
 * Validates that entities with boolean fields are properly configured
 */
export function validateEntityBooleanFields(dbType: 'mysql' | 'sqlite' | 'postgres'): void {
  const config = BOOLEAN_FIELD_CONFIGS[dbType];
  const errors: string[] = [];

  // Check Team entity boolean field configuration
  try {
    const teamEntity = Team;
    if (!teamEntity) {
      errors.push('Team entity is not available for boolean field validation');
    }
  } catch (error) {
    errors.push(`Failed to validate Team entity boolean fields: ${error.message}`);
  }

  // Check TeamMember entity boolean field configuration  
  try {
    const teamMemberEntity = TeamMember;
    if (!teamMemberEntity) {
      errors.push('TeamMember entity is not available for boolean field validation');
    }
  } catch (error) {
    errors.push(`Failed to validate TeamMember entity boolean fields: ${error.message}`);
  }

  // For databases that require transformers, validate transformer is properly applied
  if (config.requiresTransformer) {
    // Note: In a real implementation, we would use reflection to check entity metadata
    // For now, we'll validate that the transformer is available
    try {
      const transformer = booleanTransformer;
      if (!transformer) {
        errors.push(`Boolean transformer is required for ${dbType} entities but is not available`);
      }
    } catch (error) {
      errors.push(`Boolean transformer validation failed for ${dbType}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Entity boolean field validation failed for ${dbType}:\n  - ${errors.join('\n  - ')}\n\n` +
      'This indicates that entities with boolean fields may not work correctly with the selected database. ' +
      'Please ensure all entities with boolean fields are properly configured with appropriate transformers.'
    );
  }
}

/**
 * Comprehensive boolean configuration validation for a database type
 */
export function validateBooleanConfiguration(dbType: 'mysql' | 'sqlite' | 'postgres'): void {
  try {
    // Validate boolean field configuration
    validateBooleanFieldConfig(dbType);
    
    // Validate entity boolean fields
    validateEntityBooleanFields(dbType);
    
    // Log successful validation
    const logger = new DatabaseLoggerService();
    logger.logInitializationStep(`Boolean configuration validation completed for ${dbType}`);
  } catch (error) {
    throw new Error(
      `Boolean configuration validation failed for ${dbType}: ${error.message}\n\n` +
      'This error indicates that boolean fields may not work correctly with the selected database type. ' +
      'Please check your entity definitions and transformer configurations.'
    );
  }
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
 * Creates MySQL database configuration with boolean type mapping
 */
export function createMySqlConfig(): MySqlConfig {
  validateMySqlConfig();
  validateBooleanConfiguration('mysql');
  
  const config: MySqlConfig = {
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

  // Add MySQL-specific boolean column type mapping
  (config as any).columnTypes = {
    boolean: BOOLEAN_COLUMN_TYPES.mysql
  };

  return config;
}

/**
 * Creates SQLite database configuration with boolean type mapping
 */
export function createSqliteConfig(): SqliteConfig {
  validateSqliteConfig();
  validateBooleanConfiguration('sqlite');
  
  const databasePath = process.env.DATABASE_PATH || './data/database.sqlite';
  
  const config: SqliteConfig = {
    type: 'sqlite',
    database: databasePath,
    entities: [Sprint, TeamMember, TeamMemberSprintCapacity, Team],
    synchronize: true, // Always true for SQLite in development
    logging: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  };

  // Add SQLite-specific boolean column type mapping
  (config as any).columnTypes = {
    boolean: BOOLEAN_COLUMN_TYPES.sqlite
  };

  return config;
}

/**
 * Validates PostgreSQL configuration environment variables
 */
function validatePostgreSqlConfig(): void {
  const errors: string[] = [];
  
  // Check required variables
  const requiredVars = ['DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    errors.push(`Missing required PostgreSQL environment variables: ${missingVars.join(', ')}`);
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
      `PostgreSQL configuration validation failed:\n  - ${errors.join('\n  - ')}\n\n` +
      'Please check your environment variables and ensure all required PostgreSQL settings are properly configured.'
    );
  }
}

/**
 * Creates PostgreSQL database configuration with boolean type mapping
 */
export function createPostgreSqlConfig(): PostgreSqlConfig {
  validatePostgreSqlConfig();
  validateBooleanConfiguration('postgres');
  
  const config: PostgreSqlConfig = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432, // PostgreSQL default port
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'postgres',
    entities: [Sprint, TeamMember, TeamMemberSprintCapacity, Team],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: ['error', 'warn'],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  // PostgreSQL uses native boolean type, no custom column type mapping needed
  // The native boolean type works correctly with defaults

  return config;
}

/**
 * Validates database type and returns normalized type
 */
export function validateDatabaseType(type: string | undefined): 'mysql' | 'sqlite' | 'postgres' {
  // Handle undefined or empty type
  if (!type || type.trim() === '') {
    return 'mysql'; // Default to mysql for backward compatibility
  }
  
  const normalizedType = type.toLowerCase().trim();
  
  if (normalizedType === 'mysql' || normalizedType === 'sqlite') {
    return normalizedType as 'mysql' | 'sqlite';
  }
  
  if (normalizedType === 'postgresql' || normalizedType === 'postgres') {
    return 'postgres'; // Normalize both postgresql and postgres to postgres for TypeORM
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
    // Validate basic database configuration
    if (validatedType === 'mysql') {
      validateMySqlConfig();
    } else if (validatedType === 'sqlite') {
      validateSqliteConfig();
    } else if (validatedType === 'postgres') {
      validatePostgreSqlConfig();
    }
    
    // Validate boolean configuration for the database type
    validateBooleanConfiguration(validatedType);
  } catch (error) {
    throw new Error(
      `Database configuration validation failed for ${validatedType}: ${error.message}`
    );
  }
}

/**
 * Gets boolean field configuration for a specific database type
 */
export function getBooleanFieldConfig(dbType: 'mysql' | 'sqlite' | 'postgres'): BooleanFieldConfig {
  const config = BOOLEAN_FIELD_CONFIGS[dbType];
  if (!config) {
    throw new Error(`Boolean field configuration not found for database type: ${dbType}`);
  }
  return config;
}

/**
 * Gets the appropriate column type for boolean fields based on database type
 */
export function getBooleanColumnType(dbType: 'mysql' | 'sqlite' | 'postgres'): string {
  return BOOLEAN_COLUMN_TYPES[dbType];
}

/**
 * Checks if a database type requires boolean transformers
 */
export function requiresBooleanTransformer(dbType: 'mysql' | 'sqlite' | 'postgres'): boolean {
  return BOOLEAN_FIELD_CONFIGS[dbType].requiresTransformer;
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
    } else if (dbType === 'postgres') {
      config = createPostgreSqlConfig();
    } else {
      config = createMySqlConfig();
    }
    
    // Log the selected configuration (map postgres back to postgresql for logging)
    const loggerDbType = dbType === 'postgres' ? 'postgresql' : dbType;
    logger.logDatabaseSelection(loggerDbType as 'mysql' | 'sqlite' | 'postgresql', config);
    
    return config;
  } catch (error) {
    // Handle configuration errors with detailed logging
    const dbType = rawDbType ? validateDatabaseType(rawDbType) : 'mysql';
    const errorHandlerDbType = dbType === 'postgres' ? 'postgresql' : dbType;
    const dbError = errorHandler.handleDatabaseError(error, errorHandlerDbType as 'mysql' | 'sqlite' | 'postgresql');
    
    const loggerDbType = dbType === 'postgres' ? 'postgresql' : dbType;
    logger.logConfigurationError(loggerDbType as 'mysql' | 'sqlite' | 'postgresql', dbError.userMessage);
    
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