import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import { Add, Edit, Delete, Group, Person, SwapHoriz } from '@mui/icons-material';
import { Team, CreateTeamDto, UpdateTeamDto } from '../types';
import { teamApi, teamMemberApi, sprintApi } from '../services/api';
import { useTeam } from '../contexts/TeamContext';
import BulkTeamMemberAssignment from './BulkTeamMemberAssignment';

interface TeamStats {
  memberCount: number;
  sprintCount: number;
}

const TeamManagement: React.FC = () => {
  const { teams, selectedTeam, setSelectedTeam, refreshTeams } = useTeam();
  const [teamStats, setTeamStats] = useState<Record<number, TeamStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkAssignmentOpen, setBulkAssignmentOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  // Form state
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeamStats = async () => {
    try {
      const stats: Record<number, TeamStats> = {};
      
      for (const team of teams) {
        const [members, sprints] = await Promise.all([
          teamMemberApi.getAllTeamMembers(team.id),
          sprintApi.getAllSprints(1, 1000, team.id)
        ]);
        
        stats[team.id] = {
          memberCount: members.filter(m => m.active).length,
          sprintCount: sprints.sprints.length
        };
      }
      
      setTeamStats(stats);
    } catch (err) {
      console.error('Failed to fetch team stats:', err);
    }
  };

  useEffect(() => {
    if (teams.length > 0) {
      fetchTeamStats();
    }
  }, [teams]);

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setTeamName('');
    setTeamDescription('');
    setDialogOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description || '');
    setDialogOpen(true);
  };

  const handleDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setDeleteDialogOpen(true);
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingTeam) {
        const updateDto: UpdateTeamDto = {
          name: teamName.trim(),
          description: teamDescription.trim() || undefined
        };
        await teamApi.updateTeam(editingTeam.id, updateDto);
      } else {
        const createDto: CreateTeamDto = {
          name: teamName.trim(),
          description: teamDescription.trim() || undefined
        };
        await teamApi.createTeam(createDto);
      }

      await refreshTeams();
      setDialogOpen(false);
      fetchTeamStats();
    } catch (err) {
      setError('Failed to save team');
      console.error('Error saving team:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;

    try {
      setSubmitting(true);
      await teamApi.deleteTeam(teamToDelete.id);
      
      if (selectedTeam?.id === teamToDelete.id) {
        const remainingTeams = teams.filter(t => t.id !== teamToDelete.id);
        setSelectedTeam(remainingTeams.length > 0 ? remainingTeams[0] : null);
      }
      
      await refreshTeams();
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
      fetchTeamStats();
    } catch (err) {
      setError('Failed to delete team');
      console.error('Error deleting team:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Team Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={() => setBulkAssignmentOpen(true)}
          >
            Manage Members
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateTeam}
          >
            New Team
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Card 
              variant="outlined"
              sx={{ 
                height: '100%',
                border: selectedTeam?.id === team.id ? 2 : 1,
                borderColor: selectedTeam?.id === team.id ? 'primary.main' : 'divider'
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2">
                    {team.name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEditTeam(team)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteTeam(team)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {team.description && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {team.description}
                  </Typography>
                )}

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    icon={<Person />}
                    label={`${teamStats[team.id]?.memberCount || 0} Members`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<Group />}
                    label={`${teamStats[team.id]?.sprintCount || 0} Sprints`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(team.createdAt).toLocaleDateString()}
                </Typography>

                {selectedTeam?.id === team.id && (
                  <Box mt={2}>
                    <Chip label="Currently Selected" color="primary" size="small" />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Team Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTeam ? 'Edit Team' : 'Create New Team'}
        </DialogTitle>
        <DialogContent>
          <Box>
            <TextField
              fullWidth
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
              autoFocus
            />
            <TextField
              fullWidth
              label="Description (optional)"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveTeam}
            variant="contained"
            disabled={submitting || !teamName.trim()}
          >
            {submitting ? 'Saving...' : editingTeam ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Team</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the team "{teamToDelete?.name}"? 
            This action will deactivate the team but preserve all associated data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Team Member Assignment Dialog */}
      <BulkTeamMemberAssignment
        open={bulkAssignmentOpen}
        onClose={() => setBulkAssignmentOpen(false)}
        onComplete={() => {
          fetchTeamStats();
          setBulkAssignmentOpen(false);
        }}
      />
    </Box>
  );
};

export default TeamManagement;