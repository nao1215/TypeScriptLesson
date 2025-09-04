/**
 * Lesson 32 テスト: 高度なジェネリクス (Advanced Generics)
 */

describe('Lesson 32: 高度なジェネリクス (Advanced Generics)', () => {
    describe('共変性と反変性', () => {
        interface Animal {
            name: string;
            species: string;
        }

        interface Dog extends Animal {
            species: 'canine';
            breed: string;
        }

        test('配列の共変性が正しく動作する', () => {
            const dogs: Dog[] = [{
                name: "Buddy",
                species: 'canine',
                breed: "Golden Retriever"
            }];
            
            // 共変性により、Dog[]をAnimal[]として扱える
            const animals: Animal[] = dogs;
            
            expect(animals[0].name).toBe("Buddy");
            expect(animals[0].species).toBe('canine');
        });

        test('関数の反変性が正しく動作する', () => {
            type AnimalHandler<T extends Animal> = (animal: T) => void;
            
            let callLog: string[] = [];
            
            const handleAnimal: AnimalHandler<Animal> = (animal) => {
                callLog.push(`Handled: ${animal.name}`);
            };
            
            const handleDog: AnimalHandler<Dog> = handleAnimal;
            
            handleDog({
                name: "Rex",
                species: 'canine',
                breed: "German Shepherd"
            });
            
            expect(callLog).toContain("Handled: Rex");
        });
    });

    describe('関数型配列操作', () => {
        class FunctionalArray<T> {
            constructor(private items: T[]) {}
            
            map<U>(mapper: (value: T) => U): FunctionalArray<U> {
                return new FunctionalArray(this.items.map(mapper));
            }
            
            filter(predicate: (value: T) => boolean): FunctionalArray<T> {
                return new FunctionalArray(this.items.filter(predicate));
            }
            
            reduce<U>(reducer: (acc: U, cur: T) => U, initial: U): U {
                return this.items.reduce(reducer, initial);
            }
            
            toArray(): T[] {
                return [...this.items];
            }
            
            static of<T>(...items: T[]): FunctionalArray<T> {
                return new FunctionalArray(items);
            }
        }

        test('チェーン操作が正しく動作する', () => {
            const result = FunctionalArray.of(1, 2, 3, 4, 5)
                .filter(n => n % 2 === 0)
                .map(n => n * 2)
                .reduce((acc, cur) => acc + cur, 0);
                
            expect(result).toBe(12); // (2 * 2) + (4 * 2) = 4 + 8 = 12
        });
    });

    describe('分散型ジェネリクス', () => {
        type DeepPartial<T> = T extends object 
            ? T extends Function 
                ? T 
                : { [P in keyof T]?: DeepPartial<T[P]> }
            : T;

        interface ComplexObject {
            user: {
                name: string;
                email: string;
                profile: {
                    age: number;
                    preferences: {
                        theme: 'light' | 'dark';
                    };
                };
            };
        }

        test('DeepPartial が正しく動作する', () => {
            const partial: DeepPartial<ComplexObject> = {
                user: {
                    name: "Alice",
                    profile: {
                        preferences: {
                            theme: 'dark'
                        }
                    }
                }
            };

            expect(partial.user?.name).toBe("Alice");
            expect(partial.user?.profile?.preferences?.theme).toBe('dark');
        });
    });

    describe('Builder パターン', () => {
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
        }

        interface Config {
            host: string;
            port: number;
            database?: string;
            ssl?: boolean;
        }

        function createConfig() {
            return new TypeSafeBuilder<Config>();
        }

        test('Builder パターンが型安全に動作する', () => {
            const config = createConfig()
                .set('host', 'localhost')
                .set('port', 5432)
                .set('ssl', true)
                .build();

            expect(config.host).toBe('localhost');
            expect(config.port).toBe(5432);
            expect(config.ssl).toBe(true);
        });
    });

    describe('Observer パターン', () => {
        interface Observer<T> {
            update(data: T): void;
        }

        class TypedEventEmitter<TEvents extends Record<string, any>> {
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

        interface TestEvents {
            'test:event': { message: string; count: number };
        }

        test('型安全なイベントエミッターが正しく動作する', () => {
            const emitter = new TypedEventEmitter<TestEvents>();
            const received: Array<{ message: string; count: number }> = [];
            
            const observer: Observer<TestEvents['test:event']> = {
                update: (data) => received.push(data)
            };
            
            const unsubscribe = emitter.subscribe('test:event', observer);
            
            emitter.emit('test:event', { message: 'hello', count: 1 });
            emitter.emit('test:event', { message: 'world', count: 2 });
            
            expect(received).toHaveLength(2);
            expect(received[0]).toEqual({ message: 'hello', count: 1 });
            expect(received[1]).toEqual({ message: 'world', count: 2 });
            
            unsubscribe();
            emitter.emit('test:event', { message: 'after unsubscribe', count: 3 });
            
            expect(received).toHaveLength(2); // 変化なし
        });
    });

    describe('クエリビルダー', () => {
        type QueryOperator = '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$in';
        type QueryValue<T> = T | { [K in QueryOperator]?: T | T[] };
        type QuerySelector<T> = {
            [P in keyof T]?: QueryValue<T[P]>;
        };

        class QueryBuilder<T> {
            private conditions: QuerySelector<T> = {};
            
            where<K extends keyof T>(field: K, value: QueryValue<T[K]>): this {
                this.conditions[field] = value;
                return this;
            }
            
            execute(data: T[]): T[] {
                return data.filter(item => {
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
                                    default: return true;
                                }
                            });
                        } else {
                            return value === condition;
                        }
                    });
                });
            }
        }

        interface User {
            id: number;
            name: string;
            age: number;
            role: 'admin' | 'user';
        }

        test('型安全なクエリビルダーが正しく動作する', () => {
            const users: User[] = [
                { id: 1, name: 'Alice', age: 25, role: 'admin' },
                { id: 2, name: 'Bob', age: 30, role: 'user' },
                { id: 3, name: 'Charlie', age: 22, role: 'user' }
            ];

            const result = new QueryBuilder<User>()
                .where('age', { $gte: 25 })
                .where('role', 'admin')
                .execute(users);

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Alice');
        });
    });

    describe('ジェネリックファクトリー', () => {
        abstract class Repository<T> {
            protected items = new Map<string, T>();
            
            abstract create(data: Omit<T, 'id'>): T;
            
            findById(id: string): T | undefined {
                return this.items.get(id);
            }
            
            save(item: T & { id: string }): void {
                this.items.set(item.id, item);
            }
        }

        interface Product {
            id: string;
            name: string;
            price: number;
        }

        class ProductRepository extends Repository<Product> {
            create(data: Omit<Product, 'id'>): Product {
                const product: Product = {
                    id: `prod_${Date.now()}`,
                    ...data
                };
                this.save(product);
                return product;
            }
        }

        type Constructor<T = {}> = new (...args: any[]) => T;

        class GenericFactory<T> {
            private creators = new Map<string, Constructor<T>>();
            
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
        }

        test('ジェネリックファクトリーが正しく動作する', () => {
            const factory = new GenericFactory<Repository<any>>();
            factory.register('product', ProductRepository);
            
            const productRepo = factory.create('product') as ProductRepository;
            const product = productRepo.create({
                name: 'Test Product',
                price: 99.99
            });
            
            expect(product.name).toBe('Test Product');
            expect(product.price).toBe(99.99);
            expect(product.id).toMatch(/^prod_\d+$/);
            
            const foundProduct = productRepo.findById(product.id);
            expect(foundProduct).toEqual(product);
        });
    });
});

export {};