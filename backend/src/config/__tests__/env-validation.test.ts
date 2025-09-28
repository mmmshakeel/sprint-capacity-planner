import { 
  validateEnvironmentVariables, 
  validateDatabaseEnvironmentVariables,
  getConfigurationDefaults,
  ValidationResult 
} from '../env-validation';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateDatabaseEnvironmentVariables', () => {
    describe('MySQL validation', () => {
      beforeEach(() => {
        process.env.DATABASE_TYPE = 'mysql';
      });

      it('should pass validation with all required MySQL variables', () => {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'testdb';
        process.env.DATABASE_HOST = 'localhost';
        process.env.DATABASE_PORT = '3306';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail validation with missing required MySQL variables', () => {
        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_USER is required for MySQL configuration');
        expect(result.errors).toContain('DATABASE_PASSWORD is required for MySQL configuration');
        expect(result.errors).toContain('DATABASE_NAME is required for MySQL configuration');
      });

      it('should fail validation with empty required MySQL variables', () => {
        process.env.DATABASE_USER = '';
        process.env.DATABASE_PASSWORD = '  ';
        process.env.DATABASE_NAME = 'testdb';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_USER is required for MySQL configuration');
        expect(result.errors).toContain('DATABASE_PASSWORD cannot be empty');
      });

      it('should fail validation with invalid port number', () => {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'testdb';
        process.env.DATABASE_PORT = 'invalid';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_PORT must be a valid port number (1-65535), got: invalid');
      });

      it('should fail validation with port out of range', () => {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'testdb';
        process.env.DATABASE_PORT = '70000';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_PORT must be a valid port number (1-65535), got: 70000');
      });

      it('should fail validation with invalid database name format', () => {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'test-db!';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_NAME can only contain letters, numbers, and underscores');
      });

      it('should show warnings for missing optional variables', () => {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'testdb';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('DATABASE_HOST not set, defaulting to localhost');
        expect(result.warnings).toContain('DATABASE_PORT not set, defaulting to 3306');
      });
    });

    describe('SQLite validation', () => {
      beforeEach(() => {
        process.env.DATABASE_TYPE = 'sqlite';
      });

      it('should pass validation with valid SQLite configuration', () => {
        process.env.DATABASE_PATH = './data/test.sqlite';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should pass validation with default SQLite configuration', () => {
        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('DATABASE_PATH not set, defaulting to ./data/database.sqlite');
      });

      it('should fail validation with empty DATABASE_PATH', () => {
        process.env.DATABASE_PATH = '';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_PATH cannot be empty if provided');
      });

      it('should fail validation with dangerous path characters', () => {
        process.env.DATABASE_PATH = '../../../etc/passwd';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_PATH cannot contain relative path traversal (..) or home directory (~) references');
      });

      it('should show warning for non-standard file extension', () => {
        process.env.DATABASE_PATH = './data/test.txt';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('DATABASE_PATH should typically end with .sqlite or .db extension, got: ./data/test.txt');
      });

      it('should show warning for relative paths in production', () => {
        process.env.NODE_ENV = 'production';
        process.env.DATABASE_PATH = './data/test.sqlite';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('Consider using absolute paths for DATABASE_PATH in production environments');
      });
    });

    describe('PostgreSQL validation', () => {
      beforeEach(() => {
        process.env.DATABASE_TYPE = 'postgres';
      });

      it('should pass validation with all required PostgreSQL variables', () => {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'testdb';
        process.env.DATABASE_HOST = 'localhost';
        process.env.DATABASE_PORT = '5432';
        process.env.DATABASE_SCHEMA = 'public';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail validation with missing required PostgreSQL variables', () => {
        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_USER is required for PostgreSQL configuration');
        expect(result.errors).toContain('DATABASE_PASSWORD is required for PostgreSQL configuration');
        expect(result.errors).toContain('DATABASE_NAME is required for PostgreSQL configuration');
      });

      it('should fail validation with empty required PostgreSQL variables', () => {
        process.env.DATABASE_USER = '';
        process.env.DATABASE_PASSWORD = '  ';
        process.env.DATABASE_NAME = 'testdb';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_USER is required for PostgreSQL configuration');
        expect(result.errors).toContain('DATABASE_PASSWORD is required for PostgreSQL configuration');
      });

      it('should fail validation with invalid port number', () => {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'testdb';
        process.env.DATABASE_PORT = 'invalid';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_PORT must be a valid port number (1-65535), got: invalid');
      });

      it('should fail validation with invalid database name format', () => {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'test-db!';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_NAME can only contain letters, numbers, and underscores');
      });

      it('should fail validation with invalid schema name format', () => {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'testdb';
        process.env.DATABASE_SCHEMA = 'test-schema!';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('DATABASE_SCHEMA can only contain letters, numbers, and underscores');
      });

      it('should show warnings for missing optional variables', () => {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'testdb';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('DATABASE_HOST not set, defaulting to localhost');
        expect(result.warnings).toContain('DATABASE_PORT not set, defaulting to 5432');
        expect(result.warnings).toContain('DATABASE_SCHEMA not set, defaulting to public');
      });

      it('should accept postgresql as database type', () => {
        process.env.DATABASE_TYPE = 'postgresql';
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'testdb';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(true);
      });
    });

    describe('Database type validation', () => {
      it('should fail validation with invalid database type', () => {
        process.env.DATABASE_TYPE = 'oracle';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("DATABASE_TYPE must be one of: mysql, sqlite, postgres, postgresql, got: oracle");
      });

      it('should default to mysql when DATABASE_TYPE is not set', () => {
        delete process.env.DATABASE_TYPE;
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpass';
        process.env.DATABASE_NAME = 'testdb';

        const result = validateDatabaseEnvironmentVariables();

        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateEnvironmentVariables', () => {
    it('should validate all environment variables', () => {
      process.env.DATABASE_TYPE = 'sqlite';
      process.env.DATABASE_PATH = './data/test.sqlite';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3000';
      process.env.FRONTEND_URL = 'http://localhost:3000';

      const result = validateEnvironmentVariables();

      expect(result.isValid).toBe(true);
    });

    it('should fail validation with invalid PORT', () => {
      process.env.PORT = 'invalid';

      const result = validateEnvironmentVariables();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('PORT must be a valid port number (1-65535), got: invalid');
    });

    it('should fail validation with invalid FRONTEND_URL', () => {
      process.env.FRONTEND_URL = 'not-a-url';

      const result = validateEnvironmentVariables();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('FRONTEND_URL must be a valid URL, got: not-a-url');
    });

    it('should show warning for invalid NODE_ENV', () => {
      process.env.NODE_ENV = 'staging';

      const result = validateEnvironmentVariables();

      expect(result.warnings).toContain('NODE_ENV should be one of: development, production, test, got: staging');
    });
  });

  describe('getConfigurationDefaults', () => {
    it('should return MySQL defaults when DATABASE_TYPE is mysql', () => {
      process.env.DATABASE_TYPE = 'mysql';

      const defaults = getConfigurationDefaults();

      expect(defaults.DATABASE_TYPE).toBe('mysql');
      expect(defaults.DATABASE_HOST).toBe('localhost');
      expect(defaults.DATABASE_PORT).toBe('3306');
      expect(defaults.DATABASE_PATH).toBeUndefined();
      expect(defaults.DATABASE_SCHEMA).toBeUndefined();
    });

    it('should return SQLite defaults when DATABASE_TYPE is sqlite', () => {
      process.env.DATABASE_TYPE = 'sqlite';

      const defaults = getConfigurationDefaults();

      expect(defaults.DATABASE_TYPE).toBe('mysql');
      expect(defaults.DATABASE_PATH).toBe('./data/database.sqlite');
      expect(defaults.DATABASE_HOST).toBeUndefined();
      expect(defaults.DATABASE_PORT).toBeUndefined();
      expect(defaults.DATABASE_SCHEMA).toBeUndefined();
    });

    it('should return PostgreSQL defaults when DATABASE_TYPE is postgres', () => {
      process.env.DATABASE_TYPE = 'postgres';

      const defaults = getConfigurationDefaults();

      expect(defaults.DATABASE_TYPE).toBe('mysql');
      expect(defaults.DATABASE_HOST).toBe('localhost');
      expect(defaults.DATABASE_PORT).toBe('5432');
      expect(defaults.DATABASE_SCHEMA).toBe('public');
      expect(defaults.DATABASE_PATH).toBeUndefined();
    });

    it('should return PostgreSQL defaults when DATABASE_TYPE is postgresql', () => {
      process.env.DATABASE_TYPE = 'postgresql';

      const defaults = getConfigurationDefaults();

      expect(defaults.DATABASE_TYPE).toBe('mysql');
      expect(defaults.DATABASE_HOST).toBe('localhost');
      expect(defaults.DATABASE_PORT).toBe('5432');
      expect(defaults.DATABASE_SCHEMA).toBe('public');
      expect(defaults.DATABASE_PATH).toBeUndefined();
    });

    it('should return MySQL defaults when DATABASE_TYPE is not set', () => {
      delete process.env.DATABASE_TYPE;

      const defaults = getConfigurationDefaults();

      expect(defaults.DATABASE_TYPE).toBe('mysql');
      expect(defaults.DATABASE_HOST).toBe('localhost');
      expect(defaults.DATABASE_PORT).toBe('3306');
      expect(defaults.DATABASE_SCHEMA).toBeUndefined();
    });
  });
});