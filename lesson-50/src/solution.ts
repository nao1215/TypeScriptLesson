/**
 * Lesson 50: 解答例
 * Web APIとデータフェッチの実装解答
 */

import {
  ApiClient,
  GraphQLClient,
  HttpClient,
  DataCache,
  RetryPolicy,
  ApiResponse,
  GraphQLQuery,
  GraphQLResponse,
  PaginatedResponse,
  HttpError
} from './index';

// 演習で定義された型をインポート
interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
}

interface BlogPostCreateData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  status?: 'draft' | 'published';
}

interface BlogPostUpdateData extends Partial<BlogPostCreateData> {}

interface BlogPostFilters {
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  author?: string;
  search?: string;
}

interface BlogPostListParams {
  page?: number;
  limit?: number;
  filters?: BlogPostFilters;
  sortBy?: 'publishedAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// 解答1: ブログAPIクライアントの実装
// =============================================================================

export class BlogApiClientSolution {
  private apiClient: ApiClient;

  constructor(baseURL: string = 'https://api.blog.example.com') {
    this.apiClient = new ApiClient(baseURL, {
      timeout: 10000,
      cacheTimeout: 300000, // 5分
    });
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, String(item)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    return queryParams.toString();
  }

  async getPosts(params: BlogPostListParams = {}): Promise<PaginatedResponse<BlogPost>> {
    const {
      page = 1,
      limit = 10,
      filters = {},
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = params;

    const queryParams = {
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters
    };

    const queryString = this.buildQueryString(queryParams);
    const endpoint = `/posts${queryString ? `?${queryString}` : ''}`;

    const response = await this.apiClient.getCached<PaginatedResponse<BlogPost>>(endpoint);
    return response.data;
  }

  async getPost(id: string): Promise<ApiResponse<BlogPost>> {
    return await this.apiClient.getCached<BlogPost>(`/posts/${id}`);
  }

  async createPost(data: BlogPostCreateData): Promise<ApiResponse<BlogPost>> {
    const postData = {
      ...data,
      status: data.status ?? 'draft',
      publishedAt: data.status === 'published' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    return await this.apiClient.post<BlogPost>('/posts', postData);
  }

  async updatePost(id: string, data: BlogPostUpdateData): Promise<ApiResponse<BlogPost>> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    return await this.apiClient.put<BlogPost>(`/posts/${id}`, updateData);
  }

  async deletePost(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return await this.apiClient.delete<{ deleted: boolean }>(`/posts/${id}`);
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    return await this.apiClient.getCached<string[]>('/categories');
  }

  async getPopularTags(limit: number = 20): Promise<ApiResponse<{ tag: string; count: number }[]>> {
    const endpoint = `/tags/popular${limit ? `?limit=${limit}` : ''}`;
    return await this.apiClient.getCached<{ tag: string; count: number }[]>(endpoint);
  }

  // 追加機能: 検索とオートコンプリート
  async searchPosts(query: string, options: {
    limit?: number;
    includeContent?: boolean;
  } = {}): Promise<ApiResponse<BlogPost[]>> {
    const { limit = 10, includeContent = false } = options;
    const queryParams = this.buildQueryString({ q: query, limit, includeContent });
    const endpoint = `/posts/search?${queryParams}`;

    return await this.apiClient.getCached<BlogPost[]>(endpoint, 60000); // 1分キャッシュ
  }

  async getRelatedPosts(postId: string, limit: number = 5): Promise<ApiResponse<BlogPost[]>> {
    return await this.apiClient.getCached<BlogPost[]>(`/posts/${postId}/related?limit=${limit}`);
  }
}

// =============================================================================
// 解答2: 拡張GraphQLクライアントの実装
// =============================================================================

interface BatchQuery {
  id: string;
  query: GraphQLQuery;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
}

export class EnhancedGraphQLClientSolution {
  private client: GraphQLClient;
  private cache: DataCache;
  private batchQueue: Map<string, BatchQuery[]> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  private pendingQueries: Map<string, Promise<any>> = new Map();

  constructor(endpoint: string, options: {
    timeout?: number;
    batchTimeout?: number;
    cacheTimeout?: number;
  } = {}) {
    this.client = new GraphQLClient(endpoint, {
      timeout: options.timeout,
    });
    this.cache = new DataCache(options.cacheTimeout);
  }

  private getBatchKey(query: GraphQLQuery): string {
    return JSON.stringify({ query: query.query, variables: query.variables });
  }

