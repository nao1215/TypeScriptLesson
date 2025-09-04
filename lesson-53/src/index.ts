/**
 * Lesson 53: パフォーマンス最適化 (Performance Optimization)
 * 
 * TypeScriptアプリケーションの包括的なパフォーマンス最適化技術の実装
 */

// ===== 型定義 =====

/**
 * パフォーマンスメトリクスの型定義
 */
interface PerformanceMetrics {
  FCP: number;        // First Contentful Paint
  LCP: number;        // Largest Contentful Paint
  CLS: number;        // Cumulative Layout Shift
  FID: number;        // First Input Delay
  TTFB: number;       // Time to First Byte
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timestamp: number;
  userAgent: string;
  connectionType?: string;
}

/**
 * リソースタイミング情報
 */
interface ResourceTiming {
  name: string;
  startTime: number;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'document' | 'other';
}

/**
 * 最適化設定
 */
interface OptimizationConfig {
  enableMemoization: boolean;
  enableVirtualization: boolean;
  lazyLoadThreshold: number;
  cacheStrategy: 'memory' | 'localStorage' | 'indexedDB';
  compressionLevel: 1 | 2 | 3;
  bundleSplittingStrategy: 'route' | 'vendor' | 'dynamic';
  performanceBudget: {
    maxBundleSize: number;
    maxRenderTime: number;
    maxMemoryUsage: number;
  };
}

/**
 * メモ化オプション
 */
interface MemoizationOptions<T extends readonly unknown[]> {
  maxSize: number;
  ttl: number;
  keyGenerator: (args: T) => string;
  onEvict?: (key: string, value: unknown) => void;
}

/**
 * 仮想化設定
 */
interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  bufferSize: number;
  overscan: number;
}

// ===== パフォーマンス測定システム =====

/**
 * 包括的なパフォーマンス監視システム
 */
class PerformanceMonitor {
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;

  constructor(config: OptimizationConfig) {
    this.config = config;
    this.initializeObserver();
  }

