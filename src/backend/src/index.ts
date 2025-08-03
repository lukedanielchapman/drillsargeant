import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { authenticateToken, optionalAuth } from './middleware/auth';
import { db } from './config/firebase';
import * as functions from 'firebase-functions';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://drillsargeant-19d36.web.app',
    credentials: true
  }
});

// Extend Socket interface
declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}

// Socket.IO connection handling
io.use(async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    // Verify token (simplified for demo)
    socket.userId = token; // In production, decode JWT token
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket: Socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Join user's room for private notifications
  if (socket.userId) {
    socket.join(`user_${socket.userId}`);
  }
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Helper function to send notifications
const sendNotification = (userId: string, type: string, data: any) => {
  io.to(`user_${userId}`).emit('notification', {
    type,
    data,
    timestamp: new Date().toISOString()
  });
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://drillsargeant-19d36.web.app',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'DrillSargeant Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth test endpoint
app.get('/api/auth/test', authenticateToken, (req, res) => {
  res.json({
    message: 'Authentication successful',
    user: req.user
  });
});

// Projects API
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef.where('userId', '==', userId).get();
    
    const projects: any[] = [];
    snapshot.forEach(doc => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { name, description, repositoryUrl } = req.body;
    
    if (!name || !description || !repositoryUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const projectData = {
      name,
      description,
      repositoryUrl,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
    
    const docRef = await db.collection('projects').add(projectData);
    
    res.status(201).json({
      id: docRef.id,
      ...projectData
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Enhanced Assessments API with real-time progress
app.post('/api/assessments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { projectId, assessmentType, configuration } = req.body;
    
    if (!projectId || !assessmentType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify project exists and belongs to user
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectData = projectDoc.data();
    if (projectData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const assessmentData = {
      projectId,
      assessmentType,
      configuration,
      userId,
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      results: null
    };
    
    const docRef = await db.collection('assessments').add(assessmentData);
    
    // Send initial notification
    sendNotification(userId, 'assessment_started', {
      assessmentId: docRef.id,
      projectId,
      assessmentType,
      message: 'Assessment started successfully'
    });
    
    // Simulate assessment processing with real-time updates
    let progress = 0;
    const progressInterval = setInterval(async () => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress > 100) progress = 100;
      
      await docRef.update({
        progress,
        updatedAt: new Date().toISOString()
      });
      
      // Send progress update
      sendNotification(userId, 'assessment_progress', {
        assessmentId: docRef.id,
        progress,
        message: `Assessment progress: ${progress}%`
      });
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        const results = {
          security: Math.floor(Math.random() * 30) + 70,
          performance: Math.floor(Math.random() * 30) + 70,
          quality: Math.floor(Math.random() * 30) + 70,
          documentation: Math.floor(Math.random() * 30) + 70,
          issues: [
            {
              id: '1',
              title: 'SQL Injection Vulnerability',
              description: 'User input is directly concatenated into SQL queries without proper sanitization.',
              severity: 'critical',
              type: 'security',
              filePath: 'src/api/users.js',
              lineNumber: 45,
              codeSnippet: 'const query = `SELECT * FROM users WHERE id = ${userId}`;',
              recommendation: 'Use parameterized queries or an ORM to prevent SQL injection attacks.'
            },
            {
              id: '2',
              title: 'Memory Leak in Event Listeners',
              description: 'Event listeners are not properly removed when components unmount.',
              severity: 'high',
              type: 'performance',
              filePath: 'src/components/ProductList.jsx',
              lineNumber: 23,
              codeSnippet: 'window.addEventListener("resize", handleResize);',
              recommendation: 'Remove event listeners in useEffect cleanup function.'
            }
          ]
        };
        
        await docRef.update({
          status: 'completed',
          results,
          progress: 100,
          completedAt: new Date().toISOString()
        });
        
        // Send completion notification
        sendNotification(userId, 'assessment_completed', {
          assessmentId: docRef.id,
          results,
          message: 'Assessment completed successfully!'
        });
      }
    }, 2000);
    
    res.status(201).json({
      id: docRef.id,
      ...assessmentData
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

app.get('/api/assessments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    const assessmentRef = db.collection('assessments').doc(id);
    const assessmentDoc = await assessmentRef.get();
    
    if (!assessmentDoc.exists) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const assessmentData = assessmentDoc.data();
    if (assessmentData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      id: assessmentDoc.id,
      ...assessmentData
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Issues API
app.get('/api/issues', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { projectId, severity, type, status } = req.query;
    
    let query = db.collection('issues').where('userId', '==', userId);
    
    if (projectId) {
      query = query.where('projectId', '==', projectId);
    }
    if (severity) {
      query = query.where('severity', '==', severity);
    }
    if (type) {
      query = query.where('type', '==', type);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    
    const issues = [];
    snapshot.forEach(doc => {
      issues.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

app.get('/api/issues/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    const issueRef = db.collection('issues').doc(id);
    const issueDoc = await issueRef.get();
    
    if (!issueDoc.exists) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    const issueData = issueDoc.data();
    if (issueData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      id: issueDoc.id,
      ...issueData
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

app.patch('/api/issues/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.uid;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const issueRef = db.collection('issues').doc(id);
    const issueDoc = await issueRef.get();
    
    if (!issueDoc.exists) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    const issueData = issueDoc.data();
    if (issueData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await issueRef.update({
      status,
      updatedAt: new Date().toISOString()
    });
    
    res.json({
      id,
      status,
      message: 'Issue status updated successfully'
    });
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({ error: 'Failed to update issue status' });
  }
});

// Analytics API
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    
    // Get projects count
    const projectsSnapshot = await db.collection('projects')
      .where('userId', '==', userId)
      .get();
    
    // Get assessments count
    const assessmentsSnapshot = await db.collection('assessments')
      .where('userId', '==', userId)
      .get();
    
    // Get issues count
    const issuesSnapshot = await db.collection('issues')
      .where('userId', '==', userId)
      .get();
    
    // Calculate average scores from completed assessments
    const completedAssessments: any[] = [];
    assessmentsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'completed' && data.results) {
        completedAssessments.push(data.results);
      }
    });
    
    let averageScore = 0;
    if (completedAssessments.length > 0) {
      const totalScore = completedAssessments.reduce((sum, assessment) => {
        return sum + (assessment.security + assessment.performance + assessment.quality + assessment.documentation) / 4;
      }, 0);
      averageScore = Math.round(totalScore / completedAssessments.length);
    }
    
    // Get top issues
    const issues: Array<{ id: string; [key: string]: any }> = [];
    issuesSnapshot.forEach(doc => {
      issues.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Group issues by title and count occurrences
    const issueCounts: { [key: string]: any } = {};
    issues.forEach(issue => {
      const key = issue.title;
      if (!issueCounts[key]) {
        issueCounts[key] = {
          title: issue.title,
          severity: issue.severity,
          type: issue.type,
          count: 0
        };
      }
      issueCounts[key].count++;
    });
    
    const topIssues = Object.values(issueCounts)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);
    
    // Get project performance
    const projectPerformance = [];
    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data();
      
      // Get assessments for this project
      const projectAssessmentsSnapshot = await db.collection('assessments')
        .where('userId', '==', userId)
        .where('projectId', '==', projectDoc.id)
        .where('status', '==', 'completed')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      let score = 0;
      let lastAssessment = null;
      
      if (!projectAssessmentsSnapshot.empty) {
        const latestAssessment = projectAssessmentsSnapshot.docs[0].data();
        const results = latestAssessment.results;
        score = Math.round((results.security + results.performance + results.quality + results.documentation) / 4);
        lastAssessment = latestAssessment.createdAt;
      }
      
      // Count issues for this project
      const projectIssuesSnapshot = await db.collection('issues')
        .where('userId', '==', userId)
        .where('projectId', '==', projectDoc.id)
        .get();
      
      projectPerformance.push({
        id: projectDoc.id,
        name: projectData.name,
        score,
        issues: projectIssuesSnapshot.size,
        lastAssessment
      });
    }
    
    const analytics = {
      overview: {
        totalProjects: projectsSnapshot.size,
        totalAssessments: assessmentsSnapshot.size,
        totalIssues: issuesSnapshot.size,
        averageScore,
        improvementTrend: 12 // Mock trend
      },
      scores: {
        security: 85,
        performance: 72,
        quality: 79,
        documentation: 65
      },
      trends: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        security: [70, 75, 80, 82, 85, 85],
        performance: [60, 65, 68, 70, 72, 72],
        quality: [65, 70, 75, 77, 79, 79],
        documentation: [50, 55, 60, 62, 65, 65]
      },
      topIssues,
      projectPerformance
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.post('/api/analytics/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { format = 'pdf' } = req.body;
    
    // Generate export data
    const exportData = {
      userId,
      timestamp: new Date().toISOString(),
      format,
      status: 'processing',
      data: {
        // Include all analytics data
        projects: [],
        assessments: [],
        issues: [],
        analytics: {}
      }
    };
    
    // Store export request
    const docRef = await db.collection('exports').add(exportData);
    
    // Simulate processing delay
    setTimeout(async () => {
      await docRef.update({
        status: 'completed',
        completedAt: new Date().toISOString(),
        downloadUrl: `https://storage.googleapis.com/drillsargeant-exports/${docRef.id}.${format}`
      });
    }, 3000);
    
    res.json({
      message: 'Export request submitted successfully',
      exportId: docRef.id,
      estimatedTime: '2-3 minutes'
    });
  } catch (error) {
    console.error('Error creating export:', error);
    res.status(500).json({ error: 'Failed to create export' });
  }
});

app.get('/api/exports/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    const exportRef = db.collection('exports').doc(id);
    const exportDoc = await exportRef.get();
    
    if (!exportDoc.exists) {
      return res.status(404).json({ error: 'Export not found' });
    }
    
    const exportData = exportDoc.data();
    if (exportData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      id: exportDoc.id,
      ...exportData
    });
  } catch (error) {
    console.error('Error fetching export status:', error);
    res.status(500).json({ error: 'Failed to fetch export status' });
  }
});

app.get('/api/exports/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    const exportRef = db.collection('exports').doc(id);
    const exportDoc = await exportRef.get();
    
    if (!exportDoc.exists) {
      return res.status(404).json({ error: 'Export not found' });
    }
    
    const exportData = exportDoc.data();
    if (!exportData || exportData.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (exportData.status !== 'completed') {
      return res.status(400).json({ error: 'Export not ready for download' });
    }
    
    // Generate mock PDF/Excel content
    const mockContent = generateMockReport(exportData);
    const buffer = Buffer.from(mockContent, 'utf8');
    
    res.setHeader('Content-Type', exportData.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-report-${id}.${exportData.format}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    console.error('Error downloading export:', error);
    res.status(500).json({ error: 'Failed to download export' });
  }
});

// Notifications API
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { limit = 50, unreadOnly = false } = req.query;
    
    let query = db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(Number(limit));
    
    if (unreadOnly === 'true') {
      query = query.where('read', '==', false);
    }
    
    const snapshot = await query.get();
    
    const notifications: Array<{ id: string; [key: string]: any }> = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const notificationRef = db.collection('notifications').doc(id);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notificationData = notificationDoc.data();
    if (notificationData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await notificationRef.update({
      read: true,
      readAt: new Date().toISOString()
    });
    
    res.json({
      id,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const notificationRef = db.collection('notifications').doc(id);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notificationData = notificationDoc.data();
    if (notificationData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await notificationRef.delete();
    
    res.json({
      id,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Helper function to generate mock report content
function generateMockReport(exportData: any): string {
  const timestamp = new Date(exportData.timestamp).toLocaleString();
  
  if (exportData.format === 'pdf') {
    return `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
72 720 Td
(DrillSargeant Analytics Report) Tj
0 -20 Td
(Generated: ${timestamp}) Tj
0 -20 Td
(Format: ${exportData.format}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF
    `;
  } else {
    // Excel format (CSV for simplicity)
    return `Report Type,Analytics Report
Generated,${timestamp}
Format,${exportData.format}
Status,${exportData.status}
User ID,${exportData.userId}
Export ID,${exportData.id}
    `;
  }
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Export for Firebase Functions
export const api = functions.https.onRequest(app);

// For local development only
if (process.env.NODE_ENV === 'development' && process.env.RUN_LOCAL === 'true') {
  const PORT = process.env.PORT || 3002;
  server.listen(PORT, () => {
    console.log(`DrillSargeant Backend running on port ${PORT}`);
  });
} 