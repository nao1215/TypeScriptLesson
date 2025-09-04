# Lesson 42: Promiseの詳細 (Promise Deep Dive)

## 学習目標
- Promiseの内部仕組みを深く理解する
- Promise.all、Promise.race、Promise.allSettledの使い分けを学ぶ
- Promiseのエラーハンドリングパターンを習得する
- カスタムPromise実装を理解する
- WebアプリケーションでのPromiseパターンをマスターする

## Promiseとは

Promiseは非同期処理の結果を表現するオブジェクトで、以下の3つの状態を持ちます：

### Promiseの状態

```typescript
// 1. Pending: 初期状態、まだ履行も拒否もされていない
// 2. Fulfilled: 操作が成功完了した状態
// 3. Rejected: 操作が失敗した状態

type PromiseState = 'pending' | 'fulfilled' | 'rejected';
```

### Promise の基本構造

```typescript
const promise = new Promise<string>((resolve, reject) => {
    // 非同期処理
    if (成功条件) {
        resolve('成功の値');  // fulfilled状態になる
    } else {
        reject(new Error('失敗の理由'));  // rejected状態になる
    }
});
```

## Promiseの作成パターン

### 1. 基本的な Promise 作成

```typescript
function createBasicPromise(shouldSucceed: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldSucceed) {
                resolve('Operation successful');
            } else {
                reject(new Error('Operation failed'));
            }
        }, 1000);
    });
}
```

### 2. 即座に解決されるPromise

```typescript
// 成功値をすぐに返す
const resolvedPromise = Promise.resolve('immediate success');

// エラーをすぐに返す
const rejectedPromise = Promise.reject(new Error('immediate error'));

// 既存の値をPromiseでラップ
function wrapValue<T>(value: T): Promise<T> {
    return Promise.resolve(value);
}
```

### 3. 条件付きPromise作成

```typescript
function conditionalPromise(condition: boolean): Promise<string> {
    if (condition) {
        return Promise.resolve('条件は真です');
    } else {
        return Promise.reject(new Error('条件は偽です'));
    }
}
```

## Promise チェーン

### 基本的なチェーン

```typescript
function promiseChainExample(): Promise<string> {
    return Promise.resolve(1)
        .then(value => {
            console.log('Step 1:', value); // 1
            return value * 2;
        })
        .then(value => {
            console.log('Step 2:', value); // 2
            return `Result: ${value}`;
        })
        .then(value => {
            console.log('Step 3:', value); // "Result: 2"
            return value;
        });
}
```

### エラーハンドリング付きチェーン

```typescript
function chainWithErrorHandling(): Promise<string> {
    return Promise.resolve('start')
        .then(value => {
            if (Math.random() > 0.5) {
                throw new Error('Random error occurred');
            }
            return value.toUpperCase();
        })
        .then(value => {
            return `Processed: ${value}`;
        })
        .catch(error => {
            console.error('Caught error:', error.message);
            return 'Error handled gracefully';
        })
        .finally(() => {
            console.log('Chain completed');
        });
}
```

## Promise の静的メソッド

### 1. Promise.all - すべて成功が必要

```typescript
async function promiseAllExample(): Promise<void> {
    const promises = [
        fetch('/api/users'),
        fetch('/api/posts'),
        fetch('/api/comments')
    ];

    try {
        // すべてが成功した場合のみ進行
        const [users, posts, comments] = await Promise.all(promises);
        console.log('All requests successful');
        
        // レスポンスの処理
        const usersData = await users.json();
        const postsData = await posts.json();
        const commentsData = await comments.json();
        
        return { users: usersData, posts: postsData, comments: commentsData };
    } catch (error) {
        console.error('One of the requests failed:', error);
        throw error;
    }
}
```

### 2. Promise.allSettled - 全て完了まで待機

```typescript
async function promiseAllSettledExample(): Promise<void> {
    const promises = [
        fetch('/api/users'),
        fetch('/api/posts'),
        fetch('/api/invalid-endpoint') // これは失敗する
    ];

    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            console.log(`Promise ${index} succeeded:`, result.value.status);
        } else {
            console.log(`Promise ${index} failed:`, result.reason.message);
        }
    });
}
```

### 3. Promise.race - 最初の完了を取得

```typescript
async function promiseRaceExample(): Promise<string> {
    const fastServer = new Promise<string>(resolve => 
        setTimeout(() => resolve('Fast server response'), 1000)
    );
    
    const slowServer = new Promise<string>(resolve => 
        setTimeout(() => resolve('Slow server response'), 3000)
    );
    
    const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 2 seconds')), 2000)
    );

    try {
        // 最初に完了したものを返す
        const result = await Promise.race([fastServer, slowServer, timeout]);
        return result;
    } catch (error) {
        console.error('Race failed:', error.message);
        throw error;
    }
}
```

