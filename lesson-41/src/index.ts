/**
 * Lesson 41: 非同期処理の基礎 (Asynchronous Programming Basics)
 * 
 * このファイルでは、JavaScript/TypeScriptにおける非同期処理の
 * 基本的なパターンと実践的な使用例を学習します。
 */

// ===== 1. イベントループとタイミング =====

/**
 * 同期処理と非同期処理の実行順序を確認
 */
export function demonstrateEventLoop() {
    console.log('=== Event Loop Demo ===');
    
    console.log('1. Synchronous start');
    
    // マクロタスク（setTimeout）
    setTimeout(() => {
        console.log('4. Macro task (setTimeout)');
    }, 0);
    
    // マイクロタスク（Promise）
    Promise.resolve().then(() => {
        console.log('3. Micro task (Promise.then)');
    });
    
    console.log('2. Synchronous end');
    
    // 実行順序: 1 → 2 → 3 → 4
}

// ===== 2. Callback パターン =====

/**
 * ユーザー情報を取得する関数（Callback版）
 */
export function fetchUserDataCallback(
    userId: string, 
    callback: (error: Error | null, data?: UserData) => void
): void {
    // APIリクエストをシミュレート
    setTimeout(() => {
        if (userId === 'invalid') {
            callback(new Error('User not found'));
        } else if (userId === 'error') {
            callback(new Error('Server error'));
        } else {
            const userData: UserData = {
                id: userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
                createdAt: new Date()
            };
            callback(null, userData);
        }
    }, Math.random() * 1000 + 500); // 500-1500ms のランダムな遅延
}

/**
 * ファイルを読み込む関数（Callback版）
 */
export function readFileCallback(
    filename: string,
    callback: (error: Error | null, content?: string) => void
): void {
    setTimeout(() => {
        if (filename.endsWith('.txt')) {
            callback(null, `Content of ${filename}: Hello, World!`);
        } else {
            callback(new Error(`Unsupported file type: ${filename}`));
        }
    }, 300);
}

/**
 * Callback地獄の例とその解決方法
 */
export function callbackHellExample(userId: string) {
    console.log('=== Callback Hell Example ===');
    
    // 悪い例: Callback地獄
    fetchUserDataCallback(userId, (error, user) => {
        if (error) {
            console.error('User fetch error:', error.message);
            return;
        }
        
        // ユーザーの設定を取得
        setTimeout(() => {
            const settings = { theme: 'dark', language: 'ja' };
            
            // ユーザーの投稿を取得
            setTimeout(() => {
                const posts = [`Post 1 by ${user!.name}`, `Post 2 by ${user!.name}`];
                
                // 結果を表示
                console.log('User:', user);
                console.log('Settings:', settings);
                console.log('Posts:', posts);
            }, 200);
        }, 200);
    });
}

// ===== 3. Promise パターン =====

/**
 * ユーザー情報を取得する関数（Promise版）
 */
export function fetchUserDataPromise(userId: string): Promise<UserData> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId === 'invalid') {
                reject(new Error('User not found'));
            } else if (userId === 'error') {
                reject(new Error('Server error'));
            } else {
                const userData: UserData = {
                    id: userId,
                    name: `User ${userId}`,
                    email: `user${userId}@example.com`,
                    createdAt: new Date()
                };
                resolve(userData);
            }
        }, Math.random() * 1000 + 500);
    });
}

/**
 * ファイルを読み込む関数（Promise版）
 */
export function readFilePromise(filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (filename.endsWith('.txt')) {
                resolve(`Content of ${filename}: Hello, World!`);
            } else {
                reject(new Error(`Unsupported file type: ${filename}`));
            }
        }, 300);
    });
}

/**
 * Promise チェーンの例
 */
