/**
 * Lesson 63: デバッグ技術 (Debugging Techniques)
 * 
 * このファイルは、TypeScriptアプリケーションの効果的なデバッグ技術を
 * 実装したサンプルコードです。
 */

// =============================================================================
// 型定義
// =============================================================================

/**
 * デバッグ設定の型定義
 */
interface DebugConfig {
  type: 'node' | 'chrome' | 'edge';
  request: 'launch' | 'attach';
  name: string;
  program?: string;
  args?: string[];
  env?: Record<string, string>;
  console?: 'internalConsole' | 'integratedTerminal' | 'externalTerminal';
  sourceMaps?: boolean;
  outFiles?: string[];
  skipFiles?: string[];
  stopOnEntry?: boolean;
  restart?: boolean;
  port?: number;
  address?: string;
  localRoot?: string;
  remoteRoot?: string;
}

/**
 * パフォーマンスメトリクスの型定義
 */
interface PerformanceMetrics {
  timing: {
    navigationStart: number;
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  resources: ResourceTiming[];
}

interface ResourceTiming {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
}

/**
 * エラー情報の型定義
 */
interface ErrorInfo {
  message: string;
  stack: string;
  filename: string;
  lineno: number;
  colno: number;
  error: Error;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  breadcrumbs: Breadcrumb[];
  context: Record<string, any>;
}

interface Breadcrumb {
  timestamp: Date;
  category: 'navigation' | 'user' | 'console' | 'network' | 'dom';
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

/**
 * ログレベルの型定義
 */
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// =============================================================================
// ブラウザデバッガー
// =============================================================================

/**
 * ブラウザでのデバッグを支援するヘルパークラス
 */
export class BrowserDebugger {
  private static isProduction = process.env.NODE_ENV === 'production';

  /**
   * 条件付きブレークポイントの設定
   */
  static setBreakpoint(condition?: string): void {
    if (this.isProduction) return;

    if (condition) {
      try {
        if (eval(condition)) {
          console.log(`🔍 Breakpoint hit: ${condition}`);
          debugger;
        }
      } catch (error) {
        console.error('Invalid breakpoint condition:', error);
      }
    } else {
      debugger;
    }
  }

  /**
   * パフォーマンス測定
   */
  static measurePerformance<T>(name: string, fn: () => T): T {
    if (this.isProduction) return fn();

    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    performance.mark(startMark);
    console.time(name);
    
    const result = fn();
    
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);
    console.timeEnd(name);
    
    const measure = performance.getEntriesByName(name)[0];
    if (measure) {
      console.log(`⏱️ ${name} took ${measure.duration.toFixed(2)}ms`);
    }
    
    return result;
  }

  /**
   * 非同期パフォーマンス測定
   */
  static async measurePerformanceAsync<T>(
    name: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    if (this.isProduction) return await fn();

    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    performance.mark(startMark);
    console.time(name);
    
    try {
      const result = await fn();
      
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);
      console.timeEnd(name);
      
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        console.log(`⏱️ ${name} took ${measure.duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      performance.mark(endMark);
      console.timeEnd(name);
      console.error(`❌ ${name} failed:`, error);
      throw error;
    }
  }

  /**
   * メモリ使用量のログ出力
   */
  static logMemoryUsage(label?: string): void {
    if (this.isProduction) return;

    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const prefix = label ? `[${label}] ` : '';
      
      console.group(`🧠 ${prefix}Memory Usage`);
      console.table({
        'Used JS Heap Size': `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        'Total JS Heap Size': `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        'JS Heap Size Limit': `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
        'Memory Pressure': `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)}%`
      });
      console.groupEnd();
    }
  }

  /**
   * ガベージコレクションの手動実行（可能な場合）
   */
  static forceGC(): void {
    if (this.isProduction) return;

    if (typeof window !== 'undefined' && 'gc' in window) {
      console.log('🗑️ Forcing garbage collection...');
      (window as any).gc();
      this.logMemoryUsage('After GC');
    } else {
      console.warn('Manual GC not available');
    }
  }
}

// =============================================================================
// 自動デバッガー
// =============================================================================

/**
 * 自動デバッグ機能を提供するクラス
 */
export class AutoDebugger {
  private static instance: AutoDebugger;
  private breakpoints: Map<string, () => boolean> = new Map();
  private watchers: Map<string, () => any> = new Map();
  private watcherValues: Map<string, any> = new Map();
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  static getInstance(): AutoDebugger {
    if (!AutoDebugger.instance) {
      AutoDebugger.instance = new AutoDebugger();
    }
    return AutoDebugger.instance;
  }

