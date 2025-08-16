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
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 'var(--md-sys-typescale-display-small-size)',
            fontWeight: 'var(--md-sys-typescale-display-small-weight)',
            lineHeight: 'var(--md-sys-typescale-display-small-line-height)',
            color: 'var(--md-sys-color-on-surface)'
          }}>
            Dashboard
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: 'var(--md-sys-typescale-body-medium-size)',
            color: 'var(--md-sys-color-on-surface-variant)'
          }}>
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
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Summary Cards */}
            <Card elevation={2}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <Icon name="assignment" style={{ color: 'var(--md-sys-color-primary)' }} />
                  <h2 style={{
                    margin: '0 0 0 8px',
                    fontSize: 'var(--md-sys-typescale-title-medium-size)',
                    fontWeight: 'var(--md-sys-typescale-title-medium-weight)',
                    color: 'var(--md-sys-color-on-surface)'
                  }}>
                    Total Sprints
                  </h2>
                </div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-display-medium-size)',
                  fontWeight: 'var(--md-sys-typescale-display-medium-weight)',
                  color: 'var(--md-sys-color-primary)'
                }}>
                  {metrics.totalSprints}
                </div>
              </CardContent>
            </Card>
            
            <Card elevation={2}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <Icon name="group" style={{ color: 'var(--md-sys-color-secondary)' }} />
                  <h2 style={{
                    margin: '0 0 0 8px',
                    fontSize: 'var(--md-sys-typescale-title-medium-size)',
                    fontWeight: 'var(--md-sys-typescale-title-medium-weight)',
                    color: 'var(--md-sys-color-on-surface)'
                  }}>
                    Active Members
                  </h2>
                </div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-display-medium-size)',
                  fontWeight: 'var(--md-sys-typescale-display-medium-weight)',
                  color: 'var(--md-sys-color-secondary)'
                }}>
                  {metrics.activeMembers}
                </div>
              </CardContent>
            </Card>
            
            <Card elevation={2}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <Icon name="trending_up" style={{ color: 'var(--md-sys-color-tertiary)' }} />
                  <h2 style={{
                    margin: '0 0 0 8px',
                    fontSize: 'var(--md-sys-typescale-title-medium-size)',
                    fontWeight: 'var(--md-sys-typescale-title-medium-weight)',
                    color: 'var(--md-sys-color-on-surface)'
                  }}>
                    Avg Velocity
                  </h2>
                </div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-display-medium-size)',
                  fontWeight: 'var(--md-sys-typescale-display-medium-weight)',
                  color: 'var(--md-sys-color-tertiary)'
                }}>
                  {metrics.avgVelocity || '-'}
                </div>
              </CardContent>
            </Card>
            
            <Card elevation={2}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <Icon name="timer" style={{ color: 'var(--md-sys-color-error)' }} />
                  <h2 style={{
                    margin: '0 0 0 8px',
                    fontSize: 'var(--md-sys-typescale-title-medium-size)',
                    fontWeight: 'var(--md-sys-typescale-title-medium-weight)',
                    color: 'var(--md-sys-color-on-surface)'
                  }}>
                    Current Sprint
                  </h2>
                </div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-title-large-size)',
                  fontWeight: 'var(--md-sys-typescale-title-large-weight)',
                  color: 'var(--md-sys-color-error)'
                }}>
                  {metrics.currentSprint ? metrics.currentSprint.name : 'None'}
                </div>
              </CardContent>
            </Card>
          </div>
            
          {/* Charts Section */}
          <Card elevation={2}>
            <CardContent style={{ textAlign: 'center' }}>
              <h2 style={{
                margin: '0 0 16px 0',
                fontSize: 'var(--md-sys-typescale-title-large-size)',
                fontWeight: 'var(--md-sys-typescale-title-large-weight)',
                color: 'var(--md-sys-color-on-surface)'
              }}>
                Sprint Velocity Chart
              </h2>
              <p style={{
                margin: '0 0 16px 0',
                fontSize: 'var(--md-sys-typescale-body-large-size)',
                color: 'var(--md-sys-color-on-surface-variant)'
              }}>
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
                <h3 style={{
                  margin: 0,
                  fontSize: 'var(--md-sys-typescale-title-medium-size)',
                  color: 'var(--md-sys-color-on-surface-variant)'
                }}>
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