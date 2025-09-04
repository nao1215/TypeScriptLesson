/**
 * Lesson 53: パフォーマンス最適化 - テストコード
 * 
 * パフォーマンス最適化機能の包括的なテストケース
 */

import {
  PerformanceMonitor,
  MemoizationCache,
  createMemoizedFunction,
  VirtualList,
  LazyImageLoader,
  WorkerTaskManager,
  DynamicImportManager
} from '../src/index';

import {
  AdvancedPerformanceMonitor,
  MultiLayerCacheSystem,
  AdaptiveVirtualizationEngine
} from '../src/solution';

// モックの設定
const mockPerformanceObserver = jest.fn();
const mockIntersectionObserver = jest.fn();

// グローバルモック
(global as any).PerformanceObserver = mockPerformanceObserver;
(global as any).IntersectionObserver = mockIntersectionObserver;
(global as any).performance = {
  now: jest.fn(() => Date.now()),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  memory: {
    usedJSHeapSize: 1024 * 1024,
    totalJSHeapSize: 2 * 1024 * 1024,
    jsHeapSizeLimit: 4 * 1024 * 1024
  }
};

describe('Lesson 53: Performance Optimization Tests', () => {

  // ===== パフォーマンスモニター基本機能テスト =====

  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      const config = {
        enableMemoization: true,
        enableVirtualization: true,
        lazyLoadThreshold: 0.1,
        cacheStrategy: 'memory' as const,
        compressionLevel: 2 as const,
        bundleSplittingStrategy: 'route' as const,
        performanceBudget: {
          maxBundleSize: 500 * 1024,
          maxRenderTime: 2500,
          maxMemoryUsage: 50 * 1024 * 1024
        }
      };
      monitor = new PerformanceMonitor(config);
    });

    test('should measure core web vitals', async () => {
      const metrics = await monitor.measureCoreWebVitals();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.FCP).toBe('number');
      expect(typeof metrics.LCP).toBe('number');
      expect(typeof metrics.CLS).toBe('number');
      expect(typeof metrics.FID).toBe('number');
      expect(typeof metrics.TTFB).toBe('number');
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.timestamp).toBeGreaterThan(0);
      expect(metrics.userAgent).toBeDefined();
    });

    test('should analyze resource timing', () => {
      // Mock performance entries
      (performance.getEntriesByType as jest.Mock).mockReturnValue([
        {
          name: 'https://example.com/script.js',
          startTime: 100,
          duration: 200,
          transferSize: 1024,
          encodedBodySize: 800,
          decodedBodySize: 1200
        }
      ]);

      const resources = monitor.analyzeResourceTiming();
      
      expect(resources).toHaveLength(1);
      expect(resources[0].name).toBe('https://example.com/script.js');
      expect(resources[0].type).toBe('script');
      expect(resources[0].duration).toBe(200);
    });

    test('should check performance budget', async () => {
      const metrics = await monitor.measureCoreWebVitals();
      const result = monitor.checkPerformanceBudget(metrics);
      
      expect(result).toBeDefined();
      expect(typeof result.passed).toBe('boolean');
      expect(Array.isArray(result.violations)).toBe(true);
    });

    test('should dispose properly', () => {
      expect(() => monitor.dispose()).not.toThrow();
    });
  });

  // ===== メモ化キャッシュテスト =====

  describe('MemoizationCache', () => {
    let cache: MemoizationCache<string, number>;

    beforeEach(() => {
      cache = new MemoizationCache<string, number>(100, 1000);
    });

    test('should store and retrieve values', () => {
      cache.set('key1', 42);
      const value = cache.get('key1');
      
      expect(value).toBe(42);
    });

    test('should handle cache miss', () => {
      const value = cache.get('nonexistent');
      
      expect(value).toBeUndefined();
    });

    test('should respect TTL', (done) => {
      const shortCache = new MemoizationCache<string, number>(100, 10);
      shortCache.set('temp', 123);
      
      setTimeout(() => {
        const value = shortCache.get('temp');
        expect(value).toBeUndefined();
        done();
      }, 20);
    });

    test('should provide cache statistics', () => {
      cache.set('key1', 1);
      cache.set('key2', 2);
      cache.get('key1'); // hit
      cache.get('key3'); // miss

      const stats = cache.getStats();
      
      expect(stats.size).toBe(2);
      expect(typeof stats.hitRate).toBe('number');
    });

    test('should clear cache', () => {
      cache.set('key1', 1);
      cache.clear();
      
      const value = cache.get('key1');
      expect(value).toBeUndefined();
    });
  });

  // ===== メモ化関数テスト =====

  describe('createMemoizedFunction', () => {
    test('should memoize synchronous function', () => {
      let callCount = 0;
      const expensiveFunction = (n: number) => {
        callCount++;
        return n * 2;
      };

      const memoized = createMemoizedFunction(expensiveFunction, {
        maxSize: 10,
        ttl: 1000,
        keyGenerator: (args) => args[0].toString()
      });

      const result1 = memoized(5);
      const result2 = memoized(5);
      
      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(callCount).toBe(1); // 1回のみ呼び出される
    });

    test('should memoize asynchronous function', async () => {
      let callCount = 0;
      const asyncFunction = async (n: number) => {
        callCount++;
        return Promise.resolve(n * 3);
      };

      const memoized = createMemoizedFunction(asyncFunction, {
        maxSize: 10,
        ttl: 1000,
        keyGenerator: (args) => args[0].toString()
      });

      const result1 = await memoized(4);
      const result2 = await memoized(4);
      
      expect(result1).toBe(12);
      expect(result2).toBe(12);
      expect(callCount).toBe(1);
    });
  });

  // ===== 仮想リストテスト =====

  describe('VirtualList', () => {
    let virtualList: VirtualList<{ id: number; name: string }>;
    const testData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }));

    beforeEach(() => {
      virtualList = new VirtualList(testData, {
        itemHeight: 50,
        containerHeight: 400,
        bufferSize: 5,
        overscan: 3
      });
    });

    test('should calculate visible range correctly', () => {
      virtualList.updateScrollPosition(0);
      const range = virtualList.calculateVisibleRange();
      
      expect(range.start).toBe(0);
      expect(range.end).toBeGreaterThan(range.start);
      expect(range.offset).toBe(0);
    });

    test('should get visible items', () => {
      virtualList.updateScrollPosition(100);
      const result = virtualList.getVisibleItems();
      
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.offset).toBe('number');
      expect(typeof result.totalHeight).toBe('number');
      expect(result.totalHeight).toBe(testData.length * 50);
    });

    test('should add items dynamically', () => {
      const newItems = [{ id: 1000, name: 'New Item' }];
      virtualList.addItems(newItems);
      
      const result = virtualList.getVisibleItems();
      expect(result.totalHeight).toBe((testData.length + 1) * 50);
    });

    test('should remove items', () => {
      virtualList.removeItem(0);
      
      const result = virtualList.getVisibleItems();
      expect(result.totalHeight).toBe((testData.length - 1) * 50);
    });
  });

  // ===== 遅延画像読み込みテスト =====

  describe('LazyImageLoader', () => {
    let loader: LazyImageLoader;
    let mockImg: HTMLImageElement;

    beforeEach(() => {
      loader = new LazyImageLoader();
      mockImg = {
        dataset: { src: 'https://example.com/image.jpg' },
        classList: { add: jest.fn() },
        removeAttribute: jest.fn(),
        onload: null
      } as any;
      
      // IntersectionObserver のモック
      (mockIntersectionObserver as any).mockImplementation((callback: Function) => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
      }));
    });

    test('should add image for lazy loading', () => {
      expect(() => loader.addImage(mockImg)).not.toThrow();
    });

    test('should dispose properly', () => {
      expect(() => loader.dispose()).not.toThrow();
    });
  });

  // ===== ワーカータスクマネージャーテスト =====

  describe('WorkerTaskManager', () => {
    let taskManager: WorkerTaskManager;

    beforeEach(() => {
      // Worker のモック
      (global as any).Worker = jest.fn().mockImplementation(() => ({
        postMessage: jest.fn(),
        terminate: jest.fn(),
        onmessage: null,
        onerror: null
      }));
      
      taskManager = new WorkerTaskManager();
    });

    test('should create worker', () => {
      expect(() => {
        taskManager.createWorker('test', 'worker.js');
      }).not.toThrow();
    });

    test('should terminate worker', () => {
      taskManager.createWorker('test', 'worker.js');
      expect(() => {
        taskManager.terminateWorker('test');
      }).not.toThrow();
    });

    test('should terminate all workers', () => {
      taskManager.createWorker('test1', 'worker1.js');
      taskManager.createWorker('test2', 'worker2.js');
      
      expect(() => {
        taskManager.terminateAll();
      }).not.toThrow();
    });
  });

  // ===== 動的インポートマネージャーテスト =====

  describe('DynamicImportManager', () => {
    let importManager: DynamicImportManager;

    beforeEach(() => {
      importManager = new DynamicImportManager();
      
      // document のモック
      (global as any).document = {
        createElement: jest.fn().mockReturnValue({
          rel: '',
          href: ''
        }),
        head: {
          appendChild: jest.fn()
        }
      };
    });

    test('should preload module', () => {
      expect(() => {
        importManager.preloadModule('/modules/test.js');
      }).not.toThrow();
    });

    test('should preload multiple modules', () => {
      const modules = ['/modules/a.js', '/modules/b.js'];
      
      expect(() => {
        importManager.preloadModules(modules);
      }).not.toThrow();
    });

    test('should clear cache', () => {
      expect(() => {
        importManager.clearCache();
      }).not.toThrow();
    });
  });

  // ===== 高度なパフォーマンスモニターテスト =====

  describe('AdvancedPerformanceMonitor', () => {
    let monitor: AdvancedPerformanceMonitor;

    beforeEach(() => {
      monitor = new AdvancedPerformanceMonitor();
    });

    test('should start real-time monitoring', () => {
      expect(() => {
        monitor.startRealTimeMonitoring();
      }).not.toThrow();
    });

    test('should detect anomalies in metrics', () => {
      const normalMetrics = Array.from({ length: 20 }, () => 100 + Math.random() * 10);
      const metricsWithAnomaly = [...normalMetrics, 500]; // 異常値を追加
      
      const anomalies = monitor.detectAnomalies(metricsWithAnomaly, 2.0);
      expect(Array.isArray(anomalies)).toBe(true);
    });

    test('should analyze correlation between metrics', () => {
      const metricsA = [1, 2, 3, 4, 5];
      const metricsB = [2, 4, 6, 8, 10]; // 強い正の相関
      
      const correlation = monitor.analyzeCorrelation(metricsA, metricsB);
      expect(correlation).toBeCloseTo(1, 1); // 強い正の相関
    });

    test('should analyze trends in historical data', () => {
      const increasingData = Array.from({ length: 50 }, (_, i) => 100 + i * 2);
      
      const analysis = monitor.analyzeTrends(increasingData);
      expect(analysis).toBeDefined();
      expect(analysis.trend).toBe('degrading'); // 数値が増加（パフォーマンス悪化）
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    test('should stop monitoring properly', () => {
      monitor.startRealTimeMonitoring();
      expect(() => {
        monitor.stopMonitoring();
      }).not.toThrow();
    });
  });

  // ===== マルチレイヤーキャッシュシステムテスト =====

  describe('MultiLayerCacheSystem', () => {
    let cache: MultiLayerCacheSystem<string, any>;

    beforeEach(() => {
      cache = new MultiLayerCacheSystem<string, any>();
    });

    test('should store and retrieve from multi-layer cache', async () => {
      await cache.set('test-key', { data: 'test-value' });
      const result = await cache.get('test-key');
      
      expect(result).toEqual({ data: 'test-value' });
    });

    test('should handle cache miss gracefully', async () => {
      const result = await cache.get('nonexistent-key');
      expect(result).toBeNull();
    });

    test('should provide cache statistics', () => {
      const stats = cache.getStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.missRate).toBe('number');
      expect(typeof stats.evictionRate).toBe('number');
      expect(typeof stats.memoryUsage).toBe('number');
    });

    test('should support prefetching', async () => {
      const keys = ['key1', 'key2', 'key3'];
      
      await expect(cache.prefetch(keys, 1)).resolves.toBeUndefined();
    });

    test('should support intelligent invalidation', async () => {
      await cache.set('user:1', { name: 'Alice' });
      await cache.set('user:2', { name: 'Bob' });
      await cache.set('post:1', { title: 'Test' });
      
      // user: で始まるキーを無効化
      await cache.invalidate(key => String(key).startsWith('user:'));
      
      const user1 = await cache.get('user:1');
      const post1 = await cache.get('post:1');
      
      expect(user1).toBeNull();
      expect(post1).toEqual({ title: 'Test' });
    });
  });

  // ===== 適応的仮想化エンジンテスト =====

  describe('AdaptiveVirtualizationEngine', () => {
    let virtualizer: AdaptiveVirtualizationEngine<any>;
    const testItems = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      height: 50 + (i % 3) * 10, // 動的な高さ
      data: { name: `Item ${i}` }
    }));

    beforeEach(() => {
      virtualizer = new AdaptiveVirtualizationEngine();
      virtualizer.setItems(testItems);
    });

    afterEach(() => {
      virtualizer.dispose();
    });

    test('should calculate adaptive viewport', () => {
      const viewport = virtualizer.calculateAdaptiveViewport(0, 400);
      
      expect(viewport).toBeDefined();
      expect(viewport.startIndex).toBeGreaterThanOrEqual(0);
      expect(viewport.endIndex).toBeGreaterThanOrEqual(viewport.startIndex);
      expect(typeof viewport.scrollOffset).toBe('number');
      expect(typeof viewport.totalSize).toBe('number');
    });

    test('should handle empty items', () => {
      const emptyVirtualizer = new AdaptiveVirtualizationEngine();
      emptyVirtualizer.setItems([]);
      
      const viewport = emptyVirtualizer.calculateAdaptiveViewport(0, 400);
      
      expect(viewport.startIndex).toBe(0);
      expect(viewport.endIndex).toBe(-1);
      expect(viewport.totalSize).toBe(0);
    });

    test('should support smooth scrolling optimization', () => {
      const mockScrollElement = {
        scrollTo: jest.fn(),
        scrollTop: 0
      };
      
      // プライベートプロパティへのアクセスをテストするため、any型でキャスト
      (virtualizer as any).scrollElement = mockScrollElement;
      
      expect(() => {
        virtualizer.optimizeScrolling(10, 'smooth');
      }).not.toThrow();
    });

    test('should create nested virtualizer', () => {
      const childItems = Array.from({ length: 10 }, (_, i) => ({
        id: `child-${i}`,
        data: { name: `Child ${i}` }
      }));
      
      const nestedVirtualizer = virtualizer.createNestedVirtualizer(0, childItems);
      
      expect(nestedVirtualizer).toBeDefined();
      expect(nestedVirtualizer).toBeInstanceOf(AdaptiveVirtualizationEngine);
    });

    test('should register and unregister render callbacks', () => {
      const callback = jest.fn();
      const unregister = virtualizer.onRender(callback);
      
      expect(typeof unregister).toBe('function');
      expect(() => unregister()).not.toThrow();
    });

    test('should handle item size measurement', () => {
      const mockElement = {
        getBoundingClientRect: jest.fn().mockReturnValue({ height: 75 })
      } as any;
      
      expect(() => {
        virtualizer.measureItemSize(0, mockElement);
      }).not.toThrow();
    });

    test('should update accessibility attributes', () => {
      const mockContainer = {
        setAttribute: jest.fn()
      } as any;
      
      (virtualizer as any).containerElement = mockContainer;
      
      const viewport = virtualizer.calculateAdaptiveViewport(0, 400);
      
      expect(() => {
        virtualizer.updateAccessibilityAttributes(viewport);
      }).not.toThrow();
    });

    test('should dispose properly', () => {
      expect(() => {
        virtualizer.dispose();
      }).not.toThrow();
    });
  });

  // ===== 統合テスト =====

  describe('Performance Optimization Integration', () => {
    test('should work together seamlessly', async () => {
      // パフォーマンス監視
      const monitor = new PerformanceMonitor({
        enableMemoization: true,
        enableVirtualization: true,
        lazyLoadThreshold: 0.1,
        cacheStrategy: 'memory',
        compressionLevel: 2,
        bundleSplittingStrategy: 'route',
        performanceBudget: {
          maxBundleSize: 500 * 1024,
          maxRenderTime: 2500,
          maxMemoryUsage: 50 * 1024 * 1024
        }
      });

      // メモ化
      const expensiveCalc = (n: number) => n * n;
      const memoized = createMemoizedFunction(expensiveCalc, {
        maxSize: 100,
        ttl: 60000,
        keyGenerator: (args) => args[0].toString()
      });

      // 仮想化
      const testData = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const virtualList = new VirtualList(testData, {
        itemHeight: 50,
        containerHeight: 400,
        bufferSize: 5,
        overscan: 3
      });

      // 全体的なテスト
      const metrics = await monitor.measureCoreWebVitals();
      const calcResult = memoized(10);
      const visibleItems = virtualList.getVisibleItems();

      expect(metrics).toBeDefined();
      expect(calcResult).toBe(100);
      expect(visibleItems.items.length).toBeGreaterThan(0);

      // クリーンアップ
      monitor.dispose();
    });
  });

  // ===== パフォーマンスベンチマーク =====

  describe('Performance Benchmarks', () => {
    test('memoized function should be faster than non-memoized', () => {
      let normalCallCount = 0;
      let memoizedCallCount = 0;

      const expensiveFunction = (n: number) => {
        normalCallCount++;
        // 重い処理をシミュレート
        let result = 0;
        for (let i = 0; i < 1000; i++) {
          result += Math.sqrt(n + i);
        }
        return result;
      };

      const memoizedExpensive = createMemoizedFunction((n: number) => {
        memoizedCallCount++;
        let result = 0;
        for (let i = 0; i < 1000; i++) {
          result += Math.sqrt(n + i);
        }
        return result;
      }, {
        maxSize: 10,
        ttl: 60000,
        keyGenerator: (args) => args[0].toString()
      });

      // 通常の関数を複数回呼び出し
      const normalStart = performance.now();
      for (let i = 0; i < 10; i++) {
        expensiveFunction(100);
      }
      const normalTime = performance.now() - normalStart;

      // メモ化された関数を複数回呼び出し
      const memoizedStart = performance.now();
      for (let i = 0; i < 10; i++) {
        memoizedExpensive(100);
      }
      const memoizedTime = performance.now() - memoizedStart;

      expect(normalCallCount).toBe(10);
      expect(memoizedCallCount).toBe(1); // 最初の1回のみ
      expect(memoizedTime).toBeLessThan(normalTime);
    });

    test('virtual list should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`
      }));

      const virtualList = new VirtualList(largeDataset, {
        itemHeight: 50,
        containerHeight: 600,
        bufferSize: 10,
        overscan: 5
      });

      const start = performance.now();
      virtualList.updateScrollPosition(50000); // 大きなスクロール位置
      const result = virtualList.getVisibleItems();
      const time = performance.now() - start;

      expect(result.items.length).toBeLessThan(100); // 可視アイテムのみ
      expect(time).toBeLessThan(50); // 50ms未満で完了
      expect(result.totalHeight).toBe(largeDataset.length * 50);
    });
  });
});

// テスト用ヘルパー関数

/**
 * 非同期操作の完了を待つ
 */
function waitForAsync(ms: number = 10): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * パフォーマンステストデータの生成
 */
function generatePerformanceTestData(count: number): Array<{ id: number; data: any }> {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    data: {
      name: `Test Item ${index}`,
      value: Math.random() * 1000,
      timestamp: Date.now() + index,
      metadata: {
        category: `Category ${index % 10}`,
        tags: [`tag${index % 5}`, `tag${(index + 1) % 5}`],
        nested: {
          level1: {
            level2: {
              value: index * 2
            }
          }
        }
      }
    }
  }));
}

/**
 * メモリ使用量の測定
 */
function measureMemoryUsage(): number {
  if ((performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
}

// エクスポート
export {
  waitForAsync,
  generatePerformanceTestData,
  measureMemoryUsage
};