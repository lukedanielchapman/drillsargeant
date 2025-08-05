import * as path from 'path';
import { parse } from '@typescript-eslint/parser';
import { MobileAnalyzer } from './mobile-analyzer';

export interface EnhancedAnalysisIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  column?: number;
  code?: string;
  suggestion?: string;
  fixExample?: string;
  impact?: string;
  cweId?: string;
  owaspCategory?: string;
  category: string;
}

export interface EnhancedAnalysisResult {
  issues: EnhancedAnalysisIssue[];
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
}

export class EnhancedAnalyzer {
  private parser: any;
  private mobileAnalyzer: MobileAnalyzer;
  private supportedExtensions: string[];
  private excludePatterns: string[];

  constructor() {
    this.parser = parse;
    this.mobileAnalyzer = new MobileAnalyzer();
    this.supportedExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
      '.css', '.scss', '.sass', '.less',
      '.html', '.htm', '.xml', '.svg',
      '.dart', '.swift', '.java', '.kt', '.ktm',
      '.py', '.rb', '.php', '.go', '.rs', '.cs'
    ];
    this.excludePatterns = [
      'node_modules', 'vendor', 'Pods', 'DerivedData',
      '.git', '.svn', '.hg', '.DS_Store',
      'build', 'dist', '.next', '.nuxt',
      '*.min.js', '*.min.css', '*.bundle.js',
      '*.g.dart', '*.freezed.dart', '*.mocks.dart',
      'R.java', 'BuildConfig.java', '*.generated.*',
      '*.d.ts', '*.map', '*.log', '*.tmp'
    ];
  }

  /**
   * Filter files to only include custom-coded files
   */
  filterCustomCodeFiles(files: string[]): string[] {
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      const fileName = path.basename(file).toLowerCase();
      const filePath = file.toLowerCase();

      // Check if file extension is supported
      if (!this.supportedExtensions.includes(ext)) {
        return false;
      }

      // Check if file should be excluded
      for (const pattern of this.excludePatterns) {
        if (pattern.includes('*')) {
          // Handle wildcard patterns
          const regex = new RegExp(pattern.replace('*', '.*'));
          if (regex.test(fileName) || regex.test(filePath)) {
            return false;
          }
        } else {
          // Handle exact match patterns
          if (filePath.includes(pattern) || fileName.includes(pattern)) {
            return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * Analyze a file based on its type
   */
  async analyzeFile(filePath: string, content: string): Promise<EnhancedAnalysisResult> {
    const ext = path.extname(filePath).toLowerCase();
    
    // Route to mobile analyzer for mobile files
    if (['.dart', '.swift', '.java', '.kt', '.ktm'].includes(ext)) {
      if (ext === '.dart') {
        return this.convertMobileResult(await this.mobileAnalyzer.analyzeFlutterFile(filePath, content));
      } else if (ext === '.swift') {
        return this.convertMobileResult(await this.mobileAnalyzer.analyzeIOSFile(filePath, content));
      } else if (['.java', '.kt', '.ktm'].includes(ext)) {
        return this.convertMobileResult(await this.mobileAnalyzer.analyzeAndroidFile(filePath, content));
      }
    }
    
    // Use enhanced JavaScript analysis for JS/TS files
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      return this.analyzeJavaScriptFile(filePath, content);
    }
    
    // Use basic analysis for other files
    return this.analyzeBasicFile(filePath, content);
  }

  /**
   * Convert MobileAnalysisResult to EnhancedAnalysisResult
   */
  private convertMobileResult(mobileResult: any): EnhancedAnalysisResult {
    return {
      issues: mobileResult.issues.map((issue: any) => ({
        type: issue.type,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        file: issue.file,
        line: issue.line,
        column: issue.column,
        code: issue.code,
        suggestion: issue.suggestion,
        impact: issue.impact,
        category: issue.category
      })),
      summary: {
        totalIssues: mobileResult.summary.totalIssues,
        criticalIssues: mobileResult.summary.criticalIssues,
        highPriorityIssues: mobileResult.summary.highPriorityIssues,
        mediumPriorityIssues: mobileResult.summary.mediumPriorityIssues,
        lowPriorityIssues: mobileResult.summary.lowPriorityIssues,
        securityIssues: mobileResult.summary.securityIssues,
        qualityIssues: mobileResult.summary.qualityIssues,
        performanceIssues: mobileResult.summary.performanceIssues,
        bestPracticeIssues: 0, // Mobile analyzer doesn't have these
        memoryLeakIssues: 0,   // Mobile analyzer doesn't have these
        duplicationIssues: 0    // Mobile analyzer doesn't have these
      },
      metrics: {
        totalFiles: 1,
        totalLines: mobileResult.metrics.totalLines,
        totalFunctions: mobileResult.metrics.totalFunctions,
        totalClasses: mobileResult.metrics.totalClasses,
        averageComplexity: mobileResult.metrics.averageComplexity,
        securityScore: 100,
        performanceScore: 100,
        qualityScore: 100
      }
    };
  }

  /**
   * Analyze JavaScript/TypeScript file with enhanced checks
   */
  async analyzeJavaScriptFile(filePath: string, content: string): Promise<EnhancedAnalysisResult> {
    const issues: EnhancedAnalysisIssue[] = [];
    const metrics = {
      totalFiles: 1,
      totalLines: content.split('\n').length,
      totalFunctions: 0,
      totalClasses: 0,
      averageComplexity: 0,
      securityScore: 100,
      performanceScore: 100,
      qualityScore: 100
    };

    try {
      // Parse the code
      const ast = this.parseJavaScript(content);
      
      // Analyze for security issues
      this.analyzeSecurityIssues(ast, issues, filePath);
      
      // Analyze for performance issues
      this.analyzePerformanceIssues(ast, issues, filePath);
      
      // Analyze for code quality issues
      this.analyzeQualityIssues(ast, issues, filePath);
      
      // Analyze for best practices
      this.analyzeBestPractices(ast, issues, filePath);
      
      // Analyze for memory leaks
      this.analyzeMemoryLeaks(ast, issues, filePath);
      
      // Calculate metrics
      this.calculateMetrics(ast, metrics, content);
      
      // Calculate scores
      this.calculateScores(issues, metrics);

    } catch (error) {
      issues.push({
        type: 'parsing-error',
        severity: 'medium',
        title: 'Code Parsing Error',
        description: 'Unable to parse the code for detailed analysis',
        file: path.basename(filePath),
        line: 1,
        category: 'quality'
      });
    }

    return {
      issues,
      summary: this.calculateSummary(issues),
      metrics
    };
  }

  /**
   * Analyze basic file types
   */
  async analyzeBasicFile(filePath: string, content: string): Promise<EnhancedAnalysisResult> {
    const issues: EnhancedAnalysisIssue[] = [];
    const metrics = {
      totalFiles: 1,
      totalLines: content.split('\n').length,
      totalFunctions: 0,
      totalClasses: 0,
      averageComplexity: 0,
      securityScore: 100,
      performanceScore: 100,
      qualityScore: 100
    };

    // Basic analysis for non-JavaScript files
    this.analyzeBasicContent(content, issues, filePath);
    
    return {
      issues,
      summary: this.calculateSummary(issues),
      metrics
    };
  }

  /**
   * Parse JavaScript/TypeScript code
   */
  private parseJavaScript(content: string): any {
    try {
      return this.parser(content, {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      });
    } catch (error) {
      throw new Error(`Failed to parse JavaScript: ${error}`);
    }
  }

  /**
   * Analyze security issues
   */
  private analyzeSecurityIssues(ast: any, issues: EnhancedAnalysisIssue[], filePath: string): void {
    this.traverseAST(ast, (node: any) => {
      // Check for eval usage
      if (node.type === 'CallExpression' && node.callee && node.callee.name === 'eval') {
        issues.push({
          type: 'security',
          severity: 'critical',
          title: 'Use of eval()',
          description: 'eval() can execute arbitrary code and is a security risk',
          file: path.basename(filePath),
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 0,
          code: this.getNodeCode(node),
          suggestion: 'Replace eval() with safer alternatives like JSON.parse() or Function constructor',
          impact: 'Critical security vulnerability',
          cweId: 'CWE-78',
          owaspCategory: 'A03:2021-Injection',
          category: 'security'
        });
      }

      // Check for innerHTML usage
      if (node.type === 'AssignmentExpression' && 
          node.left && 
          node.left.property && 
          node.left.property.name === 'innerHTML') {
        issues.push({
          type: 'security',
          severity: 'high',
          title: 'Use of innerHTML',
          description: 'innerHTML can lead to XSS attacks',
          file: path.basename(filePath),
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 0,
          code: this.getNodeCode(node),
          suggestion: 'Use textContent or createElement instead of innerHTML',
          impact: 'Potential XSS vulnerability',
          cweId: 'CWE-79',
          owaspCategory: 'A03:2021-Injection',
          category: 'security'
        });
      }

      // Check for hardcoded credentials
      if (node.type === 'VariableDeclarator' && 
          node.id && 
          node.id.name && 
          ['password', 'secret', 'apiKey', 'token'].some(key => 
            node.id.name.toLowerCase().includes(key))) {
        issues.push({
          type: 'security',
          severity: 'critical',
          title: 'Hardcoded Credentials',
          description: 'Potential hardcoded credentials detected',
          file: path.basename(filePath),
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 0,
          code: this.getNodeCode(node),
          suggestion: 'Use environment variables or secure configuration management',
          impact: 'Critical security vulnerability',
          cweId: 'CWE-259',
          owaspCategory: 'A07:2021-Identification and Authentication Failures',
          category: 'security'
        });
      }
    });
  }

  /**
   * Analyze performance issues
   */
  private analyzePerformanceIssues(ast: any, issues: EnhancedAnalysisIssue[], filePath: string): void {
    this.traverseAST(ast, (node: any) => {
      // Check for nested loops
      if (node.type === 'ForStatement' || node.type === 'WhileStatement') {
        const nestedLoops = this.findNestedLoops(node);
        if (nestedLoops > 2) {
          issues.push({
            type: 'performance',
            severity: 'medium',
            title: 'Deeply nested loops',
            description: `Found ${nestedLoops} levels of nested loops which can impact performance`,
            file: path.basename(filePath),
            line: node.loc?.start?.line || 1,
            column: node.loc?.start?.column || 0,
            code: this.getNodeCode(node),
            suggestion: 'Consider refactoring to reduce nesting or use more efficient algorithms',
            impact: 'Performance degradation',
            category: 'performance'
          });
        }
      }

      // Check for inefficient array operations
      if (node.type === 'CallExpression' && 
          node.callee && 
          node.callee.property && 
          ['indexOf', 'includes'].includes(node.callee.property.name)) {
        issues.push({
          type: 'performance',
          severity: 'low',
          title: 'Inefficient array operation',
          description: 'Consider using Set or Map for better performance',
          file: path.basename(filePath),
            line: node.loc?.start?.line || 1,
            column: node.loc?.start?.column || 0,
            code: this.getNodeCode(node),
            suggestion: 'Use Set or Map for O(1) lookups instead of array methods',
            impact: 'Performance optimization opportunity',
            category: 'performance'
        });
      }
    });
  }

  /**
   * Analyze code quality issues
   */
  private analyzeQualityIssues(ast: any, issues: EnhancedAnalysisIssue[], filePath: string): void {
    this.traverseAST(ast, (node: any) => {
      // Check for console statements
      if (node.type === 'CallExpression' && 
          node.callee && 
          node.callee.object && 
          node.callee.object.name === 'console') {
        issues.push({
          type: 'quality',
          severity: 'low',
          title: 'Console statement in code',
          description: 'Console statements should be removed from production code',
          file: path.basename(filePath),
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 0,
          code: this.getNodeCode(node),
          suggestion: 'Remove console statements or use a logging library',
          impact: 'Code quality issue',
          category: 'quality'
        });
      }

      // Check for magic numbers
      if (node.type === 'Literal' && typeof node.value === 'number' && node.value > 100) {
        issues.push({
          type: 'quality',
          severity: 'low',
          title: 'Magic number',
          description: `Magic number ${node.value} should be extracted to a named constant`,
          file: path.basename(filePath),
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 0,
          code: this.getNodeCode(node),
          suggestion: 'Extract magic numbers to named constants with descriptive names',
          impact: 'Code maintainability',
          category: 'quality'
        });
      }
    });
  }

  /**
   * Analyze best practices
   */
  private analyzeBestPractices(ast: any, issues: EnhancedAnalysisIssue[], filePath: string): void {
    this.traverseAST(ast, (node: any) => {
      // Check for proper error handling
      if (node.type === 'TryStatement' && !node.handler) {
        issues.push({
          type: 'best-practice',
          severity: 'medium',
          title: 'Missing error handling',
          description: 'Try block without catch clause',
          file: path.basename(filePath),
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 0,
          code: this.getNodeCode(node),
          suggestion: 'Add proper error handling with catch clause',
          impact: 'Potential runtime errors',
          category: 'best-practice'
        });
      }
    });
  }

  /**
   * Analyze memory leaks
   */
  private analyzeMemoryLeaks(ast: any, issues: EnhancedAnalysisIssue[], filePath: string): void {
    this.traverseAST(ast, (node: any) => {
      // Check for uncleaned event listeners
      if (node.type === 'CallExpression' && 
          node.callee && 
          node.callee.property && 
          node.callee.property.name === 'addEventListener') {
        issues.push({
          type: 'memory-leak',
          severity: 'medium',
          title: 'Potential memory leak',
          description: 'Event listener added without cleanup',
          file: path.basename(filePath),
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 0,
          code: this.getNodeCode(node),
          suggestion: 'Ensure event listeners are removed when components unmount',
          impact: 'Memory leak potential',
          category: 'memory-leak'
        });
      }

      // Check for uncleaned timers
      if (node.type === 'CallExpression' && 
          node.callee && 
          node.callee.name && 
          ['setTimeout', 'setInterval'].includes(node.callee.name)) {
        issues.push({
          type: 'memory-leak',
          severity: 'medium',
          title: 'Potential memory leak',
          description: 'Timer set without cleanup',
          file: path.basename(filePath),
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 0,
          code: this.getNodeCode(node),
          suggestion: 'Ensure timers are cleared when components unmount',
          impact: 'Memory leak potential',
          category: 'memory-leak'
        });
      }
    });
  }

  /**
   * Analyze basic content for non-JavaScript files
   */
  private analyzeBasicContent(content: string, issues: EnhancedAnalysisIssue[], filePath: string): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for hardcoded URLs
      if (line.includes('http://') && !line.includes('localhost')) {
        issues.push({
          type: 'security',
          severity: 'medium',
          title: 'Insecure HTTP URL',
          description: 'HTTP URLs should use HTTPS in production',
          file: path.basename(filePath),
          line: index + 1,
          code: line,
          suggestion: 'Use HTTPS URLs for production environments',
          impact: 'Security vulnerability',
          category: 'security'
        });
      }
    });
  }

  /**
   * Traverse AST nodes
   */
  private traverseAST(node: any, callback: (node: any) => void): void {
    if (!node || typeof node !== 'object') return;
    
    callback(node);
    
    for (const key in node) {
      if (node.hasOwnProperty(key) && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach((child: any) => this.traverseAST(child, callback));
        } else {
          this.traverseAST(node[key], callback);
        }
      }
    }
  }

  /**
   * Find nested loops
   */
  private findNestedLoops(node: any, depth: number = 0): number {
    if (!node) return depth;

    let maxDepth = depth;
    
    if (node.type === 'ForStatement' || node.type === 'WhileStatement') {
      maxDepth = Math.max(maxDepth, depth + 1);
    }

    if (node.body) {
      if (Array.isArray(node.body)) {
        node.body.forEach((child: any) => {
          maxDepth = Math.max(maxDepth, this.findNestedLoops(child, depth + 1));
        });
      } else {
        maxDepth = Math.max(maxDepth, this.findNestedLoops(node.body, depth + 1));
      }
    }

    return maxDepth;
  }

  /**
   * Get code snippet for a node
   */
  private getNodeCode(_node: any): string {
    // This would extract the actual code for the node
    // For now, return a placeholder
    return 'Code snippet not available';
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(ast: any, metrics: any, content: string): void {
    let functionCount = 0;
    let classCount = 0;
    let complexity = 0;

    this.traverseAST(ast, (node: any) => {
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        functionCount++;
      }
      
      if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
        classCount++;
      }
      
      if (node.type === 'IfStatement' || node.type === 'SwitchCase' || node.type === 'ForStatement' || 
          node.type === 'WhileStatement' || node.type === 'DoWhileStatement' || node.type === 'CatchClause') {
        complexity++;
      }
    });

    metrics.totalFunctions = functionCount;
    metrics.totalClasses = classCount;
    metrics.averageComplexity = complexity;
    metrics.commentRatio = this.calculateCommentRatio(content);
  }

  /**
   * Calculate comment ratio
   */
  private calculateCommentRatio(content: string): number {
    const lines = content.split('\n');
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*') ||
      line.includes('<!--') ||
      line.includes('-->')
    ).length;
    
    return lines.length > 0 ? (commentLines / lines.length) * 100 : 0;
  }

  /**
   * Calculate scores based on issues
   */
  private calculateScores(issues: EnhancedAnalysisIssue[], metrics: any): void {
    let securityDeduction = 0;
    let performanceDeduction = 0;
    let qualityDeduction = 0;

    issues.forEach(issue => {
      const deduction = this.getIssueDeduction(issue.severity);
      
      switch (issue.category) {
        case 'security':
          securityDeduction += deduction;
          break;
        case 'performance':
          performanceDeduction += deduction;
          break;
        case 'quality':
          qualityDeduction += deduction;
          break;
      }
    });

    metrics.securityScore = Math.max(0, 100 - securityDeduction);
    metrics.performanceScore = Math.max(0, 100 - performanceDeduction);
    metrics.qualityScore = Math.max(0, 100 - qualityDeduction);
  }

  /**
   * Get deduction amount for issue severity
   */
  private getIssueDeduction(severity: string): number {
    switch (severity) {
      case 'critical': return 30;
      case 'high': return 20;
      case 'medium': return 10;
      case 'low': return 5;
      default: return 0;
    }
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(issues: EnhancedAnalysisIssue[]): any {
    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highPriorityIssues: issues.filter(i => i.severity === 'high').length,
      mediumPriorityIssues: issues.filter(i => i.severity === 'medium').length,
      lowPriorityIssues: issues.filter(i => i.severity === 'low').length,
      securityIssues: issues.filter(i => i.category === 'security').length,
      qualityIssues: issues.filter(i => i.category === 'quality').length,
      performanceIssues: issues.filter(i => i.category === 'performance').length,
      bestPracticeIssues: issues.filter(i => i.category === 'best-practice').length,
      memoryLeakIssues: issues.filter(i => i.category === 'memory-leak').length,
      duplicationIssues: issues.filter(i => i.category === 'duplication').length
    };
  }
} 