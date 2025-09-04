// Lesson 25: 抽象クラス (Abstract Classes)

console.log("=== Lesson 25: 抽象クラス (Abstract Classes) ===\n");

// 1. 抽象クラスの基本
console.log("1. 抽象クラスの基本");

abstract class Shape {
    protected color: string;
    
    constructor(color: string) {
        this.color = color;
    }
    
    // 抽象メソッド - 子クラスで必ず実装が必要
    abstract calculateArea(): number;
    abstract calculatePerimeter(): number;
    
    // 具象メソッド - 共通の実装
    public getColor(): string {
        return this.color;
    }
    
    public displayInfo(): void {
        console.log(`Shape: ${this.color}`);
        console.log(`Area: ${this.calculateArea().toFixed(2)}`);
        console.log(`Perimeter: ${this.calculatePerimeter().toFixed(2)}`);
    }
}

class Circle extends Shape {
    private radius: number;
    
    constructor(color: string, radius: number) {
        super(color);
        this.radius = radius;
    }
    
    calculateArea(): number {
        return Math.PI * this.radius * this.radius;
    }
    
    calculatePerimeter(): number {
        return 2 * Math.PI * this.radius;
    }
    
    public getRadius(): number {
        return this.radius;
    }
}

class Rectangle extends Shape {
    constructor(
        color: string,
        private width: number,
        private height: number
    ) {
        super(color);
    }
    
    calculateArea(): number {
        return this.width * this.height;
    }
    
    calculatePerimeter(): number {
        return 2 * (this.width + this.height);
    }
    
    public getDimensions(): {width: number, height: number} {
        return {width: this.width, height: this.height};
    }
}

// 使用例
const circle = new Circle("blue", 5);
const rectangle = new Rectangle("red", 4, 6);

console.log("Circle info:");
circle.displayInfo();
console.log(`Radius: ${circle.getRadius()}\n`);

console.log("Rectangle info:");
rectangle.displayInfo();
console.log(`Dimensions: ${rectangle.getDimensions().width} x ${rectangle.getDimensions().height}\n`);

console.log();

// 2. 抽象プロパティ
console.log("2. 抽象プロパティ");

abstract class Animal {
    // 抽象プロパティ
    abstract readonly species: string;
    abstract weight: number;
    
    constructor(
        protected name: string,
        protected age: number
    ) {}
    
    // 抽象メソッド
    abstract makeSound(): void;
    abstract move(): void;
    
    // 具象メソッド
    public introduce(): void {
        console.log(`I'm ${this.name}, a ${this.species}`);
        console.log(`Age: ${this.age}, Weight: ${this.weight}kg`);
    }
    
    public getInfo(): object {
        return {
            name: this.name,
            species: this.species,
            age: this.age,
            weight: this.weight
        };
    }
}

class Dog extends Animal {
    readonly species = "Canis lupus";
    weight: number;
    
    constructor(name: string, age: number, weight: number, private breed: string) {
        super(name, age);
        this.weight = weight;
    }
    
    makeSound(): void {
        console.log(`${this.name} barks: Woof! Woof!`);
    }
    
    move(): void {
        console.log(`${this.name} runs on four legs`);
    }
    
    public getBreed(): string {
        return this.breed;
    }
}

class Bird extends Animal {
    readonly species = "Aves";
    weight: number;
    
    constructor(name: string, age: number, weight: number, private wingspan: number) {
        super(name, age);
        this.weight = weight;
    }
    
    makeSound(): void {
        console.log(`${this.name} chirps: Tweet! Tweet!`);
    }
    
    move(): void {
        console.log(`${this.name} flies with ${this.wingspan}cm wingspan`);
    }
    
    public getWingspan(): number {
        return this.wingspan;
    }
}

const dog = new Dog("Buddy", 3, 25, "Golden Retriever");
const bird = new Bird("Tweety", 1, 0.5, 15);

console.log("Dog:");
dog.introduce();
dog.makeSound();
dog.move();
console.log(`Breed: ${dog.getBreed()}\n`);

console.log("Bird:");
bird.introduce();
bird.makeSound();
bird.move();
console.log(`Wingspan: ${bird.getWingspan()}cm\n`);

console.log();

// 3. 複雑な抽象クラス設計
console.log("3. 複雑な抽象クラス設計 - データベース接続");

abstract class DatabaseConnection {
    protected connectionString: string;
    protected isConnected: boolean = false;
    
    constructor(connectionString: string) {
        this.connectionString = connectionString;
    }
    
    // 抽象メソッド
    abstract connect(): Promise<boolean>;
    abstract disconnect(): Promise<void>;
    abstract executeQuery(query: string): Promise<any>;
    abstract executeTransaction(queries: string[]): Promise<any>;
    
