/**
 * Lesson 44 解答例: エラーハンドリング (Error Handling in Web Apps)
 */

import { AppError, ErrorSeverity } from './index';

// ============================================================================
// 演習 1 解答: カスタムエラークラスの拡張
// ============================================================================

export class DatabaseError extends AppError {
  readonly code = 'DB_ERROR';
  readonly statusCode = 500;
  readonly userMessage = 'データの処理中にエラーが発生しました。';
  readonly severity = ErrorSeverity.CRITICAL;
  
  constructor(
    message: string,
    public readonly operation: 'read' | 'write' | 'connect' | 'transaction',
    public readonly database: string,
    public readonly table?: string,
    public readonly canRetry: boolean = true,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      operation,
      database,
      table,
      canRetry,
      timestamp: Date.now()
    });
  }
}

export class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 502;
  readonly userMessage = '外部サービスとの通信でエラーが発生しました。';
  readonly severity = ErrorSeverity.HIGH;
  
  constructor(
    message: string,
    public readonly serviceName: string,
    public readonly endpoint: string,
    public readonly responseStatus?: number,
    public readonly responseData?: any,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      serviceName,
      endpoint,
      responseStatus,
      responseData,
      timestamp: Date.now()
    });
  }
}

export class UserOperationError extends AppError {
  readonly code = 'USER_OPERATION_ERROR';
  readonly statusCode = 400;
  readonly userMessage = '操作を完了できませんでした。';
  readonly severity = ErrorSeverity.MEDIUM;
  
  constructor(
    message: string,
    public readonly operation: 'create' | 'update' | 'delete' | 'view',
    public readonly resourceType: string,
    public readonly resourceId?: string,
    public readonly userId?: string,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      operation,
      resourceType,
      resourceId,
      userId,
      timestamp: Date.now()
    });
  }
}

// ============================================================================
// 演習 2 解答: 高度なAPIクライアントの実装
// ============================================================================

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

interface RequestQueueItem {
  request: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  priority: number;
}

export class AdvancedApiClient {
  private cache = new Map<string, CacheEntry<any>>();
  private requestQueue: RequestQueueItem[] = [];
  private activeRequests = 0;
  private authToken: string | null = null;
  private tokenExpiry: number = 0;
  private stats = {
    cacheHits: 0,
    cacheMisses: 0,
    totalRequests: 0,
    errors: 0
  };
  
  constructor(
    private baseUrl: string,
    private maxConcurrentRequests: number = 5,
    private defaultCacheTTL: number = 5 * 60 * 1000 // 5分
  ) {}
  
  async setAuthToken(token: string, expiryMs?: number): Promise<void> {
    this.authToken = token;
    this.tokenExpiry = expiryMs ? Date.now() + expiryMs : Date.now() + (60 * 60 * 1000); // デフォルト1時間
  }
  
  private isTokenValid(): boolean {
    return this.authToken !== null && Date.now() < this.tokenExpiry;
  }
  
  async get<T>(
    endpoint: string,
    options?: {
      cache?: boolean;
      cacheTTL?: number;
      priority?: number;
    }
  ): Promise<T> {
    const cacheKey = `GET:${endpoint}`;
    const shouldCache = options?.cache !== false;
    
    // キャッシュチェック
    if (shouldCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiry) {
        this.stats.cacheHits++;
        return cached.data;
      }
      this.stats.cacheMisses++;
    }
    
    // リクエスト実行
    return new Promise<T>((resolve, reject) => {
      const requestItem: RequestQueueItem = {
        request: async () => {
          if (!this.isTokenValid()) {
            throw new Error('Auth token is invalid or expired');
          }
          
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.authToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // キャッシュに保存
          if (shouldCache) {
            const ttl = options?.cacheTTL || this.defaultCacheTTL;
            this.cache.set(cacheKey, {
              data,
              expiry: Date.now() + ttl
            });
          }
          
          return data;
        },
        resolve,
        reject,
        priority: options?.priority || 1
      };
      
      this.requestQueue.push(requestItem);
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.activeRequests >= this.maxConcurrentRequests || this.requestQueue.length === 0) {
      return;
    }
    
    // 優先度順にソート
    this.requestQueue.sort((a, b) => b.priority - a.priority);
    
    const item = this.requestQueue.shift()!;
    this.activeRequests++;
    this.stats.totalRequests++;
    
    try {
      const result = await item.request();
      item.resolve(result);
    } catch (error) {
      this.stats.errors++;
      item.reject(error);
    } finally {
      this.activeRequests--;
      // 次のリクエストを処理
      setTimeout(() => this.processQueue(), 0);
    }
  }
  
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
    
