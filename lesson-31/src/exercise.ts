/**
 * Lesson 31 演習問題: デコレータ (Decorators)
 * 
 * この演習では、実用的なデコレータシステムを実装します。
 */

// 演習1: HTTPルーティングデコレータシステムの実装
console.log('=== 演習1: HTTPルーティングデコレータ ===');

/**
 * TODO: 以下のHTTPルーティングデコレータシステムを完成させてください
 * 
 * 要件:
 * 1. @Controller(path) - クラスレベルのルート設定
 * 2. @Get(path), @Post(path), @Put(path), @Delete(path) - HTTPメソッドのルート設定
 * 3. @Middleware(fn) - ミドルウェア関数の設定
 * 4. ルート情報を収集し、実際のHTTPサーバーに登録できる形式で提供
 */

// ルート情報を格納する型
interface RouteInfo {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    handler: Function;
    middlewares: Function[];
    controllerPath?: string;
}

// ルートレジストリ
class RouteRegistry {
    private static routes: RouteInfo[] = [];
    
    static addRoute(route: RouteInfo): void {
        // TODO: ルート情報を追加する処理を実装
    }
    
    static getRoutes(): RouteInfo[] {
        return this.routes;
    }
    
    static clear(): void {
        this.routes = [];
    }
}

// TODO: コントローラーデコレータを実装
function Controller(basePath: string) {
    // ヒント: クラスにメタデータとしてbasePathを保存
}

// TODO: HTTPメソッドデコレータを実装
function Get(path: string) {
    // ヒント: メソッドデコレータとして実装し、RouteRegistryに登録
}

function Post(path: string) {
    // TODO: 実装
}

function Put(path: string) {
    // TODO: 実装
}

function Delete(path: string) {
    // TODO: 実装
}

// TODO: ミドルウェアデコレータを実装
function Middleware(middlewareFn: Function) {
    // ヒント: メソッドにミドルウェア情報を追加
}

// 認証ミドルウェアの例
const authMiddleware = (req: any, res: any, next: Function) => {
    console.log('認証チェック中...');
    // 実際の認証ロジックはここに
    next();
};

const loggingMiddleware = (req: any, res: any, next: Function) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
};

// TODO: 以下のコントローラーが正しく動作するように、上記のデコレータを実装してください
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

// テスト用の関数
function testRouting() {
    const controller = new UserController();
    const routes = RouteRegistry.getRoutes();
    
    console.log('登録されたルート:');
    routes.forEach(route => {
        const fullPath = route.controllerPath + route.path;
        console.log(`  ${route.method} ${fullPath} (middlewares: ${route.middlewares.length})`);
    });
}

console.log('\n=== 演習2: バリデーションデコレータシステム ===');

/**
 * TODO: より高度なバリデーションデコレータシステムを実装してください
 * 
 * 要件:
 * 1. @IsString, @IsNumber, @IsEmail, @IsUrl などの基本バリデーション
 * 2. @MinLength, @MaxLength, @Min, @Max などの制約バリデーション
 * 3. @IsOptional - オプショナルフィールドのマーク
 * 4. @Transform - 値の変換機能
 * 5. ネストしたオブジェクトのバリデーション対応
 */

// バリデーションエラー型
interface ValidationError {
    property: string;
    value: any;
    constraints: string[];
}

// バリデーション結果型
interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// TODO: バリデーションデコレータを実装
function IsString(target: any, propertyKey: string) {
    // TODO: 文字列型のバリデーションを実装
}

function IsNumber(target: any, propertyKey: string) {
    // TODO: 数値型のバリデーションを実装
}

function IsEmail(target: any, propertyKey: string) {
    // TODO: メールアドレス形式のバリデーションを実装
}

function MinLength(min: number) {
    return function (target: any, propertyKey: string) {
        // TODO: 最小文字数のバリデーションを実装
    };
}

function MaxLength(max: number) {
    return function (target: any, propertyKey: string) {
        // TODO: 最大文字数のバリデーションを実装
    };
}

function Min(min: number) {
    return function (target: any, propertyKey: string) {
        // TODO: 最小値のバリデーションを実装
    };
}

function Max(max: number) {
    return function (target: any, propertyKey: string) {
        // TODO: 最大値のバリデーションを実装
    };
}

function IsOptional(target: any, propertyKey: string) {
    // TODO: オプショナルフィールドのマークを実装
}

function Transform(transformFn: (value: any) => any) {
    return function (target: any, propertyKey: string) {
        // TODO: 値の変換処理を実装
    };
}

// TODO: validate関数を実装
function validate(obj: any): ValidationResult {
    // TODO: オブジェクトのバリデーションを実装
    // ヒント: Reflect.getMetadataでバリデーション情報を取得
    return { isValid: true, errors: [] };
}

// テスト用のクラス
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

console.log('\n=== 演習3: パフォーマンス監視デコレータ ===');

/**
 * TODO: パフォーマンス監視システムを実装してください
 * 
 * 要件:
 * 1. @Monitor - メソッドの実行時間、呼び出し回数を記録
 * 2. @Alert(threshold) - 閾値を超えた場合にアラートを出力
 * 3. @Profile - CPU使用率、メモリ使用量の監視（簡易版）
 * 4. レポート機能 - 統計情報の出力
 */

interface PerformanceMetrics {
    methodName: string;
    executionTimes: number[];
    callCount: number;
    totalTime: number;
    averageTime: number;
    maxTime: number;
    minTime: number;
}

class PerformanceMonitor {
    private static metrics = new Map<string, PerformanceMetrics>();
    
    static recordExecution(methodName: string, executionTime: number): void {
        // TODO: 実行時間の記録処理を実装
    }
    
    static getMetrics(methodName?: string): PerformanceMetrics[] {
        // TODO: メトリクス取得処理を実装
        return [];
    }
    
    static generateReport(): void {
        // TODO: レポート生成処理を実装
    }
    
    static clear(): void {
        this.metrics.clear();
    }
}

// TODO: パフォーマンス監視デコレータを実装
function Monitor(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // TODO: メソッドの実行時間と呼び出し回数を監視
}

function Alert(thresholdMs: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // TODO: 閾値を超えた場合のアラート機能を実装
    };
}

function Profile(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // TODO: 簡易的なプロファイリング機能を実装
    // ヒント: process.memoryUsage(), process.cpuUsage()を使用
}

// テスト用のクラス
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
    asyncOperation(): Promise<string> {
        return new Promise(resolve => {
            setTimeout(() => resolve('完了'), Math.random() * 200);
        });
    }
}

// テスト関数
async function testPerformanceMonitoring() {
    const processor = new DataProcessor();
    
    // テスト実行
    processor.processLargeDataset(1000);
    processor.processLargeDataset(5000);
    processor.complexCalculation(10000);
    await processor.asyncOperation();
    
    // レポート生成
    PerformanceMonitor.generateReport();
}

// 演習の実行
console.log('演習を実行してください:');
console.log('1. testRouting() を呼び出してルーティングをテスト');
console.log('2. CreateUserDtoクラスでバリデーションをテスト');
console.log('3. testPerformanceMonitoring() を呼び出してパフォーマンス監視をテスト');

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