  /**
   * 条件付きブレークポイントの追加
   */
  addConditionalBreakpoint(id: string, condition: () => boolean): void {
    this.breakpoints.set(id, condition);
    console.log(`🎯 Added conditional breakpoint: ${id}`);
  }

  /**
   * ブレークポイントの削除
   */
  removeBreakpoint(id: string): boolean {
    return this.breakpoints.delete(id);
  }

  /**
   * 変数ウォッチャーの追加
   */
  watchVariable(name: string, getter: () => any): void {
    this.watchers.set(name, getter);
    this.watcherValues.set(name, getter()); // 初期値を保存
    console.log(`👁️ Started watching variable: ${name}`);
  }

  /**
   * ウォッチャーの削除
   */
  removeWatcher(name: string): boolean {
    this.watcherValues.delete(name);
    return this.watchers.delete(name);
  }

  /**
   * デバッグセッションの開始
   */
  startDebugging(interval = 100): void {
    if (this.isRunning) {
      console.warn('Debugger is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting auto debugger...');

    this.intervalId = setInterval(() => {
      // ブレークポイントチェック
      for (const [id, condition] of this.breakpoints) {
        try {
          if (condition()) {
            console.log(`🛑 Breakpoint hit: ${id}`);
            debugger;
          }
        } catch (error) {
          console.error(`Error in breakpoint ${id}:`, error);
        }
      }

      // 変数監視
      for (const [name, getter] of this.watchers) {
        try {
          const currentValue = getter();
          const previousValue = this.watcherValues.get(name);
          
          if (currentValue !== previousValue) {
            console.log(`🔄 Variable changed - ${name}:`, {
              previous: previousValue,
              current: currentValue
            });
            this.watcherValues.set(name, currentValue);
          }
        } catch (error) {
          console.error(`Error watching variable ${name}:`, error);
        }
      }
    }, interval);
  }

  /**
   * デバッグセッションの停止
   */
  stopDebugging(): void {
    if (!this.isRunning) {
      console.warn('Debugger is not running');
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log('⏹️ Auto debugger stopped');
  }

  /**
   * デバッグ状態の取得
   */
  getStatus(): {
    isRunning: boolean;
    breakpointsCount: number;
    watchersCount: number;
  } {
    return {
      isRunning: this.isRunning,
      breakpointsCount: this.breakpoints.size,
      watchersCount: this.watchers.size
    };
  }
}

// =============================================================================
// ネットワークデバッガー
// =============================================================================

/**
 * ネットワーク通信のデバッグを支援するクラス
 */
export class NetworkDebugger {
  private interceptedRequests: Map<string, any> = new Map();
  private originalFetch?: typeof fetch;
  private isIntercepting = false;

  /**
   * Fetch APIのインターセプト開始
   */
  interceptFetch(): void {
    if (this.isIntercepting || typeof window === 'undefined') return;

    this.originalFetch = window.fetch;
    this.isIntercepting = true;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestId = Math.random().toString(36).substr(2, 9);
      const startTime = performance.now();
      const url = input instanceof Request ? input.url : input.toString();
      
      console.group(`🌐 Network Request ${requestId}`);
      console.log('URL:', url);
      console.log('Method:', init?.method || 'GET');
      console.log('Headers:', init?.headers || {});
      
      if (init?.body) {
        console.log('Body:', init.body);
      }

      this.interceptedRequests.set(requestId, {
        url,
        method: init?.method || 'GET',
        headers: init?.headers,
        body: init?.body,
        startTime
      });

      try {
        const response = await this.originalFetch!(input, init);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`✅ Response (${duration.toFixed(2)}ms):`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          size: response.headers.get('content-length') || 'unknown'
        });

        // レスポンスをクローンして内容をログ（テキストの場合）
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json') || contentType?.includes('text/')) {
          const clonedResponse = response.clone();
          clonedResponse.text().then(text => {
            console.log(`📄 Response Body for ${requestId}:`, text);
          }).catch(err => {
            console.warn('Could not read response body:', err);
          });
        }

        console.groupEnd();
        return response;
        
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.error(`❌ Request failed (${duration.toFixed(2)}ms):`, error);
        console.groupEnd();
        
        throw error;
      }
    };

    console.log('🕵️ Network interception started');
  }

  /**
   * Fetch APIインターセプトの停止
   */
  stopInterception(): void {
    if (!this.isIntercepting || !this.originalFetch || typeof window === 'undefined') {
      return;
    }

    window.fetch = this.originalFetch;
    this.isIntercepting = false;
    console.log('🛑 Network interception stopped');
  }

  /**
   * インターセプトしたリクエストの一覧取得
   */
  getInterceptedRequests(): Array<[string, any]> {
    return Array.from(this.interceptedRequests.entries());
  }

  /**
   * インターセプト履歴のクリア
   */
  clearHistory(): void {
    this.interceptedRequests.clear();
    console.log('🗑️ Network request history cleared');
  }
}

