// Mock TypeORM Column decorator
const mockColumn = jest.fn(() => jest.fn());
jest.mock('typeorm', () => ({
  Column: mockColumn,
}));

import { BooleanColumn } from '../database-aware-boolean.decorator';
import { booleanTransformer } from '../boolean.transformer';

describe('BooleanColumn Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear environment variables
    delete process.env.DATABASE_TYPE;
  });

  afterEach(() => {
    delete process.env.DATABASE_TYPE;
  });

  it('should apply transformer for MySQL database', () => {
    process.env.DATABASE_TYPE = 'mysql';
    
    class TestEntity {
      @BooleanColumn({ default: true })
      active: boolean;
    }

    expect(mockColumn).toHaveBeenCalledWith({
      type: 'boolean',
      default: true,
      transformer: booleanTransformer,
    });
  });

  it('should apply transformer for SQLite database', () => {
    process.env.DATABASE_TYPE = 'sqlite';
    
    class TestEntity {
      @BooleanColumn({ default: false })
      enabled: boolean;
    }

    expect(mockColumn).toHaveBeenCalledWith({
      type: 'boolean',
      default: false,
      transformer: booleanTransformer,
    });
  });

  it('should NOT apply transformer for PostgreSQL database', () => {
    process.env.DATABASE_TYPE = 'postgresql';
    
    class TestEntity {
      @BooleanColumn({ default: true })
      active: boolean;
    }

    expect(mockColumn).toHaveBeenCalledWith({
      type: 'boolean',
      default: true,
    });
  });

  it('should NOT apply transformer for postgres database type', () => {
    process.env.DATABASE_TYPE = 'postgres';
    
    class TestEntity {
      @BooleanColumn({ nullable: true })
      optional: boolean;
    }

    expect(mockColumn).toHaveBeenCalledWith({
      type: 'boolean',
      nullable: true,
    });
  });

  it('should default to MySQL behavior when DATABASE_TYPE is not set', () => {
    // DATABASE_TYPE is not set, should default to mysql behavior
    
    class TestEntity {
      @BooleanColumn({ default: true })
      active: boolean;
    }

    expect(mockColumn).toHaveBeenCalledWith({
      type: 'boolean',
      default: true,
      transformer: booleanTransformer,
    });
  });

  it('should handle case-insensitive database types', () => {
    process.env.DATABASE_TYPE = 'POSTGRESQL';
    
    class TestEntity {
      @BooleanColumn({ default: false })
      active: boolean;
    }

    expect(mockColumn).toHaveBeenCalledWith({
      type: 'boolean',
      default: false,
    });
  });

  it('should merge provided options with database-specific configuration', () => {
    process.env.DATABASE_TYPE = 'mysql';
    
    class TestEntity {
      @BooleanColumn({ 
        default: true,
        nullable: false,
        comment: 'Test boolean field'
      })
      active: boolean;
    }

    expect(mockColumn).toHaveBeenCalledWith({
      type: 'boolean',
      default: true,
      nullable: false,
      comment: 'Test boolean field',
      transformer: booleanTransformer,
    });
  });

  it('should work with empty options', () => {
    process.env.DATABASE_TYPE = 'sqlite';
    
    class TestEntity {
      @BooleanColumn()
      flag: boolean;
    }

    expect(mockColumn).toHaveBeenCalledWith({
      type: 'boolean',
      transformer: booleanTransformer,
    });
  });
});