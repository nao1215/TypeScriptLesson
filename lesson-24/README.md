# Lesson 24: アクセス修飾子 (Access Modifiers)

## 学習目標
このレッスンでは、TypeScriptにおけるアクセス修飾子について学びます。

- public, private, protected修飾子の理解と使い分け
- Parameter Properties（引数プロパティ）の短縮記法
- readonly修飾子による不変性の確保
- static修飾子によるクラスレベルのメンバー
- Private Fields (#構文)による真のプライベートフィールド

## 内容

### 1. 基本的なアクセス修飾子

#### public（デフォルト）
```typescript
class Person {
    public name: string; // public は省略可能
    age: number; // デフォルトでpublic
    
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
    
    public greet(): void { // public は省略可能
        console.log(`Hello, I'm ${this.name}`);
    }
}

const person = new Person("Alice", 25);
console.log(person.name); // アクセス可能
person.greet(); // メソッド呼び出し可能
```

#### private
```typescript
class BankAccount {
    private balance: number = 0;
    private accountNumber: string;
    
    constructor(accountNumber: string, initialBalance: number) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }
    
    private validateAmount(amount: number): boolean {
        return amount > 0 && amount <= this.balance;
    }
    
    public withdraw(amount: number): boolean {
        if (this.validateAmount(amount)) {
            this.balance -= amount;
            return true;
        }
        return false;
    }
    
    public getBalance(): number {
        return this.balance; // privateフィールドへの制御されたアクセス
    }
}

const account = new BankAccount("12345", 1000);
// console.log(account.balance); // エラー: private
console.log(account.getBalance()); // OK: public メソッド経由
```

#### protected
```typescript
class Animal {
    protected name: string;
    protected species: string;
    
    constructor(name: string, species: string) {
        this.name = name;
        this.species = species;
    }
    
    protected makeSound(): void {
        console.log("Some generic sound");
    }
    
    public introduce(): void {
        console.log(`I'm ${this.name}, a ${this.species}`);
    }
}

class Dog extends Animal {
    private breed: string;
    
    constructor(name: string, breed: string) {
        super(name, "Dog");
        this.breed = breed;
    }
    
    public bark(): void {
        // protected メンバーにアクセス可能
        console.log(`${this.name} barks loudly!`);
        this.makeSound(); // protected メソッド呼び出し可能
    }
}

const dog = new Dog("Rex", "German Shepherd");
dog.bark(); // OK
// dog.makeSound(); // エラー: protected
```

### 2. Parameter Properties（引数プロパティ）

通常の書き方と短縮記法の比較:

```typescript
// 通常の書き方
class Student {
    private name: string;
    private age: number;
    public grade: string;
    
    constructor(name: string, age: number, grade: string) {
        this.name = name;
        this.age = age;
        this.grade = grade;
    }
}

// Parameter Properties を使った短縮記法
class StudentShort {
    constructor(
        private name: string,
        private age: number,
        public grade: string,
        protected studentId: string
    ) {
        // 自動的にプロパティが作成され、値が代入される
    }
    
    public getStudentInfo(): string {
        return `${this.name} (${this.age}): Grade ${this.grade}`;
    }
}
```

### 3. readonly修飾子

```typescript
class Configuration {
    readonly apiUrl: string;
    readonly version: number;
    private readonly secretKey: string;
    
    constructor(apiUrl: string, version: number, secretKey: string) {
        this.apiUrl = apiUrl;
        this.version = version;
        this.secretKey = secretKey;
    }
    
    // readonly プロパティは初期化後は変更不可
    // updateApiUrl(newUrl: string): void {
    //     this.apiUrl = newUrl; // エラー: readonly
    // }
}

// Parameter Properties と readonly の組み合わせ
class ImmutablePoint {
    constructor(
        public readonly x: number,
        public readonly y: number
    ) {}
    
    public distance(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

const point = new ImmutablePoint(3, 4);
console.log(point.x); // 3
// point.x = 5; // エラー: readonly
```

### 4. static修飾子

```typescript
class MathUtils {
    public static readonly PI = 3.14159;
    private static instanceCount = 0;
    
    public static add(a: number, b: number): number {
        return a + b;
    }
    
    public static getInstanceCount(): number {
        return MathUtils.instanceCount;
    }
    
    constructor() {
        MathUtils.instanceCount++;
    }
    
    public static createInstance(): MathUtils {
        return new MathUtils();
    }
}

// staticメンバーはクラス名で直接アクセス
console.log(MathUtils.PI); // 3.14159
console.log(MathUtils.add(5, 3)); // 8
console.log(MathUtils.getInstanceCount()); // 0

const utils1 = new MathUtils();
const utils2 = MathUtils.createInstance();
console.log(MathUtils.getInstanceCount()); // 2
```

### 5. Private Fields (#構文)

ES2022の真のプライベートフィールド:

```typescript
class SecureData {
    #secretValue: string; // 真のプライベートフィールド
    #encryptionKey = "super-secret-key";
    
    constructor(secret: string) {
        this.#secretValue = this.#encrypt(secret);
    }
    
    #encrypt(data: string): string {
        // 簡単な暗号化例
        return data.split('').reverse().join('');
    }
    
    #decrypt(encryptedData: string): string {
        return encryptedData.split('').reverse().join('');
    }
    
