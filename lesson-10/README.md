# Lesson 10: any型とunknown型

## 学習目標
- TypeScriptのany型とunknown型の違いを理解する
- 型安全性の観点からany型の問題点を学ぶ
- unknown型を使った安全な型処理の方法を身につける
- 実用的な型チェックと型ガードの実装方法を理解する

## 概要
`any`型と`unknown`型は、TypeScriptでどのような値でも受け入れることができる型です。しかし、型安全性の観点から大きな違いがあります。`any`型は型チェックを完全に無効化するのに対し、`unknown`型は型安全性を保ちながら柔軟性を提供します。

## 主な内容

### 1. any型の基本
```typescript
// any型の基本的な使用
let anyValue: any = 42;
anyValue = "hello";        // OK: どんな値でも代入可能
anyValue = true;           // OK
anyValue = { name: "John" }; // OK
anyValue = [1, 2, 3];      // OK

// any型の危険性
let userInput: any = "hello world";

// 以下はすべてコンパイルエラーにならないが、実行時エラーの可能性
console.log(userInput.toUpperCase()); // OK（実際は動作する）
console.log(userInput.length);        // OK（実際は動作する）
console.log(userInput.foo.bar);       // コンパイルOK、実行時エラー
console.log(userInput(42));           // コンパイルOK、実行時エラー

// 型チェックが完全に無効化される
function processData(data: any): any {
    return data.process().transform().validate(); // エラーチェックなし
}
```

### 2. unknown型の基本
```typescript
// unknown型の基本的な使用
let unknownValue: unknown = 42;
unknownValue = "hello";        // OK: どんな値でも代入可能
unknownValue = true;           // OK
unknownValue = { name: "John" }; // OK
unknownValue = [1, 2, 3];      // OK

// unknown型の安全性
let userInput: unknown = "hello world";

// 以下はすべてコンパイルエラーになる
// console.log(userInput.toUpperCase()); // エラー: 型チェックが必要
// console.log(userInput.length);        // エラー: 型チェックが必要
// console.log(userInput.foo.bar);       // エラー: 型チェックが必要

// 型チェック後は安全に使用可能
if (typeof userInput === "string") {
    console.log(userInput.toUpperCase()); // OK: string として確認済み
    console.log(userInput.length);        // OK: string として確認済み
}
```

### 3. 型チェックと型ガード
```typescript
// 基本的な型チェック
function processUnknownValue(value: unknown): string {
    // typeof による型チェック
    if (typeof value === "string") {
        return value.toUpperCase(); // string として扱える
    }
    
    if (typeof value === "number") {
        return value.toString(); // number として扱える
    }
    
    if (typeof value === "boolean") {
        return value ? "true" : "false"; // boolean として扱える
    }
    
    // その他の型の場合
    return "Unknown type";
}

// instanceof による型チェック
function processObjectValue(value: unknown): string {
    if (value instanceof Date) {
        return value.toISOString(); // Date として扱える
    }
    
    if (value instanceof Array) {
        return `Array with ${value.length} items`; // Array として扱える
    }
    
    if (value instanceof Error) {
        return `Error: ${value.message}`; // Error として扱える
    }
    
    return "Not a recognized object type";
}

// カスタム型ガード
function isString(value: unknown): value is string {
    return typeof value === "string";
}

function isNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
}

// 型ガードの使用
function safeProcess(value: unknown): string {
    if (isString(value)) {
        return `String: ${value}`;
    }
    
    if (isNumber(value)) {
        return `Number: ${value}`;
    }
    
    if (isArray(value)) {
        return `Array with ${value.length} items`;
    }
    
    if (isObject(value)) {
        return `Object with keys: ${Object.keys(value).join(", ")}`;
    }
    
    return "Unknown value";
}
```

