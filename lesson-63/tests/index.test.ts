/**
 * Lesson 63: デバッグ技術 (Debugging Techniques) - テスト
 */

import {
  BrowserDebugger,
  AutoDebugger,
  NetworkDebugger,
  PerformanceAnalyzer,
  ErrorTracker,
  DebugManager
} from '../src/index';

import {
  findUserByIdFixed,
  calculateFibonacciOptimized,
  calculateFibonacciIterative,
  EventManagerFixed,
  fetchPostDataFixed,
  ShoppingCartFixed
} from '../src/solution';

// =============================================================================
// BrowserDebugger のテスト
// =============================================================================

describe('BrowserDebugger', () => {
  beforeEach(() => {
    // コンソールをモック
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
    jest.spyOn(console, 'group').mockImplementation();
    jest.spyOn(console, 'groupEnd').mockImplementation();
    jest.spyOn(console, 'table').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('measurePerformance should execute function and return result', () => {
    const testFunction = jest.fn().mockReturnValue(42);
    const result = BrowserDebugger.measurePerformance('test', testFunction);
    
    expect(result).toBe(42);
    expect(testFunction).toHaveBeenCalledTimes(1);
  });

  test('measurePerformanceAsync should handle async functions', async () => {
    const asyncFunction = jest.fn().mockResolvedValue('async result');
    const result = await BrowserDebugger.measurePerformanceAsync('async-test', asyncFunction);
    
    expect(result).toBe('async result');
    expect(asyncFunction).toHaveBeenCalledTimes(1);
  });

  test('measurePerformanceAsync should handle async errors', async () => {
    const asyncFunction = jest.fn().mockRejectedValue(new Error('Async error'));
    
    await expect(
      BrowserDebugger.measurePerformanceAsync('async-error-test', asyncFunction)
    ).rejects.toThrow('Async error');
  });

  test('logMemoryUsage should not throw in Node.js environment', () => {
    expect(() => {
      BrowserDebugger.logMemoryUsage('test');
    }).not.toThrow();
  });
});

// =============================================================================
// AutoDebugger のテスト
// =============================================================================

describe('AutoDebugger', () => {
  let autoDebugger: AutoDebugger;

  beforeEach(() => {
    autoDebugger = AutoDebugger.getInstance();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    autoDebugger.stopDebugging();
    jest.restoreAllMocks();
  });

  test('should be a singleton', () => {
    const instance1 = AutoDebugger.getInstance();
    const instance2 = AutoDebugger.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('should add and remove breakpoints', () => {
    const condition = jest.fn().mockReturnValue(false);
    autoDebugger.addConditionalBreakpoint('test-bp', condition);
    
    const status = autoDebugger.getStatus();
    expect(status.breakpointsCount).toBe(1);
    
    const removed = autoDebugger.removeBreakpoint('test-bp');
    expect(removed).toBe(true);
    
    const newStatus = autoDebugger.getStatus();
    expect(newStatus.breakpointsCount).toBe(0);
  });

  test('should add and remove watchers', () => {
    let testValue = 10;
    const getter = jest.fn().mockImplementation(() => testValue);
    
    autoDebugger.watchVariable('testVar', getter);
    
    const status = autoDebugger.getStatus();
    expect(status.watchersCount).toBe(1);
    
    const removed = autoDebugger.removeWatcher('testVar');
    expect(removed).toBe(true);
    
    const newStatus = autoDebugger.getStatus();
    expect(newStatus.watchersCount).toBe(0);
  });

  test('should start and stop debugging', () => {
    expect(autoDebugger.getStatus().isRunning).toBe(false);
    
    autoDebugger.startDebugging(10);
    expect(autoDebugger.getStatus().isRunning).toBe(true);
    
    autoDebugger.stopDebugging();
    expect(autoDebugger.getStatus().isRunning).toBe(false);
  });

  test('should warn when trying to start already running debugger', () => {
    autoDebugger.startDebugging();
    autoDebugger.startDebugging();
    
    expect(console.warn).toHaveBeenCalledWith('Debugger is already running');
  });
});

// =============================================================================
// NetworkDebugger のテスト
// =============================================================================

describe('NetworkDebugger', () => {
  let networkDebugger: NetworkDebugger;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    networkDebugger = new NetworkDebugger();
    originalFetch = global.fetch;
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'group').mockImplementation();
    jest.spyOn(console, 'groupEnd').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    networkDebugger.stopInterception();
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('should track intercepted requests', () => {
    const initialRequests = networkDebugger.getInterceptedRequests();
    expect(initialRequests).toHaveLength(0);
    
    networkDebugger.clearHistory();
    const clearedRequests = networkDebugger.getInterceptedRequests();
    expect(clearedRequests).toHaveLength(0);
  });

  test('should clear history', () => {
    networkDebugger.clearHistory();
    const requests = networkDebugger.getInterceptedRequests();
    expect(requests).toHaveLength(0);
  });
});

// =============================================================================
// PerformanceAnalyzer のテスト
// =============================================================================

describe('PerformanceAnalyzer', () => {
  let performanceAnalyzer: PerformanceAnalyzer;

  beforeEach(() => {
    performanceAnalyzer = new PerformanceAnalyzer();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'group').mockImplementation();
    jest.spyOn(console, 'groupEnd').mockImplementation();
    jest.spyOn(console, 'table').mockImplementation();
  });

  afterEach(() => {
    performanceAnalyzer.stopAllMonitoring();
    jest.restoreAllMocks();
  });

  test('should initialize Web Vitals data', () => {
    const webVitals = performanceAnalyzer.getWebVitalsData();
    expect(typeof webVitals).toBe('object');
  });

  test('should analyze resource timing', () => {
    // Node.js環境では空の配列が返される
    const analysis = performanceAnalyzer.analyzeResourceTiming();
    expect(Array.isArray(analysis)).toBe(true);
  });

  test('should start and stop monitoring', () => {
    performanceAnalyzer.monitorWebVitals();
    performanceAnalyzer.detectMemoryLeaks();
    
    expect(() => {
      performanceAnalyzer.stopAllMonitoring();
    }).not.toThrow();
  });

  test('should handle memory monitoring in unsupported environment', () => {
    expect(() => {
      performanceAnalyzer.detectMemoryLeaks();
    }).not.toThrow();
    
    expect(console.warn).toHaveBeenCalledWith('Memory monitoring not available');
  });
});

// =============================================================================
// ErrorTracker のテスト
// =============================================================================

describe('ErrorTracker', () => {
  let errorTracker: ErrorTracker;

  beforeEach(() => {
    errorTracker = new ErrorTracker();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'group').mockImplementation();
    jest.spyOn(console, 'groupEnd').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should capture errors', () => {
    const error = new Error('Test error');
    const errorInfo = {
      message: error.message,
      stack: error.stack || '',
      filename: 'test.ts',
      lineno: 10,
      colno: 5,
      error,
      timestamp: new Date(),
      userAgent: 'test-agent',
      url: 'http://test.com',
      sessionId: 'test-session',
      breadcrumbs: [],
      context: { test: true }
    };

    errorTracker.captureError(errorInfo);
    
    const stats = errorTracker.getErrorStats();
    expect(stats.totalErrors).toBe(1);
  });

  test('should add breadcrumbs', () => {
    errorTracker.addBreadcrumb({
      category: 'user',
      message: 'Button clicked',
      level: 'info'
    });

    // ブレッドクラムは内部的に追加される
    expect(() => {
      errorTracker.recordUserAction('test action');
    }).not.toThrow();
  });

  test('should record user actions', () => {
    errorTracker.recordUserAction('test-action', { key: 'value' });
    expect(() => {
      errorTracker.recordNavigation('/home', '/about');
      errorTracker.recordNetworkRequest('https://api.test.com', 'GET', 200);
    }).not.toThrow();
  });

  test('should generate debug report', () => {
    const report = errorTracker.generateDebugReport();
    expect(typeof report).toBe('string');
    expect(() => JSON.parse(report)).not.toThrow();
  });

  test('should provide error statistics', () => {
    const stats = errorTracker.getErrorStats();
    expect(stats).toHaveProperty('totalErrors');
    expect(stats).toHaveProperty('errorsByType');
    expect(stats).toHaveProperty('recentErrors');
    expect(Array.isArray(stats.recentErrors)).toBe(true);
  });
});

// =============================================================================
// DebugManager のテスト
// =============================================================================

describe('DebugManager', () => {
  let debugManager: DebugManager;

  beforeEach(() => {
    debugManager = DebugManager.getInstance();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    debugManager.shutdownDebugEnvironment();
    jest.restoreAllMocks();
  });

  test('should be a singleton', () => {
    const instance1 = DebugManager.getInstance();
    const instance2 = DebugManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('should initialize and shutdown debug environment', () => {
    expect(() => {
      debugManager.initializeDebugEnvironment();
      debugManager.shutdownDebugEnvironment();
    }).not.toThrow();
  });

  test('should provide access to individual debuggers', () => {
    expect(debugManager.browser).toBeDefined();
    expect(debugManager.auto).toBeDefined();
    expect(debugManager.network).toBeDefined();
    expect(debugManager.performance).toBeDefined();
    expect(debugManager.errors).toBeDefined();
  });

  test('should generate comprehensive report', () => {
    const report = debugManager.generateComprehensiveReport();
    expect(typeof report).toBe('string');
    expect(() => JSON.parse(report)).not.toThrow();
  });
});

// =============================================================================
// Solution のテスト
// =============================================================================

describe('Solution Functions', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findUserByIdFixed', () => {
    test('should find existing user', () => {
      const user = findUserByIdFixed(1);
      expect(user).toEqual({
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        isActive: true
      });
    });

    test('should return null for non-existing user', () => {
      const user = findUserByIdFixed(999);
      expect(user).toBeNull();
    });
  });

  describe('calculateFibonacciOptimized', () => {
    test('should calculate fibonacci numbers correctly', () => {
      expect(calculateFibonacciOptimized(0)).toBe(0);
      expect(calculateFibonacciOptimized(1)).toBe(1);
      expect(calculateFibonacciOptimized(10)).toBe(55);
    });

    test('should be faster than naive implementation for large numbers', () => {
      const start = performance.now();
      calculateFibonacciOptimized(40);
      const optimizedTime = performance.now() - start;
      
      // 最適化版は十分高速であることを確認
      expect(optimizedTime).toBeLessThan(100);
    });
  });

  describe('calculateFibonacciIterative', () => {
    test('should calculate fibonacci numbers correctly', () => {
      expect(calculateFibonacciIterative(0)).toBe(0);
      expect(calculateFibonacciIterative(1)).toBe(1);
      expect(calculateFibonacciIterative(10)).toBe(55);
    });
  });

  describe('EventManagerFixed', () => {
    let manager: EventManagerFixed;

    beforeEach(() => {
      manager = new EventManagerFixed();
    });

    afterEach(() => {
      manager.destroy();
    });

    test('should add and emit events', () => {
      const callback = jest.fn();
      manager.addEventListener('test', callback);
      manager.emit('test', 'data');
      
      expect(callback).toHaveBeenCalledWith('data');
    });

    test('should remove event listeners', () => {
      const callback = jest.fn();
      manager.addEventListener('test', callback);
      manager.removeEventListener('test', callback);
      manager.emit('test', 'data');
      
      expect(callback).not.toHaveBeenCalled();
    });

    test('should properly destroy and clean up', () => {
      manager.addEventListener('test', jest.fn());
      expect(() => manager.destroy()).not.toThrow();
      
      const debugInfo = manager.getDebugInfo();
      expect(debugInfo).toHaveProperty('isDestroyed', true);
    });

    test('should not allow operations after destruction', () => {
      manager.destroy();
      
      manager.addEventListener('test', jest.fn());
      expect(console.warn).toHaveBeenCalledWith('Cannot add listener to destroyed EventManager');
      
      manager.emit('test', 'data');
      expect(console.warn).toHaveBeenCalledWith('Cannot emit event on destroyed EventManager');
    });
  });

  describe('fetchPostDataFixed', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('should fetch data successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1, title: 'Test', body: 'Content' }),
        headers: new Map([['content-type', 'application/json']])
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const data = await fetchPostDataFixed(1);
      expect(data).toEqual({ id: 1, title: 'Test', body: 'Content' });
    });

    test('should handle HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchPostDataFixed(999)).rejects.toThrow('HTTP error! status: 404');
    });

    test('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(fetchPostDataFixed(1)).rejects.toThrow('Network error');
    });
  });

  describe('ShoppingCartFixed', () => {
    let cart: ShoppingCartFixed;
    const sampleProduct = { id: 1, name: 'Test Product', price: 100, stock: 5 };

    beforeEach(() => {
      cart = new ShoppingCartFixed();
    });

    test('should add items to cart', () => {
      cart.addItem(sampleProduct, 2);
      expect(cart.getItemCount()).toBe(2);
      expect(cart.calculateSubtotal()).toBe(200);
    });

    test('should update existing items', () => {
      cart.addItem(sampleProduct, 1);
      cart.addItem(sampleProduct, 2);
      expect(cart.getItemCount()).toBe(3);
    });

    test('should remove items', () => {
      cart.addItem(sampleProduct, 2);
      cart.removeItem(1);
      expect(cart.isEmpty()).toBe(true);
    });

    test('should update quantities', () => {
      cart.addItem(sampleProduct, 2);
      cart.updateQuantity(1, 3);
      expect(cart.getItemCount()).toBe(3);
    });

    test('should apply discounts correctly', () => {
      cart.addItem(sampleProduct, 1);
      cart.applyDiscount(0.1);
      expect(cart.calculateTotal()).toBe(90);
    });

    test('should validate stock limits', () => {
      expect(() => {
        cart.addItem(sampleProduct, 10);
      }).toThrow('Not enough stock');
    });

    test('should validate discount rates', () => {
      expect(() => {
        cart.applyDiscount(1.5);
      }).toThrow('Discount rate must be between 0 and 1');
    });

    test('should clear cart', () => {
      cart.addItem(sampleProduct, 2);
      cart.clear();
      expect(cart.isEmpty()).toBe(true);
    });

    test('should provide debug info', () => {
      cart.addItem(sampleProduct, 2);
      const debugInfo = cart.getDebugInfo();
      expect(debugInfo).toHaveProperty('itemCount', 1);
      expect(debugInfo).toHaveProperty('totalQuantity', 2);
      expect(debugInfo).toHaveProperty('subtotal', 200);
    });
  });
});

