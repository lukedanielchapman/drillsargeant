import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  LinearProgress,
  Grid,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Close,
  BugReport,
  Security,
  Speed,
  Code,
  Description,
  ExpandMore,
  LocationOn,
  Warning,
  Error,
  Info,
  CheckCircle,
  Edit,
  Download,
  Share,
  Visibility,
  VisibilityOff,
  ContentCopy,
  OpenInNew
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface IssueDetailProps {
  open: boolean;
  onClose: () => void;
  issue: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: 'security' | 'performance' | 'quality' | 'documentation';
    title: string;
    description: string;
    filePath?: string;
    lineNumber?: number;
    codeSnippet?: string;
    impact?: string;
    recommendation?: string;
    resolutionSteps?: ResolutionStep[];
    [key: string]: any;
  };
}

interface CodeLocation {
  file: string;
  line: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
}

interface ResolutionStep {
  step: number;
  title: string;
  description: string;
  codeExample?: string;
  language?: string;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ open, onClose, issue }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showFullCode, setShowFullCode] = useState(false);

  const severityColors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success'
  } as const;

  const severityIcons: Record<'critical' | 'high' | 'medium' | 'low', JSX.Element> = {
    critical: <Error color="error" />,
    high: <Warning color="warning" />,
    medium: <Info color="info" />,
    low: <CheckCircle color="success" />
  };

  const typeIcons: Record<'security' | 'performance' | 'quality' | 'documentation', JSX.Element> = {
    security: <Security />,
    performance: <Speed />,
    quality: <Code />,
    documentation: <Description />
  };

  const getLanguageFromFile = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
      case 'cc':
        return 'cpp';
      case 'c':
        return 'c';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'xml':
        return 'xml';
      default:
        return 'text';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openFileInEditor = (filePath: string, line: number) => {
    // This would integrate with the user's IDE or open the file
    console.log(`Opening ${filePath} at line ${line}`);
  };

  if (!issue) return null;

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
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {severityIcons[issue.severity]}
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
              color="primary"
              variant="outlined"
              icon={typeIcons[issue.type]}
            />
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Issue Overview */}
          <Grid item xs={12} md={8}>
            <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Issue Description
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {issue.description}
                </Typography>

                {issue.impact && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Impact:</Typography>
                    <Typography variant="body2">{issue.impact}</Typography>
                  </Alert>
                )}

                {issue.recommendation && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Recommendation:</Typography>
                    <Typography variant="body2">{issue.recommendation}</Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Code Location */}
            {issue.filePath && (
              <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Code Location
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Copy file path">
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(issue.filePath)}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open in editor">
                        <IconButton 
                          size="small" 
                          onClick={() => openFileInEditor(issue.filePath, issue.lineNumber)}
                        >
                          <OpenInNew />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    📁 {issue.filePath}:{issue.lineNumber}
                    {issue.endLine && issue.endLine !== issue.lineNumber && 
                      ` - ${issue.endLine}`
                    }
                  </Typography>

                  {issue.codeSnippet && (
                    <Paper sx={{ p: 2, background: 'rgba(0, 0, 0, 0.3)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Code Snippet
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(issue.codeSnippet)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                      <SyntaxHighlighter
                        language={getLanguageFromFile(issue.filePath)}
                        style={tomorrow}
                        customStyle={{
                          margin: 0,
                          background: 'transparent',
                          fontSize: '0.875rem'
                        }}
                        showLineNumbers
                        startingLineNumber={Math.max(1, issue.lineNumber - 2)}
                        highlightLines={[issue.lineNumber]}
                      >
                        {issue.codeSnippet}
                      </SyntaxHighlighter>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resolution Steps */}
            {issue.resolutionSteps && issue.resolutionSteps.length > 0 && (
              <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Resolution Steps
                  </Typography>
                  <List>
                    {issue.resolutionSteps.map((step: ResolutionStep, index: number) => (
                      <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={`Step ${step.step}`} 
                            size="small" 
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="subtitle2">
                            {step.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {step.description}
                        </Typography>
                        {step.codeExample && (
                          <Paper sx={{ p: 2, background: 'rgba(0, 0, 0, 0.3)', width: '100%' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              Example Fix:
                            </Typography>
                            <SyntaxHighlighter
                              language={step.language || getLanguageFromFile(issue.filePath)}
                              style={tomorrow}
                              customStyle={{
                                margin: 0,
                                background: 'transparent',
                                fontSize: '0.875rem'
                              }}
                            >
                              {step.codeExample}
                            </SyntaxHighlighter>
                          </Paper>
                        )}
                        {index < issue.resolutionSteps.length - 1 && <Divider sx={{ my: 2, width: '100%' }} />}
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Issue Metadata */}
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Issue Details
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={issue.status} 
                      size="small" 
                      color={issue.status === 'resolved' ? 'success' : 'default'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(issue.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {issue.assignee && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Assigned To
                      </Typography>
                      <Typography variant="body2">
                        {issue.assignee}
                      </Typography>
                    </Box>
                  )}

                  {issue.tags && issue.tags.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {issue.tags.map((tag: string, index: number) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Related Issues */}
            {issue.relatedIssues && issue.relatedIssues.length > 0 && (
              <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Related Issues
                  </Typography>
                  <List dense>
                    {issue.relatedIssues.map((relatedIssue: any, index: number) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {severityIcons[relatedIssue.severity]}
                        </ListItemIcon>
                        <ListItemText
                          primary={relatedIssue.title}
                          secondary={`${relatedIssue.filePath}:${relatedIssue.lineNumber}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<Edit />}
        >
          Edit Issue
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckCircle />}
        >
          Mark as Resolved
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssueDetail; 