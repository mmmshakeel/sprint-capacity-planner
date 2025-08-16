import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';
import { sprintApi, teamMemberApi } from '../services/api';
import { Sprint } from '../types';
import { Button, Card, CardContent, Icon } from '../ui';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedTeam } = useTeam();
  const [metrics, setMetrics] = useState({
    totalSprints: 0,
    activeMembers: 0,
    avgVelocity: 0,
    currentSprint: null as Sprint | null,
  });
  const [recentSprints, setRecentSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      setError(null);

      const [sprintsResponse, teamMembers] = await Promise.all([
        sprintApi.getAllSprints(1, 50, selectedTeam.id),
        teamMemberApi.getAllTeamMembers(selectedTeam.id),
      ]);

      const sprints = sprintsResponse.sprints;
      const completedSprints = sprints.filter(s => s.completedVelocity > 0);
      const avgVelocity = completedSprints.length > 0
        ? Math.round(completedSprints.reduce((sum, s) => sum + s.completedVelocity, 0) / completedSprints.length)
        : 0;

      const now = new Date();
      const currentSprint = sprints.find(s => {
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        return now >= start && now <= end;
      }) || null;

      setMetrics({
        totalSprints: sprints.length,
        activeMembers: teamMembers.filter(m => m.active).length,
        avgVelocity,
        currentSprint,
      });

      setRecentSprints(sprints.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTeam]);

  if (!selectedTeam) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          backgroundColor: 'var(--md-sys-color-surface-variant)',
          color: 'var(--md-sys-color-on-surface-variant)',
          padding: '16px',
          borderRadius: 'var(--md-sys-shape-corner-medium)',
          border: '1px solid var(--md-sys-color-outline-variant)'
        }}>
          Please select a team to view the dashboard.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px'
      }}>
        <div>
            <h1 className="m3-display-small m-0">Dashboard</h1>
            <p className="m3-title-medium text-on-surface-variant mt-4 m-0">
              {selectedTeam.name}
            </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/teams')}
          >
            <Icon name="settings" style={{ marginRight: '8px' }} />
            Manage Teams
          </Button>
          <Button
            variant="filled"
            onClick={() => navigate('/sprints')}
          >
            <Icon name="list" style={{ marginRight: '8px' }} />
            View Sprints
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

      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--md-sys-color-outline-variant)',
            borderTop: '4px solid var(--md-sys-color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-evenly',
            marginBottom: '4rem'
          }}>
            <Card elevation={2} style={{ flex: 1, maxWidth: '250px' }}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <Icon name="assignment" style={{ color: 'var(--md-sys-color-primary)' }} />
                  <h2 className="m3-title-medium text-on-surface m-0" style={{ marginLeft: '8px' }}>
                    Total Sprints
                  </h2>
                </div>
                <div className="m3-display-medium text-primary">
                  {metrics.totalSprints}
                </div>
              </CardContent>
            </Card>
            
            <Card elevation={2} style={{ flex: 1, maxWidth: '250px' }}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <Icon name="group" style={{ color: 'var(--md-sys-color-secondary)' }} />
                  <h2 className="m3-title-medium text-on-surface m-0" style={{ marginLeft: '8px' }}>
                    Active Members
                  </h2>
                </div>
                <div className="m3-display-medium text-secondary">
                  {metrics.activeMembers}
                </div>
              </CardContent>
            </Card>
            
            <Card elevation={2} style={{ flex: 1, maxWidth: '250px' }}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <Icon name="trending_up" style={{ color: 'var(--md-sys-color-tertiary)' }} />
                  <h2 className="m3-title-medium text-on-surface m-0" style={{ marginLeft: '8px' }}>
                    Avg Velocity
                  </h2>
                </div>
                <div className="m3-display-medium text-tertiary">
                  {metrics.avgVelocity || '-'}
                </div>
              </CardContent>
            </Card>
            
            <Card elevation={2} style={{ flex: 1, maxWidth: '250px' }}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <Icon name="timer" style={{ color: 'var(--md-sys-color-error)' }} />
                  <h2 className="m3-title-medium text-on-surface m-0" style={{ marginLeft: '8px' }}>
                    Current Sprint
                  </h2>
                </div>
                <div className="m3-title-large text-error">
                  {metrics.currentSprint ? metrics.currentSprint.name : 'None'}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card elevation={2}>
            <CardContent style={{ textAlign: 'center' }}>
              <h2 className="m3-title-large text-on-surface m-0" style={{ marginBottom: '16px' }}>
                Sprint Velocity Chart
              </h2>
              <p className="m3-body-large text-on-surface-variant" style={{ margin: '0 0 16px 0' }}>
                Charts and visualizations will be implemented here
              </p>
              <div style={{ 
                height: '300px', 
                backgroundColor: 'var(--md-sys-color-surface-variant)', 
                borderRadius: 'var(--md-sys-shape-corner-medium)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginTop: '16px'
              }}>
                <h3 className="m3-title-medium text-on-surface-variant m-0">
                  Chart Placeholder
                </h3>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