### 4. オブジェクトプロパティの安全なアクセス
```typescript
// プロパティの存在チェック
function hasProperty<T extends object, K extends string>(
    obj: T, 
    key: K
): obj is T & Record<K, unknown> {
    return key in obj;
}

function getProperty<T extends object, K extends keyof T>(
    obj: T, 
    key: K
): T[K] | undefined {
    return obj[key];
}

// 安全なプロパティアクセス
function processUserData(data: unknown): {
    name?: string;
    age?: number;
    email?: string;
} {
    const result: {
        name?: string;
        age?: number;
        email?: string;
    } = {};
    
    // オブジェクトかどうかをチェック
    if (!isObject(data)) {
        return result;
    }
    
    // name プロパティのチェック
    if (hasProperty(data, "name") && isString(data.name)) {
        result.name = data.name;
    }
    
    // age プロパティのチェック
    if (hasProperty(data, "age") && isNumber(data.age)) {
        result.age = data.age;
    }
    
    // email プロパティのチェック
    if (hasProperty(data, "email") && isString(data.email)) {
        result.email = data.email;
    }
    
    return result;
}

// より複雑な型チェック
interface User {
    id: number;
    name: string;
    email: string;
    active?: boolean;
}

function isUser(value: unknown): value is User {
    if (!isObject(value)) {
        return false;
    }
    
    // 必須プロパティのチェック
    if (!hasProperty(value, "id") || !isNumber(value.id)) {
        return false;
    }
    
    if (!hasProperty(value, "name") || !isString(value.name)) {
        return false;
    }
    
    if (!hasProperty(value, "email") || !isString(value.email)) {
        return false;
    }
    
    // オプショナルプロパティのチェック
    if (hasProperty(value, "active") && typeof value.active !== "boolean") {
        return false;
    }
    
    return true;
}

function processUser(data: unknown): User | null {
    if (isUser(data)) {
        return data; // User として型安全に使用可能
    }
    return null;
}
```

### 5. 配列の型チェック
```typescript
// 配列要素の型チェック
function isStringArray(value: unknown): value is string[] {
    return isArray(value) && value.every(isString);
}

function isNumberArray(value: unknown): value is number[] {
    return isArray(value) && value.every(isNumber);
}

function isMixedArray(value: unknown): value is (string | number)[] {
    return isArray(value) && value.every(item => isString(item) || isNumber(item));
}

// より汎用的な配列型チェック
function isArrayOf<T>(
    value: unknown, 
    itemChecker: (item: unknown) => item is T
): value is T[] {
    return isArray(value) && value.every(itemChecker);
}

// 使用例
function processArrayData(data: unknown): {
    strings: string[];
    numbers: number[];
    mixed: (string | number)[];
} {
    const result = {
        strings: [] as string[],
        numbers: [] as number[],
        mixed: [] as (string | number)[]
    };
    
    if (isStringArray(data)) {
        result.strings = data;
    } else if (isNumberArray(data)) {
        result.numbers = data;
    } else if (isMixedArray(data)) {
        result.mixed = data;
    }
    
    return result;
}

// オブジェクト配列の型チェック
function isUserArray(value: unknown): value is User[] {
    return isArrayOf(value, isUser);
}
```

### 6. エラーハンドリングとunknown
```typescript
// エラーハンドリングでのunknown型の使用
function handleError(error: unknown): string {
    // Error オブジェクトの場合
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    
    // 文字列の場合
    if (isString(error)) {
        return `String error: ${error}`;
    }
    
    // オブジェクトの場合
    if (isObject(error)) {
        if (hasProperty(error, "message") && isString(error.message)) {
            return `Object error: ${error.message}`;
        }
        return `Object error: ${JSON.stringify(error)}`;
    }
    
    // その他の場合
    return `Unknown error: ${String(error)}`;
}

// 安全なJSON解析
function safeJsonParse(jsonString: string): { success: true; data: unknown } | { success: false; error: string } {
    try {
        const parsed = JSON.parse(jsonString) as unknown;
        return { success: true, data: parsed };
    } catch (error) {
        return { 
            success: false, 
            error: handleError(error)
        };
    }
}

// API レスポンスの処理
async function fetchData(url: string): Promise<{ success: true; data: unknown } | { success: false; error: string }> {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            return { 
                success: false, 
                error: `HTTP ${response.status}: ${response.statusText}` 
            };
        }
        
        const data = await response.json() as unknown;
        return { success: true, data };
        
    } catch (error) {
        return { 
            success: false, 
            error: handleError(error)
        };
    }
}
```

