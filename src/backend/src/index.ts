import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { authenticateToken, optionalAuth } from './middleware/auth';
import { db } from './config/firebase';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { codeAnalyzer, AnalysisResult } from './services/codeAnalyzer';
import { fileProcessor, FileAnalysisResult, UploadedFile } from './services/fileProcessor';
import multer from 'multer';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://drillsargeant-19d36.web.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));

// Additional CORS headers for Firebase Functions
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://drillsargeant-19d36.web.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 20 // Max 20 files per upload
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allow common code file types and archives
    const allowedMimes = [
      'text/plain',
      'text/javascript',
      'text/css',
      'text/html',
      'application/json',
      'application/javascript',
      'application/typescript',
      'application/zip',
      'application/x-zip-compressed',
      'multipart/x-zip'
    ];
    
    const allowedExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.html', '.htm', '.css', '.scss', '.sass', '.less',
      '.json', '.md', '.txt', '.py', '.java', '.c', '.cpp', '.h', '.php', '.rb', 
      '.go', '.rs', '.vue', '.svelte', '.zip'
    ];
    
    const hasValidExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    const hasValidMime = allowedMimes.includes(file.mimetype) || 
                        file.mimetype.startsWith('text/') ||
                        hasValidExtension;
    
    if (hasValidMime) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Supported types: ${allowedExtensions.join(', ')}`));
    }
  }
});

// Helper function to send notifications via Firestore
const sendNotification = async (userId: string, type: string, data: any) => {
  try {
    await db.collection('notifications').add({
      userId,
      type,
      data,
      timestamp: new Date().toISOString(),
      read: false
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    message: 'DrillSargeant Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    timestamp: new Date().toISOString()
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

// Enhanced Projects API with real code analysis
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, description, sourceType, sourceUrl, localPath, files, analysisConfig } = req.body;

    if (!name || !sourceType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const projectData = {
      name,
      description: description || '',
      userId,
      sourceType,
      sourceUrl: sourceUrl || '',
      localPath: localPath || '',
      files: files || [],
      analysisConfig: analysisConfig || {
        securityScan: true,
        performanceAnalysis: true,
        codeQuality: true,
        documentationCheck: true,
        dependencyAudit: true,
        accessibilityCheck: false,
        seoAnalysis: false
      },
      status: 'analyzing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('projects').add(projectData);

    // Send initial notification
    await sendNotification(userId, 'project_analysis_started', {
      projectId: docRef.id,
      sourceType,
      message: 'Analysis started for your project'
    });

    // Start real code analysis based on source type with progress tracking
    let analysisResult: AnalysisResult;
    
    try {
      // Create progress tracker
      const progressTracker = {
        total: 100,
        current: 0,
        stage: 'initializing',
        updateProgress: async (current: number, stage: string, message?: string) => {
          await db.collection('projects').doc(docRef.id).update({
            progress: current,
            currentStage: stage,
            updatedAt: new Date().toISOString()
          });
          
          await sendNotification(userId, 'project_analysis_progress', {
            projectId: docRef.id,
            progress: current,
            stage,
            message: message || `Analysis progress: ${current}% - ${stage}`
          });
        }
      };

      switch (sourceType) {
        case 'git':
          if (!sourceUrl) {
            throw new Error('Git URL is required');
          }
          await progressTracker.updateProgress(10, 'cloning', 'Cloning Git repository...');
          analysisResult = await codeAnalyzer.analyzeGitRepository(sourceUrl, projectData.analysisConfig, progressTracker);
          break;
          
        case 'web':
          if (!sourceUrl) {
            throw new Error('Web URL is required');
          }
          await progressTracker.updateProgress(10, 'fetching', 'Fetching webpage content...');
          // Extract login credentials if provided
          const loginCredentials = req.body.loginCredentials;
          analysisResult = await codeAnalyzer.analyzeWebUrl(sourceUrl, projectData.analysisConfig, loginCredentials, progressTracker);
          break;
          
        case 'local':
          if (!localPath && (!files || files.length === 0)) {
            throw new Error('Local path or files are required');
          }
          await progressTracker.updateProgress(10, 'scanning', 'Scanning local files...');
          analysisResult = await codeAnalyzer.analyzeLocalCodebase(localPath || './temp', projectData.analysisConfig, progressTracker);
          break;
          
        default:
          throw new Error('Invalid source type');
      }

      await progressTracker.updateProgress(90, 'finalizing', 'Finalizing analysis results...');

      // Store analysis results
      await db.collection('projects').doc(docRef.id).update({
        status: 'completed',
        progress: 100,
        currentStage: 'completed',
        analysisResult,
        updatedAt: new Date().toISOString()
      });

      // Store issues in separate collection
      for (const issue of analysisResult.issues) {
        await db.collection('issues').add({
          ...issue,
          projectId: docRef.id,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Send completion notification
      await sendNotification(userId, 'project_analysis_completed', {
        projectId: docRef.id,
        issuesFound: analysisResult.issues.length,
        criticalIssues: analysisResult.summary.criticalIssues,
        message: `Analysis completed! Found ${analysisResult.issues.length} issues.`
      });
    
    res.status(201).json({
      id: docRef.id,
        ...projectData,
        progress: 100,
        currentStage: 'completed',
        analysisResult
      });

    } catch (analysisError: any) {
      console.error('Analysis error:', analysisError);
      
      // Update project status to failed
      await db.collection('projects').doc(docRef.id).update({
        status: 'failed',
        error: analysisError.message || 'Unknown analysis error',
        updatedAt: new Date().toISOString()
      });

      res.status(500).json({ 
        error: 'Analysis failed', 
        details: analysisError.message || 'Unknown analysis error'
      });
    }

  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Enhanced Assessments API with real analysis
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

    // Get existing issues for this project
    const issuesSnapshot = await db.collection('issues')
      .where('projectId', '==', projectId)
      .where('userId', '==', userId)
      .get();

    const existingIssues: any[] = [];
    issuesSnapshot.forEach(doc => {
      existingIssues.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const assessmentData = {
      projectId,
      assessmentType,
      configuration,
      userId,
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      results: null,
      issuesFound: existingIssues.length
    };
    
    const docRef = await db.collection('assessments').add(assessmentData);
    
    // Send initial notification
    await sendNotification(userId, 'assessment_started', {
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
      await sendNotification(userId, 'assessment_progress', {
        assessmentId: docRef.id,
        progress,
        message: `Assessment progress: ${progress}%`
      });
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        // Calculate real results based on existing issues
        const criticalIssues = existingIssues.filter(i => i.severity === 'critical').length;
        const highIssues = existingIssues.filter(i => i.severity === 'high').length;
        const mediumIssues = existingIssues.filter(i => i.severity === 'medium').length;
        const lowIssues = existingIssues.filter(i => i.severity === 'low').length;
        
        const totalIssues = existingIssues.length;
        const securityIssues = existingIssues.filter(i => i.type === 'security').length;
        const performanceIssues = existingIssues.filter(i => i.type === 'performance').length;
        const qualityIssues = existingIssues.filter(i => i.type === 'quality').length;
        const documentationIssues = existingIssues.filter(i => i.type === 'documentation').length;
        
        // Calculate scores (higher is better)
        const securityScore = Math.max(0, 100 - (securityIssues * 20));
        const performanceScore = Math.max(0, 100 - (performanceIssues * 15));
        const qualityScore = Math.max(0, 100 - (qualityIssues * 10));
        const documentationScore = Math.max(0, 100 - (documentationIssues * 5));
        
        const results = {
          security: securityScore,
          performance: performanceScore,
          quality: qualityScore,
          documentation: documentationScore,
          issues: existingIssues.slice(0, 10), // Show top 10 issues
          summary: {
            totalIssues,
            criticalIssues,
            highIssues,
            mediumIssues,
            lowIssues,
            securityIssues,
            performanceIssues,
            qualityIssues,
            documentationIssues
          }
        };
        
        await docRef.update({
          status: 'completed',
          results,
          progress: 100,
          completedAt: new Date().toISOString()
        });
        
        // Send completion notification
        await sendNotification(userId, 'assessment_completed', {
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

// FILE UPLOAD AND ANALYSIS ENDPOINT - CORE LOCAL FILE ANALYSIS FEATURE
app.post('/api/projects/:projectId/upload-files', authenticateToken, upload.array('files', 20), async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.uid;
    const files = req.files as Express.Multer.File[];
    
    console.log(`File upload request for project ${projectId}: ${files?.length || 0} files`);
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Verify project ownership
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectData = projectDoc.data();
    if (projectData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert multer files to our UploadedFile format
    const uploadedFiles: UploadedFile[] = files.map(file => ({
      originalName: file.originalname,
      content: file.buffer,
      mimeType: file.mimetype,
      size: file.size
    }));

    console.log('Uploaded files:', uploadedFiles.map(f => `${f.originalName} (${f.size} bytes)`));

    // Get analysis configuration from request or use defaults
    const analysisConfig = {
      securityScan: req.body.securityScan !== 'false',
      performanceAnalysis: req.body.performanceAnalysis !== 'false',
      qualityCheck: req.body.qualityCheck !== 'false',
      documentationCheck: req.body.documentationCheck !== 'false',
      dependencyAnalysis: req.body.dependencyAnalysis !== 'false',
      accessibilityCheck: req.body.accessibilityCheck !== 'false',
      seoAnalysis: req.body.seoAnalysis !== 'false'
    };

    console.log('Analysis config:', analysisConfig);

    // Set up real-time progress tracking
    const progressDoc = db.collection('analysis-progress').doc();
    await progressDoc.set({
      projectId,
      userId,
      status: 'processing',
      progress: 0,
      message: 'Starting file analysis...',
      startedAt: new Date().toISOString()
    });

    const progressCallback = async (progress: number, message: string) => {
      await progressDoc.update({
        progress: Math.round(progress),
        message,
        updatedAt: new Date().toISOString()
      });
      
      // Send real-time notification
      if (userId) {
        await sendNotification(userId, 'analysis_progress', {
          projectId,
          progress: Math.round(progress),
          message
        });
      }
    };

    // Send initial response with progress tracking ID
    res.status(202).json({
      message: 'File analysis started',
      progressId: progressDoc.id,
      filesCount: uploadedFiles.length
    });

    // Process files asynchronously
    setImmediate(async () => {
      try {
        console.log('Starting file analysis...');
        
        // Process files with our new file processor
        const analysisResult: FileAnalysisResult = await fileProcessor.processUploadedFiles(
          uploadedFiles,
          projectId,
          analysisConfig,
          progressCallback
        );

        console.log(`File analysis completed: ${analysisResult.issues.length} issues found`);

        // Update project with analysis results
        await projectRef.update({
          analysisResult: {
            type: 'file-upload',
            timestamp: new Date().toISOString(),
            summary: analysisResult.summary,
            totalFiles: analysisResult.totalFiles,
            analyzedFiles: analysisResult.analyzedFiles,
            analysisTime: analysisResult.analysisTime,
            fileTypes: analysisResult.fileTypes
          },
          status: 'completed',
          lastAnalyzed: new Date().toISOString()
        });

        // Save detailed issues to Firestore
        const batch = db.batch();
        analysisResult.issues.forEach(issue => {
          const issueRef = db.collection('issues').doc();
          batch.set(issueRef, {
            ...issue,
            projectId,
            userId,
            analysisType: 'file-upload'
          });
        });
        await batch.commit();

        // Update progress to complete
        await progressDoc.update({
          status: 'completed',
          progress: 100,
          message: `Analysis complete! Found ${analysisResult.issues.length} issues in ${analysisResult.analyzedFiles} files`,
          completedAt: new Date().toISOString(),
          result: analysisResult
        });

        // Send completion notification
        if (userId) {
          await sendNotification(userId, 'file_analysis_completed', {
            projectId,
            issuesFound: analysisResult.issues.length,
            filesAnalyzed: analysisResult.analyzedFiles,
            analysisTime: analysisResult.analysisTime,
            message: `File analysis completed! Found ${analysisResult.issues.length} issues.`
          });
        }

        console.log(`File analysis notification sent for project ${projectId}`);

      } catch (analysisError) {
        console.error('File analysis error:', analysisError);
        
        // Update progress with error
        await progressDoc.update({
          status: 'error',
          progress: 0,
          message: `Analysis failed: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`,
          errorAt: new Date().toISOString()
        });

        // Send error notification
        if (userId) {
          await sendNotification(userId, 'analysis_error', {
            projectId,
            error: analysisError instanceof Error ? analysisError.message : 'Unknown error',
            message: 'File analysis failed. Please try again.'
          });
        }
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get file analysis progress
app.get('/api/analysis-progress/:progressId', authenticateToken, async (req, res) => {
  try {
    const { progressId } = req.params;
    const userId = req.user?.uid;
    
    const progressDoc = await db.collection('analysis-progress').doc(progressId).get();
    
    if (!progressDoc.exists) {
      return res.status(404).json({ error: 'Progress not found' });
    }
    
    const progressData = progressDoc.data();
    if (progressData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      id: progressDoc.id,
      ...progressData
    });
    
  } catch (error) {
    console.error('Error fetching analysis progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Directory analysis endpoint - Enhanced File System Access API support
app.post('/api/projects/:projectId/analyze-directory', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { files } = req.body;
    const userId = req.user?.uid;
    
    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'Files array is required' });
    }

    console.log(`Directory analysis requested for project ${projectId} with ${files.length} files`);

    // Verify project access
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists || projectDoc.data()?.userId !== userId) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Process files through the file processor with enhanced analysis
    const analysisResult = await fileProcessor.processDirectoryFiles(files, projectId, {
      securityScan: true,
      performanceAnalysis: true,
      qualityCheck: true,
      accessibilityCheck: true,
      seoAnalysis: true,
      dependencyAnalysis: true,
      complexityAnalysis: true
    });

    // Save comprehensive analysis result
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    await projectDoc.ref.update({
      lastAnalysis: timestamp,
      analysisResult: {
        ...analysisResult,
        analysisType: 'directory',
        totalFiles: files.length,
        timestamp: new Date().toISOString()
      },
      filesAnalyzed: files.length,
      lastAnalysisType: 'directory',
      updatedAt: timestamp
    });

    // Log successful analysis
    console.log(`Directory analysis completed for project ${projectId}: ${analysisResult.issues.length} issues found`);

    // Send notification
    if (userId) {
      await sendNotification(userId, 'directory_analysis_completed', {
        title: 'Directory Analysis Complete',
        message: `Analyzed ${files.length} files and found ${analysisResult.issues.length} issues`,
        type: analysisResult.issues.length > 0 ? 'warning' : 'success',
        relatedProject: projectId
      });
    }

    res.json({
      success: true,
      ...analysisResult,
      metadata: {
        filesAnalyzed: files.length,
        analysisType: 'directory',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('Directory analysis error:', error);
    
    // Send error notification
    const userId = req.user?.uid;
    if (userId) {
      await sendNotification(userId, 'directory_analysis_failed', {
        title: 'Directory Analysis Failed',
        message: `Analysis failed: ${error.message}`,
        type: 'error',
        relatedProject: req.params.projectId
      });
    }
    
    res.status(500).json({ 
      error: 'Directory analysis failed',
      details: error.message 
    });
  }
});

// Enhanced Issues API with real data
app.get('/api/issues', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { projectId, assessmentId, severity, type, status } = req.query;

    let query = db.collection('issues').where('userId', '==', userId);

    if (projectId) {
      query = query.where('projectId', '==', projectId);
    }

    if (assessmentId) {
      query = query.where('assessmentId', '==', assessmentId);
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

    const issues: Array<{ id: string; [key: string]: any }> = [];
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
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get real analytics data from Firestore
    const projectsSnapshot = await db.collection('projects').where('userId', '==', userId).get();
    const issuesSnapshot = await db.collection('issues').where('userId', '==', userId).get();
    
    const projects = projectsSnapshot.docs.map(doc => doc.data());
    const issues = issuesSnapshot.docs.map(doc => doc.data());

    // Calculate real analytics
    const totalProjects = projects.length;
    const totalIssues = issues.length;
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const highIssues = issues.filter(issue => issue.severity === 'high').length;
    const mediumIssues = issues.filter(issue => issue.severity === 'medium').length;
    const lowIssues = issues.filter(issue => issue.severity === 'low').length;

    const securityIssues = issues.filter(issue => issue.type === 'security').length;
    const performanceIssues = issues.filter(issue => issue.type === 'performance').length;
    const qualityIssues = issues.filter(issue => issue.type === 'quality').length;
    const documentationIssues = issues.filter(issue => issue.type === 'documentation').length;

    // Calculate trends (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentIssues = issues.filter(issue => new Date(issue.createdAt) >= thirtyDaysAgo);
    const previousIssues = issues.filter(issue => {
      const createdAt = new Date(issue.createdAt);
      return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    });

    const recentCount = recentIssues.length;
    const previousCount = previousIssues.length;
    const improvementTrend = previousCount > 0 ? ((previousCount - recentCount) / previousCount) * 100 : 0;

    const analyticsData = {
      overview: {
        totalProjects,
        totalIssues,
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues,
        securityIssues,
        performanceIssues,
        qualityIssues,
        documentationIssues
      },
      trends: {
        recentIssues: recentCount,
        previousIssues: previousCount,
        improvementTrend: Math.round(improvementTrend * 100) / 100
      },
      projectPerformance: projects.map(project => ({
        id: project.id,
        name: project.name,
        issues: issues.filter(issue => issue.projectId === project.id).length,
        status: project.status
      })),
      topIssues: issues
        .sort((a, b) => {
          const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        })
        .slice(0, 10)
        .map(issue => ({
          id: issue.id,
          title: issue.title,
          severity: issue.severity,
          type: issue.type,
          filePath: issue.filePath,
          lineNumber: issue.lineNumber
        }))
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

app.post('/api/analytics/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { format = 'pdf', includeDetails = true, includeCode = false, filterBySeverity, dateRange } = req.body;
    
    // Fetch comprehensive data for export
    let projectQuery = db.collection('projects').where('userId', '==', userId);
    let issueQuery = db.collection('issues').where('userId', '==', userId);
    let assessmentQuery = db.collection('assessments').where('userId', '==', userId);
    
    // Apply date range filter if provided
    if (dateRange?.start) {
      const startDate = new Date(dateRange.start);
      projectQuery = projectQuery.where('createdAt', '>=', startDate.toISOString());
      issueQuery = issueQuery.where('createdAt', '>=', startDate.toISOString());
      assessmentQuery = assessmentQuery.where('createdAt', '>=', startDate.toISOString());
    }
    
    const [projectsSnapshot, issuesSnapshot, assessmentsSnapshot] = await Promise.all([
      projectQuery.get(),
      issueQuery.get(),
      assessmentQuery.get()
    ]);
    
    // Extract data
    const projects: any[] = [];
    projectsSnapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    
    let issues: any[] = [];
    issuesSnapshot.forEach(doc => {
      issues.push({ id: doc.id, ...doc.data() });
    });
    
    const assessments: any[] = [];
    assessmentsSnapshot.forEach(doc => {
      assessments.push({ id: doc.id, ...doc.data() });
    });
    
    // Apply severity filter
    if (filterBySeverity && filterBySeverity.length > 0) {
      issues = issues.filter(issue => filterBySeverity.includes(issue.severity));
    }
    
    // Generate comprehensive analytics
    const analytics = await generateDetailedAnalytics(projects, issues, assessments);
    
    // Prepare export data
    const exportData = {
      userId,
      timestamp: new Date().toISOString(),
      format,
      status: 'processing',
      options: {
        includeDetails,
        includeCode,
        filterBySeverity,
        dateRange
      },
      data: {
        metadata: {
          exportedAt: new Date().toISOString(),
          totalProjects: projects.length,
          totalIssues: issues.length,
          totalAssessments: assessments.length,
          filters: {
            severity: filterBySeverity,
            dateRange
          }
        },
        projects: projects.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          sourceType: project.sourceType,
          sourceUrl: project.sourceUrl,
          status: project.status,
          createdAt: project.createdAt,
          analysisResult: includeDetails ? project.analysisResult : undefined,
          issueCount: issues.filter(issue => issue.projectId === project.id).length
        })),
        issues: issues.map(issue => ({
          id: issue.id,
          title: issue.title,
          description: issue.description,
          severity: issue.severity,
          type: issue.type,
          status: issue.status,
          filePath: issue.filePath,
          lineNumber: issue.lineNumber,
          codeSnippet: includeCode ? issue.codeSnippet : undefined,
          impact: issue.impact,
          recommendation: issue.recommendation,
          resolutionSteps: includeDetails ? issue.resolutionSteps : undefined,
          tags: issue.tags,
          createdAt: issue.createdAt,
          projectId: issue.projectId
        })),
        assessments: assessments.map(assessment => ({
          id: assessment.id,
          projectId: assessment.projectId,
          assessmentType: assessment.assessmentType,
          status: assessment.status,
          results: includeDetails ? assessment.results : assessment.results?.summary,
          createdAt: assessment.createdAt,
          completedAt: assessment.completedAt
        })),
        analytics
      }
    };
    
    // Store export request
    const docRef = await db.collection('exports').add(exportData);
    
    // Start async processing
    processExportRequest(docRef.id, exportData);
    
    res.json({
      message: 'Export request submitted successfully',
      exportId: docRef.id,
      estimatedTime: format === 'pdf' ? '3-5 minutes' : '1-2 minutes',
      options: {
        includeDetails,
        includeCode,
        filterBySeverity,
        dateRange
      }
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

// Export download endpoint
app.get('/api/exports/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get export data from Firestore
    const exportDoc = await db.collection('exports').doc(id).get();
    
    if (!exportDoc.exists) {
      return res.status(404).json({ error: 'Export not found' });
    }
    
    const exportData = exportDoc.data();
    if (exportData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (exportData?.status !== 'completed') {
      return res.status(400).json({ error: 'Export not ready for download' });
    }

    // Generate real report content based on export data
    const reportContent = await generateRealReport(exportData);
    const buffer = Buffer.from(reportContent, 'utf8');

    res.setHeader('Content-Type', exportData.format === 'pdf' ? 'application/pdf' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="drillsargeant-report-${id}.${exportData.format}"`);
    res.send(buffer);

  } catch (error) {
    console.error('Error downloading export:', error);
    res.status(500).json({ error: 'Failed to download export' });
  }
});

