/**
 * Lesson 41: 非同期処理の基礎 - 演習解答
 * 
 * exercise.ts の演習問題に対する完全な解答例です。
 * 実際のWebアプリケーション開発で使える実装パターンを含んでいます。
 */

// ===== 型定義（exercise.tsから再利用） =====

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}

interface Order {
    id: string;
    userId: string;
    products: Product[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    createdAt: Date;
}

interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

interface WeatherData {
    city: string;
    temperature: number;
    humidity: number;
    condition: string;
    timestamp: Date;
}

// ===== 演習解答 =====

/**
 * 解答1: Callback パターンの実装
 */
export function fetchProduct(
    productId: string, 
    callback: (error: Error | null, product?: Product) => void
): void {
    // ランダムな遅延でAPIリクエストをシミュレート
    const delay = Math.random() * 500 + 500; // 500-1000ms
    
    setTimeout(() => {
        if (productId === 'invalid') {
            callback(new Error(`Product not found: ${productId}`));
        } else {
            const product: Product = {
                id: productId,
                name: `Product ${productId}`,
                price: Math.floor(Math.random() * 1000) + 100,
                category: ['Electronics', 'Books', 'Clothing'][Math.floor(Math.random() * 3)],
                inStock: Math.random() > 0.2 // 80%の確率で在庫あり
            };
            callback(null, product);
        }
    }, delay);
}

/**
 * 解答2: Promise パターンの実装
 */
export function fetchProductPromise(productId: string): Promise<Product> {
    return new Promise((resolve, reject) => {
        const delay = Math.random() * 500 + 500;
        
        setTimeout(() => {
            if (productId === 'invalid') {
                reject(new Error(`Product not found: ${productId}`));
            } else {
                const product: Product = {
                    id: productId,
                    name: `Product ${productId}`,
                    price: Math.floor(Math.random() * 1000) + 100,
                    category: ['Electronics', 'Books', 'Clothing'][Math.floor(Math.random() * 3)],
                    inStock: Math.random() > 0.2
                };
                resolve(product);
            }
        }, delay);
    });
}

/**
 * 解答3: 複数の商品を並行取得
 */
export async function fetchMultipleProducts(productIds: string[]): Promise<Product[]> {
    try {
        // Promise.allで並行処理
        const products = await Promise.all(
            productIds.map(id => fetchProductPromise(id))
        );
        return products;
    } catch (error) {
        throw new Error(`Failed to fetch multiple products: ${error.message}`);
    }
}

/**
 * 解答4: エラーハンドリング付きの注文作成
 */
export async function createOrder(userId: string, productIds: string[]): Promise<Order> {
    try {
        // 1. 商品情報を取得
        console.log('Fetching product information...');
        const products = await fetchMultipleProducts(productIds);
        
        // 2. 在庫確認
        console.log('Checking inventory...');
        const outOfStockProducts = products.filter(p => !p.inStock);
        if (outOfStockProducts.length > 0) {
            throw new Error(`Out of stock products: ${outOfStockProducts.map(p => p.name).join(', ')}`);
        }
        
        // 3. 注文合計金額を計算
        const total = products.reduce((sum, product) => sum + product.price, 0);
        
        // 4. 注文作成処理（非同期）
        console.log('Creating order...');
        await new Promise(resolve => setTimeout(resolve, 300)); // API呼び出しをシミュレート
        
        const order: Order = {
            id: `order_${Date.now()}`,
            userId,
            products,
            total,
            status: 'pending',
            createdAt: new Date()
        };
        
        console.log(`Order created successfully: ${order.id}`);
        return order;
        
    } catch (error) {
        console.error('Order creation failed:', error.message);
        throw new Error(`Failed to create order: ${error.message}`);
    }
}

/**
 * 解答5: リトライ機能の実装
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error;
    let currentDelay = initialDelay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
            return await operation();
        } catch (error) {
            lastError = error as Error;
            console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
            
            if (attempt < maxRetries) {
                console.log(`⏳ Waiting ${currentDelay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= 2; // 指数バックオフ
            }
        }
    }
    
    throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError!.message}`);
}

/**
 * 解答6: タイムアウト機能付きの処理
 */
export class TimeoutError extends Error {
    constructor(timeout: number) {
        super(`Operation timed out after ${timeout}ms`);
        this.name = 'TimeoutError';
    }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new TimeoutError(timeoutMs));
        }, timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
}

