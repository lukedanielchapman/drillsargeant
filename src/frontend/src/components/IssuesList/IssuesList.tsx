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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Close, 
  BugReport, 
  Search, 
  FilterList,
  ExpandMore,
  Error,
  Warning,
  Info,
  CheckCircle,
  Security,
  Speed,
  Code,
  Description
} from '@mui/icons-material';
import apiService from '../../services/api';

interface IssuesListProps {
  open: boolean;
  onClose: () => void;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: 'security' | 'performance' | 'quality' | 'documentation';
  status: 'open' | 'in-progress' | 'resolved' | 'ignored';
  projectId: string;
  projectName: string;
  assessmentId: string;
  createdAt: string;
  filePath?: string;
  lineNumber?: number;
  codeSnippet?: string;
  recommendation?: string;
}

const SEVERITY_COLORS = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info',
  info: 'default'
} as const;

const TYPE_ICONS = {
  security: <Security />,
  performance: <Speed />,
  quality: <Code />,
  documentation: <Description />
} as const;

const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'SQL Injection Vulnerability',
    description: 'User input is directly concatenated into SQL queries without proper sanitization, creating a potential SQL injection vulnerability.',
    severity: 'critical',
    type: 'security',
    status: 'open',
    projectId: 'project-1',
    projectName: 'E-commerce Platform',
    assessmentId: 'assessment-1',
    createdAt: '2024-01-15T10:30:00Z',
    filePath: 'src/api/users.js',
    lineNumber: 45,
    codeSnippet: 'const query = `SELECT * FROM users WHERE id = ${userId}`;',
    recommendation: 'Use parameterized queries or an ORM to prevent SQL injection attacks.'
  },
  {
    id: '2',
    title: 'Memory Leak in Event Listeners',
    description: 'Event listeners are not properly removed when components unmount, leading to memory leaks.',
    severity: 'high',
    type: 'performance',
    status: 'open',
    projectId: 'project-1',
    projectName: 'E-commerce Platform',
    assessmentId: 'assessment-1',
    createdAt: '2024-01-15T10:30:00Z',
    filePath: 'src/components/ProductList.jsx',
    lineNumber: 23,
    codeSnippet: 'window.addEventListener("resize", handleResize);',
    recommendation: 'Remove event listeners in useEffect cleanup function or componentWillUnmount.'
  },
  {
    id: '3',
    title: 'Missing Error Handling',
    description: 'API calls lack proper error handling, which could cause the application to crash.',
    severity: 'medium',
    type: 'quality',
    status: 'in-progress',
    projectId: 'project-1',
    projectName: 'E-commerce Platform',
    assessmentId: 'assessment-1',
    createdAt: '2024-01-15T10:30:00Z',
    filePath: 'src/services/api.js',
    lineNumber: 67,
    codeSnippet: 'const response = await fetch(url);',
    recommendation: 'Wrap API calls in try-catch blocks and provide user-friendly error messages.'
  },
  {
    id: '4',
    title: 'Incomplete API Documentation',
    description: 'API endpoints lack comprehensive documentation, making it difficult for developers to understand usage.',
    severity: 'low',
    type: 'documentation',
    status: 'open',
    projectId: 'project-1',
    projectName: 'E-commerce Platform',
    assessmentId: 'assessment-1',
    createdAt: '2024-01-15T10:30:00Z',
    filePath: 'src/api/README.md',
    lineNumber: 12,
    codeSnippet: '// TODO: Add API documentation',
    recommendation: 'Use tools like Swagger/OpenAPI to generate comprehensive API documentation.'
  }
];