  /**
   * Performance Observerの初期化
   */
  private initializeObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    this.observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        this.processPerformanceEntry(entry);
      });
    });

    // 様々なパフォーマンスメトリクスを監視
    this.observer.observe({ 
      entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] 
    });
  }

  /**
   * パフォーマンスエントリーの処理
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    const timestamp = Date.now();
    
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime, timestamp);
        }
        break;
      case 'largest-contentful-paint':
        this.recordMetric('LCP', entry.startTime, timestamp);
        break;
      case 'layout-shift':
        const clsEntry = entry as any;
        if (clsEntry.hadRecentInput) return;
        this.recordMetric('CLS', clsEntry.value, timestamp);
        break;
      case 'first-input':
        this.recordMetric('FID', entry.processingStart - entry.startTime, timestamp);
        break;
    }
  }

  /**
   * メトリクスの記録
   */
  private recordMetric(type: keyof PerformanceMetrics, value: number, timestamp: number): void {
    // メトリクスをローカルストレージまたは送信
    console.log(`${type}: ${value}ms at ${timestamp}`);
  }

  /**
   * Core Web Vitalsの測定
   */
  async measureCoreWebVitals(): Promise<PerformanceMetrics> {
    const memoryInfo = (performance as any).memory;
    
    return {
      FCP: this.getPerformanceMetric('first-contentful-paint'),
      LCP: this.getPerformanceMetric('largest-contentful-paint'),
      CLS: this.getCumulativeLayoutShift(),
      FID: this.getFirstInputDelay(),
      TTFB: this.getTimeToFirstByte(),
      memoryUsage: {
        usedJSHeapSize: memoryInfo?.usedJSHeapSize || 0,
        totalJSHeapSize: memoryInfo?.totalJSHeapSize || 0,
        jsHeapSizeLimit: memoryInfo?.jsHeapSizeLimit || 0,
      },
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType()
    };
  }

  /**
   * 特定のパフォーマンスメトリクスを取得
   */
  private getPerformanceMetric(name: string): number {
    const entries = performance.getEntriesByName(name);
    return entries.length > 0 ? entries[entries.length - 1].startTime : 0;
  }

  /**
   * Cumulative Layout Shiftの計算
   */
  private getCumulativeLayoutShift(): number {
    const entries = performance.getEntriesByType('layout-shift') as any[];
    return entries.reduce((sum, entry) => sum + (entry.hadRecentInput ? 0 : entry.value), 0);
  }

  /**
   * First Input Delayの取得
   */
  private getFirstInputDelay(): number {
    const entries = performance.getEntriesByType('first-input') as any[];
    return entries.length > 0 ? entries[0].processingStart - entries[0].startTime : 0;
  }

  /**
   * Time to First Byteの計算
   */
  private getTimeToFirstByte(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation ? navigation.responseStart - navigation.fetchStart : 0;
  }

  /**
   * 接続タイプの取得
   */
  private getConnectionType(): string | undefined {
    const connection = (navigator as any).connection;
    return connection ? connection.effectiveType : undefined;
  }

  /**
   * リソースタイミング分析
   */
  analyzeResourceTiming(): ResourceTiming[] {
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resourceEntries.map(entry => ({
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
      type: this.getResourceType(entry.name)
    }));
  }

  /**
   * リソースタイプの判定
   */
  private getResourceType(url: string): ResourceTiming['type'] {
    if (url.match(/\.(js|mjs)(\?|$)/)) return 'script';
    if (url.match(/\.(css)(\?|$)/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)(\?|$)/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)(\?|$)/)) return 'font';
    if (url.match(/\.(html)(\?|$)/)) return 'document';
    return 'other';
  }

  /**
   * パフォーマンス予算チェック
   */
  checkPerformanceBudget(metrics: PerformanceMetrics): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    const budget = this.config.performanceBudget;

    if (metrics.LCP > budget.maxRenderTime) {
      violations.push(`LCP exceeded budget: ${metrics.LCP}ms > ${budget.maxRenderTime}ms`);
    }

    if (metrics.memoryUsage.usedJSHeapSize > budget.maxMemoryUsage) {
      violations.push(`Memory usage exceeded budget: ${metrics.memoryUsage.usedJSHeapSize} > ${budget.maxMemoryUsage}`);
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }

  /**
   * クリーンアップ
   */
  dispose(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// ===== メモ化システム =====

/**
 * 高性能なメモ化キャッシュ
 */
class MemoizationCache<K = string, V = any> {
  private cache = new Map<K, { value: V; timestamp: number; accessCount: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = 1000, ttl: number = 60000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * 値を取得
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // TTL チェック
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // アクセス回数を更新
    entry.accessCount++;
    entry.timestamp = Date.now();

    return entry.value;
  }

  /**
   * 値を設定
   */
  set(key: K, value: V): void {
    // キャッシュサイズ制限チェック
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  /**
   * LRU アルゴリズムによるエビクション
   */
  private evictLeastRecentlyUsed(): void {
    let lruKey: K | undefined;
    let lruTimestamp = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < lruTimestamp) {
        lruTimestamp = entry.timestamp;
        lruKey = key;
      }
    }

    if (lruKey !== undefined) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * キャッシュクリア
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * キャッシュ統計
   */
  getStats(): { size: number; hitRate: number } {
    let totalAccess = 0;
    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
    }

    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? this.cache.size / totalAccess : 0
    };
  }
}

/**
 * 関数のメモ化
 */
function createMemoizedFunction<T extends readonly unknown[], R>(
  fn: (...args: T) => R | Promise<R>,
  options: MemoizationOptions<T>
): (...args: T) => R | Promise<R> {
  const cache = new MemoizationCache<string, R>(options.maxSize, options.ttl);

  return (...args: T): R | Promise<R> => {
    const key = options.keyGenerator(args);
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const result = fn(...args);

    // Promise の場合
    if (result instanceof Promise) {
      return result.then(value => {
        cache.set(key, value);
        return value;
      });
    }

    // 同期関数の場合
    cache.set(key, result);
    return result;
  };
}

// ===== 仮想化システム =====

/**
 * 大量データの効率的な表示のための仮想化システム
 */
class VirtualList<T> {
  private items: T[];
  private config: VirtualizationConfig;
  private scrollTop = 0;
  private container: HTMLElement | null = null;

