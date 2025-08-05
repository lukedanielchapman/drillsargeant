import * as path from 'path';
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { MobileAnalyzer } from './mobile-analyzer';

export interface MobileFileChangeEvent {
  filePath: string;
  eventType: 'created' | 'modified' | 'deleted';
  timestamp: number;
}

export interface MobileMonitoringConfig {
  enableRealTimeAnalysis: boolean;
  analysisInterval: number;
  maxFileSize: number;
}

export interface MobileMonitoringResult {
  scannedFiles: number;
  issuesFound: number;
  analysisTime: number;
  lastScan: Date;
}

export class MobileFileWatcher {
  private isMonitoring: boolean = false;
  private monitoringCallbacks: ((event: MobileFileChangeEvent) => void)[] = [];
  private analysisCallbacks: ((result: MobileMonitoringResult) => void)[] = [];
  private mobileAnalyzer: MobileAnalyzer;

  constructor(_config: MobileMonitoringConfig) {
    this.mobileAnalyzer = new MobileAnalyzer();
  }

  /**
   * Start monitoring mobile project files
   */
  async startMonitoring(projectPath: string): Promise<void> {
    if (this.isMonitoring) {
      console.log('Mobile monitoring is already active');
      return;
    }

    try {
      console.log('Starting mobile file monitoring...');
      this.isMonitoring = true;

      // Perform initial scan
      const files = await this.scanMobileFiles(projectPath);
      console.log(`Found ${files.length} mobile files to monitor`);

      // Set up file watchers (simulated for now)
      await this.setupFileWatchers(projectPath);

      // Perform initial analysis
      await this.performRealTimeAnalysis(files);

      console.log('Mobile file monitoring started successfully');

    } catch (error) {
      console.error('Failed to start mobile monitoring:', error);
      this.isMonitoring = false;
      throw error;
    }
  }

  /**
   * Stop monitoring mobile project files
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      console.log('Mobile monitoring is not active');
      return;
    }

    try {
      console.log('Stopping mobile file monitoring...');
      this.isMonitoring = false;
      console.log('Mobile file monitoring stopped successfully');

    } catch (error) {
      console.error('Failed to stop mobile monitoring:', error);
      throw error;
    }
  }

  /**
   * Add callback for file change events
   */
  onFileChange(callback: (event: MobileFileChangeEvent) => void): void {
    this.monitoringCallbacks.push(callback);
  }

  /**
   * Add callback for analysis results
   */
  onAnalysisResult(callback: (result: MobileMonitoringResult) => void): void {
    this.analysisCallbacks.push(callback);
  }

  /**
   * Scan for mobile files in the project
   */
  private async scanMobileFiles(projectPath: string): Promise<string[]> {
    const mobileFiles: string[] = [];
    
    const scanDirectory = async (currentPath: string) => {
      try {
        const entries = await readDir(currentPath);
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          
          // Check if it's a directory
          try {
            await readDir(fullPath);
            // If successful, it's a directory, so scan recursively
            await scanDirectory(fullPath);
          } catch {
            // If readDir fails, it's a file
            if (this.isMobileFile(entry.name)) {
              mobileFiles.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to scan directory ${currentPath}:`, error);
      }
    };
    
    await scanDirectory(projectPath);
    return mobileFiles;
  }

  /**
   * Check if file is a mobile development file
   */
  private isMobileFile(fileName: string): boolean {
    const mobileExtensions = [
      '.dart', '.swift', '.java', '.kt', '.ktm',
      '.js', '.jsx', '.ts', '.tsx', '.vue',
      '.xml', '.gradle', '.plist', '.xcconfig',
      '.pbxproj', '.storyboard', '.xib'
    ];
    
    const excludePatterns = [
      'node_modules', 'build', 'dist', '.git',
      'Pods', 'DerivedData', '.DS_Store'
    ];
    
    const ext = path.extname(fileName).toLowerCase();
    const name = fileName.toLowerCase();
    
    // Check if file should be excluded
    for (const pattern of excludePatterns) {
      if (name.includes(pattern)) {
        return false;
      }
    }
    
    return mobileExtensions.includes(ext);
  }

  /**
   * Set up file watchers (simulated)
   */
  private async setupFileWatchers(_projectPath: string): Promise<void> {
    // In a real implementation, this would set up actual file system watchers
    // For now, we'll simulate the setup
    console.log('Setting up file watchers...');
    
    // Simulate file watcher setup
    setTimeout(() => {
      console.log('File watchers configured');
    }, 1000);
  }

  /**
   * Perform real-time analysis on mobile files
   */
  private async performRealTimeAnalysis(files: string[]): Promise<void> {
    if (!this.isMonitoring) return;

    try {
      console.log('Performing real-time analysis...');
      
      const analysisStats = {
        totalFiles: files.length,
        analyzedFiles: 0,
        issuesFound: 0,
        securityIssues: 0,
        performanceIssues: 0,
        qualityIssues: 0
      };

      for (const file of files) {
        try {
          const content = await readTextFile(file);
          const ext = path.extname(file).toLowerCase();
          
          // Analyze based on file type
          if (ext === '.dart') {
            const result = await this.mobileAnalyzer.analyzeFlutterFile(file, content);
            analysisStats.analyzedFiles++;
            analysisStats.issuesFound += result.summary.totalIssues;
            analysisStats.securityIssues += result.summary.securityIssues;
            analysisStats.performanceIssues += result.summary.performanceIssues;
            analysisStats.qualityIssues += result.summary.qualityIssues;
          } else if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
            const result = await this.mobileAnalyzer.analyzeReactNativeFile(file, content);
            analysisStats.analyzedFiles++;
            analysisStats.issuesFound += result.summary.totalIssues;
            analysisStats.securityIssues += result.summary.securityIssues;
            analysisStats.performanceIssues += result.summary.performanceIssues;
            analysisStats.qualityIssues += result.summary.qualityIssues;
          }
        } catch (error) {
          console.warn(`Failed to analyze ${file}:`, error);
        }
      }

      // Notify callbacks with analysis results
      const monitoringResult: MobileMonitoringResult = {
        scannedFiles: files.length,
        issuesFound: analysisStats.issuesFound,
        analysisTime: 0, // No specific analysis time in real-time
        lastScan: new Date()
      };

      this.analysisCallbacks.forEach(callback => callback(monitoringResult));

    } catch (error) {
      console.error('Real-time analysis failed:', error);
    }
  }
} 