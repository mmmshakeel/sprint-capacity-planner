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
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { TeamMember } from '../types';
import { teamMemberApi } from '../services/api';

interface TeamMemberAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (teamMemberId: number, capacity: number) => Promise<void>;
  assignedTeamMemberIds: number[];
  title?: string;
}

const TeamMemberAssignmentDialog: React.FC<TeamMemberAssignmentDialogProps> = ({
  open,
  onClose,
  onAssign,
  assignedTeamMemberIds,
  title = 'Assign Team Member'
}) => {
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<number | ''>('');
  const [capacity, setCapacity] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchAllTeamMembers();
      setSelectedTeamMemberId('');
      setCapacity(0);
      setError(null);
    }
  }, [open]);

  const fetchAllTeamMembers = async () => {
    try {
      setLoading(true);
      const members = await teamMemberApi.getAllTeamMembers();
      setAllTeamMembers(members.filter(member => member.active));
    } catch (err) {
      setError('Failed to fetch team members');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTeamMembers = () => {
    return allTeamMembers.filter(member => !assignedTeamMemberIds.includes(member.id));
  };

  const getSelectedTeamMember = () => {
    return allTeamMembers.find(member => member.id === selectedTeamMemberId);
  };

  const handleAssign = async () => {
    if (!selectedTeamMemberId || capacity <= 0) {
      setError('Please select a team member and enter a valid capacity');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onAssign(selectedTeamMemberId as number, capacity);
      handleClose();
    } catch (err) {
      setError('Failed to assign team member');
      console.error('Error assigning team member:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTeamMemberId('');
    setCapacity(0);
    setError(null);
    onClose();
  };

  const availableMembers = getAvailableTeamMembers();
  const selectedMember = getSelectedTeamMember();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
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

            {availableMembers.length === 0 ? (
              <Alert severity="info">
                All active team members are already assigned to this sprint.
              </Alert>
            ) : (
              <Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Team Member</InputLabel>
                  <Select
                    value={selectedTeamMemberId}
                    label="Team Member"
                    onChange={(e) => setSelectedTeamMemberId(e.target.value as number)}
                  >
                    {availableMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography>{member.name}</Typography>
                          <Chip label={member.skill} size="small" variant="outlined" />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Capacity (days)"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0, max: 20, step: 0.5 } }}
                  helperText="Available days for this sprint"
                />

                {selectedMember && (
                  <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Team Member:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedMember.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Skill:</strong> {selectedMember.skill}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || submitting || !selectedTeamMemberId || capacity <= 0 || availableMembers.length === 0}
        >
          {submitting ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMemberAssignmentDialog;