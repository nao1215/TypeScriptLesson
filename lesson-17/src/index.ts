/**
 * Lesson 17: 型エイリアス (Type Aliases)
 * 
 * このファイルでは、TypeScriptにおける型エイリアスの定義と使用方法を学びます。
 * 型エイリアスを使用することで、複雑な型に名前を付けて再利用できます。
 */

// 1. 基本的な型エイリアス
type UserID = string;
type Age = number;
type Email = string;
type IsActive = boolean;

// プリミティブ型のエイリアス
type Username = string;
type Score = number;
type Rating = number;

function createUser(id: UserID, name: Username, age: Age, email: Email): void {
    console.log(`User created: ${name} (ID: ${id}, Age: ${age}, Email: ${email})`);
}

console.log("=== 1. 基本的な型エイリアス ===");
createUser("user123", "Alice", 25, "alice@example.com");

// 2. オブジェクト型のエイリアス
type Point2D = {
    x: number;
    y: number;
};

type Point3D = {
    x: number;
    y: number;
    z: number;
};

type User = {
    id: UserID;
    name: Username;
    age: Age;
    email: Email;
    isActive: IsActive;
};

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
};

function calculateDistance(p1: Point2D, p2: Point2D): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function formatUser(user: User): string {
    const status = user.isActive ? "Active" : "Inactive";
    return `${user.name} (${user.age}) - ${user.email} [${status}]`;
}

console.log("\n=== 2. オブジェクト型のエイリアス ===");
const point1: Point2D = { x: 0, y: 0 };
const point2: Point2D = { x: 3, y: 4 };
console.log(`Distance: ${calculateDistance(point1, point2)}`);

const user: User = {
    id: "u001",
    name: "Bob",
    age: 30,
    email: "bob@example.com",
    isActive: true
};
console.log(formatUser(user));

// 3. ユニオン型のエイリアス
type Status = "loading" | "success" | "error" | "idle";
type Theme = "light" | "dark" | "auto";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type LogLevel = "debug" | "info" | "warn" | "error";

type ApiResponse<T> = {
    status: Status;
    data?: T;
    error?: string;
    timestamp: Date;
};

function handleApiResponse<T>(response: ApiResponse<T>): void {
    console.log(`Status: ${response.status} at ${response.timestamp.toISOString()}`);
    
    switch (response.status) {
        case "success":
            console.log("Data:", response.data);
            break;
        case "error":
            console.log("Error:", response.error);
            break;
        case "loading":
            console.log("Loading...");
            break;
        default:
            console.log("Idle state");
    }
}

console.log("\n=== 3. ユニオン型のエイリアス ===");
const successResponse: ApiResponse<Product> = {
    status: "success",
    data: {
        id: "p001",
        name: "Laptop",
        price: 999,
        category: "Electronics",
        inStock: true
    },
    timestamp: new Date()
};

const errorResponse: ApiResponse<null> = {
    status: "error",
    error: "Product not found",
    timestamp: new Date()
};

handleApiResponse(successResponse);
handleApiResponse(errorResponse);

// 4. 関数型のエイリアス
type EventHandler<T> = (event: T) => void;
type Validator<T> = (value: T) => boolean;
type Transformer<T, U> = (input: T) => U;
type AsyncProcessor<T, U> = (input: T) => Promise<U>;
type Predicate<T> = (item: T) => boolean;

// 実用的な関数型の例
type StringValidator = Validator<string>;
type NumberTransformer = Transformer<string, number>;
type UserProcessor = AsyncProcessor<User, string>;

const isEmailValid: StringValidator = (email: string): boolean => {
    return email.includes("@") && email.includes(".");
};

const stringToNumber: NumberTransformer = (str: string): number => {
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
};

