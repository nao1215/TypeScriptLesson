# Lesson 26: ジェネリクスの基礎 (Generic Basics)

## 学習目標
このレッスンでは、TypeScriptにおけるジェネリクスの基礎について学びます。

- ジェネリクス（Generics）の基本概念と利点
- ジェネリック関数とクラスの定義と使用
- 型パラメータの命名規則と複数型パラメータ
- ジェネリックインターフェースと型エイリアス
- デフォルト型パラメータの活用
- 実践的なジェネリックユーティリティ関数

## 内容

### 1. ジェネリクスとは

ジェネリクスは、型を抽象化して再利用可能なコンポーネントを作成するための仕組みです。

#### なぜジェネリクスが必要なのか？

```typescript
// ジェネリクスを使わない場合の問題点
function identityString(arg: string): string {
    return arg;
}

function identityNumber(arg: number): number {
    return arg;
}

function identityBoolean(arg: boolean): boolean {
    return arg;
}

// any を使った場合の問題点
function identityAny(arg: any): any {
    return arg; // 型安全性が失われる
}
```

```typescript
// ジェネリクスを使った解決策
function identity<T>(arg: T): T {
    return arg;
}

// 使用例
const stringResult = identity<string>("Hello");     // string型
const numberResult = identity<number>(42);          // number型
const boolResult = identity<boolean>(true);         // boolean型

// 型推論により型引数を省略可能
const autoString = identity("Hello");               // string型（推論）
const autoNumber = identity(42);                    // number型（推論）
```

### 2. ジェネリック関数

```typescript
// 基本的なジェネリック関数
function getFirst<T>(array: T[]): T | undefined {
    return array[0];
}

const numbers = [1, 2, 3, 4, 5];
const strings = ["a", "b", "c"];

const firstNumber = getFirst(numbers); // number | undefined
const firstString = getFirst(strings); // string | undefined

// 複数の型パラメータ
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

const stringNumber = pair("hello", 42);          // [string, number]
const booleanDate = pair(true, new Date());      // [boolean, Date]

// より実用的な例
function swap<T, U>(tuple: [T, U]): [U, T] {
    return [tuple[1], tuple[0]];
}

const original: [string, number] = ["hello", 42];
const swapped = swap(original); // [number, string]

// 配列操作のジェネリック関数
function map<T, U>(array: T[], transform: (item: T) => U): U[] {
    const result: U[] = [];
    for (const item of array) {
        result.push(transform(item));
    }
    return result;
}

const numbers2 = [1, 2, 3, 4, 5];
const doubled = map(numbers2, x => x * 2);        // number[]
const strings2 = map(numbers2, x => x.toString()); // string[]
```

### 3. ジェネリッククラス

```typescript
// 基本的なジェネリッククラス
class Container<T> {
    private value: T;
    
    constructor(value: T) {
        this.value = value;
    }
    
    getValue(): T {
        return this.value;
    }
    
    setValue(value: T): void {
        this.value = value;
    }
}

const stringContainer = new Container<string>("Hello");
const numberContainer = new Container<number>(42);

console.log(stringContainer.getValue()); // "Hello"
console.log(numberContainer.getValue());  // 42

// より複雑な例：スタック
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
    
    toArray(): T[] {
        return [...this.items];
    }
}

const stringStack = new Stack<string>();
stringStack.push("first");
stringStack.push("second");
console.log(stringStack.pop()); // "second"

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.peek()); // 2
```

### 4. ジェネリックインターフェース

```typescript
// 基本的なジェネリックインターフェース
interface Repository<T> {
    findById(id: string): T | undefined;
    findAll(): T[];
    save(entity: T): void;
    delete(id: string): boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
}

// インターフェースの実装
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
    
    delete(id: string): boolean {
        return this.items.delete(id);
    }
}

const userRepo = new InMemoryRepository<User>();
const productRepo = new InMemoryRepository<Product>();

// APIレスポンス型の定義
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    timestamp: Date;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

// 使用例
const userResponse: ApiResponse<User> = {
    success: true,
    data: { id: "1", name: "John", email: "john@example.com" },
    message: "User found",
    timestamp: new Date()
};

const usersResponse: PaginatedResponse<User> = {
    success: true,
    data: [
        { id: "1", name: "John", email: "john@example.com" },
        { id: "2", name: "Jane", email: "jane@example.com" }
    ],
    message: "Users found",
    timestamp: new Date(),
    pagination: {
        page: 1,
        limit: 10,
        total: 2
    }
};
```

