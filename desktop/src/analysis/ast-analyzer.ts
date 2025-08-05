import * as path from 'path';
import { parse } from '@typescript-eslint/parser';

export interface AnalysisIssue {
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

export interface ASTAnalysisResult {
  issues: AnalysisIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
    securityIssues: number;
    qualityIssues: number;
    performanceIssues: number;
  };
  metrics: {
    totalLines: number;
    totalFunctions: number;
    totalClasses: number;
    averageComplexity: number;
    commentRatio: number;
  };
}

export class ASTAnalyzer {
  constructor() {
    // Initialize parser
  }

  /**
   * Analyze JavaScript/TypeScript file
   */
  async analyzeJavaScriptFile(filePath: string, content: string): Promise<ASTAnalysisResult> {
    const issues: AnalysisIssue[] = [];
    const metrics = {
      totalLines: content.split('\n').length,
      totalFunctions: 0,
      totalClasses: 0,
      averageComplexity: 0,
      commentRatio: this.calculateCommentRatio(content)
    };

    try {
      // Parse JavaScript/TypeScript code using TypeScript parser
      const ast = parse(content, {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      });
      
      // Analyze AST for issues
      this.analyzeAST(ast, issues, path.basename(filePath));
      
      // Calculate metrics
      metrics.totalFunctions = this.countFunctions(ast);
      metrics.totalClasses = this.countClasses(ast);
      metrics.averageComplexity = this.calculateComplexity(ast);

    } catch (error) {
      // If parsing fails, still provide basic analysis
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
   * Analyze CSS file
   */
  async analyzeCSSFile(filePath: string, content: string): Promise<ASTAnalysisResult> {
    const issues: AnalysisIssue[] = [];
    const metrics = {
      totalLines: content.split('\n').length,
      totalFunctions: 0,
      totalClasses: 0,
      averageComplexity: 0,
      commentRatio: this.calculateCommentRatio(content)
    };

    // Basic CSS analysis without AST parsing
    this.analyzeBasicCSS(content, issues, path.basename(filePath));

    return {
      issues,
      summary: this.calculateSummary(issues),
      metrics
    };
  }

  /**
   * Analyze HTML file
   */
  async analyzeHTMLFile(filePath: string, content: string): Promise<ASTAnalysisResult> {
    const issues: AnalysisIssue[] = [];
    const metrics = {
      totalLines: content.split('\n').length,
      totalFunctions: 0,
      totalClasses: 0,
      averageComplexity: 0,
      commentRatio: this.calculateCommentRatio(content)
    };

    // Basic HTML analysis without AST parsing
    this.analyzeBasicHTML(content, issues, path.basename(filePath));

    return {
      issues,
      summary: this.calculateSummary(issues),
      metrics
    };
  }

  /**
   * Analyze JavaScript/TypeScript AST
   */
  private analyzeAST(ast: any, issues: AnalysisIssue[], fileName: string): void {
    if (!ast || !ast.body) return;

    ast.body.forEach((node: any) => {
      this.analyzeNode(node, issues, fileName);
    });
  }

  /**
   * Analyze individual AST node
   */
  private analyzeNode(node: any, issues: AnalysisIssue[], fileName: string): void {
    if (!node) return;

    // Check for security issues
    this.checkSecurityIssues(node, issues, fileName);
    
    // Check for performance issues
    this.checkPerformanceIssues(node, issues, fileName);
    
    // Check for code quality issues
    this.checkQualityIssues(node, issues, fileName);

    // Recursively analyze child nodes
    if (node.body) {
      if (Array.isArray(node.body)) {
        node.body.forEach((child: any) => this.analyzeNode(child, issues, fileName));
      } else {
        this.analyzeNode(node.body, issues, fileName);
      }
    }
  }

  /**
   * Check for security issues
   */
  private checkSecurityIssues(node: any, issues: AnalysisIssue[], fileName: string): void {
    // Check for eval usage
    if (node.type === 'CallExpression' && node.callee && node.callee.name === 'eval') {
      issues.push({
        type: 'security',
        severity: 'critical',
        title: 'Use of eval()',
        description: 'eval() can execute arbitrary code and is a security risk',
        file: fileName,
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
        file: fileName,
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
  }

  /**
   * Check for performance issues
   */
  private checkPerformanceIssues(node: any, issues: AnalysisIssue[], fileName: string): void {
    // Check for nested loops
    if (node.type === 'ForStatement' || node.type === 'WhileStatement') {
      const nestedLoops = this.findNestedLoops(node);
      if (nestedLoops > 2) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          title: 'Deeply nested loops',
          description: `Found ${nestedLoops} levels of nested loops which can impact performance`,
          file: fileName,
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 0,
          code: this.getNodeCode(node),
          suggestion: 'Consider refactoring to reduce nesting or use more efficient algorithms',
          impact: 'Performance degradation',
          category: 'performance'
        });
      }
    }
  }

  /**
   * Check for code quality issues
   */
  private checkQualityIssues(node: any, issues: AnalysisIssue[], fileName: string): void {
    // Check for console statements in production
    if (node.type === 'CallExpression' && 
        node.callee && 
        node.callee.object && 
        node.callee.object.name === 'console') {
      issues.push({
        type: 'quality',
        severity: 'low',
        title: 'Console statement in code',
        description: 'Console statements should be removed from production code',
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column || 0,
        code: this.getNodeCode(node),
        suggestion: 'Remove console statements or use a logging library',
        impact: 'Code quality issue',
        category: 'quality'
      });
    }
  }

  /**
   * Analyze basic CSS content
   */
  private analyzeBasicCSS(content: string, issues: AnalysisIssue[], fileName: string): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for hardcoded URLs
      if (line.includes('http://') && !line.includes('localhost')) {
        issues.push({
          type: 'security',
          severity: 'medium',
          title: 'Insecure HTTP URL',
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
   * Analyze basic HTML content
   */
  private analyzeBasicHTML(content: string, issues: AnalysisIssue[], fileName: string): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for missing alt attributes
      if (line.includes('<img') && !line.includes('alt=')) {
        issues.push({
          type: 'accessibility',
          severity: 'medium',
          title: 'Missing alt attribute',
          description: 'Images should have alt attributes for accessibility',
          file: fileName,
          line: index + 1,
          code: line,
          suggestion: 'Add descriptive alt attributes to all images',
          impact: 'Accessibility issue',
          category: 'accessibility'
        });
      }
    });
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
   * Count functions in AST
   */
  private countFunctions(ast: any): number {
    let count = 0;
    
    const countFunctionsRecursive = (node: any) => {
      if (!node) return;
      
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        count++;
      }
      
      if (node.body) {
        if (Array.isArray(node.body)) {
          node.body.forEach(countFunctionsRecursive);
        } else {
          countFunctionsRecursive(node.body);
        }
      }
    };
    
    countFunctionsRecursive(ast);
    return count;
  }

  /**
   * Count classes in AST
   */
  private countClasses(ast: any): number {
    let count = 0;
    
    const countClassesRecursive = (node: any) => {
      if (!node) return;
      
      if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
        count++;
      }
      
      if (node.body) {
        if (Array.isArray(node.body)) {
          node.body.forEach(countClassesRecursive);
        } else {
          countClassesRecursive(node.body);
        }
      }
    };
    
    countClassesRecursive(ast);
    return count;
  }

  /**
   * Calculate cyclomatic complexity
   */
  private calculateComplexity(ast: any): number {
    let complexity = 1; // Base complexity
    
    const calculateComplexityRecursive = (node: any) => {
      if (!node) return;
      
      // Add complexity for control flow statements
      if (node.type === 'IfStatement' || 
          node.type === 'SwitchCase' || 
          node.type === 'ForStatement' || 
          node.type === 'WhileStatement' || 
          node.type === 'DoWhileStatement' || 
          node.type === 'CatchClause') {
        complexity++;
      }
      
      if (node.body) {
        if (Array.isArray(node.body)) {
          node.body.forEach(calculateComplexityRecursive);
        } else {
          calculateComplexityRecursive(node.body);
        }
      }
    };
    
    calculateComplexityRecursive(ast);
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
  private calculateSummary(issues: AnalysisIssue[]): any {
    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highPriorityIssues: issues.filter(i => i.severity === 'high').length,
      mediumPriorityIssues: issues.filter(i => i.severity === 'medium').length,
      lowPriorityIssues: issues.filter(i => i.severity === 'low').length,
      securityIssues: issues.filter(i => i.category === 'security').length,
      qualityIssues: issues.filter(i => i.category === 'quality').length,
      performanceIssues: issues.filter(i => i.category === 'performance').length
    };
  }
} 