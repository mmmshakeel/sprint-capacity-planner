import {
  createMySqlConfig,
  createSqliteConfig,
  createPostgreSqlConfig,
  getBooleanFieldConfig,
  getBooleanColumnType,
  requiresBooleanTransformer
} from '../database.config';

describe('Boolean Database Integration', () => {
  describe('MySQL Boolean Integration', () => {
    beforeEach(() => {
      process.env.DATABASE_TYPE = 'mysql';
      process.env.DATABASE_USER = 'testuser';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'testdb';
    });

    afterEach(() => {
      delete process.env.DATABASE_TYPE;
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_NAME;
    });

    it('should create MySQL config with boolean column type mapping', () => {
      const config = createMySqlConfig();
      
      expect(config.type).toBe('mysql');
      expect((config as any).columnTypes).toBeDefined();
      expect((config as any).columnTypes.boolean).toBe('tinyint');
    });

    it('should have correct boolean field configuration for MySQL', () => {
      const booleanConfig = getBooleanFieldConfig('mysql');
      
      expect(booleanConfig.columnType).toBe('tinyint');
      expect(booleanConfig.requiresTransformer).toBe(true);
      expect(booleanConfig.supportsNativeBoolean).toBe(false);
      expect(booleanConfig.validationRules.acceptsNumericBoolean).toBe(true);
    });

    it('should return correct column type for MySQL', () => {
      expect(getBooleanColumnType('mysql')).toBe('tinyint');
    });

    it('should require transformer for MySQL', () => {
      expect(requiresBooleanTransformer('mysql')).toBe(true);
    });
  });

  describe('SQLite Boolean Integration', () => {
    beforeEach(() => {
      process.env.DATABASE_TYPE = 'sqlite';
      process.env.DATABASE_PATH = './test.sqlite';
    });

    afterEach(() => {
      delete process.env.DATABASE_TYPE;
      delete process.env.DATABASE_PATH;
    });

    it('should create SQLite config with boolean column type mapping', () => {
      const config = createSqliteConfig();
      
      expect(config.type).toBe('sqlite');
      expect((config as any).columnTypes).toBeDefined();
      expect((config as any).columnTypes.boolean).toBe('integer');
    });

    it('should have correct boolean field configuration for SQLite', () => {
      const booleanConfig = getBooleanFieldConfig('sqlite');
      
      expect(booleanConfig.columnType).toBe('integer');
      expect(booleanConfig.requiresTransformer).toBe(true);
      expect(booleanConfig.supportsNativeBoolean).toBe(false);
      expect(booleanConfig.validationRules.acceptsStringBoolean).toBe(true);
      expect(booleanConfig.validationRules.acceptsNumericBoolean).toBe(true);
      expect(booleanConfig.validationRules.acceptsNativeBoolean).toBe(true);
    });

    it('should return correct column type for SQLite', () => {
      expect(getBooleanColumnType('sqlite')).toBe('integer');
    });

    it('should require transformer for SQLite', () => {
      expect(requiresBooleanTransformer('sqlite')).toBe(true);
    });
  });

  describe('PostgreSQL Boolean Integration', () => {
    beforeEach(() => {
      process.env.DATABASE_TYPE = 'postgresql';
      process.env.DATABASE_USER = 'testuser';
      process.env.DATABASE_PASSWORD = 'testpass';
      process.env.DATABASE_NAME = 'testdb';
    });

    afterEach(() => {
      delete process.env.DATABASE_TYPE;
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_NAME;
    });

    it('should create PostgreSQL config with boolean column type mapping', () => {
      const config = createPostgreSqlConfig();
      
      expect(config.type).toBe('postgres');
      expect((config as any).columnTypes).toBeDefined();
      expect((config as any).columnTypes.boolean).toBe('boolean');
    });

    it('should have correct boolean field configuration for PostgreSQL', () => {
      const booleanConfig = getBooleanFieldConfig('postgres');
      
      expect(booleanConfig.columnType).toBe('boolean');
      expect(booleanConfig.requiresTransformer).toBe(false);
      expect(booleanConfig.supportsNativeBoolean).toBe(true);
      expect(booleanConfig.validationRules.acceptsNativeBoolean).toBe(true);
      expect(booleanConfig.validationRules.acceptsStringBoolean).toBe(false);
      expect(booleanConfig.validationRules.acceptsNumericBoolean).toBe(false);
    });

    it('should return correct column type for PostgreSQL', () => {
      expect(getBooleanColumnType('postgres')).toBe('boolean');
    });

    it('should not require transformer for PostgreSQL', () => {
      expect(requiresBooleanTransformer('postgres')).toBe(false);
    });
  });

  describe('Cross-Database Boolean Consistency', () => {
    it('should have consistent boolean configuration across all databases', () => {
      const mysqlConfig = getBooleanFieldConfig('mysql');
      const sqliteConfig = getBooleanFieldConfig('sqlite');
      const postgresConfig = getBooleanFieldConfig('postgres');

      // All configurations should have required properties
      [mysqlConfig, sqliteConfig, postgresConfig].forEach(config => {
        expect(config).toHaveProperty('columnType');
        expect(config).toHaveProperty('supportsNativeBoolean');
        expect(config).toHaveProperty('requiresTransformer');
        expect(config).toHaveProperty('validationRules');
        expect(config.validationRules).toHaveProperty('acceptsStringBoolean');
        expect(config.validationRules).toHaveProperty('acceptsNumericBoolean');
        expect(config.validationRules).toHaveProperty('acceptsNativeBoolean');
      });
    });

    it('should have different column types for different databases', () => {
      expect(getBooleanColumnType('mysql')).toBe('tinyint');
      expect(getBooleanColumnType('sqlite')).toBe('integer');
      expect(getBooleanColumnType('postgres')).toBe('boolean');
    });

    it('should have appropriate transformer requirements', () => {
      // MySQL and SQLite require transformers due to numeric storage
      expect(requiresBooleanTransformer('mysql')).toBe(true);
      expect(requiresBooleanTransformer('sqlite')).toBe(true);
      
      // PostgreSQL uses native boolean type
      expect(requiresBooleanTransformer('postgres')).toBe(false);
    });
  });

  describe('Boolean Configuration Validation', () => {
    it('should validate boolean configuration during database config creation', () => {
      // These should not throw errors if boolean configuration is valid
      expect(() => {
        process.env.DATABASE_TYPE = 'mysql';
        process.env.DATABASE_USER = 'test';
        process.env.DATABASE_PASSWORD = 'test';
        process.env.DATABASE_NAME = 'test';
        createMySqlConfig();
      }).not.toThrow();

      expect(() => {
        process.env.DATABASE_TYPE = 'sqlite';
        process.env.DATABASE_PATH = './test.sqlite';
        createSqliteConfig();
      }).not.toThrow();

      expect(() => {
        process.env.DATABASE_TYPE = 'postgresql';
        process.env.DATABASE_USER = 'test';
        process.env.DATABASE_PASSWORD = 'test';
        process.env.DATABASE_NAME = 'test';
        createPostgreSqlConfig();
      }).not.toThrow();

      // Clean up
      delete process.env.DATABASE_TYPE;
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_NAME;
      delete process.env.DATABASE_PATH;
    });
  });
});