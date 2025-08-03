import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Container, 
  TextField, 
  Alert,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Login as LoginIcon,
  Code,
  Assessment,
  BugReport
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }

  const features = [
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: 'Code Analysis',
      description: 'Advanced static analysis and code quality assessment'
    },
    {
      icon: <Assessment sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Reviews',
      description: 'Intelligent suggestions and automated code reviews'
    },
    {
      icon: <BugReport sx={{ fontSize: 40 }} />,
      title: 'Issue Detection',
      description: 'Comprehensive bug detection and security analysis'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        filter: 'blur(40px)',
        animation: 'float 6s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite reverse',
      }} />

      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Left side - Features */}
          <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }}>
            <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>
              Welcome to
              <Box component="span" sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                ml: 1
              }}>
                DrillSargeant
              </Box>
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
              Your AI-powered code review and improvement platform
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {features.map((feature, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 3,
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    transform: 'translateX(8px)',
                  }
                }}>
                  <Box sx={{ 
                    p: 1.5,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right side - Login Form */}
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar sx={{ 
                    width: 64, 
                    height: 64, 
                    mx: 'auto', 
                    mb: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                  }}>
                    <LoginIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sign in to your DrillSargeant account
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    sx={{ mb: 3 }}
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    fullWidth
                    size="large"
                    sx={{ mb: 3, py: 1.5 }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <Divider sx={{ my: 3, opacity: 0.3 }}>
                    <Typography variant="body2" color="text.secondary">
                      or
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link 
                        to="/register" 
                        style={{ 
                          textDecoration: 'none', 
                          color: '#6366f1',
                          fontWeight: 600
                        }}
                      >
                        Create one here
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login; 