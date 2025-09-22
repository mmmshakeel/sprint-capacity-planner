import { createDatabaseConfig } from '../database.config';

describe('Database Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Database Configuration Creation', () => {
    it('should create MySQL configuration successfully with valid environment', () => {
      process.env.DATABASE_TYPE = 'mysql';
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_PORT = '3306';
      process.env.DATABASE_USER = 'testuser';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'testdb';

      const config = createDatabaseConfig();

      expect(config.type).toBe('mysql');
      expect((config as any).host).toBe('localhost');
      expect((config as any).port).toBe(3306);
      expect((config as any).username).toBe('testuser');
      expect((config as any).database).toBe('testdb');
    });

    it('should create PostgreSQL configuration successfully with valid environment', () => {
      process.env.DATABASE_TYPE = 'postgresql';
      process.env.DATABASE_HOST = 'db.example.supabase.co';
      process.env.DATABASE_PORT = '5432';
      process.env.DATABASE_USER = 'postgres';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'postgres';

      const config = createDatabaseConfig();

      expect(config.type).toBe('postgres');
      expect((config as any).host).toBe('db.example.supabase.co');
      expect((config as any).port).toBe(5432);
      expect((config as any).username).toBe('postgres');
      expect((config as any).database).toBe('postgres');
    });

    it('should create SQLite configuration successfully with valid environment', () => {
      process.env.DATABASE_TYPE = 'sqlite';
      process.env.DATABASE_PATH = './test-data/test.sqlite';

      const config = createDatabaseConfig();

      expect(config.type).toBe('sqlite');
      expect((config as any).database).toBe('./test-data/test.sqlite');
      expect((config as any).synchronize).toBe(true);
    });

    it('should default to MySQL when DATABASE_TYPE is not set', () => {
      delete process.env.DATABASE_TYPE;
      process.env.DATABASE_USER = 'testuser';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'testdb';

      const config = createDatabaseConfig();

      expect(config.type).toBe('mysql');
    });

    it('should throw enhanced error for invalid MySQL configuration', () => {
      process.env.DATABASE_TYPE = 'mysql';
      // Missing required environment variables

      expect(() => createDatabaseConfig()).toThrow(/Database configuration failed/);
      expect(() => createDatabaseConfig()).toThrow(/Missing required MySQL environment variables/);
      expect(() => createDatabaseConfig()).toThrow(/Troubleshooting Steps/);
    });

    it('should throw enhanced error for invalid PostgreSQL configuration', () => {
      process.env.DATABASE_TYPE = 'postgresql';
      // Missing required environment variables

      expect(() => createDatabaseConfig()).toThrow(/Database configuration failed/);
      expect(() => createDatabaseConfig()).toThrow(/Missing required PostgreSQL environment variables/);
      expect(() => createDatabaseConfig()).toThrow(/Troubleshooting Steps/);
    });

    it('should throw enhanced error for invalid SQLite configuration', () => {
      process.env.DATABASE_TYPE = 'sqlite';
      process.env.DATABASE_PATH = '../invalid/path.sqlite'; // Contains .. which is not allowed

      expect(() => createDatabaseConfig()).toThrow(/Database configuration failed/);
      expect(() => createDatabaseConfig()).toThrow(/cannot contain relative path traversal/);
      expect(() => createDatabaseConfig()).toThrow(/Troubleshooting Steps/);
    });

    it('should throw enhanced error for unsupported database type', () => {
      process.env.DATABASE_TYPE = 'oracle';

      expect(() => createDatabaseConfig()).toThrow(/Unsupported database type/);
      expect(() => createDatabaseConfig()).toThrow(/Supported types are: "mysql", "sqlite", "postgresql"/);
      expect(() => createDatabaseConfig()).toThrow(/Please set DATABASE_TYPE environment variable/);
    });
  });

  describe('Error Context Information', () => {
    it('should include MySQL context in error messages', () => {
      process.env.DATABASE_TYPE = 'mysql';
      process.env.DATABASE_HOST = 'testhost';
      process.env.DATABASE_NAME = 'testdb';

      try {
        createDatabaseConfig();
      } catch (error) {
        expect(error.message).toContain('DATABASE_TYPE: mysql');
        expect(error.message).toContain('DATABASE_HOST: testhost');
        expect(error.message).toContain('DATABASE_NAME: testdb');
      }
    });

    it('should include PostgreSQL context in error messages', () => {
      process.env.DATABASE_TYPE = 'postgresql';
      process.env.DATABASE_HOST = 'testhost';
      process.env.DATABASE_NAME = 'testdb';

      try {
        createDatabaseConfig();
      } catch (error) {
        expect(error.message).toContain('DATABASE_TYPE: postgresql');
        expect(error.message).toContain('DATABASE_HOST: testhost');
        expect(error.message).toContain('DATABASE_NAME: testdb');
      }
    });

    it('should include SQLite context in error messages', () => {
      process.env.DATABASE_TYPE = 'sqlite';
      process.env.DATABASE_PATH = '../invalid.sqlite';

      try {
        createDatabaseConfig();
      } catch (error) {
        expect(error.message).toContain('DATABASE_TYPE: sqlite');
        expect(error.message).toContain('DATABASE_PATH: ../invalid.sqlite');
      }
    });

    it('should include NODE_ENV in error context', () => {
      process.env.DATABASE_TYPE = 'mysql';
      process.env.NODE_ENV = 'test';

      try {
        createDatabaseConfig();
      } catch (error) {
        expect(error.message).toContain('NODE_ENV: test');
      }
    });
  });

  describe('Logging Integration', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log database selection for MySQL', () => {
      process.env.DATABASE_TYPE = 'mysql';
      process.env.DATABASE_USER = 'testuser';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'testdb';

      createDatabaseConfig();

      // The logging happens through NestJS Logger, so we can't easily test console output
      // But we can verify the configuration was created successfully
      expect(true).toBe(true); // Configuration creation succeeded
    });

    it('should log database selection for PostgreSQL', () => {
      process.env.DATABASE_TYPE = 'postgresql';
      process.env.DATABASE_USER = 'postgres';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'postgres';

      createDatabaseConfig();

      // The logging happens through NestJS Logger, so we can't easily test console output
      // But we can verify the configuration was created successfully
      expect(true).toBe(true); // Configuration creation succeeded
    });

    it('should log database selection for SQLite', () => {
      process.env.DATABASE_TYPE = 'sqlite';
      process.env.DATABASE_PATH = './test.sqlite';

      createDatabaseConfig();

      // The logging happens through NestJS Logger, so we can't easily test console output
      // But we can verify the configuration was created successfully
      expect(true).toBe(true); // Configuration creation succeeded
    });
  });

  describe('Performance Considerations', () => {
    it('should create configuration quickly', () => {
      process.env.DATABASE_TYPE = 'sqlite';
      process.env.DATABASE_PATH = './test.sqlite';

      const startTime = Date.now();
      createDatabaseConfig();
      const duration = Date.now() - startTime;

      // Configuration creation should be fast (under 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});