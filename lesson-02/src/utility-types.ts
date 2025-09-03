/**
 * Lesson 02: TypeScriptユーティリティ型の実践的活用
 * 
 * TypeScriptが提供する組み込みユーティリティ型を実際のプロジェクトで
 * どのように活用するかを具体的な例とともに学習します。
 */

// ===== 基本的なユーティリティ型の定義 =====

interface BaseUser {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phoneNumber: string;
    address: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    preferences: {
        theme: "light" | "dark";
        language: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
    };
    roles: string[];
    isActive: boolean;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface BaseProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    sku: string;
    weight: number;
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
    images: string[];
    tags: string[];
    inventory: {
        quantity: number;
        reserved: number;
        available: number;
    };
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ===== Partial<T> - 部分的な更新に使用 =====

type UserUpdateData = Partial<BaseUser>;
type ProductUpdateData = Partial<BaseProduct>;

// より具体的な部分更新用の型
type UserProfileUpdate = Partial<Pick<BaseUser, "firstName" | "lastName" | "phoneNumber" | "address">>;
type UserPreferencesUpdate = Partial<BaseUser["preferences"]>;
type ProductInventoryUpdate = Partial<BaseProduct["inventory"]>;

function updateUser(userId: string, updates: UserUpdateData): void {
    console.log(`ユーザー ${userId} を更新中...`);
    
    if (updates.firstName) {
        console.log(`  名前を "${updates.firstName}" に更新`);
    }
    if (updates.email) {
        console.log(`  メールを "${updates.email}" に更新`);
    }
    if (updates.preferences) {
        console.log(`  設定を更新:`, updates.preferences);
    }
    if (updates.address) {
        console.log(`  住所を更新:`, updates.address);
    }
    
    console.log(`  更新日時: ${new Date().toISOString()}`);
}

// ===== Required<T> - 必須フィールドの強制 =====

type RequiredUser = Required<BaseUser>;
type RequiredProductInventory = Required<BaseProduct["inventory"]>;

// APIレスポンス用の完全なデータ型
type CompleteUserResponse = Required<Omit<BaseUser, "dateOfBirth" | "phoneNumber">> & {
    dateOfBirth?: Date;
    phoneNumber?: string;
    profileCompleteness: number; // 0-100の完了率
};

function validateCompleteUser(user: unknown): user is RequiredUser {
    // 実際の実装では詳細なバリデーションが必要
    return typeof user === "object" && user !== null;
}

// ===== Readonly<T> - 不変データの作成 =====

type ReadonlyUser = Readonly<BaseUser>;
type ReadonlyProduct = Readonly<BaseProduct>;

// 深い読み取り専用型
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type ImmutableUser = DeepReadonly<BaseUser>;
type ImmutableProduct = DeepReadonly<BaseProduct>;

function createReadonlyUser(userData: BaseUser): ReadonlyUser {
    return Object.freeze({ ...userData });
}

// ===== Pick<T, K> - 特定のプロパティのみ抽出 =====

type UserSummary = Pick<BaseUser, "id" | "username" | "email" | "isActive">;
type ProductSummary = Pick<BaseProduct, "id" | "name" | "price" | "category" | "isActive">;
type UserContactInfo = Pick<BaseUser, "email" | "phoneNumber" | "address">;

// API用の軽量データ型
type UserListItem = Pick<BaseUser, "id" | "username" | "firstName" | "lastName" | "lastLogin" | "isActive">;
type ProductListItem = Pick<BaseProduct, "id" | "name" | "price" | "category" | "brand" | "isActive"> & {
    thumbnail: string; // 追加のプロパティ
};

function getUserSummary(user: BaseUser): UserSummary {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
    };
}

// ===== Omit<T, K> - 特定のプロパティを除外 =====

type PublicUser = Omit<BaseUser, "phoneNumber" | "address" | "lastLogin">;
type ProductWithoutInventory = Omit<BaseProduct, "inventory">;
type UserCreationData = Omit<BaseUser, "id" | "createdAt" | "updatedAt" | "lastLogin">;

// セキュリティを考慮した公開用データ型
type SafeUserProfile = Omit<BaseUser, "phoneNumber" | "address" | "roles" | "lastLogin" | "createdAt" | "updatedAt">;