const IssuesList: React.FC<IssuesListProps> = ({ open, onClose }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    if (open) {
      loadIssues();
    }
  }, [open]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const issuesData = await apiService.getIssues();
      // setIssues(issuesData);
      
      // Using mock data for now
      setTimeout(() => {
        setIssues(MOCK_ISSUES);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading issues:', error);
      setError('Failed to load issues. Please try again.');
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    const matchesType = typeFilter === 'all' || issue.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  const getSeverityIcon = (severity: Issue['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <Error />;
      case 'medium':
        return <Warning />;
      case 'low':
        return <Info />;
      case 'info':
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in-progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'ignored':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const handleCloseDetail = () => {
    setSelectedIssue(null);
  };

  const stats = {
    total: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
    open: issues.filter(i => i.status === 'open').length,
    resolved: issues.filter(i => i.status === 'resolved').length
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          height: '90vh'
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
          <BugReport sx={{ color: 'warning.main' }} />
          <Typography variant="h6">Code Issues</Typography>
          <Badge badgeContent={stats.total} color="primary" sx={{ ml: 1 }}>
            <Box />
          </Badge>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip 
            label={`${stats.critical} Critical`} 
            color="error" 
            variant="outlined"
            icon={<Error />}
          />
          <Chip 
            label={`${stats.high} High`} 
            color="error" 
            variant="outlined"
            icon={<Warning />}
          />
          <Chip 
            label={`${stats.medium} Medium`} 
            color="warning" 
            variant="outlined"
            icon={<Warning />}
          />
          <Chip 
            label={`${stats.low} Low`} 
            color="info" 
            variant="outlined"
            icon={<Info />}
          />
          <Chip 
            label={`${stats.open} Open`} 
            color="error" 
            variant="outlined"
          />
          <Chip 
            label={`${stats.resolved} Resolved`} 
            color="success" 
            variant="outlined"
          />
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              label="Severity"
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="info">Info</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="performance">Performance</MenuItem>
              <MenuItem value="quality">Quality</MenuItem>
              <MenuItem value="documentation">Documentation</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="ignored">Ignored</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Issues List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredIssues.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {issues.length === 0 ? 'No issues found. Run an assessment to generate issues.' : 'No issues match your filters.'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredIssues.map((issue, index) => (
              <React.Fragment key={issue.id}>
                <ListItem 
                  button 
                  onClick={() => handleIssueClick(issue)}
                  sx={{ 
                    borderRadius: 1, 
                    mb: 1,
                    background: 'rgba(255, 255, 255, 0.02)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                    }
                  }}
                >
                  <ListItemIcon>
                    <Box sx={{ color: `${SEVERITY_COLORS[issue.severity]}.main` }}>
                      {getSeverityIcon(issue.severity)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {issue.title}
                        </Typography>
                        <Chip 
                          label={issue.severity} 
                          size="small" 
                          color={SEVERITY_COLORS[issue.severity]}
                          variant="outlined"
                        />
                        <Chip 
                          label={issue.type} 
                          size="small" 
                          variant="outlined"
                          icon={TYPE_ICONS[issue.type]}
                        />
                        <Chip 
                          label={issue.status} 
                          size="small" 
                          color={getStatusColor(issue.status)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {issue.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {issue.projectName} • {new Date(issue.createdAt).toLocaleDateString()}
                          {issue.filePath && ` • ${issue.filePath}:${issue.lineNumber}`}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredIssues.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      {/* Issue Detail Dialog */}
      <Dialog
        open={!!selectedIssue}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
          }
        }}
      >
        {selectedIssue && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              pb: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getSeverityIcon(selectedIssue.severity)}
                <Typography variant="h6">{selectedIssue.title}</Typography>
              </Box>
              <IconButton onClick={handleCloseDetail} size="small">
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedIssue.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={selectedIssue.severity} 
                    color={SEVERITY_COLORS[selectedIssue.severity]}
                    variant="outlined"
                  />
                  <Chip 
                    label={selectedIssue.type} 
                    variant="outlined"
                    icon={TYPE_ICONS[selectedIssue.type]}
                  />
                  <Chip 
                    label={selectedIssue.status} 
                    color={getStatusColor(selectedIssue.status)}
                    variant="outlined"
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Project: {selectedIssue.projectName} • Created: {new Date(selectedIssue.createdAt).toLocaleString()}
                </Typography>
              </Box>

              {selectedIssue.filePath && (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">Code Location</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 1 }}>
                      {selectedIssue.filePath}:{selectedIssue.lineNumber}
                    </Typography>
                    {selectedIssue.codeSnippet && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Code Snippet:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 1 }}>
                          {selectedIssue.codeSnippet}
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}

              {selectedIssue.recommendation && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">Recommendation</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      {selectedIssue.recommendation}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseDetail}>
                Close
              </Button>
              <Button variant="contained" color="primary">
                Mark as Resolved
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Dialog>
  );
};

export default IssuesList; 