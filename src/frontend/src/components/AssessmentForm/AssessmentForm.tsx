import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  LinearProgress,
  Grid
} from '@mui/material';
import { Close, Assessment, PlayArrow, CheckCircle } from '@mui/icons-material';
import apiService from '../../services/api';

interface AssessmentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (assessment: any) => void;
}

interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
}

interface AssessmentFormData {
  projectId: string;
  assessmentType: string;
  configuration: {
    includeSecurityScan: boolean;
    includePerformanceAnalysis: boolean;
    includeCodeQuality: boolean;
    includeDocumentation: boolean;
  };
}

const ASSESSMENT_TYPES = [
  {
    value: 'comprehensive',
    label: 'Comprehensive Analysis',
    description: 'Full code review with security, performance, and quality checks',
    color: 'primary'
  },
  {
    value: 'security',
    label: 'Security Focus',
    description: 'Deep security vulnerability analysis',
    color: 'error'
  },
  {
    value: 'performance',
    label: 'Performance Analysis',
    description: 'Performance optimization and bottleneck detection',
    color: 'warning'
  },
  {
    value: 'quality',
    label: 'Code Quality',
    description: 'Code quality, best practices, and maintainability',
    color: 'success'
  }
];

const AssessmentForm: React.FC<AssessmentFormProps> = ({ open, onClose, onSuccess }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<AssessmentFormData>({
    projectId: '',
    assessmentType: 'comprehensive',
    configuration: {
      includeSecurityScan: true,
      includePerformanceAnalysis: true,
      includeCodeQuality: true,
      includeDocumentation: true,
    }
  });
  const [errors, setErrors] = useState<Partial<AssessmentFormData>>({});
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [assessmentProgress, setAssessmentProgress] = useState<{
    running: boolean;
    progress: number;
    message: string;
  }>({ running: false, progress: 0, message: '' });

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const projectsData = await apiService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      setSubmitError('Failed to load projects. Please try again.');
    } finally {
      setLoadingProjects(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AssessmentFormData> = {};

    if (!formData.projectId) {
      newErrors.projectId = 'Please select a project';
    }

    if (!formData.assessmentType) {
      newErrors.assessmentType = 'Please select an assessment type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AssessmentFormData) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConfigurationChange = (field: keyof AssessmentFormData['configuration']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.checked;
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [field]: value
      }
    }));
  };

  const simulateAssessmentProgress = () => {
    setAssessmentProgress({ running: true, progress: 0, message: 'Initializing assessment...' });
    
    const steps = [
      { progress: 20, message: 'Analyzing code structure...' },
      { progress: 40, message: 'Running security scans...' },
      { progress: 60, message: 'Checking performance metrics...' },
      { progress: 80, message: 'Generating quality report...' },
      { progress: 100, message: 'Assessment complete!' }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setAssessmentProgress(prev => ({ ...prev, progress: step.progress, message: step.message }));
      }, (index + 1) * 1000);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');
    simulateAssessmentProgress();

    try {
      const assessment = await apiService.createAssessment({
        projectId: formData.projectId,
        assessmentType: formData.assessmentType,
        configuration: formData.configuration
      });
      
      // Wait for progress simulation to complete
      setTimeout(() => {
        onSuccess(assessment);
        handleClose();
      }, 5000);
    } catch (error) {
      console.error('Error creating assessment:', error);
      setSubmitError('Failed to create assessment. Please try again.');
      setAssessmentProgress({ running: false, progress: 0, message: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      projectId: '',
      assessmentType: 'comprehensive',
      configuration: {
        includeSecurityScan: true,
        includePerformanceAnalysis: true,
        includeCodeQuality: true,
        includeDocumentation: true,
      }
    });
    setErrors({});
    setSubmitError('');
    setLoading(false);
    setAssessmentProgress({ running: false, progress: 0, message: '' });
    onClose();
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);
  const selectedAssessmentType = ASSESSMENT_TYPES.find(t => t.value === formData.assessmentType);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment sx={{ color: 'secondary.main' }} />
          <Typography variant="h6">Run Assessment</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {assessmentProgress.running && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {assessmentProgress.message}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={assessmentProgress.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {assessmentProgress.progress}% Complete
                </Typography>
              </Box>
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.projectId} sx={{ mb: 3 }}>
                <InputLabel>Select Project</InputLabel>
                <Select
                  value={formData.projectId}
                  onChange={handleInputChange('projectId')}
                  label="Select Project"
                  disabled={loadingProjects}
                >
                  {loadingProjects ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        Loading projects...
                      </Box>
                    </MenuItem>
                  ) : projects.length === 0 ? (
                    <MenuItem disabled>No projects available</MenuItem>
                  ) : (
                    projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        <Box>
                          <Typography variant="body1">{project.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.repositoryUrl}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.projectId && (
                  <Typography variant="caption" color="error">
                    {errors.projectId}
                  </Typography>
                )}
              </FormControl>

              {selectedProject && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Selected Project
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>{selectedProject.name}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedProject.description}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.assessmentType} sx={{ mb: 3 }}>
                <InputLabel>Assessment Type</InputLabel>
                <Select
                  value={formData.assessmentType}
                  onChange={handleInputChange('assessmentType')}
                  label="Assessment Type"
                >
                  {ASSESSMENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography variant="body1">{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.assessmentType && (
                  <Typography variant="caption" color="error">
                    {errors.assessmentType}
                  </Typography>
                )}
              </FormControl>

              {selectedAssessmentType && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Assessment Configuration
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(formData.configuration).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        color={value ? 'success' : 'default'}
                        size="small"
                        variant={value ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading || assessmentProgress.running}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || assessmentProgress.running || projects.length === 0}
            startIcon={
              loading || assessmentProgress.running ? 
                <CircularProgress size={20} /> : 
                <PlayArrow />
            }
          >
            {loading || assessmentProgress.running ? 'Running Assessment...' : 'Run Assessment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AssessmentForm; 