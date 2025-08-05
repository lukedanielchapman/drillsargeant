import * as fs from 'fs';
import * as path from 'path';
import * as yauzl from 'yauzl';
import * as mimeTypes from 'mime-types';
import { promisify } from 'util';
import { codeAnalyzer, CodeIssue, AnalysisConfig } from './codeAnalyzer';

export interface FileAnalysisResult {
  projectId: string;
  totalFiles: number;
  analyzedFiles: number;
  issues: CodeIssue[];
  analysisTime: number;
  fileTypes: Record<string, number>;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  };
}

export interface UploadedFile {
  originalName: string;
  content: Buffer;
  mimeType: string;
  size: number;
}

export class FileProcessor {
  private supportedExtensions = new Set([
    '.js', '.jsx', '.ts', '.tsx',
    '.html', '.htm', '.css',
    '.json', '.md', '.txt',
    '.py', '.java', '.c', '.cpp', '.h',
    '.php', '.rb', '.go', '.rs',
    '.vue', '.svelte', '.scss', '.sass', '.less'
  ]);

  // Enhanced directory file processing method
  async processDirectoryFiles(
    files: Array<{path: string, content: string, type: string}>, 
    projectId: string, 
    analysisConfig: AnalysisConfig
  ): Promise<FileAnalysisResult> {
    const startTime = Date.now();
    console.log(`Processing ${files.length} directory files for project ${projectId}`);
    
    const allIssues: CodeIssue[] = [];
    const fileStats: { [key: string]: number } = {};
    let linesOfCode = 0;
    
    try {
      for (const file of files) {
        console.log(`Analyzing: ${file.path} (${file.type})`);
        
        // Count lines
        const lines = file.content.split('\n').length;
        linesOfCode += lines;
        
        // Track file types
        fileStats[file.type] = (fileStats[file.type] || 0) + 1;
        
        // Analyze based on file type
        let fileIssues: CodeIssue[] = [];
        
        switch (file.type) {
          case 'js':
          case 'jsx':
          case 'ts':
          case 'tsx':
            fileIssues = await this.analyzeJavaScriptFile(
              { path: file.path, content: file.content, type: file.type }, 
              projectId, 
              analysisConfig
            );
            break;
            
          case 'css':
          case 'scss':
          case 'sass':
            fileIssues = await this.analyzeCSSFile(
              { path: file.path, content: file.content, type: file.type }, 
              projectId, 
              analysisConfig
            );
            break;
            
          case 'html':
          case 'htm':
            fileIssues = await this.analyzeHTMLFile(
              { path: file.path, content: file.content, type: file.type }, 
              projectId, 
              analysisConfig
            );
            break;
            
          case 'json':
            fileIssues = await this.analyzeJSONFile(
              { path: file.path, content: file.content, type: file.type }, 
              projectId
            );
            break;
            
          case 'md':
            fileIssues = await this.analyzeMarkdownFile(
              { path: file.path, content: file.content, type: file.type }, 
              projectId
            );
            break;
            
          default:
            fileIssues = await this.analyzeFile(
              { path: file.path, content: file.content, type: file.type }, 
              projectId, 
              analysisConfig
            );
        }
        
        allIssues.push(...fileIssues);
      }
      
      // Perform cross-file analysis
      if (analysisConfig.dependencyAnalysis) {
        const dependencyIssues = this.analyzeDependencies(files);
        allIssues.push(...dependencyIssues);
      }
      
      // Generate comprehensive summary
      const summary = this.generateSummary(allIssues);
      
      const analysisTime = Date.now() - startTime;
      console.log(`Directory analysis completed in ${analysisTime}ms: ${allIssues.length} issues found across ${files.length} files`);
      
      return {
        projectId,
        totalFiles: files.length,
        analyzedFiles: files.length,
        issues: allIssues,
        analysisTime,
        fileTypes: fileStats,
        summary
      };
      
    } catch (error) {
      console.error('Directory file processing failed:', error);
      throw new Error(`Directory analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processUploadedFiles(
    files: UploadedFile[],
    projectId: string,
    analysisConfig: AnalysisConfig,
    progressCallback?: (progress: number, message: string) => void
  ): Promise<FileAnalysisResult> {
    const startTime = Date.now();
    const extractedFiles: Array<{path: string, content: string, type: string}> = [];
    
    try {
      console.log(`Processing ${files.length} uploaded files for project ${projectId}`);
      
      // Step 1: Extract files from uploads (handle zip files and individual files)
      let totalExtractionProgress = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressCallback?.(
          (totalExtractionProgress / files.length) * 30, 
          `Extracting ${file.originalName}...`
        );
        
        if (file.originalName.endsWith('.zip')) {
          const zipFiles = await this.extractZipFile(file);
          extractedFiles.push(...zipFiles);
        } else if (this.isSupportedFile(file.originalName)) {
          extractedFiles.push({
            path: file.originalName,
            content: file.content.toString('utf-8'),
            type: this.getFileType(file.originalName)
          });
        }
        
        totalExtractionProgress++;
      }

      console.log(`Extracted ${extractedFiles.length} files for analysis`);
      
      // Step 2: Analyze each extracted file
      const allIssues: CodeIssue[] = [];
      const fileTypes: Record<string, number> = {};
      let analyzedFiles = 0;

      for (let i = 0; i < extractedFiles.length; i++) {
        const file = extractedFiles[i];
        const progressPercent = 30 + ((i / extractedFiles.length) * 60);
        
        progressCallback?.(
          progressPercent, 
          `Analyzing ${file.path} (${file.type})...`
        );

        try {
          // Count file types
          fileTypes[file.type] = (fileTypes[file.type] || 0) + 1;

          // Analyze file based on type
          const fileIssues = await this.analyzeFile(file, projectId, analysisConfig);
          allIssues.push(...fileIssues);
          analyzedFiles++;
          
          console.log(`Analyzed ${file.path}: found ${fileIssues.length} issues`);
          
        } catch (error) {
          console.warn(`Failed to analyze ${file.path}:`, error);
          // Continue with other files even if one fails
        }
      }

      // Step 3: Generate summary
      progressCallback?.(95, 'Generating analysis summary...');
      
      const summary = this.generateSummary(allIssues);
      const analysisTime = Date.now() - startTime;

      console.log(`File analysis completed in ${analysisTime}ms: ${allIssues.length} total issues found`);

      progressCallback?.(100, 'Analysis complete!');

      return {
        projectId,
        totalFiles: extractedFiles.length,
        analyzedFiles,
        issues: allIssues,
        analysisTime,
        fileTypes,
        summary
      };

    } catch (error) {
      console.error('File processing error:', error);
      throw new Error(`File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractZipFile(zipFile: UploadedFile): Promise<Array<{path: string, content: string, type: string}>> {
    return new Promise((resolve, reject) => {
      const extractedFiles: Array<{path: string, content: string, type: string}> = [];
      
      yauzl.fromBuffer(zipFile.content, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(new Error(`Failed to read zip file: ${err.message}`));
          return;
        }

        if (!zipfile) {
          reject(new Error('Invalid zip file'));
          return;
        }

        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          // Skip directories
          if (/\/$/.test(entry.fileName)) {
            zipfile.readEntry();
            return;
          }

          // Skip unsupported files
          if (!this.isSupportedFile(entry.fileName)) {
            zipfile.readEntry();
            return;
          }

          // Skip files that are too large (>1MB per file)
          if (entry.uncompressedSize > 1024 * 1024) {
            console.warn(`Skipping large file: ${entry.fileName} (${entry.uncompressedSize} bytes)`);
            zipfile.readEntry();
            return;
          }

          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              console.warn(`Failed to read ${entry.fileName}:`, err);
              zipfile.readEntry();
              return;
            }

            if (!readStream) {
              zipfile.readEntry();
              return;
            }

            const chunks: Buffer[] = [];
            readStream.on('data', (chunk) => chunks.push(chunk));
            readStream.on('end', () => {
              try {
                const content = Buffer.concat(chunks).toString('utf-8');
                extractedFiles.push({
                  path: entry.fileName,
                  content,
                  type: this.getFileType(entry.fileName)
                });
              } catch (decodeError) {
                console.warn(`Failed to decode ${entry.fileName}:`, decodeError);
              }
              zipfile.readEntry();
            });
            readStream.on('error', (streamError) => {
              console.warn(`Stream error for ${entry.fileName}:`, streamError);
              zipfile.readEntry();
            });
          });
        });

        zipfile.on('end', () => {
          resolve(extractedFiles);
        });

        zipfile.on('error', (zipError) => {
          reject(new Error(`Zip processing error: ${zipError.message}`));
        });
      });
    });
  }

  private async analyzeFile(
    file: {path: string, content: string, type: string}, 
    projectId: string, 
    analysisConfig: AnalysisConfig
  ): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];

    try {
      switch (file.type) {
        case 'javascript':
        case 'typescript':
          // Use our existing JavaScript AST analysis
          const jsIssues = await this.analyzeJavaScriptFile(file, projectId, analysisConfig);
          issues.push(...jsIssues);
          break;

        case 'css':
          // Use our existing CSS AST analysis  
          const cssIssues = await this.analyzeCSSFile(file, projectId, analysisConfig);
          issues.push(...cssIssues);
          break;

        case 'html':
          // Use existing web analysis but for file content
          const htmlIssues = await this.analyzeHTMLFile(file, projectId, analysisConfig);
          issues.push(...htmlIssues);
          break;

        case 'json':
          const jsonIssues = await this.analyzeJSONFile(file, projectId);
          issues.push(...jsonIssues);
          break;

        case 'markdown':
          const markdownIssues = await this.analyzeMarkdownFile(file, projectId);
          issues.push(...markdownIssues);
          break;

        default:
          // Basic text analysis for other file types
          const textIssues = await this.analyzeTextFile(file, projectId);
          issues.push(...textIssues);
          break;
      }

    } catch (error) {
      console.warn(`Analysis failed for ${file.path}:`, error);
      // Add an issue about the analysis failure
      issues.push({
        id: `analysis_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'File Analysis Error',
        description: `Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'low',
        type: 'quality',
        status: 'open',
        filePath: file.path,
        lineNumber: 1,
        codeSnippet: file.content.substring(0, 100) + '...',
        impact: 'File could not be analyzed for potential issues',
        recommendation: 'Check file format and encoding',
        resolutionSteps: [
          {
            step: 1,
            title: 'Verify File Format',
            description: 'Ensure the file is in a supported format and properly encoded'
          }
        ],
        tags: ['analysis', 'error', file.type],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return issues;
  }

  private async analyzeJavaScriptFile(
    file: {path: string, content: string, type: string}, 
    projectId: string, 
    analysisConfig: AnalysisConfig
  ): Promise<CodeIssue[]> {
    // Use the existing JavaScript AST analysis from codeAnalyzer
    // We'll need to adapt it for file content instead of HTML
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    try {
      // REAL JavaScript/TypeScript AST Analysis
      const jsIssues: CodeIssue[] = [];
      
      // Import esprima for JavaScript AST parsing
      const esprima = require('esprima');
      
      try {
        console.log(`Performing real AST analysis on ${file.path}`);
        
        // Parse JavaScript/TypeScript with esprima
        const ast = esprima.parseScript(file.content, {
          range: true,
          loc: true,
          tolerant: true
        });

        // Security Analysis
        jsIssues.push(...this.analyzeJavaScriptSecurity(ast, file, timestamp));
        
        // Code Quality Analysis
        jsIssues.push(...this.analyzeJavaScriptQuality(ast, file, timestamp));
        
        // Performance Analysis
        jsIssues.push(...this.analyzeJavaScriptPerformance(ast, file, timestamp));
        
        // TypeScript-specific analysis
        if (file.type === 'typescript') {
          jsIssues.push(...this.analyzeTypeScriptSpecific(file, timestamp));
        }
        
        console.log(`Found ${jsIssues.length} JavaScript issues in ${file.path}`);
        
      } catch (parseError) {
        console.warn(`JavaScript parsing failed for ${file.path}:`, parseError);
        // Add syntax error issue
        jsIssues.push({
          id: `js_syntax_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'JavaScript Syntax Error',
          description: `Failed to parse JavaScript: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          severity: 'high',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: 1,
          codeSnippet: file.content.substring(0, 100) + '...',
          impact: 'Code will not execute due to syntax errors',
          recommendation: 'Fix JavaScript syntax errors',
          resolutionSteps: [
            {
              step: 1,
              title: 'Fix Syntax Error',
              description: 'Correct the JavaScript syntax error',
              codeExample: 'Use a JavaScript linter to identify syntax issues'
            }
          ],
          tags: ['javascript', 'syntax-error', 'file-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
      
      // Update file paths and add file-specific context
      jsIssues.forEach(issue => {
        issue.filePath = file.path;
        issue.tags = issue.tags?.filter(tag => tag !== 'web-analysis') || [];
        issue.tags.push('file-analysis', file.type);
      });

      issues.push(...jsIssues);

      // Add file-specific analysis
      if (file.content.length > 10000) {
        issues.push({
          id: `file_size_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Large File Size',
          description: `File is ${file.content.length} characters, which may impact maintainability`,
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: 1,
          codeSnippet: file.content.substring(0, 100) + '...',
          impact: 'Large files are harder to maintain and understand',
          recommendation: 'Consider splitting into smaller, focused modules',
          resolutionSteps: [
            {
              step: 1,
              title: 'Refactor Large File',
              description: 'Split large files into smaller, focused modules',
              codeExample: '// Split into multiple files based on functionality\n// Use ES6 modules for better organization'
            }
          ],
          tags: ['file-analysis', 'size', file.type],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

    } catch (error) {
      console.warn(`JavaScript file analysis failed for ${file.path}:`, error);
    }

    return issues;
  }

  private async analyzeCSSFile(
    file: {path: string, content: string, type: string}, 
    projectId: string, 
    analysisConfig: AnalysisConfig
  ): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    try {
      // REAL CSS AST Analysis
      const csstree = require('css-tree');
      
      try {
        console.log(`Performing real CSS AST analysis on ${file.path}`);
        
        const ast = csstree.parse(file.content, {
          onParseError: (error: any) => {
            console.warn(`CSS parsing warning for ${file.path}:`, error);
          }
        });

        // Performance Analysis
        if (analysisConfig.performanceAnalysis !== false) {
          issues.push(...this.analyzeCSSPerformance(ast, file, timestamp));
        }
        
        // Quality Analysis
        if (analysisConfig.qualityCheck !== false) {
          issues.push(...this.analyzeCSSQuality(ast, file, timestamp));
        }
        
        // Accessibility Analysis
        if (analysisConfig.accessibilityCheck === true) {
          issues.push(...this.analyzeCSSAccessibility(ast, file, timestamp));
        }
        
        console.log(`Found ${issues.length} CSS issues in ${file.path}`);
        
      } catch (parseError) {
        console.warn(`CSS parsing failed for ${file.path}:`, parseError);
        // Add syntax error issue
        issues.push({
          id: `css_syntax_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'CSS Syntax Error',
          description: `Failed to parse CSS: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          severity: 'high',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: 1,
          codeSnippet: file.content.substring(0, 100) + '...',
          impact: 'CSS will not render correctly due to syntax errors',
          recommendation: 'Fix CSS syntax errors',
          resolutionSteps: [
            {
              step: 1,
              title: 'Fix Syntax Error',
              description: 'Correct the CSS syntax error using a CSS validator',
              codeExample: 'Use online CSS validators to identify syntax issues'
            }
          ],
          tags: ['css', 'syntax-error', 'file-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    } catch (error) {
      console.warn(`CSS file analysis failed for ${file.path}:`, error);
    }

    return issues;
  }

  private async analyzeHTMLFile(
    file: {path: string, content: string, type: string}, 
    projectId: string, 
    analysisConfig: AnalysisConfig
  ): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    try {
      // REAL HTML AST Analysis
      const htmlparser2 = require('htmlparser2');
      
      try {
        console.log(`Performing real HTML AST analysis on ${file.path}`);
        
        const dom = htmlparser2.parseDocument(file.content, {
          lowerCaseAttributeNames: false,
          recognizeSelfClosing: true
        });

        // Security Analysis
        if (analysisConfig.securityScan !== false) {
          issues.push(...this.analyzeHTMLSecurity(dom, file, timestamp));
        }
        
        // Accessibility Analysis
        if (analysisConfig.accessibilityCheck === true) {
          issues.push(...this.analyzeHTMLAccessibility(dom, file, timestamp));
        }
        
        // SEO Analysis
        if (analysisConfig.seoAnalysis === true) {
          issues.push(...this.analyzeHTMLSEO(dom, file, timestamp));
        }
        
        // Performance Analysis
        if (analysisConfig.performanceAnalysis !== false) {
          issues.push(...this.analyzeHTMLPerformance(dom, file, timestamp));
        }
        
        console.log(`Found ${issues.length} HTML issues in ${file.path}`);
        
      } catch (parseError) {
        console.warn(`HTML parsing failed for ${file.path}:`, parseError);
        // Add syntax error issue
        issues.push({
          id: `html_syntax_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'HTML Syntax Error',
          description: `Failed to parse HTML: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          severity: 'high',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: 1,
          codeSnippet: file.content.substring(0, 100) + '...',
          impact: 'Invalid HTML can cause rendering issues and accessibility problems',
          recommendation: 'Fix HTML syntax errors',
          resolutionSteps: [
            {
              step: 1,
              title: 'Fix Syntax Error',
              description: 'Correct the HTML syntax error using an HTML validator',
              codeExample: 'Use W3C Markup Validator to identify syntax issues'
            }
          ],
          tags: ['html', 'syntax-error', 'file-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    } catch (error) {
      console.warn(`HTML file analysis failed for ${file.path}:`, error);
    }

    return issues;
  }

  private async analyzeJSONFile(
    file: {path: string, content: string, type: string}, 
    projectId: string
  ): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    try {
      // Validate JSON syntax
      JSON.parse(file.content);
      
      // Check for common JSON issues
      if (file.content.includes('\t')) {
        issues.push({
          id: `json_tabs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'JSON Uses Tabs Instead of Spaces',
          description: 'JSON file contains tab characters which may cause parsing issues',
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: 1,
          codeSnippet: file.content.substring(0, 100) + '...',
          impact: 'May cause formatting inconsistencies',
          recommendation: 'Use spaces for indentation in JSON files',
          resolutionSteps: [
            {
              step: 1,
              title: 'Replace Tabs with Spaces',
              description: 'Convert tab characters to spaces for consistent formatting'
            }
          ],
          tags: ['file-analysis', 'json', 'formatting'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

    } catch (jsonError) {
      issues.push({
        id: `json_syntax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Invalid JSON Syntax',
        description: `JSON syntax error: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`,
        severity: 'high',
        type: 'quality',
        status: 'open',
        filePath: file.path,
        lineNumber: 1,
        codeSnippet: file.content.substring(0, 100) + '...',
        impact: 'Invalid JSON will cause runtime errors',
        recommendation: 'Fix JSON syntax errors',
        resolutionSteps: [
          {
            step: 1,
            title: 'Fix JSON Syntax',
            description: 'Correct the JSON syntax error',
            codeExample: 'Use a JSON validator to identify and fix syntax issues'
          }
        ],
        tags: ['file-analysis', 'json', 'syntax-error'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return issues;
  }

  private async analyzeMarkdownFile(
    file: {path: string, content: string, type: string}, 
    projectId: string
  ): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    // Check for common markdown issues
    const lines = file.content.split('\n');
    
    // Check for long lines
    lines.forEach((line, index) => {
      if (line.length > 120) {
        issues.push({
          id: `md_long_line_${index}_${Date.now()}`,
          title: 'Long Line in Markdown',
          description: `Line ${index + 1} exceeds 120 characters`,
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: index + 1,
          codeSnippet: line.substring(0, 100) + '...',
          impact: 'Long lines reduce readability',
          recommendation: 'Break long lines for better readability',
          resolutionSteps: [
            {
              step: 1,
              title: 'Break Long Lines',
              description: 'Split long lines at natural break points'
            }
          ],
          tags: ['file-analysis', 'markdown', 'formatting'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    return issues;
  }

  private async analyzeTextFile(
    file: {path: string, content: string, type: string}, 
    projectId: string
  ): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const timestamp = new Date().toISOString();

    // Basic text file analysis
    if (file.content.length === 0) {
      issues.push({
        id: `empty_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Empty File',
        description: 'File is empty and may be unnecessary',
        severity: 'low',
        type: 'quality',
        status: 'open',
        filePath: file.path,
        lineNumber: 1,
        codeSnippet: '(empty file)',
        impact: 'Empty files may indicate incomplete implementation',
        recommendation: 'Remove empty files or add necessary content',
        resolutionSteps: [
          {
            step: 1,
            title: 'Review Empty File',
            description: 'Determine if file is needed and add content or remove'
          }
        ],
        tags: ['file-analysis', 'empty', file.type],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return issues;
  }

  private isSupportedFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return this.supportedExtensions.has(ext);
  }

  private getFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    
    const typeMapping: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.html': 'html',
      '.htm': 'html',
      '.css': 'css',
      '.scss': 'css',
      '.sass': 'css',
      '.less': 'css',
      '.json': 'json',
      '.md': 'markdown',
      '.txt': 'text',
      '.py': 'python',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.h': 'c',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.vue': 'vue',
      '.svelte': 'svelte'
    };

    return typeMapping[ext] || 'unknown';
  }

  private generateSummary(issues: CodeIssue[]): {
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  } {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byType: {} as Record<string, number>
    };

    issues.forEach(issue => {
      // Count by severity
      summary[issue.severity]++;
      
      // Count by type
      summary.byType[issue.type] = (summary.byType[issue.type] || 0) + 1;
    });

    return summary;
  }

  // ENHANCED JAVASCRIPT ANALYSIS METHODS

  private analyzeJavaScriptSecurity(ast: any, file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Walk the AST to find security vulnerabilities
    this.walkJavaScriptAST(ast, (node: any) => {
      // Critical: eval() usage
      if (node.type === 'CallExpression' && 
          node.callee.type === 'Identifier' && 
          node.callee.name === 'eval') {
        issues.push({
          id: `file_eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'CRITICAL: eval() Function Usage',
          description: 'The eval() function can execute arbitrary code and represents a critical security vulnerability.',
          severity: 'critical',
          type: 'security',
          status: 'open',
          filePath: file.path,
          lineNumber: node.loc?.start?.line || 1,
          codeSnippet: this.extractCodeSnippet(file.content, node.loc?.start?.line || 1, 3),
          impact: 'CRITICAL: Allows arbitrary code execution, potential for complete system compromise.',
          recommendation: 'Remove eval() immediately. Use JSON.parse() for JSON data or implement proper parsing.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Eliminate eval()',
              description: 'Replace eval() with safe alternatives',
              codeExample: '// UNSAFE: eval(userInput)\n// SAFE: JSON.parse(jsonString)\n// SAFE: Function constructor with controlled scope'
            },
            {
              step: 2,
              title: 'Input Validation',
              description: 'Implement strict input validation for any dynamic code execution',
              codeExample: '// Validate input format before processing\nif (!/^[a-zA-Z0-9_]+$/.test(input)) throw new Error("Invalid input");'
            }
          ],
          tags: ['javascript', 'security', 'eval', 'critical', 'cwe-95', 'file-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      // High: innerHTML usage without sanitization
      if (node.type === 'MemberExpression' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'innerHTML') {
        issues.push({
          id: `file_innerHTML_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'XSS Risk: innerHTML Assignment',
          description: 'Direct innerHTML assignment can lead to Cross-Site Scripting (XSS) vulnerabilities.',
          severity: 'high',
          type: 'security',
          status: 'open',
          filePath: file.path,
          lineNumber: node.loc?.start?.line || 1,
          codeSnippet: this.extractCodeSnippet(file.content, node.loc?.start?.line || 1, 3),
          impact: 'XSS vulnerability allowing malicious script injection and data theft.',
          recommendation: 'Use textContent for text or sanitize HTML with DOMPurify library.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Use Safe Alternatives',
              description: 'Replace innerHTML with secure methods',
              codeExample: '// SAFE: element.textContent = userText;\n// SAFE: element.innerHTML = DOMPurify.sanitize(htmlContent);'
            }
          ],
          tags: ['javascript', 'security', 'xss', 'innerHTML', 'cwe-79', 'file-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      // Medium: Hardcoded secrets/passwords
      if (node.type === 'Literal' && typeof node.value === 'string') {
        const value = node.value.toLowerCase();
        if ((value.includes('password') || value.includes('secret') || value.includes('api_key')) && 
            value.length > 8) {
          issues.push({
            id: `file_secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Security: Potential Hardcoded Secret',
            description: 'Hardcoded secrets in source code pose security risks.',
            severity: 'medium',
            type: 'security',
            status: 'open',
            filePath: file.path,
            lineNumber: node.loc?.start?.line || 1,
            codeSnippet: this.extractCodeSnippet(file.content, node.loc?.start?.line || 1, 2),
            impact: 'Exposure of sensitive credentials in source code.',
            recommendation: 'Move secrets to environment variables or secure configuration.',
            resolutionSteps: [
              {
                step: 1,
                title: 'Use Environment Variables',
                description: 'Store secrets in environment variables',
                codeExample: '// const apiKey = process.env.API_KEY;\n// const dbPassword = process.env.DB_PASSWORD;'
              }
            ],
            tags: ['javascript', 'security', 'secrets', 'credentials', 'file-analysis'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      }
    });

    return issues;
  }

  private analyzeJavaScriptQuality(ast: any, file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    let functionCount = 0;
    let totalComplexity = 0;

    this.walkJavaScriptAST(ast, (node: any) => {
      // Function complexity analysis
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        functionCount++;
        
        // Calculate cyclomatic complexity
        const complexity = this.calculateFunctionComplexity(node);
        totalComplexity += complexity;
        
        if (complexity > 10) {
          issues.push({
            id: `file_complexity_${functionCount}_${Date.now()}`,
            title: `High Complexity: ${node.id?.name || 'Anonymous Function'} (${complexity})`,
            description: `Function has cyclomatic complexity of ${complexity}, exceeding recommended limit of 10.`,
            severity: complexity > 20 ? 'high' : 'medium',
            type: 'quality',
            status: 'open',
            filePath: file.path,
            lineNumber: node.loc?.start?.line || 1,
            codeSnippet: this.extractCodeSnippet(file.content, node.loc?.start?.line || 1, 5),
            impact: 'High complexity makes code difficult to understand, test, and maintain.',
            recommendation: 'Refactor into smaller functions with single responsibilities.',
            resolutionSteps: [
              {
                step: 1,
                title: 'Extract Helper Functions',
                description: 'Break complex logic into smaller, focused functions',
                codeExample: '// Extract complex logic:\nfunction processData(data) {\n  return validate(data) && transform(data) && save(data);\n}'
              },
              {
                step: 2,
                title: 'Reduce Nesting',
                description: 'Use early returns to reduce nested if statements',
                codeExample: '// if (!condition) return;\n// Continue with main logic...'
              }
            ],
            tags: ['javascript', 'quality', 'complexity', 'maintainability', 'file-analysis'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }

        // Check for excessive parameters
        const paramCount = node.params?.length || 0;
        if (paramCount > 5) {
          issues.push({
            id: `file_params_${functionCount}_${Date.now()}`,
            title: `Too Many Parameters (${paramCount})`,
            description: `Function has ${paramCount} parameters, exceeding recommended limit of 5.`,
            severity: 'low',
            type: 'quality',
            status: 'open',
            filePath: file.path,
            lineNumber: node.loc?.start?.line || 1,
            codeSnippet: this.extractCodeSnippet(file.content, node.loc?.start?.line || 1, 3),
            impact: 'Functions with many parameters are difficult to use and test.',
            recommendation: 'Use object parameters or split function responsibilities.',
            resolutionSteps: [
              {
                step: 1,
                title: 'Object Parameters',
                description: 'Use object destructuring for multiple parameters',
                codeExample: '// function process({data, options, callback}) {\n//   // Much cleaner than many individual parameters\n// }'
              }
            ],
            tags: ['javascript', 'quality', 'parameters', 'design', 'file-analysis'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      }

      // Detect var usage (should use const/let)
      if (node.type === 'VariableDeclaration' && node.kind === 'var') {
        issues.push({
          id: `file_var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Outdated var Declaration',
          description: 'Using var instead of const/let can lead to scope-related bugs.',
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: node.loc?.start?.line || 1,
          codeSnippet: this.extractCodeSnippet(file.content, node.loc?.start?.line || 1, 2),
          impact: 'Function-scoped variables can cause unexpected behavior.',
          recommendation: 'Use const for constants and let for variables.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Modernize Variable Declarations',
              description: 'Replace var with const/let',
              codeExample: '// const immutableValue = 42;\n// let mutableCounter = 0;'
            }
          ],
          tags: ['javascript', 'quality', 'es6', 'scope', 'file-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      // Detect console.log statements
      if (node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console') {
        issues.push({
          id: `file_console_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Debug Code: Console Statement',
          description: 'Console statements should be removed from production code.',
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: node.loc?.start?.line || 1,
          codeSnippet: this.extractCodeSnippet(file.content, node.loc?.start?.line || 1, 2),
          impact: 'Debug statements in production can expose sensitive information.',
          recommendation: 'Remove console statements or use proper logging framework.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Remove Debug Code',
              description: 'Clean up console statements for production',
              codeExample: '// Use proper logging: logger.debug("debug info");\n// Or remove: // console.log("debug");'
            }
          ],
          tags: ['javascript', 'quality', 'debug', 'production', 'file-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    // Overall file metrics
    if (functionCount > 0) {
      const avgComplexity = totalComplexity / functionCount;
      if (avgComplexity > 8) {
        issues.push({
          id: `file_avg_complexity_${Date.now()}`,
          title: `High Average Complexity (${avgComplexity.toFixed(1)})`,
          description: `File has average cyclomatic complexity of ${avgComplexity.toFixed(1)}, indicating overall complexity issues.`,
          severity: 'medium',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: 1,
          codeSnippet: `File contains ${functionCount} functions with average complexity ${avgComplexity.toFixed(1)}`,
          impact: 'Overall code maintainability and testability concerns.',
          recommendation: 'Consider refactoring multiple functions to reduce overall complexity.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Systematic Refactoring',
              description: 'Review and refactor the most complex functions first',
              codeExample: '// Identify functions with complexity > 10\n// Break them into smaller, focused functions'
            }
          ],
          tags: ['javascript', 'quality', 'complexity', 'file-metrics', 'file-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }

    return issues;
  }

  private analyzeJavaScriptPerformance(ast: any, file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    this.walkJavaScriptAST(ast, (node: any) => {
      // Detect inefficient loops with DOM queries
      if (node.type === 'ForStatement' || node.type === 'WhileStatement' || node.type === 'DoWhileStatement') {
        this.walkJavaScriptAST(node.body, (innerNode: any) => {
          if (innerNode.type === 'CallExpression' &&
              innerNode.callee.type === 'MemberExpression' &&
              innerNode.callee.object.name === 'document') {
            issues.push({
              id: `file_dom_loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: 'Performance: DOM Query in Loop',
              description: 'DOM queries inside loops cause significant performance degradation.',
              severity: 'medium',
              type: 'performance',
              status: 'open',
              filePath: file.path,
              lineNumber: innerNode.loc?.start?.line || 1,
              codeSnippet: this.extractCodeSnippet(file.content, innerNode.loc?.start?.line || 1, 3),
              impact: 'Severe performance impact due to repeated DOM traversal.',
              recommendation: 'Cache DOM elements outside the loop.',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Cache DOM References',
                  description: 'Store DOM element references before the loop',
                  codeExample: '// const element = document.getElementById("myId");\n// for(let i = 0; i < items.length; i++) {\n//   element.style.color = colors[i];\n// }'
                }
              ],
              tags: ['javascript', 'performance', 'dom', 'loop', 'file-analysis'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }
        });
      }

      // Detect large arrays or objects that might impact memory
      if (node.type === 'ArrayExpression' && node.elements.length > 1000) {
        issues.push({
          id: `file_large_array_${Date.now()}`,
          title: 'Performance: Large Array Literal',
          description: `Array with ${node.elements.length} elements may impact memory usage.`,
          severity: 'low',
          type: 'performance',
          status: 'open',
          filePath: file.path,
          lineNumber: node.loc?.start?.line || 1,
          codeSnippet: this.extractCodeSnippet(file.content, node.loc?.start?.line || 1, 2),
          impact: 'Large static arrays can increase memory usage and bundle size.',
          recommendation: 'Consider loading large datasets dynamically or using lazy loading.',
          resolutionSteps: [
            {
              step: 1,
              title: 'Dynamic Loading',
              description: 'Load large datasets from external sources',
              codeExample: '// Load from API or import dynamically\n// const data = await fetch("/api/large-dataset");'
            }
          ],
          tags: ['javascript', 'performance', 'memory', 'array', 'file-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    return issues;
  }

  private analyzeTypeScriptSpecific(file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Check for 'any' type usage
    const anyTypeRegex = /:\s*any\b/g;
    let match;
    while ((match = anyTypeRegex.exec(file.content)) !== null) {
      const lineNumber = file.content.substring(0, match.index).split('\n').length;
      issues.push({
        id: `ts_any_type_${lineNumber}_${Date.now()}`,
        title: 'TypeScript: any Type Usage',
        description: 'Using any type defeats the purpose of TypeScript type checking.',
        severity: 'medium',
        type: 'quality',
        status: 'open',
        filePath: file.path,
        lineNumber,
        codeSnippet: this.extractCodeSnippet(file.content, lineNumber, 2),
        impact: 'Loss of type safety and potential runtime errors.',
        recommendation: 'Use specific types or interfaces instead of any.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Define Proper Types',
            description: 'Replace any with specific types',
            codeExample: '// Instead of: param: any\n// Use: param: string | number | MyInterface'
          }
        ],
        tags: ['typescript', 'quality', 'type-safety', 'file-analysis'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    // Check for @ts-ignore usage
    const tsIgnoreRegex = /@ts-ignore/g;
    while ((match = tsIgnoreRegex.exec(file.content)) !== null) {
      const lineNumber = file.content.substring(0, match.index).split('\n').length;
      issues.push({
        id: `ts_ignore_${lineNumber}_${Date.now()}`,
        title: 'TypeScript: @ts-ignore Usage',
        description: '@ts-ignore suppresses TypeScript errors and should be used sparingly.',
        severity: 'low',
        type: 'quality',
        status: 'open',
        filePath: file.path,
        lineNumber,
        codeSnippet: this.extractCodeSnippet(file.content, lineNumber, 2),
        impact: 'Suppressed type errors may hide real issues.',
        recommendation: 'Fix the underlying type issue instead of suppressing it.',
        resolutionSteps: [
          {
            step: 1,
            title: 'Address Root Cause',
            description: 'Fix the type issue rather than suppressing it',
            codeExample: '// Add proper types or use type assertions\n// (value as SpecificType).method()'
          }
        ],
        tags: ['typescript', 'quality', 'type-suppression', 'file-analysis'],
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return issues;
  }

  // UTILITY METHODS

  private walkJavaScriptAST(node: any, callback: (node: any) => void): void {
    if (!node || typeof node !== 'object') return;
    
    callback(node);
    
    // Recursively walk child nodes
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach(item => this.walkJavaScriptAST(item, callback));
        } else if (child && typeof child === 'object') {
          this.walkJavaScriptAST(child, callback);
        }
      }
    }
  }

  private calculateFunctionComplexity(functionNode: any): number {
    let complexity = 1; // Base complexity
    
    this.walkJavaScriptAST(functionNode, (node: any) => {
      // Decision points that increase complexity
      if (['IfStatement', 'ConditionalExpression', 'SwitchCase', 'WhileStatement', 
           'ForStatement', 'DoWhileStatement', 'CatchClause'].includes(node.type)) {
        complexity++;
      }
      
      // Logical operators
      if (node.type === 'LogicalExpression' && ['||', '&&'].includes(node.operator)) {
        complexity++;
      }
    });
    
    return complexity;
  }

  private extractCodeSnippet(content: string, lineNumber: number, contextLines: number = 2): string {
    const lines = content.split('\n');
    const start = Math.max(0, lineNumber - contextLines - 1);
    const end = Math.min(lines.length, lineNumber + contextLines);
    
    return lines.slice(start, end)
      .map((line, index) => {
        const actualLineNumber = start + index + 1;
        const marker = actualLineNumber === lineNumber ? '>>> ' : '    ';
        return `${marker}${actualLineNumber}: ${line}`;
      })
      .join('\n');
  }

  // HTML ANALYSIS METHODS
  private analyzeHTMLSecurity(dom: any, file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const htmlparser2 = require('htmlparser2');

    try {
      const scripts = htmlparser2.DomUtils.getElementsByTagName('script', dom);
      const links = htmlparser2.DomUtils.getElementsByTagName('a', dom);
      const forms = htmlparser2.DomUtils.getElementsByTagName('form', dom);

      // Check for inline scripts
      scripts.forEach((script: any) => {
        if (script.children && script.children.length > 0) {
          issues.push({
            id: `html_inline_script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Inline JavaScript Detected',
            description: 'Inline JavaScript can be a security risk and violate Content Security Policy.',
            severity: 'medium',
            type: 'security',
            status: 'open',
            filePath: file.path,
            lineNumber: 1,
            codeSnippet: htmlparser2.DomUtils.getOuterHTML(script).substring(0, 100) + '...',
            impact: 'Inline scripts are harder to secure and can be exploited via XSS attacks',
            recommendation: 'Move JavaScript to external files and implement Content Security Policy',
            resolutionSteps: [
              {
                step: 1,
                title: 'Extract Inline Scripts',
                description: 'Move inline JavaScript to external .js files',
                codeExample: '<script src="external-script.js"></script>'
              }
            ],
            tags: ['html', 'security', 'xss'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });

      // Check for potential XSS vulnerabilities in links
      links.forEach((link: any) => {
        const href = link.attribs?.href;
        if (href && href.startsWith('javascript:')) {
          issues.push({
            id: `html_javascript_link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'JavaScript URL in Link',
            description: `Link contains javascript: URL which can be a security risk: "${href}"`,
            severity: 'high',
            type: 'security',
            status: 'open',
            filePath: file.path,
            lineNumber: 1,
            codeSnippet: htmlparser2.DomUtils.getOuterHTML(link),
            impact: 'JavaScript URLs can be exploited for XSS attacks',
            recommendation: 'Use event handlers instead of javascript: URLs',
            resolutionSteps: [
              {
                step: 1,
                title: 'Replace JavaScript URLs',
                description: 'Use onclick handlers or proper event listeners instead',
                codeExample: '<a href="#" onclick="handleClick()">Link</a>'
              }
            ],
            tags: ['html', 'security', 'xss'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });

      // Check forms without CSRF protection
      forms.forEach((form: any) => {
        const method = form.attribs?.method?.toLowerCase();
        if (method === 'post') {
          const inputs = htmlparser2.DomUtils.getElementsByTagName('input', form);
          const hasCsrfToken = inputs.some((input: any) => 
            input.attribs?.name?.includes('csrf') || 
            input.attribs?.name?.includes('token') ||
            input.attribs?.type === 'hidden'
          );
          
          if (!hasCsrfToken) {
            issues.push({
              id: `html_no_csrf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: 'Form Missing CSRF Protection',
              description: 'POST form appears to lack CSRF token protection.',
              severity: 'medium',
              type: 'security',
              status: 'open',
              filePath: file.path,
              lineNumber: 1,
              codeSnippet: htmlparser2.DomUtils.getOuterHTML(form).substring(0, 100) + '...',
              impact: 'Forms without CSRF protection are vulnerable to cross-site request forgery',
              recommendation: 'Add CSRF tokens to all POST forms',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Add CSRF Token',
                  description: 'Include a hidden CSRF token field in the form'
                }
              ],
              tags: ['html', 'security', 'csrf'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }
        }
      });

    } catch (error) {
      console.error('HTML security analysis error:', error);
    }

    return issues;
  }

  private analyzeHTMLAccessibility(dom: any, file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const htmlparser2 = require('htmlparser2');

    try {
      const images = htmlparser2.DomUtils.getElementsByTagName('img', dom);
      const inputs = htmlparser2.DomUtils.getElementsByTagName('input', dom);
      const buttons = htmlparser2.DomUtils.getElementsByTagName('button', dom);

      // Check for images without alt text
      images.forEach((img: any) => {
        if (!img.attribs?.alt) {
          issues.push({
            id: `html_missing_alt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Image Missing Alt Text',
            description: 'Image element lacks alt attribute for screen readers.',
            severity: 'high',
            type: 'accessibility',
            status: 'open',
            filePath: file.path,
            lineNumber: 1,
            codeSnippet: htmlparser2.DomUtils.getOuterHTML(img),
            impact: 'Screen readers cannot describe the image to visually impaired users',
            recommendation: 'Add descriptive alt text to all images',
            resolutionSteps: [
              {
                step: 1,
                title: 'Add Alt Text',
                description: 'Provide meaningful alt attribute describing the image content',
                codeExample: '<img src="photo.jpg" alt="Description of the image content">'
              }
            ],
            tags: ['html', 'accessibility', 'images'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });

      // Check for inputs without labels
      inputs.forEach((input: any) => {
        const type = input.attribs?.type;
        if (type && !['hidden', 'submit', 'button'].includes(type)) {
          const id = input.attribs?.id;
          if (!id) {
            issues.push({
              id: `html_input_no_id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: 'Input Missing ID for Label Association',
              description: 'Form input lacks id attribute needed for label association.',
              severity: 'medium',
              type: 'accessibility',
              status: 'open',
              filePath: file.path,
              lineNumber: 1,
              codeSnippet: htmlparser2.DomUtils.getOuterHTML(input),
              impact: 'Screen readers cannot properly associate labels with form inputs',
              recommendation: 'Add unique id attributes to form inputs and associate with labels',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Add ID and Label',
                  description: 'Add id to input and for attribute to label',
                  codeExample: '<label for="email">Email:</label><input type="email" id="email">'
                }
              ],
              tags: ['html', 'accessibility', 'forms'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }
        }
      });

      // Check for buttons without accessible text
      buttons.forEach((button: any) => {
        const hasText = button.children && button.children.some((child: any) => 
          child.type === 'text' && child.data.trim().length > 0
        );
        const hasAriaLabel = button.attribs?.['aria-label'];
        
        if (!hasText && !hasAriaLabel) {
          issues.push({
            id: `html_button_no_text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Button Without Accessible Text',
            description: 'Button element lacks visible text or aria-label.',
            severity: 'high',
            type: 'accessibility',
            status: 'open',
            filePath: file.path,
            lineNumber: 1,
            codeSnippet: htmlparser2.DomUtils.getOuterHTML(button),
            impact: 'Screen readers cannot understand the button purpose',
            recommendation: 'Add descriptive text or aria-label to buttons',
            resolutionSteps: [
              {
                step: 1,
                title: 'Add Button Text',
                description: 'Provide visible text or aria-label describing button action',
                codeExample: '<button aria-label="Close dialog">×</button>'
              }
            ],
            tags: ['html', 'accessibility', 'buttons'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });

    } catch (error) {
      console.error('HTML accessibility analysis error:', error);
    }

    return issues;
  }

  private analyzeHTMLSEO(dom: any, file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const htmlparser2 = require('htmlparser2');

    try {
      const head = htmlparser2.DomUtils.getElementsByTagName('head', dom)[0];
      const title = htmlparser2.DomUtils.getElementsByTagName('title', head || dom);
      const metas = htmlparser2.DomUtils.getElementsByTagName('meta', head || dom);
      const h1s = htmlparser2.DomUtils.getElementsByTagName('h1', dom);

      // Check for missing title
      if (!title || title.length === 0) {
        issues.push({
          id: `html_missing_title_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Missing Page Title',
          description: 'HTML document lacks a title element.',
          severity: 'high',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: 1,
          codeSnippet: '<head>...</head>',
          impact: 'Missing titles hurt SEO and user experience in browsers and search results',
          recommendation: 'Add a descriptive title element to the head section',
          resolutionSteps: [
            {
              step: 1,
              title: 'Add Title Element',
              description: 'Add a title tag with descriptive page title',
              codeExample: '<title>Page Title - Website Name</title>'
            }
          ],
          tags: ['html', 'seo', 'title'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      // Check for missing meta description
      const hasDescription = metas.some((meta: any) => 
        meta.attribs?.name === 'description'
      );
      
      if (!hasDescription) {
        issues.push({
          id: `html_missing_description_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Missing Meta Description',
          description: 'HTML document lacks a meta description.',
          severity: 'medium',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: 1,
          codeSnippet: '<head>...</head>',
          impact: 'Missing meta descriptions reduce search engine optimization effectiveness',
          recommendation: 'Add a meta description summarizing the page content',
          resolutionSteps: [
            {
              step: 1,
              title: 'Add Meta Description',
              description: 'Add meta description tag with page summary',
              codeExample: '<meta name="description" content="Brief page description for search engines">'
            }
          ],
          tags: ['html', 'seo', 'meta'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      // Check for multiple H1 tags
      if (h1s.length > 1) {
        issues.push({
          id: `html_multiple_h1_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Multiple H1 Tags',
          description: `Document contains ${h1s.length} H1 tags. Best practice is to use only one H1 per page.`,
          severity: 'medium',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: 1,
          codeSnippet: 'Multiple <h1> tags found',
          impact: 'Multiple H1 tags can confuse search engines about page hierarchy',
          recommendation: 'Use only one H1 tag per page and structure other headings with H2-H6',
          resolutionSteps: [
            {
              step: 1,
              title: 'Fix Heading Structure',
              description: 'Ensure only one H1 tag and proper heading hierarchy'
            }
          ],
          tags: ['html', 'seo', 'headings'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

    } catch (error) {
      console.error('HTML SEO analysis error:', error);
    }

    return issues;
  }

  private analyzeHTMLPerformance(dom: any, file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const htmlparser2 = require('htmlparser2');

    try {
      const scripts = htmlparser2.DomUtils.getElementsByTagName('script', dom);
      const links = htmlparser2.DomUtils.getElementsByTagName('link', dom);

      // Check for render-blocking scripts
      scripts.forEach((script: any) => {
        const src = script.attribs?.src;
        const async = script.attribs?.async;
        const defer = script.attribs?.defer;
        
        if (src && !async && !defer) {
          issues.push({
            id: `html_blocking_script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Render-Blocking Script',
            description: `Script "${src}" blocks rendering. Consider adding async or defer attributes.`,
            severity: 'medium',
            type: 'performance',
            status: 'open',
            filePath: file.path,
            lineNumber: 1,
            codeSnippet: htmlparser2.DomUtils.getOuterHTML(script),
            impact: 'Synchronous scripts block HTML parsing and delay page rendering',
            recommendation: 'Add async or defer attributes to non-critical scripts',
            resolutionSteps: [
              {
                step: 1,
                title: 'Add Async/Defer',
                description: 'Add async or defer attribute based on script requirements',
                codeExample: '<script src="script.js" async></script> or <script src="script.js" defer></script>'
              }
            ],
            tags: ['html', 'performance', 'scripts'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });

      // Check for render-blocking stylesheets
      links.forEach((link: any) => {
        const rel = link.attribs?.rel;
        const href = link.attribs?.href;
        const media = link.attribs?.media;
        
        if (rel === 'stylesheet' && href && !media) {
          issues.push({
            id: `html_blocking_css_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Render-Blocking Stylesheet',
            description: `Stylesheet "${href}" blocks rendering. Consider using media queries for non-critical CSS.`,
            severity: 'low',
            type: 'performance',
            status: 'open',
            filePath: file.path,
            lineNumber: 1,
            codeSnippet: htmlparser2.DomUtils.getOuterHTML(link),
            impact: 'Stylesheets without media queries block rendering until loaded',
            recommendation: 'Use media queries for non-critical CSS or load asynchronously',
            resolutionSteps: [
              {
                step: 1,
                title: 'Optimize CSS Loading',
                description: 'Add media attributes or load non-critical CSS asynchronously'
              }
            ],
            tags: ['html', 'performance', 'css'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });

    } catch (error) {
      console.error('HTML performance analysis error:', error);
    }

    return issues;
  }

  // CSS ANALYSIS METHODS
  private analyzeCSSPerformance(ast: any, file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const csstree = require('css-tree');

    try {
      csstree.walk(ast, (node: any) => {
        // Check for inefficient selectors
        if (node.type === 'Selector') {
          const selectorText = csstree.generate(node);
          
          // Universal selector performance issue
          if (selectorText.includes('*')) {
            issues.push({
              id: `css_universal_selector_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: 'Inefficient Universal Selector',
              description: `Universal selector (*) found: "${selectorText}". This can negatively impact rendering performance.`,
              severity: 'medium',
              type: 'performance',
              status: 'open',
              filePath: file.path,
              lineNumber: node.loc?.start?.line || 1,
              codeSnippet: selectorText,
              impact: 'Universal selectors force the browser to match every element, causing slower rendering',
              recommendation: 'Replace universal selectors with more specific selectors',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Replace Universal Selector',
                  description: 'Use more specific selectors instead of the universal selector',
                  codeExample: '/* Instead of * { } */ body * { } /* use */ .specific-class { }'
                }
              ],
              tags: ['css', 'performance', 'selectors'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }

          // Deeply nested selectors
          const depth = (selectorText.match(/>/g) || []).length;
          if (depth > 3) {
            issues.push({
              id: `css_deep_selector_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: 'Deeply Nested Selector',
              description: `Selector has ${depth} levels of nesting: "${selectorText}". Deep nesting can impact performance.`,
              severity: 'medium',
              type: 'performance',
              status: 'open',
              filePath: file.path,
              lineNumber: node.loc?.start?.line || 1,
              codeSnippet: selectorText,
              impact: 'Deeply nested selectors are harder to optimize and can slow down CSS matching',
              recommendation: 'Simplify selector structure and reduce nesting levels',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Flatten Selector Structure',
                  description: 'Reduce nesting by using classes instead of deep hierarchies',
                  codeExample: '/* Instead of */ .nav > ul > li > a { } /* use */ .nav-link { }'
                }
              ],
              tags: ['css', 'performance', 'nesting'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }
        }

        // Check for expensive properties
        if (node.type === 'Declaration') {
          const property = node.property;
          const value = csstree.generate(node.value);

          // Box-shadow performance
          if (property === 'box-shadow' && value.includes(',')) {
            const shadowCount = (value.match(/,/g) || []).length + 1;
            if (shadowCount > 3) {
              issues.push({
                id: `css_multiple_shadows_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: 'Multiple Box Shadows',
                description: `Multiple box-shadows (${shadowCount}) can impact rendering performance.`,
                severity: 'low',
                type: 'performance',
                status: 'open',
                filePath: file.path,
                lineNumber: node.loc?.start?.line || 1,
                codeSnippet: `${property}: ${value}`,
                impact: 'Multiple box-shadows require more GPU processing',
                recommendation: 'Consider reducing the number of box-shadows or using alternatives',
                resolutionSteps: [
                  {
                    step: 1,
                    title: 'Optimize Shadows',
                    description: 'Reduce shadow count or use pseudo-elements for complex effects'
                  }
                ],
                tags: ['css', 'performance', 'shadows'],
                createdAt: timestamp,
                updatedAt: timestamp
              });
            }
          }

          // Fixed positioning warnings
          if (property === 'position' && value === 'fixed') {
            issues.push({
              id: `css_fixed_position_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: 'Fixed Positioning Usage',
              description: 'Fixed positioning can cause layout thrashing and performance issues on mobile devices.',
              severity: 'low',
              type: 'performance',
              status: 'open',
              filePath: file.path,
              lineNumber: node.loc?.start?.line || 1,
              codeSnippet: `${property}: ${value}`,
              impact: 'Fixed elements can cause repaints and impact scrolling performance',
              recommendation: 'Consider using sticky positioning or alternative layouts',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Evaluate Positioning',
                  description: 'Consider if fixed positioning is necessary or if alternatives work better'
                }
              ],
              tags: ['css', 'performance', 'positioning'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }
        }
      });
    } catch (error) {
      console.error('CSS performance analysis error:', error);
    }

    return issues;
  }

  private analyzeCSSQuality(ast: any, file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const csstree = require('css-tree');

    try {
      const rules: any[] = [];
      const duplicateRules = new Map<string, number>();

      csstree.walk(ast, (node: any) => {
        if (node.type === 'Rule') {
          rules.push(node);
          const selector = csstree.generate(node.prelude);
          duplicateRules.set(selector, (duplicateRules.get(selector) || 0) + 1);
        }

        // Check for important declarations
        if (node.type === 'Declaration' && node.important) {
          issues.push({
            id: `css_important_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Excessive Use of !important',
            description: `Property "${node.property}" uses !important. This can make CSS difficult to maintain.`,
            severity: 'medium',
            type: 'quality',
            status: 'open',
            filePath: file.path,
            lineNumber: node.loc?.start?.line || 1,
            codeSnippet: `${node.property}: ${csstree.generate(node.value)} !important`,
            impact: '!important makes CSS specificity unpredictable and harder to override',
            recommendation: 'Use specific selectors instead of !important',
            resolutionSteps: [
              {
                step: 1,
                title: 'Remove !important',
                description: 'Increase selector specificity instead of using !important',
                codeExample: '/* Instead of */ .class { color: red !important; } /* use */ .container .class { color: red; }'
              }
            ],
            tags: ['css', 'quality', 'specificity'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }

        // Check for vendor prefixes without standard property
        if (node.type === 'Declaration' && node.property.startsWith('-')) {
          const standardProperty = node.property.replace(/^-(webkit|moz|ms|o)-/, '');
          issues.push({
            id: `css_vendor_prefix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Vendor Prefix Without Standard',
            description: `Vendor-prefixed property "${node.property}" should be accompanied by the standard property "${standardProperty}".`,
            severity: 'low',
            type: 'quality',
            status: 'open',
            filePath: file.path,
            lineNumber: node.loc?.start?.line || 1,
            codeSnippet: `${node.property}: ${csstree.generate(node.value)}`,
            impact: 'Missing standard properties can cause issues when browsers drop prefix support',
            recommendation: 'Always include the standard property after vendor prefixes',
            resolutionSteps: [
              {
                step: 1,
                title: 'Add Standard Property',
                description: 'Include the unprefixed version of the property',
                codeExample: `-webkit-transform: scale(1.1);\ntransform: scale(1.1);`
              }
            ],
            tags: ['css', 'quality', 'vendor-prefixes'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });

      // Check for duplicate selectors
      duplicateRules.forEach((count, selector) => {
        if (count > 1) {
          issues.push({
            id: `css_duplicate_selector_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Duplicate CSS Selector',
            description: `Selector "${selector}" is defined ${count} times. This can lead to conflicting styles.`,
            severity: 'medium',
            type: 'quality',
            status: 'open',
            filePath: file.path,
            lineNumber: 1,
            codeSnippet: selector,
            impact: 'Duplicate selectors can cause unexpected style overrides and maintenance issues',
            recommendation: 'Consolidate duplicate selectors or use more specific naming',
            resolutionSteps: [
              {
                step: 1,
                title: 'Consolidate Selectors',
                description: 'Merge duplicate selector rules or use different class names'
              }
            ],
            tags: ['css', 'quality', 'duplicates'],
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });

    } catch (error) {
      console.error('CSS quality analysis error:', error);
    }

    return issues;
  }

  private analyzeCSSAccessibility(ast: any, file: {path: string, content: string, type: string}, timestamp: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const csstree = require('css-tree');

    try {
      csstree.walk(ast, (node: any) => {
        if (node.type === 'Declaration') {
          const property = node.property;
          const value = csstree.generate(node.value);

          // Check for insufficient color contrast (basic check)
          if (property === 'color' && value.includes('#')) {
            const hex = value.match(/#[0-9a-fA-F]{3,6}/);
            if (hex) {
              const color = hex[0];
              // Simple check for very light colors on assumed white background
              if (color.length === 4) {
                const r = parseInt(color[1] + color[1], 16);
                const g = parseInt(color[2] + color[2], 16);
                const b = parseInt(color[3] + color[3], 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                
                if (brightness > 200) {
                  issues.push({
                    id: `css_contrast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: 'Potential Color Contrast Issue',
                    description: `Light color "${color}" may have insufficient contrast against light backgrounds.`,
                    severity: 'medium',
                    type: 'accessibility',
                    status: 'open',
                    filePath: file.path,
                    lineNumber: node.loc?.start?.line || 1,
                    codeSnippet: `${property}: ${value}`,
                    impact: 'Poor color contrast affects users with visual impairments',
                    recommendation: 'Ensure adequate color contrast ratios (4.5:1 for normal text)',
                    resolutionSteps: [
                      {
                        step: 1,
                        title: 'Check Color Contrast',
                        description: 'Use online contrast checkers to verify WCAG compliance',
                        codeExample: 'Use tools like WebAIM Contrast Checker'
                      }
                    ],
                    tags: ['css', 'accessibility', 'contrast'],
                    createdAt: timestamp,
                    updatedAt: timestamp
                  });
                }
              }
            }
          }

          // Check for font-size too small
          if (property === 'font-size') {
            const size = parseFloat(value);
            const unit = value.replace(/[\d.-]/g, '');
            
            if ((unit === 'px' && size < 14) || (unit === 'pt' && size < 10.5)) {
              issues.push({
                id: `css_font_size_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: 'Font Size Too Small',
                description: `Font size "${value}" may be too small for accessibility standards.`,
                severity: 'medium',
                type: 'accessibility',
                status: 'open',
                filePath: file.path,
                lineNumber: node.loc?.start?.line || 1,
                codeSnippet: `${property}: ${value}`,
                impact: 'Small fonts are difficult to read for users with visual impairments',
                recommendation: 'Use minimum font sizes of 14px or 0.875rem for body text',
                resolutionSteps: [
                  {
                    step: 1,
                    title: 'Increase Font Size',
                    description: 'Ensure font sizes meet accessibility guidelines',
                    codeExample: 'font-size: 16px; /* or 1rem */'
                  }
                ],
                tags: ['css', 'accessibility', 'typography'],
                createdAt: timestamp,
                updatedAt: timestamp
              });
            }
          }

          // Check for missing focus styles
          if (property === 'outline' && value === 'none') {
            issues.push({
              id: `css_focus_outline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: 'Focus Outline Removed',
              description: 'Outline removed without providing alternative focus indication.',
              severity: 'high',
              type: 'accessibility',
              status: 'open',
              filePath: file.path,
              lineNumber: node.loc?.start?.line || 1,
              codeSnippet: `${property}: ${value}`,
              impact: 'Users navigating with keyboard cannot see which element has focus',
              recommendation: 'Provide alternative focus styles when removing default outline',
              resolutionSteps: [
                {
                  step: 1,
                  title: 'Add Custom Focus Styles',
                  description: 'Replace outline: none with custom focus indicators',
                  codeExample: 'button:focus { outline: 2px solid #007cba; outline-offset: 2px; }'
                }
              ],
              tags: ['css', 'accessibility', 'focus'],
              createdAt: timestamp,
              updatedAt: timestamp
            });
          }
        }
      });
    } catch (error) {
      console.error('CSS accessibility analysis error:', error);
    }

    return issues;
  }

  // Enhanced summary for directory analysis
  private generateDirectorySummary(
    issues: CodeIssue[], 
    fileStats: { [key: string]: number }, 
    totalFiles: number, 
    linesOfCode: number
  ): string {
    const categories = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityCounts = issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const fileTypesText = Object.entries(fileStats)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');

    const categoryText = Object.entries(categories)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');

    const severityText = Object.entries(severityCounts)
      .map(([severity, count]) => `${count} ${severity}`)
      .join(', ');

    return `Analyzed ${totalFiles} files (${linesOfCode.toLocaleString()} lines of code). File types: ${fileTypesText}. Found ${issues.length} issues: ${categoryText}. Severity: ${severityText}.`;
  }

  // Cross-file dependency analysis
  private analyzeDependencies(files: Array<{path: string, content: string, type: string}>): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const dependencies = new Map<string, Set<string>>();
    const timestamp = new Date().toISOString();

    // Extract imports/requires from JS/TS files
    files.forEach(file => {
      if (['js', 'jsx', 'ts', 'tsx'].includes(file.type)) {
        const imports = this.extractImports(file.content);
        dependencies.set(file.path, new Set(imports));
      }
    });

    // Analyze for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const findCircularDeps = (filePath: string, path: string[] = []): void => {
      if (recursionStack.has(filePath)) {
        // Found circular dependency
        const cycle = path.slice(path.indexOf(filePath));
        issues.push({
          id: `circular_dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Circular Dependency Detected',
          description: `Circular dependency found in import chain: ${cycle.join(' → ')} → ${filePath}`,
          severity: 'medium',
          type: 'quality',
          status: 'open',
          filePath: filePath,
          lineNumber: 1,
          codeSnippet: 'Circular import detected',
          impact: 'Can cause runtime errors and make code harder to maintain',
          recommendation: 'Refactor code to eliminate circular dependencies by extracting shared code to a separate module',
          resolutionSteps: [
            {
              step: 1,
              title: 'Identify Shared Code',
              description: 'Extract shared functionality to a separate module',
              codeExample: '// shared.js\nexport const sharedFunction = () => { ... };'
            }
          ],
          tags: ['circular-dependency', 'architecture', 'directory-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
        return;
      }

      if (visited.has(filePath)) return;

      visited.add(filePath);
      recursionStack.add(filePath);

      const fileDeps = dependencies.get(filePath);
      if (fileDeps) {
        fileDeps.forEach(dep => {
          findCircularDeps(dep, [...path, filePath]);
        });
      }

      recursionStack.delete(filePath);
    };

    dependencies.forEach((_, filePath) => {
      if (!visited.has(filePath)) {
        findCircularDeps(filePath);
      }
    });

    // Analyze for unused files
    const referencedFiles = new Set<string>();
    dependencies.forEach(deps => {
      deps.forEach(dep => referencedFiles.add(dep));
    });

    files.forEach(file => {
      if (['js', 'jsx', 'ts', 'tsx'].includes(file.type) && 
          !referencedFiles.has(file.path) && 
          !file.path.includes('index.') && 
          !file.path.includes('main.') &&
          !file.path.includes('app.')) {
        issues.push({
          id: `unused_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Potentially Unused File',
          description: `File ${file.path} doesn't appear to be imported by other files`,
          severity: 'low',
          type: 'quality',
          status: 'open',
          filePath: file.path,
          lineNumber: 1,
          codeSnippet: '// This file may not be used',
          impact: 'Dead code increases bundle size and maintenance overhead',
          recommendation: 'Review if this file is needed or add proper imports/exports',
          resolutionSteps: [
            {
              step: 1,
              title: 'Verify Usage',
              description: 'Check if file is used by entry points or configuration files'
            }
          ],
          tags: ['unused-code', 'dead-code', 'directory-analysis'],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    return issues;
  }

  // Extract import statements from JavaScript/TypeScript files
  private extractImports(content: string): string[] {
    const imports: string[] = [];
    
    // ES6 imports
    const es6ImportRegex = /import\s+(?:.*?\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = es6ImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // CommonJS requires
    const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports.filter(imp => !imp.startsWith('.') && !imp.startsWith('/'));
  }
}

export const fileProcessor = new FileProcessor();