import { Injectable } from '@nestjs/common';

/**
 * Database error types for categorization
 */
export enum DatabaseErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  DATABASE_NOT_FOUND = 'DATABASE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  FILE_SYSTEM_ERROR = 'FILE_SYSTEM_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Structured database error information
 */
export interface DatabaseError {
  type: DatabaseErrorType;
  originalError: any;
  userMessage: string;
  technicalMessage: string;
  troubleshootingSteps: string[];
  isRetryable: boolean;
}

/**
 * Database error handling service
 * Provides user-friendly error messages and troubleshooting guidance
 */
@Injectable()
export class DatabaseErrorHandlerService {

  /**
   * Processes and categorizes database errors
   */
  handleDatabaseError(error: any, databaseType: 'mysql' | 'sqlite' | 'postgresql'): DatabaseError {
    if (databaseType === 'mysql') {
      return this.handleMySQLError(error);
    } else if (databaseType === 'postgresql') {
      return this.handlePostgreSQLError(error);
    } else if (databaseType === 'sqlite') {
      return this.handleSQLiteError(error);
    }
    
    return this.createUnknownError(error);
  }

  /**
   * Handles MySQL-specific errors
   */
  private handleMySQLError(error: any): DatabaseError {
    if (!error) {
      return this.createUnknownError(new Error('Null or undefined MySQL error'));
    }
    
    const errorCode = error.code || error.errno;
    const errorMessage = error.message || 'Unknown MySQL error';

    switch (errorCode) {
      case 'ER_ACCESS_DENIED_ERROR':
        return {
          type: DatabaseErrorType.AUTHENTICATION_FAILED,
          originalError: error,
          userMessage: 'Database authentication failed. Please check your username and password.',
          technicalMessage: `MySQL authentication error: ${errorMessage}`,
          troubleshootingSteps: [
            'Verify DATABASE_USER environment variable is correct',
            'Verify DATABASE_PASSWORD environment variable is correct',
            'Ensure the MySQL user has proper permissions',
            'Check if the MySQL user account is not locked or expired'
          ],
          isRetryable: false
        };

      case 'ER_BAD_DB_ERROR':
        return {
          type: DatabaseErrorType.DATABASE_NOT_FOUND,
          originalError: error,
          userMessage: 'The specified database does not exist on the MySQL server.',
          technicalMessage: `MySQL database not found: ${errorMessage}`,
          troubleshootingSteps: [
            'Verify DATABASE_NAME environment variable is correct',
            'Create the database on the MySQL server',
            'Check if you have permission to access the database',
            'Verify the database name spelling and case sensitivity'
          ],
          isRetryable: false
        };

      case 'ECONNREFUSED':
        return {
          type: DatabaseErrorType.CONNECTION_FAILED,
          originalError: error,
          userMessage: 'Cannot connect to the MySQL server. The server may be down or unreachable.',
          technicalMessage: `MySQL connection refused: ${errorMessage}`,
          troubleshootingSteps: [
            'Verify MySQL server is running',
            'Check DATABASE_HOST and DATABASE_PORT environment variables',
            'Verify network connectivity to the MySQL server',
            'Check firewall settings and port accessibility',
            'Ensure MySQL is listening on the specified port'
          ],
          isRetryable: true
        };

      case 'ENOTFOUND':
        return {
          type: DatabaseErrorType.NETWORK_ERROR,
          originalError: error,
          userMessage: 'Cannot resolve the MySQL server hostname.',
          technicalMessage: `MySQL hostname resolution failed: ${errorMessage}`,
          troubleshootingSteps: [
            'Verify DATABASE_HOST environment variable is correct',
            'Check DNS resolution for the hostname',
            'Try using an IP address instead of hostname',
            'Verify network connectivity'
          ],
          isRetryable: true
        };

      case 'ETIMEDOUT':
        return {
          type: DatabaseErrorType.NETWORK_ERROR,
          originalError: error,
          userMessage: 'Connection to MySQL server timed out.',
          technicalMessage: `MySQL connection timeout: ${errorMessage}`,
          troubleshootingSteps: [
            'Check network connectivity to MySQL server',
            'Verify firewall settings allow MySQL connections',
            'Increase connection timeout if needed',
            'Check if MySQL server is overloaded'
          ],
          isRetryable: true
        };

      case 'ER_TOO_MANY_CONNECTIONS':
        return {
          type: DatabaseErrorType.CONNECTION_FAILED,
          originalError: error,
          userMessage: 'MySQL server has too many connections.',
          technicalMessage: `MySQL connection limit exceeded: ${errorMessage}`,
          troubleshootingSteps: [
            'Wait for existing connections to close',
            'Increase MySQL max_connections setting',
            'Optimize application connection pooling',
            'Check for connection leaks in the application'
          ],
          isRetryable: true
        };

      default:
        return {
          type: DatabaseErrorType.UNKNOWN_ERROR,
          originalError: error,
          userMessage: 'An unexpected MySQL database error occurred.',
          technicalMessage: `MySQL error (${errorCode}): ${errorMessage}`,
          troubleshootingSteps: [
            'Check MySQL server logs for more details',
            'Verify all MySQL environment variables',
            'Ensure MySQL server is properly configured',
            'Contact your database administrator if the problem persists'
          ],
          isRetryable: false
        };
    }
  }

