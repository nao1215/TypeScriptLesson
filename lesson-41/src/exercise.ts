/**
 * Lesson 41: 非同期処理の基礎 - 演習問題
 * 
 * 以下の演習問題を通じて、非同期処理の基本概念を理解しましょう。
 * 各問題には型定義も含まれているので、TypeScriptの型システムも活用してください。
 */

// ===== 型定義 =====

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

// ===== 演習問題 =====

/**
 * 演習1: Callback パターンの実装
 * 
 * 商品情報を取得するコールバック関数を実装してください。
 * - productId が 'invalid' の場合はエラーを返す
 * - それ以外の場合は適当な商品情報を返す
 * - 500-1000ms のランダムな遅延を含める
 */
export function fetchProduct(
    productId: string, 
    callback: (error: Error | null, product?: Product) => void
): void {
    // TODO: ここに実装してください
    
}

/**
 * 演習2: Promise パターンの実装
 * 
 * 上記のfetchProduct関数をPromise版に変換してください。
 */
export function fetchProductPromise(productId: string): Promise<Product> {
    // TODO: ここに実装してください
    return Promise.resolve({} as Product);
}

/**
 * 演習3: 複数の商品を並行取得
 * 
 * 複数の商品IDを受け取り、すべての商品情報を並行で取得してください。
 * Promise.all を使用すること。
 */
export async function fetchMultipleProducts(productIds: string[]): Promise<Product[]> {
    // TODO: ここに実装してください
    return [];
}

/**
 * 演習4: エラーハンドリング付きの注文作成
 * 
 * 注文を作成する非同期関数を実装してください。
 * - 商品の在庫確認を行う（非同期）
 * - 在庫がない場合はエラーを投げる
 * - 注文作成処理（非同期）
 * - 適切なエラーハンドリングを含める
 */
export async function createOrder(userId: string, productIds: string[]): Promise<Order> {
    // TODO: ここに実装してください
    return {} as Order;
}

/**
 * 演習5: リトライ機能の実装
 * 
 * 指定された非同期操作を、失敗した場合に指定回数までリトライする
 * 汎用的な関数を実装してください。
 * - 指数バックオフ（遅延時間を倍々に増加）を実装
 * - 最大リトライ回数に達したら最後のエラーを投げる
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    // TODO: ここに実装してください
    return {} as T;
}

/**
 * 演習6: タイムアウト機能付きの処理
 * 
 * 指定された非同期処理に対してタイムアウトを設定する関数を実装してください。
 * - 指定時間内に完了しなかった場合は TimeoutError を投げる
 * - Promise.race を使用すること
 */
export class TimeoutError extends Error {
    constructor(timeout: number) {
        super(`Operation timed out after ${timeout}ms`);
        this.name = 'TimeoutError';
    }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    // TODO: ここに実装してください
    return promise;
}

/**
 * 演習7: キューベースの処理実行
 * 
 * 非同期処理を順次実行するキューを実装してください。
 * - 同時実行数を制限できること
 * - 処理の追加と完了を追跡できること
 */
export class AsyncQueue {
    private maxConcurrent: number;
    private currentRunning: number = 0;
    private queue: Array<() => Promise<any>> = [];

    constructor(maxConcurrent: number = 1) {
        this.maxConcurrent = maxConcurrent;
    }

    async add<T>(task: () => Promise<T>): Promise<T> {
        // TODO: ここに実装してください
        return {} as T;
    }

    private async processQueue(): Promise<void> {
        // TODO: ここに実装してください
    }

    get size(): number {
        return this.queue.length;
    }

    get running(): number {
        return this.currentRunning;
    }
}

/**
 * 演習8: 天気情報APIクライアント
 * 
 * 天気情報を取得するAPIクライアントクラスを実装してください。
 * - 複数都市の天気を並行取得できる
 * - キャッシュ機能（5分間）
 * - エラー処理とリトライ機能
 */
export class WeatherApiClient {
    private cache: Map<string, { data: WeatherData; expiry: number }> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分

    async getWeather(city: string): Promise<WeatherData> {
        // TODO: ここに実装してください
        return {} as WeatherData;
    }

    async getMultipleCitiesWeather(cities: string[]): Promise<WeatherData[]> {
        // TODO: ここに実装してください
        return [];
    }

    private isValidCache(cacheEntry: { data: WeatherData; expiry: number }): boolean {
        return Date.now() < cacheEntry.expiry;
    }

