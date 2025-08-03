import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Chip
} from '@mui/material';
import { 
  BugReport,
  Warning,
  Error,
  Info
} from '@mui/icons-material';

const IssueDetail: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 4 }}>
        Issue Details
      </Typography>

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
              background: 'linear-gradient(90deg, #ef4444, #dc2626)',
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
                  <BugReport sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Issue Not Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    This issue doesn't exist or you don't have access to it
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                  >
                    Back to Issues
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
              background: 'linear-gradient(90deg, #f59e0b, #d97706)',
            }
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Issue Types
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Chip
                  icon={<Error />}
                  label="Critical"
                  color="error"
                  variant="outlined"
                />
                <Chip
                  icon={<Warning />}
                  label="Warning"
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  icon={<Info />}
                  label="Info"
                  color="info"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IssueDetail; 