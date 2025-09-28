import { ValueTransformer } from 'typeorm';

/**
 * TypeORM transformer for handling boolean values across different database systems.
 * 
 * This transformer ensures consistent boolean handling by:
 * - Converting JavaScript boolean values to numeric values (1/0) for database storage
 * - Converting database numeric values back to JavaScript boolean values
 * - Handling null/undefined values gracefully
 * - Working consistently across SQLite, MySQL, and PostgreSQL
 */
export class BooleanTransformer implements ValueTransformer {
  /**
   * Transform JavaScript boolean value to database value
   * @param value - JavaScript boolean, null, or undefined
   * @returns Database-compatible numeric value (1 for true, 0 for false) or null
   */
  to(value: boolean | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    return value ? 1 : 0;
  }

  /**
   * Transform database value to JavaScript boolean
   * @param value - Database value (number, boolean, null, or undefined)
   * @returns JavaScript boolean or null
   */
  from(value: number | boolean | null | undefined): boolean | null {
    if (value === null || value === undefined) {
      return null;
    }
    
    // Handle case where database already returns boolean (some configurations)
    if (typeof value === 'boolean') {
      return value;
    }
    
    // Convert numeric values to boolean
    return value === 1;
  }
}

/**
 * Singleton instance of the boolean transformer for reuse across entities
 */
export const booleanTransformer = new BooleanTransformer();