    // 期限切れエントリの削除
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now >= entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
  
  getStats(): {
    cacheHits: number;
    cacheMisses: number;
    activeRequests: number;
    queueLength: number;
    errorRate: number;
  } {
    const errorRate = this.stats.totalRequests > 0 
      ? (this.stats.errors / this.stats.totalRequests) * 100 
      : 0;
      
    return {
      cacheHits: this.stats.cacheHits,
      cacheMisses: this.stats.cacheMisses,
      activeRequests: this.activeRequests,
      queueLength: this.requestQueue.length,
      errorRate: Math.round(errorRate * 100) / 100
    };
  }
}

// ============================================================================
// 演習 3 解答: エラー監視とアラートシステムの実装
// ============================================================================

interface ErrorMetrics {
  errorType: string;
  count: number;
  firstOccurred: Date;
  lastOccurred: Date;
  averageInterval: number;
}

interface AlertRule {
  errorType: string;
  threshold: number;
  timeWindow: number;
  action: (metrics: ErrorMetrics) => Promise<void>;
}

export class ErrorMonitoringSystem {
  private errorCounts = new Map<string, number[]>();
  private alertRules: AlertRule[] = [];
  private lastAlertTimes = new Map<string, number>();
  
  constructor(private alertCooldownMs: number = 5 * 60 * 1000) {}
  
  recordError(error: AppError): void {
    const errorType = error.code;
    const timestamp = Date.now();
    
    if (!this.errorCounts.has(errorType)) {
      this.errorCounts.set(errorType, []);
    }
    
    const timestamps = this.errorCounts.get(errorType)!;
    timestamps.push(timestamp);
    
    // 24時間より古いデータを削除
    const cutoff = timestamp - (24 * 60 * 60 * 1000);
    const filtered = timestamps.filter(t => t > cutoff);
    this.errorCounts.set(errorType, filtered);
    
    // アラート条件をチェック
    this.checkAlertConditions(errorType);
  }
  
  addAlertRule(rule: AlertRule): void {
    // 重複チェック
    const existing = this.alertRules.find(r => 
      r.errorType === rule.errorType && r.timeWindow === rule.timeWindow
    );
    
    if (existing) {
      Object.assign(existing, rule);
    } else {
      this.alertRules.push(rule);
    }
  }
  
  getMetrics(errorType?: string): ErrorMetrics[] {
    const results: ErrorMetrics[] = [];
    
    const typesToProcess = errorType 
      ? [errorType].filter(t => this.errorCounts.has(t))
      : Array.from(this.errorCounts.keys());
    
    for (const type of typesToProcess) {
      const timestamps = this.errorCounts.get(type)!;
      if (timestamps.length === 0) continue;
      
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
      const count = sortedTimestamps.length;
      const firstOccurred = new Date(sortedTimestamps[0]);
      const lastOccurred = new Date(sortedTimestamps[count - 1]);
      
      // 平均間隔の計算
      let averageInterval = 0;
      if (count > 1) {
        const intervals = [];
        for (let i = 1; i < sortedTimestamps.length; i++) {
          intervals.push(sortedTimestamps[i] - sortedTimestamps[i - 1]);
        }
        averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      }
      
      results.push({
        errorType: type,
        count,
        firstOccurred,
        lastOccurred,
        averageInterval
      });
    }
    
    return results;
  }
  
