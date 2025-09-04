/**
 * Lesson 21: インターフェース演習問題 - 解答例
 */

// 演習1: ECサイトの商品とカート機能のインターフェース設計
console.log("=== 演習1: ECサイトインターフェース 解答例 ===");

// 商品の基本情報
interface IProduct {
    readonly id: number;
    name: string;
    price: number;
    category: string;
    stock: number;
    imageUrl?: string;
    description?: string;
}

// カートアイテム
interface ICartItem {
    product: IProduct;
    quantity: number;
    addedAt: Date;
}

// カート機能
interface IShoppingCart {
    items: ICartItem[];
    calculateTotal(): number;
    addItem(product: IProduct, quantity: number): void;
    removeItem(productId: number): void;
    updateQuantity(productId: number, quantity: number): void;
    clearCart(): void;
}

// ShoppingCartクラスの実装
class ShoppingCart implements IShoppingCart {
    items: ICartItem[] = [];

    calculateTotal(): number {
        return this.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    addItem(product: IProduct, quantity: number): void {
        const existingItem = this.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                product,
                quantity,
                addedAt: new Date()
            });
        }
        
        console.log(`Added ${quantity} ${product.name}(s) to cart`);
    }

    removeItem(productId: number): void {
        const index = this.items.findIndex(item => item.product.id === productId);
        if (index !== -1) {
            const removedItem = this.items.splice(index, 1)[0];
            console.log(`Removed ${removedItem.product.name} from cart`);
        }
    }

    updateQuantity(productId: number, quantity: number): void {
        const item = this.items.find(item => item.product.id === productId);
        if (item) {
            item.quantity = quantity;
            console.log(`Updated ${item.product.name} quantity to ${quantity}`);
        }
    }

    clearCart(): void {
        this.items = [];
        console.log("Cart cleared");
    }
}

// テスト用サンプルデータ
const sampleProducts: IProduct[] = [
    {
        id: 1,
        name: "TypeScript Handbook",
        price: 2980,
        category: "Books",
        stock: 50,
        description: "Complete guide to TypeScript"
    },
    {
        id: 2,
        name: "Mechanical Keyboard",
        price: 15800,
        category: "Electronics",
        stock: 10,
        imageUrl: "https://example.com/keyboard.jpg"
    }
];

const cart = new ShoppingCart();
cart.addItem(sampleProducts[0], 2);
cart.addItem(sampleProducts[1], 1);
console.log(`Total: ¥${cart.calculateTotal().toLocaleString()}`);
console.log("Cart items:", cart.items.length);

// 演習2: 図書館管理システム
console.log("\n=== 演習2: 図書館管理システム 解答例 ===");

interface ILibraryItem {
    readonly id: string;
    title: string;
    publishYear: number;
    isAvailable: boolean;
    borrow(borrowerName: string): boolean;
    return(): boolean;
}

interface IBook extends ILibraryItem {
    author: string;
    isbn: string;
    pages: number;
    genre: string;
}

interface IMagazine extends ILibraryItem {
    publisher: string;
    issueNumber: number;
    frequency: 'monthly' | 'weekly' | 'quarterly';
}

interface IMedia extends ILibraryItem {
    director: string;
    durationMinutes: number;
    mediaType: 'DVD' | 'Blu-ray';
    genre: string;
}

// 基本クラス
abstract class LibraryItem implements ILibraryItem {
    constructor(
        public readonly id: string,
        public title: string,
        public publishYear: number,
        public isAvailable: boolean = true
    ) {}

    borrow(borrowerName: string): boolean {
        if (this.isAvailable) {
            this.isAvailable = false;
            console.log(`"${this.title}" borrowed by ${borrowerName}`);
            return true;
        }
        console.log(`"${this.title}" is not available`);
        return false;
    }

    return(): boolean {
        if (!this.isAvailable) {
            this.isAvailable = true;
            console.log(`"${this.title}" returned`);
            return true;
        }
        console.log(`"${this.title}" was not borrowed`);
        return false;
    }
}

