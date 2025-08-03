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
  Paper,
  Tabs,
  Tab,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
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
  Error,
  Info,
  FileDownload,
  PictureAsPdf,
  TableChart
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'excel') => void;
  loading: boolean;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose, onExport, loading }) => {
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileDownload />
          <Typography variant="h6">Export Analytics Report</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          Choose the format for your analytics report. PDF reports are great for presentations, 
          while Excel reports allow for further data analysis.
        </DialogContentText>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Report Format</InputLabel>
          <Select
            value={format}
            label="Report Format"
            onChange={(e) => setFormat(e.target.value as 'pdf' | 'excel')}
          >
            <MenuItem value="pdf">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PictureAsPdf />
                PDF Report
              </Box>
            </MenuItem>
            <MenuItem value="excel">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TableChart />
                Excel Report
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>PDF Reports:</strong> Include charts, graphs, and formatted tables
          </Typography>
          <Typography variant="body2">
            <strong>Excel Reports:</strong> Include raw data for further analysis
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={() => onExport(format)} 
          variant="contained" 
          startIcon={loading ? <CircularProgress size={16} /> : <Download />}
          disabled={loading}
        >
          {loading ? 'Exporting...' : 'Export Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ open, onClose }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

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
        return <Error />;
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

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    setExportDialogOpen(false);
    
    try {
      const result = await apiService.exportAnalytics(format);
      setExportStatus(result);
      
      // Poll for status updates
      const pollStatus = async () => {
        try {
          const status = await apiService.getExportStatus(result.exportId);
          setExportStatus(status);
          
          if (status.status === 'completed') {
            // Download the file
            const blob = await apiService.downloadReport(result.exportId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-report-${result.exportId}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            setSnackbar({
              open: true,
              message: 'Report downloaded successfully!',
              severity: 'success'
            });
            setExportStatus(null);
          } else if (status.status === 'processing') {
            // Continue polling
            setTimeout(pollStatus, 2000);
          }
        } catch (error) {
          console.error('Error polling export status:', error);
          setSnackbar({
            open: true,
            message: 'Error checking export status',
            severity: 'error'
          });
        }
      };
      
      // Start polling after 3 seconds
      setTimeout(pollStatus, 3000);
      
    } catch (error) {
      console.error('Error exporting analytics:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export report. Please try again.',
        severity: 'error'
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Prepare chart data
  const trendData = analyticsData?.trends.labels.map((label, index) => ({
    month: label,
    security: analyticsData.trends.security[index],
    performance: analyticsData.trends.performance[index],
    quality: analyticsData.trends.quality[index],
    documentation: analyticsData.trends.documentation[index]
  })) || [];

  const scoreData = analyticsData ? [
    { name: 'Security', value: analyticsData.scores.security, color: '#FF6B6B' },
    { name: 'Performance', value: analyticsData.scores.performance, color: '#4ECDC4' },
    { name: 'Quality', value: analyticsData.scores.quality, color: '#45B7D1' },
    { name: 'Documentation', value: analyticsData.scores.documentation, color: '#96CEB4' }
  ] : [];

  const projectChartData = analyticsData?.projectPerformance.map(project => ({
    name: project.name,
    score: project.score,
    issues: project.issues
  })) || [];

  const issueTypeData = analyticsData?.topIssues.reduce((acc, issue) => {
    const existing = acc.find(item => item.name === issue.type);
    if (existing) {
      existing.value += issue.count;
    } else {
      acc.push({ name: issue.type, value: issue.count });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>) || [];

  if (!analyticsData) {
    return null;
  }

  return (
    <>
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

          {exportStatus && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">
                  {exportStatus.status === 'processing' 
                    ? 'Generating your report...' 
                    : 'Report ready for download!'}
                </Typography>
              </Box>
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Overview Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
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

              {/* Tabs for different chart views */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab label="Trends" />
                  <Tab label="Scores" />
                  <Tab label="Projects" />
                  <Tab label="Issues" />
                </Tabs>
              </Box>

              {/* Chart Content */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card sx={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                          Performance Trends Over Time
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                          <AreaChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                              dataKey="month" 
                              stroke="rgba(255,255,255,0.7)"
                              tick={{ fill: 'rgba(255,255,255,0.7)' }}
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.7)"
                              tick={{ fill: 'rgba(255,255,255,0.7)' }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="security" 
                              stackId="1" 
                              stroke="#FF6B6B" 
                              fill="#FF6B6B" 
                              fillOpacity={0.6}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="performance" 
                              stackId="1" 
                              stroke="#4ECDC4" 
                              fill="#4ECDC4" 
                              fillOpacity={0.6}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="quality" 
                              stackId="1" 
                              stroke="#45B7D1" 
                              fill="#45B7D1" 
                              fillOpacity={0.6}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="documentation" 
                              stackId="1" 
                              stroke="#96CEB4" 
                              fill="#96CEB4" 
                              fillOpacity={0.6}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Grid container spacing={3}>
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
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={scoreData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                              dataKey="name" 
                              stroke="rgba(255,255,255,0.7)"
                              tick={{ fill: 'rgba(255,255,255,0.7)' }}
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.7)"
                              tick={{ fill: 'rgba(255,255,255,0.7)' }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      height: '100%'
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                          Score Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={scoreData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                                                           label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {scoreData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {activeTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card sx={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                          Project Performance Comparison
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={projectChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                              dataKey="name" 
                              stroke="rgba(255,255,255,0.7)"
                              tick={{ fill: 'rgba(255,255,255,0.7)' }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.7)"
                              tick={{ fill: 'rgba(255,255,255,0.7)' }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="score" fill="#8884d8" name="Score (%)" />
                            <Bar dataKey="issues" fill="#82ca9d" name="Issues" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {activeTab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      height: '100%'
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                          Issue Types Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={issueTypeData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                                                           label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {issueTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
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
                </Grid>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={() => setExportDialogOpen(true)}
            disabled={loading || exportLoading}
          >
            Export Report
          </Button>
        </DialogActions>
      </Dialog>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
        loading={exportLoading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AnalyticsDashboard; 