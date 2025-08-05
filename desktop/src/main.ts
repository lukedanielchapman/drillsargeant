import { open } from '@tauri-apps/plugin-dialog';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { ASTAnalyzer, type ASTAnalysisResult, type AnalysisIssue } from './analysis/ast-analyzer';
import { EnhancedAnalyzer, type EnhancedAnalysisResult } from './analysis/enhanced-analyzer';
import { ReportGenerator, type DetailedReport } from './analysis/report-generator';
import { MobileAnalyzer } from './analysis/mobile-analyzer';
import { AdvancedMobileAnalyzer } from './analysis/advanced-mobile-analyzer';
import { MobileDependencyAnalyzer } from './analysis/mobile-dependency-analyzer';
import { MobileFileWatcher, type MobileMonitoringConfig, type MobileFileChangeEvent } from './analysis/mobile-file-watcher';
import { MobileDuplicationDetector } from './analysis/mobile-duplication-detector';

// Enhanced desktop application for DrillSargeant
class DrillSargeantDesktop {
  private currentProject: string | null = null;
  private astAnalyzer: ASTAnalyzer;
  private enhancedAnalyzer: EnhancedAnalyzer;
  private mobileAnalyzer: MobileAnalyzer;
  private advancedMobileAnalyzer: AdvancedMobileAnalyzer;
  private mobileDependencyAnalyzer: MobileDependencyAnalyzer;
  private mobileFileWatcher: MobileFileWatcher;
  private mobileDuplicationDetector: MobileDuplicationDetector;
  private reportGenerator: ReportGenerator;

  constructor() {
    this.astAnalyzer = new ASTAnalyzer();
    this.enhancedAnalyzer = new EnhancedAnalyzer();
    this.mobileAnalyzer = new MobileAnalyzer();
    this.advancedMobileAnalyzer = new AdvancedMobileAnalyzer();
    this.mobileDependencyAnalyzer = new MobileDependencyAnalyzer();
    this.mobileDuplicationDetector = new MobileDuplicationDetector();
    this.reportGenerator = new ReportGenerator();
    
    // Initialize mobile file watcher with default config
    const monitoringConfig: MobileMonitoringConfig = {
      watchDirectories: [],
      fileExtensions: ['.dart', '.js', '.jsx', '.ts', '.tsx', '.swift', '.java', '.kt'],
      analysisInterval: 30000, // 30 seconds
      enableRealTimeAnalysis: true,
      enableDependencyMonitoring: true,
      enableHotReloadAnalysis: true
    };
    this.mobileFileWatcher = new MobileFileWatcher(monitoringConfig);
  }

  async initialize() {
    console.log('🚀 DrillSargeant Desktop Starting...');
    this.setupEventListeners();
    this.setupMobileMonitoring();
    console.log('✅ Desktop app ready');
  }

