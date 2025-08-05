import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  Folder,
  FolderOpen,
  InsertDriveFile,
  Security,
  Speed,
  BugReport,
  ExpandMore,
  ExpandLess,
  Code,
  Analytics,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { apiService } from '../../services/api';

interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  getFile?: () => Promise<File>;
  values?: () => AsyncIterableIterator<FileSystemHandle>;
}

interface AnalysisProgress {
  totalFiles: number;
  processedFiles: number;
  currentFile: string;
  status: 'analyzing' | 'completed' | 'error';
  issues: Array<{
    id: string;
    title: string;
    severity: 'high' | 'medium' | 'low';
    type: 'security' | 'performance' | 'quality' | 'accessibility';
    filePath: string;
    lineNumber: number;
    codeSnippet: string;
    recommendation: string;
    impact: string;
  }>;
}

interface DirectoryScannerProps {
  projectId: string;
  onAnalysisComplete: (result: any) => void;
  onError: (error: string) => void;
}

const DirectoryScanner: React.FC<DirectoryScannerProps> = ({
  projectId,
  onAnalysisComplete,
  onError
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<string[]>([]);
  const [browserSupport, setBrowserSupport] = useState<{
    supportsDirectoryPicker: boolean;
    supportsWebkitDirectory: boolean;
  }>({
    supportsDirectoryPicker: 'showDirectoryPicker' in window,
    supportsWebkitDirectory: true // Most browsers support this
  });

  const processDirectory = useCallback(async (
    directoryHandle: FileSystemHandle,
    basePath: string = ''
  ): Promise<Array<{ path: string; content: string; type: string }>> => {
    const files: Array<{ path: string; content: string; type: string }> = [];
    
    if (directoryHandle.kind === 'file') {
      try {
        const file = await directoryHandle.getFile!();
        const fileName = file.name.toLowerCase();
        
        // Filter for analyzable files
        const analyzableExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.vue', '.json', '.py', '.php', '.java', '.c', '.cpp', '.go', '.rs'];
        const shouldAnalyze = analyzableExtensions.some(ext => fileName.endsWith(ext));
        
        if (shouldAnalyze && file.size < 10 * 1024 * 1024) { // Skip files larger than 10MB
          const content = await file.text();
          const filePath = basePath ? `${basePath}/${file.name}` : file.name;
          
          files.push({
            path: filePath,
            content,
            type: fileName.split('.').pop() || 'unknown'
          });
          
          // Update progress
          setProgress(prev => prev ? {
            ...prev,
            currentFile: filePath,
            processedFiles: prev.processedFiles + 1
          } : null);
        }
      } catch (error) {
        console.warn(`Failed to read file ${directoryHandle.name}:`, error);
      }
    } else if (directoryHandle.kind === 'directory') {
      // Skip common directories that don't need analysis
      const skipDirectories = ['node_modules', '.git', '.next', 'dist', 'build', '.vscode', '.idea', 'coverage'];
      if (skipDirectories.includes(directoryHandle.name)) {
        return files;
      }

      try {
        const entries = directoryHandle.values!();
        for await (const entry of entries) {
          const subPath = basePath ? `${basePath}/${directoryHandle.name}` : directoryHandle.name;
          const subFiles = await processDirectory(entry, subPath);
          files.push(...subFiles);
        }
      } catch (error) {
        console.warn(`Failed to read directory ${directoryHandle.name}:`, error);
      }
    }
    
    return files;
  }, []);

  const analyzeWithFileSystemAPI = useCallback(async () => {
    try {
      setIsScanning(true);
      setProgress({
        totalFiles: 0,
        processedFiles: 0,
        currentFile: 'Initializing...',
        status: 'analyzing',
        issues: []
      });

      // Request directory access
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'read',
        startIn: 'documents'
      });

      setSelectedDirectory(directoryHandle.name);

      // Count total files first
      const countFiles = async (handle: FileSystemHandle): Promise<number> => {
        if (handle.kind === 'file') {
          const file = await handle.getFile!();
          const fileName = file.name.toLowerCase();
          const analyzableExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.vue', '.json', '.py', '.php', '.java', '.c', '.cpp', '.go', '.rs'];
          return analyzableExtensions.some(ext => fileName.endsWith(ext)) ? 1 : 0;
        } else {
          const skipDirectories = ['node_modules', '.git', '.next', 'dist', 'build', '.vscode', '.idea', 'coverage'];
          if (skipDirectories.includes(handle.name)) return 0;
          
          let count = 0;
          try {
            const entries = handle.values!();
            for await (const entry of entries) {
              count += await countFiles(entry);
            }
          } catch (error) {
            console.warn(`Failed to count files in ${handle.name}`);
          }
          return count;
        }
      };

      const totalFiles = await countFiles(directoryHandle);
      setProgress(prev => prev ? { ...prev, totalFiles } : null);

      // Process all files
      const files = await processDirectory(directoryHandle);
      
      // Send files for analysis
      setProgress(prev => prev ? { ...prev, currentFile: 'Analyzing code...', status: 'analyzing' } : null);
      
      const analysisResult = await apiService.analyzeDirectoryFiles(projectId, files);
      
      setProgress(prev => prev ? { 
        ...prev, 
        status: 'completed',
        currentFile: 'Analysis complete!',
        issues: analysisResult.issues || []
      } : null);

      onAnalysisComplete(analysisResult);
      
    } catch (error: any) {
      console.error('Directory analysis failed:', error);
      const errorMessage = error.name === 'AbortError' 
        ? 'Directory selection was cancelled' 
        : `Analysis failed: ${error.message}`;
      onError(errorMessage);
      setProgress(prev => prev ? { ...prev, status: 'error' } : null);
    } finally {
      setIsScanning(false);
    }
  }, [projectId, processDirectory, onAnalysisComplete, onError]);

  const analyzeWithWebkitDirectory = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;

    input.onchange = async (event: any) => {
      try {
        setIsScanning(true);
        const files = Array.from(event.target.files as FileList);
        
        setProgress({
          totalFiles: files.length,
          processedFiles: 0,
          currentFile: 'Processing files...',
          status: 'analyzing',
          issues: []
        });

        const analyzableFiles = [];
        for (const file of files) {
          const fileName = file.name.toLowerCase();
          const analyzableExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.vue', '.json'];
          
          if (analyzableExtensions.some(ext => fileName.endsWith(ext)) && file.size < 10 * 1024 * 1024) {
            const content = await file.text();
            analyzableFiles.push({
              path: file.webkitRelativePath || file.name,
              content,
              type: fileName.split('.').pop() || 'unknown'
            });
            
            setProgress(prev => prev ? {
              ...prev,
              currentFile: file.webkitRelativePath || file.name,
              processedFiles: prev.processedFiles + 1
            } : null);
          }
        }

        // Send for analysis
        const analysisResult = await apiService.analyzeDirectoryFiles(projectId, analyzableFiles);
        
        setProgress(prev => prev ? {
          ...prev,
          status: 'completed',
          currentFile: 'Analysis complete!',
          issues: analysisResult.issues || []
        } : null);

        onAnalysisComplete(analysisResult);

      } catch (error: any) {
        console.error('Directory analysis failed:', error);
        onError(`Analysis failed: ${error.message}`);
        setProgress(prev => prev ? { ...prev, status: 'error' } : null);
      } finally {
        setIsScanning(false);
      }
    };

    input.click();
  }, [projectId, onAnalysisComplete, onError]);

  const handleScanDirectory = () => {
    if (browserSupport.supportsDirectoryPicker) {
      analyzeWithFileSystemAPI();
    } else {
      analyzeWithWebkitDirectory();
    }
  };

  const toggleIssueExpansion = (issueId: string) => {
    setExpandedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <ErrorIcon color="error" />;
      case 'medium': return <Warning color="warning" />;
      case 'low': return <CheckCircle color="success" />;
      default: return <BugReport />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FolderOpen sx={{ fontSize: 32, color: '#6366f1' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Directory Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive analysis of your entire project directory
            </Typography>
          </Box>
        </Box>

        {/* Browser Support Information */}
        <Alert 
          severity={browserSupport.supportsDirectoryPicker ? "success" : "info"} 
          sx={{ mb: 3 }}
        >
          {browserSupport.supportsDirectoryPicker ? (
            <>
              <strong>Enhanced Mode Available:</strong> Your browser supports the File System Access API for full directory access with 17,000+ files support.
            </>
          ) : (
            <>
              <strong>Compatibility Mode:</strong> Using fallback directory upload. For the best experience, use Chrome or Edge for full directory access.
            </>
          )}
        </Alert>

        {/* Scan Button */}
        <Button
          variant="contained"
          size="large"
          onClick={handleScanDirectory}
          disabled={isScanning}
          startIcon={<Folder />}
          sx={{ 
            mb: 3,
            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5855eb, #db2777)',
            }
          }}
        >
          {isScanning ? 'Scanning...' : 'Select & Analyze Directory'}
        </Button>

        {/* Progress Section */}
        {progress && (
          <Card sx={{ mb: 3, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analysis Progress
              </Typography>
              
              {selectedDirectory && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Directory: <strong>{selectedDirectory}</strong>
                </Typography>
              )}

              <LinearProgress 
                variant="determinate" 
                value={progress.totalFiles > 0 ? (progress.processedFiles / progress.totalFiles) * 100 : 0}
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">
                  {progress.processedFiles} / {progress.totalFiles} files processed
                </Typography>
                <Typography variant="body2">
                  {progress.totalFiles > 0 ? Math.round((progress.processedFiles / progress.totalFiles) * 100) : 0}%
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                <Code sx={{ fontSize: 16, mr: 1 }} />
                {progress.currentFile}
              </Typography>

              {progress.status === 'completed' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Analysis completed! Found {progress.issues.length} issues across {progress.totalFiles} files.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Issues Summary */}
        {progress && progress.issues.length > 0 && (
          <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BugReport sx={{ mr: 1 }} />
                Issues Found ({progress.issues.length})
              </Typography>

              {/* Issue Categories */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {['security', 'performance', 'quality', 'accessibility'].map(type => {
                  const count = progress.issues.filter(issue => issue.type === type).length;
                  if (count === 0) return null;
                  
                  return (
                    <Grid item xs={6} sm={3} key={type}>
                      <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <Typography variant="h4" color="primary">{count}</Typography>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {type}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Issues List */}
              <List>
                {progress.issues.map((issue) => (
                  <React.Fragment key={issue.id}>
                    <ListItem 
                      sx={{ 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: 1, 
                        mb: 1,
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {getSeverityIcon(issue.severity)}
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {issue.title}
                              </Typography>
                              <Chip 
                                label={issue.severity} 
                                size="small" 
                                color={getSeverityColor(issue.severity) as any}
                                variant="outlined"
                              />
                              <Chip 
                                label={issue.type} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {issue.filePath}:{issue.lineNumber} • {issue.impact}
                            </Typography>
                          }
                          sx={{ ml: 2 }}
                        />
                        <IconButton onClick={() => toggleIssueExpansion(issue.id)}>
                          {expandedIssues.includes(issue.id) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </ListItem>
                    
                    <Collapse in={expandedIssues.includes(issue.id)}>
                      <Box sx={{ ml: 4, mb: 2, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          <strong>Code:</strong>
                        </Typography>
                        <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.4)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {issue.codeSnippet}
                        </Paper>
                        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                          <strong>Recommendation:</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {issue.recommendation}
                        </Typography>
                      </Box>
                    </Collapse>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default DirectoryScanner;