import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/plugin-shell';
import * as path from 'path';
import { MobileAnalyzer } from './mobile-analyzer';
import { AdvancedMobileAnalyzer } from './advanced-mobile-analyzer';
import { MobileDependencyAnalyzer } from './mobile-dependency-analyzer';

export interface MobileFileChangeEvent {
  type: 'added' | 'modified' | 'deleted';
  filePath: string;
  timestamp: Date;
  framework: 'flutter' | 'react-native' | 'ios' | 'android' | 'unknown';
  analysisResult?: any;
}

export interface MobileMonitoringConfig {
  watchDirectories: string[];
  fileExtensions: string[];
  analysisInterval: number; // milliseconds
  enableRealTimeAnalysis: boolean;
  enableDependencyMonitoring: boolean;
  enableHotReloadAnalysis: boolean;
}

export interface MobileMonitoringResult {
  isActive: boolean;
  watchedFiles: number;
  lastAnalysis: Date | null;
  recentChanges: MobileFileChangeEvent[];
  analysisStats: {
    totalFilesAnalyzed: number;
    issuesFound: number;
    securityIssues: number;
    performanceIssues: number;
    accessibilityIssues: number;
  };
}

export class MobileFileWatcher {
  private mobileAnalyzer: MobileAnalyzer;
  private advancedMobileAnalyzer: AdvancedMobileAnalyzer;
  private mobileDependencyAnalyzer: MobileDependencyAnalyzer;
  private config: MobileMonitoringConfig;
  private isWatching: boolean = false;
  private watchedFiles: Set<string> = new Set();
  private recentChanges: MobileFileChangeEvent[] = [];
  private analysisStats = {
    totalFilesAnalyzed: 0,
    issuesFound: 0,
    securityIssues: 0,
    performanceIssues: 0,
    accessibilityIssues: 0
  };
  private lastAnalysis: Date | null = null;
  private changeCallbacks: ((event: MobileFileChangeEvent) => void)[] = [];
  private analysisCallbacks: ((result: any) => void)[] = [];

  constructor(config: MobileMonitoringConfig) {
    this.mobileAnalyzer = new MobileAnalyzer();
    this.advancedMobileAnalyzer = new AdvancedMobileAnalyzer();
    this.mobileDependencyAnalyzer = new MobileDependencyAnalyzer();
    this.config = config;
  }

  /**
   * Start monitoring mobile development project
   */
  async startMonitoring(projectPath: string): Promise<void> {
    if (this.isWatching) {
      console.warn('Mobile file watcher is already active');
      return;
    }

    console.log('🚀 Starting mobile file monitoring...');
    this.isWatching = true;

    try {
      // Initial scan of project
      await this.performInitialScan(projectPath);

      // Set up file system watchers
      await this.setupFileWatchers(projectPath);

      // Start periodic analysis
      this.startPeriodicAnalysis(projectPath);

      console.log('✅ Mobile file monitoring started successfully');
    } catch (error) {
      console.error('Failed to start mobile file monitoring:', error);
      this.isWatching = false;
      throw error;
    }
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isWatching) {
      return;
    }

    console.log('🛑 Stopping mobile file monitoring...');
    this.isWatching = false;
    