export function promiseChainExample(userId: string): Promise<UserProfile> {
    console.log('=== Promise Chain Example ===');
    
    return fetchUserDataPromise(userId)
        .then(user => {
            console.log('1. User fetched:', user.name);
            // ユーザー設定を取得
            return Promise.resolve({ theme: 'dark', language: 'ja' })
                .then(settings => ({ user, settings }));
        })
        .then(({ user, settings }) => {
            console.log('2. Settings fetched:', settings);
            // ユーザーの投稿を取得
            return Promise.resolve([`Post 1 by ${user.name}`, `Post 2 by ${user.name}`])
                .then(posts => ({ user, settings, posts }));
        })
        .then(({ user, settings, posts }) => {
            console.log('3. Posts fetched:', posts.length);
            const profile: UserProfile = {
                user,
                settings,
                posts
            };
            return profile;
        })
        .catch(error => {
            console.error('Promise chain error:', error.message);
            throw error;
        });
}

// ===== 4. async/await パターン =====

/**
 * async/await を使用したユーザープロフィール取得
 */
export async function fetchUserProfileAsync(userId: string): Promise<UserProfile> {
    try {
        console.log('=== Async/Await Example ===');
        
        // 1. ユーザー情報を取得
        console.log('1. Fetching user data...');
        const user = await fetchUserDataPromise(userId);
        console.log(`   User fetched: ${user.name}`);
        
        // 2. ユーザー設定を取得
        console.log('2. Fetching user settings...');
        const settings = await new Promise<UserSettings>(resolve => {
            setTimeout(() => {
                resolve({ theme: 'dark', language: 'ja' });
            }, 200);
        });
        console.log('   Settings fetched:', settings);
        
        // 3. ユーザーの投稿を取得
        console.log('3. Fetching user posts...');
        const posts = await new Promise<string[]>(resolve => {
            setTimeout(() => {
                resolve([`Post 1 by ${user.name}`, `Post 2 by ${user.name}`]);
            }, 200);
        });
        console.log(`   Posts fetched: ${posts.length} posts`);
        
        const profile: UserProfile = {
            user,
            settings,
            posts
        };
        
        console.log('✅ Profile complete:', profile);
        return profile;
        
    } catch (error) {
        console.error('❌ Async/await error:', error.message);
        throw error;
    }
}

// ===== 5. 実践的な例: API クライアント =====

/**
 * HTTPクライアントの基本実装
 */
export class SimpleHttpClient {
    private baseUrl: string;
    
    constructor(baseUrl: string = 'https://api.example.com') {
        this.baseUrl = baseUrl;
    }
    
    /**
     * GET リクエスト（Promise版）
     */
    get(endpoint: string): Promise<any> {
        return new Promise((resolve, reject) => {
            // XMLHttpRequest をシミュレート
            setTimeout(() => {
                if (endpoint.startsWith('/error')) {
                    reject(new Error(`HTTP 500: Server Error for ${endpoint}`));
                } else {
                    resolve({
                        status: 200,
                        data: { message: `Data from ${endpoint}`, timestamp: Date.now() }
                    });
                }
            }, Math.random() * 500 + 200);
        });
    }
    
    /**
     * POST リクエスト（Promise版）
     */
    post(endpoint: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!data || Object.keys(data).length === 0) {
                    reject(new Error('POST data is required'));
                } else {
                    resolve({
                        status: 201,
                        data: { id: Math.floor(Math.random() * 1000), ...data }
                    });
                }
            }, Math.random() * 500 + 200);
        });
    }
    
    /**
     * async/await を使用した便利なメソッド
     */
    async fetchUserData(userId: string): Promise<UserData> {
        try {
            const response = await this.get(`/users/${userId}`);
            return {
                id: userId,
                name: response.data.name || `User ${userId}`,
                email: response.data.email || `user${userId}@example.com`,
                createdAt: new Date(response.data.timestamp || Date.now())
            };
        } catch (error) {
            throw new Error(`Failed to fetch user ${userId}: ${error.message}`);
        }
    }
    
    async createUser(userData: Partial<UserData>): Promise<UserData> {
        try {
            const response = await this.post('/users', userData);
            return {
                id: response.data.id.toString(),
                name: userData.name || 'Unknown User',
                email: userData.email || 'unknown@example.com',
                createdAt: new Date()
            };
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }
}

// ===== 6. タイマーとスケジューリング =====

