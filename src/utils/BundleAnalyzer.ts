/**
 * @fileoverview BundleAnalyzer.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

/**
 * BundleAnalyzer - Analyze and optimize bundle size
 * Provides insights into bundle composition and optimization recommendations
 */
class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private bundleData: Map<string, number> = new Map();
  private dependencies: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  /**
   * Analyze bundle composition
   */
  analyzeBundle(): {
    totalSize: number;
    largestChunks: Array<{ name: string; size: number; percentage: number }>;
    recommendations: string[];
    optimizationScore: number;
  } {
    const totalSize = Array.from(this.bundleData.values()).reduce((sum, size) => sum + size, 0);
    
    const chunks = Array.from(this.bundleData.entries())
      .map(([name, size]) => ({
        name,
        size,
        percentage: (size / totalSize) * 100
      }))
      .sort((a, b) => b.size - a.size);

    const largestChunks = chunks.slice(0, 10);
    
    const recommendations = this.generateRecommendations(chunks);
    const optimizationScore = this.calculateOptimizationScore(chunks);
    
    return {
      totalSize,
      largestChunks,
      recommendations,
      optimizationScore
    };
  }

  /**
   * Add bundle chunk data
   */
  addChunk(name: string, size: number): void {
    this.bundleData.set(name, size);
  }

  /**
   * Add dependency information
   */
  addDependency(name: string, version: string): void {
    this.dependencies.set(name, version);
  }

  /**
   * Get bundle size by category
   */
  getBundleByCategory(): {
    core: number;
    ui: number;
    services: number;
    utils: number;
    assets: number;
    vendor: number;
  } {
    const categories = {
      core: 0,
      ui: 0,
      services: 0,
      utils: 0,
      assets: 0,
      vendor: 0
    };

    for (const [name, size] of this.bundleData.entries()) {
      if (name.includes('node_modules') || name.includes('vendor')) {
        categories.vendor += size;
      } else if (name.includes('components') || name.includes('screens')) {
        categories.ui += size;
      } else if (name.includes('services')) {
        categories.services += size;
      } else if (name.includes('utils')) {
        categories.utils += size;
      } else if (name.includes('assets') || name.includes('images')) {
        categories.assets += size;
      } else {
        categories.core += size;
      }
    }

    return categories;
  }

  /**
   * Find duplicate dependencies
   */
  findDuplicateDependencies(): Array<{
    name: string;
    versions: string[];
    totalSize: number;
  }> {
    const dependencyMap = new Map<string, string[]>();
    
    for (const [name, version] of this.dependencies.entries()) {
      if (!dependencyMap.has(name)) {
        dependencyMap.set(name, []);
      }
      dependencyMap.get(name)!.push(version);
    }

    const duplicates = Array.from(dependencyMap.entries())
      .filter(([_, versions]) => versions.length > 1)
      .map(([name, versions]) => ({
        name,
        versions: [...new Set(versions)],
        totalSize: this.bundleData.get(name) || 0
      }));

    return duplicates;
  }

  /**
   * Get unused dependencies
   */
  getUnusedDependencies(): string[] {
    const unused: string[] = [];
    
    for (const [name] of this.dependencies.entries()) {
      const bundleSize = this.bundleData.get(name);
      if (!bundleSize || bundleSize < 1000) { // Less than 1KB
        unused.push(name);
      }
    }

    return unused;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(chunks: Array<{ name: string; size: number; percentage: number }>): string[] {
    const recommendations: string[] = [];
    
    // Check for large chunks
    const largeChunks = chunks.filter(chunk => chunk.percentage > 20);
    if (largeChunks.length > 0) {
      recommendations.push(`Consider code splitting for large chunks: ${largeChunks.map(c => c.name).join(', ')}`);
    }

    // Check for many small chunks
    const smallChunks = chunks.filter(chunk => chunk.size < 10000);
    if (smallChunks.length > 20) {
      recommendations.push('Consider bundling small chunks together to reduce HTTP requests');
    }

    // Check for vendor bundle size
    const vendorChunks = chunks.filter(chunk => chunk.name.includes('vendor') || chunk.name.includes('node_modules'));
    const vendorSize = vendorChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    
    if (vendorSize / totalSize > 0.6) {
      recommendations.push('Vendor bundle is too large - consider tree shaking and removing unused dependencies');
    }

    // Check for assets
    const assetChunks = chunks.filter(chunk => 
      chunk.name.includes('assets') || 
      chunk.name.includes('images') || 
      chunk.name.includes('fonts')
    );
    
    if (assetChunks.length > 0) {
      recommendations.push('Consider optimizing images and using WebP format');
    }

    return recommendations;
  }

  /**
   * Calculate optimization score (0-100)
   */
  private calculateOptimizationScore(chunks: Array<{ name: string; size: number; percentage: number }>): number {
    let score = 100;
    
    // Penalize large chunks
    const largeChunks = chunks.filter(chunk => chunk.percentage > 20);
    score -= largeChunks.length * 10;
    
    // Penalize too many small chunks
    const smallChunks = chunks.filter(chunk => chunk.size < 10000);
    if (smallChunks.length > 20) {
      score -= 15;
    }
    
    // Penalize large vendor bundle
    const vendorChunks = chunks.filter(chunk => chunk.name.includes('vendor'));
    const vendorSize = vendorChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    
    if (vendorSize / totalSize > 0.6) {
      score -= 20;
    }
    
    return Math.max(0, score);
  }

  /**
   * Get bundle analysis report
   */
  getAnalysisReport(): string {
    const analysis = this.analyzeBundle();
    const categories = this.getBundleByCategory();
    const duplicates = this.findDuplicateDependencies();
    const unused = this.getUnusedDependencies();
    
    const report = [
      '# Bundle Analysis Report',
      '',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '## Summary',
      `- **Total Bundle Size**: ${this.formatBytes(analysis.totalSize)}`,
      `- **Optimization Score**: ${analysis.optimizationScore}/100`,
      `- **Number of Chunks**: ${this.bundleData.size}`,
      '',
      '## Bundle Composition',
      '',
      '### By Category',
      `- **Core**: ${this.formatBytes(categories.core)} (${this.getPercentage(categories.core, analysis.totalSize)}%)`,
      `- **UI Components**: ${this.formatBytes(categories.ui)} (${this.getPercentage(categories.ui, analysis.totalSize)}%)`,
      `- **Services**: ${this.formatBytes(categories.services)} (${this.getPercentage(categories.services, analysis.totalSize)}%)`,
      `- **Utils**: ${this.formatBytes(categories.utils)} (${this.getPercentage(categories.utils, analysis.totalSize)}%)`,
      `- **Assets**: ${this.formatBytes(categories.assets)} (${this.getPercentage(categories.assets, analysis.totalSize)}%)`,
      `- **Vendor**: ${this.formatBytes(categories.vendor)} (${this.getPercentage(categories.vendor, analysis.totalSize)}%)`,
      '',
      '### Largest Chunks',
      ''
    ];

    analysis.largestChunks.forEach((chunk, index) => {
      report.push(`${index + 1}. **${chunk.name}**: ${this.formatBytes(chunk.size)} (${chunk.percentage.toFixed(1)}%)`);
    });

    if (duplicates.length > 0) {
      report.push('');
      report.push('## Duplicate Dependencies');
      report.push('');
      duplicates.forEach(dup => {
        report.push(`- **${dup.name}**: ${dup.versions.join(', ')} (${this.formatBytes(dup.totalSize)})`);
      });
    }

    if (unused.length > 0) {
      report.push('');
      report.push('## Potentially Unused Dependencies');
      report.push('');
      unused.forEach(dep => {
        report.push(`- ${dep}`);
      });
    }

    if (analysis.recommendations.length > 0) {
      report.push('');
      report.push('## Optimization Recommendations');
      report.push('');
      analysis.recommendations.forEach((rec, index) => {
        report.push(`${index + 1}. ${rec}`);
      });
    }

    return report.join('\n');
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get percentage of value relative to total
   */
  private getPercentage(value: number, total: number): string {
    if (total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.bundleData.clear();
    this.dependencies.clear();
  }

  /**
   * Export data as JSON
   */
  exportData(): string {
    return JSON.stringify({
      bundleData: Object.fromEntries(this.bundleData),
      dependencies: Object.fromEntries(this.dependencies),
      analysis: this.analyzeBundle(),
      categories: this.getBundleByCategory(),
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}

export default BundleAnalyzer;
