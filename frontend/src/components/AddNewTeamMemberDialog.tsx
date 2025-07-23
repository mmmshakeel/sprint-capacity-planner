import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { teamMemberApi } from '../services/api';
import { CreateTeamMemberDto } from '../types';

interface AddNewTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onTeamMemberCreated: () => void;
}

const AddNewTeamMemberDialog: React.FC<AddNewTeamMemberDialogProps> = ({ open, onClose, onTeamMemberCreated }) => {
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name || !skill) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const createDto: CreateTeamMemberDto = { name, skill };
      await teamMemberApi.createTeamMember(createDto);

      onTeamMemberCreated();
      handleClose();
    } catch (err) {
      setError('Failed to create team member');
      console.error('Error creating team member:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSkill('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Team Member</DialogTitle>
      <DialogContent>
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Skill"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={submitting || !name || !skill}
        >
          {submitting ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNewTeamMemberDialog;