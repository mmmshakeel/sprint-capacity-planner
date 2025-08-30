# Sprint Capacity Planner

A full-stack application for planning and managing sprint capacity in agile teams.

## Project Structure

- `frontend/` - React application built with Vite
- `backend/` - NestJS API server
- `docker-compose.yml` - Docker composition for development environment

## Database Support

This application supports two database options:
- **MySQL** - Recommended for production deployments
- **SQLite** - Ideal for local development and testing

📚 **Documentation:**
- [Configuration Guide](CONFIGURATION_GUIDE.md) - Complete setup guide for both databases
- [Database Setup](DATABASE_SETUP.md) - Quick reference for database configuration
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Detailed solutions for common issues

## Getting Started

### Quick Start with SQLite (Recommended for Development)

The easiest way to get started is using SQLite, which requires no external database setup:

1. Clone the repository and navigate to the backend:
   ```bash
   cd backend
   npm install
   ```

2. Copy the environment configuration:
   ```bash
   cp env.example .env
   ```

3. Configure for SQLite (default configuration):
   ```bash
   # In .env file
   DATABASE_TYPE=sqlite
   DATABASE_PATH=./data/database.sqlite
   ```

4. Validate your configuration (optional):
   ```bash
   npm run check-config
   ```

5. Start the backend:
   ```bash
   npm run start:dev
   ```

5. Start the frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3300
- SQLite database: `backend/data/database.sqlite`

### Development with MySQL

If you prefer to use MySQL for development:

1. Start the backend and database using Docker:
   ```bash
   docker-compose up -d
   ```

2. Configure environment for MySQL:
   ```bash
   # In backend/.env file
   DATABASE_TYPE=mysql
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=dbuser
   DATABASE_PASSWORD=dbpassword
   DATABASE_NAME=mydb
   ```

3. Validate your configuration (optional):
   ```bash
   cd backend && npm run check-config
   ```

4. Start the frontend locally:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3300
- MySQL database: localhost:3306

## Environment Variables

### Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_TYPE` | Database type: `mysql` or `sqlite` | `mysql` | No |
| `DATABASE_PATH` | SQLite database file path | `./data/database.sqlite` | SQLite only |
| `DATABASE_HOST` | MySQL server hostname | `localhost` | MySQL only |
| `DATABASE_PORT` | MySQL server port | `3306` | MySQL only |
| `DATABASE_USER` | MySQL username | - | MySQL only |
| `DATABASE_PASSWORD` | MySQL password | - | MySQL only |
| `DATABASE_NAME` | MySQL database name | - | MySQL only |

### Application Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Node environment | `development` | No |
| `PORT` | Backend server port | `3300` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | No |

### AWS Deployment (Optional)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CDK_DEFAULT_ACCOUNT` | AWS account ID for CDK deployment | - | Deployment only |
| `CDK_DEFAULT_REGION` | AWS region for CDK deployment | `us-east-1` | Deployment only |

## Configuration Examples

### SQLite Configuration (Development)

```bash
# backend/.env
NODE_ENV=development
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/database.sqlite
PORT=3300
FRONTEND_URL=http://localhost:3000
```

### MySQL Configuration (Development)

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

### MySQL Configuration (Production)

```bash
# backend/.env
NODE_ENV=production
DATABASE_TYPE=mysql
DATABASE_HOST=your-production-host
DATABASE_PORT=3306
DATABASE_USER=your-production-user
DATABASE_PASSWORD=your-secure-password
DATABASE_NAME=sprint_planner
PORT=3300
FRONTEND_URL=https://your-frontend-domain.com
```

## Sample Data

When using SQLite, the application automatically populates sample data on first startup, including:
- Sample teams (Frontend Team, Backend Team, DevOps Team)
- Sample team members with different roles
- Sample sprints with capacity planning data

This sample data helps you get started quickly and test all application features.

## Troubleshooting

### Database Connection Issues

#### SQLite Issues

**Problem**: `SQLITE_CANTOPEN: unable to open database file`
- **Solution**: Ensure the directory for the database file exists and has write permissions
- **Check**: Verify `DATABASE_PATH` points to a writable location
- **Fix**: Create the directory manually: `mkdir -p backend/data`