## 実践的な使用例

### 例1: フォームデータの検証
```typescript
interface FormData {
    name: string;
    email: string;
    age: number;
    subscribe: boolean;
    interests?: string[];
}

class FormValidator {
    // フォームデータの型チェック
    static isValidFormData(data: unknown): data is FormData {
        if (!isObject(data)) {
            return false;
        }
        
        // name の検証
        if (!hasProperty(data, "name") || !isString(data.name) || data.name.trim().length === 0) {
            return false;
        }
        
        // email の検証
        if (!hasProperty(data, "email") || !isString(data.email) || !this.isValidEmail(data.email)) {
            return false;
        }
        
        // age の検証
        if (!hasProperty(data, "age") || !isNumber(data.age) || data.age < 0 || data.age > 120) {
            return false;
        }
        
        // subscribe の検証
        if (!hasProperty(data, "subscribe") || typeof data.subscribe !== "boolean") {
            return false;
        }
        
        // interests の検証（オプション）
        if (hasProperty(data, "interests")) {
            if (!isStringArray(data.interests)) {
                return false;
            }
        }
        
        return true;
    }
    
    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // 詳細な検証結果を返す
    static validateFormData(data: unknown): {
        isValid: boolean;
        data?: FormData;
        errors: string[];
    } {
        const errors: string[] = [];
        
        if (!isObject(data)) {
            errors.push("データはオブジェクトである必要があります");
            return { isValid: false, errors };
        }
        
        // 各フィールドの個別検証
        if (!hasProperty(data, "name") || !isString(data.name)) {
            errors.push("名前は文字列である必要があります");
        } else if (data.name.trim().length === 0) {
            errors.push("名前は必須です");
        }
        
        if (!hasProperty(data, "email") || !isString(data.email)) {
            errors.push("メールアドレスは文字列である必要があります");
        } else if (!this.isValidEmail(data.email)) {
            errors.push("有効なメールアドレスを入力してください");
        }
        
        if (!hasProperty(data, "age") || !isNumber(data.age)) {
            errors.push("年齢は数値である必要があります");
        } else if (data.age < 0 || data.age > 120) {
            errors.push("年齢は0から120の範囲である必要があります");
        }
        
        if (!hasProperty(data, "subscribe") || typeof data.subscribe !== "boolean") {
            errors.push("購読設定はboolean値である必要があります");
        }
        
        if (hasProperty(data, "interests") && !isStringArray(data.interests)) {
            errors.push("興味リストは文字列配列である必要があります");
        }
        
        if (errors.length === 0 && this.isValidFormData(data)) {
            return { isValid: true, data, errors: [] };
        }
        
        return { isValid: false, errors };
    }
    
    // フォームデータの正規化
    static normalizeFormData(data: unknown): FormData | null {
        const validation = this.validateFormData(data);
        return validation.isValid ? validation.data! : null;
    }
}
```

