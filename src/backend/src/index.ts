import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { authenticateToken, optionalAuth } from './middleware/auth';
import { db } from './config/firebase';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3003',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DrillSargeant Backend is running' });
});

// API status route
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'operational',
    service: 'DrillSargeant Backend',
    version: '1.0.0'
  });
});

// Authentication test route
app.get('/api/auth/test', authenticateToken, (req: any, res) => {
  res.json({ 
    message: 'Authentication successful',
    user: req.user
  });
});

// Projects API
app.get('/api/projects', authenticateToken, async (req: any, res) => {
  try {
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef.where('userId', '==', req.user.uid).get();
    
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authenticateToken, async (req: any, res) => {
  try {
    const { name, description, repositoryUrl } = req.body;
    
    const projectData = {
      name,
      description,
      repositoryUrl,
      userId: req.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
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

// Assessment API
app.post('/api/assessments', authenticateToken, async (req: any, res) => {
  try {
    const { projectId, assessmentType, configuration } = req.body;
    
    const assessmentData = {
      projectId,
      assessmentType,
      configuration,
      userId: req.user.uid,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await db.collection('assessments').add(assessmentData);
    
    res.status(201).json({
      id: docRef.id,
      ...assessmentData
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

app.get('/api/assessments/:assessmentId', authenticateToken, async (req: any, res) => {
  try {
    const { assessmentId } = req.params;
    const doc = await db.collection('assessments').doc(assessmentId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const data = doc.data();
    if (data?.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      id: doc.id,
      ...data
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`DrillSargeant Backend running on port ${PORT}`);
}); 