// =============================================================================
// パフォーマンステスト
// =============================================================================

describe('Performance Tests', () => {
  test('BrowserDebugger.measurePerformance should add minimal overhead', () => {
    const testFunction = () => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      return sum;
    };

    // 直接実行
    const directStart = performance.now();
    const directResult = testFunction();
    const directTime = performance.now() - directStart;

    // measurePerformanceを使用
    let measuredResult: number;
    const measuredStart = performance.now();
    measuredResult = BrowserDebugger.measurePerformance('test', testFunction);
    const measuredTime = performance.now() - measuredStart;

    expect(directResult).toBe(measuredResult);
    // オーバーヘッドは最小限であることを確認（実際の時間の10倍以内）
    expect(measuredTime).toBeLessThan(directTime * 10 + 10);
  });
});

// =============================================================================
// エラーハンドリングテスト
// =============================================================================

describe('Error Handling', () => {
  test('should handle invalid inputs gracefully', () => {
    const cart = new ShoppingCartFixed();
    
    expect(() => {
      cart.addItem(null as any, 1);
    }).toThrow('Invalid product');

    expect(() => {
      cart.addItem({ id: 1, name: 'Test', price: 100, stock: 5 }, -1);
    }).toThrow('Quantity must be positive');
  });

  test('should capture and track errors properly', () => {
    const errorTracker = new ErrorTracker();
    const testError = new Error('Test error');
    
    const errorInfo = {
      message: testError.message,
      stack: testError.stack || '',
      filename: 'test.ts',
      lineno: 1,
      colno: 1,
      error: testError,
      timestamp: new Date(),
      userAgent: 'test',
      url: 'http://test.com',
      sessionId: 'test-session',
      breadcrumbs: [],
      context: { test: true }
    };

    errorTracker.captureError(errorInfo);
    
    const stats = errorTracker.getErrorStats();
    expect(stats.totalErrors).toBe(1);
    expect(stats.recentErrors).toHaveLength(1);
  });
});