### 例2: APIレスポンスの処理
```typescript
// API レスポンスの型定義
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}

interface User {
    id: number;
    username: string;
    email: string;
    profile: {
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    roles: string[];
}

interface Post {
    id: number;
    title: string;
    content: string;
    authorId: number;
    publishedAt: string;
    tags: string[];
}

class ApiClient {
    private baseUrl: string;
    
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    
    // 汎用的なAPIリクエスト処理
    private async makeRequest(endpoint: string): Promise<unknown> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json() as unknown;
        } catch (error) {
            throw new Error(`API request failed: ${handleError(error)}`);
        }
    }
    
    // APIレスポンスの型チェック
    private isApiResponse<T>(
        data: unknown, 
        dataValidator: (value: unknown) => value is T
    ): data is ApiResponse<T> {
        if (!isObject(data)) {
            return false;
        }
        
        // success プロパティのチェック
        if (!hasProperty(data, "success") || typeof data.success !== "boolean") {
            return false;
        }
        
        // data プロパティのチェック（オプション）
        if (hasProperty(data, "data") && data.data !== undefined && data.data !== null) {
            if (!dataValidator(data.data)) {
                return false;
            }
        }
        
        // message プロパティのチェック（オプション）
        if (hasProperty(data, "message") && data.message !== undefined) {
            if (!isString(data.message)) {
                return false;
            }
        }
        
        // errors プロパティのチェック（オプション）
        if (hasProperty(data, "errors") && data.errors !== undefined) {
            if (!isStringArray(data.errors)) {
                return false;
            }
        }
        
        return true;
    }
    
    // User型の型チェック
    private isUser(value: unknown): value is User {
        if (!isObject(value)) {
            return false;
        }
        
        // 基本プロパティのチェック
        if (!hasProperty(value, "id") || !isNumber(value.id)) return false;
        if (!hasProperty(value, "username") || !isString(value.username)) return false;
        if (!hasProperty(value, "email") || !isString(value.email)) return false;
        if (!hasProperty(value, "roles") || !isStringArray(value.roles)) return false;
        
        // profile プロパティのチェック
        if (!hasProperty(value, "profile") || !isObject(value.profile)) return false;
        
        const profile = value.profile;
        if (!hasProperty(profile, "firstName") || !isString(profile.firstName)) return false;
        if (!hasProperty(profile, "lastName") || !isString(profile.lastName)) return false;
        if (hasProperty(profile, "avatar") && profile.avatar !== undefined && !isString(profile.avatar)) return false;
        
        return true;
    }
    
    // Post型の型チェック
    private isPost(value: unknown): value is Post {
        if (!isObject(value)) {
            return false;
        }
        
        return hasProperty(value, "id") && isNumber(value.id) &&
               hasProperty(value, "title") && isString(value.title) &&
               hasProperty(value, "content") && isString(value.content) &&
               hasProperty(value, "authorId") && isNumber(value.authorId) &&
               hasProperty(value, "publishedAt") && isString(value.publishedAt) &&
               hasProperty(value, "tags") && isStringArray(value.tags);
    }
    
    // ユーザー取得API
    async getUser(id: number): Promise<User> {
        const rawResponse = await this.makeRequest(`/users/${id}`);
        
        if (this.isApiResponse(rawResponse, this.isUser)) {
            if (rawResponse.success && rawResponse.data) {
                return rawResponse.data;
            } else {
                throw new Error(rawResponse.message || "User not found");
            }
        }
        
        throw new Error("Invalid API response format");
    }
    
    // ユーザー一覧取得API
    async getUsers(): Promise<User[]> {
        const rawResponse = await this.makeRequest("/users");
        
        const isUserArray = (value: unknown): value is User[] => {
            return isArrayOf(value, this.isUser.bind(this));
        };
        
        if (this.isApiResponse(rawResponse, isUserArray)) {
            if (rawResponse.success && rawResponse.data) {
                return rawResponse.data;
            } else {
                throw new Error(rawResponse.message || "Failed to fetch users");
            }
        }
        
        throw new Error("Invalid API response format");
    }
    
    // 投稿取得API
    async getPosts(): Promise<Post[]> {
        const rawResponse = await this.makeRequest("/posts");
        
        const isPostArray = (value: unknown): value is Post[] => {
            return isArrayOf(value, this.isPost.bind(this));
        };
        
        if (this.isApiResponse(rawResponse, isPostArray)) {
            if (rawResponse.success && rawResponse.data) {
                return rawResponse.data;
            } else {
                throw new Error(rawResponse.message || "Failed to fetch posts");
            }
        }
        
        throw new Error("Invalid API response format");
    }
    
    // 型安全なデータ変換
    transformUserData(rawData: unknown): Partial<User> {
        const result: Partial<User> = {};
        
        if (!isObject(rawData)) {
            return result;
        }
        
        if (hasProperty(rawData, "id") && isNumber(rawData.id)) {
            result.id = rawData.id;
        }
        
        if (hasProperty(rawData, "username") && isString(rawData.username)) {
            result.username = rawData.username;
        }
        
        if (hasProperty(rawData, "email") && isString(rawData.email)) {
            result.email = rawData.email;
        }
        
        if (hasProperty(rawData, "roles") && isStringArray(rawData.roles)) {
            result.roles = rawData.roles;
        }
        
        if (hasProperty(rawData, "profile") && isObject(rawData.profile)) {
            const profile = rawData.profile;
            const transformedProfile: Partial<User['profile']> = {};
            
            if (hasProperty(profile, "firstName") && isString(profile.firstName)) {
                transformedProfile.firstName = profile.firstName;
            }
            
            if (hasProperty(profile, "lastName") && isString(profile.lastName)) {
                transformedProfile.lastName = profile.lastName;
            }
            
            if (hasProperty(profile, "avatar") && isString(profile.avatar)) {
                transformedProfile.avatar = profile.avatar;
            }
            
            if (transformedProfile.firstName && transformedProfile.lastName) {
                result.profile = transformedProfile as User['profile'];
            }
        }
        
        return result;
    }
}
```

