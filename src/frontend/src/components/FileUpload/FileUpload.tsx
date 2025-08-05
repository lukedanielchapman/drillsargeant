import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  AttachFile,
  CheckCircle,
  Error,
  Info,
  PlayArrow
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { apiService } from '../../services/api';

interface FileUploadProps {
  projectId: string;
  onAnalysisComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress?: number;
  error?: string;
}

interface AnalysisConfig {
  securityScan: boolean;
  performanceAnalysis: boolean;
  qualityCheck: boolean;
  documentationCheck: boolean;
  dependencyAnalysis: boolean;
  accessibilityCheck: boolean;
  seoAnalysis: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  projectId, 
  onAnalysisComplete, 
  onError 
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{
    status: string;
    progress: number;
    message: string;
  } | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    securityScan: true,
    performanceAnalysis: true,
    qualityCheck: true,
    documentationCheck: true,
    dependencyAnalysis: true,
    accessibilityCheck: false,
    seoAnalysis: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Drag and drop configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/javascript': ['.js', '.jsx'],
      'text/typescript': ['.ts', '.tsx'],
      'text/html': ['.html', '.htm'],
      'text/css': ['.css', '.scss', '.sass', '.less'],
      'application/json': ['.json'],
      'text/markdown': ['.md'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 20
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    onDrop(selectedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const pollProgress = async (progressId: string) => {
    try {
      const progress = await apiService.getAnalysisProgress(progressId);
      setAnalysisProgress(progress);

      if (progress.status === 'completed') {
        setIsUploading(false);
        onAnalysisComplete?.(progress.result);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      } else if (progress.status === 'error') {
        setIsUploading(false);
        onError?.(progress.message || 'Analysis failed');
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const startAnalysis = async () => {
    if (files.length === 0) {
      onError?.('Please select files to analyze');
      return;
    }

    setConfigDialogOpen(false);
    setIsUploading(true);
    setAnalysisProgress({ status: 'starting', progress: 0, message: 'Preparing file upload...' });

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      files.forEach(fileItem => {
        formData.append('files', fileItem.file);
      });

      // Add analysis configuration
      Object.entries(analysisConfig).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      console.log('Starting file upload for project:', projectId);

      // Upload files and start analysis
      const response = await apiService.uploadFiles(projectId, formData);
      
      console.log('Upload response:', response);

      // Start polling for progress
      if (response.progressId) {
        progressIntervalRef.current = setInterval(() => {
          pollProgress(response.progressId);
        }, 2000); // Poll every 2 seconds
      }

      // Update file statuses
      setFiles(prev => prev.map(f => ({ ...f, status: 'complete' as const })));

    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
      
      // Update file statuses to error
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const, 
        error: 'Upload failed' 
      })));
    }
  };

  const openConfigDialog = () => {
    if (files.length === 0) {
      onError?.('Please select files to analyze first');
      return;
    }
    setConfigDialogOpen(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeChip = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      'js': 'warning',
      'jsx': 'warning',
      'ts': 'primary',
      'tsx': 'primary',
      'html': 'error',
      'css': 'info',
      'json': 'success',
      'md': 'secondary',
      'zip': 'default'
    };
    
    return (
      <Chip 
        label={extension?.toUpperCase() || 'FILE'} 
        size="small" 
        color={colorMap[extension || ''] || 'default'}
      />
    );
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'uploading':
        return <CircularProgress size={24} />;
      default:
        return <AttachFile color="action" />;
    }
  };

  return (
    <Box>
      {/* File Drop Zone */}
      <Card 
        sx={{ 
          mb: 3,
          border: isDragActive ? '2px dashed #1976d2' : '2px dashed #e0e0e0',
          backgroundColor: isDragActive ? '#f3f4f6' : 'transparent',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              textAlign: 'center',
              py: 4,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f9f9f9'
              }
            }}
          >
            <input {...getInputProps()} />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              accept=".js,.jsx,.ts,.tsx,.html,.htm,.css,.scss,.sass,.less,.json,.md,.txt,.zip"
            />
            
            <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or
            </Typography>
            
            <Button 
              variant="outlined" 
              onClick={handleFileSelect}
              sx={{ mt: 1 }}
            >
              Browse Files
            </Button>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Supported: JavaScript, TypeScript, HTML, CSS, JSON, Markdown, ZIP archives
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                Max file size: 50MB • Max files: 20
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Selected Files List */}
      {files.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            
            <List dense>
              {files.map((fileItem) => (
                <ListItem key={fileItem.id}>
                  <Box sx={{ mr: 2 }}>
                    {getStatusIcon(fileItem.status)}
                  </Box>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {fileItem.file.name}
                        </Typography>
                        {getFileTypeChip(fileItem.file)}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(fileItem.file.size)}
                        </Typography>
                        {fileItem.error && (
                          <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                            {fileItem.error}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => removeFile(fileItem.id)}
                      disabled={isUploading}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={openConfigDialog}
                disabled={isUploading || files.length === 0}
              >
                Start Analysis
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => setFiles([])}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Analysis Progress */}
      {analysisProgress && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analysis Progress
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={analysisProgress.progress} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {analysisProgress.progress}%
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {analysisProgress.message}
            </Typography>
            
            {analysisProgress.status === 'completed' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Analysis completed successfully! Check the issues dashboard for detailed results.
                </Typography>
              </Alert>
            )}
            
            {analysisProgress.status === 'error' && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Analysis failed: {analysisProgress.message}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Configuration Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            Configure Analysis
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select the types of analysis to perform on your files:
          </Typography>
          
          <FormGroup sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={analysisConfig.securityScan}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, securityScan: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Security Scan</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Detect security vulnerabilities, XSS risks, hardcoded secrets
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={analysisConfig.performanceAnalysis}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, performanceAnalysis: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Performance Analysis</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Identify performance bottlenecks, inefficient loops, memory issues
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={analysisConfig.qualityCheck}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, qualityCheck: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Code Quality</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Code complexity, best practices, maintainability issues
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={analysisConfig.documentationCheck}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, documentationCheck: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Documentation Check</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Missing comments, outdated documentation, API docs
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={analysisConfig.dependencyAnalysis}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, dependencyAnalysis: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Dependency Analysis</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Outdated packages, security vulnerabilities in dependencies
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={analysisConfig.accessibilityCheck}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, accessibilityCheck: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Accessibility Check</Typography>
                  <Typography variant="caption" color="text.secondary">
                    WCAG compliance, screen reader compatibility
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={analysisConfig.seoAnalysis}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, seoAnalysis: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">SEO Analysis</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Meta tags, structured data, performance impact on SEO
                  </Typography>
                </Box>
              }
            />
          </FormGroup>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={startAnalysis}>
            Start Analysis
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;