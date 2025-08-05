# Contributing to DrillSargeant

Thank you for your interest in contributing to DrillSargeant! This document provides guidelines and information for contributors.

## 🎯 **How to Contribute**

### **Types of Contributions**

We welcome contributions in the following areas:

1. **Code Analysis Improvements**
   - Enhanced security pattern detection
   - New language/framework support
   - Performance analysis improvements
   - Mobile framework analysis enhancements

2. **Reporting Enhancements**
   - New report formats
   - Improved visualization
   - Better actionable insights
   - Export functionality improvements

3. **User Interface Improvements**
   - Better user experience
   - Accessibility improvements
   - Mobile-responsive design
   - Dark mode support

4. **Documentation**
   - API documentation
   - User guides
   - Code examples
   - Best practices

5. **Testing**
   - Unit tests
   - Integration tests
   - Performance tests
   - Security tests

6. **Bug Fixes**
   - Bug reports
   - Issue reproduction
   - Fix implementation
   - Regression testing

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+
- Rust (for Tauri)
- Git
- A GitHub account

### **Development Setup**

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/DrillSargeant.git
   cd DrillSargeant
   ```

2. **Install dependencies**
   ```bash
   cd desktop
   npm install
   ```

3. **Set up development environment**
   ```bash
   # Install Rust (if not already installed)
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Install Tauri CLI
   cargo install tauri-cli
   ```

4. **Run the development server**
   ```bash
   npm run tauri dev
   ```

## 📝 **Development Guidelines**

### **Code Style**

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Comments**: Add JSDoc comments for public APIs
- **Naming**: Use descriptive variable and function names

### **File Structure**

```
DrillSargeant/
├── desktop/                 # Desktop application
│   ├── src/
│   │   ├── analysis/       # Analysis engines
│   │   ├── components/     # React components
│   │   ├── utils/          # Utility functions
│   │   └── main.ts         # Main application entry
│   ├── src-tauri/          # Tauri backend
│   └── package.json
├── docs/                   # Documentation
├── tests/                  # Test files
└── README.md
```

### **Analysis Engine Guidelines**

When adding new analysis capabilities:

1. **Create a new analyzer class** in `desktop/src/analysis/`
2. **Follow the existing interface patterns**
3. **Add comprehensive tests**
4. **Update the main integration**
5. **Document the new capabilities**

Example analyzer structure:
```typescript
export interface AnalysisResult {
  issues: AnalysisIssue[];
  summary: AnalysisSummary;
  recommendations: Recommendation[];
}

export class NewAnalyzer {
  async analyzeFile(content: string, filePath: string): Promise<AnalysisResult> {
    // Implementation
  }
}
```

### **Testing Guidelines**

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Ensure analysis performance

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔄 **Pull Request Process**

### **Before Submitting**

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm test
   npm run build
   npm run tauri dev
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new analysis capability"
   ```

### **Commit Message Format**

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

### **Pull Request Guidelines**

1. **Create a pull request** from your feature branch to `main`
2. **Provide a clear description** of your changes
3. **Include screenshots** for UI changes
4. **Reference related issues** using `#issue-number`
5. **Ensure all tests pass**
6. **Request review** from maintainers

### **Review Process**

- **Code Review**: All PRs require review
- **Automated Checks**: CI/CD pipeline must pass
- **Documentation**: Update docs for new features
- **Testing**: Ensure adequate test coverage

## 🐛 **Bug Reports**

### **Before Reporting**

1. **Check existing issues** to avoid duplicates
2. **Try the latest version** from the main branch
3. **Reproduce the issue** in a clean environment

### **Bug Report Template**

```markdown
**Bug Description**
Brief description of the issue.

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g., Windows 11, macOS 14, Ubuntu 22.04]
- Node.js Version: [e.g., 18.17.0]
- Rust Version: [e.g., 1.70.0]
- DrillSargeant Version: [e.g., 1.0.0]

**Additional Information**
- Screenshots if applicable
- Error logs
- Console output
```

## 💡 **Feature Requests**

### **Feature Request Template**

```markdown
**Feature Description**
Brief description of the requested feature.

**Use Case**
How this feature would be used.

**Proposed Implementation**
Optional: How you think this could be implemented.

**Alternatives Considered**
Optional: Other approaches you've considered.

**Additional Information**
Any other relevant information.
```

## 📚 **Documentation**

### **Documentation Guidelines**

- **Clear and concise** writing
- **Code examples** for complex features
- **Screenshots** for UI features
- **Step-by-step guides** for complex processes
- **API documentation** for developers

### **Documentation Structure**

```
docs/
├── getting-started.md
├── user-guide.md
├── api-reference.md
├── contributing.md
└── examples/
    ├── basic-usage.md
    ├── advanced-analysis.md
    └── mobile-analysis.md
```

## 🏷️ **Release Process**

### **Versioning**

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### **Release Checklist**

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes written
- [ ] Assets built and uploaded

## 🤝 **Community Guidelines**

### **Code of Conduct**

- **Be respectful** to all contributors
- **Be inclusive** of diverse perspectives
- **Be constructive** in feedback
- **Be helpful** to newcomers

### **Communication**

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions
- **Discord/Slack**: For real-time communication (if available)

## 🎉 **Recognition**

### **Contributor Recognition**

- **Contributors list** in README.md
- **Release notes** credit
- **Contributor badges** for significant contributions
- **Special thanks** for major features

### **Contributor Levels**

- **First-time contributor**: Welcome and guidance
- **Regular contributor**: Trusted with more responsibilities
- **Maintainer**: Can review and merge PRs
- **Core maintainer**: Full repository access

## 📞 **Getting Help**

### **Support Channels**

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/DrillSargeant/issues)
- **GitHub Discussions**: [Start a discussion](https://github.com/yourusername/DrillSargeant/discussions)
- **Documentation**: [Read the docs](https://github.com/yourusername/DrillSargeant/wiki)

### **Quick Questions**

For quick questions or clarifications:
1. Check the documentation first
2. Search existing issues and discussions
3. Ask in GitHub Discussions
4. Create an issue if needed

---

Thank you for contributing to DrillSargeant! Your contributions help make code analysis more comprehensive, intelligent, and accessible across all platforms. 🚀 