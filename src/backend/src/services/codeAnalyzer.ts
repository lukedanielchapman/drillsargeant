import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
// Real analysis dependencies - AST parsing and semantic analysis
import * as esprima from 'esprima';
import * as cssTree from 'css-tree';
import * as htmlparser2 from 'htmlparser2';
import * as acorn from 'acorn';
import * as acornWalk from 'acorn-walk';
import * as semver from 'semver';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

// Import additional security and analysis libraries
const crypto = require('crypto');

const execAsync = promisify(exec);

export interface CodeIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'security' | 'performance' | 'quality' | 'documentation' | 'accessibility';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  filePath: string;
  lineNumber: number;
  endLine?: number;
  column?: number;
  endColumn?: number;
  codeSnippet: string;
  impact: string;
  recommendation: string;
  resolutionSteps: ResolutionStep[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ResolutionStep {
  step: number;
  title: string;
  description: string;
  codeExample?: string;
  language?: string;
}

export interface AnalysisConfig {
  securityScan?: boolean;
  performanceAnalysis?: boolean;
  qualityCheck?: boolean;
  documentationCheck?: boolean;
  dependencyAnalysis?: boolean;
  accessibilityCheck?: boolean;
  seoAnalysis?: boolean;
  complexityAnalysis?: boolean;
}

export interface AnalysisResult {
  issues: CodeIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    securityIssues: number;
    performanceIssues: number;
    qualityIssues: number;
    documentationIssues: number;
  };
  filesAnalyzed: number;
  linesOfCode: number;
  analysisTime: number;
}

export interface LoginCredentials {
  username?: string;
  password?: string;
  loginUrl?: string;
  usernameSelector?: string;
  passwordSelector?: string;
  submitSelector?: string;
  waitForSelector?: string;
}

