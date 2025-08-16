import React from 'react';
import { useTeam } from '../contexts/TeamContext';
import { Team } from '../types';
import { Select, SelectOption } from '../ui';

interface TeamSelectorProps {
  variant?: 'outlined' | 'filled';
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

  const handleChange = (value: string | number) => {
    const teamId = Number(value);
    const team = teams.find(t => t.id === teamId) || null;
    setSelectedTeam(team);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid var(--md-sys-color-outline-variant)',
          borderTop: '2px solid var(--md-sys-color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{
          fontSize: 'var(--md-sys-typescale-body-small-size)',
          color: 'var(--md-sys-color-on-surface-variant)'
        }}>
          Loading teams...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minWidth: '200px',
        backgroundColor: 'var(--md-sys-color-error-container)',
        color: 'var(--md-sys-color-on-error-container)',
        padding: '12px',
        borderRadius: 'var(--md-sys-shape-corner-small)'
      }}>
        {error}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div style={{
        minWidth: '200px',
        backgroundColor: 'var(--md-sys-color-surface-variant)',
        color: 'var(--md-sys-color-on-surface-variant)',
        padding: '12px',
        borderRadius: 'var(--md-sys-shape-corner-small)'
      }}>
        No teams found
      </div>
    );
  }

  return (
    <div style={{ minWidth: fullWidth ? '100%' : '150px' }}>
      {showLabel && (
        <label style={{
          display: 'block',
          fontSize: 'var(--md-sys-typescale-body-small-size)',
          color: 'var(--md-sys-color-on-surface-variant)',
          marginBottom: '8px'
        }}>
          Team
        </label>
      )}
      <Select
        variant={variant}
        value={selectedTeam?.id || ''}
        onChange={handleChange}
        label="Select Team"
        style={{ 
          minWidth: '150px',
          width: fullWidth ? '100%' : 'auto'
        }}
      >
        {teams.map((team) => (
          <SelectOption key={team.id} value={team.id}>
            <div slot="headline">{team.name}</div>
            {team.description && (
              <div slot="supporting-text">{team.description}</div>
            )}
          </SelectOption>
        ))}
      </Select>
    </div>
  );
};

export default TeamSelector;