function createPublicUserProfile(user: BaseUser): PublicUser {
    const { phoneNumber, address, lastLogin, ...publicData } = user;
    return publicData;
}

// ===== Record<K, T> - キーと値の型を指定したオブジェクト =====

type UserRoles = Record<string, { 
    name: string; 
    permissions: string[]; 
    level: number;
}>;

type CategoryProductCount = Record<string, number>;
type LanguageTranslations = Record<string, Record<string, string>>;
type CacheStore<T> = Record<string, { data: T; expiresAt: number }>;

const roleDefinitions: UserRoles = {
    admin: {
        name: "Administrator",
        permissions: ["read", "write", "delete", "manage_users"],
        level: 100
    },
    editor: {
        name: "Editor",
        permissions: ["read", "write"],
        level: 50
    },
    viewer: {
        name: "Viewer",
        permissions: ["read"],
        level: 10
    }
};

const translations: LanguageTranslations = {
    ja: {
        "welcome": "ようこそ",
        "goodbye": "さようなら",
        "hello": "こんにちは"
    },
    en: {
        "welcome": "Welcome",
        "goodbye": "Goodbye", 
        "hello": "Hello"
    },
    fr: {
        "welcome": "Bienvenue",
        "goodbye": "Au revoir",
        "hello": "Bonjour"
    }
};

// ===== Extract<T, U> と Exclude<T, U> =====

type Theme = "light" | "dark" | "auto" | "high-contrast";
type BasicTheme = Extract<Theme, "light" | "dark">; // "light" | "dark"
type AdvancedTheme = Exclude<Theme, "light" | "dark">; // "auto" | "high-contrast"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
type SafeMethods = Extract<HttpMethod, "GET" | "HEAD" | "OPTIONS">;
type UnsafeMethods = Exclude<HttpMethod, "GET" | "HEAD" | "OPTIONS">;

// ===== NonNullable<T> - null と undefined を除外 =====

type UserEmail = NonNullable<BaseUser["email"]>; // string（null/undefinedを除外）
type ProductPrice = NonNullable<BaseProduct["price"]>; // number（null/undefinedを除外）

function processNonNullValue<T>(value: T): NonNullable<T> | null {
    return value != null ? value as NonNullable<T> : null;
}

// ===== ReturnType<T> と Parameters<T> =====

