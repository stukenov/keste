/**
 * Performance monitoring and optimization utilities for Keste Phase 10
 * Performance & Scale support
 */

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  calculationTime: number;
  memoryUsage: number;
  cellCount: number;
  formulaCount: number;
}

export interface BenchmarkResult {
  operation: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    calculationTime: 0,
    memoryUsage: 0,
    cellCount: 0,
    formulaCount: 0,
  };

  private benchmarks: BenchmarkResult[] = [];
  private timers: Map<string, number> = new Map();

  // Start timing an operation
  startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  // End timing and record
  endTimer(label: string): number {
    const start = this.timers.get(label);
    if (!start) return 0;

    const duration = performance.now() - start;
    this.timers.delete(label);

    this.benchmarks.push({
      operation: label,
      duration,
      timestamp: Date.now(),
    });

    // Keep only last 100 benchmarks
    if (this.benchmarks.length > 100) {
      this.benchmarks.shift();
    }

    return duration;
  }

  // Measure function execution time
  async measure<T>(label: string, fn: () => T | Promise<T>): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }

  // Update metrics
  updateMetrics(updates: Partial<PerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...updates };
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    // Update memory usage if available (Chrome only)
    const perfWithMemory = performance as any;
    if (perfWithMemory.memory && perfWithMemory.memory.usedJSHeapSize) {
      this.metrics.memoryUsage = Math.round(
        perfWithMemory.memory.usedJSHeapSize / 1024 / 1024
      );
    }

    return { ...this.metrics };
  }

  // Get recent benchmarks
  getBenchmarks(limit: number = 10): BenchmarkResult[] {
    return this.benchmarks.slice(-limit);
  }

  // Get average time for operation
  getAverageTime(operation: string): number {
    const results = this.benchmarks.filter((b) => b.operation === operation);
    if (results.length === 0) return 0;

    const sum = results.reduce((acc, b) => acc + b.duration, 0);
    return sum / results.length;
  }

  // Clear all data
  clear(): void {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      calculationTime: 0,
      memoryUsage: 0,
      cellCount: 0,
      formulaCount: 0,
    };
    this.benchmarks = [];
    this.timers.clear();
  }

  // Generate performance report
  generateReport(): string {
    const metrics = this.getMetrics();
    const recentBenchmarks = this.getBenchmarks(5);

    return `
Performance Report
==================
Load Time: ${metrics.loadTime.toFixed(2)}ms
Render Time: ${metrics.renderTime.toFixed(2)}ms
Calculation Time: ${metrics.calculationTime.toFixed(2)}ms
Memory Usage: ${metrics.memoryUsage}MB
Cell Count: ${metrics.cellCount.toLocaleString()}
Formula Count: ${metrics.formulaCount.toLocaleString()}

Recent Operations:
${recentBenchmarks.map((b) => `- ${b.operation}: ${b.duration.toFixed(2)}ms`).join('\n')}
    `.trim();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Memory optimization utilities
export const MemoryUtils = {
  // Estimate size of object in bytes
  estimateSize(obj: any): number {
    const str = JSON.stringify(obj);
    return new Blob([str]).size;
  },

  // Deep clone with optional property exclusion
  deepClone<T>(obj: T, exclude: string[] = []): T {
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepClone(item, exclude)) as any;
    }

    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !exclude.includes(key)) {
        cloned[key] = this.deepClone((obj as any)[key], exclude);
      }
    }
    return cloned;
  },

  // Compress large strings (basic implementation)
  compressString(str: string): string {
    // In production, use a real compression library like pako
    return str;
  },

  // Check if memory usage is high
  isMemoryHigh(): boolean {
    const perfWithMemory = performance as any;
    if (!perfWithMemory.memory) return false;
    const usage = perfWithMemory.memory.usedJSHeapSize;
    const limit = perfWithMemory.memory.jsHeapSizeLimit;
    return usage / limit > 0.9; // 90% threshold
  },

  // Force garbage collection hint (only works in Chrome with --expose-gc)
  requestGC(): void {
    if (global.gc) {
      global.gc();
    }
  },
};

// Debounce utility for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for high-frequency events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Batch processing for large operations
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 100,
  onProgress?: (progress: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const batches = Math.ceil(items.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, items.length);
    const batch = items.slice(start, end);

    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);

    if (onProgress) {
      const progress = Math.round(((i + 1) / batches) * 100);
      onProgress(progress);
    }

    // Yield to main thread
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}

// Request idle callback polyfill
export const requestIdleCallback =
  (window as any).requestIdleCallback ||
  function (cb: () => void) {
    const start = Date.now();
    return setTimeout(() => {
      cb();
    }, Math.max(0, 50 - (Date.now() - start)));
  };

// Cancel idle callback polyfill
export const cancelIdleCallback =
  (window as any).cancelIdleCallback || clearTimeout;
