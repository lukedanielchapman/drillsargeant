import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid
} from '@mui/material';
import { 
  Assessment,
  TrendingUp,
  BarChart
} from '@mui/icons-material';

const Reports: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 4 }}>
        Reports & Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
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
                  <BarChart sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Reports & Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    View detailed reports and analytics for your projects
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                  >
                    Generate Report
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 