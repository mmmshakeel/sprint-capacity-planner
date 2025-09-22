import { DatabaseLoggerService } from '../database-logger.service';
import { Logger } from '@nestjs/common';

// Mock the Logger
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe('DatabaseLoggerService', () => {
  let service: DatabaseLoggerService;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    service = new DatabaseLoggerService();
    mockLogger = (service as any).logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logDatabaseSelection', () => {
    it('should log MySQL configuration details', () => {
      const config = {
        host: 'localhost',
        port: 3306,
        database: 'testdb',
        username: 'testuser',
        ssl: false,
        retryAttempts: 3,
        synchronize: true
      };

      service.logDatabaseSelection('mysql', config);

      expect(mockLogger.log).toHaveBeenCalledWith('🗄️  Database Type Selected: MYSQL');
      expect(mockLogger.log).toHaveBeenCalledWith('📡 MySQL Configuration:');
      expect(mockLogger.log).toHaveBeenCalledWith('   Host: localhost:3306');
      expect(mockLogger.log).toHaveBeenCalledWith('   Database: testdb');
      expect(mockLogger.log).toHaveBeenCalledWith('   Username: testuser');
      expect(mockLogger.log).toHaveBeenCalledWith('   SSL: disabled');
      expect(mockLogger.log).toHaveBeenCalledWith('   Retry Attempts: 3');
      expect(mockLogger.log).toHaveBeenCalledWith('   Synchronize: true');
    });

    it('should log PostgreSQL configuration details', () => {
      const config = {
        host: 'db.example.supabase.co',
        port: 5432,
        database: 'postgres',
        username: 'postgres',
        ssl: true,
        retryAttempts: 3,
        synchronize: false
      };

      service.logDatabaseSelection('postgresql', config);

      expect(mockLogger.log).toHaveBeenCalledWith('🗄️  Database Type Selected: POSTGRESQL');
      expect(mockLogger.log).toHaveBeenCalledWith('🐘 PostgreSQL Configuration:');
      expect(mockLogger.log).toHaveBeenCalledWith('   Host: db.example.supabase.co:5432');
      expect(mockLogger.log).toHaveBeenCalledWith('   Database: postgres');
      expect(mockLogger.log).toHaveBeenCalledWith('   Username: postgres');
      expect(mockLogger.log).toHaveBeenCalledWith('   SSL: enabled');
      expect(mockLogger.log).toHaveBeenCalledWith('   Retry Attempts: 3');
      expect(mockLogger.log).toHaveBeenCalledWith('   Synchronize: false');
    });

    it('should log SQLite configuration details', () => {
      const config = {
        database: './data/test.sqlite',
        synchronize: true,
        logging: ['query', 'error', 'warn']
      };

      service.logDatabaseSelection('sqlite', config);

      expect(mockLogger.log).toHaveBeenCalledWith('🗄️  Database Type Selected: SQLITE');
      expect(mockLogger.log).toHaveBeenCalledWith('📁 SQLite Configuration:');
      expect(mockLogger.log).toHaveBeenCalledWith('   Database File: ./data/test.sqlite');
      expect(mockLogger.log).toHaveBeenCalledWith('   Synchronize: true');
      expect(mockLogger.log).toHaveBeenCalledWith('   Logging Level: query, error, warn');
    });

    it('should handle non-array logging configuration', () => {
      const config = {
        database: './data/test.sqlite',
        synchronize: true,
        logging: 'all'
      };

      service.logDatabaseSelection('sqlite', config);

      expect(mockLogger.log).toHaveBeenCalledWith('   Logging Level: all');
    });
  });

  describe('logConnectionSuccess', () => {
    it('should log successful MySQL connection', () => {
      service.logConnectionSuccess('mysql');

      expect(mockLogger.log).toHaveBeenCalledWith('✅ MYSQL database connection established successfully');
    });

    it('should log successful PostgreSQL connection', () => {
      service.logConnectionSuccess('postgresql');

      expect(mockLogger.log).toHaveBeenCalledWith('✅ POSTGRESQL database connection established successfully');
    });

    it('should log successful SQLite connection', () => {
      service.logConnectionSuccess('sqlite');

      expect(mockLogger.log).toHaveBeenCalledWith('✅ SQLITE database connection established successfully');
    });
  });

  describe('logConnectionAttempt', () => {
    it('should log connection attempt without attempt number', () => {
      service.logConnectionAttempt('mysql');

      expect(mockLogger.log).toHaveBeenCalledWith('🔄 Attempting to connect to MYSQL database...');
    });

    it('should log connection attempt with attempt number', () => {
      service.logConnectionAttempt('mysql', 2);

      expect(mockLogger.log).toHaveBeenCalledWith('🔄 Attempting to connect to MYSQL database (attempt 2)...');
    });

    it('should log PostgreSQL connection attempt', () => {
      service.logConnectionAttempt('postgresql');

      expect(mockLogger.log).toHaveBeenCalledWith('🔄 Attempting to connect to POSTGRESQL database...');
    });
  });

  describe('logConnectionError', () => {
    it('should log MySQL connection error', () => {
      const error = {
        code: 'ER_ACCESS_DENIED_ERROR',
        message: 'Access denied for user'
      };

      service.logConnectionError('mysql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('❌ MYSQL database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith('MySQL Error Code: ER_ACCESS_DENIED_ERROR');
      expect(mockLogger.error).toHaveBeenCalledWith('MySQL Error Message: Access denied for user');
      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Check DATABASE_USER and DATABASE_PASSWORD environment variables');
    });

    it('should log SQLite connection error', () => {
      const error = {
        code: 'SQLITE_CANTOPEN',
        message: 'unable to open database file'
      };

      service.logConnectionError('sqlite', error);

      expect(mockLogger.error).toHaveBeenCalledWith('❌ SQLITE database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith('SQLite Error Code: SQLITE_CANTOPEN');
      expect(mockLogger.error).toHaveBeenCalledWith('SQLite Error Message: unable to open database file');
      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Check DATABASE_PATH and directory permissions - cannot open database file');
    });

    it('should log PostgreSQL connection error', () => {
      const error = {
        code: '28P01',
        message: 'password authentication failed for user "postgres"'
      };

      service.logConnectionError('postgresql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('❌ POSTGRESQL database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith('PostgreSQL Error Code: 28P01');
      expect(mockLogger.error).toHaveBeenCalledWith('PostgreSQL Error Message: password authentication failed for user "postgres"');
      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Check DATABASE_USER and DATABASE_PASSWORD environment variables');
    });

    it('should log connection error with attempt number', () => {
      const error = { code: 'ECONNREFUSED', message: 'Connection refused' };

      service.logConnectionError('mysql', error, 2);

      expect(mockLogger.error).toHaveBeenCalledWith('❌ MYSQL database connection failed (attempt 2)');
    });
  });

  describe('logConfigurationError', () => {
    it('should log configuration error', () => {
      service.logConfigurationError('mysql', 'Invalid configuration');

      expect(mockLogger.error).toHaveBeenCalledWith('⚙️  MYSQL Configuration Error: Invalid configuration');
    });

    it('should log PostgreSQL configuration error', () => {
      service.logConfigurationError('postgresql', 'Missing required environment variables');

      expect(mockLogger.error).toHaveBeenCalledWith('⚙️  POSTGRESQL Configuration Error: Missing required environment variables');
    });
  });

  describe('logConfigurationWarning', () => {
    it('should log configuration warning', () => {
      service.logConfigurationWarning('sqlite', 'Using default path');

      expect(mockLogger.warn).toHaveBeenCalledWith('⚠️  SQLITE Configuration Warning: Using default path');
    });

    it('should log PostgreSQL configuration warning', () => {
      service.logConfigurationWarning('postgresql', 'SSL disabled in production');

      expect(mockLogger.warn).toHaveBeenCalledWith('⚠️  POSTGRESQL Configuration Warning: SSL disabled in production');
    });
  });

  describe('logInitializationStep', () => {
    it('should log initialization step', () => {
      service.logInitializationStep('Creating database connection');

      expect(mockLogger.log).toHaveBeenCalledWith('🔧 Database Initialization: Creating database connection');
    });
  });

  describe('logSeedingInfo', () => {
    it('should log seeding information', () => {
      service.logSeedingInfo('Seeding completed successfully');

      expect(mockLogger.log).toHaveBeenCalledWith('🌱 Database Seeding: Seeding completed successfully');
    });
  });

  describe('logEnvironmentDebugInfo', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should log MySQL environment variables', () => {
      process.env.DATABASE_TYPE = 'mysql';
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_PORT = '3306';
      process.env.DATABASE_NAME = 'testdb';
      process.env.DATABASE_USER = 'testuser';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.NODE_ENV = 'development';

      service.logEnvironmentDebugInfo();

      expect(mockLogger.debug).toHaveBeenCalledWith('🔍 Database Environment Variables:');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_TYPE: mysql');
      expect(mockLogger.debug).toHaveBeenCalledWith('   NODE_ENV: development');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_HOST: localhost');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_PORT: 3306');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_NAME: testdb');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_USER: ***set***');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_PASSWORD: ***set***');
    });

    it('should log PostgreSQL environment variables', () => {
      process.env.DATABASE_TYPE = 'postgresql';
      process.env.DATABASE_HOST = 'db.example.supabase.co';
      process.env.DATABASE_PORT = '5432';
      process.env.DATABASE_NAME = 'postgres';
      process.env.DATABASE_USER = 'postgres';
      process.env.DATABASE_PASSWORD = 'secretpassword';
      process.env.NODE_ENV = 'production';

      service.logEnvironmentDebugInfo();

      expect(mockLogger.debug).toHaveBeenCalledWith('🔍 Database Environment Variables:');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_TYPE: postgresql');
      expect(mockLogger.debug).toHaveBeenCalledWith('   NODE_ENV: production');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_HOST: db.example.supabase.co');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_PORT: 5432');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_NAME: postgres');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_USER: ***set***');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_PASSWORD: ***set***');
    });

    it('should log SQLite environment variables', () => {
      process.env.DATABASE_TYPE = 'sqlite';
      process.env.DATABASE_PATH = './data/test.sqlite';
      process.env.NODE_ENV = 'development';

      service.logEnvironmentDebugInfo();

      expect(mockLogger.debug).toHaveBeenCalledWith('🔍 Database Environment Variables:');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_TYPE: sqlite');
      expect(mockLogger.debug).toHaveBeenCalledWith('   NODE_ENV: development');
      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_PATH: ./data/test.sqlite');
    });

    it('should handle missing environment variables', () => {
      delete process.env.DATABASE_TYPE;
      delete process.env.NODE_ENV;

      service.logEnvironmentDebugInfo();

      expect(mockLogger.debug).toHaveBeenCalledWith('   DATABASE_TYPE: not set (defaults to mysql)');
      expect(mockLogger.debug).toHaveBeenCalledWith('   NODE_ENV: not set');
    });
  });

  describe('logPerformanceMetric', () => {
    it('should log performance metrics', () => {
      service.logPerformanceMetric('Database connection', 1500);

      expect(mockLogger.log).toHaveBeenCalledWith('⏱️  Database Performance: Database connection completed in 1500ms');
    });
  });

  describe('logMigrationInfo', () => {
    it('should log migration information', () => {
      service.logMigrationInfo('Running migration 001');

      expect(mockLogger.log).toHaveBeenCalledWith('🔄 Database Migration: Running migration 001');
    });
  });

  describe('MySQL Error Specific Logging', () => {
    it('should provide specific guidance for ER_BAD_DB_ERROR', () => {
      const error = { code: 'ER_BAD_DB_ERROR', message: 'Unknown database' };

      service.logConnectionError('mysql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Check DATABASE_NAME environment variable - database may not exist');
    });

    it('should provide specific guidance for ENOTFOUND', () => {
      const error = { code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND' };

      service.logConnectionError('mysql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Check DATABASE_HOST - hostname cannot be resolved');
    });

    it('should provide generic guidance for unknown MySQL errors', () => {
      const error = { code: 'ER_UNKNOWN', message: 'Unknown error' };

      service.logConnectionError('mysql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Verify all MySQL environment variables and server status');
    });
  });

  describe('PostgreSQL Error Specific Logging', () => {
    it('should provide specific guidance for 28P01 (authentication failed)', () => {
      const error = { code: '28P01', message: 'password authentication failed' };

      service.logConnectionError('postgresql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Check DATABASE_USER and DATABASE_PASSWORD environment variables');
    });

    it('should provide specific guidance for 3D000 (database does not exist)', () => {
      const error = { code: '3D000', message: 'database "nonexistent" does not exist' };

      service.logConnectionError('postgresql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Check DATABASE_NAME environment variable - database may not exist');
    });

    it('should provide specific guidance for ECONNREFUSED', () => {
      const error = { code: 'ECONNREFUSED', message: 'connect ECONNREFUSED 127.0.0.1:5432' };

      service.logConnectionError('postgresql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Check DATABASE_HOST and DATABASE_PORT - PostgreSQL server may not be running');
    });

    it('should provide specific guidance for ENOTFOUND', () => {
      const error = { code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND invalid.host' };

      service.logConnectionError('postgresql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Check DATABASE_HOST - hostname cannot be resolved');
    });

    it('should provide specific guidance for ETIMEDOUT', () => {
      const error = { code: 'ETIMEDOUT', message: 'connect ETIMEDOUT' };

      service.logConnectionError('postgresql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Connection timeout - check network connectivity and firewall settings');
    });

    it('should provide generic guidance for unknown PostgreSQL errors', () => {
      const error = { code: 'PG_UNKNOWN', message: 'Unknown PostgreSQL error' };

      service.logConnectionError('postgresql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Verify all PostgreSQL environment variables and server status');
    });

    it('should handle PostgreSQL errors without error code', () => {
      const error = { message: 'Connection error without code' };

      service.logConnectionError('postgresql', error);

      expect(mockLogger.error).toHaveBeenCalledWith('PostgreSQL Error Code: undefined');
      expect(mockLogger.error).toHaveBeenCalledWith('PostgreSQL Error Message: Connection error without code');
      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Verify all PostgreSQL environment variables and server status');
    });
  });

  describe('SQLite Error Specific Logging', () => {
    it('should provide specific guidance for SQLITE_READONLY', () => {
      const error = { code: 'SQLITE_READONLY', message: 'attempt to write a readonly database' };

      service.logConnectionError('sqlite', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Database file is read-only - check file permissions');
    });

    it('should provide specific guidance for EACCES', () => {
      const error = { code: 'EACCES', message: 'permission denied' };

      service.logConnectionError('sqlite', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Permission denied - check directory and file permissions');
    });

    it('should provide generic guidance for unknown SQLite errors', () => {
      const error = { code: 'SQLITE_UNKNOWN', message: 'Unknown error' };

      service.logConnectionError('sqlite', error);

      expect(mockLogger.error).toHaveBeenCalledWith('💡 Troubleshooting: Verify DATABASE_PATH and file system permissions');
    });
  });
});