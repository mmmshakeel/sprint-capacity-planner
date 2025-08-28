#!/usr/bin/env node

/**
 * Configuration validation script
 * This script can be used to test database configuration without starting the full application
 */

import { createDatabaseConfig, validateDatabaseConfig } from './database.config';
import { validateEnvironmentVariables, printValidationReport, getConfigurationDefaults } from './env-validation';

function validateConfiguration(): void {
  console.log('🔍 Validating application configuration...\n');
  
  // Comprehensive environment variable validation
  const envValidation = validateEnvironmentVariables();
  printValidationReport(envValidation);
  
  if (!envValidation.isValid) {
    console.error('❌ Environment validation failed. Please fix the errors above before proceeding.\n');
    process.exit(1);
  }
  
  // Database-specific validation and configuration creation
  const dbType = process.env.DATABASE_TYPE || 'mysql';
  console.log(`🗄️  Testing database configuration (type: ${dbType})...\n`);
  
  try {
    // Validate database configuration
    validateDatabaseConfig(dbType);
    console.log('✅ Database configuration validation passed');
    
    // Create configuration
    const config = createDatabaseConfig();
    console.log('✅ Database configuration created successfully');
    
    // Display configuration summary (without sensitive data)
    console.log('\n📋 Database Configuration Summary:');
    console.log(`  Type: ${config.type}`);
    console.log(`  Entities: ${config.entities?.length || 0} registered`);
    console.log(`  Synchronize: ${config.synchronize}`);
    console.log(`  Logging: ${Array.isArray(config.logging) ? config.logging.join(', ') : config.logging}`);
    
    if (config.type === 'mysql') {
      console.log(`  Host: ${(config as any).host}`);
      console.log(`  Port: ${(config as any).port}`);
      console.log(`  Database: ${(config as any).database}`);
      console.log(`  Username: ${(config as any).username ? '***' : 'not set'}`);
      console.log(`  Password: ${(config as any).password ? '***' : 'not set'}`);
      console.log(`  SSL: ${(config as any).ssl ? 'enabled' : 'disabled'}`);
      console.log(`  Retry Attempts: ${(config as any).retryAttempts}`);
    } else if (config.type === 'sqlite') {
      console.log(`  Database file: ${(config as any).database}`);
    }
    
    console.log('\n🎉 All configuration is valid and ready to use!');
    
    // Show helpful next steps
    console.log('\n📝 Next Steps:');
    console.log('   • Start the application with: npm run start:dev');
    console.log('   • Run tests with: npm run test');
    if (config.type === 'sqlite') {
      console.log('   • The SQLite database will be created automatically on first run');
    }
    
  } catch (error) {
    console.error('❌ Database configuration validation failed:');
    console.error(`   ${error.message}`);
    
    console.error('\n💡 Configuration Help:');
    console.error('\n   Environment Variables:');
    const defaults = getConfigurationDefaults();
    Object.entries(defaults).forEach(([key, value]) => {
      const current = process.env[key];
      console.error(`   ${key}: ${current || `not set (default: ${value})`}`);
    });
    
    console.error('\n   Database-specific requirements:');
    if (dbType === 'mysql') {
      console.error('   - DATABASE_USER: MySQL username (required)');
      console.error('   - DATABASE_PASSWORD: MySQL password (required)');
      console.error('   - DATABASE_NAME: MySQL database name (required)');
      console.error('   - DATABASE_HOST: MySQL host (optional, default: localhost)');
      console.error('   - DATABASE_PORT: MySQL port (optional, default: 3306)');
    } else if (dbType === 'sqlite') {
      console.error('   - DATABASE_PATH: SQLite file path (optional, default: ./data/database.sqlite)');
      console.error('   - Ensure the database directory is writable');
    }
    
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateConfiguration();
}