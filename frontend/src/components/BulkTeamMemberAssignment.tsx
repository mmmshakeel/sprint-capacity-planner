import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, Select, SelectOption, IconButton, Icon, Chip } from '../ui';
import { TeamMember } from '../types';
import { teamMemberApi } from '../services/api';
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
    <Dialog open={open} onClose={onClose} headline="Bulk Team Member Assignment" fullWidth>
      <div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <span className="m3-body-large text-on-surface-variant">Loading…</span>
          </div>
        ) : (
          <div>
            {error && (
              <div style={{
                backgroundColor: 'var(--md-sys-color-error-container)',
                color: 'var(--md-sys-color-on-error-container)',
                padding: '12px 16px',
                borderRadius: 'var(--md-sys-shape-corner-medium)',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label className="m3-body-medium text-on-surface-variant" style={{ display: 'block', marginBottom: '8px' }}>Target Team</label>
              <Select
                value={selectedTeamId === '' ? '' : selectedTeamId}
                onChange={(value) => handleTeamChange(value as string | number)}
                variant="outlined"
                style={{ width: '100%' }}
              >
                <SelectOption value="">Select a team</SelectOption>
                {teams.map((team) => (
                  <SelectOption key={team.id} value={team.id}>{team.name}</SelectOption>
                ))}
              </Select>
            </div>

            {selectedTeamId && (
              <div>
                <h3 className="m3-title-medium" style={{ margin: '16px 0 8px' }}>
                  Current {selectedTeam?.name} Members ({assignedMembers.length})
                </h3>
                {assignedMembers.length > 0 ? (
                  <div style={{
                    marginBottom: '16px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: 'var(--md-sys-shape-corner-medium)'
                  }}>
                    {assignedMembers.map((member, idx) => (
                      <div key={member.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: idx === assignedMembers.length - 1 ? 'none' : '1px solid var(--md-sys-color-outline-variant)'
                      }}>
                        <div>
                          <div className="m3-body-large">{member.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <Chip label={member.skill} size="small" variant="outlined" />
                            {member.teamId !== Number(selectedTeamId) && (
                              <span className="m3-body-small text-on-surface-variant">(from {teams.find(t => t.id === member.teamId)?.name || 'Unknown Team'})</span>
                            )}
                          </div>
                        </div>
                        <IconButton ariaLabel="Remove from team" onClick={() => handleRemoveFromTeam(member)}>
                          <Icon name="close" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="m3-body-medium text-on-surface-variant" style={{ marginBottom: '16px' }}>
                    No members currently assigned to this team.
                  </p>
                )}

                <h3 className="m3-title-medium" style={{ margin: '16px 0 8px' }}>
                  Unassigned Members ({unassignedMembers.length})
                </h3>
                {unassignedMembers.length > 0 ? (
                  <div style={{
                    maxHeight: '200px',
                    overflow: 'auto',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: 'var(--md-sys-shape-corner-medium)'
                  }}>
                    {unassignedMembers.map((member, idx) => (
                      <div key={member.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: idx === unassignedMembers.length - 1 ? 'none' : '1px solid var(--md-sys-color-outline-variant)'
                      }}>
                        <div>
                          <div className="m3-body-large">{member.name}</div>
                          <div style={{ marginTop: '4px' }}>
                            <Chip label={member.skill} size="small" variant="outlined" />
                          </div>
                        </div>
                        <Button variant="outlined" onClick={() => handleAssignToTeam(member)}>
                          Assign
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="m3-body-medium text-on-surface-variant">
                    No unassigned members available.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <DialogActions>
        <Button variant="text" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleComplete} variant="filled" disabled={loading || submitting}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkTeamMemberAssignment;
