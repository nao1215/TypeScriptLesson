# Lesson 31: デコレータ (Decorators)

## 学習目標
TypeScriptにおけるデコレータの使用方法を学びます。

- デコレータの基本概念と構文
- クラスデコレータとメタデータ操作
- メソッドデコレータとプロパティデコレータ
- パラメータデコレータとアクセサデコレータ
- デコレータファクトリーとメタデータリフレクション
- 実用的な使用例：ロギング、バリデーション、依存性注入
- Angular/NestJSパターンの理解

## 内容

### 1. デコレータの基礎

デコレータは、クラス、メソッド、プロパティに対してメタプログラミング機能を提供します。

```typescript
// tsconfig.jsonで"experimentalDecorators": trueが必要
function log(target: any) {
    console.log('クラスが定義されました:', target);
}

@log
class ExampleClass {
    name = "example";
}
```

### 2. クラスデコレータ

```typescript
function component(name: string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            componentName = name;
            created = new Date();
        };
    };
}

@component("UserComponent")
class User {
    constructor(public name: string) {}
}

const user = new User("Alice");
console.log((user as any).componentName); // "UserComponent"
```

### 3. メソッドデコレータ

```typescript
function measureTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
        const start = performance.now();
        const result = originalMethod.apply(this, args);
        const end = performance.now();
        console.log(`${propertyKey} 実行時間: ${end - start}ms`);
        return result;
    };
}

class Calculator {
    @measureTime
    complexCalculation(n: number): number {
        let result = 0;
        for (let i = 0; i < n * 1000; i++) {
            result += Math.sqrt(i);
        }
        return result;
    }
}
```

### 4. プロパティデコレータ

```typescript
function validate(rules: { required?: boolean; min?: number; max?: number }) {
    return function (target: any, propertyKey: string) {
        const validationRules = Reflect.getMetadata('validation', target) || {};
        validationRules[propertyKey] = rules;
        Reflect.defineMetadata('validation', validationRules, target);
    };
}

class Product {
    @validate({ required: true, min: 1 })
    price: number;

    @validate({ required: true })
    name: string;

    constructor(name: string, price: number) {
        this.name = name;
        this.price = price;
    }
}
```

### 5. パラメータデコレータ

```typescript
function logParameter(target: any, propertyKey: string, parameterIndex: number) {
    const existingLoggedParameters: number[] = 
        Reflect.getMetadata('logged_parameters', target, propertyKey) || [];
    existingLoggedParameters.push(parameterIndex);
    Reflect.defineMetadata('logged_parameters', existingLoggedParameters, target, propertyKey);
}

class UserService {
    getUser(@logParameter id: number, name: string): User {
        console.log(`パラメータ ${id} がログされました`);
        return new User(name);
    }
}
```

### 6. アクセサデコレータ

```typescript
function readonly(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.writable = false;
    descriptor.set = undefined;
}

class BankAccount {
    private _balance = 0;

    @readonly
    get balance() {
        return this._balance;
    }

    set balance(value: number) {
        this._balance = value;
    }
}
```

### 7. 実用的なデコレータシステム

```typescript
// ログデコレータ
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
        console.log(`[${new Date().toISOString()}] ${target.constructor.name}.${propertyKey} 開始`);
        console.log('引数:', args);
        
        try {
            const result = originalMethod.apply(this, args);
            console.log(`[${new Date().toISOString()}] ${target.constructor.name}.${propertyKey} 成功`);
            return result;
        } catch (error) {
            console.log(`[${new Date().toISOString()}] ${target.constructor.name}.${propertyKey} エラー:`, error);
            throw error;
        }
    };
}

// キャッシュデコレータ
function Cache(ttl: number = 5000) {
    const cache = new Map<string, { value: any; timestamp: number }>();
    
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args: any[]) {
            const key = `${propertyKey}_${JSON.stringify(args)}`;
            const cached = cache.get(key);
            
            if (cached && Date.now() - cached.timestamp < ttl) {
                console.log(`キャッシュヒット: ${key}`);
                return cached.value;
            }
            
            const result = originalMethod.apply(this, args);
            cache.set(key, { value: result, timestamp: Date.now() });
            console.log(`キャッシュ更新: ${key}`);
            
            return result;
        };
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
                throw new Error(`レート制限を超過しました: ${requestsPerSecond}/秒`);
            }
            
            recentRequests.push(now);
            requests.set(key, recentRequests);
            
            return originalMethod.apply(this, args);
        };
    };
}

// 使用例
class ApiService {
    @Log
    @Cache(10000)
    @RateLimit(5)
    async fetchUserData(userId: number): Promise<any> {
        // API呼び出しのシミュレーション
        await new Promise(resolve => setTimeout(resolve, 100));
        return { id: userId, name: `User${userId}`, email: `user${userId}@example.com` };
    }
}
```

### 8. 依存性注入システム

```typescript
// 簡単なDIコンテナ
class DIContainer {
    private dependencies = new Map<string, any>();
    
    register<T>(token: string, implementation: new (...args: any[]) => T): void {
        this.dependencies.set(token, implementation);
    }
    
    resolve<T>(token: string): T {
        const dependency = this.dependencies.get(token);
        if (!dependency) {
            throw new Error(`依存関係が見つかりません: ${token}`);
        }
        return new dependency();
    }
}

const container = new DIContainer();

// 注入可能デコレータ
function Injectable(token: string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        container.register(token, constructor);
        return constructor;
    };
}

// 注入デコレータ
function Inject(token: string) {
    return function (target: any, propertyKey: string) {
        Object.defineProperty(target, propertyKey, {
            get: () => container.resolve(token),
            enumerable: true,
            configurable: true
        });
    };
}

// 使用例
@Injectable('logger')
class Logger {
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }
}

@Injectable('database')
class Database {
    connect(): void {
        console.log('データベースに接続しました');
    }
}

class UserController {
    @Inject('logger')
    private logger!: Logger;
    
    @Inject('database')
    private database!: Database;
    
    handleRequest(): void {
        this.database.connect();
        this.logger.log('リクエストを処理しました');
    }
}
```

## 実行方法

```bash
# TypeScript設定でデコレータを有効化
# tsconfig.json: "experimentalDecorators": true, "emitDecoratorMetadata": true

npx tsc src/index.ts --outDir dist --experimentalDecorators --emitDecoratorMetadata
node dist/index.js
npm test -- lesson-31
```

## 演習問題

1. バリデーションデコレータシステムの実装
2. HTTPルーティングデコレータの作成
3. データベースモデル用のORMデコレータ設計
4. 認証・認可デコレータの実装
5. パフォーマンス監視デコレータシステムの構築

## まとめ

デコレータはTypeScriptの強力なメタプログラミング機能です。適切に使用することで、コードの再利用性と保守性を大幅に向上させることができます。特にAngular、NestJS等のフレームワークでは中核的な機能として活用されています。

次のレッスンでは、高度なジェネリクスについて学習し、より複雑な型システムの操作方法を習得します。