### 4. Promise.any - 最初の成功を取得

```typescript
async function promiseAnyExample(): Promise<string> {
    const unreliableServers = [
        fetch('/unreliable-server-1').then(r => r.text()),
        fetch('/unreliable-server-2').then(r => r.text()),
        fetch('/unreliable-server-3').then(r => r.text())
    ];

    try {
        // 最初に成功したものを返す
        const result = await Promise.any(unreliableServers);
        console.log('Got response from one server:', result);
        return result;
    } catch (aggregateError) {
        console.error('All servers failed:', aggregateError.errors);
        throw new Error('All servers are down');
    }
}
```

## 実践的なPromiseパターン

### 1. リトライ機能付きPromise

```typescript
async function withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxAttempts}`);
            return await operation();
        } catch (error) {
            lastError = error as Error;
            console.log(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // 指数バックオフ
            }
        }
    }
    
    throw new Error(`All ${maxAttempts} attempts failed. Last error: ${lastError!.message}`);
}
```

### 2. タイムアウト付きPromise

```typescript
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });
    
    return Promise.race([promise, timeout]);
}

// 使用例
async function fetchWithTimeout(url: string): Promise<Response> {
    return withTimeout(fetch(url), 5000); // 5秒でタイムアウト
}
```

### 3. Promise ベースのキャッシュ

```typescript
class PromiseCache<T> {
    private cache = new Map<string, Promise<T>>();
    
    async get(key: string, factory: () => Promise<T>): Promise<T> {
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }
        
        const promise = factory().catch(error => {
            // エラーの場合はキャッシュから削除
            this.cache.delete(key);
            throw error;
        });
        
        this.cache.set(key, promise);
        return promise;
    }
    
    clear(): void {
        this.cache.clear();
    }
    
    delete(key: string): boolean {
        return this.cache.delete(key);
    }
}

// 使用例
const apiCache = new PromiseCache<any>();

async function fetchUserWithCache(userId: string): Promise<User> {
    return apiCache.get(`user:${userId}`, () => 
        fetch(`/api/users/${userId}`).then(r => r.json())
    );
}
```

### 4. 並行度制限付き実行

```typescript
class ConcurrentPromiseExecutor {
    constructor(private maxConcurrent: number = 3) {}
    
    async execute<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
        const results: T[] = [];
        const executing: Promise<void>[] = [];
        
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            
            const promise = task().then(result => {
                results[i] = result;
            });
            
            executing.push(promise);
            
