import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { useTeam } from '../contexts/TeamContext';
import { Team } from '../types';

interface TeamSelectorProps {
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  showLabel?: boolean;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  variant = 'outlined',
  size = 'small',
  fullWidth = false,
  showLabel = false,
}) => {
  const { selectedTeam, teams, loading, error, setSelectedTeam } = useTeam();

  const handleChange = (event: SelectChangeEvent<number>) => {
    const teamId = event.target.value as number;
    const team = teams.find(t => t.id === teamId) || null;
    setSelectedTeam(team);
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Loading teams...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ minWidth: 200 }}>
        {error}
      </Alert>
    );
  }

  if (teams.length === 0) {
    return (
      <Alert severity="info" sx={{ minWidth: 200 }}>
        No teams found
      </Alert>
    );
  }

  return (
    <FormControl variant={variant} size={size} fullWidth={fullWidth}>
      {showLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Team
        </Typography>
      )}
      <Select
        value={selectedTeam?.id || ''}
        onChange={handleChange}
        displayEmpty
        sx={{
          minWidth: 150,
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        {teams.map((team) => (
          <MenuItem key={team.id} value={team.id}>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {team.name}
              </Typography>
              {team.description && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {team.description}
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TeamSelector;