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
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
import ErrorCode, { ErrorDetails } from '../ErrorCode/ErrorCode';

interface AnalyticsDashboardProps {
  open: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  overview: {
    totalProjects: number;
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    securityIssues: number;
    performanceIssues: number;
    qualityIssues: number;
    documentationIssues: number;
  };
  trends: {
    recentIssues: number;
    previousIssues: number;
    improvementTrend: number;
  };
  projectPerformance: Array<{
    id: string;
    name: string;
    issues: number;
    status: string;
  }>;
  topIssues: Array<{
    id: string;
    title: string;
    severity: string;
    type: string;
    filePath: string;
    lineNumber: number;
  }>;
}

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
    open: false, message: '', severity: 'success'
  });
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    if (open) {
      loadAnalytics();
    }
  }, [open]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      setErrorDetails(null);
      const data = await apiService.getAnalytics();
      setAnalyticsData(data);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      setError(error.message || 'Failed to load analytics data');
      
      // Create error details for ErrorCode component
      const errorDetails: ErrorDetails = {
        code: 'ANALYTICS_LOAD_ERROR',
        title: 'Failed to Load Analytics',
        description: 'Unable to fetch analytics data from the server. This may be due to a network issue or server problem.',
        severity: 'error',
        category: 'api',
        resolution: [
          'Check your internet connection',
          'Verify the server is running',
          'Try refreshing the page',
          'Contact support if the problem persists'
        ],
        technicalDetails: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
      setErrorDetails(errorDetails);
    } finally {
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
  const trendData = [
    { name: 'Recent Issues', value: analyticsData?.trends.recentIssues || 0 },
    { name: 'Previous Issues', value: analyticsData?.trends.previousIssues || 0 }
  ];

  const scoreData = [
    { name: 'Critical', value: analyticsData?.overview.criticalIssues || 0, color: '#ff4444' },
    { name: 'High', value: analyticsData?.overview.highIssues || 0, color: '#ff8800' },
    { name: 'Medium', value: analyticsData?.overview.mediumIssues || 0, color: '#ffaa00' },
    { name: 'Low', value: analyticsData?.overview.lowIssues || 0, color: '#00aa00' }
  ];

  const projectChartData = analyticsData?.projectPerformance.map(project => ({
    name: project.name,
    issues: project.issues,
    status: project.status
  })) || [];

  const issueTypeData = [
    { name: 'Security', value: analyticsData?.overview.securityIssues || 0 },
    { name: 'Performance', value: analyticsData?.overview.performanceIssues || 0 },
    { name: 'Quality', value: analyticsData?.overview.qualityIssues || 0 },
    { name: 'Documentation', value: analyticsData?.overview.documentationIssues || 0 }
  ];

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
                  <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', height: '100%' }}>
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
                  <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        {analyticsData.overview.totalIssues}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Issues
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        {analyticsData.overview.criticalIssues}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Critical Issues
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        {analyticsData.trends.improvementTrend}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Improvement Trend
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
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stackId="1" 
                              stroke="#FF6B6B" 
                              fill="#FF6B6B" 
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
                        <List dense>
                          {analyticsData.topIssues.map((issue, index) => (
                            <ListItem key={issue.id} sx={{ px: 0 }}>
                              <ListItemIcon>
                                {getSeverityIcon(issue.severity)}
                              </ListItemIcon>
                              <ListItemText
                                primary={issue.title}
                                secondary={`${issue.filePath}:${issue.lineNumber}`}
                              />
                              <Chip 
                                label={issue.type} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                              />
                            </ListItem>
                          ))}
                        </List>
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

      {errorDetails && (
        <ErrorCode
          open={!!errorDetails}
          onClose={() => setErrorDetails(null)}
          error={errorDetails}
          onRetry={loadAnalytics}
        />
      )}
    </>
  );
};

export default AnalyticsDashboard; 