  private getQueryKey(query: GraphQLQuery): string {
    return `query:${this.getBatchKey(query)}`;
  }

  async batchQuery<T>(queries: Array<{ id: string; query: GraphQLQuery }>): Promise<Record<string, T>> {
    const results: Record<string, T> = {};
    const promises: Array<Promise<void>> = [];

    queries.forEach(({ id, query }) => {
      const promise = this.query<T>(query).then(result => {
        results[id] = result.data!;
      });
      promises.push(promise);
    });

    await Promise.all(promises);
    return results;
  }

  async deduplicatedQuery<T>(queryKey: string, query: GraphQLQuery): Promise<T> {
    // キャッシュから確認
    const cached = this.cache.get<T>(queryKey);
    if (cached) {
      return cached;
    }

    // 既に同じクエリが進行中かチェック
    const pending = this.pendingQueries.get(queryKey);
    if (pending) {
      return await pending;
    }

    // 新しいクエリを実行
    const queryPromise = this.executeQuery<T>(query);
    this.pendingQueries.set(queryKey, queryPromise);

    try {
      const result = await queryPromise;
      this.cache.set(queryKey, result, 300000); // 5分キャッシュ
      return result;
    } finally {
      this.pendingQueries.delete(queryKey);
    }
  }

  private async executeQuery<T>(query: GraphQLQuery): Promise<T> {
    const response = await this.client.query<T>(query);
    if (!response.data) {
      throw new Error('No data returned from GraphQL query');
    }
    return response.data;
  }

  async query<T>(query: GraphQLQuery): Promise<GraphQLResponse<T>> {
    const queryKey = this.getQueryKey(query);
    
    try {
      const data = await this.deduplicatedQuery<T>(queryKey, query);
      return { data };
    } catch (error) {
      return { errors: [{ message: (error as Error).message }] };
    }
  }

  // WebSocketベースのサブスクリプション（簡易版）
  async *subscribe<T>(subscription: GraphQLQuery): AsyncIterableIterator<T> {
    // 実際の実装ではWebSocketを使用
    // ここでは簡易的なポーリング実装
    const pollInterval = 1000; // 1秒
    let isSubscribed = true;

    while (isSubscribed) {
      try {
        const result = await this.client.query<T>(subscription);
        if (result.data) {
          yield result.data;
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Subscription error:', error);
        break;
      }
    }
  }

  // サブスクリプション停止（実際にはWebSocketのclose処理）
  unsubscribe(): void {
    // WebSocketの切断処理をここに実装
    console.log('Subscription stopped');
  }
}

// =============================================================================
// 解答3: LRUキャッシュの実装
// =============================================================================

interface CacheNode<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  prev: CacheNode<T> | null;
  next: CacheNode<T> | null;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

export class LRUCacheSolution<T> {
  private cache: Map<string, CacheNode<T>> = new Map();
  private head: CacheNode<T> | null = null;
  private tail: CacheNode<T> | null = null;
  private maxSize: number;
  private hits = 0;
  private misses = 0;
  private defaultTTL: number;

  constructor(maxSize: number = 100, defaultTTL: number = 300000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const nodeTTL = ttl ?? this.defaultTTL;

    // 既存のノードを更新
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      node.value = value;
      node.timestamp = now;
      node.ttl = nodeTTL;
      this.moveToHead(node);
      this.syncWithLocalStorage();
      return;
    }

    // 新しいノードを作成
    const newNode: CacheNode<T> = {
      key,
      value,
      timestamp: now,
      ttl: nodeTTL,
      prev: null,
      next: null
    };

    this.cache.set(key, newNode);
    this.addToHead(newNode);

    // サイズ制限チェック
    if (this.cache.size > this.maxSize) {
      const tail = this.removeTail();
      if (tail) {
        this.cache.delete(tail.key);
      }
    }

    this.syncWithLocalStorage();
  }

  get(key: string): T | null {
    const node = this.cache.get(key);
    
    if (!node) {
      this.misses++;
      return null;
    }

    // TTLチェック
    const now = Date.now();
    if (now - node.timestamp > node.ttl) {
      this.remove(node);
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // ヒット：最近使用したアイテムとして先頭に移動
    this.moveToHead(node);
    this.hits++;
    return node.value;
  }

  private addToHead(node: CacheNode<T>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: CacheNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private moveToHead(node: CacheNode<T>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): CacheNode<T> | null {
    const lastNode = this.tail;
    if (lastNode) {
      this.removeNode(lastNode);
    }
    return lastNode;
  }

  private remove(node: CacheNode<T>): void {
    this.removeNode(node);
  }

  getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0
    };
  }

