# Configuration Guide - Sprint Capacity Planner

Complete guide for configuring the Sprint Capacity Planner with different database options.

## Overview

The Sprint Capacity Planner supports three database configurations:
- **SQLite** - File-based database, ideal for development
- **MySQL** - Server-based database, recommended for production
- **PostgreSQL** - Advanced server-based database, excellent for production, works seamlessly with Supabase

## Quick Start

### 1. Choose Your Database

| Database | Best For | Setup Complexity | External Dependencies |
|----------|----------|------------------|----------------------|
| SQLite | Development, Testing | Low | None |
| MySQL | Production, Team Development | Medium | MySQL Server |
| PostgreSQL | Production, Supabase Integration | Medium | PostgreSQL Server or Supabase |

### 2. Configuration Files

All configuration is managed through environment variables in the `backend/.env` file:

```bash
# Copy the example configuration
cp backend/env.example backend/.env
```

### 3. Validate Configuration

Use the built-in validation script to check your setup:

```bash
cd backend
npm run check-config
```

## SQLite Configuration

### Environment Variables

```bash
# backend/.env
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/database.sqlite
```

### Features
- ✅ No external server required
- ✅ Automatic database creation
- ✅ Sample data populated on first run
- ✅ Perfect for development and testing
- ⚠️ Single-user access only
- ⚠️ Not recommended for production

### File Structure
```
backend/
├── data/
│   └── database.sqlite    # Created automatically
├── .env                   # Your configuration
└── scripts/
    └── check-config.js    # Validation script
```

## MySQL Configuration

### Environment Variables

```bash
# backend/.env
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database
```

### Setup Options

#### Option 1: Docker (Recommended for Development)
```bash
# Start MySQL container
docker-compose up -d mysql

# Use these credentials in .env:
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=dbuser
DATABASE_PASSWORD=dbpassword
DATABASE_NAME=mydb
```

#### Option 2: Local MySQL Server
```bash
# Install MySQL (varies by OS)
# Create database and user:

mysql -u root -p
CREATE DATABASE sprint_planner;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON sprint_planner.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Option 3: Cloud MySQL (Production)
```bash
# Use your cloud provider's connection details
DATABASE_HOST=your-cloud-host.com
DATABASE_PORT=3306
DATABASE_USER=your_cloud_user
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=your_database
```

## PostgreSQL Configuration

### Environment Variables

```bash
# backend/.env
DATABASE_TYPE=postgresql
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=postgres
```

### Setup Options

#### Option 1: Docker (Recommended for Development)
```bash
# Start PostgreSQL container
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Use these credentials in .env:
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=postgres
```

#### Option 2: Local PostgreSQL Server
```bash
# Install PostgreSQL (varies by OS)
# Create database and user:

psql -U postgres
CREATE DATABASE sprint_planner;
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE sprint_planner TO app_user;
```

#### Option 3: Supabase (Recommended for Production)
```bash
# Get connection details from your Supabase project dashboard
DATABASE_HOST=db.xxx.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-supabase-password
DATABASE_NAME=postgres
```

### Supabase Setup Guide

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Get Database Connection Details:**
   - Go to Settings > Database
   - Copy the connection details:
     - Host: `db.xxx.supabase.co`
     - Port: `5432`
     - Database: `postgres`
     - Username: `postgres`
     - Password: Your project password

3. **Configure Environment:**
   ```bash
   # backend/.env
   DATABASE_TYPE=postgresql
   DATABASE_HOST=db.xxx.supabase.co
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your-supabase-password
   DATABASE_NAME=postgres
   ```

4. **SSL Configuration:**
   - SSL is automatically enabled in production (`NODE_ENV=production`)
   - Supabase requires SSL connections
   - No additional SSL configuration needed

## Environment Variables Reference

### Database Configuration

| Variable | SQLite | MySQL | PostgreSQL | Description | Default |
|----------|--------|-------|------------|-------------|---------|
| `DATABASE_TYPE` | ✅ | ✅ | ✅ | Database type: 'sqlite', 'mysql', or 'postgresql' | `mysql` |
| `DATABASE_PATH` | ✅ | ❌ | ❌ | SQLite file path | `./data/database.sqlite` |
| `DATABASE_HOST` | ❌ | ✅ | ✅ | Database server hostname | `localhost` |
| `DATABASE_PORT` | ❌ | ✅ | ✅ | Database server port | `3306` (MySQL), `5432` (PostgreSQL) |
| `DATABASE_USER` | ❌ | ✅ | ✅ | Database username | - |
| `DATABASE_PASSWORD` | ❌ | ✅ | ✅ | Database password | - |
| `DATABASE_NAME` | ❌ | ✅ | ✅ | Database name | - |

### Application Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Node environment | `development` | No |
| `PORT` | Backend server port | `3300` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | No |

## Configuration Examples

### Development with SQLite
```bash
# backend/.env
NODE_ENV=development
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/database.sqlite
PORT=3300
FRONTEND_URL=http://localhost:3000
```

### Development with MySQL (Docker)
```bash
# backend/.env
NODE_ENV=development
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=dbuser
DATABASE_PASSWORD=dbpassword
DATABASE_NAME=mydb
PORT=3300
FRONTEND_URL=http://localhost:3000
```

### Production with MySQL
```bash
# backend/.env
NODE_ENV=production
DATABASE_TYPE=mysql
DATABASE_HOST=prod-mysql-server.com
DATABASE_PORT=3306
DATABASE_USER=prod_user
DATABASE_PASSWORD=secure_production_password
DATABASE_NAME=sprint_planner_prod
PORT=3300
FRONTEND_URL=https://your-app.com
```

### Development with PostgreSQL
```bash
# backend/.env
NODE_ENV=development
DATABASE_TYPE=postgresql
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=postgres
PORT=3300
FRONTEND_URL=http://localhost:3000
```

### Production with Supabase
```bash
# backend/.env
NODE_ENV=production
DATABASE_TYPE=postgresql
DATABASE_HOST=db.xxx.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-supabase-password
DATABASE_NAME=postgres
PORT=3300
FRONTEND_URL=https://your-app.com
```

## Switching Between Databases

### From MySQL to SQLite

1. **Stop the application** (Ctrl+C)
2. **Update configuration:**
   ```bash
   # In backend/.env
   DATABASE_TYPE=sqlite
   DATABASE_PATH=./data/database.sqlite
   ```
3. **Remove existing SQLite file** (if any):
   ```bash
   rm backend/data/database.sqlite
   ```
4. **Restart application:**
   ```bash
   npm run start:dev
   ```

### From SQLite to MySQL

1. **Start MySQL server** (Docker or local)
2. **Create database** in MySQL
3. **Update configuration:**
   ```bash
   # In backend/.env
   DATABASE_TYPE=mysql
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=your_user
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=your_database
   ```
4. **Restart application:**
   ```bash
   npm run start:dev
   ```

### From SQLite to PostgreSQL

1. **Start PostgreSQL server** (Docker, local, or Supabase)
2. **Create database** in PostgreSQL (if using local)
3. **Update configuration:**
   ```bash
   # In backend/.env
   DATABASE_TYPE=postgresql
   DATABASE_HOST=localhost  # or db.xxx.supabase.co for Supabase
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=postgres
   ```
4. **Restart application:**
   ```bash
   npm run start:dev
   ```

### Between MySQL and PostgreSQL

1. **Update database type and port:**
   ```bash
   # For PostgreSQL
   DATABASE_TYPE=postgresql
   DATABASE_PORT=5432
   
   # For MySQL
   DATABASE_TYPE=mysql
   DATABASE_PORT=3306
   ```
2. **Update other connection details as needed**
3. **Restart application:**
   ```bash
   npm run start:dev
   ```

## Validation and Testing

### Configuration Validation Script

```bash
cd backend
npm run check-config
```

**What it checks:**
- Environment file exists and is readable
- Required variables are set for chosen database type
- File permissions and directory structure (SQLite)
- Configuration format and values

### Manual Testing

#### Test Database Connection
```bash
# Start the application
npm run start:dev

