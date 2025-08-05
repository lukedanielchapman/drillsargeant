import { EnhancedAnalysisIssue, EnhancedAnalysisResult } from './enhanced-analyzer';
import * as path from 'path';

export interface ReportOptions {
  format: 'pdf' | 'html' | 'json' | 'excel';
  includeCodeSnippets: boolean;
  includeFixSuggestions: boolean;
  includeMetrics: boolean;
  includeRecommendations: boolean;
  severityFilter: 'all' | 'critical' | 'high' | 'medium' | 'low';
  typeFilter: 'all' | 'security' | 'quality' | 'performance' | 'accessibility' | 'best-practice' | 'memory-leak' | 'duplication';
}

export interface DetailedReport {
  summary: {
    totalFiles: number;
    totalIssues: number;
    criticalIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
    overallScore: number;
    securityScore: number;
    performanceScore: number;
    qualityScore: number;
  };
  issues: DetailedIssue[];
  recommendations: Recommendation[];
  metrics: {
    totalLinesOfCode: number;
    averageComplexity: number;
    totalFunctions: number;
    totalClasses: number;
    commentRatio: number;
    duplicationPercentage: number;
  };
  files: FileSummary[];
}

export interface DetailedIssue {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  file: string;
  line: number;
  column?: number;
  codeSnippet: string;
  suggestion: string;
  fixExample?: string;
  impact: string;
  cweId?: string;
  owaspCategory?: string;
  category: string;
  filePath: string; // Full path for navigation
  relativePath: string; // Relative path for display
}

export interface Recommendation {
  priority: 'immediate' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedEffort: number;
  impact: string;
  files: string[];
  issues: string[]; // Issue IDs
}

export interface FileSummary {
  path: string;
  relativePath: string;
  issues: number;
  criticalIssues: number;
  highPriorityIssues: number;
  mediumPriorityIssues: number;
  lowPriorityIssues: number;
  securityIssues: number;
  qualityIssues: number;
  performanceIssues: number;
  score: number;
}

export class ReportGenerator {
  private options: ReportOptions;

  constructor(options: Partial<ReportOptions> = {}) {
    this.options = {
      format: 'html',
      includeCodeSnippets: true,
      includeFixSuggestions: true,
      includeMetrics: true,
      includeRecommendations: true,
      severityFilter: 'all',
      typeFilter: 'all',
      ...options
    };
  }

  /**
   * Generate comprehensive report from analysis results
   */
  async generateReport(
    results: EnhancedAnalysisResult[],
    projectPath: string,
    options?: Partial<ReportOptions>
  ): Promise<DetailedReport> {
    if (options) {
      this.options = { ...this.options, ...options };
    }

    const allIssues = this.collectAllIssues(results);
    const filteredIssues = this.filterIssues(allIssues);
    const detailedIssues = this.createDetailedIssues(filteredIssues, projectPath);
    const fileSummaries = this.createFileSummaries(results, projectPath);
    const recommendations = this.createRecommendations(detailedIssues);
    const summary = this.createSummary(results, detailedIssues);
    const metrics = this.calculateMetrics(results);

    return {
      summary,
      issues: detailedIssues,
      recommendations,
      metrics,
      files: fileSummaries
    };
  }

  /**
   * Generate detailed HTML report
   */
  async generateDetailedReport(results: EnhancedAnalysisResult[], projectPath: string): Promise<string> {
    const report = await this.generateReport(results, projectPath);
    const html = this.generateHTMLReport(report);
    return html;
  }

  /**
   * Generate PDF report
   */
  async generatePDFReport(results: EnhancedAnalysisResult[], projectPath: string): Promise<string> {
    // For now, return HTML that can be converted to PDF
    const report = await this.generateReport(results, projectPath);
    const html = this.generateHTMLReport(report);
    return html;
  }

