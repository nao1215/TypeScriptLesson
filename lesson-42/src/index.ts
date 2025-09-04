/**
 * Lesson 42: Promiseの詳細 (Promise Deep Dive)
 * 
 * このファイルでは、Promiseの高度な使用方法と実践的なパターンを学習します。
 * Webアプリケーション開発で必要なPromiseテクニックを完全網羅しています。
 */

// ===== 1. Promiseの内部実装理解 =====

/**
 * シンプルなPromise実装（学習用）
 */
export class SimplePromise<T> {
    private state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
    private value?: T;
    private reason?: any;
    private onFulfilledCallbacks: Array<(value: T) => void> = [];
    private onRejectedCallbacks: Array<(reason: any) => void> = [];

    constructor(
        executor: (
            resolve: (value: T) => void,
            reject: (reason: any) => void
        ) => void
    ) {
        try {
            executor(
                (value: T) => this.resolve(value),
                (reason: any) => this.reject(reason)
            );
        } catch (error) {
            this.reject(error);
        }
    }

    private resolve(value: T): void {
        if (this.state !== 'pending') return;
        
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(callback => {
            try {
                callback(value);
            } catch (error) {
                console.error('Error in fulfilled callback:', error);
            }
        });
    }

    private reject(reason: any): void {
        if (this.state !== 'pending') return;
        
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(callback => {
            try {
                callback(reason);
            } catch (error) {
                console.error('Error in rejected callback:', error);
            }
        });
    }

    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: (value: T) => TResult1 | Promise<TResult1>,
        onRejected?: (reason: any) => TResult2 | Promise<TResult2>
    ): SimplePromise<TResult1 | TResult2> {
        return new SimplePromise<TResult1 | TResult2>((resolve, reject) => {
            const handleFulfilled = (value: T) => {
                if (!onFulfilled) {
                    resolve(value as any);
                    return;
                }
                
                try {
                    const result = onFulfilled(value);
                    if (result instanceof SimplePromise) {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            const handleRejected = (reason: any) => {
                if (!onRejected) {
                    reject(reason);
                    return;
                }
                
                try {
                    const result = onRejected(reason);
                    if (result instanceof SimplePromise) {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            if (this.state === 'fulfilled') {
                setTimeout(() => handleFulfilled(this.value!), 0);
            } else if (this.state === 'rejected') {
                setTimeout(() => handleRejected(this.reason), 0);
            } else {
                this.onFulfilledCallbacks.push(handleFulfilled);
                this.onRejectedCallbacks.push(handleRejected);
            }
        });
    }

    catch<TResult = never>(
        onRejected?: (reason: any) => TResult | Promise<TResult>
    ): SimplePromise<T | TResult> {
        return this.then(undefined, onRejected);
    }
}

// ===== 2. Promise静的メソッドの詳細実装 =====

/**
 * カスタムPromiseユーティリティクラス
 */
export class PromiseUtils {
    /**
     * 全てのPromiseが成功するまで待つ（Promise.allの拡張版）
     */
    static async all<T extends readonly unknown[] | []>(
        promises: T
    ): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
        const results = await Promise.all(promises);
        return results as { -readonly [P in keyof T]: Awaited<T[P]> };
    }

    /**
     * 全てのPromiseの完了を待つ（成功・失敗問わず）
     */
    static async allSettled<T extends readonly unknown[] | []>(
        promises: T
    ): Promise<{
        -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>
    }> {
        return Promise.allSettled(promises) as Promise<{
            -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>
        }>;
    }

    /**
     * 最初に解決されるPromiseを返す
     */
    static race<T>(promises: Promise<T>[]): Promise<T> {
        return Promise.race(promises);
    }

    /**
     * 最初に成功するPromiseを返す
     */
    static any<T>(promises: Promise<T>[]): Promise<T> {
        return Promise.any(promises);
    }

    /**
     * 指定された遅延後に解決されるPromiseを作成
     */
    static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 指定された遅延後に値を返すPromiseを作成
     */
    static delayedValue<T>(value: T, ms: number): Promise<T> {
        return new Promise(resolve => setTimeout(() => resolve(value), ms));
    }

    /**
     * 指定された確率で成功または失敗するPromiseを作成
     */
    static probabilistic<T>(
        successValue: T,
        failureReason: any,
        successProbability: number = 0.5
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            if (Math.random() < successProbability) {
                resolve(successValue);
            } else {
                reject(failureReason);
            }
        });
    }

    /**
     * 複数のPromiseを順次実行
     */
    static async sequence<T>(
        tasks: Array<() => Promise<T>>
    ): Promise<T[]> {
        const results: T[] = [];
        
        for (const task of tasks) {
            const result = await task();
            results.push(result);
        }
        
        return results;
    }

    /**
     * Promiseを指定された同時実行数で制限して実行
     */
    static async concurrent<T>(
        tasks: Array<() => Promise<T>>,
        concurrency: number = 3
    ): Promise<T[]> {
        const results: T[] = new Array(tasks.length);
        const executing: Promise<void>[] = [];

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            
            const promise = task().then(result => {
                results[i] = result;
            });

            executing.push(promise);

            if (executing.length >= concurrency) {
                await Promise.race(executing);
                // 完了したPromiseを配列から削除
                const completedIndex = executing.findIndex(p => 
                    Promise.race([p, Promise.resolve()]).then(() => true, () => false)
                );
                if (completedIndex !== -1) {
                    executing.splice(completedIndex, 1);
                }
            }
        }

        await Promise.all(executing);
        return results;
    }
}

// ===== 3. エラーハンドリングパターン =====

/**
 * カスタムエラークラス群
 */
export class TimeoutError extends Error {
    constructor(message: string, public timeoutMs: number) {
        super(message);
        this.name = 'TimeoutError';
    }
}

export class RetryError extends Error {
    constructor(
        message: string,
        public attempts: number,
        public lastError: Error
    ) {
        super(message);
        this.name = 'RetryError';
    }
}

export class ValidationError extends Error {
    constructor(message: string, public field: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * エラーハンドリングユーティリティ
 */
export class ErrorHandler {
    /**
     * タイムアウト付きでPromiseを実行
     */
    static withTimeout<T>(
        promise: Promise<T>,
        timeoutMs: number,
        timeoutMessage?: string
    ): Promise<T> {
        const timeout = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new TimeoutError(
                    timeoutMessage || `Operation timed out after ${timeoutMs}ms`,
                    timeoutMs
                ));
            }, timeoutMs);
        });

        return Promise.race([promise, timeout]);
    }

    /**
     * リトライ機能付きでPromiseを実行
     */
    static async withRetry<T>(
        operation: () => Promise<T>,
        options: {
            maxAttempts?: number;
            delay?: number;
            backoffMultiplier?: number;
            shouldRetry?: (error: Error, attempt: number) => boolean;
        } = {}
    ): Promise<T> {
        const {
            maxAttempts = 3,
            delay = 1000,
            backoffMultiplier = 2,
            shouldRetry = () => true
        } = options;

        let lastError: Error;
        let currentDelay = delay;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                
                console.log(`Attempt ${attempt}/${maxAttempts} failed:`, lastError.message);
                
                if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
                    break;
                }
                
                await PromiseUtils.delay(currentDelay);
                currentDelay *= backoffMultiplier;
            }
        }

        throw new RetryError(
            `Operation failed after ${maxAttempts} attempts`,
            maxAttempts,
            lastError!
        );
    }

    /**
     * サーキットブレーカーパターン
     */
    static createCircuitBreaker<T>(
        operation: () => Promise<T>,
        options: {
            failureThreshold?: number;
            timeout?: number;
            resetTimeout?: number;
        } = {}
    ) {
        const {
            failureThreshold = 5,
            timeout = 30000,
            resetTimeout = 60000
        } = options;

        let failures = 0;
        let lastFailureTime = 0;
        let state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

        return async (): Promise<T> => {
            const now = Date.now();

            // 回路が開いている場合
            if (state === 'OPEN') {
                if (now - lastFailureTime < resetTimeout) {
                    throw new Error('Circuit breaker is OPEN');
                }
                state = 'HALF_OPEN';
            }

            try {
                const result = await this.withTimeout(operation(), timeout);
                
                // 成功時は回路を閉じる
                failures = 0;
                state = 'CLOSED';
                
                return result;
            } catch (error) {
                failures++;
                lastFailureTime = now;
                
                if (failures >= failureThreshold) {
                    state = 'OPEN';
                }
                
                throw error;
            }
        };
    }
}

