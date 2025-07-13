# Sprint Capacity Planner

A full-stack application for planning and managing sprint capacity in agile teams.

## Project Structure

- `frontend/` - React application built with Vite
- `backend/` - NestJS API server
- `docker-compose.yml` - Docker composition for development environment

## Getting Started

### Development

1. Start the backend and database:
   ```bash
   docker-compose up -d
   ```

2. Start the frontend locally:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3300
- Database: localhost:3306