  syncWithLocalStorage(): void {
    if (typeof localStorage === 'undefined') {
      return; // Node.js環境では無効
    }

    try {
      const cacheData: Record<string, { value: T; timestamp: number; ttl: number }> = {};
      
      for (const [key, node] of this.cache.entries()) {
        cacheData[key] = {
          value: node.value,
          timestamp: node.timestamp,
          ttl: node.ttl
        };
      }

      localStorage.setItem('lru-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to sync cache with localStorage:', error);
    }
  }

  loadFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const cacheData = localStorage.getItem('lru-cache');
      if (!cacheData) return;

      const parsed = JSON.parse(cacheData);
      const now = Date.now();

      Object.entries(parsed).forEach(([key, data]: [string, any]) => {
        // TTLチェック
        if (now - data.timestamp <= data.ttl) {
          this.set(key, data.value, data.ttl - (now - data.timestamp));
        }
      });
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.hits = 0;
    this.misses = 0;

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('lru-cache');
    }
  }
}

// =============================================================================
// 解答4: 高度なオフライン対応の実装
// =============================================================================

interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  data: unknown;
  timestamp: number;
  clientId: string;
  version: number;
}

interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  resolver?: (clientData: unknown, serverData: unknown) => unknown;
}

interface SyncStatus {
  pending: number;
  syncing: number;
  errors: number;
  lastSync: Date | null;
  conflicts: Array<{
    operation: SyncOperation;
    serverData: unknown;
    resolution: ConflictResolution;
  }>;
}

export class AdvancedOfflineManagerSolution {
  private operations: Map<string, SyncOperation> = new Map();
  private conflicts: Array<{ operation: SyncOperation; serverData: unknown; resolution: ConflictResolution }> = [];
  private clientId: string;
  private apiClient: ApiClient;
  private syncStatus: SyncStatus = {
    pending: 0,
    syncing: 0,
    errors: 0,
    lastSync: null,
    conflicts: []
  };
  private statusSubscribers: Array<(status: SyncStatus) => void> = [];

  constructor(apiClient: ApiClient, clientId?: string) {
    this.apiClient = apiClient;
    this.clientId = clientId ?? `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.loadOperationsFromStorage();
  }

  async recordOperation<T>(
    operation: Omit<SyncOperation, 'id' | 'clientId'>, 
    optimisticData: T
  ): Promise<T> {
    const operationId = `${this.clientId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullOperation: SyncOperation = {
      ...operation,
      id: operationId,
      clientId: this.clientId
    };

    this.operations.set(operationId, fullOperation);
    this.updateSyncStatus();
    this.saveOperationsToStorage();

    // オンラインの場合は即座に同期を試行
    if (navigator.onLine) {
      this.performDeltaSync();
    }

    return optimisticData;
  }

  async resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void> {
    const conflictIndex = this.conflicts.findIndex(c => 
      c.operation.id === conflictId
    );

    if (conflictIndex === -1) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    const conflict = this.conflicts[conflictIndex];
    let resolvedData: unknown;

    switch (resolution.strategy) {
      case 'client-wins':
        resolvedData = conflict.operation.data;
        break;
      case 'server-wins':
        resolvedData = conflict.serverData;
        break;
      case 'merge':
        if (resolution.resolver) {
          resolvedData = resolution.resolver(conflict.operation.data, conflict.serverData);
        } else {
          // デフォルトのマージ戦略（オブジェクトの場合）
          resolvedData = { ...conflict.serverData as any, ...conflict.operation.data as any };
        }
        break;
      case 'manual':
        // 手動解決は外部で処理される
        return;
    }

    // 解決されたデータでサーバーを更新
    try {
      await this.syncSingleOperation({
        ...conflict.operation,
        data: resolvedData
      });

      // 競合を削除
      this.conflicts.splice(conflictIndex, 1);
      this.updateSyncStatus();
    } catch (error) {
      throw new Error(`Failed to resolve conflict: ${(error as Error).message}`);
    }
  }

  async performDeltaSync(): Promise<SyncStatus> {
    if (!navigator.onLine) {
      return this.syncStatus;
    }

    this.syncStatus.syncing = this.operations.size;
    this.notifySubscribers();

    const syncResults = await Promise.allSettled(
      Array.from(this.operations.values()).map(op => this.syncSingleOperation(op))
    );

    let syncedCount = 0;
    let errorCount = 0;

    syncResults.forEach((result, index) => {
      const operation = Array.from(this.operations.values())[index];
      
      if (result.status === 'fulfilled') {
        this.operations.delete(operation.id);
        syncedCount++;
      } else {
        errorCount++;
        console.error(`Sync failed for operation ${operation.id}:`, result.reason);
      }
    });

    this.syncStatus.lastSync = new Date();
    this.syncStatus.syncing = 0;
    this.syncStatus.errors = errorCount;
    this.updateSyncStatus();
    this.saveOperationsToStorage();

    return this.syncStatus;
  }

  private async syncSingleOperation(operation: SyncOperation): Promise<void> {
    const endpoint = `/${operation.resource}`;
    
    try {
      switch (operation.type) {
        case 'CREATE':
          await this.apiClient.post(endpoint, operation.data);
          break;
        case 'UPDATE':
          await this.apiClient.put(`${endpoint}/${(operation.data as any).id}`, operation.data);
          break;
        case 'DELETE':
          await this.apiClient.delete(`${endpoint}/${(operation.data as any).id}`);
          break;
      }
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        // 競合エラー：サーバーデータを取得して競合として記録
        const serverData = await this.fetchServerData(operation);
        this.conflicts.push({
          operation,
          serverData,
          resolution: { strategy: 'manual' }
        });
      } else {
        throw error;
      }
    }
  }