  constructor(items: T[], config: VirtualizationConfig) {
    this.items = items;
    this.config = config;
  }

  /**
   * 表示範囲の計算
   */
  calculateVisibleRange(): { start: number; end: number; offset: number } {
    const { itemHeight, containerHeight, overscan } = this.config;
    
    const startIndex = Math.floor(this.scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      this.items.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex,
      offset: startIndex * itemHeight
    };
  }

  /**
   * 可視アイテムの取得
   */
  getVisibleItems(): { items: T[]; offset: number; totalHeight: number } {
    const { start, end, offset } = this.calculateVisibleRange();
    const visibleItems = this.items.slice(start, end + 1);

    return {
      items: visibleItems,
      offset,
      totalHeight: this.items.length * this.config.itemHeight
    };
  }

  /**
   * スクロール位置の更新
   */
  updateScrollPosition(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }

  /**
   * アイテムの動的追加
   */
  addItems(newItems: T[]): void {
    this.items.push(...newItems);
  }

  /**
   * アイテムの削除
   */
  removeItem(index: number): void {
    this.items.splice(index, 1);
  }
}

// ===== リソース最適化 =====

/**
 * 画像の遅延読み込みシステム
 */
class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor(threshold = 0.1, rootMargin = '50px') {
    this.initializeObserver(threshold, rootMargin);
  }

  /**
   * Intersection Observerの初期化
   */
  private initializeObserver(threshold: number, rootMargin: string): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          this.loadImage(img);
          this.observer?.unobserve(img);
          this.images.delete(img);
        }
      });
    }, { threshold, rootMargin });
  }

  /**
   * 画像の追加
   */
  addImage(img: HTMLImageElement): void {
    if (!this.observer || this.images.has(img)) return;

    this.images.add(img);
    this.observer.observe(img);
  }

  /**
   * 画像の読み込み
   */
  private loadImage(img: HTMLImageElement): void {
    const dataSrc = img.dataset.src;
    if (dataSrc) {
      img.src = dataSrc;
      img.removeAttribute('data-src');
      
      // 読み込み完了時の処理
      img.onload = () => {
        img.classList.add('loaded');
      };
    }
  }

  /**
   * クリーンアップ
   */
  dispose(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.images.clear();
  }
}

// ===== ワーカースレッド活用 =====

/**
 * Web Workerを使った重い処理の分離
 */
class WorkerTaskManager {
  private workers: Map<string, Worker> = new Map();
  private taskQueue: Array<{ id: string; data: any; resolve: Function; reject: Function }> = [];

  /**
   * ワーカーの作成
   */
  createWorker(name: string, scriptUrl: string): void {
    if (typeof Worker === 'undefined') {
      console.warn('Web Workers not supported');
      return;
    }

    const worker = new Worker(scriptUrl);
    
    worker.onmessage = (event) => {
      this.handleWorkerMessage(event.data);
    };

    worker.onerror = (error) => {
      console.error(`Worker ${name} error:`, error);
    };

    this.workers.set(name, worker);
  }

  /**
   * ワーカーにタスクを送信
   */
  async submitTask<T>(workerName: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const taskId = `${workerName}_${Date.now()}_${Math.random()}`;
      
      this.taskQueue.push({ id: taskId, data, resolve, reject });

      const worker = this.workers.get(workerName);
      if (!worker) {
        reject(new Error(`Worker ${workerName} not found`));
        return;
      }

      worker.postMessage({ taskId, data });
    });
  }

  /**
   * ワーカーからのメッセージ処理
   */
  private handleWorkerMessage(message: { taskId: string; result?: any; error?: string }): void {
    const taskIndex = this.taskQueue.findIndex(task => task.id === message.taskId);
    if (taskIndex === -1) return;

    const task = this.taskQueue[taskIndex];
    this.taskQueue.splice(taskIndex, 1);

    if (message.error) {
      task.reject(new Error(message.error));
    } else {
      task.resolve(message.result);
    }
  }

  /**
   * ワーカーの終了
   */
  terminateWorker(name: string): void {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
    }
  }

  /**
   * 全ワーカーの終了
   */
  terminateAll(): void {
    for (const [name] of this.workers) {
      this.terminateWorker(name);
    }
  }
}