  /**
   * Handles PostgreSQL-specific errors
   */
  private handlePostgreSQLError(error: any): DatabaseError {
    if (!error) {
      return this.createUnknownError(new Error('Null or undefined PostgreSQL error'));
    }
    
    const errorCode = error.code || error.errno;
    const errorMessage = error.message || 'Unknown PostgreSQL error';

    // Check for SSL-related errors first
    if (this.isSSLError(error)) {
      return this.handlePostgreSQLSSLError(error);
    }

    switch (errorCode) {
      case '28P01':
        return {
          type: DatabaseErrorType.AUTHENTICATION_FAILED,
          originalError: error,
          userMessage: 'PostgreSQL authentication failed. Please check your username and password.',
          technicalMessage: `PostgreSQL authentication error: ${errorMessage}`,
          troubleshootingSteps: [
            'Verify DATABASE_USER environment variable is correct',
            'Verify DATABASE_PASSWORD environment variable is correct',
            'Ensure the PostgreSQL user has proper permissions',
            'Check if the PostgreSQL user account is not locked or expired',
            'For Supabase: Verify you are using the correct project password',
            'For cloud providers: Ensure SSL is properly configured'
          ],
          isRetryable: false
        };

      case '28000':
        return {
          type: DatabaseErrorType.AUTHENTICATION_FAILED,
          originalError: error,
          userMessage: 'PostgreSQL authentication method not supported or invalid.',
          technicalMessage: `PostgreSQL invalid authorization specification: ${errorMessage}`,
          troubleshootingSteps: [
            'Check if the authentication method is supported',
            'Verify SSL configuration for cloud providers',
            'For Supabase: Ensure SSL is enabled in production',
            'Check PostgreSQL server authentication settings'
          ],
          isRetryable: false
        };

      case '3D000':
        return {
          type: DatabaseErrorType.DATABASE_NOT_FOUND,
          originalError: error,
          userMessage: 'The specified database does not exist on the PostgreSQL server.',
          technicalMessage: `PostgreSQL database not found: ${errorMessage}`,
          troubleshootingSteps: [
            'Verify DATABASE_NAME environment variable is correct',
            'Create the database on the PostgreSQL server',
            'Check if you have permission to access the database',
            'Verify the database name spelling and case sensitivity',
            'For Supabase: Use "postgres" as the database name'
          ],
          isRetryable: false
        };

      case 'ECONNREFUSED':
        return {
          type: DatabaseErrorType.CONNECTION_FAILED,
          originalError: error,
          userMessage: 'Cannot connect to the PostgreSQL server. The server may be down or unreachable.',
          technicalMessage: `PostgreSQL connection refused: ${errorMessage}`,
          troubleshootingSteps: [
            'Verify PostgreSQL server is running',
            'Check DATABASE_HOST and DATABASE_PORT environment variables',
            'Verify network connectivity to the PostgreSQL server',
            'Check firewall settings and port accessibility',
            'Ensure PostgreSQL is listening on the specified port (default: 5432)',
            'For Supabase: Verify the project URL is correct (db.xxx.supabase.co)',
            'For cloud providers: Ensure SSL is enabled'
          ],
          isRetryable: true
        };

      case 'ENOTFOUND':
        return {
          type: DatabaseErrorType.NETWORK_ERROR,
          originalError: error,
          userMessage: 'Cannot resolve the PostgreSQL server hostname.',
          technicalMessage: `PostgreSQL hostname resolution failed: ${errorMessage}`,
          troubleshootingSteps: [
            'Verify DATABASE_HOST environment variable is correct',
            'Check DNS resolution for the hostname',
            'For Supabase: Ensure the project URL format is correct (db.xxx.supabase.co)',
            'Try using an IP address instead of hostname',
            'Verify network connectivity'
          ],
          isRetryable: true
        };

      case 'ETIMEDOUT':
        return {
          type: DatabaseErrorType.NETWORK_ERROR,
          originalError: error,
          userMessage: 'Connection to PostgreSQL server timed out.',
          technicalMessage: `PostgreSQL connection timeout: ${errorMessage}`,
          troubleshootingSteps: [
            'Check network connectivity to PostgreSQL server',
            'Verify firewall settings allow PostgreSQL connections',
            'Increase connection timeout if needed',
            'Check if PostgreSQL server is overloaded',
            'For cloud providers: Verify SSL handshake is completing',
            'For Supabase: Check project status and region connectivity'
          ],
          isRetryable: true
        };

      case '53300':
        return {
          type: DatabaseErrorType.CONNECTION_FAILED,
          originalError: error,
          userMessage: 'PostgreSQL server has too many connections.',
          technicalMessage: `PostgreSQL connection limit exceeded: ${errorMessage}`,
          troubleshootingSteps: [
            'Wait for existing connections to close',
            'Increase PostgreSQL max_connections setting',
            'Optimize application connection pooling',
            'Check for connection leaks in the application',
            'For Supabase: Consider upgrading to a higher tier for more connections',
            'Use connection pooling services like PgBouncer'
          ],
          isRetryable: true
        };

      case '08006':
        return {
          type: DatabaseErrorType.CONNECTION_FAILED,
          originalError: error,
          userMessage: 'PostgreSQL connection failure during communication.',
          technicalMessage: `PostgreSQL connection failure: ${errorMessage}`,
          troubleshootingSteps: [
            'Check network stability and connectivity',
            'Verify SSL configuration is correct',
            'For cloud providers: Ensure SSL certificates are valid',
            'Check for intermittent network issues',
            'Verify connection parameters are correct'
          ],
          isRetryable: true
        };

      case '08001':
        return {
          type: DatabaseErrorType.CONNECTION_FAILED,
          originalError: error,
          userMessage: 'PostgreSQL server rejected the connection attempt.',
          technicalMessage: `PostgreSQL connection rejected: ${errorMessage}`,
          troubleshootingSteps: [
            'Check if PostgreSQL server is accepting connections',
            'Verify connection limits have not been exceeded',
            'For cloud providers: Check if SSL is required but not configured',
            'Verify authentication credentials are correct',
            'Check PostgreSQL server configuration'
          ],
          isRetryable: true
        };

      default:
        return {
          type: DatabaseErrorType.UNKNOWN_ERROR,
          originalError: error,
          userMessage: 'An unexpected PostgreSQL database error occurred.',
          technicalMessage: `PostgreSQL error (${errorCode}): ${errorMessage}`,
          troubleshootingSteps: [
            'Check PostgreSQL server logs for more details',
            'Verify all PostgreSQL environment variables',
            'Ensure PostgreSQL server is properly configured',
            'For cloud providers: Verify SSL configuration',
            'For Supabase: Check project status and settings',
            'Contact your database administrator if the problem persists'
          ],
          isRetryable: false
        };
    }
  }

