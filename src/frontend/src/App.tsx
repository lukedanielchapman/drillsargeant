import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Placeholder pages
import ProjectList from './pages/ProjectList/ProjectList';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import AssessmentWizard from './pages/Assessment/AssessmentWizard';
import CodeReview from './pages/CodeReview/CodeReview';
import IssueDetail from './pages/Issues/IssueDetail';
import FixWizard from './pages/Fixes/FixWizard';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)
          `,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 10% 90%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 90% 10%, rgba(236, 72, 153, 0.05) 0%, transparent 40%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment"
                element={
                  <ProtectedRoute>
                    <AssessmentWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/code-review"
                element={
                  <ProtectedRoute>
                    <CodeReview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/issues/:id"
                element={
                  <ProtectedRoute>
                    <IssueDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fixes"
                element={
                  <ProtectedRoute>
                    <FixWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
};

export default App; 