class Book extends LibraryItem implements IBook {
    constructor(
        id: string,
        title: string,
        publishYear: number,
        public author: string,
        public isbn: string,
        public pages: number,
        public genre: string
    ) {
        super(id, title, publishYear);
    }
}

class Magazine extends LibraryItem implements IMagazine {
    constructor(
        id: string,
        title: string,
        publishYear: number,
        public publisher: string,
        public issueNumber: number,
        public frequency: 'monthly' | 'weekly' | 'quarterly'
    ) {
        super(id, title, publishYear);
    }
}

class Media extends LibraryItem implements IMedia {
    constructor(
        id: string,
        title: string,
        publishYear: number,
        public director: string,
        public durationMinutes: number,
        public mediaType: 'DVD' | 'Blu-ray',
        public genre: string
    ) {
        super(id, title, publishYear);
    }
}

// サンプルデータ
const book1 = new Book("B001", "Clean Code", 2008, "Robert C. Martin", "978-0132350884", 464, "Programming");
const magazine1 = new Magazine("M001", "National Geographic", 2024, "National Geographic Society", 3, "monthly");
const media1 = new Media("D001", "The Matrix", 1999, "Lana Wachowski", 136, "DVD", "Sci-Fi");

book1.borrow("Alice");
book1.return();

// 演習3: APIレスポンスインターフェース
console.log("\n=== 演習3: APIレスポンスインターフェース 解答例 ===");

interface IApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
}

interface IPagination {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

interface IPaginatedApiResponse<T> extends IApiResponse<T[]> {
    pagination: IPagination;
}

interface IUser {
    id: number;
    username: string;
    email: string;
    createdAt: string;
    lastLoginAt?: string;
}

// モックユーザーデータ
const mockUsers: IUser[] = [
    {
        id: 1,
        username: "alice_dev",
        email: "alice@example.com",
        createdAt: "2023-01-15T10:30:00Z",
        lastLoginAt: "2024-01-20T14:45:00Z"
    },
    {
        id: 2,
        username: "bob_designer",
        email: "bob@example.com",
        createdAt: "2023-02-20T09:15:00Z"
    },
    // ... 他のユーザー
];

function fetchUsers(page: number, limit: number): Promise<IPaginatedApiResponse<IUser>> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const users = mockUsers.slice(startIndex, endIndex);
            
            const totalItems = mockUsers.length;
            const totalPages = Math.ceil(totalItems / limit);
            
            resolve({
                success: true,
                statusCode: 200,
                message: "Users retrieved successfully",
                data: users,
                pagination: {
                    currentPage: page,
                    itemsPerPage: limit,
                    totalItems,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrevious: page > 1
                },
                timestamp: new Date().toISOString()
            });
        }, 100);
    });
}

function fetchUser(userId: number): Promise<IApiResponse<IUser>> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);
            
            if (user) {
                resolve({
                    success: true,
                    statusCode: 200,
                    message: "User retrieved successfully",
                    data: user,
                    timestamp: new Date().toISOString()
                });
            } else {
                resolve({
                    success: false,
                    statusCode: 404,
                    message: "User not found",
                    error: `User with ID ${userId} does not exist`,
                    timestamp: new Date().toISOString()
                });
            }
        }, 100);
    });
}

// テスト実行
async function testApiResponses() {
    try {
        // ユーザー一覧取得
        const usersResponse = await fetchUsers(1, 5);
        console.log("Users API Response:", {
            success: usersResponse.success,
            dataLength: usersResponse.data?.length,
            pagination: usersResponse.pagination
        });
        
        // 単一ユーザー取得
        const userResponse = await fetchUser(1);
        console.log("Single User API Response:", {
            success: userResponse.success,
            user: userResponse.data?.username
        });
        
        // 存在しないユーザー取得
        const notFoundResponse = await fetchUser(999);
        console.log("Not Found Response:", {
            success: notFoundResponse.success,
            error: notFoundResponse.error
        });
    } catch (error) {
        console.error("API Test Error:", error);
    }
}