  /**
   * Handles SSL-related PostgreSQL errors
   */
  private handlePostgreSQLSSLError(error: any): DatabaseError {
    const errorMessage = error.message || 'Unknown SSL error';
    
    if (errorMessage.includes('self signed certificate') || errorMessage.includes('certificate verify failed')) {
      return {
        type: DatabaseErrorType.CONNECTION_FAILED,
        originalError: error,
        userMessage: 'SSL certificate verification failed for PostgreSQL connection.',
        technicalMessage: `PostgreSQL SSL certificate error: ${errorMessage}`,
        troubleshootingSteps: [
          'For cloud providers: Use SSL mode "require" instead of "verify-full"',
          'For Supabase: SSL is automatically configured, ensure rejectUnauthorized is false',
          'Check if you need to provide custom SSL certificates',
          'Verify the server certificate is trusted',
          'For development: Consider using SSL mode "prefer" or "require"'
        ],
        isRetryable: false
      };
    }

    if (errorMessage.includes('no pg_hba.conf entry')) {
      return {
        type: DatabaseErrorType.AUTHENTICATION_FAILED,
        originalError: error,
        userMessage: 'PostgreSQL server rejected the connection due to authentication configuration.',
        technicalMessage: `PostgreSQL pg_hba.conf error: ${errorMessage}`,
        troubleshootingSteps: [
          'Check PostgreSQL server pg_hba.conf configuration',
          'Verify the connection method (SSL/non-SSL) is allowed',
          'For cloud providers: Ensure you are connecting with SSL enabled',
          'For Supabase: SSL connections are required, verify SSL is configured',
          'Check if your IP address is allowed to connect'
        ],
        isRetryable: false
      };
    }

    if (errorMessage.toLowerCase().includes('sslmode')) {
      return {
        type: DatabaseErrorType.CONNECTION_FAILED,
        originalError: error,
        userMessage: 'SSL/TLS configuration error when connecting to PostgreSQL.',
        technicalMessage: `PostgreSQL SSL configuration error: ${errorMessage}`,
        troubleshootingSteps: [
          'Verify SSL configuration in database connection settings',
          'For cloud providers like Supabase: Ensure SSL is enabled',
          'Check SSL mode configuration (require, prefer, verify-full)',
          'Verify SSL certificates and authentication',
          'Check network connectivity and firewall settings'
        ],
        isRetryable: false
      };
    }

    // Generic SSL/TLS error
    return {
      type: DatabaseErrorType.CONNECTION_FAILED,
      originalError: error,
      userMessage: 'SSL/TLS connection error when connecting to PostgreSQL server.',
      technicalMessage: `PostgreSQL SSL error: ${errorMessage}`,
      troubleshootingSteps: [
        'Verify SSL is properly configured in the database connection',
        'For Supabase: Ensure SSL is enabled (required for all connections)',
        'Check if SSL certificates are valid and not expired',
        'Verify the SSL mode is appropriate for your environment',
        'For production: Use SSL mode "require" or "verify-full"',
        'For development: You may use "prefer" or "require"',
        'Check if the server supports the SSL/TLS version being used'
      ],
      isRetryable: false
    };
  }

