/**
 * Lesson 21: インターフェース (Interfaces)
 * TypeScriptにおけるインターフェースの基本から応用まで
 */

console.log("=== Lesson 21: インターフェース (Interfaces) ===");

// 1. 基本的なインターフェース
console.log("\n1. 基本的なインターフェース");

interface User {
    id: number;
    name: string;
    email: string;
}

const user1: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};

console.log("User:", user1);

// 2. オプショナルプロパティとreadonly
console.log("\n2. オプショナルプロパティとreadonly");

interface Product {
    readonly id: number;
    name: string;
    price: number;
    description?: string;
    tags?: string[];
    readonly createdAt: Date;
}

const product1: Product = {
    id: 100,
    name: "TypeScript Guide Book",
    price: 2980,
    description: "Learn TypeScript from basics to advanced",
    tags: ["programming", "typescript", "javascript"],
    createdAt: new Date()
};

const product2: Product = {
    id: 101,
    name: "JavaScript Essentials",
    price: 1980,
    createdAt: new Date()
    // description と tags は省略可能
};

console.log("Product 1:", product1);
console.log("Product 2:", product2);

// product1.id = 999; // エラー: Cannot assign to 'id' because it is a read-only property.
// product1.createdAt = new Date(); // エラー: Cannot assign to 'createdAt' because it is a read-only property.

// 3. メソッドシグネチャ
console.log("\n3. メソッドシグネチャ");

interface Calculator {
    // メソッドシグネチャの記述方法1: メソッド構文
    add(a: number, b: number): number;
    
    // メソッドシグネチャの記述方法2: プロパティ構文
    subtract: (a: number, b: number) => number;
    
    // オプショナルメソッド
    multiply?(a: number, b: number): number;
    
    // プロパティも持てる
    brand: string;
}

const calculator: Calculator = {
    brand: "ScientificCalc",
    
    add(a: number, b: number): number {
        console.log(`${a} + ${b} = ${a + b}`);
        return a + b;
    },
    
    subtract: (a: number, b: number) => {
        console.log(`${a} - ${b} = ${a - b}`);
        return a - b;
    },
    
    multiply(a: number, b: number): number {
        console.log(`${a} × ${b} = ${a * b}`);
        return a * b;
    }
};

calculator.add(10, 5);
calculator.subtract(10, 5);
calculator.multiply!(8, 3); // オプショナルメソッドの呼び出し

// 4. コールシグネチャとインデックスシグネチャ
console.log("\n4. コールシグネチャとインデックスシグネチャ");

// コールシグネチャ：関数として呼び出し可能
interface Greeter {
    (name: string): string;
    language: string;
    setLanguage(lang: string): void;
}

const createGreeter = (language: string): Greeter => {
    const greeter = ((name: string): string => {
        const greetings: { [key: string]: string } = {
            ja: `こんにちは、${name}さん！`,
            en: `Hello, ${name}!`,
            fr: `Bonjour, ${name}!`
        };
        return greetings[greeter.language] || greetings.en;
    }) as Greeter;

    greeter.language = language;
    greeter.setLanguage = (lang: string) => {
        greeter.language = lang;
    };

    return greeter;
};

const greeter = createGreeter("ja");
console.log(greeter("Alice"));
greeter.setLanguage("en");
console.log(greeter("Bob"));

// インデックスシグネチャ
interface StringDictionary {
    [key: string]: string;
    length: number; // 明示的なプロパティも定義可能
}

const dictionary: StringDictionary = {
    hello: "こんにちは",
    goodbye: "さようなら",
    thank_you: "ありがとう",
    length: 3
};

console.log("Dictionary:", dictionary);
console.log("hello in Japanese:", dictionary.hello);
console.log("Dictionary length:", dictionary.length);

// 5. インターフェースの継承
console.log("\n5. インターフェースの継承");

interface Animal {
    name: string;
    age: number;
    makeSound(): void;
}

interface Mammal extends Animal {
    furColor: string;
    nurse(): void;
}

