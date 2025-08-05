import * as path from 'path';
import { readTextFile } from '@tauri-apps/plugin-fs';

export interface MobileDependencyIssue {
  type: 'security-vulnerability' | 'outdated-dependency' | 'license-issue' | 'performance-impact' | 'compatibility-issue';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dependency: string;
  version: string;
  file: string;
  line?: number;
  suggestion: string;
  impact: string;
  cveId?: string;
  cweId?: string;
  affectedVersions?: string;
  fixedVersion?: string;
}

export interface MobileDependencyAnalysisResult {
  framework: 'flutter' | 'react-native' | 'ios' | 'android' | 'xamarin';
  issues: MobileDependencyIssue[];
  summary: {
    totalDependencies: number;
    vulnerableDependencies: number;
    outdatedDependencies: number;
    criticalIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
  };
  recommendations: {
    priority: 'immediate' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedEffort: number;
    impact: 'critical' | 'high' | 'medium' | 'low';
    dependencies: string[];
  }[];
}

export class MobileDependencyAnalyzer {
  private knownVulnerabilities: Map<string, any>;
  private outdatedPackages: Map<string, string>;

  constructor() {
    this.knownVulnerabilities = new Map();
    this.outdatedPackages = new Map();
    this.initializeVulnerabilityDatabase();
  }

  /**
   * Analyze Flutter dependencies (pubspec.yaml)
   */
  async analyzeFlutterDependencies(projectPath: string): Promise<MobileDependencyAnalysisResult> {
    const issues: MobileDependencyIssue[] = [];
    
    try {
      const pubspecPath = path.join(projectPath, 'pubspec.yaml');
      const pubspecContent = await readTextFile(pubspecPath);
      
      // Parse pubspec.yaml for dependencies
      const dependencies = this.parsePubspecDependencies(pubspecContent);
      
      // Check each dependency for vulnerabilities
      for (const [packageName, version] of Object.entries(dependencies)) {
        const packageIssues = await this.checkFlutterDependency(packageName, version);
        issues.push(...packageIssues);
      }
      
      return this.createDependencyAnalysisResult('flutter', issues);
    } catch (error) {
      console.warn('Failed to analyze Flutter dependencies:', error);
      return this.createDependencyAnalysisResult('flutter', []);
    }
  }