  private async checkAlertConditions(errorType: string): Promise<void> {
    const relevantRules = this.alertRules.filter(rule => rule.errorType === errorType);
    
    for (const rule of relevantRules) {
      const lastAlertKey = `${rule.errorType}-${rule.timeWindow}`;
      const lastAlertTime = this.lastAlertTimes.get(lastAlertKey) || 0;
      
      // クールダウン期間中はスキップ
      if (Date.now() - lastAlertTime < this.alertCooldownMs) {
        continue;
      }
      
      // 指定期間内のエラー数をカウント
      const timestamps = this.errorCounts.get(errorType) || [];
      const cutoff = Date.now() - rule.timeWindow;
      const recentErrors = timestamps.filter(t => t > cutoff);
      
      if (recentErrors.length >= rule.threshold) {
        const metrics = this.getMetrics(errorType)[0];
        if (metrics) {
          try {
            await rule.action(metrics);
            this.lastAlertTimes.set(lastAlertKey, Date.now());
          } catch (alertError) {
            console.error('Alert action failed:', alertError);
          }
        }
      }
    }
  }
  
  analyzeTrends(
    errorType: string,
    timeWindow: number
  ): {
    trend: 'increasing' | 'decreasing' | 'stable';
    changeRate: number;
    prediction: number;
  } {
    const timestamps = this.errorCounts.get(errorType) || [];
    const cutoff = Date.now() - timeWindow;
    const recentErrors = timestamps.filter(t => t > cutoff);
    
    if (recentErrors.length < 4) {
      return {
        trend: 'stable',
        changeRate: 0,
        prediction: recentErrors.length
      };
    }
    
    // 時間窓を4つのセグメントに分割
    const segmentSize = timeWindow / 4;
    const segments: number[] = [];
    
    for (let i = 0; i < 4; i++) {
      const segmentStart = cutoff + (i * segmentSize);
      const segmentEnd = cutoff + ((i + 1) * segmentSize);
      const segmentCount = recentErrors.filter(t => t >= segmentStart && t < segmentEnd).length;
      segments.push(segmentCount);
    }
    
    // 線形回帰で傾向を計算
    const n = segments.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = segments.reduce((a, b) => a + b, 0);
    const sumXY = segments.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = segments.reduce((sum, _, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // 次のセグメントの予測
    const prediction = Math.max(0, Math.round(slope * n + intercept));
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    const changeRate = Math.abs(slope);
    
    if (Math.abs(slope) < 0.1) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }
    
    return {
      trend,
      changeRate: Math.round(changeRate * 100) / 100,
      prediction
    };
  }
}

// ============================================================================
// 演習 4 解答: 自動復旧システムの実装
// ============================================================================

interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  priority: number;
  timeout: number;
}

interface RecoveryAction {
  name: string;
  execute: () => Promise<boolean>;
  rollback?: () => Promise<void>;
  dependencies: string[];
}

export class AutoRecoverySystem {
  private healthChecks: HealthCheck[] = [];
  private recoveryActions: RecoveryAction[] = [];
  private isRecoveryInProgress = false;
  private recoveryHistory: Array<{
    timestamp: Date;
    trigger: string;
    actions: string[];
    success: boolean;
    duration: number;
  }> = [];
  
  addHealthCheck(healthCheck: HealthCheck): void {
    // 重複チェック
    const existingIndex = this.healthChecks.findIndex(hc => hc.name === healthCheck.name);
    if (existingIndex >= 0) {
      this.healthChecks[existingIndex] = healthCheck;
    } else {
      this.healthChecks.push(healthCheck);
    }
    
    // 優先度順ソート
    this.healthChecks.sort((a, b) => b.priority - a.priority);
  }
  
  addRecoveryAction(action: RecoveryAction): void {
    // 循環依存チェック
    if (this.hasCyclicDependency(action)) {
      throw new Error(`Cyclic dependency detected for action: ${action.name}`);
    }
    
    const existingIndex = this.recoveryActions.findIndex(a => a.name === action.name);
    if (existingIndex >= 0) {
      this.recoveryActions[existingIndex] = action;
    } else {
      this.recoveryActions.push(action);
    }
  }
  
  private hasCyclicDependency(newAction: RecoveryAction): boolean {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const hasCycle = (actionName: string): boolean => {
      if (visiting.has(actionName)) return true;
      if (visited.has(actionName)) return false;
      
      visiting.add(actionName);
      
      const action = actionName === newAction.name 
        ? newAction 
        : this.recoveryActions.find(a => a.name === actionName);
      
      if (action) {
        for (const dep of action.dependencies) {
          if (hasCycle(dep)) return true;
        }
      }
      
      visiting.delete(actionName);
      visited.add(actionName);
      return false;
    };
    
    return hasCycle(newAction.name);
  }
  