/**
 * 解答7: キューベースの処理実行
 */
export class AsyncQueue {
    private maxConcurrent: number;
    private currentRunning: number = 0;
    private queue: Array<{
        task: () => Promise<any>;
        resolve: (value: any) => void;
        reject: (error: any) => void;
    }> = [];

    constructor(maxConcurrent: number = 1) {
        this.maxConcurrent = maxConcurrent;
    }

    async add<T>(task: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.currentRunning >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        const { task, resolve, reject } = this.queue.shift()!;
        this.currentRunning++;

        try {
            const result = await task();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.currentRunning--;
            this.processQueue(); // 次のタスクを処理
        }
    }

    get size(): number {
        return this.queue.length;
    }

    get running(): number {
        return this.currentRunning;
    }
}

/**
 * 解答8: 天気情報APIクライアント
 */
export class WeatherApiClient {
    private cache: Map<string, { data: WeatherData; expiry: number }> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分

    async getWeather(city: string): Promise<WeatherData> {
        // キャッシュ確認
        const cached = this.cache.get(city);
        if (cached && this.isValidCache(cached)) {
            console.log(`🎯 Cache hit for ${city}`);
            return cached.data;
        }

        // APIからデータを取得（リトライ機能付き）
        console.log(`🌐 Fetching weather data for ${city}...`);
        const weatherData = await retryOperation(
            () => this.fetchWeatherData(city),
            3,
            500
        );

        // キャッシュに保存
        this.cache.set(city, {
            data: weatherData,
            expiry: Date.now() + this.CACHE_DURATION
        });

        return weatherData;
    }

    async getMultipleCitiesWeather(cities: string[]): Promise<WeatherData[]> {
        try {
            // 並行処理で複数都市の天気を取得
            const weatherPromises = cities.map(city => this.getWeather(city));
            return await Promise.all(weatherPromises);
        } catch (error) {
            throw new Error(`Failed to fetch weather for multiple cities: ${error.message}`);
        }
    }

    private isValidCache(cacheEntry: { data: WeatherData; expiry: number }): boolean {
        return Date.now() < cacheEntry.expiry;
    }