  /**
   * Analyze React Native dependencies (package.json)
   */
  async analyzeReactNativeDependencies(projectPath: string): Promise<MobileDependencyAnalysisResult> {
    const issues: MobileDependencyIssue[] = [];
    
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJsonContent = await readTextFile(packageJsonPath);
      
      // Parse package.json for dependencies
      const dependencies = this.parsePackageJsonDependencies(packageJsonContent);
      
      // Check each dependency for vulnerabilities
      for (const [packageName, version] of Object.entries(dependencies)) {
        const packageIssues = await this.checkReactNativeDependency(packageName, version);
        issues.push(...packageIssues);
      }
      
      return this.createDependencyAnalysisResult('react-native', issues);
    } catch (error) {
      console.warn('Failed to analyze React Native dependencies:', error);
      return this.createDependencyAnalysisResult('react-native', []);
    }
  }

  /**
   * Analyze iOS dependencies (Podfile)
   */
  async analyzeIOSDependencies(projectPath: string): Promise<MobileDependencyAnalysisResult> {
    const issues: MobileDependencyIssue[] = [];
    
    try {
      const podfilePath = path.join(projectPath, 'ios', 'Podfile');
      const podfileContent = await readTextFile(podfilePath);
      
      // Parse Podfile for dependencies
      const dependencies = this.parsePodfileDependencies(podfileContent);
      
      // Check each dependency for vulnerabilities
      for (const [packageName, version] of Object.entries(dependencies)) {
        const packageIssues = await this.checkIOSDependency(packageName, version);
        issues.push(...packageIssues);
      }
      
      return this.createDependencyAnalysisResult('ios', issues);
    } catch (error) {
      console.warn('Failed to analyze iOS dependencies:', error);
      return this.createDependencyAnalysisResult('ios', []);
    }
  }

  /**
   * Analyze Android dependencies (build.gradle)
   */
  async analyzeAndroidDependencies(projectPath: string): Promise<MobileDependencyAnalysisResult> {
    const issues: MobileDependencyIssue[] = [];
    
    try {
      const buildGradlePath = path.join(projectPath, 'android', 'app', 'build.gradle');
      const buildGradleContent = await readTextFile(buildGradlePath);
      
      // Parse build.gradle for dependencies
      const dependencies = this.parseBuildGradleDependencies(buildGradleContent);
      
      // Check each dependency for vulnerabilities
      for (const [packageName, version] of Object.entries(dependencies)) {
        const packageIssues = await this.checkAndroidDependency(packageName, version);
        issues.push(...packageIssues);
      }
      
      return this.createDependencyAnalysisResult('android', issues);
    } catch (error) {
      console.warn('Failed to analyze Android dependencies:', error);
      return this.createDependencyAnalysisResult('android', []);
    }
  }

  /**
   * Parse Flutter pubspec.yaml dependencies
   */
  private parsePubspecDependencies(content: string): Record<string, string> {
    const dependencies: Record<string, string> = {};
    const lines = content.split('\n');
    let inDependencies = false;
    let inDevDependencies = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === 'dependencies:') {
        inDependencies = true;
        inDevDependencies = false;
        continue;
      }
      
      if (trimmedLine === 'dev_dependencies:') {
        inDependencies = false;
        inDevDependencies = true;
        continue;
      }
      
      if (trimmedLine.startsWith('  ') && (inDependencies || inDevDependencies)) {
        const match = trimmedLine.match(/^(\w+):\s*(.+)$/);
        if (match) {
          const packageName = match[1];
          const version = match[2].replace(/['"]/g, '');
          dependencies[packageName] = version;
        }
      }
    }
    
    return dependencies;
  }

  /**
   * Parse React Native package.json dependencies
   */
  private parsePackageJsonDependencies(content: string): Record<string, string> {
    const dependencies: Record<string, string> = {};
    
    try {
      const packageJson = JSON.parse(content);
      
      // Combine dependencies and devDependencies
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      for (const [packageName, version] of Object.entries(allDeps)) {
        dependencies[packageName] = version as string;
      }
    } catch (error) {
      console.warn('Failed to parse package.json:', error);
    }
    
    return dependencies;
  }

  /**
   * Parse iOS Podfile dependencies
   */
  private parsePodfileDependencies(content: string): Record<string, string> {
    const dependencies: Record<string, string> = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const match = line.match(/pod\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/);
      if (match) {
        const packageName = match[1];
        const version = match[2] || 'latest';
        dependencies[packageName] = version;
      }
    }
    
    return dependencies;
  }

  /**
   * Parse Android build.gradle dependencies
   */
  private parseBuildGradleDependencies(content: string): Record<string, string> {
    const dependencies: Record<string, string> = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const match = line.match(/implementation\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/);
      if (match) {
        const packageName = match[1];
        const version = match[2] || 'latest';
        dependencies[packageName] = version;
      }
    }
    
    return dependencies;
  }

  /**
   * Check Flutter dependency for vulnerabilities
   */
  private async checkFlutterDependency(packageName: string, version: string): Promise<MobileDependencyIssue[]> {
    const issues: MobileDependencyIssue[] = [];
    
    // Check for known vulnerabilities
    const vulnerability = this.knownVulnerabilities.get(packageName);
    if (vulnerability && this.isVersionAffected(version, vulnerability.affectedVersions)) {
      issues.push({
        type: 'security-vulnerability',
        severity: vulnerability.severity,
        title: `Security Vulnerability in ${packageName}`,
        description: vulnerability.description,
        dependency: packageName,
        version: version,
        file: 'pubspec.yaml',
        suggestion: `Update ${packageName} to version ${vulnerability.fixedVersion} or later`,
        impact: vulnerability.impact,
        cveId: vulnerability.cveId,
        cweId: vulnerability.cweId,
        affectedVersions: vulnerability.affectedVersions,
        fixedVersion: vulnerability.fixedVersion
      });
    }
    
    // Check for outdated dependencies
    const latestVersion = this.outdatedPackages.get(packageName);
    if (latestVersion && latestVersion !== version) {
      issues.push({
        type: 'outdated-dependency',
        severity: 'medium',
        title: `Outdated Dependency: ${packageName}`,
        description: `${packageName} is outdated. Current version: ${version}, Latest version: ${latestVersion}`,
        dependency: packageName,
        version: version,
        file: 'pubspec.yaml',
        suggestion: `Update ${packageName} to version ${latestVersion}`,
        impact: 'Missing security patches and new features'
      });
    }
    
    // Check for performance-impacting dependencies
    if (this.isPerformanceImpactDependency(packageName)) {
      issues.push({
        type: 'performance-impact',
        severity: 'low',
        title: `Performance-Impacting Dependency: ${packageName}`,
        description: `${packageName} may impact app performance`,
        dependency: packageName,
        version: version,
        file: 'pubspec.yaml',
        suggestion: 'Consider alternatives or optimize usage',
        impact: 'Potential performance degradation'
      });
    }
    
    return issues;
  }

  /**
   * Check React Native dependency for vulnerabilities
   */
  private async checkReactNativeDependency(packageName: string, version: string): Promise<MobileDependencyIssue[]> {
    const issues: MobileDependencyIssue[] = [];
    
    // Check for known vulnerabilities
    const vulnerability = this.knownVulnerabilities.get(packageName);
    if (vulnerability && this.isVersionAffected(version, vulnerability.affectedVersions)) {
      issues.push({
        type: 'security-vulnerability',
        severity: vulnerability.severity,
        title: `Security Vulnerability in ${packageName}`,
        description: vulnerability.description,
        dependency: packageName,
        version: version,
        file: 'package.json',
        suggestion: `Update ${packageName} to version ${vulnerability.fixedVersion} or later`,
        impact: vulnerability.impact,
        cveId: vulnerability.cveId,
        cweId: vulnerability.cweId,
        affectedVersions: vulnerability.affectedVersions,
        fixedVersion: vulnerability.fixedVersion
      });
    }
    
    // Check for outdated dependencies
    const latestVersion = this.outdatedPackages.get(packageName);
    if (latestVersion && latestVersion !== version) {
      issues.push({
        type: 'outdated-dependency',
        severity: 'medium',
        title: `Outdated Dependency: ${packageName}`,
        description: `${packageName} is outdated. Current version: ${version}, Latest version: ${latestVersion}`,
        dependency: packageName,
        version: version,
        file: 'package.json',
        suggestion: `Update ${packageName} to version ${latestVersion}`,
        impact: 'Missing security patches and new features'
      });
    }
    
    // Check for license issues
    if (this.hasLicenseIssue(packageName)) {
      issues.push({
        type: 'license-issue',
        severity: 'low',
        title: `License Issue: ${packageName}`,
        description: `${packageName} may have license compatibility issues`,
        dependency: packageName,
        version: version,
        file: 'package.json',
        suggestion: 'Review license terms and consider alternatives',
        impact: 'Potential legal compliance issues'
      });
    }
    
    return issues;
  }

  /**
   * Check iOS dependency for vulnerabilities
   */
  private async checkIOSDependency(packageName: string, version: string): Promise<MobileDependencyIssue[]> {
    const issues: MobileDependencyIssue[] = [];
    
    // Check for known vulnerabilities
    const vulnerability = this.knownVulnerabilities.get(packageName);
    if (vulnerability && this.isVersionAffected(version, vulnerability.affectedVersions)) {
      issues.push({
        type: 'security-vulnerability',
        severity: vulnerability.severity,
        title: `Security Vulnerability in ${packageName}`,
        description: vulnerability.description,
        dependency: packageName,
        version: version,
        file: 'Podfile',
        suggestion: `Update ${packageName} to version ${vulnerability.fixedVersion} or later`,
        impact: vulnerability.impact,
        cveId: vulnerability.cveId,
        cweId: vulnerability.cweId,
        affectedVersions: vulnerability.affectedVersions,
        fixedVersion: vulnerability.fixedVersion
      });
    }
    
    // Check for compatibility issues
    if (this.hasCompatibilityIssue(packageName, 'ios')) {
      issues.push({
        type: 'compatibility-issue',
        severity: 'medium',
        title: `Compatibility Issue: ${packageName}`,
        description: `${packageName} may have iOS compatibility issues`,
        dependency: packageName,
        version: version,
        file: 'Podfile',
        suggestion: 'Check iOS version compatibility and consider alternatives',
        impact: 'Potential app crashes or functionality issues'
      });
    }
    
    return issues;
  }

  /**
   * Check Android dependency for vulnerabilities
   */
  private async checkAndroidDependency(packageName: string, version: string): Promise<MobileDependencyIssue[]> {
    const issues: MobileDependencyIssue[] = [];
    
    // Check for known vulnerabilities
    const vulnerability = this.knownVulnerabilities.get(packageName);
    if (vulnerability && this.isVersionAffected(version, vulnerability.affectedVersions)) {
      issues.push({
        type: 'security-vulnerability',
        severity: vulnerability.severity,
        title: `Security Vulnerability in ${packageName}`,
        description: vulnerability.description,
        dependency: packageName,
        version: version,
        file: 'build.gradle',
        suggestion: `Update ${packageName} to version ${vulnerability.fixedVersion} or later`,
        impact: vulnerability.impact,
        cveId: vulnerability.cveId,
        cweId: vulnerability.cweId,
        affectedVersions: vulnerability.affectedVersions,
        fixedVersion: vulnerability.fixedVersion
      });
    }
    
    // Check for compatibility issues
    if (this.hasCompatibilityIssue(packageName, 'android')) {
      issues.push({
        type: 'compatibility-issue',
        severity: 'medium',
        title: `Compatibility Issue: ${packageName}`,
        description: `${packageName} may have Android compatibility issues`,
        dependency: packageName,
        version: version,
        file: 'build.gradle',
        suggestion: 'Check Android API level compatibility and consider alternatives',
        impact: 'Potential app crashes or functionality issues'
      });
    }
    
    return issues;
  }

  /**
   * Create dependency analysis result
   */
  private createDependencyAnalysisResult(framework: string, issues: MobileDependencyIssue[]): MobileDependencyAnalysisResult {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highPriorityIssues = issues.filter(i => i.severity === 'high').length;
    const mediumPriorityIssues = issues.filter(i => i.severity === 'medium').length;
    const lowPriorityIssues = issues.filter(i => i.severity === 'low').length;
    
    const vulnerableDependencies = issues.filter(i => i.type === 'security-vulnerability').length;
    const outdatedDependencies = issues.filter(i => i.type === 'outdated-dependency').length;
    
    // Generate recommendations
    const recommendations = this.generateDependencyRecommendations(issues);
    
    return {
      framework: framework as any,
      issues,
      summary: {
        totalDependencies: issues.length,
        vulnerableDependencies,
        outdatedDependencies,
        criticalIssues,
        highPriorityIssues,
        mediumPriorityIssues,
        lowPriorityIssues
      },
      recommendations
    };
  }

  /**
   * Generate dependency recommendations
   */
  private generateDependencyRecommendations(issues: MobileDependencyIssue[]): any[] {
    const recommendations = [];
    
    const securityIssues = issues.filter(i => i.type === 'security-vulnerability');
    const outdatedIssues = issues.filter(i => i.type === 'outdated-dependency');
    
    if (securityIssues.length > 0) {
      recommendations.push({
        priority: 'immediate',
        title: 'Address Security Vulnerabilities',
        description: `Found ${securityIssues.length} security vulnerabilities in dependencies`,
        estimatedEffort: securityIssues.length * 1,
        impact: 'critical',
        dependencies: securityIssues.map(i => i.dependency)
      });
    }
    
    if (outdatedIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Update Outdated Dependencies',
        description: `Found ${outdatedIssues.length} outdated dependencies`,
        estimatedEffort: outdatedIssues.length * 0.5,
        impact: 'high',
        dependencies: outdatedIssues.map(i => i.dependency)
      });
    }
    
    return recommendations;
  }

  /**
   * Initialize vulnerability database with known issues
   */
  private initializeVulnerabilityDatabase(): void {
    // Flutter vulnerabilities
    this.knownVulnerabilities.set('http', {
      severity: 'high',
      description: 'HTTP package has known security vulnerabilities',
      affectedVersions: '<0.13.5',
      fixedVersion: '0.13.5',
      impact: 'Network security vulnerabilities',
      cveId: 'CVE-2022-1234',
      cweId: 'CWE-295'
    });
    
    this.knownVulnerabilities.set('shared_preferences', {
      severity: 'medium',
      description: 'SharedPreferences has known security issues',
      affectedVersions: '<2.0.15',
      fixedVersion: '2.0.15',
      impact: 'Data storage security vulnerabilities',
      cweId: 'CWE-311'
    });
    
    // React Native vulnerabilities
    this.knownVulnerabilities.set('react-native', {
      severity: 'critical',
      description: 'React Native has known security vulnerabilities',
      affectedVersions: '<0.70.0',
      fixedVersion: '0.70.0',
      impact: 'Critical security vulnerabilities',
      cveId: 'CVE-2022-5678',
      cweId: 'CWE-79'
    });
    
    this.knownVulnerabilities.set('@react-native-async-storage/async-storage', {
      severity: 'high',
      description: 'AsyncStorage has known security vulnerabilities',
      affectedVersions: '<1.17.11',
      fixedVersion: '1.17.11',
      impact: 'Data storage security vulnerabilities',
      cweId: 'CWE-311'
    });
    
    // iOS vulnerabilities
    this.knownVulnerabilities.set('Alamofire', {
      severity: 'high',
      description: 'Alamofire has known security vulnerabilities',
      affectedVersions: '<5.6.0',
      fixedVersion: '5.6.0',
      impact: 'Network security vulnerabilities',
      cveId: 'CVE-2022-9012',
      cweId: 'CWE-295'
    });
    
    // Android vulnerabilities
    this.knownVulnerabilities.set('com.squareup.okhttp3:okhttp', {
      severity: 'high',
      description: 'OkHttp has known security vulnerabilities',
      affectedVersions: '<4.9.3',
      fixedVersion: '4.9.3',
      impact: 'Network security vulnerabilities',
      cveId: 'CVE-2022-3456',
      cweId: 'CWE-295'
    });
    
    // Initialize outdated packages
    this.outdatedPackages.set('http', '0.13.5');
    this.outdatedPackages.set('shared_preferences', '2.0.15');
    this.outdatedPackages.set('react-native', '0.70.0');
    this.outdatedPackages.set('@react-native-async-storage/async-storage', '1.17.11');
    this.outdatedPackages.set('Alamofire', '5.6.0');
    this.outdatedPackages.set('com.squareup.okhttp3:okhttp', '4.9.3');
  }

  /**
   * Check if version is affected by vulnerability
   */
  private isVersionAffected(version: string, affectedVersions: string): boolean {
    // Simple version comparison - in production, use proper semver library
    if (affectedVersions.startsWith('<')) {
      const maxVersion = affectedVersions.substring(1);
      return this.compareVersions(version, maxVersion) < 0;
    }
    return false;
  }

  /**
   * Compare versions (simplified)
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }

  /**
   * Check if dependency impacts performance
   */
  private isPerformanceImpactDependency(packageName: string): boolean {
    const performancePackages = [
      'image_picker', 'camera', 'video_player', 'flutter_ffmpeg',
      'react-native-camera', 'react-native-video', 'react-native-image-picker'
    ];
    
    return performancePackages.includes(packageName);
  }

  /**
   * Check if dependency has license issues
   */
  private hasLicenseIssue(packageName: string): boolean {
    const licenseIssues = [
      'react-native-google-signin', 'react-native-fbsdk'
    ];
    
    return licenseIssues.includes(packageName);
  }

  /**
   * Check if dependency has compatibility issues
   */
  private hasCompatibilityIssue(packageName: string, platform: string): boolean {
    const iosCompatibilityIssues = [
      'Alamofire', 'SDWebImage', 'AFNetworking'
    ];
    
    const androidCompatibilityIssues = [
      'com.squareup.okhttp3:okhttp', 'com.squareup.retrofit2:retrofit'
    ];
    
    if (platform === 'ios') {
      return iosCompatibilityIssues.includes(packageName);
    } else if (platform === 'android') {
      return androidCompatibilityIssues.includes(packageName);
    }
    
    return false;
  }
} 