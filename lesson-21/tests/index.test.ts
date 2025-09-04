/**
 * Lesson 21: インターフェース - テスト
 */

// 基本的なインターフェースのテスト
interface User {
    id: number;
    name: string;
    email: string;
}

describe('Lesson 21: インターフェース', () => {
    test('基本的なインターフェースの使用', () => {
        const user: User = {
            id: 1,
            name: "Alice",
            email: "alice@example.com"
        };

        expect(user.id).toBe(1);
        expect(user.name).toBe("Alice");
        expect(user.email).toBe("alice@example.com");
    });

    test('オプショナルプロパティとreadonly', () => {
        interface Product {
            readonly id: number;
            name: string;
            price: number;
            description?: string;
        }

        const product: Product = {
            id: 100,
            name: "Test Product",
            price: 1000
        };

        expect(product.id).toBe(100);
        expect(product.name).toBe("Test Product");
        expect(product.price).toBe(1000);
        expect(product.description).toBeUndefined();

        // readonlyプロパティは変更できない（TypeScriptのコンパイル時エラー）
        // product.id = 200; // これはコンパイルエラーになる
    });

    test('メソッドシグネチャ', () => {
        interface Calculator {
            add(a: number, b: number): number;
            subtract: (a: number, b: number) => number;
            multiply?(a: number, b: number): number;
        }

        const calculator: Calculator = {
            add(a: number, b: number): number {
                return a + b;
            },
            subtract: (a: number, b: number) => a - b,
            multiply(a: number, b: number): number {
                return a * b;
            }
        };

        expect(calculator.add(5, 3)).toBe(8);
        expect(calculator.subtract(5, 3)).toBe(2);
        expect(calculator.multiply!(5, 3)).toBe(15);
    });

    test('インターフェースの継承', () => {
        interface Animal {
            name: string;
            age: number;
        }

        interface Dog extends Animal {
            breed: string;
        }

        const dog: Dog = {
            name: "Buddy",
            age: 3,
            breed: "Golden Retriever"
        };

        expect(dog.name).toBe("Buddy");
        expect(dog.age).toBe(3);
        expect(dog.breed).toBe("Golden Retriever");
    });

    test('インデックスシグネチャ', () => {
        interface StringDictionary {
            [key: string]: string;
            length: number;
        }

        const dict: StringDictionary = {
            hello: "こんにちは",
            goodbye: "さようなら",
            length: 2
        };

        expect(dict.hello).toBe("こんにちは");
        expect(dict.goodbye).toBe("さようなら");
        expect(dict.length).toBe(2);
        expect(dict["hello"]).toBe("こんにちは");
    });

    test('コールシグネチャ', () => {
        interface Greeter {
            (name: string): string;
            language: string;
        }

        const createGreeter = (language: string): Greeter => {
            const greeter = ((name: string): string => {
                return language === 'ja' ? `こんにちは、${name}さん！` : `Hello, ${name}!`;
            }) as Greeter;

            greeter.language = language;
            return greeter;
        };

        const jaGreeter = createGreeter('ja');
        const enGreeter = createGreeter('en');

        expect(jaGreeter('Alice')).toBe('こんにちは、Aliceさん！');
        expect(jaGreeter.language).toBe('ja');
        expect(enGreeter('Bob')).toBe('Hello, Bob!');
        expect(enGreeter.language).toBe('en');
    });

    test('クラスでのインターフェース実装', () => {
        interface Flyable {
            fly(): string;
        }

        interface Swimable {
            swim(): string;
        }

        class Duck implements Flyable, Swimable {
            fly(): string {
                return "Duck is flying";
            }

            swim(): string {
                return "Duck is swimming";
            }
        }

        const duck = new Duck();
        expect(duck.fly()).toBe("Duck is flying");
        expect(duck.swim()).toBe("Duck is swimming");
    });

    test('ジェネリックインターフェース', () => {
        interface ApiResponse<T> {
            success: boolean;
            data?: T;
            message: string;
        }

        interface User {
            id: number;
            name: string;
        }

        const userResponse: ApiResponse<User> = {
            success: true,
            data: { id: 1, name: "Alice" },
            message: "Success"
        };

        const errorResponse: ApiResponse<null> = {
            success: false,
            message: "Not Found"
        };

        expect(userResponse.success).toBe(true);
        expect(userResponse.data?.name).toBe("Alice");
        expect(errorResponse.success).toBe(false);
        expect(errorResponse.data).toBeUndefined();
    });

    test('インターフェースの宣言マージ', () => {
        interface Window {
            title: string;
        }

        interface Window {
            version: string;
        }

        // TypeScriptは自動的に上記の2つのインターフェースをマージする
        const window1: Window = {
            title: "My App",
            version: "1.0.0"
        };

        expect(window1.title).toBe("My App");
        expect(window1.version).toBe("1.0.0");
    });

    test('関数インターフェース', () => {
        interface SearchFunction {
            (source: string, subString: string): boolean;
        }

        const mySearch: SearchFunction = function(source: string, subString: string): boolean {
            return source.indexOf(subString) > -1;
        };

        expect(mySearch("Hello World", "World")).toBe(true);
        expect(mySearch("Hello World", "TypeScript")).toBe(false);
    });

    test('ハイブリッド型', () => {
        interface Counter {
            (start: number): string;
            interval: number;
            reset(): void;
        }

        function getCounter(): Counter {
            const counter = (function(start: number) {
                return `Counter: ${start}`;
            }) as Counter;
            
            counter.interval = 123;
            counter.reset = function() {
                // リセット処理
            };
            
            return counter;
        }

        const counter = getCounter();
        expect(counter(10)).toBe("Counter: 10");
        expect(counter.interval).toBe(123);
        expect(typeof counter.reset).toBe('function');
    });

    test('複雑な継承とコンポジション', () => {
        interface Identifiable {
            id: number;
        }

        interface Timestamped {
            createdAt: Date;
            updatedAt: Date;
        }

        interface BaseEntity extends Identifiable, Timestamped {
            isActive: boolean;
        }

        interface BlogPost extends BaseEntity {
            title: string;
            content: string;
        }

        const now = new Date();
        const post: BlogPost = {
            id: 1,
            title: "Test Post",
            content: "This is a test post",
            isActive: true,
            createdAt: now,
            updatedAt: now
        };

        expect(post.id).toBe(1);
        expect(post.title).toBe("Test Post");
        expect(post.isActive).toBe(true);
        expect(post.createdAt).toBeInstanceOf(Date);
    });

    test('条件付きプロパティ', () => {
        interface Config {
            mode: 'development' | 'production';
            debug?: boolean;
        }

        const devConfig: Config = {
            mode: 'development',
            debug: true
        };

        const prodConfig: Config = {
            mode: 'production'
            // debug は省略可能
        };

        expect(devConfig.mode).toBe('development');
        expect(devConfig.debug).toBe(true);
        expect(prodConfig.mode).toBe('production');
        expect(prodConfig.debug).toBeUndefined();
    });

    test('インターフェースとクラスの相互作用', () => {
        interface Shape {
            area(): number;
            perimeter(): number;
        }

        class Rectangle implements Shape {
            constructor(
                private width: number,
                private height: number
            ) {}

            area(): number {
                return this.width * this.height;
            }

            perimeter(): number {
                return 2 * (this.width + this.height);
            }
        }

        class Circle implements Shape {
            constructor(private radius: number) {}

            area(): number {
                return Math.PI * this.radius * this.radius;
            }

            perimeter(): number {
                return 2 * Math.PI * this.radius;
            }
        }

        const rectangle = new Rectangle(4, 5);
        const circle = new Circle(3);

        expect(rectangle.area()).toBe(20);
        expect(rectangle.perimeter()).toBe(18);
        expect(circle.area()).toBeCloseTo(28.27, 2);
        expect(circle.perimeter()).toBeCloseTo(18.85, 2);

        // インターフェースとして扱う
        const shapes: Shape[] = [rectangle, circle];
        expect(shapes.length).toBe(2);
        shapes.forEach(shape => {
            expect(typeof shape.area()).toBe('number');
            expect(typeof shape.perimeter()).toBe('number');
        });
    });
});