// ===== バンドル最適化 =====

/**
 * 動的インポートマネージャー
 */
class DynamicImportManager {
  private cache = new Map<string, Promise<any>>();
  private preloadedModules = new Set<string>();

  /**
   * モジュールの動的インポート
   */
  async importModule<T = any>(modulePath: string): Promise<T> {
    // キャッシュチェック
    if (this.cache.has(modulePath)) {
      return this.cache.get(modulePath)!;
    }

    // 動的インポート実行
    const importPromise = import(modulePath);
    this.cache.set(modulePath, importPromise);

    try {
      return await importPromise;
    } catch (error) {
      this.cache.delete(modulePath);
      throw error;
    }
  }

  /**
   * モジュールのプリロード
   */
  preloadModule(modulePath: string): void {
    if (this.preloadedModules.has(modulePath)) return;

    // プリロードリンクを作成
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = modulePath;
    document.head.appendChild(link);

    this.preloadedModules.add(modulePath);
  }

  /**
   * バッチプリロード
   */
  preloadModules(modulePaths: string[]): void {
    modulePaths.forEach(path => this.preloadModule(path));
  }

  /**
   * キャッシュクリア
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// ===== 使用例とデモ =====

/**
 * パフォーマンス最適化のデモ
 */
async function demonstratePerformanceOptimization(): Promise<void> {
  console.log('=== Performance Optimization Demo ===');

  // 1. パフォーマンス監視
  const config: OptimizationConfig = {
    enableMemoization: true,
    enableVirtualization: true,
    lazyLoadThreshold: 0.1,
    cacheStrategy: 'memory',
    compressionLevel: 2,
    bundleSplittingStrategy: 'route',
    performanceBudget: {
      maxBundleSize: 500 * 1024, // 500KB
      maxRenderTime: 2500, // 2.5s
      maxMemoryUsage: 50 * 1024 * 1024 // 50MB
    }
  };

  const monitor = new PerformanceMonitor(config);

  // 2. Core Web Vitals測定
  try {
    const metrics = await monitor.measureCoreWebVitals();
    console.log('Core Web Vitals:', metrics);

    const budget = monitor.checkPerformanceBudget(metrics);
    if (!budget.passed) {
      console.warn('Performance budget violations:', budget.violations);
    }
  } catch (error) {
    console.error('Performance measurement failed:', error);
  }

  // 3. メモ化デモ
  const expensiveCalculation = (n: number): number => {
    console.log(`Computing expensive calculation for ${n}`);
    let result = 0;
    for (let i = 0; i < n * 1000000; i++) {
      result += Math.sqrt(i);
    }
    return result;
  };

  const memoized = createMemoizedFunction(expensiveCalculation, {
    maxSize: 100,
    ttl: 60000,
    keyGenerator: (args) => args[0].toString()
  });

  console.time('First call');
  await memoized(100);
  console.timeEnd('First call');

  console.time('Cached call');
  await memoized(100);
  console.timeEnd('Cached call');

  // 4. 仮想化デモ
  const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
  const virtualList = new VirtualList(data, {
    itemHeight: 50,
    containerHeight: 400,
    bufferSize: 5,
    overscan: 3
  });

  const visibleItems = virtualList.getVisibleItems();
  console.log('Virtual list visible items:', visibleItems.items.length);

  // 5. ワーカータスクデモ
  const taskManager = new WorkerTaskManager();
  
  // 実際のワーカーファイルが必要
  // taskManager.createWorker('calculator', '/workers/calculator.js');

  console.log('Performance optimization demo completed');

  // クリーンアップ
  monitor.dispose();
}

// ===== エクスポート =====

export {
  PerformanceMonitor,
  MemoizationCache,
  createMemoizedFunction,
  VirtualList,
  LazyImageLoader,
  WorkerTaskManager,
  DynamicImportManager,
  demonstratePerformanceOptimization,
  type PerformanceMetrics,
  type ResourceTiming,
  type OptimizationConfig,
  type MemoizationOptions,
  type VirtualizationConfig
};

// デモの実行
if (typeof window !== 'undefined') {
  demonstratePerformanceOptimization().catch(console.error);
}