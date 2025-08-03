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
  Assessment,
  Code,
  BugReport,
  TrendingUp
} from '@mui/icons-material';

const AssessmentWizard: React.FC = () => {
  const steps = ['Select Project', 'Configure Assessment', 'Run Analysis', 'Review Results'];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 4 }}>
        Assessment Wizard
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
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
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
                  <Assessment sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Assessment Wizard
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Configure and run code quality assessments
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                  >
                    Start Assessment
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
                Assessment Types
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
                  startIcon={<BugReport />}
                  fullWidth
                >
                  Security Analysis
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  fullWidth
                >
                  Performance Review
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssessmentWizard; 