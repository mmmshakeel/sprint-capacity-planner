import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, CircularProgress, Alert } from '@mui/material';
import { TrendingUp, Group, Timer, Assignment, List, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';
import { sprintApi, teamMemberApi } from '../services/api';
import { Sprint } from '../types';
import SprintVelocityChart from './SprintVelocityChart';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedTeam } = useTeam();
  const [metrics, setMetrics] = useState({
    totalSprints: 0,
    activeMembers: 0,
    avgVelocity: 0,
    currentSprint: null as Sprint | null,
  });
  const [recentSprints, setRecentSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      setError(null);

      const [sprintsResponse, teamMembers] = await Promise.all([
        sprintApi.getAllSprints(1, 50, selectedTeam.id),
        teamMemberApi.getAllTeamMembers(selectedTeam.id),
      ]);

      const sprints = sprintsResponse.sprints;
      const completedSprints = sprints.filter(s => s.completedVelocity > 0);
      const avgVelocity = completedSprints.length > 0
        ? Math.round(completedSprints.reduce((sum, s) => sum + s.completedVelocity, 0) / completedSprints.length)
        : 0;

      const now = new Date();
      const currentSprint = sprints.find(s => {
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        return now >= start && now <= end;
      }) || null;

      setMetrics({
        totalSprints: sprints.length,
        activeMembers: teamMembers.filter(m => m.active).length,
        avgVelocity,
        currentSprint,
      });

      setRecentSprints(sprints.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTeam]);

  if (!selectedTeam) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Please select a team to view the dashboard.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {selectedTeam.name}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => navigate('/teams')}
          >
            Manage Teams
          </Button>
          <Button
            variant="contained"
            startIcon={<List />}
            onClick={() => navigate('/sprints')}
          >
            View Sprints
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assignment color="primary" />
                  <Typography variant="h6" component="h2" ml={1}>
                    Total Sprints
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {metrics.totalSprints}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Group color="secondary" />
                  <Typography variant="h6" component="h2" ml={1}>
                    Active Members
                  </Typography>
                </Box>
                <Typography variant="h4" color="secondary">
                  {metrics.activeMembers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp color="success" />
                  <Typography variant="h6" component="h2" ml={1}>
                    Avg Velocity
                  </Typography>
                </Box>
                <Typography variant="h4" color="success">
                  {metrics.avgVelocity || '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Timer color="warning" />
                  <Typography variant="h6" component="h2" ml={1}>
                    Current Sprint
                  </Typography>
                </Box>
                <Typography variant="h4" color="warning">
                  {metrics.currentSprint ? metrics.currentSprint.name : 'None'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
        {/* Charts Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <SprintVelocityChart teamId={selectedTeam.id} />
          </Paper>
        </Grid>
      </Grid>
      )}
    </Box>
  );
};

export default Dashboard;