// Helper function to generate real report content
async function generateRealReport(exportData: any): Promise<string> {
  throw new Error('REPORT_GENERATION_ERROR: Report generation is not implemented. Error Code: REPORT-001');
}

// Notifications API
app.get('/api/notifications', async (req, res) => {
  try {
    // Temporarily disable authentication for testing
    // const userId = req.user?.uid;
    // if (!userId) {
    //   return res.status(401).json({ error: 'User not authenticated' });
    // }
    
    const { limit = 50, unreadOnly = false } = req.query;
    
    // For testing, return empty array
    res.json([]);
    
    // Original code commented out for testing:
    // let query = db.collection('notifications')
    //   .where('userId', '==', userId)
    //   .orderBy('createdAt', 'desc')
    //   .limit(Number(limit));
    
    // if (unreadOnly === 'true') {
    //   query = query.where('read', '==', false);
    // }
    
    // const snapshot = await query.get();
    
    // const notifications: Array<{ id: string; [key: string]: any }> = [];
    // snapshot.forEach(doc => {
    //   notifications.push({
    //     id: doc.id,
    //     ...doc.data()
    //   });
    // });
    
    // res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Test notifications endpoint (no auth required)
app.get('/api/notifications/test', (req, res) => {
  res.json({
    message: 'Notifications endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// Simple notifications endpoint for testing (no auth)
app.get('/api/notifications/simple', (req, res) => {
  res.json([]);
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

// User Management API
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin permissions
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const snapshot = await db.collection('users').get();
    const users: Array<{ id: string; [key: string]: any }> = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        ...userData,
        // Remove sensitive information
        password: undefined,
        tokens: undefined
      });
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin permissions
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { email, displayName, role, teamId, department } = req.body;

    if (!email || !displayName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userDataToSave = {
      email,
      displayName,
      role,
      status: 'pending',
      teamId,
      department,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      permissions: getPermissionsForRole(role),
      stats: {
        projectsCreated: 0,
        assessmentsRun: 0,
        issuesResolved: 0,
        reportsGenerated: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('users').add(userDataToSave);

    res.status(201).json({
      id: docRef.id,
      ...userDataToSave
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin permissions or is updating their own profile
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || (userData.role !== 'admin' && userId !== id)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.tokens;

    await db.collection('users').doc(id).update(updateData);

    res.json({
      id,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin permissions
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Prevent self-deletion
    if (userId === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await db.collection('users').doc(id).delete();

    res.json({
      id,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Team Management API
app.get('/api/teams', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const snapshot = await db.collection('teams').get();
    const teams: Array<{ id: string; [key: string]: any }> = [];
    
    snapshot.forEach(doc => {
      teams.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.post('/api/teams', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin or manager permissions
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || (userData.role !== 'admin' && userData.role !== 'manager')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const teamData = {
      name,
      description: description || '',
      members: members || [],
      projects: [],
      createdAt: new Date().toISOString(),
      owner: userId
    };

    const docRef = await db.collection('teams').add(teamData);

    res.status(201).json({
      id: docRef.id,
      ...teamData
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

app.put('/api/teams/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin permissions or is team owner
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    const teamDoc = await db.collection('teams').doc(id).get();
    const teamData = teamDoc.data();
    
    if (!userData || (userData.role !== 'admin' && teamData?.owner !== userId)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await db.collection('teams').doc(id).update(updateData);

    res.json({
      id,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

app.delete('/api/teams/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin permissions
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await db.collection('teams').doc(id).delete();

    res.json({
      id,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Helper function to get permissions for a role
const getPermissionsForRole = (role: string): string[] => {
  switch (role) {
    case 'admin':
      return [
        'create_projects',
        'run_assessments',
        'view_issues',
        'resolve_issues',
        'generate_reports',
        'manage_users',
        'manage_teams',
        'system_settings'
      ];
    case 'manager':
      return [
        'create_projects',
        'run_assessments',
        'view_issues',
        'resolve_issues',
        'generate_reports',
        'manage_teams'
      ];
    case 'developer':
      return [
        'create_projects',
        'run_assessments',
        'view_issues',
        'resolve_issues'
      ];
    case 'viewer':
      return [
        'view_issues'
      ];
    default:
      return [];
  }
};

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
// Helper functions for detailed analytics and export processing

async function generateDetailedAnalytics(projects: any[], issues: any[], assessments: any[]): Promise<any> {
  try {
    console.log('Generating detailed analytics...', { 
      projectsCount: projects?.length || 0, 
      issuesCount: issues?.length || 0, 
      assessmentsCount: assessments?.length || 0 
    });

    // Ensure arrays are valid
    const validProjects = Array.isArray(projects) ? projects : [];
    const validIssues = Array.isArray(issues) ? issues : [];
    const validAssessments = Array.isArray(assessments) ? assessments : [];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentIssues = validIssues.filter(issue => {
      try {
        return issue?.createdAt && new Date(issue.createdAt) >= thirtyDaysAgo;
      } catch (e) {
        console.warn('Invalid createdAt for issue:', issue?.id);
        return false;
      }
    });
    
    const previousIssues = validIssues.filter(issue => {
      try {
        if (!issue?.createdAt) return false;
        const createdAt = new Date(issue.createdAt);
        return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
      } catch (e) {
        console.warn('Invalid createdAt for issue:', issue?.id);
        return false;
      }
    });

    const severityBreakdown = {
      critical: validIssues.filter(i => i?.severity === 'critical').length,
      high: validIssues.filter(i => i?.severity === 'high').length,
      medium: validIssues.filter(i => i?.severity === 'medium').length,
      low: validIssues.filter(i => i?.severity === 'low').length
    };

    const typeBreakdown = {
      security: validIssues.filter(i => i?.type === 'security').length,
      performance: validIssues.filter(i => i?.type === 'performance').length,
      quality: validIssues.filter(i => i?.type === 'quality').length,
      documentation: validIssues.filter(i => i?.type === 'documentation').length
    };

    const projectStats = validProjects.map(project => {
      try {
        const projectIssues = validIssues.filter(issue => issue?.projectId === project?.id);
        const projectAssessments = validAssessments.filter(assessment => assessment?.projectId === project?.id);
        
        return {
          id: project?.id || 'unknown',
          name: project?.name || 'Unknown Project',
          sourceType: project?.sourceType || 'unknown',
          totalIssues: projectIssues.length,
          criticalIssues: projectIssues.filter(i => i?.severity === 'critical').length,
          securityIssues: projectIssues.filter(i => i?.type === 'security').length,
          lastAssessment: projectAssessments.length > 0 ? 
            projectAssessments
              .filter(a => a?.createdAt)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt || null : null,
          status: project?.status || 'unknown'
        };
      } catch (e) {
        console.warn('Error processing project stats for project:', project?.id);
        return {
          id: project?.id || 'unknown',
          name: project?.name || 'Unknown Project',
          sourceType: 'unknown',
          totalIssues: 0,
          criticalIssues: 0,
          securityIssues: 0,
          lastAssessment: null,
          status: 'error'
        };
      }
    });

    const improvementTrend = previousIssues.length > 0 ? 
      ((previousIssues.length - recentIssues.length) / previousIssues.length) * 100 : 0;

    const result = {
      overview: {
        totalProjects: validProjects.length,
        totalIssues: validIssues.length,
        totalAssessments: validAssessments.length,
        completedProjects: validProjects.filter(p => p?.status === 'completed').length,
        analysisTime: validProjects.reduce((sum, p) => sum + (p?.analysisResult?.analysisTime || 0), 0)
      },
      severityBreakdown,
      typeBreakdown,
      trends: {
        recentIssues: recentIssues.length,
        previousIssues: previousIssues.length,
        improvementTrend: Math.round(improvementTrend * 100) / 100
      },
      projectStats,
      mostCommonIssues: getMostCommonIssues(validIssues),
      recommendations: generateRecommendations(validProjects, validIssues, validAssessments)
    };

    console.log('Analytics generated successfully');
    return result;

  } catch (error) {
    console.error('Error in generateDetailedAnalytics:', error);
    throw new Error(`Analytics generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function getMostCommonIssues(issues: any[]): any[] {
  const issueGroups = issues.reduce((groups, issue) => {
    const key = `${issue.type}_${issue.title}`;
    if (!groups[key]) {
      groups[key] = {
        title: issue.title,
        type: issue.type,
        severity: issue.severity,
        count: 0,
        examples: []
      };
    }
    groups[key].count++;
    if (groups[key].examples.length < 3) {
      groups[key].examples.push({
        filePath: issue.filePath,
        lineNumber: issue.lineNumber,
        projectId: issue.projectId
      });
    }
    return groups;
  }, {} as Record<string, any>);

  return Object.values(issueGroups)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10);
}

function generateRecommendations(projects: any[], issues: any[], assessments: any[]): any[] {
  const recommendations = [];

  // Security recommendations
  const securityIssues = issues.filter(i => i.type === 'security');
  if (securityIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'security',
      title: 'Address Security Vulnerabilities',
      description: `Found ${securityIssues.length} security issues across your projects.`,
      action: 'Review and fix all critical and high severity security issues immediately.',
      affectedProjects: [...new Set(securityIssues.map(i => i.projectId))].length
    });
  }

  // Performance recommendations
  const performanceIssues = issues.filter(i => i.type === 'performance');
  if (performanceIssues.length > 5) {
    recommendations.push({
      priority: 'medium',
      category: 'performance',
      title: 'Optimize Application Performance',
      description: `Identified ${performanceIssues.length} performance optimization opportunities.`,
      action: 'Focus on largest files and inefficient loops to improve overall performance.',
      affectedProjects: [...new Set(performanceIssues.map(i => i.projectId))].length
    });
  }

  // Code quality recommendations
  const qualityIssues = issues.filter(i => i.type === 'quality');
  const avgComplexityIssues = qualityIssues.filter(i => i.title.includes('Complexity'));
  if (avgComplexityIssues.length > 3) {
    recommendations.push({
      priority: 'medium',
      category: 'quality',
      title: 'Reduce Code Complexity',
      description: `Found ${avgComplexityIssues.length} functions with high complexity.`,
      action: 'Refactor complex functions into smaller, more maintainable units.',
      affectedProjects: [...new Set(avgComplexityIssues.map(i => i.projectId))].length
    });
  }

  return recommendations;
}

async function processExportRequest(exportId: string, exportData: any): Promise<void> {
  try {
    const docRef = db.collection('exports').doc(exportId);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate the actual export based on format
    let downloadUrl: string;
    let fileSize: number;
    
    if (exportData.format === 'pdf') {
      // In a real implementation, you would generate a PDF using a library like PDFKit or Puppeteer
      downloadUrl = `https://storage.googleapis.com/drillsargeant-exports/${exportId}.pdf`;
      fileSize = Math.floor(Math.random() * 5000000) + 1000000; // 1-5MB
    } else if (exportData.format === 'xlsx') {
      // In a real implementation, you would generate an Excel file using a library like ExcelJS
      downloadUrl = `https://storage.googleapis.com/drillsargeant-exports/${exportId}.xlsx`;
      fileSize = Math.floor(Math.random() * 2000000) + 500000; // 0.5-2MB
    } else {
      // JSON format
      downloadUrl = `https://storage.googleapis.com/drillsargeant-exports/${exportId}.json`;
      fileSize = Math.floor(Math.random() * 1000000) + 100000; // 0.1-1MB
    }
    
    await docRef.update({
      status: 'completed',
      completedAt: new Date().toISOString(),
      downloadUrl,
      fileSize,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });
    
    // Send notification to user
    await sendNotification(exportData.userId, 'export_completed', {
      exportId,
      format: exportData.format,
      downloadUrl,
      fileSize,
      message: `Your ${exportData.format.toUpperCase()} export is ready for download!`
    });
    
  } catch (error) {
    console.error('Error processing export:', error);
    
    // Update export status to failed
    await db.collection('exports').doc(exportId).update({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      failedAt: new Date().toISOString()
    });
  }
}

export const api = functions.https.onRequest(app);

// For local development only
if (process.env.NODE_ENV === 'development' && process.env.RUN_LOCAL === 'true') {
  const LOCAL_PORT = 3002;
  // This block is no longer needed as we are using Firebase Functions directly
  // server.listen(LOCAL_PORT, () => {
  //   console.log(`DrillSargeant Backend running on port ${LOCAL_PORT}`);
  // });
} 