    // 具象メソッド - 共通のロジック
    public async safeExecute<T>(operation: () => Promise<T>): Promise<T | null> {
        if (!this.isConnected) {
            await this.connect();
        }
        
        try {
            return await operation();
        } catch (error) {
            console.error('Database operation failed:', error);
            return null;
        }
    }
    
    public getConnectionStatus(): {isConnected: boolean, connectionString: string} {
        return {
            isConnected: this.isConnected,
            connectionString: this.connectionString.replace(/password=[^;]+/i, 'password=***')
        };
    }
    
    // Template Method パターン
    public async performHealthCheck(): Promise<boolean> {
        try {
            await this.connect();
            const result = await this.executeQuery(this.getHealthCheckQuery());
            return result !== null;
        } catch {
            return false;
        } finally {
            await this.disconnect();
        }
    }
    
    protected getHealthCheckQuery(): string {
        return "SELECT 1";
    }
}

class PostgreSQLConnection extends DatabaseConnection {
    async connect(): Promise<boolean> {
        console.log(`Connecting to PostgreSQL: ${this.connectionString}`);
        // PostgreSQL固有の接続ロジック（シミュレーション）
        await new Promise(resolve => setTimeout(resolve, 100));
        this.isConnected = true;
        console.log("PostgreSQL connection established");
        return true;
    }
    