    // Clear intervals and watchers
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    console.log('✅ Mobile file monitoring stopped');
  }

  /**
   * Perform initial scan of mobile project
   */
  private async performInitialScan(projectPath: string): Promise<void> {
    console.log('📁 Performing initial mobile project scan...');
    
    const files = await this.scanMobileFiles(projectPath);
    this.watchedFiles = new Set(files);
    
    console.log(`📊 Found ${files.length} mobile files to monitor`);
    
    // Perform initial analysis
    await this.performComprehensiveAnalysis(projectPath, files);
  }

  /**
   * Scan for mobile development files
   */
  private async scanMobileFiles(projectPath: string): Promise<string[]> {
    const mobileFiles: string[] = [];
    
    const scanRecursive = async (dirPath: string) => {
      try {
        const entries = await readDir(dirPath, { recursive: true });
        
        for (const entry of entries) {
          if (entry.children) {
            // Directory
            await scanRecursive(entry.path);
          } else {
            // File
            const ext = path.extname(entry.path).toLowerCase();
            if (this.isMobileFile(entry.path, ext)) {
              mobileFiles.push(entry.path);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to scan directory ${dirPath}:`, error);
      }
    };

    await scanRecursive(projectPath);
    return mobileFiles;
  }

  /**
   * Check if file is a mobile development file
   */
  private isMobileFile(filePath: string, ext: string): boolean {
    const mobileExtensions = [
      // Flutter/Dart
      '.dart', '.yaml', '.yml',
      // React Native
      '.js', '.jsx', '.ts', '.tsx', '.json',
      // iOS/Swift
      '.swift', '.m', '.h', '.mm', '.plist', '.storyboard', '.xib',
      // Android/Java/Kotlin
      '.java', '.kt', '.xml', '.gradle', '.properties',
      // Xamarin
      '.cs', '.xaml', '.axml',
      // Cordova/PhoneGap
      '.html', '.css', '.js', '.config.xml',
      // NativeScript
      '.xml', '.js', '.ts',
      // Ionic
      '.html', '.scss', '.ts', '.js'
    ];

    return mobileExtensions.includes(ext);
  }

  /**
   * Set up file system watchers
   */
  private async setupFileWatchers(projectPath: string): Promise<void> {
    // In a real implementation, this would use platform-specific file system watchers
    // For now, we'll simulate with polling
    console.log('👀 Setting up file system watchers...');
    
    // Monitor for new files
    setInterval(async () => {
      if (!this.isWatching) return;
      
      try {
        const currentFiles = await this.scanMobileFiles(projectPath);
        const newFiles = currentFiles.filter(file => !this.watchedFiles.has(file));
        
        for (const file of newFiles) {
          await this.handleFileChange('added', file);
        }
      } catch (error) {
        console.warn('Error checking for new files:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Start periodic analysis
   */
  private startPeriodicAnalysis(projectPath: string): void {
    if (this.config.analysisInterval > 0) {
      this.analysisInterval = setInterval(async () => {
        if (!this.isWatching) return;
        
        try {
          const files = Array.from(this.watchedFiles);
          await this.performComprehensiveAnalysis(projectPath, files);
        } catch (error) {
          console.warn('Error during periodic analysis:', error);
        }
      }, this.config.analysisInterval);
    }
  }

  /**
   * Handle file change event
   */
  private async handleFileChange(type: 'added' | 'modified' | 'deleted', filePath: string): Promise<void> {
    const framework = this.detectMobileFramework(filePath);
    const event: MobileFileChangeEvent = {
      type,
      filePath,
      timestamp: new Date(),
      framework
    };

    // Add to recent changes
    this.recentChanges.unshift(event);
    if (this.recentChanges.length > 100) {
      this.recentChanges = this.recentChanges.slice(0, 100);
    }

    // Update watched files
    if (type === 'added') {
      this.watchedFiles.add(filePath);
    } else if (type === 'deleted') {
      this.watchedFiles.delete(filePath);
    }

    // Perform real-time analysis if enabled
    if (this.config.enableRealTimeAnalysis && type !== 'deleted') {
      try {
        const content = await readTextFile(filePath);
        const analysisResult = await this.performRealTimeAnalysis(filePath, content, framework);
        event.analysisResult = analysisResult;
      } catch (error) {
        console.warn(`Failed to analyze ${filePath}:`, error);
      }
    }

    // Notify callbacks
    this.changeCallbacks.forEach(callback => callback(event));
  }

  /**
   * Detect mobile framework from file path
   */
  private detectMobileFramework(filePath: string): 'flutter' | 'react-native' | 'ios' | 'android' | 'unknown' {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.dart' || ext === '.yaml' || ext === '.yml') {
      return 'flutter';
    }
    
    if (ext === '.swift' || ext === '.m' || ext === '.h' || ext === '.mm' || 
        ext === '.plist' || ext === '.storyboard' || ext === '.xib') {
      return 'ios';
    }
    
    if (ext === '.java' || ext === '.kt' || ext === '.xml' || 
        ext === '.gradle' || ext === '.properties') {
      return 'android';
    }
    
    if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx' || ext === '.json') {
      return 'react-native';
    }
    
    return 'unknown';
  }

  /**
   * Perform real-time analysis on changed file
   */
  private async performRealTimeAnalysis(
    filePath: string, 
    content: string, 
    framework: string
  ): Promise<any> {
    const ext = path.extname(filePath).toLowerCase();
    const analysisResult: any = {};

    try {
      // Basic mobile analysis
      if (ext === '.dart') {
        analysisResult.mobileAnalysis = await this.mobileAnalyzer.analyzeFlutterFile(filePath, content);
      } else if (ext === '.swift' || ext === '.m' || ext === '.h' || ext === '.mm') {
        analysisResult.mobileAnalysis = await this.mobileAnalyzer.analyzeIOSFile(filePath, content);
      } else if (ext === '.java' || ext === '.kt') {
        analysisResult.mobileAnalysis = await this.mobileAnalyzer.analyzeAndroidFile(filePath, content);
      } else if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx') {
        if (content.includes('react-native')) {
          analysisResult.mobileAnalysis = await this.mobileAnalyzer.analyzeReactNativeFile(filePath, content);
        }
      }

      // Advanced mobile analysis
      if (ext === '.dart') {
        analysisResult.advancedSecurity = await this.advancedMobileAnalyzer.analyzeFlutterAdvancedSecurity(content, filePath);
        analysisResult.advancedPerformance = await this.advancedMobileAnalyzer.analyzeFlutterAdvancedPerformance(content, filePath);
        analysisResult.advancedAccessibility = await this.advancedMobileAnalyzer.analyzeFlutterAdvancedAccessibility(content, filePath);
      } else if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx') {
        if (content.includes('react-native')) {
          analysisResult.advancedSecurity = await this.advancedMobileAnalyzer.analyzeReactNativeAdvancedSecurity(content, filePath);
          analysisResult.advancedPerformance = await this.advancedMobileAnalyzer.analyzeReactNativeAdvancedPerformance(content, filePath);
          analysisResult.advancedAccessibility = await this.advancedMobileAnalyzer.analyzeReactNativeAdvancedAccessibility(content, filePath);
        }
      }

      // Update analysis stats
      this.updateAnalysisStats(analysisResult);

      // Notify analysis callbacks
      this.analysisCallbacks.forEach(callback => callback(analysisResult));

    } catch (error) {
      console.warn(`Failed to perform real-time analysis on ${filePath}:`, error);
    }

    return analysisResult;
  }

  /**
   * Perform comprehensive analysis
   */
  private async performComprehensiveAnalysis(projectPath: string, files: string[]): Promise<void> {
    console.log(`🔍 Performing comprehensive analysis on ${files.length} files...`);
    
    const analysisPromises = files.map(async (filePath) => {
      try {
        const content = await readTextFile(filePath);
        const framework = this.detectMobileFramework(filePath);
        return await this.performRealTimeAnalysis(filePath, content, framework);
      } catch (error) {
        console.warn(`Failed to analyze ${filePath}:`, error);
        return null;
      }
    });

    const results = await Promise.all(analysisPromises);
    const validResults = results.filter(result => result !== null);

    // Update last analysis timestamp
    this.lastAnalysis = new Date();

    console.log(`✅ Comprehensive analysis complete. Analyzed ${validResults.length} files.`);
  }

  /**
   * Update analysis statistics
   */
  private updateAnalysisStats(analysisResult: any): void {
    this.analysisStats.totalFilesAnalyzed++;
    
    if (analysisResult.mobileAnalysis) {
      this.analysisStats.issuesFound += analysisResult.mobileAnalysis.issues.length;
      
      if (analysisResult.mobileAnalysis.mobileSpecific) {
        this.analysisStats.securityIssues += analysisResult.mobileAnalysis.mobileSpecific.securityIssues.length;
        this.analysisStats.performanceIssues += analysisResult.mobileAnalysis.mobileSpecific.performanceIssues.length;
        this.analysisStats.accessibilityIssues += analysisResult.mobileAnalysis.mobileSpecific.accessibilityIssues.length;
      }
    }

    if (analysisResult.advancedSecurity) {
      this.analysisStats.securityIssues += analysisResult.advancedSecurity.length;
    }

    if (analysisResult.advancedPerformance) {
      this.analysisStats.performanceIssues += analysisResult.advancedPerformance.length;
    }

    if (analysisResult.advancedAccessibility) {
      this.analysisStats.accessibilityIssues += analysisResult.advancedAccessibility.length;
    }
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): MobileMonitoringResult {
    return {
      isActive: this.isWatching,
      watchedFiles: this.watchedFiles.size,
      lastAnalysis: this.lastAnalysis,
      recentChanges: this.recentChanges.slice(0, 20), // Last 20 changes
      analysisStats: { ...this.analysisStats }
    };
  }

  /**
   * Add change event callback
   */
  onFileChange(callback: (event: MobileFileChangeEvent) => void): void {
    this.changeCallbacks.push(callback);
  }

  /**
   * Add analysis result callback
   */
  onAnalysisResult(callback: (result: any) => void): void {
    this.analysisCallbacks.push(callback);
  }

  /**
   * Remove callbacks
   */
  removeCallbacks(): void {
    this.changeCallbacks = [];
    this.analysisCallbacks = [];
  }

  // Private properties
  private analysisInterval: NodeJS.Timeout | null = null;
} 