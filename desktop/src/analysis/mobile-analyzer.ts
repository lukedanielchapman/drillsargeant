import * as path from 'path';
import { EnhancedAnalysisIssue, EnhancedAnalysisResult } from './enhanced-analyzer';

export interface MobileAnalysisResult extends EnhancedAnalysisResult {
  mobileSpecific: {
    platformIssues: MobilePlatformIssue[];
    performanceIssues: MobilePerformanceIssue[];
    accessibilityIssues: MobileAccessibilityIssue[];
    securityIssues: MobileSecurityIssue[];
  };
}

export interface MobilePlatformIssue {
  type: 'ios' | 'android' | 'cross-platform';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  suggestion: string;
  impact: string;
}

export interface MobilePerformanceIssue {
  type: 'memory' | 'battery' | 'network' | 'ui' | 'storage';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  suggestion: string;
  impact: string;
}

export interface MobileAccessibilityIssue {
  type: 'screen-reader' | 'navigation' | 'contrast' | 'touch-target' | 'semantic';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  suggestion: string;
  impact: string;
}

export interface MobileSecurityIssue {
  type: 'data-storage' | 'network' | 'permissions' | 'code-injection' | 'reverse-engineering';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  suggestion: string;
  impact: string;
}

export class MobileAnalyzer {
  private supportedExtensions: string[];
  private mobileFrameworks: string[];

  constructor() {
    this.supportedExtensions = [
      // Flutter/Dart
      '.dart', '.yaml', '.yml',
      // React Native
      '.js', '.jsx', '.ts', '.tsx', '.json',
      // iOS/Swift
      '.swift', '.m', '.h', '.mm', '.plist', '.storyboard', '.xib',
      // Android/Java/Kotlin
      '.java', '.kt', '.xml', '.gradle', '.properties',
      // Xamarin
      '.cs', '.xaml', '.axml',
      // Cordova/PhoneGap
      '.html', '.css', '.js', '.config.xml',
      // NativeScript
      '.xml', '.js', '.ts',
      // Ionic
      '.html', '.scss', '.ts', '.js'
    ];

    this.mobileFrameworks = [
      'flutter', 'react-native', 'xamarin', 'ionic', 'cordova', 
      'phonegap', 'nativescript', 'xcode', 'android-studio'
    ];
  }

  /**
   * Analyze Flutter/Dart files
   */
  async analyzeFlutterFile(filePath: string, content: string): Promise<MobileAnalysisResult> {
    const issues: EnhancedAnalysisIssue[] = [];
    const platformIssues: MobilePlatformIssue[] = [];
    const performanceIssues: MobilePerformanceIssue[] = [];
    const accessibilityIssues: MobileAccessibilityIssue[] = [];
    const securityIssues: MobileSecurityIssue[] = [];

    const lines = content.split('\n');
    const fileName = path.basename(filePath);

    // Analyze Dart code for mobile-specific issues
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Performance Issues
      this.checkFlutterPerformanceIssues(line, lineNumber, fileName, performanceIssues);
      
      // Security Issues
      this.checkFlutterSecurityIssues(line, lineNumber, fileName, securityIssues);
      
      // Accessibility Issues
      this.checkFlutterAccessibilityIssues(line, lineNumber, fileName, accessibilityIssues);
      
      // Platform Issues
      this.checkFlutterPlatformIssues(line, lineNumber, fileName, platformIssues);
    }

