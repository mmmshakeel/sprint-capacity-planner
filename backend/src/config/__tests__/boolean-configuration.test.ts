import {
  validateBooleanFieldConfig,
  validateEntityBooleanFields,
  validateBooleanConfiguration,
  getBooleanFieldConfig,
  getBooleanColumnType,
  requiresBooleanTransformer,
  BOOLEAN_COLUMN_TYPES,
  BOOLEAN_FIELD_CONFIGS
} from '../database.config';

describe('Boolean Configuration', () => {
  describe('BOOLEAN_COLUMN_TYPES', () => {
    it('should define correct column types for each database', () => {
      expect(BOOLEAN_COLUMN_TYPES.mysql).toBe('tinyint');
      expect(BOOLEAN_COLUMN_TYPES.sqlite).toBe('integer');
      expect(BOOLEAN_COLUMN_TYPES.postgres).toBe('boolean');
    });
  });

  describe('BOOLEAN_FIELD_CONFIGS', () => {
    it('should define correct configuration for MySQL', () => {
      const config = BOOLEAN_FIELD_CONFIGS.mysql;
      expect(config.columnType).toBe('tinyint');
      expect(config.supportsNativeBoolean).toBe(false);
      expect(config.requiresTransformer).toBe(true);
      expect(config.validationRules.acceptsStringBoolean).toBe(false);
      expect(config.validationRules.acceptsNumericBoolean).toBe(true);
      expect(config.validationRules.acceptsNativeBoolean).toBe(false);
    });

    it('should define correct configuration for SQLite', () => {
      const config = BOOLEAN_FIELD_CONFIGS.sqlite;
      expect(config.columnType).toBe('integer');
      expect(config.supportsNativeBoolean).toBe(false);
      expect(config.requiresTransformer).toBe(true);
      expect(config.validationRules.acceptsStringBoolean).toBe(true);
      expect(config.validationRules.acceptsNumericBoolean).toBe(true);
      expect(config.validationRules.acceptsNativeBoolean).toBe(true);
    });

    it('should define correct configuration for PostgreSQL', () => {
      const config = BOOLEAN_FIELD_CONFIGS.postgres;
      expect(config.columnType).toBe('boolean');
      expect(config.supportsNativeBoolean).toBe(true);
      expect(config.requiresTransformer).toBe(false);
      expect(config.validationRules.acceptsStringBoolean).toBe(false);
      expect(config.validationRules.acceptsNumericBoolean).toBe(false);
      expect(config.validationRules.acceptsNativeBoolean).toBe(true);
    });
  });

  describe('validateBooleanFieldConfig', () => {
    it('should validate MySQL boolean field configuration successfully', () => {
      expect(() => validateBooleanFieldConfig('mysql')).not.toThrow();
    });

    it('should validate SQLite boolean field configuration successfully', () => {
      expect(() => validateBooleanFieldConfig('sqlite')).not.toThrow();
    });

    it('should validate PostgreSQL boolean field configuration successfully', () => {
      expect(() => validateBooleanFieldConfig('postgres')).not.toThrow();
    });
  });

  describe('validateEntityBooleanFields', () => {
    it('should validate entity boolean fields for MySQL', () => {
      expect(() => validateEntityBooleanFields('mysql')).not.toThrow();
    });

    it('should validate entity boolean fields for SQLite', () => {
      expect(() => validateEntityBooleanFields('sqlite')).not.toThrow();
    });

    it('should validate entity boolean fields for PostgreSQL', () => {
      expect(() => validateEntityBooleanFields('postgres')).not.toThrow();
    });
  });

  describe('validateBooleanConfiguration', () => {
    it('should validate complete boolean configuration for MySQL', () => {
      expect(() => validateBooleanConfiguration('mysql')).not.toThrow();
    });

    it('should validate complete boolean configuration for SQLite', () => {
      expect(() => validateBooleanConfiguration('sqlite')).not.toThrow();
    });

    it('should validate complete boolean configuration for PostgreSQL', () => {
      expect(() => validateBooleanConfiguration('postgres')).not.toThrow();
    });
  });

  describe('getBooleanFieldConfig', () => {
    it('should return correct configuration for each database type', () => {
      expect(getBooleanFieldConfig('mysql')).toEqual(BOOLEAN_FIELD_CONFIGS.mysql);
      expect(getBooleanFieldConfig('sqlite')).toEqual(BOOLEAN_FIELD_CONFIGS.sqlite);
      expect(getBooleanFieldConfig('postgres')).toEqual(BOOLEAN_FIELD_CONFIGS.postgres);
    });

    it('should throw error for invalid database type', () => {
      expect(() => getBooleanFieldConfig('invalid' as any)).toThrow(
        'Boolean field configuration not found for database type: invalid'
      );
    });
  });

  describe('getBooleanColumnType', () => {
    it('should return correct column type for each database', () => {
      expect(getBooleanColumnType('mysql')).toBe('tinyint');
      expect(getBooleanColumnType('sqlite')).toBe('integer');
      expect(getBooleanColumnType('postgres')).toBe('boolean');
    });
  });

  describe('requiresBooleanTransformer', () => {
    it('should return true for databases that require transformers', () => {
      expect(requiresBooleanTransformer('mysql')).toBe(true);
      expect(requiresBooleanTransformer('sqlite')).toBe(true);
    });

    it('should return false for databases that do not require transformers', () => {
      expect(requiresBooleanTransformer('postgres')).toBe(false);
    });
  });
});

describe('Boolean Configuration Integration', () => {
  describe('Database-specific boolean handling', () => {
    it('should ensure MySQL configuration requires transformer', () => {
      const config = getBooleanFieldConfig('mysql');
      expect(config.requiresTransformer).toBe(true);
      expect(config.supportsNativeBoolean).toBe(false);
      expect(config.validationRules.acceptsNumericBoolean).toBe(true);
    });

    it('should ensure SQLite configuration is flexible', () => {
      const config = getBooleanFieldConfig('sqlite');
      expect(config.requiresTransformer).toBe(true);
      expect(config.validationRules.acceptsStringBoolean).toBe(true);
      expect(config.validationRules.acceptsNumericBoolean).toBe(true);
      expect(config.validationRules.acceptsNativeBoolean).toBe(true);
    });

    it('should ensure PostgreSQL configuration uses native boolean', () => {
      const config = getBooleanFieldConfig('postgres');
      expect(config.requiresTransformer).toBe(false);
      expect(config.supportsNativeBoolean).toBe(true);
      expect(config.validationRules.acceptsNativeBoolean).toBe(true);
      expect(config.validationRules.acceptsStringBoolean).toBe(false);
    });
  });

  describe('Column type consistency', () => {
    it('should ensure column types match configuration', () => {
      Object.keys(BOOLEAN_FIELD_CONFIGS).forEach(dbType => {
        const config = BOOLEAN_FIELD_CONFIGS[dbType as keyof typeof BOOLEAN_FIELD_CONFIGS];
        const columnType = BOOLEAN_COLUMN_TYPES[dbType as keyof typeof BOOLEAN_COLUMN_TYPES];
        expect(config.columnType).toBe(columnType);
      });
    });
  });
});