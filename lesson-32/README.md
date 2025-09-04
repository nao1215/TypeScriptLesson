# Lesson 32: 高度なジェネリクス (Advanced Generics)

## 学習目標
TypeScriptの高度なジェネリクスシステムを学びます。

- ジェネリクスの共変性と反変性
- 高階型関数とジェネリクスの組み合わせ
- ジェネリクス型推論と分配法則
- 複雑なジェネリクス制約と関係性
- 実用的なデザインパターンの実装：Builder、Factory、Observer
- パフォーマンスとタイプセーフティの両立

## 内容

### 1. 共変性と反変性 (Covariance and Contravariance)

TypeScriptにおける型の関係性を理解し、実用的な型安全性を実現します。

```typescript
// 共変性 (Covariance) - サブタイプをスーパータイプとして扱える
interface Animal {
    name: string;
}

interface Dog extends Animal {
    breed: string;
}

interface Cat extends Animal {
    meow(): void;
}

// 配列は共変
let dogs: Dog[] = [{ name: "Buddy", breed: "Golden Retriever" }];
let animals: Animal[] = dogs; // OK - 共変性により許可

// 反変性 (Contravariance) - 関数の引数で現れる
type AnimalHandler<T> = (animal: T) => void;

let handleAnimal: AnimalHandler<Animal> = (animal) => console.log(animal.name);
let handleDog: AnimalHandler<Dog> = handleAnimal; // OK - 反変性により許可
```

### 2. 高階型関数

```typescript
// 高階型関数の定義
type Mapper<T, U> = (value: T) => U;
type Filter<T> = (value: T) => boolean;
type Reducer<T, U> = (accumulator: U, current: T) => U;

// 関数型プログラミングスタイルの型安全なユーティリティ
class FunctionalArray<T> {
    constructor(private items: T[]) {}
    
    map<U>(mapper: Mapper<T, U>): FunctionalArray<U> {
        return new FunctionalArray(this.items.map(mapper));
    }
    
    filter(predicate: Filter<T>): FunctionalArray<T> {
        return new FunctionalArray(this.items.filter(predicate));
    }
    
    reduce<U>(reducer: Reducer<T, U>, initialValue: U): U {
        return this.items.reduce(reducer, initialValue);
    }
    
    flatMap<U>(mapper: Mapper<T, U[]>): FunctionalArray<U> {
        return new FunctionalArray(this.items.flatMap(mapper));
    }
    
    toArray(): T[] {
        return [...this.items];
    }
}
```

### 3. 分散型ジェネリクス (Distributive Generics)

```typescript
// 分散型の基本原理
type ToArray<T> = T extends any ? T[] : never;

type Example1 = ToArray<string | number>; // string[] | number[]

// より実用的な例：プロミスの分散
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type DistributeUnwrap<T> = T extends any ? UnwrapPromise<T> : never;

type Result = DistributeUnwrap<Promise<string> | Promise<number> | boolean>;
// Result = string | number | boolean

// 実用的な分散型ユーティリティ
type DeepPartial<T> = T extends object 
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

type DeepRequired<T> = T extends object
    ? { [P in keyof T]-?: DeepRequired<T[P]> }
    : T;

interface ComplexData {
    user?: {
        profile?: {
            name?: string;
            age?: number;
        };
        settings?: {
            theme?: 'light' | 'dark';
        };
    };
}

type PartialComplexData = DeepPartial<ComplexData>;
type RequiredComplexData = DeepRequired<ComplexData>;
```

### 4. 複雑なジェネリクス制約

```typescript
// 複数制約の組み合わせ
interface Serializable {
    serialize(): string;
}

interface Identifiable {
    id: string;
}

interface Timestamped {
    createdAt: Date;
    updatedAt: Date;
}

// 複数の制約を満たす型
type Entity<T> = T & Identifiable & Timestamped;
type SerializableEntity<T> = Entity<T> & Serializable;

// 条件付き制約
type KeyOf<T> = keyof T;
type ValueOf<T> = T[keyof T];

type NonNullable<T> = T extends null | undefined ? never : T;
type NonEmptyArray<T> = [T, ...T[]];

// 実用的な制約システム
type DatabaseRecord<T> = T extends Record<string, any>
    ? T & { id: string; createdAt: Date; updatedAt: Date }
    : never;

type QueryResult<T> = T extends DatabaseRecord<infer U>
    ? {
        data: T[];
        count: number;
        page: number;
        hasMore: boolean;
    }
    : never;

// リレーション制約
type RelationField<T, K extends keyof T> = T[K] extends string 
    ? { [P in K]: string } 
    : T[K] extends string[]
    ? { [P in K]: string[] }
    : never;

interface User extends DatabaseRecord<{
    name: string;
    email: string;
    posts: string[]; // Post IDの配列
}> {}

interface Post extends DatabaseRecord<{
    title: string;
    content: string;
    authorId: string; // User ID
}> {}

type UserRelations = RelationField<User, 'posts'>;
type PostRelations = RelationField<Post, 'authorId'>;
```