// ===== 4. 実践的なPromiseパターン =====

/**
 * データローダークラス
 */
export class DataLoader<TKey, TValue> {
    private cache = new Map<TKey, Promise<TValue>>();
    private batchLoadFn: (keys: TKey[]) => Promise<TValue[]>;
    private batchSize: number;
    private currentBatch: TKey[] = [];
    private batchPromise: Promise<void> | null = null;

    constructor(
        batchLoadFn: (keys: TKey[]) => Promise<TValue[]>,
        options: { batchSize?: number; cacheSize?: number } = {}
    ) {
        this.batchLoadFn = batchLoadFn;
        this.batchSize = options.batchSize || 100;
    }

    async load(key: TKey): Promise<TValue> {
        // キャッシュから確認
        const cached = this.cache.get(key);
        if (cached) {
            return cached;
        }

        // 新しいPromiseを作成
        const promise = new Promise<TValue>((resolve, reject) => {
            this.currentBatch.push(key);

            // バッチ処理のスケジューリング
            if (!this.batchPromise) {
                this.batchPromise = this.scheduleBatch().then(() => {
                    this.batchPromise = null;
                });
            }

            // このキーの結果を待つ
            this.batchPromise.then(() => {
                const result = this.cache.get(key);
                if (result) {
                    result.then(resolve, reject);
                } else {
                    reject(new Error(`No result for key: ${key}`));
                }
            });
        });

        this.cache.set(key, promise);
        return promise;
    }

