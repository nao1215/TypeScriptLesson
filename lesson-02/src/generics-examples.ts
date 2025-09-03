/**
 * Lesson 02: ジェネリクス（総称型）の実践的活用例
 * 
 * 実際の開発現場で使われるジェネリクスの様々なパターンと
 * 型安全性を保ちながら再利用可能なコードの作成方法を学習します。
 */

// ===== 基本的なジェネリック関数 =====

function identity<T>(arg: T): T {
    return arg;
}

function createArray<T>(length: number, value: T): T[] {
    return Array(length).fill(value);
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

// ===== 制約付きジェネリクス =====

interface HasLength {
    length: number;
}

function logLength<T extends HasLength>(arg: T): T {
    console.log(`引数の長さ: ${arg.length}`);
    return arg;
}

interface Comparable<T> {
    compareTo(other: T): number;
}

function sort<T extends Comparable<T>>(items: T[]): T[] {
    return items.sort((a, b) => a.compareTo(b));
}

// ===== 実用的なジェネリッククラス：データストア =====

class DataStore<T> {
    private items: Map<string, T> = new Map();
    private listeners: Array<(key: string, value: T | undefined) => void> = [];

    set(key: string, value: T): void {
        const oldValue = this.items.get(key);
        this.items.set(key, value);
        this.notifyListeners(key, value);
        
        console.log(`DataStore: "${key}" に値を設定しました`);
        if (oldValue !== undefined) {
            console.log("  前の値を上書きしました");
        }
    }

    get(key: string): T | undefined {
        return this.items.get(key);
    }

    has(key: string): boolean {
        return this.items.has(key);
    }

    delete(key: string): boolean {
        const existed = this.items.has(key);
        this.items.delete(key);
        if (existed) {
            this.notifyListeners(key, undefined);
            console.log(`DataStore: "${key}" を削除しました`);
        }
        return existed;
    }

    clear(): void {
        const keys = Array.from(this.items.keys());
        this.items.clear();
        keys.forEach(key => this.notifyListeners(key, undefined));
        console.log("DataStore: すべてのアイテムを削除しました");
    }

    keys(): string[] {
        return Array.from(this.items.keys());
    }

    values(): T[] {
        return Array.from(this.items.values());
    }

    size(): number {
        return this.items.size;
    }

    forEach(callback: (value: T, key: string) => void): void {
        this.items.forEach(callback);
    }

    // 値の変更を監視
    subscribe(listener: (key: string, value: T | undefined) => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    private notifyListeners(key: string, value: T | undefined): void {
        this.listeners.forEach(listener => listener(key, value));
    }
}

// ===== 非同期処理のジェネリッククラス =====

class AsyncCache<T> {
    private cache: Map<string, { data: T; expiresAt: number }> = new Map();
    private pending: Map<string, Promise<T>> = new Map();

    constructor(private defaultTTL: number = 300000) {} // 5分のデフォルトTTL

    async get(
        key: string,
        fetcher: () => Promise<T>,
        ttl: number = this.defaultTTL
    ): Promise<T> {
        // キャッシュから取得を試行
        const cached = this.cache.get(key);
        if (cached && cached.expiresAt > Date.now()) {
            console.log(`Cache HIT: "${key}"`);
            return cached.data;
        }

        // 既に同じキーで取得処理が進行中か確認
        if (this.pending.has(key)) {
            console.log(`Cache PENDING: "${key}" - 既存の処理を待機`);
            return this.pending.get(key)!;
        }

        // 新しくデータを取得
        console.log(`Cache MISS: "${key}" - データを取得中...`);
        const promise = fetcher().then(data => {
            this.cache.set(key, {
                data,
                expiresAt: Date.now() + ttl
            });
            this.pending.delete(key);
            console.log(`Cache SET: "${key}" - データをキャッシュしました (TTL: ${ttl}ms)`);
            return data;
        }).catch(error => {
            this.pending.delete(key);
            throw error;
        });

        this.pending.set(key, promise);
        return promise;
    }

    invalidate(key: string): boolean {
        const existed = this.cache.has(key);
        this.cache.delete(key);
        if (existed) {
            console.log(`Cache INVALIDATE: "${key}"`);
        }
        return existed;
    }

    clear(): void {
        this.cache.clear();
        console.log("Cache: すべてのキャッシュをクリアしました");
    }
}

// ===== API クライアントのジェネリック実装 =====

interface ApiError {
    status: number;
    message: string;
    code: string;
    details?: any;
}

interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
    metadata: {
        requestId: string;
        timestamp: string;
        processingTime: number;
    };
}

class ApiClient {
    constructor(private baseURL: string, private defaultHeaders: Record<string, string> = {}) {}

    async get<T>(endpoint: string, options?: {
        headers?: Record<string, string>;
        timeout?: number;
    }): Promise<ApiResponse<T>> {
        return this.request<T>("GET", endpoint, undefined, options);
    }

    async post<TRequest, TResponse>(
        endpoint: string, 
        data: TRequest, 
        options?: {
            headers?: Record<string, string>;
            timeout?: number;
        }
    ): Promise<ApiResponse<TResponse>> {
        return this.request<TResponse>("POST", endpoint, data, options);
    }

    async put<TRequest, TResponse>(
        endpoint: string, 
        data: TRequest, 
        options?: {
            headers?: Record<string, string>;
            timeout?: number;
        }
    ): Promise<ApiResponse<TResponse>> {
        return this.request<TResponse>("PUT", endpoint, data, options);
    }

    async delete<T>(endpoint: string, options?: {
        headers?: Record<string, string>;
        timeout?: number;
    }): Promise<ApiResponse<T>> {
        return this.request<T>("DELETE", endpoint, undefined, options);
    }

    private async request<T>(
        method: string,
        endpoint: string,
        data?: any,
        options?: {
            headers?: Record<string, string>;
            timeout?: number;
        }
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        const headers = { ...this.defaultHeaders, ...options?.headers };

        console.log(`API ${method}: ${url}`);
        console.log("Headers:", JSON.stringify(headers, null, 2));
        if (data) {
            console.log("Request Body:", JSON.stringify(data, null, 2));
        }

        // 実際のHTTPリクエストの代わりにモックレスポンスを返す
        const mockResponse: ApiResponse<T> = {
            data: {} as T, // 実際にはAPIからのレスポンス
            success: true,
            message: "処理が正常に完了しました",
            metadata: {
                requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                processingTime: Math.floor(Math.random() * 100) + 50
            }
        };

        console.log(`API Response: ${mockResponse.metadata.processingTime}ms`);
        return mockResponse;
    }
}

// ===== 高度なジェネリックユーティリティ関数 =====

function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item)) as T;
    }

    if (typeof obj === "object") {
        const clonedObj = {} as T;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    return obj;
}

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        result[key] = obj[key];
    });
    return result;
}

