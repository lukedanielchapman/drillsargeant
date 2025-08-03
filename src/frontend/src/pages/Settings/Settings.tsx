import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Notifications,
  Security,
  Palette
} from '@mui/icons-material';

const Settings: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 4 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Preferences
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Dark Mode"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Auto-save Reports"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Advanced Analytics"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Account
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  fullWidth
                >
                  Security Settings
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Notifications />}
                  fullWidth
                >
                  Notification Preferences
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Palette />}
                  fullWidth
                >
                  Theme Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 