    public getDecryptedValue(): string {
        return this.#decrypt(this.#secretValue);
    }
    
    public updateSecret(newSecret: string): void {
        this.#secretValue = this.#encrypt(newSecret);
    }
}

const secure = new SecureData("my-secret");
console.log(secure.getDecryptedValue()); // "my-secret"

// これらはすべてエラー - 真にプライベート
// console.log(secure.#secretValue);
// console.log(secure['#secretValue']);
// secure.#encrypt("test");
```

### 6. 実践的な例: ユーザー管理システム

```typescript
class User {
    private static nextId = 1;
    private static users: User[] = [];
    
    public readonly id: number;
    #passwordHash: string;
    
    constructor(
        public readonly username: string,
        private email: string,
        password: string,
        protected role: 'user' | 'admin' = 'user'
    ) {
        this.id = User.nextId++;
        this.#passwordHash = this.#hashPassword(password);
        User.users.push(this);
    }
    
    #hashPassword(password: string): string {
        // 実際のハッシュ化ロジックを想定
        return `hashed_${password}`;
    }
    
    public verifyPassword(password: string): boolean {
        return this.#passwordHash === this.#hashPassword(password);
    }
    
    protected updateEmail(newEmail: string): void {
        this.email = newEmail;
    }
    
    public getPublicInfo(): object {
        return {
            id: this.id,
            username: this.username,
            role: this.role
        };
    }
    
    public static findUserById(id: number): User | undefined {
        return User.users.find(user => user.id === id);
    }
    
    public static getUserCount(): number {
        return User.users.length;
    }
}

class AdminUser extends User {
    constructor(username: string, email: string, password: string) {
        super(username, email, password, 'admin');
    }
    
    public promoteUser(userId: number): boolean {
        const user = User.findUserById(userId);
        if (user && user.role === 'user') {
            // protected メンバーにアクセス可能
            (user as any).role = 'admin';
            return true;
        }
        return false;
    }
    
    public changeUserEmail(userId: number, newEmail: string): boolean {
        const user = User.findUserById(userId);
        if (user) {
            // protected メソッド呼び出し
            (user as any).updateEmail(newEmail);
            return true;
        }
        return false;
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
npm test -- lesson-24
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. ライブラリ管理システム（Book, Library クラス）
2. 銀行口座システム（Account, SavingsAccount クラス）
3. ゲームキャラクターシステム（Character, Player クラス）
4. データベース接続プールシステム

## 注意点・ベストプラクティス

### よくある間違い

1. **過度なprivate使用**
   ```typescript
   class OverPrivate {
       private value: number; // テスト時にアクセスできない
       
       // privateすぎるとテストやデバッグが困難
   }
   
   class BetterDesign {
       protected value: number; // テスト時にアクセス可能
   }
   ```

2. **static の誤用**
   ```typescript
   class BadExample {
       static currentUser: User; // グローバル状態の作成（避けるべき）
   }
   
   class GoodExample {
       static createUser(data: UserData): User { // ファクトリメソッドとして使用
           return new User(data);
       }
   }
   ```

3. **Parameter Properties の過用**
   ```typescript
   // 読みにくい例
   class Confusing {
       constructor(
           private readonly a: string,
           public b: number,
           protected c: boolean,
           private d: Date,
           public readonly e: string[]
       ) {}
   }
   ```

### 設計原則

1. **最小権限の原則**: 必要最小限のアクセス権限を付与
2. **カプセル化**: 内部実装の詳細を隠蔽し、公開インターフェースを最小化
3. **テスタビリティ**: テストしやすいように適切なアクセスレベルを設定
4. **将来の拡張性**: protected を適切に使用して継承を考慮

### TypeScript vs JavaScript

TypeScriptのprivate/protectedは **コンパイル時のみ** のチェックです：

```typescript
class Example {
    private secret = "hidden";
}

const ex = new Example();
// console.log(ex.secret); // TypeScriptエラー
console.log((ex as any).secret); // 実行時はアクセス可能

// 真のプライベートが必要な場合は # 構文を使用
class TrulyPrivate {
    #realSecret = "truly hidden";
}
```

## まとめ

アクセス修飾子は、適切なカプセル化を実現し、コードの保守性とセキュリティを向上させる重要な機能です。public、private、protectedの使い分けを理解し、readonly、static、Private Fieldsなどの高度な機能も活用して、堅牢なクラス設計を心がけましょう。次のレッスンでは抽象クラスについて学びます。