### 5. Builder パターンの実装

```typescript
// 型安全なBuilderパターン
type RequiredFields<T> = {
    [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};

type OptionalFields<T> = {
    [K in keyof T as T[K] extends Required<T>[K] ? never : K]: T[K];
};

class TypeSafeBuilder<T, Built = {}> {
    private data = {} as Built;
    
    set<K extends keyof T>(
        key: K,
        value: T[K]
    ): TypeSafeBuilder<T, Built & Pick<T, K>> {
        (this.data as any)[key] = value;
        return this as any;
    }
    
    build(
        this: TypeSafeBuilder<T, RequiredFields<T>>
    ): T & Built {
        return { ...this.data } as T & Built;
    }
    
    buildPartial(): Built {
        return { ...this.data };
    }
}

// 使用例
interface APIRequest {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}

function createRequest() {
    return new TypeSafeBuilder<APIRequest>();
}

// ビルダーの使用
const request = createRequest()
    .set('url', 'https://api.example.com/users')
    .set('method', 'POST')
    .set('headers', { 'Content-Type': 'application/json' })
    .set('body', { name: 'Alice' })
    .build(); // url と method が必須なので、両方設定後にのみbuildが可能
```

### 6. Factory パターンの実装

```typescript
// 抽象ファクトリーパターン
interface Product {
    name: string;
    category: string;
    price: number;
}

interface Service {
    name: string;
    version: string;
    endpoints: string[];
}

// ファクトリーの基底型
abstract class Factory<T> {
    abstract create(config: any): T;
    abstract createMany(configs: any[]): T[];
}

// ジェネリクスによる型安全なファクトリー実装
class ProductFactory extends Factory<Product> {
    private templates = new Map<string, Partial<Product>>();
    
    registerTemplate(name: string, template: Partial<Product>): void {
        this.templates.set(name, template);
    }
    
    create(config: { template?: string; overrides?: Partial<Product> }): Product {
        const template = config.template 
            ? this.templates.get(config.template) || {}
            : {};
            
        return {
            name: 'Unknown Product',
            category: 'General',
            price: 0,
            ...template,
            ...config.overrides
        };
    }
    
    createMany(configs: Array<{ template?: string; overrides?: Partial<Product> }>): Product[] {
        return configs.map(config => this.create(config));
    }
}

// 依存性注入対応ファクトリー
type Constructor<T = {}> = new (...args: any[]) => T;
type FactoryFunction<T> = (...args: any[]) => T;

class DIFactory<T> {
    private creators = new Map<string, Constructor<T> | FactoryFunction<T>>();
    private singletons = new Map<string, T>();
    
    register<K extends keyof T>(
        key: string, 
        creator: Constructor<T> | FactoryFunction<T>,
        singleton = false
    ): void {
        this.creators.set(key, creator);
        if (!singleton) {
            this.singletons.delete(key);
        }
    }
    
    create<K extends string>(key: K, ...args: any[]): T {
        if (this.singletons.has(key)) {
            return this.singletons.get(key)!;
        }
        
        const creator = this.creators.get(key);
        if (!creator) {
            throw new Error(`No creator registered for key: ${key}`);
        }
        
        const instance = typeof creator === 'function' && creator.prototype
            ? new (creator as Constructor<T>)(...args)
            : (creator as FactoryFunction<T>)(...args);
            
        return instance;
    }
}
```

### 7. Observer パターンの実装

