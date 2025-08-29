import { Injectable, Logger } from '@nestjs/common';

/**
 * Database-specific logging service
 * Provides structured logging for database operations, connections, and errors
 */
@Injectable()
export class DatabaseLoggerService {
  private readonly logger = new Logger('DatabaseConfig');

  /**
   * Logs database selection and configuration details
   */
  logDatabaseSelection(type: 'mysql' | 'sqlite', config: any): void {
    this.logger.log(`🗄️  Database Type Selected: ${type.toUpperCase()}`);
    
    if (type === 'mysql') {
      this.logger.log(`📡 MySQL Configuration:`);
      this.logger.log(`   Host: ${config.host}:${config.port}`);
      this.logger.log(`   Database: ${config.database}`);
      this.logger.log(`   Username: ${config.username}`);
      this.logger.log(`   SSL: ${config.ssl ? 'enabled' : 'disabled'}`);
      this.logger.log(`   Retry Attempts: ${config.retryAttempts}`);
      this.logger.log(`   Synchronize: ${config.synchronize}`);
    } else if (type === 'sqlite') {
      this.logger.log(`📁 SQLite Configuration:`);
      this.logger.log(`   Database File: ${config.database}`);
      this.logger.log(`   Synchronize: ${config.synchronize}`);
      this.logger.log(`   Logging Level: ${Array.isArray(config.logging) ? config.logging.join(', ') : config.logging}`);
    }
  }

  /**
   * Logs successful database connection
   */
  logConnectionSuccess(type: 'mysql' | 'sqlite'): void {
    this.logger.log(`✅ ${type.toUpperCase()} database connection established successfully`);
  }

  /**
   * Logs database connection attempt
   */
  logConnectionAttempt(type: 'mysql' | 'sqlite', attempt?: number): void {
    const attemptText = attempt ? ` (attempt ${attempt})` : '';
    this.logger.log(`🔄 Attempting to connect to ${type.toUpperCase()} database${attemptText}...`);
  }

  /**
   * Logs database connection failure with specific error details
   */
  logConnectionError(type: 'mysql' | 'sqlite', error: any, attempt?: number): void {
    const attemptText = attempt ? ` (attempt ${attempt})` : '';
    this.logger.error(`❌ ${type.toUpperCase()} database connection failed${attemptText}`);
    
    // Log specific error details based on database type
    if (type === 'mysql') {
      this.logMySQLError(error);
    } else if (type === 'sqlite') {
      this.logSQLiteError(error);
    }
  }

  /**
   * Logs MySQL-specific error details
   */
  private logMySQLError(error: any): void {
    const errorCode = error.code || error.errno;
    const errorMessage = error.message || 'Unknown MySQL error';

    this.logger.error(`MySQL Error Code: ${errorCode}`);
    this.logger.error(`MySQL Error Message: ${errorMessage}`);

    // Provide specific guidance for common MySQL errors
    switch (errorCode) {
      case 'ER_ACCESS_DENIED_ERROR':
        this.logger.error('💡 Troubleshooting: Check DATABASE_USER and DATABASE_PASSWORD environment variables');
        break;
      case 'ER_BAD_DB_ERROR':
        this.logger.error('💡 Troubleshooting: Check DATABASE_NAME environment variable - database may not exist');
        break;
      case 'ECONNREFUSED':
        this.logger.error('💡 Troubleshooting: Check DATABASE_HOST and DATABASE_PORT - MySQL server may not be running');
        break;
      case 'ENOTFOUND':
        this.logger.error('💡 Troubleshooting: Check DATABASE_HOST - hostname cannot be resolved');
        break;
      case 'ETIMEDOUT':
        this.logger.error('💡 Troubleshooting: Connection timeout - check network connectivity and firewall settings');
        break;
      default:
        this.logger.error('💡 Troubleshooting: Verify all MySQL environment variables and server status');
    }
  }