### 例3: 設定ファイルの読み込み
```typescript
// 設定ファイルの型定義
interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl?: boolean;
}

interface ServerConfig {
    port: number;
    host?: string;
    cors?: {
        enabled: boolean;
        origins: string[];
    };
}

interface LoggingConfig {
    level: "debug" | "info" | "warn" | "error";
    file?: string;
    console: boolean;
}

interface AppConfig {
    database: DatabaseConfig;
    server: ServerConfig;
    logging: LoggingConfig;
    features?: {
        [key: string]: boolean;
    };
}

class ConfigLoader {
    // データベース設定の型チェック
    private static isDatabaseConfig(value: unknown): value is DatabaseConfig {
        if (!isObject(value)) return false;
        
        return hasProperty(value, "host") && isString(value.host) &&
               hasProperty(value, "port") && isNumber(value.port) &&
               hasProperty(value, "username") && isString(value.username) &&
               hasProperty(value, "password") && isString(value.password) &&
               hasProperty(value, "database") && isString(value.database) &&
               (!hasProperty(value, "ssl") || typeof value.ssl === "boolean");
    }
    
    // サーバー設定の型チェック
    private static isServerConfig(value: unknown): value is ServerConfig {
        if (!isObject(value)) return false;
        
        if (!hasProperty(value, "port") || !isNumber(value.port)) return false;
        
        if (hasProperty(value, "host") && value.host !== undefined && !isString(value.host)) return false;
        
        if (hasProperty(value, "cors") && value.cors !== undefined) {
            if (!isObject(value.cors)) return false;
            const cors = value.cors;
            
            if (!hasProperty(cors, "enabled") || typeof cors.enabled !== "boolean") return false;
            if (!hasProperty(cors, "origins") || !isStringArray(cors.origins)) return false;
        }
        
        return true;
    }
    
    // ログ設定の型チェック
    private static isLoggingConfig(value: unknown): value is LoggingConfig {
        if (!isObject(value)) return false;
        
        const validLevels = ["debug", "info", "warn", "error"];
        if (!hasProperty(value, "level") || !isString(value.level) || !validLevels.includes(value.level)) return false;
        if (!hasProperty(value, "console") || typeof value.console !== "boolean") return false;
        if (hasProperty(value, "file") && value.file !== undefined && !isString(value.file)) return false;
        
        return true;
    }
    
    // フィーチャー設定の型チェック
    private static isFeaturesConfig(value: unknown): value is Record<string, boolean> {
        if (!isObject(value)) return false;
        
        return Object.values(value).every(v => typeof v === "boolean");
    }
    
    // アプリ設定全体の型チェック
    static isAppConfig(value: unknown): value is AppConfig {
        if (!isObject(value)) return false;
        
        if (!hasProperty(value, "database") || !this.isDatabaseConfig(value.database)) return false;
        if (!hasProperty(value, "server") || !this.isServerConfig(value.server)) return false;
        if (!hasProperty(value, "logging") || !this.isLoggingConfig(value.logging)) return false;
        if (hasProperty(value, "features") && value.features !== undefined && !this.isFeaturesConfig(value.features)) return false;
        
        return true;
    }
    
    // 設定ファイルの読み込み
    static loadConfig(jsonString: string): AppConfig {
        const parseResult = safeJsonParse(jsonString);
        
        if (!parseResult.success) {
            throw new Error(`設定ファイルのパースに失敗: ${parseResult.error}`);
        }
        
        if (this.isAppConfig(parseResult.data)) {
            return parseResult.data;
        }
        
        throw new Error("無効な設定ファイル形式");
    }
    
    // 部分的な設定の読み込み（デフォルト値でマージ）
    static loadConfigWithDefaults(jsonString: string): AppConfig {
        const defaults: AppConfig = {
            database: {
                host: "localhost",
                port: 5432,
                username: "postgres",
                password: "",
                database: "myapp",
                ssl: false
            },
            server: {
                port: 3000,
                host: "0.0.0.0",
                cors: {
                    enabled: true,
                    origins: ["*"]
                }
            },
            logging: {
                level: "info",
                console: true
            },
            features: {}
        };
        
        const parseResult = safeJsonParse(jsonString);
        
        if (!parseResult.success) {
            console.warn(`設定ファイルのパースに失敗、デフォルト値を使用: ${parseResult.error}`);
            return defaults;
        }
        
        return this.mergeWithDefaults(parseResult.data, defaults);
    }
    
    // デフォルト設定との安全なマージ
    private static mergeWithDefaults(partial: unknown, defaults: AppConfig): AppConfig {
        if (!isObject(partial)) {
            return defaults;
        }
        
        const result: AppConfig = JSON.parse(JSON.stringify(defaults));
        
        // データベース設定のマージ
        if (hasProperty(partial, "database") && isObject(partial.database)) {
            const db = partial.database;
            if (hasProperty(db, "host") && isString(db.host)) result.database.host = db.host;
            if (hasProperty(db, "port") && isNumber(db.port)) result.database.port = db.port;
            if (hasProperty(db, "username") && isString(db.username)) result.database.username = db.username;
            if (hasProperty(db, "password") && isString(db.password)) result.database.password = db.password;
            if (hasProperty(db, "database") && isString(db.database)) result.database.database = db.database;
            if (hasProperty(db, "ssl") && typeof db.ssl === "boolean") result.database.ssl = db.ssl;
        }
        
        // サーバー設定のマージ
        if (hasProperty(partial, "server") && isObject(partial.server)) {
            const srv = partial.server;
            if (hasProperty(srv, "port") && isNumber(srv.port)) result.server.port = srv.port;
            if (hasProperty(srv, "host") && isString(srv.host)) result.server.host = srv.host;
            
            if (hasProperty(srv, "cors") && isObject(srv.cors)) {
                const cors = srv.cors;
                if (hasProperty(cors, "enabled") && typeof cors.enabled === "boolean") {
                    result.server.cors!.enabled = cors.enabled;
                }
                if (hasProperty(cors, "origins") && isStringArray(cors.origins)) {
                    result.server.cors!.origins = cors.origins;
                }
            }
        }
        
        // ログ設定のマージ
        if (hasProperty(partial, "logging") && isObject(partial.logging)) {
            const log = partial.logging;
            const validLevels = ["debug", "info", "warn", "error"] as const;
            if (hasProperty(log, "level") && isString(log.level) && validLevels.includes(log.level as any)) {
                result.logging.level = log.level as LoggingConfig['level'];
            }
            if (hasProperty(log, "console") && typeof log.console === "boolean") {
                result.logging.console = log.console;
            }
            if (hasProperty(log, "file") && isString(log.file)) {
                result.logging.file = log.file;
            }
        }
        
        // フィーチャー設定のマージ
        if (hasProperty(partial, "features") && isObject(partial.features)) {
            const features = partial.features;
            for (const [key, value] of Object.entries(features)) {
                if (typeof value === "boolean") {
                    result.features![key] = value;
                }
            }
        }
        
        return result;
    }
    
    // 設定値の検証
    static validateConfig(config: AppConfig): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // データベース設定の検証
        if (config.database.port < 1 || config.database.port > 65535) {
            errors.push("データベースポートは1-65535の範囲である必要があります");
        }
        
        // サーバー設定の検証
        if (config.server.port < 1 || config.server.port > 65535) {
            errors.push("サーバーポートは1-65535の範囲である必要があります");
        }
        
        if (config.server.host && config.server.host.trim().length === 0) {
            errors.push("サーバーホストは空文字列にできません");
        }
        
        // ログ設定の検証
        if (config.logging.file && config.logging.file.trim().length === 0) {
            errors.push("ログファイルパスは空文字列にできません");
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
```

