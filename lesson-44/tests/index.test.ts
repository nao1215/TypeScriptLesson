/**
 * Lesson 44 テスト: エラーハンドリング (Error Handling in Web Apps)
 */

import {
  AppError,
  ErrorSeverity,
  NetworkError,
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  GlobalErrorHandler,
  ApiClient,
  CircuitBreaker,
  FormValidator,
  demonstrateErrorHandling
} from '../src/index';

import {
  DatabaseError,
  ExternalServiceError,
  UserOperationError,
  AdvancedApiClient,
  ErrorMonitoringSystem,
  AutoRecoverySystem,
  ErrorReportGenerator,
  createTestAlertAction,
  createTestHealthCheck,
  createTestRecoveryAction,
  demonstrateAdvancedErrorHandling
} from '../src/solution';

// モック設定
const originalFetch = global.fetch;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  global.fetch = jest.fn();
  console.log = jest.fn();
  console.error = jest.fn();
  
  // DOM環境のモック
  Object.defineProperty(window, 'addEventListener', {
    value: jest.fn(),
    writable: true
  });
  
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Test Browser',
    writable: true
  });
  
  Object.defineProperty(window, 'location', {
    value: { href: 'https://test.com' },
    writable: true
  });
});

afterEach(() => {
  global.fetch = originalFetch;
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe('Lesson 44: Error Handling in Web Apps', () => {
  
  describe('カスタムエラークラス', () => {
    it('should create NetworkError with proper properties', () => {
      const originalError = new Error('Connection failed');
      const networkError = new NetworkError('Network issue', originalError, { url: 'test.com' });
      
      expect(networkError).toBeInstanceOf(AppError);
      expect(networkError.code).toBe('NETWORK_ERROR');
      expect(networkError.statusCode).toBe(0);
      expect(networkError.severity).toBe(ErrorSeverity.HIGH);
      expect(networkError.userMessage).toContain('ネットワークに接続できません');
      expect(networkError.originalError).toBe(originalError);
      expect(networkError.context?.url).toBe('test.com');
    });

    it('should create APIError with status-specific messages', () => {
      const apiError404 = new APIError('Not found', 404, '/api/users/123');
      expect(apiError404.userMessage).toContain('見つかりません');
      expect(apiError404.severity).toBe(ErrorSeverity.MEDIUM);
      
      const apiError500 = new APIError('Server error', 500, '/api/data');
      expect(apiError500.userMessage).toContain('サーバーで問題が発生');
      expect(apiError500.severity).toBe(ErrorSeverity.CRITICAL);
      
      const apiError401 = new APIError('Unauthorized', 401, '/api/secure');
      expect(apiError401.userMessage).toContain('認証が必要');
      expect(apiError401.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should create ValidationError with field information', () => {
      const validationError = new ValidationError('Invalid email', 'email', 'invalid-email');
      
      expect(validationError.code).toBe('VALIDATION_ERROR');
      expect(validationError.field).toBe('email');
      expect(validationError.value).toBe('invalid-email');
      expect(validationError.severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe('GlobalErrorHandler', () => {
    let errorHandler: GlobalErrorHandler;
    
    beforeEach(() => {
      // シングルトンインスタンスをリセット
      (GlobalErrorHandler as any).instance = undefined;
      
      errorHandler = GlobalErrorHandler.getInstance({
        enableConsoleLogging: true,
        enableRemoteLogging: false,
        onError: jest.fn(),
        onUnhandledException: jest.fn()
      });
    });

    it('should handle errors with appropriate severity', () => {
      const lowSeverityError = new ValidationError('Test validation error', 'test', 'invalid');
      const criticalError = new APIError('Server crash', 500, '/api/test');
      
      errorHandler.handleError(lowSeverityError);
      errorHandler.handleError(criticalError);
      
      expect(console.log).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should create singleton instance', () => {
      const instance1 = GlobalErrorHandler.getInstance();
      const instance2 = GlobalErrorHandler.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('ApiClient', () => {
    let apiClient: ApiClient;
    
    beforeEach(() => {
      apiClient = new ApiClient({
        baseUrl: 'https://api.test.com',
        timeout: 1000,
        retryAttempts: 2,
        retryDelay: 100
      });
    });

    it('should make successful requests', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.request('/test');
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(apiClient.request('/test')).rejects.toThrow(APIError);
    });

    it('should retry on network errors', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const result = await apiClient.request('/test');
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle timeout', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );

      await expect(apiClient.request('/test')).rejects.toThrow(NetworkError);
    });
  });

  describe('CircuitBreaker', () => {
    let circuitBreaker: CircuitBreaker;
    
    beforeEach(() => {
      circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        timeoutThreshold: 1000,
        monitoringPeriod: 500
      });
    });

    it('should allow operations when closed', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await circuitBreaker.execute(operation);
      expect(result).toBe('success');
      expect(circuitBreaker.getStatus().state).toBe('closed');
    });

    it('should open after threshold failures', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));
      
      // 閾値まで失敗させる
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch (error) {
          // エラーは無視
        }
      }
      
      expect(circuitBreaker.getStatus().state).toBe('open');
      expect(circuitBreaker.getStatus().failures).toBe(3);
    });

    it('should use fallback when open', async () => {
      const fallback = jest.fn().mockResolvedValue('fallback result');
      const circuitBreakerWithFallback = new CircuitBreaker({
        failureThreshold: 1,
        timeoutThreshold: 1000,
        monitoringPeriod: 500,
        fallbackFunction: fallback
      });
      
      const operation = jest.fn().mockRejectedValue(new Error('failure'));
      
      // 一度失敗させてOPENにする
      try {
        await circuitBreakerWithFallback.execute(operation);
      } catch (error) {
        // エラーは無視
      }
      
      // 次の実行でフォールバックが呼ばれる
      const result = await circuitBreakerWithFallback.execute(operation);
      expect(result).toBe('fallback result');
      expect(fallback).toHaveBeenCalled();
    });
  });

  describe('FormValidator', () => {
    let validator: FormValidator;
    
    beforeEach(() => {
      validator = new FormValidator()
        .addRule({
          field: 'email',
          validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          errorMessage: 'Invalid email format'
        })
        .addRule({
          field: 'age',
          validate: (value) => value >= 18,
          errorMessage: 'Must be at least 18 years old'
        });
    });

    it('should validate valid data', () => {
      const validData = {
        email: 'test@example.com',
        age: 25
      };
      
      const errors = validator.validate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return validation errors for invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        age: 16
      };
      
      const errors = validator.validate(invalidData);
      expect(errors).toHaveLength(2);
      expect(errors[0]).toBeInstanceOf(ValidationError);
      expect(errors[1]).toBeInstanceOf(ValidationError);
    });
  });

  describe('拡張エラークラス（解答例）', () => {
    it('should create DatabaseError with operation details', () => {
      const dbError = new DatabaseError(
        'Connection timeout',
        'read',
        'userdb',
        'users',
        true,
        { connectionPool: 'primary' }
      );
      
      expect(dbError.code).toBe('DB_ERROR');
      expect(dbError.operation).toBe('read');
      expect(dbError.database).toBe('userdb');
      expect(dbError.table).toBe('users');
      expect(dbError.canRetry).toBe(true);
      expect(dbError.context?.connectionPool).toBe('primary');
    });

    it('should create ExternalServiceError with service details', () => {
      const serviceError = new ExternalServiceError(
        'Rate limit exceeded',
        'Stripe',
        '/v1/charges',
        429,
        { error: 'rate_limit' }
      );
      
      expect(serviceError.serviceName).toBe('Stripe');
      expect(serviceError.endpoint).toBe('/v1/charges');
      expect(serviceError.responseStatus).toBe(429);
      expect(serviceError.responseData).toEqual({ error: 'rate_limit' });
    });

    it('should create UserOperationError with context', () => {
      const userError = new UserOperationError(
        'Cannot delete resource',
        'delete',
        'post',
        'post-123',
        'user-456'
      );
      
      expect(userError.operation).toBe('delete');
      expect(userError.resourceType).toBe('post');
      expect(userError.resourceId).toBe('post-123');
      expect(userError.userId).toBe('user-456');
    });
  });

  describe('AdvancedApiClient', () => {
    let apiClient: AdvancedApiClient;
    
    beforeEach(() => {
      apiClient = new AdvancedApiClient('https://api.test.com', 2, 1000);
    });

    it('should manage authentication tokens', async () => {
      await apiClient.setAuthToken('test-token', 3600000);
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' })
      });

      await apiClient.get('/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should cache responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'cached' })
      });

      // 最初のリクエスト
      const result1 = await apiClient.get('/cached', { cache: true });
      expect(result1).toEqual({ data: 'cached' });
      
      // 2回目のリクエスト（キャッシュから）
      const result2 = await apiClient.get('/cached', { cache: true });
      expect(result2).toEqual({ data: 'cached' });
      
      // fetchは1回だけ呼ばれる
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      const stats = apiClient.getStats();
      expect(stats.cacheHits).toBe(1);
      expect(stats.cacheMisses).toBe(1);
    });

    it('should clear cache', () => {
      apiClient.clearCache();
      
      const stats = apiClient.getStats();
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheMisses).toBe(0);
    });
  });

  describe('ErrorMonitoringSystem', () => {
    let monitoring: ErrorMonitoringSystem;
    
    beforeEach(() => {
      monitoring = new ErrorMonitoringSystem(1000);
    });

    it('should record and track errors', () => {
      const error = new DatabaseError('Test error', 'read', 'test');
      monitoring.recordError(error);
      
      const metrics = monitoring.getMetrics('DB_ERROR');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].errorType).toBe('DB_ERROR');
      expect(metrics[0].count).toBe(1);
    });

    it('should trigger alerts when threshold is exceeded', (done) => {
      const alertAction = jest.fn().mockResolvedValue(undefined);
      
      monitoring.addAlertRule({
        errorType: 'DB_ERROR',
        threshold: 3,
        timeWindow: 5000,
        action: alertAction
      });
      
      // 閾値を超える数のエラーを記録
      for (let i = 0; i < 4; i++) {
        monitoring.recordError(new DatabaseError('Test error', 'read', 'test'));
      }
      
      // アラートアクションの実行を待つ
      setTimeout(() => {
        expect(alertAction).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should analyze error trends', () => {
      // 複数のエラーを異なる時間に記録
      for (let i = 0; i < 5; i++) {
        monitoring.recordError(new DatabaseError('Test error', 'read', 'test'));
      }
      
      const trends = monitoring.analyzeTrends('DB_ERROR', 300000);
      expect(trends).toHaveProperty('trend');
      expect(trends).toHaveProperty('changeRate');
      expect(trends).toHaveProperty('prediction');
    });
  });

  describe('AutoRecoverySystem', () => {
    let recovery: AutoRecoverySystem;
    
    beforeEach(() => {
      recovery = new AutoRecoverySystem();
    });

    it('should perform health checks', async () => {
      recovery.addHealthCheck(createTestHealthCheck('Database', true));
      recovery.addHealthCheck(createTestHealthCheck('API', false));
      
      const result = await recovery.performHealthCheck();
      
      expect(result.overallHealth).toBeDefined();
      expect(result.failedChecks).toContain('API');
      expect(result.recommendations).toHaveLength(0); // 関連アクションがないため
    });

    it('should execute recovery actions', async () => {
      recovery.addRecoveryAction(createTestRecoveryAction('Restart Service', true));
      
      const result = await recovery.executeRecovery('Manual trigger');
      expect(result).toBe(true);
      
      const history = recovery.getRecoveryHistory(1);
      expect(history).toHaveLength(1);
      expect(history[0].success).toBe(true);
      expect(history[0].actions).toContain('Restart Service');
    });

    it('should handle recovery failures and rollback', async () => {
      recovery.addRecoveryAction(createTestRecoveryAction('Failing Action', false));
      
      const result = await recovery.executeRecovery('Test failure');
      expect(result).toBe(false);
      
      const history = recovery.getRecoveryHistory(1);
      expect(history[0].success).toBe(false);
    });

    it('should prevent cyclic dependencies', () => {
      recovery.addRecoveryAction({
        name: 'Action A',
        execute: async () => true,
        dependencies: ['Action B']
      });
      
      expect(() => {
        recovery.addRecoveryAction({
          name: 'Action B',
          execute: async () => true,
          dependencies: ['Action A'] // 循環依存
        });
      }).toThrow('Cyclic dependency detected');
    });
  });

  describe('ErrorReportGenerator', () => {
    let monitoring: ErrorMonitoringSystem;
    let reportGenerator: ErrorReportGenerator;
    
    beforeEach(() => {
      monitoring = new ErrorMonitoringSystem();
      reportGenerator = new ErrorReportGenerator(monitoring);
      
      // テストデータの準備
      for (let i = 0; i < 10; i++) {
        monitoring.recordError(new DatabaseError('Test error', 'read', 'test'));
      }
    });

    it('should generate JSON report', async () => {
      const config = {
        timeRange: {
          from: new Date(Date.now() - 24 * 60 * 60 * 1000),
          to: new Date()
        },
        includeMetrics: true,
        includeTrends: true,
        includeRecommendations: true,
        format: 'json' as const
      };
      
      const report = await reportGenerator.generateJSONReport(config);
      const parsed = JSON.parse(report);
      
      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('summary');
      expect(parsed).toHaveProperty('recommendations');
      expect(parsed.metadata.totalErrors).toBeGreaterThan(0);
    });

    it('should generate HTML report', async () => {
      const config = {
        timeRange: {
          from: new Date(Date.now() - 24 * 60 * 60 * 1000),
          to: new Date()
        },
        includeMetrics: true,
        includeTrends: true,
        includeRecommendations: true,
        format: 'html' as const
      };
      
      const html = await reportGenerator.generateHTMLReport(config);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('エラーレポート');
      expect(html).toContain('総エラー数');
    });

    it('should generate CSV report', async () => {
      const config = {
        timeRange: {
          from: new Date(Date.now() - 24 * 60 * 60 * 1000),
          to: new Date()
        },
        includeMetrics: true,
        includeTrends: true,
        includeRecommendations: true,
        format: 'csv' as const
      };
      
      const csv = await reportGenerator.generateCSVReport(config);
      
      expect(csv).toContain('Type,Field,Value');
      expect(csv).toContain('Metadata,TotalErrors');
    });
  });

  describe('統合テスト', () => {
    it('should run main demonstration', async () => {
      await expect(demonstrateErrorHandling()).resolves.not.toThrow();
    });

    it('should run advanced demonstration', async () => {
      await expect(demonstrateAdvancedErrorHandling()).resolves.not.toThrow();
    });
  });

  describe('Helper functions', () => {
    it('should create test alert action', async () => {
      const action = createTestAlertAction('Test Alert');
      const metrics = {
        errorType: 'TEST_ERROR',
        count: 5,
        firstOccurred: new Date(),
        lastOccurred: new Date(),
        averageInterval: 1000
      };
      
      await expect(action(metrics)).resolves.not.toThrow();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('🚨 ALERT'));
    });

    it('should create test health check', async () => {
      const passingCheck = createTestHealthCheck('Passing Check', true);
      const failingCheck = createTestHealthCheck('Failing Check', false);
      
      const passingResult = await passingCheck.check();
      const failingResult = await failingCheck.check();
      
      expect(passingResult).toBe(true);
      expect(failingResult).toBe(false);
    });

    it('should create test recovery action', async () => {
      const successAction = createTestRecoveryAction('Success Action', true);
      const failAction = createTestRecoveryAction('Fail Action', false);
      
      const successResult = await successAction.execute();
      const failResult = await failAction.execute();
      
      expect(successResult).toBe(true);
      expect(failResult).toBe(false);
      
      if (successAction.rollback) {
        await expect(successAction.rollback()).resolves.not.toThrow();
      }
    });
  });
});