/**
 * Lesson 31 解答例: デコレータ (Decorators)
 * 実用的なデコレータシステムの完全実装
 */

// reflect-metadataのモック実装
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
        },
        hasMetadata(key: string, target: any, propertyKey?: string): boolean {
            if (!metadataStorage.has(target)) return false;
            const targetMetadata = metadataStorage.get(target);
            const fullKey = propertyKey ? `${key}:${propertyKey}` : key;
            return targetMetadata.has(fullKey);
        }
    };
}

// 演習1: HTTPルーティングデコレータシステムの解答
console.log('=== 演習1解答: HTTPルーティングデコレータ ===');

interface RouteInfo {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    handler: Function;
    middlewares: Function[];
    controllerPath?: string;
}

class RouteRegistry {
    private static routes: RouteInfo[] = [];
    
    static addRoute(route: RouteInfo): void {
        this.routes.push(route);
    }
    
    static getRoutes(): RouteInfo[] {
        return this.routes;
    }
    
    static clear(): void {
        this.routes = [];
    }
}

function Controller(basePath: string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        Reflect.defineMetadata('controller:basePath', basePath, constructor);
        
        // プロトタイプのメソッドを調べてルート情報を収集
        const prototype = constructor.prototype;
        const methodNames = Object.getOwnPropertyNames(prototype)
            .filter(name => name !== 'constructor' && typeof prototype[name] === 'function');
        
        methodNames.forEach(methodName => {
            const routeMethod = Reflect.getMetadata('route:method', prototype, methodName);
            const routePath = Reflect.getMetadata('route:path', prototype, methodName);
            const middlewares = Reflect.getMetadata('route:middlewares', prototype, methodName) || [];
            
            if (routeMethod && routePath) {
                RouteRegistry.addRoute({
                    method: routeMethod,
                    path: routePath,
                    handler: prototype[methodName],
                    middlewares: middlewares,
                    controllerPath: basePath
                });
            }
        });
        
        return constructor;
    };
}

function createHttpMethodDecorator(method: 'GET' | 'POST' | 'PUT' | 'DELETE') {
    return function (path: string) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            Reflect.defineMetadata('route:method', method, target, propertyKey);
            Reflect.defineMetadata('route:path', path, target, propertyKey);
        };
    };
}

const Get = createHttpMethodDecorator('GET');
const Post = createHttpMethodDecorator('POST');
const Put = createHttpMethodDecorator('PUT');
const Delete = createHttpMethodDecorator('DELETE');

function Middleware(middlewareFn: Function) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const existingMiddlewares = Reflect.getMetadata('route:middlewares', target, propertyKey) || [];
        existingMiddlewares.unshift(middlewareFn); // 先頭に追加（実行順序のため）
        Reflect.defineMetadata('route:middlewares', existingMiddlewares, target, propertyKey);
    };
}

// ミドルウェア関数
const authMiddleware = (req: any, res: any, next: Function) => {
    console.log('認証チェック中...');
    next();
};

const loggingMiddleware = (req: any, res: any, next: Function) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
};

@Controller('/api/users')
class UserController {
    @Get('/')
    @Middleware(loggingMiddleware)
    getUsers() {
        return { message: 'ユーザー一覧を取得' };
    }
    
    @Get('/:id')
    @Middleware(authMiddleware)
    @Middleware(loggingMiddleware)
    getUser() {
        return { message: 'ユーザー詳細を取得' };
    }
    
    @Post('/')
    @Middleware(authMiddleware)
    createUser() {
        return { message: '新しいユーザーを作成' };
    }
    
    @Put('/:id')
    @Middleware(authMiddleware)
    updateUser() {
        return { message: 'ユーザー情報を更新' };
    }
    
    @Delete('/:id')
    @Middleware(authMiddleware)
    deleteUser() {
        return { message: 'ユーザーを削除' };
    }
}

function testRouting() {
    RouteRegistry.clear();
    const controller = new UserController();
    const routes = RouteRegistry.getRoutes();
    
    console.log('登録されたルート:');
    routes.forEach(route => {
        const fullPath = (route.controllerPath || '') + route.path;
        console.log(`  ${route.method} ${fullPath} (middlewares: ${route.middlewares.length})`);
    });
    
    // 簡易的なルート実行テスト
    console.log('\nルート実行テスト:');
    const getRoute = routes.find(r => r.method === 'GET' && r.path === '/');
    if (getRoute) {
        // ミドルウェア実行のシミュレーション
        getRoute.middlewares.forEach(middleware => {
            middleware({ method: 'GET', url: '/api/users' }, {}, () => {});
        });
        const result = getRoute.handler();
        console.log('実行結果:', result);
    }
}

