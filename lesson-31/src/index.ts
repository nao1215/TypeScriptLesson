/**
 * Lesson 31: デコレータ (Decorators)
 * TypeScriptのデコレータを使ったメタプログラミング
 */

// reflect-metadataライブラリの型定義をモック
declare global {
    namespace Reflect {
        function defineMetadata(metadataKey: any, metadataValue: any, target: any, propertyKey?: string | symbol): void;
        function getMetadata(metadataKey: any, target: any, propertyKey?: string | symbol): any;
        function hasMetadata(metadataKey: any, target: any, propertyKey?: string | symbol): boolean;
    }
}

console.log('=== TypeScript Decorators Demo ===\n');

// 1. 基本的なクラスデコレータ
console.log('1. クラスデコレータの例:');

function LogClass(target: any) {
    console.log(`クラス ${target.name} が定義されました`);
}

function Component(name: string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            componentName = name;
            created = new Date();
            
            toString() {
                return `Component: ${name}`;
            }
        };
    };
}

@LogClass
@Component("UserComponent")
class User {
    constructor(public name: string, public age: number) {}
}

const user = new User("Alice", 25);
console.log(user.toString());
console.log(`作成日時: ${(user as any).created}`);
console.log();

// 2. メソッドデコレータ - パフォーマンス測定
console.log('2. メソッドデコレータ（パフォーマンス測定）:');

function MeasureTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
        const start = performance.now();
        const result = originalMethod.apply(this, args);
        const end = performance.now();
        console.log(`  ${propertyKey} 実行時間: ${(end - start).toFixed(2)}ms`);
        return result;
    };
}

function RetryOnFailure(maxRetries: number = 3) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args: any[]) {
            let lastError: any;
            
            for (let i = 0; i <= maxRetries; i++) {
                try {
                    return originalMethod.apply(this, args);
                } catch (error) {
                    lastError = error;
                    if (i < maxRetries) {
                        console.log(`  ${propertyKey} 試行 ${i + 1} 失敗、再試行中...`);
                    }
                }
            }
            
            console.log(`  ${propertyKey} ${maxRetries + 1}回の試行後に失敗`);
            throw lastError;
        };
    };
}

class Calculator {
    @MeasureTime
    fibonacci(n: number): number {
        if (n <= 1) return n;
        return this.fibonacci(n - 1) + this.fibonacci(n - 2);
    }
    
    @MeasureTime
    complexCalculation(n: number): number {
        let result = 0;
        for (let i = 0; i < n * 1000; i++) {
            result += Math.sqrt(i);
        }
        return Math.floor(result);
    }
    
    @RetryOnFailure(2)
    unreliableOperation(): string {
        if (Math.random() < 0.7) {
            throw new Error("処理に失敗しました");
        }
        return "成功!";
    }
}

const calculator = new Calculator();
console.log(`フィボナッチ(10) = ${calculator.fibonacci(10)}`);
console.log(`複雑な計算結果: ${calculator.complexCalculation(5)}`);

try {
    console.log(calculator.unreliableOperation());
} catch (error) {
    console.log(`最終的にエラー: ${error}`);
}
console.log();

// 3. プロパティデコレータとバリデーション
console.log('3. プロパティデコレータとバリデーション:');

// メタデータストレージをモック
const metadataStorage = new WeakMap();

if (!global.Reflect) {
    (global as any).Reflect = {
        defineMetadata(key: string, value: any, target: any, propertyKey?: string) {
            if (!metadataStorage.has(target)) {
                metadataStorage.set(target, new Map());
            }
            const targetMetadata = metadataStorage.get(target);
            const fullKey = propertyKey ? `${key}:${propertyKey}` : key;
            targetMetadata.set(fullKey, value);
        },
        getMetadata(key: string, target: any, propertyKey?: string) {
            if (!metadataStorage.has(target)) return undefined;
            const targetMetadata = metadataStorage.get(target);
            const fullKey = propertyKey ? `${key}:${propertyKey}` : key;
            return targetMetadata.get(fullKey);
        }
    };
}