```typescript
// 型安全なObserverパターン
type EventMap = Record<string, any>;

interface Observer<T> {
    update(data: T): void;
}

interface Observable<TEvents extends EventMap> {
    subscribe<K extends keyof TEvents>(
        event: K,
        observer: Observer<TEvents[K]>
    ): () => void;
    
    emit<K extends keyof TEvents>(
        event: K,
        data: TEvents[K]
    ): void;
}

class TypedEventEmitter<TEvents extends EventMap> implements Observable<TEvents> {
    private observers = new Map<keyof TEvents, Set<Observer<any>>>();
    
    subscribe<K extends keyof TEvents>(
        event: K,
        observer: Observer<TEvents[K]>
    ): () => void {
        if (!this.observers.has(event)) {
            this.observers.set(event, new Set());
        }
        
        this.observers.get(event)!.add(observer);
        
        // アンサブスクライブ関数を返す
        return () => {
            this.observers.get(event)?.delete(observer);
        };
    }
    
    emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
        const observers = this.observers.get(event);
        if (observers) {
            observers.forEach(observer => observer.update(data));
        }
    }
    
    removeAllObservers<K extends keyof TEvents>(event?: K): void {
        if (event) {
            this.observers.delete(event);
        } else {
            this.observers.clear();
        }
    }
}

// 使用例：型安全なアプリケーションイベント
interface AppEvents {
    'user:login': { userId: string; timestamp: Date };
    'user:logout': { userId: string; sessionDuration: number };
    'data:update': { collection: string; documentId: string; changes: any };
    'error:occurred': { message: string; stack?: string; severity: 'low' | 'medium' | 'high' };
}

class UserActivityLogger implements Observer<AppEvents['user:login']>, Observer<AppEvents['user:logout']> {
    update(data: AppEvents['user:login'] | AppEvents['user:logout']): void {
        if ('sessionDuration' in data) {
            console.log(`User ${data.userId} logged out after ${data.sessionDuration}ms`);
        } else {
            console.log(`User ${data.userId} logged in at ${data.timestamp}`);
        }
    }
}

const eventBus = new TypedEventEmitter<AppEvents>();
const logger = new UserActivityLogger();

eventBus.subscribe('user:login', logger);
eventBus.subscribe('user:logout', logger);

// 型安全なイベント発火
eventBus.emit('user:login', {
    userId: 'user123',
    timestamp: new Date()
});
```

### 8. 高度な型推論システム

```typescript
// 関数のオーバーロードを利用した高度な型推論
interface Repository<T> {
    findById(id: string): Promise<T | null>;
    findMany(query: Partial<T>): Promise<T[]>;
    create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
    update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T>;
}

// 動的な型推論を持つクエリビルダー
type QueryOperator = '$eq' | '$ne' | '$in' | '$nin' | '$gt' | '$gte' | '$lt' | '$lte';
type QueryValue<T> = T | { [K in QueryOperator]?: T | T[] };
type QuerySelector<T> = {
    [P in keyof T]?: QueryValue<T[P]>;
};

class QueryBuilder<T> {
    private conditions: QuerySelector<T> = {};
    private sortFields: Array<{ field: keyof T; direction: 'asc' | 'desc' }> = [];
    private limitValue?: number;
    private offsetValue?: number;
    
    where<K extends keyof T>(field: K, value: QueryValue<T[K]>): this {
        this.conditions[field] = value;
        return this;
    }
    
    sort<K extends keyof T>(field: K, direction: 'asc' | 'desc' = 'asc'): this {
        this.sortFields.push({ field, direction });
        return this;
    }
    
    limit(count: number): this {
        this.limitValue = count;
        return this;
    }
    
    offset(count: number): this {
        this.offsetValue = count;
        return this;
    }
    
    build(): {
        conditions: QuerySelector<T>;
        sort: Array<{ field: keyof T; direction: 'asc' | 'desc' }>;
        limit?: number;
        offset?: number;
    } {
        return {
            conditions: this.conditions,
            sort: this.sortFields,
            limit: this.limitValue,
            offset: this.offsetValue
        };
    }
}

// 使用例
interface User {
    id: string;
    name: string;
    email: string;
    age: number;
    createdAt: Date;
    updatedAt: Date;
}

const userQuery = new QueryBuilder<User>()
    .where('age', { $gte: 18 })
    .where('email', { $ne: null })
    .sort('name', 'asc')
    .limit(10)
    .offset(0)
    .build();
```

## 実行方法

```bash
npx tsc src/index.ts --outDir dist
node dist/index.js
npm test -- lesson-32
```

## 演習問題

1. 型安全なState Managementシステムの実装
2. 高度なバリデーションライブラリの作成
3. ジェネリクスを活用したORMシステムの設計
4. 関数型プログラミングライブラリの実装
5. 型レベルでの数値計算システムの構築

## まとめ

高度なジェネリクスは、TypeScriptの型システムの力を最大限に活用するための重要な概念です。共変性・反変性を理解し、複雑な制約を適切に設計することで、実行時エラーを防ぎながら柔軟なAPIを作成できます。

次のレッスンでは、条件型を使用してより動的で表現力豊かな型システムを構築する方法を学習します。