### 5. 型エイリアスとジェネリクス

```typescript
// 基本的なジェネリック型エイリアス
type Result<T, E = Error> = 
    | { success: true; data: T }
    | { success: false; error: E };

// 使用例
function parseJSON<T>(json: string): Result<T> {
    try {
        const data = JSON.parse(json) as T;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error as Error };
    }
}

const result = parseJSON<User>('{"id":"1","name":"John","email":"john@example.com"}');
if (result.success) {
    console.log(result.data.name); // TypeScript が data の型を認識
} else {
    console.error(result.error.message);
}

// 関数型のジェネリクス
type EventHandler<T> = (event: T) => void;
type AsyncEventHandler<T> = (event: T) => Promise<void>;

interface MouseEvent {
    x: number;
    y: number;
    button: number;
}

interface KeyboardEvent {
    key: string;
    ctrlKey: boolean;
    shiftKey: boolean;
}

const mouseHandler: EventHandler<MouseEvent> = (event) => {
    console.log(`Mouse clicked at (${event.x}, ${event.y})`);
};

const keyHandler: AsyncEventHandler<KeyboardEvent> = async (event) => {
    console.log(`Key pressed: ${event.key}`);
};

// ユーティリティ型エイリアス
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type Required<T, K extends keyof T> = Omit<T, K> & RequiredFields<Pick<T, K>>;

type RequiredFields<T> = {
    [K in keyof T]-?: T[K];
};

// 使用例
interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
}

type UserWithOptionalEmail = Optional<UserProfile, 'email'>; // email が optional になる
type UserWithRequiredBio = Required<UserProfile, 'bio'>;     // bio が required になる
```

### 6. デフォルト型パラメータ

```typescript
// デフォルト型パラメータの定義
interface Config<T = string> {
    value: T;
    label: string;
}

// デフォルト型を使用
const stringConfig: Config = { 
    value: "hello", 
    label: "Greeting" 
}; // Config<string> と同等

// 明示的に型を指定
const numberConfig: Config<number> = { 
    value: 42, 
    label: "Answer" 
};

// 複数のデフォルト型パラメータ
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
    
    clear(): void {
        this.store.clear();
    }
}

const stringCache = new Cache(); // Cache<string, any>
const numberKeyCache = new Cache<number>(); // Cache<number, any>
const typedCache = new Cache<string, User>(); // Cache<string, User>

// 条件付きデフォルト型
type EventPayload<T extends string> = T extends 'user'
    ? User
    : T extends 'product'
    ? Product
    : unknown;

interface Event<T extends string = 'generic'> {
    type: T;
    payload: EventPayload<T>;
    timestamp: Date;
}

const userEvent: Event<'user'> = {
    type: 'user',
    payload: { id: '1', name: 'John', email: 'john@example.com' },
    timestamp: new Date()
};

const genericEvent: Event = {
    type: 'generic',
    payload: 'some data',
    timestamp: new Date()
};
```

### 7. 実用的なジェネリックパターン

