import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleTitleClick = () => {
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="h1" 
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              fontSize: isMobile ? '1.1rem' : '1.25rem'
            }}
            onClick={handleTitleClick}
          >
            Sprint Capacity Planner
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;