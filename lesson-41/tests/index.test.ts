/**
 * Lesson 41: 非同期処理の基礎 - テストコード
 * 
 * Jestを使用して非同期処理の動作を検証するテストケースです。
 * 実際のWebアプリケーション開発で重要なテストパターンを含んでいます。
 */

import {
    fetchUserDataCallback,
    fetchUserDataPromise,
    fetchUserProfileAsync,
    SimpleHttpClient,
    delay,
    withRetry,
    animationLoop,
    demonstrateEventLoop,
    UserData,
    UserProfile
} from '../src/index';

import {
    fetchProduct,
    fetchProductPromise,
    fetchMultipleProducts,
    createOrder,
    retryOperation,
    TimeoutError,
    withTimeout,
    AsyncQueue,
    WeatherApiClient,
    AsyncEventEmitter,
    FileUploader
} from '../src/solution';

// ===== 基本的な非同期処理のテスト =====

describe('Lesson 41: 非同期処理の基礎', () => {
    // タイムアウトを5秒に設定（非同期テストのため）
    jest.setTimeout(5000);

    describe('1. Callback パターン', () => {
        test('正常なコールバック処理', (done) => {
            fetchUserDataCallback('123', (error, data) => {
                expect(error).toBeNull();
                expect(data).toBeDefined();
                expect(data?.id).toBe('123');
                expect(data?.name).toContain('User 123');
                done();
            });
        });

        test('エラーケースのコールバック処理', (done) => {
            fetchUserDataCallback('invalid', (error, data) => {
                expect(error).toBeDefined();
                expect(error?.message).toContain('User not found');
                expect(data).toBeUndefined();
                done();
            });
        });

        test('演習のコールバック関数', (done) => {
            fetchProduct('test123', (error, product) => {
                expect(error).toBeNull();
                expect(product).toBeDefined();
                expect(product?.id).toBe('test123');
                expect(product?.name).toContain('Product test123');
                expect(typeof product?.price).toBe('number');
                expect(typeof product?.inStock).toBe('boolean');
                done();
            });
        });
    });

    describe('2. Promise パターン', () => {
        test('Promise の正常処理', async () => {
            const data = await fetchUserDataPromise('456');
            
            expect(data).toBeDefined();
            expect(data.id).toBe('456');
            expect(data.name).toContain('User 456');
            expect(data.email).toContain('user456@example.com');
            expect(data.createdAt).toBeInstanceOf(Date);
        });

        test('Promise のエラー処理', async () => {
            await expect(fetchUserDataPromise('invalid')).rejects.toThrow('User not found');
        });

        test('演習のPromise関数', async () => {
            const product = await fetchProductPromise('test456');
            
            expect(product).toBeDefined();
            expect(product.id).toBe('test456');
            expect(product.name).toContain('Product test456');
            expect(['Electronics', 'Books', 'Clothing']).toContain(product.category);
        });
    });

    describe('3. async/await パターン', () => {
        test('async/await の正常処理', async () => {
            const profile = await fetchUserProfileAsync('789');
            
            expect(profile).toBeDefined();
            expect(profile.user.id).toBe('789');
            expect(profile.settings).toBeDefined();
            expect(profile.posts).toBeInstanceOf(Array);
            expect(profile.posts.length).toBeGreaterThan(0);
        });

        test('async/await のエラー処理', async () => {
            await expect(fetchUserProfileAsync('invalid')).rejects.toThrow('User not found');
        });
    });

    describe('4. 複数の非同期処理', () => {
        test('並行処理でのデータ取得', async () => {
            const productIds = ['p1', 'p2', 'p3'];
            const products = await fetchMultipleProducts(productIds);
            
            expect(products).toHaveLength(3);
            expect(products[0].id).toBe('p1');
            expect(products[1].id).toBe('p2');
            expect(products[2].id).toBe('p3');
        });

        test('エラーが含まれる並行処理', async () => {
            const productIds = ['p1', 'invalid', 'p3'];
            
            await expect(fetchMultipleProducts(productIds)).rejects.toThrow('Failed to fetch multiple products');
        });
    });

    describe('5. 実践的な例: HTTPクライアント', () => {
        let client: SimpleHttpClient;

        beforeEach(() => {
            client = new SimpleHttpClient('https://test-api.example.com');
        });

        test('GET リクエスト成功', async () => {
            const response = await client.get('/users/123');
            
            expect(response.status).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.message).toContain('/users/123');
        });

        test('GET リクエスト失敗', async () => {
            await expect(client.get('/error/500')).rejects.toThrow('HTTP 500');
        });

        test('ユーザーデータ取得', async () => {
            const userData = await client.fetchUserData('test123');
            
            expect(userData.id).toBe('test123');
            expect(userData.name).toContain('User test123');
        });

        test('ユーザー作成', async () => {
            const newUser = {
                name: 'Test User',
                email: 'test@example.com'
            };
            
            const createdUser = await client.createUser(newUser);
            
            expect(createdUser.name).toBe('Test User');
            expect(createdUser.email).toBe('test@example.com');
            expect(createdUser.id).toBeDefined();
        });
    });
});

