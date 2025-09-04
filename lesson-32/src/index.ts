/**
 * Lesson 32: 高度なジェネリクス (Advanced Generics)
 * TypeScriptの高度なジェネリクスシステムの実装
 */

console.log('=== Advanced Generics Demo ===\n');

// 1. 共変性と反変性のデモ
console.log('1. 共変性と反変性 (Covariance and Contravariance):');

interface Animal {
    name: string;
    species: string;
}

interface Dog extends Animal {
    species: 'canine';
    breed: string;
    bark(): void;
}

interface Cat extends Animal {
    species: 'feline';
    meow(): void;
}

// 共変性の例：読み取り専用の配列操作
class AnimalShelter<T extends Animal> {
    private animals: T[] = [];
    
    addAnimal(animal: T): void {
        this.animals.push(animal);
    }
    
    getAnimals(): readonly T[] {
        return this.animals;
    }
    
    // 共変性を利用した型安全な変換
    upcast<U extends Animal>(): AnimalShelter<U> {
        return this as unknown as AnimalShelter<U>;
    }
}

// 反変性の例：コールバック関数の型関係
type AnimalHandler<T extends Animal> = (animal: T) => void;

const handleAnimal: AnimalHandler<Animal> = (animal) => {
    console.log(`  動物: ${animal.name} (${animal.species})`);
};

const handleDog: AnimalHandler<Dog> = handleAnimal; // OK - 反変性により許可

const dogShelter = new AnimalShelter<Dog>();
dogShelter.addAnimal({
    name: "Buddy",
    species: 'canine',
    breed: "Golden Retriever",
    bark: () => console.log("Woof!")
});

const animalShelter = dogShelter.upcast<Animal>(); // 共変性による変換
const animals = animalShelter.getAnimals();
handleDog(animals[0] as Dog);
console.log();

// 2. 高階型関数の実装
console.log('2. 高階型関数とファンクター:');

type Mapper<T, U> = (value: T) => U;
type Filter<T> = (value: T) => boolean;
type Reducer<T, U> = (accumulator: U, current: T) => U;

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
    
    forEach(action: (item: T) => void): void {
        this.items.forEach(action);
    }
    
    toArray(): T[] {
        return [...this.items];
    }
    
    static of<T>(...items: T[]): FunctionalArray<T> {
        return new FunctionalArray(items);
    }
}

const numbers = FunctionalArray.of(1, 2, 3, 4, 5);
const result = numbers
    .filter(n => n % 2 === 0)
    .map(n => n * 2)
    .flatMap(n => [n, n + 1]);

console.log('  元の数値:', numbers.toArray());
console.log('  変換結果:', result.toArray());
console.log();

// 3. 分散型ジェネリクスの実装
console.log('3. 分散型ジェネリクス:');

// プロミスの分散アンラップ
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type DistributeUnwrap<T> = T extends any ? UnwrapPromise<T> : never;

