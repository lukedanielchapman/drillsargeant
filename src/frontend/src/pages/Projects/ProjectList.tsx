import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No Projects Yet
              </Typography>
              <Typography variant="body1" gutterBottom>
                Create your first project to get started with code assessment.
              </Typography>
              <Button variant="contained" color="primary">
                Create Project
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectList; 