testApiResponses();

// 演習4: イベント処理システム
console.log("\n=== 演習4: イベント処理システム 解答例 ===");

interface IEventListener<T = any> {
    (event: T): void;
}

interface IEvent {
    type: string;
    timestamp: Date;
    source?: string;
}

interface IUserEvent extends IEvent {
    type: 'user_login' | 'user_logout' | 'user_register';
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface ISystemEvent extends IEvent {
    type: 'system_start' | 'system_stop' | 'system_error';
    message?: string;
    level?: 'info' | 'warning' | 'error';
}

interface IEventEmitter {
    on<T extends IEvent>(eventType: string, listener: IEventListener<T>): void;
    off<T extends IEvent>(eventType: string, listener: IEventListener<T>): void;
    emit<T extends IEvent>(eventType: string, event: T): void;
    removeAllListeners(eventType?: string): void;
    listenerCount(eventType: string): number;
}

class EventEmitter implements IEventEmitter {
    private listeners: Map<string, IEventListener[]> = new Map();

    on<T extends IEvent>(eventType: string, listener: IEventListener<T>): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)!.push(listener);
    }

    off<T extends IEvent>(eventType: string, listener: IEventListener<T>): void {
        const eventListeners = this.listeners.get(eventType);
        if (eventListeners) {
            const index = eventListeners.indexOf(listener);
            if (index !== -1) {
                eventListeners.splice(index, 1);
            }
        }
    }

    emit<T extends IEvent>(eventType: string, event: T): void {
        const eventListeners = this.listeners.get(eventType);
        if (eventListeners) {
            eventListeners.forEach(listener => {
                try {
                    listener(event);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            });
        }
    }

    removeAllListeners(eventType?: string): void {
        if (eventType) {
            this.listeners.delete(eventType);
        } else {
            this.listeners.clear();
        }
    }

    listenerCount(eventType: string): number {
        const eventListeners = this.listeners.get(eventType);
        return eventListeners ? eventListeners.length : 0;
    }
}

// テストケース
const emitter = new EventEmitter();

// ユーザーログインイベントのリスナーを追加
const loginListener: IEventListener<IUserEvent> = (event) => {
    console.log(`User ${event.user.name} logged in at ${event.timestamp.toISOString()}`);
};

emitter.on('user_login', loginListener);

// システムエラーイベントのリスナーを追加
const errorListener: IEventListener<ISystemEvent> = (event) => {
    console.log(`System ${event.level}: ${event.message} at ${event.timestamp.toISOString()}`);
};

emitter.on('system_error', errorListener);

// イベントを発火
emitter.emit('user_login', {
    type: 'user_login',
    timestamp: new Date(),
    user: { id: 1, name: 'Alice', email: 'alice@example.com' }
} as IUserEvent);

emitter.emit('system_error', {
    type: 'system_error',
    timestamp: new Date(),
    message: 'Database connection failed',
    level: 'error'
} as ISystemEvent);

console.log(`Login listeners: ${emitter.listenerCount('user_login')}`);

// 演習5: 設定システム
console.log("\n=== 演習5: 設定システム 解答例 ===");

interface IBaseConfig {
    readonly id: string;
    name: string;
    description?: string;
    defaultValue: any;
    currentValue: any;
    createdAt: Date;
    updatedAt: Date;
}

interface INumericConfig extends IBaseConfig {
    defaultValue: number;
    currentValue: number;
    minValue?: number;
    maxValue?: number;
    step?: number;
}

interface IStringConfig extends IBaseConfig {
    defaultValue: string;
    currentValue: string;
    maxLength?: number;
    pattern?: RegExp;
}

interface IBooleanConfig extends IBaseConfig {
    defaultValue: boolean;
    currentValue: boolean;
}

interface ISelectConfig extends IBaseConfig {
    defaultValue: string;
    currentValue: string;
    options: string[];
}

type ConfigType = INumericConfig | IStringConfig | IBooleanConfig | ISelectConfig;