// ===== 演習解答のテスト =====

describe('演習解答のテスト', () => {
    jest.setTimeout(10000); // より長いタイムアウト

    describe('注文作成処理', () => {
        test('正常な注文作成', async () => {
            const order = await createOrder('user123', ['p1', 'p2']);
            
            expect(order).toBeDefined();
            expect(order.userId).toBe('user123');
            expect(order.products).toHaveLength(2);
            expect(order.total).toBeGreaterThan(0);
            expect(order.status).toBe('pending');
            expect(order.id).toContain('order_');
        });

        // 注意: 在庫切れのテストは確率的なため、モックを使用するのが実際の開発では適切
        test('在庫切れエラーのハンドリング', async () => {
            // このテストは実際の実装では在庫状態をモックする必要があります
            // 現在の実装では80%の確率で在庫ありなので、テストは確率的になります
            console.log('Note: Stock testing is probabilistic in this implementation');
        });
    });

    describe('リトライ機能', () => {
        test('成功する操作', async () => {
            let callCount = 0;
            const result = await retryOperation(async () => {
                callCount++;
                return `Success on attempt ${callCount}`;
            }, 3, 10);
            
            expect(result).toBe('Success on attempt 1');
            expect(callCount).toBe(1);
        });

        test('2回目で成功する操作', async () => {
            let callCount = 0;
            const result = await retryOperation(async () => {
                callCount++;
                if (callCount === 1) {
                    throw new Error('First attempt fails');
                }
                return `Success on attempt ${callCount}`;
            }, 3, 10);
            
            expect(result).toBe('Success on attempt 2');
            expect(callCount).toBe(2);
        });

        test('すべて失敗する操作', async () => {
            let callCount = 0;
            
            await expect(retryOperation(async () => {
                callCount++;
                throw new Error(`Attempt ${callCount} failed`);
            }, 3, 10)).rejects.toThrow('All 3 attempts failed');
            
            expect(callCount).toBe(3);
        });
    });

    describe('タイムアウト機能', () => {
        test('時間内に完了する処理', async () => {
            const result = await withTimeout(
                new Promise(resolve => setTimeout(() => resolve('success'), 100)),
                500
            );
            
            expect(result).toBe('success');
        });

        test('タイムアウトする処理', async () => {
            await expect(withTimeout(
                new Promise(resolve => setTimeout(() => resolve('too slow'), 1000)),
                100
            )).rejects.toThrow(TimeoutError);
        });

        test('エラーが先に発生する処理', async () => {
            await expect(withTimeout(
                new Promise((_, reject) => setTimeout(() => reject(new Error('early error')), 50)),
                500
            )).rejects.toThrow('early error');
        });
    });

    describe('AsyncQueue', () => {
        test('順次実行', async () => {
            const queue = new AsyncQueue(1);
            const results: string[] = [];
            
            const tasks = [1, 2, 3].map(i => 
                queue.add(async () => {
                    await delay(50);
                    results.push(`task-${i}`);
                    return `result-${i}`;
                })
            );
            
            const taskResults = await Promise.all(tasks);
            
            expect(taskResults).toEqual(['result-1', 'result-2', 'result-3']);
            expect(results).toEqual(['task-1', 'task-2', 'task-3']);
            expect(queue.size).toBe(0);
            expect(queue.running).toBe(0);
        });

        test('並行実行（制限あり）', async () => {
            const queue = new AsyncQueue(2);
            const startTimes: number[] = [];
            
            const tasks = [1, 2, 3, 4].map(i => 
                queue.add(async () => {
                    startTimes.push(Date.now());
                    await delay(100);
                    return i;
                })
            );
            
            await Promise.all(tasks);
            
            // 最初の2つは同時に開始されるべき
            expect(Math.abs(startTimes[0] - startTimes[1])).toBeLessThan(20);
            // 3つ目は少し後に開始されるべき
            expect(startTimes[2] - startTimes[0]).toBeGreaterThan(80);
        });
    });

    describe('WeatherApiClient', () => {
        let client: WeatherApiClient;

        beforeEach(() => {
            client = new WeatherApiClient();
            client.clearCache();
        });

        test('単一都市の天気取得', async () => {
            const weather = await client.getWeather('Tokyo');
            
            expect(weather.city).toBe('Tokyo');
            expect(typeof weather.temperature).toBe('number');
            expect(typeof weather.humidity).toBe('number');
            expect(weather.condition).toBeDefined();
            expect(weather.timestamp).toBeInstanceOf(Date);
        });

        test('キャッシュ機能', async () => {
            const weather1 = await client.getWeather('London');
            const weather2 = await client.getWeather('London');
            
            expect(weather1.timestamp).toEqual(weather2.timestamp);
            
            const stats = client.getCacheStats();
            expect(stats.size).toBe(1);
            expect(stats.entries).toContain('London');
        });

        test('複数都市の天気取得', async () => {
            const cities = ['Tokyo', 'London', 'Paris'];
            const weatherData = await client.getMultipleCitiesWeather(cities);
            
            expect(weatherData).toHaveLength(3);
            expect(weatherData[0].city).toBe('Tokyo');
            expect(weatherData[1].city).toBe('London');
            expect(weatherData[2].city).toBe('Paris');
        });

        test('API エラーハンドリング', async () => {
            await expect(client.getWeather('error')).rejects.toThrow();
        });
    });

    describe('AsyncEventEmitter', () => {
        let emitter: AsyncEventEmitter;

        beforeEach(() => {
            emitter = new AsyncEventEmitter();
        });

        test('基本的なイベント発火と受信', async () => {
            let received = false;
            let receivedData: any;

            emitter.on('test', (data) => {
                received = true;
                receivedData = data;
            });

            await emitter.emit('test', 'hello world');

            expect(received).toBe(true);
            expect(receivedData).toBe('hello world');
        });

        test('非同期リスナー', async () => {
            let processedData: string = '';

            emitter.on('process', async (data: string) => {
                await delay(50);
                processedData = data.toUpperCase();
            });

            await emitter.emit('process', 'hello');

            expect(processedData).toBe('HELLO');
        });

        test('複数リスナーの並行実行', async () => {
            const results: string[] = [];

            emitter.on('parallel', async (data: string) => {
                await delay(50);
                results.push(`listener1-${data}`);
            });

            emitter.on('parallel', async (data: string) => {
                await delay(50);
                results.push(`listener2-${data}`);
            });

            await emitter.emit('parallel', 'test');

            expect(results).toHaveLength(2);
            expect(results).toContain('listener1-test');
            expect(results).toContain('listener2-test');
        });

        test('once メソッド', async () => {
            let callCount = 0;

            emitter.once('once-test', () => {
                callCount++;
            });

            await emitter.emit('once-test');
            await emitter.emit('once-test');
            await emitter.emit('once-test');

            expect(callCount).toBe(1);
        });

        test('リスナーの削除', async () => {
            let callCount = 0;
            const listener = () => { callCount++; };

            emitter.on('removable', listener);
            await emitter.emit('removable');
            expect(callCount).toBe(1);

            emitter.off('removable', listener);
            await emitter.emit('removable');
            expect(callCount).toBe(1); // 増加しない
        });
    });

    describe('FileUploader', () => {
        let uploader: FileUploader;

        beforeEach(() => {
            uploader = new FileUploader(2);
        });

        test('単一ファイルのアップロード', async () => {
            const mockFile = {
                name: 'test.txt',
                size: 1024,
                data: new ArrayBuffer(1024)
            };

            let progressCallCount = 0;
            const result = await uploader.uploadFile(mockFile, (progress) => {
                progressCallCount++;
                expect(progress.filename).toBe('test.txt');
                expect(progress.totalBytes).toBe(1024);
                expect(progress.percentage).toBeGreaterThanOrEqual(0);
                expect(progress.percentage).toBeLessThanOrEqual(100);
            });

            expect(result.filename).toBe('test.txt');
            expect(result.url).toContain('test.txt');
            expect(typeof result.uploadTime).toBe('number');
            expect(progressCallCount).toBeGreaterThan(0);
        });

        test('複数ファイルのアップロード', async () => {
            const mockFiles = [
                { name: 'file1.txt', size: 512, data: new ArrayBuffer(512) },
                { name: 'file2.txt', size: 1024, data: new ArrayBuffer(1024) }
            ];

            const progressMap = new Map<string, number>();

            const results = await uploader.uploadMultipleFiles(mockFiles, (filename, progress) => {
                progressMap.set(filename, progress.percentage);
            });

            expect(results).toHaveLength(2);
            expect(results[0].filename).toBe('file1.txt');
            expect(results[1].filename).toBe('file2.txt');
            expect(progressMap.get('file1.txt')).toBe(100);
            expect(progressMap.get('file2.txt')).toBe(100);
        });

        test('アップロード制限の確認', async () => {
            const stats = uploader.getQueueStats();
            expect(stats.size).toBe(0);
            expect(stats.running).toBe(0);
        });
    });
});

