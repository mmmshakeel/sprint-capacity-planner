import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { TeamMember, Team } from '../types';
import { teamMemberApi, teamApi } from '../services/api';
import { useTeam } from '../contexts/TeamContext';

interface BulkTeamMemberAssignmentProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const BulkTeamMemberAssignment: React.FC<BulkTeamMemberAssignmentProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const { teams } = useTeam();
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const [assignedMembers, setAssignedMembers] = useState<TeamMember[]>([]);
  const [unassignedMembers, setUnassignedMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchAllTeamMembers();
      setSelectedTeamId('');
      setError(null);
    }
  }, [open]);

  const fetchAllTeamMembers = async () => {
    try {
      setLoading(true);
      const members = await teamMemberApi.getAllTeamMembers();
      setAllTeamMembers(members.filter(m => m.active));
      categorizeMembers(members.filter(m => m.active), '');
    } catch (err) {
      setError('Failed to fetch team members');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const categorizeMembers = (members: TeamMember[], targetTeamId: string | number) => {
    const assigned = members.filter(m => m.teamId === Number(targetTeamId) || (targetTeamId === '' && m.teamId));
    const unassigned = members.filter(m => !m.teamId);
    
    setAssignedMembers(assigned);
    setUnassignedMembers(unassigned);
  };

  const handleTeamChange = (teamId: string | number) => {
    const numericTeamId = teamId === '' ? '' : Number(teamId);
    setSelectedTeamId(numericTeamId);
    categorizeMembers(allTeamMembers, numericTeamId);
  };

  const handleAssignToTeam = async (member: TeamMember) => {
    if (!selectedTeamId) return;

    try {
      await teamMemberApi.updateTeamMember(member.id, {
        ...member,
        teamId: Number(selectedTeamId),
      });
      
      const updatedMembers = allTeamMembers.map(m => 
        m.id === member.id ? { ...m, teamId: Number(selectedTeamId) } : m
      );
      setAllTeamMembers(updatedMembers);
      categorizeMembers(updatedMembers, selectedTeamId);
    } catch (err) {
      setError('Failed to assign team member');
      console.error('Error assigning team member:', err);
    }
  };

  const handleRemoveFromTeam = async (member: TeamMember) => {
    try {
      await teamMemberApi.updateTeamMember(member.id, {
        ...member,
        teamId: undefined,
      });
      
      const updatedMembers = allTeamMembers.map(m => 
        m.id === member.id ? { ...m, teamId: undefined } : m
      );
      setAllTeamMembers(updatedMembers);
      categorizeMembers(updatedMembers, selectedTeamId);
    } catch (err) {
      setError('Failed to remove team member');
      console.error('Error removing team member:', err);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Bulk Team Member Assignment
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Target Team</InputLabel>
              <Select
                value={selectedTeamId}
                label="Target Team"
                onChange={(e) => handleTeamChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>Select a team</em>
                </MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedTeamId && (
              <Box>
                {/* Current Team Members */}
                <Typography variant="h6" gutterBottom>
                  Current {selectedTeam?.name} Members ({assignedMembers.length})
                </Typography>
                {assignedMembers.length > 0 ? (
                  <List sx={{ mb: 3, maxHeight: 200, overflow: 'auto' }}>
                    {assignedMembers.map((member) => (
                      <ListItem key={member.id} divider>
                        <ListItemText
                          primary={member.name}
                          secondary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip label={member.skill} size="small" variant="outlined" />
                              {member.teamId !== Number(selectedTeamId) && (
                                <Typography variant="caption" color="text.secondary">
                                  (from {teams.find(t => t.id === member.teamId)?.name || 'Unknown Team'})
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveFromTeam(member)}
                            size="small"
                          >
                            <Close />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    No members currently assigned to this team.
                  </Typography>
                )}

                {/* Unassigned Members */}
                <Typography variant="h6" gutterBottom>
                  Unassigned Members ({unassignedMembers.length})
                </Typography>
                {unassignedMembers.length > 0 ? (
                  <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {unassignedMembers.map((member) => (
                      <ListItem key={member.id} divider>
                        <ListItemText
                          primary={member.name}
                          secondary={<Chip label={member.skill} size="small" variant="outlined" />}
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleAssignToTeam(member)}
                          >
                            Assign
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No unassigned members available.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleComplete}
          variant="contained"
          disabled={loading || submitting}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkTeamMemberAssignment;