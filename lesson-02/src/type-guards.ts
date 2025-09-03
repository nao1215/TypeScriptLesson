/**
 * Lesson 02: 型ガード（Type Guards）の実践的実装
 * 
 * 実行時に型を安全に判定し、TypeScriptの型システムと連携して
 * より安全で保守性の高いコードを書く方法を学習します。
 */

// ===== 基本的な型ガード関数 =====

function isString(value: unknown): value is string {
    return typeof value === "string";
}

function isNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
}

function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}

function isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
}

// ===== より高度な型ガード：オブジェクトの構造チェック =====

interface User {
    id: string;
    username: string;
    email: string;
    age?: number;
    isActive: boolean;
}

function isUser(value: unknown): value is User {
    if (!isObject(value)) return false;

    const obj = value as Record<string, unknown>;
    
    return (
        isString(obj.id) &&
        isString(obj.username) &&
        isString(obj.email) &&
        isBoolean(obj.isActive) &&
        (obj.age === undefined || isNumber(obj.age))
    );
}

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
    tags: string[];
    metadata?: {
        created: Date;
        updated: Date;
        version: number;
    };
}

function isProduct(value: unknown): value is Product {
    if (!isObject(value)) return false;

    const obj = value as Record<string, unknown>;
    
    const hasRequiredFields = (
        isString(obj.id) &&
        isString(obj.name) &&
        isNumber(obj.price) &&
        isString(obj.category) &&
        isBoolean(obj.inStock) &&
        isArray(obj.tags) &&
        (obj.tags as unknown[]).every(tag => isString(tag))
    );

    if (!hasRequiredFields) return false;

    // オプショナルなmetadataフィールドのチェック
    if (obj.metadata !== undefined) {
        if (!isObject(obj.metadata)) return false;
        
        const metadata = obj.metadata as Record<string, unknown>;
        if (!(
            isDate(metadata.created) &&
            isDate(metadata.updated) &&
            isNumber(metadata.version)
        )) return false;
    }

    return true;
}

// ===== APIレスポンスの型ガード =====

interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    message: string;
    timestamp: string;
}

interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    timestamp: string;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

function isApiSuccessResponse<T>(
    response: ApiResponse<T>,
    dataValidator?: (data: unknown) => data is T
): response is ApiSuccessResponse<T> {
    if (!isObject(response)) return false;

    const obj = response as Record<string, unknown>;
    const isBasicSuccess = (
        obj.success === true &&
        isString(obj.message) &&
        isString(obj.timestamp)
    );

    if (!isBasicSuccess) return false;

    // データバリデーターが提供されている場合は使用
    if (dataValidator) {
        return dataValidator(obj.data);
    }

    return true;
}

function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
    if (!isObject(response)) return false;

    const obj = response as Record<string, unknown>;
    return (
        obj.success === false &&
        isObject(obj.error) &&
        isString((obj.error as Record<string, unknown>).code) &&
        isString((obj.error as Record<string, unknown>).message) &&
        isString(obj.timestamp)
    );
}

// ===== フォームデータの型ガード =====

interface ContactForm {
    name: string;
    email: string;
    subject: string;
    message: string;
    priority: "low" | "normal" | "high";
    newsletter: boolean;
    attachments?: File[];
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isPriority(value: unknown): value is "low" | "normal" | "high" {
    return value === "low" || value === "normal" || value === "high";
}

function isFile(value: unknown): value is File {
    return value instanceof File;
}

function isContactForm(value: unknown): value is ContactForm {
    if (!isObject(value)) return false;

    const obj = value as Record<string, unknown>;
    
    const hasRequiredFields = (
        isString(obj.name) && obj.name.trim().length > 0 &&
        isString(obj.email) && isValidEmail(obj.email) &&
        isString(obj.subject) && obj.subject.trim().length > 0 &&
        isString(obj.message) && obj.message.trim().length > 0 &&
        isPriority(obj.priority) &&
        isBoolean(obj.newsletter)
    );

    if (!hasRequiredFields) return false;

    // オプショナルなattachmentsフィールドのチェック
    if (obj.attachments !== undefined) {
        if (!isArray(obj.attachments)) return false;
        if (!(obj.attachments as unknown[]).every(file => isFile(file))) return false;
    }

    return true;
}

// ===== 設定オブジェクトの型ガード =====

interface DatabaseConfig {
    type: "postgresql" | "mysql" | "sqlite";
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    poolSize?: number;
    timeout?: number;
}

interface RedisConfig {
    type: "redis";
    host: string;
    port: number;
    password?: string;
    database?: number;
    keyPrefix?: string;
}

interface FileConfig {
    type: "file";
    path: string;
    maxSize: number;
    backup?: boolean;
}

type Config = DatabaseConfig | RedisConfig | FileConfig;

function isDatabaseConfig(config: unknown): config is DatabaseConfig {
    if (!isObject(config)) return false;

    const obj = config as Record<string, unknown>;
    const type = obj.type;
    
    if (type !== "postgresql" && type !== "mysql" && type !== "sqlite") return false;

    return (
        isString(obj.host) &&
        isNumber(obj.port) &&
        isString(obj.database) &&
        isString(obj.username) &&
        isString(obj.password) &&
        isBoolean(obj.ssl) &&
        (obj.poolSize === undefined || isNumber(obj.poolSize)) &&
        (obj.timeout === undefined || isNumber(obj.timeout))
    );
}

function isRedisConfig(config: unknown): config is RedisConfig {
    if (!isObject(config)) return false;

    const obj = config as Record<string, unknown>;
    
    return (
        obj.type === "redis" &&
        isString(obj.host) &&
        isNumber(obj.port) &&
        (obj.password === undefined || isString(obj.password)) &&
        (obj.database === undefined || isNumber(obj.database)) &&
        (obj.keyPrefix === undefined || isString(obj.keyPrefix))
    );
}

function isFileConfig(config: unknown): config is FileConfig {
    if (!isObject(config)) return false;

    const obj = config as Record<string, unknown>;
    
    return (
        obj.type === "file" &&
        isString(obj.path) &&
        isNumber(obj.maxSize) &&
        (obj.backup === undefined || isBoolean(obj.backup))
    );
}

// ===== エラーハンドリングの型ガード =====

interface ApplicationError {
    name: string;
    message: string;
    code: string;
    statusCode?: number;
    originalError?: unknown;
}

interface ValidationError extends ApplicationError {
    name: "ValidationError";
    fields: Array<{
        field: string;
        message: string;
        code: string;
    }>;
}

interface NetworkError extends ApplicationError {
    name: "NetworkError";
    url: string;
    method: string;
    timeout: boolean;
}

function isApplicationError(error: unknown): error is ApplicationError {
    if (!isObject(error)) return false;

    const obj = error as Record<string, unknown>;
    return (
        isString(obj.name) &&
        isString(obj.message) &&
        isString(obj.code) &&
        (obj.statusCode === undefined || isNumber(obj.statusCode))
    );
}

function isValidationError(error: unknown): error is ValidationError {
    if (!isApplicationError(error)) return false;
    if (error.name !== "ValidationError") return false;

    const obj = error as Record<string, unknown>;
    if (!isArray(obj.fields)) return false;

    return (obj.fields as unknown[]).every(field => {
        if (!isObject(field)) return false;
        const fieldObj = field as Record<string, unknown>;
        return (
            isString(fieldObj.field) &&
            isString(fieldObj.message) &&
            isString(fieldObj.code)
        );
    });
}

function isNetworkError(error: unknown): error is NetworkError {
    if (!isApplicationError(error)) return false;
    if (error.name !== "NetworkError") return false;

    const obj = error as Record<string, unknown>;
    return (
        isString(obj.url) &&
        isString(obj.method) &&
        isBoolean(obj.timeout)
    );
}

// ===== 実用的なユーティリティ関数 =====

function safeJsonParse<T>(
    json: string,
    validator: (value: unknown) => value is T
): T | null {
    try {
        const parsed = JSON.parse(json);
        return validator(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

function validateAndTransform<T, U>(
    input: unknown,
    validator: (value: unknown) => value is T,
    transformer: (value: T) => U
): U | null {
    if (validator(input)) {
        return transformer(input);
    }
    return null;
}

function createArrayValidator<T>(
    itemValidator: (value: unknown) => value is T
): (value: unknown) => value is T[] {
    return (value: unknown): value is T[] => {
        if (!isArray(value)) return false;
        return (value as unknown[]).every(item => itemValidator(item));
    };
}

// ===== 実際の使用例とデモ =====

console.log("=== 型ガード（Type Guards）の実践的実装例 ===");

// 基本的な型チェック
console.log("\n🔍 基本的な型チェック:");
const unknownValues: unknown[] = [
    "Hello",
    42,
    true,
    [1, 2, 3],
    { name: "John" },
    new Date(),
    null,
    undefined
];

unknownValues.forEach((value, index) => {
    console.log(`値 ${index + 1}: ${JSON.stringify(value)}`);
    if (isString(value)) {
        console.log(`  → 文字列: 長さ ${value.length}`);
    } else if (isNumber(value)) {
        console.log(`  → 数値: ${value > 0 ? "正" : value < 0 ? "負" : "ゼロ"}`);
    } else if (isBoolean(value)) {
        console.log(`  → 真偽値: ${value ? "true" : "false"}`);
    } else if (isArray(value)) {
        console.log(`  → 配列: 要素数 ${value.length}`);
    } else if (isObject(value)) {
        console.log(`  → オブジェクト: キー数 ${Object.keys(value).length}`);
    } else if (isDate(value)) {
        console.log(`  → 日付: ${value.toISOString()}`);
    } else {
        console.log(`  → その他: ${typeof value}`);
    }
});

// ユーザーデータの検証
console.log("\n👤 ユーザーデータの検証:");
const userData: unknown[] = [
    {
        id: "user-001",
        username: "john_doe",
        email: "john@example.com",
        age: 25,
        isActive: true
    },
    {
        id: "user-002",
        username: "jane_smith",
        email: "jane@example.com",
        isActive: false
        // age は省略（オプショナル）
    },
    {
        // 不正なデータ
        id: 123, // 数値だが文字列であるべき
        username: "invalid_user",
        email: "not-an-email",
        isActive: "yes" // 文字列だが真偽値であるべき
    }
];

userData.forEach((data, index) => {
    console.log(`\nユーザーデータ ${index + 1}:`);
    if (isUser(data)) {
        console.log(`  ✅ 有効なユーザー: ${data.username} (${data.email})`);
        console.log(`     ID: ${data.id}, アクティブ: ${data.isActive}`);
        if (data.age) {
            console.log(`     年齢: ${data.age}歳`);
        }
    } else {
        console.log(`  ❌ 無効なユーザーデータ`);
        console.log(`     データ: ${JSON.stringify(data)}`);
    }
});

// API レスポンスの処理
console.log("\n🌐 API レスポンスの処理:");
const apiResponses: unknown[] = [
    {
        success: true,
        data: { users: 150, products: 1200 },
        message: "データを正常に取得しました",
        timestamp: "2024-01-20T10:30:00Z"
    },
    {
        success: false,
        error: {
            code: "NOT_FOUND",
            message: "リソースが見つかりません",
            details: { resourceId: "123" }
        },
        timestamp: "2024-01-20T10:31:00Z"
    },
    {
        // 不正なレスポンス構造
        success: true,
        // data フィールドが欠けている
        message: "incomplete response",
        timestamp: "2024-01-20T10:32:00Z"
    }
];

apiResponses.forEach((response, index) => {
    console.log(`\nAPIレスポンス ${index + 1}:`);
    
    if (isApiSuccessResponse(response)) {
        console.log(`  ✅ 成功レスポンス: ${response.message}`);
        console.log(`     データ: ${JSON.stringify(response.data)}`);
        console.log(`     タイムスタンプ: ${response.timestamp}`);
    } else if (isApiErrorResponse(response)) {
        console.log(`  ❌ エラーレスポンス: ${response.error.message}`);
        console.log(`     エラーコード: ${response.error.code}`);
        console.log(`     タイムスタンプ: ${response.timestamp}`);
        if (response.error.details) {
            console.log(`     詳細: ${JSON.stringify(response.error.details)}`);
        }
    } else {
        console.log(`  ⚠️ 不正なレスポンス形式`);
    }
});

// フォームデータの検証
console.log("\n📝 フォームデータの検証:");
const formData: unknown[] = [
    {
        name: "山田太郎",
        email: "yamada@example.com",
        subject: "お問い合わせ",
        message: "サービスについて詳しく教えてください。",
        priority: "normal",
        newsletter: true
    },
    {
        name: "佐藤花子",
        email: "invalid-email", // 不正なメールアドレス
        subject: "サポート",
        message: "ログインできません。",
        priority: "high",
        newsletter: false
    },
    {
        name: "", // 空の名前
        email: "empty@example.com",
        subject: "テスト",
        message: "テストメッセージ",
        priority: "invalid", // 不正な優先度
        newsletter: true
    }
];

formData.forEach((data, index) => {
    console.log(`\nフォームデータ ${index + 1}:`);
    if (isContactForm(data)) {
        console.log(`  ✅ 有効なフォーム`);
        console.log(`     名前: ${data.name}`);
        console.log(`     メール: ${data.email}`);
        console.log(`     件名: ${data.subject}`);
        console.log(`     優先度: ${data.priority}`);
        console.log(`     ニュースレター: ${data.newsletter ? "希望" : "不要"}`);
    } else {
        console.log(`  ❌ 無効なフォームデータ`);
    }
});

// 設定オブジェクトの判定
console.log("\n⚙️ 設定オブジェクトの判定:");
const configs: unknown[] = [
    {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "myapp",
        username: "user",
        password: "password",
        ssl: false,
        poolSize: 10
    },
    {
        type: "redis",
        host: "cache.example.com",
        port: 6379,
        password: "redis-password",
        database: 0,
        keyPrefix: "myapp:"
    },
    {
        type: "file",
        path: "/var/log/myapp.log",
        maxSize: 1048576, // 1MB
        backup: true
    }
];

configs.forEach((config, index) => {
    console.log(`\n設定 ${index + 1}:`);
    if (isDatabaseConfig(config)) {
        console.log(`  🗄️ データベース設定: ${config.type}`);
        console.log(`     ホスト: ${config.host}:${config.port}`);
        console.log(`     データベース: ${config.database}`);
        console.log(`     SSL: ${config.ssl ? "有効" : "無効"}`);
    } else if (isRedisConfig(config)) {
        console.log(`  🔴 Redis設定`);
        console.log(`     ホスト: ${config.host}:${config.port}`);
        if (config.keyPrefix) {
            console.log(`     キープレフィックス: ${config.keyPrefix}`);
        }
    } else if (isFileConfig(config)) {
        console.log(`  📁 ファイル設定`);
        console.log(`     パス: ${config.path}`);
        console.log(`     最大サイズ: ${(config.maxSize / 1024).toFixed(0)}KB`);
        console.log(`     バックアップ: ${config.backup ? "有効" : "無効"}`);
    } else {
        console.log(`  ❓ 不明な設定タイプ`);
    }
});

// JSON パースと検証
console.log("\n📄 JSONパースと検証:");
const jsonStrings = [
    '{"id":"user-123","username":"test","email":"test@example.com","isActive":true}',
    '{"id":"prod-456","name":"Test Product","price":1000,"category":"test","inStock":true,"tags":["test"]}',
    '{"invalid":"json","structure":true}',
    'invalid json string'
];

jsonStrings.forEach((jsonString, index) => {
    console.log(`\nJSON文字列 ${index + 1}:`);
    
    const userResult = safeJsonParse(jsonString, isUser);
    const productResult = safeJsonParse(jsonString, isProduct);
    
    if (userResult) {
        console.log(`  👤 有効なユーザー: ${userResult.username}`);
    } else if (productResult) {
        console.log(`  📦 有効な商品: ${productResult.name}`);
    } else {
        console.log(`  ❌ 有効なオブジェクトではありません`);
    }
});

// 配列バリデーターの使用例
console.log("\n📋 配列バリデーション:");
const isUserArray = createArrayValidator(isUser);
const userArrays: unknown[] = [
    [
        { id: "1", username: "user1", email: "user1@example.com", isActive: true },
        { id: "2", username: "user2", email: "user2@example.com", isActive: false }
    ],
    [
        { id: "1", username: "user1", email: "user1@example.com", isActive: true },
        { id: "invalid", username: 123, email: "invalid" } // 不正なデータが混じっている
    ],
    "not an array"
];

userArrays.forEach((data, index) => {
    console.log(`\nユーザー配列 ${index + 1}:`);
    if (isUserArray(data)) {
        console.log(`  ✅ 有効なユーザー配列: ${data.length}件`);
        data.forEach(user => {
            console.log(`    - ${user.username} (${user.email})`);
        });
    } else {
        console.log(`  ❌ 無効なユーザー配列`);
    }
});

export {
    isString,
    isNumber,
    isBoolean,
    isArray,
    isObject,
    isFunction,
    isDate,
    isUser,
    isProduct,
    isApiSuccessResponse,
    isApiErrorResponse,
    isContactForm,
    isDatabaseConfig,
    isRedisConfig,
    isFileConfig,
    isApplicationError,
    isValidationError,
    isNetworkError,
    safeJsonParse,
    validateAndTransform,
    createArrayValidator
};