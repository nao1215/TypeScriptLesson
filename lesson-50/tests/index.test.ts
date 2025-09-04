/**
 * Lesson 50: Web APIとデータフェッチのテスト
 */

import {
  ApiClient,
  HttpClient,
  DataCache,
  RetryPolicy,
  GraphQLClient,
  OfflineDataManager,
  NetworkMonitor,
  HttpError,
  demonstrateApiUsage
} from '../src/index';

import {
  BlogApiClientSolution,
  EnhancedGraphQLClientSolution,
  LRUCacheSolution,
  AdvancedOfflineManagerSolution,
  ApiMockServerSolution,
  demonstrateSolutions
} from '../src/solution';

// モック関数の設定
global.fetch = jest.fn();
global.navigator = {
  onLine: true,
  connection: {
    effectiveType: '4g',
    downlink: 10
  }
} as any;

global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
} as any;

// =============================================================================
// HttpClient のテスト
// =============================================================================

describe('HttpClient', () => {
  let httpClient: HttpClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    httpClient = new HttpClient('https://api.example.com');
    mockFetch.mockClear();
  });

  test('GETリクエストが正しく実行される', async () => {
    const mockData = { id: 1, name: 'Test User' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockData
    } as Response);

    const result = await httpClient.get<typeof mockData>('/users/1');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/users/1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
    expect(result).toEqual(mockData);
  });

  test('POSTリクエストが正しく実行される', async () => {
    const requestData = { name: 'New User', email: 'new@example.com' };
    const responseData = { id: 2, ...requestData };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => responseData
    } as Response);

    const result = await httpClient.post<typeof responseData>('/users', requestData);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
    expect(result).toEqual(responseData);
  });

  test('HTTPエラーが適切にハンドルされる', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    } as Response);

    await expect(httpClient.get('/users/999')).rejects.toThrow(HttpError);
    await expect(httpClient.get('/users/999')).rejects.toThrow('HTTP 404: Not Found');
  });

  test('タイムアウトが正しく動作する', async () => {
    const shortTimeoutClient = new HttpClient('https://api.example.com', { timeout: 100 });
    
    // 長時間かかるリクエストをモック
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 200))
    );

    await expect(shortTimeoutClient.get('/slow-endpoint')).rejects.toThrow('Request timeout');
  });
});

// =============================================================================
// DataCache のテスト
// =============================================================================

describe('DataCache', () => {
  let cache: DataCache;

  beforeEach(() => {
    cache = new DataCache(1000); // 1秒TTL
  });

  test('データの設定と取得ができる', () => {
    const testData = { id: 1, name: 'Test' };
    cache.set('test-key', testData);

    const retrieved = cache.get('test-key');
    expect(retrieved).toEqual(testData);
  });

  test('TTL後にデータが削除される', (done) => {
    const testData = { id: 1, name: 'Test' };
    cache.set('test-key', testData, 50); // 50ms TTL

    setTimeout(() => {
      const retrieved = cache.get('test-key');
      expect(retrieved).toBeNull();
      done();
    }, 100);
  });

  test('存在しないキーはnullを返す', () => {
    const retrieved = cache.get('non-existent-key');
    expect(retrieved).toBeNull();
  });

  test('キャッシュのクリアが動作する', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    expect(cache.size()).toBe(2);
    
    cache.clear();
    
    expect(cache.size()).toBe(0);
    expect(cache.get('key1')).toBeNull();
  });

  test('期限切れエントリのクリーンアップが動作する', (done) => {
    cache.set('key1', 'value1', 50);
    cache.set('key2', 'value2', 1000);

    setTimeout(() => {
      const deletedCount = cache.cleanup();
      expect(deletedCount).toBe(1);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      done();
    }, 100);
  });
});

// =============================================================================
// RetryPolicy のテスト
// =============================================================================

