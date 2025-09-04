/**
 * Lesson 31 テスト: デコレータ (Decorators)
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

describe('Lesson 31: デコレータ (Decorators)', () => {
    beforeEach(() => {
        // テスト前にメタデータをクリア
        metadataStorage.clear();
        jest.clearAllMocks();
    });

    describe('基本的なデコレータ', () => {
        test('クラスデコレータが正しく動作する', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation();

            function LogClass(target: any) {
                console.log(`クラス ${target.name} が定義されました`);
            }

            function Component(name: string) {
                return function <T extends { new(...args: any[]): {} }>(constructor: T) {
                    return class extends constructor {
                        componentName = name;
                        created = new Date();
                    };
                };
            }

            @LogClass
            @Component("TestComponent")
            class TestClass {
                constructor(public value: string) {}
            }

            const instance = new TestClass("test");
            
            expect(logSpy).toHaveBeenCalledWith('クラス TestClass が定義されました');
            expect((instance as any).componentName).toBe("TestComponent");
            expect((instance as any).created).toBeInstanceOf(Date);
            expect(instance.value).toBe("test");

            logSpy.mockRestore();
        });
    });

    describe('メソッドデコレータ', () => {
        test('実行時間測定デコレータが正しく動作する', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation();

            function MeasureTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
                const originalMethod = descriptor.value;
                
                descriptor.value = function(...args: any[]) {
                    const start = performance.now();
                    const result = originalMethod.apply(this, args);
                    const end = performance.now();
                    console.log(`${propertyKey} 実行時間: ${(end - start).toFixed(2)}ms`);
                    return result;
                };
            }

            class Calculator {
                @MeasureTime
                add(a: number, b: number): number {
                    return a + b;
                }
            }

            const calculator = new Calculator();
            const result = calculator.add(2, 3);

            expect(result).toBe(5);
            expect(logSpy).toHaveBeenCalledWith(
                expect.stringMatching(/add 実行時間: \d+\.\d+ms/)
            );

            logSpy.mockRestore();
        });

        test('キャッシュデコレータが正しく動作する', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation();
            const cache = new Map<string, { value: any; timestamp: number }>();

            function Cache(ttl: number = 5000) {
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

            class DataService {
                @Cache(1000)
                getData(id: number): string {
                    return `data-${id}`;
                }
            }

            const service = new DataService();
            
            // 最初の呼び出し
            let result1 = service.getData(1);
            expect(result1).toBe('data-1');
            expect(logSpy).toHaveBeenCalledWith('キャッシュ更新: getData_[1]');

            logSpy.mockClear();

            // 2回目の呼び出し（キャッシュヒット）
            let result2 = service.getData(1);
            expect(result2).toBe('data-1');
            expect(logSpy).toHaveBeenCalledWith('キャッシュヒット: getData_[1]');

            logSpy.mockRestore();
        });
    });

    describe('プロパティデコレータとバリデーション', () => {
        test('バリデーションデコレータが正しく動作する', () => {
            interface ValidationRule {
                type: string;
                validator: (value: any, ruleValue?: any) => boolean;
                message: (propertyName: string, value: any, ruleValue?: any) => string;
                value?: any;
            }

            function addValidationRule(target: any, propertyKey: string, rule: ValidationRule) {
                const existingRules = Reflect.getMetadata('validation:rules', target, propertyKey) || [];
                existingRules.push(rule);
                Reflect.defineMetadata('validation:rules', existingRules, target, propertyKey);
            }

            function IsString(target: any, propertyKey: string) {
                addValidationRule(target, propertyKey, {
                    type: 'type',
                    validator: (value) => typeof value === 'string',
                    message: (prop, value) => `${prop} は文字列である必要があります`
                });
            }

            function MinLength(min: number) {
                return function (target: any, propertyKey: string) {
                    addValidationRule(target, propertyKey, {
                        type: 'constraint',
                        value: min,
                        validator: (value, minLen) => typeof value === 'string' && value.length >= minLen,
                        message: (prop, value, minLen) => `${prop} は${minLen}文字以上である必要があります`
                    });
                };
            }

            function validate(obj: any) {
                const errors: string[] = [];
                const constructor = obj.constructor;
                const propertyNames = Object.getOwnPropertyNames(obj);
                
                propertyNames.forEach(propertyName => {
                    const value = obj[propertyName];
                    const rules: ValidationRule[] = Reflect.getMetadata('validation:rules', constructor.prototype, propertyName) || [];
                    
                    rules.forEach(rule => {
                        if (!rule.validator(value, rule.value)) {
                            errors.push(rule.message(propertyName, value, rule.value));
                        }
                    });
                });
                
                return { isValid: errors.length === 0, errors };
            }

            class User {
                @IsString
                @MinLength(2)
                name: string;

                constructor(name: string) {
                    this.name = name;
                }
            }

            // 有効なケース
            const validUser = new User("Alice");
            const validResult = validate(validUser);
            expect(validResult.isValid).toBe(true);
            expect(validResult.errors).toHaveLength(0);

            // 無効なケース
            const invalidUser = new User("A");
            const invalidResult = validate(invalidUser);
            expect(invalidResult.isValid).toBe(false);
            expect(invalidResult.errors).toContain("name は2文字以上である必要があります");
        });
    });

    describe('依存性注入システム', () => {
        test('DIコンテナが正しく動作する', () => {
            class DIContainer {
                private dependencies = new Map<string, new (...args: any[]) => any>();
                private instances = new Map<string, any>();
                
                register<T>(token: string, implementation: new (...args: any[]) => T): void {
                    this.dependencies.set(token, implementation);
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

            function Injectable(token: string) {
                return function <T extends { new(...args: any[]): {} }>(constructor: T) {
                    container.register(token, constructor);
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
            }

            class Service {
                @Inject('logger')
                private logger!: Logger;
                
                doSomething(): void {
                    this.logger.log('何かを実行しました');
                }
            }

            const logSpy = jest.spyOn(console, 'log').mockImplementation();
            
            const service = new Service();
            service.doSomething();

            expect(logSpy).toHaveBeenCalledWith('[LOG] 何かを実行しました');
            expect(service['logger']).toBeInstanceOf(Logger);

            logSpy.mockRestore();
        });
    });

    describe('HTTPルーティングシステム', () => {
        test('ルーティングデコレータが正しく動作する', () => {
            interface RouteInfo {
                method: string;
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

            function Get(path: string) {
                return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
                    Reflect.defineMetadata('route:method', 'GET', target, propertyKey);
                    Reflect.defineMetadata('route:path', path, target, propertyKey);
                };
            }

            function Middleware(middlewareFn: Function) {
                return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
                    const existingMiddlewares = Reflect.getMetadata('route:middlewares', target, propertyKey) || [];
                    existingMiddlewares.unshift(middlewareFn);
                    Reflect.defineMetadata('route:middlewares', existingMiddlewares, target, propertyKey);
                };
            }

            const testMiddleware = (req: any, res: any, next: Function) => {
                next();
            };

            RouteRegistry.clear();

            @Controller('/api/test')
            class TestController {
                @Get('/')
                @Middleware(testMiddleware)
                getTest() {
                    return { message: 'test' };
                }
            }

            const controller = new TestController();
            const routes = RouteRegistry.getRoutes();

            expect(routes).toHaveLength(1);
            expect(routes[0].method).toBe('GET');
            expect(routes[0].path).toBe('/');
            expect(routes[0].controllerPath).toBe('/api/test');
            expect(routes[0].middlewares).toHaveLength(1);
            expect(routes[0].middlewares[0]).toBe(testMiddleware);
        });
    });

    describe('パフォーマンス監視システム', () => {
        test('パフォーマンス監視デコレータが正しく動作する', async () => {
            interface PerformanceMetrics {
                methodName: string;
                callCount: number;
                totalTime: number;
                averageTime: number;
            }

            class PerformanceMonitor {
                private static metrics = new Map<string, PerformanceMetrics>();
                
                static recordExecution(methodName: string, executionTime: number): void {
                    if (!this.metrics.has(methodName)) {
                        this.metrics.set(methodName, {
                            methodName,
                            callCount: 0,
                            totalTime: 0,
                            averageTime: 0
                        });
                    }
                    
                    const metrics = this.metrics.get(methodName)!;
                    metrics.callCount++;
                    metrics.totalTime += executionTime;
                    metrics.averageTime = metrics.totalTime / metrics.callCount;
                }
                
                static getMetrics(methodName: string): PerformanceMetrics | undefined {
                    return this.metrics.get(methodName);
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
                    const result = await originalMethod.apply(this, args);
                    const end = performance.now();
                    const executionTime = end - start;
                    
                    PerformanceMonitor.recordExecution(methodName, executionTime);
                    return result;
                };
            }

            PerformanceMonitor.clear();

            class TestService {
                @Monitor
                async processData(): Promise<string> {
                    return new Promise(resolve => {
                        setTimeout(() => resolve('processed'), 10);
                    });
                }
            }

            const service = new TestService();
            await service.processData();
            await service.processData();

            const metrics = PerformanceMonitor.getMetrics('TestService.processData');
            expect(metrics).toBeDefined();
            expect(metrics!.callCount).toBe(2);
            expect(metrics!.totalTime).toBeGreaterThan(0);
            expect(metrics!.averageTime).toBeGreaterThan(0);
        });
    });
});

export {};