  /**
   * Generate Excel report
   */
  async generateExcelReport(results: EnhancedAnalysisResult[], projectPath: string): Promise<string> {
    // For now, return CSV format
    const report = await this.generateReport(results, projectPath);
    const csv = this.generateCSVReport(report);
    return csv;
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(report: DetailedReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DrillSargeant Code Analysis Report</title>
    <style>
        ${this.getHTMLStyles()}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔍 DrillSargeant Code Analysis Report</h1>
            <p class="timestamp">Generated on ${new Date().toLocaleString()}</p>
        </header>

        <section class="summary">
            <h2>📊 Executive Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Overall Score</h3>
                    <div class="score ${this.getScoreClass(report.summary.overallScore)}">
                        ${report.summary.overallScore}/100
                    </div>
                </div>
                <div class="summary-card">
                    <h3>Security Score</h3>
                    <div class="score ${this.getScoreClass(report.summary.securityScore)}">
                        ${report.summary.securityScore}/100
                    </div>
                </div>
                <div class="summary-card">
                    <h3>Performance Score</h3>
                    <div class="score ${this.getScoreClass(report.summary.performanceScore)}">
                        ${report.summary.performanceScore}/100
                    </div>
                </div>
                <div class="summary-card">
                    <h3>Quality Score</h3>
                    <div class="score ${this.getScoreClass(report.summary.qualityScore)}">
                        ${report.summary.qualityScore}/100
                    </div>
                </div>
            </div>

            <div class="issue-breakdown">
                <h3>Issue Breakdown</h3>
                <div class="breakdown-grid">
                    <div class="breakdown-item critical">
                        <span class="count">${report.summary.criticalIssues}</span>
                        <span class="label">Critical</span>
                    </div>
                    <div class="breakdown-item high">
                        <span class="count">${report.summary.highPriorityIssues}</span>
                        <span class="label">High</span>
                    </div>
                    <div class="breakdown-item medium">
                        <span class="count">${report.summary.mediumPriorityIssues}</span>
                        <span class="label">Medium</span>
                    </div>
                    <div class="breakdown-item low">
                        <span class="count">${report.summary.lowPriorityIssues}</span>
                        <span class="label">Low</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="recommendations">
            <h2>🎯 Priority Recommendations</h2>
            ${this.generateRecommendationsHTML(report.recommendations)}
        </section>

        <section class="issues">
            <h2>🚨 Detailed Issues</h2>
            <div class="filters">
                <select id="severity-filter" onchange="filterIssues()">
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select id="type-filter" onchange="filterIssues()">
                    <option value="all">All Types</option>
                    <option value="security">Security</option>
                    <option value="quality">Quality</option>
                    <option value="performance">Performance</option>
                    <option value="best-practice">Best Practice</option>
                    <option value="memory-leak">Memory Leak</option>
                </select>
            </div>
            ${this.generateIssuesHTML(report.issues)}
        </section>

        <section class="files">
            <h2>📁 File Analysis</h2>
            ${this.generateFilesHTML(report.files)}
        </section>

        <section class="metrics">
            <h2>📈 Code Metrics</h2>
            ${this.generateMetricsHTML(report.metrics)}
        </section>
    </div>

    <script>
        ${this.getJavaScriptFunctions()}
    </script>
</body>
</html>`;
  }

  private generateCSVReport(report: DetailedReport): string {
    const lines: string[] = [];
    
    // Summary section
    lines.push('Summary');
    lines.push('Overall Score,' + report.summary.overallScore);
    lines.push('Total Issues,' + report.summary.totalIssues);
    lines.push('Critical Issues,' + report.summary.criticalIssues);
    lines.push('High Priority Issues,' + report.summary.highPriorityIssues);
    lines.push('Medium Priority Issues,' + report.summary.mediumPriorityIssues);
    lines.push('Low Priority Issues,' + report.summary.lowPriorityIssues);
    lines.push('');
    
    // Issues section
    lines.push('Issues');
    lines.push('Severity,Type,File,Line,Description,Impact');
    report.issues.forEach(issue => {
      lines.push(`${issue.severity},${issue.type},${issue.relativePath},${issue.line},"${issue.title}","${issue.impact || 'N/A'}"`);
    });
    lines.push('');
    
    // Metrics section
    lines.push('Metrics');
    lines.push('Total Lines of Code,' + report.metrics.totalLinesOfCode);
    lines.push('Average Complexity,' + report.metrics.averageComplexity.toFixed(2));
    lines.push('Total Functions,' + report.metrics.totalFunctions);
    lines.push('Total Classes,' + report.metrics.totalClasses);
    lines.push('Comment Ratio,' + report.metrics.commentRatio.toFixed(2) + '%');
    lines.push('Duplication Percentage,' + report.metrics.duplicationPercentage.toFixed(2) + '%');
    lines.push('');
    
    // Recommendations section
    if (report.recommendations.length > 0) {
      lines.push('Recommendations');
      lines.push('Priority,Title,Description,Estimated Effort,Impact');
      report.recommendations.forEach(rec => {
        lines.push(`${rec.priority},"${rec.title}","${rec.description}",${rec.estimatedEffort} hours,${rec.impact}`);
      });
    }
    
    // File summary section
    lines.push('');
    lines.push('File Summary');
    lines.push('File,Issues,Critical,High,Medium,Low');
    const fileSummary = this.generateFileSummary(report.issues);
    fileSummary.forEach(file => {
      lines.push(`${file.file},${file.totalIssues},${file.criticalIssues},${file.highPriorityIssues},${file.mediumPriorityIssues},${file.lowPriorityIssues}`);
    });
    
    return lines.join('\n');
  }

  private generateFileSummary(issues: DetailedIssue[]): any[] {
    const fileMap = new Map<string, any>();
    
    issues.forEach(issue => {
      if (!fileMap.has(issue.relativePath)) {
        fileMap.set(issue.relativePath, {
          file: issue.relativePath,
          totalIssues: 0,
          criticalIssues: 0,
          highPriorityIssues: 0,
          mediumPriorityIssues: 0,
          lowPriorityIssues: 0
        });
      }
      
      const fileStats = fileMap.get(issue.relativePath);
      fileStats.totalIssues++;
      
      switch (issue.severity) {
        case 'critical':
          fileStats.criticalIssues++;
          break;
        case 'high':
          fileStats.highPriorityIssues++;
          break;
        case 'medium':
          fileStats.mediumPriorityIssues++;
          break;
        case 'low':
          fileStats.lowPriorityIssues++;
          break;
      }
    });
    
    return Array.from(fileMap.values());
  }

  private collectAllIssues(results: EnhancedAnalysisResult[]): EnhancedAnalysisIssue[] {
    const allIssues: EnhancedAnalysisIssue[] = [];
    
    results.forEach(result => {
      if (result.issues) {
        allIssues.push(...result.issues);
      }
    });
    
    return allIssues;
  }

  private filterIssues(issues: EnhancedAnalysisIssue[]): EnhancedAnalysisIssue[] {
    return issues.filter(issue => {
      const severityMatch = this.options.severityFilter === 'all' || 
                           issue.severity === this.options.severityFilter;
      const typeMatch = this.options.typeFilter === 'all' || 
                       issue.type === this.options.typeFilter;
      
      return severityMatch && typeMatch;
    });
  }

  private createDetailedIssues(issues: EnhancedAnalysisIssue[], projectPath: string): DetailedIssue[] {
    return issues.map((issue, index) => ({
      id: `issue-${index}`,
      type: issue.type,
      severity: issue.severity,
      title: issue.title,
      description: issue.description,
      file: issue.file,
      filePath: path.resolve(projectPath, issue.file), // Full path for navigation
      line: issue.line,
      column: issue.column,
      codeSnippet: issue.code || '',
      suggestion: issue.suggestion || '',
      fixExample: issue.fixExample || '',
      impact: issue.impact || 'Unknown', // Ensure impact is always a string
      cweId: issue.cweId || '',
      owaspCategory: issue.owaspCategory || '',
      category: issue.category,
      relativePath: issue.file // Relative path for display
    }));
  }

  private createFileSummaries(results: EnhancedAnalysisResult[], projectPath: string): FileSummary[] {
    const fileMap = new Map<string, FileSummary>();
    
    results.forEach(result => {
      // This would need to be enhanced to track which file each issue belongs to
      const fileName = 'example.js'; // This should come from the actual file analysis
      
      if (!fileMap.has(fileName)) {
        fileMap.set(fileName, {
          path: path.join(projectPath, fileName),
          relativePath: fileName,
          issues: 0,
          criticalIssues: 0,
          highPriorityIssues: 0,
          mediumPriorityIssues: 0,
          lowPriorityIssues: 0,
          securityIssues: 0,
          qualityIssues: 0,
          performanceIssues: 0,
          score: 100
        });
      }
      
      const summary = fileMap.get(fileName)!;
      summary.issues += result.summary.totalIssues;
      summary.criticalIssues += result.summary.criticalIssues || 0;
      summary.highPriorityIssues += result.summary.highPriorityIssues;
      summary.mediumPriorityIssues += result.summary.mediumPriorityIssues;
      summary.lowPriorityIssues += result.summary.lowPriorityIssues;
      summary.securityIssues += result.summary.securityIssues;
      summary.qualityIssues += result.summary.qualityIssues;
      summary.performanceIssues += result.summary.performanceIssues;
      
      // Calculate score
      summary.score = Math.max(0, 100 - 
        (summary.criticalIssues * 30) - 
        (summary.highPriorityIssues * 15) - 
        (summary.mediumPriorityIssues * 5) - 
        (summary.lowPriorityIssues * 2)
      );
    });
    
    return Array.from(fileMap.values());
  }

  private createRecommendations(issues: DetailedIssue[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Group issues by type
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
        files: [...new Set(securityIssues.map(i => i.relativePath))],
        issues: securityIssues.map(i => i.id)
      });
    }
    
    if (performanceIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Optimize Performance Issues',
        description: `Found ${performanceIssues.length} performance issues that could impact user experience.`,
        estimatedEffort: performanceIssues.length * 1.5,
        impact: 'high',
        files: [...new Set(performanceIssues.map(i => i.relativePath))],
        issues: performanceIssues.map(i => i.id)
      });
    }
    
    if (qualityIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Improve Code Quality',
        description: `Found ${qualityIssues.length} code quality issues that affect maintainability.`,
        estimatedEffort: qualityIssues.length * 1,
        impact: 'medium',
        files: [...new Set(qualityIssues.map(i => i.relativePath))],
        issues: qualityIssues.map(i => i.id)
      });
    }
    
    return recommendations;
  }

  private createSummary(results: EnhancedAnalysisResult[], issues: DetailedIssue[]): any {
    const totalIssues = issues.length;
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highPriorityIssues = issues.filter(i => i.severity === 'high').length;
    const mediumPriorityIssues = issues.filter(i => i.severity === 'medium').length;
    const lowPriorityIssues = issues.filter(i => i.severity === 'low').length;
    
    // Calculate overall score
    const overallScore = Math.max(0, 100 - 
      (criticalIssues * 30) - 
      (highPriorityIssues * 15) - 
      (mediumPriorityIssues * 5) - 
      (lowPriorityIssues * 2)
    );
    
    // Calculate component scores
    const securityIssues = issues.filter(i => i.type === 'security');
    const performanceIssues = issues.filter(i => i.type === 'performance');
    const qualityIssues = issues.filter(i => i.type === 'quality');
    
    const securityScore = Math.max(0, 100 - 
      (securityIssues.filter(i => i.severity === 'critical').length * 30) -
      (securityIssues.filter(i => i.severity === 'high').length * 15) -
      (securityIssues.filter(i => i.severity === 'medium').length * 5)
    );
    
    const performanceScore = Math.max(0, 100 - 
      (performanceIssues.filter(i => i.severity === 'critical').length * 25) -
      (performanceIssues.filter(i => i.severity === 'high').length * 10) -
      (performanceIssues.filter(i => i.severity === 'medium').length * 5)
    );
    
    const qualityScore = Math.max(0, 100 - 
      (qualityIssues.filter(i => i.severity === 'critical').length * 20) -
      (qualityIssues.filter(i => i.severity === 'high').length * 10) -
      (qualityIssues.filter(i => i.severity === 'medium').length * 5)
    );
    
    return {
      totalFiles: results.length,
      totalIssues,
      criticalIssues,
      highPriorityIssues,
      mediumPriorityIssues,
      lowPriorityIssues,
      overallScore,
      securityScore,
      performanceScore,
      qualityScore
    };
  }

  private calculateMetrics(results: EnhancedAnalysisResult[]): any {
    const totalFiles = results.length;
    const totalLines = results.reduce((sum, r) => sum + (r.metrics?.totalLines || 0), 0);
    const totalComplexity = results.reduce((sum, r) => sum + (r.metrics?.averageComplexity || 0), 0);
    const totalFunctions = results.reduce((sum, r) => sum + (r.metrics?.totalFunctions || 0), 0);
    const totalClasses = results.reduce((sum, r) => sum + (r.metrics?.totalClasses || 0), 0);
    
    return {
      totalLinesOfCode: totalLines,
      averageComplexity: totalFiles > 0 ? totalComplexity / totalFiles : 0,
      totalFunctions,
      totalClasses,
      commentRatio: 0, // Not available in EnhancedAnalysisResult metrics
      duplicationPercentage: 0 // Would need to calculate from content
    };
  }

  private getHTMLStyles(): string {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
      header { text-align: center; margin-bottom: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
      h1 { color: #2c3e50; margin-bottom: 10px; }
      .timestamp { color: #666; font-size: 14px; }
      section { margin-bottom: 40px; }
      h2 { color: #2c3e50; margin-bottom: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
      .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
      .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
      .score { font-size: 2em; font-weight: bold; margin-top: 10px; }
      .score.excellent { color: #27ae60; }
      .score.good { color: #f39c12; }
      .score.poor { color: #e74c3c; }
      .breakdown-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
      .breakdown-item { text-align: center; padding: 15px; border-radius: 6px; color: white; }
      .breakdown-item.critical { background: #e74c3c; }
      .breakdown-item.high { background: #f39c12; }
      .breakdown-item.medium { background: #f1c40f; }
      .breakdown-item.low { background: #27ae60; }
      .count { display: block; font-size: 1.5em; font-weight: bold; }
      .label { font-size: 0.9em; }
      .filters { margin-bottom: 20px; }
      .filters select { padding: 8px; margin-right: 10px; border: 1px solid #ddd; border-radius: 4px; }
      .issue { background: white; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
      .issue-header { padding: 15px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; }
      .issue-title { font-weight: bold; margin-bottom: 5px; }
      .issue-meta { font-size: 0.9em; color: #666; }
      .issue-body { padding: 15px; }
      .issue-description { margin-bottom: 15px; }
      .code-snippet { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.9em; margin: 10px 0; }
      .suggestion { background: #e8f5e8; padding: 10px; border-radius: 4px; border-left: 4px solid #27ae60; }
      .file-link { color: #3498db; text-decoration: none; }
      .file-link:hover { text-decoration: underline; }
      .severity-critical { border-left: 4px solid #e74c3c; }
      .severity-high { border-left: 4px solid #f39c12; }
      .severity-medium { border-left: 4px solid #f1c40f; }
      .severity-low { border-left: 4px solid #27ae60; }
    `;
  }

  private getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
  }