    async disconnect(): Promise<void> {
        console.log("Disconnecting from PostgreSQL");
        this.isConnected = false;
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    async executeQuery(query: string): Promise<any> {
        if (!this.isConnected) throw new Error("Not connected");
        console.log(`Executing PostgreSQL query: ${query}`);
        await new Promise(resolve => setTimeout(resolve, 50));
        return {rows: [`Result for: ${query}`], rowCount: 1};
    }
    
    async executeTransaction(queries: string[]): Promise<any> {
        console.log("Starting PostgreSQL transaction");
        const results = [];
        for (const query of queries) {
            results.push(await this.executeQuery(query));
        }
        console.log("Committing PostgreSQL transaction");
        return results;
    }
    
    protected getHealthCheckQuery(): string {
        return "SELECT version()";
    }
}

class MongoConnection extends DatabaseConnection {
    async connect(): Promise<boolean> {
        console.log(`Connecting to MongoDB: ${this.connectionString}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        this.isConnected = true;
        console.log("MongoDB connection established");
        return true;
    }
    
    async disconnect(): Promise<void> {
        console.log("Disconnecting from MongoDB");
        this.isConnected = false;
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    async executeQuery(query: string): Promise<any> {
        if (!this.isConnected) throw new Error("Not connected");
        console.log(`Executing MongoDB query: ${query}`);
        await new Promise(resolve => setTimeout(resolve, 50));
        return {documents: [`Result for: ${query}`], acknowledged: true};
    }
    
    async executeTransaction(queries: string[]): Promise<any> {
        console.log("Starting MongoDB transaction session");
        const results = [];
        for (const query of queries) {
            results.push(await this.executeQuery(query));
        }
        console.log("Committing MongoDB transaction");
        return results;
    }
    
    protected getHealthCheckQuery(): string {
        return "{ping: 1}";
    }
}

// データベース接続のデモ
async function databaseDemo(): Promise<void> {
    const postgres = new PostgreSQLConnection("host=localhost;db=testdb;user=admin;password=secret");
    const mongo = new MongoConnection("mongodb://admin:secret@localhost:27017/testdb");
    
    console.log("PostgreSQL Status:", postgres.getConnectionStatus());
    
    // PostgreSQL デモ
    const pgResult = await postgres.safeExecute(async () => {
        return await postgres.executeQuery("SELECT * FROM users");
    });
    console.log("PostgreSQL Result:", pgResult);
    
    // MongoDB デモ
    console.log("\nMongoDB Status:", mongo.getConnectionStatus());
    const mongoResult = await mongo.safeExecute(async () => {
        return await mongo.executeQuery("db.users.find()");
    });
    console.log("MongoDB Result:", mongoResult);
    
    // ヘルスチェック
    console.log("\nHealth Checks:");
    console.log("PostgreSQL Health:", await postgres.performHealthCheck());
    console.log("MongoDB Health:", await mongo.performHealthCheck());
}

await databaseDemo();
console.log();

// 4. 抽象クラス vs インターフェース
console.log("4. 抽象クラス vs インターフェース");

// インターフェース定義
interface Flyable {
    fly(): void;
    altitude: number;
}

interface Swimable {
    swim(): void;
    depth: number;
}

abstract class Creature {
    constructor(
        protected name: string,
        protected energy: number
    ) {}
    
    abstract move(): void;
    
    // 共通の実装
    public rest(): void {
        this.energy += 10;
        console.log(`${this.name} is resting. Energy: ${this.energy}`);
    }
    
    protected consumeEnergy(amount: number): boolean {
        if (this.energy >= amount) {
            this.energy -= amount;
            return true;
        }
        console.log(`${this.name} is too tired (energy: ${this.energy})`);
        return false;
    }
    
    public getEnergy(): number {
        return this.energy;
    }
}

class Duck extends Creature implements Flyable, Swimable {
    altitude: number = 0;
    depth: number = 0;
    
    move(): void {
        console.log(`${this.name} waddles on land`);
    }
    
    fly(): void {
        if (this.consumeEnergy(5)) {
            this.altitude = 100;
            console.log(`${this.name} flies at ${this.altitude}m altitude`);
        }
    }
    
    swim(): void {
        if (this.consumeEnergy(3)) {
            this.depth = 2;
            console.log(`${this.name} swims at ${this.depth}m depth`);
        }
    }
}

class Fish extends Creature implements Swimable {
    depth: number = 0;
    
    move(): void {
        this.swim();
    }
    
    swim(): void {
        if (this.consumeEnergy(2)) {
            this.depth = 10;
            console.log(`${this.name} swims at ${this.depth}m depth`);
        }
    }
}

const duck = new Duck("Donald", 20);
const fish = new Fish("Nemo", 15);

console.log("Duck activities:");
duck.move();
duck.fly();
duck.swim();
duck.rest();
console.log();

console.log("Fish activities:");
fish.move();
fish.move(); // Uses swim through move()
fish.rest();
console.log();

// 5. Template Method パターンの実例
console.log("5. Template Method パターン");

abstract class DataProcessor {
    // Template Method
    public async processData(data: any[]): Promise<any[]> {
        console.log("Starting data processing...");
        
        const validated = this.validateData(data);
        console.log(`Validated ${validated.length} items from ${data.length} total`);
        
        const processed = await this.transformData(validated);
        console.log("Data transformation completed");
        
        const result = this.formatOutput(processed);
        console.log("Output formatting completed");
        
        console.log("Data processing completed");
        return result;
    }
    
    // 具象メソッド（共通処理）
    protected validateData(data: any[]): any[] {
        return data.filter(item => item !== null && item !== undefined);
    }
    
    // 抽象メソッド（サブクラスで実装）
    protected abstract transformData(data: any[]): Promise<any[]>;
    protected abstract formatOutput(data: any[]): any[];
}

class UserDataProcessor extends DataProcessor {
    protected async transformData(data: any[]): Promise<any[]> {
        // ユーザーデータの変換処理をシミュレート
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return data.map(user => ({
            id: user.id,
            name: user.name?.toUpperCase() || 'UNKNOWN',
            email: user.email?.toLowerCase() || 'no-email',
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date()
        }));
    }
    
    protected formatOutput(data: any[]): any[] {
        return data.map(user => ({
            ...user,
            displayName: `${user.name} (${user.email})`,
            lastLoginFormatted: user.lastLogin.toLocaleDateString()
        }));
    }
}

class ProductDataProcessor extends DataProcessor {
    protected async transformData(data: any[]): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return data.map(product => ({
            ...product,
            price: parseFloat(product.price) || 0,
            inStock: (product.inventory || 0) > 0
        }));
    }
    
    protected formatOutput(data: any[]): any[] {
        return data.map(product => ({
            id: product.id,
            name: product.name,
            price: `$${product.price.toFixed(2)}`,
            availability: product.inStock ? "In Stock" : "Out of Stock"
        }));
    }
}

// Template Method パターンのデモ
async function templateMethodDemo(): Promise<void> {
    const userProcessor = new UserDataProcessor();
    const productProcessor = new ProductDataProcessor();
    
    const userData = [
        {id: 1, name: 'john doe', email: 'JOHN@EXAMPLE.COM', lastLogin: '2024-01-01'},
        {id: 2, name: 'jane smith', email: 'JANE@EXAMPLE.COM'},
        null, // 無効なデータ
        {id: 3, name: 'bob wilson', email: 'BOB@EXAMPLE.COM', lastLogin: '2024-01-15'}
    ];
    
    console.log("Processing user data:");
    const processedUsers = await userProcessor.processData(userData);
    console.log("Processed users:", processedUsers);
    console.log();
    
    const productData = [
        {id: 1, name: 'Laptop', price: '999.99', inventory: 5},
        {id: 2, name: 'Mouse', price: '29.99', inventory: 0},
        undefined, // 無効なデータ
        {id: 3, name: 'Keyboard', price: '79.99', inventory: 10}
    ];
    
    console.log("Processing product data:");
    const processedProducts = await productProcessor.processData(productData);
    console.log("Processed products:", processedProducts);
}

await templateMethodDemo();
console.log();

console.log("=== Lesson 25 Complete! ===");