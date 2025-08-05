import * as path from 'path';

export interface MobileAnalysisIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  column?: number;
  code?: string;
  suggestion?: string;
  impact?: string;
  category: string;
}

export interface MobileAnalysisResult {
  issues: MobileAnalysisIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
    securityIssues: number;
    qualityIssues: number;
    performanceIssues: number;
    accessibilityIssues: number;
  };
  metrics: {
    totalLines: number;
    totalFunctions: number;
    totalClasses: number;
    averageComplexity: number;
    commentRatio: number;
  };
}

export class MobileAnalyzer {
  constructor() {
    // Initialize mobile analyzer
  }

  /**
   * Analyze Flutter/Dart file
   */
  async analyzeFlutterFile(filePath: string, content: string): Promise<MobileAnalysisResult> {
    const issues: MobileAnalysisIssue[] = [];
    const metrics = {
      totalLines: content.split('\n').length,
      totalFunctions: 0,
      totalClasses: 0,
      averageComplexity: 0,
      commentRatio: this.calculateCommentRatio(content)
    };

    // Analyze Flutter-specific issues
    this.analyzeFlutterContent(content, issues, path.basename(filePath));
    
    // Calculate metrics
    metrics.totalFunctions = this.countFlutterFunctions(content);
    metrics.totalClasses = this.countFlutterClasses(content);
    metrics.averageComplexity = this.calculateFlutterComplexity(content);

    return {
      issues,
      summary: this.calculateSummary(issues),
      metrics
    };
  }

  /**
   * Analyze React Native file
   */
  async analyzeReactNativeFile(filePath: string, content: string): Promise<MobileAnalysisResult> {
    const issues: MobileAnalysisIssue[] = [];
    const metrics = {
      totalLines: content.split('\n').length,
      totalFunctions: 0,
      totalClasses: 0,
      averageComplexity: 0,
      commentRatio: this.calculateCommentRatio(content)
    };

    // Analyze React Native-specific issues
    this.analyzeReactNativeContent(content, issues, path.basename(filePath));
    
    // Calculate metrics
    metrics.totalFunctions = this.countReactNativeFunctions(content);
    metrics.totalClasses = this.countReactNativeClasses(content);
    metrics.averageComplexity = this.calculateReactNativeComplexity(content);

    return {
      issues,
      summary: this.calculateSummary(issues),
      metrics
    };
  }

  /**
   * Analyze iOS/Swift file
   */
  async analyzeIOSFile(filePath: string, content: string): Promise<MobileAnalysisResult> {
    const issues: MobileAnalysisIssue[] = [];
    const metrics = {
      totalLines: content.split('\n').length,
      totalFunctions: 0,
      totalClasses: 0,
      averageComplexity: 0,
      commentRatio: this.calculateCommentRatio(content)
    };

    // Analyze iOS-specific issues
    this.analyzeIOSContent(content, issues, path.basename(filePath));
    
    // Calculate metrics
    metrics.totalFunctions = this.countIOSFunctions(content);
    metrics.totalClasses = this.countIOSClasses(content);
    metrics.averageComplexity = this.calculateIOSComplexity(content);

    return {
      issues,
      summary: this.calculateSummary(issues),
      metrics
    };
  }

  /**
   * Analyze Android/Java/Kotlin file
   */
  async analyzeAndroidFile(filePath: string, content: string): Promise<MobileAnalysisResult> {
    const issues: MobileAnalysisIssue[] = [];
    const metrics = {
      totalLines: content.split('\n').length,
      totalFunctions: 0,
      totalClasses: 0,
      averageComplexity: 0,
      commentRatio: this.calculateCommentRatio(content)
    };

    // Analyze Android-specific issues
    this.analyzeAndroidContent(content, issues, path.basename(filePath));
    
    // Calculate metrics
    metrics.totalFunctions = this.countAndroidFunctions(content);
    metrics.totalClasses = this.countAndroidClasses(content);
    metrics.averageComplexity = this.calculateAndroidComplexity(content);

    return {
      issues,
      summary: this.calculateSummary(issues),
      metrics
    };
  }

  /**
   * Analyze Flutter content
   */
  private analyzeFlutterContent(content: string, issues: MobileAnalysisIssue[], fileName: string): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for hardcoded strings
      if (line.includes('"') && line.includes('password') || line.includes('secret') || line.includes('key')) {
        issues.push({
          type: 'security',
          severity: 'critical',
          title: 'Hardcoded credentials in Flutter',
          description: 'Hardcoded credentials should be moved to secure storage',
          file: fileName,
          line: index + 1,
          code: line,
          suggestion: 'Use flutter_secure_storage for sensitive data',
          impact: 'Security vulnerability',
          category: 'security'
        });
      }
      