function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result as Omit<T, K>;
}

function groupBy<T, K extends keyof T>(items: T[], key: K): Record<string, T[]> {
    return items.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {} as Record<string, T[]>);
}

// ===== 実用的なデータ型定義 =====

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    inStock: boolean;
    tags: string[];
    rating: number;
    reviews: number;
}

interface User {
    id: string;
    username: string;
    email: string;
    age: number;
    preferences: {
        categories: string[];
        maxPrice: number;
    };
}

interface Order {
    id: string;
    userId: string;
    products: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    total: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    createdAt: Date;
}

// ===== 実際の使用例とデモ =====

console.log("=== ジェネリクス（総称型）の実践的活用例 ===");

// 基本的なジェネリック関数の使用
console.log("\n🔧 基本的なジェネリック関数:");
console.log("identity(42):", identity(42));
console.log('identity("Hello"):', identity("Hello"));

const numberArray = createArray(5, 0);
console.log("createArray(5, 0):", numberArray);

const stringArray = createArray(3, "default");
console.log('createArray(3, "default"):', stringArray);

// DataStoreの使用例
console.log("\n📦 データストアの使用例:");
const productStore = new DataStore<Product>();
const userStore = new DataStore<User>();

// 商品データの追加
const sampleProduct: Product = {
    id: "prod-001",
    name: "TypeScript入門書",
    category: "book",
    price: 2980,
    inStock: true,
    tags: ["programming", "typescript", "javascript"],
    rating: 4.5,
    reviews: 123
};

productStore.set("typescript-book", sampleProduct);
console.log("商品を保存:", productStore.get("typescript-book")?.name);

// ユーザーデータの追加
const sampleUser: User = {
    id: "user-001",
    username: "developer_john",
    email: "john@example.com",
    age: 28,
    preferences: {
        categories: ["book", "software"],
        maxPrice: 5000
    }
};

userStore.set("john", sampleUser);
console.log("ユーザーを保存:", userStore.get("john")?.username);

