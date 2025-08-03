import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  Error,
  Warning,
  Info,
  CheckCircle,
  Close,
  Refresh,
  BugReport,
  Code,
  Security,
  Speed,
  Description
} from '@mui/icons-material';

export interface ErrorDetails {
  code: string;
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  category: 'api' | 'network' | 'authentication' | 'database' | 'analysis' | 'system';
  resolution: string[];
  technicalDetails?: string;
  timestamp: string;
}

interface ErrorCodeProps {
  open: boolean;
  onClose: () => void;
  error: ErrorDetails;
  onRetry?: () => void;
}

const ErrorCode: React.FC<ErrorCodeProps> = ({ open, onClose, error, onRetry }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <Info color="info" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'api':
        return <Code />;
      case 'network':
        return <Speed />;
      case 'authentication':
        return <Security />;
      case 'database':
        return <BugReport />;
      case 'analysis':
        return <Description />;
      case 'system':
        return <BugReport />;
      default:
        return <Info />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getSeverityIcon(error.severity)}
            <Typography variant="h6">
              Error Code: {error.code}
            </Typography>
            <Chip
              label={error.category}
              size="small"
              icon={getCategoryIcon(error.category)}
              variant="outlined"
            />
          </Box>
          <Button onClick={onClose} startIcon={<Close />}>
            Close
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            {error.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {error.description}
          </Typography>
          
          <Alert severity={error.severity} sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              Timestamp: {new Date(error.timestamp).toLocaleString()}
            </Typography>
          </Alert>
        </Box>

        <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.02)', mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Resolution Steps
          </Typography>
          <List>
            {error.resolution.map((step, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {error.technicalDetails && (
          <Paper sx={{ p: 2, background: 'rgba(0, 0, 0, 0.3)' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Technical Details
            </Typography>
            <Typography variant="body2" component="pre" sx={{ 
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}>
              {error.technicalDetails}
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Close
        </Button>
        {onRetry && (
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ErrorCode; 