/**
 * Lesson 02: 高度なインターフェース設計の実践例
 * 
 * 実際のWebアプリケーション開発で使われる
 * 複雑なインターフェース設計パターンを学習します。
 */

// ===== 基本的なインターフェース継承 =====

interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    isActive: boolean;
}

interface Auditable {
    createdBy: string;
    updatedBy: string;
    deletedAt?: Date;
    deletedBy?: string;
}

// 複数のインターフェースを継承
interface User extends BaseEntity, Auditable {
    username: string;
    email: string;
    profile: {
        firstName: string;
        lastName: string;
        avatar?: string;
        bio?: string;
        dateOfBirth?: Date;
        location?: {
            country: string;
            city: string;
            timezone: string;
        };
    };
    security: {
        password: string; // 実際には暗号化済みのハッシュ
        twoFactorEnabled: boolean;
        lastLoginAt?: Date;
        lastLoginIP?: string;
        loginAttempts: number;
        lockedUntil?: Date;
    };
    preferences: {
        theme: "light" | "dark" | "system";
        language: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        privacy: {
            profileVisibility: "public" | "friends" | "private";
            showOnlineStatus: boolean;
            allowDirectMessages: boolean;
        };
    };
    roles: string[];
    permissions: string[];
    subscription?: {
        plan: "free" | "premium" | "enterprise";
        status: "active" | "cancelled" | "expired";
        renewsAt?: Date;
        features: string[];
    };
}

// ===== インターフェースでの関数型定義 =====

interface EventHandler<T = any> {
    (event: T): void | Promise<void>;
}

interface AsyncOperation<TInput, TOutput> {
    execute: (input: TInput) => Promise<TOutput>;
    cancel?: () => void;
    retry?: (maxAttempts: number) => Promise<TOutput>;
    timeout?: number;
}

interface CacheInterface<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V, ttl?: number): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size(): number;
    keys(): K[];
    values(): V[];
    entries(): [K, V][];
}

// ===== 条件付きプロパティを持つインターフェース =====

interface ApiConfig {
    baseURL: string;
    timeout: number;
    retries: number;
    
    // API キーまたはトークン認証のどちらかが必要
    authentication: {
        type: "apikey";
        apiKey: string;
        apiSecret?: string;
    } | {
        type: "bearer";
        token: string;
        refreshToken?: string;
    } | {
        type: "oauth";
        clientId: string;
        clientSecret: string;
        redirectUri: string;
    };
    
    headers?: Record<string, string>;
    interceptors?: {
        request?: (config: any) => any;
        response?: (response: any) => any;
        error?: (error: any) => any;
    };
}

// ===== 動的なプロパティを持つインターフェース =====

interface DynamicForm {
    formId: string;
    title: string;
    description?: string;
    
    // 動的なフィールド定義
    fields: {
        [fieldId: string]: {
            type: "text" | "number" | "email" | "password" | "select" | "checkbox" | "textarea" | "date" | "file";
            label: string;
            placeholder?: string;
            required: boolean;
            validation?: {
                minLength?: number;
                maxLength?: number;
                min?: number;
                max?: number;
                pattern?: string;
                custom?: (value: any) => boolean | string;
            };
            options?: Array<{
                value: string | number;
                label: string;
                disabled?: boolean;
            }>;
            dependencies?: {
                field: string;
                condition: "equals" | "not-equals" | "contains";
                value: any;
                action: "show" | "hide" | "enable" | "disable";
            }[];
        };
    };
    
    // 動的な値を格納
    values: Record<string, any>;
    errors: Record<string, string[]>;
    
    // フォームの設定
    settings: {
        submitUrl: string;
        method: "GET" | "POST" | "PUT" | "PATCH";
        enctype?: "application/json" | "multipart/form-data" | "application/x-www-form-urlencoded";
        redirectAfterSubmit?: string;
        showProgressBar: boolean;
        allowDraft: boolean;
        autoSave: boolean;
        maxFileSize?: number;
        allowedFileTypes?: string[];
    };
}

// ===== 関数のオーバーロードをインターフェースで定義 =====

