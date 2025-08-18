/**
 * Performance monitoring utilities for theme switching and other operations
 */

// Extend Window interface for performance monitoring flag
declare global {
  interface Window {
    localStorage?: Storage;
  }
}

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  operation: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private isEnabled: boolean;

  constructor() {
    // Enable performance monitoring in development or when explicitly enabled
    this.isEnabled = import.meta.env?.DEV || 
                    (typeof window !== 'undefined' && window.localStorage?.getItem('kiro-perf-monitor') === 'true');
  }

  /**
   * Start measuring performance for an operation
   */
  start(operationId: string, operationName: string): void {
    if (!this.isEnabled) return;

    const startTime = performance.now();
    this.metrics.set(operationId, {
      startTime,
      operation: operationName,
    });

    console.debug(`🚀 Started: ${operationName} (${operationId})`);
  }

  /**
   * End measuring performance for an operation
   */
  end(operationId: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(operationId);
    if (!metric) {
      console.warn(`⚠️ No performance metric found for operation: ${operationId}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log performance results
    const emoji = duration < 16 ? '⚡' : duration < 100 ? '✅' : '⚠️';
    console.debug(`${emoji} Completed: ${metric.operation} (${operationId}) - ${duration.toFixed(2)}ms`);

    // Warn about slow operations
    if (duration > 100) {
      console.warn(`🐌 Slow operation detected: ${metric.operation} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Get performance metrics for an operation
   */
  getMetrics(operationId: string): PerformanceMetrics | null {
    return this.metrics.get(operationId) || null;
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      if (enabled) {
        window.localStorage?.setItem('kiro-perf-monitor', 'true');
      } else {
        window.localStorage?.removeItem('kiro-perf-monitor');
      }
    }
  }

  /**
   * Check if performance monitoring is enabled
   */
  isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring component render performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  const startRender = () => {
    const operationId = `${componentName}-render-${Date.now()}`;
    performanceMonitor.start(operationId, `${componentName} render`);
    return operationId;
  };

  const endRender = (operationId: string) => {
    return performanceMonitor.end(operationId);
  };

  return { startRender, endRender };
};

/**
 * Decorator for measuring function performance
 */
export const measurePerformance = <T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T => {
  return ((...args: any[]) => {
    const operationId = `${operationName}-${Date.now()}`;
    performanceMonitor.start(operationId, operationName);
    
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          performanceMonitor.end(operationId);
        });
      }
      
      performanceMonitor.end(operationId);
      return result;
    } catch (error) {
      performanceMonitor.end(operationId);
      throw error;
    }
  }) as T;
};

/**
 * Utility to measure theme switching performance
 */
export const measureThemeSwitch = (themeMode: 'light' | 'dark') => {
  const operationId = `theme-switch-${themeMode}-${Date.now()}`;
  performanceMonitor.start(operationId, `Theme switch to ${themeMode}`);
  return operationId;
};

/**
 * Report theme switching performance
 */
export const reportThemeSwitchComplete = (operationId: string) => {
  return performanceMonitor.end(operationId);
};

export default performanceMonitor;