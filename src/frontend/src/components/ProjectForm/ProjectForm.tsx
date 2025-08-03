import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid
} from '@mui/material';
import {
  Close,
  GitHub,
  Language,
  Folder,
  Upload,
  Security,
  Speed,
  Code,
  Description,
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';
import apiService from '../../services/api';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
}

interface AnalysisConfig {
  securityScan: boolean;
  performanceAnalysis: boolean;
  codeQuality: boolean;
  documentationCheck: boolean;
  dependencyAudit: boolean;
  accessibilityCheck: boolean;
  seoAnalysis: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    securityScan: true,
    performanceAnalysis: true,
    codeQuality: true,
    documentationCheck: true,
    dependencyAudit: true,
    accessibilityCheck: false,
    seoAnalysis: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let projectData: any = {
        name: projectName,
        description: projectDescription,
        analysisConfig,
        createdAt: new Date().toISOString()
      };

      // Add source-specific data
      if (activeTab === 0 && gitUrl) {
        projectData.sourceType = 'git';
        projectData.sourceUrl = gitUrl;
      } else if (activeTab === 1 && webUrl) {
        projectData.sourceType = 'web';
        projectData.sourceUrl = webUrl;
      } else if (activeTab === 2 && (localPath || selectedFiles.length > 0)) {
        projectData.sourceType = 'local';
        if (localPath) {
          projectData.localPath = localPath;
        }
        if (selectedFiles.length > 0) {
          projectData.files = selectedFiles.map(f => ({ name: f.name, size: f.size }));
        }
      } else {
        setError('Please provide a valid source for analysis');
        setLoading(false);
        return;
      }

      const result = await apiService.createProject(projectData);
      setSuccess('Project created successfully! Starting analysis...');
      
      // Close form after a short delay
      setTimeout(() => {
        onClose();
        setProjectName('');
        setProjectDescription('');
        setGitUrl('');
        setWebUrl('');
        setLocalPath('');
        setSelectedFiles([]);
        setActiveTab(0);
      }, 2000);

    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleConfigChange = (key: keyof AnalysisConfig) => {
    setAnalysisConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'securityScan':
        return <Security />;
      case 'performanceAnalysis':
        return <Speed />;
      case 'codeQuality':
        return <Code />;
      case 'documentationCheck':
        return <Description />;
      default:
        return <Info />;
    }
  };

  const getAnalysisColor = (type: string) => {
    switch (type) {
      case 'securityScan':
        return 'error';
      case 'performanceAnalysis':
        return 'warning';
      case 'codeQuality':
        return 'primary';
      case 'documentationCheck':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          <Typography variant="h6">Create New Project</Typography>
          <Button onClick={onClose} startIcon={<Close />}>
            Close
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Project Description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Git Repository" icon={<GitHub />} />
            <Tab label="Web URL" icon={<Language />} />
            <Tab label="Local Files" icon={<Folder />} />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Analyze code from a Git repository
            </Typography>
            <TextField
              fullWidth
              label="Git Repository URL"
              placeholder="https://github.com/username/repository.git"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              helperText="Supports GitHub, GitLab, Bitbucket, and other Git hosting services"
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Analyze a live website
            </Typography>
            <TextField
              fullWidth
              label="Website URL"
              placeholder="https://example.com"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              helperText="Will crawl and analyze the website's frontend code, APIs, and security"
            />
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Analyze local files or upload code
            </Typography>
            <TextField
              fullWidth
              label="Local Path (Optional)"
              placeholder="/path/to/your/project"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Provide a local file path for analysis"
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              sx={{ mb: 2 }}
            >
              Upload Files
              <input
                type="file"
                multiple
                hidden
                onChange={handleFileSelect}
                accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml,.md,.txt"
              />
            </Button>
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Selected Files ({selectedFiles.length}):
                </Typography>
                <List dense>
                  {selectedFiles.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          Analysis Configuration
        </Typography>

        <Accordion sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Analysis Types</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {Object.entries(analysisConfig).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value}
                        onChange={() => handleConfigChange(key as keyof AnalysisConfig)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getAnalysisIcon(key)}
                        <Typography variant="body2">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                        <Chip 
                          label={value ? 'Enabled' : 'Disabled'} 
                          size="small" 
                          color={value ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Analysis will include:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {Object.entries(analysisConfig).map(([key, value]) => (
              value && (
                <Chip
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  size="small"
                  color={getAnalysisColor(key) as any}
                  icon={getAnalysisIcon(key)}
                />
              )
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !projectName}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {loading ? 'Creating Project...' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectForm; 