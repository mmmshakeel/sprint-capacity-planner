import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopAppBar, IconButton, Icon } from '../ui';
import { useTheme } from '../contexts/ThemeContext';
import TeamSelector from './TeamSelector';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleTitleClick = () => {
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopAppBar 
        headline="Sprint Capacity Planner"
        onHeadlineClick={handleTitleClick}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TeamSelector 
            variant="outlined" 
            size="small" 
          />
          <IconButton onClick={toggleTheme} ariaLabel="Toggle dark mode">
            <Icon name={isDark ? 'light_mode' : 'dark_mode'} />
          </IconButton>
        </div>
      </TopAppBar>
      
      <main style={{ 
        maxWidth: '1200px', 
        width: '100%', 
        margin: '0 auto', 
        padding: '24px',
        flex: 1 
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;