/**
 * Lesson 16: オブジェクト型 (Object Types)
 * 
 * このファイルでは、TypeScriptにおけるオブジェクト型の定義と使用方法を学びます。
 * オブジェクト型を使用することで、データの構造を明確に定義できます。
 */

// 1. 基本的なオブジェクト型
function greetUser(user: { name: string; age: number }): string {
    return `Hello, ${user.name}! You are ${user.age} years old.`;
}

// インライン型定義の例
let basicUser: {
    name: string;
    age: number;
    email: string;
} = {
    name: "Alice",
    age: 25,
    email: "alice@example.com"
};

console.log("=== 1. 基本的なオブジェクト型 ===");
console.log(greetUser(basicUser));
console.log("User info:", basicUser);

// 2. インターフェースを使ったオブジェクト型定義
interface User {
    name: string;
    age: number;
    email: string;
    isActive: boolean;
}

interface UserWithOptionals {
    name: string;
    age?: number;        // オプショナル
    email?: string;      // オプショナル
    isActive?: boolean;  // オプショナル
}

function createUserProfile(user: User): string {
    return `Profile: ${user.name} (${user.age}) - ${user.email} - ${user.isActive ? 'Active' : 'Inactive'}`;
}

function createFlexibleProfile(user: UserWithOptionals): string {
    const age = user.age ?? 'unknown';
    const email = user.email ?? 'no email';
    const status = user.isActive ?? false ? 'Active' : 'Inactive';
    return `Profile: ${user.name} (${age}) - ${email} - ${status}`;
}

console.log("\n=== 2. インターフェースを使ったオブジェクト型 ===");

const fullUser: User = {
    name: "Bob",
    age: 30,
    email: "bob@example.com",
    isActive: true
};

const minimalUser: UserWithOptionals = { name: "Charlie" };
const partialUser: UserWithOptionals = {
    name: "Diana",
    age: 28,
    email: "diana@example.com"
};

console.log(createUserProfile(fullUser));
console.log(createFlexibleProfile(minimalUser));
console.log(createFlexibleProfile(partialUser));

// 3. 読み取り専用プロパティ
interface Config {
    readonly apiUrl: string;
    readonly version: string;
    readonly timeout: number;
    retries: number;        // 変更可能
    debug: boolean;         // 変更可能
}

function createConfig(): Config {
    return {
        apiUrl: "https://api.example.com",
        version: "1.0.0",
        timeout: 5000,
        retries: 3,
        debug: false
    };
}

function updateConfig(config: Config, retries?: number, debug?: boolean): Config {
    // 読み取り専用プロパティは変更できない
    // config.apiUrl = "new url";  // エラー
    // config.timeout = 10000;     // エラー
    
    // 変更可能プロパティは更新可能
    if (retries !== undefined) config.retries = retries;
    if (debug !== undefined) config.debug = debug;
    
    return config;
}

console.log("\n=== 3. 読み取り専用プロパティ ===");
const appConfig = createConfig();
console.log("Initial config:", appConfig);

updateConfig(appConfig, 5, true);
console.log("Updated config:", appConfig);

// 4. インデックスシグネチャ
interface StringDictionary {
    [key: string]: string;
}

interface NumberDictionary {
    [index: number]: number;
}

interface MixedDictionary {
    // 固定プロパティ
    name: string;
    id: number;
    // インデックスシグネチャ
    [key: string]: string | number;
}

function processStringDict(dict: StringDictionary): void {
    console.log("Processing string dictionary:");
    for (const key in dict) {
        console.log(`  ${key}: ${dict[key]}`);
    }
}

function processNumberDict(dict: NumberDictionary): number {
    console.log("Processing number dictionary:");
    let sum = 0;
    for (const index in dict) {
        console.log(`  [${index}]: ${dict[index]}`);
        sum += dict[index];
    }
    return sum;
}

console.log("\n=== 4. インデックスシグネチャ ===");

const stringDict: StringDictionary = {
    firstName: "Alice",
    lastName: "Smith",
    city: "Tokyo",
    country: "Japan"
};

const numberDict: NumberDictionary = {
    0: 10,
    1: 20,
    2: 30,
    3: 40
};

const mixedDict: MixedDictionary = {
    name: "Product A",
    id: 12345,
    category: "Electronics",
    price: 999,
    description: "High-quality product"
};

processStringDict(stringDict);
const sum = processNumberDict(numberDict);
console.log(`Sum: ${sum}`);

console.log("Mixed dictionary:", mixedDict);

// 5. ネストしたオブジェクト型
interface Address {
    street: string;
    city: string;
    country: string;
    zipCode?: string;
}

