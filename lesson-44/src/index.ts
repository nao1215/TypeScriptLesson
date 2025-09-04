/**
 * Lesson 44: エラーハンドリング (Error Handling in Web Apps)
 * Webアプリケーションでの包括的なエラーハンドリング戦略
 */

// ============================================================================
// 1. カスタムエラークラス定義
// ============================================================================

/**
 * ベースエラークラス：すべてのアプリケーションエラーの基底
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly userMessage: string;
  abstract readonly severity: ErrorSeverity;
  
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;
  
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
    
    // スタックトレースの適切な処理
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * ネットワーク関連のエラー
 */
export class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 0;
  readonly userMessage = 'ネットワークに接続できません。インターネット接続を確認してください。';
  readonly severity = ErrorSeverity.HIGH;
  
  constructor(
    message: string,
    public readonly originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * API関連のエラー
 */
export class APIError extends AppError {
  readonly code = 'API_ERROR';
  readonly userMessage: string;
  readonly severity: ErrorSeverity;
  
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
    context?: Record<string, any>
  ) {
    super(message, context);
    
    // ステータスコードに応じたユーザーメッセージとエラーレベル
    switch (true) {
      case statusCode === 400:
        this.userMessage = 'リクエストに問題があります。入力内容を確認してください。';
        this.severity = ErrorSeverity.MEDIUM;
        break;
      case statusCode === 401:
        this.userMessage = '認証が必要です。ログインしてください。';
        this.severity = ErrorSeverity.HIGH;
        break;
      case statusCode === 403:
        this.userMessage = 'この操作を実行する権限がありません。';
        this.severity = ErrorSeverity.HIGH;
        break;
      case statusCode === 404:
        this.userMessage = '要求された情報が見つかりません。';
        this.severity = ErrorSeverity.MEDIUM;
        break;
      case statusCode >= 500:
        this.userMessage = 'サーバーで問題が発生しています。しばらく時間をおいてから再度お試しください。';
        this.severity = ErrorSeverity.CRITICAL;
        break;
      default:
        this.userMessage = '予期しないエラーが発生しました。';
        this.severity = ErrorSeverity.MEDIUM;
    }
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly userMessage = '入力内容に問題があります。';
  readonly severity = ErrorSeverity.LOW;
  
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any,
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * 認証エラー
 */
export class AuthenticationError extends AppError {
  readonly code = 'AUTH_ERROR';
  readonly statusCode = 401;
  readonly userMessage = 'ログインが必要です。';
  readonly severity = ErrorSeverity.HIGH;
}

/**
 * アクセス権限エラー
 */
export class AuthorizationError extends AppError {
  readonly code = 'AUTHZ_ERROR';
  readonly statusCode = 403;
  readonly userMessage = 'この操作を実行する権限がありません。';
  readonly severity = ErrorSeverity.HIGH;
}

// ============================================================================
// 2. グローバルエラーハンドラー
// ============================================================================

export interface ErrorHandlerOptions {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  onError?: (error: AppError) => void;
  onUnhandledException?: (error: Error) => void;
}

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private options: ErrorHandlerOptions;
  private errorQueue: AppError[] = [];
  private isFlushingQueue = false;
  
  private constructor(options: ErrorHandlerOptions) {
    this.options = options;
    this.setupGlobalHandlers();
  }
  
  static getInstance(options?: ErrorHandlerOptions): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      if (!options) {
        throw new Error('Options must be provided for first initialization');
      }
      GlobalErrorHandler.instance = new GlobalErrorHandler(options);
    }
    return GlobalErrorHandler.instance;
  }
  
  private setupGlobalHandlers(): void {
    // 未キャッチのJavaScriptエラー
    window.addEventListener('error', (event) => {
      const error = new AppError(event.error?.message || 'Unknown error');
      this.handleError(error);
      this.options.onUnhandledException?.(event.error);
    });
    
    // 未キャッチのPromise拒否
    window.addEventListener('unhandledrejection', (event) => {
      let error: AppError;
      
      if (event.reason instanceof AppError) {
        error = event.reason;
      } else if (event.reason instanceof Error) {
        error = new AppError(event.reason.message);
      } else {
        error = new AppError('Unhandled promise rejection');
      }
      
      this.handleError(error);
      this.options.onUnhandledException?.(event.reason);
    });
  }
  
  /**
   * エラーを処理し、適切なログ記録と通知を行う
   */
  handleError(error: AppError): void {
    // コンソールログ
    if (this.options.enableConsoleLogging) {
      this.logToConsole(error);
    }
    
    // リモートログ（キューイング）
    if (this.options.enableRemoteLogging) {
      this.queueForRemoteLogging(error);
    }
    
    // カスタムハンドラー呼び出し
    this.options.onError?.(error);
    
    // 重要度に応じた追加処理
    this.handleBySeverity(error);
  }
  
  private logToConsole(error: AppError): void {
    const logLevel = this.getConsoleLogLevel(error.severity);
    const logMessage = `[${error.code}] ${error.message}`;
    const logData = {
      timestamp: error.timestamp,
      severity: error.severity,
      context: error.context,
      stack: error.stack
    };
    
    console[logLevel](logMessage, logData);
  }
  
  private getConsoleLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'log';
    }
  }
  
  private queueForRemoteLogging(error: AppError): void {
    this.errorQueue.push(error);
    
    // バッチ処理でリモートログ送信
    if (!this.isFlushingQueue) {
      setTimeout(() => this.flushErrorQueue(), 1000);
    }
  }
  
  private async flushErrorQueue(): Promise<void> {
    if (this.isFlushingQueue || this.errorQueue.length === 0) return;
    
    this.isFlushingQueue = true;
    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];
    
    try {
      if (this.options.remoteEndpoint) {
        await this.sendToRemoteEndpoint(errorsToSend);
      }
    } catch (remoteError) {
      console.error('Failed to send errors to remote endpoint:', remoteError);
      // 送信失敗したエラーを再キューイング
      this.errorQueue.unshift(...errorsToSend);
    } finally {
      this.isFlushingQueue = false;
      
      // 再キューイングされたエラーがある場合は再試行
      if (this.errorQueue.length > 0) {
        setTimeout(() => this.flushErrorQueue(), 5000);
      }
    }
  }
  
  private async sendToRemoteEndpoint(errors: AppError[]): Promise<void> {
    const payload = errors.map(error => ({
      code: error.code,
      message: error.message,
      severity: error.severity,
      timestamp: error.timestamp,
      context: error.context,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    }));
    
    const response = await fetch(this.options.remoteEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errors: payload })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
  
  private handleBySeverity(error: AppError): void {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        // クリティカルエラーは即座にアラート
        this.showCriticalErrorAlert(error);
        break;
      case ErrorSeverity.HIGH:
        // 高重要度エラーは目立つ通知
        this.showHighPriorityNotification(error);
        break;
      case ErrorSeverity.MEDIUM:
      case ErrorSeverity.LOW:
        // 中・低重要度は控えめな通知
        this.showLowPriorityNotification(error);
        break;
    }
  }
  
  private showCriticalErrorAlert(error: AppError): void {
    // 重要なエラーはモーダルで表示
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #ff0000;
      border-radius: 8px;
      padding: 20px;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    modal.innerHTML = `
      <h3 style="color: #ff0000; margin: 0 0 10px 0;">システムエラー</h3>
      <p>${error.userMessage}</p>
      <button id="errorModalClose" style="margin-top: 10px; padding: 5px 15px;">
        閉じる
      </button>
    `;
    
    document.body.appendChild(modal);
    
    const closeButton = modal.querySelector('#errorModalClose');
    closeButton?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // 10秒後に自動的に閉じる
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 10000);
  }
  
  private showHighPriorityNotification(error: AppError): void {
    this.showNotification(error, '#ff6b6b', 7000);
  }
  
  private showLowPriorityNotification(error: AppError): void {
    this.showNotification(error, '#74b9ff', 4000);
  }
  
  private showNotification(error: AppError, color: string, duration: number): void {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 15px;
      border-radius: 4px;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `;
    
    notification.textContent = error.userMessage;
    document.body.appendChild(notification);
    
    // フェードイン効果
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // 指定時間後にフェードアウトして削除
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  }
}

// ============================================================================
// 3. APIクライアントWithエラーハンドリング
// ============================================================================

export interface ApiClientOptions {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private options: ApiClientOptions;
  private errorHandler: GlobalErrorHandler;
  
  constructor(options: ApiClientOptions) {
    this.options = options;
    this.errorHandler = GlobalErrorHandler.getInstance();
  }
  
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.options.baseUrl}${endpoint}`;
    let lastError: Error;
    
    // リトライループ
    for (let attempt = 0; attempt <= this.options.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...this.options.headers,
            ...options.headers,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const apiError = new APIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            endpoint,
            { attempt, url, method: options.method || 'GET' }
          );
          
          // 4xx エラーは通常リトライしない
          if (response.status >= 400 && response.status < 500) {
            this.errorHandler.handleError(apiError);
            throw apiError;
          }
          
          // 5xx エラーはリトライ対象
          if (attempt === this.options.retryAttempts) {
            this.errorHandler.handleError(apiError);
            throw apiError;
          }
          
          lastError = apiError;
          continue;
        }
        
        const data = await response.json();
        return data;
        
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }
        
        // ネットワークエラー、タイムアウト等
        const networkError = new NetworkError(
          'Network request failed',
          error instanceof Error ? error : undefined,
          { attempt, url, method: options.method || 'GET' }
        );
        
        if (attempt === this.options.retryAttempts) {
          this.errorHandler.handleError(networkError);
          throw networkError;
        }
        
        lastError = networkError;
        
        // 指数バックオフで待機
        const delay = this.options.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}