  private async fetchServerData(operation: SyncOperation): Promise<unknown> {
    try {
      const response = await this.apiClient.get(`/${operation.resource}/${(operation.data as any).id}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch server data for conflict resolution:', error);
      return null;
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  subscribeSyncStatus(callback: (status: SyncStatus) => void): () => void {
    this.statusSubscribers.push(callback);
    
    return () => {
      const index = this.statusSubscribers.indexOf(callback);
      if (index > -1) {
        this.statusSubscribers.splice(index, 1);
      }
    };
  }

  private updateSyncStatus(): void {
    this.syncStatus.pending = this.operations.size;
    this.syncStatus.conflicts = [...this.conflicts];
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.statusSubscribers.forEach(callback => {
      callback(this.getSyncStatus());
    });
  }

  private saveOperationsToStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const operationsArray = Array.from(this.operations.values());
      localStorage.setItem('offline-operations', JSON.stringify(operationsArray));
    } catch (error) {
      console.warn('Failed to save operations to storage:', error);
    }
  }

  private loadOperationsFromStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem('offline-operations');
      if (stored) {
        const operationsArray: SyncOperation[] = JSON.parse(stored);
        operationsArray.forEach(op => {
          this.operations.set(op.id, op);
        });
        this.updateSyncStatus();
      }
    } catch (error) {
      console.warn('Failed to load operations from storage:', error);
    }
  }
}

// =============================================================================
// 解答5: APIモックサーバーの実装
// =============================================================================

interface MockResponse<T = unknown> {
  data?: T;
  status: number;
  delay?: number;
  error?: string;
}

interface MockEndpoint {
  method: string;
  path: string;
  response: MockResponse | ((req: MockRequest) => MockResponse | Promise<MockResponse>);
}

interface MockRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  query?: Record<string, string>;
}

export class ApiMockServerSolution {
  private endpoints: MockEndpoint[] = [];
  private data: Map<string, unknown[]> = new Map();
  private graphqlResolvers: Record<string, unknown> = {};

  registerEndpoint(endpoint: MockEndpoint): void {
    // 既存のエンドポイントを更新または新規追加
    const existingIndex = this.endpoints.findIndex(
      ep => ep.method === endpoint.method && ep.path === endpoint.path
    );

    if (existingIndex >= 0) {
      this.endpoints[existingIndex] = endpoint;
    } else {
      this.endpoints.push(endpoint);
    }
  }

  async handleRequest(request: MockRequest): Promise<MockResponse> {
    // パスパラメータを考慮したエンドポイント検索
    const matchedEndpoint = this.findMatchingEndpoint(request);
    
    if (!matchedEndpoint) {
      return {
        status: 404,
        error: 'Endpoint not found'
      };
    }

    // レスポンスの生成
    let response: MockResponse;
    if (typeof matchedEndpoint.response === 'function') {
      response = await matchedEndpoint.response(request);
    } else {
      response = matchedEndpoint.response;
    }

    // 遅延のシミュレーション
    if (response.delay && response.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, response.delay));
    }

    return response;
  }

  private findMatchingEndpoint(request: MockRequest): MockEndpoint | null {
    return this.endpoints.find(endpoint => {
      if (endpoint.method !== request.method) {
        return false;
      }

      // 正確なパス一致
      if (endpoint.path === request.path) {
        return true;
      }

      // パスパラメータを含む一致（例: /users/:id）
      const endpointParts = endpoint.path.split('/');
      const requestParts = request.path.split('/');

      if (endpointParts.length !== requestParts.length) {
        return false;
      }

      return endpointParts.every((part, index) => {
        return part.startsWith(':') || part === requestParts[index];
      });
    }) || null;
  }

  seedData(resource: string, data: unknown[]): void {
    this.data.set(resource, [...data]);
  }

  // RESTful APIのデフォルトエンドポイントを自動生成
  createResourceEndpoints(resource: string, dataValidator?: (data: unknown) => boolean): void {
    const resourcePath = `/${resource}`;
    const itemPath = `${resourcePath}/:id`;

    // GET /resource - 一覧取得
    this.registerEndpoint({
      method: 'GET',
      path: resourcePath,
      response: (req) => {
        const items = this.data.get(resource) || [];
        const page = parseInt(req.query?.page || '1', 10);
        const limit = parseInt(req.query?.limit || '10', 10);
        const offset = (page - 1) * limit;
        
        const paginatedItems = items.slice(offset, offset + limit);
        
        return {
          status: 200,
          data: {
            data: paginatedItems,
            pagination: {
              page,
              limit,
              total: items.length,
              totalPages: Math.ceil(items.length / limit),
              hasNext: offset + limit < items.length,
              hasPrev: page > 1
            }
          }
        };
      }
    });

    // GET /resource/:id - 単一取得
    this.registerEndpoint({
      method: 'GET',
      path: itemPath,
      response: (req) => {
        const id = this.extractPathParam(req.path, itemPath, 'id');
        const items = this.data.get(resource) || [];
        const item = items.find((item: any) => item.id === id);
        
        if (!item) {
          return { status: 404, error: 'Item not found' };
        }
        
        return { status: 200, data: item };
      }
    });

    // POST /resource - 作成
    this.registerEndpoint({
      method: 'POST',
      path: resourcePath,
      response: (req) => {
        const items = this.data.get(resource) || [];
        const newItem = {
          id: `${resource}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...req.body as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (dataValidator && !dataValidator(newItem)) {
          return { status: 400, error: 'Invalid data' };
        }

        items.push(newItem);
        this.data.set(resource, items);
        
        return { status: 201, data: newItem };
      }
    });

