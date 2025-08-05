import * as path from 'path';

export interface EnhancedMobileSecurityIssue {
  id: string;
  type: 'certificate-pinning' | 'biometric-auth' | 'secure-storage' | 'network-security' | 'permission-handling' | 'code-obfuscation' | 'data-encryption' | 'api-security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  codeSnippet: string;
  suggestion: string;
  impact: string;
  cweId?: string;
  framework: 'flutter' | 'react-native' | 'ios' | 'android' | 'cross-platform';
  securityPattern: string;
  remediation: string;
  estimatedEffort: number;
}

export interface EnhancedMobileSecurityResult {
  issues: EnhancedMobileSecurityIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
    securityScore: number;
    certificatePinningScore: number;
    biometricAuthScore: number;
    secureStorageScore: number;
    networkSecurityScore: number;
  };
  recommendations: {
    priority: 'immediate' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedEffort: number;
    impact: string;
    securityPattern: string;
  }[];
}

export class EnhancedMobileSecurityAnalyzer {
  private securityPatterns: Map<string, RegExp[]>;
  private vulnerabilityDatabase: Map<string, any>;

  constructor() {
    this.securityPatterns = new Map();
    this.vulnerabilityDatabase = new Map();
    this.initializeSecurityPatterns();
    this.initializeVulnerabilityDatabase();
  }

  /**
   * Initialize security patterns for detection
   */
  private initializeSecurityPatterns(): void {
    // Certificate Pinning Patterns
    this.securityPatterns.set('certificate-pinning', [
      /SSLPinningManager/,
      /certificatePinning/,
      /pinCertificate/,
      /NSURLSession.*pinnedCertificates/,
      /OkHttp.*CertificatePinner/,
      /TrustManager.*pinnedCertificates/,
      /flutter_secure_storage.*certificate/,
      /react-native-ssl-pinning/
    ]);

    // Biometric Authentication Patterns
    this.securityPatterns.set('biometric-auth', [
      /LocalAuthentication/,
      /BiometricAuthentication/,
      /FingerprintManager/,
      /BiometricPrompt/,
      /flutter_local_auth/,
      /react-native-biometrics/,
      /FaceID/,
      /TouchID/
    ]);

    // Secure Storage Patterns
    this.securityPatterns.set('secure-storage', [
      /KeychainServices/,
      /SharedPreferences.*MODE_PRIVATE/,
      /flutter_secure_storage/,
      /react-native-keychain/,
      /EncryptedSharedPreferences/,
      /SQLCipher/,
      /Realm.*encryption/
    ]);

    // Network Security Patterns
    this.securityPatterns.set('network-security', [
      /https:\/\//,
      /NSAppTransportSecurity/,
      /android:usesCleartextTraffic.*false/,
      /NetworkSecurityConfig/,
      /CertificatePinner/,
      /SSLContext.*TLS/
    ]);

    // Permission Handling Patterns
    this.securityPatterns.set('permission-handling', [
      /requestPermissions/,
      /checkSelfPermission/,
      /requestWhenInUseAuthorization/,
      /requestAlwaysAuthorization/,
      /PermissionHandler/,
      /react-native-permissions/
    ]);

    // Code Obfuscation Patterns
    this.securityPatterns.set('code-obfuscation', [
      /ProGuard/,
      /R8.*obfuscation/,
      /flutter_obfuscate/,
      /react-native-obfuscator/,
      /-keepattributes.*SourceFile/,
      /minifyEnabled.*true/
    ]);

    // Data Encryption Patterns
    this.securityPatterns.set('data-encryption', [
      /AES\.encrypt/,
      /CryptoJS/,
      /Cipher/,
      /Encryptor/,
      /flutter_encrypt/,
      /react-native-crypto/
    ]);

    // API Security Patterns
    this.securityPatterns.set('api-security', [
      /Authorization.*Bearer/,
      /API_KEY/,
      /apiKey/,
      /JWT/,
      /OAuth/,
      /refreshToken/
    ]);
  }

