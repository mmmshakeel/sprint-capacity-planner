# Database Setup Guide

Quick reference for setting up databases with the Sprint Capacity Planner.

## SQLite Setup (Recommended for Development)

### Prerequisites
- Node.js 18+
- npm 8+

### Setup Steps

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Configure for SQLite (default):**
   ```bash
   # backend/.env
   DATABASE_TYPE=sqlite
   DATABASE_PATH=./data/database.sqlite
   ```

5. **Start the application:**
   ```bash
   npm run start:dev
   ```

### What Happens
- SQLite database file created at `backend/data/database.sqlite`
- Database tables created automatically
- Sample data populated on first run
- Application ready at http://localhost:3300

### File Structure
```
backend/
├── data/
│   └── database.sqlite    # SQLite database file
├── .env                   # Environment configuration
└── ...
```

## MySQL Setup

### Prerequisites
- Docker and Docker Compose
- OR local MySQL server

### Option 1: Using Docker (Recommended)

1. **Start MySQL with Docker:**
   ```bash
   docker-compose up -d mysql
   ```

2. **Configure environment:**
   ```bash
   # backend/.env
   DATABASE_TYPE=mysql
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=dbuser
   DATABASE_PASSWORD=dbpassword
   DATABASE_NAME=mydb
   ```

3. **Start the application:**
   ```bash
   cd backend
   npm run start:dev
   ```

### Option 2: Local MySQL Server

1. **Install MySQL locally** (varies by OS)

2. **Create database and user:**
   ```sql
   CREATE DATABASE sprint_planner;
   CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON sprint_planner.* TO 'app_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Configure environment:**
   ```bash
   # backend/.env
   DATABASE_TYPE=mysql
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=app_user
   DATABASE_PASSWORD=secure_password
   DATABASE_NAME=sprint_planner
   ```

4. **Start the application:**
   ```bash
   cd backend
   npm run start:dev
   ```

## Environment Variables Reference

### Required for SQLite
```bash
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/database.sqlite  # Optional, this is default
```

### Required for MySQL
```bash
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database
```

### Optional (All Database Types)
```bash
NODE_ENV=development
PORT=3300
FRONTEND_URL=http://localhost:3000
```

## Quick Commands

### Switch to SQLite
```bash
# Update backend/.env
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/database.sqlite

# Restart application
npm run start:dev
```

### Switch to MySQL
```bash
# Update backend/.env
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=dbuser
DATABASE_PASSWORD=dbpassword
DATABASE_NAME=mydb

# Start MySQL (if using Docker)
docker-compose up -d mysql

# Restart application
npm run start:dev
```

### Reset SQLite Database
```bash
# Stop application (Ctrl+C)
rm backend/data/database.sqlite
npm run start:dev  # Will recreate with sample data
```

### Check Database Connection
```bash
# Test API health endpoint
curl http://localhost:3300/api/health

# Check application logs for database connection messages
npm run start:dev | grep -i database
```

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| `SQLITE_CANTOPEN` | `mkdir -p backend/data` |
| `ECONNREFUSED` (MySQL) | `docker-compose up -d mysql` |
| `ER_ACCESS_DENIED_ERROR` | Check MySQL credentials in `.env` |
| Port already in use | Change `PORT=3301` in `.env` |
| Environment not loading | Restart app: `npm run start:dev` |
| No sample data | Delete SQLite file and restart |

## Verification Checklist

### SQLite Setup ✓
- [ ] `.env` file exists in `backend/` directory
- [ ] `DATABASE_TYPE=sqlite` in `.env`
- [ ] `backend/data/` directory exists
- [ ] Application starts without errors
- [ ] Database file created at specified path
- [ ] API health endpoint responds: `curl http://localhost:3300/api/health`

### MySQL Setup ✓
- [ ] MySQL server running (Docker or local)
- [ ] Database created in MySQL
- [ ] User has proper permissions
- [ ] `.env` file configured with MySQL settings
- [ ] Application connects without errors
- [ ] API health endpoint responds: `curl http://localhost:3300/api/health`

## Performance Notes

### SQLite
- **Best for**: Development, testing, small datasets
- **Limitations**: Single writer, limited concurrency
- **File size**: Grows with data, no automatic cleanup

### MySQL
- **Best for**: Production, multiple users, large datasets
- **Benefits**: Better concurrency, advanced features, scalability
- **Requirements**: Separate server process, more configuration

## Next Steps

After database setup:
1. Start the frontend: `cd frontend && npm run dev`
2. Access application: http://localhost:3000
3. Explore sample data and features
4. Begin development or customization

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).