interface Contact {
    email?: string;
    phone?: string;
    social?: {
        twitter?: string;
        linkedin?: string;
    };
}

interface Person {
    name: string;
    age: number;
    address: Address;
    contact?: Contact;
    hobbies: string[];
}

function createPersonSummary(person: Person): string {
    const location = `${person.address.city}, ${person.address.country}`;
    const contactInfo = person.contact?.email ? `Email: ${person.contact.email}` : 'No email';
    const hobbies = person.hobbies.length > 0 ? person.hobbies.join(', ') : 'No hobbies';
    
    return `${person.name} (${person.age}) lives in ${location}. ${contactInfo}. Hobbies: ${hobbies}`;
}

function updatePersonContact(person: Person, contact: Partial<Contact>): void {
    if (!person.contact) {
        person.contact = {};
    }
    
    if (contact.email !== undefined) person.contact.email = contact.email;
    if (contact.phone !== undefined) person.contact.phone = contact.phone;
    
    if (contact.social) {
        if (!person.contact.social) person.contact.social = {};
        if (contact.social.twitter !== undefined) {
            person.contact.social.twitter = contact.social.twitter;
        }
        if (contact.social.linkedin !== undefined) {
            person.contact.social.linkedin = contact.social.linkedin;
        }
    }
}

console.log("\n=== 5. ネストしたオブジェクト型 ===");

const person: Person = {
    name: "Elena Rodriguez",
    age: 32,
    address: {
        street: "123 Main St",
        city: "Madrid",
        country: "Spain",
        zipCode: "28001"
    },
    contact: {
        email: "elena@example.com"
    },
    hobbies: ["photography", "traveling", "cooking"]
};

console.log(createPersonSummary(person));

updatePersonContact(person, {
    phone: "+34-123-456-789",
    social: {
        twitter: "@elena_photo",
        linkedin: "elena-rodriguez"
    }
});

console.log("Updated person:", JSON.stringify(person, null, 2));

// 6. オブジェクト型の配列
interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}

function processProducts(products: Product[]): {
    totalValue: number;
    inStock: number;
    outOfStock: number;
    averagePrice: number;
} {
    const totalValue = products.reduce((sum, product) => {
        return product.inStock ? sum + product.price : sum;
    }, 0);
    
    const inStock = products.filter(p => p.inStock).length;
    const outOfStock = products.filter(p => !p.inStock).length;
    const averagePrice = products.length > 0 
        ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
        : 0;
    
    return { totalValue, inStock, outOfStock, averagePrice };
}

function findProductsByCategory(products: Product[], category: string): Product[] {
    return products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
    );
}

console.log("\n=== 6. オブジェクト型の配列 ===");

const products: Product[] = [
    { id: 1, name: "Laptop", price: 999, category: "Electronics", inStock: true },
    { id: 2, name: "Mouse", price: 25, category: "Electronics", inStock: true },
    { id: 3, name: "Book", price: 15, category: "Books", inStock: false },
    { id: 4, name: "Chair", price: 150, category: "Furniture", inStock: true },
    { id: 5, name: "Desk", price: 300, category: "Furniture", inStock: false }
];

const stats = processProducts(products);
console.log("Product statistics:", stats);

const electronics = findProductsByCategory(products, "Electronics");
console.log("Electronics products:", electronics.map(p => p.name));

// 7. 複雑なオブジェクト型の操作
interface Order {
    id: string;
    customerId: string;
    items: {
        productId: number;
        quantity: number;
        unitPrice: number;
    }[];
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    createdAt: Date;
    shippingAddress?: Address;
}

function calculateOrderTotal(order: Order): number {
    return order.items.reduce((total, item) => {
        return total + (item.quantity * item.unitPrice);
    }, 0);
}

function getOrderSummary(order: Order): string {
    const total = calculateOrderTotal(order);
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const shippingInfo = order.shippingAddress 
        ? `Shipping to: ${order.shippingAddress.city}, ${order.shippingAddress.country}`
        : "No shipping address";
    
    return `Order ${order.id}: ${itemCount} items, Total: $${total.toFixed(2)}, Status: ${order.status}. ${shippingInfo}`;
}

console.log("\n=== 7. 複雑なオブジェクト型の操作 ===");

const order: Order = {
    id: "ORD-2023-001",
    customerId: "CUST-123",
    items: [
        { productId: 1, quantity: 1, unitPrice: 999 },
        { productId: 2, quantity: 2, unitPrice: 25 }
    ],
    status: "processing",
    createdAt: new Date("2023-01-15"),
    shippingAddress: {
        street: "456 Oak Ave",
        city: "Tokyo",
        country: "Japan",
        zipCode: "100-0001"
    }
};

console.log(getOrderSummary(order));