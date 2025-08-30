#!/usr/bin/env node

/**
 * Configuration Validation Script
 * 
 * This script validates the database configuration for the Sprint Capacity Planner.
 * Run this script to check if your environment is properly configured.
 * 
 * Usage: node scripts/check-config.js
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✓ ${description} exists`, colors.green);
  } else {
    log(`✗ ${description} not found at ${filePath}`, colors.red);
  }
  return exists;
}

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!checkFileExists(envPath, '.env file')) {
    log('\n📝 To create .env file:', colors.blue);
    log('   cp env.example .env', colors.blue);
    return null;
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    log(`✗ Error reading .env file: ${error.message}`, colors.red);
    return null;
  }
}

function validateSqliteConfig(envVars) {
  log('\n🔍 Validating SQLite Configuration:', colors.bold);
  
  const dbPath = envVars.DATABASE_PATH || './data/database.sqlite';
  const fullPath = path.resolve(dbPath);
  const dirPath = path.dirname(fullPath);
  
  log(`   Database path: ${dbPath}`);
  
  // Check if directory exists
  if (fs.existsSync(dirPath)) {
    log(`✓ Database directory exists: ${dirPath}`, colors.green);
  } else {
    log(`✗ Database directory missing: ${dirPath}`, colors.red);
    log(`   Create with: mkdir -p ${dirPath}`, colors.blue);
  }
  
  // Check directory permissions
  try {
    fs.accessSync(dirPath, fs.constants.W_OK);
    log(`✓ Directory is writable`, colors.green);
  } catch (error) {
    log(`✗ Directory is not writable`, colors.red);
    log(`   Fix with: chmod 755 ${dirPath}`, colors.blue);
  }
  
  // Check if database file exists
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    log(`✓ Database file exists (${(stats.size / 1024).toFixed(1)} KB)`, colors.green);
  } else {
    log(`ℹ Database file will be created on first run`, colors.yellow);
  }
}

function validateMysqlConfig(envVars) {
  log('\n🔍 Validating MySQL Configuration:', colors.bold);
  
  const requiredVars = ['DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
  let allValid = true;
  
  requiredVars.forEach(varName => {
    if (envVars[varName]) {
      log(`✓ ${varName} is set`, colors.green);
    } else {
      log(`✗ ${varName} is missing`, colors.red);
      allValid = false;
    }
  });
  
  if (!allValid) {
    log('\n📝 Required MySQL environment variables:', colors.blue);
    log('   DATABASE_HOST=localhost', colors.blue);
    log('   DATABASE_PORT=3306', colors.blue);
    log('   DATABASE_USER=your_username', colors.blue);
    log('   DATABASE_PASSWORD=your_password', colors.blue);
    log('   DATABASE_NAME=your_database', colors.blue);
  }
  
  // Test MySQL connection (basic check)
  const host = envVars.DATABASE_HOST;
  const port = envVars.DATABASE_PORT;
  
  if (host && port) {
    log(`\n🔗 MySQL connection details:`, colors.blue);
    log(`   Host: ${host}:${port}`);
    log(`   Database: ${envVars.DATABASE_NAME || 'not set'}`);
    log(`   User: ${envVars.DATABASE_USER || 'not set'}`);
  }
}

function validateCommonConfig(envVars) {
  log('\n🔍 Validating Common Configuration:', colors.bold);
  
  const port = envVars.PORT || '3300';
  const frontendUrl = envVars.FRONTEND_URL || 'http://localhost:3000';
  const nodeEnv = envVars.NODE_ENV || 'development';
  
  log(`   Node Environment: ${nodeEnv}`);
  log(`   Backend Port: ${port}`);
  log(`   Frontend URL: ${frontendUrl}`);
  
  // Check if port is numeric
  if (isNaN(parseInt(port))) {
    log(`✗ PORT must be a number, got: ${port}`, colors.red);
  } else {
    log(`✓ Port configuration valid`, colors.green);
  }
  
  // Validate frontend URL format
  try {
    new URL(frontendUrl);
    log(`✓ Frontend URL format valid`, colors.green);
  } catch (error) {
    log(`✗ Frontend URL format invalid: ${frontendUrl}`, colors.red);
  }
}

function main() {
  log('🔧 Sprint Capacity Planner - Configuration Validator\n', colors.bold);
  
  // Load environment variables
  const envVars = loadEnvFile();
  if (!envVars) {
    process.exit(1);
  }
  
  // Determine database type
  const dbType = envVars.DATABASE_TYPE || 'mysql';
  log(`\n📊 Database Type: ${dbType}`, colors.bold);
  
  // Validate based on database type
  if (dbType === 'sqlite') {
    validateSqliteConfig(envVars);
  } else if (dbType === 'mysql') {
    validateMysqlConfig(envVars);
  } else {
    log(`✗ Unsupported database type: ${dbType}`, colors.red);
    log('   Supported types: mysql, sqlite', colors.blue);
    process.exit(1);
  }
  
  // Validate common configuration
  validateCommonConfig(envVars);
  
  // Final recommendations
  log('\n💡 Next Steps:', colors.bold);
  if (dbType === 'sqlite') {
    log('   1. Run: npm run start:dev', colors.blue);
    log('   2. Database will be created automatically', colors.blue);
    log('   3. Sample data will be populated on first run', colors.blue);
  } else {
    log('   1. Ensure MySQL server is running', colors.blue);
    log('   2. Create database if it doesn\'t exist', colors.blue);
    log('   3. Run: npm run start:dev', colors.blue);
  }
  
  log('\n🚀 Configuration check complete!', colors.green);
}

// Run the validation
main();