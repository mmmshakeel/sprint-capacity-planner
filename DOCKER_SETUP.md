# Docker Setup Guide for PostgreSQL

This guide provides detailed instructions for setting up PostgreSQL using Docker for local development and testing.

## Quick Start

1. **Start PostgreSQL service:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Use Docker environment configuration:**
   ```bash
   cp .env.docker backend/.env
   ```

3. **Start the application:**
   ```bash
   cd backend
   npm run start:dev
   ```

## Docker Services

### PostgreSQL Service Configuration

The `docker-compose.yml` includes a PostgreSQL service with the following configuration:

```yaml
postgres:
  image: postgres:15
  restart: on-failure
  environment:
    POSTGRES_DB: mydb
    POSTGRES_USER: dbuser
    POSTGRES_PASSWORD: dbpassword
    POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256 --auth-local=scram-sha-256"
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./backend/database/init.sql:/docker-entrypoint-initdb.d/init.sql
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U dbuser -d mydb"]
    interval: 10s
    timeout: 5s
    retries: 5
```

### Key Features

- **PostgreSQL 15**: Latest stable version with modern features
- **Health Check**: Automatic health monitoring with `pg_isready`
- **Persistent Storage**: Data persisted in `postgres_data` volume
- **Initialization Script**: Runs `init.sql` on first startup
- **Security**: Uses SCRAM-SHA-256 authentication
- **Auto-restart**: Restarts on failure for reliability

## Environment Configuration

### .env.docker File

The `.env.docker` file contains pre-configured environment variables for Docker PostgreSQL setup:

```bash
# Database Configuration - PostgreSQL
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=dbuser
DATABASE_PASSWORD=dbpassword
DATABASE_NAME=mydb
DATABASE_SCHEMA=public

# Application Configuration
NODE_ENV=development
PORT=3300
LOG_LEVEL=debug
```

### Using Custom Configuration

1. **Copy and modify the Docker environment file:**
   ```bash
   cp .env.docker backend/.env.custom
   ```

2. **Edit the custom file with your settings:**
   ```bash
   # backend/.env.custom
   DATABASE_TYPE=postgres
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=myuser
   DATABASE_PASSWORD=mypassword
   DATABASE_NAME=mydatabase
   DATABASE_SCHEMA=myschema
   ```

3. **Use the custom environment file:**
   ```bash
   cd backend
   cp .env.custom .env
   npm run start:dev
   ```

## Docker Commands

### Basic Operations

```bash
# Start PostgreSQL service only
docker-compose up -d postgres

# Start all services
docker-compose up -d

# Stop PostgreSQL service
docker-compose stop postgres

# Stop all services
docker-compose down

# View PostgreSQL logs
docker-compose logs postgres

# Follow PostgreSQL logs in real-time
docker-compose logs -f postgres
```

### Database Management

```bash
# Connect to PostgreSQL container
docker-compose exec postgres psql -U dbuser -d mydb

# Run SQL commands directly
docker-compose exec postgres psql -U dbuser -d mydb -c "SELECT version();"

# Backup database
docker-compose exec postgres pg_dump -U dbuser mydb > backup.sql

# Restore database
docker-compose exec -T postgres psql -U dbuser mydb < backup.sql
```

### Container Management

```bash
# Check service status
docker-compose ps postgres

# View container resource usage
docker-compose exec postgres top

# Restart PostgreSQL service
docker-compose restart postgres

# Remove PostgreSQL container and volume (WARNING: Data loss)
docker-compose down -v postgres
```

## Health Monitoring

### Health Check Status

```bash
# Check health status
docker-compose ps postgres

# View detailed health information
docker inspect $(docker-compose ps -q postgres) | grep -A 10 Health
```

### Manual Health Verification

```bash
# Test PostgreSQL connection
docker-compose exec postgres pg_isready -U dbuser -d mydb

# Test from host machine
pg_isready -h localhost -p 5432 -U dbuser -d mydb

# Test application connection
curl http://localhost:3300/api/health
```

## Troubleshooting

### Common Issues

#### PostgreSQL Container Won't Start

```bash
# Check container logs
docker-compose logs postgres

# Common solutions:
# 1. Port already in use
docker-compose down
sudo lsof -i :5432  # Find process using port 5432
kill -9 <PID>       # Kill the process
docker-compose up -d postgres

# 2. Volume permission issues
docker-compose down -v
docker volume prune
docker-compose up -d postgres
```

#### Connection Refused

```bash
# Verify service is running
docker-compose ps postgres

# Check if port is accessible
telnet localhost 5432

# Verify environment variables
docker-compose exec postgres env | grep POSTGRES
```

#### Authentication Failed

```bash
# Check PostgreSQL user configuration
docker-compose exec postgres psql -U postgres -c "\\du"

# Reset user password
docker-compose exec postgres psql -U postgres -c "ALTER USER dbuser PASSWORD 'dbpassword';"
```

#### Database Not Found

```bash
# List available databases
docker-compose exec postgres psql -U dbuser -l

# Create database if missing
docker-compose exec postgres createdb -U dbuser mydb
```

### Performance Issues

```bash
# Monitor PostgreSQL performance
docker-compose exec postgres psql -U dbuser -d mydb -c "
SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit
FROM pg_stat_database 
WHERE datname = 'mydb';
"

# Check active connections
docker-compose exec postgres psql -U dbuser -d mydb -c "
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';
"
```

## Data Persistence

### Volume Management

```bash
# List Docker volumes
docker volume ls | grep postgres

# Inspect volume details
docker volume inspect <volume_name>

# Backup volume data
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume data
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

### Database Backup and Restore

```bash
# Create full database backup
docker-compose exec postgres pg_dumpall -U dbuser > full_backup.sql

# Create single database backup
docker-compose exec postgres pg_dump -U dbuser mydb > mydb_backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U dbuser < full_backup.sql
```

## Security Considerations

### Authentication

- Uses SCRAM-SHA-256 for secure password authentication
- Default credentials are for development only
- Change default passwords for production use

### Network Security

```bash
# Limit PostgreSQL access to localhost only
# In docker-compose.yml:
ports:
  - "127.0.0.1:5432:5432"  # Only accessible from localhost
```

### SSL Configuration

For production environments, enable SSL:

```yaml
postgres:
  environment:
    POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256 --auth-local=scram-sha-256"
  volumes:
    - ./ssl/server.crt:/var/lib/postgresql/server.crt
    - ./ssl/server.key:/var/lib/postgresql/server.key
  command: >
    postgres
    -c ssl=on
    -c ssl_cert_file=/var/lib/postgresql/server.crt
    -c ssl_key_file=/var/lib/postgresql/server.key
```

## Integration with Application

### Development Workflow

1. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Configure application:**
   ```bash
   cp .env.docker backend/.env
   ```

3. **Install dependencies (if not done):**
   ```bash
   cd backend
   npm install
   ```

4. **Start application:**
   ```bash
   npm run start:dev
   ```

5. **Verify connection:**
   ```bash
   curl http://localhost:3300/api/health
   ```

### Testing Workflow

```bash
# Start clean PostgreSQL for testing
docker-compose down postgres
docker volume rm $(docker volume ls -q | grep postgres)
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
docker-compose exec postgres pg_isready -U dbuser -d mydb

# Run application tests
cd backend
npm test
```

## Next Steps

After successful PostgreSQL setup:

1. **Install PostgreSQL dependencies** (Task 2)
2. **Configure database interfaces** (Task 3)
3. **Implement PostgreSQL configuration** (Task 4)
4. **Add environment validation** (Task 5)

For detailed application configuration, see [DATABASE_SETUP.md](DATABASE_SETUP.md).