    private async fetchWeatherData(city: string): Promise<WeatherData> {
        // 実際のAPI呼び出しをシミュレート
        await this.delay(Math.random() * 1000 + 500);
        
        if (city === 'error') {
            throw new Error('City not found');
        }

        return {
            city,
            temperature: Math.floor(Math.random() * 30) + 10,
            humidity: Math.floor(Math.random() * 50) + 30,
            condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
            timestamp: new Date()
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    clearCache(): void {
        this.cache.clear();
    }
}

/**
 * 演習9: イベントベースの処理
 * 
 * イベント駆動の非同期処理システムを実装してください。
 * - イベントの登録と発火
 * - 非同期イベントハンドラー
 * - エラーイベントの処理
 */
export class AsyncEventEmitter {
    private listeners: Map<string, Array<(...args: any[]) => Promise<any> | any>> = new Map();

    on(event: string, listener: (...args: any[]) => Promise<any> | any): void {
        // TODO: ここに実装してください
    }

    off(event: string, listener: (...args: any[]) => Promise<any> | any): void {
        // TODO: ここに実装してください
    }

    async emit(event: string, ...args: any[]): Promise<void> {
        // TODO: ここに実装してください
        // すべてのリスナーを並行実行し、エラーハンドリングも含める
    }

    once(event: string, listener: (...args: any[]) => Promise<any> | any): void {
        // TODO: ここに実装してください
        // 一度だけ実行されるリスナーを実装
    }
}

/**
 * 演習10: 実践的なファイルアップロード処理
 * 
 * ファイルアップロードの進捗を追跡する機能を実装してください。
 * - プログレス状況の報告
 * - アップロード失敗時のリトライ
 * - 複数ファイルの並行アップロード
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

    constructor(maxConcurrentUploads: number = 3) {
        this.maxConcurrentUploads = maxConcurrentUploads;
    }

    async uploadFile(
        file: { name: string; size: number; data: ArrayBuffer },
        onProgress?: (progress: FileUploadProgress) => void
    ): Promise<FileUploadResult> {
        // TODO: ここに実装してください
        return {} as FileUploadResult;
    }

    async uploadMultipleFiles(
        files: Array<{ name: string; size: number; data: ArrayBuffer }>,
        onProgress?: (filename: string, progress: FileUploadProgress) => void
    ): Promise<FileUploadResult[]> {
        // TODO: ここに実装してください
        return [];
    }

    private simulateUploadProgress(
        file: { name: string; size: number },
        onProgress?: (progress: FileUploadProgress) => void
    ): Promise<FileUploadResult> {
        return new Promise((resolve, reject) => {
            let bytesUploaded = 0;
            const chunkSize = Math.max(file.size / 20, 1024); // 20チャンクに分割
            
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
                        resolve({
                            filename: file.name,
                            url: `https://example.com/uploads/${file.name}`,
                            uploadTime: Date.now()
                        });
                    } else {
                        // 5%の確率で失敗をシミュレート
                        if (Math.random() < 0.05) {
                            reject(new Error(`Upload failed for ${file.name}`));
                        } else {
                            uploadChunk();
                        }
                    }
                }, Math.random() * 100 + 50);
            };
            
            uploadChunk();
        });
    }
}

// ===== テスト実行関数 =====

/**
 * 演習の解答をテストする関数
 * 実際に演習を解いた後、この関数を使って動作確認できます
 */
export async function runExerciseTests(): Promise<void> {
    console.log('🧪 Running Exercise Tests...\n');

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
        console.log('Testing Exercise 2 (Promise Pattern)...');
        try {
            const product = await fetchProductPromise('456');
            console.log('✅ Exercise 2 passed:', product.name);
        } catch (error) {
            console.log('❌ Exercise 2 failed:', error.message);
        }

        // 演習3のテスト
        console.log('Testing Exercise 3 (Multiple Products)...');
        try {
            const products = await fetchMultipleProducts(['123', '456', '789']);
            console.log('✅ Exercise 3 passed:', products.length, 'products');
        } catch (error) {
            console.log('❌ Exercise 3 failed:', error.message);
        }

        // その他の演習テストも同様に追加...

        console.log('\n🎉 Exercise tests completed!');

    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

// ===== ヒント =====

/**
 * 演習のヒント:
 * 
 * 1. Callbackパターンでは、エラーファーストの形式を使用する
 * 2. Promiseでは、resolveとrejectを適切に使い分ける
 * 3. async/awaitでは、try-catchでエラーハンドリングを行う
 * 4. Promise.allは並行処理、for-awaitは順次処理
 * 5. setTimeout を使って非同期処理をシミュレートできる
 * 6. 型定義を活用して、TypeScriptの恩恵を受ける
 * 7. エラーハンドリングは必ず実装する
 * 8. リトライ処理では指数バックオフを検討する
 * 9. タイムアウト処理では Promise.race を活用する
 * 10. キューやイベントシステムでは状態管理に注意する
 */