// =============================================================================
// パフォーマンス分析器
// =============================================================================

/**
 * パフォーマンス分析を行うクラス
 */
export class PerformanceAnalyzer {
  private observers: Map<string, PerformanceObserver> = new Map();
  private webVitalsData: Record<string, number> = {};

  /**
   * Web Vitalsの監視開始
   */
  monitorWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.webVitalsData.lcp = lastEntry.startTime;
        console.log('🎨 LCP:', lastEntry.startTime.toFixed(2), 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          this.webVitalsData.fid = fid;
          console.log('⚡ FID:', fid.toFixed(2), 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'], buffered: true });
      this.observers.set('fid', fidObserver);
    } catch (e) {
      console.warn('FID monitoring not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.webVitalsData.cls = clsValue;
            console.log('📐 CLS:', clsValue.toFixed(4));
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'], buffered: true });
      this.observers.set('cls', clsObserver);
    } catch (e) {
      console.warn('CLS monitoring not supported');
    }

    // Time to First Byte (TTFB)
    try {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0];
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        this.webVitalsData.ttfb = ttfb;
        console.log('🚀 TTFB:', ttfb.toFixed(2), 'ms');
      }
    } catch (e) {
      console.warn('TTFB measurement not supported');
    }

    console.log('📊 Web Vitals monitoring started');
  }

  /**
   * メモリリーク検出
   */
  detectMemoryLeaks(checkInterval = 5000, thresholdMB = 10): void {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      console.warn('Memory monitoring not available');
      return;
    }

    let baseline: number;
    let consecutiveIncreases = 0;
    const maxConsecutiveIncreases = 3;

    const checkMemory = () => {
      const current = (performance as any).memory.usedJSHeapSize;

      if (!baseline) {
        baseline = current;
        console.log('🧠 Memory baseline established:', (baseline / 1024 / 1024).toFixed(2), 'MB');
        return;
      }

      const increase = current - baseline;
      const increaseMB = increase / 1024 / 1024;

      if (increaseMB > thresholdMB) {
        consecutiveIncreases++;
        
        if (consecutiveIncreases >= maxConsecutiveIncreases) {
          console.warn('🚨 Potential memory leak detected:', {
            baseline: (baseline / 1024 / 1024).toFixed(2) + ' MB',
            current: (current / 1024 / 1024).toFixed(2) + ' MB',
            increase: increaseMB.toFixed(2) + ' MB',
            consecutiveIncreases
          });
        }
      } else if (increaseMB < thresholdMB / 2) {
        // メモリ使用量が十分減少した場合はカウンターをリセット
        consecutiveIncreases = 0;
        baseline = current; // ベースラインを更新
      }
    };

    setInterval(checkMemory, checkInterval);
    console.log('🔍 Memory leak detection started');
  }

  /**
   * リソース読み込み時間の分析
   */
  analyzeResourceTiming(): ResourceTiming[] {
    if (typeof window === 'undefined') return [];

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const analysis: ResourceTiming[] = [];

    for (const resource of resources) {
      analysis.push({
        name: resource.name,
        entryType: resource.entryType,
        startTime: resource.startTime,
        duration: resource.duration,
        transferSize: resource.transferSize || 0,
        encodedBodySize: resource.encodedBodySize || 0,
        decodedBodySize: resource.decodedBodySize || 0
      });
    }

    // 読み込み時間でソート（降順）
    analysis.sort((a, b) => b.duration - a.duration);

    console.group('📊 Resource Timing Analysis');
    console.table(analysis.slice(0, 10)); // 上位10件を表示
    console.groupEnd();

    return analysis;
  }

  /**
   * Web Vitalsデータの取得
   */
  getWebVitalsData(): Record<string, number> {
    return { ...this.webVitalsData };
  }

  /**
   * 全監視の停止
   */
  stopAllMonitoring(): void {
    for (const [name, observer] of this.observers) {
      observer.disconnect();
      console.log(`🛑 Stopped monitoring: ${name}`);
    }
    this.observers.clear();
  }
}

