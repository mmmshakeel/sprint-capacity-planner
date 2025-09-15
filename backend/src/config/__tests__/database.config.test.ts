import {
  createDatabaseConfig,
  createMySqlConfig,
  createSqliteConfig,
  validateDatabaseConfig,
  validateDatabaseType,
  MySqlConfig,
  SqliteConfig,
} from '../database.config';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('Database Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    
    // Default fs mocks
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.accessSync.mockReturnValue(undefined);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('createMySqlConfig', () => {
    beforeEach(() => {
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_USER = 'testuser';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'testdb';
      process.env.DATABASE_PORT = '3306';
    });

    it('should create MySQL configuration with environment variables', () => {
      const config = createMySqlConfig() as MySqlConfig;

      expect(config.type).toBe('mysql');
      expect(config.host).toBe('localhost');
      expect(config.username).toBe('testuser');
      expect(config.password).toBe('testpass');
      expect(config.database).toBe('testdb');
      expect(config.port).toBe(3306);
      expect(config.entities).toHaveLength(4);
      expect(config.synchronize).toBe(true); // NODE_ENV not production
    });

    it('should use default values when optional environment variables are not set', () => {
      delete process.env.DATABASE_HOST;
      delete process.env.DATABASE_PORT;
      
      const config = createMySqlConfig() as MySqlConfig;

      expect(config.host).toBe('localhost');
      expect(config.port).toBe(3306);
    });

    it('should set SSL for production environment', () => {
      process.env.NODE_ENV = 'production';
      
      const config = createMySqlConfig() as MySqlConfig;

      expect(config.ssl).toEqual({ rejectUnauthorized: false });
      expect(config.synchronize).toBe(false);
    });

    it('should throw error when required MySQL variables are missing', () => {
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;

      expect(() => createMySqlConfig()).toThrow(
        'MySQL configuration validation failed'
      );
    });

    it('should throw error with invalid port number', () => {
      process.env.DATABASE_PORT = 'invalid';

      expect(() => createMySqlConfig()).toThrow(
        'DATABASE_PORT must be a valid port number'
      );
    });

    it('should throw error with invalid database name format', () => {
      process.env.DATABASE_NAME = 'test-db!';

      expect(() => createMySqlConfig()).toThrow(
        'DATABASE_NAME can only contain letters, numbers, and underscores'
      );
    });
  });

  describe('createSqliteConfig', () => {
    it('should create SQLite configuration with default path', () => {
      const config = createSqliteConfig() as SqliteConfig;

      expect(config.type).toBe('sqlite');
      expect(config.database).toBe('./data/database.sqlite');
      expect(config.entities).toHaveLength(4);
      expect(config.synchronize).toBe(true);
    });

    it('should use custom DATABASE_PATH when provided', () => {
      process.env.DATABASE_PATH = '/custom/path/test.db';
      
      const config = createSqliteConfig() as SqliteConfig;

      expect(config.database).toBe('/custom/path/test.db');
    });

    it('should create database directory if it does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);
      process.env.DATABASE_PATH = './test/data/test.db';

      createSqliteConfig();

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith('./test/data', { recursive: true });
    });

    it('should throw error if directory creation fails', () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => createSqliteConfig()).toThrow(
        'Failed to create SQLite database directory'
      );
    });

    it('should throw error if directory is not writable', () => {
      mockedFs.accessSync.mockImplementation(() => {
        throw new Error('Not writable');
      });

      expect(() => createSqliteConfig()).toThrow(
        'SQLite database directory is not writable'
      );
    });

    it('should set different logging for development environment', () => {
      process.env.NODE_ENV = 'development';
      
      const config = createSqliteConfig() as SqliteConfig;

      expect(config.logging).toEqual(['query', 'error', 'warn']);
    });

    it('should throw error with invalid database path', () => {
      process.env.DATABASE_PATH = '../../../etc/passwd';

      expect(() => createSqliteConfig()).toThrow(
        'DATABASE_PATH cannot contain relative path traversal'
      );
    });

    it('should throw error with empty database path', () => {
      process.env.DATABASE_PATH = '';

      expect(() => createSqliteConfig()).toThrow(
        'DATABASE_PATH cannot be empty'
      );
    });
  });

  describe('validateDatabaseType', () => {
    it('should return mysql for valid mysql type', () => {
      expect(validateDatabaseType('mysql')).toBe('mysql');
      expect(validateDatabaseType('MYSQL')).toBe('mysql');
      expect(validateDatabaseType(' mysql ')).toBe('mysql');
    });

    it('should return sqlite for valid sqlite type', () => {
      expect(validateDatabaseType('sqlite')).toBe('sqlite');
      expect(validateDatabaseType('SQLITE')).toBe('sqlite');
      expect(validateDatabaseType(' sqlite ')).toBe('sqlite');
    });

    it('should default to mysql for undefined type', () => {
      expect(validateDatabaseType(undefined)).toBe('mysql');
      expect(validateDatabaseType('')).toBe('mysql');
      expect(validateDatabaseType('  ')).toBe('mysql');
    });

    it('should return postgresql for valid postgresql type', () => {
      expect(validateDatabaseType('postgresql')).toBe('postgresql');
    });

    it('should throw error for unsupported database type', () => {
      expect(() => validateDatabaseType('oracle')).toThrow(
        'Unsupported database type: "oracle"'
      );
    });
  });

  describe('validateDatabaseConfig', () => {
    it('should validate mysql type', () => {
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_USER = 'testuser';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'testdb';

      expect(() => validateDatabaseConfig('mysql')).not.toThrow();
    });

    it('should validate sqlite type', () => {
      expect(() => validateDatabaseConfig('sqlite')).not.toThrow();
    });

    it('should validate postgresql type', () => {
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_USER = 'testuser';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'testdb';

      expect(() => validateDatabaseConfig('postgresql')).not.toThrow();
    });

    it('should throw error for unsupported database type', () => {
      expect(() => validateDatabaseConfig('oracle')).toThrow(
        'Unsupported database type: "oracle"'
      );
    });

    it('should provide context in error messages', () => {
      expect(() => validateDatabaseConfig('mysql')).toThrow(
        'Database configuration validation failed for mysql'
      );
    });
  });

  describe('createDatabaseConfig', () => {
    it('should create MySQL configuration by default', () => {
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_USER = 'testuser';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'testdb';

      const config = createDatabaseConfig();

      expect(config.type).toBe('mysql');
    });

    it('should create SQLite configuration when DATABASE_TYPE is sqlite', () => {
      process.env.DATABASE_TYPE = 'sqlite';

      const config = createDatabaseConfig();

      expect(config.type).toBe('sqlite');
    });

    it('should throw descriptive error when configuration fails', () => {
      process.env.DATABASE_TYPE = 'mysql';
      // Missing required MySQL variables

      expect(() => createDatabaseConfig()).toThrow(
        'Database configuration failed:'
      );
    });

    it('should include environment context in error messages', () => {
      process.env.DATABASE_TYPE = 'mysql';
      process.env.NODE_ENV = 'development';

      try {
        createDatabaseConfig();
      } catch (error) {
        expect(error.message).toContain('Current environment:');
        expect(error.message).toContain('DATABASE_TYPE: mysql');
        expect(error.message).toContain('NODE_ENV: development');
      }
    });

    it('should handle case-insensitive database types', () => {
      process.env.DATABASE_TYPE = 'SQLITE';

      const config = createDatabaseConfig();

      expect(config.type).toBe('sqlite');
    });
  });
});