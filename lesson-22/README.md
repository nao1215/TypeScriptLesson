# Lesson 22: クラスの基礎 (Class Basics)

## 学習目標
このレッスンでは、TypeScriptにおけるクラスの基本的な使用方法を学びます。

- クラスの宣言とインスタンス化
- プロパティとメソッドの定義
- コンストラクタの使用方法
- インスタンスメンバーと静的メンバーの違い
- メソッドバインディングとthisコンテキスト
- プロパティの初期化とデフォルト値

## 内容

### 1. 基本的なクラスの宣言
```typescript
class Person {
    // プロパティの宣言
    name: string;
    age: number;
    
    // コンストラクタ
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
    
    // メソッド
    greet(): string {
        return `Hello, I'm ${this.name} and I'm ${this.age} years old.`;
    }
}

// インスタンス化
const person = new Person("Alice", 25);
console.log(person.greet());
```

### 2. プロパティの初期化方法
```typescript
class Student {
    // 直接初期化
    university: string = "Unknown";
    
    // 必須プロパティ
    name: string;
    
    // オプショナルプロパティ
    email?: string;
    
    // readonly プロパティ
    readonly id: number;
    
    constructor(name: string, id: number) {
        this.name = name;
        this.id = id;
    }
}
```

### 3. パラメータプロパティ
```typescript
class Employee {
    // コンストラクタパラメータでプロパティを自動定義
    constructor(
        public name: string,          // public プロパティ
        private salary: number,       // private プロパティ
        protected department: string, // protected プロパティ
        readonly id: number          // readonly プロパティ
    ) {
        // プロパティは自動的に作成・初期化される
    }
    
    getSalary(): number {
        return this.salary;
    }
    
    getDepartment(): string {
        return this.department;
    }
}

const employee = new Employee("Bob", 50000, "IT", 12345);
console.log(employee.name);        // public - アクセス可能
// console.log(employee.salary);   // private - コンパイルエラー
// console.log(employee.department); // protected - コンパイルエラー
console.log(employee.id);          // readonly - 読み取り可能
```

### 4. メソッドの種類
```typescript
class Calculator {
    private history: string[] = [];
    
    // インスタンスメソッド
    add(a: number, b: number): number {
        const result = a + b;
        this.history.push(`${a} + ${b} = ${result}`);
        return result;
    }
    
    // ゲッター
    get lastOperation(): string | undefined {
        return this.history[this.history.length - 1];
    }
    
    // セッター
    set clearHistory(clear: boolean) {
        if (clear) {
            this.history = [];
        }
    }
    
    // 静的メソッド
    static multiply(a: number, b: number): number {
        return a * b;
    }
    
    // 静的プロパティ
    static readonly version: string = "1.0.0";
}

const calc = new Calculator();
console.log(calc.add(5, 3));
console.log(calc.lastOperation);

// 静的メソッド・プロパティはクラス名で呼び出し
console.log(Calculator.multiply(4, 6));
console.log(Calculator.version);
```

### 5. thisコンテキストとバインディング
```typescript
class Counter {
    private count: number = 0;
    
    // 通常のメソッド
    increment(): void {
        this.count++;
        console.log(`Count: ${this.count}`);
    }
    
    // アロー関数でthisをバインド
    incrementArrow = (): void => {
        this.count++;
        console.log(`Count: ${this.count}`);
    }
    
    getCount(): number {
        return this.count;
    }
}

const counter = new Counter();

// 直接呼び出し
counter.increment(); // OK

// メソッドを変数に代入（thisコンテキストが失われる可能性）
const increment = counter.increment;
// increment(); // エラーの可能性

// アロー関数メソッドは常にthisがバインドされている
const incrementArrow = counter.incrementArrow;
incrementArrow(); // OK
```

### 6. オーバーロード
```typescript
class TextProcessor {
    // メソッドオーバーロード
    process(input: string): string;
    process(input: string[]): string[];
    process(input: string | string[]): string | string[] {
        if (Array.isArray(input)) {
            return input.map(str => str.toUpperCase());
        } else {
            return input.toUpperCase();
        }
    }
}

const processor = new TextProcessor();
console.log(processor.process("hello"));           // "HELLO"
console.log(processor.process(["hello", "world"])); // ["HELLO", "WORLD"]
```

### 7. 抽象的な概念の実装
```typescript
class BankAccount {
    private _balance: number = 0;
    
    constructor(private accountNumber: string, initialBalance: number = 0) {
        this._balance = initialBalance;
    }
    
    // getter/setterでカプセル化
    get balance(): number {
        return this._balance;
    }
    
    get accountInfo(): string {
        return `Account: ${this.accountNumber}, Balance: $${this._balance}`;
    }
    
    deposit(amount: number): boolean {
        if (amount > 0) {
            this._balance += amount;
            return true;
        }
        return false;
    }
    
    withdraw(amount: number): boolean {
        if (amount > 0 && amount <= this._balance) {
            this._balance -= amount;
            return true;
        }
        return false;
    }
    
    // 静的ユーティリティメソッド
    static validateAccountNumber(accountNumber: string): boolean {
        return /^\d{10}$/.test(accountNumber);
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
npm test -- lesson-22
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. 図書館の本管理システムのBookクラスを実装
2. ゲーム用のCharacterクラスを作成（レベルアップ機能付き）
3. ショッピングカートのItemクラスと管理システムを実装
4. 温度変換器のTemperatureConverterクラスを作成

## 注意点・ベストプラクティス

### よくある間違い

1. **thisコンテキストの誤解**
   ```typescript
   // 間違い：コールバックでthisが失われる
   setTimeout(myObject.method, 1000);
   
   // 正しい：アロー関数またはbindを使用
   setTimeout(() => myObject.method(), 1000);
   setTimeout(myObject.method.bind(myObject), 1000);
   ```

2. **プロパティの初期化忘れ**
   ```typescript
   // 間違い：初期化されていない
   class User {
       name: string; // undefined になる可能性
   }
   
   // 正しい：適切な初期化
   class User {
       name: string = "";
       // または
       constructor(name: string) {
           this.name = name;
       }
   }
   ```

3. **静的メンバーの誤用**
   ```typescript
   // 間違い：インスタンス固有のデータを静的に
   class Counter {
       static count = 0; // 全インスタンスで共有される
   }
   
   // 正しい：インスタンスごとのプロパティ
   class Counter {
       private count = 0; // インスタンス固有
   }
   ```

### 設計原則

1. **単一責任の原則**: クラスは1つの責任のみを持つ
2. **カプセル化**: 内部状態を適切に隠蔽する
3. **一貫したインターフェース**: メソッド名と動作を統一する
4. **適切な初期化**: すべてのプロパティを確実に初期化する

### パフォーマンス考慮事項

1. **メソッドバインディング**: アロー関数は毎回新しい関数を作成
2. **ゲッター/セッター**: 適度な使用に留める
3. **静的メソッド**: インスタンス作成が不要な処理に使用

## まとめ

クラスはオブジェクト指向プログラミングの基本概念です。適切なカプセル化とメソッド設計により、保守性の高いコードが書けるようになります。次のレッスンではクラスの継承について学びます。