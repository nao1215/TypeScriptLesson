# Lesson 45: Fetch APIとHTTPクライアント (Fetch API & HTTP Clients)

## 学習目標
- Fetch APIの基本から応用まで完全習得する
- RESTful APIとの効果的な通信方法を学ぶ
- エラーハンドリング、認証、キャッシュ戦略を理解する
- カスタムHTTPクライアントの実装を学ぶ
- 実際のWebアプリケーションで使用できるHTTP通信パターンを習得する

## Fetch API 基礎

### Fetch API とは

Fetch APIは現代的なHTTPリクエストを行うためのWebブラウザ標準のAPIです：

**従来のXMLHttpRequest vs Fetch API**

```typescript
// 従来のXMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users');
xhr.onload = function() {
    if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        console.log(data);
    }
};
xhr.send();

// モダンなFetch API
fetch('/api/users')
    .then(response => response.json())
    .then(data => console.log(data));
```

### 基本的な使用方法

```typescript
// GET リクエスト
async function fetchUsers(): Promise<User[]> {
    const response = await fetch('/api/users');
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// POST リクエスト
async function createUser(userData: Partial<User>): Promise<User> {
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status}`);
    }
    
    return await response.json();
}
```

## HTTPメソッドとリクエスト設定

### 全HTTPメソッドの実装

```typescript
class HTTPClient {
    private baseUrl: string;
    private defaultHeaders: Record<string, string>;

    constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...defaultHeaders
        };
    }

    // GET リクエスト
    async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>('GET', endpoint, options);
    }

    // POST リクエスト
    async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
        return this.request<T>('POST', endpoint, {
            ...options,
            body: JSON.stringify(data)
        });
    }

    // PUT リクエスト
    async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
        return this.request<T>('PUT', endpoint, {
            ...options,
            body: JSON.stringify(data)
        });
    }

    // PATCH リクエスト
    async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
        return this.request<T>('PATCH', endpoint, {
            ...options,
            body: JSON.stringify(data)
        });
    }

    // DELETE リクエスト
    async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>('DELETE', endpoint, options);
    }

    // HEAD リクエスト
    async head(endpoint: string, options?: RequestInit): Promise<Response> {
        const url = `${this.baseUrl}${endpoint}`;
        return fetch(url, {
            ...options,
            method: 'HEAD',
            headers: { ...this.defaultHeaders, ...options?.headers }
        });
    }

    // OPTIONS リクエスト
    async options(endpoint: string, options?: RequestInit): Promise<Response> {
        const url = `${this.baseUrl}${endpoint}`;
        return fetch(url, {
            ...options,
            method: 'OPTIONS',
            headers: { ...this.defaultHeaders, ...options?.headers }
        });
    }

    // 共通のリクエスト処理
    private async request<T>(
        method: string,
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config: RequestInit = {
            ...options,
            method,
            headers: { ...this.defaultHeaders, ...options?.headers }
        };

        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new HTTPError(response.status, response.statusText, await response.text());
        }
        
        return this.parseResponse<T>(response);
    }

    // レスポンス解析
    private async parseResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
            return await response.json();
        } else if (contentType?.includes('text/')) {
            return await response.text() as unknown as T;
        } else {
            return await response.blob() as unknown as T;
        }
    }
}
```

## エラーハンドリング

### カスタムHTTPエラークラス

```typescript
export class HTTPError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public body?: string
    ) {
        super(`HTTP ${status}: ${statusText}`);
        this.name = 'HTTPError';
    }

    // 特定のステータスコードかどうかをチェック
    is(status: number): boolean {
        return this.status === status;
    }

    // クライアントエラーかどうか（4xx）
    isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    // サーバーエラーかどうか（5xx）
    isServerError(): boolean {
        return this.status >= 500;
    }

    // 認証エラーかどうか
    isAuthError(): boolean {
        return this.status === 401 || this.status === 403;
    }
}

export class NetworkError extends Error {
    constructor(message: string, public originalError?: Error) {
        super(message);
        this.name = 'NetworkError';
    }
}