// ============================================================================
// 4. サーキットブレーカー実装
// ============================================================================

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  timeoutThreshold: number;
  monitoringPeriod: number;
  fallbackFunction?: () => Promise<any>;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: Date | null = null;
  private options: CircuitBreakerOptions;
  
  constructor(options: CircuitBreakerOptions) {
    this.options = options;
  }
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN;
      } else {
        // フォールバック関数がある場合は実行
        if (this.options.fallbackFunction) {
          return await this.options.fallbackFunction();
        }
        throw new AppError('Service is currently unavailable (Circuit Breaker OPEN)');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private shouldAttemptReset(): boolean {
    return this.lastFailureTime !== null &&
           Date.now() - this.lastFailureTime.getTime() > this.options.timeoutThreshold;
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = CircuitBreakerState.CLOSED;
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();
    
    if (this.failures >= this.options.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }
  
  getStatus(): {
    state: CircuitBreakerState;
    failures: number;
    lastFailureTime: Date | null;
  } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// ============================================================================
// 5. フォームバリデーション with エラーハンドリング
// ============================================================================

export interface ValidationRule {
  field: string;
  validate: (value: any) => boolean;
  errorMessage: string;
}

export class FormValidator {
  private rules: ValidationRule[] = [];
  private errorHandler: GlobalErrorHandler;
  
  constructor() {
    this.errorHandler = GlobalErrorHandler.getInstance();
  }
  
  addRule(rule: ValidationRule): this {
    this.rules.push(rule);
    return this;
  }
  
  validate(data: Record<string, any>): ValidationError[] {
    const errors: ValidationError[] = [];
    
    for (const rule of this.rules) {
      if (!rule.validate(data[rule.field])) {
        const validationError = new ValidationError(
          rule.errorMessage,
          rule.field,
          data[rule.field]
        );
        errors.push(validationError);
      }
    }
    
    // バリデーションエラーをエラーハンドラーに報告
    errors.forEach(error => this.errorHandler.handleError(error));
    
    return errors;
  }
}

// ============================================================================
// 6. 使用例とデモンストレーション
// ============================================================================

export async function demonstrateErrorHandling(): Promise<void> {
  console.log('=== Lesson 44: Error Handling Demonstration ===');
  
  // グローバルエラーハンドラーの初期化
  const errorHandler = GlobalErrorHandler.getInstance({
    enableConsoleLogging: true,
    enableRemoteLogging: false,
    onError: (error) => {
      console.log(`Custom handler received: ${error.code} - ${error.message}`);
    }
  });
  
  // APIクライアントの初期化
  const apiClient = new ApiClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000
  });
  
  // サーキットブレーカーの初期化
  const circuitBreaker = new CircuitBreaker({
    failureThreshold: 3,
    timeoutThreshold: 5000,
    monitoringPeriod: 1000,
    fallbackFunction: async () => ({
      message: 'Fallback response - service is temporarily unavailable'
    })
  });
  
  try {
    console.log('\n1. Successful API call:');
    const data = await apiClient.request('/posts/1');
    console.log('Success:', data);
    
    console.log('\n2. API error handling:');
    try {
      await apiClient.request('/posts/999999');
    } catch (error) {
      console.log('Handled API error:', error instanceof APIError ? error.userMessage : error);
    }
    
    console.log('\n3. Circuit breaker demonstration:');
    const unreliableOperation = () => {
      if (Math.random() < 0.7) {
        throw new Error('Simulated failure');
      }
      return Promise.resolve('Success');
    };
    
    // 複数回実行してサーキットブレーカーをテスト
    for (let i = 0; i < 5; i++) {
      try {
        const result = await circuitBreaker.execute(unreliableOperation);
        console.log(`Attempt ${i + 1}: ${result}`);
      } catch (error) {
        console.log(`Attempt ${i + 1}: Failed - ${error instanceof Error ? error.message : error}`);
      }
      
      const status = circuitBreaker.getStatus();
      console.log(`Circuit breaker state: ${status.state}, failures: ${status.failures}`);
    }
    
    console.log('\n4. Form validation:');
    const validator = new FormValidator()
      .addRule({
        field: 'email',
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        errorMessage: '正しいメールアドレスを入力してください'
      })
      .addRule({
        field: 'password',
        validate: (value) => value && value.length >= 8,
        errorMessage: 'パスワードは8文字以上で入力してください'
      });
    
    const formData = {
      email: 'invalid-email',
      password: '123'
    };
    
    const validationErrors = validator.validate(formData);
    console.log(`Validation errors: ${validationErrors.length}`);
    
    // カスタムエラーを手動で発生させる
    console.log('\n5. Manual error trigger:');
    const customError = new NetworkError('Manual network error for demonstration');
    errorHandler.handleError(customError);
    
  } catch (error) {
    console.error('Demo error:', error);
  }
}

// 初期化関数
export function initializeErrorHandling(): GlobalErrorHandler {
  return GlobalErrorHandler.getInstance({
    enableConsoleLogging: true,
    enableRemoteLogging: true,
    remoteEndpoint: '/api/errors',
    onError: (error) => {
      // 実際のアプリケーションでは、ここで Analytics や監視サービスに送信
      console.log(`[Error Tracking] ${error.code}: ${error.message}`);
    },
    onUnhandledException: (error) => {
      console.error('[Unhandled Exception]:', error);
    }
  });
}

// エクスポート
export {
  ApiClient,
  CircuitBreaker,
  FormValidator
};