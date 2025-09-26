/**
 * @fileoverview accessibilityTesting.ts - Accessibility Testing Utilities
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilityTestResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  issues: string[];
  recommendations: string[];
  score: number; // 0-100
}

export interface AccessibilityAuditResult {
  overallScore: number;
  results: AccessibilityTestResult[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
}

export class AccessibilityTester {
  private static instance: AccessibilityTester;

  static getInstance(): AccessibilityTester {
    if (!AccessibilityTester.instance) {
      AccessibilityTester.instance = new AccessibilityTester();
    }
    return AccessibilityTester.instance;
  }

  /**
   * Run comprehensive accessibility audit
   */
  async runAccessibilityAudit(): Promise<AccessibilityAuditResult> {
    const results: AccessibilityTestResult[] = [];

    // Test screen reader support
    results.push(await this.testScreenReaderSupport());
    
    // Test color contrast
    results.push(await this.testColorContrast());
    
    // Test touch targets
    results.push(await this.testTouchTargets());
    
    // Test keyboard navigation
    results.push(await this.testKeyboardNavigation());
    
    // Test focus management
    results.push(await this.testFocusManagement());
    
    // Test semantic markup
    results.push(await this.testSemanticMarkup());
    
    // Test alternative text
    results.push(await this.testAlternativeText());
    
    // Test form accessibility
    results.push(await this.testFormAccessibility());
    
    // Test error handling
    results.push(await this.testErrorHandling());
    
    // Test dynamic content
    results.push(await this.testDynamicContent());

    const summary = {
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      warnings: results.filter(r => r.status === 'warning').length,
    };

    const overallScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;

    return {
      overallScore: Math.round(overallScore),
      results,
      summary,
    };
  }

  /**
   * Test screen reader support
   */
  private async testScreenReaderSupport(): Promise<AccessibilityTestResult> {
    const testName = 'Screen Reader Support';
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      if (!isEnabled) {
        recommendations.push('Consider testing with screen reader enabled');
      }

      // Test if accessibility labels are properly set
      const testElements = document.querySelectorAll('[data-testid]');
      let elementsWithoutLabels = 0;

      testElements.forEach(element => {
        const hasLabel = element.getAttribute('aria-label') || 
                        element.getAttribute('aria-labelledby') ||
                        element.textContent?.trim();
        
        if (!hasLabel) {
          elementsWithoutLabels++;
        }
      });

      if (elementsWithoutLabels > 0) {
        issues.push(`${elementsWithoutLabels} elements missing accessibility labels`);
        recommendations.push('Add aria-label or aria-labelledby to interactive elements');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        recommendations,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 20)),
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        recommendations: ['Check screen reader configuration'],
        score: 0,
      };
    }
  }

  /**
   * Test color contrast
   */
  private async testColorContrast(): Promise<AccessibilityTestResult> {
    const testName = 'Color Contrast';
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test text elements for color contrast
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
      let lowContrastElements = 0;

      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Simple contrast check (in real implementation, use proper contrast ratio calculation)
        if (color === backgroundColor) {
          lowContrastElements++;
        }
      });

      if (lowContrastElements > 0) {
        issues.push(`${lowContrastElements} elements have low color contrast`);
        recommendations.push('Ensure text has sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        recommendations,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 15)),
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        recommendations: ['Check color contrast implementation'],
        score: 0,
      };
    }
  }

  /**
   * Test touch targets
   */
  private async testTouchTargets(): Promise<AccessibilityTestResult> {
    const testName = 'Touch Targets';
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
      let smallTargets = 0;

      interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const minSize = 44; // Minimum touch target size in pixels
        
        if (rect.width < minSize || rect.height < minSize) {
          smallTargets++;
        }
      });

      if (smallTargets > 0) {
        issues.push(`${smallTargets} interactive elements are too small (minimum 44px)`);
        recommendations.push('Ensure all interactive elements are at least 44x44 pixels');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        recommendations,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 25)),
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        recommendations: ['Check touch target implementation'],
        score: 0,
      };
    }
  }

  /**
   * Test keyboard navigation
   */
  private async testKeyboardNavigation(): Promise<AccessibilityTestResult> {
    const testName = 'Keyboard Navigation';
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
      let elementsWithoutTabIndex = 0;
      let elementsWithNegativeTabIndex = 0;

      interactiveElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex');
        
        if (!tabIndex && !['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
          elementsWithoutTabIndex++;
        }
        
        if (tabIndex === '-1') {
          elementsWithNegativeTabIndex++;
        }
      });

      if (elementsWithoutTabIndex > 0) {
        issues.push(`${elementsWithoutTabIndex} interactive elements not keyboard accessible`);
        recommendations.push('Add tabindex to custom interactive elements');
      }

      if (elementsWithNegativeTabIndex > 0) {
        recommendations.push('Review elements with tabindex="-1" - ensure they are intentionally excluded');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        recommendations,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 20)),
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        recommendations: ['Check keyboard navigation implementation'],
        score: 0,
      };
    }
  }

  /**
   * Test focus management
   */
  private async testFocusManagement(): Promise<AccessibilityTestResult> {
    const testName = 'Focus Management';
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test for focus indicators
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
      let elementsWithoutFocusIndicator = 0;

      interactiveElements.forEach(element => {
        const styles = window.getComputedStyle(element, ':focus');
        const hasFocusIndicator = styles.outline !== 'none' || 
                                 styles.boxShadow !== 'none' ||
                                 element.getAttribute('data-focus-visible') === 'true';
        
        if (!hasFocusIndicator) {
          elementsWithoutFocusIndicator++;
        }
      });

      if (elementsWithoutFocusIndicator > 0) {
        issues.push(`${elementsWithoutFocusIndicator} elements lack visible focus indicators`);
        recommendations.push('Add visible focus indicators for keyboard navigation');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        recommendations,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 30)),
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        recommendations: ['Check focus management implementation'],
        score: 0,
      };
    }
  }

  /**
   * Test semantic markup
   */
  private async testSemanticMarkup(): Promise<AccessibilityTestResult> {
    const testName = 'Semantic Markup';
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let headingIssues = 0;
      let previousLevel = 0;

      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > previousLevel + 1) {
          headingIssues++;
        }
        previousLevel = level;
      });

      if (headingIssues > 0) {
        issues.push(`${headingIssues} heading hierarchy issues found`);
        recommendations.push('Ensure proper heading hierarchy (h1 -> h2 -> h3, etc.)');
      }

      // Test for landmark elements
      const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section, article');
      if (landmarks.length === 0) {
        issues.push('No landmark elements found');
        recommendations.push('Add semantic landmark elements (main, nav, header, footer)');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        recommendations,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 25)),
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        recommendations: ['Check semantic markup implementation'],
        score: 0,
      };
    }
  }

  /**
   * Test alternative text
   */
  private async testAlternativeText(): Promise<AccessibilityTestResult> {
    const testName = 'Alternative Text';
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const images = document.querySelectorAll('img');
      let imagesWithoutAlt = 0;
      let imagesWithEmptyAlt = 0;

      images.forEach(img => {
        const alt = img.getAttribute('alt');
        if (!alt) {
          imagesWithoutAlt++;
        } else if (alt.trim() === '') {
          imagesWithEmptyAlt++;
        }
      });

      if (imagesWithoutAlt > 0) {
        issues.push(`${imagesWithoutAlt} images missing alt text`);
        recommendations.push('Add descriptive alt text to all images');
      }

      if (imagesWithEmptyAlt > 0) {
        recommendations.push('Review images with empty alt text - ensure they are decorative');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        recommendations,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 30)),
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        recommendations: ['Check alternative text implementation'],
        score: 0,
      };
    }
  }

  /**
   * Test form accessibility
   */
  private async testFormAccessibility(): Promise<AccessibilityTestResult> {
    const testName = 'Form Accessibility';
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const formElements = document.querySelectorAll('input, select, textarea');
      let elementsWithoutLabels = 0;
      let requiredElementsWithoutAria = 0;

      formElements.forEach(element => {
        const hasLabel = element.getAttribute('aria-label') || 
                        element.getAttribute('aria-labelledby') ||
                        document.querySelector(`label[for="${element.id}"]`);
        
        if (!hasLabel) {
          elementsWithoutLabels++;
        }

        const isRequired = element.hasAttribute('required') || 
                          element.getAttribute('aria-required') === 'true';
        
        if (isRequired && !element.getAttribute('aria-required')) {
          requiredElementsWithoutAria++;
        }
      });

      if (elementsWithoutLabels > 0) {
        issues.push(`${elementsWithoutLabels} form elements missing labels`);
        recommendations.push('Associate labels with all form elements');
      }

      if (requiredElementsWithoutAria > 0) {
        issues.push(`${requiredElementsWithoutAria} required elements missing aria-required`);
        recommendations.push('Add aria-required to required form elements');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        recommendations,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 25)),
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        recommendations: ['Check form accessibility implementation'],
        score: 0,
      };
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<AccessibilityTestResult> {
    const testName = 'Error Handling';
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test for error messages with proper ARIA attributes
      const errorElements = document.querySelectorAll('[role="alert"], .error, .invalid');
      let errorsWithoutAria = 0;

      errorElements.forEach(element => {
        const hasAria = element.getAttribute('role') === 'alert' || 
                       element.getAttribute('aria-live') === 'polite' ||
                       element.getAttribute('aria-live') === 'assertive';
        
        if (!hasAria) {
          errorsWithoutAria++;
        }
      });

      if (errorsWithoutAria > 0) {
        issues.push(`${errorsWithoutAria} error messages missing ARIA attributes`);
        recommendations.push('Add role="alert" or aria-live to error messages');
      }

      return {
        testName,
        status: issues.length === 0 ? 'passed' : 'warning',
        issues,
        recommendations,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 20)),
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        recommendations: ['Check error handling implementation'],
        score: 0,
      };
    }
  }

  /**
   * Test dynamic content
   */
  private async testDynamicContent(): Promise<AccessibilityTestResult> {
    const testName = 'Dynamic Content';
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test for live regions
      const liveRegions = document.querySelectorAll('[aria-live]');
      if (liveRegions.length === 0) {
        recommendations.push('Consider adding aria-live regions for dynamic content updates');
      }

      // Test for status messages
      const statusElements = document.querySelectorAll('[role="status"]');
      if (statusElements.length === 0) {
        recommendations.push('Consider adding role="status" for status messages');
      }

      return {
        testName,
        status: 'passed',
        issues,
        recommendations,
        score: 100,
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        issues: [`Test failed: ${error}`],
        recommendations: ['Check dynamic content implementation'],
        score: 0,
      };
    }
  }

  /**
   * Generate accessibility report
   */
  generateReport(result: AccessibilityAuditResult): string {
    let report = `# Accessibility Audit Report\n\n`;
    report += `**Overall Score: ${result.overallScore}/100**\n\n`;
    report += `## Summary\n`;
    report += `- ✅ Passed: ${result.summary.passed}\n`;
    report += `- ❌ Failed: ${result.summary.failed}\n`;
    report += `- ⚠️ Warnings: ${result.summary.warnings}\n\n`;

    report += `## Detailed Results\n\n`;

    result.results.forEach(test => {
      const statusIcon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️';
      report += `### ${statusIcon} ${test.testName}\n`;
      report += `**Score: ${test.score}/100**\n\n`;

      if (test.issues.length > 0) {
        report += `**Issues:**\n`;
        test.issues.forEach(issue => {
          report += `- ${issue}\n`;
        });
        report += `\n`;
      }

      if (test.recommendations.length > 0) {
        report += `**Recommendations:**\n`;
        test.recommendations.forEach(rec => {
          report += `- ${rec}\n`;
        });
        report += `\n`;
      }
    });

    return report;
  }
}

export default AccessibilityTester;
