import { EnhancedAnalyzer } from './analysis/enhanced-analyzer';
import { AdvancedMobileAnalyzer } from './analysis/advanced-mobile-analyzer';
import { ReportGenerator } from './analysis/report-generator';
import { MobileFileWatcher } from './analysis/mobile-file-watcher';
import { MobileDependencyAnalyzer } from './analysis/mobile-dependency-analyzer';
import { MobileDuplicationDetector } from './analysis/mobile-duplication-detector';
import { EnhancedMobileSecurityAnalyzer } from './analysis/enhanced-mobile-security';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { sendNotification } from '@tauri-apps/plugin-notification';
import * as path from 'path';

export class DrillSargeantApp {
  private enhancedAnalyzer: EnhancedAnalyzer;
  private advancedMobileAnalyzer: AdvancedMobileAnalyzer;
  private reportGenerator: ReportGenerator;
  private mobileFileWatcher: MobileFileWatcher;
  private mobileDependencyAnalyzer: MobileDependencyAnalyzer;
  private mobileDuplicationDetector: MobileDuplicationDetector;
  private enhancedMobileSecurityAnalyzer: EnhancedMobileSecurityAnalyzer;
  private currentProjectPath: string | null = null;
  private isAnalyzing: boolean = false;
  private analysisResults: any = null;

  constructor() {
    this.enhancedAnalyzer = new EnhancedAnalyzer();
    this.advancedMobileAnalyzer = new AdvancedMobileAnalyzer();
    this.reportGenerator = new ReportGenerator({
      format: 'html',
      includeCodeSnippets: true,
      includeFixSuggestions: true,
      includeMetrics: true,
      includeRecommendations: true,
      severityFilter: 'all',
      typeFilter: 'all'
    });
    this.mobileDependencyAnalyzer = new MobileDependencyAnalyzer();
    this.mobileDuplicationDetector = new MobileDuplicationDetector();
    this.enhancedMobileSecurityAnalyzer = new EnhancedMobileSecurityAnalyzer();
    
    // Initialize mobile file watcher
    this.mobileFileWatcher = new MobileFileWatcher({
      enableRealTimeAnalysis: true,
      analysisInterval: 5000,
      maxFileSize: 1024 * 1024 // 1MB
    });

    this.initializeUI();
    this.setupEventListeners();
  }

  private initializeUI(): void {
    // Initialize the UI elements
    this.updateStatus('Ready to analyze');
    this.updateProgress(0);
    this.hideResults();
  }

