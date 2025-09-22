# Troubleshooting Guide - Sprint Capacity Planner

This guide provides detailed solutions for common issues encountered when setting up and running the Sprint Capacity Planner application.

## Database Configuration Issues

### SQLite Configuration Problems

#### Issue: Database File Cannot Be Created

**Symptoms:**
- Error: `SQLITE_CANTOPEN: unable to open database file`
- Application fails to start
- No database file created in expected location

**Causes:**
- Directory doesn't exist
- Insufficient permissions
- Invalid file path

**Solutions:**

1. **Create the database directory:**
   ```bash
   mkdir -p backend/data
   chmod 755 backend/data
   ```

2. **Check file path in environment:**
   ```bash
   # In backend/.env
   DATABASE_PATH=./data/database.sqlite  # Relative to backend directory
   # OR
   DATABASE_PATH=/absolute/path/to/database.sqlite  # Absolute path
   ```

3. **Verify permissions:**
   ```bash
   # Check current directory permissions
   ls -la backend/
   
   # Fix permissions if needed
   chmod 755 backend/data
   ```

#### Issue: Database File Exists But Empty

**Symptoms:**
- Database file exists but no tables
- Application starts but no sample data
- API endpoints return empty results

**Causes:**
- Database file was created manually
- Previous startup failed during table creation
- Sample data seeding failed

**Solutions:**

1. **Delete and recreate database:**
   ```bash
   rm backend/data/database.sqlite
   npm run start:dev  # Will recreate with sample data
   ```

2. **Check application logs for seeding errors:**
   ```bash
   # Look for data seeding messages in startup logs
   npm run start:dev | grep -i "seed"
   ```

3. **Manually verify database structure:**
   ```bash
   # Install sqlite3 CLI tool
   npm install -g sqlite3
   
   # Check database structure
   sqlite3 backend/data/database.sqlite ".schema"
   ```

### PostgreSQL Configuration Problems

#### Issue: Connection Refused (PostgreSQL)

**Symptoms:**
- Error: `ECONNREFUSED 127.0.0.1:5432`
- Application cannot connect to PostgreSQL
- Docker container not accessible

**Causes:**
- PostgreSQL server not running
- Wrong host/port configuration
- Docker networking issues
- Supabase connection issues

**Solutions:**

1. **Check PostgreSQL container status:**
   ```bash
   docker ps | grep postgres
   docker logs postgres-dev
   ```

2. **Start PostgreSQL container:**
   ```bash
   docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```

3. **Verify PostgreSQL is listening:**
   ```bash
   # Check if port is open
   telnet localhost 5432
   # OR
   nc -zv localhost 5432
   ```

4. **For Supabase connections:**
   ```bash
   # Test Supabase connection
   telnet db.xxx.supabase.co 5432
   # Check Supabase project status in dashboard
   ```

#### Issue: Authentication Failed (PostgreSQL)

**Symptoms:**
- Error: `password authentication failed for user "postgres"`
- Authentication failures
- Wrong credentials

**Causes:**
- Incorrect username/password
- User doesn't exist in PostgreSQL
- Insufficient privileges
- SSL configuration issues with Supabase

**Solutions:**

1. **Verify credentials in environment:**
   ```bash
   # Check backend/.env file
   cat backend/.env | grep DATABASE_
   ```

2. **Connect to PostgreSQL directly:**
   ```bash
   # Using Docker
   docker exec -it postgres-dev psql -U postgres
   
   # Using local PostgreSQL client
   psql -h localhost -p 5432 -U postgres -d postgres
   ```

3. **For Supabase connections:**
   ```bash
   # Use connection string from Supabase dashboard
   psql "postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres"
   ```

4. **Create user if needed:**
   ```sql
   -- Connect as postgres user
   docker exec -it postgres-dev psql -U postgres
   
   -- Create user and grant privileges
   CREATE USER app_user WITH PASSWORD 'secure_password';
   CREATE DATABASE sprint_planner;
   GRANT ALL PRIVILEGES ON DATABASE sprint_planner TO app_user;
   ```

#### Issue: Database Does Not Exist (PostgreSQL)

**Symptoms:**
- Error: `database "your_db" does not exist`
- Database name not found
- Application fails to start

**Causes:**
- Database not created in PostgreSQL
- Wrong database name in configuration
- Database was dropped

**Solutions:**

1. **Create database:**
   ```sql
   -- Connect to PostgreSQL
   docker exec -it postgres-dev psql -U postgres
   
   -- Create database
   CREATE DATABASE sprint_planner;
   ```

2. **Verify database name:**
   ```bash
   # Check environment configuration
   grep DATABASE_NAME backend/.env
   ```

3. **List existing databases:**
   ```sql
   \l  -- In psql
   -- OR
   SELECT datname FROM pg_database;
   ```

#### Issue: SSL Connection Problems (Supabase)

**Symptoms:**
- SSL connection errors
- Certificate verification failures
- Connection timeouts with Supabase

