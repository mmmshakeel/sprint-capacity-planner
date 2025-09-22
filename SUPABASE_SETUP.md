# Supabase Setup Guide

Complete guide for setting up the Sprint Capacity Planner with Supabase PostgreSQL.

## Overview

Supabase provides a managed PostgreSQL database with additional features like real-time subscriptions, authentication, and automatic backups. This guide shows how to configure the Sprint Capacity Planner to work with Supabase.

## Prerequisites

- Supabase account (free tier available)
- Sprint Capacity Planner application
- Basic understanding of environment variables

## Step-by-Step Setup

### 1. Create Supabase Project

1. **Sign up for Supabase:**
   - Go to [supabase.com](https://supabase.com)
   - Create a free account
   - Verify your email address

2. **Create a new project:**
   - Click "New Project"
   - Choose your organization
   - Enter project name: `sprint-capacity-planner`
   - Enter database password (save this securely)
   - Select region closest to your users
   - Click "Create new project"

3. **Wait for project initialization:**
   - Project setup takes 1-2 minutes
   - You'll see a progress indicator
   - Project is ready when you see the dashboard

### 2. Get Database Connection Details

1. **Navigate to Database Settings:**
   - Go to Settings > Database
   - Scroll to "Connection info" section

2. **Copy connection details:**
   ```
   Host: db.xxx.supabase.co
   Port: 5432
   Database: postgres
   Username: postgres
   Password: [your project password]
   ```

3. **Note the connection string format:**
   ```
   postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
   ```

### 3. Configure Application Environment

1. **Update backend environment file:**
   ```bash
   # backend/.env
   NODE_ENV=production
   DATABASE_TYPE=postgresql
   DATABASE_HOST=db.xxx.supabase.co
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your-supabase-password
   DATABASE_NAME=postgres
   
   # Application settings
   PORT=3300
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **Important environment notes:**
   - Set `NODE_ENV=production` to enable SSL (required by Supabase)
   - Replace `xxx` in hostname with your actual project reference
   - Use the exact password from your Supabase project
   - Keep `DATABASE_NAME=postgres` (default Supabase database)

### 4. Test Connection

1. **Start the application:**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Check for successful connection:**
   - Look for database connection messages in logs
   - No SSL or connection errors should appear
   - Application should start without database errors

3. **Test API endpoints:**
   ```bash
   # Test health endpoint
   curl http://localhost:3300/api/health
   
   # Test database-dependent endpoints
   curl http://localhost:3300/api/teams
   curl http://localhost:3300/api/sprints
   ```

### 5. Verify Database Schema

1. **Check tables in Supabase dashboard:**
   - Go to Table Editor in Supabase dashboard
   - You should see tables: `team`, `sprint`, `team_member`, `team_member_sprint_capacity`
   - Tables are created automatically by TypeORM

2. **Verify sample data:**
   - Check if sample teams and sprints are populated
   - Data should appear in the Table Editor
   - If no data, check application logs for seeding errors

## Environment Variables Reference

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Enables SSL for Supabase |
| `DATABASE_TYPE` | `postgresql` | Database type |
| `DATABASE_HOST` | `db.xxx.supabase.co` | Your Supabase host |
| `DATABASE_PORT` | `5432` | PostgreSQL port |
| `DATABASE_USER` | `postgres` | Default Supabase user |
| `DATABASE_PASSWORD` | `your-password` | Your project password |
| `DATABASE_NAME` | `postgres` | Default database name |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3300` | Backend server port |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS |

## Configuration Examples

### Development with Supabase
```bash
# backend/.env
NODE_ENV=development  # Can use development for testing
DATABASE_TYPE=postgresql
DATABASE_HOST=db.xxx.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-supabase-password
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

## Supabase Features

### Database Management
- **Table Editor**: Visual interface for viewing and editing data
- **SQL Editor**: Run custom SQL queries
- **Database Functions**: Create stored procedures
- **Triggers**: Set up database triggers

### Monitoring
- **Logs**: View database and API logs
- **Metrics**: Monitor database performance
- **Usage**: Track API calls and storage

### Security
- **Row Level Security (RLS)**: Fine-grained access control
- **API Keys**: Secure API access
- **SSL**: Automatic SSL encryption
- **Backups**: Automatic daily backups

## Troubleshooting

### Common Issues

#### Connection Refused
**Problem**: `ECONNREFUSED` error when connecting
**Solutions:**
- Verify Supabase project is active and running
- Check if host URL is correct (db.xxx.supabase.co)
- Ensure port 5432 is accessible from your network
- Check Supabase project status in dashboard

#### Authentication Failed
**Problem**: `password authentication failed`
**Solutions:**
- Verify password matches your Supabase project password
- Check username is `postgres` (default)
- Reset database password in Supabase dashboard if needed
- Ensure no extra spaces in environment variables

#### SSL Connection Issues
**Problem**: SSL certificate or connection errors
**Solutions:**
- Set `NODE_ENV=production` to enable SSL
- Verify Supabase project supports SSL (enabled by default)
- Check network/firewall settings
- Test connection with `psql` client

#### Database Not Found
**Problem**: `database "your_db" does not exist`
**Solutions:**
- Use `DATABASE_NAME=postgres` (default Supabase database)
- Don't create custom databases unless needed
- Check database name in Supabase dashboard

### Testing Connection Manually

1. **Using psql client:**
   ```bash
   # Install PostgreSQL client
   # macOS: brew install postgresql
   # Ubuntu: sudo apt-get install postgresql-client
   
   # Test connection
   psql "postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres"
   ```

2. **Using connection string:**
   ```bash
   # Test with full connection string
   psql "postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres?sslmode=require"
   ```

3. **Check SSL certificate:**
   ```bash
   openssl s_client -connect db.xxx.supabase.co:5432 -starttls postgres
   ```

### Performance Optimization

#### Connection Pooling
- Supabase handles connection pooling automatically
- Default pool size is appropriate for most applications
- Monitor connection usage in Supabase dashboard

#### Query Performance
- Use Supabase SQL Editor to analyze slow queries
- Check query execution plans
- Add indexes for frequently queried columns

#### Resource Limits
- Free tier has usage limits (check Supabase dashboard)
- Monitor database size and API calls
- Upgrade to paid plan if needed

## Migration from Other Databases

### From SQLite to Supabase

1. **Export SQLite data:**
   ```bash
   # Export to SQL format
   sqlite3 backend/data/database.sqlite .dump > data_export.sql
   ```

2. **Import to Supabase:**
   - Use Supabase SQL Editor
   - Paste and run the exported SQL
   - Adjust for PostgreSQL syntax differences if needed

3. **Update configuration:**
   - Change `DATABASE_TYPE` to `postgresql`
   - Add Supabase connection details
   - Restart application

### From MySQL to Supabase

1. **Export MySQL data:**
   ```bash
   mysqldump -u username -p database_name > data_export.sql
   ```

2. **Convert MySQL to PostgreSQL:**
   - Use tools like `mysql2postgresql` or manual conversion
   - Adjust data types and syntax differences

3. **Import to Supabase:**
   - Use Supabase SQL Editor
   - Run converted SQL statements

4. **Update configuration:**
   - Change `DATABASE_TYPE` to `postgresql`
   - Update port from 3306 to 5432
   - Add Supabase connection details

## Best Practices

### Security
- Never commit `.env` files with Supabase credentials
- Use environment variables in production deployments
- Regularly rotate database passwords
- Enable Row Level Security (RLS) for sensitive data

### Performance
- Monitor database usage in Supabase dashboard
- Use appropriate indexes for query performance
- Consider connection pooling for high-traffic applications
- Regular database maintenance and optimization

### Backup and Recovery
- Supabase provides automatic daily backups
- Consider additional backup strategies for critical data
- Test backup restoration procedures
- Document recovery processes

### Development Workflow
- Use separate Supabase projects for development and production
- Keep development and production configurations separate
- Use version control for database schema changes
- Test migrations in development before production

## Next Steps

After successful Supabase setup:

1. **Explore Supabase features:**
   - Real-time subscriptions
   - Authentication system
   - Storage for file uploads
   - Edge functions

2. **Optimize for production:**
   - Set up monitoring and alerts
   - Configure backup strategies
   - Implement security best practices
   - Performance tuning

3. **Scale your application:**
   - Monitor usage and performance
   - Upgrade Supabase plan as needed
   - Implement caching strategies
   - Consider read replicas for high traffic

For additional help, see the main [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide or Supabase documentation.