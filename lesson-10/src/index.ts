// 基本的な型ガード関数
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
}

export function isStringArray(value: unknown): value is string[] {
    return isArray(value) && value.every(isString);
}

export function isNumberArray(value: unknown): value is number[] {
    return isArray(value) && value.every(isNumber);
}

export function isArrayOf<T>(
    value: unknown,
    itemChecker: (item: unknown) => item is T
): value is T[] {
    return isArray(value) && value.every(itemChecker);
}

// プロパティの存在チェック
export function hasProperty<T extends object, K extends string>(
    obj: T,
    key: K
): obj is T & Record<K, unknown> {
    return key in obj;
}

// 基本的な値処理関数
export function processUnknownValue(value: unknown): string {
    if (typeof value === "string") {
        return value.toUpperCase();
    }
    
    if (typeof value === "number") {
        return value.toString();
    }
    
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    
    return "Unknown type";
}

export function processObjectValue(value: unknown): string {
    if (value instanceof Date) {
        return value.toISOString();
    }
    
    if (value instanceof Array) {
        return `Array with ${value.length} items`;
    }
    
    if (value instanceof Error) {
        return `Error: ${value.message}`;
    }
    
    return "Not a recognized object type";
}

// エラーハンドリング
export function handleError(error: unknown): string {
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    
    if (isString(error)) {
        return `String error: ${error}`;
    }
    
    if (isObject(error)) {
        if (hasProperty(error, "message") && isString(error.message)) {
            return `Object error: ${error.message}`;
        }
        return `Object error: ${JSON.stringify(error)}`;
    }
    
    return `Unknown error: ${String(error)}`;
}