  private generateRecommendationsHTML(recommendations: Recommendation[]): string {
    return recommendations.map(rec => `
      <div class="recommendation ${rec.priority}">
        <h3>${rec.title}</h3>
        <p>${rec.description}</p>
        <div class="rec-meta">
          <span class="priority">Priority: ${rec.priority}</span>
          <span class="effort">Estimated Effort: ${rec.estimatedEffort} hours</span>
          <span class="impact">Impact: ${rec.impact}</span>
        </div>
        <div class="rec-files">
          <strong>Files:</strong> ${rec.files.join(', ')}
        </div>
      </div>
    `).join('');
  }

  private generateIssuesHTML(issues: DetailedIssue[]): string {
    return issues.map(issue => `
      <div class="issue severity-${issue.severity}" data-severity="${issue.severity}" data-type="${issue.type}">
        <div class="issue-header">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-meta">
            <span class="severity ${issue.severity}">${issue.severity.toUpperCase()}</span> |
            <span class="type">${issue.type}</span> |
            <a href="file://${issue.filePath}#${issue.line}" class="file-link" target="_blank">
              ${issue.relativePath}:${issue.line}
            </a>
            ${issue.cweId ? `| CWE: ${issue.cweId}` : ''}
            ${issue.owaspCategory ? `| OWASP: ${issue.owaspCategory}` : ''}
          </div>
        </div>
        <div class="issue-body">
          <div class="issue-description">${issue.description}</div>
          ${issue.codeSnippet ? `<div class="code-snippet">${issue.codeSnippet}</div>` : ''}
          ${issue.suggestion ? `<div class="suggestion"><strong>Suggestion:</strong> ${issue.suggestion}</div>` : ''}
          ${issue.fixExample ? `<div class="code-snippet"><strong>Fix Example:</strong><br>${issue.fixExample}</div>` : ''}
          <div class="impact"><strong>Impact:</strong> ${issue.impact}</div>
        </div>
      </div>
    `).join('');
  }