  /**
   * Logs SQLite-specific error details
   */
  private logSQLiteError(error: any): void {
    const errorCode = error.code || error.errno;
    const errorMessage = error.message || 'Unknown SQLite error';

    this.logger.error(`SQLite Error Code: ${errorCode}`);
    this.logger.error(`SQLite Error Message: ${errorMessage}`);

    // Provide specific guidance for common SQLite errors
    switch (errorCode) {
      case 'SQLITE_CANTOPEN':
        this.logger.error('💡 Troubleshooting: Check DATABASE_PATH and directory permissions - cannot open database file');
        break;
      case 'SQLITE_READONLY':
        this.logger.error('💡 Troubleshooting: Database file is read-only - check file permissions');
        break;
      case 'SQLITE_IOERR':
        this.logger.error('💡 Troubleshooting: I/O error - check disk space and file system permissions');
        break;
      case 'SQLITE_CORRUPT':
        this.logger.error('💡 Troubleshooting: Database file is corrupted - consider restoring from backup');
        break;
      case 'ENOENT':
        this.logger.error('💡 Troubleshooting: Database directory does not exist - check DATABASE_PATH');
        break;
      case 'EACCES':
        this.logger.error('💡 Troubleshooting: Permission denied - check directory and file permissions');
        break;
      default:
        this.logger.error('💡 Troubleshooting: Verify DATABASE_PATH and file system permissions');
    }
  }

  /**
   * Logs database configuration validation errors
   */
  logConfigurationError(type: 'mysql' | 'sqlite', error: string): void {
    this.logger.error(`⚙️  ${type.toUpperCase()} Configuration Error: ${error}`);
  }

  /**
   * Logs database configuration warnings
   */
  logConfigurationWarning(type: 'mysql' | 'sqlite', warning: string): void {
    this.logger.warn(`⚠️  ${type.toUpperCase()} Configuration Warning: ${warning}`);
  }

  /**
   * Logs database initialization steps
   */
  logInitializationStep(step: string): void {
    this.logger.log(`🔧 Database Initialization: ${step}`);
  }

  /**
   * Logs database seeding information
   */
  logSeedingInfo(message: string): void {
    this.logger.log(`🌱 Database Seeding: ${message}`);
  }

  /**
   * Logs environment variable information for debugging
   */
  logEnvironmentDebugInfo(): void {
    this.logger.debug('🔍 Database Environment Variables:');
    this.logger.debug(`   DATABASE_TYPE: ${process.env.DATABASE_TYPE || 'not set (defaults to mysql)'}`);
    this.logger.debug(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    
    const dbType = (process.env.DATABASE_TYPE || 'mysql').toLowerCase();
    if (dbType === 'mysql') {
      this.logger.debug(`   DATABASE_HOST: ${process.env.DATABASE_HOST || 'not set (defaults to localhost)'}`);
      this.logger.debug(`   DATABASE_PORT: ${process.env.DATABASE_PORT || 'not set (defaults to 3306)'}`);
      this.logger.debug(`   DATABASE_NAME: ${process.env.DATABASE_NAME || 'not set'}`);
      this.logger.debug(`   DATABASE_USER: ${process.env.DATABASE_USER ? '***set***' : 'not set'}`);
      this.logger.debug(`   DATABASE_PASSWORD: ${process.env.DATABASE_PASSWORD ? '***set***' : 'not set'}`);
    } else if (dbType === 'sqlite') {
      this.logger.debug(`   DATABASE_PATH: ${process.env.DATABASE_PATH || 'not set (defaults to ./data/database.sqlite)'}`);
    }
  }

  /**
   * Logs performance metrics for database operations
   */
  logPerformanceMetric(operation: string, duration: number): void {
    this.logger.log(`⏱️  Database Performance: ${operation} completed in ${duration}ms`);
  }

  /**
   * Logs database migration information
   */
  logMigrationInfo(message: string): void {
    this.logger.log(`🔄 Database Migration: ${message}`);
  }
}