import { readTextFile } from '@tauri-apps/plugin-fs';
import * as path from 'path';

export interface MobileCodeDuplication {
  id: string;
  type: 'exact' | 'similar' | 'cross-platform';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  files: {
    filePath: string;
    lineStart: number;
    lineEnd: number;
    framework: 'flutter' | 'react-native' | 'ios' | 'android' | 'cross-platform';
    codeSnippet: string;
  }[];
  similarity: number; // 0-100
  suggestion: string;
  impact: string;
  estimatedEffort: number; // hours
}

export interface MobileDuplicationAnalysisResult {
  duplications: MobileCodeDuplication[];
  summary: {
    totalDuplications: number;
    exactDuplications: number;
    similarDuplications: number;
    crossPlatformDuplications: number;
    highSeverityDuplications: number;
    mediumSeverityDuplications: number;
    lowSeverityDuplications: number;
    estimatedRefactoringEffort: number;
  };
  recommendations: {
    priority: 'immediate' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedEffort: number;
    impact: 'critical' | 'high' | 'medium' | 'low';
    duplications: string[];
  }[];
}

export class MobileDuplicationDetector {
  private minSimilarityThreshold: number = 80;
  private minLinesForDuplication: number = 5;
  private maxLinesForDuplication: number = 100;

  /**
   * Analyze mobile code duplication across project
   */
  async analyzeMobileDuplication(files: string[]): Promise<MobileDuplicationAnalysisResult> {
    const duplications: MobileCodeDuplication[] = [];
    
    console.log('🔍 Analyzing mobile code duplication...');
    
    // Group files by framework
    const frameworkGroups = this.groupFilesByFramework(files);
    
    // Analyze within each framework
    for (const [framework, frameworkFiles] of Object.entries(frameworkGroups)) {
      const frameworkDuplications = await this.analyzeFrameworkDuplication(frameworkFiles, framework as any);
      duplications.push(...frameworkDuplications);
    }
    
    // Analyze cross-platform duplication
    const crossPlatformDuplications = await this.analyzeCrossPlatformDuplication(frameworkGroups);
    duplications.push(...crossPlatformDuplications);
    
    // Generate summary and recommendations
    const summary = this.generateDuplicationSummary(duplications);
    const recommendations = this.generateDuplicationRecommendations(duplications);
    
    return {
      duplications,
      summary,
      recommendations
    };
  }

  /**
   * Group files by mobile framework
   */
  private groupFilesByFramework(files: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {
      flutter: [],
      'react-native': [],
      ios: [],
      android: [],
      crossPlatform: []
    };

    for (const file of files) {
      const framework = this.detectFramework(file);
      if (framework && groups[framework]) {
        groups[framework].push(file);
      }
    }

    return groups;
  }

  /**
   * Detect framework from file path
   */
  private detectFramework(filePath: string): string | null {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.dart' || ext === '.yaml' || ext === '.yml') {
      return 'flutter';
    }
    
    if (ext === '.swift' || ext === '.m' || ext === '.h' || ext === '.mm' || 
        ext === '.plist' || ext === '.storyboard' || ext === '.xib') {
      return 'ios';
    }
    
    if (ext === '.java' || ext === '.kt' || ext === '.xml' || 
        ext === '.gradle' || ext === '.properties') {
      return 'android';
    }
    
