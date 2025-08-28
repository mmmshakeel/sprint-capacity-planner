/**
 * Environment variable validation utilities
 * Provides comprehensive validation for all application environment variables
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DatabaseEnvVars {
  DATABASE_TYPE?: string;
  DATABASE_HOST?: string;
  DATABASE_PORT?: string;
  DATABASE_USER?: string;
  DATABASE_PASSWORD?: string;
  DATABASE_NAME?: string;
  DATABASE_PATH?: string;
}

/**
 * Validates all environment variables and returns detailed results
 */
export function validateEnvironmentVariables(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Validate database configuration
  const dbValidation = validateDatabaseEnvironmentVariables();
  result.errors.push(...dbValidation.errors);
  result.warnings.push(...dbValidation.warnings);

  // Validate application configuration
  const appValidation = validateApplicationEnvironmentVariables();
  result.errors.push(...appValidation.errors);
  result.warnings.push(...appValidation.warnings);

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validates database-specific environment variables
 */
export function validateDatabaseEnvironmentVariables(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const dbType = (process.env.DATABASE_TYPE || 'mysql').toLowerCase().trim();

  // Validate DATABASE_TYPE
  if (process.env.DATABASE_TYPE && !['mysql', 'sqlite'].includes(dbType)) {
    result.errors.push(`DATABASE_TYPE must be 'mysql' or 'sqlite', got: ${process.env.DATABASE_TYPE}`);
  }

  if (dbType === 'mysql') {
    validateMySQLEnvironmentVariables(result);
  } else if (dbType === 'sqlite') {
    validateSQLiteEnvironmentVariables(result);
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validates MySQL-specific environment variables
 */
function validateMySQLEnvironmentVariables(result: ValidationResult): void {
  const requiredVars = ['DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
  
  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      result.errors.push(`${varName} is required for MySQL configuration`);
    } else if (process.env[varName].trim() === '') {
      result.errors.push(`${varName} cannot be empty`);
    }
  }

  // Validate optional variables
  if (process.env.DATABASE_HOST && process.env.DATABASE_HOST.trim() === '') {
    result.errors.push('DATABASE_HOST cannot be empty if provided');
  }

  if (process.env.DATABASE_PORT) {
    const port = parseInt(process.env.DATABASE_PORT);
    if (isNaN(port) || port <= 0 || port > 65535) {
      result.errors.push(`DATABASE_PORT must be a valid port number (1-65535), got: ${process.env.DATABASE_PORT}`);
    }
  }

  // Validate database name format
  if (process.env.DATABASE_NAME) {
    const dbName = process.env.DATABASE_NAME.trim();
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      result.errors.push('DATABASE_NAME can only contain letters, numbers, and underscores');
    }
  }

  // Warnings for missing optional variables
  if (!process.env.DATABASE_HOST) {
    result.warnings.push('DATABASE_HOST not set, defaulting to localhost');
  }
  
  if (!process.env.DATABASE_PORT) {
    result.warnings.push('DATABASE_PORT not set, defaulting to 3306');
  }
}

/**
 * Validates SQLite-specific environment variables
 */
function validateSQLiteEnvironmentVariables(result: ValidationResult): void {
  const databasePath = process.env.DATABASE_PATH || './data/database.sqlite';

  // Validate database path format
  if (process.env.DATABASE_PATH !== undefined && process.env.DATABASE_PATH.trim() === '') {
    result.errors.push('DATABASE_PATH cannot be empty if provided');
  }

  // Validate file extension
  if (!databasePath.endsWith('.sqlite') && !databasePath.endsWith('.db')) {
    result.warnings.push(`DATABASE_PATH should typically end with .sqlite or .db extension, got: ${databasePath}`);
  }

  // Validate path security
  if (databasePath.includes('..') || databasePath.includes('~')) {
    result.errors.push('DATABASE_PATH cannot contain relative path traversal (..) or home directory (~) references');
  }

  // Check for absolute paths in production
  if (process.env.NODE_ENV === 'production' && !databasePath.startsWith('/')) {
    result.warnings.push('Consider using absolute paths for DATABASE_PATH in production environments');
  }

  // Warning for missing DATABASE_PATH
  if (!process.env.DATABASE_PATH) {
    result.warnings.push('DATABASE_PATH not set, defaulting to ./data/database.sqlite');
  }
}

/**
 * Validates application-specific environment variables
 */
function validateApplicationEnvironmentVariables(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Validate NODE_ENV
  if (process.env.NODE_ENV) {
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(process.env.NODE_ENV)) {
      result.warnings.push(`NODE_ENV should be one of: ${validEnvs.join(', ')}, got: ${process.env.NODE_ENV}`);
    }
  } else {
    result.warnings.push('NODE_ENV not set, some features may not work as expected');
  }

  // Validate PORT
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT);
    if (isNaN(port) || port <= 0 || port > 65535) {
      result.errors.push(`PORT must be a valid port number (1-65535), got: ${process.env.PORT}`);
    }
  }

  // Validate FRONTEND_URL format
  if (process.env.FRONTEND_URL) {
    try {
      new URL(process.env.FRONTEND_URL);
    } catch (error) {
      result.errors.push(`FRONTEND_URL must be a valid URL, got: ${process.env.FRONTEND_URL}`);
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Provides configuration defaults for missing environment variables
 */
export function getConfigurationDefaults(): Record<string, string> {
  const dbType = (process.env.DATABASE_TYPE || 'mysql').toLowerCase();
  
  const defaults: Record<string, string> = {
    NODE_ENV: 'development',
    PORT: '3300',
    DATABASE_TYPE: 'mysql'
  };

  if (dbType === 'mysql') {
    defaults.DATABASE_HOST = 'localhost';
    defaults.DATABASE_PORT = '3306';
  } else if (dbType === 'sqlite') {
    defaults.DATABASE_PATH = './data/database.sqlite';
  }

  return defaults;
}

/**
 * Prints a formatted validation report
 */
export function printValidationReport(result: ValidationResult): void {
  console.log('\n🔍 Environment Variable Validation Report\n');
  
  if (result.isValid) {
    console.log('✅ All environment variables are valid!');
  } else {
    console.log('❌ Environment validation failed:');
    result.errors.forEach(error => console.log(`   • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  if (!result.isValid || result.warnings.length > 0) {
    console.log('\n💡 Configuration defaults:');
    const defaults = getConfigurationDefaults();
    Object.entries(defaults).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  }

  console.log('');
}