    // PUT /resource/:id - 更新
    this.registerEndpoint({
      method: 'PUT',
      path: itemPath,
      response: (req) => {
        const id = this.extractPathParam(req.path, itemPath, 'id');
        const items = this.data.get(resource) || [];
        const itemIndex = items.findIndex((item: any) => item.id === id);
        
        if (itemIndex === -1) {
          return { status: 404, error: 'Item not found' };
        }

        const updatedItem = {
          ...items[itemIndex] as any,
          ...req.body as any,
          updatedAt: new Date().toISOString()
        };

        if (dataValidator && !dataValidator(updatedItem)) {
          return { status: 400, error: 'Invalid data' };
        }

        items[itemIndex] = updatedItem;
        this.data.set(resource, items);
        
        return { status: 200, data: updatedItem };
      }
    });

    // DELETE /resource/:id - 削除
    this.registerEndpoint({
      method: 'DELETE',
      path: itemPath,
      response: (req) => {
        const id = this.extractPathParam(req.path, itemPath, 'id');
        const items = this.data.get(resource) || [];
        const itemIndex = items.findIndex((item: any) => item.id === id);
        
        if (itemIndex === -1) {
          return { status: 404, error: 'Item not found' };
        }

        items.splice(itemIndex, 1);
        this.data.set(resource, items);
        
        return { status: 200, data: { deleted: true } };
      }
    });
  }

  private extractPathParam(actualPath: string, templatePath: string, paramName: string): string {
    const actualParts = actualPath.split('/');
    const templateParts = templatePath.split('/');
    
    const paramIndex = templateParts.findIndex(part => part === `:${paramName}`);
    return actualParts[paramIndex] || '';
  }

  mockGraphQLSchema(schema: string, resolvers: Record<string, unknown>): void {
    this.graphqlResolvers = { ...resolvers };
    
    // GraphQLエンドポイントを登録
    this.registerEndpoint({
      method: 'POST',
      path: '/graphql',
      response: async (req) => {
        const { query, variables, operationName } = req.body as any;
        
        try {
          // 簡易的なGraphQLクエリ解析（実際の実装ではGraphQLパーサーを使用）
          const result = await this.executeGraphQLQuery(query, variables, operationName);
          return { status: 200, data: result };
        } catch (error) {
          return {
            status: 200,
            data: {
              errors: [{ message: (error as Error).message }]
            }
          };
        }
      }
    });
  }

  private async executeGraphQLQuery(
    query: string,
    variables?: Record<string, unknown>,
    operationName?: string
  ): Promise<any> {
    // 非常に簡易的なGraphQLクエリ実行
    // 実際の実装では、graphql-jsなどのライブラリを使用
    
    // クエリタイプを抽出（query, mutation, subscription）
    const queryMatch = query.match(/(query|mutation|subscription)\s*(\w+)?\s*{/);
    if (!queryMatch) {
      throw new Error('Invalid GraphQL query');
    }

    const operationType = queryMatch[1];
    
    // 簡易的なフィールド抽出
    const fieldsMatch = query.match(/{([^}]+)}/);
    if (!fieldsMatch) {
      throw new Error('No fields specified in query');
    }

    // ここでは固定的なレスポンスを返す
    // 実際の実装では、リゾルバーを実行してデータを構築
    return {
      data: {
        viewer: {
          id: '1',
          name: 'Mock User',
          email: 'mock@example.com'
        }
      }
    };
  }

  // テスト用のヘルパーメソッド
  reset(): void {
    this.endpoints = [];
    this.data.clear();
    this.graphqlResolvers = {};
  }

  getRegisteredEndpoints(): MockEndpoint[] {
    return [...this.endpoints];
  }
}