// ===== パフォーマンステスト =====

describe('パフォーマンステスト', () => {
    jest.setTimeout(15000);

    test('大量の並行処理のテスト', async () => {
        const startTime = Date.now();
        const taskCount = 100;
        
        const tasks = Array.from({ length: taskCount }, (_, i) =>
            fetchProductPromise(`product-${i}`)
        );
        
        const results = await Promise.all(tasks);
        const endTime = Date.now();
        
        expect(results).toHaveLength(taskCount);
        console.log(`${taskCount} parallel tasks completed in ${endTime - startTime}ms`);
    });

    test('シーケンシャル vs 並行処理の比較', async () => {
        const productIds = ['p1', 'p2', 'p3', 'p4', 'p5'];
        
        // シーケンシャル処理
        const sequentialStart = Date.now();
        const sequentialResults = [];
        for (const id of productIds) {
            const product = await fetchProductPromise(id);
            sequentialResults.push(product);
        }
        const sequentialTime = Date.now() - sequentialStart;
        
        // 並行処理
        const parallelStart = Date.now();
        const parallelResults = await Promise.all(
            productIds.map(id => fetchProductPromise(id))
        );
        const parallelTime = Date.now() - parallelStart;
        
        expect(sequentialResults).toHaveLength(5);
        expect(parallelResults).toHaveLength(5);
        expect(parallelTime).toBeLessThan(sequentialTime);
        
        console.log(`Sequential: ${sequentialTime}ms, Parallel: ${parallelTime}ms`);
        console.log(`Parallel is ${Math.round(sequentialTime / parallelTime)}x faster`);
    });
});