      // Check for print statements
      if (line.includes('print(')) {
        issues.push({
          type: 'quality',
          severity: 'low',
          title: 'Print statement in Flutter',
          description: 'Print statements should be replaced with proper logging',
          file: fileName,
          line: index + 1,
          code: line,
          suggestion: 'Use debugPrint or a logging library',
          impact: 'Code quality issue',
          category: 'quality'
        });
      }
    });
  }

  /**
   * Analyze React Native content
   */
  private analyzeReactNativeContent(content: string, issues: MobileAnalysisIssue[], fileName: string): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for console statements
      if (line.includes('console.log(')) {
        issues.push({
          type: 'quality',
          severity: 'low',
          title: 'Console statement in React Native',
          description: 'Console statements should be removed from production',
          file: fileName,
          line: index + 1,
          code: line,
          suggestion: 'Use a proper logging library',
          impact: 'Code quality issue',
          category: 'quality'
        });
      }
      
      // Check for hardcoded URLs
      if (line.includes('http://') && !line.includes('localhost')) {
        issues.push({
          type: 'security',
          severity: 'medium',
          title: 'Insecure HTTP URL in React Native',
          description: 'HTTP URLs should use HTTPS in production',
          file: fileName,
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
   * Analyze iOS content
   */
  private analyzeIOSContent(content: string, issues: MobileAnalysisIssue[], fileName: string): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for hardcoded strings
      if (line.includes('"') && line.includes('password') || line.includes('secret') || line.includes('key')) {
        issues.push({
          type: 'security',
          severity: 'critical',
          title: 'Hardcoded credentials in iOS',
          description: 'Hardcoded credentials should be moved to Keychain',
          file: fileName,
          line: index + 1,
          code: line,
          suggestion: 'Use Keychain Services for sensitive data',
          impact: 'Security vulnerability',
          category: 'security'
        });
      }
      
      // Check for print statements
      if (line.includes('print(')) {
        issues.push({
          type: 'quality',
          severity: 'low',
          title: 'Print statement in iOS',
          description: 'Print statements should be replaced with proper logging',
          file: fileName,
          line: index + 1,
          code: line,
          suggestion: 'Use NSLog or a logging library',
          impact: 'Code quality issue',
          category: 'quality'
        });
      }
    });
  }

  /**
   * Analyze Android content
   */
  private analyzeAndroidContent(content: string, issues: MobileAnalysisIssue[], fileName: string): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for hardcoded strings
      if (line.includes('"') && line.includes('password') || line.includes('secret') || line.includes('key')) {
        issues.push({
          type: 'security',
          severity: 'critical',
          title: 'Hardcoded credentials in Android',
          description: 'Hardcoded credentials should be moved to Keystore',
          file: fileName,
          line: index + 1,
          code: line,
          suggestion: 'Use Android Keystore for sensitive data',
          impact: 'Security vulnerability',
          category: 'security'
        });
      }
      
      // Check for Log statements
      if (line.includes('Log.d(') || line.includes('Log.e(') || line.includes('Log.i(')) {
        issues.push({
          type: 'quality',
          severity: 'low',
          title: 'Log statement in Android',
          description: 'Log statements should be removed from production',
          file: fileName,
          line: index + 1,
          code: line,
          suggestion: 'Use a proper logging library or remove logs',
          impact: 'Code quality issue',
          category: 'quality'
        });
      }
    });
  }

  /**
   * Count Flutter functions
   */
  private countFlutterFunctions(content: string): number {
    const functionRegex = /void\s+\w+\s*\(|Widget\s+\w+\s*\(|Future<[^>]*>\s+\w+\s*\(/g;
    const matches = content.match(functionRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Count Flutter classes
   */
  private countFlutterClasses(content: string): number {
    const classRegex = /class\s+\w+\s+extends\s+\w+|class\s+\w+\s*{/g;
    const matches = content.match(classRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Calculate Flutter complexity
   */
  private calculateFlutterComplexity(content: string): number {
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case'];
    let complexity = 1;
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  /**
   * Count React Native functions
   */
  private countReactNativeFunctions(content: string): number {
    const functionRegex = /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|const\s+\w+\s*=\s*\(\(/g;
    const matches = content.match(functionRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Count React Native classes
   */
  private countReactNativeClasses(content: string): number {
    const classRegex = /class\s+\w+\s+extends\s+Component|class\s+\w+\s+extends\s+React\.Component/g;
    const matches = content.match(classRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Calculate React Native complexity
   */
  private calculateReactNativeComplexity(content: string): number {
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case'];
    let complexity = 1;
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  /**
   * Count iOS functions
   */
  private countIOSFunctions(content: string): number {
    const functionRegex = /func\s+\w+\s*\(/g;
    const matches = content.match(functionRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Count iOS classes
   */
  private countIOSClasses(content: string): number {
    const classRegex = /class\s+\w+\s*:|struct\s+\w+\s*{/g;
    const matches = content.match(classRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Calculate iOS complexity
   */
  private calculateIOSComplexity(content: string): number {
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case'];
    let complexity = 1;
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  /**
   * Count Android functions
   */
  private countAndroidFunctions(content: string): number {
    const functionRegex = /public\s+\w+\s+\w+\s*\(|private\s+\w+\s+\w+\s*\(|protected\s+\w+\s+\w+\s*\(/g;
    const matches = content.match(functionRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Count Android classes
   */
  private countAndroidClasses(content: string): number {
    const classRegex = /class\s+\w+\s+extends\s+\w+|class\s+\w+\s*{/g;
    const matches = content.match(classRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Calculate Android complexity
   */
  private calculateAndroidComplexity(content: string): number {
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case'];
    let complexity = 1;
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
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
   * Calculate summary statistics
   */
  private calculateSummary(issues: MobileAnalysisIssue[]): any {
    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highPriorityIssues: issues.filter(i => i.severity === 'high').length,
      mediumPriorityIssues: issues.filter(i => i.severity === 'medium').length,
      lowPriorityIssues: issues.filter(i => i.severity === 'low').length,
      securityIssues: issues.filter(i => i.category === 'security').length,
      qualityIssues: issues.filter(i => i.category === 'quality').length,
      performanceIssues: issues.filter(i => i.category === 'performance').length,
      accessibilityIssues: issues.filter(i => i.category === 'accessibility').length
    };
  }
} 