    return {
      issues,
      metrics: this.calculateFlutterMetrics(content),
      summary: this.calculateFlutterSummary(issues, platformIssues, performanceIssues, accessibilityIssues, securityIssues),
      recommendations: this.generateFlutterRecommendations(platformIssues, performanceIssues, accessibilityIssues, securityIssues),
      mobileSpecific: {
        platformIssues,
        performanceIssues,
        accessibilityIssues,
        securityIssues
      }
    };
  }

  /**
   * Analyze React Native files
   */
  async analyzeReactNativeFile(filePath: string, content: string): Promise<MobileAnalysisResult> {
    const issues: EnhancedAnalysisIssue[] = [];
    const platformIssues: MobilePlatformIssue[] = [];
    const performanceIssues: MobilePerformanceIssue[] = [];
    const accessibilityIssues: MobileAccessibilityIssue[] = [];
    const securityIssues: MobileSecurityIssue[] = [];

    const lines = content.split('\n');
    const fileName = path.basename(filePath);

    // Analyze React Native code for mobile-specific issues
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Performance Issues
      this.checkReactNativePerformanceIssues(line, lineNumber, fileName, performanceIssues);
      
      // Security Issues
      this.checkReactNativeSecurityIssues(line, lineNumber, fileName, securityIssues);
      
      // Accessibility Issues
      this.checkReactNativeAccessibilityIssues(line, lineNumber, fileName, accessibilityIssues);
      
      // Platform Issues
      this.checkReactNativePlatformIssues(line, lineNumber, fileName, platformIssues);
    }

    return {
      issues,
      metrics: this.calculateReactNativeMetrics(content),
      summary: this.calculateReactNativeSummary(issues, platformIssues, performanceIssues, accessibilityIssues, securityIssues),
      recommendations: this.generateReactNativeRecommendations(platformIssues, performanceIssues, accessibilityIssues, securityIssues),
      mobileSpecific: {
        platformIssues,
        performanceIssues,
        accessibilityIssues,
        securityIssues
      }
    };
  }

  /**
   * Analyze iOS/Swift files
   */
  async analyzeIOSFile(filePath: string, content: string): Promise<MobileAnalysisResult> {
    const issues: EnhancedAnalysisIssue[] = [];
    const platformIssues: MobilePlatformIssue[] = [];
    const performanceIssues: MobilePerformanceIssue[] = [];
    const accessibilityIssues: MobileAccessibilityIssue[] = [];
    const securityIssues: MobileSecurityIssue[] = [];

    const lines = content.split('\n');
    const fileName = path.basename(filePath);

    // Analyze iOS/Swift code for mobile-specific issues
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Performance Issues
      this.checkIOSPerformanceIssues(line, lineNumber, fileName, performanceIssues);
      
      // Security Issues
      this.checkIOSSecurityIssues(line, lineNumber, fileName, securityIssues);
      
      // Accessibility Issues
      this.checkIOSAccessibilityIssues(line, lineNumber, fileName, accessibilityIssues);
      
      // Platform Issues
      this.checkIOSPlatformIssues(line, lineNumber, fileName, platformIssues);
    }

    return {
      issues,
      metrics: this.calculateIOSMetrics(content),
      summary: this.calculateIOSSummary(issues, platformIssues, performanceIssues, accessibilityIssues, securityIssues),
      recommendations: this.generateIOSRecommendations(platformIssues, performanceIssues, accessibilityIssues, securityIssues),
      mobileSpecific: {
        platformIssues,
        performanceIssues,
        accessibilityIssues,
        securityIssues
      }
    };
  }

  /**
   * Analyze Android/Java/Kotlin files
   */
  async analyzeAndroidFile(filePath: string, content: string): Promise<MobileAnalysisResult> {
    const issues: EnhancedAnalysisIssue[] = [];
    const platformIssues: MobilePlatformIssue[] = [];
    const performanceIssues: MobilePerformanceIssue[] = [];
    const accessibilityIssues: MobileAccessibilityIssue[] = [];
    const securityIssues: MobileSecurityIssue[] = [];

    const lines = content.split('\n');
    const fileName = path.basename(filePath);

    // Analyze Android code for mobile-specific issues
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Performance Issues
      this.checkAndroidPerformanceIssues(line, lineNumber, fileName, performanceIssues);
      
      // Security Issues
      this.checkAndroidSecurityIssues(line, lineNumber, fileName, securityIssues);
      
      // Accessibility Issues
      this.checkAndroidAccessibilityIssues(line, lineNumber, fileName, accessibilityIssues);
      
      // Platform Issues
      this.checkAndroidPlatformIssues(line, lineNumber, fileName, platformIssues);
    }

    return {
      issues,
      metrics: this.calculateAndroidMetrics(content),
      summary: this.calculateAndroidSummary(issues, platformIssues, performanceIssues, accessibilityIssues, securityIssues),
      recommendations: this.generateAndroidRecommendations(platformIssues, performanceIssues, accessibilityIssues, securityIssues),
      mobileSpecific: {
        platformIssues,
        performanceIssues,
        accessibilityIssues,
        securityIssues
      }
    };
  }

  // Flutter-specific analysis methods
  private checkFlutterPerformanceIssues(line: string, lineNumber: number, fileName: string, issues: MobilePerformanceIssue[]): void {
    // Memory leaks in Flutter
    if (line.includes('setState') && line.includes('() =>')) {
      issues.push({
        type: 'memory',
        severity: 'medium',
        title: 'Potential Memory Leak in setState',
        description: 'setState with arrow function can cause memory leaks in Flutter',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use proper state management or dispose controllers',
        impact: 'Memory usage increases over time'
      });
    }

    // Inefficient widget rebuilds
    if (line.includes('Widget build') && line.includes('context')) {
      issues.push({
        type: 'ui',
        severity: 'medium',
        title: 'Widget Rebuild Performance',
        description: 'Widget rebuilds can be optimized for better performance',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use const constructors and avoid unnecessary rebuilds',
        impact: 'UI performance degradation'
      });
    }

    // Heavy operations on main thread
    if (line.includes('compute') === false && (line.includes('http.get') || line.includes('File.read'))) {
      issues.push({
        type: 'network',
        severity: 'high',
        title: 'Blocking Operation on Main Thread',
        description: 'Network or file operations on main thread can cause UI freezing',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use compute() or async/await for heavy operations',
        impact: 'UI freezing and poor user experience'
      });
    }
  }

  private checkFlutterSecurityIssues(line: string, lineNumber: number, fileName: string, issues: MobileSecurityIssue[]): void {
    // Hardcoded API keys
    if (line.includes('api_key') || line.includes('secret') || line.includes('password')) {
      issues.push({
        type: 'data-storage',
        severity: 'critical',
        title: 'Hardcoded Credentials in Flutter',
        description: 'API keys or secrets should not be hardcoded in source code',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use environment variables or secure storage',
        impact: 'Credentials exposed in source code'
      });
    }

    // Insecure data storage
    if (line.includes('SharedPreferences') && (line.includes('password') || line.includes('token'))) {
      issues.push({
        type: 'data-storage',
        severity: 'high',
        title: 'Insecure Data Storage',
        description: 'Sensitive data stored in SharedPreferences without encryption',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use flutter_secure_storage for sensitive data',
        impact: 'Data exposure if device is compromised'
      });
    }
  }

  private checkFlutterAccessibilityIssues(line: string, lineNumber: number, fileName: string, issues: MobileAccessibilityIssue[]): void {
    // Missing semantic labels
    if (line.includes('GestureDetector') && !line.includes('semanticsLabel')) {
      issues.push({
        type: 'screen-reader',
        severity: 'medium',
        title: 'Missing Accessibility Label',
        description: 'GestureDetector without semantic label is not accessible',
        file: fileName,
        line: lineNumber,
        suggestion: 'Add semanticsLabel for screen reader support',
        impact: 'Poor accessibility for users with disabilities'
      });
    }

    // Small touch targets
    if (line.includes('SizedBox') && line.includes('height:') && line.includes('width:')) {
      const heightMatch = line.match(/height:\s*(\d+)/);
      const widthMatch = line.match(/width:\s*(\d+)/);
      if (heightMatch && widthMatch) {
        const height = parseInt(heightMatch[1]);
        const width = parseInt(widthMatch[1]);
        if (height < 48 || width < 48) {
          issues.push({
            type: 'touch-target',
            severity: 'medium',
            title: 'Small Touch Target',
            description: 'Touch target smaller than 48x48 pixels',
            file: fileName,
            line: lineNumber,
            suggestion: 'Increase touch target size to at least 48x48 pixels',
            impact: 'Difficult to tap for users with motor impairments'
          });
        }
      }
    }
  }

  private checkFlutterPlatformIssues(line: string, lineNumber: number, fileName: string, issues: MobilePlatformIssue[]): void {
    // Platform-specific code without proper checks
    if (line.includes('Platform.isIOS') || line.includes('Platform.isAndroid')) {
      issues.push({
        type: 'cross-platform',
        severity: 'low',
        title: 'Platform-Specific Code',
        description: 'Platform-specific code detected',
        file: fileName,
        line: lineNumber,
        suggestion: 'Ensure proper platform checks and fallbacks',
        impact: 'Potential crashes on unsupported platforms'
      });
    }
  }

  // React Native-specific analysis methods
  private checkReactNativePerformanceIssues(line: string, lineNumber: number, fileName: string, issues: MobilePerformanceIssue[]): void {
    // Inefficient re-renders
    if (line.includes('useState') && line.includes('useEffect')) {
      issues.push({
        type: 'ui',
        severity: 'medium',
        title: 'Potential Re-render Issue',
        description: 'useState and useEffect combination can cause unnecessary re-renders',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use useCallback and useMemo for optimization',
        impact: 'Performance degradation with frequent re-renders'
      });
    }

    // Large bundle size
    if (line.includes('import') && line.includes('lodash') || line.includes('moment')) {
      issues.push({
        type: 'memory',
        severity: 'medium',
        title: 'Large Library Import',
        description: 'Large libraries increase bundle size and startup time',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use tree-shaking or smaller alternatives',
        impact: 'Slower app startup and larger bundle size'
      });
    }
  }

  private checkReactNativeSecurityIssues(line: string, lineNumber: number, fileName: string, issues: MobileSecurityIssue[]): void {
    // AsyncStorage for sensitive data
    if (line.includes('AsyncStorage') && (line.includes('token') || line.includes('password'))) {
      issues.push({
        type: 'data-storage',
        severity: 'high',
        title: 'Insecure AsyncStorage Usage',
        description: 'Sensitive data stored in AsyncStorage without encryption',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use react-native-keychain for sensitive data',
        impact: 'Data exposure if device is compromised'
      });
    }

    // Insecure network requests
    if (line.includes('fetch') && line.includes('http://')) {
      issues.push({
        type: 'network',
        severity: 'high',
        title: 'Insecure Network Request',
        description: 'HTTP requests are not encrypted',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use HTTPS for all network requests',
        impact: 'Data interception and man-in-the-middle attacks'
      });
    }
  }

  private checkReactNativeAccessibilityIssues(line: string, lineNumber: number, fileName: string, issues: MobileAccessibilityIssue[]): void {
    // Missing accessibility props
    if (line.includes('TouchableOpacity') && !line.includes('accessibilityLabel')) {
      issues.push({
        type: 'screen-reader',
        severity: 'medium',
        title: 'Missing Accessibility Label',
        description: 'TouchableOpacity without accessibilityLabel',
        file: fileName,
        line: lineNumber,
        suggestion: 'Add accessibilityLabel prop for screen reader support',
        impact: 'Poor accessibility for users with disabilities'
      });
    }
  }

  private checkReactNativePlatformIssues(line: string, lineNumber: number, fileName: string, issues: MobilePlatformIssue[]): void {
    // Platform-specific code
    if (line.includes('Platform.OS') || line.includes('Platform.select')) {
      issues.push({
        type: 'cross-platform',
        severity: 'low',
        title: 'Platform-Specific Code',
        description: 'Platform-specific code detected',
        file: fileName,
        line: lineNumber,
        suggestion: 'Ensure proper platform checks and fallbacks',
        impact: 'Potential crashes on unsupported platforms'
      });
    }
  }

  // iOS/Swift-specific analysis methods
  private checkIOSPerformanceIssues(line: string, lineNumber: number, fileName: string, issues: MobilePerformanceIssue[]): void {
    // Memory leaks in closures
    if (line.includes('weak self') === false && line.includes('{') && line.includes('in')) {
      issues.push({
        type: 'memory',
        severity: 'medium',
        title: 'Potential Retain Cycle',
        description: 'Closure without weak self can cause retain cycles',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use [weak self] in closures to prevent retain cycles',
        impact: 'Memory leaks and app crashes'
      });
    }

    // Main thread blocking
    if (line.includes('DispatchQueue.main.async') === false && (line.includes('URLSession') || line.includes('FileManager'))) {
      issues.push({
        type: 'network',
        severity: 'high',
        title: 'Blocking Operation on Main Thread',
        description: 'Network or file operations on main thread',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use DispatchQueue.global() for background operations',
        impact: 'UI freezing and poor user experience'
      });
    }
  }

  private checkIOSSecurityIssues(line: string, lineNumber: number, fileName: string, issues: MobileSecurityIssue[]): void {
    // Insecure data storage
    if (line.includes('UserDefaults') && (line.includes('password') || line.includes('token'))) {
      issues.push({
        type: 'data-storage',
        severity: 'high',
        title: 'Insecure Data Storage',
        description: 'Sensitive data stored in UserDefaults without encryption',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use Keychain for sensitive data storage',
        impact: 'Data exposure if device is compromised'
      });
    }
  }

  private checkIOSAccessibilityIssues(line: string, lineNumber: number, fileName: string, issues: MobileAccessibilityIssue[]): void {
    // Missing accessibility labels
    if (line.includes('UILabel') && !line.includes('accessibilityLabel')) {
      issues.push({
        type: 'screen-reader',
        severity: 'medium',
        title: 'Missing Accessibility Label',
        description: 'UILabel without accessibility label',
        file: fileName,
        line: lineNumber,
        suggestion: 'Set accessibilityLabel for VoiceOver support',
        impact: 'Poor accessibility for users with disabilities'
      });
    }
  }

  private checkIOSPlatformIssues(line: string, lineNumber: number, fileName: string, issues: MobilePlatformIssue[]): void {
    // iOS version checks
    if (line.includes('UIDevice.current.systemVersion')) {
      issues.push({
        type: 'ios',
        severity: 'low',
        title: 'iOS Version Check',
        description: 'Manual iOS version checking detected',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use @available for better iOS version handling',
        impact: 'Potential crashes on unsupported iOS versions'
      });
    }
  }

  // Android-specific analysis methods
  private checkAndroidPerformanceIssues(line: string, lineNumber: number, fileName: string, issues: MobilePerformanceIssue[]): void {
    // Memory leaks in anonymous classes
    if (line.includes('new') && line.includes('{') && line.includes('}')) {
      issues.push({
        type: 'memory',
        severity: 'medium',
        title: 'Potential Memory Leak',
        description: 'Anonymous class can cause memory leaks',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use static inner classes or weak references',
        impact: 'Memory leaks and app crashes'
      });
    }

    // Main thread blocking
    if (line.includes('AsyncTask') === false && (line.includes('HttpURLConnection') || line.includes('File'))) {
      issues.push({
        type: 'network',
        severity: 'high',
        title: 'Blocking Operation on Main Thread',
        description: 'Network or file operations on main thread',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use AsyncTask or background threads',
        impact: 'UI freezing and ANR (Application Not Responding)'
      });
    }
  }

  private checkAndroidSecurityIssues(line: string, lineNumber: number, fileName: string, issues: MobileSecurityIssue[]): void {
    // Insecure data storage
    if (line.includes('SharedPreferences') && (line.includes('password') || line.includes('token'))) {
      issues.push({
        type: 'data-storage',
        severity: 'high',
        title: 'Insecure Data Storage',
        description: 'Sensitive data stored in SharedPreferences',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use EncryptedSharedPreferences for sensitive data',
        impact: 'Data exposure if device is compromised'
      });
    }
  }

  private checkAndroidAccessibilityIssues(line: string, lineNumber: number, fileName: string, issues: MobileAccessibilityIssue[]): void {
    // Missing content descriptions
    if (line.includes('ImageView') && !line.includes('android:contentDescription')) {
      issues.push({
        type: 'screen-reader',
        severity: 'medium',
        title: 'Missing Content Description',
        description: 'ImageView without content description',
        file: fileName,
        line: lineNumber,
        suggestion: 'Add android:contentDescription for TalkBack support',
        impact: 'Poor accessibility for users with disabilities'
      });
    }
  }

  private checkAndroidPlatformIssues(line: string, lineNumber: number, fileName: string, issues: MobilePlatformIssue[]): void {
    // Android version checks
    if (line.includes('Build.VERSION.SDK_INT')) {
      issues.push({
        type: 'android',
        severity: 'low',
        title: 'Android Version Check',
        description: 'Manual Android version checking detected',
        file: fileName,
        line: lineNumber,
        suggestion: 'Use @RequiresApi for better Android version handling',
        impact: 'Potential crashes on unsupported Android versions'
      });
    }
  }

  // Metrics calculation methods
  private calculateFlutterMetrics(content: string): any {
    const lines = content.split('\n');
    return {
      cyclomaticComplexity: this.calculateComplexity(lines),
      linesOfCode: lines.length,
      functionCount: (content.match(/Widget build/g) || []).length,
      classCount: (content.match(/class /g) || []).length,
      importCount: (content.match(/import /g) || []).length,
      commentRatio: this.calculateCommentRatio(content),
      duplicationPercentage: 0,
      securityScore: 100,
      performanceScore: 100,
      qualityScore: 100
    };
  }

  private calculateReactNativeMetrics(content: string): any {
    const lines = content.split('\n');
    return {
      cyclomaticComplexity: this.calculateComplexity(lines),
      linesOfCode: lines.length,
      functionCount: (content.match(/function /g) || []).length + (content.match(/const /g) || []).length,
      classCount: (content.match(/class /g) || []).length,
      importCount: (content.match(/import /g) || []).length,
      commentRatio: this.calculateCommentRatio(content),
      duplicationPercentage: 0,
      securityScore: 100,
      performanceScore: 100,
      qualityScore: 100
    };
  }

  private calculateIOSMetrics(content: string): any {
    const lines = content.split('\n');
    return {
      cyclomaticComplexity: this.calculateComplexity(lines),
      linesOfCode: lines.length,
      functionCount: (content.match(/func /g) || []).length,
      classCount: (content.match(/class /g) || []).length,
      importCount: (content.match(/import /g) || []).length,
      commentRatio: this.calculateCommentRatio(content),
      duplicationPercentage: 0,
      securityScore: 100,
      performanceScore: 100,
      qualityScore: 100
    };
  }

  private calculateAndroidMetrics(content: string): any {
    const lines = content.split('\n');
    return {
      cyclomaticComplexity: this.calculateComplexity(lines),
      linesOfCode: lines.length,
      functionCount: (content.match(/public void/g) || []).length + (content.match(/private void/g) || []).length,
      classCount: (content.match(/class /g) || []).length,
      importCount: (content.match(/import /g) || []).length,
      commentRatio: this.calculateCommentRatio(content),
      duplicationPercentage: 0,
      securityScore: 100,
      performanceScore: 100,
      qualityScore: 100
    };
  }

  // Helper methods
  private calculateComplexity(lines: string[]): number {
    let complexity = 1;
    for (const line of lines) {
      if (line.includes('if ') || line.includes('for ') || line.includes('while ') || line.includes('switch ')) {
        complexity++;
      }
    }
    return complexity;
  }

  private calculateCommentRatio(content: string): number {
    const lines = content.split('\n');
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || line.trim().startsWith('/*') || 
      line.trim().startsWith('*') || line.trim().startsWith('*/')
    ).length;
    
    return (commentLines / lines.length) * 100;
  }

  // Summary calculation methods
  private calculateFlutterSummary(issues: any[], platformIssues: any[], performanceIssues: any[], accessibilityIssues: any[], securityIssues: any[]): any {
    return {
      totalIssues: issues.length + platformIssues.length + performanceIssues.length + accessibilityIssues.length + securityIssues.length,
      criticalIssues: securityIssues.filter((i: any) => i.severity === 'critical').length,
      highPriorityIssues: performanceIssues.filter((i: any) => i.severity === 'high').length,
      mediumPriorityIssues: accessibilityIssues.filter((i: any) => i.severity === 'medium').length,
      lowPriorityIssues: platformIssues.filter((i: any) => i.severity === 'low').length,
      securityIssues: securityIssues.length,
      qualityIssues: issues.length,
      performanceIssues: performanceIssues.length,
      bestPracticeIssues: 0,
      memoryLeakIssues: performanceIssues.filter((i: any) => i.type === 'memory').length,
      duplicationIssues: 0
    };
  }

  private calculateReactNativeSummary(issues: any[], platformIssues: any[], performanceIssues: any[], accessibilityIssues: any[], securityIssues: any[]): any {
    return this.calculateFlutterSummary(issues, platformIssues, performanceIssues, accessibilityIssues, securityIssues);
  }

  private calculateIOSSummary(issues: any[], platformIssues: any[], performanceIssues: any[], accessibilityIssues: any[], securityIssues: any[]): any {
    return this.calculateFlutterSummary(issues, platformIssues, performanceIssues, accessibilityIssues, securityIssues);
  }

  private calculateAndroidSummary(issues: any[], platformIssues: any[], performanceIssues: any[], accessibilityIssues: any[], securityIssues: any[]): any {
    return this.calculateFlutterSummary(issues, platformIssues, performanceIssues, accessibilityIssues, securityIssues);
  }

  // Recommendation generation methods
  private generateFlutterRecommendations(platformIssues: any[], performanceIssues: any[], accessibilityIssues: any[], securityIssues: any[]): any[] {
    const recommendations = [];
    
    if (securityIssues.length > 0) {
      recommendations.push({
        priority: 'immediate',
        title: 'Address Flutter Security Issues',
        description: `Found ${securityIssues.length} security issues in Flutter code`,
        estimatedEffort: securityIssues.length * 2,
        impact: 'critical',
        files: [],
        issues: []
      });
    }
    
    if (performanceIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Optimize Flutter Performance',
        description: `Found ${performanceIssues.length} performance issues`,
        estimatedEffort: performanceIssues.length * 1.5,
        impact: 'high',
        files: [],
        issues: []
      });
    }
    
    return recommendations;
  }

  private generateReactNativeRecommendations(platformIssues: any[], performanceIssues: any[], accessibilityIssues: any[], securityIssues: any[]): any[] {
    return this.generateFlutterRecommendations(platformIssues, performanceIssues, accessibilityIssues, securityIssues);
  }

  private generateIOSRecommendations(platformIssues: any[], performanceIssues: any[], accessibilityIssues: any[], securityIssues: any[]): any[] {
    return this.generateFlutterRecommendations(platformIssues, performanceIssues, accessibilityIssues, securityIssues);
  }

  private generateAndroidRecommendations(platformIssues: any[], performanceIssues: any[], accessibilityIssues: any[], securityIssues: any[]): any[] {
    return this.generateFlutterRecommendations(platformIssues, performanceIssues, accessibilityIssues, securityIssues);
  }
} 