export class TimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TimeoutError';
    }
}
```

### エラーハンドリング戦略

```typescript
class RobustHTTPClient extends HTTPClient {
    // リトライ機能付きリクエスト
    async requestWithRetry<T>(
        method: string,
        endpoint: string,
        options: RequestInit & {
            retryCount?: number;
            retryDelay?: number;
            retryCondition?: (error: Error) => boolean;
        } = {}
    ): Promise<T> {
        const {
            retryCount = 3,
            retryDelay = 1000,
            retryCondition = (error) => {
                if (error instanceof HTTPError) {
                    // 5xx エラーの場合のみリトライ
                    return error.isServerError();
                }
                return error instanceof NetworkError;
            },
            ...requestOptions
        } = options;

        let lastError: Error;

        for (let attempt = 0; attempt <= retryCount; attempt++) {
            try {
                return await this.request<T>(method, endpoint, requestOptions);
            } catch (error) {
                lastError = error as Error;
                
                if (attempt === retryCount || !retryCondition(lastError)) {
                    throw lastError;
                }

                // 指数バックオフで待機
                const delay = retryDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                console.log(`Retrying request (${attempt + 1}/${retryCount}) after ${delay}ms`);
            }
        }

        throw lastError!;
    }

    // タイムアウト付きリクエスト
    async requestWithTimeout<T>(
        method: string,
        endpoint: string,
        options: RequestInit & { timeout?: number } = {}
    ): Promise<T> {
        const { timeout = 10000, ...requestOptions } = options;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const result = await this.request<T>(method, endpoint, {
                ...requestOptions,
                signal: controller.signal
            });
            return result;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new TimeoutError(`Request timed out after ${timeout}ms`);
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}
```

## 認証とセキュリティ

### JWT認証実装

```typescript
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

class AuthenticatedHTTPClient extends RobustHTTPClient {
    private tokens: AuthTokens | null = null;
    private refreshPromise: Promise<void> | null = null;

    constructor(baseUrl: string) {
        super(baseUrl);
        this.loadTokensFromStorage();
    }

    // トークンを設定
    setTokens(tokens: AuthTokens): void {
        this.tokens = tokens;
        this.saveTokensToStorage();
        this.updateAuthHeader();
    }

    // 認証が必要なリクエスト
    async authenticatedRequest<T>(
        method: string,
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        await this.ensureValidToken();
        return this.request<T>(method, endpoint, options);
    }

    // トークンの有効性を確保
    private async ensureValidToken(): Promise<void> {
        if (!this.tokens) {
            throw new Error('Not authenticated');
        }

        // トークンが期限切れかチェック
        const now = Date.now();
        const expireBuffer = 5 * 60 * 1000; // 5分前にリフレッシュ

        if (now >= this.tokens.expiresAt - expireBuffer) {
            // 既にリフレッシュ中の場合は待機
            if (this.refreshPromise) {
                await this.refreshPromise;
                return;
            }

            this.refreshPromise = this.refreshAccessToken();
            await this.refreshPromise;
            this.refreshPromise = null;
        }
    }

    // アクセストークンをリフレッシュ
    private async refreshAccessToken(): Promise<void> {
        if (!this.tokens?.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await this.post<AuthTokens>('/auth/refresh', {
                refreshToken: this.tokens.refreshToken
            });

            this.setTokens(response);
        } catch (error) {
            // リフレッシュに失敗した場合はログアウト
            this.clearTokens();
            throw new Error('Token refresh failed');
        }
    }

    // 認証ヘッダーを更新
    private updateAuthHeader(): void {
        if (this.tokens) {
            this.defaultHeaders['Authorization'] = `Bearer ${this.tokens.accessToken}`;
        } else {
            delete this.defaultHeaders['Authorization'];
        }
    }

    // トークンをローカルストレージに保存
    private saveTokensToStorage(): void {
        if (this.tokens) {
            localStorage.setItem('auth_tokens', JSON.stringify(this.tokens));
        }
    }

    // トークンをローカルストレージから読み込み
    private loadTokensFromStorage(): void {
        const stored = localStorage.getItem('auth_tokens');
        if (stored) {
            try {
                this.tokens = JSON.parse(stored);
                this.updateAuthHeader();
            } catch (error) {
                console.error('Failed to parse stored tokens:', error);
                this.clearTokens();
            }
        }
    }

    // トークンをクリア
    clearTokens(): void {
        this.tokens = null;
        localStorage.removeItem('auth_tokens');
        this.updateAuthHeader();
    }

