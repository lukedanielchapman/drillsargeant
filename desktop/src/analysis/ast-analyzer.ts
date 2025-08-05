import * as esprima from 'esprima';
import { Parser } from '@typescript-eslint/parser';
import * as cssTree from 'css-tree';
import * as htmlParser from 'htmlparser2';

export interface AnalysisIssue {
  type: 'security' | 'quality' | 'performance' | 'accessibility';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  column?: number;
  code?: string;
  suggestion?: string;
  category: string;
}

export interface ASTAnalysisResult {
  issues: AnalysisIssue[];
  metrics: {
    cyclomaticComplexity: number;
    linesOfCode: number;
    functionCount: number;
    classCount: number;
    importCount: number;
    commentRatio: number;
  };
  summary: {
    totalIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
    securityIssues: number;
    qualityIssues: number;
    performanceIssues: number;
  };
}

export class ASTAnalyzer {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  /**
   * Analyze JavaScript/TypeScript files using real AST parsing
   */
  async analyzeJavaScriptFile(filePath: string, content: string): Promise<ASTAnalysisResult> {
    const issues: AnalysisIssue[] = [];
    const metrics = {
      cyclomaticComplexity: 0,
      linesOfCode: content.split('\n').length,
      functionCount: 0,
      classCount: 0,
      importCount: 0,
      commentRatio: 0
    };

    try {
      // Parse JavaScript/TypeScript
      const ast = this.parseJavaScript(content, filePath);
      
      // Analyze AST for issues and metrics
      this.analyzeJavaScriptAST(ast, issues, metrics, filePath);
      
      // Calculate summary
      const summary = this.calculateSummary(issues);
      
      return { issues, metrics, summary };
    } catch (error) {
      console.warn(`Failed to analyze ${filePath}:`, error);
      return {
        issues: [{
          type: 'quality',
          severity: 'medium',
          title: 'Parse Error',
          description: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          file: filePath.split('/').pop() || filePath,
          line: 1,
          category: 'parsing'
        }],
        metrics,
        summary: { totalIssues: 1, highPriorityIssues: 0, mediumPriorityIssues: 1, lowPriorityIssues: 0, securityIssues: 0, qualityIssues: 1, performanceIssues: 0 }
      };
    }
  }

  /**
   * Analyze CSS files using css-tree
   */
  async analyzeCSSFile(filePath: string, content: string): Promise<ASTAnalysisResult> {
    const issues: AnalysisIssue[] = [];
    const metrics = {
      cyclomaticComplexity: 0,
      linesOfCode: content.split('\n').length,
      functionCount: 0,
      classCount: 0,
      importCount: 0,
      commentRatio: 0
    };

    try {
      const ast = cssTree.parse(content);
      this.analyzeCSSAST(ast, issues, filePath);
      
      const summary = this.calculateSummary(issues);
      return { issues, metrics, summary };
    } catch (error) {
      console.warn(`Failed to analyze CSS ${filePath}:`, error);
      return {
        issues: [{
          type: 'quality',
          severity: 'medium',
          title: 'CSS Parse Error',
          description: `Failed to parse CSS file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          file: filePath.split('/').pop() || filePath,
          line: 1,
          category: 'parsing'
        }],
        metrics,
        summary: { totalIssues: 1, highPriorityIssues: 0, mediumPriorityIssues: 1, lowPriorityIssues: 0, securityIssues: 0, qualityIssues: 1, performanceIssues: 0 }
      };
    }
  }

  /**
   * Analyze HTML files using htmlparser2
   */
  async analyzeHTMLFile(filePath: string, content: string): Promise<ASTAnalysisResult> {
    const issues: AnalysisIssue[] = [];
    const metrics = {
      cyclomaticComplexity: 0,
      linesOfCode: content.split('\n').length,
      functionCount: 0,
      classCount: 0,
      importCount: 0,
      commentRatio: 0
    };

    try {
      const ast = htmlParser.parse(content);
      this.analyzeHTMLAST(ast, issues, filePath);
      
      const summary = this.calculateSummary(issues);
      return { issues, metrics, summary };
    } catch (error) {
      console.warn(`Failed to analyze HTML ${filePath}:`, error);
      return {
        issues: [{
          type: 'quality',
          severity: 'medium',
          title: 'HTML Parse Error',
          description: `Failed to parse HTML file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          file: filePath.split('/').pop() || filePath,
          line: 1,
          category: 'parsing'
        }],
        metrics,
        summary: { totalIssues: 1, highPriorityIssues: 0, mediumPriorityIssues: 1, lowPriorityIssues: 0, securityIssues: 0, qualityIssues: 1, performanceIssues: 0 }
      };
    }
  }

