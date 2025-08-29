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
  });
});