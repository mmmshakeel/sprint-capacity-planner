import { DatabaseErrorHandlerService, DatabaseErrorType } from '../database-error-handler.service';

describe('DatabaseErrorHandlerService', () => {
  let service: DatabaseErrorHandlerService;

  beforeEach(() => {
    service = new DatabaseErrorHandlerService();
  });

  describe('MySQL Error Handling', () => {
    it('should handle ER_ACCESS_DENIED_ERROR correctly', () => {
      const error = {
        code: 'ER_ACCESS_DENIED_ERROR',
        message: 'Access denied for user'
      };

      const result = service.handleDatabaseError(error, 'mysql');

      expect(result.type).toBe(DatabaseErrorType.AUTHENTICATION_FAILED);
      expect(result.userMessage).toContain('authentication failed');
      expect(result.troubleshootingSteps).toContain('Verify DATABASE_USER environment variable is correct');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle ER_BAD_DB_ERROR correctly', () => {
      const error = {
        code: 'ER_BAD_DB_ERROR',
        message: 'Unknown database'
      };

      const result = service.handleDatabaseError(error, 'mysql');

      expect(result.type).toBe(DatabaseErrorType.DATABASE_NOT_FOUND);
      expect(result.userMessage).toContain('database does not exist');
      expect(result.troubleshootingSteps).toContain('Verify DATABASE_NAME environment variable is correct');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle ECONNREFUSED correctly', () => {
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      };

      const result = service.handleDatabaseError(error, 'mysql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('Cannot connect to the MySQL server');
      expect(result.troubleshootingSteps).toContain('Verify MySQL server is running');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle ENOTFOUND correctly', () => {
      const error = {
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND'
      };

      const result = service.handleDatabaseError(error, 'mysql');

      expect(result.type).toBe(DatabaseErrorType.NETWORK_ERROR);
      expect(result.userMessage).toContain('Cannot resolve the MySQL server hostname');
      expect(result.troubleshootingSteps).toContain('Verify DATABASE_HOST environment variable is correct');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle ETIMEDOUT correctly', () => {
      const error = {
        code: 'ETIMEDOUT',
        message: 'Connection timeout'
      };

      const result = service.handleDatabaseError(error, 'mysql');

      expect(result.type).toBe(DatabaseErrorType.NETWORK_ERROR);
      expect(result.userMessage).toContain('Connection to MySQL server timed out');
      expect(result.troubleshootingSteps).toContain('Check network connectivity to MySQL server');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle ER_TOO_MANY_CONNECTIONS correctly', () => {
      const error = {
        code: 'ER_TOO_MANY_CONNECTIONS',
        message: 'Too many connections'
      };

      const result = service.handleDatabaseError(error, 'mysql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('too many connections');
      expect(result.troubleshootingSteps).toContain('Wait for existing connections to close');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle unknown MySQL errors', () => {
      const error = {
        code: 'ER_UNKNOWN_ERROR',
        message: 'Unknown MySQL error'
      };

      const result = service.handleDatabaseError(error, 'mysql');

      expect(result.type).toBe(DatabaseErrorType.UNKNOWN_ERROR);
      expect(result.userMessage).toContain('unexpected MySQL database error');
      expect(result.troubleshootingSteps).toContain('Check MySQL server logs for more details');
      expect(result.isRetryable).toBe(false);
    });
  });

  describe('SQLite Error Handling', () => {
    it('should handle SQLITE_CANTOPEN correctly', () => {
      const error = {
        code: 'SQLITE_CANTOPEN',
        message: 'unable to open database file'
      };

      const result = service.handleDatabaseError(error, 'sqlite');

      expect(result.type).toBe(DatabaseErrorType.FILE_SYSTEM_ERROR);
      expect(result.userMessage).toContain('Cannot open the SQLite database file');
      expect(result.troubleshootingSteps).toContain('Verify DATABASE_PATH environment variable is correct');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle SQLITE_READONLY correctly', () => {
      const error = {
        code: 'SQLITE_READONLY',
        message: 'attempt to write a readonly database'
      };

      const result = service.handleDatabaseError(error, 'sqlite');

      expect(result.type).toBe(DatabaseErrorType.PERMISSION_DENIED);
      expect(result.userMessage).toContain('database file is read-only');
      expect(result.troubleshootingSteps).toContain('Check file permissions on the database file');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle SQLITE_IOERR correctly', () => {
      const error = {
        code: 'SQLITE_IOERR',
        message: 'disk I/O error'
      };

      const result = service.handleDatabaseError(error, 'sqlite');

      expect(result.type).toBe(DatabaseErrorType.FILE_SYSTEM_ERROR);
      expect(result.userMessage).toContain('I/O error while accessing the database');
      expect(result.troubleshootingSteps).toContain('Check available disk space');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle SQLITE_CORRUPT correctly', () => {
      const error = {
        code: 'SQLITE_CORRUPT',
        message: 'database disk image is malformed'
      };

      const result = service.handleDatabaseError(error, 'sqlite');

      expect(result.type).toBe(DatabaseErrorType.FILE_SYSTEM_ERROR);
      expect(result.userMessage).toContain('database file appears to be corrupted');
      expect(result.troubleshootingSteps).toContain('Restore the database from a backup if available');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle ENOENT correctly', () => {
      const error = {
        code: 'ENOENT',
        message: 'no such file or directory'
      };

      const result = service.handleDatabaseError(error, 'sqlite');

      expect(result.type).toBe(DatabaseErrorType.FILE_SYSTEM_ERROR);
      expect(result.userMessage).toContain('directory or file does not exist');
      expect(result.troubleshootingSteps).toContain('Verify DATABASE_PATH environment variable is correct');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle EACCES correctly', () => {
      const error = {
        code: 'EACCES',
        message: 'permission denied'
      };

      const result = service.handleDatabaseError(error, 'sqlite');

      expect(result.type).toBe(DatabaseErrorType.PERMISSION_DENIED);
      expect(result.userMessage).toContain('Permission denied when accessing the SQLite database');
      expect(result.troubleshootingSteps).toContain('Check file and directory permissions');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle ENOSPC correctly', () => {
      const error = {
        code: 'ENOSPC',
        message: 'no space left on device'
      };

      const result = service.handleDatabaseError(error, 'sqlite');

      expect(result.type).toBe(DatabaseErrorType.FILE_SYSTEM_ERROR);
      expect(result.userMessage).toContain('No space left on device');
      expect(result.troubleshootingSteps).toContain('Free up disk space on the device');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle unknown SQLite errors', () => {
      const error = {
        code: 'SQLITE_UNKNOWN',
        message: 'Unknown SQLite error'
      };

      const result = service.handleDatabaseError(error, 'sqlite');

      expect(result.type).toBe(DatabaseErrorType.UNKNOWN_ERROR);
      expect(result.userMessage).toContain('unexpected SQLite database error');
      expect(result.troubleshootingSteps).toContain('Check SQLite database file integrity');
      expect(result.isRetryable).toBe(false);
    });
  });

  describe('Error Formatting', () => {
    it('should format user error message correctly', () => {
      const error = {
        code: 'ER_ACCESS_DENIED_ERROR',
        message: 'Access denied for user'
      };

      const dbError = service.handleDatabaseError(error, 'mysql');
      const formatted = service.formatUserErrorMessage(dbError);

      expect(formatted).toContain('Database Error:');
      expect(formatted).toContain('Technical Details:');
      expect(formatted).toContain('Troubleshooting Steps:');
      expect(formatted).toContain('1. Verify DATABASE_USER');
    });

    it('should include retry message for retryable errors', () => {
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      };

      const dbError = service.handleDatabaseError(error, 'mysql');
      const formatted = service.formatUserErrorMessage(dbError);

      expect(formatted).toContain('This error may be temporary. You can try again.');
    });

    it('should not include retry message for non-retryable errors', () => {
      const error = {
        code: 'ER_ACCESS_DENIED_ERROR',
        message: 'Access denied for user'
      };

      const dbError = service.handleDatabaseError(error, 'mysql');
      const formatted = service.formatUserErrorMessage(dbError);

      expect(formatted).not.toContain('This error may be temporary');
    });
  });

  describe('Retry Logic', () => {
    it('should recommend retry for retryable errors within attempt limit', () => {
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      };

      const dbError = service.handleDatabaseError(error, 'mysql');
      const shouldRetry = service.shouldRetry(dbError, 1, 3);

      expect(shouldRetry).toBe(true);
    });

    it('should not recommend retry for retryable errors exceeding attempt limit', () => {
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      };

      const dbError = service.handleDatabaseError(error, 'mysql');
      const shouldRetry = service.shouldRetry(dbError, 3, 3);

      expect(shouldRetry).toBe(false);
    });

    it('should not recommend retry for non-retryable errors', () => {
      const error = {
        code: 'ER_ACCESS_DENIED_ERROR',
        message: 'Access denied for user'
      };

      const dbError = service.handleDatabaseError(error, 'mysql');
      const shouldRetry = service.shouldRetry(dbError, 1, 3);

      expect(shouldRetry).toBe(false);
    });
  });

  describe('PostgreSQL Error Handling', () => {
    it('should handle 28P01 authentication error correctly', () => {
      const error = {
        code: '28P01',
        message: 'password authentication failed for user "postgres"'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.AUTHENTICATION_FAILED);
      expect(result.userMessage).toContain('PostgreSQL authentication failed');
      expect(result.troubleshootingSteps).toContain('For Supabase: Verify you are using the correct project password');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle 28000 invalid authorization error correctly', () => {
      const error = {
        code: '28000',
        message: 'invalid authorization specification'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.AUTHENTICATION_FAILED);
      expect(result.userMessage).toContain('authentication method not supported');
      expect(result.troubleshootingSteps).toContain('For Supabase: Ensure SSL is enabled in production');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle 3D000 database not found error correctly', () => {
      const error = {
        code: '3D000',
        message: 'database "nonexistent" does not exist'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.DATABASE_NOT_FOUND);
      expect(result.userMessage).toContain('database does not exist');
      expect(result.troubleshootingSteps).toContain('For Supabase: Use "postgres" as the database name');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle ECONNREFUSED correctly for PostgreSQL', () => {
      const error = {
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:5432'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('Cannot connect to the PostgreSQL server');
      expect(result.troubleshootingSteps).toContain('For Supabase: Verify the project URL is correct (db.xxx.supabase.co)');
      expect(result.troubleshootingSteps).toContain('Ensure PostgreSQL is listening on the specified port (default: 5432)');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle ENOTFOUND correctly for PostgreSQL', () => {
      const error = {
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND db.example.supabase.co'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.NETWORK_ERROR);
      expect(result.userMessage).toContain('Cannot resolve the PostgreSQL server hostname');
      expect(result.troubleshootingSteps).toContain('For Supabase: Ensure the project URL format is correct (db.xxx.supabase.co)');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle ETIMEDOUT correctly for PostgreSQL', () => {
      const error = {
        code: 'ETIMEDOUT',
        message: 'connect ETIMEDOUT'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.NETWORK_ERROR);
      expect(result.userMessage).toContain('Connection to PostgreSQL server timed out');
      expect(result.troubleshootingSteps).toContain('For Supabase: Check project status and region connectivity');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle 53300 too many connections error correctly', () => {
      const error = {
        code: '53300',
        message: 'sorry, too many clients already'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('too many connections');
      expect(result.troubleshootingSteps).toContain('For Supabase: Consider upgrading to a higher tier for more connections');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle 08006 connection failure error correctly', () => {
      const error = {
        code: '08006',
        message: 'connection failure'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('connection failure during communication');
      expect(result.troubleshootingSteps).toContain('For cloud providers: Ensure SSL certificates are valid');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle 08001 connection rejected error correctly', () => {
      const error = {
        code: '08001',
        message: 'server rejected the connection'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('server rejected the connection attempt');
      expect(result.troubleshootingSteps).toContain('For cloud providers: Check if SSL is required but not configured');
      expect(result.isRetryable).toBe(true);
    });

    it('should handle unknown PostgreSQL errors', () => {
      const error = {
        code: 'XX000',
        message: 'Unknown PostgreSQL error'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.UNKNOWN_ERROR);
      expect(result.userMessage).toContain('unexpected PostgreSQL database error');
      expect(result.troubleshootingSteps).toContain('For Supabase: Check project status and settings');
      expect(result.isRetryable).toBe(false);
    });
  });

  describe('PostgreSQL SSL Error Handling', () => {
    it('should handle SSL connection errors', () => {
      const error = {
        message: 'SSL connection error: unable to get local issuer certificate'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('SSL/TLS connection error');
      expect(result.troubleshootingSteps).toContain('For Supabase: Ensure SSL is enabled (required for all connections)');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle self-signed certificate errors', () => {
      const error = {
        message: 'self signed certificate in certificate chain'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('SSL certificate verification failed');
      expect(result.troubleshootingSteps).toContain('For Supabase: SSL is automatically configured, ensure rejectUnauthorized is false');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle certificate verification failed errors', () => {
      const error = {
        message: 'certificate verify failed: unable to verify the first certificate'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('SSL certificate verification failed');
      expect(result.troubleshootingSteps).toContain('For cloud providers: Use SSL mode "require" instead of "verify-full"');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle pg_hba.conf entry errors', () => {
      const error = {
        message: 'no pg_hba.conf entry for host "192.168.1.1", user "postgres", database "postgres", SSL off'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.AUTHENTICATION_FAILED);
      expect(result.userMessage).toContain('server rejected the connection due to authentication configuration');
      expect(result.troubleshootingSteps).toContain('For Supabase: SSL connections are required, verify SSL is configured');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle TLS handshake errors', () => {
      const error = {
        message: 'TLS handshake failed'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('SSL/TLS connection error');
      expect(result.troubleshootingSteps).toContain('Check if the server supports the SSL/TLS version being used');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle generic SSL configuration errors', () => {
      const error = {
        message: 'sslmode value "invalid" invalid when SSL support is not compiled in'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.CONNECTION_FAILED);
      expect(result.userMessage).toContain('SSL/TLS configuration error');
      expect(result.troubleshootingSteps).toContain('For cloud providers like Supabase: Ensure SSL is enabled');
      expect(result.isRetryable).toBe(false);
    });

    it('should identify SSL errors correctly', () => {
      const sslErrors = [
        { message: 'SSL connection error', expectedType: DatabaseErrorType.CONNECTION_FAILED },
        { message: 'TLS handshake failed', expectedType: DatabaseErrorType.CONNECTION_FAILED },
        { message: 'certificate verify failed', expectedType: DatabaseErrorType.CONNECTION_FAILED },
        { message: 'self signed certificate', expectedType: DatabaseErrorType.CONNECTION_FAILED },
        { message: 'no pg_hba.conf entry', expectedType: DatabaseErrorType.AUTHENTICATION_FAILED },
        { message: 'sslmode configuration error', expectedType: DatabaseErrorType.CONNECTION_FAILED }
      ];

      sslErrors.forEach(error => {
        const result = service.handleDatabaseError(error, 'postgresql');
        expect(result.type).toBe(error.expectedType);
        expect(result.userMessage).toMatch(/SSL|TLS|certificate|authentication configuration/);
      });
    });

    it('should not identify non-SSL errors as SSL errors', () => {
      const nonSslError = {
        code: '28P01',
        message: 'password authentication failed for user "postgres"'
      };

      const result = service.handleDatabaseError(nonSslError, 'postgresql');
      expect(result.type).toBe(DatabaseErrorType.AUTHENTICATION_FAILED);
      expect(result.userMessage).toContain('PostgreSQL authentication failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors without code property', () => {
      const error = {
        message: 'Some database error'
      };

      const result = service.handleDatabaseError(error, 'mysql');

      expect(result.type).toBe(DatabaseErrorType.UNKNOWN_ERROR);
      expect(result.userMessage).toContain('unexpected MySQL database error');
    });

    it('should handle errors without message property', () => {
      const error = {
        code: 'ER_ACCESS_DENIED_ERROR'
      };

      const result = service.handleDatabaseError(error, 'mysql');

      expect(result.type).toBe(DatabaseErrorType.AUTHENTICATION_FAILED);
      expect(result.technicalMessage).toContain('Unknown MySQL error');
    });

    it('should handle null or undefined errors', () => {
      const result = service.handleDatabaseError(null, 'mysql');

      expect(result.type).toBe(DatabaseErrorType.UNKNOWN_ERROR);
      expect(result.userMessage).toContain('unexpected database error');
    });

    it('should handle null or undefined PostgreSQL errors', () => {
      const result = service.handleDatabaseError(null, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.UNKNOWN_ERROR);
      expect(result.userMessage).toContain('unexpected database error');
    });

    it('should handle PostgreSQL errors without code property', () => {
      const error = {
        message: 'Some PostgreSQL error'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.UNKNOWN_ERROR);
      expect(result.userMessage).toContain('unexpected PostgreSQL database error');
    });

    it('should handle PostgreSQL errors without message property', () => {
      const error = {
        code: '28P01'
      };

      const result = service.handleDatabaseError(error, 'postgresql');

      expect(result.type).toBe(DatabaseErrorType.AUTHENTICATION_FAILED);
      expect(result.technicalMessage).toContain('Unknown PostgreSQL error');
    });
  });
});