// DeepPartial と DeepRequired の実装
type DeepPartial<T> = T extends object 
    ? T extends Function 
        ? T 
        : { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

type DeepRequired<T> = T extends object
    ? T extends Function
        ? T
        : { [P in keyof T]-?: DeepRequired<T[P]> }
    : T;

interface UserProfile {
    personal?: {
        firstName?: string;
        lastName?: string;
        age?: number;
    };
    preferences?: {
        theme?: 'light' | 'dark';
        notifications?: {
            email?: boolean;
            push?: boolean;
        };
    };
}

function processProfile(profile: DeepPartial<UserProfile>): void {
    console.log('  部分的なプロフィール処理:');
    if (profile.personal?.firstName) {
        console.log(`    名前: ${profile.personal.firstName}`);
    }
    if (profile.preferences?.theme) {
        console.log(`    テーマ: ${profile.preferences.theme}`);
    }
}

function validateProfile(profile: DeepRequired<UserProfile>): boolean {
    console.log('  完全なプロフィール検証:');
    console.log(`    名前: ${profile.personal.firstName} ${profile.personal.lastName}`);
    console.log(`    年齢: ${profile.personal.age}`);
    console.log(`    通知設定: ${profile.preferences.notifications.email ? 'ON' : 'OFF'}`);
    return true;
}

processProfile({
    personal: { firstName: "Alice" },
    preferences: { theme: 'dark' }
});

const completeProfile: DeepRequired<UserProfile> = {
    personal: {
        firstName: "Bob",
        lastName: "Smith",
        age: 30
    },
    preferences: {
        theme: 'light',
        notifications: {
            email: true,
            push: false
        }
    }
};

validateProfile(completeProfile);
console.log();

// 4. Builder パターンの実装
console.log('4. 型安全なBuilderパターン:');

type RequiredFields<T> = {
    [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
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

interface DatabaseConnection {
    host: string;
    port: number;
    database: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    timeout?: number;
}

function createConnection() {
    return new TypeSafeBuilder<DatabaseConnection>();
}

const connection = createConnection()
    .set('host', 'localhost')
    .set('port', 5432)
    .set('database', 'myapp')
    .set('username', 'admin')
    .set('ssl', true)
    .build();

console.log('  データベース接続設定:', {
    host: connection.host,
    port: connection.port,
    database: connection.database,
    hasAuth: !!connection.username,
    ssl: connection.ssl
});
console.log();

// 5. Factory パターンの実装
console.log('5. 型安全なFactoryパターン:');

abstract class Repository<T> {
    protected items: Map<string, T> = new Map();
    
    abstract create(data: Omit<T, 'id'>): T;
    
    findById(id: string): T | undefined {
        return this.items.get(id);
    }
    
    findMany(predicate?: (item: T) => boolean): T[] {
        const items = Array.from(this.items.values());
        return predicate ? items.filter(predicate) : items;
    }
    
    save(item: T & { id: string }): void {
        this.items.set(item.id, item);
    }
}

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
}

class ProductRepository extends Repository<Product> {
    create(data: Omit<Product, 'id'>): Product {
        const product: Product = {
            id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...data
        };
        this.save(product);
        return product;
    }
}

// ジェネリックファクトリー
type Constructor<T = {}> = new (...args: any[]) => T;

class GenericFactory<T> {
    private creators = new Map<string, Constructor<T>>();
    private singletons = new Map<string, T>();
    
    register(key: string, creator: Constructor<T>): void {
        this.creators.set(key, creator);
    }
    
    create<K extends string>(key: K, ...args: any[]): T {
        const creator = this.creators.get(key);
        if (!creator) {
            throw new Error(`No creator registered for key: ${key}`);
        }
        return new creator(...args);
    }
    
    singleton<K extends string>(key: K, ...args: any[]): T {
        if (this.singletons.has(key)) {
            return this.singletons.get(key)!;
        }
        
        const instance = this.create(key, ...args);
        this.singletons.set(key, instance);
        return instance;
    }
}

const repositoryFactory = new GenericFactory<Repository<any>>();
repositoryFactory.register('product', ProductRepository);

const productRepo = repositoryFactory.create('product') as ProductRepository;
const laptop = productRepo.create({
    name: 'MacBook Pro',
    price: 2499.99,
    category: 'Electronics'
});

const smartphone = productRepo.create({
    name: 'iPhone 15',
    price: 999.99,
    category: 'Electronics'
});

console.log('  作成された商品:');
console.log(`    ${laptop.name}: $${laptop.price}`);
console.log(`    ${smartphone.name}: $${smartphone.price}`);
console.log();

// 6. Observer パターンの実装
console.log('6. 型安全なObserverパターン:');

type EventMap = Record<string, any>;

interface Observer<T> {
    update(data: T): void;
}

class TypedEventEmitter<TEvents extends EventMap> {
    private observers = new Map<keyof TEvents, Set<Observer<any>>>();
    
    subscribe<K extends keyof TEvents>(
        event: K,
        observer: Observer<TEvents[K]>
    ): () => void {
        if (!this.observers.has(event)) {
            this.observers.set(event, new Set());
        }
        
        this.observers.get(event)!.add(observer);
        
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
}

interface ShoppingEvents {
    'item:added': { itemId: string; name: string; price: number };
    'item:removed': { itemId: string };
    'cart:checkout': { total: number; itemCount: number };
}

class ShoppingCartLogger implements Observer<ShoppingEvents['item:added']>, 
                                      Observer<ShoppingEvents['item:removed']>,
                                      Observer<ShoppingEvents['cart:checkout']> {
    update(data: ShoppingEvents[keyof ShoppingEvents]): void {
        if ('name' in data && 'price' in data) {
            console.log(`    商品が追加されました: ${data.name} ($${data.price})`);
        } else if ('total' in data) {
            console.log(`    チェックアウト: 合計 $${data.total} (${data.itemCount}点)`);
        } else if ('itemId' in data && !('name' in data)) {
            console.log(`    商品が削除されました: ${data.itemId}`);
        }
    }
}

const shoppingEvents = new TypedEventEmitter<ShoppingEvents>();
const cartLogger = new ShoppingCartLogger();

shoppingEvents.subscribe('item:added', cartLogger);
shoppingEvents.subscribe('item:removed', cartLogger);
shoppingEvents.subscribe('cart:checkout', cartLogger);

console.log('  ショッピングカートイベント:');
shoppingEvents.emit('item:added', { itemId: 'item1', name: 'ノートパソコン', price: 1299.99 });
shoppingEvents.emit('item:added', { itemId: 'item2', name: 'マウス', price: 29.99 });
shoppingEvents.emit('cart:checkout', { total: 1329.98, itemCount: 2 });
console.log();

// 7. 高度なクエリビルダーの実装
console.log('7. 型安全なクエリビルダー:');

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
    
    build() {
        return {
            conditions: this.conditions,
            sort: this.sortFields,
            limit: this.limitValue,
            offset: this.offsetValue
        };
    }
    
    // 実際のクエリ実行のシミュレーション
    execute(data: T[]): T[] {
        let result = [...data];
        
        // 条件フィルタリング
        result = result.filter(item => {
            return Object.entries(this.conditions).every(([field, condition]) => {
                const value = (item as any)[field];
                
                if (typeof condition === 'object' && condition !== null && !Array.isArray(condition)) {
                    return Object.entries(condition).every(([op, condValue]) => {
                        switch (op) {
                            case '$eq': return value === condValue;
                            case '$ne': return value !== condValue;
                            case '$gt': return value > condValue;
                            case '$gte': return value >= condValue;
                            case '$lt': return value < condValue;
                            case '$lte': return value <= condValue;
                            case '$in': return Array.isArray(condValue) && condValue.includes(value);
                            case '$nin': return Array.isArray(condValue) && !condValue.includes(value);
                            default: return true;
                        }
                    });
                } else {
                    return value === condition;
                }
            });
        });
        
        // ソート
        if (this.sortFields.length > 0) {
            result.sort((a, b) => {
                for (const { field, direction } of this.sortFields) {
                    const aVal = (a as any)[field];
                    const bVal = (b as any)[field];
                    
                    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        
        // ページネーション
        if (this.offsetValue !== undefined) {
            result = result.slice(this.offsetValue);
        }
        
        if (this.limitValue !== undefined) {
            result = result.slice(0, this.limitValue);
        }
        
        return result;
    }
}

interface User {
    id: string;
    name: string;
    age: number;
    email: string;
    role: 'admin' | 'user' | 'moderator';
}

const users: User[] = [
    { id: '1', name: 'Alice', age: 25, email: 'alice@example.com', role: 'admin' },
    { id: '2', name: 'Bob', age: 30, email: 'bob@example.com', role: 'user' },
    { id: '3', name: 'Charlie', age: 22, email: 'charlie@example.com', role: 'user' },
    { id: '4', name: 'Diana', age: 28, email: 'diana@example.com', role: 'moderator' },
    { id: '5', name: 'Eve', age: 35, email: 'eve@example.com', role: 'admin' }
];

const adultUsersQuery = new QueryBuilder<User>()
    .where('age', { $gte: 25 })
    .where('role', { $in: ['admin', 'moderator'] })
    .sort('age', 'asc')
    .limit(3);

const adultUsers = adultUsersQuery.execute(users);

console.log('  クエリ結果 (25歳以上のadmin/moderator, 年齢順):');
adultUsers.forEach(user => {
    console.log(`    ${user.name} (${user.age}歳, ${user.role})`);
});

console.log('\n=== Advanced Generics Demo Complete ===');

export {};