function Validate(rules: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}) {
    return function (target: any, propertyKey: string) {
        const validationRules = Reflect.getMetadata('validation', target) || {};
        validationRules[propertyKey] = rules;
        Reflect.defineMetadata('validation', validationRules, target);
    };
}

function validateObject(obj: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validationRules = Reflect.getMetadata('validation', obj) || {};
    
    for (const [property, rules] of Object.entries(validationRules)) {
        const value = obj[property];
        const rule = rules as any;
        
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push(`${property} は必須です`);
        }
        
        if (typeof value === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                errors.push(`${property} は ${rule.min} 以上である必要があります`);
            }
            if (rule.max !== undefined && value > rule.max) {
                errors.push(`${property} は ${rule.max} 以下である必要があります`);
            }
        }
        
        if (typeof value === 'string') {
            if (rule.minLength !== undefined && value.length < rule.minLength) {
                errors.push(`${property} は ${rule.minLength} 文字以上である必要があります`);
            }
            if (rule.maxLength !== undefined && value.length > rule.maxLength) {
                errors.push(`${property} は ${rule.maxLength} 文字以下である必要があります`);
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(`${property} の形式が正しくありません`);
            }
        }
    }
    
    return { isValid: errors.length === 0, errors };
}

class Product {
    @Validate({ required: true, minLength: 2, maxLength: 50 })
    name: string;

    @Validate({ required: true, min: 0.01, max: 999999.99 })
    price: number;

    @Validate({ required: true, pattern: /^[A-Z]{3}$/ })
    category: string;

    @Validate({ maxLength: 500 })
    description?: string;

    constructor(name: string, price: number, category: string, description?: string) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.description = description;
    }
}

// バリデーションテスト
const validProduct = new Product("ラップトップ", 899.99, "ELE", "高性能なラップトップコンピュータ");
const validation1 = validateObject(validProduct);
console.log(`有効な商品: ${validation1.isValid ? '✓' : '✗'}`);

const invalidProduct = new Product("", -100, "invalid", "x".repeat(600));
const validation2 = validateObject(invalidProduct);
console.log(`無効な商品: ${validation2.isValid ? '✓' : '✗'}`);
if (!validation2.isValid) {
    console.log('エラー:', validation2.errors);
}
console.log();

// 4. 実用的なデコレータシステム
console.log('4. 実用的なデコレータシステム:');

// キャッシュデコレータ
function Cache(ttl: number = 5000) {
    const cache = new Map<string, { value: any; timestamp: number; hits: number }>();
    
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args: any[]) {
            const key = `${target.constructor.name}.${propertyKey}_${JSON.stringify(args)}`;
            const cached = cache.get(key);
            
            if (cached && Date.now() - cached.timestamp < ttl) {
                cached.hits++;
                console.log(`  キャッシュヒット (${cached.hits}回目): ${propertyKey}`);
                return cached.value;
            }
            
            const result = originalMethod.apply(this, args);
            cache.set(key, { value: result, timestamp: Date.now(), hits: 0 });
            console.log(`  キャッシュ更新: ${propertyKey}`);
            
            return result;
        };
    };
}