export class CodeAnalyzer {
  private supportedLanguages = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', 
    '.html', '.css', '.json', '.xml', '.md', '.txt'
  ];

  async analyzeGitRepository(repoUrl: string, analysisConfig: any, progressTracker?: any): Promise<AnalysisResult> {
    const startTime = Date.now();
    console.log(`Enhanced Git repository analysis requested for: ${repoUrl}`);
    const issues: CodeIssue[] = [];
    
    try {
      if (progressTracker) await progressTracker.updateProgress(10, 'starting', 'Initializing Git repository analysis...');
      
      // ENHANCED GIT ANALYSIS - Work within Firebase Functions constraints
      // Step 1: Extract repository information from URL
      const repoInfo = this.parseRepositoryUrl(repoUrl);
      if (progressTracker) await progressTracker.updateProgress(20, 'parsing', 'Analyzing repository metadata...');
      
      // Step 2: Analyze repository structure and security via API (if GitHub/GitLab)
      if (repoInfo.platform === 'github' || repoInfo.platform === 'gitlab') {
        issues.push(...await this.analyzeRepositoryViaAPI(repoInfo, repoUrl));
      }
      
      if (progressTracker) await progressTracker.updateProgress(40, 'api-analysis', 'Fetching key repository files...');
      
      // Step 3: Fetch and analyze key configuration files via raw API
      issues.push(...await this.analyzeRepositoryConfigFiles(repoInfo, repoUrl));
      
      if (progressTracker) await progressTracker.updateProgress(60, 'config-analysis', 'Analyzing security and dependencies...');
      
      // Step 4: Repository security and best practices analysis
      issues.push(...this.analyzeRepositoryBestPractices(repoInfo, repoUrl));
      
      if (progressTracker) await progressTracker.updateProgress(80, 'finalizing', 'Generating analysis report...');
      
      // If we couldn't get much data, add helpful guidance
      if (issues.length === 0) {
        issues.push({
          id: `git_guidance_${Date.now()}`,
          title: 'Repository Analysis Complete',
          description: 'Repository analysis completed via API. For comprehensive source code analysis, upload files directly.',
          severity: 'low',
          type: 'documentation',
          status: 'open',
          filePath: repoUrl,
          lineNumber: 1,
          codeSnippet: `Repository: ${repoUrl}`,
          impact: 'API-based analysis provides repository-level insights. File upload enables AST-based code analysis.',
          recommendation: 'Upload source files for detailed analysis including security, performance, and code quality checks',
          resolutionSteps: [
            {
              step: 1,
              title: 'Enhanced Analysis with File Upload',
              description: 'Download repository and upload files for comprehensive AST-based analysis'
            },
            {
              step: 2,
              title: 'Web Analysis for Deployed Apps',
              description: 'If deployed, use web URL analysis for runtime security and performance analysis'
            }
          ],
          tags: ['guidance', 'repository', 'enhancement'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      if (progressTracker) await progressTracker.updateProgress(100, 'completed', `Analysis completed: ${issues.length} findings`);
      
      const analysisTime = Date.now() - startTime;
      console.log(`Enhanced Git analysis completed in ${analysisTime}ms: ${issues.length} issues found`);
      
      return {
        issues,
        summary: this.generateSummary(issues),
        filesAnalyzed: 0,
        linesOfCode: 0,
        analysisTime
      };
      
    } catch (error: any) {
      console.error('Git analysis error:', error);
      
      // Add error as an issue rather than throwing
      issues.push({
        id: `git_error_${Date.now()}`,
        title: 'Git Repository Analysis Error',
        description: `Failed to analyze repository: ${error.message}`,
        severity: 'high',
        type: 'quality',
        status: 'open',
        filePath: repoUrl,
        lineNumber: 1,
        codeSnippet: `Error: ${error.message}`,
        impact: 'Unable to complete repository analysis',
        recommendation: 'Verify repository URL and accessibility, or use file upload for analysis',
        resolutionSteps: [
          {
            step: 1,
            title: 'Check Repository Access',
            description: 'Ensure repository is public or accessible'
          }
        ],
        tags: ['error', 'repository'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const analysisTime = Date.now() - startTime;
      return {
        issues,
        summary: this.generateSummary(issues),
        filesAnalyzed: 0,
        linesOfCode: 0,
        analysisTime
      };
    }
  }

  async analyzeWebUrl(webUrl: string, analysisConfig: any, loginCredentials?: LoginCredentials, progressTracker?: any): Promise<AnalysisResult> {
    const startTime = Date.now();
    console.log(`Starting REAL web URL analysis for: ${webUrl}`);
    
    try {
      // Fetch the actual webpage
      let html: string;
      const headers = {
        'User-Agent': 'DrillSargeant-Bot/1.0 (Code Analysis Tool)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      };

      if (progressTracker) await progressTracker.updateProgress(20, 'fetching', `Fetching ${webUrl}...`);

      if (loginCredentials && loginCredentials.loginUrl) {
        // Handle authenticated requests
        html = await this.fetchAuthenticatedPage(webUrl, loginCredentials, headers);
      } else {
        html = await this.fetchUrl(webUrl, headers);
      }

      if (progressTracker) await progressTracker.updateProgress(30, 'analyzing', 'Analyzing fetched content...');

      const issues: CodeIssue[] = [];
      
      // Perform REAL analyses with progress tracking using regex-based parsing
      if (analysisConfig.securityScan) {
        if (progressTracker) await progressTracker.updateProgress(40, 'security', 'Running security analysis...');
        const securityIssues = await this.analyzeWebSecurity(html, webUrl);
        issues.push(...securityIssues);
        console.log(`Found ${securityIssues.length} security issues`);
      }
      
      if (analysisConfig.performanceAnalysis) {
        if (progressTracker) await progressTracker.updateProgress(55, 'performance', 'Analyzing performance...');
        const perfIssues = await this.analyzeWebPerformance(html, webUrl);
        issues.push(...perfIssues);
        console.log(`Found ${perfIssues.length} performance issues`);
      }
      
      if (analysisConfig.codeQuality) {
        if (progressTracker) await progressTracker.updateProgress(70, 'quality', 'Checking code quality...');
        const htmlIssues = this.analyzeHTMLStructure(html, webUrl);
        const jsIssues = this.analyzeJavaScript(html, webUrl);
        const cssIssues = this.analyzeCSS(html, webUrl);
        issues.push(...htmlIssues, ...jsIssues, ...cssIssues);
        console.log(`Found ${htmlIssues.length} HTML, ${jsIssues.length} JS, ${cssIssues.length} CSS issues`);
      }
      
      if (analysisConfig.accessibilityCheck) {
        if (progressTracker) await progressTracker.updateProgress(80, 'accessibility', 'Testing accessibility...');
        const a11yIssues = await this.analyzeAccessibility(html, webUrl);
        issues.push(...a11yIssues);
        console.log(`Found ${a11yIssues.length} accessibility issues`);
      }
      
      if (analysisConfig.seoAnalysis) {
        if (progressTracker) await progressTracker.updateProgress(90, 'seo', 'Analyzing SEO...');
        const seoIssues = await this.analyzeSEO(html, webUrl);
        issues.push(...seoIssues);
        console.log(`Found ${seoIssues.length} SEO issues`);
      }

      const analysisTime = Date.now() - startTime;
      const linesOfCode = html.split('\n').length;
      
      console.log(`REAL web analysis completed in ${analysisTime}ms for ${webUrl}`);
      console.log(`- Analyzed ${linesOfCode} lines of HTML`);
      console.log(`- Found ${issues.length} total issues`);
      console.log(`- Security: ${issues.filter(i => i.type === 'security').length}`);
      console.log(`- Performance: ${issues.filter(i => i.type === 'performance').length}`);
      console.log(`- Quality: ${issues.filter(i => i.type === 'quality').length}`);
      
      return {
        issues,
        summary: this.generateSummary(issues),
        filesAnalyzed: 1,
        linesOfCode,
        analysisTime
      };
      
    } catch (error: any) {
      console.error('REAL web analysis error for', webUrl, ':', error);
      
      // Instead of throwing, let's provide meaningful error details but still return a result
      const errorIssue: CodeIssue = {
        id: `web_error_${Date.now()}`,
        title: 'Web Analysis Error',
        description: `Failed to analyze ${webUrl}: ${error.message}`,
        severity: 'high',
        type: 'quality',
        status: 'open',
        filePath: webUrl,
        lineNumber: 1,
        codeSnippet: `Error: ${error.message}`,
        impact: 'Could not complete analysis of this web resource.',
        recommendation: 'Check if the URL is accessible and try again.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Verify URL',
            description: 'Ensure the URL is correct and accessible.',
            codeExample: `Check: ${webUrl}`
          }
        ],
        tags: ['error', 'analysis-failure'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return {
        issues: [errorIssue],
        summary: this.generateSummary([errorIssue]),
        filesAnalyzed: 0,
        linesOfCode: 0,
        analysisTime: Date.now() - startTime
      };
    }
  }

  async analyzeLocalCodebase(codebasePath: string, analysisConfig: any, progressTracker?: any): Promise<AnalysisResult> {
    const startTime = Date.now();
    console.log(`Local codebase analysis requested for: ${codebasePath}`);
    
    try {
      if (progressTracker) await progressTracker.updateProgress(30, 'limitation', 'Local analysis has architectural limitations...');
      
      // Create an informative issue explaining the limitation
      const limitationIssue: CodeIssue = {
        id: `local_limitation_${Date.now()}`,
        title: 'Local File Analysis Limitation',
        description: 'Firebase Functions cannot directly access local file systems for security reasons.',
        severity: 'medium',
        type: 'quality',
        status: 'open',
        filePath: codebasePath,
        lineNumber: 1,
        codeSnippet: `Requested analysis of: ${codebasePath}`,
        impact: 'Local file analysis requires file upload functionality.',
        recommendation: 'Upload files to Firebase Storage or use a web-deployed version for analysis.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Upload Files',
            description: 'Upload your files to Firebase Storage for analysis.',
            codeExample: 'Use the file upload feature (coming soon) or deploy your code.'
          },
          {
            step: 2,
            title: 'Deploy and Analyze',
            description: 'Deploy your code and use Web URL analysis.',
            codeExample: 'Deploy to Netlify, Vercel, or similar and analyze the live URL.'
          }
        ],
        tags: ['architecture', 'limitation', 'local-files'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (progressTracker) await progressTracker.updateProgress(85, 'completed', 'Analysis completed with limitations...');
      
      const analysisTime = Date.now() - startTime;
      console.log(`Local analysis completed with limitation notice in ${analysisTime}ms.`);
      
      return {
        issues: [limitationIssue],
        summary: this.generateSummary([limitationIssue]),
        filesAnalyzed: 0,
        linesOfCode: 0,
        analysisTime
      };
      
    } catch (error: any) {
      console.error('Local analysis error:', error);
      throw new Error(`Local analysis failed: ${error.message}`);
    }
  }

  private generateSummary(issues: CodeIssue[]): any {
    const summary = {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highIssues: issues.filter(i => i.severity === 'high').length,
      mediumIssues: issues.filter(i => i.severity === 'medium').length,
      lowIssues: issues.filter(i => i.severity === 'low').length,
      securityIssues: issues.filter(i => i.type === 'security').length,
      performanceIssues: issues.filter(i => i.type === 'performance').length,
      qualityIssues: issues.filter(i => i.type === 'quality').length,
      documentationIssues: issues.filter(i => i.type === 'documentation').length
    };
    
    return summary;
  }

  private analyzeHTMLStructure(html: string, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for missing meta tags using regex
    if (!html.match(/<meta[^>]+name=["']viewport["'][^>]*>/i)) {
      issues.push({
        id: `html_1_${Date.now()}`,
        title: 'Missing Viewport Meta Tag',
        description: 'The viewport meta tag is missing, which may cause mobile display issues.',
        severity: 'medium',
        type: 'quality',
        status: 'open',
        filePath: webUrl,
        lineNumber: 1,
        codeSnippet: '<head>\n  <!-- Missing viewport meta tag -->\n</head>',
        impact: 'Poor mobile user experience and potential responsive design issues.',
        recommendation: 'Add viewport meta tag for proper mobile rendering.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add Viewport Meta Tag',
            description: 'Add the viewport meta tag in the head section.',
            codeExample: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
            language: 'html'
          }
        ],
        tags: ['html', 'mobile', 'responsive'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    return issues;
  }

  private analyzeJavaScript(html: string, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    try {
      console.log('Starting REAL JavaScript AST analysis...');
      
      // Extract all JavaScript code from HTML (inline and script tags)
      const jsCode = this.extractJavaScriptFromHTML(html);
      
      if (jsCode.length === 0) {
        console.log('No JavaScript found in HTML');
        return issues;
      }

      console.log(`Found ${jsCode.length} JavaScript blocks for analysis`);

      // Analyze each JavaScript block with real AST parsing
      jsCode.forEach((codeBlock, index) => {
        try {
          console.log(`Analyzing JS block ${index + 1}/${jsCode.length} (${codeBlock.code.length} chars)`);
          const astIssues = this.analyzeJavaScriptAST(codeBlock.code, webUrl, codeBlock.lineStart, index);
          issues.push(...astIssues);
          console.log(`Found ${astIssues.length} issues in block ${index + 1}`);
        } catch (parseError) {
          console.warn(`JavaScript AST parsing failed for block ${index}:`, parseError);
          const fallbackIssues = this.analyzeJavaScriptBasic(codeBlock.code, webUrl, codeBlock.lineStart, index);
          issues.push(...fallbackIssues);
          console.log(`Fallback analysis found ${fallbackIssues.length} issues in block ${index + 1}`);
        }
      });

      console.log(`JavaScript analysis completed. Total issues found: ${issues.length}`);

    } catch (error) {
      console.warn('JavaScript analysis error:', error);
      // Ultimate fallback to basic regex pattern matching
      const basicIssues = this.analyzeJavaScriptRegex(html, webUrl);
      issues.push(...basicIssues);
    }
    
    return issues;
  }

  private analyzeCSS(html: string, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    try {
      console.log('Starting REAL CSS AST analysis...');
      
      // Extract all CSS code from HTML (inline and style tags)
      const cssCode = this.extractCSSFromHTML(html);
      
      if (cssCode.length === 0) {
        console.log('No CSS found in HTML');
        return issues;
      }

      console.log(`Found ${cssCode.length} CSS blocks for analysis`);

      // Analyze each CSS block with real AST parsing
      cssCode.forEach((codeBlock, index) => {
        try {
          console.log(`Analyzing CSS block ${index + 1}/${cssCode.length} (${codeBlock.code.length} chars)`);
          const astIssues = this.analyzeCSSAST(codeBlock.code, webUrl, codeBlock.lineStart, index);
          issues.push(...astIssues);
          console.log(`Found ${astIssues.length} issues in CSS block ${index + 1}`);
        } catch (parseError) {
          console.warn(`CSS AST parsing failed for block ${index}:`, parseError);
          const fallbackIssues = this.analyzeCSSBasic(codeBlock.code, webUrl, codeBlock.lineStart, index);
          issues.push(...fallbackIssues);
          console.log(`Fallback analysis found ${fallbackIssues.length} issues in CSS block ${index + 1}`);
        }
      });

      console.log(`CSS analysis completed. Total issues found: ${issues.length}`);

    } catch (error) {
      console.warn('CSS analysis error:', error);
      // Ultimate fallback to basic regex pattern matching
      const basicIssues = this.analyzeCSSRegex(html, webUrl);
      issues.push(...basicIssues);
    }
    
    return issues;
  }

  private analyzeSecurity(html: string, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for missing security headers using regex
    if (!html.match(/<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/i)) {
      issues.push({
        id: `security_1_${Date.now()}`,
        title: 'Missing Content Security Policy',
        description: 'No Content Security Policy (CSP) header is defined.',
        severity: 'high',
        type: 'security',
        status: 'open',
        filePath: webUrl,
        lineNumber: 1,
        codeSnippet: '<head>\n  <!-- Missing CSP meta tag -->\n</head>',
        impact: 'Increased risk of XSS attacks and code injection.',
        recommendation: 'Implement a Content Security Policy to restrict resource loading.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add CSP Meta Tag',
            description: 'Add Content Security Policy meta tag.',
            codeExample: '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'">',
            language: 'html'
          }
        ],
        tags: ['security', 'csp', 'xss'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    return issues;
  }

  private analyzePerformance(html: string, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for unoptimized images using regex
    const imgMatches = html.match(/<img[^>]*>/gi);
    if (imgMatches) {
      imgMatches.forEach((img, index) => {
        if (!img.match(/loading\s*=\s*["']lazy["']/i)) {
          issues.push({
            id: `perf_${index}_${Date.now()}`,
            title: 'Missing Lazy Loading',
            description: 'Images lack lazy loading attribute.',
            severity: 'medium',
            type: 'performance',
            status: 'open',
            filePath: webUrl,
            lineNumber: index + 1,
            codeSnippet: '<img src="image.jpg" alt="Image">',
            impact: 'Slower page load times and increased bandwidth usage.',
            recommendation: 'Add lazy loading to images for better performance.',
            resolutionSteps: [
              {
                step: 1,
                title: 'Add Lazy Loading',
                description: 'Add loading="lazy" attribute to images.',
                codeExample: '<img src="image.jpg" alt="Image" loading="lazy">',
                language: 'html'
              }
            ],
            tags: ['performance', 'images', 'lazy-loading'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });
    }
    
    return issues;
  }

  // COMPREHENSIVE ANALYSIS METHODS - Simplified for Firebase Functions

  // SECURITY ANALYSIS METHODS

  async analyzeFileSecurity(filePath: string, content: string, extension: string, sourceIdentifier: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    const relativePath = path.basename(filePath);
    
    // SQL Injection patterns
    const sqlInjectionPatterns = [
      /query\s*\(\s*['"`]\s*SELECT.*\+/gi,
      /execute\s*\(\s*['"`].*\+/gi,
      /\.query\s*\(\s*['"`].*\$\{/gi,
      /WHERE.*=.*\+/gi
    ];
    
    for (const pattern of sqlInjectionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          id: `security_sql_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Potential SQL Injection Vulnerability',
          description: 'Dynamic SQL query construction detected that may be vulnerable to SQL injection attacks.',
          severity: 'critical',
          type: 'security',
          status: 'open',
          filePath: relativePath,
          lineNumber: this.getLineNumber(content, matches[0]),
          codeSnippet: this.getCodeSnippet(content, matches[0], 3),
          impact: 'Attackers could execute arbitrary SQL commands, potentially accessing, modifying, or deleting sensitive data.',
          recommendation: 'Use parameterized queries or prepared statements to prevent SQL injection attacks.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Replace with Parameterized Query',
              description: 'Use parameterized queries instead of string concatenation.',
              codeExample: extension === '.js' || extension === '.ts' 
                ? 'const query = "SELECT * FROM users WHERE id = ?"; db.query(query, [userId]);'
                : 'PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?"); stmt.setInt(1, userId);',
              language: extension === '.js' || extension === '.ts' ? 'javascript' : 'java'
            },
            {
              step: 2,
              title: 'Input Validation',
              description: 'Add input validation and sanitization.',
              codeExample: 'if (!Number.isInteger(userId) || userId <= 0) { throw new Error("Invalid user ID"); }'
            }
          ],
          tags: ['security', 'sql-injection', 'database'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }
    
    // XSS patterns
    const xssPatterns = [
      /innerHTML\s*=\s*.*\+/gi,
      /outerHTML\s*=\s*.*\+/gi,
      /document\.write\s*\(/gi,
      /eval\s*\(/gi
    ];
    
    for (const pattern of xssPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          id: `security_xss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Potential XSS Vulnerability',
          description: 'Dynamic HTML content generation detected that may be vulnerable to Cross-Site Scripting attacks.',
          severity: 'high',
          type: 'security',
          status: 'open',
          filePath: relativePath,
          lineNumber: this.getLineNumber(content, matches[0]),
          codeSnippet: this.getCodeSnippet(content, matches[0], 3),
          impact: 'Attackers could inject malicious scripts, potentially stealing user data or performing actions on behalf of users.',
          recommendation: 'Use safe DOM manipulation methods and escape user input.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Use Safe DOM Methods',
              description: 'Replace innerHTML with textContent or use createElement.',
              codeExample: 'element.textContent = userInput; // or use DOMPurify.sanitize(userInput)',
              language: 'javascript'
            }
          ],
          tags: ['security', 'xss', 'dom'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }

    // Hardcoded secrets patterns
    const secretPatterns = [
      /password\s*[:=]\s*['"][^'"]*['"]/gi,
      /api_key\s*[:=]\s*['"][^'"]*['"]/gi,
      /secret\s*[:=]\s*['"][^'"]*['"]/gi,
      /token\s*[:=]\s*['"][^'"]*['"]/gi
    ];
    
    for (const pattern of secretPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          id: `security_secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Hardcoded Secret Detected',
          description: 'Hardcoded passwords, API keys, or secrets found in source code.',
          severity: 'critical',
          type: 'security',
          status: 'open',
          filePath: relativePath,
          lineNumber: this.getLineNumber(content, matches[0]),
          codeSnippet: this.getCodeSnippet(content, matches[0], 2, true),
          impact: 'Sensitive credentials exposed in source code can be accessed by anyone with code access.',
          recommendation: 'Move sensitive credentials to environment variables or secure configuration files.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Move to Environment Variables',
              description: 'Replace hardcoded values with environment variables.',
              codeExample: 'const apiKey = process.env.API_KEY;',
              language: 'javascript'
            },
            {
              step: 2,
              title: 'Update .gitignore',
              description: 'Ensure .env files are in .gitignore.',
              codeExample: '# Environment variables\n.env\n.env.local\n.env.production'
            }
          ],
          tags: ['security', 'secrets', 'credentials'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }
    
    return issues;
  }

  // PERFORMANCE ANALYSIS METHODS

  async analyzeFilePerformance(filePath: string, content: string, extension: string, sourceIdentifier: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    const relativePath = path.basename(filePath);
    
    // Large file size check
    const fileSizeKB = Buffer.byteLength(content, 'utf8') / 1024;
    if (fileSizeKB > 100) {
      issues.push({
        id: `perf_size_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Large File Size',
        description: `File size is ${fileSizeKB.toFixed(2)}KB, which may impact loading performance.`,
        severity: fileSizeKB > 500 ? 'high' : 'medium',
        type: 'performance',
        status: 'open',
        filePath: relativePath,
        lineNumber: 1,
        codeSnippet: `File size: ${fileSizeKB.toFixed(2)}KB`,
        impact: 'Large files increase loading times and bandwidth usage.',
        recommendation: 'Consider code splitting, minification, or removing unused code.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Code Splitting',
            description: 'Split large files into smaller, more focused modules.',
            codeExample: '// Split into multiple files\n// utils.js, components.js, etc.'
          }
        ],
        tags: ['performance', 'file-size'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    // Inefficient loops
    const inefficientLoopPatterns = [
      /for\s*\([^)]*\.length[^)]*\)/gi,
      /while\s*\([^)]*\.length[^)]*\)/gi
    ];
    
    for (const pattern of inefficientLoopPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          id: `perf_loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Inefficient Loop',
          description: 'Loop condition calls .length in each iteration, causing unnecessary performance overhead.',
          severity: 'medium',
          type: 'performance',
          status: 'open',
          filePath: relativePath,
          lineNumber: this.getLineNumber(content, matches[0]),
          codeSnippet: this.getCodeSnippet(content, matches[0], 2),
          impact: 'Repeated .length calls in loops can degrade performance, especially with large arrays.',
          recommendation: 'Cache the array length in a variable before the loop.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Cache Array Length',
              description: 'Store the array length in a variable before the loop.',
              codeExample: 'const len = arr.length;\nfor (let i = 0; i < len; i++) {\n  // loop body\n}',
              language: 'javascript'
            }
          ],
          tags: ['performance', 'loops'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }
    
    return issues;
  }

  // CODE QUALITY ANALYSIS METHODS

  async analyzeFileQuality(filePath: string, content: string, extension: string, sourceIdentifier: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    const relativePath = path.basename(filePath);
    
    // Function complexity check
    const functionMatches = content.match(/function\s+\w+[^{]*\{[^}]*\}/g);
    if (functionMatches) {
      for (const func of functionMatches) {
        const complexity = this.calculateCyclomaticComplexity(func);
        if (complexity > 10) {
          issues.push({
            id: `quality_complexity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'High Cyclomatic Complexity',
            description: `Function has high cyclomatic complexity (${complexity}), making it difficult to understand and test.`,
            severity: complexity > 20 ? 'high' : 'medium',
            type: 'quality',
            status: 'open',
            filePath: relativePath,
            lineNumber: this.getLineNumber(content, func),
            codeSnippet: func.substring(0, 100) + '...',
            impact: 'High complexity increases the risk of bugs and makes code harder to maintain.',
            recommendation: 'Refactor the function to reduce complexity by breaking it into smaller functions.',
            resolutionSteps: [
              {
                step: 1,
                title: 'Extract Methods',
                description: 'Break down the function into smaller, more focused functions.',
                codeExample: '// Extract logical units into separate functions\nfunction processData(data) {\n  return validateData(data) && transformData(data);\n}'
              }
            ],
            tags: ['quality', 'complexity', 'maintainability'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      }
    }
    
    // Long lines check
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 120) {
        issues.push({
          id: `quality_line_length_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Long Line of Code',
          description: `Line ${index + 1} has ${line.length} characters, exceeding recommended limit of 120.`,
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: relativePath,
          lineNumber: index + 1,
          codeSnippet: line,
          impact: 'Long lines reduce code readability and make it harder to review.',
          recommendation: 'Break long lines into multiple lines for better readability.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Break Line',
              description: 'Split the long line at logical breakpoints.',
              codeExample: '// Instead of one long line, split into multiple lines'
            }
          ],
          tags: ['quality', 'readability'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });
    
    return issues;
  }

  // DOCUMENTATION ANALYSIS METHODS

  async analyzeFileDocumentation(filePath: string, content: string, extension: string, sourceIdentifier: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    const relativePath = path.basename(filePath);
    
    // Check for missing function documentation
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1];
      const functionStart = match.index;
      
      // Look for documentation comment before the function
      const beforeFunction = content.substring(0, functionStart);
      const lines = beforeFunction.split('\n');
      const lastNonEmptyLine = lines.reverse().find(line => line.trim() !== '');
      
      if (!lastNonEmptyLine || !lastNonEmptyLine.includes('/**') && !lastNonEmptyLine.includes('//')) {
        issues.push({
          id: `doc_function_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Missing Function Documentation',
          description: `Function '${functionName}' lacks documentation comments.`,
          severity: 'low',
          type: 'documentation',
          status: 'open',
          filePath: relativePath,
          lineNumber: this.getLineNumber(content, match[0]),
          codeSnippet: match[0],
          impact: 'Undocumented functions make code harder to understand and maintain.',
          recommendation: 'Add JSDoc comments to document function purpose, parameters, and return value.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Add JSDoc Comment',
              description: 'Add a JSDoc comment block above the function.',
              codeExample: `/**\n * Description of what ${functionName} does\n * @param {type} param - Description of parameter\n * @returns {type} Description of return value\n */\nfunction ${functionName}() {}`,
              language: 'javascript'
            }
          ],
          tags: ['documentation', 'jsdoc'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }
    
    return issues;
  }

  // DEPENDENCY ANALYSIS METHODS

  async analyzeDependencies(basePath: string, sourceIdentifier: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    try {
      // Check for package.json
      const packageJsonPath = path.join(basePath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
        
        // Check for outdated dependencies (mock check - in real implementation, use npm audit or similar)
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        for (const [dep, version] of Object.entries(dependencies)) {
          // Simple check for very old version patterns
          if (typeof version === 'string' && (version.startsWith('^0.') || version.startsWith('~0.'))) {
            issues.push({
              id: `dep_outdated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: 'Potentially Outdated Dependency',
              description: `Dependency '${dep}' version '${version}' may be outdated.`,
              severity: 'medium',
              type: 'quality',
              status: 'open',
              filePath: 'package.json',
              lineNumber: 1,
              codeSnippet: `"${dep}": "${version}"`,
              impact: 'Outdated dependencies may have security vulnerabilities or missing features.',
              recommendation: 'Update dependencies to latest stable versions.',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Check Latest Version',
                  description: 'Check npm for the latest version of the dependency.',
                  codeExample: `npm view ${dep} version`
                },
                {
                  step: 2,
                  title: 'Update Dependency',
                  description: 'Update to the latest version if compatible.',
                  codeExample: `npm update ${dep}`
                }
              ],
              tags: ['dependencies', 'updates'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error analyzing dependencies:', error);
    }
    
    return issues;
  }

  // WEB-SPECIFIC ANALYSIS METHODS

  async fetchUrl(url: string, headers: any = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const requestModule = parsedUrl.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...headers
        },
        timeout: 30000
      };

      const req = requestModule.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async fetchAuthenticatedPage(webUrl: string, credentials: LoginCredentials, headers: any): Promise<string> {
    // This would implement authenticated page fetching
    // For now, return basic fetch
    return await this.fetchUrl(webUrl, headers);
  }

  async analyzeWebSecurity(html: string, webUrl: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    issues.push(...this.analyzeSecurity(html, webUrl));
    
    // Additional web-specific security checks
    // Check for HTTPS
    if (webUrl.startsWith('http://')) {
      const timestamp = new Date().toISOString();
      issues.push({
        id: `web_https_${Date.now()}`,
        title: 'Insecure HTTP Connection',
        description: 'Website is served over HTTP instead of HTTPS.',
        severity: 'high',
        type: 'security',
        status: 'open',
        filePath: webUrl,
        lineNumber: 1,
        codeSnippet: webUrl,
        impact: 'Data transmitted over HTTP is not encrypted and can be intercepted.',
        recommendation: 'Implement HTTPS with a valid SSL certificate.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Obtain SSL Certificate',
            description: 'Get an SSL certificate from a trusted Certificate Authority.',
            codeExample: 'Use services like Let\'s Encrypt for free SSL certificates'
          }
        ],
        tags: ['security', 'https', 'ssl'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    return issues;
  }

  async analyzeWebPerformance(html: string, webUrl: string): Promise<CodeIssue[]> {
    const issues = this.analyzePerformance(html, webUrl);
    
    // Additional web performance checks
    // Check for render-blocking resources using regex
    const renderBlockingScripts = html.match(/<head[^>]*>[\s\S]*?<script[^>]+src=[^>]*(?!async|defer)[^>]*>[\s\S]*?<\/head>/gi);
    if (renderBlockingScripts && renderBlockingScripts.length > 0) {
      const timestamp = new Date().toISOString();
      issues.push({
        id: `web_render_blocking_${Date.now()}`,
        title: 'Render-Blocking JavaScript',
        description: `Found render-blocking JavaScript files in head section.`,
        severity: 'medium',
        type: 'performance',
        status: 'open',
        filePath: webUrl,
        lineNumber: 1,
        codeSnippet: '<script src="..."></script>',
        impact: 'Render-blocking resources delay page rendering and hurt user experience.',
        recommendation: 'Add async or defer attributes to non-critical scripts.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add Async/Defer',
            description: 'Add async or defer attributes to scripts.',
            codeExample: '<script src="script.js" defer></script>',
            language: 'html'
          }
        ],
        tags: ['performance', 'javascript', 'render-blocking'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    return issues;
  }

  async analyzeAccessibility(html: string, webUrl: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for missing alt attributes using regex
    const imgWithoutAlt = html.match(/<img(?![^>]*alt\s*=)[^>]*>/gi);
    if (imgWithoutAlt && imgWithoutAlt.length > 0) {
      issues.push({
        id: `a11y_alt_${Date.now()}`,
        title: 'Missing Alt Attributes',
        description: `Found ${imgWithoutAlt.length} images without alt attributes.`,
        severity: 'medium',
        type: 'quality',
        status: 'open',
        filePath: webUrl,
        lineNumber: 1,
        codeSnippet: '<img src="..." />',
        impact: 'Images without alt text are not accessible to screen readers.',
        recommendation: 'Add descriptive alt attributes to all images.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add Alt Attributes',
            description: 'Add meaningful alt text to images.',
            codeExample: '<img src="logo.png" alt="Company Logo" />',
            language: 'html'
          }
        ],
        tags: ['accessibility', 'images', 'alt-text'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    return issues;
  }

  async analyzeSEO(html: string, webUrl: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for missing title tag using regex
    if (!html.match(/<title[^>]*>.*<\/title>/i)) {
      issues.push({
        id: `seo_title_${Date.now()}`,
        title: 'Missing Page Title',
        description: 'Page is missing a title tag.',
        severity: 'high',
        type: 'quality',
        status: 'open',
        filePath: webUrl,
        lineNumber: 1,
        codeSnippet: '<head>\n  <!-- Missing title tag -->\n</head>',
        impact: 'Missing title tags hurt SEO and user experience.',
        recommendation: 'Add a descriptive title tag to the page.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add Title Tag',
            description: 'Add a title tag in the head section.',
            codeExample: '<title>Your Page Title</title>',
            language: 'html'
          }
        ],
        tags: ['seo', 'title', 'metadata'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    return issues;
  }

  // UTILITY METHODS

  private getLineNumber(content: string, searchString: string): number {
    const index = content.indexOf(searchString);
    if (index === -1) return 1;
    
    const beforeMatch = content.substring(0, index);
    return beforeMatch.split('\n').length;
  }

  private getCodeSnippet(content: string, searchString: string, contextLines: number = 2, hideSecrets: boolean = false): string {
    const lines = content.split('\n');
    const lineIndex = this.getLineNumber(content, searchString) - 1;
    
    const start = Math.max(0, lineIndex - contextLines);
    const end = Math.min(lines.length, lineIndex + contextLines + 1);
    
    let snippet = lines.slice(start, end).join('\n');
    
    if (hideSecrets) {
      snippet = snippet.replace(/(['"][^'"]*['"])/g, '"***"');
    }
    
    return snippet;
  }

  private calculateCyclomaticComplexity(functionCode: string): number {
    // Simple complexity calculation based on control flow keywords
    const complexityKeywords = [
      /\bif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g, 
      /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\b&&\b/g, /\b\|\|\b/g
    ];
    
    let complexity = 1; // Base complexity
    
    for (const keyword of complexityKeywords) {
      const matches = functionCode.match(keyword);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }

  // SIMULATION METHODS FOR FIREBASE FUNCTIONS COMPATIBILITY

  async simulateGitAnalysis(repoUrl: string, analysisConfig: any): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Simulate finding real issues based on common patterns in repositories
    if (analysisConfig.securityScan) {
      issues.push({
        id: `git_security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Hardcoded API Key Detected',
        description: 'A hardcoded API key was found in the repository configuration.',
        severity: 'critical',
        type: 'security',
        status: 'open',
        filePath: 'config/api.js',
        lineNumber: 15,
        codeSnippet: 'const API_KEY = "sk-1234567890abcdef";',
        impact: 'Exposed API keys can be used by unauthorized parties to access your services.',
        recommendation: 'Move API keys to environment variables.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Move to Environment Variable',
            description: 'Replace hardcoded key with environment variable.',
            codeExample: 'const API_KEY = process.env.API_KEY;',
            language: 'javascript'
          }
        ],
        tags: ['security', 'api-key', 'credentials'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    if (analysisConfig.performanceAnalysis) {
      issues.push({
        id: `git_perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Large Bundle Size',
        description: 'The JavaScript bundle size exceeds recommended limits.',
        severity: 'medium',
        type: 'performance',
        status: 'open',
        filePath: 'dist/bundle.js',
        lineNumber: 1,
        codeSnippet: '// Bundle size: 2.5MB',
        impact: 'Large bundles increase page load times and hurt user experience.',
        recommendation: 'Implement code splitting and tree shaking.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Enable Code Splitting',
            description: 'Split code into smaller chunks.',
            codeExample: 'import("./module").then(module => { /* use module */ });'
          }
        ],
        tags: ['performance', 'bundle-size', 'optimization'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    if (analysisConfig.codeQuality) {
      issues.push({
        id: `git_quality_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'High Cyclomatic Complexity',
        description: 'Function has complexity score of 15, exceeding recommended limit.',
        severity: 'medium',
        type: 'quality',
        status: 'open',
        filePath: 'src/utils/dataProcessor.js',
        lineNumber: 42,
        codeSnippet: 'function processData(data) { /* complex logic */ }',
        impact: 'High complexity makes code harder to understand and test.',
        recommendation: 'Break function into smaller, focused functions.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Extract Methods',
            description: 'Split complex function into smaller functions.',
            codeExample: 'function processData(data) {\n  return validateData(data) && transformData(data);\n}'
          }
        ],
        tags: ['quality', 'complexity', 'refactoring'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return issues;
  }

  async simulateLocalAnalysis(path: string, analysisConfig: any): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Simulate analysis of uploaded files
    if (analysisConfig.documentationCheck) {
      issues.push({
        id: `local_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Missing Function Documentation',
        description: 'Several functions lack JSDoc documentation.',
        severity: 'low',
        type: 'documentation',
        status: 'open',
        filePath: 'main.js',
        lineNumber: 25,
        codeSnippet: 'function calculateTotal(items) { /* ... */ }',
        impact: 'Undocumented code is harder to maintain and understand.',
        recommendation: 'Add JSDoc comments to all public functions.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add JSDoc',
            description: 'Add comprehensive JSDoc comments.',
            codeExample: '/**\n * Calculates total value of items\n * @param {Array} items - Items to calculate\n * @returns {number} Total value\n */\nfunction calculateTotal(items) { /* ... */ }'
          }
        ],
        tags: ['documentation', 'jsdoc'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    if (analysisConfig.securityScan) {
      issues.push({
        id: `local_sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Potential XSS Vulnerability',
        description: 'Direct DOM manipulation without sanitization detected.',
        severity: 'high',
        type: 'security',
        status: 'open',
        filePath: 'ui.js',
        lineNumber: 78,
        codeSnippet: 'element.innerHTML = userInput;',
        impact: 'Unsanitized user input can lead to XSS attacks.',
        recommendation: 'Use textContent or sanitize input before using innerHTML.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Use Safe DOM Methods',
            description: 'Replace innerHTML with safe alternatives.',
            codeExample: 'element.textContent = userInput; // or use DOMPurify.sanitize(userInput)'
          }
        ],
        tags: ['security', 'xss', 'sanitization'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return issues;
  }

  // REAL AST-BASED JAVASCRIPT ANALYSIS METHODS

  private extractJavaScriptFromHTML(html: string): Array<{code: string, lineStart: number, type: 'inline' | 'script'}> {
    const jsBlocks: Array<{code: string, lineStart: number, type: 'inline' | 'script'}> = [];
    
    // Extract inline script blocks
    const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    
    while ((match = scriptRegex.exec(html)) !== null) {
      const code = match[1].trim();
      if (code.length > 0) {
        const lineStart = html.substring(0, match.index).split('\n').length;
        jsBlocks.push({
          code,
          lineStart,
          type: 'script'
        });
      }
    }

    // Extract event handlers (onclick, onload, etc.)
    const eventHandlerRegex = /on\w+\s*=\s*["']([^"']+)["']/gi;
    while ((match = eventHandlerRegex.exec(html)) !== null) {
      const code = match[1].trim();
      if (code.length > 0) {
        const lineStart = html.substring(0, match.index).split('\n').length;
        jsBlocks.push({
          code,
          lineStart,
          type: 'inline'
        });
      }
    }

    return jsBlocks;
  }

  private analyzeJavaScriptAST(code: string, webUrl: string, lineStart: number, blockIndex: number): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    try {
      // Parse JavaScript with esprima for real AST analysis
      const ast = esprima.parseScript(code, {
        range: true,
        loc: true,
        tolerant: true
      });

      // Security Analysis - Critical for real-world applications
      issues.push(...this.detectSecurityVulnerabilities(ast, code, webUrl, lineStart, blockIndex));
      
      // Code Quality Analysis - Maintainability and best practices
      issues.push(...this.detectCodeQualityIssues(ast, code, webUrl, lineStart, blockIndex));
      
      // Performance Analysis - Runtime performance issues
      issues.push(...this.detectPerformanceIssues(ast, code, webUrl, lineStart, blockIndex));

    } catch (error) {
      console.warn('AST parsing failed, using basic analysis:', error);
      return this.analyzeJavaScriptBasic(code, webUrl, lineStart, blockIndex);
    }

    return issues;
  }

  private detectSecurityVulnerabilities(ast: any, code: string, webUrl: string, lineStart: number, blockIndex: number): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    // Walk the AST to find security issues
    this.walkAST(ast, (node: any) => {
      // Detect eval() usage - Critical security vulnerability
      if (node.type === 'CallExpression' && 
          node.callee.type === 'Identifier' && 
          node.callee.name === 'eval') {
        issues.push({
          id: `js_eval_${blockIndex}_${Date.now()}`,
          title: 'Critical: eval() Usage Detected',
          description: 'The eval() function executes arbitrary code and is a major security vulnerability.',
          severity: 'critical',
          type: 'security',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
          codeSnippet: this.getCodeSnippet(code, 'eval(', 2),
          impact: 'CRITICAL: Allows arbitrary code execution, potential for complete system compromise',
          recommendation: 'Remove eval() immediately. Use JSON.parse() for JSON or proper parsing methods.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Remove eval()',
              description: 'Replace eval() with safe alternatives',
              codeExample: '// UNSAFE: eval(userInput)\n// SAFE: JSON.parse(jsonString)\n// SAFE: parseInt(numString) for numbers'
            }
          ],
          tags: ['javascript', 'security', 'eval', 'critical', 'cwe-95'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      // Detect innerHTML usage - XSS vulnerability
      if (node.type === 'MemberExpression' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'innerHTML') {
        issues.push({
          id: `js_innerHTML_${blockIndex}_${Date.now()}`,
          title: 'XSS Risk: innerHTML Usage',
          description: 'Using innerHTML with dynamic content can lead to Cross-Site Scripting (XSS) attacks.',
          severity: 'high',
          type: 'security',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
          codeSnippet: this.getCodeSnippet(code, 'innerHTML', 2),
          impact: 'XSS vulnerability if user input is not properly sanitized',
          recommendation: 'Use textContent for text or sanitize HTML content with DOMPurify',
          resolutionSteps: [
            {
              step: 1,
              title: 'Use Safe Alternatives',
              description: 'Replace innerHTML with secure methods',
              codeExample: '// SAFE: element.textContent = userInput;\n// SAFE: element.innerHTML = DOMPurify.sanitize(html);'
            }
          ],
          tags: ['javascript', 'security', 'xss', 'innerHTML', 'cwe-79'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      // Detect document.write() usage - Deprecated and risky
      if (node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'document' &&
          node.callee.property.name === 'write') {
        issues.push({
          id: `js_docwrite_${blockIndex}_${Date.now()}`,
          title: 'Deprecated: document.write() Usage',
          description: 'document.write() is deprecated and can cause security and performance issues.',
          severity: 'medium',
          type: 'quality',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
          codeSnippet: this.getCodeSnippet(code, 'document.write', 2),
          impact: 'Performance issues, blocks page rendering, potential security risks',
          recommendation: 'Use modern DOM manipulation methods',
          resolutionSteps: [
            {
              step: 1,
              title: 'Modern DOM Methods',
              description: 'Replace document.write with createElement',
              codeExample: '// const element = document.createElement("div");\n// element.textContent = "content";\n// parent.appendChild(element);'
            }
          ],
          tags: ['javascript', 'quality', 'deprecated', 'performance'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      // Detect window.open() without proper parameters - Security risk
      if (node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'window' &&
          node.callee.property.name === 'open') {
        issues.push({
          id: `js_windowopen_${blockIndex}_${Date.now()}`,
          title: 'window.open() Security Risk',
          description: 'window.open() without proper noopener/noreferrer can be a security risk.',
          severity: 'medium',
          type: 'security',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
          codeSnippet: this.getCodeSnippet(code, 'window.open', 2),
          impact: 'Potential window.opener attacks, memory leaks',
          recommendation: 'Use rel="noopener noreferrer" or set window.opener = null',
          resolutionSteps: [
            {
              step: 1,
              title: 'Secure window.open()',
              description: 'Add security parameters to window.open()',
              codeExample: '// const newWindow = window.open(url, "_blank");\n// newWindow.opener = null;'
            }
          ],
          tags: ['javascript', 'security', 'window-opener'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    return issues;
  }

  private detectCodeQualityIssues(ast: any, code: string, webUrl: string, lineStart: number, blockIndex: number): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    let functionCount = 0;

    this.walkAST(ast, (node: any) => {
      // Function complexity analysis
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        functionCount++;
        
        // Calculate cyclomatic complexity for this function
        const functionCode = code.substring(node.range[0], node.range[1]);
        const complexity = this.calculateAdvancedComplexity(functionCode);
        
        if (complexity > 10) {
          issues.push({
            id: `js_complexity_${blockIndex}_${functionCount}_${Date.now()}`,
            title: `High Cyclomatic Complexity (${complexity})`,
            description: `Function has cyclomatic complexity of ${complexity}, exceeding recommended limit of 10.`,
            severity: complexity > 15 ? 'high' : 'medium',
            type: 'quality',
            status: 'open',
            filePath: webUrl,
            lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
            codeSnippet: this.getCodeSnippet(code, node.id?.name || 'function', 3),
            impact: 'Code is difficult to understand, test, and maintain. Higher bug risk.',
            recommendation: 'Break down into smaller, focused functions. Use early returns to reduce nesting.',
            resolutionSteps: [
              {
                step: 1,
                title: 'Refactor Function',
                description: 'Split complex function into smaller functions',
                codeExample: '// Extract logic into helper functions\n// Use early returns: if (!condition) return;\n// Reduce nested if/else statements'
              }
            ],
            tags: ['javascript', 'quality', 'complexity', 'maintainability'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }

        // Check for long parameter lists
        const paramCount = node.params?.length || 0;
        if (paramCount > 5) {
          issues.push({
            id: `js_params_${blockIndex}_${functionCount}_${Date.now()}`,
            title: `Too Many Parameters (${paramCount})`,
            description: `Function has ${paramCount} parameters, exceeding recommended limit of 5.`,
            severity: 'low',
            type: 'quality',
            status: 'open',
            filePath: webUrl,
            lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
            codeSnippet: this.getCodeSnippet(code, node.id?.name || 'function', 2),
            impact: 'Functions with many parameters are hard to use and maintain.',
            recommendation: 'Use object parameters or split function into smaller functions.',
            resolutionSteps: [
              {
                step: 1,
                title: 'Refactor Parameters',
                description: 'Use object destructuring for multiple parameters',
                codeExample: '// Instead of: function(a, b, c, d, e, f)\n// Use: function({param1, param2, options})'
              }
            ],
            tags: ['javascript', 'quality', 'parameters', 'design'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      }

      // Detect variable declarations without const/let (var usage)
      if (node.type === 'VariableDeclaration' && node.kind === 'var') {
        issues.push({
          id: `js_var_${blockIndex}_${Date.now()}`,
          title: 'Deprecated var Declaration',
          description: 'Using var instead of const/let can lead to scope issues.',
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
          codeSnippet: this.getCodeSnippet(code, 'var ', 2),
          impact: 'Function-scoped variables can cause unexpected behavior.',
          recommendation: 'Use const for constants, let for variables.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Replace var',
              description: 'Use const/let instead of var',
              codeExample: '// Use: const value = 42; // for constants\n// Use: let counter = 0; // for variables'
            }
          ],
          tags: ['javascript', 'quality', 'es6', 'scope'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    return issues;
  }

  private detectPerformanceIssues(ast: any, code: string, webUrl: string, lineStart: number, blockIndex: number): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    this.walkAST(ast, (node: any) => {
      // Detect DOM queries inside loops - Major performance issue
      if (node.type === 'ForStatement' || node.type === 'WhileStatement' || node.type === 'DoWhileStatement') {
        this.walkAST(node.body, (innerNode: any) => {
          if (innerNode.type === 'CallExpression' &&
              innerNode.callee.type === 'MemberExpression' &&
              innerNode.callee.object.name === 'document' &&
              (innerNode.callee.property.name === 'getElementById' ||
               innerNode.callee.property.name === 'querySelector' ||
               innerNode.callee.property.name === 'getElementsByClassName' ||
               innerNode.callee.property.name === 'getElementsByTagName')) {
            issues.push({
              id: `js_dom_loop_${blockIndex}_${Date.now()}`,
              title: 'Performance: DOM Query Inside Loop',
              description: 'DOM queries inside loops cause significant performance degradation.',
              severity: 'medium',
              type: 'performance',
              status: 'open',
              filePath: webUrl,
              lineNumber: lineStart + (innerNode.loc?.start?.line || 1) - 1,
              codeSnippet: this.getCodeSnippet(code, innerNode.callee.property.name, 2),
              impact: 'Severe performance degradation due to repeated DOM queries',
              recommendation: 'Cache DOM elements outside the loop',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Cache DOM References',
                  description: 'Store DOM element references outside the loop',
                  codeExample: '// const element = document.getElementById("myId");\n// for(let i = 0; i < items.length; i++) {\n//   element.style.color = colors[i];\n// }'
                }
              ],
              tags: ['javascript', 'performance', 'dom', 'loop', 'optimization'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }
        });
      }

      // Detect console.log in production code
      if (node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console') {
        issues.push({
          id: `js_console_${blockIndex}_${Date.now()}`,
          title: 'Production: Console Statement',
          description: 'Console statements should be removed from production code.',
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
          codeSnippet: this.getCodeSnippet(code, 'console.', 2),
          impact: 'Unnecessary output in production, potential information disclosure',
          recommendation: 'Remove console statements or use proper logging framework',
          resolutionSteps: [
            {
              step: 1,
              title: 'Remove Console Statements',
              description: 'Remove or replace with proper logging',
              codeExample: '// Remove: console.log("debug info");\n// Or use: logger.debug("debug info");'
            }
          ],
          tags: ['javascript', 'quality', 'production', 'logging'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    return issues;
  }

  private walkAST(node: any, callback: (node: any) => void): void {
    if (!node || typeof node !== 'object') return;
    
    callback(node);
    
    // Recursively walk child nodes
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach(item => this.walkAST(item, callback));
        } else if (child && typeof child === 'object') {
          this.walkAST(child, callback);
        }
      }
    }
  }

  private calculateAdvancedComplexity(functionCode: string): number {
    // Enhanced cyclomatic complexity calculation
    let complexity = 1; // Base complexity
    
    // Decision points that increase complexity
    const decisionPatterns = [
      /\bif\b/g,           // if statements
      /\belse\s+if\b/g,    // else if statements  
      /\bwhile\b/g,        // while loops
      /\bfor\b/g,          // for loops
      /\bdo\b/g,           // do-while loops
      /\bswitch\b/g,       // switch statements
      /\bcase\b/g,         // case statements
      /\bcatch\b/g,        // catch blocks
      /\b\?\b/g,           // ternary operators
      /\b&&\b/g,           // logical AND
      /\b\|\|\b/g,         // logical OR
    ];
    
    decisionPatterns.forEach(pattern => {
      const matches = functionCode.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  private analyzeJavaScriptBasic(code: string, webUrl: string, lineStart: number, blockIndex: number): CodeIssue[] {
    // Fallback to pattern matching if AST parsing fails
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    // Basic security patterns
    const securityPatterns = [
      { pattern: 'eval(', title: 'eval() Usage (Basic Check)', severity: 'critical' as const },
      { pattern: 'innerHTML', title: 'innerHTML Usage (Basic Check)', severity: 'high' as const },
      { pattern: 'document.write', title: 'document.write() Usage (Basic Check)', severity: 'medium' as const }
    ];

    securityPatterns.forEach(({pattern, title, severity}) => {
      if (code.includes(pattern)) {
        issues.push({
          id: `js_basic_${pattern.replace(/[^a-z]/gi, '')}_${blockIndex}_${Date.now()}`,
          title,
          description: `Found ${pattern} usage which may be a security or quality risk.`,
          severity,
          type: 'security',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart,
          codeSnippet: code.substring(0, 100) + '...',
          impact: 'Potential security or quality issue',
          recommendation: `Review and replace ${pattern} with safer alternatives`,
          resolutionSteps: [
            {
              step: 1,
              title: 'Manual Review',
              description: `Review the usage of ${pattern} and replace with safer methods`,
              codeExample: `Replace ${pattern} with appropriate safe alternative`
            }
          ],
          tags: ['javascript', 'security', 'basic-check'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    return issues;
  }

  private analyzeJavaScriptRegex(html: string, webUrl: string): CodeIssue[] {
    // Ultimate fallback - the original regex approach
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    const scriptMatches = html.match(/<script(?![^>]*src=)[^>]*>([^<]*(?:<(?!\/script>)[^<]*)*)<\/script>/gi);
    if (scriptMatches) {
      scriptMatches.forEach((script, index) => {
        if (script.includes('eval(') || script.includes('innerHTML')) {
          issues.push({
            id: `js_regex_${index}_${Date.now()}`,
            title: 'JavaScript Security Check (Regex Fallback)',
            description: 'Basic pattern matching found potentially unsafe JavaScript operations.',
            severity: 'medium',
            type: 'security',
            status: 'open',
            filePath: webUrl,
            lineNumber: index + 1,
            codeSnippet: script.substring(0, 100) + '...',
            impact: 'Potential security or quality issues detected by basic pattern matching',
            recommendation: 'Manual review recommended - AST parsing was unavailable',
            resolutionSteps: [
              {
                step: 1,
                title: 'Manual Code Review',
                description: 'Manually review the JavaScript code for security issues',
                codeExample: 'Check for eval(), innerHTML, and other risky patterns'
              }
            ],
            tags: ['javascript', 'security', 'regex-fallback', 'manual-review'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });
    }
    
    return issues;
  }

  // REAL AST-BASED CSS ANALYSIS METHODS

  private extractCSSFromHTML(html: string): Array<{code: string, lineStart: number, type: 'inline' | 'style'}> {
    const cssBlocks: Array<{code: string, lineStart: number, type: 'inline' | 'style'}> = [];
    
    // Extract style blocks
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match;
    
    while ((match = styleRegex.exec(html)) !== null) {
      const code = match[1].trim();
      if (code.length > 0) {
        const lineStart = html.substring(0, match.index).split('\n').length;
        cssBlocks.push({
          code,
          lineStart,
          type: 'style'
        });
      }
    }

    // Extract inline styles (style attributes)
    const inlineStyleRegex = /style\s*=\s*["']([^"']+)["']/gi;
    while ((match = inlineStyleRegex.exec(html)) !== null) {
      const code = match[1].trim();
      if (code.length > 0) {
        const lineStart = html.substring(0, match.index).split('\n').length;
        cssBlocks.push({
          code,
          lineStart,
          type: 'inline'
        });
      }
    }

    return cssBlocks;
  }

  private analyzeCSSAST(code: string, webUrl: string, lineStart: number, blockIndex: number): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    try {
      // Parse CSS with css-tree for real AST analysis
      const ast = cssTree.parse(code, {
        positions: true,
        parseRulePrelude: false,
        parseAtrulePrelude: false,
        parseValue: false
      });

      // Performance Analysis - CSS optimization issues
      issues.push(...this.detectCSSPerformanceIssues(ast, code, webUrl, lineStart, blockIndex));
      
      // Quality Analysis - Best practices and maintainability
      issues.push(...this.detectCSSQualityIssues(ast, code, webUrl, lineStart, blockIndex));
      
      // Accessibility Analysis - CSS accessibility issues
      issues.push(...this.detectCSSAccessibilityIssues(ast, code, webUrl, lineStart, blockIndex));

    } catch (error) {
      console.warn('CSS AST parsing failed, using basic analysis:', error);
      return this.analyzeCSSBasic(code, webUrl, lineStart, blockIndex);
    }

    return issues;
  }

  private detectCSSPerformanceIssues(ast: any, code: string, webUrl: string, lineStart: number, blockIndex: number): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    // Walk the CSS AST to find performance issues
    this.walkCSSAST(ast, (node: any) => {
      // Detect universal selector (*)
      if (node.type === 'TypeSelector' && node.name === '*') {
        issues.push({
          id: `css_universal_${blockIndex}_${Date.now()}`,
          title: 'Performance: Universal Selector',
          description: 'Universal selector (*) can cause performance issues by matching all elements.',
          severity: 'medium',
          type: 'performance',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
          codeSnippet: this.getCodeSnippet(code, '*', 2),
          impact: 'Slower CSS parsing and rendering due to universal matching',
          recommendation: 'Use specific selectors instead of universal selector',
          resolutionSteps: [
            {
              step: 1,
              title: 'Replace Universal Selector',
              description: 'Use specific element or class selectors',
              codeExample: '/* Instead of: * { margin: 0; }\n   Use: body, div, p { margin: 0; } */'
            }
          ],
          tags: ['css', 'performance', 'selector', 'optimization'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      // Detect inefficient descendant selectors
      if (node.type === 'Rule' && node.prelude && node.prelude.children) {
        const selectorText = this.getCSSSelectorText(node.prelude);
        const descendantCount = (selectorText.match(/\s+/g) || []).length;
        
        if (descendantCount > 3) {
          issues.push({
            id: `css_deep_selector_${blockIndex}_${Date.now()}`,
            title: 'Performance: Deep Descendant Selector',
            description: `Selector has ${descendantCount + 1} levels of nesting, which can impact performance.`,
            severity: 'low',
            type: 'performance',
            status: 'open',
            filePath: webUrl,
            lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
            codeSnippet: this.getCodeSnippet(code, selectorText.substring(0, 30), 2),
            impact: 'Slower CSS matching due to deep selector traversal',
            recommendation: 'Reduce selector nesting depth and use more specific classes',
            resolutionSteps: [
              {
                step: 1,
                title: 'Simplify Selectors',
                description: 'Use specific classes instead of deep nesting',
                codeExample: '/* Instead of: .header .nav .menu .item\n   Use: .nav-menu-item */'
              }
            ],
            tags: ['css', 'performance', 'selector', 'nesting'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      }

      // Detect @import statements (should be avoided)
      if (node.type === 'Atrule' && node.name === 'import') {
        issues.push({
          id: `css_import_${blockIndex}_${Date.now()}`,
          title: 'Performance: @import Usage',
          description: '@import statements block parallel downloading and can slow page loading.',
          severity: 'medium',
          type: 'performance',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
          codeSnippet: this.getCodeSnippet(code, '@import', 2),
          impact: 'Blocks parallel CSS downloading, increases page load time',
          recommendation: 'Use <link> tags instead of @import',
          resolutionSteps: [
            {
              step: 1,
              title: 'Replace @import',
              description: 'Use HTML link tags for external CSS',
              codeExample: '<!-- Instead of @import url("styles.css")\n     Use: <link rel="stylesheet" href="styles.css"> -->'
            }
          ],
          tags: ['css', 'performance', 'import', 'loading'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    return issues;
  }

  private detectCSSQualityIssues(ast: any, code: string, webUrl: string, lineStart: number, blockIndex: number): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    this.walkCSSAST(ast, (node: any) => {
      // Detect !important usage (code smell)
      if (node.type === 'Declaration' && node.important) {
        issues.push({
          id: `css_important_${blockIndex}_${Date.now()}`,
          title: 'Quality: !important Usage',
          description: 'Using !important makes CSS harder to maintain and override.',
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
          codeSnippet: this.getCodeSnippet(code, '!important', 2),
          impact: 'Reduces CSS maintainability and makes debugging harder',
          recommendation: 'Use more specific selectors instead of !important',
          resolutionSteps: [
            {
              step: 1,
              title: 'Remove !important',
              description: 'Increase selector specificity instead',
              codeExample: '/* Instead of: .button { color: red !important; }\n   Use: .header .button { color: red; } */'
            }
          ],
          tags: ['css', 'quality', 'maintainability', 'specificity'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      // Detect potential vendor prefix issues
      if (node.type === 'Declaration') {
        const property = node.property;
        if (property.startsWith('-webkit-') || property.startsWith('-moz-') || 
            property.startsWith('-ms-') || property.startsWith('-o-')) {
          issues.push({
            id: `css_vendor_${blockIndex}_${Date.now()}`,
            title: 'Quality: Vendor Prefix Usage',
            description: 'Vendor prefixes may be outdated or unnecessary for modern browsers.',
            severity: 'low',
            type: 'quality',
            status: 'open',
            filePath: webUrl,
            lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
            codeSnippet: this.getCodeSnippet(code, property, 2),
            impact: 'Potential compatibility issues or unnecessary code bloat',
            recommendation: 'Review vendor prefix necessity for target browsers',
            resolutionSteps: [
              {
                step: 1,
                title: 'Review Vendor Prefixes',
                description: 'Check if vendor prefixes are still needed',
                codeExample: '/* Check caniuse.com for current browser support\n   Use autoprefixer for automatic prefix management */'
              }
            ],
            tags: ['css', 'quality', 'vendor-prefix', 'compatibility'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      }
    });

    return issues;
  }

  private detectCSSAccessibilityIssues(ast: any, code: string, webUrl: string, lineStart: number, blockIndex: number): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    this.walkCSSAST(ast, (node: any) => {
      if (node.type === 'Declaration') {
        // Detect small font sizes
        if (node.property === 'font-size' && node.value) {
          const value = this.getCSSDeclarationValue(node.value);
          if (value.includes('px') && parseInt(value) < 14) {
            issues.push({
              id: `css_small_font_${blockIndex}_${Date.now()}`,
              title: 'Accessibility: Small Font Size',
              description: `Font size ${value} is below recommended minimum for accessibility.`,
              severity: 'medium',
              type: 'accessibility',
              status: 'open',
              filePath: webUrl,
              lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
              codeSnippet: this.getCodeSnippet(code, `font-size: ${value}`, 2),
              impact: 'Difficult to read for users with visual impairments',
              recommendation: 'Use font size of at least 14px or equivalent rem/em value',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Increase Font Size',
                  description: 'Use accessible font sizes',
                  codeExample: '/* Use: font-size: 16px; or font-size: 1rem; */'
                }
              ],
              tags: ['css', 'accessibility', 'font-size', 'wcag'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }
        }

        // Detect insufficient color contrast (basic check)
        if (node.property === 'color' || node.property === 'background-color') {
          const value = this.getCSSDeclarationValue(node.value);
          if (value === '#fff' || value === 'white' || value === '#000' || value === 'black') {
            // This is a basic check - full contrast analysis would require more complex color parsing
            issues.push({
              id: `css_contrast_${blockIndex}_${Date.now()}`,
              title: 'Accessibility: Review Color Contrast',
              description: 'Pure white/black colors detected. Verify color contrast ratios meet WCAG guidelines.',
              severity: 'low',
              type: 'accessibility',
              status: 'open',
              filePath: webUrl,
              lineNumber: lineStart + (node.loc?.start?.line || 1) - 1,
              codeSnippet: this.getCodeSnippet(code, `${node.property}: ${value}`, 2),
              impact: 'May not provide sufficient contrast for accessibility',
              recommendation: 'Test color combinations with contrast ratio tools',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Check Contrast Ratio',
                  description: 'Use WebAIM contrast checker or similar tools',
                  codeExample: '/* Ensure contrast ratio is at least 4.5:1 for normal text,\n   3:1 for large text (18pt+ or 14pt+ bold) */'
                }
              ],
              tags: ['css', 'accessibility', 'contrast', 'wcag', 'color'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }
        }
      }
    });

    return issues;
  }

  private walkCSSAST(node: any, callback: (node: any) => void): void {
    if (!node) return;
    
    callback(node);
    
    // Walk CSS AST structure
    if (node.children && node.children.forEach) {
      node.children.forEach((child: any) => this.walkCSSAST(child, callback));
    }
    
    if (node.prelude) {
      this.walkCSSAST(node.prelude, callback);
    }
    
    if (node.block) {
      this.walkCSSAST(node.block, callback);
    }
    
    if (node.value) {
      this.walkCSSAST(node.value, callback);
    }
  }

  private getCSSSelectorText(prelude: any): string {
    // Basic selector text extraction from CSS AST
    if (!prelude || !prelude.children) return '';
    
    let text = '';
    prelude.children.forEach((child: any) => {
      if (child.type === 'TypeSelector') {
        text += child.name + ' ';
      } else if (child.type === 'ClassSelector') {
        text += '.' + child.name + ' ';
      } else if (child.type === 'IdSelector') {
        text += '#' + child.name + ' ';
      } else if (child.type === 'Combinator') {
        text += child.name + ' ';
      }
    });
    
    return text.trim();
  }

  private getCSSDeclarationValue(valueNode: any): string {
    // Basic value extraction from CSS AST
    if (!valueNode || !valueNode.children) return '';
    
    let value = '';
    valueNode.children.forEach((child: any) => {
      if (child.type === 'Dimension') {
        value += child.value + child.unit;
      } else if (child.type === 'Identifier') {
        value += child.name;
      } else if (child.type === 'Hash') {
        value += '#' + child.value;
      } else if (child.type === 'Number') {
        value += child.value;
      }
    });
    
    return value;
  }

  private analyzeCSSBasic(code: string, webUrl: string, lineStart: number, blockIndex: number): CodeIssue[] {
    // Fallback to pattern matching if CSS AST parsing fails
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    // Basic CSS quality patterns
    const patterns = [
      { pattern: '!important', title: '!important Usage (Basic Check)', severity: 'low' as const },
      { pattern: 'position: fixed', title: 'Fixed Position Usage (Basic Check)', severity: 'medium' as const },
      { pattern: '@import', title: '@import Usage (Basic Check)', severity: 'medium' as const }
    ];

    patterns.forEach(({pattern, title, severity}) => {
      if (code.includes(pattern)) {
        issues.push({
          id: `css_basic_${pattern.replace(/[^a-z]/gi, '')}_${blockIndex}_${Date.now()}`,
          title,
          description: `Found ${pattern} usage which may affect quality or performance.`,
          severity,
          type: 'quality',
          status: 'open',
          filePath: webUrl,
          lineNumber: lineStart,
          codeSnippet: code.substring(0, 100) + '...',
          impact: 'Potential CSS quality or performance issue',
          recommendation: `Review and optimize ${pattern} usage`,
          resolutionSteps: [
            {
              step: 1,
              title: 'Manual Review',
              description: `Review the usage of ${pattern}`,
              codeExample: `Consider alternatives to ${pattern}`
            }
          ],
          tags: ['css', 'quality', 'basic-check'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    return issues;
  }

  private analyzeCSSRegex(html: string, webUrl: string): CodeIssue[] {
    // Ultimate fallback - the original regex approach
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for inline styles using regex
    if (html.match(/style\s*=\s*["'][^"']*["']/i)) {
      issues.push({
        id: `css_regex_${Date.now()}`,
        title: 'Inline Styles Detected (Regex Check)',
        description: 'Basic pattern matching found inline styles.',
        severity: 'low',
        type: 'quality',
        status: 'open',
        filePath: webUrl,
        lineNumber: 1,
        codeSnippet: 'style="..." attribute detected',
        impact: 'Reduced maintainability and separation of concerns',
        recommendation: 'Move inline styles to external CSS files',
        resolutionSteps: [
          {
            step: 1,
            title: 'Extract to CSS',
            description: 'Move inline styles to CSS classes',
            codeExample: '/* Create CSS classes and remove inline styles */'
          }
        ],
        tags: ['css', 'quality', 'regex-fallback', 'inline-styles'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    return issues;
  }

  // ENHANCED GIT REPOSITORY ANALYSIS HELPER METHODS
  
  private parseRepositoryUrl(repoUrl: string): { platform: string; owner: string; repo: string; isPublic: boolean } {
    try {
      const url = new URL(repoUrl);
      const parts = url.pathname.split('/').filter(p => p);
      
      let platform = 'unknown';
      if (url.hostname.includes('github.com')) {
        platform = 'github';
      } else if (url.hostname.includes('gitlab.com')) {
        platform = 'gitlab';
      } else if (url.hostname.includes('bitbucket.org')) {
        platform = 'bitbucket';
      }
      
      return {
        platform,
        owner: parts[0] || '',
        repo: parts[1] || '',
        isPublic: true // Assume public for now, could be enhanced with API checks
      };
    } catch (error) {
      return { platform: 'unknown', owner: '', repo: '', isPublic: false };
    }
  }

  private async analyzeRepositoryViaAPI(repoInfo: any, repoUrl: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    
    try {
      // Note: In a real implementation, you would use GitHub/GitLab APIs here
      // For now, we'll analyze based on URL patterns and public information
      
      // Check for common repository security issues
      if (repoInfo.platform === 'github') {
        issues.push({
          id: `github_public_repo_${Date.now()}`,
          title: 'Public Repository Analysis',
          description: 'Repository appears to be public. Ensure no sensitive data is exposed.',
          severity: 'medium',
          type: 'security',
          status: 'open',
          filePath: repoUrl,
          lineNumber: 1,
          codeSnippet: `Public GitHub repository: ${repoInfo.owner}/${repoInfo.repo}`,
          impact: 'Public repositories expose source code and potentially sensitive information',
          recommendation: 'Review repository contents for exposed secrets, API keys, or sensitive data',
          resolutionSteps: [
            {
              step: 1,
              title: 'Security Review',
              description: 'Scan for hardcoded secrets, API keys, and sensitive information'
            },
            {
              step: 2,
              title: 'Repository Settings',
              description: 'Consider if repository should be private'
            }
          ],
          tags: ['github', 'security', 'public-repo'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('Repository API analysis failed:', error);
    }
    
    return issues;
  }

  private async analyzeRepositoryConfigFiles(repoInfo: any, repoUrl: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    
    try {
      // Analyze common configuration files that might be accessible
      const configFiles = [
        'package.json',
        'requirements.txt',
        'Dockerfile',
        '.gitignore',
        'README.md',
        'tsconfig.json',
        'webpack.config.js'
      ];

      // Note: In a real implementation, you would fetch these files via raw API
      // For Firebase Functions, we're limited in API calls, so we provide guidance
      
      issues.push({
        id: `config_files_analysis_${Date.now()}`,
        title: 'Configuration Files Analysis',
        description: 'Repository may contain configuration files that should be reviewed for security and best practices.',
        severity: 'low',
        type: 'quality',
        status: 'open',
        filePath: repoUrl,
        lineNumber: 1,
        codeSnippet: `Config files to review: ${configFiles.join(', ')}`,
        impact: 'Configuration files may contain security issues or suboptimal settings',
        recommendation: 'Review configuration files for security, dependencies, and best practices',
        resolutionSteps: [
          {
            step: 1,
            title: 'Security Review',
            description: 'Check for exposed credentials in config files'
          },
          {
            step: 2,
            title: 'Dependency Analysis',
            description: 'Review package.json/requirements.txt for outdated dependencies'
          }
        ],
        tags: ['configuration', 'security', 'dependencies'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.warn('Config file analysis failed:', error);
    }
    
    return issues;
  }

  private analyzeRepositoryBestPractices(repoInfo: any, repoUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    // Repository structure and naming analysis
    if (repoInfo.repo) {
      // Check for descriptive repository name
      if (repoInfo.repo.length < 3) {
        issues.push({
          id: `repo_naming_${Date.now()}`,
          title: 'Repository Naming Convention',
          description: 'Repository name is very short and may not be descriptive.',
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: repoUrl,
          lineNumber: 1,
          codeSnippet: `Repository name: ${repoInfo.repo}`,
          impact: 'Short or unclear repository names reduce discoverability and understanding',
          recommendation: 'Use descriptive, kebab-case repository names that clearly indicate the project purpose',
          resolutionSteps: [
            {
              step: 1,
              title: 'Improve Repository Name',
              description: 'Rename repository to be more descriptive of its purpose'
            }
          ],
          tags: ['naming', 'best-practices', 'repository'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Check for common patterns that might indicate issues
      if (repoInfo.repo.includes('test') || repoInfo.repo.includes('temp')) {
        issues.push({
          id: `repo_temporary_${Date.now()}`,
          title: 'Potentially Temporary Repository',
          description: 'Repository name suggests it might be temporary or for testing.',
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: repoUrl,
          lineNumber: 1,
          codeSnippet: `Repository name: ${repoInfo.repo}`,
          impact: 'Temporary repositories may contain unfinished or low-quality code',
          recommendation: 'Ensure this is not a temporary repository or rename appropriately',
          resolutionSteps: [
            {
              step: 1,
              title: 'Repository Purpose Review',
              description: 'Confirm if this is production code or experimental'
            }
          ],
          tags: ['temporary', 'repository', 'naming'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Platform-specific best practices
    if (repoInfo.platform === 'github') {
      issues.push({
        id: `github_best_practices_${Date.now()}`,
        title: 'GitHub Best Practices Reminder',
        description: 'Ensure GitHub repository follows best practices for documentation, licensing, and security.',
        severity: 'low',
        type: 'documentation',
        status: 'open',
        filePath: repoUrl,
        lineNumber: 1,
        codeSnippet: `GitHub repository: ${repoInfo.owner}/${repoInfo.repo}`,
        impact: 'Missing documentation and security features reduce project quality and security',
        recommendation: 'Add README, LICENSE, security policy, and enable security features',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add Documentation',
            description: 'Ensure README.md, LICENSE, and CONTRIBUTING.md files exist'
          },
          {
            step: 2,
            title: 'Security Features',
            description: 'Enable Dependabot, security advisories, and branch protection'
          },
          {
            step: 3,
            title: 'Issue Templates',
            description: 'Add issue and pull request templates for better collaboration'
          }
        ],
        tags: ['github', 'best-practices', 'documentation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return issues;
  }
}

export const codeAnalyzer = new CodeAnalyzer(); 