// 安全なJSON解析
export function safeJsonParse(jsonString: string): { success: true; data: unknown } | { success: false; error: string } {
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

// フォームバリデーションの例
interface FormData {
    name: string;
    email: string;
    age: number;
    subscribe: boolean;
    interests?: string[];
}

export class FormValidator {
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

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
    
    static normalizeFormData(data: unknown): FormData | null {
        const validation = this.validateFormData(data);
        return validation.isValid ? validation.data! : null;
    }
}

// APIレスポンス処理の例
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

export class ApiClient {
    private baseUrl: string;
    
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    
    private async makeRequest(endpoint: string): Promise<unknown> {
        try {
            // モックレスポンス
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (endpoint.includes('error')) {
                throw new Error('Simulated API error');
            }
            
            // サンプルレスポンス
            const mockData = {
                success: true,
                data: {
                    id: 1,
                    username: "testuser",
                    email: "test@example.com",
                    profile: {
                        firstName: "Test",
                        lastName: "User"
                    },
                    roles: ["user"]
                }
            };
            
            return mockData as unknown;
        } catch (error) {
            throw new Error(`API request failed: ${handleError(error)}`);
        }
    }
    
    private isApiResponse<T>(
        data: unknown,
        dataValidator: (value: unknown) => value is T
    ): data is ApiResponse<T> {
        if (!isObject(data)) {
            return false;
        }
        
        if (!hasProperty(data, "success") || typeof data.success !== "boolean") {
            return false;
        }
        
        if (hasProperty(data, "data") && data.data !== undefined && data.data !== null) {
            if (!dataValidator(data.data)) {
                return false;
            }
        }
        
        if (hasProperty(data, "message") && data.message !== undefined) {
            if (!isString(data.message)) {
                return false;
            }
        }
        
        if (hasProperty(data, "errors") && data.errors !== undefined) {
            if (!isStringArray(data.errors)) {
                return false;
            }
        }
        
        return true;
    }
    
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

// 設定管理の例
interface AppConfig {
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        ssl?: boolean;
    };
    server: {
        port: number;
        host?: string;
    };
    logging: {
        level: "debug" | "info" | "warn" | "error";
        file?: string;
        console: boolean;
    };
}

export class ConfigLoader {
    private static isAppConfig(value: unknown): value is AppConfig {
        if (!isObject(value)) return false;
        
        // database の検証
        if (!hasProperty(value, "database") || !isObject(value.database)) return false;
        const db = value.database;
        if (!hasProperty(db, "host") || !isString(db.host)) return false;
        if (!hasProperty(db, "port") || !isNumber(db.port)) return false;
        if (!hasProperty(db, "username") || !isString(db.username)) return false;
        if (!hasProperty(db, "password") || !isString(db.password)) return false;
        if (!hasProperty(db, "database") || !isString(db.database)) return false;
        if (hasProperty(db, "ssl") && typeof db.ssl !== "boolean") return false;
        
        // server の検証
        if (!hasProperty(value, "server") || !isObject(value.server)) return false;
        const srv = value.server;
        if (!hasProperty(srv, "port") || !isNumber(srv.port)) return false;
        if (hasProperty(srv, "host") && srv.host !== undefined && !isString(srv.host)) return false;
        
        // logging の検証
        if (!hasProperty(value, "logging") || !isObject(value.logging)) return false;
        const log = value.logging;
        const validLevels = ["debug", "info", "warn", "error"];
        if (!hasProperty(log, "level") || !isString(log.level) || !validLevels.includes(log.level)) return false;
        if (!hasProperty(log, "console") || typeof log.console !== "boolean") return false;
        if (hasProperty(log, "file") && log.file !== undefined && !isString(log.file)) return false;
        
        return true;
    }
    
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
    
    static validateConfig(config: AppConfig): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (config.database.port < 1 || config.database.port > 65535) {
            errors.push("データベースポートは1-65535の範囲である必要があります");
        }
        
        if (config.server.port < 1 || config.server.port > 65535) {
            errors.push("サーバーポートは1-65535の範囲である必要があります");
        }
        
        if (config.server.host && config.server.host.trim().length === 0) {
            errors.push("サーバーホストは空文字列にできません");
        }
        
        if (config.logging.file && config.logging.file.trim().length === 0) {
            errors.push("ログファイルパスは空文字列にできません");
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

function main() {
    console.log("=== Lesson 10: any型とunknown型の例 ===\n");

    console.log("1. 基本的な型チェック");
    const values: unknown[] = ["hello", 42, true, [1, 2, 3], { name: "John" }, null];
    
    values.forEach((value, index) => {
        console.log(`値${index + 1}: ${JSON.stringify(value)}`);
        console.log(`  処理結果: ${processUnknownValue(value)}`);
        console.log(`  オブジェクト処理: ${processObjectValue(value)}`);
    });
    console.log();

    console.log("2. フォームバリデーションの例");
    const formInputs = [
        {
            name: "田中太郎",
            email: "tanaka@example.com",
            age: 30,
            subscribe: true,
            interests: ["TypeScript", "JavaScript"]
        },
        {
            name: "",
            email: "invalid-email",
            age: -5,
            subscribe: "yes", // 不正な型
            interests: ["TypeScript"]
        },
        "not an object"
    ];
    
    formInputs.forEach((input, index) => {
        console.log(`フォーム入力${index + 1}:`);
        const validation = FormValidator.validateFormData(input);
        console.log(`  有効: ${validation.isValid}`);
        if (!validation.isValid) {
            console.log(`  エラー: ${validation.errors.join(", ")}`);
        }
    });
    console.log();

    console.log("3. APIクライアントの例");
    const apiClient = new ApiClient("https://api.example.com");
    
    apiClient.getUser(1)
        .then(user => {
            console.log(`ユーザー取得成功: ${user.username} (${user.email})`);
        })
        .catch(error => {
            console.error(`ユーザー取得エラー: ${handleError(error)}`);
        });
    
    // データ変換の例
    const rawUserData = {
        id: "123", // 文字列（本来は数値であるべき）
        username: "testuser",
        email: "test@example.com",
        profile: {
            firstName: "Test",
            lastName: "User"
        },
        roles: ["user", "admin"]
    };
    
    const transformedData = apiClient.transformUserData(rawUserData);
    console.log("変換後のユーザーデータ:");
    console.log(`  ID: ${transformedData.id ?? "不正な値"}`);
    console.log(`  ユーザー名: ${transformedData.username ?? "未設定"}`);
    console.log(`  プロファイル: ${transformedData.profile ? "あり" : "なし"}`);
    console.log();

    console.log("4. 設定ファイルの例");
    const validConfigJson = `{
        "database": {
            "host": "localhost",
            "port": 5432,
            "username": "postgres",
            "password": "password",
            "database": "myapp",
            "ssl": true
        },
        "server": {
            "port": 3000,
            "host": "0.0.0.0"
        },
        "logging": {
            "level": "info",
            "console": true,
            "file": "/var/log/app.log"
        }
    }`;
    
    try {
        const config = ConfigLoader.loadConfig(validConfigJson);
        console.log("設定ファイル読み込み成功:");
        console.log(`  データベース: ${config.database.host}:${config.database.port}`);
        console.log(`  サーバー: ${config.server.host}:${config.server.port}`);
        console.log(`  ログレベル: ${config.logging.level}`);
        
        const validation = ConfigLoader.validateConfig(config);
        console.log(`  設定検証: ${validation.isValid ? "成功" : "失敗"}`);
        if (!validation.isValid) {
            console.log(`  エラー: ${validation.errors.join(", ")}`);
        }
    } catch (error) {
        console.error(`設定読み込みエラー: ${handleError(error)}`);
    }
    console.log();

    console.log("5. エラーハンドリングの例");
    const errors: unknown[] = [
        new Error("Standard error"),
        "String error message",
        { message: "Custom error object" },
        { code: 500, details: "Server error" },
        42,
        null
    ];
    
    errors.forEach((error, index) => {
        console.log(`エラー${index + 1}: ${handleError(error)}`);
    });
    console.log();

    console.log("6. JSON解析の例");
    const jsonStrings = [
        '{"name": "John", "age": 30}',
        '{"invalid": json}',
        '{"nested": {"data": [1, 2, 3]}}',
        'null',
        '"simple string"'
    ];
    
    jsonStrings.forEach((jsonStr, index) => {
        const result = safeJsonParse(jsonStr);
        console.log(`JSON${index + 1}: ${result.success ? "成功" : "失敗"}`);
        if (result.success) {
            console.log(`  データ: ${JSON.stringify(result.data)}`);
        } else {
            console.log(`  エラー: ${result.error}`);
        }
    });
}

if (require.main === module) {
    main();
}