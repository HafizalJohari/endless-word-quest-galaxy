// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  lastFrameTime: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    lastFrameTime: performance.now()
  };
  
  private frameCount = 0;
  private lastFpsUpdate = performance.now();
  private observers: Array<(metrics: PerformanceMetrics) => void> = [];
  private isMonitoring = false;
  private animationFrameId?: number;

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorFrame();
    console.log('Performance monitoring started');
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    console.log('Performance monitoring stopped');
  }

  private monitorFrame(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const deltaTime = now - this.metrics.lastFrameTime;
    
    this.frameCount++;
    
    // Update FPS every second
    if (now - this.lastFpsUpdate >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      
      // Update memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      }
      
      this.notifyObservers();
    }
    
    this.metrics.lastFrameTime = now;
    this.metrics.renderTime = deltaTime;
    
    this.animationFrameId = requestAnimationFrame(() => this.monitorFrame());
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback({ ...this.metrics }));
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Detect performance issues
  analyzePerformance(): {
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (this.metrics.fps < 30) {
      warnings.push(`Low FPS detected: ${this.metrics.fps}`);
      suggestions.push('Consider reducing animations or grid size');
    }

    if (this.metrics.memoryUsage > 100) {
      warnings.push(`High memory usage: ${this.metrics.memoryUsage}MB`);
      suggestions.push('Check for memory leaks in event listeners');
    }

    if (this.metrics.renderTime > 16.67) {
      warnings.push(`Slow render time: ${this.metrics.renderTime.toFixed(2)}ms`);
      suggestions.push('Optimize React component renders with useMemo/useCallback');
    }

    return { warnings, suggestions };
  }
}

// Debounce utility for expensive operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility for frequent events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Memory leak detection
export const detectMemoryLeaks = (): {
  potentialLeaks: string[];
  recommendations: string[];
} => {
  const potentialLeaks: string[] = [];
  const recommendations: string[] = [];

  // Check for excessive event listeners
  const eventTargets = [window, document, document.body];
  eventTargets.forEach(target => {
    if (target && (target as any)._events) {
      const eventCount = Object.keys((target as any)._events).length;
      if (eventCount > 10) {
        potentialLeaks.push(`Excessive event listeners on ${target.constructor.name}: ${eventCount}`);
      }
    }
  });

  // Check for global variables
  const globalKeys = Object.keys(window).filter(key => 
    !['localStorage', 'sessionStorage', 'console', 'performance'].includes(key) &&
    typeof (window as any)[key] === 'object'
  );
  
  if (globalKeys.length > 50) {
    potentialLeaks.push(`Many global variables detected: ${globalKeys.length}`);
    recommendations.push('Clean up global variables and use proper module imports');
  }

  if (potentialLeaks.length === 0) {
    return { potentialLeaks: ['No obvious memory leaks detected'], recommendations: [] };
  }

  recommendations.push(
    'Use React DevTools Profiler to identify component re-renders',
    'Ensure useEffect cleanup functions are properly implemented',
    'Check for uncancelled timers and intervals'
  );

  return { potentialLeaks, recommendations };
};

// Singleton instance for global use
export const performanceMonitor = new PerformanceMonitor();