// =============================================================================
// エラートラッキング
// =============================================================================

/**
 * エラートラッキングシステム
 */
export class ErrorTracker {
  private errors: ErrorInfo[] = [];
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private sessionId: string;

  constructor() {
    this.sessionId = Math.random().toString(36).substr(2, 16);
    this.initializeErrorHandling();
  }

  /**
   * エラーハンドリングの初期化
   */
  private initializeErrorHandling(): void {
    if (typeof window === 'undefined') return;

    // グローバルエラーハンドラー
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack || '',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.sessionId,
        breadcrumbs: [...this.breadcrumbs],
        context: {
          type: 'javascript',
          handled: false
        }
      });
    });

    // Promise rejection ハンドラー
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack || '',
        filename: '',
        lineno: 0,
        colno: 0,
        error: event.reason,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.sessionId,
        breadcrumbs: [...this.breadcrumbs],
        context: {
          type: 'unhandledrejection',
          handled: false
        }
      });
    });

    console.log('🛡️ Error tracking initialized');
  }

  /**
   * エラーの手動キャプチャ
   */
  captureError(errorInfo: ErrorInfo): void {
    this.errors.push(errorInfo);
    
    console.group('❌ Error Captured');
    console.error('Message:', errorInfo.message);
    console.error('Stack:', errorInfo.stack);
    console.log('Context:', errorInfo.context);
    console.log('Breadcrumbs:', errorInfo.breadcrumbs);
    console.groupEnd();

    // エラーログが多すぎる場合は古いものを削除
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-50);
    }
  }

  /**
   * パンくずリストの追加
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date()
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // 最大数を超えた場合は古いものを削除
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * ユーザーアクションの記録
   */
  recordUserAction(action: string, data?: Record<string, any>): void {
    this.addBreadcrumb({
      category: 'user',
      message: action,
      level: 'info',
      data
    });
  }

  /**
   * ナビゲーションの記録
   */
  recordNavigation(from: string, to: string): void {
    this.addBreadcrumb({
      category: 'navigation',
      message: `Navigation: ${from} → ${to}`,
      level: 'info',
      data: { from, to }
    });
  }

  /**
   * ネットワークリクエストの記録
   */
  recordNetworkRequest(url: string, method: string, status: number): void {
    this.addBreadcrumb({
      category: 'network',
      message: `${method} ${url} (${status})`,
      level: status >= 400 ? 'error' : 'info',
      data: { url, method, status }
    });
  }

  /**
   * エラー統計の取得
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: ErrorInfo[];
  } {
    const errorsByType: Record<string, number> = {};
    
    for (const error of this.errors) {
      const type = error.context?.type || 'unknown';
      errorsByType[type] = (errorsByType[type] || 0) + 1;
    }

    return {
      totalErrors: this.errors.length,
      errorsByType,
      recentErrors: this.errors.slice(-10)
    };
  }

  /**
   * デバッグレポートの生成
   */
  generateDebugReport(): string {
    const stats = this.getErrorStats();
    const webVitals = new PerformanceAnalyzer().getWebVitalsData();
    
    const report = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      errors: stats,
      webVitals,
      breadcrumbs: this.breadcrumbs.slice(-20),
      memory: typeof window !== 'undefined' && 'memory' in performance 
        ? (performance as any).memory 
        : null
    };

    return JSON.stringify(report, null, 2);
  }
}

// =============================================================================
// 統合デバッグマネージャー
// =============================================================================

/**
 * 全てのデバッグ機能を統合管理するクラス
 */
export class DebugManager {
  private static instance: DebugManager;
  private browserDebugger: typeof BrowserDebugger;
  private autoDebugger: AutoDebugger;
  private networkDebugger: NetworkDebugger;
  private performanceAnalyzer: PerformanceAnalyzer;
  private errorTracker: ErrorTracker;

  private constructor() {
    this.browserDebugger = BrowserDebugger;
    this.autoDebugger = AutoDebugger.getInstance();
    this.networkDebugger = new NetworkDebugger();
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.errorTracker = new ErrorTracker();
  }