  async performHealthCheck(): Promise<{
    overallHealth: boolean;
    failedChecks: string[];
    recommendations: string[];
  }> {
    const failedChecks: string[] = [];
    const recommendations: string[] = [];
    
    // 並列実行（タイムアウト考慮）
    const checkPromises = this.healthChecks.map(async (healthCheck) => {
      try {
        const timeoutPromise = new Promise<boolean>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), healthCheck.timeout);
        });
        
        const result = await Promise.race([
          healthCheck.check(),
          timeoutPromise
        ]);
        
        return { name: healthCheck.name, passed: result, priority: healthCheck.priority };
      } catch (error) {
        return { name: healthCheck.name, passed: false, priority: healthCheck.priority };
      }
    });
    
    const results = await Promise.all(checkPromises);
    
    for (const result of results) {
      if (!result.passed) {
        failedChecks.push(result.name);
        
        // 失敗したチェックに基づく推奨事項
        const relatedActions = this.recoveryActions.filter(action => 
          action.dependencies.includes(result.name)
        );
        
        for (const action of relatedActions) {
          recommendations.push(`Consider running recovery action: ${action.name}`);
        }
      }
    }
    
    // 高優先度チェックの失敗は全体の健全性に影響
    const criticalFailures = results.filter(r => !r.passed && r.priority >= 8);
    const overallHealth = criticalFailures.length === 0;
    
    return {
      overallHealth,
      failedChecks,
      recommendations: [...new Set(recommendations)]
    };
  }
  
  async executeRecovery(trigger: string): Promise<boolean> {
    if (this.isRecoveryInProgress) {
      throw new Error('Recovery is already in progress');
    }
    
    this.isRecoveryInProgress = true;
    const startTime = Date.now();
    const executedActions: string[] = [];
    const rollbackActions: (() => Promise<void>)[] = [];
    
    try {
      // 依存関係を解決して実行順序を決定
      const executionOrder = this.resolveDependencies();
      
      for (const actionName of executionOrder) {
        const action = this.recoveryActions.find(a => a.name === actionName);
        if (!action) continue;
        
        console.log(`Executing recovery action: ${actionName}`);
        const success = await action.execute();
        
        if (success) {
          executedActions.push(actionName);
          if (action.rollback) {
            rollbackActions.unshift(action.rollback);
          }
        } else {
          console.error(`Recovery action failed: ${actionName}`);
          // 失敗時はロールバック
          await this.performRollback(rollbackActions);
          this.recordRecoveryHistory(trigger, executedActions, false, Date.now() - startTime);
          return false;
        }
      }
      
      this.recordRecoveryHistory(trigger, executedActions, true, Date.now() - startTime);
      return true;
      
    } catch (error) {
      console.error('Recovery execution failed:', error);
      await this.performRollback(rollbackActions);
      this.recordRecoveryHistory(trigger, executedActions, false, Date.now() - startTime);
      return false;
    } finally {
      this.isRecoveryInProgress = false;
    }
  }
  
  private resolveDependencies(): string[] {
    const resolved: string[] = [];
    const visited = new Set<string>();
    
    const visit = (actionName: string) => {
      if (visited.has(actionName)) return;
      visited.add(actionName);
      
      const action = this.recoveryActions.find(a => a.name === actionName);
      if (!action) return;
      
      for (const dep of action.dependencies) {
        visit(dep);
      }
      
      resolved.push(actionName);
    };
    
    for (const action of this.recoveryActions) {
      visit(action.name);
    }
    
    return resolved;
  }
  
  private async performRollback(rollbackActions: (() => Promise<void>)[]): Promise<void> {
    for (const rollback of rollbackActions) {
      try {
        await rollback();
      } catch (error) {
        console.error('Rollback failed:', error);
      }
    }
  }
  
  private recordRecoveryHistory(
    trigger: string,
    actions: string[],
    success: boolean,
    duration: number
  ): void {
    this.recoveryHistory.push({
      timestamp: new Date(),
      trigger,
      actions: [...actions],
      success,
      duration
    });
    
    // 履歴を最新100件に制限
    if (this.recoveryHistory.length > 100) {
      this.recoveryHistory.splice(0, this.recoveryHistory.length - 100);
    }
  }
  
  getRecoveryHistory(limit: number = 10): Array<{
    timestamp: Date;
    trigger: string;
    actions: string[];
    success: boolean;
    duration: number;
  }> {
    return this.recoveryHistory
      .slice(-limit)
      .reverse();
  }
}

