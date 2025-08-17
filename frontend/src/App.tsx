import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { TeamProvider } from './contexts/TeamContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SprintList from './components/SprintList';
import SprintPlanningView from './components/SprintPlanningView';
import TeamManagement from './components/TeamManagement';

// Inner component that uses the theme from context
const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <TeamProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="sprints" element={<SprintList />} />
              <Route path="sprints/:id" element={<SprintPlanningView />} />
              <Route path="teams" element={<TeamManagement />} />
            </Route>
          </Routes>
        </Router>
      </TeamProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