// =============================================================================
// 解答例の使用デモ
// =============================================================================

export async function demonstrateSolutions(): Promise<void> {
  console.log('=== Lesson 50 解答例のデモンストレーション ===\n');

  // 解答1: ブログAPIクライアント
  console.log('1. ブログAPIクライアントのデモ');
  const blogClient = new BlogApiClientSolution();
  
  try {
    // 実際のAPIがないのでエラーになりますが、実装は完成しています
    console.log('ブログAPIクライアント: 実装完了（実際のAPIサーバーが必要）');
  } catch (error) {
    console.log('ブログAPIクライアント:', (error as Error).message);
  }

  // 解答3: LRUキャッシュのデモ
  console.log('\n3. LRUキャッシュのデモ');
  const lruCache = new LRUCacheSolution<string>(3, 5000); // サイズ3、TTL5秒

  lruCache.set('key1', 'value1');
  lruCache.set('key2', 'value2');
  lruCache.set('key3', 'value3');
  
  console.log('key1を取得:', lruCache.get('key1')); // "value1"
  
  lruCache.set('key4', 'value4'); // key2が削除される（LRU）
  
  console.log('key2を取得:', lruCache.get('key2')); // null（削除済み）
  console.log('key3を取得:', lruCache.get('key3')); // "value3"
  console.log('統計情報:', lruCache.getStats());

  // 解答5: APIモックサーバーのデモ
  console.log('\n5. APIモックサーバーのデモ');
  const mockServer = new ApiMockServerSolution();
  
  // ユーザーリソースのエンドポイントを自動生成
  mockServer.createResourceEndpoints('users');
  mockServer.seedData('users', [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' }
  ]);

  // モックリクエストのテスト
  const getUsersRequest: MockRequest = {
    method: 'GET',
    path: '/users',
    headers: {},
    query: { page: '1', limit: '10' }
  };

  const usersResponse = await mockServer.handleRequest(getUsersRequest);
  console.log('ユーザー一覧レスポンス:', JSON.stringify(usersResponse, null, 2));

  const getUserRequest: MockRequest = {
    method: 'GET',
    path: '/users/1',
    headers: {}
  };

  const userResponse = await mockServer.handleRequest(getUserRequest);
  console.log('単一ユーザーレスポンス:', JSON.stringify(userResponse, null, 2));
}

// Node.js環境での実行
if (typeof window === 'undefined') {
  demonstrateSolutions();
}