    // ログイン
    async login(credentials: { username: string; password: string }): Promise<void> {
        const tokens = await this.post<AuthTokens>('/auth/login', credentials);
        this.setTokens(tokens);
    }

    // ログアウト
    async logout(): Promise<void> {
        if (this.tokens) {
            try {
                await this.post('/auth/logout', { refreshToken: this.tokens.refreshToken });
            } catch (error) {
                console.error('Logout request failed:', error);
            }
        }
        this.clearTokens();
    }
}
```

## キャッシュ戦略

### レスポンスキャッシュの実装

```typescript
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    etag?: string;
    expires?: number;
}

class CachedHTTPClient extends AuthenticatedHTTPClient {
    private cache = new Map<string, CacheEntry<any>>();
    private defaultCacheDuration = 5 * 60 * 1000; // 5分

    // キャッシュ付きGETリクエスト
    async getCached<T>(
        endpoint: string,
        options: {
            cacheDuration?: number;
            useETag?: boolean;
            forceRefresh?: boolean;
        } = {}
    ): Promise<T> {
        const cacheKey = this.getCacheKey('GET', endpoint);
        const {
            cacheDuration = this.defaultCacheDuration,
            useETag = true,
            forceRefresh = false
        } = options;

        // 強制リフレッシュでない場合はキャッシュをチェック
        if (!forceRefresh) {
            const cached = this.cache.get(cacheKey);
            if (cached && this.isCacheValid(cached, cacheDuration)) {
                console.log('Cache hit for:', endpoint);
                return cached.data;
            }

            // ETagを使用した条件付きリクエスト
            if (useETag && cached?.etag) {
                try {
                    const response = await fetch(`${this.baseUrl}${endpoint}`, {
                        headers: {
                            ...this.defaultHeaders,
                            'If-None-Match': cached.etag
                        }
                    });

                    if (response.status === 304) {
                        console.log('Cache still valid (304):', endpoint);
                        // キャッシュのタイムスタンプを更新
                        cached.timestamp = Date.now();
                        return cached.data;
                    }
                } catch (error) {
                    console.warn('ETag validation failed:', error);
                }
            }
        }

        // 新しいデータをフェッチ
        console.log('Fetching fresh data for:', endpoint);
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: this.defaultHeaders
        });

        if (!response.ok) {
            throw new HTTPError(response.status, response.statusText);
        }

        const data = await response.json();
        const etag = response.headers.get('etag') || undefined;
        const cacheControl = response.headers.get('cache-control');
        const expires = this.parseCacheControl(cacheControl);

        // キャッシュに保存
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            etag,
            expires
        });

        return data;
    }

    // キャッシュの有効性をチェック
    private isCacheValid<T>(entry: CacheEntry<T>, duration: number): boolean {
        const now = Date.now();
        
        // 明示的な有効期限がある場合
        if (entry.expires && now > entry.expires) {
            return false;
        }

        // デフォルトの有効期限
        return now - entry.timestamp < duration;
    }

    // Cache-Controlヘッダーを解析
    private parseCacheControl(cacheControl: string | null): number | undefined {
        if (!cacheControl) return undefined;

        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
        if (maxAgeMatch) {
            return Date.now() + parseInt(maxAgeMatch[1]) * 1000;
        }

        return undefined;
    }

    // キャッシュキーを生成
    private getCacheKey(method: string, endpoint: string): string {
        return `${method}:${endpoint}`;
    }

    // キャッシュをクリア
    clearCache(): void {
        this.cache.clear();
        console.log('Cache cleared');
    }

    // 特定のパターンのキャッシュをクリア
    clearCachePattern(pattern: RegExp): void {
        for (const [key] of this.cache) {
            if (pattern.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    // キャッシュサイズを取得
    getCacheSize(): number {
        return this.cache.size;
    }
}
```

## ファイルアップロード

### マルチパートファイルアップロード

```typescript
interface FileUploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

class FileUploadClient extends CachedHTTPClient {
    // 単一ファイルアップロード
    async uploadFile(
        endpoint: string,
        file: File,
        options: {
            onProgress?: (progress: FileUploadProgress) => void;
            additionalFields?: Record<string, string>;
        } = {}
    ): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        // 追加フィールドを追加
        if (options.additionalFields) {
            for (const [key, value] of Object.entries(options.additionalFields)) {
                formData.append(key, value);
            }
        }

        // プログレス追跡のためのカスタム実装
        if (options.onProgress) {
            return this.uploadWithProgress(endpoint, formData, options.onProgress);
        }

        // 通常のアップロード
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                // Content-Type は自動設定される（multipart/form-data boundary付き）
                'Authorization': this.defaultHeaders['Authorization']
            },
            body: formData
        });

        if (!response.ok) {
            throw new HTTPError(response.status, response.statusText);
        }

        return response.json();
    }

    // 複数ファイルアップロード
    async uploadMultipleFiles(
        endpoint: string,
        files: File[],
        options: {
            onProgress?: (filename: string, progress: FileUploadProgress) => void;
            onComplete?: (filename: string, result: any) => void;
            concurrentUploads?: number;
        } = {}
    ): Promise<any[]> {
        const { concurrentUploads = 3 } = options;
        const results: any[] = [];

        // ファイルを並行アップロード（制限付き）
        const uploadPromises = files.map(async (file, index) => {
            try {
                const result = await this.uploadFile(endpoint, file, {
                    onProgress: options.onProgress 
                        ? (progress) => options.onProgress!(file.name, progress)
                        : undefined
                });

                results[index] = result;
                options.onComplete?.(file.name, result);
                return result;
            } catch (error) {
                console.error(`Upload failed for ${file.name}:`, error);
                throw error;
            }
        });

        // 制限付き並行実行
        const batches = [];
        for (let i = 0; i < uploadPromises.length; i += concurrentUploads) {
            batches.push(uploadPromises.slice(i, i + concurrentUploads));
        }

        for (const batch of batches) {
            await Promise.all(batch);
        }

        return results;
    }

    // プログレス付きアップロード（XMLHttpRequest使用）
    private uploadWithProgress(
        endpoint: string,
        formData: FormData,
        onProgress: (progress: FileUploadProgress) => void
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // プログレスイベント
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress: FileUploadProgress = {
                        loaded: event.loaded,
                        total: event.total,
                        percentage: Math.round((event.loaded / event.total) * 100)
                    };
                    onProgress(progress);
                }
            });

            // 完了イベント
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        resolve(xhr.responseText);
                    }
                } else {
                    reject(new HTTPError(xhr.status, xhr.statusText, xhr.responseText));
                }
            });

            // エラーイベント
            xhr.addEventListener('error', () => {
                reject(new NetworkError('Upload failed'));
            });

            // タイムアウトイベント
            xhr.addEventListener('timeout', () => {
                reject(new TimeoutError('Upload timeout'));
            });

            // リクエスト開始
            xhr.open('POST', `${this.baseUrl}${endpoint}`);
            
            // 認証ヘッダーを設定
            if (this.defaultHeaders['Authorization']) {
                xhr.setRequestHeader('Authorization', this.defaultHeaders['Authorization']);
            }

            xhr.send(formData);
        });
    }

    // Base64ファイルアップロード
    async uploadBase64File(
        endpoint: string,
        base64Data: string,
        filename: string,
        mimeType: string = 'application/octet-stream'
    ): Promise<any> {
        const payload = {
            filename,
            mimeType,
            data: base64Data
        };

        return this.post(endpoint, payload);
    }
}
```

## 実践的な使用例

### RESTful APIクライアント

```typescript
// ユーザー管理API
class UserAPIClient extends FileUploadClient {
    // ユーザー一覧取得
    async getUsers(params: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    } = {}): Promise<{ users: User[]; total: number }> {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, value]) => value !== undefined)
        ).toString();
        
        const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
        return this.getCached(endpoint, { cacheDuration: 30000 }); // 30秒キャッシュ
    }

    // ユーザー詳細取得
    async getUser(id: string): Promise<User> {
        return this.getCached(`/users/${id}`, { cacheDuration: 60000 }); // 1分キャッシュ
    }

    // ユーザー作成
    async createUser(userData: Omit<User, 'id'>): Promise<User> {
        const result = await this.post<User>('/users', userData);
        
        // 関連するキャッシュを無効化
        this.clearCachePattern(/^GET:\/users/);
        
        return result;
    }

    // ユーザー更新
    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        const result = await this.put<User>(`/users/${id}`, userData);
        
        // 特定のキャッシュを無効化
        this.clearCachePattern(new RegExp(`^GET:/users/${id}`));
        this.clearCachePattern(/^GET:\/users(?:\?|$)/);
        
        return result;
    }

    // ユーザー削除
    async deleteUser(id: string): Promise<void> {
        await this.delete(`/users/${id}`);
        
        // 関連するキャッシュを無効化
        this.clearCachePattern(/^GET:\/users/);
    }

    // プロフィール画像アップロード
    async uploadProfileImage(
        userId: string,
        imageFile: File,
        onProgress?: (progress: FileUploadProgress) => void
    ): Promise<{ imageUrl: string }> {
        return this.uploadFile(`/users/${userId}/profile-image`, imageFile, {
            onProgress,
            additionalFields: { userId }
        });
    }

    // 一括ユーザー操作
    async bulkUpdateUsers(updates: Array<{ id: string; data: Partial<User> }>): Promise<User[]> {
        const results = await Promise.allSettled(
            updates.map(update => this.updateUser(update.id, update.data))
        );

        const successful: User[] = [];
        const failed: { id: string; error: Error }[] = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successful.push(result.value);
            } else {
                failed.push({
                    id: updates[index].id,
                    error: result.reason
                });
            }
        });

        if (failed.length > 0) {
            console.warn('Some bulk updates failed:', failed);
        }

        return successful;
    }
}
```

## パフォーマンス最適化

### リクエストの最適化

```typescript
class OptimizedHTTPClient extends UserAPIClient {
    private requestDeduplication = new Map<string, Promise<any>>();