const processUser: UserProcessor = async (user: User): Promise<string> => {
    // 非同期処理のシミュレーション
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Processed user: ${user.name}`;
};

console.log("\n=== 4. 関数型のエイリアス ===");
console.log("Email validation:", isEmailValid("test@example.com"));
console.log("String to number:", stringToNumber("42.5"));

processUser(user).then(result => console.log(result));

// 5. ジェネリック型エイリアス
type Result<T, E = Error> = {
    success: boolean;
    data?: T;
    error?: E;
};

type Optional<T> = T | undefined;
type Nullable<T> = T | null;
type NonNull<T> = T extends null | undefined ? never : T;
type Partial<T> = {
    [P in keyof T]?: T[P];
};

type KeyValuePair<K, V> = {
    key: K;
    value: V;
};

type Dictionary<T> = {
    [key: string]: T;
};

function createResult<T>(success: boolean, data?: T, error?: string): Result<T, string> {
    return { success, data, error };
}

function processOptional<T>(value: Optional<T>): string {
    return value !== undefined ? `Value: ${value}` : "No value";
}

console.log("\n=== 5. ジェネリック型エイリアス ===");
const successResult = createResult(true, { id: 1, name: "Success" });
const errorResult = createResult<null>(false, undefined, "Something went wrong");

console.log("Success result:", successResult);
console.log("Error result:", errorResult);

console.log("Optional processing:", processOptional("Hello"));
console.log("Optional processing:", processOptional(undefined));

// 6. 複雑な型エイリアスの組み合わせ
type EventType = "click" | "hover" | "focus" | "blur";
type EventData = {
    timestamp: Date;
    target: string;
    metadata?: Dictionary<any>;
};

type CustomEvent = {
    type: EventType;
    data: EventData;
};

type EventListener = EventHandler<CustomEvent>;
type EventRegistry = Dictionary<EventListener[]>;

class EventManager {
    private registry: EventRegistry = {};

    addEventListener(eventType: EventType, listener: EventListener): void {
        if (!this.registry[eventType]) {
            this.registry[eventType] = [];
        }
        this.registry[eventType].push(listener);
    }

    emitEvent(event: CustomEvent): void {
        const listeners = this.registry[event.type];
        if (listeners) {
            listeners.forEach(listener => listener(event));
        }
    }
}

console.log("\n=== 6. 複雑な型エイリアスの組み合わせ ===");
const eventManager = new EventManager();

const clickListener: EventListener = (event) => {
    console.log(`Click event on ${event.data.target} at ${event.data.timestamp.toISOString()}`);
};

eventManager.addEventListener("click", clickListener);

const clickEvent: CustomEvent = {
    type: "click",
    data: {
        timestamp: new Date(),
        target: "button",
        metadata: { x: 100, y: 200 }
    }
};

eventManager.emitEvent(clickEvent);

// 7. 実用的な型エイリアスの例
type DatabaseRecord = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
};

type WithTimestamps<T> = T & DatabaseRecord;

type BlogPost = WithTimestamps<{
    title: string;
    content: string;
    author: string;
    tags: string[];
    published: boolean;
}>;

type Comment = WithTimestamps<{
    postId: string;
    author: string;
    content: string;
    parentCommentId?: string;
}>;

// API関連の型エイリアス
type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500;
type ApiEndpoint = `/api/${string}`;
type RequestConfig = {
    method: HttpMethod;
    endpoint: ApiEndpoint;
    body?: any;
    headers?: Dictionary<string>;
};

function makeRequest(config: RequestConfig): Promise<Result<any, HttpStatus>> {
    // リクエスト処理のシミュレーション
    return new Promise((resolve) => {
        setTimeout(() => {
            if (config.endpoint.includes("error")) {
                resolve({ success: false, error: 404 });
            } else {
                resolve({ 
                    success: true, 
                    data: { message: `${config.method} request to ${config.endpoint}` } 
                });
            }
        }, 100);
    });
}

console.log("\n=== 7. 実用的な型エイリアスの例 ===");

const blogPost: BlogPost = {
    id: "post1",
    title: "Learning TypeScript",
    content: "TypeScript is amazing!",
    author: "Alice",
    tags: ["typescript", "programming"],
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
};

console.log("Blog post:", blogPost.title);

const requestConfig: RequestConfig = {
    method: "GET",
    endpoint: "/api/posts",
    headers: { "Authorization": "Bearer token123" }
};

makeRequest(requestConfig).then(result => {
    console.log("API request result:", result);
});