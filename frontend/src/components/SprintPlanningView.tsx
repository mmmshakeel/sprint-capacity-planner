import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ArrowBack, Calculate, Save } from '@mui/icons-material';
import { Sprint, TeamMember, CreateSprintDto, UpdateSprintDto } from '../types';
import { sprintApi, teamMemberApi } from '../services/api';

const SprintPlanningView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewSprint = id === 'new';

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Form state
  const [sprintName, setSprintName] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [completedVelocity, setCompletedVelocity] = useState(0);
  const [teamMemberCapacities, setTeamMemberCapacities] = useState<Record<number, number>>({});

  // Calculation results
  const [workingDays, setWorkingDays] = useState<number | null>(null);
  const [projectedVelocity, setProjectedVelocity] = useState<number | null>(null);
  const [averageStoryCompletion, setAverageStoryCompletion] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch team members
      const membersData = await teamMemberApi.getAllTeamMembers();
      setTeamMembers(membersData.filter(member => member.active));

      if (!isNewSprint) {
        // Fetch sprint data
        const sprintData = await sprintApi.getSprintById(Number(id));
        setSprint(sprintData);
        setSprintName(sprintData.name);
        setStartDate(new Date(sprintData.startDate));
        setEndDate(new Date(sprintData.endDate));
        setCompletedVelocity(sprintData.completedVelocity);

        // Set team member capacities
        const capacities: Record<number, number> = {};
        sprintData.teamMemberCapacities?.forEach(capacity => {
          capacities[capacity.teamMemberId] = capacity.capacity;
        });
        setTeamMemberCapacities(capacities);
      } else {
        // Initialize empty capacities for new sprint
        const capacities: Record<number, number> = {};
        membersData.forEach(member => {
          capacities[member.id] = 0;
        });
        setTeamMemberCapacities(capacities);
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingDays = async () => {
    if (!startDate || !endDate) return;

    try {
      const response = await sprintApi.getWorkingDays(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setWorkingDays(response.workingDays);
    } catch (err) {
      console.error('Error calculating working days:', err);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      calculateWorkingDays();
    }
  }, [startDate, endDate]);

  const handleCapacityChange = (memberId: number, capacity: number) => {
    setTeamMemberCapacities(prev => ({
      ...prev,
      [memberId]: capacity
    }));
  };

  const getTotalCapacity = () => {
    return Object.values(teamMemberCapacities).reduce((sum, capacity) => sum + capacity, 0);
  };

  const getSkillSummary = () => {
    const skillSummary: Record<string, number> = {};
    teamMembers.forEach(member => {
      const capacity = teamMemberCapacities[member.id] || 0;
      skillSummary[member.skill] = (skillSummary[member.skill] || 0) + capacity;
    });
    return skillSummary;
  };

  const handleCalculateProjectedVelocity = async () => {
    if (isNewSprint) {
      // For new sprints, we need to save first
      await handleSave();
      return;
    }

    try {
      setCalculating(true);
      const response = await sprintApi.calculateProjectedVelocity(Number(id));
      setProjectedVelocity(response.projectedVelocity);
      setAverageStoryCompletion(response.averageStoryCompletion);
    } catch (err) {
      setError('Failed to calculate projected velocity');
      console.error('Error calculating projected velocity:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!sprintName || !startDate || !endDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const teamMemberCapacitiesArray = Object.entries(teamMemberCapacities)
        .filter(([_, capacity]) => capacity > 0)
        .map(([memberId, capacity]) => ({
          teamMemberId: Number(memberId),
          capacity: Number(capacity)
        }));

      if (isNewSprint) {
        const createDto: CreateSprintDto = {
          name: sprintName,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          teamMemberCapacities: teamMemberCapacitiesArray
        };

        const newSprint = await sprintApi.createSprint(createDto);
        navigate(`/sprints/${newSprint.id}`);
      } else {
        const updateDto: UpdateSprintDto = {
          name: sprintName,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          completedVelocity: completedVelocity
        };

        await sprintApi.updateSprint(Number(id), updateDto);
        
        // After saving, calculate projected velocity
        await handleCalculateProjectedVelocity();
      }
    } catch (err) {
      setError('Failed to save sprint');
      console.error('Error saving sprint:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSave = async () => {
    if (!isNewSprint) {
      try {
        setSaving(true);
        const updateDto: UpdateSprintDto = {
          completedVelocity: completedVelocity
        };
        await sprintApi.updateSprint(Number(id), updateDto);
        setError(null);
      } catch (err) {
        setError('Failed to save completed velocity');
        console.error('Error saving completed velocity:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate('/sprints')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isNewSprint ? 'New Sprint Planning' : `Sprint Planning - ${sprintName}`}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Sprint Details */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sprint Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Sprint Name"
                    value={sprintName}
                    onChange={(e) => setSprintName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Completed Story Points"
                    type="number"
                    value={completedVelocity}
                    onChange={(e) => setCompletedVelocity(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Sprint Summary */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sprint Summary
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Working Days: {workingDays !== null ? workingDays : 'Calculating...'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Capacity: {getTotalCapacity()} days
                </Typography>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Capacity by Skill:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {Object.entries(getSkillSummary()).map(([skill, capacity]) => (
                  <Chip
                    key={skill}
                    label={`${skill}: ${capacity} days`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>

              {projectedVelocity !== null && (
                <Card variant="outlined" sx={{ mt: 2, bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Projected Velocity: {projectedVelocity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Story Completion: {averageStoryCompletion?.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Paper>
          </Grid>

          {/* Team Member Capacities */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Team Member Capacities
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Skill</strong></TableCell>
                      <TableCell><strong>Availability (days)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>
                          <Chip label={member.skill} size="small" />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={teamMemberCapacities[member.id] || 0}
                            onChange={(e) => handleCapacityChange(member.id, Number(e.target.value))}
                            InputProps={{ inputProps: { min: 0, max: 20 } }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              {!isNewSprint && (
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={handleQuickSave}
                  disabled={saving}
                >
                  Quick Save
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Calculate />}
                onClick={isNewSprint ? handleSave : handleCalculateProjectedVelocity}
                disabled={saving || calculating}
                sx={{ borderRadius: 2 }}
              >
                {calculating ? 'Calculating...' : isNewSprint ? 'Save & Calculate' : 'Calculate Projected Velocity'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default SprintPlanningView;