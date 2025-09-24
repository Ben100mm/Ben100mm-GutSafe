import { AccessibilityInfo, Platform } from 'react-native';
import AccessibilityService from './accessibility';

/**
 * AccessibilityTester - Comprehensive accessibility testing and validation
 * Provides automated testing for WCAG AA compliance and accessibility best practices
 */
class AccessibilityTester {
  private static instance: AccessibilityTester;
  private testResults: Map<string, any> = new Map();
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): AccessibilityTester {
    if (!AccessibilityTester.instance) {
      AccessibilityTester.instance = new AccessibilityTester();
    }
    return AccessibilityTester.instance;
  }

  /**
   * Run comprehensive accessibility tests
   */
  async runFullTestSuite(): Promise<{
    passed: number;
    failed: number;
    warnings: number;
    results: any[];
  }> {
    this.isRunning = true;
    this.testResults.clear();

    const tests = [
      this.testColorContrast(),
      this.testTouchTargetSizes(),
      this.testScreenReaderSupport(),
      this.testKeyboardNavigation(),
      this.testFocusManagement(),
      this.testSemanticStructure(),
      this.testAlternativeText(),
      this.testFormAccessibility(),
      this.testErrorHandling(),
      this.testLoadingStates(),
    ];

    const results = await Promise.all(tests);
    
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const warnings = results.filter(r => r.status === 'warning').length;

    this.isRunning = false;

    return {
      passed,
      failed,
      warnings,
      results,
    };
  }

  /**
   * Test color contrast compliance
   */
  private async testColorContrast(): Promise<any> {
    const testName = 'Color Contrast';
    const issues: string[] = [];

    try {
      // Test common color combinations
      const colorPairs = [
        { fg: '#000000', bg: '#FFFFFF', name: 'Black on White' },
        { fg: '#FFFFFF', bg: '#000000', name: 'White on Black' },
        { fg: '#0F5257', bg: '#FFFFFF', name: 'Primary on White' },
        { fg: '#FFFFFF', bg: '#0F5257', name: 'White on Primary' },
        { fg: '#666666', bg: '#FFFFFF', name: 'Gray on White' },
        { fg: '#FFFFFF', bg: '#666666', name: 'White on Gray' },
      ];

      for (const pair of colorPairs) {
        const contrast = AccessibilityService.checkColorContrast(pair.fg, pair.bg);
        
        if (!contrast.meetsAA) {
          issues.push(`${pair.name}: Contrast ratio ${contrast.ratio} (AA requires 4.5)`);
        }
        
        if (contrast.ratio < 3) {
          issues.push(`${pair.name}: Very low contrast ratio ${contrast.ratio}`);
        }
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : issues.length <= 2 ? 'warning' : 'failed',
        issues,
        details: 'Color contrast testing for WCAG AA compliance',
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: 'Color contrast testing failed',
      };
    }
  }

  /**
   * Test touch target sizes
   */
  private async testTouchTargetSizes(): Promise<any> {
    const testName = 'Touch Target Sizes';
    const issues: string[] = [];

    try {
      // Check if minimum touch target size is enforced
      const minSize = 44; // 44 points minimum
      const testSizes = [32, 40, 44, 48, 56];

      for (const size of testSizes) {
        const accessibleSize = AccessibilityService.getAccessibleSpacing(size);
        if (accessibleSize < minSize) {
          issues.push(`Touch target size ${size}pt is too small (minimum ${minSize}pt)`);
        }
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        details: 'Touch target size compliance testing',
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: 'Touch target size testing failed',
      };
    }
  }

  /**
   * Test screen reader support
   */
  private async testScreenReaderSupport(): Promise<any> {
    const testName = 'Screen Reader Support';
    const issues: string[] = [];

    try {
      const isScreenReaderEnabled = AccessibilityService.isScreenReaderActive();
      
      if (!isScreenReaderEnabled) {
        issues.push('Screen reader not detected - some tests may be limited');
      }

      // Test accessibility config creation
      const buttonConfig = AccessibilityService.createButtonConfig('Test Button', 'Test hint');
      if (!buttonConfig.accessible) {
        issues.push('Button accessibility config not properly set');
      }

      const cardConfig = AccessibilityService.createCardConfig('Test Card', 'Test subtitle');
      if (!cardConfig.accessible) {
        issues.push('Card accessibility config not properly set');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        details: 'Screen reader support and accessibility config testing',
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: 'Screen reader support testing failed',
      };
    }
  }

  /**
   * Test keyboard navigation
   */
  private async testKeyboardNavigation(): Promise<any> {
    const testName = 'Keyboard Navigation';
    const issues: string[] = [];

    try {
      // Test if keyboard navigation is properly configured
      const tabConfig = AccessibilityService.createTabConfig('Test Tab', true, 'Test hint');
      if (!tabConfig.accessible) {
        issues.push('Tab accessibility config not properly set');
      }

      const switchConfig = AccessibilityService.createSwitchConfig('Test Switch', true, 'Test hint');
      if (!switchConfig.accessible) {
        issues.push('Switch accessibility config not properly set');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        details: 'Keyboard navigation and focus management testing',
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: 'Keyboard navigation testing failed',
      };
    }
  }

  /**
   * Test focus management
   */
  private async testFocusManagement(): Promise<any> {
    const testName = 'Focus Management';
    const issues: string[] = [];

    try {
      // Test focus management configurations
      const modalConfig = AccessibilityService.createModalConfig('Test Modal', true);
      if (!modalConfig.accessible) {
        issues.push('Modal accessibility config not properly set');
      }

      const searchConfig = AccessibilityService.createSearchConfig('Test Search', 'Search placeholder');
      if (!searchConfig.accessible) {
        issues.push('Search accessibility config not properly set');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        details: 'Focus management and modal accessibility testing',
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: 'Focus management testing failed',
      };
    }
  }

  /**
   * Test semantic structure
   */
  private async testSemanticStructure(): Promise<any> {
    const testName = 'Semantic Structure';
    const issues: string[] = [];

    try {
      // Test semantic structure configurations
      const headerConfig = AccessibilityService.createHeaderConfig('Test Header', 1);
      if (!headerConfig.accessible) {
        issues.push('Header accessibility config not properly set');
      }

      const landmarkConfig = AccessibilityService.createLandmarkConfig('main', 'Main Content');
      if (!landmarkConfig.accessible) {
        issues.push('Landmark accessibility config not properly set');
      }

      const listConfig = AccessibilityService.createListConfig(5, 'Test List');
      if (!listConfig.accessible) {
        issues.push('List accessibility config not properly set');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        details: 'Semantic structure and landmark testing',
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: 'Semantic structure testing failed',
      };
    }
  }

  /**
   * Test alternative text
   */
  private async testAlternativeText(): Promise<any> {
    const testName = 'Alternative Text';
    const issues: string[] = [];

    try {
      // Test image accessibility configurations
      const imageConfig = AccessibilityService.createImageConfig('Test Image');
      if (!imageConfig.accessible) {
        issues.push('Image accessibility config not properly set');
      }

      const decorativeImageConfig = AccessibilityService.createImageConfig('Decorative Image', true);
      if (decorativeImageConfig.accessible) {
        issues.push('Decorative image should not be accessible');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        details: 'Alternative text and image accessibility testing',
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: 'Alternative text testing failed',
      };
    }
  }

  /**
   * Test form accessibility
   */
  private async testFormAccessibility(): Promise<any> {
    const testName = 'Form Accessibility';
    const issues: string[] = [];

    try {
      // Test form field configurations
      const textInputConfig = AccessibilityService.createFormFieldConfig('Test Input', 'text', true);
      if (!textInputConfig.accessible) {
        issues.push('Text input accessibility config not properly set');
      }

      const emailInputConfig = AccessibilityService.createFormFieldConfig('Email Input', 'email', true, 'Invalid email');
      if (!emailInputConfig.accessible) {
        issues.push('Email input accessibility config not properly set');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        details: 'Form field accessibility testing',
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: 'Form accessibility testing failed',
      };
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<any> {
    const testName = 'Error Handling';
    const issues: string[] = [];

    try {
      // Test error and success message configurations
      const errorConfig = AccessibilityService.createErrorConfig('Test error message', 'Test field');
      if (!errorConfig.accessible) {
        issues.push('Error message accessibility config not properly set');
      }

      const successConfig = AccessibilityService.createSuccessConfig('Test success message', 'Test field');
      if (!successConfig.accessible) {
        issues.push('Success message accessibility config not properly set');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        details: 'Error and success message accessibility testing',
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: 'Error handling testing failed',
      };
    }
  }

  /**
   * Test loading states
   */
  private async testLoadingStates(): Promise<any> {
    const testName = 'Loading States';
    const issues: string[] = [];

    try {
      // Test loading state configurations
      const loadingConfig = AccessibilityService.createLoadingConfig('Test Loading', 50);
      if (!loadingConfig.accessible) {
        issues.push('Loading state accessibility config not properly set');
      }

      const progressConfig = AccessibilityService.createProgressConfig('Test Progress', 25, 100, 'items');
      if (!progressConfig.accessible) {
        issues.push('Progress indicator accessibility config not properly set');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        details: 'Loading state and progress indicator accessibility testing',
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: 'Loading state testing failed',
      };
    }
  }

  /**
   * Test specific component accessibility
   */
  async testComponent(componentName: string, config: any): Promise<any> {
    const testName = `Component: ${componentName}`;
    const issues: string[] = [];

    try {
      // Basic accessibility checks
      if (!config.accessible) {
        issues.push('Component is not accessible');
      }

      if (!config.accessibilityLabel) {
        issues.push('Component missing accessibility label');
      }

      if (config.accessibilityRole === 'button' && !config.accessibilityHint) {
        issues.push('Button component missing accessibility hint');
      }

      if (config.accessibilityRole === 'image' && !config.accessibilityLabel) {
        issues.push('Image component missing accessibility label');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : issues.length <= 1 ? 'warning' : 'failed',
        issues,
        details: `Accessibility testing for ${componentName} component`,
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        details: `Component accessibility testing failed for ${componentName}`,
      };
    }
  }

  /**
   * Generate accessibility report
   */
  generateReport(results: any[]): string {
    const report = [
      '# Accessibility Test Report',
      '',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '## Summary',
      '',
    ];

    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const total = results.length;

    report.push(`- **Total Tests**: ${total}`);
    report.push(`- **Passed**: ${passed} (${Math.round((passed / total) * 100)}%)`);
    report.push(`- **Failed**: ${failed} (${Math.round((failed / total) * 100)}%)`);
    report.push(`- **Warnings**: ${warnings} (${Math.round((warnings / total) * 100)}%)`);
    report.push('');

    // Add detailed results
    report.push('## Detailed Results');
    report.push('');

    results.forEach(result => {
      const statusIcon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      report.push(`### ${statusIcon} ${result.testName}`);
      report.push('');
      report.push(`**Status**: ${result.status.toUpperCase()}`);
      report.push(`**Details**: ${result.details}`);
      
      if (result.issues && result.issues.length > 0) {
        report.push('');
        report.push('**Issues**:');
        result.issues.forEach(issue => {
          report.push(`- ${issue}`);
        });
      }
      
      report.push('');
    });

    return report.join('\n');
  }

  /**
   * Get test results
   */
  getTestResults(): Map<string, any> {
    return new Map(this.testResults);
  }

  /**
   * Clear test results
   */
  clearResults(): void {
    this.testResults.clear();
  }

  /**
   * Check if tests are running
   */
  isTestRunning(): boolean {
    return this.isRunning;
  }
}

export default AccessibilityTester;
