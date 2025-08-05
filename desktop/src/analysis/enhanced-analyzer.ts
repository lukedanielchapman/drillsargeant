import * as esprima from 'esprima';
import { Parser } from '@typescript-eslint/parser';
import * as cssTree from 'css-tree';
import * as htmlParser from 'htmlparser2';
import * as path from 'path';
import { MobileAnalyzer, type MobileAnalysisResult } from './mobile-analyzer';

export interface EnhancedAnalysisIssue {
  type: 'security' | 'quality' | 'performance' | 'accessibility' | 'best-practice' | 'memory-leak' | 'duplication';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  column?: number;
  code?: string;
  suggestion?: string;
  category: string;
  impact: string;
  fixExample?: string;
  cweId?: string; // Common Weakness Enumeration ID
  owaspCategory?: string;
}

export interface EnhancedAnalysisResult {
  issues: EnhancedAnalysisIssue[];
  metrics: {
    cyclomaticComplexity: number;
    linesOfCode: number;
    functionCount: number;
    classCount: number;
    importCount: number;
    commentRatio: number;
    duplicationPercentage: number;
    securityScore: number;
    performanceScore: number;
    qualityScore: number;
  };
  summary: {
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
  };
  recommendations: {
    priority: 'immediate' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedEffort: number; // hours
    impact: 'critical' | 'high' | 'medium' | 'low';
    files: string[];
  }[];
  mobileSpecific?: {
    platformIssues: any[];
    performanceIssues: any[];
    accessibilityIssues: any[];
    securityIssues: any[];
  };
}

export class EnhancedAnalyzer {
  private parser: Parser;
  private mobileAnalyzer: MobileAnalyzer;
  private supportedExtensions: string[];
  private excludePatterns: string[];

  constructor() {
    this.parser = new Parser();
    this.mobileAnalyzer = new MobileAnalyzer();
    this.supportedExtensions = [
      // Web Technologies
      '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte',
      // Backend Languages
      '.py', '.java', '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt',
      // System Languages
      '.cpp', '.c', '.h', '.hpp', '.cc', '.cxx',
      // Scripting Languages
      '.sh', '.bash', '.zsh', '.ps1', '.bat',
      // Configuration
      '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg',
      // Styling
      '.css', '.scss', '.sass', '.less',
      // Templates
      '.html', '.htm', '.xml', '.svg',
      // Documentation
      '.md', '.rst', '.txt',
      // Mobile Development
      '.dart', '.m', '.mm', '.plist', '.storyboard', '.xib', '.gradle', '.properties',
      '.xaml', '.axml', '.config.xml'
    ];
    
    this.excludePatterns = [
      // Dependencies
      'node_modules', 'vendor', 'bower_components', 'jspm_packages',
      // Build outputs
      'dist', 'build', 'target', 'out', 'bin', 'obj',
      // Version control
      '.git', '.svn', '.hg', '.bzr',
      // Cache directories
      '__pycache__', '.pytest_cache', '.cache', '.parcel-cache',
      // IDE files
      '.vscode', '.idea', '.vs', '.eclipse',
      // OS files
      '.DS_Store', 'Thumbs.db', '.Spotlight-V100',
      // Logs and temp files
      'logs', 'tmp', 'temp', '.tmp',
      // Documentation
      'docs', 'documentation', 'README.md', 'CHANGELOG.md',
      // Test files (optional - can be included for analysis)
      'test', 'tests', '__tests__', 'spec', 'specs',
      // Mobile-specific exclusions
      'Pods', 'DerivedData', '.xcuserdata', '.xcworkspace',
      'build.gradle', 'gradle.properties', 'gradlew', 'gradlew.bat',
      'android/build', 'android/app/build', 'ios/build'
    ];
  }