  static getInstance(): DebugManager {
    if (!DebugManager.instance) {
      DebugManager.instance = new DebugManager();
    }
    return DebugManager.instance;
  }

  /**
   * 完全なデバッグ環境の初期化
   */
  initializeDebugEnvironment(): void {
    console.log('🚀 Initializing comprehensive debug environment...');

    // ネットワークインターセプト開始
    this.networkDebugger.interceptFetch();

    // パフォーマンス監視開始
    this.performanceAnalyzer.monitorWebVitals();
    this.performanceAnalyzer.detectMemoryLeaks();

    // 自動デバッガー開始
    this.autoDebugger.startDebugging();

    // 基本的なブレークポイントとウォッチャーを設定
    this.setupDefaultDebugPoints();

    console.log('✅ Debug environment initialized successfully');
  }

  /**
   * デフォルトのデバッグポイント設定
   */
  private setupDefaultDebugPoints(): void {
    // パフォーマンス関連のウォッチャー
    if (typeof window !== 'undefined' && 'memory' in performance) {
      this.autoDebugger.watchVariable('memoryUsage', () => {
        const memory = (performance as any).memory;
        return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      });
    }

    // エラー発生時のブレークポイント
    this.autoDebugger.addConditionalBreakpoint('errorOccurred', () => {
      const stats = this.errorTracker.getErrorStats();
      return stats.totalErrors > 0;
    });
  }

  /**
   * デバッグセッションの終了
   */
  shutdownDebugEnvironment(): void {
    console.log('🛑 Shutting down debug environment...');

    this.autoDebugger.stopDebugging();
    this.networkDebugger.stopInterception();
    this.performanceAnalyzer.stopAllMonitoring();

    console.log('✅ Debug environment shutdown completed');
  }

  /**
   * 総合デバッグレポートの生成
   */
  generateComprehensiveReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      debuggerStatus: this.autoDebugger.getStatus(),
      networkRequests: this.networkDebugger.getInterceptedRequests().length,
      errorTracking: this.errorTracker.getErrorStats(),
      performanceMetrics: this.performanceAnalyzer.getWebVitalsData(),
      resourceTiming: this.performanceAnalyzer.analyzeResourceTiming().slice(0, 5),
      memoryUsage: this.browserDebugger.logMemoryUsage
    };

    return JSON.stringify(report, null, 2);
  }

  // 各デバッガーへのアクセサー
  get browser() { return this.browserDebugger; }
  get auto() { return this.autoDebugger; }
  get network() { return this.networkDebugger; }
  get performance() { return this.performanceAnalyzer; }
  get errors() { return this.errorTracker; }
}

// =============================================================================
// 使用例とデモンストレーション
// =============================================================================

/**
 * デバッグ機能のデモンストレーション
 */
export function demonstrateDebugging(): void {
  console.log('🎯 Starting debugging demonstration...');

  const debugManager = DebugManager.getInstance();
  
  // デバッグ環境の初期化
  debugManager.initializeDebugEnvironment();

  // パフォーマンス測定のデモ
  BrowserDebugger.measurePerformance('heavyCalculation', () => {
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += i;
    }
    return sum;
  });

  // メモリ使用量のログ
  BrowserDebugger.logMemoryUsage('Demo');

  // ネットワークリクエストのシミュレーション（フェイク）
  if (typeof window !== 'undefined') {
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then(response => response.json())
      .then(data => console.log('Fetched data:', data))
      .catch(error => console.error('Fetch error:', error));
  }

  // エラートラッキングのデモ
  debugManager.errors.recordUserAction('button_click', { buttonId: 'demo-button' });
  
  setTimeout(() => {
    // 意図的なエラーの発生
    try {
      throw new Error('Demo error for testing');
    } catch (error) {
      debugManager.errors.captureError({
        message: error.message,
        stack: error.stack || '',
        filename: __filename,
        lineno: 0,
        colno: 0,
        error: error,
        timestamp: new Date(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        sessionId: Math.random().toString(36),
        breadcrumbs: [],
        context: { demo: true }
      });
    }

    // 総合レポートの生成
    const report = debugManager.generateComprehensiveReport();
    console.log('📊 Comprehensive Debug Report:', report);
  }, 2000);

  console.log('✅ Debugging demonstration completed');
}

// Node.js環境での実行時は自動でデモを実行
if (typeof window === 'undefined' && require.main === module) {
  demonstrateDebugging();
}