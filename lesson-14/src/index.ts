/**
 * Lesson 14: デフォルト引数 (Default Parameters)
 * 
 * このファイルでは、TypeScriptにおけるデフォルト引数の使い方を学びます。
 * デフォルト引数を使用することで、関数の柔軟性を向上させることができます。
 */

// 1. 基本的なデフォルト引数
function greet(name: string, greeting: string = "Hello"): string {
    return `${greeting}, ${name}!`;
}

console.log("=== 1. 基本的なデフォルト引数 ===");
console.log(greet("Alice"));           // "Hello, Alice!"
console.log(greet("Bob", "Hi"));       // "Hi, Bob!"
console.log(greet("Charlie", "Good morning")); // "Good morning, Charlie!"

// 2. 複数のデフォルト引数
interface User {
    name: string;
    age: number;
    role: string;
    isActive: boolean;
}

function createUser(
    name: string,
    age: number = 20,
    role: string = "user",
    isActive: boolean = true
): User {
    return {
        name,
        age,
        role,
        isActive
    };
}

console.log("\n=== 2. 複数のデフォルト引数 ===");
console.log(createUser("Alice"));
console.log(createUser("Bob", 25));
console.log(createUser("Charlie", 30, "admin"));
console.log(createUser("David", 22, "moderator", false));

// 3. デフォルト値の型推論
function multiply(a: number, b = 1) { // bは number型として推論される
    return a * b;
}

function concat(str1: string, str2 = "") { // str2は string型として推論される
    return str1 + str2;
}

console.log("\n=== 3. デフォルト値の型推論 ===");
console.log(multiply(5));      // 5
console.log(multiply(5, 3));   // 15
console.log(concat("Hello"));  // "Hello"
console.log(concat("Hello", " World")); // "Hello World"

// 4. オブジェクトのデストラクチャリングとデフォルト値
interface Options {
    timeout?: number;
    retries?: number;
    debug?: boolean;
    baseUrl?: string;
}

function processRequest(
    url: string,
    {
        timeout = 5000,
        retries = 3,
        debug = false,
        baseUrl = "https://api.example.com"
    }: Options = {}
) {
    const fullUrl = baseUrl + url;
    console.log(`Requesting: ${fullUrl}`);
    console.log(`Options: timeout=${timeout}, retries=${retries}, debug=${debug}`);
    
    return {
        url: fullUrl,
        timeout,
        retries,
        debug
    };
}

console.log("\n=== 4. オブジェクトのデストラクチャリングとデフォルト値 ===");
console.log(processRequest("/users"));
console.log(processRequest("/products", { timeout: 10000 }));
console.log(processRequest("/orders", { retries: 5, debug: true }));

// 5. 計算されたデフォルト値
function getCurrentTimestamp(): number {
    return Date.now();
}

function createLogEntry(
    message: string,
    level: string = "info",
    timestamp: number = getCurrentTimestamp()
) {
    return {
        message,
        level,
        timestamp,
        formattedTime: new Date(timestamp).toISOString()
    };
}

console.log("\n=== 5. 計算されたデフォルト値 ===");
console.log(createLogEntry("Application started"));
console.log(createLogEntry("Error occurred", "error"));
setTimeout(() => {
    console.log(createLogEntry("Application running", "debug"));
}, 100);

// 6. 関数式とアロー関数でのデフォルト引数
const calculateArea = function(width: number, height: number = width): number {
    return width * height;
};

const formatCurrency = (
    amount: number,
    currency: string = "USD",
    locale: string = "en-US"
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
};

console.log("\n=== 6. 関数式とアロー関数でのデフォルト引数 ===");
console.log(calculateArea(5));        // 25 (正方形)
console.log(calculateArea(5, 10));    // 50 (長方形)
console.log(formatCurrency(1000));    // "$1,000.00"
console.log(formatCurrency(1000, "JPY", "ja-JP")); // "¥1,000"

// 7. デフォルト引数とオーバーロード
function parseData(input: string): object;
function parseData(input: string, format: "json"): object;
function parseData(input: string, format: "xml"): Document;
function parseData(input: string, format: string = "json"): object | Document {
    switch (format) {
        case "json":
            return JSON.parse(input);
        case "xml":
            const parser = new DOMParser();
            return parser.parseFromString(input, "text/xml");
        default:
            throw new Error(`Unsupported format: ${format}`);
    }
}

console.log("\n=== 7. デフォルト引数とオーバーロード ===");
const jsonData = parseData('{"name": "Alice", "age": 25}');
console.log("JSON parsed:", jsonData);

// 8. 実用的な例: 設定オブジェクトのマージ
interface AppConfig {
    apiUrl: string;
    timeout: number;
    retryAttempts: number;
    enableLogging: boolean;
    logLevel: "debug" | "info" | "warn" | "error";
}

function createAppConfig(
    userConfig: Partial<AppConfig> = {},
    defaultConfig: AppConfig = {
        apiUrl: "https://api.example.com",
        timeout: 5000,
        retryAttempts: 3,
        enableLogging: true,
        logLevel: "info"
    }
): AppConfig {
    return {
        ...defaultConfig,
        ...userConfig
    };
}

console.log("\n=== 8. 実用的な例: 設定オブジェクトのマージ ===");
console.log("デフォルト設定:");
console.log(createAppConfig());

console.log("\n部分的な設定:");
console.log(createAppConfig({
    apiUrl: "https://staging.api.example.com",
    logLevel: "debug"
}));

console.log("\n完全な設定:");
console.log(createAppConfig({
    apiUrl: "https://prod.api.example.com",
    timeout: 10000,
    retryAttempts: 5,
    enableLogging: false,
    logLevel: "error"
}));