    private async scheduleBatch(): Promise<void> {
        // 次のイベントループで実行
        await PromiseUtils.delay(0);

        if (this.currentBatch.length === 0) {
            return;
        }

        const batchKeys = this.currentBatch.splice(0, this.batchSize);

        try {
            const results = await this.batchLoadFn(batchKeys);

            batchKeys.forEach((key, index) => {
                const value = results[index];
                this.cache.set(key, Promise.resolve(value));
            });
        } catch (error) {
            batchKeys.forEach(key => {
                this.cache.set(key, Promise.reject(error));
            });
        }
    }

    clear(): void {
        this.cache.clear();
    }

    clearKey(key: TKey): boolean {
        return this.cache.delete(key);
    }
}

/**
 * APIクライアントクラス（Promise ベース）
 */
export class PromiseBasedAPIClient {
    private baseUrl: string;
    private defaultHeaders: Record<string, string>;
    private requestQueue = new Map<string, Promise<any>>();

    constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...defaultHeaders
        };
    }

    /**
     * 重複リクエストを防ぐGET実装
     */
    async get<T>(
        endpoint: string,
        options: {
            headers?: Record<string, string>;
            timeout?: number;
            cache?: boolean;
        } = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const cacheKey = `GET:${url}`;

        // キャッシュされたリクエストがある場合は再利用
        if (options.cache !== false && this.requestQueue.has(cacheKey)) {
            return this.requestQueue.get(cacheKey)!;
        }

        const requestPromise = this.executeRequest<T>('GET', url, undefined, {
            ...options,
            headers: { ...this.defaultHeaders, ...options.headers }
        });

        if (options.cache !== false) {
            this.requestQueue.set(cacheKey, requestPromise);
            
            // リクエスト完了後にキューから削除
            requestPromise.finally(() => {
                this.requestQueue.delete(cacheKey);
            });
        }

        return requestPromise;
    }

    /**
     * POST リクエスト
     */
    async post<T>(
        endpoint: string,
        data?: any,
        options: {
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        
        return this.executeRequest<T>('POST', url, data, {
            ...options,
            headers: { ...this.defaultHeaders, ...options.headers }
        });
    }

    /**
     * 並行リクエスト実行
     */
    async parallel<T>(
        requests: Array<() => Promise<T>>,
        options: { concurrency?: number } = {}
    ): Promise<T[]> {
        const { concurrency = 5 } = options;
        return PromiseUtils.concurrent(requests, concurrency);
    }

    /**
     * 基本的なHTTPリクエスト実行
     */
    private async executeRequest<T>(
        method: string,
        url: string,
        data?: any,
        options: {
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<T> {
        const requestPromise = fetch(url, {
            method,
            headers: options.headers,
            body: data ? JSON.stringify(data) : undefined
        }).then(async response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                return response.text();
            }
        });

        if (options.timeout) {
            return ErrorHandler.withTimeout(requestPromise, options.timeout);
        }

        return requestPromise;
    }
}

