import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Build,
  Code,
  CheckCircle,
  AutoFixHigh
} from '@mui/icons-material';

const FixWizard: React.FC = () => {
  const steps = ['Select Issue', 'Generate Fix', 'Review Changes', 'Apply Fix'];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 4 }}>
        Fix Wizard
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
              background: 'linear-gradient(90deg, #10b981, #059669)',
            }
          }}>
            <CardContent>
              <Stepper activeStep={0} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8,
                opacity: 0.6
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Build sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Fix Wizard
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Automatically generate and apply code fixes
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                  >
                    Start Fix Wizard
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
              background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
            }
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Fix Types
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Code />}
                  fullWidth
                >
                  Code Quality
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AutoFixHigh />}
                  fullWidth
                >
                  Security Fixes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CheckCircle />}
                  fullWidth
                >
                  Performance
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FixWizard; 