import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TeamProvider } from './contexts/TeamContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SprintList from './components/SprintList';
import SprintPlanningView from './components/SprintPlanningView';
import TeamManagement from './components/TeamManagement';

function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