// ===== 5. リアルタイム処理のPromiseパターン =====

/**
 * リアルタイムデータストリーム
 */
export class PromiseStream<T> {
    private subscribers: Array<(value: T) => void> = [];
    private errorHandlers: Array<(error: Error) => void> = [];
    private completeHandlers: Array<() => void> = [];
    private isCompleted = false;
    private lastError: Error | null = null;

    /**
     * 新しい値をストリームに送信
     */
    emit(value: T): void {
        if (this.isCompleted) {
            return;
        }

        this.subscribers.forEach(subscriber => {
            try {
                subscriber(value);
            } catch (error) {
                console.error('Error in stream subscriber:', error);
            }
        });
    }

    /**
     * エラーを送信
     */
    error(error: Error): void {
        this.lastError = error;
        this.errorHandlers.forEach(handler => {
            try {
                handler(error);
            } catch (e) {
                console.error('Error in error handler:', e);
            }
        });
    }

    /**
     * ストリームを完了
     */
    complete(): void {
        this.isCompleted = true;
        this.completeHandlers.forEach(handler => {
            try {
                handler();
            } catch (error) {
                console.error('Error in complete handler:', error);
            }
        });
    }

    /**
     * ストリームを購読
     */
    subscribe(
        onNext: (value: T) => void,
        onError?: (error: Error) => void,
        onComplete?: () => void
    ): () => void {
        this.subscribers.push(onNext);
        
        if (onError) {
            this.errorHandlers.push(onError);
        }
        
        if (onComplete) {
            this.completeHandlers.push(onComplete);
        }

        // 購読解除関数を返す
        return () => {
            const nextIndex = this.subscribers.indexOf(onNext);
            if (nextIndex >= 0) {
                this.subscribers.splice(nextIndex, 1);
            }
            
            if (onError) {
                const errorIndex = this.errorHandlers.indexOf(onError);
                if (errorIndex >= 0) {
                    this.errorHandlers.splice(errorIndex, 1);
                }
            }
            
            if (onComplete) {
                const completeIndex = this.completeHandlers.indexOf(onComplete);
                if (completeIndex >= 0) {
                    this.completeHandlers.splice(completeIndex, 1);
                }
            }
        };
    }

    /**
     * ストリームを変換
     */
    map<U>(transform: (value: T) => U): PromiseStream<U> {
        const newStream = new PromiseStream<U>();
        
        this.subscribe(
            value => {
                try {
                    const transformed = transform(value);
                    newStream.emit(transformed);
                } catch (error) {
                    newStream.error(error as Error);
                }
            },
            error => newStream.error(error),
            () => newStream.complete()
        );
        
        return newStream;
    }

    /**
     * ストリームをフィルタ
     */
    filter(predicate: (value: T) => boolean): PromiseStream<T> {
        const newStream = new PromiseStream<T>();
        
        this.subscribe(
            value => {
                try {
                    if (predicate(value)) {
                        newStream.emit(value);
                    }
                } catch (error) {
                    newStream.error(error as Error);
                }
            },
            error => newStream.error(error),
            () => newStream.complete()
        );
        
        return newStream;
    }

    /**
     * 最初のN個の値を取得
     */
    take(count: number): Promise<T[]> {
        return new Promise((resolve, reject) => {
            const results: T[] = [];
            
            const unsubscribe = this.subscribe(
                value => {
                    results.push(value);
                    if (results.length >= count) {
                        unsubscribe();
                        resolve(results);
                    }
                },
                error => {
                    unsubscribe();
                    reject(error);
                },
                () => {
                    unsubscribe();
                    resolve(results);
                }
            );
        });
    }
}

// ===== 6. デモとテスト関数 =====

/**
 * Promise デモ実行関数
 */