  private setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const page = (e.currentTarget as HTMLElement).dataset.page;
        if (page) this.navigateTo(page);
      });
    });

    // Main buttons
    document.getElementById('select-project-btn')?.addEventListener('click', () => {
      this.selectProjectDirectory();
    });

    document.getElementById('new-analysis-btn')?.addEventListener('click', () => {
      this.selectProjectDirectory();
    });

    // Report generation buttons
    document.getElementById('generate-html-report')?.addEventListener('click', () => {
      this.generateReport('html');
    });

    document.getElementById('generate-pdf-report')?.addEventListener('click', () => {
      this.generateReport('pdf');
    });

    document.getElementById('generate-excel-report')?.addEventListener('click', () => {
      this.generateReport('excel');
    });

    // Mobile monitoring controls
    document.getElementById('start-monitoring-btn')?.addEventListener('click', () => {
      this.startMobileMonitoring();
    });

    document.getElementById('stop-monitoring-btn')?.addEventListener('click', () => {
      this.stopMobileMonitoring();
    });

    // Drop zone
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
      dropZone.addEventListener('click', () => this.selectProjectDirectory());
    }
  }

  private setupMobileMonitoring() {
    // Set up mobile file change callbacks
    this.mobileFileWatcher.onFileChange((event: MobileFileChangeEvent) => {
      this.handleMobileFileChange(event);
    });

    this.mobileFileWatcher.onAnalysisResult((result: any) => {
      this.handleMobileAnalysisResult(result);
    });
  }

  private navigateTo(page: string) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    // Update content
    document.querySelectorAll('.content-area').forEach(content => {
      content.classList.add('hidden');
    });
    document.getElementById(`${page}-content`)?.classList.remove('hidden');

    // Update header
    const titles: Record<string, {title: string, subtitle: string}> = {
      dashboard: { title: 'Dashboard', subtitle: 'Welcome to DrillSargeant Desktop' },
      analyze: { title: 'Analyze Project', subtitle: 'Deep code analysis and quality assessment' },
      monitor: { title: 'File Monitor', subtitle: 'Real-time file change monitoring' },
      history: { title: 'Analysis History', subtitle: 'Previous analysis results' },
      reports: { title: 'Reports', subtitle: 'Generate detailed analysis reports' },
      settings: { title: 'Settings', subtitle: 'Configure preferences' }
    };

    const pageInfo = titles[page];
    if (pageInfo) {
      const titleEl = document.getElementById('page-title');
      const subtitleEl = document.getElementById('page-subtitle');
      if (titleEl) titleEl.textContent = pageInfo.title;
      if (subtitleEl) subtitleEl.textContent = pageInfo.subtitle;
    }
  }

  private async selectProjectDirectory() {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Directory for Analysis'
      });

      if (selected && typeof selected === 'string') {
        this.currentProject = selected;
        await this.analyzeProject(selected);
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
      this.showError('Failed to select project directory');
    }
  }

  private async analyzeProject(projectPath: string) {
    this.navigateTo('analyze');
    
    const statusEl = document.getElementById('analysis-status');
    const resultsEl = document.getElementById('analysis-results');
    const progressText = document.getElementById('analysis-progress-text');
    const progressBar = document.getElementById('analysis-progress-bar');

    if (statusEl) statusEl.textContent = 'Scanning project files...';
    if (progressText) progressText.textContent = '0%';
    if (progressBar) progressBar.style.width = '0%';

    try {
      // Step 1: Scan directory for files
      const allFiles = await this.scanDirectory(projectPath);
      
      if (progressText) progressText.textContent = '15%';
      if (progressBar) progressBar.style.width = '15%';
      
      // Step 2: Filter for custom-coded files only
      const analyzableFiles = this.enhancedAnalyzer.filterCustomCodeFiles(allFiles);
      
      if (statusEl) statusEl.textContent = `Found ${analyzableFiles.length} analyzable files...`;
      if (progressText) progressText.textContent = '30%';
      if (progressBar) progressBar.style.width = '30%';

      // Step 3: Perform enhanced analysis with mobile support
      const analysisResults = await this.performEnhancedAnalysis(analyzableFiles, projectPath);
      
      if (progressText) progressText.textContent = '45%';
      if (progressBar) progressBar.style.width = '45%';

      // Step 4: Perform advanced mobile analysis
      const advancedMobileResults = await this.performAdvancedMobileAnalysis(analyzableFiles, projectPath);
      
      if (progressText) progressText.textContent = '60%';
      if (progressBar) progressBar.style.width = '60%';

      // Step 5: Perform mobile dependency analysis
      const dependencyResults = await this.performMobileDependencyAnalysis(projectPath);
      
      if (progressText) progressText.textContent = '75%';
      if (progressBar) progressBar.style.width = '75%';

      // Step 6: Perform mobile code duplication analysis
      const duplicationResults = await this.performMobileDuplicationAnalysis(analyzableFiles);
      
      if (progressText) progressText.textContent = '90%';
      if (progressBar) progressBar.style.width = '90%';

      // Step 7: Display comprehensive results
      this.displayComprehensiveResults(analysisResults, advancedMobileResults, dependencyResults, duplicationResults);
      
      if (progressText) progressText.textContent = '100%';
      if (progressBar) progressBar.style.width = '100%';
      if (statusEl) statusEl.textContent = 'Analysis complete!';

      // Store results for report generation
      this.currentAnalysisResults = {
        ...analysisResults,
        advancedMobile: advancedMobileResults,
        dependencies: dependencyResults,
        duplications: duplicationResults
      };
      this.currentProjectPath = projectPath;

      // Show success notification
      await sendNotification({
        title: 'DrillSargeant Analysis Complete',
        body: `Found ${analysisResults.totalIssues} issues in ${analyzableFiles.length} files`
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      this.showError(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (statusEl) statusEl.textContent = 'Analysis failed';
    }
  }

  private async scanDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const scanRecursive = async (path: string) => {
      try {
        const entries = await readDir(path);
        
        for (const entry of entries) {
          // For Tauri v2, we need to check the entry type differently
          // This is a simplified approach that should work
          const fullPath = `${path}/${entry.name}`;
          
          try {
            // Try to read as directory
            await readDir(fullPath);
            // If successful, it's a directory
            await scanRecursive(fullPath);
          } catch {
            // If failed, it's a file
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Failed to scan directory ${path}:`, error);
      }
    };

    await scanRecursive(dirPath);
    return files;
  }

  private async performEnhancedAnalysis(files: string[], projectPath: string): Promise<{
    totalIssues: number;
    criticalIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
    securityIssues: number;
    qualityIssues: number;
    performanceIssues: number;
    bestPracticeIssues: number;
    memoryLeakIssues: number;
    duplicationIssues: number;
    allIssues: any[];
    metrics: {
      totalFiles: number;
      totalLines: number;
      totalFunctions: number;
      totalClasses: number;
      averageComplexity: number;
      securityScore: number;
      performanceScore: number;
      qualityScore: number;
    };
    analysisResults: EnhancedAnalysisResult[];
    mobileAnalysis: {
      flutterFiles: number;
      reactNativeFiles: number;
      iosFiles: number;
      androidFiles: number;
      mobileIssues: number;
    };
  }> {
    const analysisResults: EnhancedAnalysisResult[] = [];
    let totalIssues = 0;
    let criticalIssues = 0;
    let highPriorityIssues = 0;
    let mediumPriorityIssues = 0;
    let lowPriorityIssues = 0;
    let securityIssues = 0;
    let qualityIssues = 0;
    let performanceIssues = 0;
    let bestPracticeIssues = 0;
    let memoryLeakIssues = 0;
    let duplicationIssues = 0;
    let allIssues: any[] = [];

    let totalLines = 0;
    let totalFunctions = 0;
    let totalClasses = 0;
    let totalComplexity = 0;
    let totalSecurityScore = 0;
    let totalPerformanceScore = 0;
    let totalQualityScore = 0;

    // Mobile analysis tracking
    let flutterFiles = 0;
    let reactNativeFiles = 0;
    let iosFiles = 0;
    let androidFiles = 0;
    let mobileIssues = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const content = await readTextFile(file);
        const result = await this.enhancedAnalyzer.analyzeFile(file, content);
        
        analysisResults.push(result);
        
        // Track mobile-specific files
        const ext = file.toLowerCase().split('.').pop();
        if (ext === 'dart') flutterFiles++;
        else if (ext === 'swift' || ext === 'm' || ext === 'mm' || ext === 'h') iosFiles++;
        else if (ext === 'java' || ext === 'kt' || ext === 'xml') androidFiles++;
        else if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') {
          if (content.includes('react-native')) reactNativeFiles++;
        }
        
        // Aggregate metrics
        totalIssues += result.summary.totalIssues;
        criticalIssues += result.summary.criticalIssues || 0;
        highPriorityIssues += result.summary.highPriorityIssues;
        mediumPriorityIssues += result.summary.mediumPriorityIssues;
        lowPriorityIssues += result.summary.lowPriorityIssues;
        securityIssues += result.summary.securityIssues;
        qualityIssues += result.summary.qualityIssues;
        performanceIssues += result.summary.performanceIssues;
        bestPracticeIssues += result.summary.bestPracticeIssues || 0;
        memoryLeakIssues += result.summary.memoryLeakIssues || 0;
        duplicationIssues += result.summary.duplicationIssues || 0;
        
        allIssues.push(...result.issues);
        
        // Add mobile-specific issues
        if (result.mobileSpecific) {
          mobileIssues += result.mobileSpecific.platformIssues.length +
                         result.mobileSpecific.performanceIssues.length +
                         result.mobileSpecific.accessibilityIssues.length +
                         result.mobileSpecific.securityIssues.length;
        }
        
        totalLines += result.metrics.linesOfCode;
        totalFunctions += result.metrics.functionCount;
        totalClasses += result.metrics.classCount;
        totalComplexity += result.metrics.cyclomaticComplexity;
        totalSecurityScore += result.metrics.securityScore;
        totalPerformanceScore += result.metrics.performanceScore;
        totalQualityScore += result.metrics.qualityScore;

      } catch (error) {
        console.warn(`Failed to analyze ${file}:`, error);
      }
    }

    const avgComplexity = analysisResults.length > 0 ? totalComplexity / analysisResults.length : 0;
    const avgSecurityScore = analysisResults.length > 0 ? totalSecurityScore / analysisResults.length : 100;
    const avgPerformanceScore = analysisResults.length > 0 ? totalPerformanceScore / analysisResults.length : 100;
    const avgQualityScore = analysisResults.length > 0 ? totalQualityScore / analysisResults.length : 100;

    return {
      totalIssues,
      criticalIssues,
      highPriorityIssues,
      mediumPriorityIssues,
      lowPriorityIssues,
      securityIssues,
      qualityIssues,
      performanceIssues,
      bestPracticeIssues,
      memoryLeakIssues,
      duplicationIssues,
      allIssues,
      metrics: {
        totalFiles: analysisResults.length,
        totalLines,
        totalFunctions,
        totalClasses,
        averageComplexity: avgComplexity,
        securityScore: avgSecurityScore,
        performanceScore: avgPerformanceScore,
        qualityScore: avgQualityScore
      },
      analysisResults,
      mobileAnalysis: {
        flutterFiles,
        reactNativeFiles,
        iosFiles,
        androidFiles,
        mobileIssues
      }
    };
  }

  private async performAdvancedMobileAnalysis(files: string[], projectPath: string): Promise<{
    advancedSecurityIssues: any[];
    advancedPerformanceIssues: any[];
    advancedAccessibilityIssues: any[];
    mobileMetrics: {
      securityScore: number;
      performanceScore: number;
      accessibilityScore: number;
      batteryEfficiency: number;
      memoryEfficiency: number;
      networkEfficiency: number;
    };
  }> {
    const advancedSecurityIssues: any[] = [];
    const advancedPerformanceIssues: any[] = [];
    const advancedAccessibilityIssues: any[] = [];

    for (const file of files) {
      try {
        const content = await readTextFile(file);
        const ext = file.toLowerCase().split('.').pop();

        // Advanced Flutter analysis
        if (ext === 'dart') {
          const securityIssues = await this.advancedMobileAnalyzer.analyzeFlutterAdvancedSecurity(content, file);
          const performanceIssues = await this.advancedMobileAnalyzer.analyzeFlutterAdvancedPerformance(content, file);
          const accessibilityIssues = await this.advancedMobileAnalyzer.analyzeFlutterAdvancedAccessibility(content, file);
          
          advancedSecurityIssues.push(...securityIssues);
          advancedPerformanceIssues.push(...performanceIssues);
          advancedAccessibilityIssues.push(...accessibilityIssues);
        }

        // Advanced React Native analysis
        if ((ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') && content.includes('react-native')) {
          const securityIssues = await this.advancedMobileAnalyzer.analyzeReactNativeAdvancedSecurity(content, file);
          const performanceIssues = await this.advancedMobileAnalyzer.analyzeReactNativeAdvancedPerformance(content, file);
          const accessibilityIssues = await this.advancedMobileAnalyzer.analyzeReactNativeAdvancedAccessibility(content, file);
          
          advancedSecurityIssues.push(...securityIssues);
          advancedPerformanceIssues.push(...performanceIssues);
          advancedAccessibilityIssues.push(...accessibilityIssues);
        }
      } catch (error) {
        console.warn(`Failed to perform advanced mobile analysis on ${file}:`, error);
      }
    }

    // Calculate mobile metrics
    const mobileMetrics = this.advancedMobileAnalyzer.calculateMobileMetrics(
      advancedSecurityIssues,
      advancedPerformanceIssues,
      advancedAccessibilityIssues
    );

    return {
      advancedSecurityIssues,
      advancedPerformanceIssues,
      advancedAccessibilityIssues,
      mobileMetrics
    };
  }

  private async performMobileDependencyAnalysis(projectPath: string): Promise<{
    flutterDependencies: any;
    reactNativeDependencies: any;
    iosDependencies: any;
    androidDependencies: any;
    totalDependencyIssues: number;
  }> {
    let flutterDependencies = null;
    let reactNativeDependencies = null;
    let iosDependencies = null;
    let androidDependencies = null;

    try {
      // Check if it's a Flutter project
      try {
        flutterDependencies = await this.mobileDependencyAnalyzer.analyzeFlutterDependencies(projectPath);
      } catch (error) {
        // Not a Flutter project
      }

      // Check if it's a React Native project
      try {
        reactNativeDependencies = await this.mobileDependencyAnalyzer.analyzeReactNativeDependencies(projectPath);
      } catch (error) {
        // Not a React Native project
      }

      // Check if it's an iOS project
      try {
        iosDependencies = await this.mobileDependencyAnalyzer.analyzeIOSDependencies(projectPath);
      } catch (error) {
        // Not an iOS project
      }

      // Check if it's an Android project
      try {
        androidDependencies = await this.mobileDependencyAnalyzer.analyzeAndroidDependencies(projectPath);
      } catch (error) {
        // Not an Android project
      }
    } catch (error) {
      console.warn('Failed to perform mobile dependency analysis:', error);
    }

    const totalDependencyIssues = 
      (flutterDependencies?.issues.length || 0) +
      (reactNativeDependencies?.issues.length || 0) +
      (iosDependencies?.issues.length || 0) +
      (androidDependencies?.issues.length || 0);

    return {
      flutterDependencies,
      reactNativeDependencies,
      iosDependencies,
      androidDependencies,
      totalDependencyIssues
    };
  }

  private async performMobileDuplicationAnalysis(files: string[]): Promise<{
    duplications: any[];
    summary: any;
    recommendations: any[];
  }> {
    try {
      const duplicationResult = await this.mobileDuplicationDetector.analyzeMobileDuplication(files);
      return duplicationResult;
    } catch (error) {
      console.warn('Failed to perform mobile duplication analysis:', error);
      return {
        duplications: [],
        summary: {
          totalDuplications: 0,
          exactDuplications: 0,
          similarDuplications: 0,
          crossPlatformDuplications: 0,
          highSeverityDuplications: 0,
          mediumSeverityDuplications: 0,
          lowSeverityDuplications: 0,
          estimatedRefactoringEffort: 0
        },
        recommendations: []
      };
    }
  }

  private displayComprehensiveResults(
    analysisResults: any,
    advancedMobileResults: any,
    dependencyResults: any,
    duplicationResults: any
  ) {
    const resultsEl = document.getElementById('analysis-results');
    if (!resultsEl) return;

    const overallScore = Math.max(0, 100 - 
      (analysisResults.criticalIssues * 30) - 
      (analysisResults.highPriorityIssues * 15) - 
      (analysisResults.mediumPriorityIssues * 5) - 
      (analysisResults.lowPriorityIssues * 2)
    );

    resultsEl.innerHTML = `
      <div class="results-container">
        <div class="score-section">
          <h3>Overall Code Quality Score</h3>
          <div class="score ${this.getScoreClass(overallScore)}">${overallScore}/100</div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <h4>Security Score</h4>
            <div class="metric-value ${this.getScoreClass(analysisResults.metrics.securityScore)}">
              ${analysisResults.metrics.securityScore.toFixed(1)}/100
            </div>
            <div class="metric-detail">${analysisResults.securityIssues} issues found</div>
          </div>
          
          <div class="metric-card">
            <h4>Performance Score</h4>
            <div class="metric-value ${this.getScoreClass(analysisResults.metrics.performanceScore)}">
              ${analysisResults.metrics.performanceScore.toFixed(1)}/100
            </div>
            <div class="metric-detail">${analysisResults.performanceIssues} issues found</div>
          </div>
          
          <div class="metric-card">
            <h4>Code Quality Score</h4>
            <div class="metric-value ${this.getScoreClass(analysisResults.metrics.qualityScore)}">
              ${analysisResults.metrics.qualityScore.toFixed(1)}/100
            </div>
            <div class="metric-detail">${analysisResults.qualityIssues} issues found</div>
          </div>
        </div>

        <div class="issues-breakdown">
          <h3>Issues Breakdown</h3>
          <div class="issues-grid">
            <div class="issue-category critical">
              <span class="issue-count">${analysisResults.criticalIssues}</span>
              <span class="issue-label">Critical</span>
            </div>
            <div class="issue-category high">
              <span class="issue-count">${analysisResults.highPriorityIssues}</span>
              <span class="issue-label">High Priority</span>
            </div>
            <div class="issue-category medium">
              <span class="issue-count">${analysisResults.mediumPriorityIssues}</span>
              <span class="issue-label">Medium Priority</span>
            </div>
            <div class="issue-category low">
              <span class="issue-count">${analysisResults.lowPriorityIssues}</span>
              <span class="issue-label">Low Priority</span>
            </div>
          </div>
        </div>

        ${analysisResults.mobileAnalysis ? `
        <div class="mobile-analysis">
          <h3>Mobile Development Analysis</h3>
          <div class="mobile-grid">
            <div class="mobile-card">
              <h4>Flutter Files</h4>
              <div class="mobile-count">${analysisResults.mobileAnalysis.flutterFiles}</div>
            </div>
            <div class="mobile-card">
              <h4>React Native Files</h4>
              <div class="mobile-count">${analysisResults.mobileAnalysis.reactNativeFiles}</div>
            </div>
            <div class="mobile-card">
              <h4>iOS Files</h4>
              <div class="mobile-count">${analysisResults.mobileAnalysis.iosFiles}</div>
            </div>
            <div class="mobile-card">
              <h4>Android Files</h4>
              <div class="mobile-count">${analysisResults.mobileAnalysis.androidFiles}</div>
            </div>
            <div class="mobile-card">
              <h4>Mobile Issues</h4>
              <div class="mobile-count">${analysisResults.mobileAnalysis.mobileIssues}</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${advancedMobileResults ? `
        <div class="advanced-mobile-analysis">
          <h3>Advanced Mobile Analysis</h3>
          <div class="advanced-mobile-grid">
            <div class="advanced-mobile-card">
              <h4>Mobile Security Score</h4>
              <div class="mobile-score ${this.getScoreClass(advancedMobileResults.mobileMetrics.securityScore)}">
                ${advancedMobileResults.mobileMetrics.securityScore.toFixed(1)}/100
              </div>
              <div class="mobile-detail">${advancedMobileResults.advancedSecurityIssues.length} security issues</div>
            </div>
            <div class="advanced-mobile-card">
              <h4>Mobile Performance Score</h4>
              <div class="mobile-score ${this.getScoreClass(advancedMobileResults.mobileMetrics.performanceScore)}">
                ${advancedMobileResults.mobileMetrics.performanceScore.toFixed(1)}/100
              </div>
              <div class="mobile-detail">${advancedMobileResults.advancedPerformanceIssues.length} performance issues</div>
            </div>
            <div class="advanced-mobile-card">
              <h4>Mobile Accessibility Score</h4>
              <div class="mobile-score ${this.getScoreClass(advancedMobileResults.mobileMetrics.accessibilityScore)}">
                ${advancedMobileResults.mobileMetrics.accessibilityScore.toFixed(1)}/100
              </div>
              <div class="mobile-detail">${advancedMobileResults.advancedAccessibilityIssues.length} accessibility issues</div>
            </div>
            <div class="advanced-mobile-card">
              <h4>Battery Efficiency</h4>
              <div class="mobile-score ${this.getScoreClass(advancedMobileResults.mobileMetrics.batteryEfficiency)}">
                ${advancedMobileResults.mobileMetrics.batteryEfficiency.toFixed(1)}/100
              </div>
            </div>
            <div class="advanced-mobile-card">
              <h4>Memory Efficiency</h4>
              <div class="mobile-score ${this.getScoreClass(advancedMobileResults.mobileMetrics.memoryEfficiency)}">
                ${advancedMobileResults.mobileMetrics.memoryEfficiency.toFixed(1)}/100
              </div>
            </div>
            <div class="advanced-mobile-card">
              <h4>Network Efficiency</h4>
              <div class="mobile-score ${this.getScoreClass(advancedMobileResults.mobileMetrics.networkEfficiency)}">
                ${advancedMobileResults.mobileMetrics.networkEfficiency.toFixed(1)}/100
              </div>
            </div>
          </div>
        </div>
        ` : ''}

        ${dependencyResults && dependencyResults.totalDependencyIssues > 0 ? `
        <div class="dependency-analysis">
          <h3>Mobile Dependency Analysis</h3>
          <div class="dependency-grid">
            <div class="dependency-card">
              <h4>Total Dependency Issues</h4>
              <div class="dependency-count">${dependencyResults.totalDependencyIssues}</div>
            </div>
            ${dependencyResults.flutterDependencies ? `
            <div class="dependency-card">
              <h4>Flutter Dependencies</h4>
              <div class="dependency-count">${dependencyResults.flutterDependencies.issues.length}</div>
              <div class="dependency-detail">${dependencyResults.flutterDependencies.summary.vulnerableDependencies} vulnerable</div>
            </div>
            ` : ''}
            ${dependencyResults.reactNativeDependencies ? `
            <div class="dependency-card">
              <h4>React Native Dependencies</h4>
              <div class="dependency-count">${dependencyResults.reactNativeDependencies.issues.length}</div>
              <div class="dependency-detail">${dependencyResults.reactNativeDependencies.summary.vulnerableDependencies} vulnerable</div>
            </div>
            ` : ''}
            ${dependencyResults.iosDependencies ? `
            <div class="dependency-card">
              <h4>iOS Dependencies</h4>
              <div class="dependency-count">${dependencyResults.iosDependencies.issues.length}</div>
              <div class="dependency-detail">${dependencyResults.iosDependencies.summary.vulnerableDependencies} vulnerable</div>
            </div>
            ` : ''}
            ${dependencyResults.androidDependencies ? `
            <div class="dependency-card">
              <h4>Android Dependencies</h4>
              <div class="dependency-count">${dependencyResults.androidDependencies.issues.length}</div>
              <div class="dependency-detail">${dependencyResults.androidDependencies.summary.vulnerableDependencies} vulnerable</div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        ${duplicationResults && duplicationResults.summary.totalDuplications > 0 ? `
        <div class="duplication-analysis">
          <h3>Mobile Code Duplication Analysis</h3>
          <div class="duplication-grid">
            <div class="duplication-card">
              <h4>Total Duplications</h4>
              <div class="duplication-count">${duplicationResults.summary.totalDuplications}</div>
            </div>
            <div class="duplication-card">
              <h4>Exact Duplications</h4>
              <div class="duplication-count">${duplicationResults.summary.exactDuplications}</div>
            </div>
            <div class="duplication-card">
              <h4>Similar Duplications</h4>
              <div class="duplication-count">${duplicationResults.summary.similarDuplications}</div>
            </div>
            <div class="duplication-card">
              <h4>Cross-Platform Duplications</h4>
              <div class="duplication-count">${duplicationResults.summary.crossPlatformDuplications}</div>
            </div>
            <div class="duplication-card">
              <h4>High Severity</h4>
              <div class="duplication-count">${duplicationResults.summary.highSeverityDuplications}</div>
            </div>
            <div class="duplication-card">
              <h4>Estimated Refactoring Effort</h4>
              <div class="duplication-effort">${duplicationResults.summary.estimatedRefactoringEffort} hours</div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="detailed-issues">
          <h3>Top Issues</h3>
          <div class="issues-list">
            ${this.generateIssuesList(analysisResults.allIssues.slice(0, 10))}
          </div>
        </div>

        <div class="action-buttons">
          <button id="generate-html-report" class="btn btn-primary">Generate HTML Report</button>
          <button id="generate-pdf-report" class="btn btn-secondary">Generate PDF Report</button>
          <button id="generate-excel-report" class="btn btn-secondary">Generate Excel Report</button>
        </div>
      </div>
    `;

    // Re-attach event listeners for report buttons
    this.setupReportButtons();
  }

  private generateIssuesList(issues: any[]): string {
    return issues.map(issue => `
      <div class="issue-item ${issue.severity}">
        <div class="issue-header">
          <span class="issue-severity ${issue.severity}">${issue.severity.toUpperCase()}</span>
          <span class="issue-type">${issue.type}</span>
          <span class="issue-file">${issue.file}:${issue.line}</span>
        </div>
        <div class="issue-content">
          <h4>${issue.title}</h4>
          <p>${issue.description}</p>
          ${issue.suggestion ? `<div class="suggestion"><strong>Suggestion:</strong> ${issue.suggestion}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  private setupReportButtons() {
    document.getElementById('generate-html-report')?.addEventListener('click', () => {
      this.generateReport('html');
    });

    document.getElementById('generate-pdf-report')?.addEventListener('click', () => {
      this.generateReport('pdf');
    });

    document.getElementById('generate-excel-report')?.addEventListener('click', () => {
      this.generateReport('excel');
    });
  }

  private async generateReport(format: 'html' | 'pdf' | 'excel') {
    if (!this.currentAnalysisResults || !this.currentProjectPath) {
      this.showError('No analysis results available. Please run an analysis first.');
      return;
    }

    try {
      const report = await this.reportGenerator.generateReport(
        this.currentAnalysisResults.analysisResults,
        this.currentProjectPath
      );

      let reportData: string | Buffer;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'html':
          reportData = await this.reportGenerator.generateHTMLReport(report);
          filename = 'drillsargeant-report.html';
          mimeType = 'text/html';
          break;
        case 'pdf':
          reportData = await this.reportGenerator.generatePDFReport(report);
          filename = 'drillsargeant-report.pdf';
          mimeType = 'application/pdf';
          break;
        case 'excel':
          reportData = await this.reportGenerator.generateExcelReport(report);
          filename = 'drillsargeant-report.xlsx';
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
      }

      // Create download link
      const blob = new Blob([reportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await sendNotification({
        title: 'Report Generated',
        body: `${format.toUpperCase()} report has been downloaded`
      });

    } catch (error) {
      console.error('Failed to generate report:', error);
      this.showError(`Failed to generate ${format} report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async startMobileMonitoring() {
    if (!this.currentProject) {
      this.showError('No project selected. Please select a project first.');
      return;
    }

    try {
      await this.mobileFileWatcher.startMonitoring(this.currentProject);
      
      // Update UI to show monitoring is active
      const monitoringStatusEl = document.getElementById('monitoring-status');
      if (monitoringStatusEl) {
        monitoringStatusEl.textContent = 'Monitoring Active';
        monitoringStatusEl.className = 'status-active';
      }

      await sendNotification({
        title: 'Mobile Monitoring Started',
        body: 'Real-time mobile file monitoring is now active'
      });

    } catch (error) {
      console.error('Failed to start mobile monitoring:', error);
      this.showError('Failed to start mobile monitoring');
    }
  }

  private async stopMobileMonitoring() {
    try {
      await this.mobileFileWatcher.stopMonitoring();
      
      // Update UI to show monitoring is stopped
      const monitoringStatusEl = document.getElementById('monitoring-status');
      if (monitoringStatusEl) {
        monitoringStatusEl.textContent = 'Monitoring Stopped';
        monitoringStatusEl.className = 'status-inactive';
      }

      await sendNotification({
        title: 'Mobile Monitoring Stopped',
        body: 'Real-time mobile file monitoring has been stopped'
      });

    } catch (error) {
      console.error('Failed to stop mobile monitoring:', error);
      this.showError('Failed to stop mobile monitoring');
    }
  }

  private handleMobileFileChange(event: MobileFileChangeEvent) {
    console.log('Mobile file change detected:', event);
    
    // Update monitoring UI
    const changesListEl = document.getElementById('recent-changes-list');
    if (changesListEl) {
      const changeItem = document.createElement('div');
      changeItem.className = 'change-item';
      changeItem.innerHTML = `
        <span class="change-type ${event.type}">${event.type.toUpperCase()}</span>
        <span class="change-file">${event.filePath}</span>
        <span class="change-framework">${event.framework}</span>
        <span class="change-time">${event.timestamp.toLocaleTimeString()}</span>
      `;
      changesListEl.insertBefore(changeItem, changesListEl.firstChild);
      
      // Keep only last 20 changes
      const items = changesListEl.querySelectorAll('.change-item');
      if (items.length > 20) {
        items[items.length - 1].remove();
      }
    }
  }

  private handleMobileAnalysisResult(result: any) {
    console.log('Mobile analysis result:', result);
    
    // Update analysis stats
    const statsEl = document.getElementById('mobile-analysis-stats');
    if (statsEl && result.mobileAnalysis) {
      const stats = result.mobileAnalysis.summary;
      statsEl.innerHTML = `
        <div class="stat-item">
          <span class="stat-label">Total Issues:</span>
          <span class="stat-value">${stats.totalIssues}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Security Issues:</span>
          <span class="stat-value">${stats.securityIssues}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Performance Issues:</span>
          <span class="stat-value">${stats.performanceIssues}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Accessibility Issues:</span>
          <span class="stat-value">${stats.accessibilityIssues}</span>
        </div>
      `;
    }
  }

  private getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
  }

  private showError(message: string) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 5000);
    }
    console.error(message);
  }

  // Properties to store current analysis state
  private currentAnalysisResults: any = null;
  private currentProjectPath: string | null = null;
}

// Initialize the application
const app = new DrillSargeantDesktop();
app.initialize().catch(console.error);