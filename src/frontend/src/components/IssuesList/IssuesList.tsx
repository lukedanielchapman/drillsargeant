import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormControlLabel,
  Checkbox,
  Switch
} from '@mui/material';
import {
  Close,
  BugReport,
  Error,
  Warning,
  Info,
  Search,
  FilterList,
  Sort,
  CalendarToday,
  ExpandMore,
  Clear,
  Refresh,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiService from '../../services/api';
import ErrorCode, { ErrorDetails } from '../ErrorCode/ErrorCode';

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'security' | 'performance' | 'quality' | 'documentation';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  filePath: string;
  lineNumber: number;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  assessmentId: string;
}

interface IssuesListProps {
  open: boolean;
  onClose: () => void;
}

interface FilterState {
  search: string;
  severity: string[];
  type: string[];
  status: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  projectId: string;
  minScore: number;
  maxScore: number;
}

interface SortState {
  field: 'severity' | 'type' | 'status' | 'createdAt' | 'title' | 'updatedAt';
  direction: 'asc' | 'desc';
}

const IssuesList: React.FC<IssuesListProps> = ({ open, onClose }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    severity: [],
    type: [],
    status: [],
    dateRange: {
      start: null,
      end: null
    },
    projectId: '',
    minScore: 0,
    maxScore: 100
  });
  const [sort, setSort] = useState<SortState>({
    field: 'createdAt',
    direction: 'desc'
  });
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  
  // Filter and sort states
  const severityColors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success'
  } as const;

  const severityIcons = {
    critical: <Error color="error" />,
    high: <Warning color="warning" />,
    medium: <Info color="info" />,
    low: <BugReport color="success" />
  };

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError('');
      setErrorDetails(null);
      const data = await apiService.getIssues();
      setIssues(data);
    } catch (error: any) {
      console.error('Error loading issues:', error);
      setError(error.message || 'Failed to load issues');
      
      // Create error details for ErrorCode component
      const errorDetails: ErrorDetails = {
        code: 'ISSUES_LOAD_ERROR',
        title: 'Failed to Load Issues',
        description: 'Unable to fetch issues from the server. This may be due to a network issue or server problem.',
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

  const loadProjects = async () => {
    try {
      const data = await apiService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...issues];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower) ||
        issue.filePath.toLowerCase().includes(searchLower)
      );
    }

    // Severity filter
    if (filters.severity.length > 0) {
      filtered = filtered.filter(issue => filters.severity.includes(issue.severity));
    }

    // Type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter(issue => filters.type.includes(issue.type));
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(issue => filters.status.includes(issue.status));
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(issue => {
        const issueDate = new Date(issue.createdAt);
        const startDate = filters.dateRange.start;
        const endDate = filters.dateRange.end;
        
        if (startDate && endDate) {
          return issueDate >= startDate && issueDate <= endDate;
        } else if (startDate) {
          return issueDate >= startDate;
        } else if (endDate) {
          return issueDate <= endDate;
        }
        return true;
      });
    }

    // Project filter
    if (filters.projectId) {
      filtered = filtered.filter(issue => issue.projectId === filters.projectId);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];
      
      if (sort.field === 'createdAt' || sort.field === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sort.field === 'title') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredIssues(filtered);
  }, [issues, filters, sort]);

  useEffect(() => {
    if (open) {
      loadIssues();
      loadProjects();
    }
  }, [open]);

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSortChange = (field: SortState['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      severity: [],
      type: [],
      status: [],
      dateRange: {
        start: null,
        end: null
      },
      projectId: '',
      minScore: 0,
      maxScore: 100
    });
  };

  const getSeverityCount = (severity: string) => {
    return issues.filter(issue => issue.severity === severity).length;
  };

  const getTypeCount = (type: string) => {
    return issues.filter(issue => issue.type === type).length;
  };

  return (
    <>
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
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BugReport />
              <Typography variant="h6">Issues Management</Typography>
              <Chip 
                label={`${filteredIssues.length} issues`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Search and Filter Bar */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search issues..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={showFilters ? 'contained' : 'outlined'}
                    startIcon={<FilterList />}
                    onClick={() => setShowFilters(!showFilters)}
                    size="small"
                  >
                    Filters
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Sort />}
                    onClick={() => handleSortChange(sort.field)}
                    size="small"
                  >
                    {sort.field} {sort.direction === 'asc' ? <TrendingUp /> : <TrendingDown />}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={clearFilters}
                    size="small"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={loadIssues}
                    disabled={loading}
                    size="small"
                  >
                    Refresh
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Advanced Filters */}
          <Collapse in={showFilters}>
            <Card sx={{ mb: 3, background: 'rgba(255, 255, 255, 0.02)' }}>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Severity Filter */}
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Severity ({issues.length} total)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {['critical', 'high', 'medium', 'low'].map(severity => (
                        <FormControlLabel
                          key={severity}
                          control={
                            <Checkbox
                              checked={filters.severity.includes(severity)}
                              onChange={(e) => {
                                const newSeverity = e.target.checked
                                  ? [...filters.severity, severity]
                                  : filters.severity.filter(s => s !== severity);
                                handleFilterChange('severity', newSeverity);
                              }}
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={severity} 
                                size="small" 
                                color={severityColors[severity as keyof typeof severityColors]}
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.secondary">
                                ({getSeverityCount(severity)})
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </Box>
                  </Grid>

                  {/* Type Filter */}
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Type
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {['security', 'performance', 'quality', 'documentation'].map(type => (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              checked={filters.type.includes(type)}
                              onChange={(e) => {
                                const newType = e.target.checked
                                  ? [...filters.type, type]
                                  : filters.type.filter(t => t !== type);
                                handleFilterChange('type', newType);
                              }}
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {type}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({getTypeCount(type)})
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </Box>
                  </Grid>

                  {/* Status Filter */}
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Status
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {['open', 'in-progress', 'resolved', 'closed'].map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Project Filter */}
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Project
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={filters.projectId}
                        onChange={(e) => handleFilterChange('projectId', e.target.value)}
                      >
                        <MenuItem value="">All Projects</MenuItem>
                        {projects.map((project) => (
                          <MenuItem key={project.id} value={project.id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Date Range Filter */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Date Range
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <DatePicker
                            label="Start Date"
                            value={filters.dateRange.start}
                            onChange={(date) => handleFilterChange('dateRange', {
                              ...filters.dateRange,
                              start: date
                            })}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <DatePicker
                            label="End Date"
                            value={filters.dateRange.end}
                            onChange={(date) => handleFilterChange('dateRange', {
                              ...filters.dateRange,
                              end: date
                            })}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Collapse>

          {/* Issues List */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredIssues.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <BugReport sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {filters.search || filters.severity.length > 0 || filters.type.length > 0
                  ? 'No issues match your filters'
                  : 'No issues found'
                }
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredIssues.map((issue, index) => (
                <React.Fragment key={issue.id}>
                  <ListItem
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      mb: 1,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    <ListItemIcon>
                      {severityIcons[issue.severity]}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {issue.title}
                          </Typography>
                          <Chip 
                            label={issue.severity} 
                            size="small" 
                            color={severityColors[issue.severity]}
                            variant="outlined"
                          />
                          <Chip 
                            label={issue.type} 
                            size="small" 
                            color="default"
                            variant="outlined"
                          />
                          <Chip 
                            label={issue.status} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {issue.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              📁 {issue.filePath}:{issue.lineNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              📅 {new Date(issue.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
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
      </Dialog>

      {/* Error Code Dialog */}
      {errorDetails && (
        <ErrorCode
          open={!!errorDetails}
          onClose={() => setErrorDetails(null)}
          error={errorDetails}
          onRetry={loadIssues}
        />
      )}
    </>
  );
};

export default IssuesList; 