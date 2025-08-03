import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import { 
  ArrowBack,
  Assessment,
  BugReport,
  TrendingUp,
  Settings
} from '@mui/icons-material';

const ProjectDetail: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          size="small"
        >
          Back to Projects
        </Button>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Project Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
            }
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8,
                opacity: 0.6
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Project Not Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    This project doesn't exist or you don't have access to it
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                  >
                    Back to Projects
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #10b981, #059669)',
            }
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  fullWidth
                >
                  Run Assessment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BugReport />}
                  fullWidth
                >
                  View Issues
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  fullWidth
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  fullWidth
                >
                  Project Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetail; 