testRouting();

// 演習2: バリデーションデコレータシステムの解答
console.log('\n=== 演習2解答: バリデーションデコレータシステム ===');

interface ValidationError {
    property: string;
    value: any;
    constraints: string[];
}

interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

interface ValidationRule {
    type: 'type' | 'constraint' | 'custom';
    name: string;
    value?: any;
    validator: (value: any, ruleValue?: any) => boolean;
    message: (propertyName: string, value: any, ruleValue?: any) => string;
}

function addValidationRule(target: any, propertyKey: string, rule: ValidationRule) {
    const existingRules = Reflect.getMetadata('validation:rules', target, propertyKey) || [];
    existingRules.push(rule);
    Reflect.defineMetadata('validation:rules', existingRules, target, propertyKey);
}

function IsString(target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
        type: 'type',
        name: 'isString',
        validator: (value) => typeof value === 'string',
        message: (prop, value) => `${prop} は文字列である必要があります。現在の値: ${value}`
    });
}

function IsNumber(target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
        type: 'type',
        name: 'isNumber',
        validator: (value) => typeof value === 'number' && !isNaN(value),
        message: (prop, value) => `${prop} は数値である必要があります。現在の値: ${value}`
    });
}

function IsEmail(target: any, propertyKey: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    addValidationRule(target, propertyKey, {
        type: 'custom',
        name: 'isEmail',
        validator: (value) => typeof value === 'string' && emailRegex.test(value),
        message: (prop, value) => `${prop} は有効なメールアドレスの形式である必要があります。現在の値: ${value}`
    });
}

function MinLength(min: number) {
    return function (target: any, propertyKey: string) {
        addValidationRule(target, propertyKey, {
            type: 'constraint',
            name: 'minLength',
            value: min,
            validator: (value, minLen) => typeof value === 'string' && value.length >= minLen,
            message: (prop, value, minLen) => `${prop} は${minLen}文字以上である必要があります。現在の長さ: ${value?.length || 0}`
        });
    };
}

function MaxLength(max: number) {
    return function (target: any, propertyKey: string) {
        addValidationRule(target, propertyKey, {
            type: 'constraint',
            name: 'maxLength',
            value: max,
            validator: (value, maxLen) => typeof value === 'string' && value.length <= maxLen,
            message: (prop, value, maxLen) => `${prop} は${maxLen}文字以下である必要があります。現在の長さ: ${value?.length || 0}`
        });
    };
}

function Min(min: number) {
    return function (target: any, propertyKey: string) {
        addValidationRule(target, propertyKey, {
            type: 'constraint',
            name: 'min',
            value: min,
            validator: (value, minVal) => typeof value === 'number' && value >= minVal,
            message: (prop, value, minVal) => `${prop} は${minVal}以上である必要があります。現在の値: ${value}`
        });
    };
}

function Max(max: number) {
    return function (target: any, propertyKey: string) {
        addValidationRule(target, propertyKey, {
            type: 'constraint',
            name: 'max',
            value: max,
            validator: (value, maxVal) => typeof value === 'number' && value <= maxVal,
            message: (prop, value, maxVal) => `${prop} は${maxVal}以下である必要があります。現在の値: ${value}`
        });
    };
}

function IsOptional(target: any, propertyKey: string) {
    Reflect.defineMetadata('validation:optional', true, target, propertyKey);
}

function Transform(transformFn: (value: any) => any) {
    return function (target: any, propertyKey: string) {
        Reflect.defineMetadata('validation:transform', transformFn, target, propertyKey);
    };
}