## よくある落とし穴と対処法

### 1. any型の過度な使用
```typescript
// 危険: any型を多用
function badFunction(data: any): any {
    return data.someProperty.anotherProperty; // 型チェックなし
}

// 改善: unknown型と適切な型チェック
function goodFunction(data: unknown): unknown {
    if (isObject(data) && 
        hasProperty(data, "someProperty") && 
        isObject(data.someProperty) && 
        hasProperty(data.someProperty, "anotherProperty")) {
        return data.someProperty.anotherProperty;
    }
    return undefined;
}

// さらに良い: 具体的な型定義
interface ExpectedData {
    someProperty: {
        anotherProperty: string;
    };
}

function isExpectedData(data: unknown): data is ExpectedData {
    return isObject(data) &&
           hasProperty(data, "someProperty") &&
           isObject(data.someProperty) &&
           hasProperty(data.someProperty, "anotherProperty") &&
           isString(data.someProperty.anotherProperty);
}

function bestFunction(data: unknown): string | undefined {
    if (isExpectedData(data)) {
        return data.someProperty.anotherProperty; // 型安全
    }
    return undefined;
}
```

### 2. 型ガードの不完全な実装
```typescript
// 危険: 不完全な型ガード
function badIsString(value: unknown): value is string {
    return value !== null && value !== undefined; // 型チェックが不十分
}

// 安全: 完全な型ガード
function goodIsString(value: unknown): value is string {
    return typeof value === "string";
}

// より堅牢な型ガード
function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}
```

