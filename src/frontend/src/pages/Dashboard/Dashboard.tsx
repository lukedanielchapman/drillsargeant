import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Alert, 
  CircularProgress,
  Chip,
  IconButton,
  Avatar,
  Divider,
  Snackbar
} from '@mui/material';
import { 
  Code, 
  Assessment, 
  BugReport, 
  TrendingUp, 
  Settings,
  Logout,
  CheckCircle,
  Error,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import AssessmentForm from '../../components/AssessmentForm/AssessmentForm';
import IssuesList from '../../components/IssuesList/IssuesList';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [apiStatus, setApiStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [assessmentFormOpen, setAssessmentFormOpen] = useState(false);
  const [issuesListOpen, setIssuesListOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      setLoading(true);
      setError('');
      const health = await apiService.getHealth();
      setApiStatus(`✅ Backend connected: ${health.message}`);
    } catch (err) {
      setError('❌ Backend connection failed');
      console.error('API connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create-project':
        setProjectFormOpen(true);
        break;
      case 'run-assessment':
        setAssessmentFormOpen(true);
        break;
      case 'view-issues':
        setIssuesListOpen(true);
        break;
      case 'analytics':
        setSnackbar({
          open: true,
          message: 'Analytics feature coming soon!',
          severity: 'info'
        });
        break;
      default:
        break;
    }
  };

  const handleProjectCreated = (project: any) => {
    setSnackbar({
      open: true,
      message: `Project "${project.name}" created successfully!`,
      severity: 'success'
    });
    // TODO: Refresh projects list or navigate to project detail
  };

  const handleAssessmentCreated = (assessment: any) => {
    setSnackbar({
      open: true,
      message: `Assessment completed successfully! View results in the Issues section.`,
      severity: 'success'
    });
    // TODO: Navigate to assessment results or issues page
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const quickActions = [
    {
      title: 'Create Project',
      description: 'Start a new code assessment',
      icon: <Code sx={{ fontSize: 40 }} />,
      color: 'primary',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      action: 'create-project'
    },
    {
      title: 'Run Assessment',
      description: 'Analyze existing code',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: 'secondary',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      action: 'run-assessment'
    },
    {
      title: 'View Issues',
      description: 'Review code problems',
      icon: <BugReport sx={{ fontSize: 40 }} />,
      color: 'warning',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      action: 'view-issues'
    },
    {
      title: 'Analytics',
      description: 'View performance metrics',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: 'success',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      action: 'analytics'
    },
  ];

  return (
    <Box sx={{ p: 4, position: 'relative' }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -16,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
        }
      }}>
        <Box>
          <Typography variant="h1" gutterBottom>
            DrillSargeant
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Your AI-powered code review and improvement platform
          </Typography>
          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                width: 32,
                height: 32
              }}>
                {currentUser.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                Welcome back, {currentUser.email}
              </Typography>
            </Box>
          )}
        </Box>
        <IconButton
          onClick={handleLogout}
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          <Logout />
        </IconButton>
      </Box>

      {/* Status Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
              background: error ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #10b981, #059669)',
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  System Status
                </Typography>
                <IconButton 
                  onClick={testApiConnection}
                  disabled={loading}
                  size="small"
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  <Refresh sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography>Testing connection...</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {error ? (
                    <Error color="error" />
                  ) : (
                    <CheckCircle color="success" />
                  )}
                  <Typography variant="body1" color={error ? 'error' : 'success.main'}>
                    {error || apiStatus}
                  </Typography>
                </Box>
              )}
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
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
            }
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Stats
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label="0 Projects" 
                  color="primary" 
                  variant="outlined"
                  sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                />
                <Chip 
                  label="0 Assessments" 
                  color="secondary" 
                  variant="outlined"
                  sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                />
                <Chip 
                  label="0 Issues" 
                  color="warning" 
                  variant="outlined"
                  sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                }
              }}
              onClick={() => handleQuickAction(action.action)}
            >
              <CardContent sx={{ 
                textAlign: 'center',
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Box sx={{ 
                  mb: 2,
                  p: 2,
                  borderRadius: '50%',
                  background: action.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  width: 80,
                  height: 80
                }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
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
          background: 'linear-gradient(90deg, #6366f1, #ec4899, #10b981)',
        }
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Recent Activity
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 4,
            opacity: 0.6
          }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No recent activity. Create your first project to get started!
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Project Form Dialog */}
      <ProjectForm
        open={projectFormOpen}
        onClose={() => setProjectFormOpen(false)}
        onSuccess={handleProjectCreated}
      />

      {/* Assessment Form Dialog */}
      <AssessmentForm
        open={assessmentFormOpen}
        onClose={() => setAssessmentFormOpen(false)}
        onSuccess={handleAssessmentCreated}
      />

      {/* Issues List Dialog */}
      <IssuesList
        open={issuesListOpen}
        onClose={() => setIssuesListOpen(false)}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard; 