export async function runPromiseDeepDiveDemo(): Promise<void> {
    console.log('🚀 Starting Promise Deep Dive Demo\n');

    try {
        // 1. 基本的なPromise操作
        console.log('=== Basic Promise Operations ===');
        const basicPromise = PromiseUtils.delayedValue('Hello Promise!', 500);
        const result = await basicPromise;
        console.log('✅ Basic promise result:', result);

        // 2. Promise.allの使用例
        console.log('\n=== Promise.all Example ===');
        const parallelPromises = [
            PromiseUtils.delayedValue('Task 1', 300),
            PromiseUtils.delayedValue('Task 2', 200),
            PromiseUtils.delayedValue('Task 3', 400)
        ];
        const parallelResults = await Promise.all(parallelPromises);
        console.log('✅ Parallel results:', parallelResults);

        // 3. Promise.allSettled の使用例
        console.log('\n=== Promise.allSettled Example ===');
        const mixedPromises = [
            PromiseUtils.delayedValue('Success 1', 200),
            PromiseUtils.probabilistic('Success 2', new Error('Random failure'), 0.3),
            PromiseUtils.delayedValue('Success 3', 300)
        ];
        const settledResults = await PromiseUtils.allSettled(mixedPromises);
        settledResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`✅ Promise ${index}: ${result.value}`);
            } else {
                console.log(`❌ Promise ${index}: ${result.reason.message}`);
            }
        });

        // 4. エラーハンドリングとリトライ
        console.log('\n=== Error Handling and Retry ===');
        let attemptCount = 0;
        try {
            const retryResult = await ErrorHandler.withRetry(async () => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('Simulated failure');
                }
                return `Success after ${attemptCount} attempts`;
            }, { maxAttempts: 5, delay: 100 });
            
            console.log('✅ Retry result:', retryResult);
        } catch (error) {
            console.log('❌ Retry failed:', error.message);
        }

        // 5. DataLoader の使用例
        console.log('\n=== DataLoader Example ===');
        const userLoader = new DataLoader<string, { id: string; name: string }>(
            async (userIds) => {
                console.log('Batch loading users:', userIds);
                await PromiseUtils.delay(200);
                return userIds.map(id => ({ id, name: `User ${id}` }));
            }
        );

        // 複数のユーザーを並行で読み込み（バッチ処理される）
        const userPromises = ['1', '2', '3', '4', '5'].map(id => userLoader.load(id));
        const users = await Promise.all(userPromises);
        console.log('✅ Loaded users:', users.map(u => u.name).join(', '));

        // 6. PromiseStream の使用例
        console.log('\n=== Promise Stream Example ===');
        const numberStream = new PromiseStream<number>();
        
        // ストリームの変換とフィルタリング
        const evenSquares = numberStream
            .filter(n => n % 2 === 0)
            .map(n => n * n);
        
        // 購読開始
        const unsubscribe = evenSquares.subscribe(
            value => console.log(`📊 Even square: ${value}`),
            error => console.error('Stream error:', error),
            () => console.log('🏁 Stream completed')
        );

        // データを送信
        for (let i = 1; i <= 10; i++) {
            numberStream.emit(i);
            await PromiseUtils.delay(50);
        }
        numberStream.complete();

        // 7. API クライアント例
        console.log('\n=== API Client Example ===');
        // 注意: 実際のAPIエンドポイントが必要
        // const apiClient = new PromiseBasedAPIClient('https://jsonplaceholder.typicode.com');
        // const posts = await apiClient.get('/posts?_limit=3');
        // console.log('✅ API data fetched:', posts.length, 'posts');

        console.log('\n🎉 Promise Deep Dive Demo completed successfully!');

    } catch (error) {
        console.error('❌ Demo failed:', error);
    }
}

// ===== エクスポート用の型定義 =====

export interface PromiseResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    duration: number;
}

export interface BatchLoaderOptions {
    batchSize?: number;
    maxBatchDelay?: number;
    cacheSize?: number;
}

export interface RetryOptions {
    maxAttempts?: number;
    delay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface CircuitBreakerOptions {
    failureThreshold?: number;
    timeout?: number;
    resetTimeout?: number;
}

// デモ実行（このファイルが直接実行された場合）
if (require.main === module) {
    runPromiseDeepDiveDemo();
}