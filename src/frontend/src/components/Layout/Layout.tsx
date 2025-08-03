import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

const Layout: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout; 