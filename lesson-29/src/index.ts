// Lesson 29: モジュール (Modules)

console.log("=== Lesson 29: モジュール (Modules) ===");

// 1. 基本的なエクスポートとインポート
console.log("1. モジュールシステムの基本:");

// Namedエクスポートの例
export interface User {
    id: string;
    name: string;
    email: string;
}

export function createUser(name: string, email: string): User {
    return {
        id: Math.random().toString(36),
        name,
        email
    };
}

export const DEFAULT_USER: User = {
    id: 'default',
    name: 'Guest',
    email: 'guest@example.com'
};

// 2. クラスのエクスポート
export class Logger {
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }
    
    warn(message: string): void {
        console.warn(`[WARN] ${message}`);
    }
    
    error(message: string): void {
        console.error(`[ERROR] ${message}`);
    }
}

// 3. 名前空間
export namespace API {
    export interface Response<T> {
        data: T;
        success: boolean;
        message: string;
    }
    
    export namespace User {
        export interface CreateRequest {
            name: string;
            email: string;
        }
    }
}

// 使用例
const logger = new Logger();
const user = createUser('John', 'john@example.com');
logger.log(`Created user: ${user.name}`);

const apiResponse: API.Response<User> = {
    data: user,
    success: true,
    message: 'User created successfully'
};

console.log("API Response:", apiResponse);

console.log("\n=== Lesson 29 Complete! ===");