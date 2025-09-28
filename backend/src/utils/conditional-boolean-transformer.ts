import { booleanTransformer } from './boolean.transformer';

/**
 * Returns the boolean transformer only for databases that need it (MySQL and SQLite).
 * For PostgreSQL, returns undefined to use native boolean handling.
 */
export function getConditionalBooleanTransformer() {
  const dbType = (process.env.DATABASE_TYPE || 'mysql').toLowerCase();
  
  // Only use transformer for MySQL and SQLite
  if (dbType === 'mysql' || dbType === 'sqlite') {
    return booleanTransformer;
  }
  
  // For PostgreSQL, use native boolean handling
  return undefined;
}