function createUser(data: UserCreationData): Promise<BaseUser> {
    return Promise.resolve({
        ...data,
        id: `user-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
    });
}

function updateProduct(id: string, updates: ProductUpdateData): { success: boolean; product?: BaseProduct } {
    return {
        success: true,
        product: undefined // 実際の実装では更新されたproductを返す
    };
}

type CreateUserResult = ReturnType<typeof createUser>; // Promise<BaseUser>
type CreateUserParams = Parameters<typeof createUser>; // [UserCreationData]
type UpdateProductResult = ReturnType<typeof updateProduct>; // { success: boolean; product?: BaseProduct }

// ===== InstanceType<T> - クラスのインスタンス型 =====

class UserService {
    constructor(private apiUrl: string) {}
    
    async getUser(id: string): Promise<BaseUser | null> {
        console.log(`Fetching user ${id} from ${this.apiUrl}`);
        // 実際のAPI呼び出しをシミュレート
        return null;
    }
    
    async createUser(data: UserCreationData): Promise<BaseUser> {
        console.log(`Creating user via ${this.apiUrl}`);
        return createUser(data);
    }
}

class ProductService {
    constructor(private apiUrl: string, private cacheTimeout: number = 300000) {}
    
    async getProduct(id: string): Promise<BaseProduct | null> {
        console.log(`Fetching product ${id} from ${this.apiUrl}`);
        return null;
    }
}

type UserServiceInstance = InstanceType<typeof UserService>; // UserService
type ProductServiceInstance = InstanceType<typeof ProductService>; // ProductService

// ===== 高度なユーティリティ型の組み合わせ =====

// APIエンドポイント用の型定義
type ApiEndpoints = {
    users: {
        list: { method: "GET"; params: { page?: number; limit?: number }; response: UserListItem[] };
        create: { method: "POST"; body: UserCreationData; response: BaseUser };
        update: { method: "PUT"; params: { id: string }; body: UserUpdateData; response: BaseUser };
        delete: { method: "DELETE"; params: { id: string }; response: { success: boolean } };
    };
    products: {
        list: { method: "GET"; params: { category?: string; search?: string }; response: ProductListItem[] };
        create: { method: "POST"; body: Omit<BaseProduct, "id" | "createdAt" | "updatedAt">; response: BaseProduct };
        update: { method: "PUT"; params: { id: string }; body: ProductUpdateData; response: BaseProduct };
    };
};

// API クライアント用の型
type ApiClient = {
    [K in keyof ApiEndpoints]: {
        [M in keyof ApiEndpoints[K]]: (
            ...[ApiEndpoints[K][M]] extends [{ params: infer P; body: infer B }] 
                ? [params: P, body: B]
                : [ApiEndpoints[K][M]] extends [{ params: infer P }]
                    ? [params: P]
                    : [ApiEndpoints[K][M]] extends [{ body: infer B }]
                        ? [body: B]
                        : []
        ) => Promise<ApiEndpoints[K][M] extends { response: infer R } ? R : unknown>
    }
};

// フォームバリデーション用の型
type ValidationRules<T> = {
    [K in keyof T]?: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
        custom?: (value: T[K]) => boolean | string;
    }
};

type FormErrors<T> = Partial<Record<keyof T, string[]>>;

// ===== 実際の使用例とデモ =====

console.log("=== TypeScriptユーティリティ型の実践的活用例 ===");

// Partialを使った更新処理
console.log("\n📝 Partialを使った更新処理:");
const userUpdates: UserUpdateData = {
    firstName: "新しい名前",
    preferences: {
        theme: "dark",
        language: "ja",
        notifications: {
            email: true,
            push: false,
            sms: true
        }
    }
};
updateUser("user-123", userUpdates);

// Pickを使ったデータの抽出
console.log("\n🎯 Pickを使ったデータ抽出:");
const fullUser: BaseUser = {
    id: "user-456",
    username: "john_doe",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: new Date("1990-01-01"),
    phoneNumber: "+1-555-0123",
    address: {
        street: "123 Main St",
        city: "Tokyo",
        postalCode: "100-0001",
        country: "Japan"
    },
    preferences: {
        theme: "light",
        language: "ja",
        notifications: {
            email: true,
            push: true,
            sms: false
        }
    },
    roles: ["user"],
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date()
};

const userSummary = getUserSummary(fullUser);
console.log("ユーザーサマリー:", userSummary);

const publicProfile = createPublicUserProfile(fullUser);
console.log("公開プロフィール作成完了（機密情報除外済み）");

// Recordを使った設定管理
console.log("\n⚙️ Recordを使った設定管理:");
console.log("利用可能な役割:");
Object.entries(roleDefinitions).forEach(([roleKey, role]) => {
    console.log(`  ${roleKey}: ${role.name} (レベル: ${role.level})`);
    console.log(`    権限: ${role.permissions.join(", ")}`);
});

// 翻訳システムの例
console.log("\n🌐 多言語翻訳システム:");
function getTranslation(key: string, language: string): string {
    return translations[language]?.[key] || key;
}

const languages = Object.keys(translations);
const keys = ["welcome", "hello", "goodbye"];

languages.forEach(lang => {
    console.log(`${lang}:`);
    keys.forEach(key => {
        console.log(`  ${key}: ${getTranslation(key, lang)}`);
    });
});

// Extract/Excludeを使った型の分類
console.log("\n🎨 テーマとHTTPメソッドの分類:");
console.log("基本テーマ: light, dark");
console.log("高度なテーマ: auto, high-contrast");
console.log("安全なHTTPメソッド: GET, HEAD, OPTIONS");
console.log("危険なHTTPメソッド: POST, PUT, DELETE, PATCH");

// キャッシュシステムの実装例
console.log("\n⚡ キャッシュシステム:");
class CacheManager<T> {
    private cache: CacheStore<T> = {};
    
    set(key: string, data: T, ttl: number = 300000): void {
        this.cache[key] = {
            data,
            expiresAt: Date.now() + ttl
        };
        console.log(`Cache SET: "${key}" (TTL: ${ttl}ms)`);
    }
    
    get(key: string): T | null {
        const cached = this.cache[key];
        if (!cached) {
            console.log(`Cache MISS: "${key}"`);
            return null;
        }
        
        if (cached.expiresAt < Date.now()) {
            delete this.cache[key];
            console.log(`Cache EXPIRED: "${key}"`);
            return null;
        }
        
        console.log(`Cache HIT: "${key}"`);
        return cached.data;
    }
    
    clear(): void {
        this.cache = {};
        console.log("Cache cleared");
    }
}

const userCache = new CacheManager<UserSummary>();
userCache.set("user-123", userSummary, 10000); // 10秒TTL
const cachedUser = userCache.get("user-123");
console.log("キャッシュされたユーザー:", cachedUser?.username);

// バリデーションシステムの実装例
console.log("\n✅ バリデーションシステム:");
const userValidationRules: ValidationRules<UserCreationData> = {
    username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/
    },
    email: {
        required: true,
        pattern: /^[^@]+@[^@]+\.[^@]+$/
    },
    firstName: {
        required: true,
        minLength: 1,
        maxLength: 50
    },
    lastName: {
        required: true,
        minLength: 1,
        maxLength: 50
    }
};

function validateField<T>(
    value: any,
    rules: NonNullable<ValidationRules<T>[keyof T]>,
    fieldName: string
): string[] {
    const errors: string[] = [];
    
    if (rules.required && (value == null || value === "")) {
        errors.push(`${fieldName}は必須です`);
        return errors;
    }
    
    if (typeof value === "string") {
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${fieldName}は${rules.minLength}文字以上で入力してください`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${fieldName}は${rules.maxLength}文字以下で入力してください`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${fieldName}の形式が正しくありません`);
        }
    }
    
    if (rules.custom && !rules.custom(value)) {
        errors.push(`${fieldName}の値が無効です`);
    }
    
    return errors;
}