/**
 * Promise ベースのタイマー関数
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * リトライ機能付きの処理実行
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries}`);
            return await operation();
        } catch (error) {
            lastError = error as Error;
            console.log(`Attempt ${attempt} failed: ${error.message}`);
            
            if (attempt < maxRetries) {
                console.log(`Waiting ${delayMs}ms before retry...`);
                await delay(delayMs);
                delayMs *= 2; // Exponential backoff
            }
        }
    }
    
    throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError!.message}`);
}

/**
 * アニメーションループの例
 */
export async function animationLoop(duration: number = 2000): Promise<void> {
    console.log('=== Animation Loop Demo ===');
    const startTime = Date.now();
    let frame = 0;
    
    while (Date.now() - startTime < duration) {
        console.log(`Frame ${frame++}: ${Date.now() - startTime}ms`);
        await delay(16); // 約60FPS (1000ms/60 ≈ 16ms)
    }
    
    console.log('Animation completed');
}

// ===== 7. 型定義 =====

export interface UserData {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

export interface UserSettings {
    theme: 'light' | 'dark';
    language: string;
}

export interface UserProfile {
    user: UserData;
    settings: UserSettings;
    posts: string[];
}

// ===== 8. デモ実行関数 =====

/**
 * すべての例を実行するデモ関数
 */
export async function runAsyncDemo(): Promise<void> {
    console.log('🚀 Starting Async Programming Demo\n');
    
    try {
        // 1. イベントループデモ
        demonstrateEventLoop();
        await delay(100);
        
        // 2. Callback例
        console.log('\n📞 Testing Callback Pattern...');
        await new Promise<void>((resolve) => {
            fetchUserDataCallback('123', (error, data) => {
                if (error) {
                    console.error('Callback error:', error.message);
                } else {
                    console.log('Callback success:', data?.name);
                }
                resolve();
            });
        });
        
        // 3. Promise例
        console.log('\n🔗 Testing Promise Pattern...');
        try {
            const profile = await promiseChainExample('123');
            console.log('Promise chain completed successfully');
        } catch (error) {
            console.error('Promise chain failed:', error.message);
        }
        
        // 4. async/await例
        console.log('\n⚡ Testing async/await Pattern...');
        try {
            await fetchUserProfileAsync('123');
        } catch (error) {
            console.error('Async/await failed:', error.message);
        }
        
        // 5. HTTPクライアント例
        console.log('\n🌐 Testing HTTP Client...');
        const client = new SimpleHttpClient();
        try {
            const userData = await client.fetchUserData('456');
            console.log('HTTP client success:', userData.name);
        } catch (error) {
            console.error('HTTP client error:', error.message);
        }
        
        // 6. リトライ例
        console.log('\n🔄 Testing Retry Mechanism...');
        let attemptCount = 0;
        try {
            await withRetry(async () => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('Simulated failure');
                }
                return 'Success!';
            }, 3, 100);
            console.log('Retry mechanism succeeded');
        } catch (error) {
            console.log('Retry mechanism failed:', error.message);
        }
        
        console.log('\n✅ Demo completed successfully!');
        
    } catch (error) {
        console.error('❌ Demo failed:', error);
    }
}

// ===== ユーティリティ関数 =====

/**
 * エラーメッセージを表示する関数（実際のWebアプリで使用）
 */
function showErrorMessage(message: string): void {
    // 実際のWebアプリではDOM操作やトーストメッセージを表示
    console.error('🚨 Error:', message);
}

/**
 * エラーをログに記録する関数
 */
function logError(error: Error): void {
    // 実際のWebアプリでは分析サービスに送信
    console.log('📝 Logging error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
}

/**
 * ユーザーデータを表示する関数
 */
function displayUserData(data: UserData): void {
    // 実際のWebアプリではUIに表示
    console.log('👤 Displaying user:', data.name);
}

/**
 * ローディングスピナーを隠す関数
 */
function hideLoadingSpinner(): void {
    // 実際のWebアプリではUI要素を非表示
    console.log('🔄 Hiding loading spinner');
}

// デモ実行（このファイルが直接実行された場合）
if (require.main === module) {
    runAsyncDemo();
}