// ============================================================================
// 演習 5 解答: エラーレポートジェネレーターの実装
// ============================================================================

interface ReportConfig {
  timeRange: {
    from: Date;
    to: Date;
  };
  includeMetrics: boolean;
  includeTrends: boolean;
  includeRecommendations: boolean;
  format: 'json' | 'html' | 'csv';
}

interface ErrorReport {
  metadata: {
    generatedAt: Date;
    timeRange: ReportConfig['timeRange'];
    totalErrors: number;
    uniqueErrorTypes: number;
  };
  summary: {
    mostFrequentErrors: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    errorsByHour: Record<string, number>;
    severityDistribution: Record<string, number>;
  };
  recommendations: string[];
}

export class ErrorReportGenerator {
  constructor(private monitoringSystem: ErrorMonitoringSystem) {}
  
  private async collectData(config: ReportConfig): Promise<ErrorReport> {
    const metrics = this.monitoringSystem.getMetrics();
    const timeRange = config.timeRange;
    
    // 指定期間内のデータをフィルタ
    const filteredMetrics = metrics.filter(m => 
      m.lastOccurred >= timeRange.from && m.firstOccurred <= timeRange.to
    );
    
    const totalErrors = filteredMetrics.reduce((sum, m) => sum + m.count, 0);
    const uniqueErrorTypes = filteredMetrics.length;
    
    // 最も頻繁なエラー
    const mostFrequentErrors = filteredMetrics
      .map(m => ({
        type: m.errorType,
        count: m.count,
        percentage: Math.round((m.count / totalErrors) * 100 * 100) / 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // 時間別エラー分布（簡略化）
    const errorsByHour: Record<string, number> = {};
    const hourRange = Math.ceil((timeRange.to.getTime() - timeRange.from.getTime()) / (1000 * 60 * 60));
    
    for (let i = 0; i < hourRange; i++) {
      const hour = new Date(timeRange.from.getTime() + i * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 13);
      errorsByHour[hour] = Math.floor(Math.random() * totalErrors / hourRange); // 簡略化
    }
    
    // 重要度分布（模擬データ）
    const severityDistribution = {
      'low': Math.floor(totalErrors * 0.5),
      'medium': Math.floor(totalErrors * 0.3),
      'high': Math.floor(totalErrors * 0.15),
      'critical': Math.floor(totalErrors * 0.05)
    };
    
    // 推奨事項生成
    const recommendations: string[] = [];
    
    if (totalErrors > 1000) {
      recommendations.push('エラー数が多すぎます。ログレベルの見直しを検討してください。');
    }
    
    if (mostFrequentErrors.length > 0 && mostFrequentErrors[0].percentage > 50) {
      recommendations.push(`${mostFrequentErrors[0].type} エラーが全体の50%以上を占めています。優先的に対応してください。`);
    }
    
    if (severityDistribution.critical > 10) {
      recommendations.push('クリティカルエラーが多発しています。緊急対応が必要です。');
    }
    
    return {
      metadata: {
        generatedAt: new Date(),
        timeRange,
        totalErrors,
        uniqueErrorTypes
      },
      summary: {
        mostFrequentErrors,
        errorsByHour,
        severityDistribution
      },
      recommendations
    };
  }
  
  async generateHTMLReport(config: ReportConfig): Promise<string> {
    const data = await this.collectData(config);
    
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>エラーレポート</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .chart { background: #f9f9f9; padding: 15px; border-radius: 3px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .error-high { color: #d32f2f; }
        .error-medium { color: #f57c00; }
        .error-low { color: #388e3c; }
    </style>
</head>
<body>
    <div class="header">
        <h1>エラーレポート</h1>
        <p>生成日時: ${data.metadata.generatedAt.toLocaleString('ja-JP')}</p>
        <p>対象期間: ${data.metadata.timeRange.from.toLocaleDateString('ja-JP')} - ${data.metadata.timeRange.to.toLocaleDateString('ja-JP')}</p>
    </div>
    
    <div class="section">
        <h2>サマリー</h2>
        <ul>
            <li>総エラー数: ${data.metadata.totalErrors}</li>
            <li>ユニークエラータイプ数: ${data.metadata.uniqueErrorTypes}</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>最も頻繁なエラー</h2>
        <table>
            <thead>
                <tr><th>エラータイプ</th><th>発生回数</th><th>割合</th></tr>
            </thead>
            <tbody>
                ${data.summary.mostFrequentErrors.map(error => `
                    <tr>
                        <td>${error.type}</td>
                        <td>${error.count}</td>
                        <td>${error.percentage}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>重要度別分布</h2>
        <div class="chart">
            <ul>
                <li class="error-low">Low: ${data.summary.severityDistribution.low}</li>
                <li class="error-medium">Medium: ${data.summary.severityDistribution.medium}</li>
                <li class="error-high">High: ${data.summary.severityDistribution.high}</li>
                <li class="error-high">Critical: ${data.summary.severityDistribution.critical}</li>
            </ul>
        </div>
    </div>
    
    ${data.recommendations.length > 0 ? `
    <div class="section">
        <h2>推奨事項</h2>
        <ul>
            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
</body>
</html>`;
    
    return html;
  }
  
  async generateCSVReport(config: ReportConfig): Promise<string> {
    const data = await this.collectData(config);
    
    let csv = 'Type,Field,Value\n';
    
    // メタデータ
    csv += `Metadata,GeneratedAt,${data.metadata.generatedAt.toISOString()}\n`;
    csv += `Metadata,TotalErrors,${data.metadata.totalErrors}\n`;
    csv += `Metadata,UniqueErrorTypes,${data.metadata.uniqueErrorTypes}\n`;
    
    // エラー詳細
    for (const error of data.summary.mostFrequentErrors) {
      csv += `Error,${error.type},${error.count}\n`;
    }
    
    // 重要度分布
    for (const [severity, count] of Object.entries(data.summary.severityDistribution)) {
      csv += `Severity,${severity},${count}\n`;
    }
    
    // 推奨事項
    for (let i = 0; i < data.recommendations.length; i++) {
      csv += `Recommendation,${i + 1},"${data.recommendations[i]}"\n`;
    }
    
    return csv;
  }
  
  async generateJSONReport(config: ReportConfig): Promise<string> {
    const data = await this.collectData(config);
    return JSON.stringify(data, null, 2);
  }
  
  async scheduleReport(
    config: ReportConfig,
    schedule: 'daily' | 'weekly' | 'monthly',
    recipients: string[]
  ): Promise<void> {
    const intervalMs = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    }[schedule];
    
    const generateAndSend = async () => {
      try {
        let report: string;
        let contentType: string;
        
        switch (config.format) {
          case 'html':
            report = await this.generateHTMLReport(config);
            contentType = 'text/html';
            break;
          case 'csv':
            report = await this.generateCSVReport(config);
            contentType = 'text/csv';
            break;
          case 'json':
          default:
            report = await this.generateJSONReport(config);
            contentType = 'application/json';
        }
        
        // 実際の実装では、メール送信サービスやSlack通知などを使用
        console.log(`Sending ${config.format} report to:`, recipients);
        console.log(`Report content (${contentType}):`, report.slice(0, 200) + '...');
        
      } catch (error) {
        console.error('Failed to generate/send scheduled report:', error);
        
        // リトライロジック（簡略化）
        setTimeout(generateAndSend, 60000); // 1分後にリトライ
      }
    };
    
    // 初回実行
    generateAndSend();
    
    // 定期実行のスケジューリング
    setInterval(generateAndSend, intervalMs);
  }
}

// テスト用のヘルパー関数
export const createTestAlertAction = (
  actionName: string
): ((metrics: ErrorMetrics) => Promise<void>) => {
  return async (metrics: ErrorMetrics) => {
    console.log(`🚨 ALERT: ${actionName}`);
    console.log(`Error Type: ${metrics.errorType}`);
    console.log(`Count: ${metrics.count}`);
    console.log(`Average Interval: ${metrics.averageInterval}ms`);
  };
};

export const createTestHealthCheck = (
  name: string,
  shouldPass: boolean = true
): HealthCheck => {
  return {
    name,
    check: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return shouldPass;
    },
    priority: 1,
    timeout: 1000
  };
};

export const createTestRecoveryAction = (
  name: string,
  shouldSucceed: boolean = true
): RecoveryAction => {
  return {
    name,
    execute: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return shouldSucceed;
    },
    rollback: async () => {
      console.log(`Rolling back action: ${name}`);
    },
    dependencies: []
  };
};

// 全体のデモンストレーション
export async function demonstrateAdvancedErrorHandling(): Promise<void> {
  console.log('=== Lesson 44: Advanced Error Handling Demonstration ===');
  
  try {
    // 1. カスタムエラークラスのデモ
    console.log('\n1. Custom Error Classes:');
    const dbError = new DatabaseError('Connection timeout', 'read', 'users', 'profiles', true);
    console.log(`DB Error: ${dbError.userMessage} (Can retry: ${dbError.canRetry})`);
    
    const serviceError = new ExternalServiceError('API rate limit exceeded', 'Stripe', '/charges', 429);
    console.log(`Service Error: ${serviceError.userMessage} (Service: ${serviceError.serviceName})`);
    
    // 2. 高度なAPIクライアントのデモ
    console.log('\n2. Advanced API Client:');
    const apiClient = new AdvancedApiClient('https://api.example.com', 3, 60000);
    await apiClient.setAuthToken('test-token', 3600000);
    
    console.log('API Client stats:', apiClient.getStats());
    
    // 3. エラー監視システムのデモ
    console.log('\n3. Error Monitoring System:');
    const monitoring = new ErrorMonitoringSystem(60000);
    
    monitoring.addAlertRule({
      errorType: 'DB_ERROR',
      threshold: 5,
      timeWindow: 60000,
      action: createTestAlertAction('Database Alert')
    });
    
    // いくつかのエラーを記録
    for (let i = 0; i < 6; i++) {
      monitoring.recordError(new DatabaseError('Test error', 'read', 'test', 'table'));
    }
    
    const metrics = monitoring.getMetrics('DB_ERROR');
    if (metrics.length > 0) {
      console.log('DB Error metrics:', metrics[0]);
      
      const trends = monitoring.analyzeTrends('DB_ERROR', 300000);
      console.log('Trend analysis:', trends);
    }
    
    // 4. 自動復旧システムのデモ
    console.log('\n4. Auto Recovery System:');
    const recovery = new AutoRecoverySystem();
    
    recovery.addHealthCheck(createTestHealthCheck('Database Connection', true));
    recovery.addHealthCheck(createTestHealthCheck('External API', false));
    
    recovery.addRecoveryAction(createTestRecoveryAction('Restart Database Pool', true));
    recovery.addRecoveryAction(createTestRecoveryAction('Switch to Backup API', true));
    
    const healthStatus = await recovery.performHealthCheck();
    console.log('Health check result:', healthStatus);
    
    if (!healthStatus.overallHealth) {
      const recoveryResult = await recovery.executeRecovery('Automated Health Check');
      console.log(`Recovery ${recoveryResult ? 'succeeded' : 'failed'}`);
      
      const history = recovery.getRecoveryHistory(1);
      console.log('Recovery history:', history);
    }
    
    // 5. レポートジェネレーターのデモ
    console.log('\n5. Error Report Generator:');
    const reportGenerator = new ErrorReportGenerator(monitoring);
    
    const reportConfig: ReportConfig = {
      timeRange: {
        from: new Date(Date.now() - 24 * 60 * 60 * 1000),
        to: new Date()
      },
      includeMetrics: true,
      includeTrends: true,
      includeRecommendations: true,
      format: 'json'
    };
    
    const jsonReport = await reportGenerator.generateJSONReport(reportConfig);
    console.log('JSON Report generated:', JSON.parse(jsonReport).metadata);
    
    console.log('\nAdvanced error handling demonstration completed!');
  } catch (error) {
    console.error('Demo error:', error);
  }
}