interface IConfigManager {
    get<T extends ConfigType>(configId: string): T | undefined;
    set<T extends ConfigType>(configId: string, value: T['currentValue']): boolean;
    reset(configId: string): boolean;
    getAll(): ConfigType[];
    import(configs: ConfigType[]): void;
    export(): ConfigType[];
}

class ConfigManager implements IConfigManager {
    private configs: Map<string, ConfigType> = new Map();

    constructor(initialConfigs: ConfigType[] = []) {
        initialConfigs.forEach(config => {
            this.configs.set(config.id, config);
        });
    }

    get<T extends ConfigType>(configId: string): T | undefined {
        return this.configs.get(configId) as T;
    }

    set<T extends ConfigType>(configId: string, value: T['currentValue']): boolean {
        const config = this.configs.get(configId);
        if (!config) return false;

        // 型に応じた値の検証
        if (!this.validateValue(config, value)) return false;

        config.currentValue = value;
        config.updatedAt = new Date();
        return true;
    }

    reset(configId: string): boolean {
        const config = this.configs.get(configId);
        if (!config) return false;

        config.currentValue = config.defaultValue;
        config.updatedAt = new Date();
        return true;
    }

    getAll(): ConfigType[] {
        return Array.from(this.configs.values());
    }

    import(configs: ConfigType[]): void {
        configs.forEach(config => {
            this.configs.set(config.id, config);
        });
    }

    export(): ConfigType[] {
        return this.getAll();
    }

    private validateValue(config: ConfigType, value: any): boolean {
        if (config.id.includes('numeric')) {
            const numericConfig = config as INumericConfig;
            if (typeof value !== 'number') return false;
            if (numericConfig.minValue !== undefined && value < numericConfig.minValue) return false;
            if (numericConfig.maxValue !== undefined && value > numericConfig.maxValue) return false;
            return true;
        }
        
        if (config.id.includes('string')) {
            const stringConfig = config as IStringConfig;
            if (typeof value !== 'string') return false;
            if (stringConfig.maxLength && value.length > stringConfig.maxLength) return false;
            if (stringConfig.pattern && !stringConfig.pattern.test(value)) return false;
            return true;
        }
        
        if (config.id.includes('boolean')) {
            return typeof value === 'boolean';
        }
        
        if (config.id.includes('select')) {
            const selectConfig = config as ISelectConfig;
            return selectConfig.options.includes(value);
        }
        
        return true;
    }
}

// サンプル設定データ
const sampleConfigs: ConfigType[] = [
    {
        id: 'app_numeric_timeout',
        name: 'Request Timeout',
        description: 'HTTP request timeout in seconds',
        defaultValue: 30,
        currentValue: 30,
        minValue: 5,
        maxValue: 300,
        step: 5,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    } as INumericConfig,
    
    {
        id: 'app_string_theme',
        name: 'Application Theme',
        description: 'UI theme selection',
        defaultValue: 'light',
        currentValue: 'dark',
        options: ['light', 'dark', 'auto'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
    } as ISelectConfig,
    
    {
        id: 'app_boolean_notifications',
        name: 'Enable Notifications',
        description: 'Show desktop notifications',
        defaultValue: true,
        currentValue: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10')
    } as IBooleanConfig
];

const configManager = new ConfigManager(sampleConfigs);

console.log("All configs:", configManager.getAll().map(c => ({ id: c.id, name: c.name, current: c.currentValue })));

// 設定の更新テスト
configManager.set('app_numeric_timeout', 60);
configManager.set('app_string_theme', 'auto');

console.log("Updated timeout:", configManager.get('app_numeric_timeout')?.currentValue);
console.log("Updated theme:", configManager.get('app_string_theme')?.currentValue);

// リセットテスト
configManager.reset('app_boolean_notifications');
console.log("Reset notifications:", configManager.get('app_boolean_notifications')?.currentValue);

console.log("\n=== すべての演習問題の解答例完了 ===");