**Causes:**
- SSL not properly configured
- Wrong NODE_ENV setting
- Network/firewall issues

**Solutions:**

1. **Ensure production environment:**
   ```bash
   # In backend/.env
   NODE_ENV=production  # This enables SSL automatically
   ```

2. **Test SSL connection:**
   ```bash
   # Test SSL connection to Supabase
   openssl s_client -connect db.xxx.supabase.co:5432 -starttls postgres
   ```

3. **Check Supabase project status:**
   - Verify project is active in Supabase dashboard
   - Check connection pooling settings
   - Verify SSL is enabled (default for Supabase)

### MySQL Configuration Problems

#### Issue: Connection Refused

**Symptoms:**
- Error: `ECONNREFUSED 127.0.0.1:3306`
- Application cannot connect to MySQL
- Docker container not accessible

**Causes:**
- MySQL server not running
- Wrong host/port configuration
- Docker networking issues

**Solutions:**

1. **Check MySQL container status:**
   ```bash
   docker-compose ps
   docker-compose logs mysql
   ```

2. **Start MySQL container:**
   ```bash
   docker-compose up -d mysql
   ```

3. **Verify MySQL is listening:**
   ```bash
   # Check if port is open
   telnet localhost 3306
   # OR
   nc -zv localhost 3306
   ```

4. **Check Docker network:**
   ```bash
   docker network ls
   docker network inspect sprint-capacity-planner_default
   ```

#### Issue: Access Denied

**Symptoms:**
- Error: `ER_ACCESS_DENIED_ERROR: Access denied for user 'dbuser'@'localhost'`
- Authentication failures
- Wrong credentials

**Causes:**
- Incorrect username/password
- User doesn't exist in MySQL
- Insufficient privileges

**Solutions:**

1. **Verify credentials in environment:**
   ```bash
   # Check backend/.env file
   cat backend/.env | grep DATABASE_
   ```

2. **Connect to MySQL directly:**
   ```bash
   # Using Docker
   docker-compose exec mysql mysql -u dbuser -p
   
   # Using local MySQL client
   mysql -h localhost -P 3306 -u dbuser -p
   ```

3. **Create user if needed:**
   ```sql
   -- Connect as root user
   docker-compose exec mysql mysql -u root -p
   
   -- Create user and grant privileges
   CREATE USER 'dbuser'@'%' IDENTIFIED BY 'dbpassword';
   GRANT ALL PRIVILEGES ON mydb.* TO 'dbuser'@'%';
   FLUSH PRIVILEGES;
   ```

#### Issue: Database Does Not Exist

**Symptoms:**
- Error: `ER_BAD_DB_ERROR: Unknown database 'mydb'`
- Database name not found
- Application fails to start

**Causes:**
- Database not created in MySQL
- Wrong database name in configuration
- Database was dropped

**Solutions:**

1. **Create database:**
   ```sql
   -- Connect to MySQL
   docker-compose exec mysql mysql -u root -p
   
   -- Create database
   CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Verify database name:**
   ```bash
   # Check environment configuration
   grep DATABASE_NAME backend/.env
   ```

3. **List existing databases:**
   ```sql
   SHOW DATABASES;
   ```

## Environment Variable Issues

### Issue: Environment Variables Not Loading

**Symptoms:**
- Application uses default values instead of .env values
- Database connection uses wrong configuration
- Environment-specific settings ignored

**Causes:**
- .env file in wrong location
- .env file format errors
- Application not configured to load .env

**Solutions:**

1. **Verify .env file location:**
   ```bash
   # Should be in backend directory
   ls -la backend/.env
   ```

2. **Check .env file format:**
   ```bash
   # No spaces around equals sign
   # No quotes unless needed
   # No trailing spaces
   
   # Correct format:
   DATABASE_TYPE=sqlite
   DATABASE_PATH=./data/database.sqlite
   
   # Incorrect format:
   DATABASE_TYPE = sqlite  # Spaces around =
   DATABASE_PATH="./data/database.sqlite"  # Unnecessary quotes
   ```

3. **Validate environment loading:**
   ```bash
   # Add debug logging to verify environment loading
   # In backend/src/main.ts, temporarily add:
   console.log('DATABASE_TYPE:', process.env.DATABASE_TYPE);
   console.log('DATABASE_PATH:', process.env.DATABASE_PATH);
   ```

### Issue: Wrong Database Type Selected

**Symptoms:**
- Application connects to MySQL when expecting SQLite
- SQLite file created when expecting MySQL connection
- Configuration mismatch

**Causes:**
- DATABASE_TYPE not set correctly
- Environment variable override
- Case sensitivity issues

**Solutions:**

1. **Check DATABASE_TYPE value:**
   ```bash
   grep DATABASE_TYPE backend/.env
   ```

2. **Verify accepted values:**
   ```bash
   # Valid values (case sensitive):
   DATABASE_TYPE=mysql
   DATABASE_TYPE=sqlite
   ```

3. **Check for environment overrides:**
   ```bash
   # Check if set in shell environment
   echo $DATABASE_TYPE
   
   # Unset if needed
   unset DATABASE_TYPE
   ```

4. **Verify valid values:**
   ```bash
   # Valid values (case sensitive):
   DATABASE_TYPE=mysql
   DATABASE_TYPE=postgresql
   DATABASE_TYPE=sqlite
   ```

## Application Startup Issues

### Issue: Port Already in Use

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::3300`
- Application fails to start
- Port conflict