  /**
   * Determines if an error is SSL-related
   */
  private isSSLError(error: any): boolean {
    const errorMessage = (error.message || '').toLowerCase();
    const sslKeywords = [
      'ssl', 'tls', 'certificate', 'handshake', 'cipher', 'protocol',
      'self signed', 'verify failed', 'pg_hba.conf', 'sslmode'
    ];
    
    return sslKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Handles SQLite-specific errors
   */
  private handleSQLiteError(error: any): DatabaseError {
    if (!error) {
      return this.createUnknownError(new Error('Null or undefined SQLite error'));
    }
    
    const errorCode = error.code || error.errno;
    const errorMessage = error.message || 'Unknown SQLite error';

    switch (errorCode) {
      case 'SQLITE_CANTOPEN':
        return {
          type: DatabaseErrorType.FILE_SYSTEM_ERROR,
          originalError: error,
          userMessage: 'Cannot open the SQLite database file. Check file path and permissions.',
          technicalMessage: `SQLite cannot open database: ${errorMessage}`,
          troubleshootingSteps: [
            'Verify DATABASE_PATH environment variable is correct',
            'Check if the database directory exists',
            'Verify read/write permissions on the database file and directory',
            'Ensure sufficient disk space is available',
            'Check if the file is locked by another process'
          ],
          isRetryable: false
        };

      case 'SQLITE_READONLY':
        return {
          type: DatabaseErrorType.PERMISSION_DENIED,
          originalError: error,
          userMessage: 'The SQLite database file is read-only.',
          technicalMessage: `SQLite database is read-only: ${errorMessage}`,
          troubleshootingSteps: [
            'Check file permissions on the database file',
            'Verify write permissions on the database directory',
            'Ensure the file is not marked as read-only',
            'Check if the file system is mounted read-only'
          ],
          isRetryable: false
        };

      case 'SQLITE_IOERR':
        return {
          type: DatabaseErrorType.FILE_SYSTEM_ERROR,
          originalError: error,
          userMessage: 'SQLite encountered an I/O error while accessing the database.',
          technicalMessage: `SQLite I/O error: ${errorMessage}`,
          troubleshootingSteps: [
            'Check available disk space',
            'Verify file system integrity',
            'Check for hardware issues',
            'Ensure the database file is not corrupted',
            'Try moving the database to a different location'
          ],
          isRetryable: true
        };

      case 'SQLITE_CORRUPT':
        return {
          type: DatabaseErrorType.FILE_SYSTEM_ERROR,
          originalError: error,
          userMessage: 'The SQLite database file appears to be corrupted.',
          technicalMessage: `SQLite database corruption: ${errorMessage}`,
          troubleshootingSteps: [
            'Restore the database from a backup if available',
            'Try using SQLite recovery tools',
            'Delete the corrupted database file to create a new one',
            'Check for hardware or file system issues'
          ],
          isRetryable: false
        };

      case 'ENOENT':
        return {
          type: DatabaseErrorType.FILE_SYSTEM_ERROR,
          originalError: error,
          userMessage: 'The SQLite database directory or file does not exist.',
          technicalMessage: `SQLite file not found: ${errorMessage}`,
          troubleshootingSteps: [
            'Verify DATABASE_PATH environment variable is correct',
            'Create the database directory if it doesn\'t exist',
            'Check file path spelling and case sensitivity',
            'Ensure the application has permission to create files in the directory'
          ],
          isRetryable: false
        };

      case 'EACCES':
        return {
          type: DatabaseErrorType.PERMISSION_DENIED,
          originalError: error,
          userMessage: 'Permission denied when accessing the SQLite database.',
          technicalMessage: `SQLite permission denied: ${errorMessage}`,
          troubleshootingSteps: [
            'Check file and directory permissions',
            'Ensure the application user has read/write access',
            'Verify the database directory is writable',
            'Check if SELinux or similar security policies are blocking access'
          ],
          isRetryable: false
        };

      case 'ENOSPC':
        return {
          type: DatabaseErrorType.FILE_SYSTEM_ERROR,
          originalError: error,
          userMessage: 'No space left on device for SQLite database operations.',
          technicalMessage: `SQLite no space left: ${errorMessage}`,
          troubleshootingSteps: [
            'Free up disk space on the device',
            'Move the database to a location with more space',
            'Clean up temporary files and logs',
            'Consider using database compression or archiving old data'
          ],
          isRetryable: true
        };

      default:
        return {
          type: DatabaseErrorType.UNKNOWN_ERROR,
          originalError: error,
          userMessage: 'An unexpected SQLite database error occurred.',
          technicalMessage: `SQLite error (${errorCode}): ${errorMessage}`,
          troubleshootingSteps: [
            'Check SQLite database file integrity',
            'Verify DATABASE_PATH environment variable',
            'Ensure proper file system permissions',
            'Check application logs for more details'
          ],
          isRetryable: false
        };
    }
  }

  /**
   * Creates an unknown error response
   */
  private createUnknownError(error: any): DatabaseError {
    return {
      type: DatabaseErrorType.UNKNOWN_ERROR,
      originalError: error,
      userMessage: 'An unexpected database error occurred.',
      technicalMessage: error.message || 'Unknown database error',
      troubleshootingSteps: [
        'Check application logs for more details',
        'Verify database configuration',
        'Ensure database server is accessible',
        'Contact technical support if the problem persists'
      ],
      isRetryable: false
    };
  }

  /**
   * Formats error message for user display
   */
  formatUserErrorMessage(dbError: DatabaseError): string {
    let message = `Database Error: ${dbError.userMessage}\n\n`;
    message += `Technical Details: ${dbError.technicalMessage}\n\n`;
    message += `Troubleshooting Steps:\n`;
    dbError.troubleshootingSteps.forEach((step, index) => {
      message += `  ${index + 1}. ${step}\n`;
    });
    
    if (dbError.isRetryable) {
      message += `\nThis error may be temporary. You can try again.`;
    }
    
    return message;
  }

  /**
   * Determines if an error should trigger a retry
   */
  shouldRetry(dbError: DatabaseError, attemptCount: number, maxAttempts: number = 3): boolean {
    return dbError.isRetryable && attemptCount < maxAttempts;
  }
}