    if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx' || ext === '.json') {
      return 'react-native';
    }
    
    return null;
  }

  /**
   * Analyze duplication within a specific framework
   */
  private async analyzeFrameworkDuplication(
    files: string[], 
    framework: string
  ): Promise<MobileCodeDuplication[]> {
    const duplications: MobileCodeDuplication[] = [];
    
    // Extract code blocks from files
    const codeBlocks: Array<{
      filePath: string;
      content: string;
      lineStart: number;
      lineEnd: number;
      framework: string;
    }> = [];

    for (const file of files) {
      try {
        const content = await readTextFile(file);
        const blocks = this.extractCodeBlocks(content, file, framework);
        codeBlocks.push(...blocks);
      } catch (error) {
        console.warn(`Failed to read file ${file}:`, error);
      }
    }

    // Compare code blocks for duplication
    for (let i = 0; i < codeBlocks.length; i++) {
      for (let j = i + 1; j < codeBlocks.length; j++) {
        const block1 = codeBlocks[i];
        const block2 = codeBlocks[j];
        
        const similarity = this.calculateSimilarity(block1.content, block2.content);
        
        if (similarity >= this.minSimilarityThreshold) {
          const duplication = this.createDuplication(
            block1, 
            block2, 
            similarity, 
            framework
          );
          
          if (duplication) {
            duplications.push(duplication);
          }
        }
      }
    }

    return duplications;
  }

  /**
   * Analyze cross-platform duplication
   */
  private async analyzeCrossPlatformDuplication(
    frameworkGroups: Record<string, string[]>
  ): Promise<MobileCodeDuplication[]> {
    const duplications: MobileCodeDuplication[] = [];
    
    // Extract code blocks from all frameworks
    const allCodeBlocks: Array<{
      filePath: string;
      content: string;
      lineStart: number;
      lineEnd: number;
      framework: string;
    }> = [];

    for (const [framework, files] of Object.entries(frameworkGroups)) {
      if (framework === 'crossPlatform') continue;
      
      for (const file of files) {
        try {
          const content = await readTextFile(file);
          const blocks = this.extractCodeBlocks(content, file, framework);
          allCodeBlocks.push(...blocks);
        } catch (error) {
          console.warn(`Failed to read file ${file}:`, error);
        }
      }
    }

    // Compare cross-platform code blocks
    for (let i = 0; i < allCodeBlocks.length; i++) {
      for (let j = i + 1; j < allCodeBlocks.length; j++) {
        const block1 = allCodeBlocks[i];
        const block2 = allCodeBlocks[j];
        
        // Only compare if different frameworks
        if (block1.framework !== block2.framework) {
          const similarity = this.calculateSimilarity(block1.content, block2.content);
          
          if (similarity >= this.minSimilarityThreshold) {
            const duplication = this.createCrossPlatformDuplication(
              block1, 
              block2, 
              similarity
            );
            
            if (duplication) {
              duplications.push(duplication);
            }
          }
        }
      }
    }

    return duplications;
  }

  /**
   * Extract code blocks from file content
   */
  private extractCodeBlocks(
    content: string, 
    filePath: string, 
    framework: string
  ): Array<{
    filePath: string;
    content: string;
    lineStart: number;
    lineEnd: number;
    framework: string;
  }> {
    const blocks: Array<{
      filePath: string;
      content: string;
      lineStart: number;
      lineEnd: number;
      framework: string;
    }> = [];

    const lines = content.split('\n');
    let currentBlock: string[] = [];
    let blockStart = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line contains meaningful code
      if (this.isMeaningfulCode(line, framework)) {
        currentBlock.push(line);
      } else {
        // End of current block
        if (currentBlock.length >= this.minLinesForDuplication && 
            currentBlock.length <= this.maxLinesForDuplication) {
          blocks.push({
            filePath,
            content: currentBlock.join('\n'),
            lineStart: blockStart,
            lineEnd: i,
            framework
          });
        }
        
        currentBlock = [];
        blockStart = i + 2;
      }
    }

    // Handle last block
    if (currentBlock.length >= this.minLinesForDuplication && 
        currentBlock.length <= this.maxLinesForDuplication) {
      blocks.push({
        filePath,
        content: currentBlock.join('\n'),
        lineStart: blockStart,
        lineEnd: lines.length,
        framework
      });
    }

    return blocks;
  }

  /**
   * Check if line contains meaningful code
   */
  private isMeaningfulCode(line: string, framework: string): boolean {
    const trimmed = line.trim();
    
    // Skip empty lines, comments, and imports
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || 
        trimmed.startsWith('import ') || trimmed.startsWith('package ')) {
      return false;
    }
    
    // Framework-specific meaningful code patterns
    switch (framework) {
      case 'flutter':
        return this.isFlutterMeaningfulCode(trimmed);
      case 'react-native':
        return this.isReactNativeMeaningfulCode(trimmed);
      case 'ios':
        return this.isIOSMeaningfulCode(trimmed);
      case 'android':
        return this.isAndroidMeaningfulCode(trimmed);
      default:
        return trimmed.length > 10; // Basic meaningful code check
    }
  }

  /**
   * Check if line contains meaningful Flutter code
   */
  private isFlutterMeaningfulCode(line: string): boolean {
    return line.includes('Widget') || 
           line.includes('class ') || 
           line.includes('void ') || 
           line.includes('return ') ||
           line.includes('setState') ||
           line.includes('Navigator') ||
           line.includes('Scaffold') ||
           line.includes('Container') ||
           line.includes('Text(') ||
           line.includes('Column(') ||
           line.includes('Row(');
  }

  /**
   * Check if line contains meaningful React Native code
   */
  private isReactNativeMeaningfulCode(line: string): boolean {
    return line.includes('const ') || 
           line.includes('function ') || 
           line.includes('return ') ||
           line.includes('useState') ||
           line.includes('useEffect') ||
           line.includes('View') ||
           line.includes('Text') ||
           line.includes('TouchableOpacity') ||
           line.includes('StyleSheet') ||
           line.includes('export ');
  }

  /**
   * Check if line contains meaningful iOS code
   */
  private isIOSMeaningfulCode(line: string): boolean {
    return line.includes('@interface ') || 
           line.includes('@implementation ') || 
           line.includes('class ') ||
           line.includes('func ') ||
           line.includes('var ') ||
           line.includes('let ') ||
           line.includes('return ') ||
           line.includes('UIViewController') ||
           line.includes('UIView') ||
           line.includes('UILabel');
  }

  /**
   * Check if line contains meaningful Android code
   */
  private isAndroidMeaningfulCode(line: string): boolean {
    return line.includes('public class ') || 
           line.includes('private ') || 
           line.includes('protected ') ||
           line.includes('void ') ||
           line.includes('return ') ||
           line.includes('Activity') ||
           line.includes('Fragment') ||
           line.includes('View') ||
           line.includes('TextView') ||
           line.includes('Button');
  }

  /**
   * Calculate similarity between two code blocks
   */
  private calculateSimilarity(code1: string, code2: string): number {
    const lines1 = code1.split('\n').filter(line => line.trim());
    const lines2 = code2.split('\n').filter(line => line.trim());
    
    if (lines1.length === 0 || lines2.length === 0) {
      return 0;
    }
    
    let matchingLines = 0;
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (const line1 of lines1) {
      for (const line2 of lines2) {
        if (this.isSimilarLine(line1, line2)) {
          matchingLines++;
          break;
        }
      }
    }
    
    return (matchingLines / maxLines) * 100;
  }

  /**
   * Check if two lines are similar
   */
  private isSimilarLine(line1: string, line2: string): boolean {
    const normalized1 = this.normalizeCodeLine(line1);
    const normalized2 = this.normalizeCodeLine(line2);
    
    // Exact match
    if (normalized1 === normalized2) {
      return true;
    }
    
    // Similar structure (variable names different but structure same)
    const structure1 = this.extractCodeStructure(normalized1);
    const structure2 = this.extractCodeStructure(normalized2);
    
    return structure1 === structure2;
  }

  /**
   * Normalize code line for comparison
   */
  private normalizeCodeLine(line: string): string {
    return line
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/['"`]/g, '"')
      .replace(/[0-9]+/g, 'N')
      .toLowerCase();
  }

  /**
   * Extract code structure (ignoring variable names)
   */
  private extractCodeStructure(line: string): string {
    return line
      .replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, 'VAR')
      .replace(/[0-9]+/g, 'N')
      .replace(/['"`][^'"]*['"`]/g, 'STR');
  }

  /**
   * Create duplication object
   */
  private createDuplication(
    block1: any,
    block2: any,
    similarity: number,
    framework: string
  ): MobileCodeDuplication | null {
    const type = similarity >= 95 ? 'exact' : 'similar';
    const severity = this.calculateDuplicationSeverity(similarity, block1.content.length);
    
    return {
      id: `dup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Code Duplication in ${framework}`,
      description: `Found ${type} code duplication with ${similarity.toFixed(1)}% similarity`,
      files: [
        {
          filePath: block1.filePath,
          lineStart: block1.lineStart,
          lineEnd: block1.lineEnd,
          framework: framework as any,
          codeSnippet: block1.content
        },
        {
          filePath: block2.filePath,
          lineStart: block2.lineStart,
          lineEnd: block2.lineEnd,
          framework: framework as any,
          codeSnippet: block2.content
        }
      ],
      similarity,
      suggestion: this.generateDuplicationSuggestion(type, framework),
      impact: this.calculateDuplicationImpact(severity),
      estimatedEffort: this.calculateRefactoringEffort(similarity, block1.content.length)
    };
  }

  /**
   * Create cross-platform duplication object
   */
  private createCrossPlatformDuplication(
    block1: any,
    block2: any,
    similarity: number
  ): MobileCodeDuplication | null {
    const type = 'cross-platform';
    const severity = this.calculateDuplicationSeverity(similarity, block1.content.length);
    
    return {
      id: `cross_dup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title: `Cross-Platform Code Duplication`,
      description: `Found similar code across ${block1.framework} and ${block2.framework} with ${similarity.toFixed(1)}% similarity`,
      files: [
        {
          filePath: block1.filePath,
          lineStart: block1.lineStart,
          lineEnd: block1.lineEnd,
          framework: block1.framework as any,
          codeSnippet: block1.content
        },
        {
          filePath: block2.filePath,
          lineStart: block2.lineStart,
          lineEnd: block2.lineEnd,
          framework: block2.framework as any,
          codeSnippet: block2.content
        }
      ],
      similarity,
      suggestion: this.generateCrossPlatformSuggestion(block1.framework, block2.framework),
      impact: this.calculateDuplicationImpact(severity),
      estimatedEffort: this.calculateRefactoringEffort(similarity, block1.content.length)
    };
  }

  /**
   * Calculate duplication severity
   */
  private calculateDuplicationSeverity(similarity: number, codeLength: number): 'high' | 'medium' | 'low' {
    if (similarity >= 95 && codeLength > 20) return 'high';
    if (similarity >= 80 && codeLength > 10) return 'medium';
    return 'low';
  }

  /**
   * Calculate duplication impact
   */
  private calculateDuplicationImpact(severity: string): string {
    switch (severity) {
      case 'high':
        return 'High maintenance overhead and potential for bugs';
      case 'medium':
        return 'Moderate maintenance overhead';
      case 'low':
        return 'Low maintenance impact';
      default:
        return 'Unknown impact';
    }
  }

  /**
   * Calculate refactoring effort
   */
  private calculateRefactoringEffort(similarity: number, codeLength: number): number {
    // Base effort: 1 hour per 50 lines of code
    const baseEffort = Math.ceil(codeLength / 50);
    
    // Adjust based on similarity
    const similarityMultiplier = similarity >= 95 ? 0.5 : similarity >= 80 ? 0.8 : 1.0;
    
    return Math.ceil(baseEffort * similarityMultiplier);
  }

  /**
   * Generate duplication suggestion based on type and framework
   */
  private generateDuplicationSuggestion(_type: string, framework: string): string {
    switch (framework) {
      case 'flutter':
        return 'Consider extracting common widgets into reusable components';
      case 'react-native':
        return 'Consider creating shared components or custom hooks';
      case 'ios':
        return 'Consider creating shared utility classes or extensions';
      case 'android':
        return 'Consider creating shared utility classes or base classes';
      default:
        return 'Consider refactoring duplicated code into reusable functions';
    }
  }

  /**
   * Generate cross-platform suggestion
   */
  private generateCrossPlatformSuggestion(framework1: string, framework2: string): string {
    return `Consider creating a shared business logic layer or using a cross-platform framework like Flutter or React Native to reduce code duplication between ${framework1} and ${framework2}.`;
  }

  /**
   * Generate duplication summary
   */
  private generateDuplicationSummary(duplications: MobileCodeDuplication[]): any {
    const exactDuplications = duplications.filter(d => d.type === 'exact').length;
    const similarDuplications = duplications.filter(d => d.type === 'similar').length;
    const crossPlatformDuplications = duplications.filter(d => d.type === 'cross-platform').length;
    const highSeverityDuplications = duplications.filter(d => d.severity === 'high').length;
    const mediumSeverityDuplications = duplications.filter(d => d.severity === 'medium').length;
    const lowSeverityDuplications = duplications.filter(d => d.severity === 'low').length;
    const estimatedRefactoringEffort = duplications.reduce((sum, d) => sum + d.estimatedEffort, 0);

    return {
      totalDuplications: duplications.length,
      exactDuplications,
      similarDuplications,
      crossPlatformDuplications,
      highSeverityDuplications,
      mediumSeverityDuplications,
      lowSeverityDuplications,
      estimatedRefactoringEffort
    };
  }

  /**
   * Generate duplication recommendations
   */
  private generateDuplicationRecommendations(duplications: MobileCodeDuplication[]): any[] {
    const recommendations = [];
    
    const highSeverityDuplications = duplications.filter(d => d.severity === 'high');
    const crossPlatformDuplications = duplications.filter(d => d.type === 'cross-platform');
    
    if (highSeverityDuplications.length > 0) {
      recommendations.push({
        priority: 'immediate',
        title: 'Address High Severity Duplications',
        description: `Found ${highSeverityDuplications.length} high severity code duplications that should be refactored immediately`,
        estimatedEffort: highSeverityDuplications.reduce((sum, d) => sum + d.estimatedEffort, 0),
        impact: 'critical',
        duplications: highSeverityDuplications.map(d => d.id)
      });
    }
    
    if (crossPlatformDuplications.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Address Cross-Platform Duplications',
        description: `Found ${crossPlatformDuplications.length} cross-platform code duplications`,
        estimatedEffort: crossPlatformDuplications.reduce((sum, d) => sum + d.estimatedEffort, 0),
        impact: 'high',
        duplications: crossPlatformDuplications.map(d => d.id)
      });
    }
    
    return recommendations;
  }
} 