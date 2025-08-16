import React, { useState, useEffect } from 'react';
import { Team, CreateTeamDto, UpdateTeamDto } from '../types';
import { teamApi, teamMemberApi, sprintApi } from '../services/api';
import { useTeam } from '../contexts/TeamContext';
import { Button, IconButton, Dialog, DialogActions, TextField, Card, CardContent, Chip, Icon } from '../ui';
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
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: 'var(--md-sys-typescale-display-small-size)',
          fontWeight: 'var(--md-sys-typescale-display-small-weight)',
          color: 'var(--md-sys-color-on-surface)'
        }}>
          Team Management
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="outlined"
            onClick={() => setBulkAssignmentOpen(true)}
          >
            <Icon name="swap_horiz" style={{ marginRight: '8px' }} />
            Manage Members
          </Button>
          <Button
            variant="filled"
            onClick={handleCreateTeam}
          >
            <Icon name="add" style={{ marginRight: '8px' }} />
            New Team
          </Button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--md-sys-color-error-container)',
          color: 'var(--md-sys-color-on-error-container)',
          padding: '16px',
          borderRadius: 'var(--md-sys-shape-corner-medium)',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        {teams.map((team) => (
          <Card 
            key={team.id}
            elevation={2}
            style={{ 
              height: '100%',
              border: selectedTeam?.id === team.id 
                ? '2px solid var(--md-sys-color-primary)' 
                : '1px solid var(--md-sys-color-outline-variant)'
            }}
          >
            <CardContent>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '16px'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: 'var(--md-sys-typescale-title-large-size)',
                  fontWeight: 'var(--md-sys-typescale-title-large-weight)',
                  color: 'var(--md-sys-color-on-surface)'
                }}>
                  {team.name}
                </h2>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <IconButton onClick={() => handleEditTeam(team)} ariaLabel="Edit team">
                    <Icon name="edit" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTeam(team)} ariaLabel="Delete team">
                    <Icon name="delete" />
                  </IconButton>
                </div>
              </div>

              {team.description && (
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: 'var(--md-sys-typescale-body-medium-size)',
                  color: 'var(--md-sys-color-on-surface-variant)'
                }}>
                  {team.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <Chip
                  icon={<Icon name="person" />}
                  label={`${teamStats[team.id]?.memberCount || 0} Members`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<Icon name="group" />}
                  label={`${teamStats[team.id]?.sprintCount || 0} Sprints`}
                  size="small"
                  variant="outlined"
                />
              </div>

              <p style={{
                margin: 0,
                fontSize: 'var(--md-sys-typescale-body-small-size)',
                color: 'var(--md-sys-color-on-surface-variant)'
              }}>
                Created: {new Date(team.createdAt).toLocaleDateString()}
              </p>

              {selectedTeam?.id === team.id && (
                <div style={{ marginTop: '16px' }}>
                  <Chip label="Currently Selected" color="primary" size="small" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Team Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        headline={editingTeam ? 'Edit Team' : 'Create New Team'}
      >
        <div style={{ padding: '16px 0' }}>
          <TextField
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={{ width: '100%', marginBottom: '16px' }}
          />
          <TextField
            label="Description (optional)"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <DialogActions>
          <Button variant="text" onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveTeam}
            variant="filled"
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
        headline="Delete Team"
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{
            margin: 0,
            fontSize: 'var(--md-sys-typescale-body-large-size)',
            color: 'var(--md-sys-color-on-surface)'
          }}>
            Are you sure you want to delete the team "{teamToDelete?.name}"? 
            This action will deactivate the team but preserve all associated data.
          </p>
        </div>
        <DialogActions>
          <Button variant="text" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="danger"
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
    </div>
  );
};

export default TeamManagement;