interface Dog extends Mammal {
    breed: string;
    bark(): void;
}

interface Cat extends Mammal {
    breed: string;
    meow(): void;
}

// 複数のインターフェースを継承
interface ServiceDog extends Dog {
    serviceType: string;
    assist(): void;
}

const myDog: ServiceDog = {
    name: "Buddy",
    age: 3,
    furColor: "golden",
    breed: "Golden Retriever",
    serviceType: "Guide Dog",
    
    makeSound() {
        console.log(`${this.name} makes some sound`);
    },
    
    nurse() {
        console.log(`${this.name} is nursing puppies`);
    },
    
    bark() {
        console.log(`${this.name}: Woof! Woof!`);
    },
    
    assist() {
        console.log(`${this.name} is assisting as a ${this.serviceType}`);
    }
};

myDog.makeSound();
myDog.bark();
myDog.assist();

// 6. インターフェースの宣言マージ
console.log("\n6. インターフェースの宣言マージ");

interface Window {
    title: string;
}

interface Window {
    version: string;
}

// 上記の2つのインターフェースは自動的にマージされる
const window1: Window = {
    title: "My Application",
    version: "1.0.0"
};

console.log("Window:", window1);

// 7. 関数インターフェース
console.log("\n7. 関数インターフェース");

interface SearchFunction {
    (source: string, subString: string): boolean;
}

const mySearch: SearchFunction = function(source: string, subString: string): boolean {
    const result = source.search(subString);
    return result > -1;
};

console.log("Search 'TypeScript' in 'Learning TypeScript is fun':", 
           mySearch("Learning TypeScript is fun", "TypeScript"));

// 8. ハイブリッド型（関数でありオブジェクトでもある）
console.log("\n8. ハイブリッド型");

interface Counter {
    (start: number): string;
    interval: number;
    reset(): void;
}

function getCounter(): Counter {
    const counter = (function(start: number) {
        return `Counter started at ${start}`;
    }) as Counter;
    
    counter.interval = 123;
    counter.reset = function() {
        console.log("Counter reset");
    };
    
    return counter;
}

const counter = getCounter();
console.log(counter(10));
counter.reset();
console.log("Interval:", counter.interval);

// 9. 実践例：APIレスポンスの型定義
console.log("\n9. 実践例：APIレスポンスの型定義");

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    timestamp: string;
}

interface UserProfile {
    id: number;
    username: string;
    email: string;
    profile: {
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    settings: {
        theme: 'light' | 'dark';
        notifications: boolean;
    };
}

// APIレスポンスをシミュレート
const userApiResponse: ApiResponse<UserProfile> = {
    success: true,
    message: "User data retrieved successfully",
    data: {
        id: 1,
        username: "alice_dev",
        email: "alice@example.com",
        profile: {
            firstName: "Alice",
            lastName: "Johnson",
            avatar: "https://example.com/avatars/alice.jpg"
        },
        settings: {
            theme: 'dark',
            notifications: true
        }
    },
    timestamp: new Date().toISOString()
};

console.log("API Response:", userApiResponse);

if (userApiResponse.success && userApiResponse.data) {
    const user = userApiResponse.data;
    console.log(`Welcome, ${user.profile.firstName} ${user.profile.lastName}!`);
    console.log(`Theme: ${user.settings.theme}, Notifications: ${user.settings.notifications}`);
}

// 10. インターフェースでのconstraints実装
console.log("\n10. インターフェースでのconstraints実装");

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
    author: User;
    tags: string[];
}

const blogPost: BlogPost = {
    id: 1,
    title: "Understanding TypeScript Interfaces",
    content: "Interfaces are a powerful feature in TypeScript...",
    author: user1,
    tags: ["typescript", "programming", "tutorial"],
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
};

console.log("Blog Post:", {
    title: blogPost.title,
    author: blogPost.author.name,
    tags: blogPost.tags,
    isActive: blogPost.isActive
});

console.log("\n=== インターフェースの学習完了！ ===");