    // リクエスト重複排除
    async deduplicatedRequest<T>(
        key: string,
        requestFn: () => Promise<T>
    ): Promise<T> {
        if (this.requestDeduplication.has(key)) {
            return this.requestDeduplication.get(key)!;
        }

        const promise = requestFn().finally(() => {
            this.requestDeduplication.delete(key);
        });

        this.requestDeduplication.set(key, promise);
        return promise;
    }

    // 自動バッチング
    private batchQueue = new Map<string, Array<{ params: any; resolve: Function; reject: Function }>>();
    private batchTimers = new Map<string, NodeJS.Timeout>();

    async batchRequest<T>(
        batchKey: string,
        params: any,
        batchFn: (allParams: any[]) => Promise<T[]>,
        delay: number = 100
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.batchQueue.has(batchKey)) {
                this.batchQueue.set(batchKey, []);
            }

            this.batchQueue.get(batchKey)!.push({ params, resolve, reject });

            // 既存のタイマーをクリア
            if (this.batchTimers.has(batchKey)) {
                clearTimeout(this.batchTimers.get(batchKey)!);
            }

            // 新しいタイマーを設定
            const timer = setTimeout(async () => {
                const batch = this.batchQueue.get(batchKey)!;
                this.batchQueue.delete(batchKey);
                this.batchTimers.delete(batchKey);

                try {
                    const results = await batchFn(batch.map(item => item.params));
                    batch.forEach((item, index) => {
                        item.resolve(results[index]);
                    });
                } catch (error) {
                    batch.forEach(item => {
                        item.reject(error);
                    });
                }
            }, delay);

            this.batchTimers.set(batchKey, timer);
        });
    }

    // 並行リクエスト制限
    async limitedParallelRequests<T>(
        requests: Array<() => Promise<T>>,
        limit: number = 5
    ): Promise<T[]> {
        const results: T[] = [];
        const executing: Promise<void>[] = [];

        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];

            const promise = request().then(result => {
                results[i] = result;
            });

            executing.push(promise);

            if (executing.length >= limit) {
                await Promise.race(executing);
                // 完了したPromiseを削除
                for (let j = executing.length - 1; j >= 0; j--) {
                    if (results[i] !== undefined) {
                        executing.splice(j, 1);
                        break;
                    }
                }
            }
        }

        await Promise.all(executing);
        return results;
    }
}
```

## まとめ

- Fetch APIは現代的なHTTP通信の標準
- 適切なエラーハンドリングとリトライ戦略が重要
- 認証とセキュリティを考慮した実装
- キャッシュ戦略でパフォーマンス向上
- ファイルアップロードの進捗追跡
- バッチ処理や重複排除でさらなる最適化

次のLessonでは、リアルタイム通信（WebSocket、SSE）について学習します。

## 参考リンク

- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [HTTP ステータスコード](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [REST API設計原則](https://restfulapi.net/)