import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button } from '@mui/material';
import { TrendingUp, Group, Timer, Assignment, List } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<List />}
          onClick={() => navigate('/sprints')}
          sx={{ borderRadius: 2 }}
        >
          View Sprints
        </Button>
      </Box>
      
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
                Coming Soon
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
                Coming Soon
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
                Coming Soon
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
                Coming Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Charts Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Sprint Velocity Chart
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Charts and visualizations will be implemented here
            </Typography>
            <Box 
              sx={{ 
                height: 300, 
                bgcolor: '#f5f5f5', 
                borderRadius: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mt: 2
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Chart Placeholder
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;