  private parseJavaScript(content: string, filePath: string): any {
    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    
    if (isTypeScript) {
      // Use TypeScript parser
      return this.parser.parse(content, {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      });
    } else {
      // Use esprima for JavaScript
      return esprima.parse(content, {
        range: true,
        loc: true,
        comment: true,
        tokens: true
      });
    }
  }

  private analyzeJavaScriptAST(ast: any, issues: AnalysisIssue[], metrics: any, filePath: string): void {
    const fileName = filePath.split('/').pop() || filePath;
    
    // Traverse AST to collect metrics and detect issues
    this.traverseAST(ast, (node: any) => {
      // Count functions
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        metrics.functionCount++;
        this.analyzeFunction(node, issues, fileName);
      }
      
      // Count classes
      if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
        metrics.classCount++;
        this.analyzeClass(node, issues, fileName);
      }
      
      // Count imports
      if (node.type === 'ImportDeclaration') {
        metrics.importCount++;
      }
      
      // Security checks
      this.checkSecurityIssues(node, issues, fileName);
      
      // Performance checks
      this.checkPerformanceIssues(node, issues, fileName);
      
      // Quality checks
      this.checkQualityIssues(node, issues, fileName);
    });
    
    // Calculate cyclomatic complexity
    metrics.cyclomaticComplexity = this.calculateCyclomaticComplexity(ast);
  }

  private analyzeCSSAST(ast: any, issues: AnalysisIssue[], filePath: string): void {
    const fileName = filePath.split('/').pop() || filePath;
    
    cssTree.walk(ast, (node: any) => {
      // Check for performance issues
      if (node.type === 'Rule') {
        this.analyzeCSSRule(node, issues, fileName);
      }
      
      // Check for accessibility issues
      if (node.type === 'Declaration') {
        this.analyzeCSSDeclaration(node, issues, fileName);
      }
    });
  }

  private analyzeHTMLAST(ast: any, issues: AnalysisIssue[], filePath: string): void {
    const fileName = filePath.split('/').pop() || filePath;
    
    // Analyze HTML structure for accessibility and SEO
    this.analyzeHTMLStructure(ast, issues, fileName);
  }

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

  private analyzeFunction(node: any, issues: AnalysisIssue[], fileName: string): void {
    const complexity = this.calculateFunctionComplexity(node);
    
    if (complexity > 10) {
      issues.push({
        type: 'quality',
        severity: 'medium',
        title: 'High Function Complexity',
        description: `Function has cyclomatic complexity of ${complexity}. Consider breaking it into smaller functions.`,
        file: fileName,
        line: node.loc?.start?.line || 1,
        column: node.loc?.start?.column,
        category: 'complexity',
        suggestion: 'Break this function into smaller, more focused functions.'
      });
    }
    
    if (node.params && node.params.length > 4) {
      issues.push({
        type: 'quality',
        severity: 'low',
        title: 'Too Many Parameters',
        description: `Function has ${node.params.length} parameters. Consider using an object parameter.`,
        file: fileName,
        line: node.loc?.start?.line || 1,
        category: 'design',
        suggestion: 'Use an object parameter to group related parameters.'
      });
    }
  }

  private analyzeClass(node: any, issues: AnalysisIssue[], fileName: string): void {
    if (node.body && node.body.body) {
      const methodCount = node.body.body.filter((member: any) => 
        member.type === 'MethodDefinition' && member.kind === 'method'
      ).length;
      
      if (methodCount > 15) {
        issues.push({
          type: 'quality',
          severity: 'medium',
          title: 'Large Class',
          description: `Class has ${methodCount} methods. Consider splitting into smaller classes.`,
          file: fileName,
          line: node.loc?.start?.line || 1,
          category: 'design',
          suggestion: 'Split this class into smaller, more focused classes.'
        });
      }
    }
  }

  private checkSecurityIssues(node: any, issues: AnalysisIssue[], fileName: string): void {
    // Check for eval usage
    if (node.type === 'CallExpression' && 
        node.callee && 
        node.callee.name === 'eval') {
      issues.push({
        type: 'security',
        severity: 'high',
        title: 'Dangerous eval() Usage',
        description: 'eval() can execute arbitrary code and is a security risk.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        category: 'security',
        suggestion: 'Use JSON.parse() or other safer alternatives instead of eval().'
      });
    }
    
    // Check for innerHTML assignments
    if (node.type === 'AssignmentExpression' && 
        node.left && 
        node.left.property && 
        node.left.property.name === 'innerHTML') {
      issues.push({
        type: 'security',
        severity: 'high',
        title: 'innerHTML Assignment',
        description: 'innerHTML can lead to XSS attacks if used with untrusted data.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        category: 'security',
        suggestion: 'Use textContent or createElement() for safer DOM manipulation.'
      });
    }
    
    // Check for console.log in production code
    if (node.type === 'CallExpression' && 
        node.callee && 
        node.callee.object && 
        node.callee.object.name === 'console' && 
        node.callee.property && 
        node.callee.property.name === 'log') {
      issues.push({
        type: 'quality',
        severity: 'low',
        title: 'Console.log in Code',
        description: 'console.log statements should be removed from production code.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        category: 'quality',
        suggestion: 'Remove console.log statements or use a proper logging library.'
      });
    }
  }

  private checkPerformanceIssues(node: any, issues: AnalysisIssue[], fileName: string): void {
    // Check for inefficient loops
    if (node.type === 'ForInStatement') {
      issues.push({
        type: 'performance',
        severity: 'medium',
        title: 'Inefficient for...in Loop',
        description: 'for...in loops can be slower than for...of or Array methods.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        category: 'performance',
        suggestion: 'Consider using for...of, forEach(), or other Array methods.'
      });
    }
    
    // Check for nested loops
    if (node.type === 'ForStatement' || node.type === 'WhileStatement') {
      const nestedLoops = this.countNestedLoops(node);
      if (nestedLoops > 2) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          title: 'Deeply Nested Loops',
          description: `Found ${nestedLoops} levels of nested loops which can impact performance.`,
          file: fileName,
          line: node.loc?.start?.line || 1,
          category: 'performance',
          suggestion: 'Consider refactoring to reduce nesting or use more efficient algorithms.'
        });
      }
    }
  }

  private checkQualityIssues(node: any, issues: AnalysisIssue[], fileName: string): void {
    // Check for magic numbers
    if (node.type === 'Literal' && typeof node.value === 'number' && 
        node.value > 100 && !this.isInImportOrExport(node)) {
      issues.push({
        type: 'quality',
        severity: 'low',
        title: 'Magic Number',
        description: `Magic number ${node.value} should be extracted to a named constant.`,
        file: fileName,
        line: node.loc?.start?.line || 1,
        category: 'quality',
        suggestion: 'Extract magic numbers to named constants with descriptive names.'
      });
    }
    
    // Check for long lines
    if (node.loc && (node.loc.end.column - node.loc.start.column) > 120) {
      issues.push({
        type: 'quality',
        severity: 'low',
        title: 'Long Line',
        description: 'Line exceeds 120 characters. Consider breaking it into multiple lines.',
        file: fileName,
        line: node.loc.start.line,
        category: 'formatting',
        suggestion: 'Break long lines into multiple lines for better readability.'
      });
    }
  }

  private analyzeCSSRule(node: any, issues: AnalysisIssue[], fileName: string): void {
    // Check for inefficient selectors
    if (node.prelude) {
      const selector = cssTree.generate(node.prelude);
      if (selector.includes('*')) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          title: 'Universal Selector',
          description: 'Universal selector (*) can be inefficient in large documents.',
          file: fileName,
          line: node.loc?.start?.line || 1,
          category: 'performance',
          suggestion: 'Use more specific selectors instead of universal selector.'
        });
      }
      
      if (selector.split(',').length > 5) {
        issues.push({
          type: 'quality',
          severity: 'low',
          title: 'Complex Selector',
          description: 'Selector has many parts which can be hard to maintain.',
          file: fileName,
          line: node.loc?.start?.line || 1,
          category: 'quality',
          suggestion: 'Simplify complex selectors for better maintainability.'
        });
      }
    }
  }

  private analyzeCSSDeclaration(node: any, issues: AnalysisIssue[], fileName: string): void {
    // Check for accessibility issues
    if (node.property === 'color' && !this.hasContrastCheck(node)) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        title: 'Color Contrast',
        description: 'Color declaration without contrast check may cause accessibility issues.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        category: 'accessibility',
        suggestion: 'Ensure color combinations meet WCAG contrast requirements.'
      });
    }
    
    // Check for vendor prefixes
    if (node.property && node.property.startsWith('-webkit-') || 
        node.property?.startsWith('-moz-') || 
        node.property?.startsWith('-ms-')) {
      issues.push({
        type: 'quality',
        severity: 'low',
        title: 'Vendor Prefix',
        description: 'Vendor prefixes may not be necessary in modern browsers.',
        file: fileName,
        line: node.loc?.start?.line || 1,
        category: 'quality',
        suggestion: 'Consider using autoprefixer or check if vendor prefixes are still needed.'
      });
    }
  }

  private analyzeHTMLStructure(ast: any, issues: AnalysisIssue[], fileName: string): void {
    // Check for missing alt attributes
    if (ast.name === 'img' && !ast.attribs?.alt) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        title: 'Missing Alt Attribute',
        description: 'Image missing alt attribute for accessibility.',
        file: fileName,
        line: ast.loc?.start?.line || 1,
        category: 'accessibility',
        suggestion: 'Add descriptive alt attribute to all images.'
      });
    }
    
    // Check for semantic structure
    if (ast.name === 'div' && ast.children?.length > 10) {
      issues.push({
        type: 'quality',
        severity: 'low',
        title: 'Deep Nesting',
        description: 'Deeply nested div structure may indicate poor semantic markup.',
        file: fileName,
        line: ast.loc?.start?.line || 1,
        category: 'quality',
        suggestion: 'Consider using semantic HTML elements instead of nested divs.'
      });
    }
  }

  private calculateCyclomaticComplexity(ast: any): number {
    let complexity = 1; // Base complexity
    
    this.traverseAST(ast, (node: any) => {
      // Increment complexity for decision points
      if (node.type === 'IfStatement' || 
          node.type === 'SwitchCase' || 
          node.type === 'CatchClause' || 
          node.type === 'ForStatement' || 
          node.type === 'WhileStatement' || 
          node.type === 'DoWhileStatement' || 
          node.type === 'ForInStatement' || 
          node.type === 'ForOfStatement' || 
          node.type === 'ConditionalExpression' || 
          node.type === 'LogicalExpression') {
        complexity++;
      }
    });
    
    return complexity;
  }

  private calculateFunctionComplexity(node: any): number {
    let complexity = 1;
    
    this.traverseAST(node, (child: any) => {
      if (child.type === 'IfStatement' || 
          child.type === 'SwitchCase' || 
          child.type === 'CatchClause' || 
          child.type === 'ForStatement' || 
          child.type === 'WhileStatement' || 
          child.type === 'DoWhileStatement' || 
          child.type === 'ForInStatement' || 
          child.type === 'ForOfStatement' || 
          child.type === 'ConditionalExpression' || 
          child.type === 'LogicalExpression') {
        complexity++;
      }
    });
    
    return complexity;
  }

  private countNestedLoops(node: any): number {
    let count = 0;
    
    this.traverseAST(node, (child: any) => {
      if (child.type === 'ForStatement' || 
          child.type === 'WhileStatement' || 
          child.type === 'DoWhileStatement' || 
          child.type === 'ForInStatement' || 
          child.type === 'ForOfStatement') {
        count++;
      }
    });
    
    return count;
  }

  private isInImportOrExport(node: any): boolean {
    let current = node;
    while (current.parent) {
      if (current.parent.type === 'ImportDeclaration' || 
          current.parent.type === 'ExportNamedDeclaration' || 
          current.parent.type === 'ExportDefaultDeclaration') {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  private hasContrastCheck(node: any): boolean {
    // Simple check for contrast-related properties
    return node.value?.includes('contrast') || 
           node.value?.includes('rgb') || 
           node.value?.includes('hsl');
  }

  private calculateSummary(issues: AnalysisIssue[]): any {
    return {
      totalIssues: issues.length,
      highPriorityIssues: issues.filter(i => i.severity === 'high').length,
      mediumPriorityIssues: issues.filter(i => i.severity === 'medium').length,
      lowPriorityIssues: issues.filter(i => i.severity === 'low').length,
      securityIssues: issues.filter(i => i.type === 'security').length,
      qualityIssues: issues.filter(i => i.type === 'quality').length,
      performanceIssues: issues.filter(i => i.type === 'performance').length
    };
  }
} 