interface DatabaseQuery {
    // 単一レコードの取得
    findOne<T>(table: string, id: string): Promise<T | null>;
    findOne<T>(table: string, conditions: Record<string, any>): Promise<T | null>;
    
    // 複数レコードの取得
    find<T>(table: string): Promise<T[]>;
    find<T>(table: string, conditions: Record<string, any>): Promise<T[]>;
    find<T>(table: string, conditions: Record<string, any>, options: {
        limit?: number;
        offset?: number;
        orderBy?: string | string[];
        orderDirection?: "ASC" | "DESC";
    }): Promise<T[]>;
    
    // データの作成・更新
    create<T>(table: string, data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
    update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
    upsert<T>(table: string, data: Partial<T> & { id?: string }): Promise<T>;
    
    // データの削除
    delete(table: string, id: string): Promise<boolean>;
    delete(table: string, conditions: Record<string, any>): Promise<number>;
    
    // トランザクション
    transaction<T>(callback: (trx: DatabaseQuery) => Promise<T>): Promise<T>;
    
    // 生のクエリ実行
    raw<T>(query: string, bindings?: any[]): Promise<T>;
}

// ===== インターフェースマージング（宣言の統合） =====

interface Window {
    customAnalytics: {
        track: (event: string, properties?: Record<string, any>) => void;
        identify: (userId: string, traits?: Record<string, any>) => void;
        page: (name?: string, properties?: Record<string, any>) => void;
    };
}

interface Console {
    // 開発環境でのみ利用可能なカスタムログ関数
    debug: (message: string, ...args: any[]) => void;
    trace: (message: string, ...args: any[]) => void;
}

// ===== 実際の使用例 =====

console.log("=== 高度なインターフェース設計の実践例 ===");

// ユーザーデータの作成例
const sampleUser: User = {
    id: "user-12345",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-20"),
    version: 1,
    isActive: true,
    createdBy: "system",
    updatedBy: "admin-001",
    
    username: "john_developer",
    email: "john@example.com",
    
    profile: {
        firstName: "John",
        lastName: "Smith",
        avatar: "https://example.com/avatars/john.jpg",
        bio: "Full-stack developer passionate about TypeScript",
        dateOfBirth: new Date("1990-05-15"),
        location: {
            country: "Japan",
            city: "Tokyo",
            timezone: "Asia/Tokyo"
        }
    },
    
    security: {
        password: "$2b$10$hashedpasswordhere",
        twoFactorEnabled: true,
        lastLoginAt: new Date("2024-01-20T09:30:00Z"),
        lastLoginIP: "192.168.1.100",
        loginAttempts: 0
    },
    
    preferences: {
        theme: "dark",
        language: "ja",
        notifications: {
            email: true,
            push: true,
            sms: false
        },
        privacy: {
            profileVisibility: "public",
            showOnlineStatus: true,
            allowDirectMessages: true
        }
    },
    
    roles: ["developer", "user"],
    permissions: ["read:profile", "write:profile", "read:projects"],
    
    subscription: {
        plan: "premium",
        status: "active",
        renewsAt: new Date("2024-12-01"),
        features: ["unlimited_projects", "priority_support", "advanced_analytics"]
    }
};

// インターフェース情報の表示
function displayUserInfo(user: User): void {
    console.log("\n👤 ユーザー情報:");
    console.log(`ID: ${user.id}`);
    console.log(`名前: ${user.profile.firstName} ${user.profile.lastName} (@${user.username})`);
    console.log(`メール: ${user.email}`);
    console.log(`作成日: ${user.createdAt.toLocaleDateString("ja-JP")}`);
    console.log(`テーマ: ${user.preferences.theme}`);
    console.log(`言語: ${user.preferences.language}`);
    console.log(`ロール: ${user.roles.join(", ")}`);
    
    if (user.subscription) {
        console.log(`サブスクリプション: ${user.subscription.plan} (${user.subscription.status})`);
    }
    
    if (user.profile.location) {
        console.log(`場所: ${user.profile.location.city}, ${user.profile.location.country}`);
    }
}

displayUserInfo(sampleUser);

// API設定の例
const apiConfig: ApiConfig = {
    baseURL: "https://api.example.com/v1",
    timeout: 10000,
    retries: 3,
    
    authentication: {
        type: "bearer",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refreshToken: "refresh_token_here"
    },
    
    headers: {
        "Content-Type": "application/json",
        "User-Agent": "MyApp/1.0.0"
    },
    
    interceptors: {
        request: (config) => {
            console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        },
        response: (response) => {
            console.log(`API Response: ${response.status} ${response.statusText}`);
            return response;
        },
        error: (error) => {
            console.error("API Error:", error.message);
            throw error;
        }
    }
};

console.log("\n⚙️ API設定:");
console.log(`Base URL: ${apiConfig.baseURL}`);
console.log(`認証方式: ${apiConfig.authentication.type}`);
console.log(`タイムアウト: ${apiConfig.timeout}ms`);
console.log(`リトライ回数: ${apiConfig.retries}`);

// 動的フォームの例
const contactForm: DynamicForm = {
    formId: "contact-form-001",
    title: "お問い合わせフォーム",
    description: "ご質問やご要望をお気軽にお送りください",
    
    fields: {
        name: {
            type: "text",
            label: "お名前",
            placeholder: "山田太郎",
            required: true,
            validation: {
                minLength: 2,
                maxLength: 50
            }
        },
        email: {
            type: "email",
            label: "メールアドレス",
            placeholder: "example@example.com",
            required: true,
            validation: {
                pattern: "^[^@]+@[^@]+\\.[^@]+$"
            }
        },
        category: {
            type: "select",
            label: "お問い合わせ種別",
            required: true,
            options: [
                { value: "general", label: "一般的なお問い合わせ" },
                { value: "support", label: "サポート" },
                { value: "sales", label: "営業・販売" },
                { value: "feedback", label: "フィードバック" }
            ]
        },
        urgent: {
            type: "checkbox",
            label: "緊急度が高い",
            required: false,
            dependencies: [{
                field: "category",
                condition: "equals",
                value: "support",
                action: "show"
            }]
        },
        message: {
            type: "textarea",
            label: "メッセージ",
            placeholder: "詳細な内容をお書きください",
            required: true,
            validation: {
                minLength: 10,
                maxLength: 1000
            }
        }
    },
    
    values: {},
    errors: {},
    
    settings: {
        submitUrl: "/api/contact",
        method: "POST",
        enctype: "application/json",
        redirectAfterSubmit: "/thank-you",
        showProgressBar: true,
        allowDraft: true,
        autoSave: false
    }
};

console.log("\n📝 動的フォーム設定:");
console.log(`フォームID: ${contactForm.formId}`);
console.log(`タイトル: ${contactForm.title}`);
console.log(`フィールド数: ${Object.keys(contactForm.fields).length}`);
console.log(`送信先: ${contactForm.settings.submitUrl}`);

// フィールド詳細の表示
Object.entries(contactForm.fields).forEach(([fieldId, field]) => {
    console.log(`  ${fieldId}: ${field.type} - ${field.label}${field.required ? " (必須)" : ""}`);
});

// ===== 複雑な型組み合わせの例 =====

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    metadata: {
        timestamp: string;
        requestId: string;
        version: string;
        processingTime: number;
    };
    errors?: Array<{
        code: string;
        message: string;
        field?: string;
    }>;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// レスポンス例の作成
const userListResponse: ApiResponse<User[]> = {
    success: true,
    data: [sampleUser],
    message: "ユーザーリストを正常に取得しました",
    metadata: {
        timestamp: new Date().toISOString(),
        requestId: "req-12345-abcde",
        version: "v1.2.0",
        processingTime: 45.2
    },
    pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
    }
};

console.log("\n📊 API レスポンス例:");
console.log(`成功: ${userListResponse.success}`);
console.log(`メッセージ: ${userListResponse.message}`);
console.log(`データ件数: ${userListResponse.data.length}`);
console.log(`処理時間: ${userListResponse.metadata.processingTime}ms`);

export {
    BaseEntity,
    Auditable,
    User,
    EventHandler,
    AsyncOperation,
    CacheInterface,
    ApiConfig,
    DynamicForm,
    DatabaseQuery,
    ApiResponse
};