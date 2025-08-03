import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import * as cheerio from 'cheerio';

const execAsync = promisify(exec);

export interface CodeIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'security' | 'performance' | 'quality' | 'documentation';
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

export class CodeAnalyzer {
  private supportedLanguages = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', 
    '.html', '.css', '.json', '.xml', '.md', '.txt'
  ];

  async analyzeGitRepository(repoUrl: string, analysisConfig: any): Promise<AnalysisResult> {
    const tempDir = path.join(process.cwd(), 'temp', `repo_${Date.now()}`);
    
    try {
      // Clone repository
      await execAsync(`git clone ${repoUrl} ${tempDir}`);
      
      // Analyze the cloned repository
      const result = await this.analyzeLocalCodebase(tempDir, analysisConfig);
      
      // Cleanup
      await execAsync(`rm -rf ${tempDir}`);
      
      return result;
    } catch (error) {
      console.error('Error analyzing Git repository:', error);
      throw new Error('Failed to analyze Git repository');
    }
  }

  async analyzeWebUrl(webUrl: string, analysisConfig: any): Promise<AnalysisResult> {
    try {
      // Fetch the webpage
      const response = await axios.get(webUrl);
      const html = response.data;
      const $ = cheerio.load(html);
      
      const issues: CodeIssue[] = [];
      
      // Analyze HTML structure
      issues.push(...this.analyzeHTMLStructure($, webUrl));
      
      // Analyze JavaScript (inline and external)
      issues.push(...this.analyzeJavaScript($, webUrl));
      
      // Analyze CSS
      issues.push(...this.analyzeCSS($, webUrl));
      
      // Security analysis
      if (analysisConfig.securityScan) {
        issues.push(...this.analyzeSecurity($, webUrl));
      }
      
      // Performance analysis
      if (analysisConfig.performanceAnalysis) {
        issues.push(...this.analyzePerformance($, webUrl));
      }
      
      return {
        issues,
        summary: this.generateSummary(issues),
        filesAnalyzed: 1,
        linesOfCode: html.split('\n').length,
        analysisTime: Date.now()
      };
    } catch (error) {
      console.error('Error analyzing web URL:', error);
      throw new Error('Failed to analyze web URL');
    }
  }

  async analyzeLocalCodebase(codebasePath: string, analysisConfig: any): Promise<AnalysisResult> {
    const issues: CodeIssue[] = [];
    let filesAnalyzed = 0;
    let linesOfCode = 0;
    
    try {
      const files = this.getAllFiles(codebasePath);
      
      for (const file of files) {
        if (this.isSupportedFile(file)) {
          const fileIssues = await this.analyzeFile(file, analysisConfig);
          issues.push(...fileIssues);
          filesAnalyzed++;
          
          // Count lines of code
          const content = fs.readFileSync(file, 'utf-8');
          linesOfCode += content.split('\n').length;
        }
      }
      
      return {
        issues,
        summary: this.generateSummary(issues),
        filesAnalyzed,
        linesOfCode,
        analysisTime: Date.now()
      };
    } catch (error) {
      console.error('Error analyzing local codebase:', error);
      throw new Error('Failed to analyze local codebase');
    }
  }

  private getAllFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !this.isIgnoredDirectory(item)) {
        files.push(...this.getAllFiles(fullPath));
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private isIgnoredDirectory(dirName: string): boolean {
    const ignoredDirs = [
      'node_modules', '.git', '.svn', '.hg', 'dist', 'build', 
      'coverage', '.next', '.nuxt', '.cache', 'temp', 'tmp'
    ];
    return ignoredDirs.includes(dirName);
  }

  private isSupportedFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedLanguages.includes(ext);
  }

  private async analyzeFile(filePath: string, analysisConfig: any): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const ext = path.extname(filePath).toLowerCase();
    
    // Security analysis
    if (analysisConfig.securityScan) {
      issues.push(...this.detectSecurityIssues(filePath, lines, ext));
    }
    
    // Performance analysis
    if (analysisConfig.performanceAnalysis) {
      issues.push(...this.detectPerformanceIssues(filePath, lines, ext));
    }
    
    // Code quality analysis
    if (analysisConfig.codeQuality) {
      issues.push(...this.detectQualityIssues(filePath, lines, ext));
    }
    
    // Documentation analysis
    if (analysisConfig.documentationCheck) {
      issues.push(...this.detectDocumentationIssues(filePath, lines, ext));
    }
    
    return issues;
  }

  private detectSecurityIssues(filePath: string, lines: string[], ext: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // SQL Injection detection
      if (this.containsSQLInjection(line)) {
        issues.push({
          id: `security_${filePath}_${lineNumber}`,
          title: 'SQL Injection Vulnerability',
          description: 'User input is directly concatenated into SQL queries without proper sanitization.',
          severity: 'critical',
          type: 'security',
          status: 'open',
          filePath,
          lineNumber,
          codeSnippet: this.getCodeSnippet(lines, i),
          impact: 'This vulnerability could allow attackers to execute arbitrary SQL commands, potentially leading to data theft, modification, or deletion.',
          recommendation: 'Use parameterized queries or an ORM to prevent SQL injection attacks.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Replace string concatenation with parameterized queries',
              description: 'Use placeholders and bind parameters instead of string concatenation.',
              codeExample: `// Instead of:
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// Use:
const query = 'SELECT * FROM users WHERE id = ?';
const params = [userId];`,
              language: ext === '.js' || ext === '.jsx' ? 'javascript' : 'typescript'
            }
          ],
          tags: ['sql-injection', 'security', 'critical'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // XSS detection
      if (this.containsXSS(line)) {
        issues.push({
          id: `security_${filePath}_${lineNumber}`,
          title: 'Cross-Site Scripting (XSS) Vulnerability',
          description: 'User input is directly inserted into HTML without proper sanitization.',
          severity: 'high',
          type: 'security',
          status: 'open',
          filePath,
          lineNumber,
          codeSnippet: this.getCodeSnippet(lines, i),
          impact: 'This vulnerability could allow attackers to inject malicious scripts that execute in users\' browsers.',
          recommendation: 'Sanitize all user input before rendering it in HTML.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Sanitize user input',
              description: 'Use HTML encoding or a sanitization library to clean user input.',
              codeExample: `// Instead of:
element.innerHTML = userInput;

// Use:
element.textContent = userInput;
// or
element.innerHTML = sanitizeHtml(userInput);`,
              language: ext === '.js' || ext === '.jsx' ? 'javascript' : 'typescript'
            }
          ],
          tags: ['xss', 'security', 'high'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    return issues;
  }

  private detectPerformanceIssues(filePath: string, lines: string[], ext: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Memory leak detection
      if (this.containsMemoryLeak(line)) {
        issues.push({
          id: `performance_${filePath}_${lineNumber}`,
          title: 'Potential Memory Leak',
          description: 'Event listeners or timers are not properly cleaned up.',
          severity: 'high',
          type: 'performance',
          status: 'open',
          filePath,
          lineNumber,
          codeSnippet: this.getCodeSnippet(lines, i),
          impact: 'Memory leaks can cause the application to consume increasing amounts of memory over time.',
          recommendation: 'Always clean up event listeners and timers when components unmount.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Add cleanup in useEffect return function',
              description: 'Return a cleanup function from useEffect to remove event listeners.',
              codeExample: `useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);`,
              language: 'javascript'
            }
          ],
          tags: ['memory-leak', 'performance', 'high'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    return issues;
  }

  private detectQualityIssues(filePath: string, lines: string[], ext: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Missing error handling
      if (this.containsMissingErrorHandling(line)) {
        issues.push({
          id: `quality_${filePath}_${lineNumber}`,
          title: 'Missing Error Handling',
          description: 'API calls or operations lack proper error handling.',
          severity: 'medium',
          type: 'quality',
          status: 'open',
          filePath,
          lineNumber,
          codeSnippet: this.getCodeSnippet(lines, i),
          impact: 'Unhandled errors can cause the application to crash or behave unexpectedly.',
          recommendation: 'Wrap API calls and operations in try-catch blocks.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Add try-catch block',
              description: 'Wrap the operation in a try-catch block to handle potential errors.',
              codeExample: `// Instead of:
const response = await fetch(url);
const data = await response.json();

// Use:
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  const data = await response.json();
} catch (error) {
  console.error('Error fetching data:', error);
  // Handle error appropriately
}`,
              language: 'javascript'
            }
          ],
          tags: ['error-handling', 'quality', 'medium'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    return issues;
  }

  private detectDocumentationIssues(filePath: string, lines: string[], ext: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    // Check if file has documentation
    const hasDocumentation = lines.some(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*') ||
      line.trim().startsWith('#')
    );
    
    if (!hasDocumentation && lines.length > 10) {
      issues.push({
        id: `documentation_${filePath}`,
        title: 'Missing Documentation',
        description: 'This file lacks proper documentation and comments.',
        severity: 'low',
        type: 'documentation',
        status: 'open',
        filePath,
        lineNumber: 1,
        codeSnippet: lines.slice(0, 5).join('\n'),
        impact: 'Poor documentation makes the code harder to understand and maintain.',
        recommendation: 'Add comprehensive documentation including file purpose, function descriptions, and inline comments.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add file header documentation',
            description: 'Add a comment block at the top of the file explaining its purpose.',
            codeExample: `/**
 * @fileoverview Description of what this file does
 * @author Your Name
 * @date 2024-01-15
 */

// Rest of your code...`,
            language: 'javascript'
          }
        ],
        tags: ['documentation', 'maintainability', 'low'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return issues;
  }

  private containsSQLInjection(line: string): boolean {
    const sqlPatterns = [
      /\$\{.*\}/, // Template literals with variables
      /\+.*\+/, // String concatenation
      /SELECT.*WHERE.*=.*\$\{/, // SQL with variable injection
      /INSERT.*VALUES.*\$\{/, // INSERT with variable injection
      /UPDATE.*SET.*=.*\$\{/, // UPDATE with variable injection
      /DELETE.*WHERE.*=.*\$\{/ // DELETE with variable injection
    ];
    
    return sqlPatterns.some(pattern => pattern.test(line));
  }

  private containsXSS(line: string): boolean {
    const xssPatterns = [
      /\.innerHTML\s*=/, // innerHTML assignment
      /\.outerHTML\s*=/, // outerHTML assignment
      /document\.write\(/, // document.write
      /eval\(/, // eval function
      /innerHTML.*\+.*\$\{/ // innerHTML with template literals
    ];
    
    return xssPatterns.some(pattern => pattern.test(line));
  }

  private containsMemoryLeak(line: string): boolean {
    const memoryLeakPatterns = [
      /addEventListener\(.*\)/, // Event listeners
      /setInterval\(/, // setInterval
      /setTimeout\(/, // setTimeout
      /new\s+EventTarget\(/, // EventTarget
      /\.on\w+\s*=/ // Event handlers
    ];
    
    return memoryLeakPatterns.some(pattern => pattern.test(line));
  }

  private containsMissingErrorHandling(line: string): boolean {
    const errorHandlingPatterns = [
      /fetch\(/, // fetch calls
      /axios\./, // axios calls
      /\.then\(/, // Promise chains
      /await\s+\w+\(/, // await calls
      /JSON\.parse\(/, // JSON parsing
      /fs\.readFileSync\(/, // File operations
    ];
    
    return errorHandlingPatterns.some(pattern => pattern.test(line));
  }

  private getCodeSnippet(lines: string[], lineIndex: number): string {
    const start = Math.max(0, lineIndex - 2);
    const end = Math.min(lines.length, lineIndex + 3);
    return lines.slice(start, end).join('\n');
  }

  private generateSummary(issues: CodeIssue[]): any {
    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highIssues: issues.filter(i => i.severity === 'high').length,
      mediumIssues: issues.filter(i => i.severity === 'medium').length,
      lowIssues: issues.filter(i => i.severity === 'low').length,
      securityIssues: issues.filter(i => i.type === 'security').length,
      performanceIssues: issues.filter(i => i.type === 'performance').length,
      qualityIssues: issues.filter(i => i.type === 'quality').length,
      documentationIssues: issues.filter(i => i.type === 'documentation').length,
    };
  }

  private analyzeHTMLStructure($: cheerio.CheerioAPI, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    // Check for missing alt attributes
    $('img').each((index, element) => {
      if (!$(element).attr('alt')) {
        issues.push({
          id: `accessibility_${webUrl}_img_${index}`,
          title: 'Missing Alt Attribute',
          description: 'Image element lacks alt attribute for accessibility.',
          severity: 'medium',
          type: 'quality',
          status: 'open',
          filePath: webUrl,
          lineNumber: 1,
          codeSnippet: $(element).toString(),
          impact: 'Screen readers cannot describe the image to visually impaired users.',
          recommendation: 'Add descriptive alt attributes to all images.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Add alt attribute',
              description: 'Add a descriptive alt attribute to the image.',
              codeExample: `<img src="image.jpg" alt="Description of the image" />`,
              language: 'html'
            }
          ],
          tags: ['accessibility', 'html', 'medium'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    return issues;
  }

  private analyzeJavaScript($: cheerio.CheerioAPI, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    // Analyze inline scripts
    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent) {
        const lines = scriptContent.split('\n');
        issues.push(...this.detectSecurityIssues(webUrl, lines, '.js'));
        issues.push(...this.detectPerformanceIssues(webUrl, lines, '.js'));
        issues.push(...this.detectQualityIssues(webUrl, lines, '.js'));
      }
    });
    
    return issues;
  }

  private analyzeCSS($: cheerio.CheerioAPI, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    // Analyze inline styles
    $('style').each((index, element) => {
      const styleContent = $(element).html();
      if (styleContent) {
        // Check for important overuse
        const importantCount = (styleContent.match(/!important/g) || []).length;
        if (importantCount > 5) {
          issues.push({
            id: `css_${webUrl}_important_${index}`,
            title: 'Excessive Use of !important',
            description: 'CSS contains too many !important declarations.',
            severity: 'medium',
            type: 'quality',
            status: 'open',
            filePath: webUrl,
            lineNumber: 1,
            codeSnippet: styleContent,
            impact: 'Overuse of !important makes CSS harder to maintain and debug.',
            recommendation: 'Use more specific selectors instead of !important.',
            resolutionSteps: [
              {
                step: 1,
                title: 'Replace !important with specific selectors',
                description: 'Use more specific CSS selectors instead of !important.',
                codeExample: `/* Instead of: */
.button { color: red !important; }

/* Use: */
.container .button { color: red; }`,
                language: 'css'
              }
            ],
            tags: ['css', 'maintainability', 'medium'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    });
    
    return issues;
  }

  private analyzeSecurity($: cheerio.CheerioAPI, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    // Check for missing security headers
    const metaTags = $('meta');
    const hasCSP = metaTags.filter((_, el) => 
      $(el).attr('http-equiv') === 'Content-Security-Policy'
    ).length > 0;
    
    if (!hasCSP) {
      issues.push({
        id: `security_${webUrl}_csp`,
        title: 'Missing Content Security Policy',
        description: 'No Content Security Policy header found.',
        severity: 'high',
        type: 'security',
        status: 'open',
        filePath: webUrl,
        lineNumber: 1,
        codeSnippet: '<head>...</head>',
        impact: 'Without CSP, the site is vulnerable to XSS attacks.',
        recommendation: 'Add a Content Security Policy header.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add CSP meta tag',
            description: 'Add a Content Security Policy meta tag to the head section.',
            codeExample: `<meta http-equiv="Content-Security-Policy" content="default-src 'self'">`,
            language: 'html'
          }
        ],
        tags: ['security', 'csp', 'high'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return issues;
  }

  private analyzePerformance($: cheerio.CheerioAPI, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    // Check for unoptimized images
    $('img').each((index, element) => {
      const src = $(element).attr('src');
      if (src && !src.includes('optimized') && !src.includes('compressed')) {
        issues.push({
          id: `performance_${webUrl}_image_${index}`,
          title: 'Unoptimized Image',
          description: 'Image may not be optimized for web delivery.',
          severity: 'low',
          type: 'performance',
          status: 'open',
          filePath: webUrl,
          lineNumber: 1,
          codeSnippet: $(element).toString(),
          impact: 'Large images can slow down page loading times.',
          recommendation: 'Optimize images for web delivery.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Optimize image',
              description: 'Compress and resize the image for web delivery.',
              codeExample: `<!-- Use optimized image formats like WebP -->
<img src="image.webp" alt="Description" />`,
              language: 'html'
            }
          ],
          tags: ['performance', 'images', 'low'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    return issues;
  }
}

export const codeAnalyzer = new CodeAnalyzer(); 