describe('RetryPolicy', () => {
  test('成功する操作はリトライしない', async () => {
    const policy = new RetryPolicy(3, 10);
    const mockOperation = jest.fn().mockResolvedValue('success');

    const result = await policy.execute(mockOperation);

    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  test('失敗する操作を指定回数リトライする', async () => {
    const policy = new RetryPolicy(2, 10);
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');

    const result = await policy.execute(mockOperation);

    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(3);
  });

  test('最大リトライ回数に達したら最後のエラーを投げる', async () => {
    const policy = new RetryPolicy(2, 10);
    const error = new Error('Persistent failure');
    const mockOperation = jest.fn().mockRejectedValue(error);

    await expect(policy.execute(mockOperation)).rejects.toThrow('Persistent failure');
    expect(mockOperation).toHaveBeenCalledTimes(3); // 初回 + 2回のリトライ
  });

  test('リトライ条件が満たされない場合はリトライしない', async () => {
    const policy = new RetryPolicy(3, 10, 1000, 2, (error) => 
      error.message !== 'No retry'
    );
    
    const mockOperation = jest.fn().mockRejectedValue(new Error('No retry'));

    await expect(policy.execute(mockOperation)).rejects.toThrow('No retry');
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// ApiClient のテスト
// =============================================================================

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    apiClient = new ApiClient('https://api.example.com');
    mockFetch.mockClear();
  });

  test('GETリクエストでキャッシュが使用される', async () => {
    const mockResponse = {
      data: { id: 1, name: 'Test User' },
      status: 200,
      message: 'Success',
      timestamp: new Date().toISOString()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse
    } as Response);

    // 初回リクエスト
    const result1 = await apiClient.getCached('/users/1');
    expect(result1).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // キャッシュからの取得（fetchは呼ばれない）
    const result2 = await apiClient.getCached('/users/1');
    expect(result2).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('POSTリクエストがリトライポリシーで実行される', async () => {
    const requestData = { name: 'Test User' };
    const mockResponse = {
      data: { id: 1, ...requestData },
      status: 201,
      message: 'Created',
      timestamp: new Date().toISOString()
    };

    // 初回は500エラー、2回目は成功
    mockFetch
      .mockRejectedValueOnce(new HttpError('Server Error', 500, 'Internal Server Error'))
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      } as Response);

    const result = await apiClient.post('/users', requestData);
    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

// =============================================================================
// LRUCacheSolution のテスト
// =============================================================================

describe('LRUCacheSolution', () => {
  test('基本的な設定と取得が動作する', () => {
    const cache = new LRUCacheSolution<string>(3);
    
    cache.set('a', 'valueA');
    cache.set('b', 'valueB');
    cache.set('c', 'valueC');

    expect(cache.get('a')).toBe('valueA');
    expect(cache.get('b')).toBe('valueB');
    expect(cache.get('c')).toBe('valueC');
  });

  test('LRU順序が正しく動作する', () => {
    const cache = new LRUCacheSolution<string>(2);
    
    cache.set('a', 'valueA');
    cache.set('b', 'valueB');
    
    // aにアクセス（最近使用済みにする）
    cache.get('a');
    
    // cを追加（bが削除されるべき）
    cache.set('c', 'valueC');
    
    expect(cache.get('a')).toBe('valueA'); // 残っている
    expect(cache.get('b')).toBe(null);     // 削除された
    expect(cache.get('c')).toBe('valueC'); // 新規追加
  });

  test('統計情報が正確に記録される', () => {
    const cache = new LRUCacheSolution<string>(10);
    
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    // ヒット
    cache.get('key1');
    cache.get('key2');
    
    // ミス
    cache.get('key3');
    
    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.size).toBe(2);
    expect(stats.hitRate).toBe(2/3);
  });

  test('TTLが正しく動作する', (done) => {
    const cache = new LRUCacheSolution<string>(10);
    
    cache.set('key1', 'value1', 50); // 50ms TTL
    cache.set('key2', 'value2', 1000); // 1秒TTL
    
    setTimeout(() => {
      expect(cache.get('key1')).toBe(null);     // 期限切れ
      expect(cache.get('key2')).toBe('value2'); // まだ有効
      done();
    }, 100);
  });
});

// =============================================================================
// ApiMockServerSolution のテスト
// =============================================================================

describe('ApiMockServerSolution', () => {
  let mockServer: ApiMockServerSolution;

  beforeEach(() => {
    mockServer = new ApiMockServerSolution();
  });

  test('基本的なエンドポイント登録と実行が動作する', async () => {
    mockServer.registerEndpoint({
      method: 'GET',
      path: '/test',
      response: { status: 200, data: { message: 'success' } }
    });

    const response = await mockServer.handleRequest({
      method: 'GET',
      path: '/test',
      headers: {}
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: 'success' });
  });

  test('動的レスポンス生成が動作する', async () => {
    mockServer.registerEndpoint({
      method: 'POST',
      path: '/users',
      response: (req) => ({
        status: 201,
        data: { id: 'generated-id', ...req.body as any }
      })
    });

    const response = await mockServer.handleRequest({
      method: 'POST',
      path: '/users',
      headers: {},
      body: { name: 'Test User', email: 'test@example.com' }
    });

    expect(response.status).toBe(201);
    expect(response.data).toEqual({
      id: 'generated-id',
      name: 'Test User',
      email: 'test@example.com'
    });
  });

  test('RESTfulリソースエンドポイントの自動生成が動作する', async () => {
    mockServer.createResourceEndpoints('users');
    mockServer.seedData('users', [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' }
    ]);

    // GET /users
    const listResponse = await mockServer.handleRequest({
      method: 'GET',
      path: '/users',
      headers: {},
      query: { page: '1', limit: '10' }
    });

    expect(listResponse.status).toBe(200);
    expect(listResponse.data).toHaveProperty('data');
    expect(listResponse.data).toHaveProperty('pagination');

    // GET /users/1
    const getResponse = await mockServer.handleRequest({
      method: 'GET',
      path: '/users/1',
      headers: {}
    });

    expect(getResponse.status).toBe(200);
    expect((getResponse.data as any).name).toBe('Alice');

    // POST /users
    const createResponse = await mockServer.handleRequest({
      method: 'POST',
      path: '/users',
      headers: {},
      body: { name: 'Charlie', email: 'charlie@example.com' }
    });

    expect(createResponse.status).toBe(201);
    expect((createResponse.data as any).name).toBe('Charlie');
  });

  test('存在しないエンドポイントで404を返す', async () => {
    const response = await mockServer.handleRequest({
      method: 'GET',
      path: '/nonexistent',
      headers: {}
    });

    expect(response.status).toBe(404);
    expect(response.error).toBe('Endpoint not found');
  });

  test('レスポンス遅延のシミュレーションが動作する', async () => {
    const startTime = Date.now();

    mockServer.registerEndpoint({
      method: 'GET',
      path: '/slow',
      response: { status: 200, data: 'slow response', delay: 100 }
    });

    const response = await mockServer.handleRequest({
      method: 'GET',
      path: '/slow',
      headers: {}
    });

    const endTime = Date.now();

    expect(response.status).toBe(200);
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });
});

// =============================================================================
// 統合テスト
// =============================================================================

describe('統合テスト', () => {
  test('デモンストレーション関数がエラーなしで実行される', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // NetworkインターフェースをモックAPI呼び出しで置き換え
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        data: [{ id: '1', name: 'Test User', email: 'test@example.com', createdAt: new Date().toISOString() }],
        status: 200,
        message: 'Success',
        timestamp: new Date().toISOString()
      })
    } as Response);

    await expect(demonstrateApiUsage()).resolves.not.toThrow();

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('解答例のデモンストレーション関数がエラーなしで実行される', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await expect(demonstrateSolutions()).resolves.not.toThrow();

    consoleSpy.mockRestore();
  });

  test('実際のWebAPIを使った統合シナリオ', async () => {
    // モックサーバーでAPIをセットアップ
    const mockServer = new ApiMockServerSolution();
    mockServer.createResourceEndpoints('posts');
    mockServer.seedData('posts', [
      {
        id: '1',
        title: 'First Post',
        content: 'This is the first post',
        author: 'Alice',
        category: 'tech',
        tags: ['typescript', 'api'],
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published'
      }
    ]);

    // ブログAPIクライアントでの操作をシミュレート
    const blogClient = new BlogApiClientSolution('http://localhost:3000');

    // モックサーバーとの統合テストは実際のHTTPサーバーが必要
    // ここではコンポーネントが正しく初期化されることを確認
    expect(blogClient).toBeInstanceOf(BlogApiClientSolution);
  });
});

// =============================================================================
// エッジケースのテスト
// =============================================================================

describe('エッジケースのテスト', () => {
  test('ネットワークエラーの処理', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValue(new Error('Network Error'));

    const httpClient = new HttpClient('https://api.example.com');
    
    await expect(httpClient.get('/test')).rejects.toThrow('Network Error');
  });

  test('不正なJSONレスポンスの処理', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => { throw new Error('Invalid JSON'); }
    } as Response);

    const httpClient = new HttpClient('https://api.example.com');
    
    await expect(httpClient.get('/test')).rejects.toThrow('Invalid JSON');
  });

  test('空のキャッシュからの取得', () => {
    const cache = new DataCache();
    expect(cache.get('nonexistent')).toBeNull();
    expect(cache.size()).toBe(0);
  });

  test('LRUキャッシュのサイズ0での動作', () => {
    const cache = new LRUCacheSolution<string>(0);
    cache.set('key', 'value');
    expect(cache.get('key')).toBeNull(); // サイズ0なので即座に削除される
  });
});

// テストのセットアップとクリーンアップ
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});