    private async fetchWeatherData(city: string): Promise<WeatherData> {
        // 実際のAPI呼び出しをシミュレート
        await this.delay(Math.random() * 1000 + 500);
        
        // エラーケースのシミュレート
        if (city === 'error') {
            throw new Error('City not found');
        }

        // ランダムな確率でAPIエラーをシミュレート（テスト用）
        if (Math.random() < 0.1) {
            throw new Error('API temporarily unavailable');
        }

        return {
            city,
            temperature: Math.floor(Math.random() * 30) + 10,
            humidity: Math.floor(Math.random() * 50) + 30,
            condition: ['sunny', 'cloudy', 'rainy', 'snowy'][Math.floor(Math.random() * 4)],
            timestamp: new Date()
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    clearCache(): void {
        console.log('🗑️ Clearing weather cache');
        this.cache.clear();
    }

    getCacheStats(): { size: number; entries: string[] } {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

/**
 * 解答9: イベントベースの処理
 */
export class AsyncEventEmitter {
    private listeners: Map<string, Array<(...args: any[]) => Promise<any> | any>> = new Map();

    on(event: string, listener: (...args: any[]) => Promise<any> | any): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(listener);
    }

    off(event: string, listener: (...args: any[]) => Promise<any> | any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(listener);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
    }

    async emit(event: string, ...args: any[]): Promise<void> {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners || eventListeners.length === 0) {
            return;
        }

        // すべてのリスナーを並行実行
        const promises = eventListeners.map(async (listener) => {
            try {
                const result = listener(...args);
                // Promiseの場合は await、そうでなければそのまま返す
                return result instanceof Promise ? await result : result;
            } catch (error) {
                console.error(`Event listener error for '${event}':`, error.message);
                // エラーイベントを発火
                if (event !== 'error') {
                    this.emit('error', error, event, ...args);
                }
            }
        });

        await Promise.all(promises);
    }

    once(event: string, listener: (...args: any[]) => Promise<any> | any): void {
        const onceWrapper = async (...args: any[]) => {
            this.off(event, onceWrapper);
            const result = listener(...args);
            return result instanceof Promise ? await result : result;
        };
        this.on(event, onceWrapper);
    }

    listenerCount(event: string): number {
        return this.listeners.get(event)?.length || 0;
    }

    eventNames(): string[] {
        return Array.from(this.listeners.keys());
    }

    removeAllListeners(event?: string): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}

/**
 * 解答10: 実践的なファイルアップロード処理
 */
export interface FileUploadProgress {
    filename: string;
    bytesUploaded: number;
    totalBytes: number;
    percentage: number;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
}

export interface FileUploadResult {
    filename: string;
    url: string;
    uploadTime: number;
}

export class FileUploader {
    private maxConcurrentUploads: number;
    private uploadQueue: AsyncQueue;

    constructor(maxConcurrentUploads: number = 3) {
        this.maxConcurrentUploads = maxConcurrentUploads;
        this.uploadQueue = new AsyncQueue(maxConcurrentUploads);
    }

    async uploadFile(
        file: { name: string; size: number; data: ArrayBuffer },
        onProgress?: (progress: FileUploadProgress) => void
    ): Promise<FileUploadResult> {
        return this.uploadQueue.add(async () => {
            return await retryOperation(
                () => this.simulateUploadProgress(file, onProgress),
                3,  // 最大3回リトライ
                1000 // 初期遅延1秒
            );
        });
    }

    async uploadMultipleFiles(
        files: Array<{ name: string; size: number; data: ArrayBuffer }>,
        onProgress?: (filename: string, progress: FileUploadProgress) => void
    ): Promise<FileUploadResult[]> {
        const uploadPromises = files.map(file => 
            this.uploadFile(file, (progress) => {
                onProgress?.(file.name, progress);
            })
        );

        try {
            return await Promise.all(uploadPromises);
        } catch (error) {
            throw new Error(`Multiple file upload failed: ${error.message}`);
        }
    }

    private simulateUploadProgress(
        file: { name: string; size: number },
        onProgress?: (progress: FileUploadProgress) => void
    ): Promise<FileUploadResult> {
        return new Promise((resolve, reject) => {
            let bytesUploaded = 0;
            const chunkSize = Math.max(file.size / 20, 1024); // 20チャンクに分割
            const startTime = Date.now();
            
            // 初期状態を報告
            onProgress?.({
                filename: file.name,
                bytesUploaded: 0,
                totalBytes: file.size,
                percentage: 0,
                status: 'uploading'
            });

            const uploadChunk = () => {
                setTimeout(() => {
                    bytesUploaded += chunkSize;
                    if (bytesUploaded > file.size) bytesUploaded = file.size;
                    
                    const progress: FileUploadProgress = {
                        filename: file.name,
                        bytesUploaded,
                        totalBytes: file.size,
                        percentage: Math.round((bytesUploaded / file.size) * 100),
                        status: bytesUploaded >= file.size ? 'completed' : 'uploading'
                    };
                    
                    onProgress?.(progress);
                    
                    if (bytesUploaded >= file.size) {
                        const uploadTime = Date.now() - startTime;
                        resolve({
                            filename: file.name,
                            url: `https://cdn.example.com/uploads/${Date.now()}_${file.name}`,
                            uploadTime
                        });
                    } else {
                        // 3%の確率で失敗をシミュレート
                        if (Math.random() < 0.03) {
                            onProgress?.({
                                ...progress,
                                status: 'failed'
                            });
                            reject(new Error(`Upload failed for ${file.name} at ${progress.percentage}%`));
                        } else {
                            uploadChunk();
                        }
                    }
                }, Math.random() * 100 + 50);
            };
            
            uploadChunk();
        });
    }

    getQueueStats(): { size: number; running: number } {
        return {
            size: this.uploadQueue.size,
            running: this.uploadQueue.running
        };
    }
}

// ===== 実践的な使用例とデモ =====

/**
 * 実際のWebアプリケーションでの使用例デモ
 */
export class WebAppDemo {
    private eventEmitter = new AsyncEventEmitter();
    private weatherClient = new WeatherApiClient();
    private fileUploader = new FileUploader(2);

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // 成功イベントのリスナー
        this.eventEmitter.on('user:login', async (userId: string) => {
            console.log(`👤 User ${userId} logged in`);
            await this.loadUserData(userId);
        });

        // エラーイベントのリスナー
        this.eventEmitter.on('error', (error: Error, context: string) => {
            console.error(`🚨 Error in ${context}: ${error.message}`);
            this.logError(error, context);
        });

        // ファイルアップロードイベント
        this.eventEmitter.on('file:upload', async (files: Array<{ name: string; size: number; data: ArrayBuffer }>) => {
            console.log(`📁 Starting upload of ${files.length} files`);
            await this.handleFileUpload(files);
        });
    }

    async simulateWebAppWorkflow(): Promise<void> {
        console.log('🌐 Starting Web Application Demo\n');

        try {
            // 1. ユーザーログインイベントを発火
            await this.eventEmitter.emit('user:login', 'user123');

            // 2. 天気情報の取得（複数都市）
            console.log('\n🌤️ Fetching weather information...');
            const cities = ['Tokyo', 'New York', 'London', 'Paris'];
            const weatherData = await this.weatherClient.getMultipleCitiesWeather(cities);
            weatherData.forEach(data => {
                console.log(`${data.city}: ${data.temperature}°C, ${data.condition}`);
            });

            // 3. ファイルアップロードのシミュレーション
            console.log('\n📤 Simulating file uploads...');
            const mockFiles = [
                { name: 'document1.pdf', size: 1024 * 1024, data: new ArrayBuffer(1024 * 1024) },
                { name: 'image1.jpg', size: 2 * 1024 * 1024, data: new ArrayBuffer(2 * 1024 * 1024) },
                { name: 'video1.mp4', size: 5 * 1024 * 1024, data: new ArrayBuffer(5 * 1024 * 1024) }
            ];

            await this.eventEmitter.emit('file:upload', mockFiles);

            // 4. エラーハンドリングのデモ
            console.log('\n⚠️ Testing error handling...');
            try {
                await withTimeout(
                    this.weatherClient.getWeather('error'),
                    2000
                );
            } catch (error) {
                console.log('✅ Error handling working correctly:', error.message);
            }

            console.log('\n🎉 Web application demo completed successfully!');

        } catch (error) {
            console.error('❌ Demo failed:', error.message);
            await this.eventEmitter.emit('error', error, 'demo');
        }
    }

    private async loadUserData(userId: string): Promise<void> {
        try {
            // ユーザーデータの読み込みをシミュレート
            await retryOperation(async () => {
                const userData = await fetchProductPromise(userId); // 仮のデータ取得
                console.log(`✅ User data loaded: ${userData.name}`);
                return userData;
            }, 2, 500);
        } catch (error) {
            throw new Error(`Failed to load user data: ${error.message}`);
        }
    }

    private async handleFileUpload(files: Array<{ name: string; size: number; data: ArrayBuffer }>): Promise<void> {
        const results = await this.fileUploader.uploadMultipleFiles(
            files,
            (filename, progress) => {
                console.log(`📊 ${filename}: ${progress.percentage}% (${progress.status})`);
            }
        );

        console.log('✅ All files uploaded successfully:');
        results.forEach(result => {
            console.log(`   ${result.filename} -> ${result.url} (${result.uploadTime}ms)`);
        });
    }

    private logError(error: Error, context: string): void {
        // 実際のアプリケーションではログサービスに送信
        console.log('📝 Logging error:', {
            context,
            message: error.message,
            stack: error.stack?.split('\n')[0],
            timestamp: new Date().toISOString()
        });
    }

    // キャッシュやリソースのクリーンアップ
    cleanup(): void {
        this.weatherClient.clearCache();
        this.eventEmitter.removeAllListeners();
        console.log('🧹 Cleaned up resources');
    }
}

// ===== テスト実行関数 =====

/**
 * すべての解答をテストする関数
 */
export async function runSolutionTests(): Promise<void> {
    console.log('🧪 Running Solution Tests...\n');

    try {
        // 演習1のテスト
        console.log('Testing Exercise 1 (Callback Pattern)...');
        await new Promise<void>((resolve) => {
            fetchProduct('123', (error, product) => {
                if (error) {
                    console.log('❌ Exercise 1 failed:', error.message);
                } else {
                    console.log('✅ Exercise 1 passed:', product?.name);
                }
                resolve();
            });
        });

        // 演習2のテスト
        console.log('\nTesting Exercise 2 (Promise Pattern)...');
        try {
            const product = await fetchProductPromise('456');
            console.log('✅ Exercise 2 passed:', product.name);
        } catch (error) {
            console.log('❌ Exercise 2 failed:', error.message);
        }

        // 演習3のテスト
        console.log('\nTesting Exercise 3 (Multiple Products)...');
        try {
            const products = await fetchMultipleProducts(['123', '456', '789']);
            console.log('✅ Exercise 3 passed:', products.length, 'products fetched');
        } catch (error) {
            console.log('❌ Exercise 3 failed:', error.message);
        }

        // 演習4のテスト
        console.log('\nTesting Exercise 4 (Order Creation)...');
        try {
            const order = await createOrder('user123', ['123', '456']);
            console.log('✅ Exercise 4 passed: Order', order.id, 'created');
        } catch (error) {
            console.log('❌ Exercise 4 failed:', error.message);
        }

        // 演習5のテスト
        console.log('\nTesting Exercise 5 (Retry Mechanism)...');
        let attemptCount = 0;
        try {
            await retryOperation(async () => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('Simulated failure');
                }
                return 'Success!';
            }, 3, 100);
            console.log('✅ Exercise 5 passed: Retry succeeded');
        } catch (error) {
            console.log('❌ Exercise 5 failed:', error.message);
        }