            if (executing.length >= this.maxConcurrent) {
                await Promise.race(executing);
                // 完了したpromiseを削除
                for (let j = executing.length - 1; j >= 0; j--) {
                    if (await Promise.race([executing[j], Promise.resolve(true)])) {
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

### 5. イベント駆動Promise

```typescript
class EventDrivenPromise<T> {
    private promise: Promise<T>;
    private resolveCallback!: (value: T) => void;
    private rejectCallback!: (reason: any) => void;
    
    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolveCallback = resolve;
            this.rejectCallback = reject;
        });
    }
    
    resolve(value: T): void {
        this.resolveCallback(value);
    }
    
    reject(reason: any): void {
        this.rejectCallback(reason);
    }
    
    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined
    ): Promise<TResult1 | TResult2> {
        return this.promise.then(onfulfilled, onrejected);
    }
    
    catch<TResult = never>(
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined
    ): Promise<T | TResult> {
        return this.promise.catch(onrejected);
    }
}

// 使用例
function waitForEvent(): EventDrivenPromise<string> {
    const eventPromise = new EventDrivenPromise<string>();
    
    // 何らかのイベントを待つ
    document.addEventListener('custom-event', (event: any) => {
        eventPromise.resolve(event.detail);
    }, { once: true });
    
    setTimeout(() => {
        eventPromise.reject(new Error('Event timeout'));
    }, 5000);
    
    return eventPromise;
}
```

## Promiseのエラーハンドリングパターン

### 1. 段階的エラーハンドリング

```typescript
function handleErrorsGracefully(): Promise<string> {
    return fetchUserData()
        .catch(error => {
            if (error.code === 'NETWORK_ERROR') {
                console.log('Network error, using cached data');
                return getCachedUserData();
            }
            throw error; // その他のエラーは再スロー
        })
        .catch(error => {
            if (error.code === 'CACHE_MISS') {
                console.log('Cache miss, using default data');
                return getDefaultUserData();
            }
            throw error;
        })
        .catch(error => {
            console.error('All fallbacks failed:', error);
            return 'Unknown User'; // 最終フォールバック
        });
}
```

### 2. エラー分類とハンドリング

```typescript
class APIError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code: string
    ) {
        super(message);
        this.name = 'APIError';
    }
}

class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NetworkError';
    }
}

function handleSpecificErrors(): Promise<any> {
    return fetchFromAPI()
        .catch(error => {
            if (error instanceof APIError) {
                if (error.statusCode === 401) {
                    return refreshTokenAndRetry();
                } else if (error.statusCode === 503) {
                    return retryAfterDelay(5000);
                }
            } else if (error instanceof NetworkError) {
                return switchToOfflineMode();
            }
            
            throw error; // 処理できないエラーは再スロー
        });
}
```

## WebアプリケーションでのPromise活用例

### 1. データローディングパターン

```typescript
class DataLoader {
    private loadingPromises = new Map<string, Promise<any>>();
    
    async loadData<T>(
        key: string,
        loader: () => Promise<T>,
        options: {
            cache?: boolean;
            timeout?: number;
            retry?: number;
        } = {}
    ): Promise<T> {
        // すでにローディング中の場合は同じPromiseを返す
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key)!;
        }
        
        let promise = loader();
        
        // タイムアウト処理
        if (options.timeout) {
            promise = withTimeout(promise, options.timeout);
        }
        
        // リトライ処理
        if (options.retry) {
            promise = withRetry(() => promise, options.retry);
        }
        
        // キャッシュする場合
        if (options.cache !== false) {
            this.loadingPromises.set(key, promise);
        }
        
        try {
            const result = await promise;
            return result;
        } finally {
            // 完了後にローディング状態を削除
            if (options.cache !== false) {
                this.loadingPromises.delete(key);
            }
        }
    }
}
```

### 2. フォーム送信パターン

```typescript
class FormSubmissionHandler {
    private isSubmitting = false;
    
    async submitForm(formData: FormData): Promise<void> {
        if (this.isSubmitting) {
            throw new Error('Form is already being submitted');
        }
        
        this.isSubmitting = true;
        
        try {
            // バリデーション
            await this.validateForm(formData);
            
            // データ送信
            const response = await withTimeout(
                fetch('/api/submit', {
                    method: 'POST',
                    body: formData
                }),
                10000 // 10秒タイムアウト
            );
            
            if (!response.ok) {
                throw new APIError(
                    'Submission failed',
                    response.status,
                    'SUBMISSION_ERROR'
                );
            }
            
            // 成功処理
            await this.handleSuccess();
            
        } catch (error) {
            await this.handleError(error);
            throw error;
        } finally {
            this.isSubmitting = false;
        }
    }
    
    private async validateForm(formData: FormData): Promise<void> {
        const validationPromises = [
            this.validateEmail(formData.get('email') as string),
            this.validatePassword(formData.get('password') as string)
        ];
        
        const results = await Promise.allSettled(validationPromises);
        const errors = results
            .filter(result => result.status === 'rejected')
            .map(result => (result as PromiseRejectedResult).reason.message);
        
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
    }
    
    private async handleSuccess(): Promise<void> {
        // 成功メッセージの表示など
        console.log('Form submitted successfully');
    }
    
    private async handleError(error: Error): Promise<void> {
        // エラーメッセージの表示など
        console.error('Form submission failed:', error.message);
    }
}
```

## パフォーマンス考慮事項

### 1. メモリリーク防止

```typescript
class PromiseManager {
    private activePromises = new Set<Promise<any>>();
    
    track<T>(promise: Promise<T>): Promise<T> {
        this.activePromises.add(promise);
        
        return promise.finally(() => {
            this.activePromises.delete(promise);
        });
    }
    
    cancelAll(): void {
        // 全てのPromiseをキャンセル（可能な場合）
        this.activePromises.clear();
    }
    
    get activeCount(): number {
        return this.activePromises.size;
    }
}
```

### 2. メモリ効率的な並行処理

```typescript
async function processLargeDataset<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10
): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(processor)
        );
        results.push(...batchResults);
    }
    
    return results;
}
```

## まとめ

- Promiseは非同期処理の核となる概念
- 適切な静的メソッドの使い分けが重要
- エラーハンドリングは段階的に実装
- パフォーマンスとメモリ効率を考慮
- 実際のWebアプリケーションでは複合的なパターンを使用

次のLessonでは、async/awaitを使用してPromiseをより読みやすく書く方法を学習します。

## 参考リンク

- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [JavaScript.info: Promise](https://javascript.info/promise-basics)
- [Promise パフォーマンスガイド](https://web.dev/promises/)