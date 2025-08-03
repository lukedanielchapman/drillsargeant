import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  Close, 
  TrendingUp, 
  Security,
  Speed,
  Code,
  Description,
  Download,
  Refresh,
  TrendingDown,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import apiService from '../../services/api';

interface AnalyticsDashboardProps {
  open: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  overview: {
    totalProjects: number;
    totalAssessments: number;
    totalIssues: number;
    averageScore: number;
    improvementTrend: number;
  };
  scores: {
    security: number;
    performance: number;
    quality: number;
    documentation: number;
  };
  trends: {
    labels: string[];
    security: number[];
    performance: number[];
    quality: number[];
    documentation: number[];
  };
  topIssues: Array<{
    id: string;
    title: string;
    severity: string;
    type: string;
    count: number;
  }>;
  projectPerformance: Array<{
    id: string;
    name: string;
    score: number;
    issues: number;
    lastAssessment: string;
  }>;
}

const MOCK_ANALYTICS_DATA: AnalyticsData = {
  overview: {
    totalProjects: 12,
    totalAssessments: 45,
    totalIssues: 156,
    averageScore: 78,
    improvementTrend: 12
  },
  scores: {
    security: 85,
    performance: 72,
    quality: 79,
    documentation: 65
  },
  trends: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    security: [70, 75, 80, 82, 85, 85],
    performance: [60, 65, 68, 70, 72, 72],
    quality: [65, 70, 75, 77, 79, 79],
    documentation: [50, 55, 60, 62, 65, 65]
  },
  topIssues: [
    { id: '1', title: 'SQL Injection Vulnerability', severity: 'critical', type: 'security', count: 8 },
    { id: '2', title: 'Memory Leak in Event Listeners', severity: 'high', type: 'performance', count: 12 },
    { id: '3', title: 'Missing Error Handling', severity: 'medium', type: 'quality', count: 15 },
    { id: '4', title: 'Incomplete API Documentation', severity: 'low', type: 'documentation', count: 22 }
  ],
  projectPerformance: [
    { id: '1', name: 'E-commerce Platform', score: 85, issues: 12, lastAssessment: '2024-01-15' },
    { id: '2', name: 'Mobile App Backend', score: 78, issues: 8, lastAssessment: '2024-01-14' },
    { id: '3', name: 'Admin Dashboard', score: 92, issues: 5, lastAssessment: '2024-01-13' },
    { id: '4', name: 'API Gateway', score: 71, issues: 18, lastAssessment: '2024-01-12' }
  ]
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ open, onClose }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadAnalytics();
    }
  }, [open]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await apiService.getAnalytics();
      // setAnalyticsData(data);
      
      // Using mock data for now
      setTimeout(() => {
        setAnalyticsData(MOCK_ANALYTICS_DATA);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data. Please try again.');
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'warning';
    if (score >= 70) return 'info';
    return 'error';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Error color="error" />;
      case 'high':
        return <Warning color="warning" />;
      case 'medium':
        return <Warning color="info" />;
      case 'low':
        return <CheckCircle color="success" />;
      default:
        return <Info />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Security />;
      case 'performance':
        return <Speed />;
      case 'quality':
        return <Code />;
      case 'documentation':
        return <Description />;
      default:
        return <Code />;
    }
  };

  if (!analyticsData) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          height: '95vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp sx={{ color: 'success.main' }} />
          <Typography variant="h6">Analytics Dashboard</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadAnalytics} disabled={loading} size="small">
            <Refresh />
          </IconButton>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Overview Cards */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    <CardContent>
                      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        {analyticsData.overview.totalProjects}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Projects
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    <CardContent>
                      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        {analyticsData.overview.totalAssessments}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Assessments Run
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    <CardContent>
                      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        {analyticsData.overview.totalIssues}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Issues Found
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {analyticsData.overview.averageScore}%
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {analyticsData.overview.improvementTrend > 0 ? (
                            <TrendingUp color="success" />
                          ) : (
                            <TrendingDown color="error" />
                          )}
                          <Typography variant="caption" color={analyticsData.overview.improvementTrend > 0 ? 'success.main' : 'error.main'}>
                            {Math.abs(analyticsData.overview.improvementTrend)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Average Score
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Score Breakdown */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Score Breakdown
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(analyticsData.scores).map(([key, score]) => (
                      <Box key={key}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTypeIcon(key)}
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {key}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {score}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={score}
                          color={getScoreColor(score)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Issues */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Top Issues
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {analyticsData.topIssues.map((issue) => (
                      <Box key={issue.id} sx={{ 
                        p: 2, 
                        borderRadius: 1, 
                        bgcolor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                            {issue.title}
                          </Typography>
                          <Chip 
                            label={issue.count} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {getSeverityIcon(issue.severity)}
                          <Chip 
                            label={issue.severity} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          {getTypeIcon(issue.type)}
                          <Chip 
                            label={issue.type} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Project Performance Table */}
            <Grid item xs={12}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Project Performance
                  </Typography>
                  <TableContainer component={Paper} sx={{ 
                    background: 'transparent',
                    boxShadow: 'none'
                  }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Project</TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Score</TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Issues</TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Last Assessment</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analyticsData.projectPerformance.map((project) => (
                          <TableRow key={project.id} sx={{ 
                            '&:hover': { 
                              bgcolor: 'rgba(255, 255, 255, 0.02)' 
                            }
                          }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {project.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {project.score}%
                                </Typography>
                                <Box sx={{ 
                                  width: 60, 
                                  height: 6, 
                                  borderRadius: 3,
                                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                                  overflow: 'hidden'
                                }}>
                                  <Box sx={{ 
                                    width: `${project.score}%`, 
                                    height: '100%',
                                    bgcolor: `${getScoreColor(project.score)}.main`,
                                    transition: 'width 0.3s ease'
                                  }} />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={project.issues} 
                                size="small" 
                                color={project.issues > 10 ? 'error' : project.issues > 5 ? 'warning' : 'success'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(project.lastAssessment).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button 
          variant="contained" 
          startIcon={<Download />}
          onClick={() => {
            // TODO: Implement export functionality
            console.log('Export analytics data');
          }}
        >
          Export Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnalyticsDashboard; 