function validate(obj: any): ValidationResult {
    const errors: ValidationError[] = [];
    const constructor = obj.constructor;
    const propertyNames = Object.getOwnPropertyNames(obj);
    
    propertyNames.forEach(propertyName => {
        const value = obj[propertyName];
        const isOptional = Reflect.getMetadata('validation:optional', constructor.prototype, propertyName);
        const transformFn = Reflect.getMetadata('validation:transform', constructor.prototype, propertyName);
        const rules: ValidationRule[] = Reflect.getMetadata('validation:rules', constructor.prototype, propertyName) || [];
        
        // 値の変換
        let transformedValue = value;
        if (transformFn) {
            transformedValue = transformFn(value);
            obj[propertyName] = transformedValue;
        }
        
        // オプショナルフィールドで値がundefined/nullの場合はスキップ
        if (isOptional && (transformedValue === undefined || transformedValue === null)) {
            return;
        }
        
        // バリデーション実行
        const constraints: string[] = [];
        rules.forEach(rule => {
            if (!rule.validator(transformedValue, rule.value)) {
                constraints.push(rule.message(propertyName, transformedValue, rule.value));
            }
        });
        
        if (constraints.length > 0) {
            errors.push({
                property: propertyName,
                value: transformedValue,
                constraints
            });
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

class CreateUserDto {
    @IsString
    @MinLength(2)
    @MaxLength(50)
    name: string;
    
    @IsEmail
    email: string;
    
    @IsNumber
    @Min(0)
    @Max(150)
    age: number;
    
    @IsString
    @IsOptional
    @Transform((value: string) => value?.trim().toLowerCase())
    nickname?: string;
    
    constructor(name: string, email: string, age: number, nickname?: string) {
        this.name = name;
        this.email = email;
        this.age = age;
        this.nickname = nickname;
    }
}

// バリデーションテスト
console.log('バリデーションテスト:');

const validUser = new CreateUserDto("Alice Smith", "alice@example.com", 25, "  ALICE  ");
const validationResult1 = validate(validUser);
console.log(`有効なユーザー: ${validationResult1.isValid ? '✓' : '✗'}`);
console.log('変換後のnickname:', validUser.nickname);

const invalidUser = new CreateUserDto("A", "invalid-email", -5, "");
const validationResult2 = validate(invalidUser);
console.log(`無効なユーザー: ${validationResult2.isValid ? '✓' : '✗'}`);
if (!validationResult2.isValid) {
    console.log('バリデーションエラー:');
    validationResult2.errors.forEach(error => {
        console.log(`  ${error.property}:`);
        error.constraints.forEach(constraint => {
            console.log(`    - ${constraint}`);
        });
    });
}

// 演習3: パフォーマンス監視デコレータの解答
console.log('\n=== 演習3解答: パフォーマンス監視デコレータ ===');

interface PerformanceMetrics {
    methodName: string;
    executionTimes: number[];
    callCount: number;
    totalTime: number;
    averageTime: number;
    maxTime: number;
    minTime: number;
    lastExecuted: Date;
}

class PerformanceMonitor {
    private static metrics = new Map<string, PerformanceMetrics>();
    
    static recordExecution(methodName: string, executionTime: number): void {
        if (!this.metrics.has(methodName)) {
            this.metrics.set(methodName, {
                methodName,
                executionTimes: [],
                callCount: 0,
                totalTime: 0,
                averageTime: 0,
                maxTime: 0,
                minTime: Infinity,
                lastExecuted: new Date()
            });
        }
        
        const metrics = this.metrics.get(methodName)!;
        metrics.executionTimes.push(executionTime);
        metrics.callCount++;
        metrics.totalTime += executionTime;
        metrics.averageTime = metrics.totalTime / metrics.callCount;
        metrics.maxTime = Math.max(metrics.maxTime, executionTime);
        metrics.minTime = Math.min(metrics.minTime, executionTime);
        metrics.lastExecuted = new Date();
        
        // 最新の100回分のみ保持
        if (metrics.executionTimes.length > 100) {
            metrics.executionTimes = metrics.executionTimes.slice(-100);
        }
    }
    
    static getMetrics(methodName?: string): PerformanceMetrics[] {
        if (methodName) {
            const metrics = this.metrics.get(methodName);
            return metrics ? [metrics] : [];
        }
        return Array.from(this.metrics.values());
    }
    
    static generateReport(): void {
        console.log('\n📊 パフォーマンスレポート');
        console.log('='.repeat(50));
        
        const allMetrics = this.getMetrics();
        if (allMetrics.length === 0) {
            console.log('パフォーマンスデータがありません。');
            return;
        }
        
        allMetrics.forEach(metrics => {
            console.log(`\n🔍 メソッド: ${metrics.methodName}`);
            console.log(`   呼び出し回数: ${metrics.callCount}`);
            console.log(`   平均実行時間: ${metrics.averageTime.toFixed(2)}ms`);
            console.log(`   最小実行時間: ${metrics.minTime.toFixed(2)}ms`);
            console.log(`   最大実行時間: ${metrics.maxTime.toFixed(2)}ms`);
            console.log(`   合計実行時間: ${metrics.totalTime.toFixed(2)}ms`);
            console.log(`   最終実行: ${metrics.lastExecuted.toISOString()}`);
        });
        
        console.log('\n' + '='.repeat(50));
    }
    
    static clear(): void {
        this.metrics.clear();
    }
}

function Monitor(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const methodName = `${className}.${propertyKey}`;
    
    descriptor.value = async function(...args: any[]) {
        const start = performance.now();
        
        try {
            const result = await originalMethod.apply(this, args);
            const end = performance.now();
            const executionTime = end - start;
            
            PerformanceMonitor.recordExecution(methodName, executionTime);
            return result;
        } catch (error) {
            const end = performance.now();
            const executionTime = end - start;
            
            PerformanceMonitor.recordExecution(methodName, executionTime);
            throw error;
        }
    };
}

function Alert(thresholdMs: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        const methodName = `${className}.${propertyKey}`;
        
        descriptor.value = async function(...args: any[]) {
            const start = performance.now();
            const result = await originalMethod.apply(this, args);
            const end = performance.now();
            const executionTime = end - start;
            
            if (executionTime > thresholdMs) {
                console.warn(`⚠️  パフォーマンスアラート: ${methodName} が ${executionTime.toFixed(2)}ms で実行されました（閾値: ${thresholdMs}ms）`);
            }
            
            return result;
        };
    };
}

function Profile(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const methodName = `${className}.${propertyKey}`;
    
    descriptor.value = async function(...args: any[]) {
        // Node.js環境でのメモリ使用量取得（ブラウザでは簡易版）
        const getMemoryUsage = () => {
            if (typeof process !== 'undefined' && process.memoryUsage) {
                return process.memoryUsage();
            }
            return { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 };
        };
        
        const memBefore = getMemoryUsage();
        const start = performance.now();
        
        const result = await originalMethod.apply(this, args);
        
        const end = performance.now();
        const memAfter = getMemoryUsage();
        
        const executionTime = end - start;
        const memoryDelta = memAfter.heapUsed - memBefore.heapUsed;
        
        console.log(`📈 プロファイル - ${methodName}:`);
        console.log(`   実行時間: ${executionTime.toFixed(2)}ms`);
        console.log(`   メモリ使用量変化: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   ヒープ使用量: ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        
        return result;
    };
}

class DataProcessor {
    @Monitor
    @Alert(100) // 100ms以上でアラート
    processLargeDataset(size: number): number[] {
        const data: number[] = [];
        for (let i = 0; i < size; i++) {
            data.push(Math.random() * 100);
        }
        return data.sort((a, b) => a - b);
    }
    
    @Monitor
    @Profile
    complexCalculation(iterations: number): number {
        let result = 0;
        for (let i = 0; i < iterations; i++) {
            result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
        }
        return result;
    }
    
    @Monitor
    async asyncOperation(): Promise<string> {
        return new Promise(resolve => {
            setTimeout(() => resolve('完了'), Math.random() * 200);
        });
    }
}

async function testPerformanceMonitoring() {
    console.log('パフォーマンステスト実行中...');
    
    PerformanceMonitor.clear();
    const processor = new DataProcessor();
    
    // テスト実行
    console.log('\n1. 小さなデータセット処理:');
    processor.processLargeDataset(1000);
    
    console.log('\n2. 大きなデータセット処理（アラート発生予定）:');
    processor.processLargeDataset(100000);
    
    console.log('\n3. 複雑な計算（プロファイル付き）:');
    processor.complexCalculation(10000);
    
    console.log('\n4. 非同期処理:');
    await processor.asyncOperation();
    await processor.asyncOperation();
    await processor.asyncOperation();
    
    // パフォーマンスレポート生成
    PerformanceMonitor.generateReport();
}

// 全ての演習のテスト実行
async function runAllExercises() {
    console.log('=== 全演習の実行 ===\n');
    
    console.log('✅ 演習1: HTTPルーティングデコレータ - 完了');
    console.log('✅ 演習2: バリデーションデコレータ - 完了');
    
    console.log('\n演習3: パフォーマンス監視デコレータの実行...');
    await testPerformanceMonitoring();
    
    console.log('\n🎉 全ての演習が完了しました！');
}

// 実行
runAllExercises().catch(console.error);

export {
    RouteRegistry,
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Middleware,
    UserController,
    testRouting,
    CreateUserDto,
    validate,
    PerformanceMonitor,
    DataProcessor,
    testPerformanceMonitoring
};