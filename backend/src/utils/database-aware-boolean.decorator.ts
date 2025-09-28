import { Column, ColumnOptions } from 'typeorm';
import { booleanTransformer } from './boolean.transformer';

/**
 * Database-aware boolean column decorator that applies the appropriate configuration
 * based on the database type being used.
 */
export function BooleanColumn(options: Partial<ColumnOptions> = {}): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Get the database type from environment or default to mysql
        const dbType = (process.env.DATABASE_TYPE || 'mysql').toLowerCase();

        // Determine if transformer is needed based on database type
        const requiresTransformer = dbType === 'mysql' || dbType === 'sqlite';

        // Create column options with appropriate configuration
        const columnOptions: ColumnOptions = {
            type: 'boolean',
            ...options,
        };

        // Only add transformer for databases that need it (MySQL and SQLite)
        if (requiresTransformer) {
            columnOptions.transformer = booleanTransformer;
        }

        // Apply the column decorator
        Column(columnOptions)(target, propertyKey);
    };
}