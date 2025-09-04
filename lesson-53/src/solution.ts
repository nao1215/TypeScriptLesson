/**
 * Lesson 53: パフォーマンス最適化 - 解答例
 * 
 * 演習問題の完全な実装例とベストプラクティス
 */

// ===== 解答 1: アドバンスドパフォーマンスモニタリング =====

interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: string;
  current: number;
  threshold: number;
  timestamp: number;
  suggestion: string;
}

interface PerformanceAnalysis {
  trend: 'improving' | 'degrading' | 'stable';
  correlation: Record<string, number>;
  anomalies: PerformanceAlert[];
  recommendations: string[];
}

class AdvancedPerformanceMonitor {
  private metricsHistory: Map<string, number[]> = new Map();
  private alertThresholds: Map<string, { warning: number; critical: number }> = new Map();
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    this.setupDefaultThresholds();
  }

  /**
   * デフォルトの閾値設定
   */
  private setupDefaultThresholds(): void {
    this.alertThresholds.set('LCP', { warning: 2500, critical: 4000 });
    this.alertThresholds.set('FID', { warning: 100, critical: 300 });
    this.alertThresholds.set('CLS', { warning: 0.1, critical: 0.25 });
    this.alertThresholds.set('FCP', { warning: 1800, critical: 3000 });
  }

  /**
   * リアルタイム監視の開始
   */
  startRealTimeMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Core Web Vitals の監視
    this.observeMetric('largest-contentful-paint', (entry: any) => {
      this.recordMetric('LCP', entry.startTime);
    });

    this.observeMetric('first-input', (entry: any) => {
      this.recordMetric('FID', entry.processingStart - entry.startTime);
    });

    this.observeMetric('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        this.recordMetric('CLS', entry.value);
      }
    });

    // カスタムメトリクスの定期監視
    this.startCustomMetricsCollection();

    console.log('Real-time performance monitoring started');
  }

  /**
   * 特定のメトリクス監視
   */
  private observeMetric(entryType: string, callback: (entry: any) => void): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const observer = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach(callback);
      });

      observer.observe({ entryTypes: [entryType] });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error);
    }
  }

  /**
   * カスタムメトリクス収集の開始
   */
  private startCustomMetricsCollection(): void {
    const collectMetrics = () => {
      if (!this.isMonitoring) return;

      // メモリ使用量
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        this.recordMetric('memory', memory.usedJSHeapSize);
      }

      // DOM ノード数
      this.recordMetric('domNodes', document.querySelectorAll('*').length);

      // アクティブなイベントリスナー数（推定）
      this.recordMetric('eventListeners', this.estimateEventListeners());

      setTimeout(collectMetrics, 1000);
    };

    collectMetrics();
  }

  /**
   * メトリクスの記録
   */
  private recordMetric(name: string, value: number): void {
    if (!this.metricsHistory.has(name)) {
      this.metricsHistory.set(name, []);
    }

    const history = this.metricsHistory.get(name)!;
    history.push(value);

    // 履歴の上限を設定（メモリ使用量を制御）
    if (history.length > 1000) {
      history.shift();
    }

    // 異常値検出
    const anomalies = this.detectAnomalies(history, 2.0);
    if (anomalies.length > 0) {
      this.handleAnomalies(name, anomalies);
    }
  }

  /**
   * 異常値検出アルゴリズムの実装（Z-score法）
   */
  detectAnomalies(metrics: number[], threshold: number = 2.0): PerformanceAlert[] {
    if (metrics.length < 10) return []; // データが少ない場合はスキップ

    const mean = metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
    const variance = metrics.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / metrics.length;
    const stdDev = Math.sqrt(variance);

    const alerts: PerformanceAlert[] = [];
    const recent = metrics.slice(-5); // 最近の5つの値をチェック

    recent.forEach(value => {
      const zScore = stdDev > 0 ? Math.abs(value - mean) / stdDev : 0;
      
      if (zScore > threshold) {
        alerts.push({
          type: zScore > threshold * 1.5 ? 'critical' : 'warning',
          metric: 'anomaly',
          current: value,
          threshold: mean + (threshold * stdDev),
          timestamp: Date.now(),
          suggestion: this.generateSuggestion(value, mean, zScore)
        });
      }
    });

    return alerts;
  }

  /**
   * 提案の生成
   */
  private generateSuggestion(current: number, mean: number, zScore: number): string {
    if (current > mean) {
      return `パフォーマンスが平均より${((current - mean) / mean * 100).toFixed(1)}%悪化しています。最適化を検討してください。`;
    } else {
      return `パフォーマンスが平均より${((mean - current) / mean * 100).toFixed(1)}%改善されています。`;
    }
  }

  /**
   * メトリクス間の相関分析（ピアソン相関係数）
   */
  analyzeCorrelation(metricsA: number[], metricsB: number[]): number {
    if (metricsA.length !== metricsB.length || metricsA.length < 2) {
      return 0;
    }

    const n = metricsA.length;
    const meanA = metricsA.reduce((sum, val) => sum + val, 0) / n;
    const meanB = metricsB.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let sumSquaredA = 0;
    let sumSquaredB = 0;

    for (let i = 0; i < n; i++) {
      const devA = metricsA[i] - meanA;
      const devB = metricsB[i] - meanB;
      
      numerator += devA * devB;
      sumSquaredA += devA * devA;
      sumSquaredB += devB * devB;
    }

    const denominator = Math.sqrt(sumSquaredA * sumSquaredB);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * パフォーマンス傾向の分析
   */
  analyzeTrends(historicalData: number[]): PerformanceAnalysis {
    if (historicalData.length < 10) {
      return {
        trend: 'stable',
        correlation: {},
        anomalies: [],
        recommendations: ['より多くのデータが必要です']
      };
    }

    // 傾向分析（線形回帰）
    const trend = this.calculateTrend(historicalData);
    
    // 相関分析
    const correlation: Record<string, number> = {};
    for (const [metricName, metricData] of this.metricsHistory) {
      if (metricName !== 'current' && metricData.length === historicalData.length) {
        correlation[metricName] = this.analyzeCorrelation(historicalData, metricData);
      }
    }

    // 異常値検出
    const anomalies = this.detectAnomalies(historicalData, 2.0);

    // 推奨事項の生成
    const recommendations = this.generateRecommendations(trend, correlation, anomalies);

    return {
      trend: this.classifyTrend(trend),
      correlation,
      anomalies,
      recommendations
    };
  }

  /**
   * 線形回帰による傾向計算
   */
  private calculateTrend(data: number[]): number {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * 傾向の分類
   */
  private classifyTrend(slope: number): 'improving' | 'degrading' | 'stable' {
    const threshold = 0.01;
    if (slope < -threshold) return 'improving';
    if (slope > threshold) return 'degrading';
    return 'stable';
  }

  /**
   * 推奨事項の生成
   */
  private generateRecommendations(
    trend: number, 
    correlation: Record<string, number>, 
    anomalies: PerformanceAlert[]
  ): string[] {
    const recommendations: string[] = [];

    if (trend > 0.01) {
      recommendations.push('パフォーマンスが悪化傾向にあります。最適化を検討してください。');
    }

    if (anomalies.length > 0) {
      recommendations.push('異常値が検出されました。詳細な調査を行ってください。');
    }

    // 高相関メトリクスの特定
    for (const [metric, corr] of Object.entries(correlation)) {
      if (Math.abs(corr) > 0.7) {
        recommendations.push(`${metric}との相関が高いです（${corr.toFixed(2)}）。`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('パフォーマンスは安定しています。');
    }

    return recommendations;
  }

  /**
   * 異常値の処理
   */
  private handleAnomalies(metricName: string, anomalies: PerformanceAlert[]): void {
    anomalies.forEach(anomaly => {
      console.warn(`Performance anomaly detected in ${metricName}:`, anomaly);
      
      // 実際のアプリケーションでは、ここでアラートを送信したり、
      // 自動的な対処を行ったりする
    });
  }

  /**
   * イベントリスナー数の推定
   */
  private estimateEventListeners(): number {
    // これは簡易的な推定です。実際の実装では、
    // WeakMapを使用してより正確な追跡を行うべきです
    return document.querySelectorAll('[onclick], [onload], [onerror]').length;
  }

  /**
   * 監視の停止
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    console.log('Performance monitoring stopped');
  }
}

// ===== 解答 2: インテリジェントキャッシュシステム =====

interface CacheLayer {
  name: string;
  maxSize: number;
  ttl: number;
  priority: number;
}

interface CacheStats {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  averageResponseTime: number;
  memoryUsage: number;
}

interface CacheEntry<V> {
  value: V;
  timestamp: number;
  accessCount: number;
  size: number;
  layer: string;
}

class MultiLayerCacheSystem<K, V> {
  private layers: Map<string, CacheLayer> = new Map();
  private caches: Map<string, Map<K, CacheEntry<V>>> = new Map();
  private stats: Map<string, { hits: number; misses: number; evictions: number }> = new Map();
  private prefetchQueue: Set<K> = new Set();
  private accessPatterns: Map<K, number[]> = new Map();

  constructor() {
    this.initializeDefaultLayers();
  }

  /**
   * デフォルトレイヤーの初期化
   */
  private initializeDefaultLayers(): void {
    this.addLayer({
      name: 'L1_MEMORY',
      maxSize: 100,
      ttl: 60000, // 1分
      priority: 1
    });

    this.addLayer({
      name: 'L2_LOCALSTORAGE',
      maxSize: 500,
      ttl: 3600000, // 1時間
      priority: 2
    });

    this.addLayer({
      name: 'L3_INDEXEDDB',
      maxSize: 1000,
      ttl: 86400000, // 24時間
      priority: 3
    });
  }

  /**
   * キャッシュレイヤーの追加
   */
  addLayer(layer: CacheLayer): void {
    this.layers.set(layer.name, layer);
    this.caches.set(layer.name, new Map());
    this.stats.set(layer.name, { hits: 0, misses: 0, evictions: 0 });
  }

  /**
   * 多層キャッシュからの取得
   */
  async get(key: K): Promise<V | null> {
    const startTime = performance.now();
    
    // アクセスパターンの記録
    this.recordAccess(key);

    // 上位レイヤーから順に検索
    const sortedLayers = Array.from(this.layers.values())
      .sort((a, b) => a.priority - b.priority);

    for (const layer of sortedLayers) {
      const cache = this.caches.get(layer.name)!;
      const entry = cache.get(key);

      if (entry && this.isValid(entry, layer.ttl)) {
        // ヒット
        this.stats.get(layer.name)!.hits++;
        entry.accessCount++;
        entry.timestamp = Date.now();

        // 上位レイヤーにプロモート
        this.promoteToUpperLayers(key, entry, layer);

        const responseTime = performance.now() - startTime;
        this.updateResponseTime(layer.name, responseTime);

        return entry.value;
      } else if (entry) {
        // 期限切れエントリの削除
        cache.delete(key);
      }
    }

    // 全レイヤーでミス
    sortedLayers.forEach(layer => {
      this.stats.get(layer.name)!.misses++;
    });

    // 予測的プリフェッチのトリガー
    this.triggerPredictivePrefetch(key);

    return null;
  }

  /**
   * 多層キャッシュへの保存
   */
  async set(key: K, value: V, layers?: string[]): Promise<void> {
    const size = this.estimateSize(value);
    const targetLayers = layers || Array.from(this.layers.keys());

    for (const layerName of targetLayers) {
      const layer = this.layers.get(layerName);
      if (!layer) continue;

      const cache = this.caches.get(layerName)!;
      
      // サイズ制限チェック
      while (cache.size >= layer.maxSize) {
        this.evictLRU(layerName);
      }

      const entry: CacheEntry<V> = {
        value,
        timestamp: Date.now(),
        accessCount: 1,
        size,
        layer: layerName
      };

      cache.set(key, entry);

      // 永続化が必要なレイヤーの場合
      if (layerName.includes('LOCALSTORAGE')) {
        await this.persistToLocalStorage(key, entry);
      } else if (layerName.includes('INDEXEDDB')) {
        await this.persistToIndexedDB(key, entry);
      }
    }
  }

  /**
   * 予測的プリフェッチ
   */
  async prefetch(keys: K[], priority: number = 1): Promise<void> {
    const sortedKeys = keys.sort(() => Math.random() - 0.5); // シャッフル
    
    for (const key of sortedKeys) {
      if (this.prefetchQueue.has(key)) continue;
      
      this.prefetchQueue.add(key);
      
      // 低優先度でプリフェッチを実行
      this.schedulePrefetch(key, priority);
    }
  }

  /**
   * キャッシュウォームアップ
   */
  async warmup(dataSource: () => Promise<Array<[K, V]>>): Promise<void> {
    console.log('Starting cache warmup...');
    const startTime = performance.now();

    try {
      const data = await dataSource();
      const batchSize = 50;
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(([key, value]) => this.set(key, value, ['L2_LOCALSTORAGE', 'L3_INDEXEDDB']))
        );
        
        // UIをブロックしないように小さな遅延を入れる
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      const duration = performance.now() - startTime;
      console.log(`Cache warmup completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('Cache warmup failed:', error);
    }
  }

  /**
   * 統計情報の取得
   */
  getStats(): CacheStats {
    let totalHits = 0;
    let totalMisses = 0;
    let totalEvictions = 0;
    let totalResponseTime = 0;
    let totalMemoryUsage = 0;

    for (const [layerName, stats] of this.stats) {
      totalHits += stats.hits;
      totalMisses += stats.misses;
      totalEvictions += stats.evictions;

      // メモリ使用量の計算
      const cache = this.caches.get(layerName)!;
      for (const entry of cache.values()) {
        totalMemoryUsage += entry.size;
      }
    }

    const totalRequests = totalHits + totalMisses;
    
    return {
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      missRate: totalRequests > 0 ? totalMisses / totalRequests : 0,
      evictionRate: totalRequests > 0 ? totalEvictions / totalRequests : 0,
      averageResponseTime: totalResponseTime,
      memoryUsage: totalMemoryUsage
    };
  }

  /**
   * インテリジェントな無効化
   */
  async invalidate(pattern: (key: K) => boolean): Promise<void> {
    for (const [layerName, cache] of this.caches) {
      const keysToDelete: K[] = [];
      
      for (const key of cache.keys()) {
        if (pattern(key)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => {
        cache.delete(key);
        this.stats.get(layerName)!.evictions++;
      });

      // 永続化レイヤーからも削除
      if (layerName.includes('LOCALSTORAGE')) {
        keysToDelete.forEach(key => this.removeFromLocalStorage(key));
      } else if (layerName.includes('INDEXEDDB')) {
        await this.removeFromIndexedDB(keysToDelete);
      }
    }
  }

  // プライベートメソッド

  private recordAccess(key: K): void {
    const now = Date.now();
    if (!this.accessPatterns.has(key)) {
      this.accessPatterns.set(key, []);
    }
    const pattern = this.accessPatterns.get(key)!;
    pattern.push(now);
    
    // 古いアクセスパターンを削除（24時間以内のもののみ保持）
    const dayAgo = now - 86400000;
    while (pattern.length > 0 && pattern[0] < dayAgo) {
      pattern.shift();
    }
  }

  private isValid(entry: CacheEntry<V>, ttl: number): boolean {
    return Date.now() - entry.timestamp < ttl;
  }

  private promoteToUpperLayers(key: K, entry: CacheEntry<V>, currentLayer: CacheLayer): void {
    const upperLayers = Array.from(this.layers.values())
      .filter(layer => layer.priority < currentLayer.priority)
      .sort((a, b) => a.priority - b.priority);

    upperLayers.forEach(layer => {
      const cache = this.caches.get(layer.name)!;
      if (!cache.has(key)) {
        this.set(key, entry.value, [layer.name]);
      }
    });
  }

  private triggerPredictivePrefetch(key: K): void {
    // アクセスパターンに基づいて関連するキーを予測
    const relatedKeys = this.predictRelatedKeys(key);
    if (relatedKeys.length > 0) {
      this.prefetch(relatedKeys, 3); // 低優先度でプリフェッチ
    }
  }

  private predictRelatedKeys(key: K): K[] {
    // 簡易的な実装：同じプレフィックスを持つキーを推測
    // 実際の実装では、機械学習やより高度なパターン認識を使用
    const keyStr = String(key);
    const related: K[] = [];

    for (const [otherKey] of this.accessPatterns) {
      const otherKeyStr = String(otherKey);
      if (otherKeyStr !== keyStr && otherKeyStr.startsWith(keyStr.split('_')[0])) {
        related.push(otherKey);
      }
    }

    return related.slice(0, 5); // 最大5個まで
  }

  private schedulePrefetch(key: K, priority: number): void {
    const delay = priority * 100; // 優先度に応じた遅延
    
    setTimeout(async () => {
      try {
        // 実際のデータソースからの取得をシミュレート
        // const value = await this.fetchFromSource(key);
        // await this.set(key, value);
        this.prefetchQueue.delete(key);
      } catch (error) {
        console.error(`Prefetch failed for key ${key}:`, error);
      }
    }, delay);
  }

  private evictLRU(layerName: string): void {
    const cache = this.caches.get(layerName)!;
    let lruKey: K | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        lruKey = key;
      }
    }

    if (lruKey) {
      cache.delete(lruKey);
      this.stats.get(layerName)!.evictions++;
    }
  }

  private estimateSize(value: V): number {
    // 簡易的なサイズ推定
    const str = JSON.stringify(value);
    return str.length * 2; // UTF-16の場合は2バイト/文字
  }

  private async persistToLocalStorage(key: K, entry: CacheEntry<V>): Promise<void> {
    try {
      const data = JSON.stringify({
        value: entry.value,
        timestamp: entry.timestamp,
        accessCount: entry.accessCount
      });
      localStorage.setItem(`cache_${String(key)}`, data);
    } catch (error) {
      console.warn('Failed to persist to localStorage:', error);
    }
  }

  private async persistToIndexedDB(key: K, entry: CacheEntry<V>): Promise<void> {
    // IndexedDBへの永続化実装
    // 実際の実装では、適切なIndexedDBのラッパーを使用
    try {
      // const db = await this.openIndexedDB();
      // const transaction = db.transaction(['cache'], 'readwrite');
      // const store = transaction.objectStore('cache');
      // await store.put({ key, ...entry });
    } catch (error) {
      console.warn('Failed to persist to IndexedDB:', error);
    }
  }

  private removeFromLocalStorage(key: K): void {
    localStorage.removeItem(`cache_${String(key)}`);
  }

  private async removeFromIndexedDB(keys: K[]): Promise<void> {
    // IndexedDBからの削除実装
    try {
      // const db = await this.openIndexedDB();
      // const transaction = db.transaction(['cache'], 'readwrite');
      // const store = transaction.objectStore('cache');
      // await Promise.all(keys.map(key => store.delete(key)));
    } catch (error) {
      console.warn('Failed to remove from IndexedDB:', error);
    }
  }

  private updateResponseTime(layerName: string, responseTime: number): void {
    // レスポンス時間の移動平均を更新
    // 実際の実装では、より詳細な統計を保持
  }
}

// ===== 解答 3: アドバンスド仮想化システム =====

interface VirtualItem {
  id: string | number;
  height?: number;
  data: any;
}

interface VirtualViewport {
  startIndex: number;
  endIndex: number;
  scrollOffset: number;
  totalSize: number;
}

class AdaptiveVirtualizationEngine<T extends VirtualItem> {
  private items: T[] = [];
  private measuredSizes = new Map<string | number, number>();
  private estimatedItemSize = 50;
  private containerElement: HTMLElement | null = null;
  private scrollElement: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private renderCallbacks: Set<(viewport: VirtualViewport) => void> = new Set();

  constructor(containerElement?: HTMLElement) {
    this.containerElement = containerElement || null;
    this.setupObservers();
  }

  /**
   * オブザーバーのセットアップ
   */
  private setupObservers(): void {
    // Resize Observer for dynamic sizing
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          this.handleElementResize(entry);
        });
      });
    }

    // Intersection Observer for visibility tracking
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.handleIntersectionChange(entry);
        });
      }, { threshold: 0.1 });
    }
  }

  /**
   * アイテムの設定
   */
  setItems(items: T[]): void {
    this.items = items;
    this.invalidateLayout();
  }

  /**
   * 動的サイズ測定
   */
  measureItemSize(index: number, element: HTMLElement): void {
    const item = this.items[index];
    if (!item) return;

    const rect = element.getBoundingClientRect();
    const measuredHeight = rect.height;

    // サイズが変更された場合のみ更新
    const previousSize = this.measuredSizes.get(item.id);
    if (previousSize !== measuredHeight) {
      this.measuredSizes.set(item.id, measuredHeight);
      
      // 推定サイズを動的に調整
      this.updateEstimatedItemSize();
      
      // レイアウトの再計算をトリガー
      this.invalidateLayout();
    }

    // Resize Observerに要素を追加
    if (this.resizeObserver) {
      this.resizeObserver.observe(element);
    }
  }

  /**
   * 適応的ビューポート計算
   */
  calculateAdaptiveViewport(scrollTop: number, containerHeight: number = 600): VirtualViewport {
    if (this.items.length === 0) {
      return {
        startIndex: 0,
        endIndex: -1,
        scrollOffset: 0,
        totalSize: 0
      };
    }

    let accumulatedHeight = 0;
    let startIndex = 0;
    let endIndex = this.items.length - 1;
    let startOffset = 0;

    // スタートインデックスの計算
    for (let i = 0; i < this.items.length; i++) {
      const itemHeight = this.getItemHeight(i);
      
      if (accumulatedHeight + itemHeight > scrollTop) {
        startIndex = Math.max(0, i - 1); // 1つ前から開始（バッファ）
        startOffset = accumulatedHeight - (i > 0 ? this.getItemHeight(i - 1) : 0);
        break;
      }
      
      accumulatedHeight += itemHeight;
    }

    // エンドインデックスの計算
    accumulatedHeight = startOffset;
    for (let i = startIndex; i < this.items.length; i++) {
      accumulatedHeight += this.getItemHeight(i);
      
      if (accumulatedHeight > scrollTop + containerHeight) {
        endIndex = Math.min(this.items.length - 1, i + 1); // 1つ後まで（バッファ）
        break;
      }
    }

    return {
      startIndex,
      endIndex,
      scrollOffset: startOffset,
      totalSize: this.calculateTotalSize()
    };
  }

  /**
   * スムーズスクロール最適化
   */
  optimizeScrolling(targetIndex: number, behavior: 'auto' | 'smooth' = 'smooth'): void {
    if (!this.scrollElement || targetIndex < 0 || targetIndex >= this.items.length) {
      return;
    }

    const targetOffset = this.calculateOffsetToIndex(targetIndex);
    
    // スクロール前にアイテムをプリロード
    this.preloadItemsAroundIndex(targetIndex, 5);

    // ブラウザのネイティブスムーススクロールを使用
    this.scrollElement.scrollTo({
      top: targetOffset,
      behavior
    });

    // カスタムスムーススクロールのフォールバック
    if (behavior === 'smooth' && !this.supportsNativeScrollBehavior()) {
      this.customSmoothScroll(targetOffset);
    }
  }

  /**
   * ネストされた仮想化のサポート
   */
  createNestedVirtualizer<U extends VirtualItem>(
    parentIndex: number,
    childItems: U[]
  ): AdaptiveVirtualizationEngine<U> {
    const nestedVirtualizer = new AdaptiveVirtualizationEngine<U>();
    nestedVirtualizer.setItems(childItems);

    // 親の仮想化エンジンとの連携
    this.setupNestedSynchronization(parentIndex, nestedVirtualizer);

    return nestedVirtualizer;
  }

  /**
   * アクセシビリティ属性の管理
   */
  updateAccessibilityAttributes(viewport: VirtualViewport): void {
    if (!this.containerElement) return;

    // aria-rowcount の設定
    this.containerElement.setAttribute('aria-rowcount', this.items.length.toString());

    // 現在表示されているアイテムの範囲を通知
    const visibleCount = viewport.endIndex - viewport.startIndex + 1;
    this.containerElement.setAttribute('aria-label', 
      `${this.items.length} 項目中 ${viewport.startIndex + 1} から ${viewport.endIndex + 1} を表示`);

    // 各アイテムのaria属性を更新
    this.updateItemAccessibilityAttributes(viewport);
  }

  // プライベートメソッド

  private getItemHeight(index: number): number {
    const item = this.items[index];
    if (!item) return this.estimatedItemSize;

    const measured = this.measuredSizes.get(item.id);
    if (measured !== undefined) return measured;

    // アイテムごとの推定高さ（データに基づく）
    if (item.height) return item.height;
    
    return this.estimatedItemSize;
  }

  private calculateTotalSize(): number {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.getItemHeight(i);
    }
    return total;
  }

  private calculateOffsetToIndex(index: number): number {
    let offset = 0;
    for (let i = 0; i < index && i < this.items.length; i++) {
      offset += this.getItemHeight(i);
    }
    return offset;
  }

  private updateEstimatedItemSize(): void {
    if (this.measuredSizes.size === 0) return;

    const sizes = Array.from(this.measuredSizes.values());
    const average = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    
    // 推定サイズを徐々に調整（急激な変化を避ける）
    this.estimatedItemSize = this.estimatedItemSize * 0.7 + average * 0.3;
  }

  private invalidateLayout(): void {
    // レンダリングコールバックを通知
    const viewport = this.calculateAdaptiveViewport(
      this.scrollElement?.scrollTop || 0,
      this.containerElement?.clientHeight || 600
    );

    this.renderCallbacks.forEach(callback => {
      callback(viewport);
    });
  }

  private preloadItemsAroundIndex(centerIndex: number, radius: number): void {
    const start = Math.max(0, centerIndex - radius);
    const end = Math.min(this.items.length - 1, centerIndex + radius);

    for (let i = start; i <= end; i++) {
      // アイテムのプリロード処理
      // 実際の実装では、画像やデータの事前読み込みを行う
      const item = this.items[i];
      if (item) {
        this.preloadItem(item);
      }
    }
  }

  private preloadItem(item: T): void {
    // アイテムの事前読み込み処理
    // 例：画像のプリロード、データの事前フェッチなど
  }

  private supportsNativeScrollBehavior(): boolean {
    return 'scrollBehavior' in document.documentElement.style;
  }

  private customSmoothScroll(targetOffset: number): void {
    if (!this.scrollElement) return;

    const startOffset = this.scrollElement.scrollTop;
    const distance = targetOffset - startOffset;
    const duration = Math.min(500, Math.abs(distance) / 2); // 最大500ms
    const startTime = performance.now();

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const scroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      
      const currentOffset = startOffset + (distance * easeProgress);
      this.scrollElement!.scrollTop = currentOffset;

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }

  private setupNestedSynchronization<U extends VirtualItem>(
    parentIndex: number,
    nestedVirtualizer: AdaptiveVirtualizationEngine<U>
  ): void {
    // ネストされた仮想化の同期処理
    // 親のスクロールに応じて子の表示を調整
  }

  private handleElementResize(entry: ResizeObserverEntry): void {
    // 要素サイズ変更の処理
    const element = entry.target as HTMLElement;
    const index = parseInt(element.dataset.index || '-1');
    
    if (index >= 0) {
      this.measureItemSize(index, element);
    }
  }

  private handleIntersectionChange(entry: IntersectionObserverEntry): void {
    // 要素の可視性変更の処理
    const element = entry.target as HTMLElement;
    const index = parseInt(element.dataset.index || '-1');
    
    if (entry.isIntersecting) {
      // アイテムが表示された時の処理
      this.onItemVisible(index);
    } else {
      // アイテムが非表示になった時の処理
      this.onItemHidden(index);
    }
  }

  private updateItemAccessibilityAttributes(viewport: VirtualViewport): void {
    // 各アイテムのアクセシビリティ属性を更新
    for (let i = viewport.startIndex; i <= viewport.endIndex; i++) {
      const element = document.querySelector(`[data-index="${i}"]`) as HTMLElement;
      if (element) {
        element.setAttribute('aria-rowindex', (i + 1).toString());
        element.setAttribute('aria-setsize', this.items.length.toString());
      }
    }
  }

  private onItemVisible(index: number): void {
    // アイテムが可視になった時の処理
    console.log(`Item ${index} became visible`);
  }

  private onItemHidden(index: number): void {
    // アイテムが非可視になった時の処理
    console.log(`Item ${index} became hidden`);
  }

  /**
   * レンダリングコールバックの登録
   */
  onRender(callback: (viewport: VirtualViewport) => void): () => void {
    this.renderCallbacks.add(callback);
    return () => this.renderCallbacks.delete(callback);
  }

  /**
   * クリーンアップ
   */
  dispose(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    this.renderCallbacks.clear();
  }
}

// ===== 使用例 =====

/**
 * 解答例のデモンストレーション
 */
async function demonstrateSolutions(): Promise<void> {
  console.log('=== Performance Optimization Solutions Demo ===');

  // 1. アドバンスドパフォーマンスモニタリング
  console.log('\n1. Advanced Performance Monitoring:');
  const monitor = new AdvancedPerformanceMonitor();
  monitor.startRealTimeMonitoring();

  // テストデータで傾向分析
  const testMetrics = Array.from({ length: 50 }, () => Math.random() * 100 + 50);
  const analysis = monitor.analyzeTrends(testMetrics);
  console.log('Trend Analysis:', analysis);

  // 2. マルチレイヤーキャッシュシステム
  console.log('\n2. Multi-Layer Cache System:');
  const cache = new MultiLayerCacheSystem<string, any>();
  
  await cache.set('user:123', { name: 'Alice', age: 30 });
  const user = await cache.get('user:123');
  console.log('Cached user:', user);
  
  const stats = cache.getStats();
  console.log('Cache stats:', stats);

  // 3. 適応的仮想化エンジン
  console.log('\n3. Adaptive Virtualization Engine:');
  const virtualizer = new AdaptiveVirtualizationEngine();
  const testItems = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    height: Math.floor(Math.random() * 50) + 30,
    data: { name: `Item ${i}` }
  }));
  
  virtualizer.setItems(testItems);
  const viewport = virtualizer.calculateAdaptiveViewport(0, 400);
  console.log('Virtual viewport:', viewport);

  console.log('\nAll solutions demonstrated successfully!');
  
  // クリーンアップ
  monitor.stopMonitoring();
  virtualizer.dispose();
}

// エクスポート
export {
  AdvancedPerformanceMonitor,
  MultiLayerCacheSystem,
  AdaptiveVirtualizationEngine,
  demonstrateSolutions,
  type PerformanceAlert,
  type PerformanceAnalysis,
  type CacheLayer,
  type CacheStats,
  type VirtualItem,
  type VirtualViewport
};

// デモの実行
if (typeof window !== 'undefined') {
  demonstrateSolutions().catch(console.error);
}