# Check health endpoint
curl http://localhost:3300/api/health

# Look for database connection messages in logs
```

#### Test API Endpoints
```bash
# List teams
curl http://localhost:3300/api/teams

# List sprints
curl http://localhost:3300/api/sprints

# List team members
curl http://localhost:3300/api/team-members
```

## Troubleshooting

### Quick Diagnostics

1. **Run configuration validator:**
   ```bash
   cd backend && npm run check-config
   ```

2. **Check application logs:**
   ```bash
   npm run start:dev | grep -i database
   ```

3. **Verify environment loading:**
   ```bash
   # Add to backend/src/main.ts temporarily:
   console.log('DB Type:', process.env.DATABASE_TYPE);
   console.log('DB Path:', process.env.DATABASE_PATH);
   ```

### Common Issues

| Issue | Database | Quick Fix |
|-------|----------|-----------|
| `SQLITE_CANTOPEN` | SQLite | `mkdir -p backend/data` |
| `ECONNREFUSED` | MySQL | `docker-compose up -d mysql` |
| `ER_ACCESS_DENIED_ERROR` | MySQL | Check credentials in `.env` |
| `ER_BAD_DB_ERROR` | MySQL | Create database in MySQL |
| `ECONNREFUSED` (PostgreSQL) | PostgreSQL | Start PostgreSQL server or check Supabase |
| `password authentication failed` | PostgreSQL | Check PostgreSQL credentials |
| `database does not exist` | PostgreSQL | Create database in PostgreSQL |
| SSL connection errors | PostgreSQL | Check Supabase SSL requirements |
| Port in use | All | Change `PORT` in `.env` |
| CORS errors | All | Check `FRONTEND_URL` in `.env` |

### Getting Help

For detailed troubleshooting:
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for comprehensive solutions
- See [DATABASE_SETUP.md](DATABASE_SETUP.md) for quick setup reference
- Run `npm run check-config` for configuration validation

## Security Best Practices

### Development
- Use SQLite for local development
- Keep `.env` files out of version control
- Use sample data for testing

### Production
- Use MySQL or PostgreSQL for production
- Use strong, unique passwords
- Enable SSL/TLS for database connections
- Restrict database access to application servers
- Regular backups and monitoring
- Consider database encryption for sensitive data

### Environment Management
- Use different `.env` files for different environments
- Never commit `.env` files to version control
- Use environment-specific configuration management
- Validate configuration in CI/CD pipelines

## Performance Considerations

### SQLite
- **Best for:** < 1000 records, single user, development
- **Limitations:** No concurrent writes, limited scalability
- **Optimization:** Use for development only

### MySQL
- **Best for:** Production, multiple users, large datasets
- **Benefits:** Concurrent access, advanced features, scalability
- **Optimization:** Connection pooling, indexing, query optimization

### PostgreSQL
- **Best for:** Production, advanced features, Supabase integration
- **Benefits:** Advanced SQL features, JSON support, excellent performance
- **Optimization:** Built-in connection pooling, advanced indexing, query optimization
- **Supabase:** Managed hosting, automatic backups, real-time features

## Next Steps

After configuration:
1. **Start the backend:** `npm run start:dev`
2. **Start the frontend:** `cd frontend && npm run dev`
3. **Access the application:** http://localhost:3000
4. **Explore sample data** and begin development

For implementation details, see the [main README.md](README.md).