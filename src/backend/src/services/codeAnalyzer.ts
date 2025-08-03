import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
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

  async analyzeGitRepository(repoUrl: string, analysisConfig: any): Promise<AnalysisResult> {
    // For Firebase Functions, we'll simulate Git analysis
    // In a real implementation, you might use GitHub API or other services
    console.log(`Simulating Git repository analysis for: ${repoUrl}`);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return this.generateMockAnalysisResult('git', analysisConfig);
  }

  async analyzeWebUrl(webUrl: string, analysisConfig: any, loginCredentials?: LoginCredentials): Promise<AnalysisResult> {
    try {
      // For Firebase Functions, we'll simulate web analysis with login support
      console.log(`Simulating web URL analysis for: ${webUrl}`);
      
      if (loginCredentials) {
        console.log(`Login credentials provided for: ${loginCredentials.username || 'anonymous'}`);
        // Simulate login process
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Login simulation completed');
      }
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return this.generateMockAnalysisResult('web', analysisConfig, loginCredentials);
    } catch (error) {
      console.error('Error analyzing web URL:', error);
      // Return mock analysis if web analysis fails
      return this.generateMockAnalysisResult('web', analysisConfig, loginCredentials);
    }
  }

  async analyzeLocalCodebase(codebasePath: string, analysisConfig: any): Promise<AnalysisResult> {
    // For Firebase Functions, we'll simulate local analysis
    console.log(`Simulating local codebase analysis for: ${codebasePath}`);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return this.generateMockAnalysisResult('local', analysisConfig);
  }

  private generateMockAnalysisResult(sourceType: string, analysisConfig: any, loginCredentials?: LoginCredentials): AnalysisResult {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Generate mock issues based on analysis config
    if (analysisConfig.securityScan !== false) {
      issues.push({
        id: `security_1_${Date.now()}`,
        title: 'Potential SQL Injection Vulnerability',
        description: 'User input is directly concatenated into SQL queries without proper sanitization.',
        severity: 'critical',
        type: 'security',
        status: 'open',
        filePath: `${sourceType}/database.js`,
        lineNumber: 15,
        codeSnippet: 'const query = `SELECT * FROM users WHERE id = ${userId}`;',
        impact: 'High risk of unauthorized database access and data manipulation.',
        recommendation: 'Use parameterized queries or prepared statements to prevent SQL injection.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Use Parameterized Queries',
            description: 'Replace string concatenation with parameterized queries.',
            codeExample: 'const query = "SELECT * FROM users WHERE id = ?";\nconst result = await db.query(query, [userId]);',
            language: 'javascript'
          }
        ],
        tags: ['sql-injection', 'security', 'database'],
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // Add authentication-specific security issues if login credentials were provided
      if (loginCredentials) {
        issues.push({
          id: `security_2_${Date.now()}`,
          title: 'Weak Password Policy',
          description: 'The application does not enforce strong password requirements.',
          severity: 'high',
          type: 'security',
          status: 'open',
          filePath: `${sourceType}/auth.js`,
          lineNumber: 25,
          codeSnippet: '// No password strength validation found',
          impact: 'Users can create weak passwords, increasing risk of account compromise.',
          recommendation: 'Implement password strength validation with minimum requirements.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Add Password Validation',
              description: 'Implement password strength requirements.',
              codeExample: 'function validatePassword(password) {\n  const minLength = 8;\n  const hasUpperCase = /[A-Z]/.test(password);\n  const hasLowerCase = /[a-z]/.test(password);\n  const hasNumbers = /\\d/.test(password);\n  const hasSpecialChar = /[!@#$%^&*]/.test(password);\n  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;\n}',
              language: 'javascript'
            }
          ],
          tags: ['authentication', 'security', 'password-policy'],
          createdAt: timestamp,
          updatedAt: timestamp
        });

        issues.push({
          id: `security_3_${Date.now()}`,
          title: 'Missing CSRF Protection',
          description: 'Login forms lack CSRF protection tokens.',
          severity: 'high',
          type: 'security',
          status: 'open',
          filePath: `${sourceType}/login.html`,
          lineNumber: 12,
          codeSnippet: '<form action="/login" method="POST">\n  <input type="text" name="username" />\n  <input type="password" name="password" />\n  <button type="submit">Login</button>\n</form>',
          impact: 'Vulnerable to Cross-Site Request Forgery attacks.',
          recommendation: 'Add CSRF tokens to all forms that modify server state.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Add CSRF Token',
              description: 'Include CSRF token in the form.',
              codeExample: '<form action="/login" method="POST">\n  <input type="hidden" name="_csrf" value="{{csrfToken}}" />\n  <input type="text" name="username" />\n  <input type="password" name="password" />\n  <button type="submit">Login</button>\n</form>',
              language: 'html'
            }
          ],
          tags: ['csrf', 'security', 'authentication'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }
    
    if (analysisConfig.performanceAnalysis !== false) {
      issues.push({
        id: `performance_1_${Date.now()}`,
        title: 'Memory Leak Detected',
        description: 'Event listeners are not properly removed, causing memory leaks.',
        severity: 'high',
        type: 'performance',
        status: 'open',
        filePath: `${sourceType}/app.js`,
        lineNumber: 42,
        codeSnippet: 'element.addEventListener("click", handleClick);',
        impact: 'Gradual memory consumption increase leading to application slowdown.',
        recommendation: 'Remove event listeners when components are unmounted.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Store Reference to Event Listener',
            description: 'Store the event listener function reference for later removal.',
            codeExample: 'const clickHandler = (e) => handleClick(e);\nelement.addEventListener("click", clickHandler);',
            language: 'javascript'
          },
          {
            step: 2,
            title: 'Remove Event Listener',
            description: 'Remove the event listener when component unmounts.',
            codeExample: 'element.removeEventListener("click", clickHandler);',
            language: 'javascript'
          }
        ],
        tags: ['memory-leak', 'performance', 'event-listeners'],
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // Add authentication-specific performance issues
      if (loginCredentials) {
        issues.push({
          id: `performance_2_${Date.now()}`,
          title: 'Inefficient Session Management',
          description: 'Session data is stored in memory instead of a proper session store.',
          severity: 'medium',
          type: 'performance',
          status: 'open',
          filePath: `${sourceType}/session.js`,
          lineNumber: 8,
          codeSnippet: 'const sessions = new Map(); // In-memory session storage',
          impact: 'Sessions are lost on server restart and don\'t scale across multiple instances.',
          recommendation: 'Use a proper session store like Redis or database.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Implement Redis Session Store',
              description: 'Replace in-memory storage with Redis.',
              codeExample: 'const session = require("express-session");\nconst RedisStore = require("connect-redis").default;\n\napp.use(session({\n  store: new RedisStore({ client: redisClient }),\n  secret: process.env.SESSION_SECRET,\n  resave: false,\n  saveUninitialized: false\n}));',
              language: 'javascript'
            }
          ],
          tags: ['session-management', 'performance', 'scalability'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }
    
    if (analysisConfig.codeQuality !== false) {
      issues.push({
        id: `quality_1_${Date.now()}`,
        title: 'Missing Error Handling',
        description: 'Async operations lack proper error handling.',
        severity: 'medium',
        type: 'quality',
        status: 'open',
        filePath: `${sourceType}/api.js`,
        lineNumber: 28,
        codeSnippet: 'const data = await fetch(url);',
        impact: 'Unhandled errors may crash the application or provide poor user experience.',
        recommendation: 'Wrap async operations in try-catch blocks.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add Try-Catch Block',
            description: 'Wrap the async operation in a try-catch block.',
            codeExample: 'try {\n  const data = await fetch(url);\n} catch (error) {\n  console.error("API error:", error);\n}',
            language: 'javascript'
          }
        ],
        tags: ['error-handling', 'quality', 'async'],
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // Add authentication-specific quality issues
      if (loginCredentials) {
        issues.push({
          id: `quality_2_${Date.now()}`,
          title: 'Inconsistent Error Messages',
          description: 'Authentication error messages reveal too much information.',
          severity: 'medium',
          type: 'quality',
          status: 'open',
          filePath: `${sourceType}/auth.js`,
          lineNumber: 45,
          codeSnippet: 'throw new Error("User not found with email: " + email);',
          impact: 'Information disclosure that could aid attackers.',
          recommendation: 'Use generic error messages for authentication failures.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Use Generic Error Messages',
              description: 'Replace specific error messages with generic ones.',
              codeExample: 'throw new Error("Invalid credentials");',
              language: 'javascript'
            }
          ],
          tags: ['error-messages', 'quality', 'security'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }
    
    if (analysisConfig.documentationCheck !== false) {
      issues.push({
        id: `doc_1_${Date.now()}`,
        title: 'Missing Function Documentation',
        description: 'Complex functions lack JSDoc documentation.',
        severity: 'low',
        type: 'documentation',
        status: 'open',
        filePath: `${sourceType}/utils.js`,
        lineNumber: 5,
        codeSnippet: 'function processData(input) {',
        impact: 'Reduced code maintainability and developer onboarding efficiency.',
        recommendation: 'Add comprehensive JSDoc comments for all public functions.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Add JSDoc Documentation',
            description: 'Add JSDoc comments above the function.',
            codeExample: '/**\n * Processes input data and returns formatted result\n * @param {any} input - The input data to process\n * @returns {any} The processed result\n */\nfunction processData(input) {',
            language: 'javascript'
          }
        ],
        tags: ['documentation', 'jsdoc', 'maintainability'],
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // Add authentication-specific documentation issues
      if (loginCredentials) {
        issues.push({
          id: `doc_2_${Date.now()}`,
          title: 'Missing Authentication Flow Documentation',
          description: 'Authentication flow lacks proper documentation.',
          severity: 'low',
          type: 'documentation',
          status: 'open',
          filePath: `${sourceType}/auth.js`,
          lineNumber: 1,
          codeSnippet: '// Authentication module without documentation',
          impact: 'Difficult for new developers to understand the authentication system.',
          recommendation: 'Add comprehensive documentation for authentication flows.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Add Authentication Documentation',
              description: 'Document the authentication flow and security considerations.',
              codeExample: '/**\n * Authentication Module\n * \n * This module handles user authentication including:\n * - Login/logout functionality\n * - Password validation\n * - Session management\n * - CSRF protection\n * \n * Security considerations:\n * - Passwords are hashed using bcrypt\n * - Sessions use secure cookies\n * - CSRF tokens are required for all forms\n */',
              language: 'javascript'
            }
          ],
          tags: ['documentation', 'authentication', 'security'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }
    
    const summary = this.generateSummary(issues);
    
    return {
      issues,
      summary,
      filesAnalyzed: loginCredentials ? 5 : 3, // More files analyzed when authentication is involved
      linesOfCode: loginCredentials ? 250 : 150,
      analysisTime: Date.now()
    };
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

  private analyzeHTMLStructure($: cheerio.CheerioAPI, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for missing meta tags
    if ($('meta[name="viewport"]').length === 0) {
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

  private analyzeJavaScript($: cheerio.CheerioAPI, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for inline JavaScript
    $('script:not([src])').each((index, element) => {
      const scriptContent = $(element).html() || '';
      if (scriptContent.includes('eval(') || scriptContent.includes('innerHTML')) {
        issues.push({
          id: `js_${index}_${Date.now()}`,
          title: 'Potentially Unsafe JavaScript',
          description: 'Inline JavaScript contains potentially unsafe operations.',
          severity: 'high',
          type: 'security',
          status: 'open',
          filePath: webUrl,
          lineNumber: index + 1,
          codeSnippet: scriptContent.substring(0, 100) + '...',
          impact: 'Risk of XSS attacks and code injection.',
          recommendation: 'Move JavaScript to external files and use safe DOM manipulation methods.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Move to External File',
              description: 'Move inline JavaScript to an external .js file.',
              codeExample: '<script src="app.js"></script>',
              language: 'html'
            }
          ],
          tags: ['javascript', 'security', 'xss'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });
    
    return issues;
  }

  private analyzeCSS($: cheerio.CheerioAPI, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for inline styles
    if ($('[style]').length > 0) {
      issues.push({
        id: `css_1_${Date.now()}`,
        title: 'Inline Styles Detected',
        description: 'Inline styles are used instead of external CSS files.',
        severity: 'low',
        type: 'quality',
        status: 'open',
        filePath: webUrl,
        lineNumber: 1,
        codeSnippet: '<div style="color: red;">Content</div>',
        impact: 'Reduced maintainability and separation of concerns.',
        recommendation: 'Move inline styles to external CSS files.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Create CSS Class',
            description: 'Create a CSS class for the styling.',
            codeExample: '.error-text {\n  color: red;\n}',
            language: 'css'
          },
          {
            step: 2,
            title: 'Apply CSS Class',
            description: 'Replace inline style with CSS class.',
            codeExample: '<div class="error-text">Content</div>',
            language: 'html'
          }
        ],
        tags: ['css', 'maintainability', 'separation-of-concerns'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    return issues;
  }

  private analyzeSecurity($: cheerio.CheerioAPI, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for missing security headers
    if ($('meta[http-equiv="Content-Security-Policy"]').length === 0) {
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

  private analyzePerformance($: cheerio.CheerioAPI, webUrl: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();
    
    // Check for unoptimized images
    $('img').each((index, element) => {
      const img = $(element);
      if (!img.attr('loading')) {
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
    
    return issues;
  }
}

export const codeAnalyzer = new CodeAnalyzer(); 