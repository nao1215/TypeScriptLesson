# Lesson 25: 抽象クラス (Abstract Classes)

## 学習目標
このレッスンでは、TypeScriptにおける抽象クラスについて学びます。

- abstract キーワードによる抽象クラスの宣言
- 抽象メソッドと抽象プロパティの定義
- 抽象クラス内の具象実装との組み合わせ
- 抽象クラスとインターフェースの使い分け
- 実践的な設計パターンでの活用

## 内容

### 1. 抽象クラスの基本

抽象クラスは、直接インスタンス化できないクラスです。他のクラスの基底クラスとして使用され、共通の構造と部分的な実装を提供します。

```typescript
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
        console.log(`Area: ${this.calculateArea()}`);
        console.log(`Perimeter: ${this.calculatePerimeter()}`);
    }
}

// const shape = new Shape("red"); // エラー: 抽象クラスはインスタンス化できない
```

### 2. 抽象クラスの実装

```typescript
class Circle extends Shape {
    private radius: number;
    
    constructor(color: string, radius: number) {
        super(color);
        this.radius = radius;
    }
    
    // 抽象メソッドの実装が必須
    calculateArea(): number {
        return Math.PI * this.radius * this.radius;
    }
    
    calculatePerimeter(): number {
        return 2 * Math.PI * this.radius;
    }
    
    // 子クラス独自のメソッド
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

circle.displayInfo(); // 基底クラスのメソッドを使用
rectangle.displayInfo();
```

### 3. 抽象プロパティ

```typescript
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
    readonly species = "Canis lupus"; // 抽象プロパティの実装
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
```

### 4. 複雑な抽象クラス設計

```typescript
abstract class DatabaseConnection {
    protected connectionString: string;
    protected isConnected: boolean = false;
    
    constructor(connectionString: string) {
        this.connectionString = connectionString;
    }
    
    // 抽象メソッド - データベースごとに異なる実装
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
    
    // 子クラスでオーバーライド可能
    protected getHealthCheckQuery(): string {
        return "SELECT 1";
    }
}

class PostgreSQLConnection extends DatabaseConnection {
    async connect(): Promise<boolean> {
        console.log(`Connecting to PostgreSQL: ${this.connectionString}`);
        // PostgreSQL固有の接続ロジック
        this.isConnected = true;
        return true;
    }
    
    async disconnect(): Promise<void> {
        console.log("Disconnecting from PostgreSQL");
        this.isConnected = false;
    }
    
    async executeQuery(query: string): Promise<any> {
        if (!this.isConnected) throw new Error("Not connected");
        console.log(`Executing PostgreSQL query: ${query}`);
        return {rows: [], metadata: {}};
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
        this.isConnected = true;
        return true;
    }
    
    async disconnect(): Promise<void> {
        console.log("Disconnecting from MongoDB");
        this.isConnected = false;
    }
    
    async executeQuery(query: string): Promise<any> {
        if (!this.isConnected) throw new Error("Not connected");
        console.log(`Executing MongoDB query: ${query}`);
        return {documents: [], statistics: {}};
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
```

### 5. 抽象クラス vs インターフェース

| 特徴 | 抽象クラス | インターフェース |
|------|------------|------------------|
| 実装 | 部分的な実装可能 | 実装なし（構造のみ） |
| 継承 | 単一継承のみ | 多重実装可能 |
| アクセス修飾子 | 使用可能 | public のみ |
| コンストラクタ | 定義可能 | 定義不可 |
| 用途 | 共通の実装 + 抽象化 | 契約の定義 |

```typescript
// 抽象クラスとインターフェースの組み合わせ
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
        return false;
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
```

### 6. 実践的なデザインパターン

#### Template Method パターン
```typescript
abstract class DataProcessor {
    // Template Method
    public async processData(data: any[]): Promise<any[]> {
        console.log("Starting data processing...");
        
        const validated = this.validateData(data);
        const processed = await this.transformData(validated);
        const result = this.formatOutput(processed);
        
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
        return data.map(user => ({
            id: user.id,
            name: user.name.toUpperCase(),
            email: user.email.toLowerCase(),
            lastLogin: new Date(user.lastLogin)
        }));
    }
    
    protected formatOutput(data: any[]): any[] {
        return data.map(user => ({
            ...user,
            displayName: `${user.name} (${user.email})`
        }));
    }
}

class ProductDataProcessor extends DataProcessor {
    protected async transformData(data: any[]): Promise<any[]> {
        return data.map(product => ({
            ...product,
            price: parseFloat(product.price),
            inStock: product.inventory > 0
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
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-25
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. 図形計算システム（Shape抽象クラス）
2. ファイル処理システム（FileProcessor抽象クラス）
3. ゲームキャラクターシステム（GameEntity抽象クラス）
4. 通知システム（NotificationSender抽象クラス）

## 注意点・ベストプラクティス

### よくある間違い

1. **抽象クラスのインスタンス化を試みる**
   ```typescript
   abstract class Base {}
   
   // const instance = new Base(); // エラー
   ```

2. **抽象メソッドの実装を忘れる**
   ```typescript
   abstract class Parent {
       abstract method(): void;
   }
   
   class Child extends Parent {
       // method()の実装を忘れるとエラー
   }
   ```

3. **抽象クラスとインターフェースの適切な使い分けができない**
   ```typescript
   // 共通の実装が必要な場合は抽象クラス
   abstract class BaseService {
       protected log(message: string) { /* 共通実装 */ }
       abstract process(): void;
   }
   
   // 契約のみを定義する場合はインターフェース
   interface Processable {
       process(): void;
   }
   ```

### 設計原則

1. **単一責任原則**: 抽象クラスは一つの責任を持つべき
2. **開放閉鎖原則**: 拡張に開放、修正に閉鎖
3. **リスコフの置換原則**: 子クラスは親クラスと置換可能であるべき
4. **依存関係逆転原則**: 抽象に依存し、具象に依存しない

### 適切な使用場面

**抽象クラスを使うべき場面:**
- 複数のクラス間で共通の実装を共有したい
- 部分的な実装と抽象化を組み合わせたい
- コンストラクタやプライベートメンバーが必要
- Template Methodパターンを実装したい

**インターフェースを使うべき場面:**
- 純粋な契約のみを定義したい
- 多重継承（実装）が必要
- 構造的型付けを活用したい
- APIの仕様を定義したい

## まとめ

抽象クラスは、継承階層において共通の実装と抽象化を提供する強力な機能です。適切に使用することで、コードの再利用性を高め、設計の一貫性を保つことができます。インターフェースとの使い分けを理解し、それぞれの特性を活かした設計を心がけましょう。次のレッスンではジェネリクスの基礎について学びます。