  /**
   * Filter files to only include custom-coded files
   */
  filterCustomCodeFiles(files: string[]): string[] {
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      const isSupportedFile = this.supportedExtensions.includes(ext);
      
      // Check if file is in excluded directories
      const isExcluded = this.excludePatterns.some(pattern => 
        file.includes(pattern)
      );
      
      // Additional checks for non-custom code
      const isGeneratedFile = this.isGeneratedFile(file);
      const isDependencyFile = this.isDependencyFile(file);
      
      return isSupportedFile && !isExcluded && !isGeneratedFile && !isDependencyFile;
    });
  }

  private isGeneratedFile(filePath: string): boolean {
    const generatedPatterns = [
      '.min.js', '.min.css', '.bundle.js', '.chunk.js',
      'generated', 'auto-generated', 'machine-generated',
      '.g.dart', '.freezed.dart', '.mocks.dart', // Flutter generated files
      '.pb.dart', '.pbenum.dart', // Protocol buffer generated files
      'R.java', 'BuildConfig.java' // Android generated files
    ];
    
    return generatedPatterns.some(pattern => 
      filePath.toLowerCase().includes(pattern)
    );
  }

  private isDependencyFile(filePath: string): boolean {
    const dependencyPatterns = [
      'package-lock.json', 'yarn.lock', 'composer.lock',
      'requirements.txt', 'Pipfile.lock', 'poetry.lock',
      'Gemfile.lock', 'Cargo.lock', 'go.mod', 'go.sum',
      'pubspec.lock', 'Podfile.lock', 'Podfile.lock' // Mobile dependencies
    ];
    
    return dependencyPatterns.some(pattern => 
      filePath.includes(pattern)
    );
  }

  /**
   * Enhanced file analysis with mobile development support
   */
  async analyzeFile(filePath: string, content: string): Promise<EnhancedAnalysisResult> {
    const ext = path.extname(filePath).toLowerCase();
    
    // Mobile development files
    if (ext === '.dart') {
      return await this.mobileAnalyzer.analyzeFlutterFile(filePath, content);
    }
    
    if (ext === '.swift' || ext === '.m' || ext === '.mm' || ext === '.h') {
      return await this.mobileAnalyzer.analyzeIOSFile(filePath, content);
    }
    
    if (ext === '.java' || ext === '.kt' || ext === '.xml') {
      return await this.mobileAnalyzer.analyzeAndroidFile(filePath, content);
    }
    
    if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx') {
      // Check if it's React Native
      if (content.includes('react-native') || content.includes('import {') && content.includes('from \'react-native\'')) {
        return await this.mobileAnalyzer.analyzeReactNativeFile(filePath, content);
      }
      // Regular JavaScript/TypeScript
      return await this.analyzeJavaScriptFile(filePath, content);
    }
    
    // Default to JavaScript analysis for other file types
    return await this.analyzeJavaScriptFile(filePath, content);
  }

  /**
   * Enhanced JavaScript/TypeScript analysis with security patterns
   */
  async analyzeJavaScriptFile(filePath: string, content: string): Promise<EnhancedAnalysisResult> {
    const issues: EnhancedAnalysisIssue[] = [];
    const metrics = {
      cyclomaticComplexity: 0,
      linesOfCode: content.split('\n').length,
      functionCount: 0,
      classCount: 0,
      importCount: 0,
      commentRatio: 0,
      duplicationPercentage: 0,
      securityScore: 100,
      performanceScore: 100,
      qualityScore: 100
    };

    try {
      // Parse JavaScript/TypeScript
      const ast = this.parseJavaScript(content, filePath);
      
      // Analyze AST for issues and metrics
      this.analyzeJavaScriptAST(ast, issues, metrics, filePath);
      
      // Calculate scores based on issues
      metrics.securityScore = this.calculateSecurityScore(issues);
      metrics.performanceScore = this.calculatePerformanceScore(issues);
      metrics.qualityScore = this.calculateQualityScore(issues);
      
      const summary = this.calculateEnhancedSummary(issues);
      const recommendations = this.generateRecommendations(issues, filePath);
      
      return { issues, metrics, summary, recommendations };
    } catch (error) {
      console.warn(`Failed to analyze ${filePath}:`, error);
      return {
        issues: [{
          type: 'quality',
          severity: 'medium',
          title: 'Parse Error',
          description: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          file: path.basename(filePath),
          line: 1,
          category: 'parsing',
          impact: 'Analysis limited due to parsing errors'
        }],
        metrics,
        summary: { 
          totalIssues: 1, 
          criticalIssues: 0,
          highPriorityIssues: 0, 
          mediumPriorityIssues: 1, 
          lowPriorityIssues: 0, 
          securityIssues: 0, 
          qualityIssues: 1, 
          performanceIssues: 0,
          bestPracticeIssues: 0,
          memoryLeakIssues: 0,
          duplicationIssues: 0
        },
        recommendations: []
      };
    }
  }

  private analyzeJavaScriptAST(ast: any, issues: EnhancedAnalysisIssue[], metrics: any, filePath: string): void {
    this.traverseAST(ast, (node) => {
      // Function analysis
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        this.analyzeFunction(node, issues, path.basename(filePath));
        metrics.functionCount++;
      }
      
      // Class analysis
      if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
        this.analyzeClass(node, issues, path.basename(filePath));
        metrics.classCount++;
      }
      
      // Import analysis
      if (node.type === 'ImportDeclaration') {
        metrics.importCount++;
      }
      
      // Security analysis
      this.checkSecurityIssues(node, issues, path.basename(filePath));
      
      // Performance analysis
      this.checkPerformanceIssues(node, issues, path.basename(filePath));
      
      // Quality analysis
      this.checkQualityIssues(node, issues, path.basename(filePath));
      
      // Best practices analysis
      this.checkBestPracticeIssues(node, issues, path.basename(filePath));
      
      // Memory leak detection
      this.checkMemoryLeakIssues(node, issues, path.basename(filePath));
    });
    
    // Calculate cyclomatic complexity
    metrics.cyclomaticComplexity = this.calculateCyclomaticComplexity(ast);
    
    // Calculate comment ratio
    metrics.commentRatio = this.calculateCommentRatio(content);
  }

  private checkSecurityIssues(node: any, issues: EnhancedAnalysisIssue[], fileName: string): void {
    // OWASP Top 10 Security Issues
    
    // A1: Injection
    if (node.type === 'CallExpression' && node.callee.name === 'eval') {
      issues.push({
        type: 'security',
        severity: 'critical',
        title: 'Use of eval() - Code Injection Risk',
        description: 'eval() can execute arbitrary code and is a major security risk. Use safer alternatives.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Replace eval() with JSON.parse() or Function constructor with proper validation',
        category: 'injection',
        impact: 'Critical security vulnerability - potential code execution',
        cweId: 'CWE-95',
        owaspCategory: 'A03:2021-Injection'
      });
    }
    
    // A2: Broken Authentication
    if (node.type === 'Literal' && typeof node.value === 'string' && 
        (node.value.includes('password') || node.value.includes('secret') || node.value.includes('key'))) {
      issues.push({
        type: 'security',
        severity: 'high',
        title: 'Hardcoded Credentials Detected',
        description: 'Hardcoded passwords, secrets, or API keys are a security risk.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Use environment variables or secure secret management',
        category: 'authentication',
        impact: 'Credentials exposed in source code',
        cweId: 'CWE-259',
        owaspCategory: 'A07:2021-Identification and Authentication Failures'
      });
    }
    
    // A3: Sensitive Data Exposure
    if (node.type === 'Property' && node.key.name === 'innerHTML') {
      issues.push({
        type: 'security',
        severity: 'high',
        title: 'Potential XSS via innerHTML',
        description: 'innerHTML can lead to XSS attacks if user input is not properly sanitized.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Use textContent or proper HTML sanitization',
        category: 'xss',
        impact: 'Potential cross-site scripting vulnerability',
        cweId: 'CWE-79',
        owaspCategory: 'A03:2021-Injection'
      });
    }
  }

  private checkPerformanceIssues(node: any, issues: EnhancedAnalysisIssue[], fileName: string): void {
    // Memory leak patterns
    
    // Event listeners without cleanup
    if (node.type === 'CallExpression' && 
        node.callee.property && node.callee.property.name === 'addEventListener') {
      issues.push({
        type: 'performance',
        severity: 'medium',
        title: 'Event Listener Without Cleanup',
        description: 'Event listeners should be removed to prevent memory leaks.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Store reference to listener and remove it when component unmounts',
        category: 'memory-leak',
        impact: 'Potential memory leak over time'
      });
    }
    
    // Inefficient loops
    if (node.type === 'ForStatement' && node.test && this.isInefficientLoop(node)) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        title: 'Inefficient Loop Pattern',
        description: 'This loop pattern may cause performance issues with large datasets.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Consider using forEach, map, or other array methods',
        category: 'algorithm-efficiency',
        impact: 'Performance degradation with large datasets'
      });
    }
  }

  private checkQualityIssues(node: any, issues: EnhancedAnalysisIssue[], fileName: string): void {
    // Code quality issues
    
    // Long functions
    if (node.type === 'FunctionDeclaration' && this.getFunctionLength(node) > 50) {
      issues.push({
        type: 'quality',
        severity: 'medium',
        title: 'Function Too Long',
        description: 'Functions should be kept short and focused on a single responsibility.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Break down into smaller, focused functions',
        category: 'code-quality',
        impact: 'Reduced maintainability and readability'
      });
    }
    
    // Deep nesting
    if (this.getNestingDepth(node) > 4) {
      issues.push({
        type: 'quality',
        severity: 'medium',
        title: 'Excessive Nesting',
        description: 'Deep nesting makes code hard to read and maintain.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Extract nested conditions into separate functions',
        category: 'code-quality',
        impact: 'Reduced code readability'
      });
    }
  }

  private checkBestPracticeIssues(node: any, issues: EnhancedAnalysisIssue[], fileName: string): void {
    // Best practices violations
    
    // Console statements in production
    if (node.type === 'CallExpression' && 
        node.callee.object && node.callee.object.name === 'console') {
      issues.push({
        type: 'best-practice',
        severity: 'low',
        title: 'Console Statement in Code',
        description: 'Console statements should be removed from production code.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Use proper logging library or remove console statements',
        category: 'best-practices',
        impact: 'Debug information exposed in production'
      });
    }
    
    // Magic numbers
    if (node.type === 'Literal' && typeof node.value === 'number' && 
        Math.abs(node.value) > 10 && !this.isCommonNumber(node.value)) {
      issues.push({
        type: 'best-practice',
        severity: 'low',
        title: 'Magic Number Detected',
        description: 'Magic numbers should be replaced with named constants.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Define constant with descriptive name',
        category: 'best-practices',
        impact: 'Reduced code maintainability'
      });
    }
  }

  private checkMemoryLeakIssues(node: any, issues: EnhancedAnalysisIssue[], fileName: string): void {
    // Memory leak patterns
    
    // Closures that capture large objects
    if (node.type === 'FunctionExpression' && this.hasLargeClosure(node)) {
      issues.push({
        type: 'memory-leak',
        severity: 'medium',
        title: 'Potential Memory Leak in Closure',
        description: 'Closure may capture large objects, preventing garbage collection.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Consider using weak references or breaking closure chain',
        category: 'memory-leak',
        impact: 'Potential memory leak over time'
      });
    }
    
    // Timers without cleanup
    if (node.type === 'CallExpression' && 
        (node.callee.name === 'setTimeout' || node.callee.name === 'setInterval')) {
      issues.push({
        type: 'memory-leak',
        severity: 'medium',
        title: 'Timer Without Cleanup',
        description: 'Timers should be cleared to prevent memory leaks.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        code: this.getNodeCode(node),
        suggestion: 'Store timer ID and clear it when component unmounts',
        category: 'memory-leak',
        impact: 'Potential memory leak and unnecessary CPU usage'
      });
    }
  }

  private calculateSecurityScore(issues: EnhancedAnalysisIssue[]): number {
    const securityIssues = issues.filter(i => i.type === 'security');
    const criticalCount = securityIssues.filter(i => i.severity === 'critical').length;
    const highCount = securityIssues.filter(i => i.severity === 'high').length;
    const mediumCount = securityIssues.filter(i => i.severity === 'medium').length;
    
    return Math.max(0, 100 - (criticalCount * 30) - (highCount * 15) - (mediumCount * 5));
  }

  private calculatePerformanceScore(issues: EnhancedAnalysisIssue[]): number {
    const performanceIssues = issues.filter(i => i.type === 'performance');
    const criticalCount = performanceIssues.filter(i => i.severity === 'critical').length;
    const highCount = performanceIssues.filter(i => i.severity === 'high').length;
    const mediumCount = performanceIssues.filter(i => i.severity === 'medium').length;
    
    return Math.max(0, 100 - (criticalCount * 25) - (highCount * 10) - (mediumCount * 5));
  }

  private calculateQualityScore(issues: EnhancedAnalysisIssue[]): number {
    const qualityIssues = issues.filter(i => i.type === 'quality');
    const criticalCount = qualityIssues.filter(i => i.severity === 'critical').length;
    const highCount = qualityIssues.filter(i => i.severity === 'high').length;
    const mediumCount = qualityIssues.filter(i => i.severity === 'medium').length;
    
    return Math.max(0, 100 - (criticalCount * 20) - (highCount * 10) - (mediumCount * 5));
  }

  private generateRecommendations(issues: EnhancedAnalysisIssue[], filePath: string): any[] {
    const recommendations = [];
    
    // Group issues by category
    const securityIssues = issues.filter(i => i.type === 'security');
    const performanceIssues = issues.filter(i => i.type === 'performance');
    const qualityIssues = issues.filter(i => i.type === 'quality');
    
    if (securityIssues.length > 0) {
      recommendations.push({
        priority: 'immediate',
        title: 'Address Security Vulnerabilities',
        description: `Found ${securityIssues.length} security issues that need immediate attention.`,
        estimatedEffort: securityIssues.length * 2,
        impact: 'critical',
        files: [filePath]
      });
    }
    
    if (performanceIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Optimize Performance Issues',
        description: `Found ${performanceIssues.length} performance issues that could impact user experience.`,
        estimatedEffort: performanceIssues.length * 1.5,
        impact: 'high',
        files: [filePath]
      });
    }
    
    if (qualityIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Improve Code Quality',
        description: `Found ${qualityIssues.length} code quality issues that affect maintainability.`,
        estimatedEffort: qualityIssues.length * 1,
        impact: 'medium',
        files: [filePath]
      });
    }
    
    return recommendations;
  }

  // Helper methods
  private parseJavaScript(content: string, filePath: string): any {
    try {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        return this.parser.parse(content, {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: { jsx: true }
        });
      } else {
        return esprima.parse(content, {
          loc: true,
          range: true,
          tokens: true,
          comment: true
        });
      }
    } catch (error) {
      throw new Error(`Failed to parse ${filePath}: ${error}`);
    }
  }

  private traverseAST(node: any, callback: (node: any) => void): void {
    callback(node);
    
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach((child: any) => {
            if (child && typeof child === 'object' && child.type) {
              this.traverseAST(child, callback);
            }
          });
        } else if (node[key].type) {
          this.traverseAST(node[key], callback);
        }
      }
    }
  }

  private getNodeCode(node: any): string {
    // This would need to be implemented based on the source code
    return '// Code snippet would be extracted here';
  }

  private calculateCyclomaticComplexity(ast: any): number {
    let complexity = 1;
    
    this.traverseAST(ast, (node) => {
      if (node.type === 'IfStatement' || node.type === 'SwitchCase' || 
          node.type === 'ForStatement' || node.type === 'WhileStatement' ||
          node.type === 'DoWhileStatement' || node.type === 'CatchClause' ||
          node.type === 'ConditionalExpression') {
        complexity++;
      }
    });
    
    return complexity;
  }

  private calculateCommentRatio(content: string): number {
    const lines = content.split('\n');
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || line.trim().startsWith('/*') || 
      line.trim().startsWith('*') || line.trim().startsWith('*/')
    ).length;
    
    return (commentLines / lines.length) * 100;
  }

  private calculateEnhancedSummary(issues: EnhancedAnalysisIssue[]): any {
    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highPriorityIssues: issues.filter(i => i.severity === 'high').length,
      mediumPriorityIssues: issues.filter(i => i.severity === 'medium').length,
      lowPriorityIssues: issues.filter(i => i.severity === 'low').length,
      securityIssues: issues.filter(i => i.type === 'security').length,
      qualityIssues: issues.filter(i => i.type === 'quality').length,
      performanceIssues: issues.filter(i => i.type === 'performance').length,
      bestPracticeIssues: issues.filter(i => i.type === 'best-practice').length,
      memoryLeakIssues: issues.filter(i => i.type === 'memory-leak').length,
      duplicationIssues: issues.filter(i => i.type === 'duplication').length
    };
  }

  // Additional helper methods for specific checks
  private isInefficientLoop(node: any): boolean {
    // Check for common inefficient loop patterns
    return node.test && node.test.type === 'BinaryExpression' &&
           node.test.operator === '<' && node.test.right.type === 'Identifier';
  }

  private getFunctionLength(node: any): number {
    if (!node.body || !node.body.loc) return 0;
    return node.body.loc.end.line - node.body.loc.start.line;
  }

  private getNestingDepth(node: any): number {
    let depth = 0;
    let current = node;
    
    while (current.parent) {
      if (current.parent.type === 'IfStatement' || current.parent.type === 'ForStatement' ||
          current.parent.type === 'WhileStatement' || current.parent.type === 'SwitchCase') {
        depth++;
      }
      current = current.parent;
    }
    
    return depth;
  }

  private isCommonNumber(value: number): boolean {
    return [0, 1, 2, 3, 4, 5, 10, 100, 1000, -1, -2].includes(value);
  }

  private hasLargeClosure(node: any): boolean {
    // Simplified check for closure patterns
    return node.type === 'FunctionExpression' && node.body && 
           node.body.body && node.body.body.length > 10;
  }

  // Mobile-specific helper methods
  private analyzeFunction(node: any, issues: EnhancedAnalysisIssue[], fileName: string): void {
    // Function analysis logic
  }

  private analyzeClass(node: any, issues: EnhancedAnalysisIssue[], fileName: string): void {
    // Class analysis logic
  }
} 