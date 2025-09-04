/**
 * Lesson 43 テスト: async/await (Async/Await)
 */

import {
  demonstrateAsyncAwait,
  withRetry,
  withTimeout,
  processBatch,
  APIError,
  NetworkError
} from '../src/index';

import {
  getUserDataWithAsyncAwait,
  robustFetch,
  fetchUserDashboard,
  BatchProcessor,
  RealTimeStreamProcessor,
  createMockDataSource,
  createMockProcessor,
  HTTPError,
  ParseError
} from '../src/solution';

// モックfetch関数
const originalFetch = global.fetch;

beforeEach(() => {
  // fetch関数をモック
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

describe('Lesson 43: async/await', () => {
  
  describe('基本的なasync/await', () => {
    it('should convert Promise chains to async/await', async () => {
      // ユーザーAPIのモック
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ name: 'John Doe' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 1, title: 'Test Post' }]
        });

      const result = await getUserDataWithAsyncAwait('1');
      
      expect(result).toEqual({
        name: 'John Doe',
        posts: [{ id: 1, title: 'Test Post' }]
      });
    });

    it('should handle errors in async/await', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(getUserDataWithAsyncAwait('999')).rejects.toThrow('User not found');
    });
  });

  describe('エラーハンドリング', () => {
    it('should distinguish different error types', async () => {
      // ネットワークエラーのテスト
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failed'));
      
      await expect(robustFetch('https://example.com')).rejects.toThrow(NetworkError);
      
      // HTTPエラーのテスト
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      await expect(robustFetch('https://example.com')).rejects.toThrow(HTTPError);
      
      // パースエラーのテスト
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });
      
      await expect(robustFetch('https://example.com')).rejects.toThrow(ParseError);
    });

    it('should provide appropriate error information', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      try {
        await robustFetch('https://example.com');
      } catch (error) {
        expect(error).toBeInstanceOf(HTTPError);
        expect((error as HTTPError).status).toBe(404);
      }
    });
  });

  describe('並列実行 vs 順次実行', () => {
    it('should handle parallel execution efficiently', async () => {
      const mockResponses = [
        { id: 1, name: 'John', email: 'john@example.com' },
        [{ id: 1, userId: 1, title: 'Post 1' }],
        [{ id: 1, postId: 1, name: 'Comment 1', body: 'Great post!' }]
      ];
      
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        const response = mockResponses[callCount++];
        return Promise.resolve({
          ok: true,
          json: async () => response
        });
      });

      const startTime = Date.now();
      const result = await fetchUserDashboard(1);
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(result.user.name).toBe('John');
      expect(result.posts).toHaveLength(1);
      expect(result.stats.postsCount).toBe(1);
      expect(result.stats.commentsCount).toBe(1);
      
      // 並列実行により、実行時間が短縮されることを確認
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('リトライ機能', () => {
    it('should retry failed operations', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('Success');

      const result = await withRetry(operation, {
        maxRetries: 3,
        baseDelay: 10,
        maxDelay: 100,
        backoffFactor: 2
      });

      expect(result).toBe('Success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        withRetry(operation, {
          maxRetries: 2,
          baseDelay: 10,
          maxDelay: 100,
          backoffFactor: 2
        })
      ).rejects.toThrow('Operation failed after 3 attempts');

      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('タイムアウト処理', () => {
    it('should timeout long-running operations', async () => {
      const longOperation = new Promise(resolve => setTimeout(resolve, 1000));
      
      await expect(
        withTimeout(longOperation, 100)
      ).rejects.toThrow('Operation timed out after 100ms');
    });

    it('should complete fast operations before timeout', async () => {
      const fastOperation = Promise.resolve('Fast result');
      
      const result = await withTimeout(fastOperation, 1000);
      expect(result).toBe('Fast result');
    });
  });

  describe('バッチ処理', () => {
    it('should process batches with controlled concurrency', async () => {
      const processor = new BatchProcessor<number, string>({
        concurrency: 2,
        maxRetries: 1,
        retryDelay: 10
      });

      const tasks = Array.from({ length: 5 }, (_, i) => ({
        id: `task-${i}`,
        data: i
      }));

      const mockProcessor = jest.fn().mockImplementation(async (data: number) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return `Result-${data}`;
      });

      const results = await processor.processBatch(tasks, mockProcessor);
      
      expect(results).toHaveLength(5);
      expect(results.every(r => r.success)).toBe(true);
      expect(mockProcessor).toHaveBeenCalledTimes(5);
    });

    it('should handle task failures and retries', async () => {
      const processor = new BatchProcessor<number, string>({
        concurrency: 1,
        maxRetries: 2,
        retryDelay: 10
      });

      const tasks = [
        { id: 'task-1', data: 1 },
        { id: 'task-2', data: 2 }
      ];

      const mockProcessor = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt fails'))
        .mockResolvedValueOnce('Success on retry')
        .mockResolvedValueOnce('Success');

      const results = await processor.processBatch(tasks, mockProcessor);
      
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].retries).toBe(1);
      expect(results[1].success).toBe(true);
    });
  });

  describe('リアルタイムストリーム処理', () => {
    it('should process stream data continuously', async () => {
      let messageCount = 0;
      const mockDataSource = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        messageCount++;
        return {
          timestamp: Date.now(),
          value: Math.random() * 100,
          type: 'metric' as const
        };
      });

      const mockProcessor = jest.fn().mockResolvedValue(undefined);

      const streamProcessor = new RealTimeStreamProcessor(
        mockDataSource,
        mockProcessor
      );

      // 100ms間実行
      const streamPromise = streamProcessor.start();
      setTimeout(() => streamProcessor.stop(), 100);
      
      await streamPromise;

      const stats = streamProcessor.getStats();
      
      expect(stats.totalMessages).toBeGreaterThan(0);
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
      expect(mockDataSource).toHaveBeenCalled();
      expect(mockProcessor).toHaveBeenCalled();
    });

    it('should handle stream processing errors', async () => {
      let callCount = 0;
      const mockDataSource = jest.fn().mockImplementation(async () => {
        callCount++;
        if (callCount % 3 === 0) {
          throw new Error('Simulated error');
        }
        return {
          timestamp: Date.now(),
          value: Math.random(),
          type: 'metric' as const
        };
      });

      const mockProcessor = jest.fn().mockResolvedValue(undefined);

      const streamProcessor = new RealTimeStreamProcessor(
        mockDataSource,
        mockProcessor
      );

      // 100ms間実行
      const streamPromise = streamProcessor.start();
      setTimeout(() => streamProcessor.stop(), 100);
      
      await streamPromise;

      const stats = streamProcessor.getStats();
      
      expect(stats.errors).toBeGreaterThan(0);
      expect(stats.totalMessages).toBeGreaterThan(0);
    });
  });

  describe('非同期イテレーター', () => {
    it('should process batched data efficiently', async () => {
      const items = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      let processedCount = 0;

      const result = await processBatch(
        items,
        async (item) => {
          processedCount++;
          return `Processed: ${item.name}`;
        },
        10,  // batch size
        3    // concurrency
      );

      expect(result).toHaveLength(50);
      expect(processedCount).toBe(50);
      expect(result[0]).toBe('Processed: Item 0');
    });
  });

  describe('統合テスト', () => {
    it('should run demonstration without errors', async () => {
      // コンソール出力をキャプチャ
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await expect(demonstrateAsyncAwait()).resolves.not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('モック関数のテスト', () => {
    it('should create realistic mock data sources', async () => {
      const dataSource = createMockDataSource();
      const data = await dataSource();
      
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('value');
      expect(data).toHaveProperty('type');
      expect(['metric', 'event', 'alert']).toContain(data.type);
    });

    it('should create working mock processors', async () => {
      const processor = createMockProcessor();
      const mockData = {
        timestamp: Date.now(),
        value: 75,
        type: 'alert' as const
      };

      // アラートデータの場合、コンソール出力があることを確認
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await expect(processor(mockData)).resolves.not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('ALERT'));
      
      consoleSpy.mockRestore();
    });
  });
});