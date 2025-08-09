import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team } from '../types';
import { teamApi } from '../services/api';

interface TeamContextType {
  selectedTeam: Team | null;
  teams: Team[];
  loading: boolean;
  error: string | null;
  setSelectedTeam: (team: Team | null) => void;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

interface TeamProviderProps {
  children: ReactNode;
}

const SELECTED_TEAM_KEY = 'selectedTeam';

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [selectedTeam, setSelectedTeamState] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamsData = await teamApi.getAllTeams();
      setTeams(teamsData);

      const savedTeamId = localStorage.getItem(SELECTED_TEAM_KEY);
      if (savedTeamId && teamsData.length > 0) {
        const savedTeam = teamsData.find(team => team.id === parseInt(savedTeamId));
        if (savedTeam) {
          setSelectedTeamState(savedTeam);
        } else {
          setSelectedTeamState(teamsData[0]);
          localStorage.setItem(SELECTED_TEAM_KEY, teamsData[0].id.toString());
        }
      } else if (teamsData.length > 0) {
        setSelectedTeamState(teamsData[0]);
        localStorage.setItem(SELECTED_TEAM_KEY, teamsData[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const setSelectedTeam = (team: Team | null) => {
    setSelectedTeamState(team);
    if (team) {
      localStorage.setItem(SELECTED_TEAM_KEY, team.id.toString());
    } else {
      localStorage.removeItem(SELECTED_TEAM_KEY);
    }
  };

  const refreshTeams = async () => {
    await loadTeams();
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const contextValue: TeamContextType = {
    selectedTeam,
    teams,
    loading,
    error,
    setSelectedTeam,
    refreshTeams,
  };

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export default TeamContext;