function validateUser(userData: Partial<UserCreationData>): FormErrors<UserCreationData> {
    const errors: FormErrors<UserCreationData> = {};
    
    Object.entries(userValidationRules).forEach(([fieldName, rules]) => {
        if (rules) {
            const fieldErrors = validateField(
                userData[fieldName as keyof UserCreationData], 
                rules, 
                fieldName
            );
            if (fieldErrors.length > 0) {
                errors[fieldName as keyof UserCreationData] = fieldErrors;
            }
        }
    });
    
    return errors;
}

// バリデーションテスト
const testUserData: Partial<UserCreationData> = {
    username: "ab", // 短すぎる
    email: "invalid-email", // 不正な形式
    firstName: "", // 空
    lastName: "Doe"
};

const validationErrors = validateUser(testUserData);
console.log("バリデーション結果:");
if (Object.keys(validationErrors).length === 0) {
    console.log("✅ バリデーション成功");
} else {
    console.log("❌ バリデーションエラー:");
    Object.entries(validationErrors).forEach(([field, fieldErrors]) => {
        console.log(`  ${field}:`);
        fieldErrors?.forEach(error => console.log(`    - ${error}`));
    });
}

// サービスクラスの使用例
console.log("\n🔧 サービスクラスの使用:");
const userService = new UserService("https://api.example.com/users");
const productService = new ProductService("https://api.example.com/products", 600000);

console.log("UserService インスタンス作成完了");
console.log("ProductService インスタンス作成完了（キャッシュタイムアウト: 10分）");

// 型安全性のデモ
console.log("\n🛡️ 型安全性のデモ:");
console.log("TypeScriptのユーティリティ型により以下が保証されます:");
console.log("- Partialによる安全な部分更新");
console.log("- Pickによる必要なデータのみの抽出");
console.log("- Omitによる機密情報の除外");
console.log("- Recordによる構造化されたキー・値のペア");
console.log("- ReturnType/Parametersによる関数の型推論");
console.log("- 型レベルでのバリデーションとエラー防止");

export {
    BaseUser,
    BaseProduct,
    UserUpdateData,
    ProductUpdateData,
    UserSummary,
    ProductSummary,
    PublicUser,
    UserCreationData,
    UserRoles,
    ValidationRules,
    FormErrors,
    CacheManager,
    updateUser,
    getUserSummary,
    createPublicUserProfile,
    validateUser
};