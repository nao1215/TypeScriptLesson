/**
 * Lesson 50: Web APIとデータフェッチ (Web APIs & Data Fetching)
 * 
 * 型安全なAPIクライアント、GraphQLクライアント、キャッシュ戦略、
 * オフラインサポート、エラーハンドリングの実装
 */

// =============================================================================
// 型定義
// =============================================================================

// 基本的なAPIレスポンス型
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

// ページネーション付きレスポンス
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// HTTPメソッド
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// リクエストオプション
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  auth?: boolean;
}

// キャッシュエントリ
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// GraphQL関連型
export interface GraphQLQuery<TVariables = Record<string, unknown>> {
  query: string;
  variables?: TVariables;
  operationName?: string;
}

export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, unknown>;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

// ネットワーク状態
export interface NetworkState {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
}

// サンプルデータ型
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface UserWithPosts extends User {
  posts: Post[];
}

// =============================================================================
// HTTP クライアント
// =============================================================================

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(baseURL: string, options: {
    timeout?: number;
    defaultHeaders?: Record<string, string>;
  } = {}) {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.timeout = options.timeout ?? 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.defaultHeaders,
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method ?? 'GET';
    
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // リクエストボディの処理
    let body: string | undefined;
    if (options.body && method !== 'GET') {
      body = JSON.stringify(options.body);
    }

    // AbortController でタイムアウト制御
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new HttpError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpError('Request timeout', 408, 'Request Timeout');
      }
      
      throw error;
    }
  }

  public async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: data });
  }

  public async put<T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }

  public async patch<T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: data });
  }

  public async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// =============================================================================
// エラークラス
// =============================================================================

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}

// =============================================================================
// キャッシュシステム
// =============================================================================

export class DataCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL: number;

  constructor(defaultTTL = 300000) { // 5分
    this.defaultTTL = defaultTTL;
  }

  public set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    };
    
    this.cache.set(key, entry);
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // TTLチェック
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public cleanup(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  public size(): number {
    return this.cache.size;
  }
}

// =============================================================================
// リトライロジック
// =============================================================================

export class RetryPolicy {
  constructor(
    public maxRetries: number = 3,
    public baseDelay: number = 1000,
    public maxDelay: number = 30000,
    public backoffFactor: number = 2,
    public retryCondition: (error: Error) => boolean = () => true
  ) {}

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // 最後の試行の場合、エラーを投げる
        if (attempt === this.maxRetries) {
          break;
        }

        // リトライ条件をチェック
        if (!this.retryCondition(lastError)) {
          break;
        }

        // 指数バックオフによる遅延
        const delay = Math.min(
          this.baseDelay * Math.pow(this.backoffFactor, attempt),
          this.maxDelay
        );

        // ジッターを追加（±25%）
        const jitter = delay * 0.25 * (Math.random() - 0.5);
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }

    throw lastError!;
  }
}

// =============================================================================
// API クライアント
// =============================================================================

export class ApiClient {
  private httpClient: HttpClient;
  private cache: DataCache;
  private retryPolicy: RetryPolicy;

  constructor(
    baseURL: string, 
    options: {
      timeout?: number;
      cacheTimeout?: number;
      retryPolicy?: RetryPolicy;
      defaultHeaders?: Record<string, string>;
    } = {}
  ) {
    this.httpClient = new HttpClient(baseURL, {
      timeout: options.timeout,
      defaultHeaders: options.defaultHeaders,
    });
    
    this.cache = new DataCache(options.cacheTimeout);
    
    this.retryPolicy = options.retryPolicy ?? new RetryPolicy(
      3, 
      1000, 
      30000, 
      2, 
      (error: Error) => {
        // 一時的なエラーのみリトライ
        if (error instanceof HttpError) {
          return error.status >= 500 || error.status === 429 || error.status === 408;
        }
        return true;
      }
    );
  }

  public async get<T>(endpoint: string, options?: {
    useCache?: boolean;
    cacheTTL?: number;
  }): Promise<ApiResponse<T>> {
    const cacheKey = `GET:${endpoint}`;
    
    // キャッシュからの取得を試行
    if (options?.useCache !== false) {
      const cached = this.cache.get<ApiResponse<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // APIリクエストの実行
    const response = await this.retryPolicy.execute(async () => {
      return await this.httpClient.get<ApiResponse<T>>(endpoint);
    });

    // キャッシュに保存
    if (options?.useCache !== false) {
      this.cache.set(cacheKey, response, options?.cacheTTL);
    }

    return response;
  }

  public async getCached<T>(endpoint: string, ttl?: number): Promise<ApiResponse<T>> {
    return this.get<T>(endpoint, { useCache: true, cacheTTL: ttl });
  }

  public async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.retryPolicy.execute(async () => {
      return await this.httpClient.post<ApiResponse<T>>(endpoint, data);
    });
  }