### 3. 型の絞り込み後の再代入
```typescript
// 危険: 型の絞り込み後の再代入
function problematicFunction(value: unknown): string {
    if (typeof value === "string") {
        value = value.toUpperCase(); // OK: string として処理
        value = 42; // 危険: 型が変わってしまう
        return value.toString(); // エラー: string メソッドが使えない
    }
    return "default";
}

// 安全: 新しい変数を使用
function safeFunction(value: unknown): string {
    if (typeof value === "string") {
        const processed = value.toUpperCase();
        // 必要に応じて別の処理
        return processed;
    }
    return "default";
}
```

## 演習問題
`src/exercise.ts`ファイルで以下の関数を実装してください：

1. `isValidUser(data: unknown): data is User` - User型の型ガードを実装
2. `safeGetArrayLength(value: unknown): number | null` - 安全に配列の長さを取得
3. `extractStringProperties(obj: unknown): string[]` - オブジェクトから文字列プロパティを抽出
4. `parseNumberSafely(value: unknown): number | null` - 安全に数値に変換
5. `mergeObjects(obj1: unknown, obj2: unknown): Record<string, unknown>` - 2つのオブジェクトを安全にマージ

## ビルドとテスト

```bash
# プロジェクトルートから実行
npm run build
npm test -- lesson-10
```

## まとめ
このレッスンでは、TypeScriptの型システムにおける`any`型と`unknown`型の違いと適切な使用方法について学びました。`unknown`型を使用することで、型安全性を保ちながら柔軟なコードを書くことができ、実行時エラーを防ぐことができます。