  private setupEventListeners(): void {
    // Select project button
    const selectProjectBtn = document.getElementById('select-project');
    if (selectProjectBtn) {
      selectProjectBtn.addEventListener('click', () => this.selectProject());
    }

    // Analyze button
    const analyzeBtn = document.getElementById('analyze');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.analyzeProject());
    }

    // Export button
    const exportBtn = document.getElementById('export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportResults());
    }

    // Mobile monitoring controls
    const startMonitoringBtn = document.getElementById('start-monitoring');
    if (startMonitoringBtn) {
      startMonitoringBtn.addEventListener('click', () => this.startMobileMonitoring());
    }

    const stopMonitoringBtn = document.getElementById('stop-monitoring');
    if (stopMonitoringBtn) {
      stopMonitoringBtn.addEventListener('click', () => this.stopMobileMonitoring());
    }

    // Advanced analysis controls
    const advancedAnalysisBtn = document.getElementById('advanced-analysis');
    if (advancedAnalysisBtn) {
      advancedAnalysisBtn.addEventListener('click', () => this.performAdvancedAnalysis());
    }

    const securityAnalysisBtn = document.getElementById('security-analysis');
    if (securityAnalysisBtn) {
      securityAnalysisBtn.addEventListener('click', () => this.performSecurityAnalysis());
    }

    const dependencyAnalysisBtn = document.getElementById('dependency-analysis');
    if (dependencyAnalysisBtn) {
      dependencyAnalysisBtn.addEventListener('click', () => this.performDependencyAnalysis());
    }

    const duplicationAnalysisBtn = document.getElementById('duplication-analysis');
    if (duplicationAnalysisBtn) {
      duplicationAnalysisBtn.addEventListener('click', () => this.performDuplicationAnalysis());
    }
  }

  private async selectProject(): Promise<void> {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Directory'
      });

      if (selected) {
        this.currentProjectPath = selected as string;
        this.updateProjectPath(selected as string);
        this.updateStatus('Project selected. Ready to analyze.');
        this.enableAnalyzeButton();
      }
    } catch (error) {
      console.error('Failed to select project:', error);
      this.updateStatus('Failed to select project');
    }
  }

  private async analyzeProject(): Promise<void> {
    if (!this.currentProjectPath || this.isAnalyzing) {
      return;
    }

    this.isAnalyzing = true;
    this.updateStatus('Analyzing project...');
    this.updateProgress(0);
    this.disableAnalyzeButton();

    try {
      // Get all files in the project
      const files = await this.getAllFiles(this.currentProjectPath);
      
      // Filter to only custom-coded files
      const customFiles = this.enhancedAnalyzer.filterCustomCodeFiles(files);
      
      this.updateStatus(`Found ${customFiles.length} custom files to analyze...`);
      this.updateProgress(10);

      // Analyze each file
      const results = await this.analyzeFiles(customFiles);
      
      this.updateProgress(80);

      // Generate comprehensive report
      const report = await this.generateComprehensiveReport(results);
      
      this.updateProgress(100);
      this.analysisResults = report;
      
      // Display results
      this.displayComprehensiveResults(report);
      
      this.updateStatus('Analysis complete!');
      this.enableAnalyzeButton();
      
      // Send notification
      await sendNotification({
        title: 'DrillSargeant Analysis Complete',
        body: `Found ${report.summary.totalIssues} issues in ${customFiles.length} files`
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      this.updateStatus('Analysis failed');
      this.enableAnalyzeButton();
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
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
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Failed to scan directory ${currentPath}:`, error);
      }
    };
    
    await scanDirectory(dirPath);
    return files;
  }

  private async analyzeFiles(files: string[]): Promise<any[]> {
    const results = [];
    const totalFiles = files.length;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const content = await readTextFile(file);
        const result = await this.enhancedAnalyzer.analyzeFile(file, content);
        results.push({ file, result });
        
        // Update progress
        const progress = 10 + Math.floor((i / totalFiles) * 70);
        this.updateProgress(progress);
        
      } catch (error) {
        console.warn(`Failed to analyze ${file}:`, error);
        results.push({ file, result: { issues: [], summary: { totalIssues: 0 } } });
      }
    }
    
    return results;
  }

  private async generateComprehensiveReport(results: any[]): Promise<any> {
    // Aggregate all results
    const allIssues = [];
    let totalFiles = 0;
    let totalLines = 0;
    let totalFunctions = 0;
    let totalClasses = 0;
    let totalComplexity = 0;
    
    for (const { result } of results) {
      if (result.issues) {
        allIssues.push(...result.issues);
      }
      if (result.metrics) {
        totalFiles += result.metrics.totalFiles || 0;
        totalLines += result.metrics.totalLines || 0;
        totalFunctions += result.metrics.totalFunctions || 0;
        totalClasses += result.metrics.totalClasses || 0;
        totalComplexity += result.metrics.averageComplexity || 0;
      }
    }
    
    // Calculate summary
    const summary = {
      totalIssues: allIssues.length,
      criticalIssues: allIssues.filter((i: any) => i.severity === 'critical').length,
      highPriorityIssues: allIssues.filter((i: any) => i.severity === 'high').length,
      mediumPriorityIssues: allIssues.filter((i: any) => i.severity === 'medium').length,
      lowPriorityIssues: allIssues.filter((i: any) => i.severity === 'low').length,
      securityIssues: allIssues.filter((i: any) => i.category === 'security').length,
      qualityIssues: allIssues.filter((i: any) => i.category === 'quality').length,
      performanceIssues: allIssues.filter((i: any) => i.category === 'performance').length,
      bestPracticeIssues: allIssues.filter((i: any) => i.category === 'best-practice').length,
      memoryLeakIssues: allIssues.filter((i: any) => i.category === 'memory-leak').length,
      duplicationIssues: allIssues.filter((i: any) => i.category === 'duplication').length
    };
    
    // Calculate metrics
    const metrics = {
      totalFiles,
      totalLines,
      totalFunctions,
      totalClasses,
      averageComplexity: totalFiles > 0 ? totalComplexity / totalFiles : 0,
      commentRatio: 0, // Would need to calculate from content
      duplicationPercentage: 0 // Would need to calculate from content
    };
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(allIssues);
    
    return {
      summary,
      metrics,
      issues: allIssues,
      recommendations,
      results
    };
  }

  private generateRecommendations(issues: any[]): any[] {
    const recommendations = [];
    
    // Security recommendations
    const securityIssues = issues.filter((i: any) => i.category === 'security');
    if (securityIssues.length > 0) {
      recommendations.push({
        priority: 'immediate',
        title: 'Address Security Vulnerabilities',
        description: `Found ${securityIssues.length} security issues that need immediate attention.`,
        estimatedEffort: securityIssues.length * 2,
        impact: 'critical'
      });
    }
    
    // Performance recommendations
    const performanceIssues = issues.filter((i: any) => i.category === 'performance');
    if (performanceIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Optimize Performance Issues',
        description: `Found ${performanceIssues.length} performance issues that could impact user experience.`,
        estimatedEffort: performanceIssues.length * 1.5,
        impact: 'high'
      });
    }
    
    // Quality recommendations
    const qualityIssues = issues.filter((i: any) => i.category === 'quality');
    if (qualityIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Improve Code Quality',
        description: `Found ${qualityIssues.length} code quality issues that affect maintainability.`,
        estimatedEffort: qualityIssues.length * 1,
        impact: 'medium'
      });
    }
    
    return recommendations;
  }

  private displayComprehensiveResults(report: any): void {
    const resultsContainer = document.getElementById('analysis-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <div class="results-header">
        <h2>Analysis Results</h2>
        <div class="summary-stats">
          <div class="stat">
            <span class="label">Total Issues:</span>
            <span class="value">${report.summary.totalIssues}</span>
          </div>
          <div class="stat">
            <span class="label">Critical:</span>
            <span class="value critical">${report.summary.criticalIssues}</span>
          </div>
          <div class="stat">
            <span class="label">High:</span>
            <span class="value high">${report.summary.highPriorityIssues}</span>
          </div>
          <div class="stat">
            <span class="label">Files Analyzed:</span>
            <span class="value">${report.metrics.totalFiles}</span>
          </div>
        </div>
      </div>
      
      <div class="issues-breakdown">
        <h3>Issues by Category</h3>
        <div class="category-stats">
          <div class="category">
            <span class="label">Security:</span>
            <span class="value">${report.summary.securityIssues}</span>
          </div>
          <div class="category">
            <span class="label">Performance:</span>
            <span class="value">${report.summary.performanceIssues}</span>
          </div>
          <div class="category">
            <span class="label">Quality:</span>
            <span class="value">${report.summary.qualityIssues}</span>
          </div>
          <div class="category">
            <span class="label">Best Practices:</span>
            <span class="value">${report.summary.bestPracticeIssues}</span>
          </div>
          <div class="category">
            <span class="label">Memory Leaks:</span>
            <span class="value">${report.summary.memoryLeakIssues}</span>
          </div>
          <div class="category">
            <span class="label">Duplication:</span>
            <span class="value">${report.summary.duplicationIssues}</span>
          </div>
        </div>
      </div>
      
      <div class="recommendations">
        <h3>Recommendations</h3>
        ${report.recommendations.map((rec: any) => `
          <div class="recommendation ${rec.priority}">
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
            <div class="rec-meta">
              <span class="priority">Priority: ${rec.priority}</span>
              <span class="effort">Effort: ${rec.estimatedEffort}h</span>
              <span class="impact">Impact: ${rec.impact}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="detailed-issues">
        <h3>Detailed Issues</h3>
        <div class="issues-list">
          ${report.issues.slice(0, 20).map((issue: any) => `
            <div class="issue ${issue.severity}">
              <div class="issue-header">
                <span class="severity">${issue.severity.toUpperCase()}</span>
                <span class="category">${issue.category}</span>
                <span class="file">${issue.file}</span>
                <span class="line">Line ${issue.line}</span>
              </div>
              <div class="issue-content">
                <h4>${issue.title}</h4>
                <p>${issue.description}</p>
                ${issue.suggestion ? `<p class="suggestion"><strong>Suggestion:</strong> ${issue.suggestion}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    resultsContainer.style.display = 'block';
  }

  private async exportResults(): Promise<void> {
    if (!this.analysisResults) {
      this.updateStatus('No results to export');
      return;
    }

    try {
      this.updateStatus('Generating reports...');
      
      // Generate different report formats
      if (this.currentProjectPath) {
        const htmlReport = await this.reportGenerator.generateDetailedReport(this.analysisResults, this.currentProjectPath);
        
        // For now, we'll just show the HTML report in a new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(htmlReport);
          newWindow.document.close();
        }
      }
      
      this.updateStatus('Reports generated successfully');
      
    } catch (error) {
      console.error('Failed to export results:', error);
      this.updateStatus('Failed to export results');
    }
  }

  private async startMobileMonitoring(): Promise<void> {
    if (!this.currentProjectPath) {
      this.updateStatus('Please select a project first');
      return;
    }

    try {
      await this.mobileFileWatcher.startMonitoring(this.currentProjectPath);
      this.updateStatus('Mobile monitoring started');
      
      // Update UI to show monitoring is active
      const startBtn = document.getElementById('start-monitoring');
      const stopBtn = document.getElementById('stop-monitoring');
      if (startBtn) startBtn.style.display = 'none';
      if (stopBtn) stopBtn.style.display = 'block';
      
    } catch (error) {
      console.error('Failed to start mobile monitoring:', error);
      this.updateStatus('Failed to start mobile monitoring');
    }
  }

  private async stopMobileMonitoring(): Promise<void> {
    try {
      await this.mobileFileWatcher.stopMonitoring();
      this.updateStatus('Mobile monitoring stopped');
      
      // Update UI to show monitoring is stopped
      const startBtn = document.getElementById('start-monitoring');
      const stopBtn = document.getElementById('stop-monitoring');
      if (startBtn) startBtn.style.display = 'block';
      if (stopBtn) stopBtn.style.display = 'none';
      
    } catch (error) {
      console.error('Failed to stop mobile monitoring:', error);
      this.updateStatus('Failed to stop mobile monitoring');
    }
  }

  private async performAdvancedAnalysis(): Promise<void> {
    if (!this.currentProjectPath) {
      this.updateStatus('Please select a project first');
      return;
    }

    try {
      this.updateStatus('Performing advanced analysis...');
      
      // Get files for advanced analysis
      const files = await this.getAllFiles(this.currentProjectPath);
      const customFiles = this.enhancedAnalyzer.filterCustomCodeFiles(files);
      
      // Perform advanced mobile analysis
      const advancedResults = await this.performAdvancedMobileAnalysis(customFiles);
      
      // Display advanced results
      this.displayAdvancedResults(advancedResults);
      
      this.updateStatus('Advanced analysis complete');
      
    } catch (error) {
      console.error('Advanced analysis failed:', error);
      this.updateStatus('Advanced analysis failed');
    }
  }

  private async performAdvancedMobileAnalysis(files: string[]): Promise<any> {
    const results = {
      flutter: { issues: [] as any[], summary: { totalIssues: 0 } },
      reactNative: { issues: [] as any[], summary: { totalIssues: 0 } },
      ios: { issues: [] as any[], summary: { totalIssues: 0 } },
      android: { issues: [] as any[], summary: { totalIssues: 0 } }
    };

    for (const file of files) {
      try {
        const content = await readTextFile(file);
        const ext = path.extname(file).toLowerCase();
        
        if (ext === '.dart') {
          const result = await this.advancedMobileAnalyzer.analyzeFlutterAdvancedSecurity(content, file);
          if (result && Array.isArray(result)) {
            results.flutter.issues.push(...result);
            results.flutter.summary.totalIssues += result.length;
          }
        } else if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
          const result = await this.advancedMobileAnalyzer.analyzeReactNativeAdvancedSecurity(content, file);
          if (result && Array.isArray(result)) {
            results.reactNative.issues.push(...result);
            results.reactNative.summary.totalIssues += result.length;
          }
        }
      } catch (error) {
        console.warn(`Failed to analyze ${file}:`, error);
      }
    }

    return results;
  }

  private displayAdvancedResults(results: any): void {
    const resultsContainer = document.getElementById('analysis-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <div class="advanced-results">
        <h2>Advanced Mobile Analysis Results</h2>
        
        <div class="framework-results">
          <div class="framework">
            <h3>Flutter Analysis</h3>
            <p>Issues found: ${results.flutter.summary.totalIssues}</p>
          </div>
          
          <div class="framework">
            <h3>React Native Analysis</h3>
            <p>Issues found: ${results.reactNative.summary.totalIssues}</p>
          </div>
          
          <div class="framework">
            <h3>iOS Analysis</h3>
            <p>Issues found: ${results.ios.summary.totalIssues}</p>
          </div>
          
          <div class="framework">
            <h3>Android Analysis</h3>
            <p>Issues found: ${results.android.summary.totalIssues}</p>
          </div>
        </div>
      </div>
    `;

    resultsContainer.style.display = 'block';
  }

  private async performSecurityAnalysis(): Promise<void> {
    if (!this.currentProjectPath) {
      this.updateStatus('Please select a project first');
      return;
    }

    try {
      this.updateStatus('Performing security analysis...');
      
      const files = await this.getAllFiles(this.currentProjectPath);
      const customFiles = this.enhancedAnalyzer.filterCustomCodeFiles(files);
      
      const securityResults = await this.performEnhancedMobileSecurityAnalysis(customFiles);
      
      this.displaySecurityResults(securityResults);
      
      this.updateStatus('Security analysis complete');
      
    } catch (error) {
      console.error('Security analysis failed:', error);
      this.updateStatus('Security analysis failed');
    }
  }

  private async performEnhancedMobileSecurityAnalysis(files: string[]): Promise<any> {
    const results = {
      flutter: { issues: [] as any[], score: 100 },
      reactNative: { issues: [] as any[], score: 100 },
      ios: { issues: [] as any[], score: 100 },
      android: { issues: [] as any[], score: 100 }
    };

    for (const file of files) {
      try {
        const content = await readTextFile(file);
        const ext = path.extname(file).toLowerCase();
        
        if (ext === '.dart') {
          const result = await this.enhancedMobileSecurityAnalyzer.analyzeFlutterSecurity(content, file);
          if (result && result.issues) {
            results.flutter.issues.push(...result.issues);
            if (result.summary && result.summary.securityScore !== undefined) {
              results.flutter.score = Math.min(results.flutter.score, result.summary.securityScore);
            }
          }
        } else if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
          const result = await this.enhancedMobileSecurityAnalyzer.analyzeReactNativeSecurity(content, file);
          if (result && result.issues) {
            results.reactNative.issues.push(...result.issues);
            if (result.summary && result.summary.securityScore !== undefined) {
              results.reactNative.score = Math.min(results.reactNative.score, result.summary.securityScore);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to analyze ${file}:`, error);
      }
    }

    return results;
  }

  private displaySecurityResults(results: any): void {
    const resultsContainer = document.getElementById('analysis-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <div class="security-results">
        <h2>Enhanced Security Analysis Results</h2>
        
        <div class="security-scores">
          <div class="score-item">
            <h3>Flutter Security Score</h3>
            <div class="score ${this.getScoreClass(results.flutter.score)}">${results.flutter.score}/100</div>
            <p>Issues found: ${results.flutter.issues.length}</p>
          </div>
          
          <div class="score-item">
            <h3>React Native Security Score</h3>
            <div class="score ${this.getScoreClass(results.reactNative.score)}">${results.reactNative.score}/100</div>
            <p>Issues found: ${results.reactNative.issues.length}</p>
          </div>
          
          <div class="score-item">
            <h3>iOS Security Score</h3>
            <div class="score ${this.getScoreClass(results.ios.score)}">${results.ios.score}/100</div>
            <p>Issues found: ${results.ios.issues.length}</p>
          </div>
          
          <div class="score-item">
            <h3>Android Security Score</h3>
            <div class="score ${this.getScoreClass(results.android.score)}">${results.android.score}/100</div>
            <p>Issues found: ${results.android.issues.length}</p>
          </div>
        </div>
      </div>
    `;

    resultsContainer.style.display = 'block';
  }

  private async performDependencyAnalysis(): Promise<void> {
    if (!this.currentProjectPath) {
      this.updateStatus('Please select a project first');
      return;
    }

    try {
      this.updateStatus('Performing dependency analysis...');
      
      const dependencyResults = await this.mobileDependencyAnalyzer.analyzeIOSDependencies(this.currentProjectPath);
      
      this.displayDependencyResults(dependencyResults);
      
      this.updateStatus('Dependency analysis complete');
      
    } catch (error) {
      console.error('Dependency analysis failed:', error);
      this.updateStatus('Dependency analysis failed');
    }
  }

  private displayDependencyResults(results: any): void {
    const resultsContainer = document.getElementById('analysis-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <div class="dependency-results">
        <h2>Mobile Dependency Analysis Results</h2>
        
        <div class="dependency-stats">
          <div class="stat">
            <h3>Flutter Dependencies</h3>
            <p>Vulnerabilities: ${results.flutter?.vulnerabilities?.length || 0}</p>
            <p>Outdated: ${results.flutter?.outdated?.length || 0}</p>
          </div>
          
          <div class="stat">
            <h3>React Native Dependencies</h3>
            <p>Vulnerabilities: ${results.reactNative?.vulnerabilities?.length || 0}</p>
            <p>Outdated: ${results.reactNative?.outdated?.length || 0}</p>
          </div>
          
          <div class="stat">
            <h3>iOS Dependencies</h3>
            <p>Vulnerabilities: ${results.ios?.vulnerabilities?.length || 0}</p>
            <p>Outdated: ${results.ios?.outdated?.length || 0}</p>
          </div>
          
          <div class="stat">
            <h3>Android Dependencies</h3>
            <p>Vulnerabilities: ${results.android?.vulnerabilities?.length || 0}</p>
            <p>Outdated: ${results.android?.outdated?.length || 0}</p>
          </div>
        </div>
      </div>
    `;

    resultsContainer.style.display = 'block';
  }

  private async performDuplicationAnalysis(): Promise<void> {
    if (!this.currentProjectPath) {
      this.updateStatus('Please select a project first');
      return;
    }

    try {
      this.updateStatus('Performing duplication analysis...');
      
      const files = await this.getAllFiles(this.currentProjectPath);
      const customFiles = this.enhancedAnalyzer.filterCustomCodeFiles(files);
      
      const duplicationResults = await this.mobileDuplicationDetector.analyzeMobileDuplication(customFiles);
      
      this.displayDuplicationResults(duplicationResults);
      
      this.updateStatus('Duplication analysis complete');
      
    } catch (error) {
      console.error('Duplication analysis failed:', error);
      this.updateStatus('Duplication analysis failed');
    }
  }

  private displayDuplicationResults(results: any): void {
    const resultsContainer = document.getElementById('analysis-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <div class="duplication-results">
        <h2>Code Duplication Analysis Results</h2>
        
        <div class="duplication-stats">
          <div class="stat">
            <h3>Exact Duplications</h3>
            <p>Found: ${results.exactDuplications?.length || 0}</p>
          </div>
          
          <div class="stat">
            <h3>Similar Duplications</h3>
            <p>Found: ${results.similarDuplications?.length || 0}</p>
          </div>
          
          <div class="stat">
            <h3>Cross-Platform Duplications</h3>
            <p>Found: ${results.crossPlatformDuplications?.length || 0}</p>
          </div>
          
          <div class="stat">
            <h3>Duplication Percentage</h3>
            <p>${results.duplicationPercentage?.toFixed(2) || 0}%</p>
          </div>
        </div>
      </div>
    `;

    resultsContainer.style.display = 'block';
  }

  private getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  private updateStatus(message: string): void {
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  private updateProgress(percent: number): void {
    const progressEl = document.getElementById('progress');
    if (progressEl) {
      progressEl.style.width = `${percent}%`;
    }
  }

  private updateProjectPath(path: string): void {
    const pathEl = document.getElementById('project-path');
    if (pathEl) {
      pathEl.textContent = path;
    }
  }

  private enableAnalyzeButton(): void {
    const analyzeBtn = document.getElementById('analyze');
    if (analyzeBtn) {
      analyzeBtn.removeAttribute('disabled');
    }
  }

  private disableAnalyzeButton(): void {
    const analyzeBtn = document.getElementById('analyze');
    if (analyzeBtn) {
      analyzeBtn.setAttribute('disabled', 'true');
    }
  }

  private hideResults(): void {
    const resultsEl = document.getElementById('analysis-results');
    if (resultsEl) {
      resultsEl.style.display = 'none';
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new DrillSargeantApp();
});