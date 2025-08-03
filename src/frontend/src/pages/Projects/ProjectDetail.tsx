import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useParams } from 'react-router-dom';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Project Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project ID: {projectId}
              </Typography>
              <Typography variant="body1">
                Project details will be displayed here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetail; 