import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Close,
  Person,
  Group,
  AdminPanelSettings,
  Edit,
  Delete,
  Add,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  Security,
  Settings,
  ExpandMore,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
  TrendingUp,
  Assessment,
  BugReport,
  Analytics
} from '@mui/icons-material';
import apiService from '../../services/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'developer' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  phone?: string;
  location?: string;
  department?: string;
  joinDate: string;
  lastActive: string;
  permissions: string[];
  teamId?: string;
  stats: {
    projectsCreated: number;
    assessmentsRun: number;
    issuesResolved: number;
    reportsGenerated: number;
  };
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
  projects: string[];
  createdAt: string;
  owner: string;
}

interface UserManagementProps {
  open: boolean;
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ open, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);

  const roleColors = {
    admin: 'error',
    manager: 'warning',
    developer: 'primary',
    viewer: 'default'
  } as const;

  const statusColors = {
    active: 'success',
    inactive: 'error',
    pending: 'warning'
  } as const;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await apiService.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleUserEdit = (user: User) => {
    setEditingUser({ ...user });
    setShowUserForm(true);
  };

  const handleUserSave = async (userData: Partial<User>) => {
    try {
      if (editingUser?.id) {
        await apiService.updateUser(editingUser.id, userData);
      } else {
        await apiService.createUser(userData);
      }
      loadUsers();
      setShowUserForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user');
    }
  };

  const handleUserDelete = async (userId: string) => {
    try {
      await apiService.deleteUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const handleUserStatusToggle = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      await apiService.updateUser(userId, { status: newStatus });
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

  useEffect(() => {
    if (open) {
      loadUsers();
      loadTeams();
    }
  }, [open]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'manager':
        return <Group />;
      case 'developer':
        return <Person />;
      case 'viewer':
        return <Visibility />;
      default:
        return <Person />;
    }
  };

  const getTeamMembers = (teamId: string) => {
    return users.filter(user => user.teamId === teamId);
  };

  const getTeamProjects = (teamId: string) => {
    // This would typically come from the API
    return ['Project A', 'Project B', 'Project C'];
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
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person />
            <Typography variant="h6">User Management</Typography>
            <Chip 
              label={`${users.length} users`} 
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Users" icon={<Person />} />
          <Tab label="Teams" icon={<Group />} />
          <Tab label="Roles & Permissions" icon={<Security />} />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Users</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingUser(null);
                  setShowUserForm(true);
                }}
              >
                Add User
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {users.map((user) => (
                  <Grid item xs={12} md={6} key={user.id}>
                    <Card sx={{ 
                      background: 'rgba(255, 255, 255, 0.02)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar src={user.avatar} sx={{ width: 56, height: 56 }}>
                            {user.displayName.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {user.displayName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip 
                                label={user.role} 
                                size="small" 
                                color={roleColors[user.role]}
                                icon={getRoleIcon(user.role)}
                              />
                              <Chip 
                                label={user.status} 
                                size="small" 
                                color={statusColors[user.status]}
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit User">
                              <IconButton size="small" onClick={() => handleUserEdit(user)}>
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleUserStatusToggle(user.id, user.status === 'active' ? 'inactive' : 'active')}
                              >
                                {user.status === 'active' ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" color="primary">
                                {user.stats.projectsCreated}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Projects
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" color="success.main">
                                {user.stats.assessmentsRun}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Assessments
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" color="warning.main">
                                {user.stats.issuesResolved}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Issues Resolved
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" color="info.main">
                                {user.stats.reportsGenerated}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Reports
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Last active: {new Date(user.lastActive).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Teams</Typography>
            <Grid container spacing={2}>
              {teams.map((team) => (
                <Grid item xs={12} md={6} key={team.id}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.02)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Group />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {team.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {team.description}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Chip 
                          label={`${getTeamMembers(team.id).length} members`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          label={`${getTeamProjects(team.id).length} projects`} 
                          size="small" 
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>

                      <Accordion sx={{ background: 'transparent' }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle2">Team Members</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {getTeamMembers(team.id).map((member) => (
                              <ListItem key={member.id}>
                                <ListItemAvatar>
                                  <Avatar src={member.avatar} sx={{ width: 32, height: 32 }}>
                                    {member.displayName.charAt(0)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={member.displayName}
                                  secondary={member.role}
                                />
                                <ListItemSecondaryAction>
                                  <Chip 
                                    label={member.status} 
                                    size="small" 
                                    color={statusColors[member.status]}
                                  />
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Roles & Permissions</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Role Definitions</Typography>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.main' }}>
                            <AdminPanelSettings />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Admin"
                          secondary="Full system access, user management, team management"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <Group />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Manager"
                          secondary="Team management, project oversight, reporting"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Developer"
                          secondary="Project creation, assessments, issue resolution"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'default.main' }}>
                            <Visibility />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Viewer"
                          secondary="Read-only access to projects and reports"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Permissions Matrix</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { feature: 'Create Projects', admin: true, manager: true, developer: true, viewer: false },
                        { feature: 'Run Assessments', admin: true, manager: true, developer: true, viewer: false },
                        { feature: 'View Issues', admin: true, manager: true, developer: true, viewer: true },
                        { feature: 'Resolve Issues', admin: true, manager: true, developer: true, viewer: false },
                        { feature: 'Generate Reports', admin: true, manager: true, developer: false, viewer: false },
                        { feature: 'User Management', admin: true, manager: false, developer: false, viewer: false },
                        { feature: 'Team Management', admin: true, manager: true, developer: false, viewer: false },
                        { feature: 'System Settings', admin: true, manager: false, developer: false, viewer: false }
                      ].map((permission) => (
                        <Box key={permission.feature} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>
                            {permission.feature}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {['admin', 'manager', 'developer', 'viewer'].map((role) => (
                              <Chip
                                key={role}
                                label={role.charAt(0).toUpperCase()}
                                size="small"
                                color={permission[role as keyof typeof permission] ? 'success' : 'default'}
                                variant={permission[role as keyof typeof permission] ? 'filled' : 'outlined'}
                              />
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserManagement; 