**Problem**: `EACCES: permission denied`
- **Solution**: Check file and directory permissions
- **Fix**: `chmod 755 backend/data && chmod 644 backend/data/database.sqlite`

**Problem**: Database file exists but tables are missing
- **Solution**: Delete the database file to trigger recreation with sample data
- **Fix**: `rm backend/data/database.sqlite` and restart the application

#### MySQL Issues

**Problem**: `ER_ACCESS_DENIED_ERROR: Access denied for user`
- **Solution**: Verify MySQL credentials in environment variables
- **Check**: Ensure `DATABASE_USER` and `DATABASE_PASSWORD` are correct
- **Fix**: Update credentials or create the user in MySQL

**Problem**: `ECONNREFUSED: Connection refused`
- **Solution**: Ensure MySQL server is running
- **Check**: `docker-compose ps` to verify MySQL container status
- **Fix**: `docker-compose up -d mysql` to start MySQL container

**Problem**: `ER_BAD_DB_ERROR: Unknown database`
- **Solution**: Create the database or verify `DATABASE_NAME`
- **Fix**: Connect to MySQL and run `CREATE DATABASE your_database_name;`

### Environment Configuration Issues

**Problem**: Application starts but uses wrong database type
- **Solution**: Check environment variable loading
- **Check**: Verify `.env` file exists in `backend/` directory
- **Fix**: Ensure `DATABASE_TYPE` is set correctly in `.env`
- **Validate**: Run `npm run check-config` in the backend directory

**Problem**: Environment variables not loading
- **Solution**: Restart the application after changing `.env`
- **Check**: Verify `.env` file format (no spaces around `=`)
- **Fix**: Use `npm run start:dev` to restart with environment loading

### Performance Issues

**Problem**: Slow database operations with SQLite
- **Solution**: SQLite is optimized for development, not production
- **Recommendation**: Use MySQL for production deployments
- **Alternative**: Consider upgrading to PostgreSQL for better performance

**Problem**: Database locks with SQLite
- **Solution**: Ensure proper connection handling
- **Check**: Look for unclosed database connections in logs
- **Fix**: Restart the application to clear locks

### Development Setup Issues

**Problem**: Port already in use
- **Solution**: Change the port in environment variables
- **Fix**: Update `PORT=3301` in `.env` file

**Problem**: CORS errors from frontend
- **Solution**: Verify `FRONTEND_URL` matches your frontend URL
- **Fix**: Update `FRONTEND_URL=http://localhost:3000` in `.env`

## Migration Between Database Types

### From MySQL to SQLite

1. Stop the application
2. Update `.env` file:
   ```bash
   DATABASE_TYPE=sqlite
   DATABASE_PATH=./data/database.sqlite
   ```
3. Remove existing SQLite file if it exists: `rm backend/data/database.sqlite`
4. Restart the application - sample data will be automatically created

### From SQLite to MySQL

1. Ensure MySQL is running (via Docker or local installation)
2. Create the database in MySQL
3. Update `.env` file with MySQL configuration
4. Restart the application - database schema will be created automatically
5. Note: Data migration requires manual export/import or custom scripts

## Configuration Validation

The application includes a configuration validation script to help verify your setup:

```bash
cd backend
npm run check-config
```

This script will:
- Verify your `.env` file exists and is properly formatted
- Check database-specific configuration requirements
- Validate file permissions and directory structure (SQLite)
- Provide helpful setup instructions and next steps

Run this script whenever you change your database configuration or encounter setup issues.

## Best Practices

### Development
- Use SQLite for local development and testing
- Keep the SQLite database file in `.gitignore`
- Use sample data for consistent development experience

### Production
- Use MySQL or PostgreSQL for production deployments
- Use environment variables for all configuration
- Enable SSL/TLS for database connections
- Regular database backups and monitoring

### Security
- Never commit `.env` files to version control
- Use strong passwords for production databases
- Restrict database access to application servers only
- Consider database encryption for sensitive data