  public async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.retryPolicy.execute(async () => {
      return await this.httpClient.put<ApiResponse<T>>(endpoint, data);
    });
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.retryPolicy.execute(async () => {
      return await this.httpClient.delete<ApiResponse<T>>(endpoint);
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size();
  }
}

// =============================================================================
// GraphQL クライアント
// =============================================================================

export class GraphQLClient {
  private httpClient: HttpClient;
  private endpoint: string;

  constructor(endpoint: string, options: {
    timeout?: number;
    defaultHeaders?: Record<string, string>;
  } = {}) {
    this.endpoint = endpoint;
    this.httpClient = new HttpClient('', {
      timeout: options.timeout,
      defaultHeaders: {
        'Content-Type': 'application/json',
        ...options.defaultHeaders,
      },
    });
  }

  public async query<T, V = Record<string, unknown>>(
    query: GraphQLQuery<V>
  ): Promise<GraphQLResponse<T>> {
    try {
      const response = await this.httpClient.post<GraphQLResponse<T>>(
        this.endpoint,
        query
      );

      if (response.errors && response.errors.length > 0) {
        throw new GraphQLClientError(
          'GraphQL errors occurred',
          response.errors
        );
      }

      return response;
    } catch (error) {
      if (error instanceof GraphQLClientError) {
        throw error;
      }
      
      throw new GraphQLClientError(
        'Failed to execute GraphQL query',
        [],
        error as Error
      );
    }
  }

  public async mutate<T, V = Record<string, unknown>>(
    mutation: GraphQLQuery<V>
  ): Promise<GraphQLResponse<T>> {
    return this.query<T, V>(mutation);
  }
}

export class GraphQLClientError extends Error {
  constructor(
    message: string,
    public graphqlErrors: GraphQLError[],
    public originalError?: Error
  ) {
    super(message);
    this.name = 'GraphQLClientError';
  }
}

// =============================================================================
// ネットワーク状態管理
// =============================================================================

export class NetworkMonitor {
  private listeners: ((state: NetworkState) => void)[] = [];
  private currentState: NetworkState;

  constructor() {
    this.currentState = {
      online: navigator.onLine,
      effectiveType: (navigator as any).connection?.effectiveType,
      downlink: (navigator as any).connection?.downlink,
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.updateState({ online: true });
    });

    window.addEventListener('offline', () => {
      this.updateState({ online: false });
    });

