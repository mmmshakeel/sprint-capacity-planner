#!/usr/bin/env node

/**
 * Configuration validation script
 * This script can be used to test database configuration without starting the full application
 */

import { createDatabaseConfig, validateDatabaseConfig } from './database.config';

function validateConfiguration(): void {
  console.log('🔍 Validating database configuration...\n');
  
  const dbType = process.env.DATABASE_TYPE || 'mysql';
  console.log(`Database type: ${dbType}`);
  
  try {
    // Validate configuration
    validateDatabaseConfig(dbType);
    console.log('✅ Configuration validation passed');
    
    // Create configuration
    const config = createDatabaseConfig();
    console.log('✅ Configuration created successfully');
    
    // Display configuration summary (without sensitive data)
    console.log('\n📋 Configuration Summary:');
    console.log(`  Type: ${config.type}`);
    console.log(`  Entities: ${config.entities?.length || 0} registered`);
    console.log(`  Synchronize: ${config.synchronize}`);
    console.log(`  Logging: ${Array.isArray(config.logging) ? config.logging.join(', ') : config.logging}`);
    
    if (config.type === 'mysql') {
      console.log(`  Host: ${(config as any).host}`);
      console.log(`  Port: ${(config as any).port}`);
      console.log(`  Database: ${(config as any).database}`);
      console.log(`  SSL: ${(config as any).ssl ? 'enabled' : 'disabled'}`);
    } else if (config.type === 'sqlite') {
      console.log(`  Database file: ${(config as any).database}`);
    }
    
    console.log('\n🎉 Database configuration is valid and ready to use!');
    
  } catch (error) {
    console.error('❌ Configuration validation failed:');
    console.error(`   ${error.message}`);
    console.error('\n💡 Tips:');
    
    if (dbType === 'mysql') {
      console.error('   - Ensure DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME are set');
      console.error('   - Optional: DATABASE_HOST (default: localhost), DATABASE_PORT (default: 3306)');
    } else if (dbType === 'sqlite') {
      console.error('   - Optional: DATABASE_PATH (default: ./data/database.sqlite)');
      console.error('   - Ensure the database directory is writable');
    }
    
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateConfiguration();
}