        // 演習6のテスト
        console.log('\nTesting Exercise 6 (Timeout)...');
        try {
            await withTimeout(
                new Promise(resolve => setTimeout(() => resolve('success'), 2000)),
                1000
            );
            console.log('❌ Exercise 6 failed: Should have timed out');
        } catch (error) {
            if (error instanceof TimeoutError) {
                console.log('✅ Exercise 6 passed: Timeout working correctly');
            } else {
                console.log('❌ Exercise 6 failed:', error.message);
            }
        }

        // 演習7のテスト
        console.log('\nTesting Exercise 7 (Async Queue)...');
        const queue = new AsyncQueue(2);
        const tasks = Array.from({ length: 5 }, (_, i) => 
            queue.add(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return `Task ${i + 1}`;
            })
        );
        const results = await Promise.all(tasks);
        console.log('✅ Exercise 7 passed:', results.join(', '));

        // 演習8のテスト
        console.log('\nTesting Exercise 8 (Weather API Client)...');
        const weatherClient = new WeatherApiClient();
        try {
            const weather = await weatherClient.getMultipleCitiesWeather(['Tokyo', 'London']);
            console.log('✅ Exercise 8 passed:', weather.length, 'weather reports');
        } catch (error) {
            console.log('❌ Exercise 8 failed:', error.message);
        }

        // 演習9のテスト
        console.log('\nTesting Exercise 9 (Event Emitter)...');
        const emitter = new AsyncEventEmitter();
        let eventReceived = false;
        emitter.on('test', async (data: string) => {
            eventReceived = true;
            console.log('Event received:', data);
        });
        await emitter.emit('test', 'Hello World');
        console.log(eventReceived ? '✅ Exercise 9 passed' : '❌ Exercise 9 failed');

        // 演習10のテスト
        console.log('\nTesting Exercise 10 (File Uploader)...');
        const uploader = new FileUploader(2);
        const mockFile = { name: 'test.txt', size: 1024, data: new ArrayBuffer(1024) };
        try {
            const result = await uploader.uploadFile(mockFile, (progress) => {
                if (progress.percentage % 20 === 0) {
                    console.log(`Upload progress: ${progress.percentage}%`);
                }
            });
            console.log('✅ Exercise 10 passed:', result.filename, 'uploaded');
        } catch (error) {
            console.log('❌ Exercise 10 failed:', error.message);
        }

        // 総合デモの実行
        console.log('\n🌟 Running comprehensive web app demo...');
        const demo = new WebAppDemo();
        await demo.simulateWebAppWorkflow();
        demo.cleanup();

        console.log('\n🎉 All solution tests completed!');

    } catch (error) {
        console.error('❌ Solution test execution failed:', error);
    }
}

// デモ実行（このファイルが直接実行された場合）
if (require.main === module) {
    runSolutionTests();
}