// ログデコレータ
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${target.constructor.name}.${propertyKey} 開始`);
        console.log('  引数:', args);
        
        try {
            const result = originalMethod.apply(this, args);
            console.log(`[${timestamp}] ${target.constructor.name}.${propertyKey} 成功`);
            return result;
        } catch (error) {
            console.log(`[${timestamp}] ${target.constructor.name}.${propertyKey} エラー:`, error);
            throw error;
        }
    };
}

// レート制限デコレータ
function RateLimit(requestsPerSecond: number) {
    const requests = new Map<string, number[]>();
    
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args: any[]) {
            const key = `${target.constructor.name}.${propertyKey}`;
            const now = Date.now();
            const windowStart = now - 1000;
            
            const requestTimes = requests.get(key) || [];
            const recentRequests = requestTimes.filter(time => time > windowStart);
            
            if (recentRequests.length >= requestsPerSecond) {
                throw new Error(`レート制限を超過: ${requestsPerSecond}/秒`);
            }
            
            recentRequests.push(now);
            requests.set(key, recentRequests);
            
            return originalMethod.apply(this, args);
        };
    };
}

class DataService {
    @Log
    @Cache(3000)
    async fetchUserData(userId: number): Promise<{ id: number; name: string; email: string }> {
        // API呼び出しのシミュレーション
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
            id: userId,
            name: `User${userId}`,
            email: `user${userId}@example.com`
        };
    }
    
    @RateLimit(2)
    processData(data: string): string {
        console.log(`  データを処理中: ${data}`);
        return `処理済み: ${data}`;
    }
}

async function testDataService() {
    const service = new DataService();
    
    // キャッシュテスト
    console.log('キャッシュテスト:');
    const userData1 = await service.fetchUserData(1);
    console.log('取得データ1:', userData1);
    
    const userData2 = await service.fetchUserData(1); // キャッシュヒット
    console.log('取得データ2:', userData2);
    
    // レート制限テスト
    console.log('\nレート制限テスト:');
    try {
        service.processData("data1");
        service.processData("data2");
        service.processData("data3"); // レート制限エラー
    } catch (error) {
        console.log('エラー:', (error as Error).message);
    }
}

testDataService();

// 5. 簡単な依存性注入システム
console.log('\n5. 依存性注入システム:');

class DIContainer {
    private dependencies = new Map<string, new (...args: any[]) => any>();
    private instances = new Map<string, any>();
    
    register<T>(token: string, implementation: new (...args: any[]) => T, singleton = true): void {
        this.dependencies.set(token, implementation);
        if (!singleton) {
            this.instances.delete(token);
        }
    }
    
    resolve<T>(token: string): T {
        if (this.instances.has(token)) {
            return this.instances.get(token);
        }
        
        const dependency = this.dependencies.get(token);
        if (!dependency) {
            throw new Error(`依存関係が見つかりません: ${token}`);
        }
        
        const instance = new dependency();
        this.instances.set(token, instance);
        return instance;
    }
}

const container = new DIContainer();

function Injectable(token: string, singleton = true) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        container.register(token, constructor, singleton);
        return constructor;
    };
}

function Inject(token: string) {
    return function (target: any, propertyKey: string) {
        Object.defineProperty(target, propertyKey, {
            get: () => container.resolve(token),
            enumerable: true,
            configurable: true
        });
    };
}

@Injectable('logger')
class Logger {
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }
    
    error(message: string): void {
        console.log(`[ERROR] ${message}`);
    }
}

@Injectable('database')
class Database {
    private connected = false;
    
    connect(): void {
        if (!this.connected) {
            console.log('データベースに接続しました');
            this.connected = true;
        }
    }
    
    query(sql: string): any[] {
        this.connect();
        console.log(`クエリ実行: ${sql}`);
        return [{ id: 1, name: 'Sample Data' }];
    }
}

class UserController {
    @Inject('logger')
    private logger!: Logger;
    
    @Inject('database')
    private database!: Database;
    
    handleGetUsers(): void {
        this.logger.log('ユーザー一覧取得開始');
        try {
            const users = this.database.query('SELECT * FROM users');
            this.logger.log(`${users.length}件のユーザーを取得`);
        } catch (error) {
            this.logger.error(`エラー: ${error}`);
        }
    }
    
    handleCreateUser(name: string): void {
        this.logger.log(`新しいユーザー作成: ${name}`);
        this.database.query(`INSERT INTO users (name) VALUES ('${name}')`);
    }
}

const userController = new UserController();
userController.handleGetUsers();
userController.handleCreateUser('新しいユーザー');

console.log('\n=== Decorators Demo Complete ===');

export {};