  private generateFilesHTML(files: FileSummary[]): string {
    return `
      <div class="files-grid">
        ${files.map(file => `
          <div class="file-card">
            <h4>${file.relativePath}</h4>
            <div class="file-score ${this.getScoreClass(file.score)}">${file.score}/100</div>
            <div class="file-issues">
              <span class="critical">${file.criticalIssues}</span> Critical,
              <span class="high">${file.highPriorityIssues}</span> High,
              <span class="medium">${file.mediumPriorityIssues}</span> Medium,
              <span class="low">${file.lowPriorityIssues}</span> Low
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private generateMetricsHTML(metrics: any): string {
    return `
      <div class="metrics-grid">
        <div class="metric">
          <label>Total Lines of Code</label>
          <value>${metrics.totalLinesOfCode.toLocaleString()}</value>
        </div>
        <div class="metric">
          <label>Average Cyclomatic Complexity</label>
          <value>${metrics.averageComplexity.toFixed(2)}</value>
        </div>
        <div class="metric">
          <label>Total Functions</label>
          <value>${metrics.totalFunctions}</value>
        </div>
        <div class="metric">
          <label>Total Classes</label>
          <value>${metrics.totalClasses}</value>
        </div>
        <div class="metric">
          <label>Comment Ratio</label>
          <value>${metrics.commentRatio.toFixed(1)}%</value>
        </div>
        <div class="metric">
          <label>Code Duplication</label>
          <value>${metrics.duplicationPercentage.toFixed(1)}%</value>
        </div>
      </div>
    `;
  }

  private getJavaScriptFunctions(): string {
    return `
      function filterIssues() {
        const severityFilter = document.getElementById('severity-filter').value;
        const typeFilter = document.getElementById('type-filter').value;
        const issues = document.querySelectorAll('.issue');
        
        issues.forEach(issue => {
          const severity = issue.dataset.severity;
          const type = issue.dataset.type;
          
          const severityMatch = severityFilter === 'all' || severity === severityFilter;
          const typeMatch = typeFilter === 'all' || type === typeFilter;
          
          if (severityMatch && typeMatch) {
            issue.style.display = 'block';
          } else {
            issue.style.display = 'none';
          }
        });
      }
      
      function openFile(filePath, line) {
        // This would integrate with the desktop app to open files
        console.log('Opening file:', filePath, 'at line:', line);
      }
    `;
  }
} 