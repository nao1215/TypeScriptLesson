// Lesson 26: ジェネリクスの基礎 (Generic Basics)

console.log("=== Lesson 26: ジェネリクスの基礎 (Generic Basics) ===");

// 1. 基本的なジェネリック関数
function identity<T>(arg: T): T {
    return arg;
}

const stringResult = identity<string>("Hello");
const numberResult = identity<number>(42);
const boolResult = identity(true); // 型推論

console.log("1. 基本的なジェネリック関数:");
console.log(stringResult, numberResult, boolResult);

// 2. ジェネリッククラス
class Stack<T> {
    private items: T[] = [];
    
    push(item: T): void {
        this.items.push(item);
    }
    
    pop(): T | undefined {
        return this.items.pop();
    }
    
    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }
    
    isEmpty(): boolean {
        return this.items.length === 0;
    }
    
    size(): number {
        return this.items.length;
    }
}

const stringStack = new Stack<string>();
stringStack.push("first");
stringStack.push("second");
console.log("\n2. ジェネリッククラス - Stack:");
console.log("Peek:", stringStack.peek());
console.log("Pop:", stringStack.pop());

// 3. ジェネリックインターフェース
interface Repository<T> {
    findById(id: string): T | undefined;
    findAll(): T[];
    save(entity: T): void;
}

interface User {
    id: string;
    name: string;
    email: string;
}

class InMemoryRepository<T extends {id: string}> implements Repository<T> {
    private items: Map<string, T> = new Map();
    
    findById(id: string): T | undefined {
        return this.items.get(id);
    }
    
    findAll(): T[] {
        return Array.from(this.items.values());
    }
    
    save(entity: T): void {
        this.items.set(entity.id, entity);
    }
}

const userRepo = new InMemoryRepository<User>();
const user: User = { id: "1", name: "John", email: "john@example.com" };
userRepo.save(user);

console.log("\n3. ジェネリックインターフェース - Repository:");
console.log("Saved user:", userRepo.findById("1"));

// 4. 複数型パラメータ
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

const stringNumber = pair("hello", 42);
const booleanDate = pair(true, new Date());

console.log("\n4. 複数型パラメータ:");
console.log(stringNumber, booleanDate);

// 5. デフォルト型パラメータ
class Cache<K = string, V = any> {
    private store = new Map<K, V>();
    
    set(key: K, value: V): void {
        this.store.set(key, value);
    }
    
    get(key: K): V | undefined {
        return this.store.get(key);
    }
    
    has(key: K): boolean {
        return this.store.has(key);
    }
}

const stringCache = new Cache(); // Cache<string, any>
stringCache.set("key1", "value1");

const typedCache = new Cache<string, User>(); // Cache<string, User>
typedCache.set("user1", user);

console.log("\n5. デフォルト型パラメータ:");
console.log("String cache:", stringCache.get("key1"));
console.log("Typed cache:", typedCache.get("user1"));

console.log("\n=== Lesson 26 Complete! ===");