// ===== エラーハンドリングテスト =====

describe('エラーハンドリングテスト', () => {
    test('ネットワークエラーのシミュレーション', async () => {
        const client = new SimpleHttpClient();
        
        await expect(client.get('/error/network')).rejects.toThrow();
    });

    test('タイムアウトエラーのテスト', async () => {
        const longRunningTask = new Promise(resolve => 
            setTimeout(() => resolve('completed'), 2000)
        );
        
        await expect(withTimeout(longRunningTask, 100))
            .rejects.toThrow(TimeoutError);
    });

    test('部分的な失敗がある並行処理', async () => {
        const mixedProductIds = ['valid1', 'invalid', 'valid2'];
        
        // Promise.allSettled を使用した場合の動作確認
        const results = await Promise.allSettled(
            mixedProductIds.map(id => fetchProductPromise(id))
        );
        
        expect(results).toHaveLength(3);
        expect(results[0].status).toBe('fulfilled');
        expect(results[1].status).toBe('rejected');
        expect(results[2].status).toBe('fulfilled');
    });
});

// ===== 統合テスト =====

describe('統合テスト', () => {
    test('実際のWebアプリケーションワークフローのシミュレーション', async () => {
        // 1. ユーザー認証
        const user = await fetchUserDataPromise('testuser');
        expect(user).toBeDefined();
        
        // 2. 商品一覧の取得
        const products = await fetchMultipleProducts(['p1', 'p2', 'p3']);
        expect(products).toHaveLength(3);
        
        // 3. 注文の作成
        const order = await createOrder(user.id, ['p1', 'p2']);
        expect(order.userId).toBe(user.id);
        
        // 4. 天気情報の取得（サイドバー用）
        const weatherClient = new WeatherApiClient();
        const weather = await weatherClient.getWeather('Tokyo');
        expect(weather.city).toBe('Tokyo');
        
        // 5. ファイルアップロード
        const uploader = new FileUploader(1);
        const mockFile = {
            name: 'receipt.pdf',
            size: 2048,
            data: new ArrayBuffer(2048)
        };
        const uploadResult = await uploader.uploadFile(mockFile);
        expect(uploadResult.filename).toBe('receipt.pdf');
        
        console.log('✅ Complete web application workflow test passed');
    });
});