    // Network Information API（対応ブラウザのみ）
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.updateState({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
        });
      });
    }
  }

  private updateState(updates: Partial<NetworkState>): void {
    this.currentState = { ...this.currentState, ...updates };
    this.listeners.forEach(listener => listener(this.currentState));
  }

  public getState(): NetworkState {
    return { ...this.currentState };
  }

  public isOnline(): boolean {
    return this.currentState.online;
  }

  public subscribe(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    
    // 購読解除関数を返す
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// =============================================================================
// オフライン対応データマネージャー
// =============================================================================

export class OfflineDataManager {
  private apiClient: ApiClient;
  private networkMonitor: NetworkMonitor;
  private pendingOperations: Map<string, unknown> = new Map();

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.networkMonitor = new NetworkMonitor();
    
    // オンライン復帰時の処理
    this.networkMonitor.subscribe((state) => {
      if (state.online && this.pendingOperations.size > 0) {
        this.syncPendingOperations();
      }
    });
  }

  public async getWithFallback<T>(
    endpoint: string,
    fallbackData?: T
  ): Promise<ApiResponse<T> | T> {
    try {
      // オンラインの場合はAPIから取得
      if (this.networkMonitor.isOnline()) {
        return await this.apiClient.getCached<T>(endpoint);
      }
      
      // オフラインの場合はキャッシュまたはフォールバックデータを使用
      const cacheKey = `GET:${endpoint}`;
      const cached = this.apiClient['cache'].get<ApiResponse<T>>(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      
      throw new Error('No data available offline');
    } catch (error) {
      // エラーの場合もフォールバックデータを試行
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw error;
    }
  }

  public async optimisticUpdate<T>(
    endpoint: string,
    data: unknown,
    optimisticData: T
  ): Promise<T> {
    const operationId = `${Date.now()}-${Math.random()}`;
    
    try {
      // 楽観的更新：即座にUIに反映
      if (this.networkMonitor.isOnline()) {
        // オンラインの場合は即座に送信
        const response = await this.apiClient.post<T>(endpoint, data);
        return response.data;
      } else {
        // オフラインの場合は保留操作として記録
        this.pendingOperations.set(operationId, {
          endpoint,
          data,
          timestamp: Date.now(),
          type: 'POST'
        });
        
        return optimisticData;
      }
    } catch (error) {
      // エラーの場合は保留操作として記録
      this.pendingOperations.set(operationId, {
        endpoint,
        data,
        timestamp: Date.now(),
        type: 'POST',
        error: error as Error
      });
      
      // 楽観的データを返す（UIでは成功として表示）
      return optimisticData;
    }
  }

  private async syncPendingOperations(): Promise<void> {
    const operations = Array.from(this.pendingOperations.entries());
    const results: Array<{ id: string; success: boolean; error?: Error }> = [];

    for (const [id, operation] of operations) {
      try {
        const op = operation as any;
        await this.apiClient.post(op.endpoint, op.data);
        results.push({ id, success: true });
        this.pendingOperations.delete(id);
      } catch (error) {
        results.push({ id, success: false, error: error as Error });
      }
    }

    // 同期結果をログ出力（実際のアプリではイベントとして通知）
    console.log('Sync completed:', results);
  }

  public getPendingOperationsCount(): number {
    return this.pendingOperations.size;
  }

  public isOnline(): boolean {
    return this.networkMonitor.isOnline();
  }
}

// =============================================================================
// 使用例
// =============================================================================

export async function demonstrateApiUsage(): Promise<void> {
  console.log('=== Web API とデータフェッチのデモンストレーション ===\n');

  try {
    // API クライアントの作成
    const apiClient = new ApiClient('https://jsonplaceholder.typicode.com', {
      timeout: 5000,
      cacheTimeout: 300000, // 5分
    });

    console.log('1. RESTful API クライアントのデモ');
    
    // ユーザー一覧の取得（キャッシュあり）
    const usersResponse = await apiClient.getCached<User[]>('/users');
    console.log(`ユーザー数: ${usersResponse.data.length}`);
    console.log('キャッシュサイズ:', apiClient.getCacheSize());

    // GraphQL クライアントのデモ
    console.log('\n2. GraphQL クライアントのデモ');
    
    const graphqlClient = new GraphQLClient('https://api.github.com/graphql', {
      defaultHeaders: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // 実際のトークンが必要
      }
    });

    // 注意: 実際のGitHub APIトークンなしでは実行されません
    try {
      const query = {
        query: `
          query {
            viewer {
              login
              name
              email
            }
          }
        `
      };
      
      const result = await graphqlClient.query<{ viewer: User }>(query);
      console.log('GraphQL結果:', result.data?.viewer);
    } catch (error) {
      console.log('GraphQL エラー (トークンが必要):', (error as Error).message);
    }

    // オフライン対応のデモ
    console.log('\n3. オフライン対応データマネージャーのデモ');
    
    const offlineManager = new OfflineDataManager(apiClient);
    
    // フォールバックデータを使った取得
    const fallbackData: User[] = [
      {
        id: '1',
        name: 'Offline User',
        email: 'offline@example.com',
        createdAt: new Date().toISOString()
      }
    ];
    
    const dataWithFallback = await offlineManager.getWithFallback<User[]>(
      '/users',
      fallbackData
    );
    
    console.log('オンライン状態:', offlineManager.isOnline());
    console.log('取得データ:', Array.isArray(dataWithFallback) ? 
      `${dataWithFallback.length} users` : 'API Response');

    // 楽観的更新のデモ
    const optimisticUser: User = {
      id: '999',
      name: 'Optimistic User',
      email: 'optimistic@example.com',
      createdAt: new Date().toISOString()
    };

    const createdUser = await offlineManager.optimisticUpdate<User>(
      '/users',
      { name: optimisticUser.name, email: optimisticUser.email },
      optimisticUser
    );
    
    console.log('楽観的更新結果:', createdUser.name);
    console.log('保留操作数:', offlineManager.getPendingOperationsCount());

  } catch (error) {
    console.error('デモ実行エラー:', (error as Error).message);
  }
}

// デモの実行
if (typeof window === 'undefined') {
  // Node.js環境での実行
  demonstrateApiUsage();
}