  /**
   * Initialize vulnerability database
   */
  private initializeVulnerabilityDatabase(): void {
    // Known vulnerabilities and their patterns
    this.vulnerabilityDatabase.set('hardcoded-credentials', {
      patterns: [
        /password\s*=\s*['"][^'"]+['"]/,
        /apiKey\s*=\s*['"][^'"]+['"]/,
        /secret\s*=\s*['"][^'"]+['"]/,
        /token\s*=\s*['"][^'"]+['"]/
      ],
      severity: 'critical',
      cweId: 'CWE-259'
    });

    this.vulnerabilityDatabase.set('insecure-http', {
      patterns: [
        /http:\/\//,
        /NSAppTransportSecurity.*NSAllowsArbitraryLoads.*true/,
        /android:usesCleartextTraffic.*true/
      ],
      severity: 'high',
      cweId: 'CWE-319'
    });

    this.vulnerabilityDatabase.set('weak-crypto', {
      patterns: [
        /MD5/,
        /SHA1/,
        /DES/,
        /RC4/,
        /Blowfish/
      ],
      severity: 'high',
      cweId: 'CWE-327'
    });
  }

  /**
   * Analyze mobile security for Flutter
   */
  async analyzeFlutterSecurity(content: string, filePath: string): Promise<EnhancedMobileSecurityResult> {
    const issues: EnhancedMobileSecurityIssue[] = [];
    
    // Check for certificate pinning
    const certificatePinningIssues = this.checkCertificatePinning(content, filePath, 'flutter');
    issues.push(...certificatePinningIssues);
    
    // Check for biometric authentication
    const biometricIssues = this.checkBiometricAuthentication(content, filePath, 'flutter');
    issues.push(...biometricIssues);
    
    // Check for secure storage
    const secureStorageIssues = this.checkSecureStorage(content, filePath, 'flutter');
    issues.push(...secureStorageIssues);
    
    // Check for network security
    const networkSecurityIssues = this.checkNetworkSecurity(content, filePath, 'flutter');
    issues.push(...networkSecurityIssues);
    
    // Check for permission handling
    const permissionIssues = this.checkPermissionHandling(content, filePath, 'flutter');
    issues.push(...permissionIssues);
    
    // Check for code obfuscation
    const obfuscationIssues = this.checkCodeObfuscation(content, filePath, 'flutter');
    issues.push(...obfuscationIssues);
    
    // Check for data encryption
    const encryptionIssues = this.checkDataEncryption(content, filePath, 'flutter');
    issues.push(...encryptionIssues);
    
    // Check for API security
    const apiSecurityIssues = this.checkAPISecurity(content, filePath, 'flutter');
    issues.push(...apiSecurityIssues);
    
    // Check for vulnerabilities
    const vulnerabilityIssues = this.checkVulnerabilities(content, filePath, 'flutter');
    issues.push(...vulnerabilityIssues);
    
    return this.createSecurityResult(issues);
  }

  /**
   * Analyze mobile security for React Native
   */
  async analyzeReactNativeSecurity(content: string, filePath: string): Promise<EnhancedMobileSecurityResult> {
    const issues: EnhancedMobileSecurityIssue[] = [];
    
    // Check for certificate pinning
    const certificatePinningIssues = this.checkCertificatePinning(content, filePath, 'react-native');
    issues.push(...certificatePinningIssues);
    
    // Check for biometric authentication
    const biometricIssues = this.checkBiometricAuthentication(content, filePath, 'react-native');
    issues.push(...biometricIssues);
    
    // Check for secure storage
    const secureStorageIssues = this.checkSecureStorage(content, filePath, 'react-native');
    issues.push(...secureStorageIssues);
    
    // Check for network security
    const networkSecurityIssues = this.checkNetworkSecurity(content, filePath, 'react-native');
    issues.push(...networkSecurityIssues);
    
    // Check for permission handling
    const permissionIssues = this.checkPermissionHandling(content, filePath, 'react-native');
    issues.push(...permissionIssues);
    
    // Check for code obfuscation
    const obfuscationIssues = this.checkCodeObfuscation(content, filePath, 'react-native');
    issues.push(...obfuscationIssues);
    
    // Check for data encryption
    const encryptionIssues = this.checkDataEncryption(content, filePath, 'react-native');
    issues.push(...encryptionIssues);
    
    // Check for API security
    const apiSecurityIssues = this.checkAPISecurity(content, filePath, 'react-native');
    issues.push(...apiSecurityIssues);
    
    // Check for vulnerabilities
    const vulnerabilityIssues = this.checkVulnerabilities(content, filePath, 'react-native');
    issues.push(...vulnerabilityIssues);
    
    return this.createSecurityResult(issues);
  }