// データストアの統計表示
console.log(`商品ストアのサイズ: ${productStore.size()}`);
console.log(`ユーザーストアのサイズ: ${userStore.size()}`);

// 変更監視の例
const unsubscribe = userStore.subscribe((key, value) => {
    if (value) {
        console.log(`👁️ 監視: ユーザー "${key}" が更新されました`);
    } else {
        console.log(`👁️ 監視: ユーザー "${key}" が削除されました`);
    }
});

// AsyncCacheの使用例
console.log("\n⚡ 非同期キャッシュの使用例:");
const apiCache = new AsyncCache<Product[]>(10000); // 10秒TTL

async function fetchProducts(category: string): Promise<Product[]> {
    // 実際のAPI呼び出しをシミュレート
    console.log(`API呼び出し: カテゴリ "${category}" の商品を取得中...`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒の遅延
    
    return [
        sampleProduct,
        {
            id: "prod-002",
            name: "JavaScript完全ガイド",
            category: category,
            price: 3500,
            inStock: true,
            tags: ["programming", "javascript"],
            rating: 4.8,
            reviews: 234
        }
    ];
}

// キャッシュを使った商品取得
async function demonstrateCache() {
    console.log("初回取得（キャッシュミス）:");
    const products1 = await apiCache.get("book", () => fetchProducts("book"));
    console.log(`取得した商品数: ${products1.length}`);

    console.log("\n2回目の取得（キャッシュヒット）:");
    const products2 = await apiCache.get("book", () => fetchProducts("book"));
    console.log(`取得した商品数: ${products2.length}`);
}

// API クライアントの使用例
console.log("\n🌐 API クライアントの使用例:");
const apiClient = new ApiClient("https://api.example.com/v1", {
    "Authorization": "Bearer your-jwt-token",
    "Content-Type": "application/json"
});

async function demonstrateApiClient() {
    // GET リクエスト
    const getResponse = await apiClient.get<Product[]>("/products");
    console.log("GET リクエスト完了");

    // POST リクエスト
    const newProduct: Omit<Product, "id"> = {
        name: "React実践入門",
        category: "book",
        price: 3200,
        inStock: true,
        tags: ["programming", "react", "javascript"],
        rating: 0,
        reviews: 0
    };

    const postResponse = await apiClient.post<typeof newProduct, Product>("/products", newProduct);
    console.log("POST リクエスト完了");
}

// ジェネリックユーティリティ関数の使用例
console.log("\n🛠️ ユーティリティ関数の使用例:");

const originalUser = sampleUser;
const clonedUser = deepClone(originalUser);
console.log("ディープクローン:", clonedUser.username === originalUser.username);

const userBasicInfo = pick(sampleUser, ["id", "username", "email"]);
console.log("Pick結果:", userBasicInfo);

const userWithoutPreferences = omit(sampleUser, ["preferences"]);
console.log("Omit結果:", "preferences" in userWithoutPreferences);

// 商品データのグループ化
const products: Product[] = [
    sampleProduct,
    {
        id: "prod-003",
        name: "Node.js設計パターン",
        category: "book",
        price: 3800,
        inStock: true,
        tags: ["programming", "nodejs"],
        rating: 4.3,
        reviews: 89
    },
    {
        id: "prod-004",
        name: "開発者向けマウス",
        category: "hardware",
        price: 8900,
        inStock: false,
        tags: ["hardware", "mouse"],
        rating: 4.7,
        reviews: 456
    }
];

const productsByCategory = groupBy(products, "category");
console.log("カテゴリ別グループ化:");
Object.entries(productsByCategory).forEach(([category, items]) => {
    console.log(`  ${category}: ${items.length}商品`);
    items.forEach(item => console.log(`    - ${item.name}`));
});

// 型安全な配列フィルタリング
function filterInStock<T extends { inStock: boolean }>(items: T[]): T[] {
    return items.filter(item => item.inStock);
}

const inStockProducts = filterInStock(products);
console.log(`在庫ありの商品: ${inStockProducts.length}/${products.length}`);

// 非同期関数の実行（注：実際の環境ではawaitで実行）
demonstrateCache().catch(console.error);
demonstrateApiClient().catch(console.error);

// cleanup
unsubscribe();

export {
    DataStore,
    AsyncCache,
    ApiClient,
    identity,
    createArray,
    getProperty,
    deepClone,
    pick,
    omit,
    groupBy,
    Product,
    User,
    Order
};