**Causes:**
- Another application using the same port
- Previous application instance still running
- Port specified in environment

**Solutions:**

1. **Find process using port:**
   ```bash
   # macOS/Linux
   lsof -i :3300
   
   # Kill process if needed
   kill -9 <PID>
   ```

2. **Change port in environment:**
   ```bash
   # In backend/.env
   PORT=3301
   ```

3. **Check for running instances:**
   ```bash
   # Check for node processes
   ps aux | grep node
   
   # Check Docker containers
   docker ps
   ```

### Issue: CORS Errors

**Symptoms:**
- Frontend cannot connect to backend API
- Browser console shows CORS errors
- API requests blocked

**Causes:**
- FRONTEND_URL mismatch
- Wrong frontend port
- CORS configuration issues

**Solutions:**

1. **Verify FRONTEND_URL:**
   ```bash
   # In backend/.env
   FRONTEND_URL=http://localhost:3000
   ```

2. **Check frontend port:**
   ```bash
   # Verify frontend is running on expected port
   cd frontend
   npm run dev
   # Note the port shown in output
   ```

3. **Test API directly:**
   ```bash
   # Test backend API directly
   curl http://localhost:3300/api/health
   ```

## Performance Issues

### Issue: Slow Database Operations

**Symptoms:**
- API responses take several seconds
- Database queries timeout
- Application feels sluggish

**Causes (SQLite):**
- Large database file
- Missing indexes
- SQLite limitations for concurrent access

**Causes (MySQL):**
- Network latency
- Insufficient resources
- Query optimization needed

**Solutions:**

1. **For SQLite (Development):**
   ```bash
   # Check database file size
   ls -lh backend/data/database.sqlite
   
   # Consider switching to MySQL for better performance
   # Update .env:
   DATABASE_TYPE=mysql
   ```

2. **For MySQL:**
   ```bash
   # Check MySQL performance
   docker-compose exec mysql mysql -u root -p -e "SHOW PROCESSLIST;"
   
   # Monitor resource usage
   docker stats
   ```

3. **Enable query logging:**
   ```bash
   # In backend/.env, add:
   # This will show SQL queries in application logs
   DATABASE_LOGGING=true
   ```

### Issue: Memory Usage High

**Symptoms:**
- Application uses excessive memory
- System becomes slow
- Out of memory errors

**Causes:**
- Memory leaks in application
- Large result sets
- Inefficient queries

**Solutions:**

1. **Monitor memory usage:**
   ```bash
   # Check Node.js memory usage
   node --inspect backend/dist/main.js
   
   # Monitor with htop or Activity Monitor
   htop
   ```

2. **Optimize database queries:**
   ```bash
   # Enable query logging to identify slow queries
   # Check for N+1 query problems
   # Add appropriate indexes
   ```

## Development Workflow Issues

### Issue: Changes Not Reflected

**Symptoms:**
- Code changes don't appear in running application
- Old behavior persists after updates
- Build artifacts outdated

**Causes:**
- Development server not restarting
- Build cache issues
- Wrong directory

**Solutions:**

1. **Restart development server:**
   ```bash
   # Backend
   cd backend
   npm run start:dev
   
   # Frontend
   cd frontend
   npm run dev
   ```

2. **Clear build cache:**
   ```bash
   # Backend
   rm -rf backend/dist
   npm run build
   
   # Frontend
   rm -rf frontend/dist
   npm run build
   ```

3. **Verify working directory:**
   ```bash
   pwd  # Should be in project root
   ls   # Should see backend/ and frontend/ directories
   ```

## Getting Help

If you continue to experience issues:

1. **Check application logs:**
   ```bash
   # Backend logs
   npm run start:dev
   
   # Docker logs
   docker-compose logs -f
   ```

2. **Verify system requirements:**
   - Node.js 18+ installed
   - npm 8+ installed
   - Docker and Docker Compose (for MySQL)
   - Sufficient disk space for database files

3. **Create minimal reproduction:**
   - Fresh clone of repository
   - Clean npm install
   - Default environment configuration
   - Document exact steps that cause the issue

4. **Collect diagnostic information:**
   ```bash
   # System information
   node --version
   npm --version
   docker --version
   docker-compose --version
   
   # Project information
   cat backend/package.json | grep version
   ls -la backend/.env
   ```

Remember to remove any sensitive information (passwords, API keys) before sharing diagnostic information.