  /**
   * Check for certificate pinning implementation
   */
  private checkCertificatePinning(content: string, filePath: string, framework: string): EnhancedMobileSecurityIssue[] {
    const issues: EnhancedMobileSecurityIssue[] = [];
    const patterns = this.securityPatterns.get('certificate-pinning') || [];
    
    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        issues.push({
          id: `cert-pinning-${Date.now()}-${index}`,
          type: 'certificate-pinning',
          severity: 'high',
          title: 'Certificate Pinning Detected',
          description: 'Certificate pinning is implemented, which is good for security.',
          file: path.basename(filePath),
          line: this.findLineNumber(content, pattern),
          codeSnippet: this.extractCodeSnippet(content, pattern),
          suggestion: 'Ensure certificate pinning is properly configured and certificates are up to date.',
          impact: 'Positive security impact - prevents man-in-the-middle attacks',
          framework: framework as any,
          securityPattern: 'Certificate Pinning',
          remediation: 'Regularly update pinned certificates and monitor for certificate expiration.',
          estimatedEffort: 2
        });
      }
    });
    
    // Check for missing certificate pinning
    if (content.includes('https://') && !patterns.some(p => p.test(content))) {
      issues.push({
        id: `missing-cert-pinning-${Date.now()}`,
        type: 'certificate-pinning',
        severity: 'medium',
        title: 'Certificate Pinning Not Implemented',
        description: 'HTTPS is used but certificate pinning is not implemented.',
        file: path.basename(filePath),
        line: this.findLineNumber(content, /https:\/\//),
        codeSnippet: this.extractCodeSnippet(content, /https:\/\//),
        suggestion: 'Implement certificate pinning to prevent man-in-the-middle attacks.',
        impact: 'Vulnerable to certificate-based attacks',
        framework: framework as any,
        securityPattern: 'Certificate Pinning',
        remediation: 'Implement certificate pinning using framework-specific libraries.',
        estimatedEffort: 8
      });
    }
    
    return issues;
  }

  /**
   * Check for biometric authentication implementation
   */
  private checkBiometricAuthentication(content: string, filePath: string, framework: string): EnhancedMobileSecurityIssue[] {
    const issues: EnhancedMobileSecurityIssue[] = [];
    const patterns = this.securityPatterns.get('biometric-auth') || [];
    
    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        issues.push({
          id: `biometric-auth-${Date.now()}-${index}`,
          type: 'biometric-auth',
          severity: 'medium',
          title: 'Biometric Authentication Detected',
          description: 'Biometric authentication is implemented for enhanced security.',
          file: path.basename(filePath),
          line: this.findLineNumber(content, pattern),
          codeSnippet: this.extractCodeSnippet(content, pattern),
          suggestion: 'Ensure biometric authentication is properly configured with fallback options.',
          impact: 'Positive security impact - provides strong user authentication',
          framework: framework as any,
          securityPattern: 'Biometric Authentication',
          remediation: 'Implement proper fallback mechanisms and handle biometric failures gracefully.',
          estimatedEffort: 4
        });
      }
    });
    
    return issues;
  }

  /**
   * Check for secure storage implementation
   */
  private checkSecureStorage(content: string, filePath: string, framework: string): EnhancedMobileSecurityIssue[] {
    const issues: EnhancedMobileSecurityIssue[] = [];
    const patterns = this.securityPatterns.get('secure-storage') || [];
    
    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        issues.push({
          id: `secure-storage-${Date.now()}-${index}`,
          type: 'secure-storage',
          severity: 'high',
          title: 'Secure Storage Detected',
          description: 'Secure storage is implemented for sensitive data.',
          file: path.basename(filePath),
          line: this.findLineNumber(content, pattern),
          codeSnippet: this.extractCodeSnippet(content, pattern),
          suggestion: 'Ensure all sensitive data is stored using secure storage mechanisms.',
          impact: 'Positive security impact - protects sensitive data',
          framework: framework as any,
          securityPattern: 'Secure Storage',
          remediation: 'Review all data storage to ensure sensitive information uses secure storage.',
          estimatedEffort: 6
        });
      }
    });
    
    // Check for insecure storage patterns
    const insecurePatterns = [
      /SharedPreferences/,
      /UserDefaults/,
      /NSUserDefaults/,
      /AsyncStorage/
    ];
    
    insecurePatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        issues.push({
          id: `insecure-storage-${Date.now()}-${index}`,
          type: 'secure-storage',
          severity: 'medium',
          title: 'Insecure Storage Detected',
          description: 'Data is stored using potentially insecure storage mechanisms.',
          file: path.basename(filePath),
          line: this.findLineNumber(content, pattern),
          codeSnippet: this.extractCodeSnippet(content, pattern),
          suggestion: 'Use secure storage for sensitive data instead of regular storage.',
          impact: 'Sensitive data may be vulnerable to unauthorized access',
          framework: framework as any,
          securityPattern: 'Secure Storage',
          remediation: 'Replace insecure storage with secure storage mechanisms for sensitive data.',
          estimatedEffort: 8
        });
      }
    });
    
    return issues;
  }

  /**
   * Check for network security implementation
   */
  private checkNetworkSecurity(content: string, filePath: string, framework: string): EnhancedMobileSecurityIssue[] {
    const issues: EnhancedMobileSecurityIssue[] = [];
    const patterns = this.securityPatterns.get('network-security') || [];
    
    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        issues.push({
          id: `network-security-${Date.now()}-${index}`,
          type: 'network-security',
          severity: 'medium',
          title: 'Network Security Configuration Detected',
          description: 'Network security is properly configured.',
          file: path.basename(filePath),
          line: this.findLineNumber(content, pattern),
          codeSnippet: this.extractCodeSnippet(content, pattern),
          suggestion: 'Ensure network security configuration is comprehensive and up to date.',
          impact: 'Positive security impact - enforces secure network communication',
          framework: framework as any,
          securityPattern: 'Network Security',
          remediation: 'Regularly review and update network security configurations.',
          estimatedEffort: 3
        });
      }
    });
    
    return issues;
  }

  /**
   * Check for permission handling
   */
  private checkPermissionHandling(content: string, filePath: string, framework: string): EnhancedMobileSecurityIssue[] {
    const issues: EnhancedMobileSecurityIssue[] = [];
    const patterns = this.securityPatterns.get('permission-handling') || [];
    
    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        issues.push({
          id: `permission-handling-${Date.now()}-${index}`,
          type: 'permission-handling',
          severity: 'medium',
          title: 'Permission Handling Detected',
          description: 'Runtime permissions are properly handled.',
          file: path.basename(filePath),
          line: this.findLineNumber(content, pattern),
          codeSnippet: this.extractCodeSnippet(content, pattern),
          suggestion: 'Ensure all required permissions are properly requested and handled.',
          impact: 'Positive security impact - proper permission management',
          framework: framework as any,
          securityPattern: 'Permission Handling',
          remediation: 'Review all permission requests and ensure minimal required permissions.',
          estimatedEffort: 4
        });
      }
    });
    
    return issues;
  }

  /**
   * Check for code obfuscation
   */
  private checkCodeObfuscation(content: string, filePath: string, framework: string): EnhancedMobileSecurityIssue[] {
    const issues: EnhancedMobileSecurityIssue[] = [];
    const patterns = this.securityPatterns.get('code-obfuscation') || [];
    
    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        issues.push({
          id: `code-obfuscation-${Date.now()}-${index}`,
          type: 'code-obfuscation',
          severity: 'low',
          title: 'Code Obfuscation Detected',
          description: 'Code obfuscation is implemented for protection against reverse engineering.',
          file: path.basename(filePath),
          line: this.findLineNumber(content, pattern),
          codeSnippet: this.extractCodeSnippet(content, pattern),
          suggestion: 'Ensure obfuscation is properly configured and tested.',
          impact: 'Positive security impact - makes reverse engineering more difficult',
          framework: framework as any,
          securityPattern: 'Code Obfuscation',
          remediation: 'Regularly update obfuscation configurations and test obfuscated builds.',
          estimatedEffort: 2
        });
      }
    });
    
    return issues;
  }

  /**
   * Check for data encryption
   */
  private checkDataEncryption(content: string, filePath: string, framework: string): EnhancedMobileSecurityIssue[] {
    const issues: EnhancedMobileSecurityIssue[] = [];
    const patterns = this.securityPatterns.get('data-encryption') || [];
    
    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        issues.push({
          id: `data-encryption-${Date.now()}-${index}`,
          type: 'data-encryption',
          severity: 'high',
          title: 'Data Encryption Detected',
          description: 'Data encryption is implemented for sensitive information.',
          file: path.basename(filePath),
          line: this.findLineNumber(content, pattern),
          codeSnippet: this.extractCodeSnippet(content, pattern),
          suggestion: 'Ensure encryption algorithms and keys are properly managed.',
          impact: 'Positive security impact - protects sensitive data',
          framework: framework as any,
          securityPattern: 'Data Encryption',
          remediation: 'Regularly review encryption implementation and key management.',
          estimatedEffort: 6
        });
      }
    });
    
    return issues;
  }

  /**
   * Check for API security
   */
  private checkAPISecurity(content: string, filePath: string, framework: string): EnhancedMobileSecurityIssue[] {
    const issues: EnhancedMobileSecurityIssue[] = [];
    const patterns = this.securityPatterns.get('api-security') || [];
    
    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        issues.push({
          id: `api-security-${Date.now()}-${index}`,
          type: 'api-security',
          severity: 'medium',
          title: 'API Security Implementation Detected',
          description: 'API security measures are implemented.',
          file: path.basename(filePath),
          line: this.findLineNumber(content, pattern),
          codeSnippet: this.extractCodeSnippet(content, pattern),
          suggestion: 'Ensure API security is comprehensive and tokens are properly managed.',
          impact: 'Positive security impact - protects API communications',
          framework: framework as any,
          securityPattern: 'API Security',
          remediation: 'Implement proper token management and API security best practices.',
          estimatedEffort: 8
        });
      }
    });
    
    return issues;
  }

  /**
   * Check for known vulnerabilities
   */
  private checkVulnerabilities(content: string, filePath: string, framework: string): EnhancedMobileSecurityIssue[] {
    const issues: EnhancedMobileSecurityIssue[] = [];
    
    this.vulnerabilityDatabase.forEach((vuln, key) => {
      vuln.patterns.forEach((pattern: RegExp, index: number) => {
        if (pattern.test(content)) {
          issues.push({
            id: `vulnerability-${key}-${Date.now()}-${index}`,
            type: 'api-security',
            severity: vuln.severity as any,
            title: `Security Vulnerability: ${key.replace('-', ' ').toUpperCase()}`,
            description: `Detected ${key} vulnerability in the code.`,
            file: path.basename(filePath),
            line: this.findLineNumber(content, pattern),
            codeSnippet: this.extractCodeSnippet(content, pattern),
            suggestion: `Remove or fix the ${key} vulnerability.`,
            impact: 'Critical security vulnerability',
            cweId: vuln.cweId,
            framework: framework as any,
            securityPattern: 'Vulnerability Detection',
            remediation: `Implement proper security measures to address ${key}.`,
            estimatedEffort: 12
          });
        }
      });
    });
    
    return issues;
  }

  /**
   * Find line number for a pattern match
   */
  private findLineNumber(content: string, pattern: RegExp): number {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Extract code snippet around a pattern match
   */
  private extractCodeSnippet(content: string, pattern: RegExp): string {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 3);
        return lines.slice(start, end).join('\n');
      }
    }
    return 'Code snippet not available';
  }

  /**
   * Create security analysis result
   */
  private createSecurityResult(issues: EnhancedMobileSecurityIssue[]): EnhancedMobileSecurityResult {
    const summary = {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highPriorityIssues: issues.filter(i => i.severity === 'high').length,
      mediumPriorityIssues: issues.filter(i => i.severity === 'medium').length,
      lowPriorityIssues: issues.filter(i => i.severity === 'low').length,
      securityScore: this.calculateSecurityScore(issues),
      certificatePinningScore: this.calculatePatternScore(issues, 'certificate-pinning'),
      biometricAuthScore: this.calculatePatternScore(issues, 'biometric-auth'),
      secureStorageScore: this.calculatePatternScore(issues, 'secure-storage'),
      networkSecurityScore: this.calculatePatternScore(issues, 'network-security')
    };

    const recommendations = this.createSecurityRecommendations(issues);

    return {
      issues,
      summary,
      recommendations
    };
  }

  /**
   * Calculate overall security score
   */
  private calculateSecurityScore(issues: EnhancedMobileSecurityIssue[]): number {
    const positiveIssues = issues.filter(i => i.impact.includes('Positive'));
    const negativeIssues = issues.filter(i => !i.impact.includes('Positive'));
    
    let score = 100;
    
    // Deduct points for negative issues
    negativeIssues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    // Add points for positive security implementations
    positiveIssues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score += 15;
          break;
        case 'medium':
          score += 10;
          break;
        case 'low':
          score += 5;
          break;
      }
    });
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate pattern-specific score
   */
  private calculatePatternScore(issues: EnhancedMobileSecurityIssue[], pattern: string): number {
    const patternIssues = issues.filter(i => i.type === pattern);
    const positiveIssues = patternIssues.filter(i => i.impact.includes('Positive'));
    const negativeIssues = patternIssues.filter(i => !i.impact.includes('Positive'));
    
    let score = 50; // Base score
    
    // Add points for positive implementations
    score += positiveIssues.length * 25;
    
    // Deduct points for negative issues
    score -= negativeIssues.length * 15;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Create security recommendations
   */
  private createSecurityRecommendations(issues: EnhancedMobileSecurityIssue[]): any[] {
    const recommendations = [];
    
    // Check for missing certificate pinning
    const hasCertificatePinning = issues.some(i => i.type === 'certificate-pinning' && i.impact.includes('Positive'));
    if (!hasCertificatePinning) {
      recommendations.push({
        priority: 'high',
        title: 'Implement Certificate Pinning',
        description: 'Certificate pinning is not implemented, making the app vulnerable to man-in-the-middle attacks.',
        estimatedEffort: 8,
        impact: 'Critical security improvement',
        securityPattern: 'Certificate Pinning'
      });
    }
    
    // Check for missing secure storage
    const hasSecureStorage = issues.some(i => i.type === 'secure-storage' && i.impact.includes('Positive'));
    if (!hasSecureStorage) {
      recommendations.push({
        priority: 'high',
        title: 'Implement Secure Storage',
        description: 'Secure storage is not implemented, potentially exposing sensitive data.',
        estimatedEffort: 6,
        impact: 'High security improvement',
        securityPattern: 'Secure Storage'
      });
    }
    
    // Check for critical vulnerabilities
    const criticalVulnerabilities = issues.filter(i => i.severity === 'critical');
    if (criticalVulnerabilities.length > 0) {
      recommendations.push({
        priority: 'immediate',
        title: 'Fix Critical Security Vulnerabilities',
        description: `Found ${criticalVulnerabilities.length} critical security vulnerabilities that must be addressed immediately.`,
        estimatedEffort: 12,
        impact: 'Critical security fix',
        securityPattern: 'Vulnerability Remediation'
      });
    }
    
    return recommendations;
  }
} 