```typescript
// ビルダーパターン
class QueryBuilder<T> {
    private conditions: string[] = [];
    private selectFields: string[] = [];
    private orderByField?: string;
    private orderDirection: 'ASC' | 'DESC' = 'ASC';
    
    select(...fields: (keyof T)[]): this {
        this.selectFields.push(...fields as string[]);
        return this;
    }
    
    where(condition: string): this {
        this.conditions.push(condition);
        return this;
    }
    
    orderBy(field: keyof T, direction: 'ASC' | 'DESC' = 'ASC'): this {
        this.orderByField = field as string;
        this.orderDirection = direction;
        return this;
    }
    
    build(): string {
        let query = 'SELECT ';
        query += this.selectFields.length > 0 ? this.selectFields.join(', ') : '*';
        query += ' FROM table';
        
        if (this.conditions.length > 0) {
            query += ' WHERE ' + this.conditions.join(' AND ');
        }
        
        if (this.orderByField) {
            query += ` ORDER BY ${this.orderByField} ${this.orderDirection}`;
        }
        
        return query;
    }
}

interface Product2 {
    id: number;
    name: string;
    price: number;
    category: string;
}

const query = new QueryBuilder<Product2>()
    .select('name', 'price')
    .where('price > 100')
    .where('category = "electronics"')
    .orderBy('price', 'DESC')
    .build();

console.log(query);

// ファクトリーパターン
interface Factory<T> {
    create(...args: any[]): T;
}

class UserFactory implements Factory<User> {
    create(name: string, email: string): User {
        return {
            id: Math.random().toString(36),
            name,
            email
        };
    }
}

class ProductFactory implements Factory<Product> {
    create(name: string, price: number): Product {
        return {
            id: Math.random().toString(36),
            name,
            price
        };
    }
}

// Observer パターン
class Observable<T> {
    private observers: Array<(value: T) => void> = [];
    
    subscribe(observer: (value: T) => void): () => void {
        this.observers.push(observer);
        return () => {
            const index = this.observers.indexOf(observer);
            if (index > -1) {
                this.observers.splice(index, 1);
            }
        };
    }
    
    notify(value: T): void {
        this.observers.forEach(observer => observer(value));
    }
}

const numberObservable = new Observable<number>();
const stringObservable = new Observable<string>();

const unsubscribe = numberObservable.subscribe(value => {
    console.log(`Received number: ${value}`);
});

numberObservable.notify(42);
numberObservable.notify(100);
unsubscribe();
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-26
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. ジェネリック配列操作ライブラリ
2. ジェネリックデータベースマネージャー
3. ジェネリック状態管理システム
4. ジェネリックバリデーションシステム

## 注意点・ベストプラクティス

### よくある間違い

1. **不必要なジェネリクス**
   ```typescript
   // 悪い例：不要なジェネリクス
   function logMessage<T>(message: T): void {
       console.log(message); // T は常に string として使用される
   }
   
   // 良い例：具体的な型を使用
   function logMessage(message: string): void {
       console.log(message);
   }
   ```

2. **型パラメータの命名規則を無視**
   ```typescript
   // 悪い例：分かりにくい名前
   function process<A, B, C>(input: A): B {
       // ...
   }
   
   // 良い例：意味のある名前
   function process<TInput, TOutput, TError>(input: TInput): TOutput {
       // ...
   }
   ```

3. **制約なしのジェネリクス**
   ```typescript
   // 問題のあるコード：T に制約がないため、プロパティアクセスでエラー
   function getId<T>(obj: T): string {
       return obj.id; // エラー: Property 'id' does not exist on type 'T'
   }
   
   // 修正版：制約を追加
   function getId<T extends { id: string }>(obj: T): string {
       return obj.id; // OK
   }
   ```

### 設計原則

1. **DRY原則**: 重複するコードをジェネリクスで抽象化
2. **型安全性**: any を避けてジェネリクスで型安全性を保持
3. **推論の活用**: 型推論を活用して冗長な型指定を避ける
4. **適切な制約**: 必要に応じて型制約を追加

### 命名規則

- **T**: Type（一般的な型）
- **K**: Key（キー型）
- **V**: Value（値型）
- **E**: Element（要素型）
- **R**: Return（戻り値型）
- **P**: Props（プロパティ型）

## まとめ

ジェネリクスは、TypeScriptにおける型の再利用と抽象化を実現する重要な機能です。適切に使用することで、型安全性を保ちながら柔軟で再利用可能なコードを作成できます。基本的なパターンを理解し、実際のプロジェクトで活用してみましょう。次のレッスンではジェネリクスの制約について詳しく学びます。